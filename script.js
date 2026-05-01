// ===== FRANK BURGERS — Interactivity + Animations + Cart System =====
document.addEventListener('DOMContentLoaded', () => {

  const WA_NUMBER = '542645439494';
  let cart = [];

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

  // --- Scroll Reveal (supports multiple classes) ---
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const revealElements = document.querySelectorAll(revealSelectors);
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // --- Staggered reveal for grid items ---
  document.querySelectorAll('.menu-grid, .promos-grid, .classics-grid').forEach(container => {
    Array.from(container.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  // --- WhatsApp Buttons (only for [data-wa] that are NOT inside burger cards) ---
  document.querySelectorAll('[data-wa]').forEach(btn => {
    if (btn.closest('.burger-card')) return; // skip burger card buttons
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const msg = btn.getAttribute('data-wa') || 'Hola! Quiero hacer un pedido';
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  });

  // --- Smooth scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Parallax on hero video ---
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      if (scroll < window.innerHeight) {
        heroBg.style.transform = `translateY(${scroll * 0.3}px) scale(1.1)`;
      }
    }, { passive: true });
  }

  // --- Tilt effect on cards ---
  document.querySelectorAll('.burger-card, .classic-card, .promo-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // --- Counter animation for prices on promo cards ---
  const animatePrice = (el) => {
    const text = el.textContent;
    const match = text.match(/\$[\d.]+/);
    if (!match) return;
    const target = parseInt(match[0].replace(/[$.,]/g, ''));
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * eased);
      el.textContent = '$' + current.toLocaleString('es-AR');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const priceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animatePrice(entry.target);
        priceObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.promo-price').forEach(el => priceObserver.observe(el));

  // =============================================
  // ===== CART SYSTEM =====
  // =============================================

  const cartFloatBtn = document.getElementById('cartFloatBtn');
  const cartBadge = document.getElementById('cartBadge');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartModal = document.getElementById('cartModal');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartSendBtn = document.getElementById('cartSend');
  const cartClearBtn = document.getElementById('cartClear');

  // --- Qty Controls on cards ---
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qtyEl = btn.parentElement.querySelector('.qty-value');
      let val = parseInt(qtyEl.textContent);
      if (btn.dataset.action === 'plus') val++;
      if (btn.dataset.action === 'minus' && val > 1) val--;
      qtyEl.textContent = val;
    });
  });

  // --- Add to Cart ---
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.burger-card');
      const name = card.dataset.name;
      const sizeSelect = card.querySelector('.size-select');
      const size = sizeSelect.value;
      const qty = parseInt(card.querySelector('.qty-value').textContent);
      const priceKey = `data-price-${size}`;
      const unitPrice = parseInt(card.getAttribute(priceKey));

      cart.push({ name, size, qty, unitPrice, total: unitPrice * qty });

      // Reset qty
      card.querySelector('.qty-value').textContent = '1';
      sizeSelect.selectedIndex = 0;

      updateCartUI();
      showToast(`${qty}x ${name} (${size}) agregada!`);

      // Button animation
      btn.textContent = '✓ Agregado';
      btn.style.background = '#25D366';
      setTimeout(() => {
        btn.textContent = '🛒 Agregar';
        btn.style.background = '';
      }, 1200);
    });
  });

  // --- Open/Close Cart ---
  function openCart() {
    cartOverlay.classList.add('active');
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartOverlay.classList.remove('active');
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  cartFloatBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // --- Update Cart UI ---
  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartBadge.textContent = totalItems;
    cartBadge.classList.toggle('hidden', totalItems === 0);

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
      cartFooter.style.display = 'none';
      return;
    }

    cartFooter.style.display = '';
    let html = '';
    cart.forEach((item, i) => {
      html += `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-detail">${item.size.charAt(0).toUpperCase() + item.size.slice(1)} × ${item.qty}</div>
          </div>
          <div class="cart-item-price">$${item.total.toLocaleString('es-AR')}</div>
          <button class="cart-item-remove" data-index="${i}" title="Eliminar">✕</button>
        </div>`;
    });
    cartItemsEl.innerHTML = html;

    const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);
    cartTotalEl.textContent = '$' + grandTotal.toLocaleString('es-AR');

    // Remove buttons
    cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        cart.splice(parseInt(btn.dataset.index), 1);
        updateCartUI();
      });
    });
  }

  // --- Clear Cart ---
  cartClearBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
  });

  // --- Send to WhatsApp ---
  cartSendBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    let msg = 'Hola! Quiero hacer un pedido:\n\n';
    cart.forEach(item => {
      msg += `• ${item.qty}x ${item.name} (${item.size}) — $${item.total.toLocaleString('es-AR')}\n`;
    });
    const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);
    msg += `\nTotal: $${grandTotal.toLocaleString('es-AR')}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  // --- Toast ---
  function showToast(text) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // Init badge
  updateCartUI();

});
