// 公共部件库：传感器、仪器、管路、结构件，全部程序化建模。
// 约定：工厂返回 THREE.Group；热点信息写进 group.userData.hotspot；
// 爆炸方向写进 userData.explodeDir / userData.explodeDist（米）。
import * as THREE from 'three';
import { textTexture, gaugeFaceTexture } from './materials.js';
import { getLang } from '../lang.js';
import { LAB_EN, enLines } from './scene-en.js';

// 英文模式：拾取卡标题与行文本经 LAB_EN 词典整体替换
function enPick(pick) {
  if (getLang() !== 'en' || !pick) return pick;
  const t = LAB_EN[pick.title];
  return { ...pick, title: t?.title || pick.title, lines: enLines(pick.lines) };
}
// 标签行：单行先查词典（对象值回退到 .title），再走 enLines 丢弃 '@' 行
function enLabel(lines) {
  if (getLang() !== 'en') return lines;
  return enLines(lines.map((l) => {
    const v = LAB_EN[l];
    return typeof v === 'string' ? v : (v?.title || l);
  }));
}

const G = {}; // 共享几何体缓存
function geo(key, make) {
  if (!G[key]) { G[key] = make(); G[key].userData.shared = true; }
  return G[key];
}

export function mesh(geoIn, mat, { p = [0, 0, 0], r = [0, 0, 0], s = null, cast = true, recv = false, name } = {}) {
  const m = new THREE.Mesh(geoIn, mat);
  m.position.set(...p);
  m.rotation.set(...r);
  if (s) m.scale.set(...(Array.isArray(s) ? s : [s, s, s]));
  m.castShadow = cast; m.receiveShadow = recv;
  if (name) m.name = name;
  return m;
}

export function group({ p = [0, 0, 0], r = [0, 0, 0], name } = {}) {
  const g = new THREE.Group();
  g.position.set(...p);
  g.rotation.set(...r);
  if (name) g.name = name;
  return g;
}

export function setExplode(obj, dir, dist = 0.5) {
  obj.userData.explodeDir = new THREE.Vector3(...dir).normalize();
  obj.userData.explodeDist = dist;
  return obj;
}

// 沿折线的平滑管（电缆/软管）
export function cable(points, r, mat, { tension = 0.5, tubularSeg = 64, radialSeg = 10, lineType = 'signal' } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((q) => new THREE.Vector3(...q)), false, 'catmullrom', tension);
  const tube = new THREE.TubeGeometry(curve, tubularSeg, r, radialSeg, false);
  const m = mesh(tube, mat);
  m.userData.lineType = mat?.userData?.lineType || lineType;
  return m;
}

// 硬管（右角折线，直段圆管 + 球接头）
export function pipeRun(points, r, mat, { lineType = 'fluid' } = {}) {
  const g = group();
  g.userData.lineType = mat?.userData?.lineType || lineType;
  const v = points.map((q) => new THREE.Vector3(...q));
  for (let i = 0; i < v.length - 1; i++) {
    const a = v[i], b = v[i + 1];
    const len = a.distanceTo(b);
    if (len < 1e-4) continue;
    const cyl = new THREE.CylinderGeometry(r, r, len, 14);
    const m = mesh(cyl, mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    g.add(m);
    if (i > 0) g.add(mesh(new THREE.SphereGeometry(r * 1.25, 12, 10), mat, { p: [a.x, a.y, a.z] }));
  }
  return g;
}

/* ---------------- 传感器家族 ---------------- */

// 箔式应变片（含引线与可见栅纹）
export function strainGauge(mats, { len = 0.016, wid = 0.008, wireDir = [0, 0, 1], wireLen = 0.05 } = {}) {
  const g = group();
  g.add(mesh(geo('sgBase', () => new THREE.BoxGeometry(1, 1, 0.0008)), mats.plasticBlack, { s: [wid, len, 1], cast: false }));
  const grid = mesh(geo('sgGrid', () => new THREE.PlaneGeometry(1, 1)), mats.gaugeFoil, { s: [wid * 0.5, len * 0.66, 1], p: [0, 0, 0.0006], cast: false });
  g.add(grid);
  const wl = Math.max(0.02, wireLen);
  g.add(cable([[0, -len / 2, 0], [wireDir[0] * wl * 0.4, -len / 2 - wl * 0.35, wireDir[2] * wl * 0.4], [wireDir[0] * wl, -len / 2 - wl, wireDir[2] * wl]], 0.0011, mats.cableOrange, { tubularSeg: 16, radialSeg: 6 }));
  return g;
}

// 工程尺寸标注线（两端刻度 + 中点标签；爆炸时由引擎自动隐藏）
export function dimensionLine(p0, p1, text, { size = 0.09 } = {}) {
  const g = group();
  g.userData.isDim = true;
  const a = new THREE.Vector3(...p0), b = new THREE.Vector3(...p1);
  const len = a.distanceTo(b);
  const dir = b.clone().sub(a).normalize();
  const dimMat = new THREE.MeshBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0.95 });
  dimMat.userData.local = true;
  const cyl = mesh(new THREE.CylinderGeometry(0.002, 0.002, len, 6), dimMat, { cast: false });
  cyl.position.copy(a).add(b).multiplyScalar(0.5);
  cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  g.add(cyl);
  const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const tickDir = new THREE.Vector3().crossVectors(dir, up).normalize();
  for (const p of [a, b]) {
    const t = mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.045, 6), dimMat, { cast: false });
    t.position.copy(p);
    t.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tickDir);
    g.add(t);
  }
  const sp = labelSprite(text, { size });
  sp.position.copy(a).add(b).multiplyScalar(0.5).addScaledVector(tickDir, 0.06);
  g.add(sp);
  return g;
}

// 应变花（0/45/90）
export function rosette(mats) {
  const g = group();
  for (let i = 0; i < 3; i++) {
    const sg = strainGauge(mats, { len: 0.012, wid: 0.006, wireLen: 0.03 });
    sg.rotation.y = (i * 45 * Math.PI) / 180;
    sg.position.z = 0.0002 * i;
    g.add(sg);
  }
  return g;
}

// 应变砖：与围岩同配比的小砖，预贴应变片
export function strainBrick(mats, [w, h, d], { gauges = 1, rosetteAt = false, label } = {}) {
  const g = group({ name: label });
  g.add(mesh(new THREE.BoxGeometry(w, h, d), mats.rock, { recv: true }));
  const face = rosetteAt ? rosette(mats) : strainGauge(mats, { len: Math.min(0.018, h * 0.55), wid: Math.min(0.009, w * 0.5) });
  face.position.z = d / 2 + 0.0012;
  g.add(face);
  if (label) {
    const t = textTexture([label], { w: 128, h: 64, color: '#2b2b2e', font: '700 26px monospace' });
    const tag = mesh(new THREE.PlaneGeometry(0.03, 0.015), new THREE.MeshBasicMaterial({ map: t, transparent: true }), { p: [0, h / 2 + 0.008, d / 2], cast: false });
    g.add(tag);
  }
  g.userData.hotspot = { title: '应变砖', lines: ['与围岩同配比、同刚度', '浇筑前贴片封装，可复检可更换'] };
  return g;
}

// FBG 光纤线路（沿程栅点）
export function fbgRun(mats, points, { beads = 6, label } = {}) {
  const g = group({ name: label });
  g.add(cable(points, 0.0016, mats.fbYellow, { tubularSeg: 48, radialSeg: 6 }));
  const curve = new THREE.CatmullRomCurve3(points.map((q) => new THREE.Vector3(...q)));
  for (let i = 0; i < beads; i++) {
    const p = curve.getPoint((i + 0.5) / beads);
    g.add(mesh(geo('fbgBead', () => new THREE.SphereGeometry(0.006, 8, 8)), mats.ledGreen, { p: [p.x, p.y, p.z], cast: false }));
  }
  return g;
}

// 声发射传感器
export function aeSensor(mats, { r = 0.011, h = 0.014 } = {}) {
  const g = group();
  g.add(mesh(new THREE.CylinderGeometry(r, r, h, 18), mats.steelMachined));
  g.add(mesh(new THREE.CylinderGeometry(r * 0.82, r * 0.82, 0.004, 18), mats.plasticBlack, { p: [0, h / 2 + 0.002, 0] }));
  g.add(cable([[0, h / 2, 0], [0.03, h / 2 + 0.02, 0.02], [0.07, h / 2 + 0.01, 0.06]], 0.0016, mats.cableGrey, { tubularSeg: 20, radialSeg: 6 }));
  g.userData.hotspot = { title: '声发射传感器', lines: ['捕捉微破裂弹性波', '给起始时刻与定位'] };
  return g;
}

// LVDT 位移计
export function lvdt(mats, { len = 0.09 } = {}) {
  const g = group();
  g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 20), mats.steelMachined));
  g.add(mesh(new THREE.CylinderGeometry(0.005, 0.005, len * 0.7, 12), mats.chrome, { p: [0, len * 0.75, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 20), mats.plasticBlack, { p: [0, -len / 2 + 0.006, 0] }));
  g.add(cable([[0, -len / 2, 0], [0.04, -len / 2 - 0.03, 0.03], [0.09, -len / 2 - 0.02, 0.08]], 0.0018, mats.cableGrey));
  g.userData.hotspot = { title: 'LVDT 位移计', lines: ['变形与热影响测量', '修正热致假压力'] };
  return g;
}

// 热电偶
export function thermocouple(mats, { wireLen = 0.06 } = {}) {
  const g = group();
  g.add(mesh(geo('tcBead', () => new THREE.SphereGeometry(0.004, 8, 8)), mats.copper, { cast: false }));
  g.add(cable([[0, 0, 0], [wireLen * 0.5, wireLen * 0.6, 0.01], [wireLen, wireLen, 0.02]], 0.0012, mats.cableWhite, { tubularSeg: 16, radialSeg: 6 }));
  return g;
}

/* ---------------- 压力 / 流量 / 检漏 ---------------- */

// 压力变送器（WIKA S-20 样式）
export function pressureTransmitter(mats, { label = 'P1' } = {}) {
  const g = group({ name: label });
  g.add(mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.05, 18), mats.steelMachined, { p: [0, 0.025, 0] }));
  g.add(mesh(geo('ptHex', () => new THREE.CylinderGeometry(0.019, 0.019, 0.012, 6)), mats.steelMachined, { p: [0, 0.058, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.048, 18), mats.plasticBlack, { p: [0, 0.09, 0] }));
  const disp = textTexture([label], { w: 128, h: 64, color: '#d9ff58', font: '700 34px monospace' });
  g.add(mesh(new THREE.PlaneGeometry(0.022, 0.011), new THREE.MeshBasicMaterial({ map: disp, transparent: true }), { p: [0, 0.098, 0.0171], cast: false }));
  g.add(mesh(geo('ptNipple', () => new THREE.CylinderGeometry(0.007, 0.007, 0.012, 12)), mats.brass, { p: [0, -0.006, 0] }));
  g.userData.hotspot = { title: `压力变送器 ${label}`, lines: ['0–25 MPa 高精度', 'P1−P2 区分真漏与管路渗'] };
  return g;
}

// 机械压力表（指针可动：返回 {g, needle}）
export function mechGauge(mats, { r = 0.05, maxLabel = '2.0' } = {}) {
  const g = group();
  const face = gaugeFaceTexture(maxLabel);
  g.add(mesh(new THREE.CylinderGeometry(r, r, 0.022, 28), mats.steelMachined, { r: [Math.PI / 2, 0, 0] }));
  const dial = mesh(new THREE.CircleGeometry(r * 0.94, 28), new THREE.MeshStandardMaterial({ map: face, roughness: 0.5, metalness: 0 }), { p: [0, 0, 0.0115], cast: false });
  g.add(dial);
  const needle = group({ p: [0, 0, 0.0125] });
  needle.add(mesh(geo('needle', () => new THREE.BoxGeometry(0.0026, r * 0.78, 0.0012)), mats.warnRed, { p: [0, r * 0.32, 0], cast: false }));
  needle.add(mesh(geo('needleHub', () => new THREE.CylinderGeometry(0.006, 0.006, 0.004, 12)), mats.darkSteel, { r: [Math.PI / 2, 0, 0], cast: false }));
  g.add(needle);
  g.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 10), mats.brass, { p: [0, -r + 0.002, -0.008], r: [Math.PI / 2.6, 0, 0] }));
  g.userData.needle = needle;
  g.userData.hotspot = { title: '机械压力表', lines: ['不依赖供电的兜底读数', '与变送器互为校核'] };
  return g;
}

// 高压流量计（KEM 样式）
export function flowMeter(mats) {
  const g = group();
  g.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.078, 24), mats.brushed, { p: [0, 0.039, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 6), mats.alu, { p: [0, 0.084, 0] }));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g.add(mesh(geo('hexNut16', () => new THREE.CylinderGeometry(0.013, 0.013, 0.01, 6)), mats.boltSteel, { p: [Math.cos(a) * 0.032, 0.092, Math.sin(a) * 0.032], cast: false }));
  }
  const tag = textTexture(['KEM', 'HI 0.4'], { w: 128, h: 64, bg: '#b23a2e', color: '#fff', font: '700 22px Arial' });
  g.add(mesh(new THREE.PlaneGeometry(0.05, 0.025), new THREE.MeshBasicMaterial({ map: tag }), { p: [0, 0.05, 0.0452], r: [0, 0, 0.06], cast: false }));
  g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 12), mats.steelMachined, { p: [0, -0.015, 0] }));
  g.userData.hotspot = { title: '高压液体流量计', lines: ['齿轮式，微流量分辨率', '补水体积与重量互校'] };
  g.userData.pick = enPick({ title: '高压液体流量计', lines: ['齿轮式，微流量分辨率'] });
  return g;
}

// 水浸探头（分区检漏）
export function waterProbe(mats, { color = null } = {}) {
  const g = group();
  const m = color || mats.plasticWhite;
  g.add(mesh(new THREE.BoxGeometry(0.026, 0.016, 0.008), m, { cast: false }));
  g.add(mesh(new THREE.BoxGeometry(0.02, 0.004, 0.002), mats.steelMachined, { p: [0, -0.008, 0.002], cast: false }));
  g.add(cable([[0.01, 0, 0], [0.03, 0.01, 0.01], [0.05, 0.02, 0.02]], 0.001, mats.cableWhite, { tubularSeg: 10, radialSeg: 5 }));
  return g;
}

// 水浸信号采集控制器（KonNaD 样式）
export function waterController(mats) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(0.09, 0.12, 0.028), mats.plasticBlack));
  const face = textTexture(['K  N  D', '水浸控制器', 'C2000-S1'], { w: 256, h: 340, bg: '#101215', color: '#dfeef0', font: '600 26px monospace' });
  g.add(mesh(new THREE.PlaneGeometry(0.078, 0.104), new THREE.MeshBasicMaterial({ map: face }), { p: [0, 0, 0.0145], cast: false }));
  [['ledAcid', -0.02], ['ledRed', 0.0], ['ledGreen', 0.02]].forEach(([k, x]) => {
    g.add(mesh(geo('led3', () => new THREE.SphereGeometry(0.004, 8, 8)), mats[k], { p: [x, -0.043, 0.015], cast: false }));
  });
  g.userData.hotspot = { title: '水浸信号采集控制器', lines: ['18 点分区接入', '最先触发给出高度带与象限'] };
  g.userData.pick = enPick({ title: '水浸信号采集控制器', lines: ['18 点分区接入'] });
  return g;
}

/* ---------------- 光纤解调 / 数据采集 ---------------- */

// LUNA ODiSI 样式解调仪主机
export function lunaHost(mats) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.11, 0.26), mats.plasticWhite));
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.05, 0.26), mats.plasticBlack, { p: [0, -0.03, 0] }));
  const front = textTexture(['LUNA', 'ODiSI 6000'], { w: 512, h: 128, bg: '#f2f1ec', color: '#101820', font: '800 44px Arial' });
  g.add(mesh(new THREE.PlaneGeometry(0.29, 0.072), new THREE.MeshBasicMaterial({ map: front }), { p: [0, 0.024, 0.1305], cast: false }));
  for (let i = 0; i < 4; i++) {
    const x = -0.105 + i * 0.07;
    g.add(mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.03, 16), mats.plasticBlack, { p: [x, -0.03, 0.13], r: [Math.PI / 2, 0, 0] }));
    g.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 12), mats.steelMachined, { p: [x, -0.03, 0.146], r: [Math.PI / 2, 0, 0], cast: false }));
  }
  g.userData.hotspot = { title: '光纤解调仪', lines: ['BOTDA / FBG 解调', '4 线 39 栅点连续应变梯度'] };
  g.userData.pick = enPick({ title: '光纤解调仪', lines: ['LUNA ODiSI 级解调主机'] });
  return g;
}

// 光纤远端模块
export function remoteModule(mats) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(0.075, 0.032, 0.05), mats.ledBlue));
  g.add(mesh(new THREE.BoxGeometry(0.02, 0.02, 0.02), mats.plasticBlack, { p: [0.03, 0, 0] }));
  g.add(cable([[0.03, 0, 0], [0.08, -0.01, 0.03], [0.14, -0.008, 0.05]], 0.003, mats.hoseBlack, { tubularSeg: 16, radialSeg: 7 }));
  return g;
}

// 盘绕光缆
export function cableCoil(mats, { r = 0.14, tube = 0.006, turns = 7, mat = null } = {}) {
  const pts = [];
  for (let i = 0; i <= turns * 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const rr = r * (0.75 + 0.25 * Math.sin(i / 64 * Math.PI));
    pts.push(new THREE.Vector3(Math.cos(a) * rr, (i / (turns * 32)) * tube * turns * 1.6, Math.sin(a) * rr));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return mesh(new THREE.TubeGeometry(curve, turns * 40, tube, 8, false), mat || mats.hoseBlack);
}

// 数据采集机箱（静态应变仪）
export function daqCase(mats, { w = 0.36, label = 'DC-2042' } = {}) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(w, 0.14, 0.3), mats.alu));
  g.add(mesh(new THREE.BoxGeometry(w, 0.115, 0.006), mats.plasticBlack, { p: [0, 0, 0.153] }));
  const panel = textTexture([label, '72 CH', 'OK'], { w: 512, h: 160, bg: '#191b1e', color: '#d9ff58', font: '600 30px monospace' });
  g.add(mesh(new THREE.PlaneGeometry(w * 0.9, 0.1), new THREE.MeshBasicMaterial({ map: panel }), { p: [0, 0, 0.157], cast: false }));
  for (let i = 0; i < 4; i++) g.add(mesh(geo('bnc', () => new THREE.CylinderGeometry(0.008, 0.008, 0.014, 12)), mats.steelMachined, { p: [-w / 2 + 0.05 + i * 0.055, -0.03, 0.16], r: [Math.PI / 2, 0, 0], cast: false }));
  g.userData.hotspot = { title: '静态应变采集箱', lines: ['72 通道（66 正式 + 6 备用）', '全场统一时基'] };
  g.userData.pick = enPick({ title: '数据采集机箱', lines: ['通道数与标签随场景配置'] });
  return g;
}

// 接线端子箱
export function terminalBox(mats, { w = 0.2, h = 0.14, d = 0.09 } = {}) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(w, h, d), mats.plasticGrey));
  g.add(mesh(new THREE.BoxGeometry(w * 0.7, h * 0.5, 0.004), new THREE.MeshStandardMaterial({ color: 0xdadfe2, transparent: true, opacity: 0.6 }), { p: [0, h * 0.1, d / 2 + 0.002], cast: false }));
  for (let i = 0; i < 4; i++) g.add(mesh(geo('gland', () => new THREE.CylinderGeometry(0.008, 0.008, 0.014, 10)), mats.plasticBlack, { p: [-w / 2 + 0.03 + i * (w - 0.06) / 3, -h / 2 - 0.006, 0], cast: false }));
  return g;
}

// 笔记本电脑（含键位与触控板纹理）
export function laptop(mats, screenTex, { open = 1.85 } = {}) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(0.32, 0.014, 0.22), mats.alu, { recv: true }));
  const kb = mesh(geo('kbPlane', () => new THREE.PlaneGeometry(1, 1)), mats.keyboard, { s: [0.29, 0.155, 1], p: [0, 0.0081, -0.025], r: [-Math.PI / 2, 0, 0], cast: false });
  g.add(kb);
  const lid = group({ p: [0, 0.007, -0.105], r: [open - Math.PI, 0, 0] });
  lid.add(mesh(new THREE.BoxGeometry(0.32, 0.21, 0.008), mats.alu, { p: [0, 0.105, 0] }));
  const scr = mesh(new THREE.PlaneGeometry(0.29, 0.18), new THREE.MeshBasicMaterial({ map: screenTex }), { p: [0, 0.105, 0.0045], cast: false });
  lid.add(scr);
  g.add(lid);
  g.userData.screen = scr;
  return g;
}

// 折叠工作台
export function workbench(mats, { w = 1.5, d = 0.55, h = 0.75 } = {}) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(w, 0.03, d), mats.paintYellow, { p: [0, h, 0], recv: true }));
  for (const sx of [-1, 1]) {
    g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, h, 10), mats.steelMachined, { p: [sx * w * 0.42, h / 2, -d * 0.4] }));
    g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, h, 10), mats.steelMachined, { p: [sx * w * 0.42, h / 2, d * 0.4] }));
    g.add(mesh(new THREE.BoxGeometry(w * 0.86, 0.02, 0.02), mats.steelMachined, { p: [0, 0.12, sx * d * 0.4] }));
  }
  return g;
}

// 蓝色圆凳（现场照片同款）
export function stool(mats) {
  const g = group();
  g.add(mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.035, 24), mats.hoseBlue, { p: [0, 0.45, 0], recv: true }));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const leg = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.45, 8), mats.steelMachined, { p: [Math.cos(a) * 0.09, 0.225, Math.sin(a) * 0.09] });
    leg.rotation.z = Math.cos(a) * 0.24; leg.rotation.x = -Math.sin(a) * 0.24;
    g.add(leg);
  }
  return g;
}

/* ---------------- 加载 / 泵站 ---------------- */

// 控制柜（内压加载系统，照片同款：蓝色底柜 + 灰白面板头；数显实时刷新）
export function controlCabinet(mats, { label = '加载控制' } = {}) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(0.5, 0.42, 0.36), mats.hoseBlue, { p: [0, 0.21, 0], recv: true }));
  g.add(mesh(new THREE.BoxGeometry(0.46, 0.34, 0.1), mats.plasticWhite, { p: [0, 0.59, 0.13] }));
  g.add(mesh(new THREE.BoxGeometry(0.46, 0.05, 0.34), mats.plasticWhite, { p: [0, 0.44, 0.01] }));
  const head = textTexture([label, 'AUTO · MAN'], { w: 512, h: 160, bg: '#d8d6cf', color: '#26282b', font: '700 34px monospace' });
  g.add(mesh(new THREE.PlaneGeometry(0.36, 0.11), new THREE.MeshBasicMaterial({ map: head }), { p: [0, 0.66, 0.181], cast: false }));
  g.add(mesh(new THREE.BoxGeometry(0.16, 0.07, 0.012), mats.plasticBlack, { p: [0, 0.555, 0.181] }));
  // 动态数显：场景 update 里用 setDigits(值) 实时刷新（内容不变时跳过重绘）
  const dc = document.createElement('canvas');
  dc.width = 256; dc.height = 96;
  const dg = dc.getContext('2d');
  let lastDigits = '';
  const drawDigits = (text) => {
    dg.fillStyle = '#0c1a10'; dg.fillRect(0, 0, 256, 96);
    dg.fillStyle = '#54d23a'; dg.font = '700 56px monospace';
    dg.textAlign = 'center'; dg.textBaseline = 'middle';
    dg.fillText(text, 128, 50);
  };
  drawDigits('0.00');
  const digitsTex = new THREE.CanvasTexture(dc);
  digitsTex.colorSpace = THREE.SRGBColorSpace;
  const digitMat = new THREE.MeshBasicMaterial({ map: digitsTex });
  digitMat.userData.local = true;
  g.add(mesh(new THREE.PlaneGeometry(0.13, 0.05), digitMat, { p: [0, 0.555, 0.188], cast: false }));
  g.userData.setDigits = (text) => {
    if (text === lastDigits) return;
    lastDigits = text;
    drawDigits(text);
    digitsTex.needsUpdate = true;
  };
  const btns = [['ledRed', -0.14], ['ledGreen', -0.07], ['warnRed', 0], ['paintYellow', 0.07], ['ledBlue', 0.14]];
  btns.forEach(([k, x]) => {
    g.add(mesh(geo('btn22', () => new THREE.CylinderGeometry(0.011, 0.011, 0.01, 14)), mats[k], { p: [x, 0.495, 0.181], r: [Math.PI / 2, 0, 0], cast: false }));
  });
  // 急停蘑菇头
  g.add(mesh(geo('estopDisc', () => new THREE.CylinderGeometry(0.02, 0.02, 0.006, 16)), mats.paintYellow, { p: [0.2, 0.497, 0.181], r: [Math.PI / 2, 0, 0], cast: false }));
  g.add(mesh(geo('estopMush', () => new THREE.CylinderGeometry(0.013, 0.015, 0.014, 16)), mats.warnRed, { p: [0.2, 0.5, 0.19], r: [Math.PI / 2, 0, 0], cast: false }));
  for (let i = 0; i < 3; i++) g.add(mesh(geo('vent', () => new THREE.BoxGeometry(0.3, 0.006, 0.004)), mats.plasticGrey, { p: [0, 0.47 - i * 0.018, 0.181], cast: false }));
  // 电源线入地
  g.add(cable([[0.16, 0.06, 0.16], [0.24, 0.01, 0.24], [0.4, 0.004, 0.3]], 0.006, mats.plasticBlack, { tubularSeg: 18, radialSeg: 6 }));
  // 底部调平脚
  for (const [fx, fz] of [[-0.2, 0.13], [0.2, 0.13], [-0.2, -0.13], [0.2, -0.13]]) {
    g.add(mesh(geo('cabFoot', () => new THREE.CylinderGeometry(0.016, 0.02, 0.03, 10)), mats.plasticBlack, { p: [fx, 0.015, fz], cast: false }));
  }
  g.userData.hotspot = { title: '内压加载控制柜', lines: ['分级加压与循环程序控制', '压力路径 / 速率 / 循环次数'] };
  g.userData.pick = enPick({ title: '内压加载控制柜', lines: ['分级加压与循环程序控制', '数显实时跟随管路压力'] });
  return g;
}

// 液压千斤顶
export function hydraulicJack(mats, { stroke = 0.25, r = 0.055 } = {}) {
  const g = group();
  g.add(mesh(new THREE.CylinderGeometry(r, r, 0.16, 22), mats.paintRed, { p: [0, 0.08, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.5, stroke, 16), mats.chrome, { p: [0, 0.16 + stroke / 2, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(r * 0.8, r * 0.8, 0.02, 18), mats.steelMachined, { p: [0, 0.16 + stroke, 0] }));
  g.add(cable([[r * 0.6, 0.04, 0], [r * 1.6, 0.02, 0.06], [r * 2.2, 0.0, 0.12]], 0.005, mats.hoseBlack));
  g.userData.pick = enPick({ title: '伺服作动器', lines: ['程序加载执行单元'] });
  return g;
}

// 泵组（电机 + 泵头 + 底座 + 出口压力表）
export function pumpUnit(mats) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(0.42, 0.02, 0.24), mats.darkSteel, { p: [0, 0.01, 0], recv: true }));
  g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.26, 18), mats.paintRed, { p: [-0.08, 0.1, 0], r: [0, 0, Math.PI / 2] }));
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 14), mats.castIron, { p: [0.1, 0.08, 0], r: [0, 0, Math.PI / 2] }));
  g.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.08, 10), mats.brass, { p: [0.19, 0.08, 0], r: [0, 0, Math.PI / 2] }));
  const pg = mechGauge(mats, { r: 0.026, maxLabel: '25' });
  pg.position.set(0.1, 0.2, 0);
  pg.rotation.x = -0.45;
  g.add(pg);
  g.add(cable([[-0.21, 0.05, 0], [-0.28, 0.02, 0.05], [-0.3, 0.005, 0.1]], 0.006, mats.hoseBlack));
  // 电机端风扇（运转动画）
  const fan = group({ p: [-0.235, 0.1, 0] });
  fan.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 14), mats.castIron, { r: [0, 0, Math.PI / 2] }));
  for (let i = 0; i < 3; i++) {
    const holder = group({ r: [i * 2.094, 0, 0] });
    holder.add(mesh(new THREE.BoxGeometry(0.005, 0.048, 0.016), mats.alu, { p: [0, 0.03, 0], cast: false }));
    fan.add(holder);
  }
  g.add(fan);
  g.userData.spin = fan;
  g.userData.pick = enPick({ title: '泵组', lines: ['电机 + 泵头 + 出口压力表', '运转中：风扇与数显联动'] });
  return g;
}

// 蓄能器
export function accumulator(mats) {
  const g = group();
  g.add(mesh(new THREE.CapsuleGeometry(0.055, 0.22, 6, 18), mats.paintYellow, { p: [0, 0.19, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 12), mats.brass, { p: [0, 0.36, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 12), mats.brass, { p: [0, 0.015, 0] }));
  g.userData.pick = enPick({ title: '蓄能器', lines: ['稳压与快速能量补偿'] });
  return g;
}

/* ---------------- 阀件 / 管件 ---------------- */

export function ballValve(mats, { r = 0.02 } = {}) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(r * 3.2, r * 1.7, r * 1.7), mats.brass));
  g.add(mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.9, r * 0.9, 6), mats.brass, { p: [0, r * 0.8, 0] }));
  g.add(mesh(new THREE.BoxGeometry(r * 2.4, 0.006, 0.012), mats.warnRed, { p: [r * 0.9, r * 1.3, 0], cast: false }));
  for (const x of [-r * 1.7, r * 1.7]) g.add(mesh(new THREE.CylinderGeometry(r * 0.7, r * 0.7, r * 1.4, 12), mats.steelMachined, { p: [x, 0, 0], r: [0, 0, Math.PI / 2] }));
  return g;
}

export function gateValve(mats, { r = 0.035 } = {}) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(r * 2.4, r * 2, r * 1.8), mats.paintRed));
  g.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, r * 2.4, 10), mats.steelMachined, { p: [0, r * 2, 0] }));
  const wheel = mesh(new THREE.TorusGeometry(r * 0.9, 0.007, 8, 20), mats.warnRed, { p: [0, r * 3.1, 0], r: [Math.PI / 2, 0, 0] });
  g.add(wheel);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    g.add(mesh(new THREE.BoxGeometry(r * 1.6, 0.005, 0.006), mats.warnRed, { p: [Math.cos(a) * r * 0.45, r * 3.1, Math.sin(a) * r * 0.45], r: [0, -a, 0], cast: false }));
  }
  g.userData.valveWheel = wheel;
  return g;
}

export function flangePair(mats, { r = 0.05, bolts = 8 } = {}) {
  const g = group();
  for (const y of [-0.012, 0.012]) {
    g.add(mesh(new THREE.CylinderGeometry(r * 1.6, r * 1.6, 0.014, 24), mats.steelMachined, { p: [0, y, 0] }));
  }
  for (let i = 0; i < bolts; i++) {
    const a = (i / bolts) * Math.PI * 2;
    g.add(mesh(geo('hexNut24', () => new THREE.CylinderGeometry(0.011, 0.011, 0.03, 6)), mats.boltSteel, { p: [Math.cos(a) * r * 1.32, 0, Math.sin(a) * r * 1.32] }));
  }
  return g;
}

export function unionFitting(mats, { r = 0.012 } = {}) {
  const g = group();
  g.add(mesh(new THREE.CylinderGeometry(r * 1.6, r * 1.6, r * 1.2, 6), mats.brass));
  g.add(mesh(new THREE.CylinderGeometry(r, r, r * 2.6, 12), mats.brass, { p: [0, 0, 0] }));
  return g;
}

/* ---------------- 称重 / 供水 / 监视 ---------------- */

export function platformScale(mats) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(0.42, 0.05, 0.5), mats.steelPaint, { p: [0, 0.025, 0], recv: true }));
  g.add(mesh(new THREE.BoxGeometry(0.4, 0.012, 0.48), mats.steelMachined, { p: [0, 0.056, 0], recv: true }));
  g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.75, 10), mats.steelMachined, { p: [0.19, 0.4, -0.2] }));
  g.add(mesh(new THREE.BoxGeometry(0.14, 0.09, 0.05), mats.plasticBlack, { p: [0.19, 0.82, -0.2] }));
  const disp = textTexture(['12.48 kg'], { w: 256, h: 96, bg: '#0c1a10', color: '#54d23a', font: '700 40px monospace' });
  g.add(mesh(new THREE.PlaneGeometry(0.11, 0.04), new THREE.MeshBasicMaterial({ map: disp }), { p: [0.19, 0.83, -0.174], cast: false }));
  g.userData.hotspot = { title: '称重式补水', lines: ['微量渗漏体积法不准，重量法分辨率高', '每次补压称重，交叉验证分区'] };
  g.userData.pick = enPick({ title: '称重式补水台', lines: ['电子秤 + 立杆数显'] });
  return g;
}

export function waterTank(mats, { r = 0.14, h = 0.34 } = {}) {
  const g = group();
  g.add(mesh(new THREE.CylinderGeometry(r, r, h, 22), mats.plasticWhite, { p: [0, h / 2, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(r * 0.35, r * 0.35, 0.03, 14), mats.plasticBlack, { p: [0, h + 0.015, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.05, 10), mats.brass, { p: [r * 0.7, h * 0.2, 0], r: [0, 0, Math.PI / 2] }));
  g.userData.pick = enPick({ title: '水箱', lines: ['补给水源'] });
  return g;
}

export function cctvCamera(mats) {
  const g = group();
  const head = group({ p: [0, 0.62, 0] });
  head.add(mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.16, 18), mats.plasticWhite, { r: [Math.PI / 2, 0, 0] }));
  head.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 18), mats.plasticBlack, { p: [0, 0, 0.09], r: [Math.PI / 2, 0, 0] }));
  head.add(mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.03, 18), mats.darkSteel, { p: [0, 0, 0.105], r: [Math.PI / 2, 0, 0] }));
  head.add(mesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), mats.plasticGrey, { p: [0, 0.045, -0.02] }));
  g.add(head);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const leg = mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.68, 8), mats.darkSteel, { p: [Math.cos(a) * 0.12, 0.31, Math.sin(a) * 0.12] });
    leg.rotation.z = Math.cos(a) * 0.34; leg.rotation.x = -Math.sin(a) * 0.34;
    g.add(leg);
  }
  g.userData.hotspot = { title: '同步视频', lines: ['异常时刻画面', '与拆检结果对照'] };
  g.userData.pick = enPick({ title: '同步摄像机', lines: ['全景与重点双机位'] });
  return g;
}

/* ---------------- 紧固件 / 杂项 ---------------- */

export function hexBolt(mats, { r = 0.024, len = 0.06, nut = true, washer = true } = {}) {
  const g = group();
  g.add(mesh(geo(`bolt${r}`, () => new THREE.CylinderGeometry(r, r, len, 6)), mats.boltSteel, { p: [0, len / 2, 0] }));
  if (washer) g.add(mesh(new THREE.CylinderGeometry(r * 1.4, r * 1.4, 0.004, 16), mats.steelMachined, { p: [0, 0.002, 0], cast: false }));
  if (nut) g.add(mesh(geo(`nut${r}`, () => new THREE.CylinderGeometry(r, r, 0.022, 6)), mats.boltSteel, { p: [0, len - 0.011, 0], cast: false }));
  return g;
}

// 沿圆周布置螺栓（轴向为 y）
export function boltCircle(parent, mats, { radius, count, r = 0.024, len = 0.07, y = 0 } = {}) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const b = hexBolt(mats, { r, len });
    b.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
    parent.add(b);
  }
}

export function labelSprite(text, { size = 0.09, color = '#e8e7e2', bg = 'rgba(12,13,15,0.82)', tick = '#d9ff58' } = {}) {
  const lines = enLabel(Array.isArray(text) ? text : [text]);
  const w = 512, h = 96 + (lines.length - 1) * 44;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.beginPath();
  const rr = 18;
  g.roundRect ? (g.beginPath(), g.roundRect(2, 2, w - 4, h - 4, rr), g.fill()) : g.fillRect(2, 2, w - 4, h - 4);
  g.strokeStyle = tick; g.lineWidth = 6;
  g.beginPath(); g.moveTo(14, 16); g.lineTo(14, h - 16); g.stroke();
  g.fillStyle = color; g.textAlign = 'left'; g.textBaseline = 'middle';
  lines.forEach((t, i) => {
    g.font = i === 0 ? '600 40px "DM Mono", monospace' : '400 30px "DM Mono", monospace';
    g.fillStyle = i === 0 ? color : 'rgba(232,231,226,0.72)';
    g.fillText(t, 34, (h / (lines.length + 0.4)) * (i + 0.8));
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(size * (w / h), size, 1);
  sp.renderOrder = 20;
  return sp;
}

/* ---------------- 现场道具 ---------------- */

// 灭火器（带压力表盘与铭牌环带）
export function fireExtinguisher(mats, { h = 0.42 } = {}) {
  const g = group({ name: 'extinguisher' });
  g.add(mesh(new THREE.CylinderGeometry(0.055, 0.055, h, 18), mats.extinguisherRed, { p: [0, h / 2 + 0.03, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(0.062, 0.055, 0.03, 18), mats.extinguisherRed, { p: [0, 0.045, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 10), mats.brass, { p: [0, h + 0.055, 0] }));
  g.add(mesh(new THREE.BoxGeometry(0.09, 0.014, 0.02), mats.plasticBlack, { p: [0.02, h + 0.085, 0] }));
  // 压力表盘
  g.add(mesh(geo('extGauge', () => new THREE.CylinderGeometry(0.014, 0.014, 0.008, 14)), mats.plasticWhite, { p: [0.026, h + 0.03, 0], r: [0, 0, Math.PI / 2], cast: false }));
  g.add(mesh(geo('extGaugeRing', () => new THREE.TorusGeometry(0.014, 0.002, 6, 14)), mats.brass, { p: [0.032, h + 0.03, 0], r: [0, Math.PI / 2, 0], cast: false }));
  // 铭牌环带
  const band = textTexture(['ABC', '灭火器'], { w: 128, h: 48, bg: '#b02a20', color: '#f2f1ec', font: '600 20px monospace' });
  const bandMat = new THREE.MeshBasicMaterial({ map: band, transparent: true, side: THREE.DoubleSide });
  bandMat.userData.local = true;
  g.add(mesh(new THREE.CylinderGeometry(0.0565, 0.0565, 0.07, 18, 1, true), bandMat, { p: [0, h * 0.62, 0], cast: false }));
  g.add(cable([[0.03, h + 0.04, 0], [0.09, h * 0.7, 0.02], [0.1, h * 0.45, 0.03]], 0.005, mats.plasticBlack, { tubularSeg: 14, radialSeg: 6 }));
  g.add(mesh(new THREE.BoxGeometry(0.012, h * 0.55, 0.012), mats.plasticBlack, { p: [0.075, h * 0.45, 0] }));
  return g;
}

// 锥桶
export function trafficCone(mats, { h = 0.3 } = {}) {
  const g = group({ name: 'cone' });
  g.add(mesh(new THREE.BoxGeometry(0.22, 0.02, 0.22), mats.coneOrange, { p: [0, 0.01, 0], recv: true }));
  g.add(mesh(new THREE.ConeGeometry(0.09, h, 20), mats.coneOrange, { p: [0, h / 2 + 0.02, 0] }));
  g.add(mesh(new THREE.ConeGeometry(0.062, 0.055, 20), mats.plasticWhite, { p: [0, h * 0.52 + 0.02, 0] }));
  return g;
}

// 地面定位胶带（X 形）
export function floorTapeX(mats, { size = 0.3 } = {}) {
  const g = group();
  const mk = (rotY) => {
    const t = mesh(new THREE.BoxGeometry(size, 0.002, 0.045), mats.paintYellow, { r: [0, rotY, 0], cast: false, recv: true });
    return t;
  };
  g.add(mk(0.6), mk(-0.6));
  return g;
}

// 插线板
export function powerStrip(mats, { w = 0.32 } = {}) {
  const g = group();
  g.add(mesh(new THREE.BoxGeometry(w, 0.028, 0.075), mats.plasticWhite, { recv: true }));
  for (let i = 0; i < 4; i++) {
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.006, 0.042), mats.plasticBlack, { p: [-w / 2 + 0.05 + i * (w - 0.1) / 3, 0.016, 0], cast: false }));
  }
  g.add(cable([[-w / 2, 0, 0], [-w / 2 - 0.12, 0.004, 0.05], [-w / 2 - 0.3, 0.004, 0.02]], 0.006, mats.plasticBlack, { tubularSeg: 20, radialSeg: 6 }));
  return g;
}

/* ---------------- 对象拾取与信号流 ---------------- */

// 给部件挂信息卡数据（引擎悬停/点击时经射线拾取显示）
export function pickable(obj, title, lines = []) {
  obj.userData.pick = enPick({ title, lines });
  return obj;
}

// 信号流：管路/线缆上流动的光点（数据在流动的观感）
export function signalFlow(mats, points, { color = 0xd9ff58, count = 3, speed = 0.1, dotR = 0.006, tubeMat = null, tubeR = 0.0018 } = {}) {
  const g = group({ name: 'flow' });
  g.userData.lineType = 'fluid';
  const curve = new THREE.CatmullRomCurve3(points.map((q) => new THREE.Vector3(...q)));
  g.add(mesh(new THREE.TubeGeometry(curve, 56, tubeR, 6, false), tubeMat || mats.cableGrey, { cast: false }));
  const dotGeo = new THREE.SphereGeometry(dotR, 8, 6);
  const dotMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
  dotMat.userData.local = true;
  const dots = [];
  for (let i = 0; i < count; i++) {
    const d = new THREE.Mesh(dotGeo, dotMat);
    g.add(d);
    dots.push(d);
  }
  let t = Math.random();
  g.userData.update = (dt, active = true, speedMul = 1) => {
    g.visible = !!active;
    if (!active) return;
    t = (t + dt * speed * Math.max(0, speedMul)) % 1;
    dots.forEach((d, i) => {
      const u = (t + i / count) % 1;
      d.position.copy(curve.getPoint(u));
      const fade = Math.sin(u * Math.PI); // 首尾淡入淡出
      d.scale.setScalar(0.4 + 0.6 * fade);
    });
  };
  return g;
}

export function disposeGeometries() {
  for (const k of Object.keys(G)) { G[k].dispose?.(); delete G[k]; }
}
