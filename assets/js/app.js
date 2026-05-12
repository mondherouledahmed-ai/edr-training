// Theme Toggle
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  syncThemeIcons();
}

// Sync moon/sun icon on every theme toggle button
function syncThemeIcons() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  document.querySelectorAll('.icon-btn[onclick*="toggleTheme"] i').forEach(i => {
    i.classList.remove('fa-moon', 'fa-sun');
    i.classList.add(isLight ? 'fa-sun' : 'fa-moon');
  });
}

// Init theme — DEFAULT = LIGHT (modern). Falls back to user's saved preference.
(function() {
  try {
    const saved = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', saved || 'light');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  // Sync icons after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncThemeIcons);
  } else {
    syncThemeIcons();
  }
})();

// Modal helpers (shared)
function closeModal(event) {
  const overlay = document.getElementById('modal');
  if (!overlay) return;
  if (event && event.target !== event.currentTarget) return;
  overlay.style.display = 'none';
}

// Navbar active state
(function() {
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (!href) return;
    const same = href === path || (path === 'index.html' && href === 'dashboard.html');
    if (same) a.classList.add('active');
  });
})();

// Search focus shortcut
document.addEventListener('keydown', (e) => {
  const input = document.getElementById('search');
  if (e.key === '/' && input && document.activeElement !== input) {
    e.preventDefault();
    input.focus();
  }
  if (e.key === 'Escape') closeModal();
});
