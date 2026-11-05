// 场景五：1 m³ 土箱 — 渗漏侵蚀数字孪生试验（博士提案 WP1/WP2 的物理层）
// 六段物理：渗漏 → 渗流 → 侵蚀 → 空洞 → 沉降 → 塌陷；DN100 管段 + 人工接头漏点。
import * as THREE from 'three';
import * as P from '../parts.js';
import { screenTexture } from '../materials.js';

const D = Math.PI / 180;

export default {
  id: 'soiltank',
  n: '05',
  titleCn: '土箱渗漏侵蚀孪生试验',
  titleEn: 'Soil-Tank Leakage-Erosion Twin',
  kicker: '研究提案 / 数字孪生 · SPH 多相侵蚀的物理验证层',
  desc: '1 m³ 土箱内置 DN100 管段与人工接头漏点，复现「渗漏—渗流—侵蚀—空洞—沉降—塌陷」六段物理。孪生体由 EnKF 同化给出状态、置信度与提前期：40 天预警窗口逐格可见。',
  principle: '原理一句话：渗漏点亮四十天的不可见过程——渗流带走颗粒，空洞长大，地表沉降，最终塌陷；EnKF 把传感变成概率与提前期。',
  facts: [
    ['土箱', '1 × 1 × 1 m'],
    ['管段', 'DN100 · 人工接头漏'],
    ['漏率范围', '5 – 40 L/min（算例 600 组）'],
    ['空洞目标', '原型换算 ≈1.5 m'],
    ['预警窗口', '≈40 天 · 前数日 30 mm 凹陷'],
    ['同化', 'EnKF 200 成员 · 单帧 <1 s'],
    ['验收', '空洞半径误差 <20% · 位置 <0.3 m'],
    ['界面', '12–16 名工程师 × 6 场景'],
  ],
  stages: [
    { at: 0.0, label: '① 渗漏', sub: '接头漏点 · 15 L/min' },
    { at: 0.16, label: '② 渗流', sub: '饱和锋面扩展' },
    { at: 0.34, label: '③ 侵蚀', sub: '颗粒被带走 · 源项激活', warn: true },
    { at: 0.52, label: '④ 空洞', sub: '孪生体上线 · EnKF 同化' },
    { at: 0.7, label: '⑤ 沉降', sub: '地表凹陷 · LVDT 序列' },
    { at: 0.88, label: '⑥ 塌陷', sub: '预警窗口闭合', warn: true },
  ],
  view: { pos: [2.4, 1.7, 2.7], target: [0, 0.5, 0] },
  readoutLabel: '渗漏后天数 · 原型空洞换算',
  principleTree: {
    title: '四十天预警链 · 从渗漏到塌陷',
    focus: 3, clip: { axis: 'z', pos: 0.02 }, timeline: 0.6,
    nodes: [
      { label: '渗漏', sub: '15 L/min · DN100' },
      { label: '渗流', sub: '饱和锋面扩展' },
      { label: '侵蚀', sub: '颗粒迁移 · 空洞长大', warn: true },
      { label: '沉降', sub: 'LVDT 30 mm 凹陷' },
      { label: '塌陷', sub: '路面失效', warn: true },
      { label: '孪生预警', sub: 'EnKF · 40 天提前期' },
    ],
  },
  clipLegend: ['DN100 管断面与漏点', '饱和锋面', '侵蚀空腔与砂粒', '孪生环（EnKF 状态）'],
  // 阶段 → 观测测点（渗漏/渗流/侵蚀→管段 · 空洞→孪生体 · 沉降/塌陷→LVDT）
  stageHotspots: [0, 0, 0, 3, 1, 1],
  steps: [
    { title: '四十天的不可见过程', sub: '塌陷之前，没有任何人看见',
      detail: ['埋地水管漏了，砂被侵蚀，空洞长大，约四十天后路面塌陷', '本试验把这四十天装进 1 m³ 土箱，逐段点亮', '这条链就是博士提案 WP1–WP3 的物理骨架'],
      view: { pos: [3.0, 2.1, 3.3], target: [0, 0.5, 0] }, timeline: 0 },
    { title: '① 渗漏', sub: 'DN100 · 人工接头漏 · 15 L/min',
      detail: ['漏率 5–40 L/min 可调，对应 600 组 SPH 算例的物理对照', '侵蚀源项写在管土界面', '体积 + 重量双计量闭环'],
      focus: 0, clip: { axis: 'z', pos: 0.02 }, timeline: 0.05 },
    { title: '② 渗流', sub: '饱和锋面从漏点扩展',
      detail: ['水改变有效应力，为颗粒侵蚀做准备', '蓝色锋面即饱和区推进'],
      focus: 0, clip: { axis: 'z', pos: 0.02 }, timeline: 0.25 },
    { title: '③ 侵蚀', sub: '颗粒被带走 · 源项激活',
      detail: ['SPH 多相框架：颗粒离开计算域也不崩', '物理试验为数值源项提供对照'],
      focus: 0, clip: { axis: 'z', pos: 0.02 }, timeline: 0.45 },
    { title: '④ 空洞与孪生', sub: 'EnKF 上线 · 状态 + 置信度 + 提前期', tree: true,
      detail: ['200 成员集合卡尔曼滤波，单帧 <1 s', '空洞半径误差 <20%、位置 <0.3 m', '孪生环 = 状态估计，虚线环 = 置信区间'],
      focus: 3, clip: { axis: 'z', pos: 0.02 }, timeline: 0.6 },
    { title: '⑤ 沉降', sub: '地表三点剖面 · 30 mm 凹陷',
      detail: ['LVDT 序列作为位移观测算子进同化', '塌陷前数日出现可见凹陷——预警窗口打开'],
      focus: 1, clip: { axis: 'z', pos: 0.02 }, timeline: 0.8 },
    { title: '⑥ 塌陷', sub: '窗口闭合 · 工单派发',
      detail: ['没有孪生体，工程师拿到的是塌陷；有了它，拿到的是 40 天', '逐格 30 天内塌陷概率，带置信度与提前期'],
      focus: 1, clip: { axis: 'z', pos: 0.02 }, timeline: 0.95 },
    { title: '闭环', sub: '物理试验 ↔ 数值代理 ↔ 实时同化',
      detail: ['物理对照验证 SPH 源项；代理前向 <50 ms', '这条链的终态：数字孪生操作员界面'],
      view: { pos: [3.0, 2.1, 3.3], target: [0, 0.5, 0] }, clip: { axis: 'z', pos: 0.02 }, timeline: 0.75 },
  ],
  features: { explode: false, clip: 'z', clipRange: [-0.5, 0.5] },
  clipDefault: { axis: 'z', pos: 0.02 },

  build({ mats }) {
    const root = new THREE.Group();
    const hotspots = [];
    const HS = (at, title, lines, tone) => hotspots.push({ at, title, lines, tone });

    /* ---------------- 土箱（前壁亚克力，内部常显） ---------------- */
    const tank = P.group({ name: 'tank' });
    root.add(tank);
    P.pickable(tank, '1 m³ 土箱', ['内腔 1.0 × 1.0 m · 填砂深 0.8 m']);
    const S = 0.05; // 角钢宽
    const edge = (w, h, d, x, y, z) => tank.add(P.mesh(new THREE.BoxGeometry(w, h, d), mats.steelPaintDark, { p: [x, y, z] }));
    // 内腔精确 1.0 × 1.0 m（角钢外皮 ±0.54，内腔壁 ±0.5）
    for (const y of [0.02, 1.02]) { edge(1.08, S, S, 0, y, 0.54); edge(1.08, S, S, 0, y, -0.54); edge(S, S, 1.08, 0.54, y, 0); edge(S, S, 1.08, -0.54, y, 0); }
    for (const z of [0.54, -0.54]) for (const x of [-0.54, 0.54]) edge(S, 1.06, S, x, 0.52, z);
    // 侧板（木模，胶合板纹理）+ 底板
    tank.add(P.mesh(new THREE.BoxGeometry(0.012, 0.96, 1.0), mats.plywood, { p: [0.506, 0.52, 0] }));
    tank.add(P.mesh(new THREE.BoxGeometry(0.012, 0.96, 1.0), mats.plywood, { p: [-0.506, 0.52, 0] }));
    tank.add(P.mesh(new THREE.BoxGeometry(1.0, 0.96, 0.012), mats.plywood, { p: [0, 0.52, -0.506] }));
    tank.add(P.mesh(new THREE.BoxGeometry(1.08, 0.012, 1.08), mats.steelPaint, { p: [0, 0.039, 0], recv: true }));
    // 前壁亚克力
    tank.add(P.mesh(new THREE.BoxGeometry(1.0, 0.96, 0.008), mats.acrylic, { p: [0, 0.52, 0.506], cast: false }));
    // 砂体（1.0 × 1.0 m 平面 × 填深 0.8 m）
    tank.add(P.mesh(new THREE.BoxGeometry(1.0, 0.8, 1.0), mats.sand, { p: [0, 0.45, 0], cast: false, recv: true }));

    /* ---------------- 地表沉降网格（与砂体同材质，位于填面 0.85 m） ---------------- */
    const surfGeo = new THREE.PlaneGeometry(0.99, 0.99, 26, 26);
    const surf = new THREE.Mesh(surfGeo, mats.sand);
    surf.rotation.x = -Math.PI / 2;
    surf.position.y = 0.852;
    root.add(surf);
    const surfBase = surfGeo.attributes.position.array.slice();

    /* ---------------- DN100 管段 + 漏点（DN100 = 外径 Φ100，管中轴埋深 0.45 m） ---------------- */
    const pipe = P.group({ name: 'pipe' });
    root.add(pipe);
    P.pickable(pipe, 'DN100 管段', ['外径 Φ100 mm · 人工接头漏点在管底']);
    pipe.add(P.mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.06, 32), mats.upvc, { p: [0, 0.45, 0], r: [0, 0, 90 * D], recv: true }));
    for (const x of [-0.52, 0.52]) pipe.add(P.mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.05, 32), mats.upvc, { p: [x, 0.45, 0], r: [0, 0, 90 * D] }));
    pipe.add(P.mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.02, 32), mats.plasticBlack, { p: [0, 0.45, 0], r: [0, 0, 90 * D] }));
    // 接头漏点（管底 0.40 m）
    const leakPoint = new THREE.Vector3(0, 0.37, 0);
    pipe.add(P.mesh(new THREE.BoxGeometry(0.05, 0.012, 0.02), mats.warnRed, { p: [0, 0.393, 0], cast: false }));
    // 供水法兰
    pipe.add(P.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 24), mats.steelMachined, { p: [-0.56, 0.45, 0], r: [0, 0, 90 * D] }));
    HS([0, 0.45, 0.12], 'DN100 管段 + 人工接头漏', ['管外径 Φ100 mm，中轴埋深 0.45 m', '漏率 5–40 L/min 可调（600 组 SPH 算例的物理对照）', '侵蚀源项写在管土界面',
      '@DN100 pipe with artificial joint leak, 5–40 L/min']);

    /* ---------------- 传感 ---------------- */
    const fiber = P.fbgRun(mats, [[-0.48, 0.505, 0], [0, 0.505, 0], [0.48, 0.505, 0], [0.55, 0.92, 0.3], [0.55, 1.08, 0.42]], { beads: 8, label: 'DFOS' });
    root.add(fiber);
    const lvdtArr = [];
    for (const x of [-0.3, 0, 0.3]) {
      const lv = P.lvdt(mats, { len: 0.08 });
      lv.position.set(x, 0.952, 0.15);
      lv.rotation.z = Math.PI;
      root.add(lv);
      lvdtArr.push({ g: lv, x, z: 0.15 });
      lv.add(P.mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 8), mats.steelMachined, { p: [0, -0.1, 0] }));
    }
    const lvdtPost = P.mesh(new THREE.BoxGeometry(0.5, 0.015, 0.02), mats.steelMachined, { p: [0, 1.03, 0.15] });
    root.add(lvdtPost);
    for (const x of [-0.3, 0, 0.3]) root.add(P.mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 8), mats.steelMachined, { p: [x, 1.12, 0.15] }));
    HS([0, 1.18, 0.15], 'LVDT 剖面线', ['地表变形三点剖面', '塌陷前数日出现 30 mm 凹陷', '观测进入 EnKF 作为位移观测算子',
      '@Three-point LVDT profile feeds the EnKF']);
    // 孔压计
    for (const z of [0.25, -0.25]) {
      const pt = P.pressureTransmitter(mats, { label: 'u' });
      pt.position.set(0.35, 0.62, z); pt.rotation.z = -90 * D;
      root.add(pt);
    }

    /* ---------------- 供水滑橇 ---------------- */
    const skid = P.group();
    root.add(skid);
    const scale = P.platformScale(mats);
    scale.position.set(-1.5, 0, -0.35);
    root.add(scale);
    const wt = P.waterTank(mats, { r: 0.15, h: 0.38 });
    wt.position.set(-1.5, 0.062, -0.35);
    root.add(wt);
    const pu = P.pumpUnit(mats);
    pu.position.set(-1.5, 0, 0.35); pu.rotation.y = 0;
    root.add(pu);
    const fm = P.flowMeter(mats);
    fm.position.set(-0.95, 0.45, 0.05); fm.rotation.z = 90 * D;
    root.add(fm);
    const bv = P.ballValve(mats, { r: 0.018 });
    bv.position.set(-0.75, 0.45, 0.02);
    root.add(bv);
    // 水箱出口 → 泵入口（补水吸入）
    root.add(P.cable([[-1.39, 0.16, -0.35], [-1.62, 0.08, -0.08], [-1.7, 0.06, 0.28]], 0.01, mats.hoseBlue));
    // 泵出口 → 流量计入口
    root.add(P.cable([[-1.31, 0.1, 0.35], [-1.15, 0.3, 0.2], [-1.0, 0.45, 0.08]], 0.01, mats.hoseBlue));
    root.add(P.pipeRun([[-0.95, 0.45, 0.05], [-0.75, 0.45, 0.02], [-0.585, 0.45, 0]], 0.01, mats.steelMachined));
    HS([-1.5, 0.6, -0.35], '称重供水 + 流量计', ['漏率闭环给定 15 L/min', '体积 + 重量双计量',
      '@Closed-loop 15 L/min supply, weight + volume metered']);

    /* ---------------- 采集桌 ---------------- */
    const bench = P.workbench(mats, { w: 1.1, d: 0.5 });
    bench.position.set(1.35, 0, 0.7); bench.rotation.y = -40 * D;
    root.add(bench);
    const lap = P.laptop(mats, screenTexture('strain'));
    lap.position.set(-0.15, 0.775, 0.02);
    lap.rotation.y = 140 * D;
    bench.add(lap);
    const daq = P.daqCase(mats, { w: 0.3, label: 'TWIN · EnKF' });
    daq.position.set(0.28, 0.845, 0.06);
    daq.rotation.y = 150 * D;
    bench.add(daq);
    root.add(P.cable([[0.6, 1.0, 0.45], [0.9, 0.02, 0.6], [1.2, 0.02, 0.75], [1.25, 0.6, 0.78]], 0.005, mats.cableOrange));
    root.add(P.cable([[0.55, 1.05, 0.42], [0.95, 0.02, 0.65], [1.5, 0.6, 0.82]], 0.004, mats.fbYellow));
    const ext = P.fireExtinguisher(mats); ext.position.set(-0.55, 0, 1.75); ext.rotation.y = 20 * D;
    root.add(ext);
    const cone = P.trafficCone(mats); cone.position.set(-2.25, 0, 0.9); root.add(cone);
    const strip = P.powerStrip(mats); strip.position.set(1.0, 0.002, 1.35); root.add(strip);
    for (const [tx, tz] of [[-0.68, -0.68], [0.68, -0.68], [-0.68, 0.68], [0.68, 0.68]]) {
      const tape = P.floorTapeX(mats); tape.position.set(tx, 0.004, tz); root.add(tape);
    }
    // 尺寸标注（内腔 1.0 × 1.0 m）
    root.add(P.dimensionLine([-0.5, 0.05, 0.68], [0.5, 0.05, 0.68], '1.0 m'));
    root.add(P.dimensionLine([-0.64, 0.05, 0.28], [-0.64, 1.045, 0.28], '1.0 m'));

    // 信号流：供水沿管路流向漏点
    const supplyFlow = P.signalFlow(mats, [[-0.95, 0.45, 0.05], [-0.75, 0.45, 0.02], [-0.5, 0.45, 0], [0, 0.45, 0], [0, 0.41, 0]], { color: 0x8fd0f0, count: 4, speed: 0.07, tubeR: 0.001 });
    root.add(supplyFlow);

    /* ---------------- 六段物理动画元素 ---------------- */
    // 渗漏射流
    const leakN = 110;
    const lpos = new Float32Array(leakN * 3);
    const lvel = [];
    for (let i = 0; i < leakN; i++) { lpos[i * 3 + 1] = -1; lvel.push(new THREE.Vector3()); }
    const leakGeo = new THREE.BufferGeometry();
    leakGeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
    const leakMat = new THREE.PointsMaterial({ color: 0x8fd0f0, size: 0.016, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
    leakMat.userData.local = true;
    const leakPts = new THREE.Points(leakGeo, leakMat);
    root.add(leakPts);
    // 渗流饱和锋面（半透明蓝盘扩大）
    const satMat = new THREE.MeshBasicMaterial({ color: 0x3a6ea8, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    satMat.userData.local = true;
    const sat = new THREE.Mesh(new THREE.CircleGeometry(0.18, 32), satMat);
    sat.rotation.x = -Math.PI / 2;
    sat.position.set(0, 0.372, 0);
    root.add(sat);
    // 侵蚀空腔（半透明暗球，长大）
    const cavMat = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.9, transparent: true, opacity: 0.85 });
    cavMat.userData.local = true;
    const cavity = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), cavMat);
    cavity.position.copy(leakPoint);
    cavity.scale.setScalar(0.001);
    root.add(cavity);
    // 侵蚀砂粒（InstancedMesh）
    const sandN = 160;
    const sandIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.007, 6, 6), mats.sand, sandN);
    sandIM.userData.local = false;
    const sandP = [];
    for (let i = 0; i < sandN; i++) {
      sandP.push({ p: new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.36 + Math.random() * 0.04, (Math.random() - 0.5) * 0.1), v: new THREE.Vector3(), on: false });
    }
    root.add(sandIM);
    // 孪生环 + 置信圈
    const twinMat = new THREE.MeshBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    twinMat.userData.local = true;
    const twinRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.006, 6, 48), twinMat);
    twinRing.position.copy(leakPoint);
    root.add(twinRing);
    const confMat = new THREE.MeshBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    confMat.userData.local = true;
    const confRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.002, 6, 48), confMat);
    confRing.position.copy(leakPoint);
    root.add(confRing);
    const twinLabel = P.labelSprite(['TWIN · EnKF 200', '状态 + 置信度 + 提前期'], { size: 0.07 });
    twinLabel.position.set(0, 0.9, 0);
    root.add(twinLabel);
    // 塌陷边缘环
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xd23a2a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    rimMat.userData.local = true;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.006, 6, 48), rimMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(0, 0.855, 0);
    root.add(rim);

    for (const [pos, text] of [
      [[0, 1.25, -0.2], ['1 m³ 土箱', 'DN100 + 人工接头漏']],
      [[-1.5, 0.72, 0], ['供水滑橇', '15 L/min 闭环']],
      [[1.35, 1.15, 0.7], ['孪生同化', 'EnKF 200 成员 · <1 s/帧']],
    ]) {
      const sp = P.labelSprite(text, { size: 0.075 });
      sp.position.set(...pos);
      root.add(sp);
    }
    HS([1.35, 1.05, 0.75], '孪生体输出', ['逐格 30 天内塌陷概率', '置信度 + 提前期，不是一张图', '代理前向 <50 ms，单帧更新 <1 s',
      '@Twin output: 30-day collapse probability with confidence']);

    const smooth = THREE.MathUtils.smoothstep;
    const dipAt = (x, z, A, s) => A * Math.exp(-(x * x + z * z) / (2 * s * s));

    return {
      root,
      hotspots,
      readout: (t, stage) => {
        const day = Math.round(t * 40);
        const rP = (0.05 + smooth(t, 0.3, 1) * 0.25) * 5;
        return { pressure: `第 ${String(day).padStart(2, '0')} 天 · 原型空洞 R≈${rP.toFixed(1)} m`, note: stage?.label || '' };
      },
      update(t, dt, ui) {
        supplyFlow.userData.update(dt, t < 0.55);
        if (pu.userData.spin) pu.userData.spin.rotation.x -= dt * 14;
        const stage = t;
        const eroding = smooth(stage, 0.3, 0.5);
        const cavS = 0.02 + smooth(stage, 0.34, 0.95) * 0.26;
        const A = smooth(stage, 0.68, 0.92) * 0.1 + smooth(stage, 0.9, 1) * 0.16;
        const sink = smooth(stage, 0.9, 1);

        // 地表沉降（rotation.x=-π/2 后局部 +z 对应世界 +y，凹陷取负）
        const posA = surf.geometry.attributes.position;
        for (let i = 0; i < posA.count; i++) {
          const x = surfBase[i * 3], y = surfBase[i * 3 + 1];
          const d = dipAt(x, y, A, 0.17) * (1 - sink * 0.2) + dipAt(x, y, sink * 0.1, 0.09);
          posA.array[i * 3 + 2] = -d;
        }
        posA.needsUpdate = true;
        surf.geometry.computeVertexNormals();

        // LVDT 跟随沉降
        for (const { g, x, z } of lvdtArr) g.position.y = 0.952 - dipAt(x, z, A, 0.17);

        // 射流
        leakPts.visible = stage < 0.55;
        if (leakPts.visible) {
          const arr = leakPts.geometry.attributes.position;
          for (let i = 0; i < arr.count; i++) {
            const v = lvel[i];
            arr.array[i * 3] += v.x * dt;
            arr.array[i * 3 + 1] += v.y * dt;
            arr.array[i * 3 + 2] += v.z * dt;
            v.y -= dt * 1.6;
            if (arr.array[i * 3 + 1] < 0.36 || Math.random() < 0.02) {
              arr.array[i * 3] = (Math.random() - 0.5) * 0.02;
              arr.array[i * 3 + 1] = 0.37;
              arr.array[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
              v.set((Math.random() - 0.5) * 0.2, -0.25 - Math.random() * 0.3, (Math.random() - 0.5) * 0.2);
            }
          }
          arr.needsUpdate = true;
        }
        // 渗流锋面
        satMat.opacity = smooth(stage, 0.12, 0.4) * 0.4 * (1 - eroding * 0.4);
        sat.scale.setScalar(1 + smooth(stage, 0.12, 0.55) * 1.8);
        // 空腔 + 砂粒
        cavity.scale.set(cavS, cavS * 0.62, cavS);
        cavMat.opacity = 0.25 + eroding * 0.6;
        const dummy = new THREE.Object3D();
        for (let i = 0; i < sandN; i++) {
          const sp = sandP[i];
          if (eroding > 0.02 && !sp.on && Math.random() < eroding * 0.03) {
            sp.on = true;
            sp.v.set((Math.random() - 0.5) * 0.25, -0.2 - Math.random() * 0.25, (Math.random() - 0.5) * 0.25);
          }
          if (sp.on) {
            sp.p.addScaledVector(sp.v, dt);
            sp.v.y -= dt * 0.8;
            if (sp.p.y < 0.3 || sp.p.length() > 0.35) {
              sp.on = false;
              sp.p.set((Math.random() - 0.5) * 0.1, 0.36 + Math.random() * 0.04, (Math.random() - 0.5) * 0.1);
            }
          }
          dummy.position.copy(sp.p);
          dummy.updateMatrix();
          sandIM.setMatrixAt(i, dummy.matrix);
        }
        sandIM.instanceMatrix.needsUpdate = true;
        sandIM.visible = eroding > 0.02;
        // 孪生环
        const twinOn = smooth(stage, 0.5, 0.62);
        twinRing.scale.setScalar(Math.max(0.001, cavS * 1.5));
        twinRing.rotation.x = Math.PI / 2;
        twinMat.opacity = twinOn * (0.5 + 0.25 * Math.sin(performance.now() * 0.004));
        twinLabel.material.opacity = twinOn;
        confRing.scale.setScalar(Math.max(0.001, cavS * (2.1 + 0.25 * Math.sin(performance.now() * 0.002))));
        confRing.rotation.x = Math.PI / 2;
        confMat.opacity = twinOn * 0.35;
        // 塌陷
        rim.scale.setScalar(0.12 + sink * 0.1);
        rimMat.opacity = sink * 0.8;
      },
    };
  },
};
