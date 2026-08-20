/* ===== SCRIPT.JS — AAROH PHYSIOTHERAPY & REHABILITATION ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ────────────────────────────────────────────────
  // 1. NAVBAR: Scroll effect + Hamburger menu
  // ────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  // ────────────────────────────────────────────────
  // 2. FADE-IN ANIMATIONS (Intersection Observer)
  // ────────────────────────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay based on sibling index
        const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
        let delay = 0;
        siblings.forEach((el, idx) => {
          if (el === entry.target) delay = idx * 100;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach(el => observer.observe(el));

  // ────────────────────────────────────────────────
  // 3. ANIMATED STAT COUNTERS
  // ────────────────────────────────────────────────
  const statNums = document.querySelectorAll('.stat-num');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsAnimated) {
      statsAnimated = true;
      statNums.forEach(el => animateCounter(el));
    }
  }, { threshold: 0.3 });

  if (statNums.length > 0) {
    statsObserver.observe(statNums[0].closest('.stats-grid'));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, 16);
  }

  // ────────────────────────────────────────────────
  // 4. TESTIMONIALS SLIDER
  // ────────────────────────────────────────────────
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (track) {
    const cards = track.querySelectorAll('.testimonial-card');
    let slidesPerView = getSlidesPerView();
    let currentIndex = 0;
    let autoSlideTimer;

    // Create dots
    const totalSlides = Math.ceil(cards.length / slidesPerView);
    createDots(totalSlides);

    function getSlidesPerView() {
      if (window.innerWidth <= 480) return 1;
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function createDots(count) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(index) {
      const maxIndex = Math.ceil(cards.length / slidesPerView) - 1;
      currentIndex = Math.max(0, Math.min(index, maxIndex));

      const cardWidth = cards[0].offsetWidth + 28; // 28px gap
      track.style.transform = `translateX(-${currentIndex * slidesPerView * cardWidth}px)`;

      dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function next() {
      const maxIndex = Math.ceil(cards.length / slidesPerView) - 1;
      goTo(currentIndex < maxIndex ? currentIndex + 1 : 0);
    }

    function prev() {
      const maxIndex = Math.ceil(cards.length / slidesPerView) - 1;
      goTo(currentIndex > 0 ? currentIndex - 1 : maxIndex);
    }

    prevBtn.addEventListener('click', () => { prev(); resetAutoSlide(); });
    nextBtn.addEventListener('click', () => { next(); resetAutoSlide(); });

    function startAutoSlide() {
      autoSlideTimer = setInterval(next, 4500);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideTimer);
      startAutoSlide();
    }

    startAutoSlide();

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newSPV = getSlidesPerView();
        if (newSPV !== slidesPerView) {
          slidesPerView = newSPV;
          currentIndex = 0;
          const newTotal = Math.ceil(cards.length / slidesPerView);
          createDots(newTotal);
          goTo(0);
        }
      }, 200);
    });

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        resetAutoSlide();
      }
    });
  }

  // ────────────────────────────────────────────────
  // 5. APPOINTMENT FORM
  // ────────────────────────────────────────────────
  const form = document.getElementById('appointmentForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitApptBtn');

  if (form) {
    // Set minimum date to today
    const dateInput = document.getElementById('prefDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    // Toggle Payment Details
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const paymentDetails = document.getElementById('paymentDetails');
    let lastSubmittedData = null;
    
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'Pay Now') {
          paymentDetails.style.display = 'flex';
        } else {
          paymentDetails.style.display = 'none';
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Check payment confirmation
      const paymentMethodRadio = document.querySelector('input[name="paymentMethod"]:checked');
      if (paymentMethodRadio && paymentMethodRadio.value === 'Pay Now') {
        const confirmCheck = document.getElementById('paymentConfirmCheck');
        if (!confirmCheck.checked) {
          alert('Please complete the payment and check the confirmation box to book your appointment.');
          confirmCheck.focus();
          return;
        }
      }

      // Gather form data
      const name = document.getElementById('patientName').value.trim();
      const phone = document.getElementById('patientPhone').value.trim();
      const email = document.getElementById('patientEmail').value.trim();
      const service = document.getElementById('serviceRequired').value;
      const doctor = document.getElementById('doctorRequired').value;
      const location = document.getElementById('patientLocation').value.trim();
      const date = document.getElementById('prefDate').value;
      const time = document.getElementById('prefTime').value;
      const msg = document.getElementById('message').value.trim();
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
      
      lastSubmittedData = { name, phone, email, service, doctor, location, date, time, paymentMethod, msg };

      // Format the WhatsApp message
      let waMessage = `🏥 *New Appointment Request*\n`;
      waMessage += `━━━━━━━━━━━━━━━━━━━\n`;
      waMessage += `👤 *Name:* ${name}\n`;
      waMessage += `📞 *Phone:* ${phone}\n`;
      if (email) waMessage += `📧 *Email:* ${email}\n`;
      waMessage += `💆 *Service:* ${service}\n`;
      waMessage += `👨‍⚕️ *Doctor:* ${doctor}\n`;
      waMessage += `📍 *Location:* ${location}\n`;
      waMessage += `📅 *Date:* ${date}\n`;
      waMessage += `⏰ *Time:* ${time}\n`;
      waMessage += `💳 *Payment:* ${paymentMethod}\n`;
      if (msg) waMessage += `📝 *Message:* ${msg}\n`;
      waMessage += `━━━━━━━━━━━━━━━━━━━\n`;
      waMessage += `Sent from Aaroh Physiotherapy Website`;

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      setTimeout(() => {
        // Open WhatsApp with the pre-filled message
        const waUrl = `https://wa.me/919026360072?text=${encodeURIComponent(waMessage)}`;
        window.open(waUrl, '_blank');

        submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
        formSuccess.classList.add('show');
        form.reset();
        paymentDetails.style.display = 'none';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Appointment Request';
          submitBtn.style.background = '';
        }, 3000);
      }, 800);
    });

    const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
    if (downloadReceiptBtn) {
      downloadReceiptBtn.addEventListener('click', () => {
        if (!lastSubmittedData) return;
        
        const receiptWindow = window.open('', '_blank');
        const d = lastSubmittedData;
        const receiptDate = new Date().toLocaleString();
        
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Booking Receipt - Aaroh Physiotherapy</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
              .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
              .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 20px; }
              .header h1 { color: #0d9488; margin: 0 0 10px 0; }
              .header p { margin: 0; color: #666; }
              .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .details-table th, .details-table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
              .details-table th { width: 40%; color: #555; font-weight: 600; }
              .amount-row { background: #f0fdf4; font-weight: bold; color: #065f46; }
              .footer { text-align: center; font-size: 0.9em; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
              .print-btn { display: block; width: 100%; padding: 15px; background: #0d9488; color: white; border: none; font-size: 16px; cursor: pointer; border-radius: 5px; margin-top: 20px; }
              @media print { .print-btn { display: none; } .receipt-container { box-shadow: none; border: none; padding: 0; } }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <h1>AAROH Physiotherapy & Rehabilitation Center</h1>
                <p>Provisional Booking Receipt</p>
                <p style="font-size: 0.85em; margin-top: 5px;">Generated on: ${receiptDate}</p>
              </div>
              <table class="details-table">
                <tr><th>Patient Name</th><td>${d.name}</td></tr>
                <tr><th>Phone Number</th><td>${d.phone}</td></tr>
                <tr><th>Service Requested</th><td>${d.service}</td></tr>
                <tr><th>Assigned Doctor</th><td>${d.doctor}</td></tr>
                <tr><th>Appointment Date</th><td>${d.date}</td></tr>
                <tr><th>Appointment Time</th><td>${d.time}</td></tr>
                <tr><th>Payment Method</th><td>${d.paymentMethod}</td></tr>
                <tr><th>Payment Status</th><td style="font-weight: bold; color: ${d.paymentMethod === 'Pay Now' ? '#10b981' : '#f59e0b'};">${d.paymentMethod === 'Pay Now' ? 'PAID' : 'PENDING'}</td></tr>
                <tr class="amount-row"><th>Consultation Fee</th><td>₹400</td></tr>
              </table>
              
              <div class="footer">
                <p><strong>Note:</strong> This is a provisional booking acknowledgement generated from the website. If you selected "Pay Now", your appointment will be confirmed upon payment realization via PhonePe/UPI.</p>
                <p>Clinic Address: Lucknow, Uttar Pradesh | Phone: +91 9026360072</p>
              </div>
              <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
          </html>
        `;
        
        receiptWindow.document.write(html);
        receiptWindow.document.close();
      });
    }
  }

  // ────────────────────────────────────────────────
  // 6. SCROLL TO TOP BUTTON
  // ────────────────────────────────────────────────
  const scrollTopBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ────────────────────────────────────────────────
  // 7. SMOOTH ACTIVE NAV LINK HIGHLIGHTING
  // ────────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksAll.forEach(link => {
          link.style.fontWeight = link.getAttribute('href') === `#${id}` ? '700' : '500';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => sectionObserver.observe(section));

  // ────────────────────────────────────────────────
  // 8. SERVICE CARD: Add subtle tilt on hover
  // ────────────────────────────────────────────────
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
      card.style.transform = `translateY(-8px) rotateX(${y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ────────────────────────────────────────────────
  // 9. HERO SCROLL HINT: Hide after scrolling
  // ────────────────────────────────────────────────
  const scrollHint = document.querySelector('.hero-scroll-hint');
  window.addEventListener('scroll', () => {
    if (scrollHint) {
      scrollHint.style.opacity = window.scrollY > 100 ? '0' : '1';
    }
  }, { passive: true });

  console.log('%c🏥 Aaroh Physiotherapy & Rehabilitation', 'color:#0d9488;font-size:16px;font-weight:bold;');
  console.log('%cWebsite loaded successfully.', 'color:#63f5be;');
});
