/* Super Discount El Sereno — main.js
   Vanilla, dependency-free. Everything below is progressive enhancement:
   the page is fully usable with JS disabled. */

(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  /* ---------- Mobile menu ---------- */
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

    // Close after choosing a section link
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    // Close on Escape, return focus to the button
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close when tapping outside the header
    doc.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !e.target.closest('.site-header')) {
        closeMenu();
      }
    });
  }

  /* ---------- Theme toggle (boot script in <head> sets the initial theme) ---------- */
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
      try { localStorage.setItem('sd-theme', next); } catch (e) { /* private mode */ }
      syncThemeUI();
    });
    syncThemeUI();
  }

  /* ---------- Map facade: load the Google Maps embed only on request ---------- */
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
