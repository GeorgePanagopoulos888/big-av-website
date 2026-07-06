const demoOutput = document.querySelector("[data-demo-output]");
const demoMode = document.querySelector("[data-demo-mode]");
const demoPresetButtons = document.querySelectorAll("[data-demo-preset]");

const demoPresets = {
  home: {
    mode: "demo_site.home",
    text:
      "Welcome home — dim entry, start main-floor audio, weather on the kitchen display. You did not touch a panel.",
  },
  boardroom: {
    mode: "demo_site.boardroom",
    text:
      "Room preview: Start Teams mode, wake displays, set table mics, lower shades, and route support if the call fails.",
  },
  service: {
    mode: "demo_site.service",
    text:
      "Support preview: Detect an offline processor, stage a service ticket draft, and show the client-safe status.",
  },
};

if (demoOutput && demoMode && demoPresetButtons.length) {
  demoPresetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const preset = demoPresets[button.dataset.demoPreset];
      if (!preset) return;

      demoPresetButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      demoMode.textContent = preset.mode;
      demoOutput.textContent = preset.text;
    });
  });
}

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
const SPAWN_OUTPUT_LAG_SEC = 0.05;

const BRADLEY_BUILD = "bradley-app-bulb-19";

console.info("[Bradley] loaded", BRADLEY_BUILD, {
  ringSlots: ORBIT_FILL_SLOTS.length,
  phase2Count: PHASE2_SPAWNS.length,
  phase2Labels: PHASE2_SPAWNS.map((atom) => atom.label),
  touchDevice: IS_TOUCH_DEVICE,
  webAudioGlow: USE_WEB_AUDIO_GLOW,
  spawnLagSec: SPAWN_OUTPUT_LAG_SEC,
});

window.__bradleyDebug = {
  build: BRADLEY_BUILD,
  ringSlots: ORBIT_FILL_SLOTS.length,
  phase2Labels: PHASE2_SPAWNS.map((atom) => atom.label),
  visibleAtoms: () =>
    [...document.querySelectorAll("#live-atoms .label")].map((node) =>
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
    spawn: [{ id: "apps", label: "Apps", rgb: "255,120,100", atSec: 1.4 }],
  },
  {
    id: "beat_03",
    title: "Layer",
    line: "One calm intelligence listens, takes a breath… decides, then sets rooms in motion.",
    speak: "One calm intelligence listens, takes a breath… decides, then sets rooms in motion.",
    spawn: [{ id: "layer", label: "Layer", rgb: "216,171,69", atSec: 2.58 }],
  },
  {
    id: "beat_04",
    title: "Morning",
    line: "Morning arrives: coffee starts, lights soften, and music finds breakfast.",
    speak: "Morning arrives: coffee starts, lights soften, and music finds breakfast.",
    spawn: [
      { id: "coffee", label: "Coffee", rgb: "255,191,105", atSec: IS_TOUCH_DEVICE ? 1.12 : 2.02, slot: 2, lagSec: 0 },
      { id: "lights", label: "Lights", rgb: "255,227,95", atSec: 3.15, slot: 0 },
    ],
  },
  {
    id: "beat_05",
    title: "Comfort",
    line: "Comfort settles: climate adjusts, theater waits, and security watches.",
    speak: "Comfort settles: climate adjusts, theater waits, and security watches.",
    spawn: [
      { id: "climate", label: "Climate", rgb: "121,227,143", atSec: 1.3 },
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
    spawn: [{ id: "time", label: "Time", rgb: "216,171,69", atSec: 1.2 }],
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

const liveSystem = document.getElementById("live-system");
const bradleyCore = document.getElementById("bradley-core");
const bradleyBulbImg = document.getElementById("bradley-bulb-img");
const stageVizCanvas = document.getElementById("stage-viz-canvas");
const filamentCanvas = document.getElementById("filament-canvas");
const coreWaveCanvas = document.getElementById("core-wave-canvas");
const speechVizData = new Float32Array(1024);
let stageVizCtx = null;
let filamentCtx = null;
let coreWaveCtx = null;
let idleBulbRaf = 0;
const liveAtoms = document.getElementById("live-atoms");
const bradleyLine = document.getElementById("bradley-line");
const liveTitle = document.getElementById("live-title");
const startBtn = document.getElementById("bradley-start");
const skipBtn = document.getElementById("bradley-skip");
const signupForm = document.getElementById("bradley-signup");
const signupEmail = document.getElementById("signup-email");
const voiceStatus = document.getElementById("voice-status");

let showRunning = false;
let glowRaf = 0;
let glowSmooth = 0;
let bradleyAudioCtx = null;
let bradleyAnalyser = null;
const bradleyAudioSources = new WeakMap();
let currentAudio = null;
let spawnTimers = [];
let spawnRaf = 0;
let phase1SlotIdx = 0;
let orbitPhase = 0;
let orbitPeriodCurrent = ORBIT_PERIOD_S;
let orbitRaf = 0;
let orbitLastTs = 0;
const spawned = new Set();

function setVoiceStatus(text, isError = false) {
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

function positionOnOrbit(node, slot, phaseRad = orbitPhase) {
  const baseRad = (-90 * Math.PI) / 180 + slot * ((2 * Math.PI) / ORBIT_SLOTS);
  const rad = baseRad + phaseRad;
  const rot = (ORBIT.rot * Math.PI) / 180;
  const x = ORBIT.rx * Math.cos(rad);
  const y = ORBIT.ry * Math.sin(rad);
  const xr = x * Math.cos(rot) - y * Math.sin(rot);
  const yr = x * Math.sin(rot) + y * Math.cos(rot);
  node.style.left = `${50 + xr}%`;
  node.style.top = `${50 + yr}%`;
}

function orbitLoop(ts) {
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
      if ((audio.currentTime || 0) < 0.04) continue;

      const t = state.partOffsetSec + audio.currentTime;
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
    activeParts.set(audio, { partOffsetSec });
    const wake = () => ensureLoop();
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
    const audio = new Audio(bakedVoicePath(beat.id, i, parts.length));
    audio.preload = "auto";
    await waitAudioMeta(audio);
    loaded.push(audio);
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

async function speakBradley(beat) {
  const parts = beatSpeakParts(beat);
  const fullText = parts.join(" ");

  try {
    const audios = await loadBakedParts(beat);
    await playBeatAudio(audios, beat);
    setVoiceStatus("Bradley is speaking");
    return true;
  } catch {
    /* try live TTS when developing */
  }

  try {
    const audios = [];
    for (const text of parts) {
      audios.push(await fetchLivePart(text));
    }
    await playBeatAudio(audios, beat);
    setVoiceStatus("Bradley is speaking · live");
    return true;
  } catch {
    setVoiceStatus("Voice unavailable — captions only", true);
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

function resizeCoreWaveCanvas() {
  if (!coreWaveCanvas || !bradleyCore) return;
  const rect = bradleyCore.getBoundingClientRect();
  const w = Math.max(220, Math.round(rect.width * 1.08));
  const h = Math.max(48, Math.round(rect.width * 0.2));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (coreWaveCanvas.width !== pw || coreWaveCanvas.height !== ph) {
    coreWaveCanvas.width = pw;
    coreWaveCanvas.height = ph;
    coreWaveCtx = coreWaveCanvas.getContext("2d");
    if (coreWaveCtx) coreWaveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function drawStageViz(b, hot) {
  resizeStageVizCanvas();
  if (!stageVizCanvas || !stageVizCtx || !liveSystem) return;
  const w = liveSystem.clientWidth;
  const h = liveSystem.clientHeight;
  const cx = w / 2;
  const cy = h / 2;
  const t = Date.now() / 1000;
  stageVizCtx.clearRect(0, 0, w, h);

  const gr = stageVizCtx.createRadialGradient(cx, cy, w * 0.04, cx, cy, Math.max(w, h) * 0.72);
  if (hot) {
    gr.addColorStop(0, `rgba(255,176,72,${(0.5 * b).toFixed(3)})`);
    gr.addColorStop(0.45, `rgba(255,150,52,${(0.14 * b).toFixed(3)})`);
    gr.addColorStop(1, "rgba(255,150,52,0)");
  } else {
    gr.addColorStop(0, `rgba(214,176,80,${(0.16 * b + 0.05).toFixed(3)})`);
    gr.addColorStop(0.5, `rgba(190,150,70,${(0.05 * b).toFixed(3)})`);
    gr.addColorStop(1, "rgba(190,150,70,0)");
  }
  stageVizCtx.fillStyle = gr;
  stageVizCtx.fillRect(0, 0, w, h);

  const rings = [
    { rx: 0.44, ry: 0.17, rot: -10, alpha: 0.2 },
    { rx: 0.38, ry: 0.2, rot: 28, alpha: 0.16 },
    { rx: 0.32, ry: 0.23, rot: 73, alpha: 0.14 },
    { rx: 0.26, ry: 0.26, rot: 132, alpha: 0.1 },
    { rx: 0.2, ry: 0.29, rot: 198, alpha: 0.08 },
  ];
  for (const ring of rings) {
    stageVizCtx.save();
    stageVizCtx.translate(cx, cy);
    stageVizCtx.rotate((ring.rot * Math.PI) / 180);
    stageVizCtx.beginPath();
    stageVizCtx.ellipse(0, 0, w * ring.rx, h * ring.ry, 0, 0, Math.PI * 2);
    stageVizCtx.strokeStyle = hot
      ? `rgba(255,190,92,${(ring.alpha * (0.55 + b * 0.65)).toFixed(3)})`
      : `rgba(132,200,255,${(ring.alpha * (0.45 + b * 0.4)).toFixed(3)})`;
    stageVizCtx.lineWidth = 1;
    stageVizCtx.setLineDash([5, 11]);
    stageVizCtx.lineDashOffset = -t * 18;
    stageVizCtx.stroke();
    stageVizCtx.restore();
  }

  const dotCount = 36;
  for (let i = 0; i < dotCount; i += 1) {
    const ang = (i / dotCount) * Math.PI * 2 + t * 0.35;
    const pulse = (Math.sin(t * 2.4 + i * 0.7) + 1) / 2;
    const rad = w * (0.14 + (i % 5) * 0.045 + pulse * 0.02 * b);
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad * 0.42;
    const dotR = 1 + pulse * (hot ? 1.6 : 0.9) * (0.35 + b * 0.65);
    stageVizCtx.beginPath();
    stageVizCtx.arc(x, y, dotR, 0, Math.PI * 2);
    stageVizCtx.fillStyle = hot
      ? `rgba(255,200,110,${(0.18 + b * 0.42).toFixed(3)})`
      : `rgba(143,192,255,${(0.12 + b * 0.28).toFixed(3)})`;
    stageVizCtx.fill();
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

function drawCoreWaves(data, gain, hot) {
  resizeCoreWaveCanvas();
  if (!coreWaveCanvas || !coreWaveCtx) return;
  const w = coreWaveCanvas.clientWidth || coreWaveCanvas.width;
  const h = coreWaveCanvas.clientHeight || coreWaveCanvas.height;
  coreWaveCtx.clearRect(0, 0, w, h);
  if (!data || gain <= 0) {
    coreWaveCanvas.style.opacity = "0";
    return;
  }
  const yb = h * 0.5;
  const waveAmp = Math.min(h * 0.42, 40);
  for (const dir of [1, -1]) {
    coreWaveCtx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const i = Math.floor((x / Math.max(1, w)) * data.length);
      const v = (data[i] || 0) * gain * dir;
      const y = yb + v * waveAmp;
      if (x === 0) coreWaveCtx.moveTo(x, y);
      else coreWaveCtx.lineTo(x, y);
    }
    coreWaveCtx.strokeStyle = hot ? "rgba(255,190,92,.85)" : "rgba(143,192,255,.8)";
    coreWaveCtx.lineWidth = 2;
    coreWaveCtx.lineCap = "round";
    coreWaveCtx.stroke();
  }
  coreWaveCtx.strokeStyle = hot ? "rgba(255,190,92,.1)" : "rgba(143,192,255,.08)";
  coreWaveCtx.lineWidth = 1;
  coreWaveCtx.beginPath();
  coreWaveCtx.moveTo(0, yb);
  coreWaveCtx.lineTo(w, yb);
  coreWaveCtx.stroke();
  coreWaveCanvas.style.opacity = String(Math.min(1, 0.42 + gain * 0.12));
}

function applyBradleyBulbLook(b, hot, waveData, gain = 0) {
  const img = bradleyBulbImg || bradleyCore?.querySelector("img");
  if (img) {
    img.style.filter = `drop-shadow(0 0 ${(14 + b * 48).toFixed(0)}px rgba(255,176,72,${(0.3 + b * 0.5).toFixed(2)})) brightness(${(0.92 + b * 0.45).toFixed(2)})`;
  }
  liveSystem?.style.setProperty("--bulb-b", b.toFixed(3));
  liveSystem?.style.setProperty("--bulb-hot", hot ? "1" : "0");
  drawStageViz(b, hot);
  drawFilamentGlow(b, hot);
  drawCoreWaves(waveData, gain, hot);
}

function applyVoiceAmp(amp) {
  const value = amp.toFixed(3);
  const speaking = document.body.classList.contains("bradley-speaking");
  const hot = speaking;
  const b = bulbBreathLevel(amp, hot);
  const waveData = hot ? updateSpeechViz() : null;
  const gain = hot ? 2.7 : 0;
  applyBradleyBulbLook(b, hot, waveData, gain);
  bradleyCore?.style.setProperty("--voice-amp", value);
  liveSystem?.style.setProperty("--voice-amp", value);
  liveAtoms?.querySelectorAll(".live-node").forEach((node) => {
    node.style.setProperty("--voice-amp", value);
  });
}

function startGlow() {
  document.body.classList.add("bradley-speaking");
  ensureBradleyAudioGraph();
  glowSmooth = 0;

  const loop = () => {
    const amp =
      currentAudio && !currentAudio.paused ? readVoiceAmplitude() : glowSmooth * 0.9;
    applyVoiceAmp(amp);
    glowRaf = requestAnimationFrame(loop);
  };

  if (glowRaf) cancelAnimationFrame(glowRaf);
  glowRaf = requestAnimationFrame(loop);
}

function stopGlow() {
  document.body.classList.remove("bradley-speaking");
  if (glowRaf) cancelAnimationFrame(glowRaf);
  glowRaf = 0;
  glowSmooth = 0;
  applyBradleyBulbLook(bulbBreathLevel(0, false), false, null, 0);
  applyVoiceAmp(0);
  startIdleBulbBreath();
}

function startIdleBulbBreath() {
  if (idleBulbRaf) cancelAnimationFrame(idleBulbRaf);
  const loop = () => {
    if (!document.body.classList.contains("bradley-speaking")) {
      applyBradleyBulbLook(bulbBreathLevel(0, false), false, null, 0);
    }
    idleBulbRaf = requestAnimationFrame(loop);
  };
  idleBulbRaf = requestAnimationFrame(loop);
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
  const rot = (ORBIT.rot * Math.PI) / 180;
  const x = ORBIT.rx * Math.cos(rad);
  const y = ORBIT.ry * Math.sin(rad);
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
  const line = String(text || "").trim();
  if (!line) {
    bradleyLine.textContent = "";
    bradleyLine.hidden = true;
    return;
  }
  bradleyLine.textContent = line;
  bradleyLine.hidden = false;
}

async function runBradleyShow() {
  if (showRunning) return;
  showRunning = true;
  ensureOrbitMotion();

  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = "Bradley is speaking…";
  }
  for (const beat of BRADLEY_SCRIPT) {
    if (!showRunning) break;
    setCaption(beat.line);

    await speakBradley(beat);
    stopGlow();
    await new Promise((r) => setTimeout(r, 720));
  }

  if (signupForm) signupForm.hidden = false;
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = "Run it again";
  }
  showRunning = false;
}

function resetShow() {
  stopGlow();
  stopAudio();
  if (orbitRaf) cancelAnimationFrame(orbitRaf);
  orbitRaf = 0;
  orbitLastTs = 0;
  orbitPhase = 0;
  orbitPeriodCurrent = ORBIT_PERIOD_S;
  phase1SlotIdx = 0;
  spawned.clear();
  if (liveAtoms) liveAtoms.innerHTML = "";
  if (signupForm) signupForm.hidden = true;
  if (liveTitle) liveTitle.textContent = "Bradley";
  setCaption("");
  setVoiceStatus("Live demo");
  showRunning = false;
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = "Let Bradley speak";
  }
}

async function preloadBradleyVoice() {
  const results = await Promise.allSettled(BRADLEY_SCRIPT.map((beat) => loadBakedParts(beat)));
  const loaded = results.filter((result) => result.status === "fulfilled").length;
  if (loaded) {
    setVoiceStatus(`Bradley ready · ${loaded} beats cached`);
  }
}

if (startBtn) {
  startBtn.addEventListener("click", async () => {
    if (startBtn.textContent === "Run it again") resetShow();
    startBtn.disabled = true;
    ensureBradleyAudioGraph();
    await preloadBradleyVoice();
    runBradleyShow();
  });
}

if (skipBtn) {
  skipBtn.addEventListener("click", () => {
    showRunning = false;
    stopGlow();
    stopAudio();
    if (signupForm) signupForm.hidden = false;
    setCaption("Leave your email — BIG AV will call for a consult.");
    if (liveTitle) liveTitle.textContent = "Bradley";
  });
}

if (signupForm && signupEmail) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = signupEmail.value.trim();
    if (!email) return;

    const subject = encodeURIComponent("Bradley demo — consult request");
    const body = encodeURIComponent(
      `Hi BIG AV,\n\nI saw the Bradley website demo and want a consult.\n\nEmail: ${email}\n`
    );
    window.location.href = `mailto:bradley@big-av.com?subject=${subject}&body=${body}`;
  });
}

async function wireBookingsCta() {
  const bookBtn = document.getElementById("book-consult");
  const bookNote = document.getElementById("book-consult-note");
  if (!bookBtn) return;

  try {
    const res = await fetch("bookings-config.json", { cache: "no-store" });
    if (!res.ok) return;
    const config = await res.json();
    const url = config.bookingPageUrl || config.publicUrl;
    if (!url) return;
    bookBtn.href = url;
    bookBtn.hidden = false;
    bookBtn.textContent = config.serviceName ? `Book ${config.serviceName}` : "Book a consult";
    if (bookNote) {
      bookNote.hidden = false;
      bookNote.textContent = "Microsoft Bookings · Teams consult";
    }
  } catch {
    /* bookings-config.json appears after M365 setup */
  }
}

wireBookingsCta();
setVoiceStatus("Live demo");
function resizeBradleyViz() {
  resizeStageVizCanvas();
  resizeFilamentCanvas();
  resizeCoreWaveCanvas();
}
resizeBradleyViz();
startIdleBulbBreath();
window.addEventListener("resize", resizeBradleyViz);
