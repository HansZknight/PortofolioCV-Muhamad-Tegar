/*
===============================================
  PROFESSIONAL PORTFOLIO WEBSITE
  Portfolio Filter System
  Author: Hans
  Version: 1.0
===============================================
*/

'use strict';

// ========================================
// PORTFOLIO FILTER CONFIGURATION
// ========================================

const FILTER_CONFIG = {
  // Animation settings
  animation: {
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 50,
    scale: 0.8,
    opacity: 0
  },
  
  // Layout settings
  layout: {
    gap: 30,
    columns: 3,
    breakpoints: {
      1200: 3,
      768: 2,
      480: 1
    }
  },
  
  // Filter settings
  filter: {
    defaultCategory: 'all',
    activeClass: 'active',
    hiddenClass: 'hidden',
    animatingClass: 'animating'
  },
  
  // Lazy loading
  lazyLoad: {
    enabled: true,
    rootMargin: '50px',
    threshold: 0.1
  },
  
  // Search settings
  search: {
    enabled: true,
    minChars: 2,
    debounceTime: 300
  }
};

// ========================================
// PORTFOLIO FILTER CLASS
// ========================================

class PortfolioFilter {
  constructor(options = {}) {
    // Merge options with default config
    this.config = { ...FILTER_CONFIG, ...options };
    
    // DOM Elements
    this.container = document.querySelector('.portfolio-grid');
    this.items = document.querySelectorAll('.portfolio-item');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.searchInput = document.querySelector('.portfolio-search');
    this.loadMoreBtn = document.querySelector('.load-more-btn');
    this.categoryCount = document.querySelector('.category-count');
    
    // State
    this.currentFilter = this.config.filter.defaultCategory;
    this.isAnimating = false;
    this.itemsData = [];
    this.filteredItems = [];
    this.visibleItems = 6;
    this.itemsPerLoad = 3;
    
    // Isotope instance (if using Isotope)
    this.isotope = null;
    
    // Search debounce timer
    this.searchTimer = null;
    
    // Initialize if elements exist
    if (this.container && this.items.length > 0) {
      this.init();
    }
  }

  /**
   * Initialize portfolio filter
   */
  init() {
    console.log('Initializing Portfolio Filter...');
    
    // Setup initial data
    this.setupItemsData();
    
    // Initialize layout
    this.initializeLayout();
    
    // Bind events
    this.bindEvents();
    
    // Initialize search if enabled
    if (this.config.search.enabled && this.searchInput) {
      this.initializeSearch();
    }
    
    // Initialize lazy loading
    if (this.config.lazyLoad.enabled) {
      this.initializeLazyLoad();
    }
    
    // Setup initial filter
    this.filterItems(this.currentFilter);
    
    // Initialize lightbox
    this.initializeLightbox();
    
    // Update counter
    this.updateItemCounter();
  }

  /**
   * Setup items data
   */
  setupItemsData() {
    this.items.forEach((item, index) => {
      const data = {
        element: item,
        index: index,
        category: item.dataset.category || 'all',
        title: item.querySelector('.portfolio-title')?.textContent || '',
        description: item.querySelector('.portfolio-category')?.textContent || '',
        tags: item.dataset.tags ? item.dataset.tags.split(',') : [],
        image: item.querySelector('img'),
        visible: true
      };
      
      this.itemsData.push(data);
      
      // Add unique ID
      item.dataset.itemId = index;
    });
  }

  /**
   * Initialize layout
   */
  initializeLayout() {
    // Check if Isotope is available
    if (typeof Isotope !== 'undefined') {
      this.initIsotope();
    } else {
      this.initCustomLayout();
    }
  }

  /**
   * Initialize Isotope layout
   */
  initIsotope() {
    this.isotope = new Isotope(this.container, {
      itemSelector: '.portfolio-item',
      layoutMode: 'masonry',
      percentPosition: true,
      masonry: {
        columnWidth: '.portfolio-item',
        gutter: this.config.layout.gap
      },
      transitionDuration: `${this.config.animation.duration}ms`,
      hiddenStyle: {
        opacity: 0,
        transform: 'scale(0.8)'
      },
      visibleStyle: {
        opacity: 1,
        transform: 'scale(1)'
      }
    });
  }

  /**
   * Initialize custom layout
   */
  initCustomLayout() {
    // Add CSS Grid styles
    this.container.style.display = 'grid';
    this.container.style.gridTemplateColumns = `repeat(auto-fit, minmax(300px, 1fr))`;
    this.container.style.gap = `${this.config.layout.gap}px`;
    
    // Setup responsive columns
    this.updateLayoutColumns();
    window.addEventListener('resize', this.debounce(() => {
      this.updateLayoutColumns();
    }, 250));
  }

  /**
   * Update layout columns based on viewport
   */
  updateLayoutColumns() {
    const width = window.innerWidth;
    let columns = 1;
    
    for (const [breakpoint, cols] of Object.entries(this.config.layout.breakpoints)) {
      if (width >= parseInt(breakpoint)) {
        columns = cols;
      }
    }
    
    this.container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  }

  /**
   * Bind events
   */
  bindEvents() {
    // Filter button clicks
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = button.dataset.filter;
        this.filterItems(filter);
        this.setActiveButton(button);
      });
    });
    
    // Load more button
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => {
        this.loadMoreItems();
      });
    }
    
    // Portfolio item clicks for analytics
    this.items.forEach(item => {
      item.addEventListener('click', () => {
        this.trackItemClick(item);
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
  }

  /**
   * Filter items by category
   */
  filterItems(category) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentFilter = category;
    
    // Update filtered items array
    if (category === 'all') {
      this.filteredItems = [...this.itemsData];
    } else {
      this.filteredItems = this.itemsData.filter(item => {
        const categories = item.category.split(' ');
        return categories.includes(category);
      });
    }
    
    // Apply filter with animation
    if (this.isotope) {
      this.filterWithIsotope(category);
    } else {
      this.filterWithCustomAnimation(category);
    }
    
    // Update counter
    this.updateItemCounter();
    
    // Trigger custom event
    this.triggerFilterEvent(category);
  }

  /**
   * Filter with Isotope
   */
  filterWithIsotope(category) {
    const filterValue = category === 'all' ? '*' : `[data-category*="${category}"]`;
    
    this.isotope.arrange({
      filter: filterValue
    });
    
    this.isotope.on('arrangeComplete', () => {
      this.isAnimating = false;
    });
  }

  /**
   * Filter with custom animation
   */
  filterWithCustomAnimation(category) {
    const timeline = [];
    
    this.itemsData.forEach((item, index) => {
      const shouldShow = category === 'all' || item.category.includes(category);
      const element = item.element;
      
      if (shouldShow && !item.visible) {
        // Show item
        timeline.push(() => {
          element.style.display = 'block';
          setTimeout(() => {
            element.classList.remove('hidden');
            element.classList.add('visible');
          }, index * this.config.animation.stagger);
        });
        item.visible = true;
      } else if (!shouldShow && item.visible) {
        // Hide item
        timeline.push(() => {
          element.classList.add('hidden');
          element.classList.remove('visible');
          setTimeout(() => {
            element.style.display = 'none';
          }, this.config.animation.duration);
        });
        item.visible = false;
      }
    });
    
    // Execute timeline
    timeline.forEach(fn => fn());
    
    // Reset animating flag
    setTimeout(() => {
      this.isAnimating = false;
    }, this.config.animation.duration + (this.filteredItems.length * this.config.animation.stagger));
  }

  /**
   * Set active filter button
   */
  setActiveButton(activeButton) {
    this.filterButtons.forEach(button => {
      button.classList.remove(this.config.filter.activeClass);
    });
    activeButton.classList.add(this.config.filter.activeClass);
    
    // Animate active button
    this.animateActiveButton(activeButton);
  }

  /**
   * Animate active button
   */
  animateActiveButton(button) {
    // Scale animation
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 200);
    
    // Ripple effect
    this.createRipple(button, event);
  }

  /**
   * Create ripple effect
   */
  createRipple(button, event) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    
    if (event) {
      ripple.style.left = event.clientX - rect.left - size / 2 + 'px';
      ripple.style.top = event.clientY - rect.top - size / 2 + 'px';
    } else {
      ripple.style.left = '50%';
      ripple.style.top = '50%';
      ripple.style.transform = 'translate(-50%, -50%)';
    }
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * Initialize search functionality
   */
  initializeSearch() {
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(this.searchTimer);
      
      this.searchTimer = setTimeout(() => {
        this.searchItems(e.target.value);
      }, this.config.search.debounceTime);
    });
    
    // Clear search button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'search-clear';
    clearBtn.innerHTML = '<i class="fas fa-times"></i>';
    clearBtn.style.display = 'none';
    
    this.searchInput.parentElement.appendChild(clearBtn);
    
    clearBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchItems('');
      clearBtn.style.display = 'none';
    });
    
    this.searchInput.addEventListener('input', (e) => {
      clearBtn.style.display = e.target.value ? 'block' : 'none';
    });
  }

  /**
   * Search items
   */
  searchItems(query) {
    query = query.toLowerCase().trim();
    
    if (query.length < this.config.search.minChars && query.length > 0) {
      return;
    }
    
    if (!query) {
      // Reset to current filter
      this.filterItems(this.currentFilter);
      return;
    }
    
    // Filter items based on search query
    this.filteredItems = this.itemsData.filter(item => {
      const searchText = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
      return searchText.includes(query);
    });
    
    // Apply search filter
    this.applySearchFilter();
    
    // Update counter
    this.updateItemCounter();
  }

  /**
   * Apply search filter
   */
  applySearchFilter() {
    this.itemsData.forEach(item => {
      const isVisible = this.filteredItems.includes(item);
      const element = item.element;
      
      if (isVisible) {
        element.style.display = 'block';
        element.classList.remove('hidden');
        element.classList.add('visible');
      } else {
        element.classList.add('hidden');
        element.classList.remove('visible');
        setTimeout(() => {
          element.style.display = 'none';
        }, this.config.animation.duration);
      }
      
      item.visible = isVisible;
    });
  }

  /**
   * Initialize lazy loading
   */
  initializeLazyLoad() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: this.config.lazyLoad.rootMargin,
        threshold: this.config.lazyLoad.threshold
      });
      
      // Observe all portfolio images
      this.itemsData.forEach(item => {
        if (item.image && item.image.dataset.src) {
          imageObserver.observe(item.image);
        }
      });
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  /**
   * Load image
   */
  loadImage(img) {
    if (!img.dataset.src) return;
    
    const loader = new Image();
    loader.src = img.dataset.src;
    
    loader.onload = () => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
      
      // Fade in animation
      img.style.opacity = '0';
      img.offsetHeight; // Force reflow
      img.style.transition = 'opacity 0.5s';
      img.style.opacity = '1';
    };
    
    loader.onerror = () => {
      img.src = './assets/images/placeholder.jpg';
      img.classList.add('error');
    };
  }

  /**
   * Load all images (fallback)
   */
  loadAllImages() {
    this.itemsData.forEach(item => {
      if (item.image && item.image.dataset.src) {
        this.loadImage(item.image);
      }
    });
  }

  /**
   * Load more items
   */
  loadMoreItems() {
    const hiddenItems = this.filteredItems.filter(item => !item.visible);
    const itemsToShow = hiddenItems.slice(0, this.itemsPerLoad);
    
    itemsToShow.forEach((item, index) => {
      setTimeout(() => {
        item.element.style.display = 'block';
        item.element.classList.remove('hidden');
        item.element.classList.add('visible');
        item.visible = true;
      }, index * this.config.animation.stagger);
    });
    
    // Hide load more button if no more items
    if (hiddenItems.length <= this.itemsPerLoad && this.loadMoreBtn) {
      this.loadMoreBtn.style.display = 'none';
    }
    
    // Update counter
    this.updateItemCounter();
  }

  /**
   * Update item counter
   */
  updateItemCounter() {
    if (!this.categoryCount) return;
    
    const visibleCount = this.filteredItems.filter(item => item.visible).length;
    const totalCount = this.filteredItems.length;
    
    this.categoryCount.innerHTML = `
      Showing <span class="count-visible">${visibleCount}</span> 
      of <span class="count-total">${totalCount}</span> items
    `;
    
    // Animate numbers
    this.animateNumbers();
  }

  /**
   * Animate counter numbers
   */
  animateNumbers() {
    const numbers = this.categoryCount.querySelectorAll('span');
    
    numbers.forEach(number => {
      number.style.transform = 'scale(1.2)';
      number.style.color = 'var(--primary-color)';
      
      setTimeout(() => {
        number.style.transform = 'scale(1)';
        number.style.color = '';
      }, 300);
    });
  }

  /**
   * Initialize lightbox
   */
  initializeLightbox() {
    // Check if lightbox library is loaded
    if (typeof GLightbox !== 'undefined') {
      this.lightbox = GLightbox({
        selector: '.portfolio-link[data-lightbox]',
        touchNavigation: true,
        loop: true,
        closeOnOutsideClick: true,
        zoomable: true,
        draggable: true
      });
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboardNavigation(e) {
    // Filter navigation with number keys
    if (e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1;
      if (this.filterButtons[index]) {
        this.filterButtons[index].click();
      }
    }
    
    // Clear filter with ESC
    if (e.key === 'Escape') {
      this.filterItems('all');
      if (this.filterButtons[0]) {
        this.setActiveButton(this.filterButtons[0]);
      }
    }
    
    // Focus search with Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k' && this.searchInput) {
      e.preventDefault();
      this.searchInput.focus();
    }
  }

  /**
   * Track item click (for analytics)
   */
  trackItemClick(item) {
    const data = {
      category: item.dataset.category,
      title: item.querySelector('.portfolio-title')?.textContent,
      timestamp: new Date().toISOString()
    };
    
    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'portfolio_item_click', data);
    }
    
    // Custom event
    document.dispatchEvent(new CustomEvent('portfolioItemClick', { detail: data }));
  }

  /**
   * Trigger filter event
   */
  triggerFilterEvent(category) {
    document.dispatchEvent(new CustomEvent('portfolioFiltered', {
      detail: {
        category: category,
        count: this.filteredItems.length,
        items: this.filteredItems
      }
    }));
  }

  /**
   * Debounce helper
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Destroy portfolio filter
   */
  destroy() {
    // Remove event listeners
    this.filterButtons.forEach(button => {
      button.removeEventListener('click', this.handleFilterClick);
    });
    
    // Destroy Isotope instance
    if (this.isotope) {
      this.isotope.destroy();
    }
    
    // Clear search timer
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    // Reset styles
    this.container.style = '';
    this.items.forEach(item => {
      item.style = '';
      item.classList.remove('hidden', 'visible');
    });
  }
}

// ========================================
// PORTFOLIO SORT FUNCTIONALITY
// ========================================

class PortfolioSort {
  constructor(portfolioFilter) {
    this.portfolioFilter = portfolioFilter;
    this.sortSelect = document.querySelector('.portfolio-sort');
    this.currentSort = 'default';
    
    if (this.sortSelect) {
      this.init();
    }
  }

  /**
   * Initialize sort
   */
  init() {
    this.sortSelect.addEventListener('change', (e) => {
      this.sortItems(e.target.value);
    });
  }

  /**
   * Sort items
   */
  sortItems(sortType) {
    this.currentSort = sortType;
    
    const items = [...this.portfolioFilter.filteredItems];
    
    switch(sortType) {
      case 'name-asc':
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        items.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'date-asc':
        items.sort((a, b) => {
          const dateA = new Date(a.element.dataset.date || '1970-01-01');
          const dateB = new Date(b.element.dataset.date || '1970-01-01');
          return dateA - dateB;
        });
        break;
      case 'date-desc':
        items.sort((a, b) => {
          const dateA = new Date(a.element.dataset.date || '1970-01-01');
          const dateB = new Date(b.element.dataset.date || '1970-01-01');
          return dateB - dateA;
        });
        break;
      case 'random':
        items.sort(() => Math.random() - 0.5);
        break;
      default:
        // Original order
        items.sort((a, b) => a.index - b.index);
    }
    
    // Reorder DOM elements
    this.reorderElements(items);
  }

  /**
   * Reorder DOM elements
   */
  reorderElements(items) {
    items.forEach((item, index) => {
      setTimeout(() => {
        this.portfolioFilter.container.appendChild(item.element);
        
        // Animate reorder
        item.element.style.animation = 'fadeInUp 0.5s ease';
        setTimeout(() => {
          item.element.style.animation = '';
        }, 500);
      }, index * 50);
    });
  }
}

// ========================================
// PORTFOLIO VIEW MODES
// ========================================

class PortfolioViewMode {
  constructor(portfolioFilter) {
    this.portfolioFilter = portfolioFilter;
    this.viewButtons = document.querySelectorAll('.view-mode-btn');
    this.currentView = 'grid';
    
    if (this.viewButtons.length > 0) {
      this.init();
    }
  }

  /**
   * Initialize view modes
   */
  init() {
    this.viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        const mode = button.dataset.view;
        this.changeView(mode);
        this.setActiveViewButton(button);
      });
    });
  }

  /**
   * Change view mode
   */
  changeView(mode) {
    this.currentView = mode;
    const container = this.portfolioFilter.container;
    
    // Remove all view classes
    container.classList.remove('view-grid', 'view-list', 'view-masonry');
    
    // Add new view class
    container.classList.add(`view-${mode}`);
    
    // Apply specific styles
    switch(mode) {
      case 'grid':
        this.applyGridView();
        break;
      case 'list':
        this.applyListView();
        break;
      case 'masonry':
        this.applyMasonryView();
        break;
    }
    
    // Trigger layout update
    if (this.portfolioFilter.isotope) {
      this.portfolioFilter.isotope.layout();
    }
  }

  /**
   * Apply grid view
   */
  applyGridView() {
    const container = this.portfolioFilter.container;
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    container.style.gap = '30px';
  }

  /**
   * Apply list view
   */
  applyListView() {
    const container = this.portfolioFilter.container;
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '20px';
    
    // Modify items for list view
    this.portfolioFilter.items.forEach(item => {
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.maxWidth = '100%';
    });
  }

  /**
   * Apply masonry view
   */
  applyMasonryView() {
    if (this.portfolioFilter.isotope) {
      this.portfolioFilter.isotope.arrange({
        layoutMode: 'masonry'
      });
    } else {
      // Fallback masonry with CSS
      const container = this.portfolioFilter.container;
      container.style.columnCount = '3';
      container.style.columnGap = '30px';
      
      this.portfolioFilter.items.forEach(item => {
        item.style.breakInside = 'avoid';
        item.style.marginBottom = '30px';
      });
    }
  }

  /**
   * Set active view button
   */
  setActiveViewButton(activeButton) {
    this.viewButtons.forEach(button => {
      button.classList.remove('active');
    });
    activeButton.classList.add('active');
  }
}

// ========================================
// INITIALIZE PORTFOLIO SYSTEM
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize portfolio filter
  const portfolioFilter = new PortfolioFilter();
  
  // Initialize sort functionality
  const portfolioSort = new PortfolioSort(portfolioFilter);
  
  // Initialize view modes
  const portfolioViewMode = new PortfolioViewMode(portfolioFilter);
  
  // Make globally accessible
  window.portfolioFilter = portfolioFilter;
  window.portfolioSort = portfolioSort;
  window.portfolioViewMode = portfolioViewMode;
  
  console.log('%c✨ Portfolio Filter System Initialized! ✨', 
    'color: #6366f1; font-size: 14px; font-weight: bold;');
});

// ========================================
// EXPORT FOR MODULE USAGE
// ========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PortfolioFilter,
    PortfolioSort,
    PortfolioViewMode
  };
}