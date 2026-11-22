/* CAES: THE LAST SEAL — mission layer.
   Additive game layer for the existing prototype. Activated only by
   ?mode=mission; in every other mode start() returns immediately and the
   prototype behaves exactly as before.

   This layer NEVER touches the measurement core (PH / SIG / stepPhysics /
   groundTruth / commitTrial). It reads them, drives them through their public
   entry points, and logs. Everything it adds is new code in this file. */

import * as THREE from 'three';
import { MISSION01 } from './mission01.js?v=20261117a';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CSS = `
#missionKeys{position:fixed;left:14px;bottom:12px;z-index:36;
  font:500 11px/1.4 "Segoe UI",system-ui,sans-serif;color:#6f8397;letter-spacing:.06em;
  pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.7)}
.mSide .ms{color:#8fb8d8;font-size:10.5px;letter-spacing:.14em;margin:2px 0 6px}
.mSide .mo{margin:3px 0 0 0;padding-left:18px;position:relative;color:#dfe9f4}
.mSide .mo.done{color:#7fd6a2;text-decoration:line-through}
.mSide .mo.cur{color:#ffd79a}
.mSide .mo::before{content:'';position:absolute;left:2px;top:4px;width:9px;height:9px;
  border-radius:2px;border:1.5px solid currentColor}
.mSide .mo.done::before{background:#2ea36a;border-color:#2ea36a}
.mSide .mhint{margin:7px 0 10px;padding:6px 8px;background:rgba(255,214,154,.08);
  border-left:2px solid #ffd79a;color:#ffd79a;font-size:11.5px}
.mOverlay{position:fixed;inset:0;z-index:60;background:rgba(4,7,11,.72);
  display:flex;align-items:center;justify-content:center}
.mOverlay .paper{width:min(620px,92vw);max-height:82vh;overflow:auto;
  background:#f4f1e8;color:#1b232c;border-radius:10px;padding:26px 30px;
  box-shadow:0 24px 60px rgba(0,0,0,.5);font:500 13.5px/1.62 "Segoe UI",system-ui,sans-serif;
  white-space:pre-wrap}
.mOverlay .paper h3{margin:0 0 14px;font-size:16px;letter-spacing:.04em}
.mOverlay .paper .pg{color:#7a6f5c;font-size:11px;margin-top:16px;text-align:right}
.mOverlay .paper .btns{margin-top:18px;display:flex;gap:10px;flex-wrap:wrap}
.mOverlay .paper button{cursor:pointer;border:1px solid #2c3946;background:#22303e;color:#eaf2fb;
  border-radius:7px;padding:8px 14px;font:600 12.5px "Segoe UI",system-ui,sans-serif}
.mOverlay .paper button.ghost{background:transparent;color:#2c3946;border-color:#9a917c}
.mOverlay .paper .ev{margin:10px 0;padding:8px 10px;background:#fff;border-left:3px solid #2e7cd0;
  border-radius:4px;font-size:12.5px}
.mOverlay .paper .ev b{display:block;font-size:12.5px}
.mOverlay .paper .ev i{color:#5c6a78;font-style:normal;font-size:11.5px}
.mOverlay .paper .hyp{display:block;margin:5px 0;padding:9px 12px;border:1px solid #c3bda9;
  border-radius:7px;cursor:pointer;background:#fff}
.mOverlay .paper .hyp.on{border-color:#2e7cd0;background:#e8f1fb}
.mOverlay .paper .act{display:inline-block;margin:4px 6px 4px 0;padding:7px 12px;
  border:1px solid #c3bda9;border-radius:7px;cursor:pointer;background:#fff;font-size:12.5px}
.mOverlay .paper .act.on{border-color:#b4541f;background:#fdf0e7}
.mOverlay .paper input[type=range]{width:100%}
.mOverlay .paper .warn{color:#8c2f1d;font-weight:600}
.mSide{position:fixed;left:14px;top:238px;z-index:55;width:300px;max-height:66vh;overflow:auto;
  background:rgba(14,19,26,.94);border:1px solid rgba(255,255,255,.16);border-radius:10px;
  padding:12px 14px;color:#eaf2fb;font:500 12.5px/1.5 "Segoe UI",system-ui,sans-serif}
.mSide h4{margin:0 0 8px;font-size:11px;letter-spacing:.14em;color:#8fb8d8}
.mSide .it{display:flex;justify-content:space-between;gap:8px;padding:6px 8px;margin:3px 0;
  border:1px solid rgba(255,255,255,.12);border-radius:7px;cursor:pointer}
.mSide .it:hover{background:rgba(255,255,255,.08)}
.mSide .it.missing{opacity:.42;cursor:default}
.mSide .ev{margin:4px 0;font-size:11.5px;color:#cfe0ef;padding-left:10px;
  border-left:2px solid #2e7cd0}
.mSide label{display:flex;justify-content:space-between;align-items:center;
  margin:8px 0 0;font-size:11.5px;color:#9fb4c8}
#missionToast{position:fixed;left:50%;top:78px;transform:translateX(-50%);z-index:70;
  padding:10px 18px;border-radius:9px;background:rgba(14,19,26,.92);
  border:1px solid rgba(255,255,255,.18);color:#eaf2fb;
  font:600 13px "Segoe UI",system-ui,sans-serif;display:none;max-width:70vw;text-align:center}
#missionToast.ok{border-color:rgba(48,209,88,.5);color:#bff0d2}
#missionToast.bad{border-color:rgba(255,69,58,.45);color:#ffd7cc}
#helmetVignette{position:fixed;inset:0;z-index:30;pointer-events:none;display:none;
  background:radial-gradient(ellipse at 50% 42%,transparent 58%,rgba(6,10,14,.55) 88%)}
`;

/* ------------------------------------------------------------------ */
/* tiny event bus — every player action becomes a telemetry event      */
/* ------------------------------------------------------------------ */
class Bus {
  constructor() { this.log = []; this.sessionId = 'm' + Date.now().toString(36); }
  emit(type, data) {
    const e = { t: +(performance.now() / 1000).toFixed(3), type, sessionId: this.sessionId, data: data || null };
    this.log.push(e);
    if (this.log.length > 4000) this.log.shift();
    return e;
  }
}

/* ------------------------------------------------------------------ */
/* interaction audio: short WebAudio blips, volume from localStorage   */
/* ------------------------------------------------------------------ */
class Blip {
  constructor() {
    this.vol = 0.5;
    try { const v = localStorage.getItem('caesMissionVol'); if (v !== null) this.vol = Math.max(0, Math.min(1, +v)); } catch (e) {}
    this.ac = null; this.noiseBuf = null; this.humNodes = null;
  }
  setVolume(v) { this.vol = Math.max(0, Math.min(1, v)); try { localStorage.setItem('caesMissionVol', String(this.vol)); } catch (e) {} }
  ctx() {
    if (!this.ac) { try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (this.ac.state === 'suspended') { try { this.ac.resume(); } catch (e) {} }
    return this.ac;
  }
  noise() {
    const ac = this.ctx(); if (!ac) return null;
    if (!this.noiseBuf) {
      this.noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < d.length; i++) {           /* pinkish, not white: gentler on the ear */
        const w = Math.random() * 2 - 1;
        last = (last + 0.04 * w) / 1.04; d[i] = last * 6;
      }
    }
    return this.noiseBuf;
  }
  burst(freq, q, dur, gain) {
    const ac = this.ctx(); if (!ac || this.vol <= 0) return;
    const src = ac.createBufferSource(); src.buffer = this.noise();
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    const g = ac.createGain();
    g.gain.setValueAtTime(gain * this.vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    src.connect(bp).connect(g).connect(ac.destination);
    src.start(); src.stop(ac.currentTime + dur + 0.02);
  }
  ping(f0, f1, dur, type, gain, delay) {
    const ac = this.ctx(); if (!ac || this.vol <= 0) return;
    const t0 = ac.currentTime + (delay || 0);
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime((gain || 0.16) * this.vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ac.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  play(kind) {
    switch (kind) {
      case 'pickup': this.burst(900, 1.2, 0.06, 0.20); this.ping(430, 620, 0.13, 'sine', 0.13, 0.02); break;
      case 'drop': this.burst(500, 1.0, 0.07, 0.18); this.ping(320, 210, 0.15, 'sine', 0.14, 0.02); break;
      case 'ui': this.burst(2200, 3.0, 0.025, 0.12); break;
      case 'evidence': this.ping(560, 560, 0.10, 'sine', 0.12); this.ping(840, 840, 0.14, 'sine', 0.12, 0.11); break;
      case 'step': this.ping(523, 523, 0.11, 'triangle', 0.11); this.ping(659, 659, 0.16, 'triangle', 0.11, 0.10); break;
      case 'wrong': this.burst(220, 0.8, 0.18, 0.10); this.ping(170, 110, 0.24, 'sawtooth', 0.09); break;
      case 'toggle': this.burst(1400, 2.5, 0.03, 0.10); break;
      case 'read': this.burst(1600, 0.7, 0.16, 0.08); break;
      default: this.ping(600, 600, 0.05, 'sine', 0.07);
    }
  }
  /* the hall itself: a low air-handling hum plus a slow pump pulse, started
     once, tied to the master volume */
  ambience() {
    const ac = this.ctx(); if (!ac || this.humNodes || this.vol <= 0) return;
    const g = ac.createGain(); g.gain.value = 0.10 * this.vol; g.connect(ac.destination);
    const src = ac.createBufferSource(); src.buffer = this.noise(); src.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
    src.connect(lp).connect(g); src.start();
    const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = 98;
    const og = ac.createGain(); og.gain.value = 0.012 * this.vol;
    o.connect(og).connect(ac.destination); o.start();
    /* the recorded facility layer (freesound 619320, CC0): real mechanical
       texture under the synth hum; missing file is fine, the synth carries */
    fetch('assets/audio/ambience_facility_hum.mp3')
      .then(r => r.arrayBuffer())
      .then(ab => ac.decodeAudioData(ab))
      .then(buf => {
        const s2 = ac.createBufferSource(); s2.buffer = buf; s2.loop = true;
        const g2 = ac.createGain(); g2.gain.value = 0.30 * this.vol;
        s2.connect(g2).connect(ac.destination); s2.start();
        if (this.humNodes) this.humNodes.g2 = g2;
        if (ac.state === 'suspended') { try { ac.resume(); } catch (e) {} }
      })
      .catch(() => {});
    this.humNodes = { g, og };
  }
  setHumVolume() {
    if (this.humNodes) this.humNodes.g.gain.value = 0.10 * this.vol;
    if (this.humNodes && this.humNodes.g2) this.humNodes.g2.gain.value = 0.30 * this.vol;
  }
}

/* ------------------------------------------------------------------ */
/* world-space panel for VR: one canvas, tabbed views, hit regions     */
/* ------------------------------------------------------------------ */
class WorldPanel {
  constructor(ctx) {
    this.ctx = ctx;
    this.cv = document.createElement('canvas');
    this.cv.width = 1024; this.cv.height = 720;
    this.g = this.cv.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.cv);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 0.55),
      new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthTest: false })
    );
    this.mesh.renderOrder = 40;
    this.mesh.visible = false;
    this.mesh.position.set(0, 1.42, -1.05);
    ctx.xrRig.add(this.mesh);
    this.regions = [];
    this.onHit = null;
    this.tab = 'task';
    this.docItem = null;
    this.docPage = 0;
  }
  show() { this.mesh.visible = true; }
  hide() { this.mesh.visible = false; }
  hit(uv) {
    const x = uv.x * this.cv.width, y = (1 - uv.y) * this.cv.height;
    for (const r of this.regions) {
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r;
    }
    return null;
  }
  clear() { this.g.clearRect(0, 0, this.cv.width, this.cv.height); this.regions.length = 0; }
  chrome(title) {
    const g = this.g;
    g.fillStyle = 'rgba(10,14,20,.93)'; g.fillRect(0, 0, 1024, 720);
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.strokeRect(6, 6, 1012, 708);
    g.fillStyle = '#8fb8d8'; g.font = '600 22px "Segoe UI",sans-serif';
    g.fillText(title.toUpperCase(), 30, 46);
  }
  button(id, label, x, y, w, h, on) {
    const g = this.g;
    g.fillStyle = on ? 'rgba(46,124,208,.30)' : 'rgba(255,255,255,.07)';
    g.fillRect(x, y, w, h);
    g.strokeStyle = on ? '#4f9ae0' : 'rgba(255,255,255,.25)'; g.lineWidth = 2;
    g.strokeRect(x, y, w, h);
    g.fillStyle = on ? '#dcedff' : '#eaf2fb';
    g.font = '600 21px "Segoe UI",sans-serif';
    g.fillText(label, x + 16, y + h / 2 + 8);
    this.regions.push({ id, x, y, w, h });
  }
}

/* ------------------------------------------------------------------ */
export const CAESGame = {
  started: false,

  buildEnvironment(ctx) {
    const modelLoader = new GLTFLoader();
    const placeModel = (id, pos, footprint, rotY) => {
      modelLoader.load(`assets/models/${id}/${id}_1k.gltf`, (g) => {
        const o = g.scene;
        const bb = new THREE.Box3().setFromObject(o);
        const dims = bb.getSize(new THREE.Vector3());
        const sc = footprint / Math.max(0.001, Math.max(dims.x, dims.z));
        o.scale.setScalar(sc);
        const bb2 = new THREE.Box3().setFromObject(o);
        o.position.set(pos[0] - (bb2.min.x + bb2.max.x) / 2, pos[1] - bb2.min.y, pos[2] - (bb2.min.z + bb2.max.z) / 2);
        if (rotY) o.rotation.y = rotY;
        o.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
        ctx.scene.add(o);
      }, undefined, () => { /* a missing model is never a blocker */ });
    };
    placeModel('metal_toolbox', [-0.30, 0, 4.50], 0.48, -0.5);
    placeModel('korean_fire_extinguisher_01', [-5.15, 0, 3.55], 0.30, 0.4);
    placeModel('plastic_crate_01', [-3.35, 0, 4.75], 0.60, 0.2);
    placeModel('industrial_storage_cart', [4.35, 0, 2.20], 0.62, 0.35);

    /* ---------- the workbench: bench-level props need a bench ---------- */
    const TEX = {};
    const tl = new THREE.TextureLoader();
    const loadTex = (file, srgb, rx, ry) => {
      const t = tl.load('assets/tex/' + file, () => { /* arrives async, materials update below */ });
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx || 1, ry || 1);
      t.anisotropy = 8;
      return t;
    };
    TEX.benchTop = loadTex('Metal041A_2K_color.jpg', true, 2, 1);
    TEX.benchFrame = loadTex('Metal041A_2K_color.jpg', true, 1, 1);
    const benchTopY = 0.90;
    {
      /* ink frame + steel top: chunky joined members, shelf resting ON the
         rails — the bench reads as one solid piece from every angle, never
         as white slabs hovering in the dark */
      const bench = new THREE.Group();
      const inkMat = new THREE.MeshStandardMaterial({ color: 0x232b33, metalness: 0.30, roughness: 0.62 });
      const steelMat = new THREE.MeshStandardMaterial({ map: TEX.benchTop, color: 0x767d85, metalness: 0.22, roughness: 0.62 });
      const shelfMat = new THREE.MeshStandardMaterial({ map: TEX.benchFrame, color: 0x767e86, metalness: 0.25, roughness: 0.6 });
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.30, 0.05, 0.78), steelMat);
      top.position.y = benchTopY - 0.025;
      top.castShadow = true; top.receiveShadow = true;
      bench.add(top);
      const apron = new THREE.Mesh(new THREE.BoxGeometry(2.30, 0.08, 0.78), inkMat);
      apron.position.y = benchTopY - 0.10;
      bench.add(apron);
      for (const [lx, lz] of [[-1.05, -0.30], [1.05, -0.30], [-1.05, 0.30], [1.05, 0.30]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.86, 0.09), inkMat);
        leg.position.set(lx, 0.43, lz);
        leg.castShadow = true;
        bench.add(leg);
      }
      for (const lz of [-0.30, 0.30]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(2.10, 0.06, 0.06), inkMat);
        rail.position.set(0, 0.32, lz);
        bench.add(rail);
      }
      for (const lx of [-1.05, 1.05]) {
        const endRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.60), inkMat);
        endRail.position.set(lx, 0.32, 0);
        bench.add(endRail);
      }
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.10, 0.03, 0.58), shelfMat);
      shelf.position.y = 0.365;
      shelf.receiveShadow = true;
      bench.add(shelf);
      bench.position.set(-1.80, 0, 3.91);
      ctx.scene.add(bench);
    }
  },

  start(ctx) {
    if (this.started) return;
    this.started = true;
    /* environment furniture: pure scenery — the bench and the props. Every
       3D mode needs them: the UT probe, the mission docs and the walk
       colliders all assume the bench exists (without it the probe hovered
       mid-air and the colliders read as invisible walls). */
    if (ctx.MODE !== 'dashboard' && ctx.MODE !== 'cug') this.buildEnvironment(ctx);

    if (ctx.MODE !== 'mission') return;      /* scored mission logic: mission only */

    const M = ctx.MISSION;
    const SIG = ctx.SIG, PH = ctx.PH, WALK = ctx.WALK, EQ = ctx.EQ;
    const bus = new Bus();
    const blip = new Blip();
    this.bus = bus;
    this.ctx = ctx;
    this.M = M;

    /* ---------- fault: ?fault= overrides the config, 'random' draws ---------- */
    let fault = M.fault;
    if (ctx.FAULTQ === 'random') fault = M.hypotheses[Math.floor(Math.random() * M.hypotheses.length)];
    else if (M.faults[ctx.FAULTQ]) fault = ctx.FAULTQ;

    /* ---------- state ---------- */
    const st = this.st = {
      stage: 0, objectives: {}, active: true, paused: false,
      evidence: [], diagnosis: null, sopStep: 0,
      sampled: false, hintsUsed: 0, startedAt: performance.now(),
      fault, held: null, wornHelmet: false, torchOn: false,
      combines: {}, tlx: null, inspect: null, resumed: false,
      probeHeld: false, everHeld: {}, scanOn: false, scanned: false, sectionT: 0
    };
    try { if (localStorage.getItem('caesMissionMotion') === '0') st.reducedMotion = true; } catch (e) {}

    /* ---------- physics: hand the model its scenario ---------- */
    SIG.fault = fault;
    SIG.D = M.startDamage;
    SIG.intensity = 1.0;
    SIG.P = 1.2;
    SIG.t0 = performance.now() / 1000;

    /* ---------- style + HUD ---------- */
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    /* The old always-on objective card is gone: nothing sits on the scene
       except a one-line key strip. The task list lives behind Tab. */
    const keysLine = document.createElement('div');
    keysLine.id = 'missionKeys';
    document.body.appendChild(keysLine);

    const visor = document.createElement('div');
    visor.id = 'helmetVignette';
    document.body.appendChild(visor);

    const toast = document.createElement('div');
    toast.id = 'missionToast';
    document.body.appendChild(toast);
    let toastTimer = 0;
    const say = (txt, cls, ms) => {
      toast.textContent = txt;
      toast.className = cls || '';
      toast.style.display = 'block';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.style.display = 'none'; }, ms || 3000);
    };
    this.say = say;

    /* ---------- interactables ---------- */
    const items = [];                       /* {def, root, collected, home} */
    const byId = {};
    this.items = items;

    const mkCanvas = (w, h, draw) => {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      draw(cv.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      return t;
    };

    const paperTex = (title, lines) => mkCanvas(512, 640, (g) => {
      g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, 512, 640);
      g.fillStyle = '#c9c2ad'; g.fillRect(0, 0, 512, 34);
      g.fillStyle = '#2c3946'; g.font = '700 19px "Segoe UI",sans-serif';
      g.fillText(title, 14, 24);
      g.fillStyle = '#1b232c'; g.font = '500 15px "Segoe UI",sans-serif';
      let y = 62;
      for (const l of lines) { g.fillText(l, 16, y); y += 21; }
      g.strokeStyle = 'rgba(0,0,0,.16)'; g.strokeRect(4, 4, 504, 632);
    });

    /* ---------- ready-made props (CC0, Poly Haven) ----------
       Loaded, footprint-normalised and dropped on surveyed spots. Each gets a
       collider box so the player cannot walk through it. */
    /* resolve the fault-specific shift log before anything is built */
    for (const def of M.items) {
      if (def.pages === 'LOG') def.pages = [M.faults[fault].log];
      if (def.evidence === 'LOG') def.evidence = M.faults[fault].evidence;
    }

    const mkDoc = (def) => {
      const g = new THREE.Group();
      const w = def.size[0], h = def.size[1];
      const front = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({ map: paperTex(def.name, def.pages[0]), color: 0xc4c0b4, roughness: 0.96, metalness: 0.0, envMapIntensity: 0.15 })
      );
      front.rotation.x = -Math.PI / 2;
      front.position.y = 0.012;
      g.add(front);
      const back = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({ color: 0x2c3946, roughness: 0.9 })
      );
      back.rotation.x = -Math.PI / 2; back.rotation.z = Math.PI;
      back.position.y = 0.004;
      g.add(back);
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.98, 0.008, h * 0.98),
        new THREE.MeshStandardMaterial({ color: 0x3a4450, roughness: 0.9 })
      );
      pad.position.y = -0.006;
      g.add(pad);
      g.position.set(...def.pos);
      if (def.rot) g.rotation.y = def.rot;
      g.traverse(o => { o.userData.gameItem = def.id; });
      ctx.scene.add(g);
      return g;
    };

    /* handheld tools: torch, helmet, data module */
    const mkTool = (def) => {
      const g = new THREE.Group();
      const steel = new THREE.MeshStandardMaterial({ color: 0x39434e, metalness: 0.6, roughness: 0.5 });
      if (def.id === 'flashlight') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.24, 14),
          new THREE.MeshStandardMaterial({ color: 0x232b34, metalness: 0.55, roughness: 0.5 }));
        body.rotation.z = Math.PI / 2;
        g.add(body);
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.028, 0.05, 14),
          new THREE.MeshStandardMaterial({ color: 0x8d99a6, metalness: 0.8, roughness: 0.35 }));
        head.rotation.z = Math.PI / 2; head.position.x = 0.14;
        g.add(head);
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.028, 18),
          new THREE.MeshBasicMaterial({ color: 0xfff2d0 }));
        lens.rotation.y = Math.PI / 2; lens.position.x = 0.166;
        g.add(lens);
      } else if (def.id === 'helmet') {
        const shellM = new THREE.MeshStandardMaterial({ color: 0xf2b418, roughness: 0.42, metalness: 0.05 });
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.125, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2),
          shellM);
        cap.scale.set(1, 0.82, 1.12);
        g.add(cap);
        /* crown ridge: the stiffening band every hard hat actually has */
        const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.022, 0.24), shellM);
        ridge.position.y = 0.104;
        g.add(ridge);
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.178, 0.185, 0.014, 24),
          new THREE.MeshStandardMaterial({ color: 0xe0a414, roughness: 0.5 }));
        brim.position.y = 0.006;
        g.add(brim);
        /* front peak: a full flat disc with no direction read as a fried egg */
        const peak = new THREE.Mesh(
          new THREE.CylinderGeometry(0.10, 0.115, 0.010, 18, 1, false, -0.7, 1.4),
          new THREE.MeshStandardMaterial({ color: 0xe0a414, roughness: 0.5 }));
        peak.position.set(0, -0.002, 0.16);
        g.add(peak);
      } else if (def.id === 'ut_scanner') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.10, 0.055),
          new THREE.MeshStandardMaterial({ color: 0x24303c, metalness: 0.45, roughness: 0.5 }));
        body.position.y = 0.05;
        /* three physical buttons under the screen — the scanner is held 30 cm
           from the eyes during the scan flow, so buttons must be bodies */
        for (let bi = 0; bi < 3; bi++) {
          const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.008, 10),
            new THREE.MeshStandardMaterial({
              color: [0xff453a, 0xffd60a, 0x30d158][bi], roughness: 0.4, metalness: 0.1 }));
          btn.rotation.x = Math.PI / 2;
          btn.position.set(-0.055 + bi * 0.048, 0.012, 0.031);
          g.add(btn);
        }
        /* coiled probe cable to the transducer head */
        const coil = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.007, 6, 16),
          new THREE.MeshStandardMaterial({ color: 0x101820, roughness: 0.85 }));
        coil.position.set(0.09, -0.045, 0.02);
        g.add(coil);
        g.add(body);
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.10, 10),
          new THREE.MeshStandardMaterial({ color: 0x141a22, roughness: 0.7 }));
        grip.position.set(0, -0.02, 0.055); grip.rotation.x = Math.PI / 2.6;
        g.add(grip);
        /* the screen: a canvas we redraw while scanning */
        const scv = document.createElement('canvas'); scv.width = 256; scv.height = 160;
        const scx = scv.getContext('2d');
        const sct = new THREE.CanvasTexture(scv); sct.colorSpace = THREE.SRGBColorSpace;
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.105),
          new THREE.MeshBasicMaterial({ map: sct }));
        screen.position.set(0, 0.051, -0.008); screen.rotation.x = -Math.PI / 2;
        g.add(screen);
        g.userData.screen = { cv: scv, ctx: scx, tex: sct };
        /* the probe head on a short lead */
        const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.10, 8),
          new THREE.MeshStandardMaterial({ color: 0x10161e, roughness: 0.8 }));
        lead.position.set(0.13, 0.045, 0.03); lead.rotation.z = 0.5;
        g.add(lead);
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.045, 12),
          new THREE.MeshStandardMaterial({ color: 0x60cdff, metalness: 0.3, roughness: 0.4, emissive: 0x123a52 }));
        head.position.set(0.20, 0.05, 0.05); head.rotation.z = 0.2;
        g.add(head);
      } else {                                  /* data module */
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.02, 0.085),
          new THREE.MeshStandardMaterial({ color: 0x2b3a4a, metalness: 0.4, roughness: 0.55 }));
        g.add(box);
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.004, 0.016),
          new THREE.MeshBasicMaterial({ color: 0x60cdff }));
        strip.position.y = 0.012;
        g.add(strip);
      }
      g.position.set(...def.pos);
      if (def.rot) g.rotation.y = def.rot;
      g.traverse(o => { o.userData.gameItem = def.id; });
      ctx.scene.add(g);
      return g;
    };

    /* invisible hit volumes over the chamber's own decals / fixtures */
    const mkVolume = (def, size) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(size[0], size[1], size[2]),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false })
      );
      m.position.set(...def.pos);
      m.userData.gameItem = def.id;
      ctx.scene.add(m);
      return m;
    };

    for (const def of M.items) {
      let root = null;
      if (def.kind === 'read') root = mkDoc(def);
      else if (def.kind === 'inspect') root = mkVolume(def, [def.size[0] * 1.4, def.size[1] * 1.6, 0.10]);
      else if (def.kind === 'tool') root = mkTool(def);
      if (!root) continue;
      const item = { def, root, collected: false, home: { pos: root.position.clone(), rot: root.rotation.y } };
      if (root.userData.screen) item.screen = root.userData.screen;
      items.push(item);
      byId[def.id] = item;
    }

    /* Shelf snap. The cabinet geometry lives in index.html and its shelf tops
       are fixed; a tool's own `pos` in the mission file is only a hint. Snapping
       here means a stale mission01.js (or a hand-edited coordinate) can never
       leave a tool floating over the floor or sunk into a shelf. */
    {
      const CAB = { x: -4.74, shelfTop: [0.4375, 0.9675, 1.4975] };
      /* two slots on the bottom tier (torch + helmet), one on each upper tier */
      const slots = { 0: [2.41, 2.77], 1: [2.41], 2: [2.41] };
      const used = { 0: 0, 1: 0, 2: 0 };
      for (const it of items) {
        const ti = it.def.tier;
        if (ti === undefined) continue;
        const r = it.root;
        r.position.x = CAB.x;
        const zs = slots[ti];
        r.position.z = zs[Math.min(used[ti], zs.length - 1)];
        used[ti]++;
        /* drop the group until its lowest vertex touches the shelf top */
        r.position.y = CAB.shelfTop[ti];
        const bb = new THREE.Box3().setFromObject(r);
        r.position.y += CAB.shelfTop[ti] - bb.min.y;
        it.home.pos.copy(r.position);
      }
    }

    /* fixtures: pump isolation switch, LOTO station, monitoring terminal */
    const mkFixture = (def) => {
      const g = new THREE.Group();
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.055, 0.98, 14),
        new THREE.MeshStandardMaterial({ color: 0x2e3844, metalness: 0.5, roughness: 0.6 })
      );
      post.position.y = 0.49;
      g.add(post);
      /* a base plate so the post visibly meets the floor instead of floating */
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.16, 0.035, 18),
        new THREE.MeshStandardMaterial({ color: 0x1d252e, metalness: 0.4, roughness: 0.7 })
      );
      base.position.y = 0.02;
      g.add(base);
      const label = def.id === 'pump_switch' ? ['PUMP', 'ISOLATION'] : def.id === 'loto_station' ? ['LOTO', 'LOCK-OUT'] : ['DATA', 'TERMINAL'];
      const accent = def.id === 'pump_switch' ? 0xb4452f : def.id === 'loto_station' ? 0xd8a522 : 0x2e7cd0;
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.20, 0.12),
        new THREE.MeshStandardMaterial({ color: accent, metalness: 0.3, roughness: 0.6 })
      );
      box.position.y = 1.04;
      g.add(box);
      const face = mkCanvas(256, 200, (x) => {
        x.fillStyle = '#101820'; x.fillRect(0, 0, 256, 200);
        x.fillStyle = '#' + new THREE.Color(accent).getHexString();
        x.font = '700 26px "Segoe UI",sans-serif';
        x.fillText(label[0], 18, 44);
        x.fillStyle = '#dfe7f0'; x.font = '500 19px "Segoe UI",sans-serif';
        x.fillText(label[1], 18, 82);
        x.fillText(label[0] === 'DATA' ? 'MODULE →' : 'SOP-07', 18, 110);
        x.fillStyle = '#8fa2b5'; x.font = '500 16px "Segoe UI",sans-serif';
        x.fillText('CAES-04', 18, 168);
      });
      const plate = new THREE.Mesh(
        new THREE.PlaneGeometry(0.22, 0.17),
        new THREE.MeshBasicMaterial({ map: face })
      );
      plate.position.set(0, 1.04, 0.062);
      g.add(plate);
      /* per-fixture hardware: buttons, lamps and latches that read at arm's
         length — the label plate alone made them look like signs */
      const hwM = new THREE.MeshStandardMaterial({ color: 0x10161d, roughness: 0.7, metalness: 0.2 });
      const accM = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4, metalness: 0.2 });
      if (def.id === 'pump_switch') {
        const stop = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.027, 0.014, 14),
          new THREE.MeshStandardMaterial({ color: 0xc0362a, roughness: 0.4 }));
        stop.position.set(0, 1.155, 0.02);
        g.add(stop);
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: 0xd04032, roughness: 0.35 }));
        dome.position.set(0, 1.163, 0.02);
        g.add(dome);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0x30d158, emissive: 0x1d7a3c, emissiveIntensity: 1.6 }));
        lamp.position.set(0.075, 1.155, 0.02);
        g.add(lamp);
      } else if (def.id === 'loto_station') {
        for (const hx of [-0.055, 0, 0.055]) {
          const hook = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.005, 6, 14),
            new THREE.MeshStandardMaterial({ color: 0xd8a522, metalness: 0.5, roughness: 0.4 }));
          hook.position.set(hx, 1.10, 0.068);
          g.add(hook);
        }
      } else {
        const scr = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.085, 0.008),
          new THREE.MeshStandardMaterial({ color: 0x0d1824, roughness: 0.3, metalness: 0.1 }));
        scr.position.set(0, 1.13, 0.068);
        g.add(scr);
        for (const bx of [-0.045, 0, 0.045]) {
          const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 10),
            new THREE.MeshStandardMaterial({ color: accM.color, roughness: 0.4 }));
          btn.rotation.x = Math.PI / 2;
          btn.position.set(bx, 1.045, 0.068);
          g.add(btn);
        }
      }
      g.position.set(def.pos[0], 0, def.pos[2]);   /* y is built into the post */
      g.traverse(o => { o.userData.gameItem = def.id; });
      ctx.scene.add(g);
      return g;
    };
    for (const def of M.fixtures) {
      const root = mkFixture(def);
      items.push({ def: { id: def.id, name: def.name, kind: 'use', prompt: def.prompt }, root, collected: false });
      byId[def.id] = items[items.length - 1];
    }
    this.byId = byId;

    /* the suspicious area: a pulsing ring, revealed once the log is read.
       It stands VERTICAL on the chamber's front face like a wall target —
       lying flat it floated at chest height and read as a plate in the sky. */
    const area = M.faults[fault].area;
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x64d2ff, transparent: true, opacity: 0.8, depthTest: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.20, 40), ringMat);
    ring.position.set(...area);
    ring.position.z += 0.03;               /* proud of the crack decal, no z-fight */
    ring.renderOrder = 30;
    ring.visible = false;
    ctx.scene.add(ring);
    this.ring = ring;

    /* ---------- quest ---------- */
    const quest = this.quest = {
      stage: () => M.stages[st.stage],
      objectiveDone(id) {
        st.objectives[id] = true;
        bus.emit('OBJECTIVE_COMPLETED', { id, stage: M.stages[st.stage].id });
        blip.play('step');
        renderHud(); save();
      },
      isDone(id) { return !!st.objectives[id]; },
      allDone() { return M.stages[st.stage].objectives.every(o => st.objectives[o.id]); },
      next() {
        if (!this.allDone()) return;
        bus.emit('STAGE_COMPLETED', { stage: M.stages[st.stage].id });
        if (st.stage < M.stages.length - 1) {
          st.stage++;
          bus.emit('STAGE_STARTED', { stage: M.stages[st.stage].id });
          say(M.stages[st.stage].title + ' — ' + (st.stage + 1) + ' / ' + M.stages.length, 'ok', 2600);
          renderHud(); save();
          try {
            if (M.stages[st.stage].id === 'diagnosis') openDiagnosis();
            if (M.stages[st.stage].id === 'response') sop.begin();
            if (M.stages[st.stage].id === 'debrief') openDebrief();
          } catch (e) { console.error('[mission] stage entry failed', e); }
        }
      },
      check() {
        const s = M.stages[st.stage];
        for (const o of s.objectives) {
          if (st.objectives[o.id]) continue;
          if (WALK.held) st.probeHeld = true;
          if (o.type === 'pickup' && o.target === 'probe' && st.probeHeld) this.objectiveDone(o.id);
          if (o.type === 'pickup' && o.target !== 'probe' && (st.held === o.target || st.everHeld[o.target])) this.objectiveDone(o.id);
          if (o.type === 'sample' && st.sampled) this.objectiveDone(o.id);
          /* documents read out of order still count when their stage arrives */
          if ((o.type === 'read' || o.type === 'inspect') && byId[o.target] && byId[o.target].collected) this.objectiveDone(o.id);
          if (o.type === 'terminal' && st.evidence.some(e => e.id === 'ev_terminal')) this.objectiveDone(o.id);
          if (o.type === 'scan' && st.scanned) this.objectiveDone(o.id);
          if (o.type === 'locate') {
            const p = M.faults[fault].area;
            const px = ctx.renderer.xr.isPresenting ? ctx.xrRig.position.x : WALK.pos.x;
            const pz = ctx.renderer.xr.isPresenting ? ctx.xrRig.position.z : WALK.pos.z;
            const d = Math.hypot(px - p[0], pz - p[2]);
            if (d < M.suspicious.within) this.objectiveDone(o.id);
          }
        }
        if (s.id === 'response' && st.sopStep >= M.sop.length && !st.objectives['perform_response']) {
          this.objectiveDone('perform_response');
        }
        this.next();
      }
    };

    /* ---------- evidence ---------- */
    const addEvidence = (ev) => {
      if (!ev) return;
      if (st.evidence.some(e => e.id === ev.id)) return;
      st.evidence.push({ ...ev, dataOrigin: 'synthetic', t: +(performance.now() / 1000).toFixed(1) });
      bus.emit('EVIDENCE_ADDED', { id: ev.id });
      blip.play('evidence');
      say('Evidence logged — ' + ev.title, 'ok', 3600);
      save();
    };

    /* ---------- reader (desktop modal / VR world panel) ---------- */
    const isVR = () => ctx.renderer.xr.isPresenting;
    const panel = new WorldPanel(ctx);
    this.panel = panel;

    const openReader = (item) => {
      bus.emit('DOCUMENT_READ', { id: item.def.id });
      blip.play('read');
      if (item.def.evidence) addEvidence(item.def.evidence);
      if (!item.collected) { item.collected = true; bus.emit('ITEM_ACQUIRED', { id: item.def.id }); save(); }
      const o = quest.stage().objectives.find(x => x.type === 'read' && x.target === item.def.id);
      if (o && !quest.isDone(o.id)) quest.objectiveDone(o.id);
      const o2 = quest.stage().objectives.find(x => x.type === 'inspect' && x.target === item.def.id);
      if (o2 && !quest.isDone(o2.id)) quest.objectiveDone(o2.id);

      if (isVR()) { panel.tab = 'doc'; panel.docItem = item; panel.docPage = 0; panel.show(); drawPanel(); }
      else openModal(item.def.name, item.def.pages, item);
      renderHud();
    };

    /* ---------- held items (torch / helmet / module) ---------- */
    const heldRoot = () => st.held ? byId[st.held].root : null;

    const takeItem = (it) => {
      if (st.held === it.def.id) return useHeld();
      if (st.held) dropHeld();
      st.held = it.def.id;
      const r = it.root;
      r.userData.homeT = { parent: r.parent, pos: r.position.clone(), rot: r.rotation.clone(), scale: r.scale.clone() };
      ctx.camera.add(r);
      if (it.def.id === 'flashlight') r.position.set(0.24, -0.21, -0.42);
      else if (it.def.id === 'data_module') r.position.set(0.20, -0.20, -0.38);
      else r.position.set(0, -0.34, -0.5);
      r.rotation.set(-0.25, 0.4, 0);
      r.scale.setScalar(0.9);
      st.everHeld[it.def.id] = true;
      bus.emit('ITEM_PICKED_UP', { id: it.def.id });
      blip.play('pickup');
      if (it.def.id !== 'helmet') say(it.def.name + ' — in hand. Q puts it down, R inspects it.', '', 2800);
      renderHud(); save();
      return true;
    };

    const useHeld = () => {
      if (st.held === 'flashlight') {
        st.torchOn = !st.torchOn;
        blip.play('toggle');
        say(st.torchOn ? 'Flashlight on.' : 'Flashlight off.', '', 1600);
        bus.emit('TOGGLE_FLASHLIGHT', { on: st.torchOn });
        renderHud(); save();
        return true;
      }
      if (st.held === 'ut_scanner') {
        st.scanOn = !st.scanOn;
        blip.play(st.scanOn ? 'step' : 'ui');
        bus.emit('TOGGLE_SCANNER', { on: st.scanOn });
        say(st.scanOn ? 'Scanner on — aim at the liner and sweep.' : 'Scanner off.', '', 2200);
        return true;
      }
      if (st.held === 'helmet') {
        st.wornHelmet = !st.wornHelmet;
        visor.style.display = st.wornHelmet ? 'block' : 'none';
        blip.play('ui');
        say(st.wornHelmet ? 'Helmet on.' : 'Helmet off.', '', 1600);
        return true;
      }
      return false;
    };

    const dropHeld = () => {
      if (!st.held) return false;
      const it = byId[st.held];
      const r = it.root, h = r.userData.homeT;
      if (h) {
        if (h.parent) h.parent.add(r);
        r.position.copy(h.pos); r.rotation.copy(h.rot); r.scale.copy(h.scale);
      }
      if (it.def.id === 'flashlight') { st.torchOn = false; torch.visible = false; }
      st.held = null;
      bus.emit('ITEM_DROPPED', { id: it.def.id });
      blip.play('drop');
      renderHud(); save();
      return true;
    };

    /* the torch: a real spot on the player, so the dark corner of the bay works */
    const torch = new THREE.SpotLight(0xfff0d2, 22, 11, 0.44, 0.55, 1.4);
    torch.position.set(0.22, -0.18, -0.2);
    const torchTarget = new THREE.Object3D();
    torchTarget.position.set(0, -0.05, -6);
    torch.target = torchTarget;
    torch.visible = false;
    ctx.camera.add(torch, torchTarget);

    /* ---------- inspect: lift the held item to your face and turn it over.
       Only the held item is inspected, and only its camera-local transform
       moves — nothing is re-parented, so take / inspect / drop can happen in
       any order without the prop ending up on the wrong parent. ---------- */
    const beginInspect = () => {
      if (!st.held || st.inspect) return;
      const it = byId[st.held], r = it.root;
      r.userData.inspectT = { pos: r.position.clone(), rot: r.rotation.clone(), scale: r.scale.clone() };
      r.position.set(0, -0.11, -0.40);
      r.scale.setScalar(1.5);
      r.rotation.set(-0.4, 0.5, 0);
      st.inspect = { id: it.def.id };
      document.exitPointerLock && document.exitPointerLock();
      bus.emit('ITEM_INSPECTED', { id: it.def.id });
      blip.play('pickup');
      say('Inspecting ' + it.def.name + ' — move the mouse to turn it over. R puts it back.', '', 3200);
    };
    const endInspect = () => {
      if (!st.inspect) return;
      const it = byId[st.inspect.id];
      const r = it.root, t = r.userData.inspectT;
      if (t) { r.position.copy(t.pos); r.rotation.copy(t.rot); r.scale.copy(t.scale); r.userData.inspectT = null; }
      st.inspect = null;
      if (WALK.on && !isVR()) { try { ctx.renderer.domElement.requestPointerLock(); } catch (e) {} }
    };
    addEventListener('mousemove', (e) => {
      if (!st.inspect) return;
      const it = byId[st.inspect.id];
      if (!it) return;
      it.root.rotation.y += e.movementX * 0.006;
      it.root.rotation.x += e.movementY * 0.006;
    });

    /* ---------- combines ---------- */
    const checkCombines = () => {
      for (const c of M.combines) {
        if (st.combines[c.id]) continue;
        const has = (id) => id === 'probe' ? !!WALK.held : (byId[id] && (byId[id].collected || st.held === id));
        const near = (id) => {
          const it = byId[id];
          if (!it) return false;
          const p = isVR() ? ctx.xrRig.position : WALK.pos;
          return it.root.position.distanceTo(new THREE.Vector3(p.x, 0, p.z)) < 1.9;
        };
        let fire = false;
        if (c.id === 'map_probe') fire = has('sensor_map') && has('probe');
        if (c.id === 'module_terminal') fire = has('data_module') && near('terminal');
        if (fire) {
          st.combines[c.id] = true;
          bus.emit('ITEM_COMBINED', { id: c.id, a: c.a, b: c.b });
          blip.play('evidence');
          say(c.message, 'ok', 3800);
          if (c.id === 'module_terminal') {
            try { window.__toggleDataWin && window.__toggleDataWin(true); } catch (e) {}
            const o = quest.stage().objectives.find(x => x.type === 'terminal');
            if (o && !quest.isDone(o.id)) quest.objectiveDone(o.id);
            addEvidence({
              id: 'ev_terminal',
              title: 'Monitoring terminal: the four channels logged against section B2',
              note: 'Confirms the readings you saw on the bench cards.'
            });
          }
          if (c.id === 'map_probe') ring.visible = true;
          save();
        }
      }
    };

    /* ---------- desktop modals ---------- */
    let modalEl = null;
    const closeModal = () => { if (modalEl) { modalEl.remove(); modalEl = null; } };
    const openModal = (title, pages, item) => {
      closeModal();
      let page = 0;
      const el = document.createElement('div');
      el.className = 'mOverlay';
      const render = () => {
        const body = pages[page].join('\n');
        const evidenceHtml = item && item.def.evidence && page === pages.length - 1
          ? '<div class="ev"><b>Evidence logged</b><i>' + item.def.evidence.title + '</i></div>' : '';
        el.innerHTML = '<div class="paper"><h3>' + title + '</h3>' + body +
          (evidenceHtml || '') +
          '<div class="pg">page ' + (page + 1) + ' / ' + pages.length + '</div>' +
          '<div class="btns">' +
          (page > 0 ? '<button class="ghost" data-a="prev">Back</button>' : '') +
          (page < pages.length - 1 ? '<button data-a="next">Next</button>' : '<button data-a="close">Close</button>') +
          '</div></div>';
        el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
          const a = b.dataset.a;
          if (a === 'next') { page++; render(); }
          else if (a === 'prev') { page--; render(); }
          else closeModal();
        }));
      };
      render();
      document.body.appendChild(el);
      modalEl = el;
    };
    this.openModal = openModal; this.closeModal = closeModal;

    /* ---------- diagnosis ---------- */
    const diag = { hyp: null, action: null, conf: 60 };
    this.diag = diag;

    const openDiagnosis = () => {
      st.freezeAt = new Date().toISOString();   /* schema v0: freeze point */
      bus.emit('DIAGNOSIS_OPENED', {});
      if (isVR()) { panel.tab = 'diag'; panel.show(); drawPanel(); }
      else {
        closeModal();
        const el = document.createElement('div');
        el.className = 'mOverlay';
        const render = () => {
          const evList = st.evidence.map(e => '<div class="ev"><b>' + e.title + '</b><i>' + (e.note || '') + '</i></div>').join('');
          el.innerHTML = '<div class="paper"><h3>THE DIAGNOSIS</h3>' +
            '<div style="color:#5c6a78;font-size:12px;margin-bottom:10px">Live: index ' + SIG.index.toFixed(2) +
            ' · AE ' + Math.round(SIG.ae) + ' / cycle · LVDT ' + SIG.lvdt.toFixed(2) + ' mm · PT ' + SIG.P.toFixed(2) + ' MPa' +
            (SIG.seep > 0 ? ' · seepage ' + SIG.seep.toFixed(2) + ' L/min' : '') + '</div>' +
            (evList || '<div class="ev"><i>No evidence logged yet — you can still commit, but say how sure you are.</i></div>') +
            '<div style="margin-top:12px;font-weight:600">Defect hypothesis</div>' +
            M.hypotheses.map(h => '<span class="hyp' + (diag.hyp === h ? ' on' : '') + '" data-h="' + h + '">' +
              M.hypothesisLabels[h] + '</span>').join('') +
            '<div style="margin-top:12px;font-weight:600">Action</div>' +
            M.actions.map((a, i) => '<span class="act' + (diag.action === i ? ' on' : '') + '" data-i="' + i + '">' + a + '</span>').join('') +
            '<div style="margin-top:14px;font-weight:600">Confidence — <span id="cv">' + diag.conf + '%</span></div>' +
            '<input id="cr" type="range" min="0" max="100" value="' + diag.conf + '">' +
            '<div class="scale" style="display:flex;justify-content:space-between;color:#7a6f5c;font-size:11px">' +
            '<span>GUESS</span><span>FAIRLY SURE</span><span>CERTAIN</span></div>' +
            '<div class="btns"><button data-a="commit">COMMIT DECISION</button>' +
            '<button class="ghost" data-a="close">Not yet</button></div></div>';
          el.querySelectorAll('.hyp').forEach(x => x.addEventListener('click', () => { diag.hyp = x.dataset.h; render(); }));
          el.querySelectorAll('.act').forEach(x => x.addEventListener('click', () => { diag.action = +x.dataset.i; render(); }));
          const r = el.querySelector('#cr');
          r.addEventListener('input', () => { diag.conf = +r.value; el.querySelector('#cv').textContent = diag.conf + '%'; });
          el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
            if (b.dataset.a === 'close') closeModal();
            else commitDiagnosis();
          }));
        };
        render();
        document.body.appendChild(el);
        modalEl = el;
      }
    };
    this.openDiagnosis = openDiagnosis;

    const commitDiagnosis = () => {
      if (diag.hyp === null || diag.action === null) {
        say('Pick a defect hypothesis and an action first.', 'bad');
        return;
      }
      const gtAction = ctx.groundTruth();
      const gtHyp = SIG.fault;
      const latency = (performance.now() - st.startedAt) / 1000;
      st.diagnosis = {
        hyp: diag.hyp, hypCorrect: diag.hyp === gtHyp,
        action: diag.action, actionCorrect: diag.action === gtAction,
        conf: diag.conf / 100, latency,
        gtAction, gtHyp, evidenceCount: st.evidence.length
      };
      bus.emit('DIAGNOSIS_SUBMITTED', st.diagnosis);
      if (diag.hyp === gtHyp && diag.action === gtAction) {
        say('✓ Committed. ' + M.hypothesisLabels[gtHyp] + ' — and ' + M.actions[gtAction] + ' was the right call.', 'ok', 4200);
      } else {
        say('✗ Committed. Right defect: ' + M.hypothesisLabels[gtHyp] +
            '. Right action: ' + M.actions[gtAction] + '.', 'bad', 4600);
      }
      closeModal(); panel.hide();
      quest.objectiveDone('submit_diagnosis');
      save();
      quest.next();
    };

    /* ---------- SOP ---------- */
    const sop = this.sop = {
      active: false,
      begin() {
        this.active = true; st.sopStep = 0;
        bus.emit('SOP_STARTED', {});
        say('SOP-07 — ' + M.sop[0].label, '', 4200);
        renderHud(); save();
      },
      complete(id) {
        const want = M.sop[st.sopStep];
        if (!want || want.target !== id) {
          say('Not yet — SOP-07 step ' + (st.sopStep + 1) + ' is “' + want.label + '”.', 'bad', 3200);
          bus.emit('SOP_WRONG_STEP', { wanted: want.id, got: id });
          blip.play('wrong');
          return;
        }
        st.sopStep++;
        bus.emit('SOP_STEP_COMPLETED', { id, step: st.sopStep });
        if (st.sopStep >= M.sop.length) {
          this.active = false;
          say('SOP-07 complete — simulated vent-down done.', 'ok', 4200);
          bus.emit('SOP_COMPLETED', {});
          renderHud(); save();
          quest.check();
        } else {
          say('Step ' + st.sopStep + ' / ' + M.sop.length + ' — ' + M.sop[st.sopStep].label, 'ok', 3200);
          renderHud(); save();
        }
      }
    };

    /* ---------- hints ---------- */
    const hintLevel = {};
    const giveHint = () => {
      const s = M.stages[st.stage];
      const arr = M.hints[s.id] || [];
      const lvl = Math.min(arr.length - 1, hintLevel[s.id] || 0);
      hintLevel[s.id] = lvl + 1;
      st.hintsUsed++;
      bus.emit('HINT_SHOWN', { stage: s.id, level: lvl });
      say('HINT — ' + arr[lvl], '', 6000);
      renderHud(); save();
    };

    /* ---------- debrief + NASA-TLX ---------- */
    const openDebrief = () => {
      bus.emit('DEBRIEF_OPENED', {});
      const d = st.diagnosis;
      const evLines = st.evidence.map(e => '· ' + e.title).join('\n') || '· none';
      const skipped = M.items.filter(i => i.evidence && !st.evidence.some(e => e.id === i.evidence.id)).map(i => '· ' + i.name).join('\n') || '· none';
      const rows = [
        'DEFECT HYPOTHESIS   ' + (d ? (d.hypCorrect ? 'CORRECT — ' : 'WRONG — ') + M.hypothesisLabels[d.hyp] : 'not committed'),
        '                    truth: ' + M.hypothesisLabels[fault],
        'ACTION              ' + (d ? (d.actionCorrect ? 'CORRECT — ' : 'WRONG — ') + M.actions[d.action] : 'not committed'),
        'CONFIDENCE          ' + (d ? Math.round(d.conf * 100) + '%' : '—'),
        'TIME TO DIAGNOSIS   ' + (d ? d.latency.toFixed(0) + ' s' : '—'),
        'EVIDENCE USED       ' + st.evidence.length + ' of ' + M.items.filter(i => i.evidence).length,
        'HINTS TAKEN         ' + st.hintsUsed
      ];
      const body = rows.join('\n') +
        '\n\nEVIDENCE COLLECTED\n' + evLines +
        '\n\nEVIDENCE MISSED\n' + skipped +
        '\n\nNEXT TIME\n' + (d && d.conf > 0.7 && !d.hypCorrect
          ? 'Confidence outran the evidence. Commit at the confidence the evidence supports.'
          : 'Keep reading strain and AE together; one channel never decides.');

      if (isVR()) { panel.tab = 'debrief'; panel.show(); st.debriefBody = body; drawPanel(); quest.objectiveDone('complete_debriefing'); return; }

      closeModal();
      const el = document.createElement('div');
      el.className = 'mOverlay';
      el.innerHTML = '<div class="paper"><h3>DEBRIEF — ' + M.title + '</h3>' + body.split('\n').join('\n') +
        '<h3 style="margin-top:20px">NASA-TLX — rate the round</h3>' +
        M.tlx.map(([name, hint], i) =>
          '<div style="margin-top:10px;font-weight:600">' + name +
          ' — <span id="tx' + i + '">50</span></div>' +
          '<div style="color:#5c6a78;font-size:11px">' + hint + '</div>' +
          '<input type="range" min="0" max="100" value="50" data-tlx="' + i + '">').join('') +
        '<div class="btns"><button data-a="finish">SUBMIT &amp; FINISH</button>' +
        '<button class="ghost" data-a="export">EXPORT JSON</button></div></div>';
      el.querySelectorAll('input[data-tlx]').forEach(r => r.addEventListener('input', () => {
        el.querySelector('#tx' + r.dataset.tlx).textContent = r.value;
      }));
      el.querySelector('button[data-a="export"]').addEventListener('click', () => exportSession());
      el.querySelector('button[data-a="finish"]').addEventListener('click', () => {
        st.tlx = {};
        el.querySelectorAll('input[data-tlx]').forEach(r => { st.tlx[M.tlx[+r.dataset.tlx][0]] = +r.value; });
        bus.emit('TLX_SUBMITTED', st.tlx);
        closeModal();
        quest.objectiveDone('complete_debriefing');
        quest.next();
        save();
        say('Round complete. The JSON export is on the debrief button.', 'ok', 4000);
      });
      document.body.appendChild(el);
      modalEl = el;
    };
    this.openDebrief = openDebrief;

    /* ---------- panel refresh (the panel itself is opened with Tab) ---------- */
    const taskSection = () => {
      const s = M.stages[st.stage];
      let h = '<div class="ms">' + (st.stage + 1) + ' / ' + M.stages.length + ' — ' + s.title +
        (st.fault !== M.fault ? ' · variant ' + st.fault : '') + '</div>';
      let firstOpen = true;
      for (const o of s.objectives) {
        const done = !!st.objectives[o.id];
        const cls = done ? 'done' : (firstOpen ? 'cur' : '');
        if (!done) firstOpen = false;
        h += '<div class="' + cls + '">' + o.label + '</div>';
      }
      const hints = M.hints[s.id] || [];
      const lvl = Math.min(hints.length, hintLevel[s.id] || 0);
      if (lvl > 0) h += '<div class="mhint">' + hints[lvl - 1] + '</div>';
      const holding = WALK.held ? 'probe' : (st.held ? byId[st.held].def.name.toLowerCase() : 'nothing');
      h += '<div class="ms" style="margin-top:10px">in hand: ' + holding + '</div>';
      return h;
    };
    const renderHud = () => {
      keysLine.textContent = 'Tab task · H hint · J evidence · R inspect';
      if (sideEl && sideMode === 'kit') renderSide();
    };
    this.renderHud = renderHud;

    /* ---------- item interaction (desktop walk + XR) ---------- */
    const useItem = (id) => {
      const it = byId[id];
      if (!it) return false;
      const def = it.def;
      if (def.kind === 'read' || def.kind === 'inspect') { openReader(it); return true; }
      if (def.kind === 'tool') {
        if (def.tier !== undefined && st.tierOpen && !st.tierOpen[def.tier]) {
          say('That tier is still locked — clear the current stage first.', 'warn', 2600);
          return false;
        }
        takeItem(it); return true;
      }
      if (def.kind === 'use') {
        bus.emit('OBJECT_INTERACTED', { id });
        if (id === 'terminal') {
          if (byId.data_module && (byId.data_module.collected || st.held === 'data_module')) {
            try { window.__toggleDataWin && window.__toggleDataWin(true); } catch (e) {}
            const o = quest.stage().objectives.find(x => x.type === 'terminal');
            if (o && !quest.isDone(o.id)) quest.objectiveDone(o.id);
            addEvidence({
              id: 'ev_terminal',
              title: 'Monitoring terminal: the four channels logged against section B2',
              note: 'Confirms the readings you saw on the bench cards.'
            });
            return true;
          }
          say('The terminal wants a data module — there should be one on the bench.', 'bad', 3200);
          blip.play('wrong');
          return true;
        }
        if (M.stages[st.stage].id === 'response' && sop.active) { sop.complete(id); return true; }
        say(def.prompt ? def.prompt.replace('press E to ', '') + ' — available when SOP-07 starts.' : '', '', 2600);
        return true;
      }
      return false;
    };
    this.useItem = useItem;

    /* ---------- hooks consumed by index.html ----------
       The mission layer runs its own proximity check (horizontal distance from
       the player to each prop) rather than piggybacking on walkUpdate's target
       list: bench props sit below eye level, so the walk ray never sees them,
       and a shared list made the nearest item ambiguous. When a piece of
       chamber equipment is genuinely closer, the hook stands down. */
    const nearestGame = () => {
      const p = ctx.renderer.xr.isPresenting ? ctx.xrRig.position : WALK.pos;
      let best = null, bd = 1e9;
      for (const it of items) {
        if (it.def.kind === 'read' && it.collected) continue;
        if (st.held === it.def.id) continue;
        if (it.def.tier !== undefined && st.tierOpen && !st.tierOpen[it.def.tier]) continue;
        const d = it.root.position.distanceTo(new THREE.Vector3(p.x, 0, p.z));
        if (d < (it.def.range || 1.75) && d < bd) { bd = d; best = it; }
      }
      return best ? { it: best, d: bd } : null;
    };

    const eqDistance = (walk) => {
      if (!walk.target) return 1e9;
      let o = walk.target;
      while (o && o !== EQ.valve && o !== EQ.gauge && o !== EQ.probe) o = o.parent;
      if (o !== EQ.valve && o !== EQ.gauge && o !== EQ.probe) return 1e9;
      return o.position.distanceTo(new THREE.Vector3(walk.pos.x, 0, walk.pos.z));
    };

    window.__gamePrompt = (walk) => {
      if (st.inspect) return 'move the mouse to turn it over · R puts it back';
      const g = nearestGame();
      if (!g) return null;
      if (eqDistance(walk) < g.d) return null;   /* equipment is closer: stand down */
      const it = g.it, def = it.def;
      if (def.kind === 'use') {
        if (def.id === 'terminal') {
          const hasModule = byId.data_module && (byId.data_module.collected || st.held === 'data_module');
          return hasModule ? 'press E to open the monitoring terminal' : 'press E — the terminal wants a data module';
        }
        if (M.stages[st.stage].id === 'response' && sop.active) {
          const want = M.sop[st.sopStep];
          return want.target === def.id ? 'press E — ' + want.label : 'SOP-07 step ' + (st.sopStep + 1) + ': ' + want.label;
        }
        return def.prompt || 'press E to use ' + def.name;
      }
      if (def.kind === 'tool') return def.prompt || 'press E to take the ' + def.name;
      return it.collected ? 'press E to read the ' + def.name + ' again' : 'press E to read the ' + def.name;
    };

    window.__gameUse = (walk) => {
      if (st.inspect) { endInspect(); return true; }
      /* a held tool answers E first */
      if (st.held) return useHeld();
      const g = nearestGame();
      if (!g) return false;
      if (eqDistance(walk) < g.d) return false;   /* the probe / valve / gauge is closer */
      return useItem(g.it.def.id);
    };

    window.__gameDrop = () => {
      if (st.inspect) { endInspect(); return true; }
      if (st.held) { dropHeld(); return true; }
      return false;
    };

    /* XR: the trigger resolves mission props the same way E does on desktop */
    window.__gameTargets = () => items
      .filter(i => !(i.def.kind === 'read' && i.collected) && st.held !== i.def.id &&
        (i.def.tier === undefined || !st.tierOpen || st.tierOpen[i.def.tier]))
      .map(i => i.root);
    window.__gameUseXR = (object3d) => {
      let o = object3d;
      while (o && !o.userData.gameItem) o = o.parent;
      if (!o || !o.userData.gameItem) return false;
      if (st.held) return useHeld();
      return useItem(o.userData.gameItem);
    };

    window.__gameClaimXR = (raycast) => {
      if (!panel.mesh.visible) return false;
      const hit = raycast.intersectObject(panel.mesh, false)[0];
      if (!hit) return false;
      const r = panel.hit(hit.uv);
      if (r && panel.onHit) panel.onHit(r.id);
      return true;
    };

    /* ---------- VR panel drawing ---------- */
    const drawPanel = () => {
      const p = panel, g = p.g;
      p.clear();
      const s = M.stages[st.stage];
      const tabs = [['task', 'TASK'], ['doc', 'DOCS'], ['diag', 'DIAG'], ['info', 'INFO']];
      p.chrome(M.title + ' · ' + s.title);
      tabs.forEach(([id, label], i) => p.button('tab:' + id, label, 30 + i * 190, 62, 180, 44, p.tab === id));

      if (p.tab === 'task') {
        let y = 140;
        g.fillStyle = '#eaf2fb'; g.font = '500 23px "Segoe UI",sans-serif';
        for (const o of s.objectives) {
          const done = !!st.objectives[o.id];
          g.fillStyle = done ? '#7fd6a2' : '#eaf2fb';
          g.fillText((done ? '[x] ' : '[ ] ') + o.label, 40, y); y += 34;
        }
        const hints = M.hints[s.id] || [];
        const lvl = Math.min(hints.length, hintLevel[s.id] || 0);
        if (lvl > 0) {
          g.fillStyle = '#ffd79a'; g.font = '500 21px "Segoe UI",sans-serif';
          const wrap = hints[lvl - 1].match(/.{1,58}(\s|$)/g) || [];
          y += 14;
          for (const l of wrap) { g.fillText(l.trim(), 40, y); y += 28; }
        }
        p.button('hint', 'HINT', 40, 640, 180, 46, false);
        const sig = 'index ' + SIG.index.toFixed(2) + ' · AE ' + Math.round(SIG.ae) + ' / cycle · LVDT ' +
          SIG.lvdt.toFixed(2) + ' mm · PT ' + SIG.P.toFixed(2) + ' MPa';
        g.fillStyle = '#9fb4c8'; g.font = '500 19px "Segoe UI",sans-serif';
        g.fillText(sig, 250, 668);
      }

      if (p.tab === 'doc') {
        const docs = items.filter(i => i.def.kind === 'read' || i.def.kind === 'inspect');
        if (p.docItem) {
          const lines = p.docItem.def.pages[p.docPage];
          g.fillStyle = '#f4f1e8'; g.fillRect(30, 118, 964, 520);
          g.fillStyle = '#1b232c'; g.font = '500 20px "Segoe UI",sans-serif';
          let y = 150;
          for (const l of lines) { g.fillText(l, 48, y); y += 27; }
          g.fillStyle = '#5c6a78'; g.font = '500 17px "Segoe UI",sans-serif';
          g.fillText('page ' + (p.docPage + 1) + ' / ' + p.docItem.def.pages.length, 830, 620);
          if (p.docPage > 0) p.button('docprev', 'BACK', 40, 640, 140, 46, false);
          if (p.docPage < p.docItem.def.pages.length - 1) p.button('docnext', 'NEXT', 200, 640, 140, 46, false);
          p.button('docclose', 'CLOSE', 830, 640, 160, 46, false);
        } else {
          let y = 150;
          g.fillStyle = '#eaf2fb'; g.font = '500 22px "Segoe UI",sans-serif';
          for (const it of docs) {
            const have = it.collected ? '[read] ' : '[unread] ';
            p.button('doc:' + it.def.id, have + it.def.name, 40, y - 22, 620, 40, false);
            y += 52;
          }
          g.fillStyle = '#9fb4c8'; g.font = '500 19px "Segoe UI",sans-serif';
          g.fillText('Walk to a document and press the trigger to read it.', 40, y + 20);
        }
      }

      if (p.tab === 'diag') {
        g.fillStyle = '#eaf2fb'; g.font = '500 21px "Segoe UI",sans-serif';
        g.fillText('Live: index ' + SIG.index.toFixed(2) + ' · AE ' + Math.round(SIG.ae) +
          ' / cyc · LVDT ' + SIG.lvdt.toFixed(2) + ' mm · PT ' + SIG.P.toFixed(2) + ' MPa', 40, 130);
        g.fillStyle = '#8fb8d8'; g.font = '600 20px "Segoe UI",sans-serif';
        g.fillText('DEFECT HYPOTHESIS', 40, 176);
        M.hypotheses.forEach((h, i) => {
          p.button('hyp:' + h, M.hypothesisLabels[h], 40, 192 + i * 52, 700, 44, diag.hyp === h);
        });
        g.fillStyle = '#8fb8d8';
        g.fillText('ACTION', 40, 440);
        M.actions.forEach((a, i) => p.button('act:' + i, a, 40 + i * 300, 456, 290, 44, diag.action === i));
        g.fillStyle = '#eaf2fb'; g.font = '500 21px "Segoe UI",sans-serif';
        g.fillText('Confidence ' + diag.conf + '%', 40, 550);
        g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(40, 566, 700, 12);
        g.fillStyle = '#4f9ae0'; g.fillRect(40, 566, 7 * diag.conf, 12);
        p.button('conf-5', '-5', 40, 590, 100, 44, false);
        p.button('conf+5', '+5', 150, 590, 100, 44, false);
        p.button('commit', 'COMMIT DECISION', 600, 640, 390, 46, true);
      }

      if (p.tab === 'info') {
        let y = 140;
        g.fillStyle = '#8fb8d8'; g.font = '600 20px "Segoe UI",sans-serif';
        g.fillText('EVIDENCE (' + st.evidence.length + ')', 40, y); y += 34;
        g.fillStyle = '#cfe0ef'; g.font = '500 20px "Segoe UI",sans-serif';
        for (const e of st.evidence) {
          const wrap = e.title.match(/.{1,60}(\s|$)/g) || [e.title];
          for (const l of wrap) { g.fillText('· ' + l.trim(), 40, y); y += 26; }
          y += 6;
        }
        if (!st.evidence.length) { g.fillText('· none yet', 40, y); y += 30; }
        y += 10;
        g.fillStyle = '#8fb8d8';
        g.fillText('SOP-07 — ' + (sop.active ? 'step ' + (st.sopStep + 1) + ': ' + M.sop[st.sopStep].label : 'not started'), 40, y);
        y += 40;
        g.fillStyle = '#9fb4c8'; g.font = '500 19px "Segoe UI",sans-serif';
        g.fillText('Hints used: ' + st.hintsUsed + ' · in hand: ' + (WALK.held ? 'probe' : (st.held || 'nothing')), 40, y);
      }

      if (p.tab === 'debrief') {
        g.fillStyle = '#f4f1e8'; g.fillRect(30, 118, 964, 520);
        g.fillStyle = '#1b232c'; g.font = '500 20px "Segoe UI",sans-serif';
        const debriefLines = (st.debriefBody || '').split('\n');
        let y = 152;
        for (const l of debriefLines) { g.fillText(l, 48, y); y += 26; }
        p.button('close', 'CLOSE', 830, 640, 160, 46, false);
      }

      p.onHit = (id) => {
        bus.emit('PANEL_HIT', { id });
        blip.play('ui');
        if (id.startsWith('tab:')) { p.tab = id.slice(4); drawPanel(); return; }
        if (id === 'hint') { giveHint(); drawPanel(); return; }
        if (id.startsWith('doc:')) { p.docItem = byId[id.slice(4)]; p.docPage = 0; openReader(p.docItem); return; }
        if (id === 'docprev' && p.docItem) { p.docPage = Math.max(0, p.docPage - 1); drawPanel(); return; }
        if (id === 'docnext' && p.docItem) { p.docPage = Math.min(p.docItem.def.pages.length - 1, p.docPage + 1); drawPanel(); return; }
        if (id === 'docclose') { p.docItem = null; drawPanel(); return; }
        if (id === 'close') { p.hide(); return; }
        if (id.startsWith('hyp:')) { diag.hyp = id.slice(4); drawPanel(); return; }
        if (id.startsWith('act:')) { diag.action = +id.slice(4); drawPanel(); return; }
        if (id === 'conf-5') { diag.conf = Math.max(0, diag.conf - 5); drawPanel(); return; }
        if (id === 'conf+5') { diag.conf = Math.min(100, diag.conf + 5); drawPanel(); return; }
        if (id === 'commit') { commitDiagnosis(); return; }
      };
      p.tex.needsUpdate = true;
    };
    this.drawPanel = drawPanel;

    /* ---------- persistence ---------- */
    const SAVEKEY = 'caes_mission_save';
    const save = () => {
      try {
        localStorage.setItem(SAVEKEY, JSON.stringify({
          missionId: M.id, fault, sessionId: bus.sessionId,
          stage: st.stage, objectives: st.objectives, sopStep: st.sopStep,
          collected: items.filter(i => i.collected).map(i => i.def.id),
          held: st.held, probeHeld: st.probeHeld, everHeld: st.everHeld, evidence: st.evidence, combines: st.combines,
          hintsUsed: st.hintsUsed, hintLevel, diagnosis: st.diagnosis,
          savedAt: new Date().toISOString()
        }));
      } catch (e) {}
    };
    this.save = save;

    /* ---------- keyboard (desktop) ---------- */
    addEventListener('keydown', (e) => {
      if (ctx.MODE !== 'mission') return;
      const k = e.key.toLowerCase();
      if (k === 'h') { giveHint(); return; }
      if (k === 'tab') { e.preventDefault(); toggleSide(); return; }
      if (k === 'j') { toggleEvidence(); return; }
      if (k === 'r') { st.inspect ? endInspect() : beginInspect(); return; }
      if (k === 'escape') { if (st.inspect) endInspect(); closeModal(); }
    });

    /* desktop kit + evidence side panels (also carries settings) */
    let sideEl = null, sideMode = null;
    const closeSide = () => { if (sideEl) { sideEl.remove(); sideEl = null; } };
    const renderSide = () => {
      if (!sideEl) return;
      if (sideMode === 'kit') {
        /* the task section rides on top of the kit: one panel, one key */
        const rows = items.filter(i => i.def.kind !== 'use').map(i =>
          '<div class="it ' + (i.collected || st.held === i.def.id ? '' : 'missing') + '" data-id="' + i.def.id + '">' +
          '<span>' + i.def.name + '</span><span>' +
          (st.held === i.def.id ? 'in hand' : i.def.kind === 'tool' ? (i.collected ? 'used' : 'on the bench') : (i.collected ? 'read' : 'on the bench')) +
          '</span></div>').join('');
        sideEl.innerHTML = taskSection() +
          '<h4 style="margin-top:14px">FIELD KIT</h4>' + rows +
          '<div style="margin-top:10px;color:#9fb4c8;font-size:11.5px">Probe: ' +
          (WALK.held ? 'in hand — aim and press E' : 'on the bench') +
          '<br>Torch: ' + (st.torchOn ? 'ON' : 'off') + ' · Helmet: ' + (st.wornHelmet ? 'on' : 'off') + '</div>' +
          '<label>Volume <input type="range" min="0" max="100" value="' + Math.round(blip.vol * 100) + '" data-set="vol" style="width:120px"></label>' +
          '<label>Reduce shake <input type="checkbox" data-set="motion" ' + (st.reducedMotion ? 'checked' : '') + '></label>' +
          '<label>Save <button class="ghost" data-set="wipe" style="margin-left:auto">reset</button></label>';
        sideEl.querySelectorAll('.it').forEach(x => x.addEventListener('click', () => {
          const it = byId[x.dataset.id];
          if (it && it.collected && (it.def.kind === 'read' || it.def.kind === 'inspect')) openReader(it);
        }));
        const vol = sideEl.querySelector('input[data-set="vol"]');
        vol.addEventListener('input', () => { blip.setVolume(+vol.value / 100); blip.setHumVolume(); blip.play('ui'); });
        sideEl.querySelector('input[data-set="motion"]').addEventListener('change', (e) => {
          st.reducedMotion = e.target.checked;
          try { localStorage.setItem('caesMissionMotion', st.reducedMotion ? '0' : '1'); } catch (err) {}
        });
        sideEl.querySelector('button[data-set="wipe"]').addEventListener('click', () => {
          try { localStorage.removeItem(SAVEKEY); } catch (err) {}
          say('Saved round cleared — the next reload starts fresh.', '', 3000);
        });
      } else {
        sideEl.innerHTML = '<h4>EVIDENCE (' + st.evidence.length + ')</h4>' +
          (st.evidence.map(e => '<div class="ev"><b style="font-size:11.5px">' + e.title + '</b></div>').join('') ||
           '<div class="ev">none yet</div>') +
          '<h4 style="margin-top:12px">SOP-07</h4><div class="ev">' +
          (sop.active ? 'step ' + (st.sopStep + 1) + ': ' + M.sop[st.sopStep].label : 'not started') + '</div>';
      }
    };
    const toggleSide = () => {
      if (sideEl && sideMode === 'kit') { closeSide(); return; }
      closeSide(); sideMode = 'kit';
      sideEl = document.createElement('div'); sideEl.className = 'mSide';
      document.body.appendChild(sideEl); renderSide();
      blip.play('ui');
    };
    const toggleEvidence = () => {
      if (sideEl && sideMode === 'ev') { closeSide(); return; }
      closeSide(); sideMode = 'ev';
      sideEl = document.createElement('div'); sideEl.className = 'mSide';
      document.body.appendChild(sideEl); renderSide();
    };
    this.renderSide = renderSide;

    /* ---------- briefing (with resume) ---------- */
    const openBrief = () => {
      if (isVR()) { panel.tab = 'task'; panel.show(); drawPanel(); }
      else {
        let saveData = null;
        try { saveData = JSON.parse(localStorage.getItem(SAVEKEY) || 'null'); } catch (e) {}
        const resumable = saveData && saveData.missionId === M.id && saveData.stage > 0 && !saveData.objectives.complete_debriefing;
        const el = document.createElement('div');
        el.className = 'mOverlay';
        el.innerHTML = '<div class="paper"><h3>' + M.title + '</h3>' +
          M.brief.map(b => b + '\n').join('') +
          (resumable ? '<div class="ev"><b>Saved round found</b><i>stage ' + (saveData.stage + 1) +
            ' · saved ' + new Date(saveData.savedAt).toLocaleTimeString() + '</i></div>' : '') +
          '<div class="btns">' +
          (resumable ? '<button data-a="resume">RESUME</button>' : '') +
          '<button data-a="go">' + (resumable ? 'START OVER' : 'BEGIN THE ROUND') + '</button></div></div>';
        el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
          el.remove();
          bus.emit('BRIEF_CONFIRMED', { resume: b.dataset.a === 'resume' });
          if (b.dataset.a === 'resume' && saveData) {
            st.resumed = true;
            st.stage = Math.min(saveData.stage, M.stages.length - 1);
            st.objectives = saveData.objectives || {};
            st.sopStep = saveData.sopStep || 0;
            st.evidence = saveData.evidence || [];
            st.combines = saveData.combines || {};
            st.hintsUsed = saveData.hintsUsed || 0;
            for (const k in (saveData.hintLevel || {})) hintLevel[k] = saveData.hintLevel[k];
            st.diagnosis = saveData.diagnosis || null;
            if (saveData.fault && M.faults[saveData.fault]) {
              st.fault = saveData.fault;
              SIG.fault = saveData.fault;
            }
            for (const it of items) if (saveData.collected.includes(it.def.id)) it.collected = true;
            bus.emit('MISSION_RESUMED', { stage: st.stage });
            say('Round resumed at stage ' + (st.stage + 1) + '.', 'ok', 3200);
            if (M.stages[st.stage].id === 'response') sop.active = true;
          } else {
            try { localStorage.removeItem(SAVEKEY); } catch (err) {}
            bus.emit('MISSION_STARTED', { fault });
          }
          quest.objectiveDone('start');
          quest.next();
        }));
        document.body.appendChild(el);
        modalEl = el;
      }
    };

    /* ---------- per-frame: physics, quest, combines, torch, ring ---------- */
    window.__gameTick = (dt) => {
      if (!st.active || st.paused) return;
      ctx.stepPhysics(dt);

      /* the vent-down really moves the model state */
      if (st.sopStep >= 2 && SIG.P > 0.05) {
        SIG.P = Math.max(0.05, SIG.P - dt * 0.55);
        SIG.index = Math.max(0.05, SIG.index - dt * 0.22);
        SIG.ae = Math.max(1, SIG.ae - dt * 4);
      }

      /* live HUD rows (desktop): the elements are cached, a per-frame query
         forces layout work for nothing */
      const rows = window.__rowCache || (window.__rowCache = document.querySelectorAll('.left .row b'));
      if (rows[0]) rows[0].textContent = SIG.index.toFixed(2);
      if (rows[1]) rows[1].textContent = Math.round(SIG.ae) + ' / cycle';
      if (rows[2]) rows[2].textContent = SIG.lvdt.toFixed(2) + ' mm';
      if (rows[3]) rows[3].textContent = (SIG.seep > 0 ? SIG.seep.toFixed(2) + ' L/min' : SIG.P.toFixed(2) + ' MPa');

      checkCombines();
      quest.check();

      /* SOP steps verified by looking, not by pressing: the vent is done when
         the wheel has turned, the gauge steps when the gauge is in front of
         the player — the valve and the gauge sit close together, so the walk
         system's nearest-target rule would pick the valve there. */
      if (sop.active && st.sopStep < M.sop.length) {
        const step = M.sop[st.sopStep];
        if (step.target === 'valve' && (WALK.vented || WALK.valveTurn > (step.hold || 1.4))) sop.complete('valve');
        else if (step.target === 'gauge') {
          const p = ctx.renderer.xr.isPresenting ? ctx.xrRig.position : WALK.pos;
          const d = EQ.gauge.position.distanceTo(new THREE.Vector3(p.x, 0, p.z));
          if (d < 1.6) sop.complete('gauge');
        }
      }

      /* UT scanner: the window follows the aim; the fault shows through */
      const scanning = st.held === 'ut_scanner' && st.scanOn;
      const it2 = byId.ut_scanner;
      const R = window.__reveal;
      /* the scan beam defaults to hidden every frame — the scanning branch
         below shows it again while the probe is on */
      if (window.__scanBeam) {
        window.__scanBeam.visible = false;
        if (window.__scanDot) window.__scanDot.visible = false;
      }
      if (scanning) {
        const rc = new THREE.Raycaster();
        let origin, dirv;
        if (isVR() && ctx.xrRig) {
          const ctrl = (window.__xr && window.__xr.XR.controllers.find(c => c.visible)) || null;
          if (ctrl) {
            origin = new THREE.Vector3().setFromMatrixPosition(ctrl.matrixWorld);
            dirv = new THREE.Vector3(0, 0, -1).applyQuaternion(ctrl.getWorldQuaternion(new THREE.Quaternion()));
          }
        }
        if (!origin) {
          rc.setFromCamera(new THREE.Vector2(0, 0), ctx.camera);
          origin = rc.ray.origin.clone(); dirv = rc.ray.direction.clone();
        }
        const hit = rc.set(origin, dirv), hits = rc.intersectObjects(window.__chamberHits || [], true)[0];
        if (hits) R.pos.copy(hits.point);
        R.on = Math.min(1, R.on + dt * 5);
        window.__scanLights.forEach(l => { l.visible = true; });
        /* the beam itself: a tapering additive line from the handheld probe
           to the point on the liner, with a hot spot at the impact — the
           interaction had no visible connection between probe and rig */
        if (!window.__scanBeam) {
          const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.014, 0.006, 1, 6, 1, true),
            new THREE.MeshBasicMaterial({
              color: 0x57e0a8, transparent: true, opacity: 0.42,
              blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0x8ceec0, transparent: true, opacity: 0.8,
              blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
          beam.renderOrder = 6; dot.renderOrder = 6;
          ctx.scene.add(beam, dot);   /* the hall lives on ctx.scene here */

          window.__scanBeam = beam;
          window.__scanDot = dot;
        }
        {
          const A = it2.root.getWorldPosition(new THREE.Vector3());
          const dirB = new THREE.Vector3().subVectors(R.pos, A);
          const len = Math.max(0.02, dirB.length());
          window.__scanBeam.position.copy(A).addScaledVector(dirB, 0.5);
          window.__scanBeam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirB.normalize());
          window.__scanBeam.scale.set(1, len, 1);
          window.__scanDot.position.copy(R.pos);
          window.__scanBeam.visible = true;
          window.__scanDot.visible = true;
          window.__scanBeam.material.opacity = 0.36 + 0.14 * Math.sin(performance.now() * 0.006);
        }
        /* the fault overlay shows while the beam is on the defect area */
        const area = M.faults[fault].area;
        const near = R.pos.distanceTo(new THREE.Vector3(area[0], area[1], area[2])) < 1.05;
        const ov = window.__faultOverlays && window.__faultOverlays[fault];
        if (ov) ov.visible = near || window.__forceAE;
        if (near && !st.scanned) {
          st.scanned = true;
          addEvidence({
            id: 'ev_scan',
            title: 'UT scan: flaw echo at the marked area — the defect is confirmed in the liner',
            note: 'What the channels suggested, the scanner confirms.'
          });
        }
        /* device screen: A-scan + flaw readout */
        if (it2.screen && performance.now() - (it2.lastDraw || 0) > 180) {
          it2.lastDraw = performance.now();
          const x = it2.screen.ctx, W2 = 256, H2 = 160;
          x.fillStyle = '#0c1219'; x.fillRect(0, 0, W2, H2);
          x.strokeStyle = '#1d2b3a'; x.strokeRect(2, 2, W2 - 4, H2 - 4);
          x.strokeStyle = '#57e0a8'; x.lineWidth = 2; x.beginPath();
          for (let px = 0; px < W2; px++) {
            const ph = px / W2;
            let a = Math.exp(-Math.pow((ph - 0.18) * 14, 2)) * 0.8
                  + Math.exp(-Math.pow((ph - 0.62) * 22, 2)) * (near ? 1.6 : 0.25)
                  + Math.sin(ph * 90) * 0.03;
            const py = H2 - 14 - a * (H2 - 34);
            if (px === 0) x.moveTo(px, py); else x.lineTo(px, py);
          }
          x.stroke();
          x.fillStyle = near ? '#57e0a8' : '#9fb4c8';
          x.font = '700 15px "Segoe UI",sans-serif';
          x.fillText(near ? 'FLAW ECHO — DEFECT' : 'scanning…', 10, 24);
          x.fillStyle = '#cfe0ef'; x.font = '500 12px "Segoe UI",sans-serif';
          x.fillText('2.5 MHz  ·  range 1.2 m', 10, H2 - 8);
          it2.screen.tex.needsUpdate = true;
        }
      } else {
        R.on = Math.max(0, R.on - dt * 5);
        window.__scanLights.forEach(l => { l.visible = false; });
        const ov = window.__faultOverlays && window.__faultOverlays[fault];
        if (ov && !window.__mission.state.diagnosis) ov.visible = !!window.__forceAE;
        if (it2 && it2.screen) { /* screen dimmed */ }
      }

      /* probe sampling → evidence */
      if (WALK.held && WALK.flash && /probe @/.test(WALK.flash.text) && !st.sampled) {
        st.sampled = true;
        addEvidence({
          id: 'ev_probe',
          title: 'Probe at the chamber: ' + WALK.flash.text.replace('· ', ' · '),
          note: 'First-hand reading at the suspicious area.'
        });
      }

      /* the torch is only lit while it is being held */
      torch.visible = st.torchOn && st.held === 'flashlight';

      /* the ring appears once the log has been read — or once the map and the
         probe have been cross-referenced, which is the other way there */
      if ((byId.clipboard && byId.clipboard.collected) || st.combines.map_probe_done) ring.visible = true;
      if (ring.visible) {
        const s = 1 + 0.16 * Math.sin(performance.now() / 380);
        ring.scale.setScalar(s);
        ring.material.opacity = 0.55 + 0.3 * Math.sin(performance.now() / 380);
      }

      /* the equipment cabinet: every tier shows its kit behind the frame —
         the tools are never hidden (an empty glass box read as a bug), only
         the LOCKED tag and the LED colour say whether the tier will open */
      const ORDER = ['briefing', 'entry', 'investigation', 'evidence', 'diagnosis', 'response', 'debrief'];
      const si2 = ORDER.indexOf(M.stages[st.stage].id);
      st.tierOpen = [true, si2 >= 2, si2 >= 3];
      (window.__cabinetTiers || []).forEach((t, i) => {
        if (!t) return;
        const open = st.tierOpen[i];
        t.cover.visible = !open;                       /* the LOCKED tag */
        t.strip.material.color.setHex(open ? 0x60cdff : 0xc98a1e);
        t.strip.material.opacity = open ? 0.55 + 0.25 * Math.sin(performance.now() / 300) : 0.30;
      });
      for (const it of items) {
        const ti = it.def.tier;
        if (ti === undefined || st.held === it.def.id) continue;
        it.root.visible = !it.collected;
      }
      if (!st.__cabDumped) {
        st.__cabDumped = true;
        for (const it of items) {
          if (it.def.tier === undefined) continue;
          console.log('[cab]', it.def.id, 'tier', it.def.tier,
            'collected', !!it.collected, 'held', st.held === it.def.id,
            'visible', it.root.visible, 'parent', it.root.parent && it.root.parent.type,
            'pos', it.root.position.toArray().map(v => v.toFixed(2)).join(','));
        }
        console.log('[cab] tiers', (window.__cabinetTiers || []).length,
          'stage', M.stages[st.stage].id, 'open', JSON.stringify(st.tierOpen),
          'tags', (window.__cabinetTiers || []).map(t => t && t.cover ? t.cover.visible : 'x').join(','));
        const pr = window.__probeRef;
        console.log('[probe-state] parent', pr && pr.parent ? pr.parent.type : 'none',
          'pos', pr ? pr.position.toArray().map(v => v.toFixed(2)).join(',') : '-',
          'walkHeld', WALK.held || 'none', 'resumed', !!st.resumed);
      }

      if (st.reducedMotion) window.__shake = 0;

      /* the cutaway: unlocked when the debrief opens — the whole vessel turns
         into a section view as the teaching payoff */
      if (M.stages[st.stage].id === 'debrief') st.sectionT = Math.min(1, st.sectionT + dt * 0.8);
      const Rv = window.__reveal;
      const U = Rv.uniformsList || [];
      for (const u of U) { u.uRevealOn.value = Rv.on; u.uSection.value = st.sectionT; }
      window.__scanLights.forEach((l, li) => {
        l.visible = scanning || st.sectionT > 0.05;
        l.intensity = (li === 2 ? 1.4 : 1.1) * (1 + 3.2 * st.sectionT);   /* the cutaway needs a lit interior */
      });

      if (isVR() && panel.mesh.visible) this.drawPanel();
    };

    /* ---------- export: log-schema v0 (15号文档) ----------
       Every field the frozen schema names is emitted at top level; the
       pre-schema payload is preserved verbatim under `raw` for audit. */
    const buildPayload = () => {
      const d = st.diagnosis;
      const ACT = ['log_monitor', 'increase_sweep', 'emergency_vent'];
      const faultClassMap = { crown: 'crown', crack: 'crack', seam: 'seam', support: 'backsup' };
      const outcome = fault === 'control' ? 0 : 1;
      const pidQ = new URLSearchParams(location.search).get('pid');
      const seq = String(1).padStart(3, '0');
      return {
        trial_id: 'S' + bus.sessionId + '-' + seq,
        participant_id: pidQ || 'S' + bus.sessionId,
        condition_modality: 'XR',
        condition_uncertainty: ctx.UNC || 'hidden',
        scenario_id: 'B2-' + (fault || 'crown').toUpperCase() + '-01',
        fault_class: faultClassMap[fault] || fault,
        is_signal: fault !== 'control',
        stimulus_hash: 'v0-' + (fault || 'crown') + '-B2-01',
        freeze_ts: st.freezeAt || null,
        response: d ? ACT[d.action] : null,
        response_latency_ms: d ? Math.round(d.latency * 1000) : null,
        confidence_0_100: d ? Math.round(d.conf * 100) : null,
        interactions: {
          probeSamples: st.sampled ? 1 : 0,
          annotations: window.__pinCount ? window.__pinCount() : 0,
          terminalOpens: st.evidence.filter(e => e.id === 'ev_terminal').length
        },
        correct_response: ACT[ctx.groundTruth()],
        scored_sdt: null,          /* session-level: computed across trials by the validator */
        scored_brier: d ? +Math.pow(d.conf - outcome, 2).toFixed(4) : null,
        adaptive_rule_fired: null, /* rules off in this mode (Phase 3 constraint) */
        raw: {
          sessionId: bus.sessionId,
          mode: 'mission',
          missionId: M.id,
          condition: { presentation: 'immersive', uncertainty: ctx.UNC || 'hidden', agency: ctx.AGENCY || 'probe' },
          fault,
          gameplay: {
            events: bus.log,
            hintsUsed: st.hintsUsed,
            evidence: st.evidence,
            sopStep: st.sopStep,
            combines: Object.keys(st.combines),
            torchUsed: st.torchOn || st.wornHelmet
          },
          assessment: st.diagnosis ? {
            hyp: st.diagnosis.hyp, hypCorrect: st.diagnosis.hypCorrect,
            response: st.diagnosis.action, correct: st.diagnosis.actionCorrect,
            gt: st.diagnosis.gtAction, conf: st.diagnosis.conf, latency: st.diagnosis.latency
          } : null,
          nasaTlx: st.tlx,
          createdAt: new Date().toISOString()
        }
      };
    };
    const exportSession = () => {
      const payload = buildPayload();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'caes-mission-' + Date.now() + '.json';
      a.click();
    };
    this.exportSession = exportSession;

    /* debug + test handle */
    window.__mission = { state: st, quest, diag, sop, M, bus,
      openDiagnosis, openDebrief, exportSession, exportPayload: buildPayload, say, addEvidence, blip,
      takeItem, dropHeld, beginInspect, endInspect, byId, useItem,
      items, nearestGame, torch, ring, save };

    /* ---------- go ---------- */
    bus.emit('MISSION_LOADED', { fault });
    if (new URLSearchParams(location.search).get('brief') === '0') {
      /* dev/verification hook: skip the briefing paper (?brief=0) */
      bus.emit('MISSION_STARTED', { fault });
      quest.objectiveDone('start');
      quest.next();
    } else openBrief();
    renderHud();
    blip.ambience();

    return this;
  }
};
