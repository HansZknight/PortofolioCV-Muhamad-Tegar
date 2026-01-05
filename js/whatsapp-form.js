/*
===============================================
  WHATSAPP FORM HANDLER
  Direct to WhatsApp App (Desktop & Mobile)
  Version: 3.0
===============================================
*/

'use strict';

class WhatsAppForm {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (!this.form) return;
    
    // ============================================
    // CONFIGURATION - GANTI NOMOR WHATSAPP DI SINI
    // ============================================
    this.config = {
      // Format: 628xxxxxxxxxx (tanpa + atau 0 di awal)
      phoneNumber: '6285165543935', // <<< GANTI DENGAN NOMOR ANDA
      
      // Delay sebelum redirect (ms)
      redirectDelay: 1500,
      
      // Tampilkan popup konfirmasi jika gagal
      showFallbackPopup: true
    };
    
    // Form elements
    this.inputs = this.form.querySelectorAll('input, textarea, select');
    this.submitBtn = this.form.querySelector('.btn-submit');
    this.statusElement = document.getElementById('form-status');
    
    // State
    this.formData = {};
    this.isSubmitting = false;
    
    // Device detection
    this.isMobile = this.detectMobile();
    this.isDesktopApp = this.detectDesktopApp();
    
    // Initialize
    this.init();
  }

  /**
   * Detect if user is on mobile device
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Detect if WhatsApp Desktop might be installed
   */
  detectDesktopApp() {
    // Check if it's Windows or Mac (where WhatsApp Desktop can be installed)
    const platform = navigator.platform.toLowerCase();
    return platform.includes('win') || platform.includes('mac');
  }

  init() {
    console.log('📱 WhatsApp Form Initialized');
    console.log('📱 Device:', this.isMobile ? 'Mobile' : 'Desktop');
    
    this.bindEvents();
    this.setupCharacterCounter();
    this.setupPhoneFormatter();
  }

  bindEvents() {
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Real-time validation
    this.inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  async handleSubmit() {
    if (this.isSubmitting) return;
    
    // Validate form
    if (!this.validateForm()) {
      this.showNotification('error', '❌ Mohon lengkapi semua field');
      this.focusFirstError();
      return;
    }
    
    // Set loading state
    this.setLoadingState(true);
    
    // Collect form data
    this.collectFormData();
    
    // Show loading
    this.showNotification('loading', '📤 Memproses pesan...');
    
    // Generate message
    const message = this.generateWhatsAppMessage();
    
    // Save backup to localStorage
    this.saveToLocalStorage();
    
    // Simulate processing delay
    await this.delay(1000);
    
    // Show success
    this.showNotification('success', '✅ Membuka WhatsApp...');
    
    // Reset form
    this.resetForm();
    
    // Wait a moment then redirect
    await this.delay(500);
    
    // OPEN WHATSAPP APP (bukan web!)
    this.openWhatsAppApp(message);
  }

  /**
   * Open WhatsApp Application (NOT Web)
   * Priority: App > Protocol > Web fallback
   */
  openWhatsAppApp(message) {
    const phone = this.formatPhoneNumber(this.config.phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    
    // URLs untuk berbagai platform
    const urls = {
      // WhatsApp Protocol - buka app langsung
      protocol: `whatsapp://send?phone=${phone}&text=${encodedMessage}`,
      
      // Intent untuk Android
      intent: `intent://send?phone=${phone}&text=${encodedMessage}#Intent;scheme=whatsapp;package=com.whatsapp;end;`,
      
      // Universal link (fallback ke app atau web)
      universal: `https://wa.me/${phone}?text=${encodedMessage}`,
      
      // API WhatsApp
      api: `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`,
      
      // Web WhatsApp (last resort)
      web: `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`
    };

    console.log('📱 Opening WhatsApp...');
    console.log('📱 Phone:', phone);

    if (this.isMobile) {
      // MOBILE: Langsung buka WhatsApp App
      this.openMobileWhatsApp(urls, encodedMessage, phone);
    } else {
      // DESKTOP: Coba buka WhatsApp Desktop App
      this.openDesktopWhatsApp(urls, encodedMessage, phone);
    }
  }

  /**
   * Open WhatsApp on Mobile Device
   */
  openMobileWhatsApp(urls, encodedMessage, phone) {
    console.log('📱 Opening Mobile WhatsApp...');
    
    // Method 1: Gunakan protocol whatsapp:// (langsung ke app)
    const appUrl = urls.protocol;
    
    // Coba buka dengan location.href (paling reliable untuk mobile)
    window.location.href = appUrl;
    
    // Fallback: Jika protocol gagal, coba intent (Android) atau universal link
    setTimeout(() => {
      // Check if page is still here (app didn't open)
      if (document.hasFocus()) {
        console.log('📱 Protocol failed, trying universal link...');
        window.location.href = urls.universal;
      }
    }, 2000);
    
    // Show fallback button after delay
    setTimeout(() => {
      this.showFallbackButton(urls);
      this.setLoadingState(false);
    }, 3000);
  }

  /**
   * Open WhatsApp Desktop Application
   */
  openDesktopWhatsApp(urls, encodedMessage, phone) {
    console.log('💻 Opening Desktop WhatsApp...');
    
    // Method 1: Coba protocol whatsapp:// untuk desktop app
    const protocolUrl = urls.protocol;
    
    // Buat hidden iframe untuk trigger protocol
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = protocolUrl;
    document.body.appendChild(iframe);
    
    // Juga coba window.location (beberapa OS butuh ini)
    setTimeout(() => {
      window.location.href = protocolUrl;
    }, 100);
    
    // Hapus iframe setelah beberapa saat
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
    
    // Fallback check - jika WhatsApp app tidak terbuka
    setTimeout(() => {
      // Show options to user
      this.showDesktopFallback(urls);
      this.setLoadingState(false);
    }, 3000);
  }

  /**
   * Show Desktop Fallback Options
   */
  showDesktopFallback(urls) {
    // Remove existing fallback if any
    const existingFallback = document.querySelector('.wa-fallback-container');
    if (existingFallback) existingFallback.remove();

    const fallbackHTML = `
      <div class="wa-fallback-container">
        <div class="wa-fallback-content">
          <div class="wa-fallback-header">
            <i class="fab fa-whatsapp"></i>
            <h4>Pilih Cara Membuka WhatsApp</h4>
          </div>
          <p>Pesan Anda sudah siap dikirim. Pilih salah satu opsi:</p>
          
          <div class="wa-fallback-buttons">
            <a href="${urls.protocol}" class="wa-btn wa-btn-app">
              <i class="fas fa-desktop"></i>
              <span>Buka WhatsApp Desktop</span>
            </a>
            
            <a href="${urls.api}" target="_blank" class="wa-btn wa-btn-universal">
              <i class="fab fa-whatsapp"></i>
              <span>Buka WhatsApp</span>
            </a>
            
            <a href="${urls.web}" target="_blank" class="wa-btn wa-btn-web">
              <i class="fas fa-globe"></i>
              <span>Buka WhatsApp Web</span>
            </a>
          </div>
          
          <button class="wa-fallback-close" onclick="this.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i> Tutup
          </button>
        </div>
      </div>
    `;

    this.form.insertAdjacentHTML('afterend', fallbackHTML);

    // Auto click on desktop app button
    setTimeout(() => {
      const appBtn = document.querySelector('.wa-btn-app');
      if (appBtn) {
        appBtn.click();
      }
    }, 500);
  }

  /**
   * Show Mobile Fallback Button
   */
  showFallbackButton(urls) {
    const existingBtn = document.querySelector('.wa-mobile-fallback');
    if (existingBtn) existingBtn.remove();

    const fallbackHTML = `
      <div class="wa-mobile-fallback">
        <p>WhatsApp tidak terbuka? Tap tombol di bawah:</p>
        <a href="${urls.universal}" class="btn btn-whatsapp-fallback">
          <i class="fab fa-whatsapp"></i>
          Buka WhatsApp
        </a>
      </div>
    `;

    this.form.insertAdjacentHTML('afterend', fallbackHTML);

    // Auto remove after 10 seconds
    setTimeout(() => {
      const fallback = document.querySelector('.wa-mobile-fallback');
      if (fallback) fallback.remove();
    }, 10000);
  }

  /**
   * Format phone number
   */
  formatPhoneNumber(phone) {
    // Remove all non-digits
    let formatted = phone.replace(/\D/g, '');
    
    // Add country code if needed
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.substring(1);
    } else if (!formatted.startsWith('62')) {
      formatted = '62' + formatted;
    }
    
    return formatted;
  }

  /**
   * Generate WhatsApp message from form data
   */
  generateWhatsAppMessage() {
    const { name, email, phone, service, subject, message, timestamp } = this.formData;
    
    let waMessage = `══════════════════\n`;
    waMessage += `📩 *PESAN DARI WEBSITE*\n`;
    waMessage += `══════════════════\n\n`;
    
    waMessage += `👤 *Nama:* ${name}\n`;
    waMessage += `📧 *Email:* ${email}\n`;
    waMessage += `📱 *No. HP:* ${phone}\n`;
    
    if (service && service !== '') {
      waMessage += `🎯 *Layanan:* ${service}\n`;
    }
    
    waMessage += `📌 *Subject:* ${subject}\n\n`;
    
    waMessage += `💬 *Pesan:*\n${message}\n\n`;
    
    waMessage += `══════════════════\n`;
    waMessage += `⏰ ${timestamp}\n`;
    waMessage += `🌐 Website Portfolio`;
    
    return waMessage;
  }

  validateForm() {
    let isValid = true;
    
    this.inputs.forEach(input => {
      if (input.required && !input.value.trim()) {
        this.showFieldError(input, 'Field ini wajib diisi');
        isValid = false;
      }
    });
    
    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    if (field.required && !value) {
      this.showFieldError(field, 'Field ini wajib diisi');
      isValid = false;
    } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.showFieldError(field, 'Email tidak valid');
      isValid = false;
    } else if (field.type === 'tel' && value && value.replace(/\D/g, '').length < 10) {
      this.showFieldError(field, 'Nomor telepon tidak valid');
      isValid = false;
    } else {
      this.clearFieldError(field);
    }
    
    return isValid;
  }

  showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('error');
    const errorElement = formGroup.querySelector('.form-error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    
    field.classList.add('shake');
    setTimeout(() => field.classList.remove('shake'), 500);
  }

  clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove('error');
    const errorElement = formGroup.querySelector('.form-error-message');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  focusFirstError() {
    const firstError = this.form.querySelector('.form-group.error input, .form-group.error textarea');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  collectFormData() {
    this.formData = {};
    this.inputs.forEach(input => {
      this.formData[input.name] = input.value.trim();
    });
    this.formData.timestamp = new Date().toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
  }

  saveToLocalStorage() {
    try {
      const submissions = JSON.parse(localStorage.getItem('wa_submissions') || '[]');
      submissions.push({
        ...this.formData,
        id: Date.now()
      });
      
      if (submissions.length > 10) submissions.shift();
      localStorage.setItem('wa_submissions', JSON.stringify(submissions));
    } catch (e) {
      console.log('LocalStorage not available');
    }
  }

  setLoadingState(isLoading) {
    this.isSubmitting = isLoading;
    
    if (this.submitBtn) {
      this.submitBtn.disabled = isLoading;
      
      if (isLoading) {
        this.submitBtn.innerHTML = `
          <i class="fas fa-spinner fa-spin"></i>
          <span>Mengirim...</span>
        `;
      } else {
        this.submitBtn.innerHTML = `
          <span>Kirim ke WhatsApp</span>
          <i class="fab fa-whatsapp"></i>
        `;
      }
    }
    
    this.inputs.forEach(input => {
      input.disabled = isLoading;
    });
  }

  showNotification(type, message) {
    if (!this.statusElement) {
      this.statusElement = document.createElement('div');
      this.statusElement.id = 'form-status';
      this.statusElement.className = 'form-status';
      this.form.appendChild(this.statusElement);
    }
    
    const icons = {
      success: '<i class="fas fa-check-circle"></i>',
      error: '<i class="fas fa-exclamation-circle"></i>',
      loading: '<i class="fas fa-spinner fa-spin"></i>',
      info: '<i class="fas fa-info-circle"></i>'
    };
    
    this.statusElement.className = `form-status ${type} show`;
    this.statusElement.innerHTML = `${icons[type] || ''}<span>${message}</span>`;
    
    if (type !== 'loading') {
      setTimeout(() => {
        this.statusElement.classList.remove('show');
      }, 5000);
    }
  }

  resetForm() {
    this.form.reset();
    this.form.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('success', 'error');
    });
    
    const charCounter = this.form.querySelector('.char-count');
    if (charCounter) charCounter.textContent = '0';
  }

  setupCharacterCounter() {
    const messageField = this.form.querySelector('#message');
    const charCounter = this.form.querySelector('.char-count');
    
    if (messageField && charCounter) {
      messageField.addEventListener('input', () => {
        charCounter.textContent = messageField.value.length;
      });
    }
  }

  setupPhoneFormatter() {
    const phoneInput = this.form.querySelector('input[type="tel"]');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length <= 4) {
        e.target.value = value;
      } else if (value.length <= 8) {
        e.target.value = `${value.slice(0, 4)}-${value.slice(4)}`;
      } else {
        e.target.value = `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;
      }
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const waForm = new WhatsAppForm('whatsapp-form');
  window.whatsappForm = waForm;
  
  console.log('%c✅ WhatsApp Form Ready! (Direct to App)', 
    'color: #25d366; font-size: 14px; font-weight: bold;');
});