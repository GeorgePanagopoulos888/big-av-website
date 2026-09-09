(function () {
  function muteMic() {
    if (typeof running !== "undefined" && running && typeof stopMic === "function") {
      try {
        stopMic();
      } catch {
        /* already stopped */
      }
    }
    const mic = document.getElementById("micToggle");
    if (mic) {
      mic.classList.add("muted");
      mic.disabled = true;
      mic.setAttribute("aria-hidden", "true");
    }
    const ask = document.getElementById("askForm");
    if (ask) {
      ask.addEventListener(
        "submit",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        true
      );
    }
    if (typeof setVoiceStatus === "function") setVoiceStatus("", false);
  }

  function injectDemoBar() {
    const surface = document.getElementById("surface");
    const system = document.getElementById("system");
    if (!surface || !system || document.getElementById("demoAtoms")) return;

    const demoAtoms = document.createElement("div");
    demoAtoms.id = "demoAtoms";
    demoAtoms.setAttribute("aria-hidden", "true");
    system.appendChild(demoAtoms);

    const bar = document.createElement("div");
    bar.className = "site-demo-bar";
    bar.innerHTML =
      '<div class="site-bradley-name">Bradley</div><p class="site-demo-note">Recorded concept demonstration</p><p id="siteCaption"></p><p id="siteStatus" role="status">Loading demonstration</p><div class="site-demo-controls"><button type="button" id="siteStart" disabled>Loading...</button><button type="button" id="siteStop" hidden>Stop</button></div><a class="site-demo-contact" href="/contact.html" target="_top">Talk to BIG AV</a>';
    surface.parentElement.appendChild(bar);
  }

  function refreshSiteGeometry() {
    if (typeof resizeWaveCanvas === "function") resizeWaveCanvas();
    if (typeof updateNodePositions === "function") updateNodePositions(0);
    if (typeof draw === "function") draw();
  }

  function scheduleSiteGeometryRefresh() {
    refreshSiteGeometry();
    [80, 260, 700].forEach((delay) => {
      window.setTimeout(refreshSiteGeometry, delay);
    });
  }

  let showPreloadPromise = null;

  async function warmShowAssets(options = {}) {
    const keepDisabled = Boolean(options.keepDisabled);
    const startBtn = document.getElementById("siteStart");

    if (!window.BradleySiteShow) {
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = "Demo unavailable";
      }
      return { loaded: 0, failed: 1, total: 0 };
    }

    if (!window.BradleySiteShow.isReady?.()) {
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = "Loading...";
      }
    }

    showPreloadPromise = showPreloadPromise || window.BradleySiteShow.preload();

    try {
      const result = await showPreloadPromise;
      if (result?.failed) {
        showPreloadPromise = null;
        if (startBtn) {
          startBtn.disabled = false;
          startBtn.textContent = "Retry loading";
        }
        return result;
      }

      if (startBtn && !keepDisabled && startBtn.textContent !== "Replay") {
        startBtn.disabled = false;
        startBtn.textContent = "Play demonstration";
      }
      return result;
    } catch (error) {
      showPreloadPromise = null;
      console.warn("[Bradley site] show preload failed", error);
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = "Retry loading";
      }
      return { loaded: 0, failed: 1, total: 0 };
    }
  }

  function initSiteMode() {
    document.body.classList.add("site-mode");
    document.documentElement.classList.add("site-mode");

    muteMic();
    injectDemoBar();

    if (!window.BradleySiteShow) {
      console.error("[Bradley site] show module missing");
      return;
    }

    window.BradleySiteShow.init();
    scheduleSiteGeometryRefresh();
    window.addEventListener("resize", scheduleSiteGeometryRefresh, { passive: true });
    window.visualViewport?.addEventListener("resize", scheduleSiteGeometryRefresh, { passive: true });
    window.visualViewport?.addEventListener("scroll", scheduleSiteGeometryRefresh, { passive: true });
    window.setTimeout(() => warmShowAssets(), 250);

    const startBtn = document.getElementById("siteStart");
    const stopBtn = document.getElementById("siteStop");
    let runPending = false;
    if (startBtn) {
      startBtn.addEventListener("click", async () => {
        if (runPending) return;
        runPending = true;
        startBtn.disabled = true;
        try {
          const preloadResult = await warmShowAssets({ keepDisabled: true });
          if (preloadResult?.failed) return;
          window.BradleySiteShow.reset();
          startBtn.disabled = true;
          startBtn.textContent = "Playing...";
          stopBtn.hidden = false;
          document.body.classList.add("show-running");
          await window.BradleySiteShow.run();
        } finally {
          runPending = false;
          document.body.classList.remove("show-running");
          const returnFocus = document.activeElement === stopBtn;
          stopBtn.hidden = true;
          startBtn.disabled = false;
          if (returnFocus) startBtn.focus();
        }
      });
    }
    stopBtn?.addEventListener("click", () => {
      window.BradleySiteShow.stop();
      startBtn.disabled = true;
    });
    window.addEventListener("pagehide", () => window.BradleySiteShow.stop());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteMode);
  } else {
    initSiteMode();
  }
})();
