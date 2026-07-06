/* Exact visual frame from bradly_app.html — canvas glow, bulb filter, drawWaves */
let botSpeaking = false;
const speechVizData = new Float32Array(1024);
let vizCanvas = null;
let vizCtx = null;
let W = 0;
let H = 0;
let DPR = 1;

function bradleyAppStage() {
  return document.getElementById("bradley-live");
}

function resizeBradleyAppViz() {
  const stage = bradleyAppStage();
  if (!stage || !vizCanvas || !vizCtx) return;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  const rect = stage.getBoundingClientRect();
  W = Math.max(1, rect.width);
  H = Math.max(1, rect.height);
  vizCanvas.width = Math.floor(W * DPR);
  vizCanvas.height = Math.floor(H * DPR);
  vizCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

function activeStageWidth() {
  return W;
}

function drawWaves(yb, data, gain, hot, maxX) {
  const amp = Math.min(H * 0.13, 90);
  for (const dir of [1, -1]) {
    vizCtx.beginPath();
    for (let x = 0; x <= maxX; x += 3) {
      const i = Math.floor((x / Math.max(1, maxX)) * data.length);
      const v = (data[i] || 0) * gain * dir;
      const y = yb + v * amp;
      if (x === 0) vizCtx.moveTo(x, y);
      else vizCtx.lineTo(x, y);
    }
    vizCtx.strokeStyle = hot ? "rgba(255,190,92,.85)" : "rgba(143,192,255,.8)";
    vizCtx.lineWidth = 2;
    vizCtx.stroke();
  }
  vizCtx.strokeStyle = hot ? "rgba(255,190,92,.1)" : "rgba(143,192,255,.08)";
  vizCtx.lineWidth = 1;
  vizCtx.beginPath();
  vizCtx.moveTo(0, yb);
  vizCtx.lineTo(maxX, yb);
  vizCtx.stroke();
}

function updateSpeechViz() {
  const t = Date.now() / 260;
  for (let i = 0; i < speechVizData.length; i += 1) {
    const p = i / speechVizData.length;
    speechVizData[i] = Math.sin(p * 32 + t) * 0.22 + Math.sin(p * 71 + t * 0.7) * 0.08;
  }
  return speechVizData;
}

function bradleyAppFrame() {
  requestAnimationFrame(bradleyAppFrame);
  if (!vizCtx || W <= 0 || H <= 0) return;

  vizCtx.clearRect(0, 0, W, H);
  const stageW = activeStageWidth();
  const cx = stageW / 2;
  const cy = H * 0.4;
  const R = Math.min(stageW, H) * 0.165;
  const breath = (Math.sin(Date.now() / 2100) + 1) / 2;
  let b;
  let data;
  let gain = 0;
  let hot = false;

  if (botSpeaking) {
    data = updateSpeechViz();
    b = 0.68 + breath * 0.18;
    gain = 2.7;
    hot = true;
  } else {
    b = 0.07 + breath * 0.07;
  }

  const gr = vizCtx.createRadialGradient(cx, cy, R * 0.3, cx, cy, Math.max(stageW, H) * 0.95);
  if (hot) {
    gr.addColorStop(0, `rgba(255,176,72,${0.5 * b})`);
    gr.addColorStop(0.45, `rgba(255,150,52,${0.14 * b})`);
    gr.addColorStop(1, "rgba(255,150,52,0)");
  } else {
    gr.addColorStop(0, `rgba(214,176,80,${0.16 * b + 0.05})`);
    gr.addColorStop(0.5, `rgba(190,150,70,${0.05 * b})`);
    gr.addColorStop(1, "rgba(190,150,70,0)");
  }
  vizCtx.fillStyle = gr;
  vizCtx.fillRect(0, 0, stageW, H);

  const bi = document.getElementById("bulbimg");
  if (bi) {
    bi.style.filter = `drop-shadow(0 0 ${(14 + b * 48) | 0}px rgba(255,176,72,${(0.3 + b * 0.5).toFixed(2)})) brightness(${(0.92 + b * 0.45).toFixed(2)})`;
  }
  if (data) drawWaves(H * 0.76, data, gain, hot, stageW);
}

function initBradleyAppFrame() {
  vizCanvas = document.getElementById("viz");
  if (!vizCanvas) return;
  vizCtx = vizCanvas.getContext("2d");
  window.addEventListener("resize", resizeBradleyAppViz);
  if (window.ResizeObserver && bradleyAppStage()) {
    const ro = new ResizeObserver(resizeBradleyAppViz);
    ro.observe(bradleyAppStage());
  }
  resizeBradleyAppViz();
  bradleyAppFrame();
}

function setBradleyAppSpeaking(speaking) {
  botSpeaking = !!speaking;
}

window.initBradleyAppFrame = initBradleyAppFrame;
window.setBradleyAppSpeaking = setBradleyAppSpeaking;