// ===== FRANK BURGERS — Full Cart + Extras System =====
document.addEventListener('DOMContentLoaded', () => {
  const WA_NUMBER = '542645439494';
  const SHARE_URL = 'https://napraaa.github.io/';
  let cart = [];
  let pendingBurger = null; // temp storage for extras modal

  // --- Sticky Header ---
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

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
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObs.observe(el));

  // --- Staggered grid ---
  document.querySelectorAll('.menu-grid, .promos-grid, .classics-grid, .dips-grid, .bebidas-grid').forEach(c => {
    Array.from(c.children).forEach((ch, i) => { ch.style.transitionDelay = `${i * 0.1}s`; });
  });

  // --- WhatsApp links (non-cart) ---
  document.querySelectorAll('[data-wa]').forEach(btn => {
    if (btn.closest('.burger-card') || btn.closest('.classic-card') || btn.closest('.dip-card') || btn.closest('.bebida-card')) return;
    btn.addEventListener('click', e => {
      e.preventDefault();
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(btn.getAttribute('data-wa'))}`, '_blank');
    });
  });

  // --- Smooth scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // --- Share button ---
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try { await navigator.share({ title: 'Frank Burgers', text: 'Las mejores burgers!', url: SHARE_URL }); } catch {}
      } else {
        await navigator.clipboard.writeText(SHARE_URL);
        showToast('🔗 Link copiado!');
      }
    });
  }

  // --- Parallax ---
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight) heroBg.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
    }, { passive: true });
  }

  // --- Tilt effect ---
  document.querySelectorAll('.burger-card, .classic-card, .promo-card, .dip-card, .bebida-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // --- Price counter animation ---
  const priceObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animatePrice(e.target); priceObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.promo-price').forEach(el => priceObs.observe(el));
  function animatePrice(el) {
    const m = el.textContent.match(/\$[\d.]+/);
    if (!m) return;
    const target = parseInt(m[0].replace(/[$.,]/g, ''));
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / 1200, 1);
      el.textContent = '$' + Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString('es-AR');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ===== QTY CONTROLS (global) =====
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = btn.parentElement.querySelector('.qty-value');
      let v = parseInt(el.textContent);
      if (btn.dataset.action === 'plus') v++;
      if (btn.dataset.action === 'minus' && v > 1) v--;
      el.textContent = v;
    });
  });

  // ===== EXTRAS MODAL =====
  const extrasOverlay = document.getElementById('extrasOverlay');
  const extrasModal = document.getElementById('extrasModal');
  const extrasClose = document.getElementById('extrasClose');
  const extrasTitle = document.getElementById('extrasTitle');
  const extrasNotes = document.getElementById('extrasNotes');
  const extrasConfirm = document.getElementById('extrasConfirm');

  function openExtras(data) {
    pendingBurger = data;
    extrasTitle.textContent = `🍔 ${data.name} (${data.size})`;
    extrasModal.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
    extrasModal.querySelector('input[value="Liso"]').checked = true;
    extrasNotes.value = '';
    extrasOverlay.classList.add('active');
    extrasModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeExtras() {
    extrasOverlay.classList.remove('active');
    extrasModal.classList.remove('active');
    document.body.style.overflow = '';
    pendingBurger = null;
  }
  extrasClose.addEventListener('click', closeExtras);
  extrasOverlay.addEventListener('click', closeExtras);

  // Limit checkboxes to 4
  extrasModal.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = extrasModal.querySelectorAll('input[type=checkbox]:checked').length;
      extrasModal.querySelectorAll('input[type=checkbox]:not(:checked)').forEach(u => u.disabled = checked >= 4);
      extrasModal.querySelector('.extras-group:first-child h4 small').textContent = `(${checked}/4)`;
    });
  });
  extrasModal.querySelectorAll('input[type=radio]').forEach(r => {
    r.addEventListener('change', () => {
      extrasModal.querySelector('.extras-group:nth-child(2) h4 small').textContent = '(1/1)';
    });
  });

  extrasConfirm.addEventListener('click', () => {
    if (!pendingBurger) return;
    const extras = [];
    let extrasTotal = 0;
    extrasModal.querySelectorAll('input[type=checkbox]:checked').forEach(cb => {
      extras.push(cb.value);
      extrasTotal += parseInt(cb.dataset.price);
    });
    const bread = extrasModal.querySelector('input[name=bread]:checked')?.value || 'Liso';
    const notes = extrasNotes.value.trim();

    cart.push({
      name: pendingBurger.name, size: pendingBurger.size, qty: pendingBurger.qty,
      unitPrice: pendingBurger.unitPrice, extras, extrasTotal, bread, notes,
      total: (pendingBurger.unitPrice + extrasTotal) * pendingBurger.qty
    });
    updateCartUI();
    showToast(`${pendingBurger.qty}x ${pendingBurger.name} agregada!`);
    closeExtras();
  });

  // ===== ADD TO CART — BURGERS (opens extras modal) =====
  document.querySelectorAll('.burger-card .btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.burger-card');
      const name = card.dataset.name;
      const size = card.querySelector('.size-select').value;
      const qty = parseInt(card.querySelector('.qty-value').textContent);
      const unitPrice = parseInt(card.getAttribute(`data-price-${size}`));
      card.querySelector('.qty-value').textContent = '1';
      card.querySelector('.size-select').selectedIndex = 0;
      openExtras({ name, size, qty, unitPrice });
    });
  });

  // ===== ADD TO CART — CLASSICS (pachata/lomo) =====
  document.querySelectorAll('.btn-add-classic').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.classic-card');
      const name = card.dataset.name;
      const qty = parseInt(card.querySelector('.qty-value').textContent);
      const unitPrice = parseInt(card.dataset.price);
      const notes = card.querySelector('.notes-input')?.value.trim() || '';
      cart.push({ name, size: 'única', qty, unitPrice, extras: [], extrasTotal: 0, bread: '', notes, total: unitPrice * qty });
      card.querySelector('.qty-value').textContent = '1';
      if (card.querySelector('.notes-input')) card.querySelector('.notes-input').value = '';
      updateCartUI();
      showToast(`${qty}x ${name} agregada!`);
      animateBtn(btn);
    });
  });

  // ===== ADD TO CART — DIPS =====
  document.querySelectorAll('.btn-add-dip').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.dip-card');
      const name = card.dataset.name;
      const qty = parseInt(card.querySelector('.qty-value').textContent);
      const unitPrice = parseInt(card.dataset.price);
      cart.push({ name, size: '', qty, unitPrice, extras: [], extrasTotal: 0, bread: '', notes: '', total: unitPrice * qty });
      card.querySelector('.qty-value').textContent = '1';
      updateCartUI();
      showToast(`${qty}x ${name} agregado!`);
      animateBtn(btn);
    });
  });

  // ===== ADD TO CART — BEBIDAS =====
  document.querySelectorAll('.btn-add-bebida').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.bebida-card');
      const name = card.dataset.name;
      const qty = parseInt(card.querySelector('.qty-value').textContent);
      const unitPrice = parseInt(card.dataset.price);
      cart.push({ name, size: '', qty, unitPrice, extras: [], extrasTotal: 0, bread: '', notes: '', total: unitPrice * qty });
      card.querySelector('.qty-value').textContent = '1';
      updateCartUI();
      showToast(`${qty}x ${name} agregada!`);
      animateBtn(btn);
    });
  });

  function animateBtn(btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Agregado';
    btn.style.background = '#25D366';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1200);
  }

  // ===== CART MODAL =====
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

  function openCart() { cartOverlay.classList.add('active'); cartModal.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeCart() { cartOverlay.classList.remove('active'); cartModal.classList.remove('active'); document.body.style.overflow = ''; }
  cartFloatBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function updateCartUI() {
    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
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
      let detail = item.size ? `${item.size.charAt(0).toUpperCase() + item.size.slice(1)} × ${item.qty}` : `× ${item.qty}`;
      if (item.extras.length) detail += ` + ${item.extras.join(', ')}`;
      if (item.bread) detail += ` | Pan: ${item.bread}`;
      if (item.notes) detail += ` | "${item.notes}"`;
      html += `<div class="cart-item">
        <div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-detail">${detail}</div></div>
        <div class="cart-item-price">$${item.total.toLocaleString('es-AR')}</div>
        <button class="cart-item-remove" data-index="${i}">✕</button></div>`;
    });
    cartItemsEl.innerHTML = html;
    cartTotalEl.textContent = '$' + cart.reduce((s, i) => s + i.total, 0).toLocaleString('es-AR');
    cartItemsEl.querySelectorAll('.cart-item-remove').forEach(b => {
      b.addEventListener('click', () => { cart.splice(parseInt(b.dataset.index), 1); updateCartUI(); });
    });
  }

  cartClearBtn.addEventListener('click', () => { cart = []; updateCartUI(); });

  cartSendBtn.addEventListener('click', () => {
    if (!cart.length) return;
    let msg = 'Hola! Quiero hacer un pedido:\n\n';
    cart.forEach(item => {
      msg += `• ${item.qty}x ${item.name}`;
      if (item.size && item.size !== 'única') msg += ` (${item.size})`;
      msg += ` — $${item.total.toLocaleString('es-AR')}`;
      if (item.extras.length) msg += `\n  Extras: ${item.extras.join(', ')}`;
      if (item.bread) msg += `\n  Pan: ${item.bread}`;
      if (item.notes) msg += `\n  Nota: ${item.notes}`;
      msg += '\n';
    });
    msg += `\nTotal: $${cart.reduce((s, i) => s + i.total, 0).toLocaleString('es-AR')}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  // --- Toast ---
  function showToast(text) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  updateCartUI();
});
