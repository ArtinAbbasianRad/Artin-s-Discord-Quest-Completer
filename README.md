<div align="center">

# 🎮 Discord Quest Completer

### *Automatically complete Discord quests with a stunning interface*

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Language](https://img.shields.io/badge/language-JavaScript-yellow.svg)
![Platform](https://img.shields.io/badge/platform-Discord%20PTB-5865F2.svg)

---

> **⚠️ ONLY WORKS ON DISCORD PTB**
> 
> 📥 [Download Discord PTB](https://discord.com/api/download/ptb?platform=win)

---

</div>

## 📖 What is This?

This script **tricks Discord into thinking you're playing a game** to automatically complete quests without actually launching the game. It creates a fake game process that Discord recognizes, allowing you to earn quest rewards effortlessly.

**Perfect for:**
- Completing PLAY/STREAM/VIDEOS quests without downloading games
- Earning quest rewards while doing other things
- Saving time and system resources

---

## ✨ Features

- 🎨 **Beautiful animated UI** with smooth transitions
- 🚀 **Auto-detects quests** and tracks progress in real-time
- ⏱️ **Time estimation** with circular progress indicator
- 🔒 **Safe & transparent** - fully open-source code
- 💾 **Zero dependencies** - pure vanilla JavaScript

---

## 🚀 Quick Start

### Installation

Paste this into Discord PTB's Developer Console (`F12`):

```javascript
(async () => {
  // ───── 🔒 SAFETY ───────────────────────────────────────────────────────
  if (!navigator.userAgent.includes('Electron/')) {
    alert('❌ Must run in Discord Desktop App.\nUser-Agent:\n' + navigator.userAgent);
    return;
  }

  // ───── 🧠 MODULE EXTRACTION ─────────────────────────────────────────────
  let rc;
  try { webpackChunkdiscord_app.push([[Symbol()], {}, r => r.b && (rc = r.c)]); }
  catch (e) { return console.error('WEBPACK ERROR:', e); }

  const api = Object.values(rc).find(x => x?.exports?.tn?.post)?.exports?.tn;
  const QuestsStore = Object.values(rc).find(x => x?.exports?.Z?.__proto__?.getQuest)?.exports?.Z;
  if (!api || !QuestsStore) return alert('❌ Internal modules not found. Reopen DevTools.');

  // ───── 🛡️ SAFE STORAGE (Discord Console Compatible) ─────────────────────
  const SafeStorage = (() => {
    const fallback = {};
    return {
      get(key, def = null) {
        try { return globalThis.localStorage?.getItem(key) || globalThis.sessionStorage?.getItem(key) || fallback[key] || def; } catch {}
        return fallback[key] || def;
      },
      set(key, val) {
        fallback[key] = String(val);
        try { globalThis.localStorage?.setItem(key, val); } catch {}
        try { globalThis.sessionStorage?.setItem(key, val); } catch {}
      },
      remove(key) {
        delete fallback[key];
        try { globalThis.localStorage?.removeItem(key); } catch {}
        try { globalThis.sessionStorage?.removeItem(key); } catch {}
      }
    };
  })();

  // ───── 🖱️ CUSTOM CURSOR ────────────────────────────────────────────────
const initCursor = () => {
  if (window.artinCursor) return;

  // Hide native cursor globally (critical for overlay to feel seamless)
  document.body.style.cursor = 'none !important';
  document.documentElement.style.cursor = 'none !important';

  const cursor = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  cursor.id = 'artin-cursor';
  cursor.setAttribute('width', '20');
  cursor.setAttribute('height', '20');
  cursor.setAttribute('viewBox', '0 0 20 20');

  // Use setProperty to enforce !important where needed
  const s = cursor.style;
  s.position = 'fixed';
  s.top = '0';
  s.left = '0';
  s.pointerEvents = 'none';
  s.zIndex = '2147483647'; // Highest possible
  s.transform = 'translate(-50%, -50%)';
  s.filter = 'drop-shadow(0 0 8px rgba(180,190,254,0.8))';
  s.transition = 'opacity 0.2s';
  s.opacity = '1';

  cursor.innerHTML = `<circle cx="10" cy="10" r="3" fill="white" stroke="#b4befe" stroke-width="1"/>`;

  // ✅ Inject into #app-mount (Discord's root) — NOT document.body
  const appMount = document.getElementById('app-mount') || document.body;
  appMount.appendChild(cursor);

  // Optional: slight delay to ensure render
  setTimeout(() => {
    cursor.style.opacity = '1';
    console.log('%c ✅ Artin Cursor Injected', 'color:#a6e3a1; font-weight:bold');
  }, 50);

  let x = 0, y = 0, tx = 0, ty = 0;
  const update = () => {
    const dx = tx - x, dy = ty - y;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      x += dx * 0.12;
      y += dy * 0.12;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      requestAnimationFrame(update);
    }
  };

  document.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
    if (!window.cursorRAF) window.cursorRAF = requestAnimationFrame(update);
  }, { passive: true });

  return () => {
    cursor.remove();
    document.body.style.cursor = '';
    document.documentElement.style.cursor = '';
    cancelAnimationFrame(window.cursorRAF);
    delete window.artinCursor;
  };
};

  // ───── 🎨 ICONS ─────────────────────────────────────────────────────────
  const Icons = {
    logo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    minimize: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    maximize: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>`,
    close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a6e3a1" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    watch: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#89b4fa" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    stream: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f9e2af" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    pause: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fab387" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
    resume: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a6e3a1" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
  };

  // ───── 🪟 PREMIUM UI ────────────────────────────────────────────────────
  const createGUI = () => {
    if (document.getElementById('artin-gui')) document.getElementById('artin-gui').remove();

    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;800&display=swap');
      @keyframes artinFadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      @keyframes artinPulse { 0% { box-shadow: 0 0 0 0 rgba(180, 190, 254, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(180, 190, 254, 0); } 100% { box-shadow: 0 0 0 0 rgba(180, 190, 254, 0); } }
      @keyframes fadeTip { 
        0% { opacity: 0; transform: translateX(5px); } 
        15% { opacity: 1; transform: translateX(0); } 
        85% { opacity: 1; } 
        100% { opacity: 0; transform: translateX(-5px); } 
      }

      #artin-gui .artin-glass {
        background: rgba(17, 17, 27, 0.92);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        overflow: hidden;
        transition: height 0.4s ease, width 0.4s ease;
      }
      @supports (backdrop-filter: blur(20px)) {
        #artin-gui .artin-glass {
          background: rgba(17, 17, 27, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      }

      #artin-gui {
        position: fixed; top: 100px; left: 50%; transform: translateX(-50%);
        width: 360px; z-index: 2147483647;
        font-family: 'Inter', system-ui, sans-serif;
        color: #cdd6f4;
        animation: artinFadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        filter: drop-shadow(0 12px 32px rgba(0,0,0,0.5));
      }

      #artin-header {
        padding: 14px 18px;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex; align-items: center; justify-content: space-between;
        cursor: move; user-select: none;
      }
      #artin-title {
        font-weight: 800; font-size: 14px; letter-spacing: -0.02em;
        display: flex; align-items: center; gap: 8px;
        background: linear-gradient(135deg, #b4befe, #f5c2e7);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      .artin-controls { display: flex; gap: 6px; }
      .artin-btn {
        width: 22px; height: 22px; border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: #9399b2; transition: 0.2s;
        background: transparent;
      }
      .artin-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .artin-btn.close:hover { background: #f38ba8; color: #11111b; }

      #artin-body { padding: 16px; }
      #artin-status-box {
        background: rgba(30, 30, 46, 0.5);
        border: 1px solid rgba(180, 190, 254, 0.1);
        border-radius: 10px; padding: 12px;
        margin-bottom: 12px;
        font-family: 'JetBrains Mono', monospace; font-size: 12px;
        color: #a6adc8; line-height: 1.5;
      }
      #artin-status-box b { color: #fff; }

      #artin-list {
        max-height: 220px; overflow-y: auto; padding-right: 8px;
      }
      #artin-list::-webkit-scrollbar { width: 4px; }
      #artin-list::-webkit-scrollbar-track { background: transparent; }
      #artin-list::-webkit-scrollbar-thumb { background: #45475a; border-radius: 2px; }

      .quest-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px; padding: 10px;
        margin-bottom: 8px;
        display: flex; align-items: center; gap: 12px;
        transition: transform 0.2s ease, background 0.2s;
        animation: artinFadeIn 0.3s ease backwards;
        cursor: pointer;
      }
      .quest-card:hover { transform: translateX(2px); background: rgba(255, 255, 255, 0.06); }
      .quest-card.expanded { flex-direction: column; align-items: flex-start; }
      .quest-card.expanded .q-details {
        margin-top: 8px; width: 100%; font-size: 10px; color: #6c7086;
        background: rgba(0,0,0,0.2); border-radius: 4px; padding: 6px;
        font-family: 'JetBrains Mono', monospace; overflow: auto; max-height: 80px;
        white-space: pre-wrap; word-break: break-all;
      }

      .q-icon { 
        width: 32px; height: 32px; 
        background: rgba(30, 30, 46, 0.8); 
        border-radius: 8px; 
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      .q-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
      .q-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; }
      .q-type { color: #cdd6f4; }
      .q-nums { color: #9399b2; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
      .q-prog-track { height: 4px; width: 100%; background: rgba(0, 0, 0, 0.3); border-radius: 2px; overflow: hidden; }
      .q-prog-fill {
        height: 100%; border-radius: 2px;
        box-shadow: 0 0 10px currentColor;
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      #artin-btn {
        margin-top: 16px; width: 100%;
        padding: 12px; border: none; border-radius: 8px;
        background: linear-gradient(90deg, #89b4fa, #b4befe);
        background-size: 200% 200%;
        color: #11111b; font-weight: 700; font-size: 13px;
        cursor: pointer; transition: all 0.3s;
        box-shadow: 0 4px 15px rgba(137, 180, 250, 0.3);
      }
      #artin-btn:hover:not(:disabled) {
        background-position: 100% 50%;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(137, 180, 250, 0.5);
      }
      #artin-btn:disabled {
        opacity: 0.6; cursor: wait; transform: none;
        background: #45475a; color: #a6adc8; box-shadow: none;
      }
      #artin-btn.pause-mode {
        background: linear-gradient(90deg, #fab387, #f9e2af);
      }

      #artin-gui.minimized .artin-glass { width: 200px; }
      #artin-gui.minimized #artin-body { display: none; }
      #artin-gui.minimized #artin-title { font-size: 12px; }
    `;
    document.head.appendChild(style);

    // ✅ Load position safely
    const saved = JSON.parse(SafeStorage.get('artinGuiPos') || '{}');
    const left = saved.left ?? '50%';
    const top = saved.top ?? '100px';

    const gui = document.createElement('div');
    gui.id = 'artin-gui';
    gui.style.left = left;
    gui.style.top = top;
    gui.innerHTML = `
      <div class="artin-glass">
        <div id="artin-header">
          <div id="artin-title">${Icons.logo} Artin's Turbo</div>
          <div class="artin-controls">
            <div id="btn-min" class="artin-btn">${Icons.minimize}</div>
            <div id="btn-close" class="artin-btn close">${Icons.close}</div>
          </div>
        </div>
        <div id="artin-body">
          <div id="artin-status-box">Initializing...</div>
          <div id="artin-list"></div>
          <button id="artin-btn">Start Automation ⚡</button>
        </div>
      </div>
    `;
    document.body.appendChild(gui);

    // ─── INTERACTION LOGIC ───
    const header = gui.querySelector('#artin-header');
    const minBtn = gui.querySelector('#btn-min');
    const closeBtn = gui.querySelector('#btn-close');
    const btn = gui.querySelector('#artin-btn');

    let isDragging = false, startX, startY, initX, initY;
    header.onmousedown = e => {
      if (e.target.closest('.artin-btn')) return;
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      initX = gui.offsetLeft; initY = gui.offsetTop;
      gui.style.transition = 'none';
    };
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      gui.style.left = `${initX + (e.clientX - startX)}px`;
      gui.style.top = `${initY + (e.clientY - startY)}px`;
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
      gui.style.transition = '';
      SafeStorage.set('artinGuiPos', JSON.stringify({
        left: gui.style.left,
        top: gui.style.top
      }));
    });

    minBtn.onclick = () => {
      gui.classList.toggle('minimized');
      minBtn.innerHTML = gui.classList.contains('minimized') ? Icons.maximize : Icons.minimize;
    };

    const cleanupCursor = initCursor();
    closeBtn.onclick = () => {
      gui.style.opacity = '0';
      gui.style.transform = 'translate(-50%, 20px)';
      setTimeout(() => {
        gui.remove();
        cleanupCursor?.();
        SafeStorage.remove('artinGuiPos');
      }, 400);
    };

    return { root: gui, status: gui.querySelector('#artin-status-box'), list: gui.querySelector('#artin-list'), btn };
  };

  // ───── 🧠 CORE LOGIC ────────────────────────────────────────────────────
  const GUI = createGUI();

  const getQuests = () =>
    [...QuestsStore.quests.values()].filter(q => {
      const t = q.config?.taskConfigV2?.tasks ? Object.values(q.config.taskConfigV2.tasks)[0] : null;
      return t &&
        ['WATCH','PLAY','STREAM'].some(x => t.type.includes(x)) &&
        q.userStatus?.enrolledAt &&
        !q.userStatus?.completedAt &&
        new Date(q.config.expiresAt) > new Date();
    }).sort((a, b) => a.id.localeCompare(b.id));

  // ✅ Toggle quest details
  const toggleQuestDetail = (card, q) => {
    card.classList.toggle('expanded');
    if (card.classList.contains('expanded') && !card.querySelector('.q-details')) {
      const detail = document.createElement('pre');
      detail.className = 'q-details';
      const payload = {
        id: q.id,
        type: q.type,
        expiresAt: q.config.expiresAt,
        progress: q.userStatus?.progress?.[Object.keys(q.config.taskConfigV2.tasks)[0]]?.value || 0,
        config: q.config?.taskConfigV2?.tasks
      };
      const txt = JSON.stringify(payload, null, 2);
      detail.textContent = txt.length > 500 ? txt.substring(0, 497) + '...' : txt;
      card.appendChild(detail);
    }
  };

  const render = () => {
    const quests = getQuests();
    GUI.list.innerHTML = '';

    if (!quests.length) {
      GUI.list.innerHTML = `<div style="text-align:center; padding:20px; color:#6c7086;">No active quests found.<br>Enrol in Quests tab first.</div>`;
      GUI.status.innerHTML = `Idle • <b>0 Active</b>`;
      return;
    }

    quests.forEach((q, i) => {
      const taskKey = Object.keys(q.config.taskConfigV2.tasks)[0];
      const task = q.config.taskConfigV2.tasks[taskKey];
      const progress = q.userStatus?.progress?.[taskKey]?.value || 0;
      const target = task.target;
      const percent = Math.min(100, (progress / target) * 100);

      let icon = Icons.stream, color = '#f9e2af';
      if (task.type.includes('WATCH')) { icon = Icons.watch; color = '#89b4fa'; }
      if (task.type.includes('PLAY')) { icon = Icons.play; color = '#a6e3a1'; }

      const card = document.createElement('div');
      card.className = 'quest-card';
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `
        <div class="q-icon" style="border: 1px solid ${color}40">${icon}</div>
        <div class="q-info">
          <div class="q-header">
            <span class="q-type">${task.type.split('_')[0]}</span>
            <span class="q-nums">${progress}/${target}</span>
          </div>
          <div class="q-prog-track">
            <div class="q-prog-fill" style="width: ${percent}%; background: ${color};"></div>
          </div>
        </div>
      `;
      card.addEventListener('click', () => toggleQuestDetail(card, q));
      GUI.list.appendChild(card);
    });

    GUI.status.innerHTML = `Targeting <b>${quests.length}</b> Quest${quests.length !== 1 ? 's' : ''}`;
  };

  // ───── 🚀 RUNNER with RETRY & SMART STREAM_KEY ─────────────────────────
  let isRunning = false;
  let isPaused = false;

  const getStreamKey = (questId) => {
    // Try real keys first (if in call)
    try {
      const Voice = Object.values(rc).find(m => m?.exports?.default?.getLocalStreamKey)?.exports?.default;
      if (Voice?.getLocalStreamKey) return Voice.getLocalStreamKey();
    } catch {}
    // Fallback: mimic real format
    const userId = (DiscordAPI?.getCurrentUser?.()?.id) || '0';
    return `call:${userId}:${questId}`;
  };

  GUI.btn.onclick = () => {
    if (!isRunning) {
      isRunning = true;
      isPaused = false;
      GUI.btn.disabled = true;
      GUI.btn.innerHTML = `Running... ${Icons.pause}`;
      GUI.btn.classList.add('pause-mode');
      runAutomation();
    } else {
      isPaused = !isPaused;
      GUI.btn.innerHTML = isPaused ? `Paused ${Icons.resume}` : `Running... ${Icons.pause}`;
    }
  };

  const runAutomation = async () => {
    const updateUI = () => {
      GUI.btn.innerHTML = isPaused ? `Paused ${Icons.resume}` : `Running... ${Icons.pause}`;
    };

    while (isRunning) {
      if (isPaused) {
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      const active = getQuests();
      if (!active.length) break;

      await Promise.all(active.map(async q => {
        const taskKey = Object.keys(q.config.taskConfigV2.tasks)[0];
        const type = q.config.taskConfigV2.tasks[taskKey].type;
        const body = { terminal: false };

        try {
          if (type.includes('PLAY') || type.includes('STREAM')) {
            body.stream_key = getStreamKey(q.id);
            await api.post({ url: `/quests/${q.id}/heartbeat`, body });
          } else if (type.includes('WATCH')) {
            const curr = q.userStatus?.progress?.[taskKey]?.value || 0;
            body.timestamp = curr + 30;
            await api.post({ url: `/quests/${q.id}/video-progress`, body });
          }
        } catch (e) {
          console.warn(`[Quest ${q.id}] skipped:`, e?.status || e.message || e);
        }
      }));

      render();
      GUI.status.innerHTML = `Active • <b>${active.length}</b> remaining...`;

      // Cooldown with jitter (19–21s)
      for (let sec = 0; sec < 20 && isRunning && !isPaused; sec++) {
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 200));
        updateUI();
      }
    }

    isRunning = false;
    GUI.btn.disabled = false;
    GUI.btn.classList.remove('pause-mode');
    GUI.btn.textContent = 'Completed! 🎉';
    GUI.status.innerHTML = '✅ Done — refresh Quests tab to claim.';
    render();
  };

  // ───── 🚀 INIT ─────────────────────────────────────────────────────────
  render();
  console.log(
    "%c ARTIN'S TURBO v3.1 — ✅ Fixed & Enhanced ",
    "background: #1e1e2e; color: #b4befe; padding: 6px; border-radius: 4px; font-weight: bold;"
  );
})();
```
> **Note:** If pasting is blocked, type `allow pasting` in the console and press Enter

### Usage

1. Open **Discord PTB** in your browser
2. Press `F12` and paste the code above
3. Click **"START SPOOFING"** when the GUI appears
4. Watch your quest complete automatically!

---

## ⚠️ Important

**This violates Discord's Terms of Service and may result in account suspension.**

- ✅ No data collection or external requests
- ✅ Fully transparent open-source code
- ⚠️ Use at your own risk
- ⚠️ Only works on Discord PTB

---

<div align="center">

## 🌟 Credits

**Created by [Artin Abbasian Rad](https://github.com/ArtinAbbasianRad)**

Inspired by [aamiaa's work](https://github.com/aamiaa)

[![GitHub](https://img.shields.io/badge/GitHub-ArtinAbbasianRad-181717?style=for-the-badge&logo=github)](https://github.com/ArtinAbbasianRad)
[![License](https://img.shields.io/badge/License-Attribution%20Required-red?style=for-the-badge)](LICENSE)

### Found this useful? Give it a ⭐️

---

**⚡ Made with JavaScript ⚡**

</div>
