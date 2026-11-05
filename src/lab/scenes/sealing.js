// 场景二：20 MPa 高内压柔性密封防渗试验台
// 依据：试验方案速查卡 §5 + 项目页 p19（成勘院委托，500 内径反力筒 / 24×M48 / 22 MPa 设计）。
import * as THREE from 'three';
import * as P from '../parts.js';
import { screenTexture } from '../materials.js';

const D = Math.PI / 180;

export default {
  id: 'sealing',
  n: '02',
  titleCn: '高内压柔性密封试验台',
  titleEn: 'High-Pressure Flexible Sealing Test',
  kicker: '科研工程 / 试验方案与平台设计 · 成勘院委托',
  desc: '柔性密封水囊 — 支撑层 — 钢制反力筒三层构造，0.5–20 MPa 分级加压。判定（何时漏）、定位（哪里漏）、机理（为何破）三层监测，拆检作真值。可切换回放第一轮 5.3 MPa 破口。',
  principle: '原理一句话：P1−P2 差分区分真漏与管路渗；18 点分区按时序回答哪里漏；囊体应变斜率回答为何破——每个问题配一件仪器。',
  facts: [
    ['水囊', 'Φ400 × 850 mm'],
    ['反力筒内径', 'Φ500 mm'],
    ['设计压力', '22 MPa（承压边界校核）'],
    ['螺栓', '24 × M48 高强'],
    ['第一轮', '5.3 MPa 上弧渗漏 · 破口 ≈122 mm'],
    ['分区探头', '18 点 + 导水条 4'],
    ['应变', '囊体 16 · 钢桶 12'],
    ['声发射', '4 通道'],
  ],
  options: [
    { id: 'round1', label: '回放第一轮破坏（5.3 MPa 零传感器）', default: false },
  ],
  stages: [
    { at: 0.0, label: '预压', sub: '0.5 MPa × 30 min' },
    { at: 0.12, label: '二级预压', sub: '2 MPa × 15 min' },
    { at: 0.24, label: '5 MPa 单级', sub: '第一轮在此破坏 · 保压 30 min', warn: true },
    { at: 0.42, label: '加密三级', sub: '6 / 7 / 8 MPa' },
    { at: 0.58, label: '升程', sub: '10 → 15 MPa' },
    { at: 0.72, label: '20 MPa 保压', sub: '≥ 60 min · 判据：压降率 > 3× 本底' },
    { at: 0.86, label: '循环加载', sub: '每 10 循环保压复查' },
  ],
  view: { pos: [2.9, 2.0, 3.3], target: [-0.15, 0.72, 0] },
  readoutLabel: '囊内压 · 反力筒校核 22 MPa',
  principleTree: {
    title: '检漏原理链 · 判定 → 定位 → 机理',
    focus: 4, timeline: 0.78,
    nodes: [
      { label: '分级加压', sub: '0.5 → 20 MPa' },
      { label: '渗漏？', sub: '压降率 > 3× 本底', warn: true },
      { label: 'P1−P2 差分', sub: '真漏 vs 管路渗' },
      { label: '分区时序', sub: '18 点 · 高度带 + 象限' },
      { label: '拆检对账', sub: '破口 ≈122 mm' },
      { label: '方法学', sub: '可迁移 · 三层监测' },
    ],
  },
  clipLegend: ['水囊断面（橡胶本体）', '聚脲层 / 玄武岩纤维缠绕', '砂浆支撑环', '筒壁内 18 点探头与导水条'],
  // 阶段 → 观测测点（预压/二级→P1P2 · 5MPa→第一轮复盘 · 加密/升程/保压→反力筒 · 循环→称重补水）
  stageHotspots: [4, 4, 3, 0, 0, 0, 5],
  steps: [
    { title: '为什么做这个试验', sub: '成勘院 20 MPa 储气库密封需求',
      detail: ['储气库密封体系缺少 20 MPa 量级的防渗数据', '平台：柔性水囊 — 支撑层 — 钢反力筒，22 MPa 设计', '第一轮零传感器失败——第二轮让每个问题配一件仪器'],
      view: { pos: [3.6, 2.4, 4.0], target: [0, 0.75, 0] }, timeline: 0 },
    { title: '三层构造', sub: '水囊 Φ400 × 850 · 聚脲 · 砂浆 · 钢筒',
      detail: ['橡胶本体 + 玄武岩纤维缠绕 + 聚脲多轮厚涂', '砂浆支撑层太强会顶破水囊——掺石膏降弹模', '反力筒内径 Φ500，24 × M48 高强螺柱'],
      focus: 2, clip: { axis: 'z', pos: 0.1 }, timeline: 0 },
    { title: '双表差分', sub: 'P1−P2 分离真漏与管路渗', tree: true,
      detail: ['P1 在囊入口，P2 在隔离阀上游', '真漏时 P1 掉压、P2 持压——差分即报警（上方双柱会演示）', '单表做不到：管路渗与囊漏无法区分'],
      focus: 4, timeline: 0 },
    { title: '分区检漏', sub: '18 点探头 + 4 条导水条',
      detail: ['上弧 8（每 45°）· 上腰 4 · 下腰 4 · 底部 2', '最先触发给出高度带与象限，时序收窄位置', '导水条把水引到探头路径——两点之间不漏检'],
      focus: 1, clip: { axis: 'z', pos: 0.1 }, timeline: 0 },
    { title: '加载程序', sub: '0.5 → 2 → 5 → 6/7/8 → 15 → 20 MPa',
      detail: ['5 MPa 单级保压 30 min——第一轮的破坏带', '20 MPa 保压 ≥ 60 min，判据：压降率 > 3× 本底', '循环加载每 10 次保压复查（正在播放）'],
      view: { pos: [3.4, 2.2, 3.8], target: [0, 0.8, 0] }, timeline: 0.5, play: true },
    { title: '第一轮：5.3 MPa 的教训', sub: '零传感器 → 只得到一个数字', tree: true,
      detail: ['上弧渗漏，破口唯一、纯橡胶部位、卡尺 ≈122 mm', '何时漏、从哪漏、为何破——三个问题全部失语', '证据链靠拆检闭合：破口与渗漏点重合'],
      focus: 3, option: { id: 'round1', value: true }, clip: { axis: 'z', pos: 0.1 }, timeline: 0.5 },
    { title: '三条工艺改进', sub: '聚脲厚涂 · 砂浆掺石膏 · 养护十天',
      detail: ['聚脲多轮厚涂：一体成型、较均匀、有强度、成本可控', '砂浆掺石膏降水泥比：太强反而顶破水囊', '养护十天形成水囊-砂浆组合桶——三条都从破口形貌反推'],
      focus: 2, option: { id: 'round1', value: false }, clip: { axis: 'z', pos: 0.1 }, timeline: 0 },
    { title: '20 MPa 保压', sub: '压降率 > 3× 本底 · 至少 60 min',
      detail: ['三级判据：渗漏确认 / 疑似 / 结构响应', '刚性封堵件做本底标定，阈值随数据更新', '温度实测修正温压系数——剔除假压降'],
      focus: 0, timeline: 0.78 },
    { title: '拆检对账', sub: '判据对不对，拆开看',
      detail: ['分区时序 → 拆检直奔区域；破口位置/尺寸对账', '产出：位置-破口对照图，沉淀为可迁移的方法学', '论文卖点在第三章：监测与加载的方法学核心'],
      focus: 3, option: { id: 'round1', value: true }, clip: { axis: 'z', pos: 0.1 }, timeline: 0.5 },
  ],
  features: { explode: true, clip: 'z', clipRange: [-0.3, 0.3] },
  demoClip: { axis: 'z', pos: 0.08 },

  build({ mats, viewer }) {
    const root = new THREE.Group();
    const hotspots = [];
    const HS = (at, title, lines, tone) => hotspots.push({ at, title, lines, tone });
    const refs = { spray: null, probeFlash: [], breach: null, round1: false };

    /* ---------------- 基础 ---------------- */
    const base = P.group({ name: 'base' });
    root.add(base);
    base.add(P.mesh(new THREE.CylinderGeometry(0.5, 0.54, 0.07, 48), mats.steelPaintDark, { p: [0, 0.035, 0], recv: true }));
    base.add(P.mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 48), mats.steelMachined, { p: [0, 0.095, 0] }));

    /* ---------------- 反力筒（可爆开的外壳组） ---------------- */
    const shell = P.group({ name: 'barrelShell' });
    root.add(shell);
    P.pickable(shell, '钢制反力筒', ['内径 Φ500 · 壁厚 35 mm · 22 MPa 设计']);
    // 筒壁：内径精确 Φ500，壁厚 35 mm（外径 Φ570），带厚度剖面
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x4a6d9e, roughness: 0.45, metalness: 0.5, side: THREE.DoubleSide });
    wallMat.userData.local = true;
    const wallProfile = [new THREE.Vector2(0.25, 0.135), new THREE.Vector2(0.285, 0.135), new THREE.Vector2(0.285, 1.075), new THREE.Vector2(0.25, 1.075)];
    const wall = new THREE.Mesh(new THREE.LatheGeometry(wallProfile, 72), wallMat);
    wall.castShadow = true; wall.receiveShadow = true;
    shell.add(wall);
    // 端部法兰
    for (const y of [0.13, 1.08]) {
      shell.add(P.mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.038, 64), mats.steelPaint, { p: [0, y, 0], recv: true }));
    }
    // 24 × M48 双端螺栓（上下法兰各一圈）
    for (const y of [0.13, 1.08]) {
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const bolt = P.hexBolt(mats, { r: 0.038, len: 0.095 });
        bolt.position.set(Math.cos(a) * 0.315, y, Math.sin(a) * 0.315);
        bolt.name = 'bolt';
        shell.add(bolt);
      }
    }
    // 吊耳 ×4
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const lug = P.group({ p: [Math.cos(a) * 0.29, 1.1, Math.sin(a) * 0.29] });
      lug.add(P.mesh(new THREE.BoxGeometry(0.02, 0.07, 0.05), mats.steelPaintDark, { p: [0, 0.03, 0] }));
      lug.add(P.mesh(new THREE.TorusGeometry(0.02, 0.006, 8, 16), mats.steelPaintDark, { p: [0, 0.08, 0], r: [90 * D, 0, 0] }));
      shell.add(lug);
    }
    // 内壁探头与导水条（随外壳爆炸移动）
    const probeMat = new THREE.MeshBasicMaterial({ color: 0x54d23a, transparent: true, opacity: 0.95 });
    probeMat.userData.local = true;
    const probeHot = new THREE.MeshBasicMaterial({ color: 0xd23a2a, transparent: true, opacity: 0.95 });
    probeHot.userData.local = true;
    const probeMeshes = [];
    const addProbe = (y, aDeg, zone) => {
      const a = aDeg * D;
      const pr = P.mesh(new THREE.BoxGeometry(0.024, 0.016, 0.01), mats.plasticWhite, { p: [Math.cos(a) * 0.243, y, Math.sin(a) * 0.243], r: [0, -a, 0], cast: false });
      const led = P.mesh(new THREE.SphereGeometry(0.007, 8, 8), probeMat, { p: [Math.cos(a) * 0.241, y, Math.sin(a) * 0.241], cast: false });
      led.userData.zone = zone;
      shell.add(pr, led);
      probeMeshes.push(led);
    };
    for (let i = 0; i < 8; i++) addProbe(0.82, i * 45, 'upperArc');   // 上弧 8 @45°
    for (let i = 0; i < 4; i++) addProbe(0.6, i * 90 + 45, 'upperBelt'); // 上腰 4
    for (let i = 0; i < 4; i++) addProbe(0.4, i * 90, 'lowerBelt');   // 下腰 4
    for (let i = 0; i < 2; i++) addProbe(0.17, i * 180 + 90, 'sump');  // 底部 2
    // 导水条 4（象限竖向，贴内壁）
    for (let i = 0; i < 4; i++) {
      const a = (i * 90 + 45) * D;
      shell.add(P.mesh(new THREE.BoxGeometry(0.01, 0.72, 0.016), mats.plasticGrey, { p: [Math.cos(a) * 0.243, 0.5, Math.sin(a) * 0.243], r: [0, -a, 0], cast: false }));
    }
    // 钢桶应变 12 点（三断面 × 四方向，贴外壁）
    for (const y of [0.36, 0.64, 0.92]) {
      for (let i = 0; i < 4; i++) {
        const a = (i * 90) * D;
        const sg = P.strainGauge(mats, { len: 0.014, wid: 0.007, wireLen: 0.04 });
        sg.position.set(Math.cos(a) * 0.288, y, Math.sin(a) * 0.288);
        sg.rotation.y = -a;
        shell.add(sg);
      }
    }
    // 声发射 4 通道（外壁上段）
    for (let i = 0; i < 4; i++) {
      const a = (i * 90 + 45) * D;
      const s = P.aeSensor(mats);
      s.position.set(Math.cos(a) * 0.293, 0.98, Math.sin(a) * 0.293);
      s.rotation.z = -Math.cos(a) * 0.1;
      shell.add(s);
    }
    // 接线盒 + 出线
    const jb = P.terminalBox(mats, { w: 0.16, h: 0.12, d: 0.08 });
    jb.position.set(0.05, 1.0, 0.3); jb.rotation.y = 15 * D;
    shell.add(jb);
    P.setExplode(shell, [0.35, 1, 0.1], 1.15);
    // 焊缝环带 + 地脚螺栓
    for (const y of [0.44, 0.86]) {
      shell.add(P.mesh(new THREE.TorusGeometry(0.286, 0.004, 8, 56), mats.darkSteel, { p: [0, y, 0], r: [Math.PI / 2, 0, 0], cast: false }));
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const anchor = P.hexBolt(mats, { r: 0.02, len: 0.05, nut: true, washer: false });
      anchor.position.set(Math.cos(a) * 0.46, 0.075, Math.sin(a) * 0.46);
      shell.add(anchor);
    }
    // 尺寸标注
    root.add(P.dimensionLine([-0.25, 0.09, 0.56], [0.25, 0.09, 0.56], '内径 Φ500'));
    root.add(P.dimensionLine([0.42, 0.16, 0.28], [0.42, 1.01, 0.28], '囊高 850'));
    HS([0.32, 0.62, 0], '钢制反力筒', [
      '内径 Φ500 · 设计压力 22 MPa',
      '24 × M48 高强螺柱 · 承压边界校核完成',
      '@Steel reaction barrel, ID Φ500, 22 MPa design, 24 × M48',
      '钢桶应变 12 点：周向对称性反映支撑密实度',
    ]);
    HS([0, 0.95, 0.31], '分区水浸探头 · 18 点', [
      '上弧 8（每 45°）· 上腰 4 · 下腰 4 · 底部 2',
      '最先触发给高度带与象限，时序收窄位置',
      '导水条 4 条保证两点之间不漏检',
      '@18 zoned probes + 4 guide strips: first trigger gives zone',
    ], 'warn');

    /* ---------------- 水囊 + 支撑（留在基座上，Φ400 × 850 mm 精确放样） ---------------- */
    const bagAsm = P.group({ name: 'bagAsm' });
    root.add(bagAsm);
    P.pickable(bagAsm, '柔性密封水囊', ['Φ400 × 850 mm · 随压力轻微呼吸']);
    // 砂浆支撑环（环形剖面，包住水囊但不遮蔽）：内壁贴保护层 0.218，外壁贴筒壁 0.248
    const annulus = (rIn, rOut, y0, y1, mat) => {
      const pts = [new THREE.Vector2(rIn, y0), new THREE.Vector2(rOut, y0), new THREE.Vector2(rOut, y1), new THREE.Vector2(rIn, y1)];
      const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 56), mat);
      m.castShadow = true; m.receiveShadow = true;
      return m;
    };
    // 支撑环独立分组：阶梯爆炸时与筒壁、水囊错开
    const supportG = P.group({ name: 'support' });
    root.add(supportG);
    P.pickable(supportG, '砂浆支撑层', ['环向对称性反映浇筑密实度']);
    supportG.add(annulus(0.222, 0.248, 0.16, 0.76, mats.mortar));
    supportG.add(annulus(0.222, 0.258, 0.12, 0.16, mats.mortar));
    P.setExplode(supportG, [0.18, 1, 0.06], 0.6);
    // 水囊本体：r=0.20（Φ400），直段 0.45 + 两端球冠 → 总高 0.85（850 mm）
    const bagMat = new THREE.MeshStandardMaterial({ color: 0x1e1f21, roughness: 0.86, metalness: 0.02, side: THREE.DoubleSide });
    bagMat.userData.local = true;
    const bag = P.mesh(new THREE.CapsuleGeometry(0.2, 0.45, 12, 40), bagMat, { p: [0, 0.585, 0], recv: true });
    bagAsm.add(bag);
    // 玄武岩纤维布缠绕（直段下段）
    const wrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.48, 40, 1, true),
      mats.fiberWrap
    );
    wrap.position.y = 0.48; wrap.castShadow = true;
    bagAsm.add(wrap);
    // 聚脲保护层（第二轮，多轮厚涂 8 mm）
    const pu = new THREE.Mesh(
      new THREE.CylinderGeometry(0.218, 0.218, 0.54, 40, 1, true),
      mats.polyurea
    );
    pu.position.y = 0.5;
    bagAsm.add(pu);
    // 囊内水体
    bagAsm.add(P.mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.42, 32), mats.glassWater, { p: [0, 0.52, 0], cast: false }));
    // 囊顶接头：球冠顶 → 顶盖进压口
    bagAsm.add(P.mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.1, 16), mats.rubber, { p: [0, 1.055, 0] }));
    bagAsm.add(P.mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 16), mats.brass, { p: [0, 1.098, 0] }));
    // 囊体应变 16 点（保护层之下，环向 + 纵向两个断面）
    for (let i = 0; i < 8; i++) {
      for (const h of [0.42, 0.68]) {
        const a = i * 45 * D;
        const sg = P.strainGauge(mats, { len: 0.012, wid: 0.006, wireLen: 0.03 });
        sg.position.set(Math.cos(a) * 0.205, h, Math.sin(a) * 0.205);
        sg.rotation.y = -a;
        bagAsm.add(sg);
      }
    }
    // 破口（第一轮复盘）：上弧 ≈122 mm（直段顶与球冠过渡区）
    const breach = P.group({ p: [0, 0.87, 0.19], name: 'breach' });
    breach.add(P.mesh(new THREE.CircleGeometry(0.061, 24), new THREE.MeshStandardMaterial({ color: 0x6e1f18, roughness: 0.95, side: THREE.DoubleSide }), { r: [-15 * D, 0, 0], cast: false }));
    const flap = P.mesh(new THREE.CircleGeometry(0.055, 20), new THREE.MeshStandardMaterial({ color: 0x2a2b2d, roughness: 0.9, side: THREE.DoubleSide }), { p: [0.02, 0.01, 0.03], r: [-55 * D, 12 * D, 0], cast: false });
    breach.add(flap);
    breach.visible = false;
    bagAsm.add(breach);
    refs.breach = breach;
    P.setExplode(bagAsm, [0.06, 1, 0], 0.16);
    HS([0, 0.55, 0.26], '柔性密封水囊', [
      'Φ400 × 850 mm · 橡胶本体',
      '玄武岩纤维布 + 胶层缠绕，聚脲多轮厚涂保护层',
      '工艺三条从破口反推：聚脲厚涂 / 砂浆掺石膏降弹模 / 养护十天成组合桶',
      '@Flexible bag Φ400 × 850, fiber wrap + polyurea coating',
    ]);
    HS([0, 1.02, 0.18], '第一轮复盘', [
      '5.3 MPa 上弧渗漏，全场零传感器',
      '破口唯一、纯橡胶部位、卡尺 ≈122 mm',
      '破口与渗漏点重合 → 证据链闭合',
      '@Round 1: leaked at 5.3 MPa, zero sensors, one 122 mm breach',
    ], 'warn');

    /* ---------------- 顶盖 + 管路 ---------------- */
    const top = P.group({ name: 'topCover' });
    root.add(top);
    const pressFlow = P.signalFlow(mats, [[1.12, 0.2, 0], [1.12, 1.0, 0], [1.12, 1.42, 0], [0.85, 1.42, 0], [0.4, 1.42, 0], [0, 1.42, 0], [0, 1.3, 0]], { color: 0x8fd0f0, count: 4, speed: 0.09, tubeR: 0.001 });
    root.add(pressFlow);
    P.pickable(top, '顶盖与加压管路', ['P1 → 隔离阀 → P2 → 流量计 → 泵']);
    top.add(P.mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 64), mats.steelPaint, { p: [0, 1.12, 0] }));
    top.add(P.mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 24), mats.steelMachined, { p: [0, 1.16, 0] }));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      top.add(P.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.014, 6), mats.boltSteel, { p: [Math.cos(a) * 0.2, 1.148, Math.sin(a) * 0.2] }));
    }
    // 立管 + P1（囊入口）
    top.add(P.pipeRun([[0, 1.16, 0], [0, 1.42, 0]], 0.016, mats.steelMachined));
    const pT1 = P.pressureTransmitter(mats, { label: 'P1' });
    pT1.position.set(0.055, 1.34, 0);
    top.add(pT1);
    // 隔离阀 → P2 → 机械表 → 流量计 → 下行到泵
    const gv = P.gateValve(mats, { r: 0.04 });
    gv.position.set(0.22, 1.42, 0);
    top.add(gv);
    const pT2 = P.pressureTransmitter(mats, { label: 'P2' });
    pT2.position.set(0.4, 1.445, 0);
    top.add(pT2);
    const mg = P.mechGauge(mats, { r: 0.05, maxLabel: '25' });
    mg.position.set(0.55, 1.44, -0.08); mg.rotation.z = -90 * D;
    top.add(mg);
    const fm = P.flowMeter(mats);
    fm.position.set(0.72, 1.4, 0); fm.rotation.z = 90 * D;
    top.add(fm);
    top.add(P.pipeRun([[0, 1.42, 0], [0.85, 1.42, 0], [1.05, 1.42, 0], [1.12, 1.0, 0], [1.12, 0.14, 0]], 0.016, mats.steelMachined));
    // P1/P2 压力柱：双表差分判漏原理可视化（P1 掉、P2 不掉 = 真漏）
    const barGeo = new THREE.BoxGeometry(0.018, 1, 0.018);
    barGeo.translate(0, 0.5, 0);
    const p1Bar = new THREE.Mesh(barGeo, new THREE.MeshBasicMaterial({ color: 0x5ab8ff, transparent: true, opacity: 0.85 }));
    const p2Bar = new THREE.Mesh(barGeo, new THREE.MeshBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0.85 }));
    p1Bar.position.set(0.055, 1.55, 0.09);
    p2Bar.position.set(0.2, 1.55, 0.09);
    top.add(p1Bar, p2Bar);
    // 导水条水流：渗漏后水膜沿导水条下滴（4 象限）
    const guideFlows = [];
    for (let i = 0; i < 4; i++) {
      const a = (i * 90 + 45) * D;
      const gx = Math.cos(a) * 0.243, gz = Math.sin(a) * 0.243;
      const f = P.signalFlow(mats, [[gx, 0.84, gz], [gx, 0.5, gz], [gx, 0.18, gz]], { color: 0x6fb8e8, count: 3, speed: 0.3, dotR: 0.005, tubeR: 0.0008, tubeMat: mats.plasticGrey });
      f.visible = false;
      root.add(f);
      guideFlows.push(f);
    }
    P.setExplode(top, [0.18, 1, 0.08], 0.95);
    HS([0.3, 1.55, 0], 'P1 / P2 双变送器 + 机械表', [
      'P1 在囊入口，P2 在隔离阀上游',
      'P1−P2 区分真漏与管路渗，单表做不到',
      '温度传感器实测温压系数，剔除假压降',
      '@P1 at bag inlet, P2 upstream of isolation valve + gauge',
    ]);

    /* ---------------- 泵站 / 补水 ---------------- */
    const pump = P.group({ name: 'pumpStation' });
    root.add(pump);
    const cab = P.controlCabinet(mats, { label: '20 MPa 加压' });
    cab.position.set(1.75, 0, 0.1); cab.rotation.y = -125 * D;
    pump.add(cab);
    const pumpU = P.pumpUnit(mats);
    pumpU.position.set(1.5, 0, -0.55); pumpU.rotation.y = 30 * D;
    pump.add(pumpU);
    const acc = P.accumulator(mats);
    acc.position.set(1.2, 0, -0.15);
    pump.add(acc);
    // 泵出口 → 下行钢管底部（真实连接，替换原悬空软管）
    root.add(P.cable([[1.12, 0.17, 0], [1.26, 0.14, -0.24], [1.46, 0.11, -0.5], [1.66, 0.09, -0.64]], 0.012, mats.hoseBlack));
    // 蓄能器 → 泵入口三通
    pump.add(P.pipeRun([[1.2, 0.06, -0.15], [1.28, 0.06, -0.32], [1.33, 0.06, -0.44]], 0.008, mats.steelMachined));
    const scale = P.platformScale(mats);
    scale.position.set(2.35, 0, -0.7);
    root.add(scale);
    const wt = P.waterTank(mats, { r: 0.16, h: 0.4 });
    wt.position.set(2.35, 0.062, -0.7);
    root.add(wt);
    root.add(P.cable([[2.2, 0.42, -0.62], [1.85, 0.3, -0.56], [1.5, 0.1, -0.52], [1.33, 0.06, -0.45]], 0.009, mats.hoseBlue));
    HS([2.35, 0.65, -0.7], '称重式补水', ['每次补压称重', '体积法在微量渗漏不准，重量法分辨率高', '与分区探头交叉验证',
      '@Weighted make-up water cross-checks the zoned probes']);

    /* ---------------- 控制器 / 监测桌 / 摄像 ---------------- */
    const stand = P.group({ p: [0.62, 0, 0.72] });
    root.add(stand);
    stand.add(P.mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.72, 10), mats.steelMachined, { p: [0, 0.36, 0] }));
    stand.add(P.mesh(new THREE.BoxGeometry(0.16, 0.02, 0.16), mats.steelPaintDark, { p: [0, 0.01, 0] }));
    const wctrl = P.waterController(mats);
    wctrl.position.set(0, 0.75, 0); wctrl.rotation.y = -35 * D;
    stand.add(wctrl);
    // 控制器电缆：立柱内下来 → 地面 → 筒壁接线盒
    root.add(P.cable([[0.62, 0.72, 0.72], [0.66, 0.02, 0.76], [0.45, 0.02, 0.62], [0.2, 0.02, 0.5], [0.1, 0.5, 0.38], [0.06, 0.98, 0.32]], 0.005, mats.cableGrey));
    HS([0.62, 0.92, 0.72], '水浸信号采集控制器', ['18 点分区接入', '判定层：何时漏 · 定位层：哪里漏',
      '@18-zone water-ingress acquisition controller']);

    const mon = P.group({ name: 'monTable' });
    root.add(mon);
    const bench = P.workbench(mats, { w: 1.3, d: 0.55 });
    bench.position.set(1.15, 0, 1.9); bench.rotation.y = -30 * D;
    mon.add(bench);
    const lap = P.laptop(mats, screenTexture('zones'));
    lap.position.set(-0.25, 0.775, 0.02);
    lap.rotation.y = 150 * D;
    bench.add(lap);
    const daq = P.daqCase(mats, { w: 0.3, label: 'AE · 4CH' });
    daq.position.set(0.32, 0.845, 0.06);
    daq.rotation.y = 160 * D;
    bench.add(daq);
    mon.add(P.cable([[1.3, 0.02, 1.75], [0.9, 0.02, 1.3], [0.45, 0.5, 0.9], [0.2, 1.0, 0.35]], 0.006, mats.cableGrey));
    mon.add(P.cable([[1.15, 0.02, 1.8], [0.8, 0.02, 1.35], [0.3, 0.6, 0.95], [0.05, 1.12, 0.3]], 0.006, mats.cableOrange));

    const cam1 = P.cctvCamera(mats);
    cam1.position.set(-1.5, 0, 1.6); cam1.rotation.y = 40 * D;
    root.add(cam1);
    const cam2 = P.cctvCamera(mats);
    cam2.position.set(0.4, 0, 2.3); cam2.rotation.y = -160 * D;
    root.add(cam2);
    const ext = P.fireExtinguisher(mats); ext.position.set(-2.3, 0, 1.5); ext.rotation.y = 35 * D; root.add(ext);
    const cone = P.trafficCone(mats); cone.position.set(2.3, 0, 1.5); root.add(cone);
    for (const [tx, tz] of [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]]) {
      const tape = P.floorTapeX(mats); tape.position.set(tx, 0.004, tz); root.add(tape);
    }
    // 温度：水温 + 环境
    const tc1 = P.thermocouple(mats, { wireLen: 0.05 });
    tc1.position.set(-0.1, 1.19, 0.1);
    top.add(tc1);
    const tc2 = P.thermocouple(mats, { wireLen: 0.08 });
    tc2.position.set(0.9, 0.02, 1.0);
    root.add(tc2);

    /* ---------------- 泄漏喷射粒子（第一轮回放） ---------------- */
    const N = 140;
    const posArr = new Float32Array(N * 3);
    const vel = [];
    for (let i = 0; i < N; i++) {
      posArr[i * 3] = 0; posArr[i * 3 + 1] = 0.95; posArr[i * 3 + 2] = 0.2;
      vel.push(new THREE.Vector3((Math.random() - 0.5) * 0.5, 0.6 + Math.random() * 0.9, 0.8 + Math.random() * 0.9));
    }
    const sprayGeo = new THREE.BufferGeometry();
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const sprayMat = new THREE.PointsMaterial({ color: 0x6fb8e8, size: 0.018, transparent: true, opacity: 0.9, depthWrite: false });
    sprayMat.userData.local = true;
    const spray = new THREE.Points(sprayGeo, sprayMat);
    spray.visible = false;
    root.add(spray);
    refs.spray = { points: spray, vel, active: false, life: 0 };

    /* ---------------- 标签 ---------------- */
    const labels = [
      [[0, 1.62, -0.15], ['钢制反力筒 Φ500', '22 MPa 设计 · 24 × M48']],
      [[-0.35, 0.72, 0.4], ['柔性密封水囊 Φ400 × 850', '纤维布 + 聚脲 + 支撑层']],
      [[0.7, 1.72, 0], ['加压管路 0.5 – 20 MPa', 'P1 / P2 + 机械表 + 流量计']],
      [[1.75, 1.1, 0.1], ['泵站与联锁', '超压联锁保护']],
    ];
    for (const [pos, text] of labels) {
      const sp = P.labelSprite(text, { size: 0.085 });
      sp.position.set(...pos);
      root.add(sp);
    }

    /* ---------------- 压力曲线：分级斜坡 + 保压（与加载程序一致） ---------------- */
    const ramp = (t, t0, t1, a, b) => a + (b - a) * Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    const pressureAt = (t, round1) => {
      if (!round1) {
        if (t < 0.05) return ramp(t, 0, 0.05, 0.05, 0.5);
        if (t < 0.12) return 0.5;
        if (t < 0.15) return ramp(t, 0.12, 0.15, 0.5, 2);
        if (t < 0.21) return 2;
        if (t < 0.24) return ramp(t, 0.21, 0.24, 2, 5);
        if (t < 0.34) return 5;
        if (t < 0.38) return ramp(t, 0.34, 0.38, 5, 6);      // 加密三级
        if (t < 0.42) return 6;
        if (t < 0.46) return ramp(t, 0.42, 0.46, 6, 7);
        if (t < 0.5) return 7;
        if (t < 0.54) return ramp(t, 0.5, 0.54, 7, 8);
        if (t < 0.58) return 8;
        if (t < 0.7) return ramp(t, 0.58, 0.7, 8, 15);        // 升程 10 → 15
        if (t < 0.76) return ramp(t, 0.7, 0.76, 15, 20);
        if (t < 0.86) return 20;                              // 保压 ≥60 min
        if (t < 0.89) return ramp(t, 0.86, 0.89, 20, 16);
        const f = (t - 0.89) / 0.11;
        return 16 + Math.sin(f * Math.PI * 6) * 4;            // 循环加载
      }
      // 第一轮：升到 5.3 → 上弧渗漏 → 压降
      if (t < 0.3) return ramp(t, 0, 0.3, 0.05, 5.3);
      if (t < 0.4) return 5.3;
      const f = (t - 0.4) / 0.6;
      return Math.max(0.8, 5.3 - f * 4.3 - Math.sin(f * 22) * 0.15);
    };

    return {
      clipTargets: [shell, bagAsm, supportG, top],
  root,
      hotspots,
      setOption(id, val) {
        if (id === 'round1') {
          refs.round1 = val;
          breach.visible = val;
          pu.visible = !val;
          bagMat.color.set(val ? 0x2c2620 : 0x1e1f21);
          // 回放第一轮时自动剖开筒壁，露出上弧破口与探头时序
          viewer.setClip({ enabled: val, axis: 'z', pos: 0.1 });
        }
      },
      readout: (t, stage) => ({ pressure: `${pressureAt(t, refs.round1).toFixed(1)} MPa`, note: stage?.label || '' }),
      update(t, dt) {
        const p = pressureAt(t, refs.round1);
        mg.userData.needle.rotation.z = D * (130 - 260 * (p / 25));
        cab.userData.setDigits(p.toFixed(1));
        pumpU.userData.spin.rotation.x -= dt * 16;
        pressFlow.userData.update(dt, p > 0.3);
        // P1/P2 双柱：第一轮泄漏后 P1 掉压、P2 持压 → 差分报警
        const p2 = refs.round1 && t > 0.42 ? Math.min(5.3, p + (t - 0.42) * 5) : p;
        p1Bar.scale.y = Math.max(0.05, p / 25) * 2.2;
        p2Bar.scale.y = Math.max(0.05, p2 / 25) * 2.2;
        const diverge = Math.abs(p - p2) > 0.4;
        p1Bar.material.color.set(diverge ? 0xff5a48 : 0x5ab8ff);
        p2Bar.material.color.set(diverge ? 0xff5a48 : 0xd9ff58);
        // 导水条水流：仅渗漏时显示
        for (const f of guideFlows) f.userData.update(dt, refs.round1 && t > 0.44);
        // 水囊随压力轻微呼吸 + 表面应力热色
        const br = 1 + 0.006 * Math.sin(t * 26) * (p / 20);
        bag.scale.set(br, 1, br);
        const hk = p / 20;
        bagMat.emissive.setRGB(0.3 * hk, 0.06 * hk, 0.02 * hk);
        // 泄漏判定
        const leaking = refs.round1 && t > 0.34 && p > 1.2;
        const s = refs.spray;
        s.active = leaking;
        s.points.visible = leaking;
        // 探头热：第一轮从上弧开始时序触发
        const seq = refs.round1 ? THREE.MathUtils.clamp((t - 0.34) / 0.3, 0, 1) : 0;
        probeMeshes.forEach((m, i) => {
          const frac = i / probeMeshes.length;
          const on = refs.round1 && seq > 0 && frac < seq && i < 8;
          m.material = on ? probeHot : probeMat;
        });
        // 喷射粒子
        if (leaking) {
          const arr = s.points.geometry.attributes.position;
          for (let i = 0; i < arr.count; i++) {
            const v = s.vel[i];
            arr.array[i * 3] += v.x * dt;
            arr.array[i * 3 + 1] += v.y * dt;
            arr.array[i * 3 + 2] += v.z * dt;
            v.y -= dt * 2.2;
            if (arr.array[i * 3 + 1] < 0.02 || Math.random() < 0.008) {
              arr.array[i * 3] = (Math.random() - 0.5) * 0.03;
              arr.array[i * 3 + 1] = 0.95;
              arr.array[i * 3 + 2] = 0.19;
              v.set((Math.random() - 0.5) * 0.5, 0.6 + Math.random() * 0.9, 0.8 + Math.random() * 0.9);
            }
          }
          arr.needsUpdate = true;
        }
      },
    };
  },
};
