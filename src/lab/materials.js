// 实验室材质库：全部程序化生成（canvas 纹理 + PBR 参数），无外部资源。
// v2：高分辨率贴图 + 凹凸/粗糙度图（岩石层理裂纹、砂土波纹、砂浆气孔、缎纹编织、木纹、地面混凝土）。
import * as THREE from 'three';

const texCache = new Map();

function toTexture(key, canvas, { repeat = 1, srgb = true } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, tex);
  return tex;
}

// 值噪声表面：底色 + 斑块 + 可选层理/裂纹/划痕/气孔
function surfaceTexture(key, size, opts = {}) {
  if (texCache.has(key)) return texCache.get(key);
  const {
    base = '#a2957f', spots = [], density = 900, blotch = 26, grain = 0.14,
    striations = 0, cracks = 0, strokes = 0, pores = 0, ripple = 0, rings = 0,
  } = opts;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);
  // 斑块
  for (let i = 0; i < density; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = 1 + Math.random() * blotch;
    g.globalAlpha = 0.04 + Math.random() * grain;
    g.fillStyle = spots[(Math.random() * spots.length) | 0] || base;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  // 沉积层理（水平弱条带）
  for (let i = 0; i < striations; i++) {
    const y = Math.random() * size;
    const h = 2 + Math.random() * 9;
    g.globalAlpha = 0.05 + Math.random() * 0.09;
    g.fillStyle = Math.random() > 0.5 ? '#6f6350' : '#c3b69d';
    g.fillRect(0, y, size, h);
  }
  // 砂土波纹（正弦条带）
  if (ripple > 0) {
    for (let y = 0; y < size; y += 8) {
      g.globalAlpha = 0.05 + 0.05 * Math.sin(y / (size / (ripple * 2)) * Math.PI * 2);
      g.fillStyle = '#8f7d54';
      g.fillRect(0, y, size, 3);
    }
  }
  // 收缩裂纹（折线）
  for (let i = 0; i < cracks; i++) {
    g.globalAlpha = 0.22 + Math.random() * 0.18;
    g.strokeStyle = '#4f4638';
    g.lineWidth = 0.8 + Math.random() * 1.2;
    let x = Math.random() * size, y = Math.random() * size;
    g.beginPath(); g.moveTo(x, y);
    const segs = 5 + (Math.random() * 6) | 0;
    for (let s = 0; s < segs; s++) {
      x += (Math.random() - 0.5) * 90;
      y += (Math.random() - 0.5) * 90;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  // 气孔（砂浆/混凝土）
  for (let i = 0; i < pores; i++) {
    g.globalAlpha = 0.25 + Math.random() * 0.3;
    g.fillStyle = '#77726a';
    const r = 0.8 + Math.random() * 2.4;
    g.beginPath(); g.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2); g.fill();
  }
  // 划痕（漆面磨损）
  for (let i = 0; i < strokes; i++) {
    g.globalAlpha = 0.05 + Math.random() * 0.08;
    g.strokeStyle = Math.random() > 0.5 ? '#d9dde0' : '#5d6468';
    g.lineWidth = 0.6 + Math.random() * 1.4;
    const x = Math.random() * size, y = Math.random() * size;
    const len = 20 + Math.random() * 130;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * len); g.stroke();
  }
  // 木纹 + 节疤
  if (opts.grain) {
    for (let i = 0; i < 130; i++) {
      g.globalAlpha = 0.06 + Math.random() * 0.1;
      g.strokeStyle = Math.random() > 0.5 ? '#7a6244' : '#b08e63';
      g.lineWidth = 1 + Math.random() * 2.4;
      const y = Math.random() * size;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= size; x += 32) g.lineTo(x, y + Math.sin(x / 60 + i) * 3);
      g.stroke();
    }
    for (let i = 0; i < rings; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      for (let r = 2; r < 14; r += 3) {
        g.globalAlpha = 0.16;
        g.strokeStyle = '#5e4a30';
        g.beginPath(); g.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2); g.stroke();
      }
    }
  }
  g.globalAlpha = 1;
  return toTexture(key, c, { srgb: false });
}

export function buildMaterials() {
  const rockTex = surfaceTexture('rock', 1024, {
    base: '#a2957f', spots: ['#8f846f', '#b3a68f', '#8a7f6b', '#c0b49c'], density: 1500, blotch: 30,
    striations: 26, cracks: 14,
  });
  const sandTex = surfaceTexture('sand', 1024, {
    base: '#c9b689', spots: ['#b7a274', '#d8c79c', '#a6925f'], density: 2600, blotch: 9, grain: 0.2, ripple: 5,
  });
  sandTex.repeat.set(3, 3);
  const mortarTex = surfaceTexture('mortar', 512, {
    base: '#b5b1a8', spots: ['#a5a199', '#c4c0b7', '#98948b'], density: 1200, blotch: 16, pores: 220, cracks: 5,
  });
  const concreteTex = surfaceTexture('concrete', 512, {
    base: '#a5a3a0', spots: ['#94928f', '#b4b2af', '#8b8987'], density: 1200, blotch: 20, pores: 160,
  });
  const floorTex = surfaceTexture('floor', 1024, {
    base: '#131417', spots: ['#0e0f12', '#17181c', '#101115'], density: 700, blotch: 42, strokes: 260, pores: 90,
  });
  floorTex.repeat.set(9, 9);
  const plywoodTex = surfaceTexture('plywood', 512, {
    base: '#a3835c', spots: ['#96764f', '#b18f66'], density: 500, blotch: 18, grain: null, rings: 3, strokes: 0,
  });
  plywoodTex.repeat.set(2, 2);

  // 缎纹编织（玄武岩纤维布）：斜向交织 + 高光纱线
  let weave = texCache.get('weave');
  if (!weave) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#8d8b84'; g.fillRect(0, 0, 256, 256);
    for (let i = -256; i < 256; i += 10) {
      g.strokeStyle = '#7c7a74'; g.lineWidth = 4;
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 256, 256); g.stroke();
      g.strokeStyle = '#9b9992'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(i + 256, 0); g.lineTo(i, 256); g.stroke();
    }
    for (let i = 0; i < 700; i++) {
      g.globalAlpha = 0.1 + Math.random() * 0.15;
      g.fillStyle = Math.random() > 0.5 ? '#b9b7ae' : '#6b6962';
      g.fillRect(Math.random() * 256, Math.random() * 256, 6, 1.4);
    }
    g.globalAlpha = 1;
    weave = toTexture('weave', c, { srgb: false });
    weave.repeat.set(4, 4);
  }

  // 拉丝金属
  let brushed = texCache.get('brushed');
  if (!brushed) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#b9bdc1'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      g.strokeStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '60,64,68'},${0.05 + Math.random() * 0.08})`;
      const y = Math.random() * 256;
      g.beginPath(); g.moveTo(0, y); g.lineTo(256, y + (Math.random() - 0.5) * 4); g.stroke();
    }
    brushed = toTexture('brushed', c, { srgb: false });
  }

  // 箔式应变片栅纹
  let foil = texCache.get('foil');
  if (!foil) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#26272a'; g.fillRect(0, 0, 64, 128);
    g.strokeStyle = '#9aa0a4'; g.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const x = 12 + i * 10;
      g.beginPath(); g.moveTo(x, 14); g.lineTo(x, 100); g.stroke();
    }
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(8, 106); g.lineTo(56, 106); g.stroke();
    g.beginPath(); g.moveTo(8, 114); g.lineTo(56, 114); g.stroke();
    foil = toTexture('foil', c, { srgb: false });
  }

  // 笔记本键盘键位
  let keyboard = texCache.get('keyboard');
  if (!keyboard) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#212226'; g.fillRect(0, 0, 256, 128);
    for (let r = 0; r < 5; r++) for (let k = 0; k < 14; k++) {
      const w = k === 13 && r === 4 ? 0 : 14;
      if (!w) continue;
      g.fillStyle = '#2e3035';
      g.fillRect(8 + k * 17.4, 10 + r * 17, w, 14);
      g.fillStyle = 'rgba(255,255,255,0.06)';
      g.fillRect(8 + k * 17.4, 10 + r * 17, w, 3);
    }
    g.fillStyle = '#2e3035';
    g.fillRect(96, 96, 64, 22); // 触控板
    g.strokeStyle = '#3a3d42'; g.lineWidth = 2;
    g.strokeRect(96, 96, 64, 22);
    keyboard = toTexture('keyboard', c, { srgb: false });
  }

  // 裂纹纹理（分支缝，用于疲劳裂缝贴片）
  let crack = texCache.get('crack');
  if (!crack) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 256, 256);
    const branch = (x, y, a, len, w, depth) => {
      if (depth <= 0 || len < 6) return;
      const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len;
      g.strokeStyle = depth > 2 ? '#c2472e' : '#8a2a1a';
      g.lineWidth = w;
      g.globalAlpha = 1;
      g.beginPath(); g.moveTo(x, y);
      const mx = (x + nx) / 2 + Math.cos(a + 1.2) * len * 0.12;
      const my = (y + ny) / 2 + Math.sin(a + 1.2) * len * 0.12;
      g.quadraticCurveTo(mx, my, nx, ny); g.stroke();
      if (Math.random() < 0.7) branch(nx, ny, a + (Math.random() - 0.5) * 1.1, len * 0.62, w * 0.62, depth - 1);
      if (Math.random() < 0.4) branch((x + nx) / 2, (y + ny) / 2, a - 0.9 - Math.random() * 0.5, len * 0.5, w * 0.5, depth - 2);
    };
    for (let i = 0; i < 4; i++) {
      branch(30 + Math.random() * 60, 40 + Math.random() * 176, (Math.random() - 0.5) * 0.8, 70 + Math.random() * 55, 5, 5);
    }
    g.globalAlpha = 1;
    crack = toTexture('crack', c, { srgb: true });
  }

  // 漆面磨损（作为钢漆的粗糙度图）
  let wear = texCache.get('wear');
  if (!wear) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#8a8a8a'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 400; i++) {
      g.globalAlpha = 0.1 + Math.random() * 0.25;
      g.fillStyle = Math.random() > 0.5 ? '#b8b8b8' : '#5c5c5c';
      const x = Math.random() * 256, y = Math.random() * 256;
      g.beginPath(); g.arc(x, y, 1 + Math.random() * 9, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    wear = toTexture('wear', c, { srgb: false });
  }

  const S = (color, rough, metal, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
  const T = (tex, color, rough, metal, extra = {}) => new THREE.MeshStandardMaterial({ map: tex, color, roughness: rough, metalness: metal, ...extra });

  const mats = {
    // 金属
    steelPaint: T(wear, 0x9aa0a3, 0.5, 0.35, { roughnessMap: wear, bumpMap: wear, bumpScale: 0.004 }),
    steelPaintDark: T(wear, 0x4d545a, 0.55, 0.4, { roughnessMap: wear, bumpMap: wear, bumpScale: 0.004 }),
    steelMachined: S(0xb7bcc0, 0.34, 0.85),
    brushed: T(brushed, 0xffffff, 0.38, 0.9),
    alu: S(0xcfd3d6, 0.4, 0.88),
    darkSteel: S(0x2e3134, 0.5, 0.7),
    castIron: S(0x3d4145, 0.68, 0.55),
    brass: S(0xc8a04b, 0.35, 0.9),
    copper: S(0xb87333, 0.42, 0.85),
    chrome: S(0xe4e8ea, 0.12, 1.0),
    boltSteel: S(0x8f959a, 0.42, 0.9),
    rust: S(0x7a4a30, 0.8, 0.4),
    // 塑料 / 橡胶 / 有机
    rubber: T(rockTex, 0x232426, 0.88, 0.0, { bumpMap: sandTex, bumpScale: 0.004 }),
    rubberSoft: T(rockTex, 0x2a2b2d, 0.78, 0.0, { bumpMap: sandTex, bumpScale: 0.003 }),
    upvc: S(0xc9cdc9, 0.38, 0.08),
    silicone: new THREE.MeshPhysicalMaterial({ color: 0xe9e2d4, roughness: 0.32, metalness: 0, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
    plasticWhite: S(0xe8e7e2, 0.6, 0.05),
    plasticBlack: S(0x17181a, 0.55, 0.1),
    plasticGrey: S(0x77797c, 0.6, 0.08),
    plywood: T(plywoodTex, 0xffffff, 0.85, 0.0, { bumpMap: plywoodTex, bumpScale: 0.01, side: THREE.DoubleSide }),
    acrylic: new THREE.MeshPhysicalMaterial({ color: 0xdfeef0, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
    glassWater: new THREE.MeshPhysicalMaterial({ color: 0x2f6ea8, roughness: 0.15, metalness: 0, transparent: true, opacity: 0.55, depthWrite: false }),
    // 岩土 / 材料
    rock: T(rockTex, 0x8a7d68, 0.95, 0.02, { roughnessMap: rockTex, bumpMap: rockTex, bumpScale: 0.014 }),
    rockCut: T(rockTex, 0xa89a82, 0.94, 0.02, { bumpMap: rockTex, bumpScale: 0.01 }),
    sand: T(sandTex, 0xd9cba6, 0.96, 0.0, { bumpMap: sandTex, bumpScale: 0.01 }),
    mortar: T(mortarTex, 0xffffff, 0.92, 0.0, { bumpMap: mortarTex, bumpScale: 0.008 }),
    concrete: T(concreteTex, 0xffffff, 0.85, 0.02, { bumpMap: concreteTex, bumpScale: 0.008 }),
    lining: T(concreteTex, 0xb3aca0, 0.88, 0.02, { bumpMap: concreteTex, bumpScale: 0.006 }),
    polyurea: S(0xc2c86e, 0.42, 0.06),
    fiberWrap: T(weave, 0xffffff, 0.7, 0.08, { roughnessMap: weave, bumpMap: weave, bumpScale: 0.005 }),
    floor: T(floorTex, 0xffffff, 0.92, 0.05, { bumpMap: floorTex, bumpScale: 0.006 }),
    // 线缆 / 管路
    hoseBlue: S(0x3a5fa8, 0.72, 0.1),
    hoseBlack: S(0x232426, 0.8, 0.08),
    cableGrey: S(0x55575a, 0.75, 0.1),
    cableOrange: S(0xc96a2a, 0.7, 0.05),
    cableWhite: S(0xd9d7d0, 0.7, 0.05),
    fbYellow: S(0xe8d44d, 0.5, 0.0),
    // 线路视图分类：fiber 光纤 / signal 信号 / fluid 流体 / power 电力
    // （标记在 userData.lineType，由 parts.cable/pipeRun 传递到网格）
    // 功能色
    acid: new THREE.MeshStandardMaterial({ color: 0xd9ff58, roughness: 0.45, metalness: 0.05, emissive: 0x35430a, emissiveIntensity: 0.55 }),
    warnRed: S(0xb23a2e, 0.6, 0.1),
    paintYellow: S(0xd8b93c, 0.55, 0.15),
    paintRed: S(0x9e352b, 0.55, 0.15),
    coneOrange: S(0xd96a2a, 0.6, 0.05),
    extinguisherRed: S(0xb02a20, 0.35, 0.25),
    sensorChip: S(0x2b2b2e, 0.6, 0.1),
    gaugeFoil: T(foil, 0xffffff, 0.5, 0.1),
    keyboard: T(keyboard, 0xffffff, 0.6, 0.05),
    crack: T(crack, 0xffffff, 0.85, 0.0, { transparent: true, depthWrite: false, emissive: 0xb32c18, emissiveMap: crack, emissiveIntensity: 1.35 }),
    pcb: S(0x2f5d3a, 0.6, 0.1),
    ledRed: new THREE.MeshStandardMaterial({ color: 0x501511, emissive: 0xd23a2a, emissiveIntensity: 1.6 }),
    ledGreen: new THREE.MeshStandardMaterial({ color: 0x14350f, emissive: 0x54d23a, emissiveIntensity: 1.4 }),
    ledAcid: new THREE.MeshStandardMaterial({ color: 0x2c3a08, emissive: 0xd9ff58, emissiveIntensity: 1.5 }),
    ledBlue: new THREE.MeshStandardMaterial({ color: 0x0e2038, emissive: 0x3a7fd2, emissiveIntensity: 1.4 }),
  };
  // 线路视图分类标记
  mats.fbYellow.userData.lineType = 'fiber';
  mats.cableOrange.userData.lineType = 'signal';
  mats.cableGrey.userData.lineType = 'signal';
  mats.cableWhite.userData.lineType = 'signal';
  mats.hoseBlue.userData.lineType = 'fluid';
  mats.hoseBlack.userData.lineType = 'power';
  // 大部分材质双面：剖切时内壁不消失
  for (const m of Object.values(mats)) {
    if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
      if (m !== mats.acrylic && m !== mats.glassWater && m !== mats.plywood) m.side = THREE.DoubleSide;
    }
  }
  return mats;
}

// 渐变天光背景（暗室顶光氛围）
export function makeBackdrop() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#0c0e11');
  grad.addColorStop(0.42, '#191d23');
  grad.addColorStop(0.52, '#101318');
  grad.addColorStop(1, '#070808');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 文本贴图（用于设备面板、仪表盘面、铭牌）
export function textTexture(lines, { w = 256, h = 128, bg = null, color = '#e8e7e2', font = '600 22px "DM Mono", monospace', align = 'center', pad = 12 } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  else { g.clearRect(0, 0, w, h); }
  g.fillStyle = color; g.font = font; g.textAlign = align; g.textBaseline = 'middle';
  const arr = Array.isArray(lines) ? lines : [lines];
  const lh = h / (arr.length + 0.6);
  arr.forEach((t, i) => g.fillText(t, align === 'center' ? w / 2 : pad, lh * (i + 0.8)));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return tex;
}

// 仪表盘面（机械压力表）
export function gaugeFaceTexture(maxLabel = '2.0') {
  const w = 256; const c = document.createElement('canvas');
  c.width = w; c.height = w;
  const g = c.getContext('2d');
  g.clearRect(0, 0, w, w);
  g.fillStyle = '#f2f1ec'; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 4, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#2a2b2d'; g.lineWidth = 5; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 6, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#2a2b2d'; g.font = '700 26px Arial'; g.textAlign = 'center';
  const a0 = -220 * Math.PI / 180, a1 = 40 * Math.PI / 180;
  for (let i = 0; i <= 10; i++) {
    const a = a0 + (a1 - a0) * (i / 10);
    const r1 = w / 2 - 26, r2 = w / 2 - (i % 2 === 0 ? 44 : 36);
    g.strokeStyle = '#2a2b2d'; g.lineWidth = i % 2 === 0 ? 4 : 2;
    g.beginPath();
    g.moveTo(w / 2 + Math.cos(a) * r1, w / 2 + Math.sin(a) * r1);
    g.lineTo(w / 2 + Math.cos(a) * r2, w / 2 + Math.sin(a) * r2);
    g.stroke();
    if (i % 2 === 0) {
      const rv = w / 2 - 62;
      g.font = '600 20px Arial';
      g.fillText(String(i / 10 * parseFloat(maxLabel)), w / 2 + Math.cos(a) * rv, w / 2 + Math.sin(a) * rv + 7);
    }
  }
  g.font = '600 17px Arial'; g.fillText('MPa', w / 2, w / 2 + 44);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 笔记本屏幕内容
export function screenTexture(kind = 'strain') {
  const w = 512, h = 320;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#101214'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1d2126';
  for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = '#d9ff58'; g.font = '600 14px monospace';
  if (kind === 'strain') {
    g.fillText('STRAIN · 72CH', 14, 22); g.fillText('µε', 14, 42);
    const colors = ['#d9ff58', '#5ab8ff', '#ff8a5a', '#c9cdc9'];
    for (let k = 0; k < 4; k++) {
      g.strokeStyle = colors[k]; g.lineWidth = 2; g.beginPath();
      for (let x = 0; x <= w - 28; x += 6) {
        const y = h / 2 + Math.sin(x / 60 + k * 1.7) * (18 + k * 9) + Math.sin(x / 17 + k) * 5 - k * 24 + 20;
        x === 0 ? g.moveTo(14 + x, y) : g.lineTo(14 + x, y);
      }
      g.stroke();
    }
  } else if (kind === 'pressure') {
    g.fillText('PRESSURE · P1/P2', 14, 22);
    g.strokeStyle = '#5ab8ff'; g.lineWidth = 2.5; g.beginPath();
    for (let x = 0; x <= w - 28; x += 4) {
      const ph = (x / (w - 28)) % 1;
      const y = h - 40 - Math.min(1, ph * 1.2) * (h - 110) - (ph > 0.82 ? (ph - 0.82) * 300 : 0);
      x === 0 ? g.moveTo(14 + x, y) : g.lineTo(14 + x, y);
    }
    g.stroke();
    g.strokeStyle = '#d9ff58'; g.setLineDash([5, 5]); g.stroke(); g.setLineDash([]);
  } else if (kind === 'ae') {
    g.fillText('AE · 8CH', 14, 22);
    for (let i = 0; i < 90; i++) {
      const x = 14 + Math.random() * (w - 28);
      const amp = Math.random() < 0.12 ? 40 + Math.random() * 80 : 8 + Math.random() * 26;
      g.strokeStyle = Math.random() < 0.15 ? '#ff8a5a' : '#3f6f4a';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, h - 24); g.lineTo(x, h - 24 - amp); g.stroke();
    }
  } else if (kind === 'luna') {
    g.fillStyle = '#ffffff'; g.fillRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#101820'; g.font = '700 26px Arial'; g.fillText('LUNA', 26, 52);
    g.font = '500 14px monospace'; g.fillText('ODiSI-B · 4 CH', 26, 78);
    g.strokeStyle = '#101820'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(26, 100); g.lineTo(w - 26, 100); g.stroke();
    g.font = '500 13px monospace';
    ['FBG-1  39 pt', 'FBG-2  39 pt', 'FBG-3  39 pt', 'FBG-4  39 pt'].forEach((t, i) => g.fillText(t, 26, 130 + i * 34));
  } else if (kind === 'zones') {
    g.fillText('SEALING · 18 ZONES', 14, 22);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) {
      const hot = r === 0 && (q === 1 || q === 2);
      g.fillStyle = hot ? 'rgba(210,58,42,0.85)' : 'rgba(63,111,74,0.5)';
      g.fillRect(30 + q * 115, 44 + r * 60, 100, 48);
      g.fillStyle = '#e8e7e2'; g.font = '600 13px monospace';
      g.fillText(`Z${r * 4 + q + 1}`, 42 + q * 115, 74 + r * 60);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function disposeMaterials(mats) {
  for (const m of Object.values(mats)) {
    m.map?.dispose?.(); m.roughnessMap?.dispose?.(); m.emissiveMap?.dispose?.(); m.bumpMap?.dispose?.();
    m.dispose();
  }
  for (const t of texCache.values()) t.dispose();
  texCache.clear();
}
