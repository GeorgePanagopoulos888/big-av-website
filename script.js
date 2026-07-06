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
const SPAWN_OUTPUT_LAG_SEC = IS_TOUCH_DEVICE ? 0.28 : 0.06;

const BRADLEY_BUILD = "soft-outer-halo-15";

console.info("[Bradley] loaded", BRADLEY_BUILD, {
  ringSlots: ORBIT_FILL_SLOTS.length,
  phase2Count: PHASE2_SPAWNS.length,
  phase2Labels: PHASE2_SPAWNS.map((atom) => atom.label),
  touchDevice: IS_TOUCH_DEVICE,
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
    spawn: [{ id: "apps", label: "Apps", rgb: "255,120,100", atSec: 1.44 }],
  },
  {
    id: "beat_03",
    title: "Layer",
    line: "One calm intelligence listens, takes a breath… decides, then sets rooms in motion.",
    speak: "One calm intelligence listens, takes a breath… decides, then sets rooms in motion.",
    spawn: [{ id: "layer", label: "Layer", rgb: "216,171,69", atSec: 2.6 }],
  },
  {
    id: "beat_04",
    title: "Morning",
    line: "Morning arrives: coffee starts, lights soften, and music finds breakfast.",
    speak: "Morning arrives: coffee starts, lights soften, and music finds breakfast.",
    spawn: [
      { id: "coffee", label: "Coffee", rgb: "255,191,105", atSec: 2.38, slot: 2 },
      { id: "lights", label: "Lights", rgb: "255,227,95", atSec: 3.42, slot: 0, lagSec: 0.1 },
    ],
  },
  {
    id: "beat_05",
    title: "Comfort",
    line: "Comfort settles: climate adjusts, theater waits, and security watches.",
    speak: "Comfort settles: climate adjusts, theater waits, and security watches.",
    spawn: [
      { id: "climate", label: "Climate", rgb: "121,227,143", atSec: 1.32 },
      { id: "theater", label: "Theater", rgb: "245,200,94", atSec: 2.6 },
      { id: "security", label: "Security", rgb: "194,140,255", atSec: 3.46 },
    ],
  },
  {
    id: "beat_06",
    title: "Boardroom",
    line: "In the boardroom, presentations start before anyone reaches for a cable.",
    speak: "In the boardroom, presentations start before anyone reaches for a cable.",
    spawn: [{ id: "boardroom", label: "Boardroom", rgb: "132,200,255", atSec: 0.35 }],
  },
  {
    id: "beat_07",
    title: "Work",
    line: "Cameras frame speakers, sound balances, notes appear where teams expect them.",
    speak: "Cameras frame speakers, sound balances, notes appear where teams expect them.",
    spawn: [
      { id: "cameras", label: "Cameras", rgb: "85,240,216", atSec: 0.45 },
      { id: "sound", label: "Sound", rgb: "158,224,195", atSec: 1.98 },
    ],
  },
  {
    id: "beat_08",
    title: "Welcome",
    line: "At home, guests feel welcome without learning controls.",
    speak: "At home, guests feel welcome without learning controls.",
    spawn: [{ id: "guests", label: "Guests", rgb: "255,227,95", atSec: 1.0 }],
  },
  {
    id: "beat_09",
    title: "Time",
    line: "Staff regain time usually lost to setup rituals.",
    speak: "Staff regain time usually lost to setup rituals.",
    spawn: [{ id: "time", label: "Time", rgb: "216,171,69", atSec: 1.38 }],
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
  if (!bradleyAudioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    bradleyAudioCtx = new Ctx();
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
  if (!audio || bradleyAudioSources.has(audio)) return;
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

function readVoiceAmplitude() {
  if (!bradleyAnalyser) return 0;
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

function applyVoiceAmp(amp) {
  const value = amp.toFixed(3);
  const filament = Math.min(1, amp * 1.2 + 0.04).toFixed(3);
  const jitter = (amp * 3.4).toFixed(3);
  bradleyCore?.style.setProperty("--voice-amp", value);
  bradleyCore?.style.setProperty("--filament-glow", filament);
  bradleyCore?.style.setProperty("--filament-jitter", jitter);
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
    const amp = bradleyAnalyser && currentAudio && !currentAudio.paused ? readVoiceAmplitude() : glowSmooth * 0.9;
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
  applyVoiceAmp(0);
  bradleyCore?.style.setProperty("--filament-glow", "0");
  bradleyCore?.style.setProperty("--filament-jitter", "0");
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
