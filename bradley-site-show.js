/* —— Bradley live show: cloned voice + orbiting atoms synced to speech —— */
/*
 * TWO COMPLETE ORBITS (12 atoms on 12 slots; no intentional gaps):
 * Phase 1: Apps, Layer, Coffee, Lights, Climate, Theater, Security, Boardroom, Cameras, Sound, Guests, Time.
 * Beat 10: keep Phase 1 visible through "Then the orbit"; whip/swap on "accelerates".
 * Phase 2: Stocks, SaaS, CRM, Ads, Trials, Video, Posts, Reports, Ops, Content, Email, Approvals.
 * Beat 11 fast-lists the bigger-picture automations. Beat 12 = signup. Beat 01 = core bulb only.
 */

const BRADLEY_TTS = window.BRADLEY_TTS_URL || "http://127.0.0.1:8000";
const ORBIT = { rx: 39, ry: 20, rot: -10 };
const ORBIT_COMPACT = { rx: 38, ry: 22, rot: -10 };
const ORBIT_SLOTS = 12;
const ORBIT_FILL_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const ORBIT_PERIOD_S = 42;
const PHASE2_SPAWNS = [
  { id: "stocks", label: "Stocks", rgb: "255,227,95" },
  { id: "saas", label: "SaaS", rgb: "132,200,255" },
  { id: "crm", label: "CRM", rgb: "85,240,216" },
  { id: "ads", label: "Ads", rgb: "255,120,100" },
  { id: "trials", label: "Trials", rgb: "194,140,255" },
  { id: "video", label: "Video", rgb: "216,171,69" },
  { id: "posts", label: "Posts", rgb: "245,200,94" },
  { id: "reports", label: "Reports", rgb: "158,224,195" },
  { id: "ops", label: "Ops", rgb: "121,227,143" },
  { id: "content", label: "Content", rgb: "255,191,105" },
  { id: "email", label: "Email", rgb: "132,200,255" },
  { id: "approvals", label: "Approvals", rgb: "194,140,255" },
];

const IS_TOUCH_DEVICE = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
const USE_WEB_AUDIO_GLOW = !IS_TOUCH_DEVICE;
const USE_STAGE_WAVES = !IS_TOUCH_DEVICE;
const SPAWN_OUTPUT_LAG_SEC = 0.05;
const ALLOW_LIVE_TTS =
  location.protocol === "http:" &&
  (location.hostname === "127.0.0.1" || location.hostname === "localhost");

const BRADLEY_BUILD = "site-show-37";

console.info("[Bradley] loaded", BRADLEY_BUILD, {
  ringSlots: ORBIT_FILL_SLOTS.length,
  phase2Count: PHASE2_SPAWNS.length,
  phase2Labels: PHASE2_SPAWNS.map((atom) => atom.label),
  touchDevice: IS_TOUCH_DEVICE,
  webAudioGlow: USE_WEB_AUDIO_GLOW,
  stageWaves: USE_STAGE_WAVES,
  spawnLagSec: SPAWN_OUTPUT_LAG_SEC,
  liveTts: ALLOW_LIVE_TTS,
});

window.__bradleyDebug = {
  build: BRADLEY_BUILD,
  ringSlots: ORBIT_FILL_SLOTS.length,
  phase2Labels: PHASE2_SPAWNS.map((atom) => atom.label),
  visibleAtoms: () =>
    [...document.querySelectorAll("#demoAtoms .label")].map((node) =>
      node.textContent.trim()
    ),
  swapNow: async () => {
    await orbitAccelerateTransition();
    spawnPhase2Orbit(PHASE2_SPAWNS);
    return window.__bradleyDebug.visibleAtoms();
  },
};

const BRADLEY_SCRIPT = [
  {
    id: "beat_01",
    title: "Intro",
    line: "Good day. I'm Bradley. Big A.V.'s butler intelligence for homes, offices, and venues.",
    speakParts: ["Good day. I'm Bradley.", "Big A.V.'s butler intelligence for homes, offices, and venues."],
    partPauseMs: 520,
    spawn: [],
  },
  {
    id: "beat_02",
    title: "Friction",
    line: "No more app-hunting, wall tapping, or guessing which screen rules what.",
    speak: "No more app-hunting, wall tapping, or guessing which screen rules what.",
    spawn: [{ id: "apps", label: "Apps", rgb: "255,120,100", atSec: 0.48, lagSec: 0 }],
  },
  {
    id: "beat_03",
    title: "Layer",
    line: "One calm intelligence listens, takes a breath… decides, then sets rooms in motion.",
    speak: "One calm intelligence listens, takes a breath… decides, then sets rooms in motion.",
    spawn: [{ id: "layer", label: "Layer", rgb: "216,171,69", atSec: 0.95, lagSec: 0 }],
  },
  {
    id: "beat_04",
    title: "Morning",
    line: "Morning arrives: coffee starts, lights soften, and music finds breakfast.",
    speak: "Morning arrives: coffee starts, lights soften, and music finds breakfast.",
    spawn: [
      { id: "coffee", label: "Coffee", rgb: "255,191,105", atSec: 1.45, slot: 2, lagSec: 0 },
      { id: "lights", label: "Lights", rgb: "255,227,95", atSec: 2.12, slot: 0, lagSec: 0 },
    ],
  },
  {
    id: "beat_05",
    title: "Comfort",
    line: "Comfort settles: climate adjusts, theater waits, and security watches.",
    speak: "Comfort settles: climate adjusts, theater waits, and security watches.",
    spawn: [
      { id: "climate", label: "Climate", rgb: "121,227,143", atSec: 0.86 },
      { id: "theater", label: "Theater", rgb: "245,200,94", atSec: 2.58 },
      { id: "security", label: "Security", rgb: "194,140,255", atSec: 3.44 },
    ],
  },
  {
    id: "beat_06",
    title: "Boardroom",
    line: "In the boardroom, presentations start before anyone reaches for a cable.",
    speak: "In the boardroom, presentations start before anyone reaches for a cable.",
    spawn: [{ id: "boardroom", label: "Boardroom", rgb: "132,200,255", atSec: 0.11 }],
  },
  {
    id: "beat_07",
    title: "Work",
    line: "Cameras frame speakers, sound balances, notes appear where teams expect them.",
    speak: "Cameras frame speakers, sound balances, notes appear where teams expect them.",
    spawn: [
      { id: "cameras", label: "Cameras", rgb: "85,240,216", atSec: 0.18 },
      { id: "sound", label: "Sound", rgb: "158,224,195", atSec: 1.96 },
    ],
  },
  {
    id: "beat_08",
    title: "Welcome",
    line: "At home, guests feel welcome without learning controls.",
    speak: "At home, guests feel welcome without learning controls.",
    spawn: [{ id: "guests", label: "Guests", rgb: "255,227,95", atSec: 0.98 }],
  },
  {
    id: "beat_09",
    title: "Time",
    line: "Staff regain time usually lost to setup rituals.",
    speak: "Staff regain time usually lost to setup rituals.",
    spawn: [{ id: "time", label: "Time", rgb: "216,171,69", atSec: 0.82 }],
  },
  {
    id: "beat_10",
    title: "Expansion",
    line: "Then the orbit accelerates.",
    speakParts: ["Then the orbit ", "accelerates."],
    // Phase 1 stays visible through "Then the orbit".
    // The whip/swap starts when beat_10-p1.wav begins saying "accelerates.".
    orbitSwapOnPart: 1,
    orbitSwapDelayMs: 40,
    phase2Spawns: PHASE2_SPAWNS,
    spawn: [],
  },
  {
    id: "beat_11",
    title: "Bigger Picture",
    line: "Stocks, SaaS, CRM, ads, trials, video, posts, reports, ops, content, email, approvals—one layer.",
    speak:
      "Stocks, SaaS, CRM, ads, trials, video, posts, reports, ops, content, email, approvals—one layer.",
    spawn: [],
  },
  {
    id: "beat_12",
    title: "Signup",
    line: "Sign up, and see what Big A.V. makes possible next. This is only the beginning.",
    speakParts: [
      "Sign up, and see what Big A.V. makes possible next. This is only,",
      "the beginning.",
    ],
    partPauseMs: 420,
    spawn: [],
    signup: true,
  },
];

let liveSystem = null;
let bradleyCore = null;
let liveAtoms = null;
let bradleyLine = null;
let startBtn = null;
let voiceStatus = null;
let bradleyBulbImg = null;
let stageVizCanvas = null;
let stageVizCtx = null;
let filamentCanvas = null;
let filamentCtx = null;
const speechVizData = new Float32Array(1024);

function ensureCanvas(id, parent, className) {
  let canvas = document.getElementById(id);
  if (!canvas && parent) {
    canvas = document.createElement("canvas");
    canvas.id = id;
    canvas.className = className;
    canvas.setAttribute("aria-hidden", "true");
    parent.prepend(canvas);
  }
  return canvas;
}

function initShowDom() {
  liveSystem = document.getElementById("system");
  bradleyCore = document.getElementById("core");
  liveAtoms = document.getElementById("demoAtoms");
  bradleyLine = document.getElementById("siteCaption");
  startBtn = document.getElementById("siteStart");
  voiceStatus = document.getElementById("siteStatus");
  bradleyBulbImg = bradleyCore?.querySelector("img") || null;
  stageVizCanvas = USE_STAGE_WAVES ? ensureCanvas("stage-viz-canvas", liveSystem, "site-stage-viz") : null;
  filamentCanvas = ensureCanvas("filament-canvas", bradleyCore, "site-filament-viz");
}

let showRunning = false;
let glowRaf = 0;
let glowSmooth = 0;
let bradleyAudioCtx = null;
let bradleyAnalyser = null;
const bradleyAudioSources = new WeakMap();
const bakedVoiceCache = new Map();
let bakedVoiceWarmupPromise = null;
let bakedVoiceReady = false;
let bakedVoiceLastResult = null;
let currentAudio = null;
let spawnTimers = [];
let spawnRaf = 0;
let phase1SlotIdx = 0;
let orbitPhase = 0;
let orbitPeriodCurrent = ORBIT_PERIOD_S;
let orbitRaf = 0;
let orbitLastTs = 0;
const spawned = new Set();

function compactStageMode() {
  return window.matchMedia("(max-width: 760px)").matches || IS_TOUCH_DEVICE;
}

function activeOrbitConfig() {
  return compactStageMode() ? ORBIT_COMPACT : ORBIT;
}

function orbitPositionsFrozen() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setSiteDemoStatus(text, isError = false) {
  if (!voiceStatus) return;
  voiceStatus.textContent = text;
  voiceStatus.classList.toggle("is-error", isError);
}

function clearSpawnTimers() {
  spawnTimers.forEach((id) => window.clearTimeout(id));
  spawnTimers = [];
  if (spawnRaf) {
    cancelAnimationFrame(spawnRaf);
    spawnRaf = 0;
  }
}

function pauseCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

function stopAudio() {
  clearSpawnTimers();
  pauseCurrentAudio();
}

function stopOrbitMotion() {
  if (orbitRaf) cancelAnimationFrame(orbitRaf);
  orbitRaf = 0;
  orbitLastTs = 0;
}

function clearShowVisualState() {
  stopGlow();
  stopAudio();
  stopOrbitMotion();
  orbitPhase = 0;
  orbitPeriodCurrent = ORBIT_PERIOD_S;
  phase1SlotIdx = 0;
  spawned.clear();
  if (liveAtoms) liveAtoms.innerHTML = "";
}

function positionOnOrbit(node, slot, phaseRad = orbitPhase) {
  const baseRad = (-90 * Math.PI) / 180 + slot * ((2 * Math.PI) / ORBIT_SLOTS);
  const rad = baseRad + phaseRad;
  const orbit = activeOrbitConfig();
  const rot = (orbit.rot * Math.PI) / 180;
  const x = orbit.rx * Math.cos(rad);
  const y = orbit.ry * Math.sin(rad);
  const xr = x * Math.cos(rot) - y * Math.sin(rot);
  const yr = x * Math.sin(rot) + y * Math.cos(rot);
  node.style.left = `${50 + xr}%`;
  node.style.top = `${50 + yr}%`;
}

function orbitLoop(ts) {
  if (orbitPositionsFrozen()) {
    orbitRaf = 0;
    orbitLastTs = 0;
    return;
  }

  if (!orbitLastTs) orbitLastTs = ts;
  const dt = Math.min(0.05, (ts - orbitLastTs) / 1000);
  orbitLastTs = ts;
  orbitPhase += (dt * (2 * Math.PI)) / orbitPeriodCurrent;

  liveAtoms?.querySelectorAll(".live-node").forEach((node) => {
    const slot = Number(node.dataset.slot);
    if (!Number.isNaN(slot)) positionOnOrbit(node, slot);
  });

  if (showRunning || spawned.size > 0) {
    orbitRaf = requestAnimationFrame(orbitLoop);
  } else {
    orbitRaf = 0;
    orbitLastTs = 0;
  }
}

function ensureOrbitMotion() {
  if (orbitPositionsFrozen()) return;
  if (!orbitRaf) orbitRaf = requestAnimationFrame(orbitLoop);
}

async function orbitAccelerateTransition() {
  if (!liveAtoms) return;
  const nodes = [...liveAtoms.querySelectorAll(".live-node")];
  if (!nodes.length) return;

  ensureOrbitMotion();
  const whipMs = 1100;
  const start = performance.now();
  const startPeriod = orbitPeriodCurrent;
  const endPeriod = 1.1;

  await new Promise((resolve) => {
    const whip = (ts) => {
      const t = Math.min(1, (ts - start) / whipMs);
      orbitPeriodCurrent = startPeriod + (endPeriod - startPeriod) * t * t;
      if (t < 1) requestAnimationFrame(whip);
      else resolve();
    };
    requestAnimationFrame(whip);
  });

  nodes.forEach((node) => node.classList.add("live-node--exit"));
  await new Promise((r) => setTimeout(r, 420));

  if (liveAtoms) liveAtoms.innerHTML = "";
  spawned.clear();
  phase1SlotIdx = 0;
  orbitPeriodCurrent = ORBIT_PERIOD_S;
}

function spawnPhase2Orbit(atoms = PHASE2_SPAWNS) {
  if (!atoms?.length || !liveAtoms) return;

  const fullOrbit = atoms.slice(0, ORBIT_FILL_SLOTS.length);

  console.info("[Bradley] spawning full phase 2 orbit", {
    count: fullOrbit.length,
    labels: fullOrbit.map((atom) => atom.label),
  });

  fullOrbit.forEach((atom, index) => {
    spawnAtom({ ...atom, slot: ORBIT_FILL_SLOTS[index] });
  });
}

function resolveSpawnSec(atom, audios, pauseMs, beat) {
  let sec;
  if (Number.isFinite(atom.atSec)) {
    sec = atom.atSec;
  } else {
    const totalSec = totalBeatDuration(audios, pauseMs, beat);
    sec = Math.max(0.35, (atom.at ?? 0) * totalSec);
  }
  const lag = Number.isFinite(atom.lagSec) ? atom.lagSec : SPAWN_OUTPUT_LAG_SEC;
  return sec + lag;
}

function createSpawnWatcher(spawnList, audios, pauseMs, beat) {
  const pending = [...(spawnList || [])]
    .map((atom) => ({ ...atom, atSec: resolveSpawnSec(atom, audios, pauseMs, beat) }))
    .sort((a, b) => a.atSec - b.atSec);

  const activeParts = new Map();
  const bindings = [];
  let running = false;

  const tick = () => {
    if (!showRunning || !pending.length) return;

    for (const [audio, state] of activeParts) {
      if (!audio || audio.paused || audio.ended) continue;

      let t;
      if (IS_TOUCH_DEVICE && state.playStartWall) {
        t = state.partOffsetSec + (performance.now() - state.playStartWall) / 1000;
      } else {
        if ((audio.currentTime || 0) < 0.04) continue;
        t = state.partOffsetSec + audio.currentTime;
      }
      while (pending.length && t >= pending[0].atSec) {
        spawnAtom(pending.shift());
      }
      if (!pending.length) break;
    }
  };

  const loop = () => {
    tick();
    if (running && showRunning && pending.length) {
      spawnRaf = requestAnimationFrame(loop);
    } else {
      spawnRaf = 0;
    }
  };

  const ensureLoop = () => {
    if (!running || spawnRaf) return;
    spawnRaf = requestAnimationFrame(loop);
  };

  const attach = (audio, partOffsetSec) => {
    const state = { partOffsetSec, playStartWall: 0 };
    activeParts.set(audio, state);
    const wake = () => {
      if (!state.playStartWall) state.playStartWall = performance.now();
      ensureLoop();
    };
    audio.addEventListener("playing", wake);
    audio.addEventListener("timeupdate", wake);
    bindings.push([audio, wake]);
  };

  const cleanup = () => {
    running = false;
    bindings.forEach(([audio, fn]) => {
      audio.removeEventListener("playing", fn);
      audio.removeEventListener("timeupdate", fn);
    });
    bindings.length = 0;
    activeParts.clear();
    if (spawnRaf) {
      cancelAnimationFrame(spawnRaf);
      spawnRaf = 0;
    }
  };

  const start = () => {
    running = true;
    ensureLoop();
  };

  return { attach, cleanup, start, pending };
}

function scheduleSpawnCues(spawnList, durationSec) {
  if (!spawnList?.length || !durationSec) return;

  const sorted = [...spawnList]
    .map((atom) => ({
      ...atom,
      atSec: (Number.isFinite(atom.atSec) ? atom.atSec : (atom.at ?? 0) * durationSec) + SPAWN_OUTPUT_LAG_SEC,
    }))
    .sort((a, b) => a.atSec - b.atSec);

  sorted.forEach((atom) => {
    const delayMs = Math.max(0, atom.atSec * 1000);
    const timer = window.setTimeout(() => {
      if (showRunning) spawnAtom(atom);
    }, delayMs);
    spawnTimers.push(timer);
  });
}

function beatSpeakParts(beat) {
  if (beat.speakParts?.length) return beat.speakParts;
  return [beat.speak || beat.line];
}

function bakedVoicePath(beatId, partIndex, partCount) {
  if (partCount > 1) return `assets/bradley-voice/${beatId}-p${partIndex}.wav`;
  return `assets/bradley-voice/${beatId}.wav`;
}

function waitAudioMeta(audio) {
  return new Promise((resolve, reject) => {
    if (audio.readyState >= 1) {
      resolve(audio);
      return;
    }
    audio.addEventListener("loadedmetadata", () => resolve(audio), { once: true });
    audio.addEventListener("error", () => reject(new Error("metadata failed")), { once: true });
    audio.load();
  });
}

function waitAudioPlayable(audio) {
  return new Promise((resolve, reject) => {
    if (audio.readyState >= 3) {
      resolve(audio);
      return;
    }

    let timer = 0;
    const cleanup = () => {
      window.clearTimeout(timer);
      audio.removeEventListener("canplaythrough", ready);
      audio.removeEventListener("loadeddata", ready);
      audio.removeEventListener("error", failed);
    };
    const ready = () => {
      cleanup();
      resolve(audio);
    };
    const failed = () => {
      cleanup();
      reject(new Error("audio preload failed"));
    };

    audio.addEventListener("canplaythrough", ready, { once: true });
    audio.addEventListener("loadeddata", ready, { once: true });
    audio.addEventListener("error", failed, { once: true });
    timer = window.setTimeout(() => {
      if (audio.readyState >= 2) ready();
      else failed();
    }, 7000);
    audio.load();
  });
}

function bakedVoiceAssets() {
  return BRADLEY_SCRIPT.flatMap((beat) => {
    const parts = beatSpeakParts(beat);
    return parts.map((_, index) => bakedVoicePath(beat.id, index, parts.length));
  });
}

async function loadCachedBakedAudio(path) {
  const cached = bakedVoiceCache.get(path);
  if (cached) return cached.promise;

  const audio = new Audio();
  const promise = (async () => {
    if (location.protocol === "http:" || location.protocol === "https:") {
      const response = await fetch(path, { cache: "force-cache" });
      if (!response.ok) throw new Error(`voice asset ${response.status}`);
      const blob = await response.blob();
      audio.src = URL.createObjectURL(blob);
    } else {
      audio.src = path;
    }
    audio.preload = "auto";
    return waitAudioPlayable(audio);
  })()
    .then(() => audio)
    .catch((error) => {
      bakedVoiceCache.delete(path);
      throw error;
    });
  bakedVoiceCache.set(path, { audio, promise });
  return promise;
}

function ensureBradleyAudioGraph() {
  if (!USE_WEB_AUDIO_GLOW) return null;
  if (!bradleyAudioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    bradleyAudioCtx = new Ctx({ latencyHint: "interactive" });
    bradleyAnalyser = bradleyAudioCtx.createAnalyser();
    bradleyAnalyser.fftSize = 512;
    bradleyAnalyser.smoothingTimeConstant = 0.55;
    bradleyAnalyser.minDecibels = -82;
    bradleyAnalyser.maxDecibels = -18;
    bradleyAnalyser.connect(bradleyAudioCtx.destination);
  }
  if (bradleyAudioCtx.state === "suspended") {
    bradleyAudioCtx.resume().catch(() => {});
  }
  return bradleyAnalyser;
}

function bindAudioAnalyser(audio) {
  if (!USE_WEB_AUDIO_GLOW || !audio || bradleyAudioSources.has(audio)) return;
  const analyser = ensureBradleyAudioGraph();
  if (!analyser || !bradleyAudioCtx) return;
  try {
    const source = bradleyAudioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    bradleyAudioSources.set(audio, source);
  } catch {
    /* element may already be wired in this session */
  }
}

async function playAudioOnly(audio) {
  pauseCurrentAudio();
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch {
    /* Some browsers only allow seek after metadata is ready. */
  }
  currentAudio = audio;
  bindAudioAnalyser(audio);

  const tryPlay = () =>
    new Promise((resolve, reject) => {
      audio.onended = () => {
        currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        currentAudio = null;
        reject(new Error("playback failed"));
      };
      audio.play().catch(reject);
    });

  try {
    await tryPlay();
  } catch {
    audio.load();
    await new Promise((r) => setTimeout(r, 120));
    await tryPlay();
  }
}

async function loadBakedParts(beat) {
  const parts = beatSpeakParts(beat);
  const loaded = [];
  for (let i = 0; i < parts.length; i += 1) {
    loaded.push(await loadCachedBakedAudio(bakedVoicePath(beat.id, i, parts.length)));
  }
  return loaded;
}

function totalBeatDuration(audios, pauseMs, beat) {
  const audioSec = audios.reduce(
    (sum, audio) => sum + (Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0),
    0
  );
  const gaps = Math.max(0, audios.length - 1) * (pauseMs / 1000);
  const measured = audioSec + gaps;
  if (measured >= 1.5) return measured;

  const text = beat ? beatSpeakParts(beat).join(" ") : "";
  return Math.max(measured, Math.max(3.8, text.length * 0.058));
}

async function runOrbitSwap(beat) {
  await orbitAccelerateTransition();

  if (!showRunning) return;

  spawnPhase2Orbit(beat.phase2Spawns || PHASE2_SPAWNS);
}

async function playBeatAudio(audios, beat) {
  clearSpawnTimers();
  const pauseMs = beat.partPauseMs ?? 0;
  const totalSec = totalBeatDuration(audios, pauseMs, beat);
  const spawnWatcher = createSpawnWatcher(beat.spawn, audios, pauseMs, beat);
  spawnWatcher.start();

  startGlow();

  let orbitSwapPromise = null;
  let orbitSwapTimer = null;
  let partOffsetSec = 0;

  const fireOrbitSwap = () => {
    if (!showRunning || orbitSwapPromise) return;
    orbitSwapPromise = runOrbitSwap(beat);
  };

  if (Number.isFinite(beat.orbitSwapAt)) {
    const maxMs = Math.max(0, totalSec * 1000 - 100);
    const delayMs = Math.min(beat.orbitSwapAt * 1000, maxMs);
    orbitSwapTimer = window.setTimeout(fireOrbitSwap, delayMs);
    spawnTimers.push(orbitSwapTimer);
  }

  for (let i = 0; i < audios.length; i += 1) {
    if (i > 0 && pauseMs) {
      await new Promise((r) => setTimeout(r, pauseMs));
      partOffsetSec += pauseMs / 1000;
    }
    if (!showRunning) break;

    const shouldSwapOnPart = beat.orbitSwapOnPart === i || beat.orbitResetOnPart === i;
    spawnWatcher.attach(audios[i], partOffsetSec);

    if (shouldSwapOnPart) {
      const audioDone = playAudioOnly(audios[i]);
      const delayMs = Math.max(0, beat.orbitSwapDelayMs ?? 0);

      if (delayMs) {
        const timer = window.setTimeout(fireOrbitSwap, delayMs);
        spawnTimers.push(timer);
      } else {
        fireOrbitSwap();
      }

      await audioDone;
      partOffsetSec += audios[i].duration || 0;
      continue;
    }

    await playAudioOnly(audios[i]);
    partOffsetSec += audios[i].duration || 0;
  }

  spawnWatcher.cleanup();
  if (orbitSwapTimer) window.clearTimeout(orbitSwapTimer);
  if (orbitSwapPromise) await orbitSwapPromise;
}

async function fetchLivePart(text) {
  const res = await fetch(`${BRADLEY_TTS}/api/speak`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`speak ${res.status}`);
  const mode = res.headers.get("X-Bradley-TTS") || "";
  if (mode.startsWith("fallback")) throw new Error("fallback voice rejected");
  const blob = await res.blob();
  if (!blob || blob.size < 1000) throw new Error("empty audio");
  const audio = new Audio(URL.createObjectURL(blob));
  await waitAudioMeta(audio);
  return audio;
}

async function playCaptionFallback(beat, fullText) {
  setSiteDemoStatus("Voice unavailable · captions only", true);
  const captionDuration = Math.max(5, fullText.length * 0.058);
  await new Promise((r) => setTimeout(r, 280));
  scheduleSpawnCues(beat.spawn, captionDuration);

  if (beat.phase2Spawns?.length) {
    const fallbackSwapDelayMs = Math.max(700, Math.min(1400, captionDuration * 350));
    const timer = window.setTimeout(async () => {
      if (!showRunning) return;
      await runOrbitSwap(beat);
    }, fallbackSwapDelayMs);
    spawnTimers.push(timer);
  }

  startGlow();
  await new Promise((r) => setTimeout(r, Math.max(3200, fullText.length * 50)));
  stopGlow();
  return false;
}

async function speakBradley(beat) {
  const parts = beatSpeakParts(beat);
  const fullText = parts.join(" ");

  try {
    const audios = await loadBakedParts(beat);
    await playBeatAudio(audios, beat);
    setSiteDemoStatus("Bradley is speaking");
    return true;
  } catch {
    /* try live TTS when developing */
  }

  if (!ALLOW_LIVE_TTS) {
    return playCaptionFallback(beat, fullText);
  }

  try {
    const audios = [];
    for (const text of parts) {
      audios.push(await fetchLivePart(text));
    }
    await playBeatAudio(audios, beat);
    setSiteDemoStatus("Bradley is speaking · live");
    return true;
  } catch {
    return playCaptionFallback(beat, fullText);
  }
}

function readVoiceAmplitudeSynthetic() {
  if (!currentAudio || currentAudio.paused) return glowSmooth * 0.88;
  const t = currentAudio.currentTime || 0;
  const w =
    Math.abs(Math.sin(t * 10.8)) * 0.52 +
    Math.abs(Math.sin(t * 6.4 + 0.8)) * 0.34 +
    Math.abs(Math.sin(t * 15.2 + 1.4)) * 0.18;
  glowSmooth = glowSmooth * 0.48 + w * 0.52;
  return Math.min(1, Math.max(0, glowSmooth * 1.65 + 0.12));
}

function readVoiceAmplitude() {
  if (!USE_WEB_AUDIO_GLOW || !bradleyAnalyser) {
    return readVoiceAmplitudeSynthetic();
  }
  const bins = new Uint8Array(bradleyAnalyser.frequencyBinCount);
  bradleyAnalyser.getByteFrequencyData(bins);
  let sum = 0;
  const start = 2;
  const end = Math.min(36, bins.length);
  for (let i = start; i < end; i += 1) sum += bins[i];
  const raw = sum / ((end - start) * 255);
  const peak = Math.max(...bins.slice(start, end)) / 255;
  const blend = raw * 0.62 + peak * 0.38;
  glowSmooth = glowSmooth * 0.52 + blend * 0.48;
  return Math.min(1, Math.max(0, glowSmooth * 1.72 + 0.1));
}

function updateSpeechViz() {
  const t = Date.now() / 260;
  for (let i = 0; i < speechVizData.length; i += 1) {
    const p = i / speechVizData.length;
    speechVizData[i] = Math.sin(p * 32 + t) * 0.22 + Math.sin(p * 71 + t * 0.7) * 0.08;
  }
  return speechVizData;
}

function bulbBreathLevel(amp = 0, hot = false) {
  const breath = (Math.sin(Date.now() / 2100) + 1) / 2;
  if (hot) return Math.min(1, 0.68 + breath * 0.18 + amp * 0.12);
  return 0.07 + breath * 0.07;
}

function resizeStageVizCanvas() {
  if (!USE_STAGE_WAVES) return;
  if (!stageVizCanvas || !liveSystem) return;
  const rect = liveSystem.getBoundingClientRect();
  const w = Math.max(280, Math.round(rect.width));
  const h = Math.max(280, Math.round(rect.height));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (stageVizCanvas.width !== pw || stageVizCanvas.height !== ph) {
    stageVizCanvas.width = pw;
    stageVizCanvas.height = ph;
    stageVizCtx = stageVizCanvas.getContext("2d");
    if (stageVizCtx) stageVizCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function resizeFilamentCanvas() {
  if (!filamentCanvas || !bradleyCore) return;
  const rect = bradleyCore.getBoundingClientRect();
  const size = Math.max(180, Math.round(rect.width * 0.78));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const px = Math.round(size * dpr);
  if (filamentCanvas.width !== px || filamentCanvas.height !== px) {
    filamentCanvas.width = px;
    filamentCanvas.height = px;
    filamentCtx = filamentCanvas.getContext("2d");
    if (filamentCtx) filamentCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  filamentCanvas.style.width = `${size}px`;
  filamentCanvas.style.height = `${size}px`;
}

function bradleyCoreCenter() {
  if (!bradleyCore || !liveSystem) return { x: 0, y: 0 };
  const stage = liveSystem.getBoundingClientRect();
  const core = bradleyCore.getBoundingClientRect();
  return {
    x: core.left - stage.left + core.width / 2,
    y: core.top - stage.top + core.height / 2,
  };
}

function drawBradleyStageGlow(cx, cy, stageW, stageH, b, hot) {
  if (!stageVizCtx) return;
  const R = Math.min(stageW, stageH) * 0.165;
  const gr = stageVizCtx.createRadialGradient(cx, cy, R * 0.3, cx, cy, Math.max(stageW, stageH) * 0.95);
  if (hot) {
    gr.addColorStop(0, `rgba(255,176,72,${0.5 * b})`);
    gr.addColorStop(0.45, `rgba(255,150,52,${0.14 * b})`);
    gr.addColorStop(1, "rgba(255,150,52,0)");
  } else {
    gr.addColorStop(0, `rgba(214,176,80,${0.16 * b + 0.05})`);
    gr.addColorStop(0.5, `rgba(190,150,70,${0.05 * b})`);
    gr.addColorStop(1, "rgba(190,150,70,0)");
  }
  stageVizCtx.fillStyle = gr;
  stageVizCtx.fillRect(0, 0, stageW, stageH);
}

function drawBradleyVoiceWaves(cx, cy, hot, ampBase, layer = "all") {
  if (!stageVizCtx || ampBase <= 0) return;
  const t = performance.now() / 420;
  const color = hot ? "255,190,92" : "132,200,255";
  const scale = Math.min(1.15, (liveSystem?.clientWidth || 720) / 720);

  if (layer === "all" || layer === "outer") {
    for (let band = 0; band < 3; band += 1) {
      const radius = (150 + band * 34 + Math.sin(t + band) * 6) * scale;
      const amp = (18 + band * 7) * ampBase;
      stageVizCtx.beginPath();
      for (let i = 0; i <= 220; i += 1) {
        const a = (Math.PI * 2 * i) / 220;
        const wobble = Math.sin(a * 5 + t * 1.8 + band) * amp + Math.sin(a * 11 - t * 0.9) * amp * 0.38;
        const rx = radius + wobble;
        const ry = radius * 0.58 + wobble * 0.45;
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        if (i === 0) stageVizCtx.moveTo(x, y);
        else stageVizCtx.lineTo(x, y);
      }
      stageVizCtx.closePath();
      stageVizCtx.strokeStyle = `rgba(${color},${0.26 - band * 0.055})`;
      stageVizCtx.lineWidth = 1.4;
      stageVizCtx.shadowColor = `rgba(${color},0.38)`;
      stageVizCtx.shadowBlur = 16;
      stageVizCtx.stroke();
    }
  }

  if (layer === "all" || layer === "inner") {
    for (let band = 0; band < 2; band += 1) {
      const radius = (70 + band * 18 + Math.sin(t * 1.7 + band) * 5) * scale;
      stageVizCtx.beginPath();
      for (let i = 0; i <= 120; i += 1) {
        const a = (Math.PI * 2 * i) / 120;
        const wobble = Math.sin(a * 7 + t * 3 + band) * 10 * ampBase;
        const x = cx + Math.cos(a) * (radius + wobble);
        const y = cy + Math.sin(a) * (radius * 0.72 + wobble * 0.35);
        if (i === 0) stageVizCtx.moveTo(x, y);
        else stageVizCtx.lineTo(x, y);
      }
      stageVizCtx.closePath();
      stageVizCtx.strokeStyle = `rgba(${color},${0.34 - band * 0.1})`;
      stageVizCtx.lineWidth = 1.2;
      stageVizCtx.shadowColor = `rgba(${color},0.52)`;
      stageVizCtx.shadowBlur = 20;
      stageVizCtx.stroke();
    }
  }
  stageVizCtx.shadowBlur = 0;
}

function drawBradleyStage(b, hot) {
  if (!USE_STAGE_WAVES) return;
  resizeStageVizCanvas();
  if (!stageVizCanvas || !stageVizCtx || !liveSystem) return;
  const stageW = liveSystem.clientWidth;
  const stageH = liveSystem.clientHeight;
  const { x: cx, y: cy } = bradleyCoreCenter();
  const ampBase = hot ? 0.16 + b * 0.08 : 0.06 + b * 0.1;
  stageVizCtx.clearRect(0, 0, stageW, stageH);
  drawBradleyStageGlow(cx, cy, stageW, stageH, b, hot);

  if (bradleyCore && ampBase > 0) {
    const coreRect = bradleyCore.getBoundingClientRect();
    const cutR = Math.max(coreRect.width, coreRect.height) * 0.34;
    stageVizCtx.save();
    stageVizCtx.beginPath();
    stageVizCtx.rect(0, 0, stageW, stageH);
    stageVizCtx.arc(cx, cy, cutR, 0, Math.PI * 2, true);
    stageVizCtx.clip("evenodd");
    drawBradleyVoiceWaves(cx, cy, hot, ampBase, "outer");
    stageVizCtx.restore();
    drawBradleyVoiceWaves(cx, cy, hot, ampBase, "inner");
  } else if (ampBase > 0) {
    drawBradleyVoiceWaves(cx, cy, hot, ampBase, "all");
  }
}

function drawFilamentGlow(b, hot) {
  resizeFilamentCanvas();
  if (!filamentCanvas || !filamentCtx) return;
  const size = filamentCanvas.clientWidth || filamentCanvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.36;
  filamentCtx.clearRect(0, 0, size, size);

  const fy = cy + R * 0.74;
  const topY = cy - R * 0.5;
  const loops = 5;
  const span = R * 0.82;
  const x0 = cx - span / 2;
  const step = span / loops;

  filamentCtx.lineWidth = Math.max(1.6, R * 0.035);
  filamentCtx.lineCap = "round";
  filamentCtx.strokeStyle =
    b > 0.25
      ? `rgba(255,${150 + 90 * b | 0},${40 + 60 * b | 0},${Math.min(1, 0.55 + b).toFixed(2)})`
      : "rgba(120,95,55,.5)";
  if (b > 0.4) {
    filamentCtx.shadowColor = `rgba(255,170,60,${b.toFixed(2)})`;
    filamentCtx.shadowBlur = R * 0.35;
  }
  filamentCtx.beginPath();
  filamentCtx.moveTo(x0 - R * 0.06, fy);
  filamentCtx.lineTo(x0, fy);
  for (let i = 0; i < loops; i += 1) {
    const x = x0 + i * step;
    filamentCtx.lineTo(x, fy);
    filamentCtx.lineTo(x + step / 2, topY);
    filamentCtx.lineTo(x + step, fy);
  }
  filamentCtx.lineTo(cx + span / 2 + R * 0.06, fy);
  filamentCtx.stroke();
  filamentCtx.shadowBlur = 0;

  if (hot && b > 0.35) {
    const glow = filamentCtx.createRadialGradient(cx, cy + R * 0.1, 0, cx, cy + R * 0.1, R * 0.55);
    glow.addColorStop(0, `rgba(255,188,88,${(0.22 * b).toFixed(3)})`);
    glow.addColorStop(1, "rgba(255,188,88,0)");
    filamentCtx.fillStyle = glow;
    filamentCtx.fillRect(0, 0, size, size);
  }

  filamentCanvas.style.opacity = String(Math.min(1, 0.42 + b * 0.58));
}

function applyBradleyBulbLook(b, hot) {
  const img = bradleyBulbImg || bradleyCore?.querySelector("img");
  if (img) {
    img.style.filter = `drop-shadow(0 0 ${(14 + b * 48).toFixed(0)}px rgba(255,176,72,${(0.3 + b * 0.5).toFixed(2)})) brightness(${(0.92 + b * 0.45).toFixed(2)})`;
  }
  liveSystem?.style.setProperty("--bulb-b", b.toFixed(3));
  liveSystem?.style.setProperty("--bulb-hot", hot ? "1" : "0");
  drawBradleyStage(b, hot);
  drawFilamentGlow(b, hot);
}

function applyVoiceAmp(amp) {
  const value = amp.toFixed(3);
  const speaking = document.body.classList.contains("bradley-speaking");
  const hot = speaking;
  const b = bulbBreathLevel(amp, hot);
  applyBradleyBulbLook(b, hot);
  bradleyCore?.style.setProperty("--voice-amp", value);
  liveSystem?.style.setProperty("--voice-amp", value);
  liveAtoms?.querySelectorAll(".live-node").forEach((node) => {
    node.style.setProperty("--voice-amp", value);
  });
}

function startGlow() {
  document.body.classList.add("bradley-speaking", "speaking");
  if (!IS_TOUCH_DEVICE && typeof beginSpeakingVisual === "function") beginSpeakingVisual("Speaking");
  glowSmooth = 0;

  const loop = () => {
    if (currentAudio && !currentAudio.paused) {
      const t = currentAudio.currentTime || 0;
      const w =
        Math.abs(Math.sin(t * 10.8)) * 0.52 +
        Math.abs(Math.sin(t * 6.4 + 0.8)) * 0.34 +
        Math.abs(Math.sin(t * 15.2 + 1.4)) * 0.18;
      glowSmooth = glowSmooth * 0.48 + w * 0.52;
      if (typeof speakAmp !== "undefined") {
        speakAmp = Math.min(1, 0.35 + glowSmooth * 0.55);
      }
      if (typeof setCoreAmp === "function") setCoreAmp(Math.min(1, 0.25 + glowSmooth * 0.65));
    }
    glowRaf = requestAnimationFrame(loop);
  };

  if (glowRaf) cancelAnimationFrame(glowRaf);
  glowRaf = requestAnimationFrame(loop);
}

function stopGlow() {
  if (glowRaf) cancelAnimationFrame(glowRaf);
  glowRaf = 0;
  glowSmooth = 0;
  document.body.classList.remove("bradley-speaking", "speaking");
  if (!IS_TOUCH_DEVICE && typeof endSpeakingVisual === "function") endSpeakingVisual();
  if (typeof setCoreAmp === "function") setCoreAmp(0);
}

function usedOrbitSlots() {
  return new Set(
    [...(liveAtoms?.querySelectorAll(".live-node") || [])].map((node) => Number(node.dataset.slot))
  );
}

function nextOpenOrbitSlot() {
  const used = usedOrbitSlots();
  for (const slot of ORBIT_FILL_SLOTS) {
    if (!used.has(slot)) return slot;
  }
  return ORBIT_FILL_SLOTS[ORBIT_FILL_SLOTS.length - 1];
}

function orbitSlotCoords(slot, phaseRad = orbitPhase) {
  const baseRad = (-90 * Math.PI) / 180 + slot * ((2 * Math.PI) / ORBIT_SLOTS);
  const rad = baseRad + phaseRad;
  const orbit = activeOrbitConfig();
  const rot = (orbit.rot * Math.PI) / 180;
  const x = orbit.rx * Math.cos(rad);
  const y = orbit.ry * Math.sin(rad);
  return {
    xr: x * Math.cos(rot) - y * Math.sin(rot),
    yr: x * Math.sin(rot) + y * Math.cos(rot),
  };
}

function slotSeparation(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, ORBIT_SLOTS - diff);
}

function slotForScreenBias(bias, used = usedOrbitSlots(), avoidSlots = [], minSeparation = 2) {
  const candidates = ORBIT_FILL_SLOTS.filter((slot) => !used.has(slot));
  if (!candidates.length) return nextOpenOrbitSlot();

  const score = (slot) => {
    const { xr, yr } = orbitSlotCoords(slot);
    switch (bias) {
      case "right":
        return xr;
      case "left":
        return -xr;
      case "top":
        return -yr;
      case "bottom":
        return yr;
      default:
        return 0;
    }
  };

  const ranked = [...candidates].sort((a, b) => score(b) - score(a));
  const separated = ranked.filter((slot) =>
    avoidSlots.every((avoid) => slotSeparation(slot, avoid) >= minSeparation)
  );

  return (separated[0] ?? ranked[0] ?? nextOpenOrbitSlot());
}

function slotNearScreenAngle(targetDeg, used = usedOrbitSlots(), avoidSlots = [], minSeparation = 2) {
  const candidates = ORBIT_FILL_SLOTS.filter((slot) => !used.has(slot));
  if (!candidates.length) return nextOpenOrbitSlot();

  const targetRad = (targetDeg * Math.PI) / 180;
  const angleDelta = (rad) => Math.atan2(Math.sin(rad - targetRad), Math.cos(rad - targetRad));

  const eligible = candidates.filter((slot) =>
    avoidSlots.every((avoid) => slotSeparation(slot, avoid) >= minSeparation)
  );
  const pool = eligible.length ? eligible : candidates;

  return pool.reduce((best, slot) => {
    const coords = orbitSlotCoords(slot);
    const bestCoords = orbitSlotCoords(best);
    const slotDiff = Math.abs(angleDelta(Math.atan2(coords.yr, coords.xr)));
    const bestDiff = Math.abs(angleDelta(Math.atan2(bestCoords.yr, bestCoords.xr)));

    if (slotDiff < bestDiff - 0.001) return slot;
    if (Math.abs(slotDiff - bestDiff) <= 0.001) {
      const slotDist = Math.hypot(coords.xr, coords.yr);
      const bestDist = Math.hypot(bestCoords.xr, bestCoords.yr);
      return slotDist < bestDist ? slot : best;
    }
    return best;
  }, pool[0]);
}

function spawnAtom({ id, label, rgb, slot: fixedSlot, spawnAngle, screenBias, avoidSlots = [] }) {
  if (!liveAtoms || spawned.has(id)) return;
  spawned.add(id);

  const used = usedOrbitSlots();
  let slot = fixedSlot;
  if (slot === undefined && Number.isFinite(spawnAngle)) {
    slot = slotNearScreenAngle(spawnAngle, used, avoidSlots, 3);
  } else if (slot === undefined && screenBias) {
    slot = slotForScreenBias(screenBias, used, avoidSlots, 3);
  }
  if (slot === undefined) slot = nextOpenOrbitSlot();
  if (used.has(slot)) slot = nextOpenOrbitSlot();
  phase1SlotIdx += 1;

  const node = document.createElement("button");
  node.type = "button";
  node.className = "live-node";
  node.dataset.id = id;
  node.dataset.slot = String(slot);
  if (rgb) node.style.setProperty("--node-rgb", rgb);

  node.innerHTML = `<span class="disc" aria-hidden="true"></span><span class="label">${label}</span>`;
  positionOnOrbit(node, slot);
  liveAtoms.appendChild(node);
  ensureOrbitMotion();

  requestAnimationFrame(() => {
    node.classList.add("live-node--ready");
    if (id === "lights") node.classList.add("live-node--lights-hit");
  });
}

function setCaption(text) {
  if (!bradleyLine) return;
  bradleyLine.textContent = String(text || "").trim();
}

async function runBradleyShow() {
  if (showRunning) return;
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = "Loading show…";
  }
  await preloadBradleyVoice();
  clearShowVisualState();
  showRunning = true;
  ensureOrbitMotion();
  let completed = false;

  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = "Bradley is speaking…";
  }
  try {
    for (const beat of BRADLEY_SCRIPT) {
      if (!showRunning) break;
      setSiteDemoStatus("Speaking");
      setCaption(beat.line);

      await speakBradley(beat);
      stopGlow();
      await new Promise((r) => setTimeout(r, 720));
    }
    completed = showRunning;
  } catch (error) {
    console.error("[Bradley] show interrupted", error);
    setCaption("");
    setSiteDemoStatus("Show reset · tap to retry", true);
    clearShowVisualState();
  } finally {
    stopGlow();
    clearSpawnTimers();
    pauseCurrentAudio();
    showRunning = false;
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = completed ? "Run it again" : "Let Bradley speak";
    }
  }
}

function resetShow() {
  clearShowVisualState();
  setCaption("");
  setSiteDemoStatus("Live demo");
  showRunning = false;
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = "Let Bradley speak";
  }
}

async function preloadBradleyVoice() {
  if (bakedVoiceReady && bakedVoiceLastResult) return bakedVoiceLastResult;
  if (bakedVoiceWarmupPromise) return bakedVoiceWarmupPromise;

  bakedVoiceWarmupPromise = (async () => {
    const assets = bakedVoiceAssets();
    let loaded = 0;
    let failed = 0;

    for (const path of assets) {
      setSiteDemoStatus(`Loading show ${loaded + 1}/${assets.length}`);
      try {
        await loadCachedBakedAudio(path);
        loaded += 1;
      } catch (error) {
        failed += 1;
        console.warn("[Bradley] voice asset failed", path, error);
      }
    }

    if (!showRunning) {
      setSiteDemoStatus(
        failed ? `Show loaded · ${loaded}/${assets.length} voice clips` : `Show loaded · ${loaded} voice clips`
      );
    }
    const result = { loaded, failed, total: assets.length };
    bakedVoiceLastResult = result;
    bakedVoiceReady = failed === 0;
    if (failed) bakedVoiceWarmupPromise = null;
    return result;
  })();

  return bakedVoiceWarmupPromise;
}

function init() {
  initShowDom();
  setSiteDemoStatus("Live demo");
}

window.BradleySiteShow = {
  build: BRADLEY_BUILD,
  init,
  run: async () => {
    ensureBradleyAudioGraph();
    await runBradleyShow();
  },
  reset: resetShow,
  preload: preloadBradleyVoice,
  isReady: () => bakedVoiceReady,
};
