// Page Navigation
function showPage(pageId, el) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Special: ISO/ISAE page (load HTML dynamically)
  if (pageId === 'iso-isae') {
    const target = document.getElementById('page-iso-isae');
    if (target && !target.dataset.loaded) {
      fetch('iso-isae.html')
        .then(r => r.text())
        .then(html => {
          // Extract only the .content div from iso-isae.html
          const temp = document.createElement('div');
          temp.innerHTML = html;
          let content = temp.querySelector('.content');
          target.innerHTML = '';
          if (content) target.appendChild(content.cloneNode(true));
          target.dataset.loaded = '1';
        });
    }
    if (target) target.classList.add('active');
  } else {
    // Show target page
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    // If STAR page, render notes
    if (pageId === 'star') {
      try { renderSTARNotes(); } catch (e) {}
    }
  }
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el && el.classList && el.classList.contains('nav-item')) {
    el.classList.add('active');
  } else {
    const match = Array.from(document.querySelectorAll('.nav-item')).find(n => {
      const on = n.getAttribute('onclick') || '';
      return on.includes("showPage('" + pageId + "'");
    });
    if (match) match.classList.add('active');
  }
  // Persist last visited page
  try { localStorage.setItem('active-page', pageId); } catch (e) {}
}
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
