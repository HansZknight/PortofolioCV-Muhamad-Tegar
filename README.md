<div align="center">
  
# ✨ Professional Portfolio Website ✨

### 🎓 Mahasiswa Akuntansi | Universitas Bangka Belitung

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <img src="./assets/images/preview.png" alt="Portfolio Preview" width="800">
</p>

**Website portfolio profesional dengan desain modern, animasi interaktif, dan integrasi WhatsApp langsung.**

[🌐 Live Demo](https://yourportfolio.com) • [📖 Documentation](#-dokumentasi) • [🐛 Report Bug](https://github.com/username/portfolio/issues) • [✨ Request Feature](https://github.com/username/portfolio/issues)

---

</div>

## 📋 Daftar Isi

- [✨ Tentang Project](#-tentang-project)
- [🎯 Fitur Utama](#-fitur-utama)
- [🖼️ Screenshots](#️-screenshots)
- [🚀 Quick Start](#-quick-start)
- [📁 Struktur Folder](#-struktur-folder)
- [⚙️ Konfigurasi](#️-konfigurasi)
- [📱 WhatsApp Integration](#-whatsapp-integration)
- [🎨 Customization](#-customization)
- [📖 Dokumentasi](#-dokumentasi)
- [🔧 Tech Stack](#-tech-stack)
- [📊 Performance](#-performance)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [📞 Contact](#-contact)

---

## ✨ Tentang Project

Portfolio website profesional yang dirancang khusus untuk **Mahasiswa Akuntansi Universitas Bangka Belitung**. Website ini menampilkan profil, keahlian, pengalaman, portfolio project, dan form kontak dengan integrasi langsung ke WhatsApp.

### 🎯 Tujuan
- Menampilkan profil dan keahlian secara profesional
- Showcase project dan pencapaian akademik
- Memudahkan calon employer/klien menghubungi via WhatsApp
- Meningkatkan personal branding

### 👤 Target Pengguna
- Mahasiswa yang ingin membuat portfolio online
- Fresh graduate mencari pekerjaan
- Freelancer yang ingin menampilkan jasa

---

## 🎯 Fitur Utama

<table>
<tr>
<td width="50%">

### 🎨 **Design & UI**
- ✅ Modern & Clean Design
- ✅ Fully Responsive (Mobile First)
- ✅ Dark/Light Mode Toggle
- ✅ Smooth Scroll Navigation
- ✅ Custom Animated Cursor
- ✅ Glassmorphism Effects
- ✅ Gradient Backgrounds
- ✅ Professional Typography

</td>
<td width="50%">

### ⚡ **Animations**
- ✅ Scroll Progress Bar
- ✅ Preloader Animation
- ✅ AOS (Animate On Scroll)
- ✅ Typed.js Text Effect
- ✅ Particles.js Background
- ✅ Counter Animation
- ✅ Skill Progress Bars
- ✅ Hover Effects

</td>
</tr>
<tr>
<td width="50%">

### 📱 **Sections**
- ✅ Hero Section
- ✅ About Me
- ✅ Skills & Technologies
- ✅ Portfolio Gallery
- ✅ Experience Timeline
- ✅ Testimonials Slider
- ✅ Contact Form
- ✅ Footer

</td>
<td width="50%">

### 🔧 **Functionality**
- ✅ WhatsApp Direct Integration
- ✅ Portfolio Filter System
- ✅ Form Validation
- ✅ Lazy Loading Images
- ✅ SEO Optimized
- ✅ Accessibility (A11y)
- ✅ Cross-Browser Support
- ✅ PWA Ready

</td>
</tr>
</table>

---

## 🖼️ Screenshots

<div align="center">

### 💻 Desktop View
<img src="./assets/images/screenshots/desktop-hero.png" alt="Desktop Hero" width="800">

### 🌙 Dark Mode
<img src="./assets/images/screenshots/dark-mode.png" alt="Dark Mode" width="800">

### 📱 Mobile View
<p>
<img src="./assets/images/screenshots/mobile-1.png" alt="Mobile 1" width="250">
<img src="./assets/images/screenshots/mobile-2.png" alt="Mobile 2" width="250">
<img src="./assets/images/screenshots/mobile-3.png" alt="Mobile 3" width="250">
</p>

</div>

---

## 🚀 Quick Start

### Prerequisites

Pastikan Anda sudah menginstall:
- Web browser modern (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)
- Git (optional, untuk clone)

### Installation

1️⃣ **Clone repository**
```bash
git clone https://github.com/username/portfolio-website.git
2️⃣ Masuk ke folder project

Bash

cd portfolio-website
3️⃣ Buka dengan browser

Bash

# Buka file index.html di browser
# Atau gunakan Live Server di VS Code
4️⃣ Atau gunakan Live Server

Bash

# Install Live Server extension di VS Code
# Klik kanan index.html → Open with Live Server
🐳 Docker (Optional)
Bash

# Build image
docker build -t portfolio-website .

# Run container
docker run -p 8080:80 portfolio-website
📁 Struktur Folder
text

portfolio-website/
│
├── 📄 index.html              # Main HTML file
├── 📄 README.md               # Documentation
├── 📄 LICENSE                 # MIT License
│
├── 📂 css/
│   ├── 📄 style.css           # Main stylesheet (8000+ lines)
│   ├── 📄 responsive.css      # Responsive styles
│   ├── 📄 testimonials.css    # Testimonials section styles
│   └── 📄 whatsapp-form.css   # WhatsApp form styles
│
├── 📂 js/
│   ├── 📄 main.js             # Core JavaScript functionality
│   ├── 📄 animations.js       # Animation controllers
│   ├── 📄 portfolio-filter.js # Portfolio filtering system
│   └── 📄 whatsapp-form.js    # WhatsApp form handler
│
└── 📂 assets/
    ├── 📂 images/
    │   ├── 📄 hero-image.png      # Hero section image
    │   ├── 📄 about-img.jpg       # About section image
    │   ├── 📄 favicon.png         # Website favicon
    │   ├── 📄 og-image.jpg        # Open Graph image
    │   │
    │   ├── 📂 portfolio/          # Portfolio images
    │   │   ├── 📄 project-1.jpg
    │   │   ├── 📄 project-2.jpg
    │   │   └── ...
    │   │
    │   ├── 📂 testimonials/       # Testimonial avatars
    │   │   ├── 📄 client-1.jpg
    │   │   └── ...
    │   │
    │   └── 📂 screenshots/        # README screenshots
    │
    └── 📂 cv/
        └── 📄 cv-mahasiswa.pdf    # Downloadable CV
⚙️ Konfigurasi
1️⃣ Informasi Personal
Edit di index.html:

HTML

<!-- Hero Section -->
<h1 class="hero-title">
    Hai, Saya <span class="gradient-text typed-text"></span>
</h1>

<!-- About Section -->
<div class="about-details">
    <span class="detail-value">[Nama Anda]</span>
    <span class="detail-value">[NIM Anda]</span>
    <span class="detail-value">[Email Anda]</span>
</div>
2️⃣ Typed.js Text
Edit di js/main.js:

JavaScript

class TypedText {
  constructor() {
    this.strings = [
      'Nama Anda',           // Ganti dengan nama Anda
      'Mahasiswa Akuntansi',
      'Calon Akuntan',
      'Analis Keuangan'
    ];
  }
}
3️⃣ Social Media Links
Edit di index.html:

HTML

<div class="hero-social">
    <a href="https://github.com/username" target="_blank">
        <i class="fab fa-github"></i>
    </a>
    <a href="https://linkedin.com/in/username" target="_blank">
        <i class="fab fa-linkedin-in"></i>
    </a>
    <a href="https://instagram.com/username" target="_blank">
        <i class="fab fa-instagram"></i>
    </a>
</div>
4️⃣ Theme Colors
Edit di css/style.css:

CSS

:root {
  /* Primary Colors - Ganti sesuai keinginan */
  --primary-color: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #818cf8;
  
  /* Secondary Colors */
  --secondary-color: #ec4899;
  
  /* Accent Colors */
  --accent-color: #14b8a6;
}
📱 WhatsApp Integration
Konfigurasi Nomor WhatsApp
Edit di js/whatsapp-form.js:

JavaScript

class WhatsAppForm {
  constructor(formId) {
    // ============================================
    // 🔔 GANTI NOMOR WHATSAPP DI SINI
    // Format: 628xxxxxxxxxx (tanpa + atau 0)
    // ============================================
    this.phoneNumber = '6281234567890'; // <<< GANTI NOMOR ANDA
  }
}
Format Nomor
❌ Salah	✅ Benar
081234567890	6281234567890
+6281234567890	6281234567890
08-1234-567890	6281234567890
Cara Kerja
text

User Submit Form → Validasi → Loading Animation → 
Generate Message → Redirect ke WhatsApp App → 
Pesan Otomatis Terisi
Fitur WhatsApp Form
✅ Auto redirect ke WhatsApp App (bukan web)
✅ Pesan terformat dengan emoji
✅ Form validation real-time
✅ Loading animation
✅ Fallback button jika gagal
✅ Support desktop & mobile
🎨 Customization
Mengganti Warna Tema
CSS

/* css/style.css */
:root {
  /* Contoh: Tema Biru */
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
  
  /* Contoh: Tema Hijau */
  --primary-color: #10b981;
  --primary-dark: #059669;
  --primary-light: #34d399;
  
  /* Contoh: Tema Merah */
  --primary-color: #ef4444;
  --primary-dark: #dc2626;
  --primary-light: #f87171;
}
Mengganti Font
CSS

/* css/style.css */
:root {
  --font-primary: 'Poppins', sans-serif;
  --font-heading: 'Playfair Display', serif;
}

/* Atau gunakan Google Fonts lain */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
Menambah Section Baru
HTML

<!-- index.html -->
<section class="new-section section" id="new-section">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <p class="section-subtitle">Subtitle</p>
            <h2 class="section-title">Section Title</h2>
            <div class="section-divider"></div>
        </div>
        <!-- Content here -->
    </div>
</section>
Menambah Navigation Link
HTML

<!-- index.html - Navigation -->
<li class="nav-item">
    <a href="#new-section" class="nav-link">
        <i class="fas fa-star"></i>
        <span>New Section</span>
    </a>
</li>
📖 Dokumentasi
File JavaScript
File	Deskripsi	Lines
main.js	Core functionality (navigation, theme, scroll, etc.)	1500+
animations.js	GSAP animations, parallax, magnetic effects	1000+
portfolio-filter.js	Portfolio filtering & sorting system	1200+
whatsapp-form.js	WhatsApp form handler & validation	500+
File CSS
File	Deskripsi	Lines
style.css	Main stylesheet dengan CSS variables	8000+
responsive.css	Media queries untuk semua breakpoints	2000+
testimonials.css	Testimonials section styles	400+
whatsapp-form.css	WhatsApp form styles	200+
Libraries Used
Library	Version	Purpose
AOS	2.3.1	Animate on Scroll
Typed.js	2.0.12	Typing Animation
Particles.js	2.0.0	Particle Background
Swiper	11.0.0	Testimonials Slider
Font Awesome	6.4.0	Icons
Google Fonts	-	Typography
🔧 Tech Stack
<div align="center">
Frontend
HTML5
CSS3
JavaScript

Libraries & Frameworks
Swiper
Font Awesome
Google Fonts

Tools
VS Code
Git
GitHub

</div>
📊 Performance
Lighthouse Scores
<div align="center">
Metric	Score
🟢 Performance	95+
🟢 Accessibility	98+
🟢 Best Practices	100
🟢 SEO	100
</div>
Optimizations
✅ Lazy loading images
✅ Minified CSS & JS
✅ Optimized fonts loading
✅ Compressed images
✅ Efficient animations
✅ Clean code structure
🤝 Contributing
Kontribusi sangat diterima! Berikut cara berkontribusi:

Fork repository ini
Clone fork Anda
Bash

git clone https://github.com/your-username/portfolio-website.git
Buat branch baru
Bash

git checkout -b feature/AmazingFeature
Commit perubahan
Bash

git commit -m 'Add some AmazingFeature'
Push ke branch
Bash

git push origin feature/AmazingFeature
Buat Pull Request
Code Style
Gunakan 2 spaces untuk indentation
Gunakan camelCase untuk JavaScript
Gunakan kebab-case untuk CSS classes
Tambahkan komentar untuk code kompleks
📝 License
Distributed under the MIT License. See LICENSE for more information.

text

MIT License

Copyright (c) 2024 [Sirhan Muzaffar]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
📞 Contact
<div align="center">
[Nama Mahasiswa]
Mahasiswa Akuntansi | Universitas Bangka Belitung

WhatsApp
Email
LinkedIn
Instagram
GitHub

🙏 Acknowledgments
Font Awesome - Icons
Google Fonts - Typography
AOS Library - Scroll Animations
Swiper.js - Touch Slider
Particles.js - Background Effect
UI Avatars - Avatar Generator
<p align="center"> Made with ❤️ by <a href="https://github.com/HansZknight">Mahasiswa UBB</a> </p><p align="center"> <a href="#-professional-portfolio-website-">⬆️ Back to Top</a> </p></div> ```