// ============================================
// L.S.G LAN CENTRE — JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Floating Particles ----------
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.hue = Math.random() > 0.5 ? 263 : 166; // purple or green
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse interaction
      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.x -= (dx / dist) * force * 0.8;
          this.y -= (dy / dist) * force * 0.8;
        }
      }

      // Wrap around
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }
  initParticles();

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const opacity = (1 - dist / 120) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = `hsla(263, 80%, 65%, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    connectParticles();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });


  // ---------- Navbar Scroll Effect ----------
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });


  // ---------- Mobile Menu Toggle ----------
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });


  // ---------- Counter Animation ----------
  function animateCounters() {
    const counters = document.querySelectorAll('.hero-stat-value');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.floor(eased * target);

        if (target >= 1000) {
          counter.textContent = current.toLocaleString() + '+';
        } else if (counter.closest('.hero-stat').querySelector('.hero-stat-label').textContent.includes('AM')) {
          counter.textContent = current + ' AM';
        } else if (counter.closest('.hero-stat').querySelector('.hero-stat-label').textContent.includes('Gbps')) {
          counter.textContent = current;
        } else {
          counter.textContent = current + '+';
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // Trigger counter animation when hero is in view
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        heroObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    heroObserver.observe(heroStats);
  }


  // ---------- Scroll Reveal ----------
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  // ---------- Live Clock ----------
  function updateClock() {
    const now = new Date();
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      weekday: 'long'
    };
    const formatted = now.toLocaleTimeString('en-US', options);
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const clockEl = document.getElementById('currentTime');
    if (clockEl) {
      clockEl.textContent = `${dayName} — ${formatted}`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);


  // ---------- Contact Form ----------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      const contactName = document.getElementById('name')?.value || 'Inquiry';
      const contactPhone = document.getElementById('phone')?.value || '';
      const contactZone = document.getElementById('zone')?.value || 'General Inquiry';
      const contactMsg = document.getElementById('message')?.value || '';

      // Create booking/inquiry record for admin portal
      const inquiryRecord = {
        bookingId: `LSG-INQ-${Math.floor(1000 + Math.random() * 9000)}`,
        stationId: contactZone,
        stationName: `Inquiry: ${contactZone}`,
        date: new Date().toISOString().split('T')[0],
        slot: 'Message Inquiry',
        duration: 'N/A',
        totalAmount: '₹0',
        customer: {
          name: contactName,
          phone: contactPhone,
          email: 'N/A',
          discord: contactMsg
        },
        paymentStatus: 'Pending Verification',
        proof: null,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage & broadcast
      try {
        const stored = JSON.parse(localStorage.getItem('lsg_reservations') || '[]');
        stored.unshift(inquiryRecord);
        localStorage.setItem('lsg_reservations', JSON.stringify(stored));

        const channel = new BroadcastChannel('lsg_live_sync');
        channel.postMessage({ type: 'NEW_BOOKING', booking: inquiryRecord });
      } catch (err) {}

      // Send to server API
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryRecord)
      }).catch(() => {});

      // Store in Firebase Cloud Firestore
      try {
        if (window.LSG_Firebase && window.LSG_Firebase.isReady()) {
          window.LSG_Firebase.saveInquiry(inquiryRecord);
        }
      } catch (fbErr) {}

      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Message Sent to Admin!
      `;
      btn.style.background = 'linear-gradient(135deg, #06d6a0, #22d3ee)';

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        contactForm.reset();
      }, 3000);
    });
  }


  // ---------- Tilt Effect on Cards ----------
  const tiltCards = document.querySelectorAll('.zone-card, .pricing-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -3;
      const rotateY = (x - centerX) / centerX * 3;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });


  // ---------- Navbar Active Link Highlight ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinksAll.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = 'var(--accent-primary)';
      }
    });
  });


  // ---------- Parallax on Hero Image ----------
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.1)`;
      }
    });
  }


  // ============================================
  // CHECKOUT & PAYMENT FLOW LOGIC
  // ============================================

  const STATIONS = {
    'battle-arena': {
      name: 'Gaming PC — Battle Arena',
      rate: 80,
      icon: '🖥️',
      spec: 'RTX 4090 • 240Hz • 1 Gbps Fiber'
    },
    'vip-lounge': {
      name: 'VIP Gaming PC — L.S.G Lounge',
      rate: 150,
      icon: '👑',
      spec: 'RTX 4090 • 360Hz • Soundproofed Pod'
    },
    'console-zone': {
      name: 'PS5 Console — Party Zone',
      rate: 100,
      icon: '🎮',
      spec: 'PS5 + Xbox • 65" 4K OLED • DualSense'
    },
    'racing-sim': {
      name: 'Racing Simulator Rig',
      rate: 120,
      icon: '🏎️',
      spec: 'Triple 144Hz • Direct Drive • Force Feedback'
    }
  };

  // State
  let currentBooking = {
    stationId: 'battle-arena',
    date: '',
    slot: '10:00 AM - 12:00 PM',
    duration: 1,
    totalAmount: 80,
    paymentMethod: 'upi',
    customerName: '',
    customerPhone: '',
    customerEmail: 'N/A',
    customerDiscord: ''
  };

  let selectedProofFile = null;
  let selectedProofDataUrl = null;

  // DOM Elements - Checkout Form
  const stationSelector = document.getElementById('stationSelector');
  const bookingDateInput = document.getElementById('bookingDate');
  const bookingSlotSelect = document.getElementById('bookingSlot');
  const bookingDurationSelect = document.getElementById('bookingDuration');
  const playerDiscordInput = document.getElementById('playerDiscord');
  const checkoutNameInput = document.getElementById('checkoutName');
  const checkoutPhoneInput = document.getElementById('checkoutPhone');
  const checkoutEmailInput = document.getElementById('checkoutEmail');
  const proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');
  const checkoutValidationError = document.getElementById('checkoutValidationError');
  const paymentMethodCards = document.querySelectorAll('.payment-method-card');

  // DOM Elements - Order Summary
  const sumStationIcon = document.getElementById('sumStationIcon');
  const sumStationName = document.getElementById('sumStationName');
  const sumStationSpec = document.getElementById('sumStationSpec');
  const sumDate = document.getElementById('sumDate');
  const sumSlot = document.getElementById('sumSlot');
  const sumDuration = document.getElementById('sumDuration');
  const sumRate = document.getElementById('sumRate');
  const sumPaymentMethod = document.getElementById('sumPaymentMethod');
  const sumSubtotal = document.getElementById('sumSubtotal');
  const sumTotal = document.getElementById('sumTotal');
  const btnPayAmount = document.getElementById('btnPayAmount');
  const btnPayText = document.getElementById('btnPayText');
  const perkPaymentText = document.getElementById('perkPaymentText');

  // DOM Elements - Payment Modal
  const paymentModalOverlay = document.getElementById('paymentModalOverlay');
  const closePaymentModalBtn = document.getElementById('closePaymentModalBtn');
  const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
  const modalStepSubtitle = document.getElementById('modalStepSubtitle');
  const modalMethodTabs = document.querySelectorAll('.modal-method-tab');
  const modalTabUpi = document.getElementById('modalTabUpi');
  const modalTabCash = document.getElementById('modalTabCash');
  const modalStepsNav = document.getElementById('modalStepsNav');
  const stepIndicator1 = document.getElementById('stepIndicator1');
  const stepIndicator2 = document.getElementById('stepIndicator2');
  const stepIndicator3 = document.getElementById('stepIndicator3');
  const stepLine1 = document.getElementById('stepLine1');
  const stepLine2 = document.getElementById('stepLine2');

  // Modal Views
  const modalScanView = document.getElementById('modalScanView');
  const modalUploadView = document.getElementById('modalUploadView');
  const modalCashView = document.getElementById('modalCashView');
  const modalStatusView = document.getElementById('modalStatusView');

  // View 1 (Scanner)
  const modalPayableAmount = document.getElementById('modalPayableAmount');
  const modalBookingSummaryText = document.getElementById('modalBookingSummaryText');
  const copyUpiBtn = document.getElementById('copyUpiBtn');
  const upiIdText = document.getElementById('upiIdText');
  const completedPaymentBtn = document.getElementById('completedPaymentBtn');
  const switchToCashBannerBtn = document.getElementById('switchToCashBannerBtn');
  const bottomSwitchToCashBtn = document.getElementById('bottomSwitchToCashBtn');
  const switchBackToUpiBtn = document.getElementById('switchBackToUpiBtn');

  // View 2 (Upload Proof)
  const uploadStationText = document.getElementById('uploadStationText');
  const uploadAmountText = document.getElementById('uploadAmountText');
  const proofUploadZone = document.getElementById('proofUploadZone');
  const proofFileInput = document.getElementById('proofFileInput');
  const chooseFileBtn = document.getElementById('chooseFileBtn');
  const uploadEmptyState = document.getElementById('uploadEmptyState');
  const uploadPreviewState = document.getElementById('uploadPreviewState');
  const proofImgPreview = document.getElementById('proofImgPreview');
  const proofFileName = document.getElementById('proofFileName');
  const proofFileSize = document.getElementById('proofFileSize');
  const removeFileBtn = document.getElementById('removeFileBtn');
  const uploadFeedback = document.getElementById('uploadFeedback');
  const backToScannerBtn = document.getElementById('backToScannerBtn');
  const submitProofBtn = document.getElementById('submitProofBtn');
  const submitSpinner = document.getElementById('submitSpinner');
  const submitBtnText = document.getElementById('submitBtnText');

  // View Cash (Cash at Desk)
  const modalCashPayableAmount = document.getElementById('modalCashPayableAmount');
  const modalCashBookingSummaryText = document.getElementById('modalCashBookingSummaryText');
  const cancelCashBtn = document.getElementById('cancelCashBtn');
  const confirmCashBtn = document.getElementById('confirmCashBtn');
  const cashSpinner = document.getElementById('cashSpinner');
  const cashBtnText = document.getElementById('cashBtnText');

  // View 3 (Status)
  const receiptBookingId = document.getElementById('receiptBookingId');
  const receiptStation = document.getElementById('receiptStation');
  const receiptDateSlot = document.getElementById('receiptDateSlot');
  const receiptAmount = document.getElementById('receiptAmount');
  const receiptMethod = document.getElementById('receiptMethod');
  const receiptCustomer = document.getElementById('receiptCustomer');
  const finishBookingBtn = document.getElementById('finishBookingBtn');

  // Switch Payment Method (UPI vs Cash)
  function setPaymentMethod(method) {
    currentBooking.paymentMethod = method;

    // 1. Update Checkout Card Selection
    paymentMethodCards.forEach(card => {
      card.classList.toggle('active', card.dataset.method === method);
    });

    // 2. Update Summary Row & Button
    if (sumPaymentMethod) {
      if (method === 'cash') {
        sumPaymentMethod.textContent = '💵 Pay Cash at Desk';
        sumPaymentMethod.className = 'row-val text-emerald';
        sumPaymentMethod.style.color = '#34d399';
      } else {
        sumPaymentMethod.textContent = '📱 UPI / QR Scan';
        sumPaymentMethod.className = 'row-val text-cyan';
        sumPaymentMethod.style.color = '';
      }
    }

    if (btnPayText) {
      if (method === 'cash') {
        btnPayText.innerHTML = `Confirm Cash Booking — <span id="btnPayAmount">₹${currentBooking.totalAmount}</span>`;
      } else {
        btnPayText.innerHTML = `Proceed to Payment — <span id="btnPayAmount">₹${currentBooking.totalAmount}</span>`;
      }
    }

    // 3. Update Modal Tabs
    modalMethodTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.method === method);
    });
  }

  // Handle Payment Method Selection in Checkout Form
  paymentMethodCards.forEach(card => {
    card.addEventListener('click', () => {
      const method = card.getAttribute('data-method') || 'upi';
      setPaymentMethod(method);
    });
  });

  // Initialize Date Input (Default Today, Min Today)
  if (bookingDateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    bookingDateInput.min = todayStr;
    bookingDateInput.value = todayStr;
    currentBooking.date = todayStr;
  }

  // Update Booking Calculation & Summary UI
  function updateBookingSummary() {
    const station = STATIONS[currentBooking.stationId] || STATIONS['battle-arena'];
    const durationHours = parseInt(bookingDurationSelect ? bookingDurationSelect.value : 1, 10);
    currentBooking.duration = durationHours;

    let subtotal = 0;
    // Special Day Pass pricing for PC Battle Arena
    if (currentBooking.stationId === 'battle-arena' && durationHours === 8) {
      subtotal = 500;
    } else {
      subtotal = station.rate * durationHours;
    }

    currentBooking.totalAmount = subtotal;

    // Format readable date
    let dateDisplay = 'Today';
    if (bookingDateInput && bookingDateInput.value) {
      const parts = bookingDateInput.value.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        dateDisplay = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }

    const slotDisplay = bookingSlotSelect ? bookingSlotSelect.value : '06:00 PM – 08:00 PM';
    currentBooking.slot = slotDisplay;

    // Update Summary UI
    if (sumStationIcon) sumStationIcon.textContent = station.icon;
    if (sumStationName) sumStationName.textContent = station.name;
    if (sumStationSpec) sumStationSpec.textContent = station.spec;
    if (sumDate) sumDate.textContent = dateDisplay;
    if (sumSlot) sumSlot.textContent = slotDisplay;
    if (sumDuration) sumDuration.textContent = durationHours === 8 ? '8 Hours (Day Pass)' : `${durationHours} Hour${durationHours > 1 ? 's' : ''}`;
    if (sumRate) sumRate.textContent = `₹${station.rate}/hr`;
    if (sumSubtotal) sumSubtotal.textContent = `₹${subtotal}`;
    if (sumTotal) sumTotal.textContent = `₹${subtotal}`;
    if (btnPayAmount) btnPayAmount.textContent = `₹${subtotal}`;
  }

  // Handle Station Card Selection
  if (stationSelector) {
    const stationOptions = stationSelector.querySelectorAll('.station-option');
    stationOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        stationOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        currentBooking.stationId = opt.dataset.stationId;
        updateBookingSummary();
      });
    });
  }

  // Form Input Change Listeners
  if (bookingDateInput) {
    bookingDateInput.addEventListener('change', () => {
      currentBooking.date = bookingDateInput.value;
      updateBookingSummary();
    });
  }

  if (bookingSlotSelect) {
    bookingSlotSelect.addEventListener('change', updateBookingSummary);
  }

  if (bookingDurationSelect) {
    bookingDurationSelect.addEventListener('change', updateBookingSummary);
  }

  // Initial Calculation
  updateBookingSummary();

  // Handle "Get Started" and other Pricing buttons
  const getStartedButtons = document.querySelectorAll('.get-started-btn');
  getStartedButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetStation = btn.getAttribute('data-station');
      const targetDuration = btn.getAttribute('data-duration');
      const targetPlan = btn.getAttribute('data-plan');

      if (targetStation && STATIONS[targetStation]) {
        currentBooking.stationId = targetStation;
        if (stationSelector) {
          const optToSelect = stationSelector.querySelector(`[data-station-id="${targetStation}"]`);
          if (optToSelect) {
            stationSelector.querySelectorAll('.station-option').forEach(o => o.classList.remove('active'));
            optToSelect.classList.add('active');
          }
        }
      }

      if (targetDuration && bookingDurationSelect) {
        bookingDurationSelect.value = targetDuration;
      }

      updateBookingSummary();

      // Highlight the station card briefly to give visual feedback
      const stationCard = document.getElementById('stationCard');
      if (stationCard) {
        stationCard.style.borderColor = 'var(--accent-secondary)';
        stationCard.style.boxShadow = '0 0 30px rgba(6, 214, 160, 0.4)';
        setTimeout(() => {
          stationCard.style.borderColor = '';
          stationCard.style.boxShadow = '';
        }, 1200);
      }
    });
  });

  // Modal Step Switcher
  function switchModalStep(step) {
    // Hide all views
    if (modalScanView) modalScanView.style.display = 'none';
    if (modalUploadView) modalUploadView.style.display = 'none';
    if (modalCashView) modalCashView.style.display = 'none';
    if (modalStatusView) modalStatusView.style.display = 'none';

    // Reset indicator classes
    [stepIndicator1, stepIndicator2, stepIndicator3].forEach(ind => ind && ind.classList.remove('active'));
    [stepLine1, stepLine2].forEach(line => line && line.classList.remove('active'));

    if (step === 1) {
      if (modalStepsNav) modalStepsNav.style.display = 'flex';
      if (modalScanView) modalScanView.style.display = 'block';
      if (stepIndicator1) stepIndicator1.classList.add('active');
      if (modalStepSubtitle) modalStepSubtitle.textContent = 'Step 1: Scan & Pay via UPI';
      if (modalTabUpi) modalTabUpi.classList.add('active');
      if (modalTabCash) modalTabCash.classList.remove('active');
    } else if (step === 2) {
      if (modalStepsNav) modalStepsNav.style.display = 'flex';
      if (modalUploadView) modalUploadView.style.display = 'block';
      if (stepIndicator1) stepIndicator1.classList.add('active');
      if (stepIndicator2) stepIndicator2.classList.add('active');
      if (stepLine1) stepLine1.classList.add('active');
      if (modalStepSubtitle) modalStepSubtitle.textContent = 'Step 2: Upload Payment Proof';
      if (modalTabUpi) modalTabUpi.classList.add('active');
      if (modalTabCash) modalTabCash.classList.remove('active');
    } else if (step === 'cash') {
      if (modalStepsNav) modalStepsNav.style.display = 'none';
      if (modalCashView) modalCashView.style.display = 'block';
      if (modalStepSubtitle) modalStepSubtitle.textContent = 'Pay Cash at Reception Desk';
      if (modalTabCash) modalTabCash.classList.add('active');
      if (modalTabUpi) modalTabUpi.classList.remove('active');
    } else if (step === 3) {
      if (modalStepsNav) modalStepsNav.style.display = 'flex';
      if (modalStatusView) modalStatusView.style.display = 'block';
      if (stepIndicator1) stepIndicator1.classList.add('active');
      if (stepIndicator2) stepIndicator2.classList.add('active');
      if (stepIndicator3) stepIndicator3.classList.add('active');
      if (stepLine1) stepLine1.classList.add('active');
      if (stepLine2) stepLine2.classList.add('active');
      if (modalStepSubtitle) modalStepSubtitle.textContent = 'Step 3: Verification & Confirmation';
    }
  }

  function openPaymentModal() {
    // Populate modal scanner and cash data
    const station = STATIONS[currentBooking.stationId] || STATIONS['battle-arena'];
    const summaryStr = `${station.name} • ${currentBooking.duration} Hr(s) • ${currentBooking.slot}`;

    if (modalPayableAmount) modalPayableAmount.textContent = `₹${currentBooking.totalAmount}`;
    if (modalBookingSummaryText) modalBookingSummaryText.textContent = summaryStr;

    if (modalCashPayableAmount) modalCashPayableAmount.textContent = `₹${currentBooking.totalAmount}`;
    if (modalCashBookingSummaryText) modalCashBookingSummaryText.textContent = summaryStr;

    if (uploadStationText) uploadStationText.textContent = station.name;
    if (uploadAmountText) uploadAmountText.textContent = `₹${currentBooking.totalAmount}`;

    if (currentBooking.paymentMethod === 'cash') {
      switchModalStep('cash');
    } else {
      switchModalStep(1);
    }

    if (paymentModalOverlay) {
      paymentModalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // Modal Payment Method Switcher Logic
  function switchToCashMode() {
    if (modalStatusView && modalStatusView.style.display === 'block') return;
    setPaymentMethod('cash');
    const station = STATIONS[currentBooking.stationId] || STATIONS['battle-arena'];
    const summaryStr = `${station.name} • ${currentBooking.duration} Hr(s) • ${currentBooking.slot}`;
    if (modalCashPayableAmount) modalCashPayableAmount.textContent = `₹${currentBooking.totalAmount}`;
    if (modalCashBookingSummaryText) modalCashBookingSummaryText.textContent = summaryStr;
    switchModalStep('cash');
  }

  function switchToUpiMode() {
    if (modalStatusView && modalStatusView.style.display === 'block') return;
    setPaymentMethod('upi');
    switchModalStep(1);
  }

  if (modalTabUpi) modalTabUpi.addEventListener('click', switchToUpiMode);
  if (switchBackToUpiBtn) switchBackToUpiBtn.addEventListener('click', switchToUpiMode);

  if (modalTabCash) modalTabCash.addEventListener('click', switchToCashMode);
  if (switchToCashBannerBtn) switchToCashBannerBtn.addEventListener('click', switchToCashMode);
  if (bottomSwitchToCashBtn) bottomSwitchToCashBtn.addEventListener('click', switchToCashMode);

  function closePaymentModal() {
    if (paymentModalOverlay) {
      paymentModalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (cancelCashBtn) {
    cancelCashBtn.addEventListener('click', closePaymentModal);
  }

  // Proceed to Payment Button Trigger
  if (proceedToPaymentBtn) {
    proceedToPaymentBtn.addEventListener('click', () => {
      // Validate customer details
      const name = checkoutNameInput ? checkoutNameInput.value.trim() : '';
      const phone = checkoutPhoneInput ? checkoutPhoneInput.value.trim() : '';
      const date = bookingDateInput ? bookingDateInput.value : '';

      if (!name) {
        showCheckoutError('Please enter your full name to proceed with booking.');
        checkoutNameInput && checkoutNameInput.focus();
        return;
      }
      if (!phone || phone.length < 7) {
        showCheckoutError('Please enter a valid phone number for booking updates.');
        checkoutPhoneInput && checkoutPhoneInput.focus();
        return;
      }
      if (!date) {
        showCheckoutError('Please select a reservation date.');
        bookingDateInput && bookingDateInput.focus();
        return;
      }

      // Save customer state
      currentBooking.customerName = name;
      currentBooking.customerPhone = phone;
      currentBooking.customerEmail = 'N/A';
      currentBooking.customerDiscord = playerDiscordInput ? playerDiscordInput.value.trim() : '';

      hideCheckoutError();
      openPaymentModal();
    });
  }

  function showCheckoutError(msg) {
    if (checkoutValidationError) {
      checkoutValidationError.textContent = msg;
      checkoutValidationError.style.display = 'block';
      checkoutValidationError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function hideCheckoutError() {
    if (checkoutValidationError) {
      checkoutValidationError.style.display = 'none';
    }
  }

  // Modal Close & Cancel Events
  if (closePaymentModalBtn) closePaymentModalBtn.addEventListener('click', closePaymentModal);
  if (cancelPaymentBtn) cancelPaymentBtn.addEventListener('click', closePaymentModal);

  if (paymentModalOverlay) {
    paymentModalOverlay.addEventListener('click', (e) => {
      if (e.target === paymentModalOverlay) {
        closePaymentModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && paymentModalOverlay && paymentModalOverlay.classList.contains('active')) {
      closePaymentModal();
    }
  });

  // Copy UPI ID Action
  if (copyUpiBtn && upiIdText) {
    copyUpiBtn.addEventListener('click', () => {
      const textToCopy = upiIdText.textContent.trim();
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHTML = copyUpiBtn.innerHTML;
        copyUpiBtn.innerHTML = '<span>Copied!</span>';
        copyUpiBtn.style.background = 'var(--accent-secondary)';
        copyUpiBtn.style.color = '#000';
        setTimeout(() => {
          copyUpiBtn.innerHTML = originalHTML;
          copyUpiBtn.style.background = '';
          copyUpiBtn.style.color = '';
        }, 2000);
      }).catch(() => {
        // Fallback
        alert(`UPI ID: ${textToCopy}`);
      });
    });
  }

  // Step 1 -> Step 2 Trigger
  if (completedPaymentBtn) {
    completedPaymentBtn.addEventListener('click', () => {
      switchModalStep(2);
    });
  }

  // Step 2 -> Step 1 Back Trigger
  if (backToScannerBtn) {
    backToScannerBtn.addEventListener('click', () => {
      switchModalStep(1);
    });
  }

  // ---------- Proof Upload Logic ----------
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  function showUploadFeedback(msg, isError = true) {
    if (uploadFeedback) {
      uploadFeedback.textContent = msg;
      uploadFeedback.className = `upload-feedback ${isError ? 'error' : 'success'}`;
      uploadFeedback.style.display = 'block';
    }
  }

  function hideUploadFeedback() {
    if (uploadFeedback) {
      uploadFeedback.style.display = 'none';
    }
  }

  function handleFileSelected(file) {
    hideUploadFeedback();

    if (!file) {
      resetFilePreview();
      return;
    }

    // Validate type
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isValidExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt);
    const isValidType = ALLOWED_TYPES.includes(file.type) || isValidExt;

    if (!isValidType) {
      showUploadFeedback('Invalid file format. Please upload JPG, JPEG, PNG, or WEBP image only.', true);
      resetFilePreview();
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      showUploadFeedback('File size exceeds the 5MB limit. Please upload a smaller image.', true);
      resetFilePreview();
      return;
    }

    selectedProofFile = file;

    // Format file size
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const readableSize = file.size >= 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

    if (proofFileName) proofFileName.textContent = file.name;
    if (proofFileSize) proofFileSize.textContent = readableSize;

    // Read and display preview
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedProofDataUrl = e.target.result;
      if (proofImgPreview) proofImgPreview.src = selectedProofDataUrl;
      if (uploadEmptyState) uploadEmptyState.style.display = 'none';
      if (uploadPreviewState) uploadPreviewState.style.display = 'flex';
      if (submitProofBtn) submitProofBtn.disabled = false;
      showUploadFeedback('File selected successfully! Ready to submit.', false);
    };
    reader.readAsDataURL(file);
  }

  function resetFilePreview() {
    selectedProofFile = null;
    selectedProofDataUrl = null;
    if (proofFileInput) proofFileInput.value = '';
    if (uploadEmptyState) uploadEmptyState.style.display = 'block';
    if (uploadPreviewState) uploadPreviewState.style.display = 'none';
    if (proofImgPreview) proofImgPreview.src = '';
    if (submitProofBtn) submitProofBtn.disabled = true;
  }

  if (chooseFileBtn && proofFileInput) {
    chooseFileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      proofFileInput.click();
    });
  }

  if (proofUploadZone && proofFileInput) {
    proofUploadZone.addEventListener('click', (e) => {
      if (e.target !== removeFileBtn && !e.target.closest('#removeFileBtn')) {
        proofFileInput.click();
      }
    });

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(evt => {
      proofUploadZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        proofUploadZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      proofUploadZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        proofUploadZone.classList.remove('dragover');
      });
    });

    proofUploadZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelected(files[0]);
      }
    });
  }

  if (proofFileInput) {
    proofFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelected(e.target.files[0]);
      }
    });
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetFilePreview();
      hideUploadFeedback();
    });
  }

  // ---------- Submit Payment Proof Action ----------
  if (submitProofBtn) {
    submitProofBtn.addEventListener('click', () => {
      if (!selectedProofFile) {
        showUploadFeedback('Please select a payment proof screenshot before submitting.', true);
        return;
      }

      // Show loading indicator
      submitProofBtn.disabled = true;
      if (submitSpinner) submitSpinner.style.display = 'inline-block';
      if (submitBtnText) submitBtnText.textContent = 'Submitting Proof...';

      // Generate unique Booking ID
      const bookingRandom = Math.floor(1000 + Math.random() * 9000);
      const bookingId = `LSG-BK-${bookingRandom}`;

      const station = STATIONS[currentBooking.stationId] || STATIONS['battle-arena'];

      // Build reservation record with explicit status "Pending Verification"
      const reservationRecord = {
        bookingId: bookingId,
        stationId: currentBooking.stationId,
        stationName: station.name,
        date: currentBooking.date,
        slot: currentBooking.slot,
        duration: `${currentBooking.duration} Hour(s)`,
        totalAmount: `₹${currentBooking.totalAmount}`,
        paymentMethod: 'UPI',
        customer: {
          name: currentBooking.customerName,
          phone: currentBooking.customerPhone,
          email: currentBooking.customerEmail,
          discord: currentBooking.customerDiscord || 'N/A'
        },
        paymentStatus: 'Pending Verification',
        proof: {
          fileName: selectedProofFile.name,
          fileSize: selectedProofFile.size,
          fileType: selectedProofFile.type,
          dataUrl: selectedProofDataUrl || 'images/payment-scanner.png',
          uploadedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      };

      // 1. Persist to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('lsg_reservations') || '[]');
        stored.unshift(reservationRecord);
        localStorage.setItem('lsg_reservations', JSON.stringify(stored));
      } catch (err) {
        console.warn('Could not persist reservation to localStorage:', err);
      }

      // 2. Broadcast live event to open admin tabs
      try {
        const syncChannel = new BroadcastChannel('lsg_live_sync');
        syncChannel.postMessage({ type: 'NEW_BOOKING', booking: reservationRecord });
      } catch (e) {}

      // 3. Post to backend live server API
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationRecord)
      }).catch(() => {
        // Fallback gracefully on static setup
      });

      // 4. Store in Firebase Cloud Firestore
      try {
        if (window.LSG_Firebase && window.LSG_Firebase.isReady()) {
          window.LSG_Firebase.saveBooking(reservationRecord);
        }
      } catch (fbErr) {}

      // Simulate smooth upload & verification submission
      setTimeout(() => {
        // Reset button state
        submitProofBtn.disabled = false;
        if (submitSpinner) submitSpinner.style.display = 'none';
        if (submitBtnText) submitBtnText.textContent = 'Submit Payment Proof';

        // Update View 3 Details
        if (receiptBookingId) receiptBookingId.textContent = bookingId;
        if (receiptStation) receiptStation.textContent = station.name;
        if (receiptDateSlot) receiptDateSlot.textContent = `${currentBooking.date}, ${currentBooking.slot}`;
        if (receiptAmount) receiptAmount.textContent = `₹${currentBooking.totalAmount}`;
        if (receiptMethod) {
          receiptMethod.textContent = '📱 UPI / Online';
          receiptMethod.style.color = 'var(--accent-cyan)';
        }
        if (receiptCustomer) receiptCustomer.textContent = currentBooking.customerName;

        // Switch to View 3
        switchModalStep(3);

        // Start watching for live admin approval/rejection for THIS booking
        startCustomerLiveWatcher(bookingId);
      }, 1000);
    });
  }

  // Handle Cash Reservation Confirmation
  if (confirmCashBtn) {
    confirmCashBtn.addEventListener('click', () => {
      confirmCashBtn.disabled = true;
      if (cashSpinner) cashSpinner.style.display = 'inline-block';
      if (cashBtnText) cashBtnText.textContent = 'Confirming Reservation...';

      const bookingRandom = Math.floor(1000 + Math.random() * 9000);
      const bookingId = `LSG-BK-${bookingRandom}`;
      const station = STATIONS[currentBooking.stationId] || STATIONS['battle-arena'];

      const reservationRecord = {
        bookingId: bookingId,
        stationId: currentBooking.stationId,
        stationName: station.name,
        date: currentBooking.date,
        slot: currentBooking.slot,
        duration: `${currentBooking.duration} Hour(s)`,
        totalAmount: `₹${currentBooking.totalAmount}`,
        paymentMethod: 'Cash',
        customer: {
          name: currentBooking.customerName,
          phone: currentBooking.customerPhone,
          email: currentBooking.customerEmail,
          discord: currentBooking.customerDiscord || 'N/A'
        },
        paymentStatus: 'Cash on Arrival',
        proof: {
          fileName: 'Cash Payment at Counter',
          fileSize: 0,
          fileType: 'cash',
          dataUrl: null,
          note: 'Customer will pay physical cash at the front reception desk upon arrival',
          uploadedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      };

      // 1. Persist to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('lsg_reservations') || '[]');
        stored.unshift(reservationRecord);
        localStorage.setItem('lsg_reservations', JSON.stringify(stored));
      } catch (err) {}

      // 2. Broadcast live event to open admin tabs
      try {
        const syncChannel = new BroadcastChannel('lsg_live_sync');
        syncChannel.postMessage({ type: 'NEW_BOOKING', booking: reservationRecord });
      } catch (e) {}

      // 3. Post to backend live server API
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationRecord)
      }).catch(() => {});

      // 4. Store in Firebase Cloud Firestore
      try {
        if (window.LSG_Firebase && window.LSG_Firebase.isReady()) {
          window.LSG_Firebase.saveBooking(reservationRecord);
        }
      } catch (fbErr) {}

      setTimeout(() => {
        confirmCashBtn.disabled = false;
        if (cashSpinner) cashSpinner.style.display = 'none';
        if (cashBtnText) cashBtnText.textContent = 'Confirm Cash Reservation';

        // Update View 3 Details for Cash Booking
        if (receiptBookingId) receiptBookingId.textContent = bookingId;
        if (receiptStation) receiptStation.textContent = station.name;
        if (receiptDateSlot) receiptDateSlot.textContent = `${currentBooking.date}, ${currentBooking.slot}`;
        if (receiptAmount) receiptAmount.textContent = `₹${currentBooking.totalAmount}`;
        if (receiptMethod) {
          receiptMethod.textContent = '💵 Cash at Desk (Pay on Arrival)';
          receiptMethod.style.color = '#34d399';
        }
        if (receiptCustomer) receiptCustomer.textContent = currentBooking.customerName;
        if (receiptStatus) {
          receiptStatus.textContent = 'Cash on Arrival';
          receiptStatus.className = 'receipt-val text-amber';
          receiptStatus.style.color = 'var(--accent-gold)';
        }

        const customerStatusBadge = document.getElementById('customerStatusBadge');
        const customerStatusPillText = document.getElementById('customerStatusPillText');
        const customerStatusHeadline = document.getElementById('customerStatusHeadline');
        const customerStatusMessage = document.getElementById('customerStatusMessage');
        const customerStatusIcon = document.getElementById('customerStatusIcon');
        const customerPulsingRing = document.getElementById('customerPulsingRing');

        if (customerStatusBadge) {
          customerStatusBadge.style.background = 'rgba(245, 158, 11, 0.15)';
          customerStatusBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
          customerStatusBadge.style.color = 'var(--accent-gold)';
        }
        if (customerStatusPillText) customerStatusPillText.textContent = 'Cash on Arrival (Reserved)';
        if (customerStatusIcon) customerStatusIcon.textContent = '💵';
        if (customerPulsingRing) {
          customerPulsingRing.style.borderColor = 'var(--accent-gold)';
          customerPulsingRing.style.background = 'rgba(245, 158, 11, 0.2)';
        }
        if (customerStatusHeadline) customerStatusHeadline.textContent = '🎉 Cash Reservation Confirmed!';
        if (customerStatusMessage) {
          customerStatusMessage.textContent = `Your station rig is reserved! Please bring ₹${currentBooking.totalAmount} in cash to the reception desk when you arrive.`;
          customerStatusMessage.style.color = 'var(--text-secondary)';
        }

        // Switch to View 3
        switchModalStep(3);

        // Start watching for live admin verification
        startCustomerLiveWatcher(bookingId);
      }, 700);
    });
  }

  // Live Watcher on Customer Screen for Real-time Admin Approval
  function startCustomerLiveWatcher(myBookingId) {
    const handleStatusChange = (updatedBooking) => {
      if (!updatedBooking || updatedBooking.bookingId !== myBookingId) return;

      const customerStatusBadge = document.getElementById('customerStatusBadge');
      const customerStatusPillText = document.getElementById('customerStatusPillText');
      const customerStatusHeadline = document.getElementById('customerStatusHeadline');
      const customerStatusMessage = document.getElementById('customerStatusMessage');
      const customerStatusIcon = document.getElementById('customerStatusIcon');
      const customerPulsingRing = document.getElementById('customerPulsingRing');
      const receiptStatus = document.getElementById('receiptStatus');

      const status = (updatedBooking.paymentStatus || '').toLowerCase();

      if (status.includes('approved') || status.includes('verified')) {
        if (customerStatusBadge) {
          customerStatusBadge.style.background = 'rgba(6, 214, 160, 0.18)';
          customerStatusBadge.style.borderColor = 'rgba(6, 214, 160, 0.5)';
          customerStatusBadge.style.color = 'var(--accent-secondary)';
        }
        if (customerStatusPillText) customerStatusPillText.textContent = 'Verified & Confirmed';
        if (customerStatusIcon) customerStatusIcon.textContent = '✅';
        if (customerPulsingRing) {
          customerPulsingRing.style.borderColor = 'var(--accent-secondary)';
          customerPulsingRing.style.background = 'rgba(6, 214, 160, 0.2)';
        }
        const isCashBooking = (updatedBooking.paymentMethod || '').toLowerCase() === 'cash' || (updatedBooking.paymentStatus || '').toLowerCase().includes('cash');
        if (customerStatusHeadline) {
          customerStatusHeadline.textContent = isCashBooking ? '🎉 Cash Received & Verified!' : '🎉 Payment Verified & Confirmed!';
        }
        if (customerStatusMessage) {
          customerStatusMessage.textContent = isCashBooking ?
            'Your cash payment has been collected and verified by the admin. Your station rig is confirmed!' :
            'Your booking has been officially approved by the admin. Your station rig is reserved!';
          customerStatusMessage.style.color = '#79f2d0';
        }
        if (receiptStatus) {
          receiptStatus.textContent = 'Verified / Confirmed';
          receiptStatus.className = 'receipt-val';
          receiptStatus.style.color = 'var(--accent-secondary)';
        }

        // Play positive sound
        playChime(660);
      } else if (status.includes('rejected')) {
        if (customerStatusBadge) {
          customerStatusBadge.style.background = 'rgba(239, 68, 68, 0.18)';
          customerStatusBadge.style.borderColor = 'rgba(239, 68, 68, 0.5)';
          customerStatusBadge.style.color = '#fca5a5';
        }
        if (customerStatusPillText) customerStatusPillText.textContent = 'Payment Rejected';
        if (customerStatusIcon) customerStatusIcon.textContent = '❌';
        if (customerStatusHeadline) customerStatusHeadline.textContent = 'Payment Verification Rejected';
        if (customerStatusMessage) {
          customerStatusMessage.textContent = 'The admin could not verify this transaction. Please re-submit a clear screenshot or contact reception.';
          customerStatusMessage.style.color = '#fca5a5';
        }
        if (receiptStatus) {
          receiptStatus.textContent = 'Rejected';
          receiptStatus.className = 'receipt-val';
          receiptStatus.style.color = '#ef4444';
        }
      }
    };

    // 1. Listen via BroadcastChannel
    try {
      const syncChannel = new BroadcastChannel('lsg_live_sync');
      syncChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'BOOKING_UPDATED') {
          handleStatusChange(event.data.booking);
        }
      };
    } catch (e) {}

    // 2. Listen via Server-Sent Events
    try {
      const sse = new EventSource('/api/live-stream');
      sse.addEventListener('booking_updated', (e) => {
        try {
          const booking = JSON.parse(e.data);
          handleStatusChange(booking);
        } catch (err) {}
      });
    } catch (e) {}

    // 3. Fallback poll localStorage
    const pollInterval = setInterval(() => {
      try {
        const stored = JSON.parse(localStorage.getItem('lsg_reservations') || '[]');
        const found = stored.find(b => b.bookingId === myBookingId);
        if (found && found.paymentStatus !== 'Pending Verification') {
          handleStatusChange(found);
          clearInterval(pollInterval);
        }
      } catch (e) {}
    }, 2000);
  }

  // Web Audio chime helper (no external sound file needed)
  function playChime(freq = 580) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // Done Button Trigger
  if (finishBookingBtn) {
    finishBookingBtn.addEventListener('click', () => {
      closePaymentModal();
      resetFilePreview();
      hideUploadFeedback();

      // Reset customer form
      if (checkoutNameInput) checkoutNameInput.value = '';
      if (checkoutPhoneInput) checkoutPhoneInput.value = '';
      if (checkoutEmailInput) checkoutEmailInput.value = '';
      if (playerDiscordInput) playerDiscordInput.value = '';

      // Scroll to hero
      const hero = document.getElementById('hero');
      if (hero) hero.scrollIntoView({ behavior: 'smooth' });
    });
  }

});

