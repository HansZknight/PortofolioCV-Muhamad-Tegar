/*
===============================================
  PROFESSIONAL PORTFOLIO WEBSITE
  Main JavaScript File
  Author: Hans
  Version: 1.0
===============================================
*/

'use strict';

// ========================================
// GLOBAL VARIABLES & CONFIGURATIONS
// ========================================

const CONFIG = {
  animationDuration: 300,
  scrollOffset: 100,
  typedSpeed: 100,
  typedBackSpeed: 50,
  counterSpeed: 2000,
  particleCount: 80,
  swiperAutoplayDelay: 5000,
  debounceDelay: 150,
};

// DOM Elements Cache
const DOM = {
  // Preloader
  preloader: document.getElementById('preloader'),
  
  // Cursor
  cursorDot: document.getElementById('cursor-dot'),
  cursorOutline: document.getElementById('cursor-outline'),
  
  // Navigation
  navbar: document.getElementById('navbar'),
  navMenu: document.getElementById('nav-menu'),
  navLinks: document.querySelectorAll('.nav-link'),
  hamburger: document.getElementById('hamburger'),
  
  // Theme
  themeToggle: document.getElementById('theme-toggle'),
  
  // Scroll
  scrollProgress: document.getElementById('scroll-progress'),
  scrollTopBtn: document.getElementById('scroll-top'),
  
  // Sections
  sections: document.querySelectorAll('section[id]'),
  
  // Skills
  skillProgressBars: document.querySelectorAll('.skill-progress'),
  
  // Counter
  counters: document.querySelectorAll('.counter'),
  
  // Particles
  particlesContainer: document.getElementById('particles-js'),
  
  // Forms
  contactForm: document.getElementById('contact-form'),
  formStatus: document.getElementById('form-status'),
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Debounce function to limit function calls
 */
const debounce = (func, wait = CONFIG.debounceDelay) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for scroll events
 */
const throttle = (func, limit = 100) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Check if element is in viewport
 */
const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Get element offset top
 */
const getOffsetTop = (element) => {
  let offsetTop = 0;
  while (element) {
    offsetTop += element.offsetTop;
    element = element.offsetParent;
  }
  return offsetTop;
};

/**
 * Smooth scroll to element
 */
const smoothScrollTo = (target, offset = CONFIG.scrollOffset) => {
  const targetElement = typeof target === 'string' 
    ? document.querySelector(target) 
    : target;
  
  if (!targetElement) return;
  
  const targetPosition = getOffsetTop(targetElement) - offset;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
};

/**
 * Add class with animation
 */
const addClassWithDelay = (element, className, delay = 0) => {
  setTimeout(() => {
    element.classList.add(className);
  }, delay);
};

/**
 * Local Storage Helper
 */
const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return defaultValue;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  }
};

// ========================================
// PRELOADER
// ========================================

class Preloader {
  constructor() {
    this.preloader = DOM.preloader;
    this.minLoadTime = 1000; // Minimum loading time
    this.startTime = Date.now();
  }

  hide() {
    const elapsedTime = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.minLoadTime - elapsedTime);

    setTimeout(() => {
      if (this.preloader) {
        this.preloader.classList.add('hidden');
        
        // Remove from DOM after animation
        setTimeout(() => {
          this.preloader.style.display = 'none';
          document.body.classList.add('loaded');
        }, 500);
      }
    }, remainingTime);
  }

  init() {
    // Hide preloader when page is fully loaded
    if (document.readyState === 'complete') {
      this.hide();
    } else {
      window.addEventListener('load', () => this.hide());
    }
  }
}

// ========================================
// CUSTOM CURSOR - PERBAIKAN LENGKAP
// ========================================

class CustomCursor {
  constructor() {
    this.dot = DOM.cursorDot;
    this.outline = DOM.cursorOutline;
    this.cursorVisible = false;
    this.cursorEnlarged = false;
    
    // Posisi cursor
    this.endX = 0;
    this.endY = 0;
    this.curX = 0;
    this.curY = 0;
    
    // Kecepatan animasi (0.1 = smooth, 1 = instant)
    this.speed = 0.15;
    
    // Request animation frame ID
    this.rafId = null;
  }

  init() {
    // Check if touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      if (this.dot) this.dot.style.display = 'none';
      if (this.outline) this.outline.style.display = 'none';
      return;
    }

    if (!this.dot || !this.outline) return;

    // Setup cursor
    this.setupCursor();
    
    // Bind events
    this.bindEvents();
    
    // Start animation loop
    this.animateCursor();
  }

  setupCursor() {
    // Set initial styles
    this.dot.style.position = 'fixed';
    this.dot.style.pointerEvents = 'none';
    this.dot.style.zIndex = '10000';
    this.dot.style.transform = 'translate(-50%, -50%)';
    
    this.outline.style.position = 'fixed';
    this.outline.style.pointerEvents = 'none';
    this.outline.style.zIndex = '9999';
    this.outline.style.transform = 'translate(-50%, -50%)';
    this.outline.style.transition = 'width 0.3s ease, height 0.3s ease, background-color 0.3s ease';
  }

  bindEvents() {
    // Mouse move event
    document.addEventListener('mousemove', (e) => {
      this.cursorVisible = true;
      this.endX = e.clientX;
      this.endY = e.clientY;
      
      // Update dot position immediately
      if (this.dot) {
        this.dot.style.left = e.clientX + 'px';
        this.dot.style.top = e.clientY + 'px';
        this.dot.style.opacity = '1';
      }
    });

    // Mouse enter/leave viewport
    document.addEventListener('mouseenter', () => {
      this.cursorVisible = true;
      if (this.dot) this.dot.style.opacity = '1';
      if (this.outline) this.outline.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      this.cursorVisible = false;
      if (this.dot) this.dot.style.opacity = '0';
      if (this.outline) this.outline.style.opacity = '0';
    });

    // Mouse down/up effects
    document.addEventListener('mousedown', () => {
      this.onMouseDown();
    });

    document.addEventListener('mouseup', () => {
      this.onMouseUp();
    });

    // Hover effects on interactive elements
    this.addHoverEffects();
  }

  addHoverEffects() {
    // Selectors for interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, .btn, input, textarea, select, .clickable, .portfolio-item, .social-link, .nav-link, .filter-btn, [data-cursor="pointer"]'
    );

    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.cursorEnlarged = true;
        this.toggleCursorSize();
      });

      element.addEventListener('mouseleave', () => {
        this.cursorEnlarged = false;
        this.toggleCursorSize();
      });
    });

    // Special hover effects for specific elements
    const textElements = document.querySelectorAll('h1, h2, h3, p, span');
    textElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        if (this.dot) {
          this.dot.style.mixBlendMode = 'difference';
        }
      });

      element.addEventListener('mouseleave', () => {
        if (this.dot) {
          this.dot.style.mixBlendMode = 'normal';
        }
      });
    });
  }

  toggleCursorSize() {
    if (this.cursorEnlarged) {
      if (this.outline) {
        this.outline.style.width = '60px';
        this.outline.style.height = '60px';
        this.outline.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
      }
      if (this.dot) {
        this.dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
      }
    } else {
      if (this.outline) {
        this.outline.style.width = '40px';
        this.outline.style.height = '40px';
        this.outline.style.backgroundColor = 'transparent';
      }
      if (this.dot) {
        this.dot.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    }
  }

  onMouseDown() {
    if (this.outline) {
      this.outline.style.width = '30px';
      this.outline.style.height = '30px';
    }
    if (this.dot) {
      this.dot.style.transform = 'translate(-50%, -50%) scale(0.8)';
    }
  }

  onMouseUp() {
    this.toggleCursorSize();
  }

  animateCursor() {
    // Smooth following effect for outline
    if (this.outline && this.cursorVisible) {
      // Lerp (Linear Interpolation) for smooth movement
      this.curX += (this.endX - this.curX) * this.speed;
      this.curY += (this.endY - this.curY) * this.speed;
      
      this.outline.style.left = this.curX + 'px';
      this.outline.style.top = this.curY + 'px';
    }

    // Continue animation loop
    this.rafId = requestAnimationFrame(() => this.animateCursor());
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// ========================================
// SCROLL PROGRESS BAR
// ========================================

class ScrollProgress {
  constructor() {
    this.progressBar = DOM.scrollProgress;
  }

  update() {
    if (!this.progressBar) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;

    this.progressBar.style.width = `${scrollPercentage}%`;
  }

  init() {
    if (!this.progressBar) return;

    // Update on scroll
    window.addEventListener('scroll', throttle(() => this.update(), 10));
    
    // Initial update
    this.update();
  }
}

// ========================================
// NAVIGATION
// ========================================

class Navigation {
  constructor() {
    this.navbar = DOM.navbar;
    this.navMenu = DOM.navMenu;
    this.navLinks = DOM.navLinks;
    this.hamburger = DOM.hamburger;
    this.sections = DOM.sections;
    this.isMenuOpen = false;
    this.lastScrollTop = 0;
  }

  /**
   * Toggle mobile menu
   */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    
    this.hamburger?.classList.toggle('active');
    this.navMenu?.classList.toggle('active');
    document.body.classList.toggle('menu-open');

    // Create/remove overlay
    if (this.isMenuOpen) {
      this.createOverlay();
    } else {
      this.removeOverlay();
    }
  }

  /**
   * Close mobile menu
   */
  closeMenu() {
    if (!this.isMenuOpen) return;

    this.isMenuOpen = false;
    this.hamburger?.classList.remove('active');
    this.navMenu?.classList.remove('active');
    document.body.classList.remove('menu-open');
    this.removeOverlay();
  }

  /**
   * Create overlay for mobile menu
   */
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay active';
    overlay.addEventListener('click', () => this.closeMenu());
    // Prefer inserting the overlay as a sibling of the nav menu (same parent) so z-index comparisons are reliable
    if (this.navMenu && this.navMenu.parentNode) {
      this.navMenu.parentNode.insertBefore(overlay, this.navMenu);
    } else if (this.navbar && this.navbar.parentNode) {
      this.navbar.parentNode.insertBefore(overlay, this.navbar);
    } else {
      document.body.appendChild(overlay);
    }
  }

  /**
   * Remove overlay
   */
  removeOverlay() {
    const overlay = document.querySelector('.nav-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  }

  /**
   * Handle navbar on scroll
   */
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add scrolled class
    if (scrollTop > 50) {
      this.navbar?.classList.add('scrolled');
    } else {
      this.navbar?.classList.remove('scrolled');
    }

    // Hide/show navbar on scroll (optional)
    /*
    if (scrollTop > this.lastScrollTop && scrollTop > 200) {
      this.navbar?.classList.add('nav-hidden');
    } else {
      this.navbar?.classList.remove('nav-hidden');
    }
    */

    this.lastScrollTop = scrollTop;
  }

  /**
   * Update active nav link based on scroll position
   */
  updateActiveLink() {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    const navHeight = this.navbar?.offsetHeight || 0;

    this.sections.forEach(section => {
      const sectionTop = getOffsetTop(section) - navHeight - 100;
      const sectionBottom = sectionTop + section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        this.navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /**
   * Setup smooth scroll for nav links
   */
  setupSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          
          if (target) {
            smoothScrollTo(target);
            this.closeMenu();
            
            // Update URL without scrolling
            history.pushState(null, null, href);
          }
        }
      });
    });
  }

  /**
   * Initialize navigation
   */
  init() {
    // Hamburger menu toggle
    this.hamburger?.addEventListener('click', () => this.toggleMenu());

    // Close menu when clicking nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 991) {
          this.closeMenu();
        }
      });
    });

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Handle scroll
    window.addEventListener('scroll', throttle(() => {
      this.handleScroll();
      this.updateActiveLink();
    }, 100));

    // Setup smooth scroll
    this.setupSmoothScroll();

    // Initial update
    this.handleScroll();
    this.updateActiveLink();

    // Close menu on window resize
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 991 && this.isMenuOpen) {
        this.closeMenu();
      }
    }));
  }
}

// ========================================
// THEME TOGGLE (Dark/Light Mode)
// ========================================

class ThemeToggle {
  constructor() {
    this.toggleBtn = DOM.themeToggle;
    this.currentTheme = storage.get('theme', 'light');
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    storage.set('theme', theme);

    // Update icon
    if (this.toggleBtn) {
      const icon = this.toggleBtn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  /**
   * Toggle theme
   */
  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Initialize theme toggle
   */
  init() {
    // Set initial theme
    this.setTheme(this.currentTheme);

    // Toggle button click
    this.toggleBtn?.addEventListener('click', () => this.toggle());

    // Keyboard shortcut (Ctrl/Cmd + Shift + D)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });

    // Check system preference
    if (!storage.get('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!storage.get('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

// ========================================
// SCROLL TO TOP BUTTON
// ========================================

class ScrollToTop {
  constructor() {
    this.button = DOM.scrollTopBtn;
    this.showOffset = 300;
  }

  /**
   * Update button visibility
   */
  update() {
    if (!this.button) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.showOffset) {
      this.button.classList.add('show');
    } else {
      this.button.classList.remove('show');
    }
  }

  /**
   * Scroll to top
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Initialize scroll to top
   */
  init() {
    if (!this.button) return;

    // Click event
    this.button.addEventListener('click', () => this.scrollToTop());

    // Update on scroll
    window.addEventListener('scroll', throttle(() => this.update(), 100));

    // Initial update
    this.update();
  }
}

// Update bagian TypedText class
class TypedText {
  constructor() {
    this.element = document.querySelector('.typed-text');
    this.strings = [
      'Mahasiswa Akuntansi',
      'Calon Akuntan',
      'Analis Keuangan',
      'Tax Consultant',
      'Auditor Muda'
    ];
  }

  init() {
    if (!this.element || typeof Typed === 'undefined') return;

    new Typed('.typed-text', {
      strings: this.strings,
      typeSpeed: CONFIG.typedSpeed,
      backSpeed: CONFIG.typedBackSpeed,
      backDelay: 2000,
      loop: true,
      cursorChar: '|',
      smartBackspace: true,
    });
  }
}
// ========================================
// PARTICLES.JS INITIALIZATION
// ========================================

class ParticlesBackground {
  constructor() {
    this.container = DOM.particlesContainer;
  }

  init() {
    if (!this.container || typeof particlesJS === 'undefined') return;

    particlesJS('particles-js', {
      particles: {
        number: {
          value: CONFIG.particleCount,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#6366f1'
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          },
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false,
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#6366f1',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
          bounce: false,
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1
            }
          },
          push: {
            particles_nb: 4
          }
        }
      },
      retina_detect: true
    });
  }
}

// ========================================
// COUNTER ANIMATION
// ========================================

class CounterAnimation {
  constructor() {
    this.counters = DOM.counters;
    this.animated = new Set();
  }

  /**
   * Animate counter
   */
  animateCounter(counter) {
    if (this.animated.has(counter)) return;

    const target = parseInt(counter.getAttribute('data-target'));
    const duration = CONFIG.counterSpeed;
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
      current += increment;
      
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };

    updateCounter();
    this.animated.add(counter);
  }

  /**
   * Check if counters are in viewport
   */
  checkCounters() {
    this.counters.forEach(counter => {
      if (isInViewport(counter)) {
        this.animateCounter(counter);
      }
    });
  }

  /**
   * Initialize counter animation
   */
  init() {
    if (this.counters.length === 0) return;

    // Check on scroll
    window.addEventListener('scroll', throttle(() => this.checkCounters(), 100));

    // Initial check
    this.checkCounters();
  }
}

// ========================================
// SKILL PROGRESS BARS
// ========================================

class SkillProgress {
  constructor() {
    this.progressBars = DOM.skillProgressBars;
    this.animated = new Set();
  }

  /**
   * Animate progress bar
   */
  animateProgress(bar) {
    if (this.animated.has(bar)) return;

    const progress = bar.getAttribute('data-progress');
    
    setTimeout(() => {
      bar.style.width = `${progress}%`;
    }, 100);

    this.animated.add(bar);
  }

  /**
   * Check if progress bars are in viewport
   */
  checkProgress() {
    this.progressBars.forEach(bar => {
      if (isInViewport(bar)) {
        this.animateProgress(bar);
      }
    });
  }

  /**
   * Initialize skill progress
   */
  init() {
    if (this.progressBars.length === 0) return;

    // Check on scroll
    window.addEventListener('scroll', throttle(() => this.checkProgress(), 100));

    // Initial check
    this.checkProgress();
  }
}

// ========================================
// AOS (Animate On Scroll) INITIALIZATION
// ========================================

class AnimateOnScroll {
  init() {
    if (typeof AOS === 'undefined') return;

    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      offset: 100,
      delay: 0,
      anchorPlacement: 'top-bottom',
    });

    // Refresh on theme change
    document.addEventListener('themeChanged', () => {
      setTimeout(() => AOS.refresh(), 300);
    });
  }
}

// ========================================
// SWIPER SLIDER (Testimonials)
// ========================================

class TestimonialSlider {
  constructor() {
    this.container = document.querySelector('.testimonialSwiper');
  }

  init() {
    if (!this.container || typeof Swiper === 'undefined') return;

    new Swiper('.testimonialSwiper', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: CONFIG.swiperAutoplayDelay,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        640: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      },
      // Keyboard control
      keyboard: {
        enabled: true,
      },
      // Mousewheel
      mousewheel: {
        forceToAxis: true,
      },
      // Accessibility
      a11y: {
        enabled: true,
      },
    });
  }
}

// ========================================
// LIGHTBOX INITIALIZATION
// ========================================

class LightboxGallery {
  init() {
    if (typeof lightbox === 'undefined') return;

    lightbox.option({
      'resizeDuration': 200,
      'wrapAround': true,
      'albumLabel': 'Image %1 of %2',
      'fadeDuration': 300,
      'imageFadeDuration': 300,
    });
  }
}

// ========================================
// LAZY LOADING
// ========================================

class LazyLoad {
  constructor() {
    this.images = document.querySelectorAll('img[data-src]');
    this.observer = null;
  }

  /**
   * Load image
   */
  loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;

    img.src = src;
    img.removeAttribute('data-src');
    img.classList.add('loaded');
  }

  /**
   * Initialize lazy loading
   */
  init() {
    if (this.images.length === 0) return;

    // Check for IntersectionObserver support
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      });

      this.images.forEach(img => this.observer.observe(img));
    } else {
      // Fallback for older browsers
      this.images.forEach(img => this.loadImage(img));
    }
  }
}

// Cursor trail effect untuk efek yang lebih menarik
class CursorTrail {
  constructor() {
    this.trails = [];
    this.maxTrails = 20;
    this.mouse = { x: 0, y: 0 };
  }

  init() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.createTrail();
    });
  }

  createTrail() {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = this.mouse.x + 'px';
    trail.style.top = this.mouse.y + 'px';
    
    document.body.appendChild(trail);
    this.trails.push(trail);
    
    // Remove old trails
    if (this.trails.length > this.maxTrails) {
      const oldTrail = this.trails.shift();
      oldTrail.remove();
    }
    
    // Auto remove after animation
    setTimeout(() => {
      trail.remove();
      const index = this.trails.indexOf(trail);
      if (index > -1) {
        this.trails.splice(index, 1);
      }
    }, 1000);
  }
}

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

class Performance {
  /**
   * Prefetch links on hover
   */
  prefetchLinks() {
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !link.hasAttribute('data-prefetched')) {
          const linkTag = document.createElement('link');
          linkTag.rel = 'prefetch';
          linkTag.href = href;
          document.head.appendChild(linkTag);
          link.setAttribute('data-prefetched', 'true');
        }
      });
    });
  }

  /**
   * Optimize images
   */
  optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" if not present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  /**
   * Initialize performance optimizations
   */
  init() {
    // Prefetch links
    this.prefetchLinks();

    // Optimize images
    this.optimizeImages();

    // Remove unused CSS (optional)
    // This would require a more complex implementation
  }
}

// ========================================
// APP INITIALIZATION
// ========================================

class App {
  constructor() {
    this.modules = [];
  }

  /**
   * Register module
   */
  register(module) {
    this.modules.push(module);
  }

  /**
   * Initialize all modules
   */
  init() {
    // Initialize all modules
    this.modules.forEach(module => {
      try {
        module.init();
      } catch (error) {
        console.error(`Error initializing module:`, error);
      }
    });

    // Log success
    console.log('%c✨ Portfolio Website Initialized Successfully! ✨', 
      'color: #6366f1; font-size: 16px; font-weight: bold;');
  }
}

// ========================================
// INITIALIZE APPLICATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();

  // Register all modules
  app.register(new Preloader());
  app.register(new CustomCursor());
  app.register(new ScrollProgress());
  app.register(new Navigation());
  app.register(new ThemeToggle());
  app.register(new ScrollToTop());
  app.register(new TypedText());
  app.register(new ParticlesBackground());
  app.register(new CounterAnimation());
  app.register(new SkillProgress());
  app.register(new AnimateOnScroll());
  app.register(new TestimonialSlider());
  app.register(new LightboxGallery());
  app.register(new LazyLoad());
  app.register(new Performance());

  // Initialize app
  app.init();
});

// ========================================
// WINDOW LOAD EVENT
// ========================================

window.addEventListener('load', () => {
  // Remove any loading classes
  document.body.classList.add('page-loaded');
  
  // Refresh AOS
  if (typeof AOS !== 'undefined') {
    AOS.refresh();
  }
});

// ========================================
// PAGE VISIBILITY API
// ========================================

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden
    console.log('Page hidden');
  } else {
    // Page is visible
    console.log('Page visible');
  }
});

// ========================================
// SERVICE WORKER (PWA Support)
// ========================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment to enable service worker
    /*
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
    */
  });
}

// ========================================
// EXPORT FOR MODULE USAGE
// ========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Preloader,
    CustomCursor,
    ScrollProgress,
    Navigation,
    ThemeToggle,
    ScrollToTop,
    TypedText,
    ParticlesBackground,
    CounterAnimation,
    SkillProgress,
    AnimateOnScroll,
    TestimonialSlider,
    LightboxGallery,
    LazyLoad,
    Performance,
    App,
  };
}