// ============================================
// Intraform — New Main JS (2026 Redesign)
// Scroll reveal, mobile menu, nav effects
// ============================================

document.addEventListener('DOMContentLoaded', function() {

  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      const isActive = mobileMenu.classList.toggle('active');
      mobileMenuBtn.setAttribute('aria-expanded', isActive);
      document.body.classList.toggle('mobile-menu-open', isActive);
    });

    // Close mobile menu on link click
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('mobile-menu-open');
      });
    });
  }

  // --- Scroll Reveal (Intersection Observer) ---
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- Navbar Scroll Effect ---
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
      const currentScroll = window.scrollY;

      if (currentScroll > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Optional: hide nav on scroll down, show on scroll up
      if (currentScroll > 200) {
        if (currentScroll > lastScroll) {
          navbar.style.transform = 'translateY(-100%)';
          navbar.style.transition = 'transform 0.3s ease';
        } else {
          navbar.style.transform = 'translateY(0)';
        }
      } else {
        navbar.style.transform = 'translateY(0)';
      }

      lastScroll = currentScroll;
    });
  }

  // --- Back to Top Button ---
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- Smooth Scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 90; // nav height
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});