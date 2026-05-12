/* =====================================================================
 *  SecOps Academy — Quiz Engine + Ambush Popup + Gamification
 *  Dépendances : assets/js/quiz-data.js (window.QUIZ_BANK)
 *
 *  API publique :
 *    QuizEngine.openAmbush()        // déclenche un pop-up surprise immédiat
 *    QuizEngine.scheduleAmbush()    // planifie le prochain pop-up
 *    QuizEngine.openQuiz(opts)      // ouvre un quiz (mode='qcm'|'speed'|'survival'|'boss'|'daily')
 *    QuizEngine.openFlashcards()    // ouvre le mode flashcards
 *    QuizEngine.openMatch()         // ouvre le memory/match
 *    QuizEngine.getStats()          // stats persistées
 *    QuizEngine.toggleAmbush(bool)  // active/désactive ambushs
 * ===================================================================== */
(function () {
  if (window.QuizEngine) return; // déjà chargé

  // -------- localStorage helpers --------
  const LS = {
    get(k, def) {
      try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); }
      catch (e) { return def; }
    },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  const STATS_KEY = 'qe.stats.v1';
  const AMBUSH_KEY = 'qe.ambush.enabled';
  const AMBUSH_TS_KEY = 'qe.ambush.lastTs';
  const DAILY_KEY = 'qe.daily.v1';
  const D_DAY = new Date('2026-06-20T00:00:00'); // J-39 par défaut depuis 2026-05-12

  function todayStr() { const d = new Date(); return d.toISOString().slice(0,10); }

  function defaultStats() {
    return {
      xp: 0, level: 1,
      total: 0, correct: 0,
      bestSpeed: 0, bestSurvival: 0,
      streakDays: 0, lastDay: null,
      perTopic: {},     // { topic: {total, correct} }
      badges: []
    };
  }

  function getStats() { return Object.assign(defaultStats(), LS.get(STATS_KEY, {})); }
  function setStats(s) { LS.set(STATS_KEY, s); }

  function levelFromXp(xp) { return 1 + Math.floor(Math.sqrt(xp / 25)); } // courbe douce
  function xpForLevel(lvl) { return 25 * (lvl - 1) * (lvl - 1); }

  function addXp(amount, meta = {}) {
    const s = getStats();
    const oldLvl = s.level;
    s.xp += amount;
    s.level = levelFromXp(s.xp);

    // streak journalier
    const today = todayStr();
    if (s.lastDay !== today) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      s.streakDays = (s.lastDay === yesterday.toISOString().slice(0,10)) ? s.streakDays + 1 : 1;
      s.lastDay = today;
    }

    // par topic
    if (meta.topic) {
      const t = s.perTopic[meta.topic] || { total: 0, correct: 0 };
      t.total += 1; if (meta.correct) t.correct += 1;
      s.perTopic[meta.topic] = t;
    }
    s.total += 1; if (meta.correct) s.correct += 1;
    if (meta.speedScore && meta.speedScore > s.bestSpeed) s.bestSpeed = meta.speedScore;
    if (meta.survivalScore && meta.survivalScore > s.bestSurvival) s.bestSurvival = meta.survivalScore;

    // badges
    const badges = new Set(s.badges);
    if (s.correct >= 1) badges.add('first-blood');
    if (s.streakDays >= 3) badges.add('hot-streak-3');
    if (s.streakDays >= 7) badges.add('hot-streak-7');
    if (s.level >= 5) badges.add('analyst');
    if (s.level >= 10) badges.add('hunter');
    if (s.level >= 20) badges.add('boss-slayer');
    if (s.bestSpeed >= 10) badges.add('lightning');
    if (s.bestSurvival >= 15) badges.add('survivor');
    s.badges = [...badges];
    setStats(s);

    if (s.level > oldLvl) toast(`🎉 Niveau ${s.level} atteint !`, 'success');
    return s;
  }

  // -------- Toast --------
  function toast(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = 'qe-toast qe-toast-' + type;
    div.textContent = msg;
    document.body.appendChild(div);
    requestAnimationFrame(() => div.classList.add('show'));
    setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 300); }, 2800);
  }

  // -------- CSS injection --------
  function injectCSS() {
    if (document.getElementById('qe-style')) return;
    const style = document.createElement('style');
    style.id = 'qe-style';
    style.textContent = `
      .qe-overlay{position:fixed;inset:0;background:rgba(8,12,28,.78);backdrop-filter:blur(14px);
        z-index:99998;display:none;align-items:center;justify-content:center;padding:20px;
        animation:qeFadeIn .25s ease-out;}
      .qe-overlay.open{display:flex;}
      .qe-modal{width:min(720px,96vw);max-height:94vh;overflow-y:auto;background:var(--bg-card,#fff);
        color:var(--text-primary,#0f172a);border-radius:24px;border:1px solid var(--border,#e2e8f0);
        box-shadow:0 30px 80px rgba(0,0,0,.45);position:relative;
        animation:qePop .35s cubic-bezier(.22,1.4,.36,1);}
      .qe-modal::before{content:'';position:absolute;inset:0 0 auto 0;height:5px;border-radius:24px 24px 0 0;
        background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);}
      @keyframes qeFadeIn{from{opacity:0}to{opacity:1}}
      @keyframes qePop{from{transform:scale(.85) translateY(20px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
      .qe-head{display:flex;align-items:center;gap:14px;padding:22px 26px 10px;}
      .qe-head .qe-ico{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:22px;flex-shrink:0;
        box-shadow:0 10px 24px rgba(99,102,241,.45);}
      .qe-head .qe-ttl{font-size:18px;font-weight:800;margin:0;}
      .qe-head .qe-sub{font-size:12px;color:var(--text-secondary,#64748b);margin-top:2px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;}
      .qe-head .qe-x{margin-left:auto;background:transparent;border:none;color:var(--text-secondary,#64748b);font-size:22px;cursor:pointer;width:36px;height:36px;border-radius:10px;}
      .qe-head .qe-x:hover{background:rgba(0,0,0,.06);}
      .qe-body{padding:8px 26px 24px;}
      .qe-q{font-size:17px;font-weight:700;line-height:1.45;margin:14px 0 18px;}
      .qe-choice{display:block;width:100%;text-align:left;padding:14px 16px;margin:8px 0;border-radius:14px;
        border:1.5px solid var(--border,#e2e8f0);background:var(--bg-card,#fff);color:var(--text-primary,#0f172a);
        font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;line-height:1.4;}
      .qe-choice:hover{border-color:#8b5cf6;background:rgba(139,92,246,.06);transform:translateY(-1px);}
      .qe-choice.ok{border-color:#10b981;background:rgba(16,185,129,.12);color:#065f46;}
      .qe-choice.ko{border-color:#ef4444;background:rgba(239,68,68,.10);color:#7f1d1d;}
      .qe-choice:disabled{cursor:default;}
      .qe-explain{margin-top:14px;padding:14px 16px;border-radius:12px;background:rgba(99,102,241,.08);
        border-left:4px solid #6366f1;font-size:13.5px;line-height:1.55;}
      .qe-explain b{color:#6366f1;}
      .qe-meta{display:flex;gap:10px;flex-wrap:wrap;align-items:center;font-size:12px;font-weight:700;color:var(--text-secondary,#64748b);}
      .qe-pill{padding:4px 10px;border-radius:999px;background:rgba(99,102,241,.1);color:#6366f1;}
      .qe-pill.warn{background:rgba(245,158,11,.12);color:#b45309;}
      .qe-pill.dng{background:rgba(239,68,68,.12);color:#b91c1c;}
      .qe-pill.ok{background:rgba(16,185,129,.12);color:#047857;}
      .qe-bar{height:6px;background:rgba(99,102,241,.15);border-radius:999px;overflow:hidden;margin:10px 0 14px;}
      .qe-bar > div{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);transition:width .3s;}
      .qe-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;}
      .qe-btn{padding:10px 18px;border-radius:12px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
        font-weight:700;cursor:pointer;font-size:13.5px;transition:all .2s;display:inline-flex;gap:8px;align-items:center;}
      .qe-btn:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(99,102,241,.4);}
      .qe-btn.ghost{background:transparent;color:var(--text-primary,#0f172a);border:1.5px solid var(--border,#e2e8f0);}
      .qe-btn.ghost:hover{background:rgba(99,102,241,.08);}
      .qe-timer{font-variant-numeric:tabular-nums;font-weight:800;font-size:16px;padding:6px 12px;border-radius:10px;background:rgba(239,68,68,.1);color:#dc2626;}
      .qe-timer.calm{background:rgba(16,185,129,.1);color:#047857;}
      .qe-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);
        background:#0f172a;color:#fff;padding:12px 20px;border-radius:12px;font-weight:600;font-size:14px;
        z-index:99999;box-shadow:0 20px 50px rgba(0,0,0,.4);opacity:0;transition:all .3s;}
      .qe-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
      .qe-toast-success{background:linear-gradient(135deg,#10b981,#059669);}
      .qe-toast-error{background:linear-gradient(135deg,#ef4444,#dc2626);}
      .qe-toast-info{background:linear-gradient(135deg,#6366f1,#8b5cf6);}

      /* Floating button */
      .qe-fab{position:fixed;bottom:20px;right:20px;z-index:9000;
        width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#ef4444,#f59e0b);
        color:#fff;font-size:24px;border:none;cursor:pointer;
        box-shadow:0 12px 30px rgba(239,68,68,.45);
        display:flex;align-items:center;justify-content:center;
        transition:all .3s;animation:qePulse 2.4s infinite;}
      .qe-fab:hover{transform:scale(1.1) rotate(-8deg);}
      @keyframes qePulse{0%,100%{box-shadow:0 12px 30px rgba(239,68,68,.45);}50%{box-shadow:0 12px 50px rgba(239,68,68,.85);}}
      .qe-fab-menu{position:fixed;bottom:90px;right:20px;z-index:9000;display:none;flex-direction:column;gap:8px;
        background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:8px;
        box-shadow:0 20px 50px rgba(0,0,0,.25);min-width:220px;animation:qePop .25s ease-out;}
      .qe-fab-menu.open{display:flex;}
      .qe-fab-menu button{padding:10px 14px;border-radius:10px;border:none;background:transparent;color:var(--text-primary,#0f172a);
        font-weight:600;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;font-size:13.5px;}
      .qe-fab-menu button:hover{background:rgba(99,102,241,.1);}
      .qe-fab-menu .qe-fm-h{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--text-secondary,#64748b);padding:8px 14px 4px;}
      .qe-fab-menu .qe-fm-sw{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 14px;font-size:12px;font-weight:700;color:var(--text-secondary,#64748b);}
      .qe-fab-menu .qe-sw{position:relative;width:36px;height:20px;background:#cbd5e1;border-radius:999px;cursor:pointer;transition:.2s;}
      .qe-fab-menu .qe-sw.on{background:#10b981;}
      .qe-fab-menu .qe-sw::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;background:#fff;border-radius:50%;transition:.2s;}
      .qe-fab-menu .qe-sw.on::after{transform:translateX(16px);}

      /* Ambush styling */
      .qe-overlay.ambush{background:rgba(180,15,15,.55);}
      .qe-overlay.ambush .qe-modal::before{background:linear-gradient(90deg,#ef4444,#f59e0b,#ef4444);}
      .qe-overlay.ambush .qe-head .qe-ico{background:linear-gradient(135deg,#ef4444,#dc2626);box-shadow:0 10px 24px rgba(239,68,68,.55);animation:qeShake .6s;}
      @keyframes qeShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}

      /* Match game */
      .qe-match-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:8px;}
      .qe-match-cell{padding:14px;border-radius:12px;border:1.5px solid var(--border,#e2e8f0);background:var(--bg-card,#fff);
        cursor:pointer;font-size:13.5px;font-weight:600;line-height:1.35;transition:all .2s;text-align:left;}
      .qe-match-cell:hover{border-color:#8b5cf6;}
      .qe-match-cell.sel{border-color:#6366f1;background:rgba(99,102,241,.12);}
      .qe-match-cell.matched{border-color:#10b981;background:rgba(16,185,129,.15);color:#065f46;cursor:default;opacity:.85;}
      .qe-match-cell.bad{border-color:#ef4444;background:rgba(239,68,68,.12);}

      /* Flashcard */
      .qe-flash{perspective:1000px;height:240px;margin:14px 0;}
      .qe-flash-inner{position:relative;width:100%;height:100%;transition:transform .6s;transform-style:preserve-3d;cursor:pointer;}
      .qe-flash.flip .qe-flash-inner{transform:rotateY(180deg);}
      .qe-flash-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:18px;padding:24px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;
        border:1.5px solid var(--border,#e2e8f0);background:var(--bg-card,#fff);box-shadow:0 10px 30px rgba(0,0,0,.08);}
      .qe-flash-face.back{transform:rotateY(180deg);background:linear-gradient(135deg,rgba(99,102,241,.06),rgba(139,92,246,.06));}
      .qe-flash-term{font-size:28px;font-weight:800;color:#6366f1;margin-bottom:10px;}
      .qe-flash-def{font-size:15px;line-height:1.55;color:var(--text-primary,#0f172a);}

      @media(max-width:600px){.qe-modal{border-radius:18px;}.qe-head{padding:18px 18px 6px;}.qe-body{padding:6px 18px 20px;}.qe-q{font-size:15.5px;}}
    `;
    document.head.appendChild(style);
  }

  // -------- Render helpers --------
  function ensureOverlay() {
    let ov = document.getElementById('qe-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'qe-overlay';
      ov.className = 'qe-overlay';
      document.body.appendChild(ov);
    }
    return ov;
  }
  function closeOverlay() {
    const ov = document.getElementById('qe-overlay');
    if (ov) { ov.classList.remove('open', 'ambush'); ov.innerHTML = ''; }
    document.body.style.overflow = '';
  }
  function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function pick(arr, n) { return shuffle(arr).slice(0, n); }
  function dayCountdown() {
    const now = new Date();
    const diff = Math.ceil((D_DAY - now) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }

  // -------- QCM rendering --------
  function renderQuestion(opts) {
    /* opts: { question, index, total, time?, onAnswer(correct, choiceIdx), onClose, ambush, locked, headerNote } */
    const ov = ensureOverlay();
    if (opts.ambush) ov.classList.add('ambush'); else ov.classList.remove('ambush');
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    const q = opts.question;
    const closeBtn = opts.locked ? '' : `<button class="qe-x" onclick="QuizEngine._close()">×</button>`;

    ov.innerHTML = `
      <div class="qe-modal">
        <div class="qe-head">
          <div class="qe-ico"><i class="fas ${opts.ambush ? 'fa-bell' : 'fa-bolt'}"></i></div>
          <div>
            <div class="qe-sub">${opts.ambush ? '⚡ Pop-up surprise — réponds pour continuer' : (opts.headerNote || 'Quiz')}</div>
            <h3 class="qe-ttl">${opts.title || 'Question'}</h3>
          </div>
          ${closeBtn}
        </div>
        <div class="qe-body">
          <div class="qe-meta">
            <span class="qe-pill">${q.topic}</span>
            <span class="qe-pill ${q.level === 'L1' ? 'ok' : 'warn'}">${q.level || 'L1'}</span>
            ${opts.total ? `<span class="qe-pill">Q ${opts.index + 1}/${opts.total}</span>` : ''}
            ${opts.time != null ? `<span class="qe-timer" id="qe-timer">${opts.time}s</span>` : ''}
          </div>
          ${opts.total ? `<div class="qe-bar"><div style="width:${((opts.index)/opts.total)*100}%"></div></div>` : ''}
          <div class="qe-q">${q.q}</div>
          <div id="qe-choices">
            ${q.choices.map((c, i) => `<button class="qe-choice" data-i="${i}">${String.fromCharCode(65+i)}. ${c}</button>`).join('')}
          </div>
          <div id="qe-explain"></div>
          <div class="qe-actions" id="qe-actions"></div>
        </div>
      </div>`;

    let answered = false;
    let timerId = null;
    if (opts.time != null) {
      let t = opts.time;
      const tEl = ov.querySelector('#qe-timer');
      timerId = setInterval(() => {
        t--;
        if (tEl) {
          tEl.textContent = t + 's';
          tEl.classList.toggle('calm', t > Math.floor(opts.time / 2));
        }
        if (t <= 0) {
          clearInterval(timerId);
          if (!answered) reveal(-1);
        }
      }, 1000);
    }

    function reveal(choiceIdx) {
      if (answered) return;
      answered = true;
      if (timerId) clearInterval(timerId);
      const btns = ov.querySelectorAll('.qe-choice');
      btns.forEach((b, i) => {
        b.disabled = true;
        if (i === q.answer) b.classList.add('ok');
        if (i === choiceIdx && i !== q.answer) b.classList.add('ko');
      });
      const correct = choiceIdx === q.answer;
      const exp = ov.querySelector('#qe-explain');
      exp.innerHTML = `<div class="qe-explain"><b>${correct ? '✅ Correct' : (choiceIdx === -1 ? '⏰ Temps écoulé' : '❌ Incorrect')}</b> — ${q.explain || ''}</div>`;
      const act = ov.querySelector('#qe-actions');
      act.innerHTML = `<button class="qe-btn" id="qe-next"><i class="fas fa-arrow-right"></i> ${opts.total && opts.index + 1 < opts.total ? 'Suivant' : 'Terminer'}</button>`;
      ov.querySelector('#qe-next').onclick = () => opts.onAnswer && opts.onAnswer(correct, choiceIdx);
    }

    ov.querySelectorAll('.qe-choice').forEach(b => {
      b.addEventListener('click', () => reveal(parseInt(b.dataset.i, 10)));
    });
  }

  // -------- Modes --------
  function openQuiz(opts) {
    opts = opts || {};
    const mode = opts.mode || 'qcm';
    const topic = opts.topic;
    let pool = window.QUIZ_BANK.QCM.slice();
    if (topic && topic !== 'all') pool = pool.filter(q => q.topic === topic);
    pool = shuffle(pool);

    if (mode === 'speed') return runSpeed(pool);
    if (mode === 'survival') return runSurvival(pool);
    if (mode === 'boss') return runBoss(shuffle(window.QUIZ_BANK.QCM));
    if (mode === 'daily') return runDaily();
    if (mode === 'qa') return runQA(opts.topic);
    return runQcm(pool, opts.count || 10);
  }

  function runQcm(pool, n) {
    const qs = pool.slice(0, n);
    let i = 0, score = 0;
    function next() {
      if (i >= qs.length) return showResult({ title: 'Quiz terminé', score, total: qs.length });
      renderQuestion({
        question: qs[i], index: i, total: qs.length, headerNote: 'Quiz Classique',
        onAnswer: (ok) => { if (ok) score++; addXp(ok ? 10 : 2, { topic: qs[i].topic, correct: ok }); i++; next(); }
      });
    }
    next();
  }

  function runSpeed(pool) {
    let total = 60, score = 0, i = 0;
    const start = Date.now();
    const tick = setInterval(() => {
      const left = total - Math.floor((Date.now() - start) / 1000);
      const tEl = document.getElementById('qe-speed-timer'); if (tEl) tEl.textContent = left + 's';
      if (left <= 0) { clearInterval(tick); finish(); }
    }, 250);
    function next() {
      if (Date.now() - start >= total * 1000) return finish();
      const q = pool[i % pool.length]; i++;
      renderQuestion({
        question: q, headerNote: '⚡ Speed Run — 60s',
        onAnswer: (ok) => { if (ok) score++; addXp(ok ? 8 : 1, { topic: q.topic, correct: ok }); next(); }
      });
      // injecter le timer global
      setTimeout(() => {
        const meta = document.querySelector('.qe-meta');
        if (meta && !document.getElementById('qe-speed-timer')) {
          const left = total - Math.floor((Date.now() - start) / 1000);
          meta.insertAdjacentHTML('beforeend', `<span class="qe-timer" id="qe-speed-timer">${left}s</span>`);
        }
      }, 0);
    }
    function finish() {
      clearInterval(tick);
      addXp(score * 2, { speedScore: score });
      showResult({ title: '⚡ Speed Run terminé', score, total: i, sub: `Score : ${score} bonnes / ${i} questions en 60s` });
    }
    next();
  }

  function runSurvival(pool) {
    let lives = 3, streak = 0, i = 0;
    function next() {
      if (lives <= 0 || i >= pool.length) {
        addXp(streak * 5, { survivalScore: streak });
        return showResult({ title: '☠️ Survie terminée', score: streak, total: streak, sub: `Combo : ${streak} bonnes d'affilée` });
      }
      const q = pool[i]; i++;
      renderQuestion({
        question: q, time: 15,
        headerNote: `❤️ Vies : ${lives}  •  🔥 Combo : ${streak}`,
        onAnswer: (ok) => {
          if (ok) { streak++; addXp(12, { topic: q.topic, correct: true }); }
          else { lives--; addXp(0, { topic: q.topic, correct: false }); }
          next();
        }
      });
    }
    next();
  }

  function runBoss(pool) {
    const qs = pool.slice(0, 20);
    let i = 0, score = 0;
    function next() {
      if (i >= qs.length) {
        addXp(score >= 16 ? 100 : 20);
        return showResult({ title: '👹 Boss vaincu ?', score, total: qs.length, sub: score >= 16 ? '🏆 Mastery: BOSS SLAYER' : 'Continue, tu progresses.' });
      }
      renderQuestion({
        question: qs[i], index: i, total: qs.length, time: 20, headerNote: '👹 Boss Mode',
        onAnswer: (ok) => { if (ok) score++; addXp(ok ? 15 : 2, { topic: qs[i].topic, correct: ok }); i++; next(); }
      });
    }
    next();
  }

  function runDaily() {
    const today = todayStr();
    const done = LS.get(DAILY_KEY, {});
    if (done[today]) return showResult({ title: '✅ Défi du jour déjà fait', score: done[today].score, total: done[today].total, sub: 'Reviens demain pour un nouveau défi !' });

    // seed déterministe par date
    const seed = parseInt(today.replace(/-/g, ''), 10);
    const all = window.QUIZ_BANK.QCM;
    const idx = []; let s = seed;
    while (idx.length < 5) { s = (s * 9301 + 49297) % 233280; const k = s % all.length; if (!idx.includes(k)) idx.push(k); }
    const qs = idx.map(k => all[k]);
    let i = 0, score = 0;
    function next() {
      if (i >= qs.length) {
        done[today] = { score, total: qs.length, ts: Date.now() }; LS.set(DAILY_KEY, done);
        addXp(score * 20);
        return showResult({ title: '🎯 Défi quotidien terminé', score, total: qs.length, sub: 'Reviens demain pour le prochain.' });
      }
      renderQuestion({
        question: qs[i], index: i, total: qs.length, headerNote: '🎯 Défi du jour',
        onAnswer: (ok) => { if (ok) score++; addXp(ok ? 10 : 2, { topic: qs[i].topic, correct: ok }); i++; next(); }
      });
    }
    next();
  }

  // -------- Q&A entretien (questions ouvertes + réponse modèle) --------
  function runQA(topic) {
    let pool = window.QUIZ_BANK.QA.slice();
    if (topic && topic !== 'all') pool = pool.filter(q => q.topic === topic);
    pool = shuffle(pool);
    let i = 0;
    const ov = ensureOverlay(); ov.classList.add('open'); document.body.style.overflow = 'hidden';

    function render(showAnswer, selfRating) {
      if (i >= pool.length) {
        addXp(0); return showResult({ title: "🎤 Entretien terminé", score: i, total: pool.length, sub: "Bravo, continue à reformuler à l'oral !" });
      }
      const q = pool[i];
      const kw = (q.keywords || []).map(k => `<span class="qe-pill">${k}</span>`).join(' ');
      ov.innerHTML = `
        <div class="qe-modal">
          <div class="qe-head">
            <div class="qe-ico"><i class="fas fa-microphone"></i></div>
            <div>
              <div class="qe-sub">🎤 Entretien SOC ${i+1}/${pool.length}</div>
              <h3 class="qe-ttl">Question d'entretien</h3>
            </div>
            <button class="qe-x" onclick="QuizEngine._close()">×</button>
          </div>
          <div class="qe-body">
            <div class="qe-meta">
              <span class="qe-pill">${q.topic}</span>
              <span class="qe-pill ${q.level==='L1'?'ok':'warn'}">${q.level||'L1'}</span>
            </div>
            <div class="qe-q" style="margin-top:14px;">${q.q}</div>
            <div style="font-size:13px;color:var(--text-secondary,#64748b);font-weight:600;margin-bottom:8px;">💡 Reformule à voix haute, puis compare avec la réponse modèle.</div>
            ${showAnswer ? `
              <div class="qe-explain" style="margin-top:10px;">
                <b>✅ Réponse modèle :</b><br>${q.a}
                ${kw ? `<div style="margin-top:12px;font-size:12px;"><b>Mots-clés à mentionner :</b><br><div style="margin-top:6px;">${kw}</div></div>` : ''}
              </div>
              <div style="margin-top:14px;font-weight:700;font-size:13px;color:var(--text-secondary,#64748b);">Auto-évaluation :</div>
              <div class="qe-actions">
                <button class="qe-btn ghost" data-r="hard"><i class="fas fa-face-frown"></i> À revoir</button>
                <button class="qe-btn ghost" data-r="ok"><i class="fas fa-face-meh"></i> Moyen</button>
                <button class="qe-btn" data-r="good"><i class="fas fa-face-smile"></i> Bien</button>
              </div>
            ` : `
              <div class="qe-actions">
                <button class="qe-btn" id="qe-show"><i class="fas fa-eye"></i> Voir la réponse modèle</button>
                <button class="qe-btn ghost" id="qe-skip"><i class="fas fa-forward"></i> Passer</button>
              </div>
            `}
          </div>
        </div>`;

      if (!showAnswer) {
        ov.querySelector('#qe-show').onclick = () => render(true);
        ov.querySelector('#qe-skip').onclick = () => { i++; render(false); };
      } else {
        ov.querySelectorAll('button[data-r]').forEach(b => {
          b.onclick = () => {
            const r = b.dataset.r;
            const xp = r === 'good' ? 20 : r === 'ok' ? 10 : 4;
            addXp(xp, { topic: q.topic, correct: r === 'good' });
            toast(`+${xp} XP — ${r === 'good' ? 'Excellent !' : r === 'ok' ? 'Continue !' : 'Reformule encore !'}`, r === 'good' ? 'success' : 'info');
            i++; render(false);
          };
        });
      }
    }
    render(false);
  }

  // -------- Flashcards --------
  function openFlashcards(topic) {
    let pool = window.QUIZ_BANK.FLASH.slice();
    if (topic && topic !== 'all') pool = pool.filter(f => f.topic === topic);
    pool = shuffle(pool);
    let i = 0, flipped = false;
    const ov = ensureOverlay(); ov.classList.add('open'); document.body.style.overflow = 'hidden';

    function render() {
      const f = pool[i];
      ov.innerHTML = `
        <div class="qe-modal">
          <div class="qe-head">
            <div class="qe-ico"><i class="fas fa-layer-group"></i></div>
            <div>
              <div class="qe-sub">Flashcard ${i+1}/${pool.length}</div>
              <h3 class="qe-ttl">${f.topic}</h3>
            </div>
            <button class="qe-x" onclick="QuizEngine._close()">×</button>
          </div>
          <div class="qe-body">
            <div class="qe-flash ${flipped ? 'flip' : ''}" id="qe-flash">
              <div class="qe-flash-inner">
                <div class="qe-flash-face"><div class="qe-flash-term">${f.term}</div><div style="font-size:12px;color:#64748b;font-weight:600;">Clique pour révéler</div></div>
                <div class="qe-flash-face back"><div class="qe-flash-def">${f.def}</div></div>
              </div>
            </div>
            <div class="qe-actions">
              <button class="qe-btn ghost" id="qe-prev"><i class="fas fa-arrow-left"></i> Préc.</button>
              <button class="qe-btn" id="qe-flip"><i class="fas fa-rotate"></i> Retourner</button>
              <button class="qe-btn ghost" id="qe-next"><i class="fas fa-arrow-right"></i> Suiv.</button>
              <button class="qe-btn ghost" id="qe-known" style="margin-left:auto;"><i class="fas fa-check"></i> Je sais</button>
            </div>
          </div>
        </div>`;
      ov.querySelector('#qe-flash').onclick = () => { flipped = !flipped; render(); };
      ov.querySelector('#qe-flip').onclick = (e) => { e.stopPropagation(); flipped = !flipped; render(); };
      ov.querySelector('#qe-prev').onclick = () => { i = (i - 1 + pool.length) % pool.length; flipped = false; render(); };
      ov.querySelector('#qe-next').onclick = () => { i = (i + 1) % pool.length; flipped = false; render(); };
      ov.querySelector('#qe-known').onclick = () => { addXp(3, { topic: f.topic, correct: true }); i = (i + 1) % pool.length; flipped = false; render(); };
    }
    render();
  }

  // -------- Match game --------
  function openMatch(topicIdx) {
    const game = window.QUIZ_BANK.MATCH[topicIdx || 0] || window.QUIZ_BANK.MATCH[0];
    const lefts = shuffle(game.pairs.map((p, i) => ({ side: 'L', idx: i, text: p[0] })));
    const rights = shuffle(game.pairs.map((p, i) => ({ side: 'R', idx: i, text: p[1] })));
    let selected = null, matched = 0, errors = 0;
    const ov = ensureOverlay(); ov.classList.add('open'); document.body.style.overflow = 'hidden';

    function render() {
      ov.innerHTML = `
        <div class="qe-modal">
          <div class="qe-head">
            <div class="qe-ico"><i class="fas fa-puzzle-piece"></i></div>
            <div>
              <div class="qe-sub">Memory / Match</div>
              <h3 class="qe-ttl">${game.topic}</h3>
            </div>
            <button class="qe-x" onclick="QuizEngine._close()">×</button>
          </div>
          <div class="qe-body">
            <div class="qe-meta"><span class="qe-pill ok">Trouvés : ${matched}/${game.pairs.length}</span><span class="qe-pill dng">Erreurs : ${errors}</span></div>
            <div class="qe-match-grid" style="margin-top:14px;">
              <div>${lefts.map((l,i)=>`<button class="qe-match-cell" data-side="L" data-idx="${l.idx}" data-pos="${i}">${l.text}</button>`).join('')}</div>
              <div>${rights.map((r,i)=>`<button class="qe-match-cell" data-side="R" data-idx="${r.idx}" data-pos="${i}">${r.text}</button>`).join('')}</div>
            </div>
          </div>
        </div>`;
      ov.querySelectorAll('.qe-match-cell').forEach(btn => {
        btn.onclick = () => {
          if (btn.classList.contains('matched')) return;
          if (selected && selected.btn === btn) { btn.classList.remove('sel'); selected = null; return; }
          btn.classList.add('sel');
          if (!selected) { selected = { btn, side: btn.dataset.side, idx: btn.dataset.idx }; return; }
          if (selected.side === btn.dataset.side) { selected.btn.classList.remove('sel'); selected = { btn, side: btn.dataset.side, idx: btn.dataset.idx }; return; }
          // pair
          if (selected.idx === btn.dataset.idx) {
            selected.btn.classList.add('matched'); btn.classList.add('matched');
            selected.btn.classList.remove('sel'); btn.classList.remove('sel');
            matched++; addXp(8, { correct: true });
            const m = ov.querySelector('.qe-meta'); if (m) m.innerHTML = `<span class="qe-pill ok">Trouvés : ${matched}/${game.pairs.length}</span><span class="qe-pill dng">Erreurs : ${errors}</span>`;
            if (matched >= game.pairs.length) {
              addXp(30 - Math.min(errors * 3, 25));
              setTimeout(() => showResult({ title: '🧩 Match terminé', score: matched, total: game.pairs.length, sub: `Erreurs : ${errors}` }), 600);
            }
          } else {
            errors++;
            const a = selected.btn, b = btn;
            a.classList.add('bad'); b.classList.add('bad');
            setTimeout(() => { a.classList.remove('bad', 'sel'); b.classList.remove('bad', 'sel'); }, 600);
            const m = ov.querySelector('.qe-meta'); if (m) m.innerHTML = `<span class="qe-pill ok">Trouvés : ${matched}/${game.pairs.length}</span><span class="qe-pill dng">Erreurs : ${errors}</span>`;
          }
          selected = null;
        };
      });
    }
    render();
  }

  // -------- Result screen --------
  function showResult(opts) {
    const s = getStats();
    const acc = opts.total ? Math.round((opts.score / opts.total) * 100) : 0;
    const ov = ensureOverlay(); ov.classList.add('open'); document.body.style.overflow = 'hidden';
    ov.innerHTML = `
      <div class="qe-modal">
        <div class="qe-head">
          <div class="qe-ico"><i class="fas fa-trophy"></i></div>
          <div>
            <div class="qe-sub">Résultat</div>
            <h3 class="qe-ttl">${opts.title}</h3>
          </div>
          <button class="qe-x" onclick="QuizEngine._close()">×</button>
        </div>
        <div class="qe-body">
          <div style="text-align:center;padding:18px 0 8px;">
            <div style="font-size:54px;font-weight:900;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;background-clip:text;color:transparent;">${opts.score}<span style="font-size:24px;color:#64748b;">/${opts.total || '?'}</span></div>
            <div style="color:#64748b;font-weight:700;margin-top:6px;">${opts.sub || `Précision : ${acc}%`}</div>
          </div>
          <div class="qe-meta" style="justify-content:center;margin:16px 0;">
            <span class="qe-pill">Niveau ${s.level}</span>
            <span class="qe-pill">XP ${s.xp}</span>
            <span class="qe-pill ok">🔥 ${s.streakDays}j streak</span>
          </div>
          <div class="qe-actions" style="justify-content:center;">
            <button class="qe-btn" onclick="QuizEngine._close()"><i class="fas fa-check"></i> Fermer</button>
            <button class="qe-btn ghost" onclick="QuizEngine.openQuiz({mode:'qcm'})"><i class="fas fa-redo"></i> Rejouer</button>
          </div>
        </div>
      </div>`;
  }

  // -------- Ambush --------
  function openAmbush() {
    const all = window.QUIZ_BANK.QCM;
    const q = all[Math.floor(Math.random() * all.length)];
    LS.set(AMBUSH_TS_KEY, Date.now());
    renderQuestion({
      question: q, ambush: true, locked: true, time: 25, title: '🚨 Pop-up surprise',
      onAnswer: (ok) => {
        addXp(ok ? 15 : 3, { topic: q.topic, correct: ok });
        toast(ok ? `+15 XP — Bien joué !` : `+3 XP — Continue à réviser !`, ok ? 'success' : 'info');
        setTimeout(() => closeOverlay(), 600);
      }
    });
  }

  function ambushEnabled() { return LS.get(AMBUSH_KEY, true) !== false; }
  function toggleAmbush(v) { const val = (v == null) ? !ambushEnabled() : !!v; LS.set(AMBUSH_KEY, val); toast(val ? '🚨 Pop-ups surprises activés' : '😴 Pop-ups désactivés', 'info'); return val; }

  function scheduleAmbush() {
    if (!ambushEnabled()) return;
    const last = LS.get(AMBUSH_TS_KEY, 0);
    const since = Date.now() - last;
    // au moins 4 minutes entre 2 ambushs (cross-page)
    const minGap = 4 * 60 * 1000;
    const wait = Math.max(minGap - since, 45_000) + Math.floor(Math.random() * 90_000);
    setTimeout(() => {
      if (document.hidden) return scheduleAmbush();
      const ov = document.getElementById('qe-overlay');
      if (ov && ov.classList.contains('open')) return scheduleAmbush();
      openAmbush();
    }, wait);
  }

  // -------- Floating button --------
  function buildFab() {
    if (document.getElementById('qe-fab')) return;
    const fab = document.createElement('button');
    fab.id = 'qe-fab';
    fab.title = 'Révision rapide';
    fab.innerHTML = '<i class="fas fa-bolt"></i>';
    document.body.appendChild(fab);

    const menu = document.createElement('div');
    menu.id = 'qe-fab-menu';
    menu.className = 'qe-fab-menu';
    document.body.appendChild(menu);

    function refresh() {
      const s = getStats();
      menu.innerHTML = `
        <div class="qe-fm-h">⚡ Révision express</div>
        <button data-act="qcm"><i class="fas fa-list-check"></i> Quiz QCM (10)</button>
        <button data-act="speed"><i class="fas fa-bolt"></i> Speed Run 60s</button>
        <button data-act="survival"><i class="fas fa-heart-crack"></i> Mode Survie</button>
        <button data-act="boss"><i class="fas fa-skull"></i> Boss Mode (20)</button>
        <button data-act="daily"><i class="fas fa-calendar-day"></i> Défi du jour</button>
        <button data-act="qa"><i class="fas fa-microphone"></i> Q&A Entretien SOC</button>
        <button data-act="flash"><i class="fas fa-layer-group"></i> Flashcards</button>
        <button data-act="match"><i class="fas fa-puzzle-piece"></i> Memory match</button>
        <div class="qe-fm-h">Stats</div>
        <div class="qe-fm-sw">Niveau ${s.level} • ${s.xp} XP • 🔥 ${s.streakDays}j</div>
        <div class="qe-fm-sw">J-${dayCountdown()} avant l'objectif 🎯</div>
        <div class="qe-fm-sw">Pop-up surprise<div class="qe-sw ${ambushEnabled() ? 'on' : ''}" id="qe-sw"></div></div>
        <button data-act="now"><i class="fas fa-bell"></i> Lancer un pop-up maintenant</button>
        <button data-act="hub"><i class="fas fa-gamepad"></i> Hub Révision complet</button>`;
      menu.querySelector('#qe-sw').onclick = (e) => { e.stopPropagation(); toggleAmbush(); refresh(); };
      menu.querySelectorAll('button[data-act]').forEach(b => b.onclick = () => {
        menu.classList.remove('open');
        const a = b.dataset.act;
        if (a === 'qcm') openQuiz({ mode: 'qcm' });
        else if (a === 'speed') openQuiz({ mode: 'speed' });
        else if (a === 'survival') openQuiz({ mode: 'survival' });
        else if (a === 'boss') openQuiz({ mode: 'boss' });
        else if (a === 'daily') openQuiz({ mode: 'daily' });
        else if (a === 'qa') openQuiz({ mode: 'qa' });
        else if (a === 'flash') openFlashcards();
        else if (a === 'match') openMatch(Math.floor(Math.random() * window.QUIZ_BANK.MATCH.length));
        else if (a === 'now') openAmbush();
        else if (a === 'hub') location.href = 'revision.html';
      });
    }
    fab.onclick = () => { refresh(); menu.classList.toggle('open'); };
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target !== fab && !fab.contains(e.target)) menu.classList.remove('open');
    });
  }

  // -------- Public API --------
  window.QuizEngine = {
    openQuiz, openFlashcards, openMatch, openAmbush, scheduleAmbush,
    toggleAmbush, getStats, dayCountdown,
    _close: closeOverlay
  };

  // -------- Init --------
  function init() {
    injectCSS();
    // ne pas bloquer la première navigation : afficher le FAB toujours, planifier ambush sauf sur revision.html
    buildFab();
    if (!/revision\.html$/i.test(location.pathname)) scheduleAmbush();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
