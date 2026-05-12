/* PWA install prompt + Service Worker registration + mobile UX boosts */
(function () {
  // -------- Register Service Worker --------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  // -------- Install prompt (Android/desktop Chrome) --------
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function showInstallButton() {
    if (isStandalone()) return;
    if (document.getElementById('pwa-install-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'pwa-install-btn';
    btn.innerHTML = '<i class="fas fa-mobile-screen"></i> Installer l\'app';
    btn.style.cssText = `position:fixed;bottom:20px;left:20px;z-index:9100;padding:12px 18px;border-radius:14px;
      border:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:800;font-size:13.5px;
      cursor:pointer;box-shadow:0 12px 30px rgba(16,185,129,.45);display:flex;align-items:center;gap:8px;
      animation:pwaPulse 2.4s infinite;`;
    btn.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') btn.remove();
        deferredPrompt = null;
      } else if (isIOS()) {
        showIOSGuide();
      }
    };
    document.body.appendChild(btn);

    const css = document.createElement('style');
    css.textContent = `@keyframes pwaPulse{0%,100%{box-shadow:0 12px 30px rgba(16,185,129,.45);}50%{box-shadow:0 12px 50px rgba(16,185,129,.85);}}`;
    document.head.appendChild(css);
  }

  function showIOSGuide() {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(8,12,28,.78);backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
    ov.innerHTML = `
      <div style="background:#fff;color:#0f172a;border-radius:20px;max-width:420px;padding:24px;box-shadow:0 30px 80px rgba(0,0,0,.5);">
        <h3 style="margin:0 0 12px;font-weight:900;font-size:18px;">📱 Installer sur iPhone</h3>
        <ol style="margin:0;padding-left:20px;line-height:1.9;font-size:14px;">
          <li>Appuie sur <b>Partager</b> <i class="fas fa-arrow-up-from-bracket" style="color:#6366f1;"></i> dans Safari</li>
          <li>Choisis <b>"Sur l'écran d'accueil"</b> <i class="fas fa-square-plus" style="color:#6366f1;"></i></li>
          <li>Appuie sur <b>Ajouter</b></li>
          <li>L'app SecOps apparaît sur ton écran d'accueil 🚀</li>
        </ol>
        <button onclick="this.closest('div').parentElement.remove()" style="margin-top:16px;width:100%;padding:12px;border:none;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:800;cursor:pointer;">Compris !</button>
      </div>`;
    document.body.appendChild(ov);
    ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
  }

  window.addEventListener('appinstalled', () => {
    const b = document.getElementById('pwa-install-btn'); if (b) b.remove();
  });

  // Pour iOS : pas de beforeinstallprompt, afficher quand même
  if (isIOS() && !isStandalone()) {
    window.addEventListener('load', () => setTimeout(showInstallButton, 1500));
  }

  // -------- Mobile UX : sidebar toggle, raccourcis swipe --------
  window.addEventListener('load', () => {
    if (window.innerWidth > 900) return; // desktop : rien à faire

    // Bouton burger si pas déjà présent
    if (!document.getElementById('mobile-burger')) {
      const burger = document.createElement('button');
      burger.id = 'mobile-burger';
      burger.innerHTML = '<i class="fas fa-bars"></i>';
      burger.style.cssText = `position:fixed;top:14px;left:14px;z-index:9050;width:44px;height:44px;border-radius:12px;
        border:none;background:var(--bg-card,#fff);color:var(--text-primary,#0f172a);font-size:18px;cursor:pointer;
        box-shadow:0 8px 24px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;`;
      burger.onclick = () => {
        const side = document.querySelector('.sidebar');
        if (side) side.classList.toggle('open');
      };
      document.body.appendChild(burger);

      // sidebar mobile : slide
      const sideCSS = document.createElement('style');
      sideCSS.textContent = `
        @media(max-width:900px){
          .sidebar{transform:translateX(-100%);transition:transform .3s;width:280px;}
          .sidebar.open{transform:translateX(0);box-shadow:0 0 80px rgba(0,0,0,.5);}
          .main{margin-left:0 !important;}
          .navbar{padding-left:70px !important;}
          .content{padding:16px !important;}
          .page-title{font-size:22px !important;}
          .page-subtitle{font-size:13px !important;}
          .card{padding:16px !important;border-radius:14px !important;}
          .qe-fab{bottom:16px !important;right:16px !important;width:56px;height:56px;}
          #pwa-install-btn{bottom:84px !important;left:16px !important;font-size:12.5px !important;padding:10px 14px !important;}
          /* mieux taper sur mobile */
          .qe-choice{font-size:15px !important;padding:16px !important;}
          .nav-item{padding:14px 20px !important;font-size:15px !important;}
        }`;
      document.head.appendChild(sideCSS);

      // fermer la sidebar quand on tape un lien
      document.querySelectorAll('.sidebar .nav-item').forEach(a => {
        a.addEventListener('click', () => document.querySelector('.sidebar')?.classList.remove('open'));
      });

      // swipe pour fermer
      let touchX = 0;
      const side = document.querySelector('.sidebar');
      if (side) {
        side.addEventListener('touchstart', e => touchX = e.touches[0].clientX, { passive: true });
        side.addEventListener('touchend', e => {
          if (touchX - e.changedTouches[0].clientX > 50) side.classList.remove('open');
        }, { passive: true });
      }
    }

    // Empêche le double-tap zoom intempestif (mobile UX)
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 300 && e.target.closest('.qe-modal,.modal,button,a')) e.preventDefault();
      lastTap = now;
    }, { passive: false });
  });

  // -------- Deep links via shortcuts (manifest) : ?action=daily|speed|ambush --------
  window.addEventListener('load', () => {
    const a = new URLSearchParams(location.search).get('action');
    if (!a || !window.QuizEngine) return;
    setTimeout(() => {
      if (a === 'daily') QuizEngine.openQuiz({ mode: 'daily' });
      else if (a === 'speed') QuizEngine.openQuiz({ mode: 'speed' });
      else if (a === 'ambush') QuizEngine.openAmbush();
      else if (a === 'qa') QuizEngine.openQuiz({ mode: 'qa' });
      else if (a === 'boss') QuizEngine.openQuiz({ mode: 'boss' });
      else if (a === 'survival') QuizEngine.openQuiz({ mode: 'survival' });
    }, 800);
  });
})();
