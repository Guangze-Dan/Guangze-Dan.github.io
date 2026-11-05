// 场景三：红安 100:1 缩尺热力耦合循环试验
// 依据：速查卡 §6（四阶段温度循环、实测降温曲线标定、2D FEM 误差 ≈2%）。
import * as THREE from 'three';
import * as P from '../parts.js';
import { screenTexture } from '../materials.js';

const D = Math.PI / 180;

export default {
  id: 'hongan',
  n: '03',
  titleCn: '100:1 缩尺热循环试验',
  titleEn: 'Scaled Thermal-Cycling Test (Hong\u2019an)',
  kicker: '科研工程 / 热力耦合 · 论文方法平台',
  desc: '100:1 缩尺内衬洞室重现充气—保温—放气—恢复四阶段温度循环；热力模型用实测降温曲线标定，二维有限元与实测壁面应力相差约 2%。峰值应力出现在充气末，近壁拉伸区出现在放气末。',
  principle: '原理一句话：充气压缩升温、放气膨胀降温——温度循环驱动壁面应力交变，峰值在充气末、拉伸在放气末。',
  facts: [
    ['缩尺', '100:1'],
    ['模型尺寸', 'Φ110 × 320 mm'],
    ['对应原型', 'Φ11 m × 32 m 井筒'],
    ['循环', '充气 / 保温 / 放气 / 恢复'],
    ['峰值应力', '≈37 MPa · 充气结束'],
    ['临界放气速率', '≈27 kg/s'],
    ['2D FEM 校核', '与实测差 ≈2%'],
    ['S-N 修正', 'b = −0.0343'],
  ],
  stages: [
    { at: 0.0, label: '充气', sub: '压缩升温 · 峰值应力' },
    { at: 0.3, label: '保温', sub: '热平衡 · 记录降温前基线' },
    { at: 0.55, label: '放气', sub: '快速降温 · 近壁拉伸区', warn: true },
    { at: 0.8, label: '恢复', sub: '回温 · 循环计数 +1' },
  ],
  view: { pos: [1.15, 0.85, 1.95], target: [-0.05, 0.3, 0.05] },
  readoutLabel: '气体温度（示意）',
  principleTree: {
    title: '热-力耦合链 · 温度驱动应力交变',
    focus: 1, timeline: 0.15,
    nodes: [
      { label: '充气压缩', sub: '温升' },
      { label: '壁面应力叠加', sub: '峰值 ≈37 MPa', warn: true },
      { label: '放气膨胀', sub: '快速降温' },
      { label: '近壁拉伸区', sub: '可超抗拉强度', warn: true },
      { label: '疲劳交变', sub: 'S-N b = −0.0343' },
    ],
  },
  clipLegend: ['混凝土模壁 + 钢内衬', '囊内气体与热电偶树', '壁面应变环（红充气 / 蓝放气）'],
  // 阶段 → 观测测点（充气→应变环 · 保温→模型 · 放气→应变环 · 恢复→滑橇）
  stageHotspots: [1, 0, 1, 3],
  steps: [
    { title: '为什么缩尺 100:1', sub: 'Φ110 × 320 mm → 原型 Φ11 × 32 m',
      detail: ['原型四阶段温度循环慢且贵，缩尺重现温度-应力路径', '混凝土模壁 + 钢内衬，热参数按相似比换算', '热力模型用实测降温曲线标定'],
      view: { pos: [1.7, 1.1, 2.3], target: [0, 0.3, 0] }, timeline: 0 },
    { title: '四阶段循环', sub: '充气 → 保温 → 放气 → 恢复',
      detail: ['充气压缩升温；保温建立热平衡基线', '放气膨胀降温——快速放气是危险工况', '恢复回温，循环计数 +1（正在播放）'],
      view: { pos: [1.2, 0.85, 1.7], target: [0, 0.3, 0] }, timeline: 0.2, play: true },
    { title: '峰值在充气末', sub: '≈37 MPa · 几何集中驱动', tree: true,
      detail: ['内压与热应力叠加，壁面应力峰值出现在充气结束', '2D 有限元与实测壁面应力差 ≈2%'],
      focus: 1, timeline: 0.15 },
    { title: '拉伸在放气末', sub: '快速降温 → 近壁拉伸区',
      detail: ['放气末近壁进入拉伸，可超过岩石抗拉强度', '内衬环先变红（充气峰）再变蓝（放气拉）'],
      focus: 1, timeline: 0.7 },
    { title: '临界放气速率', sub: '27 kg/s · 超过则近壁拉裂',
      detail: ['效率只在 0.274–0.298 之间变化，寿命却跨三个数量级', '运行点应向寿命一侧移动——这是运行优化的结论'],
      focus: 2, timeline: 0.7 },
    { title: '模型可信度', sub: '四层验证 · S-N b 修正 −0.0343',
      detail: ['热力模型以实测降温曲线标定', '四层验证后 2D FEM 与实测差 ≈2%'],
      focus: 3, timeline: 0.45 },
  ],
  features: { explode: true, clip: 'z', clipRange: [-0.35, 0.35] },
  demoClip: { axis: 'y', pos: 0.3 },

  build({ mats }) {
    const root = new THREE.Group();
    const hotspots = [];
    const HS = (at, title, lines, tone) => hotspots.push({ at, title, lines, tone });

    /* ---------------- 缩尺洞室模型：竖直内衬井筒 Φ110 × 320 mm（100:1 → 原型 Φ11 m × 32 m） ---------------- */
    const MCY = 0.26; // 筒体中心高
    const model = P.group({ name: 'model' });
    root.add(model);
    P.pickable(model, '100:1 缩尺井筒', ['Φ110 × 320 mm · 原型 Φ11 × 32 m']);
    // 混凝土模壁（可剖切）
    model.add(P.mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.30, 40, 1, true), mats.concrete, { p: [0, MCY, 0], recv: true }));
    // 钢内衬
    const liner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.046, 0.29, 36, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x8a9296, roughness: 0.35, metalness: 0.85, side: THREE.DoubleSide })
    );
    liner.userData.local = true;
    liner.position.set(0, MCY, 0); liner.castShadow = true;
    model.add(liner);
    // 顶 / 底法兰
    for (const y of [MCY - 0.155, MCY + 0.155]) {
      model.add(P.mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.014, 32), mats.steelMachined, { p: [0, y, 0] }));
    }
    // 顶口进气管 + 隔离阀
    model.add(P.pipeRun([[0, MCY + 0.162, 0], [0, MCY + 0.26, 0]], 0.007, mats.steelMachined));
    const gvTop = P.gateValve(mats, { r: 0.022 });
    gvTop.position.set(-0.07, MCY + 0.26, 0);
    model.add(gvTop);
    model.add(P.pipeRun([[0, MCY + 0.26, 0], [-0.14, MCY + 0.26, 0], [-0.32, MCY + 0.24, 0.04], [-0.46, MCY + 0.2, 0.06]], 0.006, mats.steelMachined));
    // 囊内气体（颜色随温度变）
    const gasMat = new THREE.MeshBasicMaterial({ color: 0xe86a2a, transparent: true, opacity: 0.28, depthWrite: false });
    gasMat.userData.local = true;
    model.add(P.mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.28, 28), gasMat, { p: [0, MCY, 0], cast: false }));
    // 保温套（半透明，热力环透出）
    const jacket = P.group({ name: 'jacket' });
    const jk = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.34, 36, 1, true), new THREE.MeshStandardMaterial({ color: 0xc8c4ba, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.45, depthWrite: false }));
    jk.userData.local = true;
    jk.position.set(0, MCY, 0);
    jacket.add(jk);
    for (let i = 0; i < 3; i++) jacket.add(P.mesh(new THREE.TorusGeometry(0.077, 0.005, 8, 32), mats.steelPaintDark, { p: [0, MCY - 0.12 + i * 0.12, 0], r: [90 * D, 0, 0] }));
    P.setExplode(jacket, [0, 1, 0], 0.5);
    model.add(jacket);
    // 托架支座
    model.add(P.mesh(new THREE.BoxGeometry(0.44, 0.02, 0.2), mats.steelPaintDark, { p: [0, 0.01, 0], recv: true }));
    for (const x of [-0.11, 0.11]) {
      model.add(P.mesh(new THREE.BoxGeometry(0.04, 0.08, 0.12), mats.steelPaintDark, { p: [x, 0.06, 0] }));
    }
    // 壁面应变环（充气末峰值 / 放气末拉伸——双色，三断面）
    const hoop = [];
    const hotM = new THREE.MeshBasicMaterial({ color: 0xe86a2a, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const coldM = new THREE.MeshBasicMaterial({ color: 0x5ab8ff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    hotM.userData.local = true; coldM.userData.local = true;
    for (const y of [MCY - 0.08, MCY, MCY + 0.08]) {
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.0575, 0.003, 8, 36), hotM);
      r1.position.set(0, y, 0); r1.rotation.x = 90 * D;
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.063, 0.003, 8, 36), coldM);
      r2.position.set(0, y, 0); r2.rotation.x = 90 * D;
      model.add(r1, r2); hoop.push(r1, r2);
    }
    // 热电偶树（顶口插入，四个深度，剖切可见）
    for (let i = 0; i < 4; i++) {
      const tc = P.thermocouple(mats, { wireLen: 0.04 });
      tc.position.set(0.014, MCY + 0.1 - i * 0.07, 0);
      model.add(tc);
    }
    HS([0, 0.52, 0.05], '100:1 缩尺井筒模型', ['Φ110 × 320 mm → 原型 Φ11 m × 32 m', '混凝土模壁 + 钢内衬，重现四阶段温度循环', '热力模型以实测降温曲线标定',
      '@Φ110 × 320 mm vessel → prototype Φ11 m × 32 m']);
    HS([0.07, 0.34, 0.05], '壁面应变环', ['充气末：峰值应力 ≈37 MPa（几何集中驱动）', '放气末：近壁拉伸区（快速降温驱动）', '快速放气可使其超过岩石抗拉强度',
      '峰值充气末 / 拉伸放气末',
      '@Peak 37 MPa at end of charge; tension at end of discharge'], 'warn');

    /* ---------------- 气体供给滑橇 ---------------- */
    const skid = P.group({ name: 'gasSkid' });
    root.add(skid);
    P.pickable(skid, '充放气滑橇', ['空压机 + 蓄能器 + 流量控制']);
    skid.add(P.mesh(new THREE.BoxGeometry(0.7, 0.04, 0.4), mats.darkSteel, { p: [-0.85, 0.02, 0.1], recv: true }));
    const comp = P.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.26, 18), mats.paintRed, { p: [-1.05, 0.12, 0.1], r: [0, 0, 90 * D] });
    skid.add(comp);
    skid.add(P.mesh(new THREE.BoxGeometry(0.2, 0.18, 0.18), mats.plasticWhite, { p: [-0.7, 0.13, 0.16] }));
    skid.add(P.mesh(new THREE.BoxGeometry(0.16, 0.14, 0.14), mats.hoseBlue, { p: [-0.62, 0.11, -0.05] }));
    // 空压机 → 蓄能器接管
    skid.add(P.cable([[-1.18, 0.14, 0.1], [-1.0, 0.12, 0.08], [-0.82, 0.1, 0.09]], 0.008, mats.hoseBlue));
    const acc = P.accumulator(mats, {});
    acc.position.set(-0.55, 0.04, 0.1);
    skid.add(acc);
    // 蓄能器 → 隔离阀 → 顶口进气管
    skid.add(P.pipeRun([[-0.55, 0.36, 0.1], [-0.48, 0.44, 0.08], [-0.46, MCY + 0.2, 0.06]], 0.006, mats.steelMachined));
    // 循环压力表：指针随四阶段摆动
    const cyc = P.mechGauge(mats, { r: 0.03, maxLabel: '16' });
    cyc.position.set(-0.32, 0.6, 0.16);
    skid.add(cyc);
    HS([-0.85, 0.45, 0.1], '充放气滑橇', ['空压机 + 蓄能器 + 质量流量控制', '临界放气速率 ≈27 kg/s（超过则近壁拉裂）',
      '@Compressor + accumulator; critical discharge 27 kg/s']);

    // 信号流：气流沿供气管流动（充气/恢复段）
    const airFlow = P.signalFlow(mats, [[-0.55, 0.36, 0.1], [-0.46, 0.46, 0.06], [-0.32, 0.5, 0.04], [-0.14, 0.52, 0], [0, 0.52, 0], [0, 0.44, 0]], { color: 0x8fd0f0, count: 3, speed: 0.08, tubeR: 0.001 });
    root.add(airFlow);
    // 排气流：放气段从顶口向外排出（粒子）
    const ventN = 60;
    const ventPos = new Float32Array(ventN * 3);
    const ventVel = [];
    for (let i = 0; i < ventN; i++) { ventPos[i * 3 + 1] = -1; ventVel.push(new THREE.Vector3()); }
    const ventGeo = new THREE.BufferGeometry();
    ventGeo.setAttribute('position', new THREE.BufferAttribute(ventPos, 3));
    const ventMat = new THREE.PointsMaterial({ color: 0x8fd0f0, size: 0.012, transparent: true, opacity: 0.8, depthWrite: false });
    ventMat.userData.local = true;
    const vent = new THREE.Points(ventGeo, ventMat);
    vent.visible = false;
    root.add(vent);

    /* ---------------- 采集桌 ---------------- */
    const mon = P.group();
    root.add(mon);
    const bench = P.workbench(mats, { w: 1.0, d: 0.5 });
    bench.position.set(0.95, 0, 0.55); bench.rotation.y = -35 * D;
    mon.add(bench);
    const lap = P.laptop(mats, screenTexture('pressure'));
    lap.position.set(-0.15, 0.775, 0.02);
    lap.rotation.y = 145 * D;
    bench.add(lap);
    const daq = P.daqCase(mats, { w: 0.28, label: 'TC · 12CH' });
    daq.position.set(0.24, 0.845, 0.06);
    daq.rotation.y = 155 * D;
    bench.add(daq);
    mon.add(P.cable([[0.08, 0.34, 0.06], [0.5, 0.02, 0.4], [0.8, 0.02, 0.6], [0.85, 0.6, 0.62]], 0.004, mats.cableWhite));
    const ext = P.fireExtinguisher(mats); ext.position.set(1.15, 0, -0.85); ext.rotation.y = -30 * D;
    root.add(ext);
    for (const [tx, tz] of [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]]) {
      const tape = P.floorTapeX(mats); tape.position.set(tx, 0.004, tz); root.add(tape);
    }
    HS([0.95, 1.05, 0.6], '热力模型标定', ['实测降温曲线 → 标定热参数', '四层验证；2D FEM 与实测差 ≈2%', 'S-N 曲线 b 值修正为 −0.0343',
      '@Calibrated on measured cooling curve, FEM error ≈2%']);

    /* ---------------- 标签 ---------------- */
    for (const [pos, text] of [
      [[0, 0.66, -0.12], ['缩尺模型 100:1', 'Φ110 × 320 · 四阶段循环']],
      [[-0.85, 0.5, 0.35], ['充放气滑橇', '27 kg/s 临界放气']],
      [[0.95, 1.15, 0.55], ['降温曲线标定', 'FEM 误差 ≈2%']],
    ]) {
      const sp = P.labelSprite(text, { size: 0.07 });
      sp.position.set(...pos);
      root.add(sp);
    }

    const lerp = THREE.MathUtils.lerp;
    const tempColor = new THREE.Color();
    return {
      clipTargets: [model, jacket],
  root,
      hotspots,
      readout: (t, stage) => {
        // 温度示意（相对）
        let temp;
        if (t < 0.3) temp = lerp(20, 52, t / 0.3);
        else if (t < 0.55) temp = 52;
        else if (t < 0.8) temp = lerp(52, 12, (t - 0.55) / 0.25);
        else temp = lerp(12, 20, (t - 0.8) / 0.2);
        return { pressure: `${temp.toFixed(0)} °C`, note: stage?.label || '' };
      },
      update(t, dt) {
        // 充气/恢复段进气；放气段关进气、开排气粒子
        const charging = t < 0.3 || t >= 0.8;
        airFlow.userData.update(dt, charging);
        vent.visible = t >= 0.55 && t < 0.8;
        if (vent.visible) {
          const arr = vent.geometry.attributes.position;
          for (let i = 0; i < arr.count; i++) {
            const vel = ventVel[i];
            arr.array[i * 3] += vel.x * dt;
            arr.array[i * 3 + 1] += vel.y * dt;
            arr.array[i * 3 + 2] += vel.z * dt;
            vel.y -= dt * 0.4;
            if (arr.array[i * 3 + 1] < 0.4 || Math.random() < 0.02) {
              arr.array[i * 3] = (Math.random() - 0.5) * 0.02;
              arr.array[i * 3 + 1] = 0.62;
              arr.array[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
              vel.set((Math.random() - 0.5) * 0.12, 0.5 + Math.random() * 0.4, (Math.random() - 0.5) * 0.12);
            }
          }
          arr.needsUpdate = true;
        }
        // 循环压力表：充气升、保温平、放气降、恢复回1
        const cycP = t < 0.3 ? 2 + (t / 0.3) * 10 : t < 0.55 ? 12 : t < 0.8 ? Math.max(1, 12 - ((t - 0.55) / 0.25) * 11) : 1 + ((t - 0.8) / 0.2) * 1;
        cyc.userData.needle.rotation.z = D * (130 - 260 * (Math.min(16, cycP) / 16));
        let gas, hot, cold;
        if (t < 0.3) { gas = lerp(0.18, 0.4, t / 0.3); hot = t / 0.3 * 0.5; cold = 0; }
        else if (t < 0.55) { gas = 0.4; hot = 0.35; cold = 0; }
        else if (t < 0.8) { const f = (t - 0.55) / 0.25; gas = lerp(0.4, 0.12, f); hot = lerp(0.35, 0, f); cold = f * 0.55; }
        else { const f = (t - 0.8) / 0.2; gas = lerp(0.12, 0.18, f); hot = f * 0.1; cold = (1 - f) * 0.55; }
        tempColor.setHSL(lerp(0.58, 0.05, (gas - 0.12) / 0.28), 0.85, 0.5);
        gasMat.color.copy(tempColor);
        gasMat.opacity = 0.18 + gas * 0.4;
        hotM.opacity = hot; coldM.opacity = cold;
      },
    };
  },
};
