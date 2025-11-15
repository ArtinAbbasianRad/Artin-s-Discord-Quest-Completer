(function() {
    'use strict';

    // Constants
    const GUI_ID = "artin-quest-spoofer-gui";
    const MINIMIZE_ICON_ID = "artin-minimize-icon";
    const FAKE_PID = 676767;

    // Webpack access
    let wpRequire;
    try {
        wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]);
        webpackChunkdiscord_app.pop();
    } catch (e) {
        console.error("❌ Webpack access failed");
        alert("Artin's Quest Spoofer: Failed to access Discord's internal modules");
        return;
    }

    // Module finder
    const getModule = filter => {
        for (const m of Object.values(wpRequire.c)) {
            const exports = m?.exports;
            if (!exports) continue;
            for (const key in exports) {
                const module = exports[key];
                if (module && filter(module)) return module;
            }
        }
        return null;
    };

    // Get critical modules
    const RunningGameStore = getModule(m => m?.getRunningGames && m?.getGameForPID);
    const QuestsStore = getModule(m => m?.getQuest && m?.quests);
    const FluxDispatcher = getModule(m => m?.dispatch && m?.flushWaitQueue);

    if (!RunningGameStore || !QuestsStore || !FluxDispatcher) {
        console.error("⚠️ Critical modules missing");
        alert("Artin's Quest Spoofer: Could not find critical Discord modules");
        return;
    }

    // Get active quests
    let activeQuests = [...QuestsStore.quests.values()].filter(x =>
        x.userStatus?.enrolledAt &&
        !x.userStatus?.completedAt &&
        new Date(x.config.expiresAt).getTime() > Date.now() &&
        !(
            (x.config.taskConfigV2?.tasks?.WATCH_VIDEO) ||
            (x.config.taskConfig?.tasks?.WATCH_VIDEO) ||
            (x.config.tasks?.WATCH_VIDEO)
        )
    );

    // Variables
    let intervalId = null;
    let realGetRunningGames = null;
    let realGetGameForPID = null;
    let realDispatch = FluxDispatcher.dispatch;
    let fakeGame = null;
    let isSpoofing = false;
    let isMinimized = false;

    // Game store patching functions
    const patchRunningGameStore = game => {
        if (realGetRunningGames) return;
        realGetRunningGames = RunningGameStore.getRunningGames;
        realGetGameForPID = RunningGameStore.getGameForPID;
        RunningGameStore.getRunningGames = () => [game];
        RunningGameStore.getGameForPID = pid => pid === game.pid ? game : realGetGameForPID.call(RunningGameStore, pid);
        isSpoofing = true;
        console.log(`✅ Patched PID: ${game.pid}`);
    };

    const unpatchRunningGameStore = () => {
        if (!realGetRunningGames) return;
        RunningGameStore.getRunningGames = realGetRunningGames;
        RunningGameStore.getGameForPID = realGetGameForPID;
        realGetRunningGames = null;
        realGetGameForPID = null;
        isSpoofing = false;
        console.log("✅ Unpatched");
    };

    // Patch FluxDispatcher
    FluxDispatcher.dispatch = function(event) {
        if (event.type === "RUNNING_GAMES_CHANGE" && event.added.length > 0 && event.added[0].pid === FAKE_PID && !isSpoofing && fakeGame) {
            patchRunningGameStore(fakeGame);
        }
        return realDispatch.apply(this, arguments);
    };
    console.log("✅ FluxDispatcher patched");

    // GUI functions
    const closeGUI = () => {
        // Stop the interval first
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            console.log("✅ Interval cleared");
        }
        
        // Unpatch and remove fake game
        if (fakeGame) {
            unpatchRunningGameStore();
            realDispatch.call(FluxDispatcher, {
                type: "RUNNING_GAMES_CHANGE",
                removed: [fakeGame],
                added: [],
                games: []
            });
            console.log(`✅ Stopped spoofing: ${fakeGame.name}`);
            fakeGame = null;
        }
        
        // Restore original dispatcher
        FluxDispatcher.dispatch = realDispatch;
        console.log("✅ FluxDispatcher restored");
        
        // Remove UI elements
        const gui = document.getElementById(GUI_ID);
        if (gui) gui.remove();
        const minimizeIcon = document.getElementById(MINIMIZE_ICON_ID);
        if (minimizeIcon) minimizeIcon.remove();
        
        console.log("✅ Quest spoofer fully stopped");
    };

    const minimizeGUI = () => {
        const gui = document.getElementById(GUI_ID);
        if (gui) {
            gui.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            gui.style.opacity = '0';
            gui.style.transform = gui.style.transform.includes('translate') ? gui.style.transform.replace(/scale\([^)]*\)/, 'scale(0.9)') : 'scale(0.9)';
            setTimeout(() => gui.style.display = 'none', 250);
            isMinimized = true;
            const minimizeIcon = document.createElement('div');
            minimizeIcon.id = MINIMIZE_ICON_ID;
            minimizeIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9"/><path d="M12 8L8 10V14L12 16L16 14V10L12 8Z" fill="white"/><circle cx="12" cy="12" r="2" fill="#5865F2"/></svg>';
            minimizeIcon.style.cssText = 'position:fixed;bottom:24px;right:24px;width:56px;height:56px;background:linear-gradient(135deg,#5865F2,#4752C4);border-radius:16px;display:flex;align-items:center;justify-content:center;z-index:2147483647;box-shadow:0 8px 24px rgba(88,101,242,0.4),0 0 0 1px rgba(255,255,255,0.1);transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);animation:minimizeIconIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;backdrop-filter:blur(10px)';
            minimizeIcon.addEventListener('mouseenter', () => {
                minimizeIcon.style.transform = 'scale(1.1) rotate(5deg)';
                minimizeIcon.style.boxShadow = '0 12px 32px rgba(88,101,242,0.6),0 0 0 1px rgba(255,255,255,0.2)';
            });
            minimizeIcon.addEventListener('mouseleave', () => {
                minimizeIcon.style.transform = 'scale(1) rotate(0deg)';
                minimizeIcon.style.boxShadow = '0 8px 24px rgba(88,101,242,0.4),0 0 0 1px rgba(255,255,255,0.1)';
            });
            minimizeIcon.addEventListener('click', restoreGUI);
            document.body.appendChild(minimizeIcon);
        }
    };

    const restoreGUI = () => {
        const gui = document.getElementById(GUI_ID);
        const minimizeIcon = document.getElementById(MINIMIZE_ICON_ID);
        if (minimizeIcon) {
            minimizeIcon.style.animation = 'minimizeIconOut 0.3s cubic-bezier(0.16,1,0.3,1) forwards';
            setTimeout(() => minimizeIcon.remove(), 300);
        }
        if (gui) {
            gui.style.display = 'block';
            gui.style.position = 'fixed';
            gui.style.left = '50%';
            gui.style.top = '50%';
            gui.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
            void gui.offsetWidth;
            gui.style.transform = 'translate(-50%,-50%) scale(1)';
            gui.style.opacity = '1';
            isMinimized = false;
        }
    };

    // CSS injection
    const injectCSS = () => {
        if (document.getElementById('artin-quest-style')) return;
        const style = document.createElement('style');
        style.id = 'artin-quest-style';
        style.textContent = `@keyframes modernSlideIn{0%{opacity:0;transform:translate(-50%,-45%) scale(0.95)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}@keyframes smoothExpand{0%{max-height:70px}100%{max-height:700px}}@keyframes contentReveal{0%{max-height:0;opacity:0;padding-top:0;padding-bottom:0}100%{max-height:500px;opacity:1;padding-top:30px;padding-bottom:30px}}@keyframes socialSlideUp{0%{max-height:0;opacity:0;padding-top:0;padding-bottom:0}100%{max-height:100px;opacity:1;padding-top:15px;padding-bottom:15px}}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes pulse{0%,100%{box-shadow:0 12px 40px rgba(0,0,0,0.6)}50%{box-shadow:0 12px 50px rgba(88,101,242,0.4)}}@keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}@keyframes successPulse{0%{transform:scale(1);opacity:0.6}50%{transform:scale(1.3);opacity:0.3}100%{transform:scale(1.5);opacity:0}}@keyframes checkBounce{0%{transform:scale(0)}50%{transform:scale(1.1)}100%{transform:scale(1)}}@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes minimizeIconIn{0%{opacity:0;transform:scale(0.5) rotate(-90deg)}60%{transform:scale(1.1) rotate(5deg)}100%{opacity:1;transform:scale(1) rotate(0deg)}}@keyframes minimizeIconOut{0%{opacity:1;transform:scale(1) rotate(0deg)}100%{opacity:0;transform:scale(0.5) rotate(90deg)}}@keyframes statusPulse{0%,100%{box-shadow:0 0 8px #43B581;transform:scale(1)}50%{box-shadow:0 0 15px #43B581;transform:scale(1.1)}}#${GUI_ID}{background:linear-gradient(135deg,#1e1e1e 0%,#2d2d2d 100%);border:1px solid rgba(88,101,242,0.2);box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 0 1px rgba(88,101,242,0.1);position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2147483647;color:#dcddde;font-family:'Whitney','Helvetica Neue',Helvetica,Arial,sans-serif;width:420px;max-width:95vw;max-height:90vh;border-radius:20px;overflow:hidden;animation:modernSlideIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards;transition:box-shadow 0.3s ease,border-color 0.3s ease;backdrop-filter:blur(10px);will-change:transform}#${GUI_ID}:hover{box-shadow:0 25px 70px rgba(88,101,242,0.4),0 0 0 1px rgba(88,101,242,0.3);border-color:rgba(88,101,242,0.4)}#${GUI_ID}.stage-1{max-height:70px}#${GUI_ID}.stage-1 #gui-content,#${GUI_ID}.stage-1 #social-links{max-height:0;opacity:0;padding-top:0;padding-bottom:0;overflow:hidden}#${GUI_ID}.stage-2{animation:smoothExpand 0.7s cubic-bezier(0.16,1,0.3,1) forwards}#${GUI_ID}.stage-2 #gui-content{animation:contentReveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s forwards}#${GUI_ID}.stage-2 #social-links{animation:socialSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.35s forwards}#gui-header{user-select:none;transition:all 0.3s ease;position:relative;overflow:hidden}#gui-header::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(88,101,242,0.1),transparent);transition:left 0.5s ease}#gui-header:hover::before{left:100%}#gui-header:hover{background:linear-gradient(135deg,#282828 0%,#232323 100%)!important}#${GUI_ID} button{transition:all 0.2s ease;border:none;border-radius:8px;font-weight:600}#gui-close-btn{background:rgba(255,255,255,0.1);color:#dcddde;font-size:20px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;padding:0;line-height:1;cursor:pointer}#gui-close-btn:hover{color:#f04747;background:rgba(240,71,71,0.1)}#gui-minimize-btn{background:rgba(255,255,255,0.1);color:#dcddde;font-size:24px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;margin-right:8px;padding:0;line-height:1;cursor:pointer}#gui-minimize-btn:hover{color:#FEE75C;background:rgba(254,231,92,0.1)}.status-indicator{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px}.status-active{background:#43B581;box-shadow:0 0 8px #43B581;animation:statusPulse 2s ease-in-out infinite}.social-link{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;margin:5px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#dcddde;text-decoration:none;font-size:14px;font-weight:600;transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1)}.social-link:hover{background:rgba(88,101,242,0.2);border-color:rgba(88,101,242,0.4);transform:translateY(-3px);box-shadow:0 6px 20px rgba(88,101,242,0.3);color:#fff}.home-button{background:linear-gradient(135deg,#43B581,#3ea76d);color:white;padding:14px 40px;font-size:16px;font-weight:700;border-radius:12px;box-shadow:0 6px 20px rgba(67,181,129,0.4);transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1)}.home-button:hover{background:linear-gradient(135deg,#57F287,#43B581);transform:translateY(-2px);box-shadow:0 8px 25px rgba(67,181,129,0.5)}`;
        document.head.appendChild(style);
    };

    // GUI creation
    const createGUI = (contentHTML, isStage1 = false) => {
        const existingGui = document.getElementById(GUI_ID);
        if (existingGui) existingGui.remove();
        const gui = document.createElement('div');
        gui.id = GUI_ID;
        if (isStage1) gui.classList.add('stage-1');
        gui.innerHTML = `<div id="gui-header" style="background:linear-gradient(135deg,#232323 0%,#1e1e1e 100%);padding:20px;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #373737"><div style="display:flex;align-items:center"><div class="status-indicator status-active"></div><h3 style="color:#fff;margin:0;font-size:18px;font-weight:700">Artin's Quest Completer</h3></div><div style="display:flex"><button id="gui-minimize-btn">−</button><button id="gui-close-btn">×</button></div></div><div id="gui-content" style="padding:30px 25px;background:#282828;text-align:center;border-radius:0 0 16px 16px">${contentHTML}</div><div id="social-links" style="padding:15px 20px;background:#1e1e1e;border-top:1px solid #373737;display:flex;justify-content:center"><a href="https://github.com/ArtinAbbasianRad" target="_blank" class="social-link" style="flex:1;max-width:300px;justify-content:center">🐱 GitHub - ArtinAbbasianRad</a></div>`;
        document.body.appendChild(gui);
        document.getElementById('gui-close-btn').addEventListener('click', closeGUI);
        document.getElementById('gui-minimize-btn').addEventListener('click', minimizeGUI);
    };

    // HTML templates
    const createSimpleHomeHTML = hasQuests => {
        const disabled = !hasQuests;
        return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 0"><div style="position:relative;width:120px;height:120px;margin-bottom:30px"><div style="position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,rgba(88,101,242,0.2),rgba(71,82,196,0.1));animation:rotateSlow 20s linear infinite"></div><div style="position:absolute;inset:8px;border-radius:50%;background:linear-gradient(225deg,rgba(88,101,242,0.15),rgba(71,82,196,0.05));animation:rotateSlow 15s linear infinite reverse"></div><div style="position:absolute;inset:16px;border-radius:50%;background:linear-gradient(135deg,#5865F2,#4752C4);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(88,101,242,0.4),inset 0 1px 0 rgba(255,255,255,0.2)"><svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" opacity="0.9"/><path d="M12 8L8 10V14L12 16L16 14V10L12 8Z" fill="white"/><circle cx="12" cy="12" r="2" fill="#5865F2"/></svg></div><div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(88,101,242,0.3);animation:pulse 2s ease-in-out infinite"></div></div><h2 style="color:#fff;margin:0 0 12px;font-size:26px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#fff,#dcddde);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Quest Spoofer</h2>${hasQuests ? `<div style="background:rgba(88,101,242,0.1);border:1px solid rgba(88,101,242,0.3);padding:12px 24px;border-radius:12px;margin-bottom:25px"><p style="font-size:14px;color:#dcddde;margin:0;font-weight:600"><span style="color:#5865F2;font-size:24px;font-weight:800">${activeQuests.length}</span><span style="color:#99aab5;margin-left:8px">Active Quest${activeQuests.length > 1 ? 's' : ''}</span></p></div>` : `<p style="font-size:14px;color:#99aab5;margin:0 0 25px;line-height:1.5">No PLAY/STREAM quests available</p>`}<button id="start-all-quests-btn" ${disabled ? 'disabled' : ''} style="background:${disabled ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#5865F2 0%,#4752C4 100%)'};color:${disabled ? '#4e5058' : 'white'};padding:16px 48px;border:${disabled ? '2px solid rgba(255,255,255,0.1)' : 'none'};border-radius:14px;font-weight:700;font-size:16px;box-shadow:${disabled ? 'none' : '0 8px 24px rgba(88,101,242,0.4),inset 0 1px 0 rgba(255,255,255,0.2)'};transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);position:relative;overflow:hidden;text-transform:uppercase;letter-spacing:0.5px"><span style="position:relative;z-index:1">${disabled ? 'No Quests Available' : 'Start Spoofing'}</span>${!disabled ? '<div style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);animation:shimmer 3s infinite"></div>' : ''}</button></div>`;
    };

    const createCompletedHTML = questName => `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="width:100px;height:100px;margin-bottom:25px;position:relative"><div style="position:absolute;width:100%;height:100%;background:#43B58122;border-radius:50%;animation:successPulse 1.5s ease-out infinite"></div><svg width="100" height="100" viewBox="0 0 24 24" fill="none" style="position:relative;z-index:1;filter:drop-shadow(0 4px 12px #43B58144);animation:checkBounce 0.6s cubic-bezier(0.34,1.56,0.64,1)"><circle cx="12" cy="12" r="10" fill="#43B581" opacity="0.2"/><path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#43B581"/></svg></div><h3 style="color:#43B581;margin:0 0 12px;font-size:24px;font-weight:700;animation:fadeInUp 0.5s ease-out 0.2s both">Quest Completed!</h3><p style="font-size:15px;color:#dcddde;margin:0 0 8px;font-weight:600;animation:fadeInUp 0.5s ease-out 0.3s both">${questName}</p><p style="font-size:13px;color:#99aab5;margin:0 0 25px;animation:fadeInUp 0.5s ease-out 0.4s both">Successfully spoofed and completed</p><button id="home-button" class="home-button" style="animation:fadeInUp 0.5s ease-out 0.5s both">Return Home</button></div>`;

    // Quest starting function
    const startQuest = function() {
        if (!activeQuests.length) {
            console.error("No active quests");
            closeGUI();
            return;
        }

        const quest = activeQuests[0];
        const taskConfig = quest.config.taskConfigV2 || quest.config.taskConfig || quest.config;

        if (!taskConfig?.tasks) {
            console.error("Invalid quest config");
            closeGUI();
            return;
        }

        const applicationId = quest.config.application.id;
        const applicationName = quest.config.application.name;
        const taskName = ["PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY"].find(x => taskConfig.tasks[x] != null);

        if (!taskName) {
            console.error("No compatible task");
            closeGUI();
            return;
        }

        const secondsNeeded = taskConfig.tasks[taskName].target;
        let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

        const safeName = applicationName || "Unknown Game";
        const safeProcessName = ((applicationName || "discord") + "").toLowerCase();
        const safeExeName = safeProcessName.replace(/[^a-z0-9]/gi, '_') + ".exe";
        const safeDistributor = "discord";
        const safePidPath = `${FAKE_PID}:${safeProcessName}`;

        fakeGame = {
            id: applicationId,
            name: safeName,
            pid: FAKE_PID,
            pidPath: safePidPath,
            start: Date.now(),
            processName: safeProcessName,
            processPath: "C:\\\\Users\\\\Artin\\\\AppData\\\\Local\\\\Discord\\\\Update.exe",
            cmd: '"C:\\\\Users\\\\Artin\\\\AppData\\\\Local\\\\Discord\\\\Update.exe" --processType=renderer',
            exe: safeExeName,
            icon: `https://cdn.discordapp.com/app-icons/${applicationId}/icon.png`,
            isVerified: true,
            isHooked: false,
            source: "overlay",
            windowTitle: safeName,
            arguments: ["--processType=renderer"],
            type: "game",
            distributor: safeDistributor,
            distributorName: safeDistributor,
            os: "win32",
            path: "C:\\\\Users\\\\Artin\\\\AppData\\\\Local\\\\Discord\\\\Update.exe",
            executable: safeExeName,
            launchDetails: 0,
            overlay: true,
            overlayCompatibilityHook: false,
            primary: true,
            timestamp: Date.now(),
            exeName: safeExeName,
            exePath: "C:\\\\Users\\\\Artin\\\\AppData\\\\Local\\\\Discord\\\\Update.exe",
            cmdLine: '"C:\\\\Users\\\\Artin\\\\AppData\\\\Local\\\\Discord\\\\Update.exe" --processType=renderer',
            hidden: false,
            elevated: false,
            nativeProcessObserverId: 1,
            windowHandle: null
        };

        patchRunningGameStore(fakeGame);

        try {
            FluxDispatcher.dispatch({
                type: "RUNNING_GAMES_CHANGE",
                added: [fakeGame],
                removed: [],
                games: [fakeGame]
            });
            console.log(`✅ Dispatched: ${applicationName} (PID: ${fakeGame.pid})`);
        } catch (e) {
            console.error("Dispatch failed:", e);
            unpatchRunningGameStore();
            closeGUI();
            return;
        }

        const percentDone = Math.min(100, Math.floor((secondsDone / secondsNeeded) * 100));
        createGUI(`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="width:100px;height:100px;margin-bottom:25px;position:relative"><svg width="100" height="100" viewBox="0 0 100 100" style="transform:rotate(-90deg)"><circle cx="50" cy="50" r="45" stroke="#2f3136" stroke-width="6" fill="none"/><circle id="progress-circle" cx="50" cy="50" r="45" stroke="url(#progressGradient)" stroke-width="6" fill="none" stroke-dasharray="282.6" stroke-dashoffset="${282.6 - (282.6 * percentDone / 100)}" style="transition:stroke-dashoffset 0.5s ease;stroke-linecap:round;filter:drop-shadow(0 0 8px rgba(88,101,242,0.6))"/><defs><linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#5865F2;stop-opacity:1"/><stop offset="100%" style="stop-color:#4752C4;stop-opacity:1"/></linearGradient></defs></svg><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center"><div style="font-size:28px;font-weight:700;color:#5865F2;line-height:1">${percentDone}%</div><div style="font-size:11px;color:#99aab5;margin-top:4px;font-weight:600">PROGRESS</div></div></div><h3 style="color:#fff;margin:0 0 8px;font-size:20px;font-weight:700">Spoofing Quest</h3><p style="color:#dcddde;margin:0 0 20px;font-size:15px;font-weight:600">${quest.config.messages.questName}</p><div style="background:rgba(88,101,242,0.1);border:1px solid rgba(88,101,242,0.3);padding:14px 28px;border-radius:12px"><p id="time-remaining" style="font-size:14px;color:#dcddde;margin:0;font-weight:600">Calculating time...</p></div></div>`, false);

        intervalId = setInterval(() => {
            secondsDone += 7.5;
            const remainingSeconds = secondsNeeded - secondsDone;

            if (remainingSeconds <= 0) {
                console.log(`🎉 Completed: ${quest.config.messages.questName}`);
                closeGUI();
                createGUI(createCompletedHTML(quest.config.messages.questName));
                document.getElementById('home-button').addEventListener('click', () => {
                    closeGUI();
                    setTimeout(init, 100);
                });
                return;
            }

            const currentPercentDone = Math.min(100, Math.floor((secondsDone / secondsNeeded) * 100));
            const minsRemaining = Math.ceil(remainingSeconds / 60);
            const progressCircle = document.getElementById('progress-circle');

            if (progressCircle) progressCircle.style.strokeDashoffset = 282.6 - (282.6 * currentPercentDone / 100);

            const percentText = document.querySelector('#gui-content > div > div:first-child > div > div:first-child');
            if (percentText) percentText.textContent = `${currentPercentDone}%`;

            const timeEl = document.getElementById('time-remaining');
            if (timeEl) {
                const hours = Math.floor(minsRemaining / 60);
                const mins = minsRemaining % 60;
                timeEl.textContent = hours > 0 ? `⏱️ ${hours}h ${mins}m remaining` : `⏱️ ${mins} minute${mins !== 1 ? 's' : ''} remaining`;
            }
        }, 7500);
    };

    // Initialization
    const init = () => {
        injectCSS();
        createGUI(createSimpleHomeHTML(activeQuests.length > 0), true);
        setTimeout(() => {
            const gui = document.getElementById(GUI_ID);
            if (gui) {
                gui.classList.remove('stage-1');
                gui.classList.add('stage-2');
                setTimeout(() => {
                    const startBtn = document.getElementById('start-all-quests-btn');
                    if (startBtn) startBtn.addEventListener('click', startQuest);
                }, 700);
            }
        }, 1000);
    };

    init();
})();