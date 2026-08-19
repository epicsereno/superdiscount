/* Super Discount El Sereno — main.js
   Single-page application logic. Vanilla, dependency-free, high-performance. */

(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  /* ---------- Mobile menu & smooth nav ---------- */
  var toggle = doc.querySelector('[data-menu-toggle]');
  var nav = doc.querySelector('[data-nav]');

  if (toggle && nav) {
    var closeMenu = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    doc.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !e.target.closest('.site-header')) {
        closeMenu();
      }
    });
  }

  /* ---------- Theme toggle ---------- */
  var themeBtn = doc.querySelector('[data-theme-toggle]');
  var themeLabel = doc.querySelector('[data-theme-label]');

  var syncThemeUI = function () {
    var light = root.getAttribute('data-theme') === 'light';
    if (themeBtn) themeBtn.setAttribute('aria-pressed', String(light));
    if (themeLabel) themeLabel.textContent = light ? 'Dark mode' : 'Light mode';
  };

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('sd-theme', next); } catch (e) {}
      syncThemeUI();
    });
    syncThemeUI();
  }

  /* ---------- Store Live Status Badge (LA Timezone: 9:30 AM - 9:00 PM) ---------- */
  function updateStoreStatus() {
    var statusText = doc.getElementById('status-text');
    var statusDot = doc.getElementById('status-dot');
    var statusHours = doc.getElementById('status-hours');

    if (!statusText || !statusDot) return;

    try {
      var now = new Date();
      var la = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
      var mins = la.getHours() * 60 + la.getMinutes();
      var isOpen = (mins >= 570 && mins < 1260); // 9:30 (570) to 21:00 (1260)

      if (isOpen) {
        statusText.textContent = 'Open Now';
        statusDot.style.background = '#3FD07A';
        statusDot.style.boxShadow = '0 0 0 3px rgba(63,208,122,0.25)';
        if (statusHours) statusHours.textContent = '(Closes at 9 PM)';
      } else {
        statusText.textContent = 'Closed Now';
        statusDot.style.background = '#F60513';
        statusDot.style.boxShadow = '0 0 0 3px rgba(246,5,19,0.25)';
        if (statusHours) statusHours.textContent = '(Opens at 9:30 AM)';
      }
    } catch (e) {
      statusText.textContent = 'Open Daily';
    }
  }

  updateStoreStatus();
  setInterval(updateStoreStatus, 60000);

  /* ---------- Dynamic Catalog Loader & Filter ---------- */
  var catalogGrid = doc.getElementById('catalog-grid');
  var categoryChips = doc.getElementById('category-chips');
  var catalogData = null;
  var currentCategory = 'all';

  function renderCatalog(categoryFilter) {
    if (!catalogGrid || !catalogData) return;

    var categories = catalogData.categories || [];
    var allProducts = [];

    categories.forEach(function (cat) {
      if (categoryFilter === 'all' || cat.id === categoryFilter) {
        (cat.products || []).forEach(function (p) {
          allProducts.push({
            name: (p.name && (p.name.en || p.name.es)) || 'Product',
            desc: (p.desc && (p.desc.en || p.desc.es)) || '',
            note: p.note || cat.name.en || '',
            img: p.img,
            widths: p.widths,
            color: p.color || '#2A2A32'
          });
        });
      }
    });

    if (allProducts.length === 0) {
      catalogGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">No products found in this category.</div>';
      return;
    }

    catalogGrid.innerHTML = allProducts.map(function (item) {
      var mediaHTML = '';
      if (item.img && item.widths && item.widths.length) {
        var base = (catalogData.meta && catalogData.meta.images && catalogData.meta.images.path ? catalogData.meta.images.path : 'assets/catalog/') + item.img;
        var webpSrcset = item.widths.map(function (w) { return base + '-' + w + '.webp ' + w + 'w'; }).join(', ');
        var jpgSrcset = item.widths.map(function (w) { return base + '-' + w + '.jpg ' + w + 'w'; }).join(', ');
        var maxW = item.widths[item.widths.length - 1];

        mediaHTML = '<div class="media" style="position: relative; aspect-ratio: 4/3; background: var(--surface-2); overflow: hidden; border-radius: 6px 6px 0 0;">' +
          '<picture>' +
          '<source type="image/webp" srcset="' + webpSrcset + '" sizes="(min-width: 900px) 340px, 92vw">' +
          '<img src="' + base + '-' + maxW + '.jpg" srcset="' + jpgSrcset + '" sizes="(min-width: 900px) 340px, 92vw" loading="lazy" decoding="async" style="width:100%; height:100%; object-fit:cover;" alt="' + item.name + '">' +
          '</picture></div>';
      } else {
        mediaHTML = '<div class="media" style="aspect-ratio: 4/3; background: ' + item.color + '; border-radius: 6px 6px 0 0; position: relative; overflow: hidden;">' +
          '<div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.4));"></div></div>';
      }

      return '<article class="deal-card" style="display: flex; flex-direction: column; padding: 0; overflow: hidden;">' +
        mediaHTML +
        '<div style="padding: 1.25rem; display: flex; flex-direction: column; flex: 1; gap: 8px;">' +
        '<span class="deal-tag" style="align-self: flex-start;">' + item.note + '</span>' +
        '<h3 style="margin: 0; font-size: 1.2rem;">' + item.name + '</h3>' +
        '<p style="margin: 0; font-size: 0.9rem; color: var(--text-muted); flex: 1;">' + item.desc + '</p>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  // Fetch catalog JSON data
  fetch('data/catalog.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      catalogData = data;
      renderCatalog('all');
    })
    .catch(function () {
      if (catalogGrid) {
        catalogGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">Catalog available in-store at 3118 N Eastern Ave, Los Angeles.</div>';
      }
    });

  // Filter chips click handling
  if (categoryChips) {
    categoryChips.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;

      doc.querySelectorAll('#category-chips .chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');

      currentCategory = chip.getAttribute('data-cat') || 'all';
      renderCatalog(currentCategory);
    });
  }

  /* ---------- Party Equipment Rental Calculator ---------- */
  var chairsInput = doc.getElementById('chairs-count');
  var tablesInput = doc.getElementById('tables-count');
  var totalDisplay = doc.getElementById('estimated-total');

  function calculateTotal() {
    if (!chairsInput || !tablesInput || !totalDisplay) return;
    var chairs = parseInt(chairsInput.value, 10) || 0;
    var tables = parseInt(tablesInput.value, 10) || 0;
    var total = (chairs * 1.50) + (tables * 8.00);
    totalDisplay.textContent = '$' + total.toFixed(2);
  }

  if (chairsInput && tablesInput) {
    chairsInput.addEventListener('input', calculateTotal);
    tablesInput.addEventListener('input', calculateTotal);
    calculateTotal();
  }

  /* ---------- Map facade ---------- */
  var mapPanel = doc.querySelector('[data-map]');
  var mapBtn = doc.querySelector('[data-map-load]');

  if (mapPanel && mapBtn) {
    mapBtn.addEventListener('click', function () {
      var iframe = doc.createElement('iframe');
      iframe.src = mapPanel.getAttribute('data-map-src');
      iframe.title = 'Map to Super Discount at 3118 N Eastern Ave, Los Angeles';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.setAttribute('allowfullscreen', '');
      mapPanel.replaceChildren(iframe);
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = doc.querySelector('[data-header]');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Footer year ---------- */
  var year = doc.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
