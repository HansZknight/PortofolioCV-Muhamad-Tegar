/*
===============================================
  PROFESSIONAL PORTFOLIO WEBSITE
  Animations Controller
  Author: Hans
  Version: 1.0
===============================================
*/

'use strict';

// ========================================
// ANIMATION CONFIGURATIONS
// ========================================

const ANIMATION_CONFIG = {
  // GSAP Animations
  gsap: {
    duration: 1,
    ease: "power3.out",
    stagger: 0.1,
    delay: 0.2
  },
  
  // Parallax Settings
  parallax: {
    speed: 0.5,
    offset: 100
  },
  
  // Text Animation
  text: {
    splitDelay: 0.05,
    fadeInDuration: 0.8,
    slideDistance: 50
  },
  
  // Magnetic Effect
  magnetic: {
    strength: 0.3,
    distance: 100
  },
  
  // Morph Shapes
  morph: {
    duration: 10,
    repeat: -1,
    yoyo: true
  }
};

// ========================================
// GSAP ANIMATIONS
// ========================================

class GSAPAnimations {
  constructor() {
    this.tl = null;
    this.scrollTriggers = [];
  }

  /**
   * Initialize GSAP
   */
  init() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
      console.warn('GSAP library not loaded. Loading from CDN...');
      this.loadGSAP();
      return;
    }

    // Register plugins
    this.registerPlugins();
    
    // Initialize animations
    this.initHeroAnimations();
    this.initScrollAnimations();
    this.initTextAnimations();
    this.initHoverAnimations();
    this.initPageTransitions();
  }

  /**
   * Load GSAP from CDN
   */
  loadGSAP() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      this.loadGSAPPlugins();
    };
    document.head.appendChild(script);
  }

  /**
   * Load GSAP Plugins
   */
  loadGSAPPlugins() {
    const plugins = [
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/TextPlugin.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/CSSRulePlugin.min.js'
    ];

    let loadedCount = 0;
    plugins.forEach(pluginSrc => {
      const script = document.createElement('script');
      script.src = pluginSrc;
      script.onload = () => {
        loadedCount++;
        if (loadedCount === plugins.length) {
          this.registerPlugins();
          this.initAnimations();
        }
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Register GSAP Plugins
   */
  registerPlugins() {
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }
    }
  }

  /**
   * Hero Animations
   */
  initHeroAnimations() {
    // Hero timeline
    this.tl = gsap.timeline({ defaults: { ease: ANIMATION_CONFIG.gsap.ease } });

    // Animate hero elements
    this.tl
      .from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1
      })
      .from('.hero-title', {
        y: 50,
        opacity: 0,
        duration: 1
      }, '-=0.5')
      .from('.hero-description', {
        y: 50,
        opacity: 0,
        duration: 1
      }, '-=0.5')
      .from('.hero-buttons', {
        y: 50,
        opacity: 0,
        duration: 1
      }, '-=0.5')
      .from('.hero-social a', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1
      }, '-=0.5')
      .from('.hero-image', {
        x: 100,
        opacity: 0,
        duration: 1.5
      }, '-=1.5')
      .from('.floating-card', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.2
      }, '-=0.5');

    // Floating animation for hero image
    gsap.to('.image-wrapper', {
      y: -20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });

    // Rotate animation for shapes
    gsap.to('.shape', {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: 'none',
      stagger: {
        each: 5
      }
    });
  }

  /**
   * Scroll Triggered Animations
   */
  initScrollAnimations() {
    // Section reveal animations
    gsap.utils.toArray('.section').forEach(section => {
      gsap.from(section, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Skills progress animation
    gsap.utils.toArray('.skill-progress').forEach(progress => {
      const value = progress.getAttribute('data-progress');
      
      gsap.to(progress, {
        width: `${value}%`,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: progress,
          start: 'top 90%',
          once: true
        }
      });
    });

    // Counter animation
    gsap.utils.toArray('.counter').forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      
      gsap.to(counter, {
        innerHTML: target,
        duration: 2,
        snap: { innerHTML: 1 },
        scrollTrigger: {
          trigger: counter,
          start: 'top 80%',
          once: true
        }
      });
    });

    // Service cards stagger animation
    gsap.from('.service-card', {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.services-grid',
        start: 'top 70%'
      }
    });

    // Timeline items animation
    gsap.utils.toArray('.timeline-item').forEach((item, index) => {
      gsap.from(item, {
        x: index % 2 === 0 ? -100 : 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: item,
          start: 'top 80%'
        }
      });
    });
  }

  /**
   * Text Split Animations
   */
  initTextAnimations() {
    const splitTexts = document.querySelectorAll('.split-text');
    
    splitTexts.forEach(text => {
      // Split text into spans
      const letters = text.textContent.split('');
      text.innerHTML = '';
      
      letters.forEach(letter => {
        const span = document.createElement('span');
        span.textContent = letter === ' ' ? '\u00A0' : letter;
        span.style.display = 'inline-block';
        text.appendChild(span);
      });
      
      // Animate letters
      gsap.from(text.children, {
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: ANIMATION_CONFIG.text.splitDelay,
        scrollTrigger: {
          trigger: text,
          start: 'top 80%'
        }
      });
    });
  }

  /**
   * Hover Animations
   */
  initHoverAnimations() {
    // Portfolio items hover
    document.querySelectorAll('.portfolio-item').forEach(item => {
      const overlay = item.querySelector('.portfolio-overlay');
      const image = item.querySelector('img');
      
      item.addEventListener('mouseenter', () => {
        gsap.to(image, { scale: 1.1, duration: 0.3 });
        gsap.to(overlay, { opacity: 1, duration: 0.3 });
      });
      
      item.addEventListener('mouseleave', () => {
        gsap.to(image, { scale: 1, duration: 0.3 });
        gsap.to(overlay, { opacity: 0, duration: 0.3 });
      });
    });

    // Button hover animations
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, { 
          scale: 1.05, 
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
          duration: 0.3 
        });
      });
      
      button.addEventListener('mouseleave', () => {
        gsap.to(button, { 
          scale: 1, 
          boxShadow: '0 5px 15px rgba(99, 102, 241, 0.2)',
          duration: 0.3 
        });
      });
    });
  }

  /**
   * Page Transitions
   */
  initPageTransitions() {
    // Add page transition overlay
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'page-transition-overlay';
    document.body.appendChild(transitionOverlay);

    // Animate on page leave
    document.querySelectorAll('a:not([href^="#"])').forEach(link => {
      link.addEventListener('click', (e) => {
        if (!link.target || link.target !== '_blank') {
          e.preventDefault();
          const href = link.href;
          
          gsap.to(transitionOverlay, {
            opacity: 1,
            duration: 0.5,
            onComplete: () => {
              window.location.href = href;
            }
          });
        }
      });
    });
  }
}

// ========================================
// PARALLAX EFFECTS
// ========================================

class ParallaxEffects {
  constructor() {
    this.elements = [];
    this.raf = null;
  }

  /**
   * Initialize parallax
   */
  init() {
    // Get all parallax elements
    this.elements = document.querySelectorAll('[data-parallax]');
    
    if (this.elements.length === 0) return;

    // Initialize parallax
    this.setupParallax();
    this.bindEvents();
  }

  /**
   * Setup parallax elements
   */
  setupParallax() {
    this.elements.forEach(element => {
      const speed = element.getAttribute('data-parallax') || 0.5;
      element.dataset.parallaxSpeed = speed;
      element.dataset.initialOffset = element.offsetTop;
    });
  }

  /**
   * Bind events
   */
  bindEvents() {
    // Update on scroll
    window.addEventListener('scroll', () => {
      if (!this.raf) {
        this.raf = requestAnimationFrame(() => {
          this.updateParallax();
          this.raf = null;
        });
      }
    });

    // Initial update
    this.updateParallax();
  }

  /**
   * Update parallax positions
   */
  updateParallax() {
    const scrollY = window.pageYOffset;
    
    this.elements.forEach(element => {
      const speed = parseFloat(element.dataset.parallaxSpeed);
      const initialOffset = parseFloat(element.dataset.initialOffset);
      const windowHeight = window.innerHeight;
      const elementTop = element.getBoundingClientRect().top + scrollY;
      
      // Check if element is in viewport
      if (elementTop < scrollY + windowHeight && elementTop + element.offsetHeight > scrollY) {
        const yPos = -(scrollY - elementTop) * speed;
        element.style.transform = `translateY(${yPos}px)`;
      }
    });
  }
}

// ========================================
// MAGNETIC CURSOR EFFECT
// ========================================

class MagneticCursor {
  constructor() {
    this.magneticElements = [];
    this.strength = ANIMATION_CONFIG.magnetic.strength;
    this.distance = ANIMATION_CONFIG.magnetic.distance;
  }

  /**
   * Initialize magnetic cursor
   */
  init() {
    // Get magnetic elements
    this.magneticElements = document.querySelectorAll('[data-magnetic]');
    
    if (this.magneticElements.length === 0) return;

    // Add magnetic effect
    this.magneticElements.forEach(element => {
      element.addEventListener('mousemove', (e) => this.magnetize(e, element));
      element.addEventListener('mouseleave', (e) => this.demagnetize(e, element));
    });
  }

  /**
   * Apply magnetic effect
   */
  magnetize(e, element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < this.distance) {
      const force = (this.distance - distance) / this.distance;
      const translateX = deltaX * force * this.strength;
      const translateY = deltaY * force * this.strength;
      
      gsap.to(element, {
        x: translateX,
        y: translateY,
        duration: 0.3
      });
    }
  }

  /**
   * Remove magnetic effect
   */
  demagnetize(e, element) {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.3
    });
  }
}

// ========================================
// SMOOTH SCROLL
// ========================================

class SmoothScroll {
  constructor() {
    this.current = 0;
    this.target = 0;
    this.ease = 0.1;
    this.rafId = null;
    this.container = document.querySelector('.smooth-scroll-container');
  }

  /**
   * Initialize smooth scroll
   */
  init() {
    if (!this.container) return;

    // Set body height
    this.setBodyHeight();

    // Bind events
    this.bindEvents();

    // Start animation
    this.animate();
  }

  /**
   * Set body height
   */
  setBodyHeight() {
    document.body.style.height = `${this.container.offsetHeight}px`;
  }

  /**
   * Bind events
   */
  bindEvents() {
    // Update on scroll
    window.addEventListener('scroll', () => {
      this.target = window.scrollY;
    });

    // Update on resize
    window.addEventListener('resize', () => {
      this.setBodyHeight();
    });
  }

  /**
   * Animate scroll
   */
  animate() {
    this.current += (this.target - this.current) * this.ease;
    this.container.style.transform = `translateY(-${this.current}px)`;
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Destroy smooth scroll
   */
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    document.body.style.height = '';
    this.container.style.transform = '';
  }
}

// ========================================
// MORPH SHAPES
// ========================================

class MorphShapes {
  constructor() {
    this.shapes = document.querySelectorAll('.morph-shape');
  }

  /**
   * Initialize morph animations
   */
  init() {
    if (this.shapes.length === 0) return;

    this.shapes.forEach(shape => {
      this.animateMorph(shape);
    });
  }

  /**
   * Animate morph
   */
  animateMorph(shape) {
    const paths = shape.querySelectorAll('path');
    
    if (paths.length < 2) return;

    gsap.to(paths[0], {
      morphSVG: paths[1],
      duration: ANIMATION_CONFIG.morph.duration,
      repeat: ANIMATION_CONFIG.morph.repeat,
      yoyo: ANIMATION_CONFIG.morph.yoyo,
      ease: 'power1.inOut'
    });
  }
}

// ========================================
// REVEAL ANIMATIONS
// ========================================

class RevealAnimations {
  constructor() {
    this.reveals = document.querySelectorAll('.reveal');
    this.observer = null;
  }

  /**
   * Initialize reveal animations
   */
  init() {
    if (this.reveals.length === 0) return;

    // Create intersection observer
    this.createObserver();

    // Observe elements
    this.reveals.forEach(reveal => {
      this.observer.observe(reveal);
    });
  }

  /**
   * Create intersection observer
   */
  createObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateReveal(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
  }

  /**
   * Animate reveal
   */
  animateReveal(element) {
    const type = element.dataset.reveal || 'fade';
    const delay = element.dataset.revealDelay || 0;
    const duration = element.dataset.revealDuration || 1;

    switch(type) {
      case 'fade':
        this.fadeReveal(element, delay, duration);
        break;
      case 'slide':
        this.slideReveal(element, delay, duration);
        break;
      case 'scale':
        this.scaleReveal(element, delay, duration);
        break;
      case 'rotate':
        this.rotateReveal(element, delay, duration);
        break;
      default:
        this.fadeReveal(element, delay, duration);
    }
  }

  /**
   * Fade reveal
   */
  fadeReveal(element, delay, duration) {
    gsap.from(element, {
      opacity: 0,
      duration: duration,
      delay: delay,
      ease: 'power2.out'
    });
  }

  /**
   * Slide reveal
   */
  slideReveal(element, delay, duration) {
    const direction = element.dataset.revealDirection || 'up';
    const distance = element.dataset.revealDistance || 50;
    
    let fromVars = { opacity: 0 };
    
    switch(direction) {
      case 'up':
        fromVars.y = distance;
        break;
      case 'down':
        fromVars.y = -distance;
        break;
      case 'left':
        fromVars.x = distance;
        break;
      case 'right':
        fromVars.x = -distance;
        break;
    }

    fromVars.duration = duration;
    fromVars.delay = delay;
    fromVars.ease = 'power2.out';
    
    gsap.from(element, fromVars);
  }

  /**
   * Scale reveal
   */
  scaleReveal(element, delay, duration) {
    gsap.from(element, {
      scale: 0,
      opacity: 0,
      duration: duration,
      delay: delay,
      ease: 'back.out(1.7)'
    });
  }

  /**
   * Rotate reveal
   */
  rotateReveal(element, delay, duration) {
    gsap.from(element, {
      rotation: 180,
      opacity: 0,
      duration: duration,
      delay: delay,
      ease: 'power2.out'
    });
  }
}

// ========================================
// TILT EFFECT
// ========================================

class TiltEffect {
  constructor() {
    this.tiltElements = document.querySelectorAll('[data-tilt]');
  }

  /**
   * Initialize tilt effect
   */
  init() {
    if (this.tiltElements.length === 0) return;

    this.tiltElements.forEach(element => {
      this.addTiltEffect(element);
    });
  }

  /**
   * Add tilt effect to element
   */
  addTiltEffect(element) {
    const maxTilt = element.dataset.tiltMax || 20;
    const perspective = element.dataset.tiltPerspective || 1000;
    const speed = element.dataset.tiltSpeed || 400;
    
    element.style.transformStyle = 'preserve-3d';
    element.style.transition = `transform ${speed}ms ease-out`;

    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const rotateX = (mouseY / (rect.height / 2)) * maxTilt;
      const rotateY = -(mouseX / (rect.width / 2)) * maxTilt;
      
      element.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
  }
}

// ========================================
// INITIALIZE ANIMATIONS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all animation modules
  const animations = {
    gsap: new GSAPAnimations(),
    parallax: new ParallaxEffects(),
    magnetic: new MagneticCursor(),
    smoothScroll: new SmoothScroll(),
    morph: new MorphShapes(),
    reveal: new RevealAnimations(),
    tilt: new TiltEffect()
  };

  // Initialize each module
  Object.values(animations).forEach(module => {
    try {
      module.init();
    } catch (error) {
      console.error('Error initializing animation module:', error);
    }
  });

  // Log success
  console.log('%c✨ Animations Initialized! ✨', 
    'color: #6366f1; font-size: 14px; font-weight: bold;');
});

// ========================================
// EXPORT FOR MODULE USAGE
// ========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GSAPAnimations,
    ParallaxEffects,
    MagneticCursor,
    SmoothScroll,
    MorphShapes,
    RevealAnimations,
    TiltEffect
  };
}