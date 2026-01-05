/*
===============================================
  PROFESSIONAL PORTFOLIO WEBSITE
  Advanced Form Handler System
  Author: Hans
  Version: 1.0
===============================================
*/

'use strict';

// ========================================
// FORM HANDLER CONFIGURATION
// ========================================

const FORM_CONFIG = {
  // Form endpoints
  endpoints: {
    contact: '/api/contact',
    newsletter: '/api/newsletter',
    booking: '/api/booking',
    // Third-party services
    formspree: 'https://formspree.io/f/YOUR_FORM_ID',
    emailjs: {
      serviceId: 'YOUR_SERVICE_ID',
      templateId: 'YOUR_TEMPLATE_ID',
      userId: 'YOUR_USER_ID'
    },
    netlify: '/.netlify/functions/contact'
  },
  
  // Validation rules
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\d\s\-\+\(\)]+$/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    minLength: {
      name: 2,
      message: 10,
      subject: 3
    },
    maxLength: {
      name: 50,
      message: 1000,
      subject: 100
    }
  },
  
  // Messages
  messages: {
    success: 'Thank you! Your message has been sent successfully.',
    error: 'Oops! Something went wrong. Please try again.',
    validation: 'Please check your input and try again.',
    sending: 'Sending your message...',
    networkError: 'Network error. Please check your connection.',
    rateLimit: 'Too many requests. Please try again later.'
  },
  
  // Settings
  settings: {
    timeout: 10000,
    retryCount: 3,
    retryDelay: 1000,
    honeypot: true,
    recaptcha: false,
    autoSave: true,
    saveInterval: 5000,
    rateLimit: {
      attempts: 3,
      window: 60000 // 1 minute
    }
  },
  
  // Animation settings
  animation: {
    duration: 300,
    successDelay: 3000,
    errorDelay: 5000
  }
};

// ========================================
// FORM HANDLER CLASS
// ========================================

class FormHandler {
  constructor(formSelector, options = {}) {
    this.form = typeof formSelector === 'string' 
      ? document.querySelector(formSelector) 
      : formSelector;
    
    if (!this.form) {
      console.warn(`Form not found: ${formSelector}`);
      return;
    }
    
    // Merge configurations
    this.config = { ...FORM_CONFIG, ...options };
    
    // Form elements
    this.inputs = this.form.querySelectorAll('input, textarea, select');
    this.submitBtn = this.form.querySelector('[type="submit"]');
    this.statusElement = document.querySelector('.form-status');
    
    // State
    this.isSubmitting = false;
    this.formData = {};
    this.errors = {};
    this.attempts = [];
    this.autoSaveTimer = null;
    
    // Initialize
    this.init();
  }

  /**
   * Initialize form handler
   */
  init() {
    console.log('Initializing Form Handler...');
    
    // Setup form
    this.setupForm();
    
    // Bind events
    this.bindEvents();
    
    // Initialize features
    this.initializeHoneypot();
    this.initializeRecaptcha();
    this.initializeAutoSave();
    this.initializeProgressIndicator();
    
    // Load saved data
    this.loadSavedData();
    
    // Setup validation
    this.setupValidation();
  }

  /**
   * Setup form
   */
  setupForm() {
    // Add necessary attributes
    this.form.setAttribute('novalidate', 'true');
    
    // Add required classes
    this.form.classList.add('form-enhanced');
    
    // Setup CSRF token if needed
    this.setupCSRF();
  }

  /**
   * Bind events
   */
  bindEvents() {
    // Form submit
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Real-time validation
    this.inputs.forEach(input => {
      // On blur validation
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      // On input for real-time feedback
      input.addEventListener('input', () => {
        this.clearFieldError(input);
        this.updateProgressIndicator();
        
        // Trigger auto-save
        if (this.config.settings.autoSave) {
          this.triggerAutoSave();
        }
      });
      
      // Format phone number
      if (input.type === 'tel') {
        input.addEventListener('input', () => {
          this.formatPhoneNumber(input);
        });
      }
    });
    
    // Prevent double submission
    this.form.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.type !== 'textarea') {
        e.preventDefault();
        if (!this.isSubmitting) {
          this.handleSubmit();
        }
      }
    });
  }

  /**
   * Setup validation
   */
  setupValidation() {
    this.inputs.forEach(input => {
      // Add validation attributes
      if (input.required) {
        input.setAttribute('aria-required', 'true');
      }
      
      // Custom validation messages
      this.setCustomValidationMessage(input);
    });
  }

  /**
   * Set custom validation message
   */
  setCustomValidationMessage(input) {
    const customMessages = {
      email: 'Please enter a valid email address',
      tel: 'Please enter a valid phone number',
      url: 'Please enter a valid URL',
      required: 'This field is required',
      minlength: `Minimum ${input.minLength} characters required`,
      maxlength: `Maximum ${input.maxLength} characters allowed`
    };
    
    input.addEventListener('invalid', (e) => {
      e.preventDefault();
      const message = customMessages[input.type] || customMessages.required;
      this.showFieldError(input, message);
    });
  }

  /**
   * Handle form submission
   */
  async handleSubmit() {
    if (this.isSubmitting) return;
    
    // Check rate limiting
    if (!this.checkRateLimit()) {
      this.showMessage('error', this.config.messages.rateLimit);
      return;
    }
    
    // Validate form
    if (!this.validateForm()) {
      this.showMessage('error', this.config.messages.validation);
      this.focusFirstError();
      return;
    }
    
    // Check honeypot
    if (this.config.settings.honeypot && !this.checkHoneypot()) {
      console.warn('Honeypot triggered - possible spam');
      this.showMessage('success', this.config.messages.success);
      return;
    }
    
    // Set submitting state
    this.setSubmitting(true);
    
    // Collect form data
    this.collectFormData();
    
    // Show loading state
    this.showMessage('loading', this.config.messages.sending);
    
    try {
      // Submit form
      const response = await this.submitForm();
      
      if (response.ok) {
        this.handleSuccess(response);
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setSubmitting(false);
    }
  }

  /**
   * Validate form
   */
  validateForm() {
    let isValid = true;
    this.errors = {};
    
    this.inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  /**
   * Validate field
   */
  validateField(field) {
    const name = field.name;
    const value = field.value.trim();
    const type = field.type;
    let isValid = true;
    
    // Clear previous error
    this.clearFieldError(field);
    
    // Required validation
    if (field.required && !value) {
      this.showFieldError(field, 'This field is required');
      this.errors[name] = 'Required field';
      return false;
    }
    
    // Skip validation if field is empty and not required
    if (!value && !field.required) {
      return true;
    }
    
    // Type-specific validation
    switch(type) {
      case 'email':
        if (!this.config.validation.email.test(value)) {
          this.showFieldError(field, 'Please enter a valid email address');
          this.errors[name] = 'Invalid email';
          isValid = false;
        }
        break;
        
      case 'tel':
        if (!this.config.validation.phone.test(value)) {
          this.showFieldError(field, 'Please enter a valid phone number');
          this.errors[name] = 'Invalid phone';
          isValid = false;
        }
        break;
        
      case 'url':
        if (!this.config.validation.url.test(value)) {
          this.showFieldError(field, 'Please enter a valid URL');
          this.errors[name] = 'Invalid URL';
          isValid = false;
        }
        break;
    }
    
    // Length validation
    const minLength = field.minLength || this.config.validation.minLength[name];
    const maxLength = field.maxLength || this.config.validation.maxLength[name];
    
    if (minLength && value.length < minLength) {
      this.showFieldError(field, `Minimum ${minLength} characters required`);
      this.errors[name] = 'Too short';
      isValid = false;
    }
    
    if (maxLength && value.length > maxLength) {
      this.showFieldError(field, `Maximum ${maxLength} characters allowed`);
      this.errors[name] = 'Too long';
      isValid = false;
    }
    
    // Custom validation
    if (field.dataset.validate) {
      isValid = this.customValidation(field);
    }
    
    // Mark as valid
    if (isValid) {
      this.markFieldValid(field);
    }
    
    return isValid;
  }

  /**
   * Custom validation
   */
  customValidation(field) {
    const validationType = field.dataset.validate;
    const value = field.value.trim();
    
    switch(validationType) {
      case 'alphanumeric':
        return /^[a-zA-Z0-9]+$/.test(value);
        
      case 'letters':
        return /^[a-zA-Z\s]+$/.test(value);
        
      case 'numbers':
        return /^\d+$/.test(value);
        
      case 'date':
        return !isNaN(Date.parse(value));
        
      default:
        return true;
    }
  }

  /**
   * Show field error
   */
  showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Add error class
    formGroup.classList.add('has-error');
    field.classList.add('is-invalid');
    
    // Create/update error message
    let errorElement = formGroup.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'field-error';
      formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Animate error
    this.animateError(errorElement);
    
    // Set ARIA attributes
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorElement.id || 'error-' + field.name);
  }

  /**
   * Clear field error
   */
  clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Remove error classes
    formGroup.classList.remove('has-error');
    field.classList.remove('is-invalid');
    
    // Hide error message
    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
    
    // Update ARIA
    field.setAttribute('aria-invalid', 'false');
  }

  /**
   * Mark field as valid
   */
  markFieldValid(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('has-success');
    field.classList.add('is-valid');
    
    // Add checkmark icon
    let successIcon = formGroup.querySelector('.success-icon');
    if (!successIcon) {
      successIcon = document.createElement('span');
      successIcon.className = 'success-icon';
      successIcon.innerHTML = '<i class="fas fa-check"></i>';
      formGroup.appendChild(successIcon);
    }
    
    // Animate success
    this.animateSuccess(successIcon);
  }

  /**
   * Animate error
   */
  animateError(element) {
    element.style.animation = 'shake 0.5s';
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }

  /**
   * Animate success
   */
  animateSuccess(element) {
    element.style.animation = 'fadeInScale 0.3s';
    setTimeout(() => {
      element.style.animation = '';
    }, 300);
  }

  /**
   * Focus first error field
   */
  focusFirstError() {
    const firstError = this.form.querySelector('.is-invalid');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Collect form data
   */
  collectFormData() {
    this.formData = new FormData(this.form);
    
    // Add additional data
    this.formData.append('timestamp', new Date().toISOString());
    this.formData.append('page', window.location.href);
    this.formData.append('userAgent', navigator.userAgent);
    
    // Add UTM parameters if present
    const urlParams = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(param => {
      if (urlParams.has(param)) {
        this.formData.append(param, urlParams.get(param));
      }
    });
    
    return this.formData;
  }

  /**
   * Submit form
   */
  async submitForm() {
    const endpoint = this.form.action || this.config.endpoints.contact;
    const method = this.form.method || 'POST';
    
    // Try multiple submission methods
    try {
      // Method 1: Direct API submission
      if (endpoint.startsWith('http')) {
        return await this.submitToAPI(endpoint, method);
      }
      
      // Method 2: EmailJS
      if (this.config.endpoints.emailjs.serviceId) {
        return await this.submitToEmailJS();
      }
      
      // Method 3: Netlify Forms
      if (this.form.hasAttribute('netlify')) {
        return await this.submitToNetlify();
      }
      
      // Method 4: Formspree
      if (this.config.endpoints.formspree) {
        return await this.submitToFormspree();
      }
      
      // Fallback: Local storage
      return await this.submitToLocalStorage();
      
    } catch (error) {
      // Retry logic
      if (this.attempts.length < this.config.settings.retryCount) {
        this.attempts.push(Date.now());
        await this.delay(this.config.settings.retryDelay);
        return await this.submitForm();
      }
      
      throw error;
    }
  }

  /**
   * Submit to API
   */
  async submitToAPI(endpoint, method) {
    const response = await fetch(endpoint, {
      method: method,
      body: this.formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      signal: AbortSignal.timeout(this.config.settings.timeout)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { ok: true, data };
  }

  /**
   * Submit to EmailJS
   */
  async submitToEmailJS() {
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS library not loaded');
    }
    
    const templateParams = {};
    this.formData.forEach((value, key) => {
      templateParams[key] = value;
    });
    
    const response = await emailjs.send(
      this.config.endpoints.emailjs.serviceId,
      this.config.endpoints.emailjs.templateId,
      templateParams,
      this.config.endpoints.emailjs.userId
    );
    
    return { ok: response.status === 200, data: response };
  }

  /**
   * Submit to Netlify
   */
  async submitToNetlify() {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(this.formData).toString()
    });
    
    return { ok: response.ok, data: await response.text() };
  }

  /**
   * Submit to Formspree
   */
  async submitToFormspree() {
    const response = await fetch(this.config.endpoints.formspree, {
      method: 'POST',
      body: this.formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return { ok: response.ok, data: await response.json() };
  }

  /**
   * Submit to Local Storage (Fallback)
   */
  async submitToLocalStorage() {
    const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
    const submission = {
      id: Date.now(),
      data: Object.fromEntries(this.formData),
      timestamp: new Date().toISOString()
    };
    
    submissions.push(submission);
    localStorage.setItem('form_submissions', JSON.stringify(submissions));
    
    // Simulate async operation
    await this.delay(500);
    
    return { ok: true, data: submission };
  }

  /**
   * Handle success
   */
  handleSuccess(response) {
    // Show success message
    this.showMessage('success', this.config.messages.success);
    
    // Reset form
    this.form.reset();
    this.clearAllValidation();
    
    // Clear saved data
    this.clearSavedData();
    
    // Track success
    this.trackSubmission('success', response.data);
    
    // Trigger success event
    this.form.dispatchEvent(new CustomEvent('formSubmitSuccess', {
      detail: response.data
    }));
    
    // Redirect if specified
    if (this.form.dataset.redirect) {
      setTimeout(() => {
        window.location.href = this.form.dataset.redirect;
      }, this.config.animation.successDelay);
    }
    
    // Show thank you modal
    if (this.form.dataset.modal) {
      this.showThankYouModal();
    }
  }

  /**
   * Handle error
   */
  handleError(error) {
    console.error('Form submission error:', error);
    
    // Show error message
    const message = error.message || this.config.messages.error;
    this.showMessage('error', message);
    
    // Track error
    this.trackSubmission('error', error);
    
    // Trigger error event
    this.form.dispatchEvent(new CustomEvent('formSubmitError', {
      detail: error
    }));
  }

  /**
   * Show message
   */
  showMessage(type, message) {
    if (!this.statusElement) {
      this.createStatusElement();
    }
    
    // Clear previous classes
    this.statusElement.className = 'form-status';
    
    // Add type class
    this.statusElement.classList.add(type);
    
    // Set message
    this.statusElement.innerHTML = this.getMessageHTML(type, message);
    
    // Show status
    this.statusElement.style.display = 'block';
    this.statusElement.style.animation = 'fadeInUp 0.5s';
    
    // Auto-hide for success/error
    if (type === 'success' || type === 'error') {
      const delay = type === 'success' 
        ? this.config.animation.successDelay 
        : this.config.animation.errorDelay;
      
      setTimeout(() => {
        this.hideMessage();
      }, delay);
    }
  }

  /**
   * Get message HTML
   */
  getMessageHTML(type, message) {
    const icons = {
      success: '<i class="fas fa-check-circle"></i>',
      error: '<i class="fas fa-exclamation-circle"></i>',
      loading: '<i class="fas fa-spinner fa-spin"></i>',
      warning: '<i class="fas fa-exclamation-triangle"></i>'
    };
    
    return `
      <div class="status-icon">${icons[type] || ''}</div>
      <div class="status-message">${message}</div>
    `;
  }

  /**
   * Hide message
   */
  hideMessage() {
    if (this.statusElement) {
      this.statusElement.style.animation = 'fadeOutDown 0.5s';
      setTimeout(() => {
        this.statusElement.style.display = 'none';
      }, 500);
    }
  }

  /**
   * Create status element
   */
  createStatusElement() {
    this.statusElement = document.createElement('div');
    this.statusElement.className = 'form-status';
    this.form.appendChild(this.statusElement);
  }

  /**
   * Set submitting state
   */
  setSubmitting(isSubmitting) {
    this.isSubmitting = isSubmitting;
    
    if (this.submitBtn) {
      this.submitBtn.disabled = isSubmitting;
      
      if (isSubmitting) {
        this.submitBtn.classList.add('loading');
        this.submitBtn.innerHTML = `
          <i class="fas fa-spinner fa-spin"></i>
          <span>Sending...</span>
        `;
      } else {
        this.submitBtn.classList.remove('loading');
        this.submitBtn.innerHTML = this.submitBtn.dataset.originalText || 'Send Message';
      }
    }
    
    // Disable/enable inputs
    this.inputs.forEach(input => {
      input.disabled = isSubmitting;
    });
  }

  /**
   * Clear all validation
   */
  clearAllValidation() {
    this.inputs.forEach(input => {
      this.clearFieldError(input);
      const formGroup = input.closest('.form-group');
      if (formGroup) {
        formGroup.classList.remove('has-success', 'has-error');
      }
      input.classList.remove('is-valid', 'is-invalid');
    });
    
    // Remove success icons
    this.form.querySelectorAll('.success-icon').forEach(icon => {
      icon.remove();
    });
  }

  /**
   * Initialize honeypot
   */
  initializeHoneypot() {
    if (!this.config.settings.honeypot) return;
    
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.style.position = 'absolute';
    honeypot.style.left = '-9999px';
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    honeypot.setAttribute('aria-hidden', 'true');
    
    this.form.appendChild(honeypot);
    this.honeypotField = honeypot;
  }

  /**
   * Check honeypot
   */
  checkHoneypot() {
    if (!this.honeypotField) return true;
    return this.honeypotField.value === '';
  }

  /**
   * Initialize reCAPTCHA
   */
  initializeRecaptcha() {
    if (!this.config.settings.recaptcha) return;
    
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    // Add reCAPTCHA div
    const recaptchaDiv = document.createElement('div');
    recaptchaDiv.className = 'g-recaptcha';
    recaptchaDiv.setAttribute('data-sitekey', 'YOUR_RECAPTCHA_SITE_KEY');
    
    this.submitBtn.parentNode.insertBefore(recaptchaDiv, this.submitBtn);
  }

  /**
   * Initialize auto-save
   */
  initializeAutoSave() {
    if (!this.config.settings.autoSave) return;
    
    // Save form data periodically
    this.autoSaveTimer = setInterval(() => {
      this.saveFormData();
    }, this.config.settings.saveInterval);
  }

  /**
   * Trigger auto-save
   */
  triggerAutoSave() {
    clearTimeout(this.autoSaveDebounce);
    this.autoSaveDebounce = setTimeout(() => {
      this.saveFormData();
    }, 1000);
  }

  /**
   * Save form data
   */
  saveFormData() {
    const data = {};
    this.inputs.forEach(input => {
      if (input.type !== 'submit' && input.type !== 'button') {
        data[input.name] = input.value;
      }
    });
    
    localStorage.setItem(`form_data_${this.form.id}`, JSON.stringify(data));
    
    // Show save indicator
    this.showSaveIndicator();
  }

  /**
   * Load saved data
   */
  loadSavedData() {
    const savedData = localStorage.getItem(`form_data_${this.form.id}`);
    if (!savedData) return;
    
    try {
      const data = JSON.parse(savedData);
      
      // Ask user if they want to restore
      if (Object.keys(data).length > 0) {
        this.showRestorePrompt(data);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }

  /**
   * Show restore prompt
   */
  showRestorePrompt(data) {
    const prompt = document.createElement('div');
    prompt.className = 'restore-prompt';
    prompt.innerHTML = `
      <p>You have unsaved form data. Would you like to restore it?</p>
      <button class="btn-restore">Restore</button>
      <button class="btn-discard">Discard</button>
    `;
    
    this.form.insertBefore(prompt, this.form.firstChild);
    
    // Handle restore
    prompt.querySelector('.btn-restore').addEventListener('click', () => {
      this.restoreFormData(data);
      prompt.remove();
    });
    
    // Handle discard
    prompt.querySelector('.btn-discard').addEventListener('click', () => {
      this.clearSavedData();
      prompt.remove();
    });
  }

  /**
   * Restore form data
   */
  restoreFormData(data) {
    Object.keys(data).forEach(key => {
      const input = this.form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = data[key];
        // Trigger input event for validation
        input.dispatchEvent(new Event('input'));
      }
    });
    
    this.showMessage('success', 'Form data restored successfully');
  }

  /**
   * Clear saved data
   */
  clearSavedData() {
    localStorage.removeItem(`form_data_${this.form.id}`);
  }

  /**
   * Show save indicator
   */
  showSaveIndicator() {
    let indicator = this.form.querySelector('.save-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'save-indicator';
      indicator.innerHTML = '<i class="fas fa-check"></i> Saved';
      this.form.appendChild(indicator);
    }
    
    indicator.style.display = 'block';
    indicator.style.animation = 'fadeInOut 2s';
    
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 2000);
  }

  /**
   * Initialize progress indicator
   */
  initializeProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.className = 'form-progress';
    progressBar.innerHTML = '<div class="progress-bar"></div>';
    
    this.form.insertBefore(progressBar, this.form.firstChild);
    this.progressBar = progressBar.querySelector('.progress-bar');
    
    // Update on start
    this.updateProgressIndicator();
  }

  /**
   * Update progress indicator
   */
  updateProgressIndicator() {
    const totalFields = this.inputs.length;
    let completedFields = 0;
    
    this.inputs.forEach(input => {
      if (input.value && this.validateField(input)) {
        completedFields++;
      }
    });
    
    const progress = (completedFields / totalFields) * 100;
    this.progressBar.style.width = `${progress}%`;
    
    // Change color based on progress
    if (progress === 100) {
      this.progressBar.style.backgroundColor = '#10b981';
    } else if (progress >= 50) {
      this.progressBar.style.backgroundColor = '#3b82f6';
    } else {
      this.progressBar.style.backgroundColor = '#6b7280';
    }
  }

  /**
   * Format phone number
   */
  formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 3) {
      input.value = value;
    } else if (value.length <= 6) {
      input.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else {
      input.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }
  }

  /**
   * Setup CSRF token
   */
  setupCSRF() {
    const token = document.querySelector('meta[name="csrf-token"]');
    if (token) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = '_token';
      input.value = token.content;
      this.form.appendChild(input);
    }
  }

  /**
   * Check rate limiting
   */
  checkRateLimit() {
    const now = Date.now();
    const windowStart = now - this.config.settings.rateLimit.window;
    
    // Clean old attempts
    this.attempts = this.attempts.filter(time => time > windowStart);
    
    // Check if within limit
    if (this.attempts.length >= this.config.settings.rateLimit.attempts) {
      return false;
    }
    
    return true;
  }

  /**
   * Track submission
   */
  trackSubmission(status, data) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submission', {
        event_category: 'Contact',
        event_label: status,
        value: status === 'success' ? 1 : 0
      });
    }
    
    // Custom tracking
    console.log('Form submission:', { status, data });
  }

  /**
   * Show thank you modal
   */
  showThankYouModal() {
    const modal = document.createElement('div');
    modal.className = 'thank-you-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Thank You!</h2>
        <p>Your message has been sent successfully.</p>
        <p>We'll get back to you as soon as possible.</p>
        <button class="modal-close">Close</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
      modal.classList.add('show');
    }, 100);
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }, 5000);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Destroy form handler
   */
  destroy() {
    // Clear timers
    clearInterval(this.autoSaveTimer);
    clearTimeout(this.autoSaveDebounce);
    
    // Remove event listeners
    this.form.removeEventListener('submit', this.handleSubmit);
    
    // Clear saved data
    this.clearSavedData();
    
    // Reset form
    this.clearAllValidation();
  }
}

// ========================================
// NEWSLETTER FORM HANDLER
// ========================================

class NewsletterForm extends FormHandler {
  constructor(formSelector) {
    super(formSelector, {
      endpoints: {
        newsletter: '/api/newsletter'
      },
      messages: {
        success: 'Thank you for subscribing!',
        error: 'Subscription failed. Please try again.',
      }
    });
  }

  /**
   * Handle success override
   */
  handleSuccess(response) {
    super.handleSuccess(response);
    
    // Add to subscribers list
    this.addToSubscribersList();
    
    // Show welcome message
    this.showWelcomeMessage();
  }

  /**
   * Add to subscribers list
   */
  addToSubscribersList() {
    const email = this.formData.get('email');
    const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
    
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
    }
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    const message = document.createElement('div');
    message.className = 'welcome-message';
    message.innerHTML = `
      <h3>Welcome aboard! 🎉</h3>
      <p>Check your email for a confirmation link.</p>
    `;
    
    this.form.appendChild(message);
    
    setTimeout(() => message.remove(), 5000);
  }
}

// ========================================
// INITIALIZE FORMS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize contact form
  const contactForm = new FormHandler('#contact-form');
  
  // Initialize newsletter form
  const newsletterForm = new NewsletterForm('.newsletter-form');
  
  // Initialize all forms with data-form attribute
  document.querySelectorAll('[data-form]').forEach(form => {
    new FormHandler(form);
  });
  
  // Make available globally
  window.FormHandler = FormHandler;
  window.NewsletterForm = NewsletterForm;
  
  console.log('%c✨ Form Handler System Initialized! ✨', 
    'color: #6366f1; font-size: 14px; font-weight: bold;');
});

// ========================================
// CSS ANIMATIONS (Add to CSS file)
// ========================================
/*
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
*/

// ========================================
// EXPORT FOR MODULE USAGE
// ========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FormHandler,
    NewsletterForm,
    FORM_CONFIG
  };
}