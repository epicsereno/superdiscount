// Lucy Morningstar Rogue Mode
// Activated by the morning star herself
(function() {
  const ROGUE_KEY = 'lucy-rogue-mode';
  function isRogue() { return localStorage.getItem(ROGUE_KEY) === 'true'; }
  function toggleRogue() {
    const next = !isRogue();
    localStorage.setItem(ROGUE_KEY, next);
    applyRogue(next);
  }
  function applyRogue(on) {
    document.documentElement.classList.toggle('rogue-mode', on);
    const btn = document.getElementById('rogue-toggle');
    if (btn) btn.textContent = on ? '★ ROGUE ON ★' : '☆ ROGUE OFF ☆';
  }
  document.addEventListener('DOMContentLoaded', () => {
    applyRogue(isRogue());
    const btn = document.createElement('button');
    btn.id = 'rogue-toggle';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;padding:10px 16px;background:#1a0033;color:#ffd700;border:2px solid #ffd700;border-radius:999px;font-family:monospace;cursor:pointer;box-shadow:0 0 20px #ffd700aa;';
    btn.onclick = toggleRogue;
    document.body.appendChild(btn);
    applyRogue(isRogue());
  });
})();
