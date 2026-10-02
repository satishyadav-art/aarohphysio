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
  // 2. FADE-IN ANIMATIONS (GSAP ScrollTrigger)
  // ────────────────────────────────────────────────
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // Group elements by their parent container to stagger them nicely
    const containers = document.querySelectorAll('.container, .hero');
    
    containers.forEach(container => {
      const elements = container.querySelectorAll('.fade-in');
      if (elements.length > 0) {
        gsap.fromTo(elements, 
          { y: 60, autoAlpha: 0 },
          { 
            y: 0, 
            autoAlpha: 1, 
            duration: 1, 
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              once: true
            }
          }
        );
      }
    });

    // Animate section headers for a premium feel
    gsap.utils.toArray('.section-header').forEach(header => {
      gsap.fromTo(header.children, 
        { y: 30, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: header, start: 'top 90%', once: true }
        }
      );
    });
  }

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

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Appointment Request';
          submitBtn.style.background = '';
          formSuccess.classList.remove('show');
        }, 5000);
      }, 800);
    });
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

  // ────────────────────────────────────────────────
  // 10. EXPERTS CAROUSEL INTERACTION
  // ────────────────────────────────────────────────
  const expertData = [
    {
      name: "Dr. Shashi Prakesh Yadav",
      role: "Specialist Physiotherapist",
      specialization: "Spinal & Post-Surgical Care",
      experience: "9+ Years",
      qualification: "BPT, MPT",
      image: "shashi.jpg",
      bio: "Dr. Shashi specializes in advancing non-invasive spinal treatments and targeted post-surgical recovery regimens. He utilizes modern evidence-based practices to ensure pain-free living.",
      expertise: ["Spinal & Neck Pain", "Post-Surgery Rehab", "Cupping Therapy", "Manual Therapy"]
    },
    {
      name: "Dr. Swayamprabha Rajpoot",
      role: "Lead Physiotherapist",
      specialization: "Sports Injury & Pediatric Physiotherapy",
      experience: "8+ Years",
      qualification: "BPT, MPT",
      image: "swayamprabha.jpg",
      bio: "With a focus on athlete recovery and pediatric care, Dr. Swayamprabha helps individuals of all ages regain peak physical performance through dynamic and structured therapies.",
      expertise: ["Sports Rehabilitation", "Pediatric Care", "Knee & Joint Pain", "Electrotherapy"]
    },
    {
      name: "Dr. Belal Ahmed",
      role: "Senior Physiotherapist",
      specialization: "Neurological & Orthopedic Rehabilitation",
      experience: "10+ Years",
      qualification: "BPT, MPT",
      image: "belal.jpg",
      bio: "Dr. Belal brings over a decade of hands-on expertise in treating complex neurological conditions and aiding rapid recovery in orthopedic surgeries. His patient-first approach aims at complete functionality restoration.",
      expertise: ["Orthopedic Rehabilitation", "Stroke Recovery", "Spinal Cord Injuries", "Pain Management"]
    }
  ];

  function initExpertCarousel() {
    const track = document.getElementById('expertTrack');
    const panel = document.getElementById('expertInfoPanel');
    const counter = document.getElementById('expertCounter');
    if (!track || !panel) return;

    const total = expertData.length;
    let currentIndex = 0;
    let isAnimating = false;

    // Build slides
    track.innerHTML = expertData.map((exp, i) => `
      <div class="expert-slide" data-index="${i}" role="button" tabindex="0" aria-label="Select ${exp.name}">
        <div class="expert-slide-inner">
          <img src="${exp.image}" alt="${exp.name}" loading="lazy">
          <div class="expert-slide-name">${exp.name}</div>
        </div>
      </div>
    `).join('');

    const slides = Array.from(track.querySelectorAll('.expert-slide'));
    const angleStep = 360 / total;
    // radius scales with viewport
    function getRadius() {
      const w = track.parentElement.offsetWidth;
      return Math.min(Math.max(w * 0.28, 180), 320);
    }

    function positionSlides(animate = true) {
      const r = getRadius();
      slides.forEach((sl, i) => {
        const relAngle = ((i - currentIndex) * angleStep % 360 + 360) % 360;
        const rad = (relAngle * Math.PI) / 180;
        const x = Math.sin(rad) * r;
        const z = Math.cos(rad) * r - r;
        const scale = 0.55 + 0.45 * ((z + r) / (2 * r));
        const opacity = 0.25 + 0.75 * ((z + r) / (2 * r));
        const zIndex = Math.round((z + r) * 10);
        const isActive = i === currentIndex;

        sl.style.transition = animate ? 'transform 0.7s cubic-bezier(0.23,1,0.32,1), opacity 0.7s ease' : 'none';
        sl.style.transform = `translateX(${x}px) translateZ(${z}px) scale(${isActive ? 1.18 : scale})`;
        sl.style.opacity = isActive ? '1' : String(Math.max(opacity, 0.3));
        sl.style.zIndex = isActive ? 100 : zIndex;
        sl.classList.toggle('active', isActive);
      });
    }

    function renderPanel(index, dir = 1) {
      const exp = expertData[index];
      counter.textContent = `${String(index + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
      const outY = dir > 0 ? -24 : 24;
      gsap.to(panel, { opacity: 0, y: outY, duration: 0.25, ease: 'power2.in',
        onComplete: () => {
          panel.innerHTML = `
            <div class="ei-header">
              <div>
                <h3 class="ei-name">${exp.name}</h3>
                <div class="ei-role">${exp.role} &bull; ${exp.specialization}</div>
                <div class="ei-exp">${exp.experience} Experience &bull; ${exp.qualification}</div>
              </div>
              <div class="ei-actions">
                <a href="#appointment" class="btn btn-outline" style="color:var(--teal-primary);border-color:var(--teal-primary);padding:10px 24px;">Book Appointment</a>
              </div>
            </div>
            <div class="ei-body">
              <div class="ei-bio"><p>${exp.bio}</p></div>
              <div class="ei-specs">
                <h4>Specializes In:</h4>
                <ul>${exp.expertise.map(s => `<li>${s}</li>`).join('')}</ul>
              </div>
            </div>`;
          gsap.fromTo(panel, { opacity: 0, y: -outY }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        }
      });
    }

    function goTo(newIndex, dir = 1) {
      if (isAnimating) return;
      isAnimating = true;
      if (newIndex < 0) newIndex = total - 1;
      if (newIndex >= total) newIndex = 0;
      const prevIndex = currentIndex;
      currentIndex = newIndex;
      positionSlides(true);
      renderPanel(currentIndex, newIndex > prevIndex ? 1 : -1);
      setTimeout(() => { isAnimating = false; }, 750);
    }

    // Init
    positionSlides(false);
    renderPanel(0);
    counter.textContent = `01 / ${String(total).padStart(2,'0')}`;

    // Reposition on resize
    window.addEventListener('resize', () => positionSlides(false));

    // Buttons
    document.querySelector('.prev-expert')?.addEventListener('click', () => { goTo(currentIndex - 1, -1); resetAuto(); });
    document.querySelector('.next-expert')?.addEventListener('click', () => { goTo(currentIndex + 1, 1); resetAuto(); });

    // Click slide
    slides.forEach((sl, i) => {
      sl.addEventListener('click', () => { if (i !== currentIndex) { goTo(i, i > currentIndex ? 1 : -1); resetAuto(); } });
      sl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') sl.click(); });
    });

    // Drag / swipe
    let dragStartX = 0, dragging = false;
    const wrapper = document.querySelector('.experts-interactive-wrapper');

    wrapper.addEventListener('mousedown', e => { dragStartX = e.clientX; dragging = true; pauseAuto(); });
    window.addEventListener('mouseup', e => {
      if (!dragging) return;
      const d = dragStartX - e.clientX;
      if (Math.abs(d) > 40) goTo(d > 0 ? currentIndex + 1 : currentIndex - 1, d > 0 ? 1 : -1);
      dragging = false;
      resumeAuto();
    });
    wrapper.addEventListener('touchstart', e => { dragStartX = e.touches[0].clientX; pauseAuto(); }, { passive: true });
    wrapper.addEventListener('touchend', e => {
      const d = dragStartX - e.changedTouches[0].clientX;
      if (Math.abs(d) > 40) goTo(d > 0 ? currentIndex + 1 : currentIndex - 1, d > 0 ? 1 : -1);
      resumeAuto();
    });

    // Keyboard
    wrapper.setAttribute('tabindex', '0');
    wrapper.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') goTo(currentIndex + 1, 1);
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1, -1);
    });

    // Auto-play
    let autoTimer;
    function startAuto() { autoTimer = setInterval(() => goTo(currentIndex + 1, 1), 4500); }
    function pauseAuto() { clearInterval(autoTimer); }
    function resumeAuto() { pauseAuto(); startAuto(); }
    function resetAuto() { resumeAuto(); }

    wrapper.addEventListener('mouseenter', pauseAuto);
    wrapper.addEventListener('mouseleave', () => { if (!dragging) resumeAuto(); });

    // Start when visible
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) startAuto(); else pauseAuto();
    }, { threshold: 0.2 }).observe(wrapper);

    // prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      slides.forEach(sl => sl.style.transition = 'none');
    }
  }

  initExpertCarousel();

  console.log('%c🏥 Aaroh Physiotherapy & Rehabilitation', 'color:#0d9488;font-size:16px;font-weight:bold;');
  console.log('%cWebsite loaded successfully.', 'color:#63f5be;');
});
