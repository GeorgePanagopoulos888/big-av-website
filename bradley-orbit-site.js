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
      '<div class="site-bradley-name">Bradley</div><p id="siteCaption" aria-live="assertive"></p><p id="siteStatus" aria-live="polite">Live demo</p><button type="button" id="siteStart">Let Bradley speak</button>';
    surface.appendChild(bar);
  }

  function setSiteHeroCopy() {
    const top = document.querySelector("#surface > .top");
    const title = top?.querySelector(".title");
    const sub = top?.querySelector(".sub");
    if (!top || !title || !sub) return;

    top.classList.add("site-brand-lockup");
    title.textContent = "BIG AV";
    sub.innerHTML =
      '<span class="site-headline">Take control of everything.<br>Without having to do anything.</span><span class="site-eyebrow">AV is IT · AI UX · UC</span>';
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

    const startBtn = document.getElementById("siteStart");
    if (startBtn) {
      startBtn.addEventListener("click", async () => {
        if (startBtn.textContent === "Run it again") window.BradleySiteShow.reset();
        startBtn.disabled = true;
        document.body.classList.add("show-running");
        await window.BradleySiteShow.run();
        document.body.classList.remove("show-running");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteMode);
  } else {
    initSiteMode();
  }
})();
