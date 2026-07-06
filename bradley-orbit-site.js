(function () {
  const SITE_TABS = [
    { label: "Bradley", hash: "#bradley-live" },
    { label: "Why", hash: "#difference" },
    { label: "Home", hash: "#residential" },
    { label: "Work", hash: "#commercial" },
    { label: "Contact", hash: "#contact" },
  ];

  function scrollParentTo(hash) {
    const parent = window.parent;
    if (!parent || parent === window) {
      location.hash = hash;
      return;
    }
    if (hash === "#bradley-live") {
      parent.scrollTo({ top: 0, behavior: "smooth" });
      parent.location.hash = hash;
      return;
    }
    const target = parent.document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    parent.location.hash = hash;
  }

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

  function wireTabs() {
    const buttons = [...document.querySelectorAll(".tabs button")];
    buttons.forEach((btn, index) => {
      const tab = SITE_TABS[index];
      if (!tab) return;
      btn.textContent = tab.label;
      btn.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          buttons.forEach((b) => b.classList.remove("on"));
          btn.classList.add("on");
          scrollParentTo(tab.hash);
        },
        true
      );
    });
  }

  function injectDemoBar() {
    const surface = document.getElementById("surface");
    const system = document.getElementById("system");
    if (!surface || !system || document.getElementById("demoAtoms")) return;

    const demoAtoms = document.createElement("div");
    demoAtoms.id = "demoAtoms";
    demoAtoms.setAttribute("aria-live", "polite");
    system.appendChild(demoAtoms);

    const bar = document.createElement("div");
    bar.className = "site-demo-bar";
    bar.innerHTML =
      '<div class="site-bradley-name">Bradley</div><p id="siteCaption" aria-live="assertive"></p><p id="siteStatus" aria-live="polite">Loading show</p><button type="button" id="siteStart" disabled>Loading show...</button>';
    surface.appendChild(bar);
  }

  function setSiteHeroCopy() {
    const top = document.querySelector("#surface > .top");
    const title = top?.querySelector(".title");
    const sub = top?.querySelector(".sub");
    if (!top || !title || !sub) return;

    top.classList.add("site-brand-lockup");
    title.textContent = "Meet Bradley.";
    sub.innerHTML =
      '<span class="site-headline">Agentic intelligence for intelligent environments.</span><span class="site-eyebrow">BIG AV · AV is IT · AI UX · UC</span>';
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
        startBtn.textContent = "Show unavailable";
      }
      return { loaded: 0, failed: 1, total: 0 };
    }

    if (!window.BradleySiteShow.isReady?.()) {
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = "Loading show...";
      }
    }

    showPreloadPromise = showPreloadPromise || window.BradleySiteShow.preload();

    try {
      const result = await showPreloadPromise;
      if (result?.failed) {
        showPreloadPromise = null;
        if (startBtn) {
          startBtn.disabled = false;
          startBtn.textContent = "Retry loading show";
        }
        return result;
      }

      if (startBtn && !keepDisabled && startBtn.textContent !== "Run it again") {
        startBtn.disabled = false;
        startBtn.textContent = "Let Bradley speak";
      }
      return result;
    } catch (error) {
      showPreloadPromise = null;
      console.warn("[Bradley site] show preload failed", error);
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = "Retry loading show";
      }
      return { loaded: 0, failed: 1, total: 0 };
    }
  }

  function initSiteMode() {
    document.body.classList.add("site-mode");
    document.documentElement.classList.add("site-mode");

    setSiteHeroCopy();

    muteMic();
    injectDemoBar();
    wireTabs();

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
    if (startBtn) {
      startBtn.addEventListener("click", async () => {
        if (startBtn.textContent === "Run it again") window.BradleySiteShow.reset();
        startBtn.disabled = true;
        const preloadResult = await warmShowAssets({ keepDisabled: true });
        if (preloadResult?.failed) return;

        startBtn.textContent = "Bradley is speaking...";
        document.body.classList.add("show-running");
        try {
          await window.BradleySiteShow.run();
        } finally {
          document.body.classList.remove("show-running");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteMode);
  } else {
    initSiteMode();
  }
})();
