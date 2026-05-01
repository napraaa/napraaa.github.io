// ===== FRANK BURGERS — Interactivity =====
document.addEventListener('DOMContentLoaded', () => {

  // --- WhatsApp number (replace with real number) ---
  const WA_NUMBER = '542645439494';

  // --- Sticky Header ---
  const header = document.querySelector('.header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile Menu ---
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll Reveal ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // --- WhatsApp Buttons ---
  document.querySelectorAll('[data-wa]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const msg = btn.getAttribute('data-wa') || 'Hola! Quiero hacer un pedido';
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Staggered reveal for grid items ---
  const staggerContainers = document.querySelectorAll('.menu-grid, .promos-grid, .classics-grid');
  staggerContainers.forEach(container => {
    const children = container.children;
    Array.from(children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.08}s`;
    });
  });

});
