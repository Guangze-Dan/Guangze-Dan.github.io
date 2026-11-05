// 场景一：多尺度洞室循环内压物理模型试验台（10:1）
// 依据：试验方案速查卡 §4 + 项目页 p17/p18 实拍。
import * as THREE from 'three';
import * as P from '../parts.js';
import { screenTexture } from '../materials.js';

const D = Math.PI / 180;

export default {
  id: 'multiscale',
  n: '01',
  titleCn: '多尺度洞室循环内压试验台',
  titleEn: 'Multi-scale Cavern Cyclic Pressure Test',
  kicker: '科研工程 / 物理模型试验 · 项目总负责人',
  desc: '10:1 缩尺复现压气储能地下储气库洞室群受力环境：UPVC 主洞室 — 多尺度柔性小洞室 — 非连续预制裂缝围岩。72 通道应变 + FBG + 声发射统一时基，回答"围岩劣化能不能被看见"。',
  principle: '原理一句话：内压使围岩应力重分布，裂缝带角点 2.058p 的集中先于洞壁（1.1677p）达到强度——先裂、才可测；可测、才可预警。',
  facts: [
    ['相似比', '10:1'],
    ['模型箱', '3.0 × 1.6 × 1.8 m'],
    ['主洞室', 'Φ400 × 3 m · 四段'],
    ['内压', '0.4–1.2 MPa（原型 4–12）'],
    ['应变通道', '72（66 正式 + 6 备用）'],
    ['FBG', '4 线 · 39 栅点'],
    ['声发射', '8 通道'],
    ['起裂预判', '≈1.0 MPa'],
  ],
  stages: [
    { at: 0.0, label: '预压', sub: '0.5 MPa · 检查密封与仪器零漂' },
    { at: 0.16, label: '基准循环', sub: '0.4–0.8 MPa · 建立响应基线' },
    { at: 0.38, label: '速率对比', sub: '加载速率改变应变幅值与相位' },
    { at: 0.6, label: '上限循环', sub: '疲劳累积 · 0.4–1.2 MPa × 20' },
    { at: 0.88, label: '起裂判据', sub: '角点 2.058p 达限 → 微震 + 应力跌落', warn: true },
  ],
  view: { pos: [4.9, 3.0, 4.3], target: [0.15, 0.72, 0.15] },
  readoutLabel: '洞内压 · 原型 ×10',
  principleTree: {
    title: '起裂原理链 · 为什么裂缝带先裂',
    focus: 3, clip: { axis: 'z', pos: 0.1 }, timeline: 0.93,
    nodes: [
      { label: '内压加载', sub: '0.4 → 1.2 MPa' },
      { label: '应力重分布', sub: '洞壁 1.1677p' },
      { label: '角点应力集中', sub: '裂缝带 2.058p', warn: true },
      { label: '达到抗拉强度', sub: 'M10 = 1.07 MPa', warn: true },
      { label: '起裂', sub: '微震 + 应力跌落', warn: true },
      { label: '被看见', sub: 'AE 定位 · 应变梯度' },
    ],
  },
  clipLegend: ['主洞室断面（UPVC 壁厚）', '45° 预制裂缝板', '柔性小洞室 · 30 mm 岩桥', '应变砖与应力环'],
  // 阶段 → 观测测点：播放时自动高亮对应热点（预压→P1/P2 · 基准→应变砖 · 速率→FBG · 上限→AE · 起裂→裂缝带）
  stageHotspots: [7, 4, 5, 6, 3],
  steps: [
    { title: '试验要回答什么', sub: '看得见的失败，才有资格谈预警',
      detail: ['衬砌储气库多年循环充放气，围岩劣化发生在看不见的地下', '本试验把 10:1 的洞室群搬进钢箱——让失败可见、可测、可定位', '不是通过性试验：是设计出来"能看见失败"的试验'],
      view: { pos: [5.6, 3.6, 5.4], target: [0, 0.8, 0] }, timeline: 0 },
    { title: '相似材料 M10', sub: '抗拉 1.07 MPa，落在数值窗口内',
      detail: ['M7.5 太软（0.68 MPa）起裂过早；M15 太硬（1.36）压不裂', 'M10 实测 1.07 MPa，反算洞壁开裂 0.92 MPa——次序与设计一致', '24 块试块同条件养护，7 天看趋势、28 天定值'],
      focus: 0, timeline: 0 },
    { title: '洞室群与岩桥', sub: 'Φ400 × 3 m · 四段 · 30 mm 岩桥',
      detail: ['四段 0.9 / 1.1 / 0.5 / 0.5 m，第四段重复第一段——重复性检验', '多尺度柔性小洞室与主洞室壁间距精确 30 mm', '应变砖（10×12×24 mm）就埋在岩桥中点'],
      focus: 1, clip: { axis: 'z', pos: 0.1 }, timeline: 0 },
    { title: '为什么是 45°', sub: '角点应力 2.058p → 裂缝带先裂', tree: true,
      detail: ['斜置 45° 时缝面剪切起步，剪力约为法向两倍', '角点最大主应力 2.058 倍内压，高于洞壁的 1.1677 倍', '次序即前提：裂缝带先裂、洞壁不裂'],
      focus: 3, clip: { axis: 'z', pos: 0.1 }, timeline: 0 },
    { title: '监测设备巡检', sub: '解调仪 / 采集箱 / 工作站——全部可点击查看',
      detail: ['LUNA 解调仪：4 线 39 栅点连续应变', 'DC-2042：72 通道静态应变采集', '悬停任意设备弹出规格卡，双击飞近'],
      focus: 10, timeline: 0 },
    { title: '三套传感 · 一个时基', sub: '72 CH 应变 + 39 栅点 FBG + 8 通道 AE',
      detail: ['裂缝带 28 · 近壁 16 · 洞间 12 · 岩桥 4 · 远场 4 · 零漂 2 + 备用 6', 'FBG 给沿程连续梯度，AE 给微破裂起始与定位', '全场统一时基——时间对不齐，响应时序就没法用'],
      focus: 9, timeline: 0 },
    { title: '加载程序', sub: '预压 → 基准 → 四档速率 → 上限循环',
      detail: ['预压 0.5 MPa 检查密封与仪器零漂', '基准循环建立响应基线；四档速率对比应变幅值与相位', '上限 0.4–1.2 MPa × 20 次问疲劳累积（正在播放）'],
      view: { pos: [3.4, 2.2, 3.6], target: [0, 0.85, 0] }, timeline: 0.3, play: true },
    { title: '起裂：看见劣化', sub: '≈1.0 MPa · 微震 + 应力跌落', tree: true,
      detail: ['角点应力达限：辉光处起裂，试验台微震', 'AE 阵列给出起始时刻与定位', '起裂后承载转移，压力小幅跌落——劣化被看见了'],
      focus: 3, clip: { axis: 'z', pos: 0.1 }, timeline: 0.93 },
    { title: '数据产出', sub: '七图一表 · 24 小时初步判定',
      detail: ['应力-应变传递、起裂时刻、AE 定位、补水量、视频对照', '产出直接服务储气库稳定性评价与运行参数优化', '先验证测量本身，再谈测量结果'],
      focus: 9, clip: { axis: 'z', pos: 0.1 }, timeline: 0.93 },
  ],
  features: { explode: true, clip: 'z', clipRange: [-0.8, 1.2] },
  demoClip: { axis: 'z', pos: 0.08 },

  build({ mats }) {
    const root = new THREE.Group();
    const hotspots = [];
    const HS = (at, title, lines, tone) => hotspots.push({ at, title, lines, tone });
    const refs = { aeFlashT: 0, rippleK: 1 };

    /* ---------------- 钢格构模型箱 ---------------- */
    const box = P.group({ name: 'modelBox' });
    root.add(box);

    const beam = (w, h, d, x, y, z) => box.add(P.mesh(new THREE.BoxGeometry(w, h, d), mats.steelPaint, { p: [x, y, z], recv: true }));

    // 底架：双轨 + 横梁（外廓精确 3.0 × 1.6 × 1.8 m：梁外皮放线）
    for (const z of [-0.76, 0.76]) beam(3.0, 0.1, 0.08, 0, 0.05, z);
    for (const x of [-1.42, 0, 1.42]) beam(0.08, 0.1, 1.52, x, 0.05, 0);
    // 立柱
    const postXs = [-1.47, -0.75, 0, 0.75, 1.47];
    for (const x of postXs) for (const z of [-0.77, 0.77]) beam(0.06, 1.62, 0.06, x, 0.91, z);
    // 长面横梁（前 +Z / 后 -Z）
    for (const z of [-0.775, 0.775]) for (const y of [0.45, 0.9, 1.35, 1.7]) beam(3.0, 0.05, 0.05, 0, y, z);
    // 短面横梁
    for (const x of [-1.475, 1.475]) for (const y of [0.45, 0.9, 1.35, 1.7]) beam(0.05, 0.05, 1.5, x, y, 0);
    // 长面竖肋
    for (const z of [-0.775, 0.775]) for (let i = 0; i < 5; i++) beam(0.05, 1.2, 0.05, -1.25 + i * 0.625, 1.075, z);
    // 顶盖（嵌在顶梁之间，总高精确 1.8 m）
    const cover = P.group({ p: [0, 1.7, 0], name: 'cover' });
    for (const x of [-0.75, 0.75]) {
      const panel = P.mesh(new THREE.BoxGeometry(1.44, 0.03, 1.5), mats.steelPaintDark, { p: [x, 0, 0], recv: true });
      cover.add(panel);
      for (let i = 0; i < 4; i++) cover.add(P.mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 6), mats.boltSteel, { p: [x - 0.6 + i * 0.4, 0.02, -0.65] }));
    }
    P.setExplode(cover, [0, 1, 0], 0.7);
    box.add(cover);
    HS([0, 2.0, 0], '钢格构模型箱', ['3.0 × 1.6 × 1.8 m · 8.64 m³', '相似比 10:1 · 螺栓面板可拆', '@Lattice steel box, 10:1 scale, bolted panels']);
    // 角部节点板
    for (const x of [-1.44, 1.44]) for (const z of [-0.74, 0.74]) for (const y of [0.13, 1.67]) {
      box.add(P.mesh(new THREE.BoxGeometry(0.07, 0.07, 0.008), mats.steelPaintDark, { p: [x, y, z], r: [0, Math.PI / 4, 0], cast: false }));
    }
    // 三向尺寸标注（外皮到外皮）
    root.add(P.dimensionLine([-1.5, 0.04, 1.02], [1.5, 0.04, 1.02], '3.0 m'));
    root.add(P.dimensionLine([-1.62, 0.04, -0.8], [-1.62, 0.04, 0.8], '1.6 m'));
    root.add(P.dimensionLine([1.66, 0.02, 0.85], [1.66, 1.8, 0.85], '1.8 m'));

    // 围栏板（后面与侧面封板，前面留观察）
    const shell = P.group({ name: 'shellPanels' });
    const backP = P.mesh(new THREE.BoxGeometry(2.9, 1.28, 0.02), mats.steelPaintDark, { p: [0, 0.92, -0.765] });
    shell.add(backP);
    for (const x of [-1.465, 1.465]) shell.add(P.mesh(new THREE.BoxGeometry(0.02, 1.28, 1.5), mats.steelPaintDark, { p: [x, 0.92, 0] }));
    P.setExplode(shell, [0, 0.25, -1], 1.0);
    box.add(shell);

    /* ---------------- 围岩 + 洞室群 ---------------- */
    const rock = P.group({ name: 'rock' });
    P.pickable(rock, '围岩相似材料（M10）', ['与围岩同配比浇筑', '剖切后可见洞室群与裂缝带']);
    root.add(rock);
    rock.add(P.mesh(new THREE.BoxGeometry(2.86, 1.56, 1.42), mats.rock, { p: [0, 0.88, 0], recv: true, cast: false }));
    const topSand = P.mesh(new THREE.BoxGeometry(2.84, 0.015, 1.4), mats.sand, { p: [0, 1.668, 0], cast: false, recv: true });
    rock.add(topSand);

    // UPVC 主洞室：四段 0.9 / 1.1 / 0.5 / 0.5
    const cavern = P.group({ name: 'cavern' });
    P.pickable(cavern, 'UPVC 主洞室', ['Φ400 × 3 m · 四段 0.9/1.1/0.5/0.5', '右栏编号或画布编号可飞近查看']);
    root.add(cavern);
    const CY = 0.85;
    const segs = [
      { x0: -1.5, len: 0.9 }, { x0: -0.6, len: 1.1 }, { x0: 0.5, len: 0.5 }, { x0: 1.0, len: 0.5 },
    ];
    const segCenters = [];
    for (const s of segs) {
      const c = s.x0 + s.len / 2;
      segCenters.push(c);
      const seg = P.mesh(new THREE.CylinderGeometry(0.2, 0.2, s.len - 0.05, 40, 1, true), mats.upvc, { p: [c, CY, 0], r: [0, 0, 90 * D], recv: true });
      cavern.add(seg);
      cavern.add(P.mesh(new THREE.CylinderGeometry(0.185, 0.185, s.len - 0.06, 36, 1, true), new THREE.MeshStandardMaterial({ color: 0x23282a, roughness: 0.9, side: THREE.BackSide }), { p: [c, CY, 0], r: [0, 0, 90 * D], cast: false }));
    }
    for (const x of [-0.6, 0.5, 1.0]) {
      cavern.add(P.mesh(new THREE.CylinderGeometry(0.212, 0.212, 0.07, 40), mats.upvc, { p: [x, CY, 0], r: [0, 0, 90 * D], recv: true }));
    }
    for (const x of [-1.49, 1.49]) {
      cavern.add(P.mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.035, 40), mats.upvc, { p: [x, CY, 0], r: [0, 0, 90 * D] }));
    }
    // 进口接头（左端盖）
    cavern.add(P.mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 12), mats.brass, { p: [-1.56, CY, 0], r: [0, 0, 90 * D] }));

    // 多尺度柔性小洞室（胶囊）：与主洞室壁间距精确 30 mm 岩桥
    // 主洞室 r=0.2；小洞室 r=0.12 → 中心 z = 0.2+0.03+0.12 = 0.35；r=0.08 → z = -0.31
    for (const sc of [{ z: 0.35, r: 0.12, len: 2.0 }, { z: -0.31, r: 0.08, len: 1.6 }]) {
      const cap = P.mesh(new THREE.CapsuleGeometry(sc.r, sc.len, 8, 24), mats.rubberSoft, { p: [-0.1, CY, sc.z], r: [0, 0, 90 * D], recv: true });
      cavern.add(cap);
      cavern.add(P.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 10), mats.brass, { p: [-0.1 - sc.len / 2 - sc.r - 0.02, CY, sc.z], r: [0, 0, 90 * D] }));
    }
    HS([-0.3, CY + 0.24, 0.05], 'UPVC 主洞室', ['Φ400 × 3 m · 四段 0.9/1.1/0.5/0.5', '第四段重复第一段（重复性检验）', '@UPVC cavern Φ400, four segments 0.9/1.1/0.5/0.5 m, 4th repeats 1st']);
    HS([-0.1, CY + 0.14, 0.35], '多尺度柔性小洞室', ['与主洞室平行布置', '洞间岩桥精确 30 mm（10×12×24 应变砖布设位置）',
      '@Multi-scale flexible caverns, 30 mm rock bridge to main cavern']);

    // 45° 预制裂缝板：四段各一组，斜置于洞顶围岩内（下缘触及洞顶，不切入空腔）
    const crackBands = P.group({ name: 'crackBands' });
    root.add(crackBands);
    const zonePlates = [4, 4, 2, 2];
    segCenters.forEach((c, zi) => {
      const n = zonePlates[zi];
      for (let i = 0; i < n; i++) {
        const px = c + (i - (n - 1) / 2) * 0.15;
        crackBands.add(P.mesh(new THREE.BoxGeometry(0.016, 0.62, 0.44), mats.concrete, {
          p: [px, 1.15, 0], r: [45 * D, 0, 0], cast: false,
        }));
        crackBands.add(P.mesh(new THREE.BoxGeometry(0.006, 0.62, 0.44), new THREE.MeshStandardMaterial({ color: 0x57503f, roughness: 0.95 }), {
          p: [px + 0.012, 1.15, 0], r: [45 * D, 0, 0], cast: false,
        }));
      }
    });
    HS([segCenters[1], 1.42, 0.05], '45° 预制裂缝带', [
      '裂缝板斜置 45°，缝面剪切起步（剪≈2×法向）',
      '角点最大主应力 ≈ 2.058 × 内压 → 裂缝带先裂、洞壁不裂',
      '四段四种裂缝构型，第三轮由数值模型确定角度',
      '@45° precast crack bands: shear-initiated, corner stress 2.058 × p',
    ], 'warn');

    /* ---------------- 应变砖 + 内埋测点 ---------------- */
    const bricks = P.group({ name: 'bricks' });
    root.add(bricks);
    const brickDefs = [
      [-0.7, CY, 0.215, [0.012, 0.024, 0.010], 'A1'], [0.0, CY, 0.215, [0.012, 0.024, 0.010], 'A2'], [0.7, CY, 0.215, [0.012, 0.024, 0.010], 'A3'],
      [segCenters[1] + 0.08, 1.18, 0.3, [0.015, 0.03, 0.015], 'B1'], [segCenters[1] - 0.1, 1.1, -0.3, [0.015, 0.03, 0.015], 'B2'],
      [-1.0, 1.58, 0.35, [0.02, 0.04, 0.02], 'C1'], [1.1, 1.58, -0.35, [0.02, 0.04, 0.02], 'C2'],
    ];
    for (const [x, y, z, size, name] of brickDefs) {
      const brick = P.strainBrick(mats, size, { label: name, rosetteAt: name.startsWith('B') });
      brick.position.set(x, y - size[1] / 2 + 0.01, z);
      bricks.add(brick);
    }
    // 应变砖引线 → 穿管 → 端子箱
    const conduit = P.group();
    root.add(conduit);
    conduit.add(P.cable([[0.9, 1.58, 0.35], [1.05, 1.71, 0.34], [1.2, 1.72, 0.32]], 0.004, mats.cableOrange));
    conduit.add(P.cable([[0.8, 1.12, -0.3], [1.0, 1.6, -0.32], [1.18, 1.72, 0.2]], 0.004, mats.cableOrange));
    conduit.add(P.cable([[0.0, 0.9, 0.215], [0.6, 1.66, 0.3], [1.2, 1.72, 0.3]], 0.004, mats.cableOrange));
    const tBox = P.terminalBox(mats, { w: 0.24, h: 0.15, d: 0.1 });
    tBox.position.set(1.28, 1.79, 0.3);
    root.add(tBox);
    HS(tBox, '应变砖 · 六联表', ['编号/坐标/方向/端子/通道/照片，埋设当天建', '72 通道：裂缝带 28 · 近壁 16 · 洞间 12 · 岩桥 4 · 远场 4 · 零漂 2 + 备用 6', '@Six-column wiring log, captured on embedding day']);

    /* ---------------- FBG / AE / LVDT / 温度 ---------------- */
    const fbg = P.group({ name: 'fbg' });
    root.add(fbg);
    fbg.add(P.fbgRun(mats, [[-1.4, CY + 0.202, 0], [0, CY + 0.202, 0], [1.4, CY + 0.202, 0], [1.42, 1.71, 0.1], [1.42, 1.73, 0.55]], { beads: 9, label: 'FBG-1' }));
    fbg.add(P.fbgRun(mats, [[-1.1, CY, 0.35 + 0.122], [0.9, CY, 0.472], [1.4, 1.71, 0.55]], { beads: 6 }));
    fbg.add(P.fbgRun(mats, [[-0.9, CY, -0.392], [0.7, CY, -0.392], [1.35, 1.71, -0.4]], { beads: 5 }));
    fbg.add(P.fbgRun(mats, [[-1.3, CY + 0.24, 0.215], [-0.3, CY + 0.24, 0.215], [0.7, CY + 0.24, 0.215], [1.38, 1.71, 0.3]], { beads: 6 }));
    HS([-0.6, CY + 0.28, 0.16], 'FBG 光纤链', ['4 线 · 39 栅点，沿程连续应变梯度', '与点式应变互补，耐潮湿',
      '@4 fiber lines, 39 FBG points, continuous strain gradient']);

    const ae = P.group({ name: 'ae' });
    root.add(ae);
    const aeSensors = [];
    const aePos = [
      [-1.05, 1.715, 0.2], [-0.05, 1.715, 0.2], [0.75, 1.715, 0.15], [1.25, 1.715, 0.2],
      [0.2, 1.715, -0.3], [-0.9, 1.715, -0.35], [1.3, 0.9, 0.55], [1.3, 0.9, -0.55],
    ];
    for (const [x, y, z] of aePos) {
      const s = P.aeSensor(mats);
      s.position.set(x, y, z);
      ae.add(s);
      aeSensors.push(s);
    }
    // AE 电缆 → 机箱
    ae.add(P.cable([[1.3, 1.72, 0.55], [1.5, 1.74, 0.9], [0.9, 1.76, 1.6], [0.45, 1.3, 2.35], [0.15, 0.94, 2.66]], 0.005, mats.cableGrey));
    HS([0.75, 1.8, 0.15], '声发射阵列', ['8 通道 · 微破裂弹性波', '起始时刻与定位；箱壁信号只作趋势，不单作判据',
      '@8-channel AE array: onset timing and location']);

    const lvdt1 = P.lvdt(mats);
    lvdt1.position.set(-1.62, CY, 0); lvdt1.rotation.z = 90 * D;
    root.add(lvdt1);
    const lvdt2 = P.lvdt(mats, { len: 0.07 });
    lvdt2.position.set(0.4, 1.715, -0.2); lvdt2.rotation.z = Math.PI;
    root.add(lvdt2);
    const tcTop = [];
    for (const [x, z] of [[-0.5, 0.5], [0.5, 0.4], [1.2, -0.5]]) {
      const tc = P.thermocouple(mats);
      tc.position.set(x, 1.715, z);
      root.add(tc);
      tcTop.push(tc);
    }

    /* ---------------- 内压加载系统（照片同款柜 + 泵 + 蓄能器） ---------------- */
    const loading = P.group({ name: 'loading' });
    root.add(loading);
    const cab = P.controlCabinet(mats);
    cab.position.set(-2.5, 0, 0.9); cab.rotation.y = 55 * D;
    loading.add(cab);
    const pump = P.pumpUnit(mats);
    pump.position.set(-2.5, 0, 0.15); pump.rotation.y = 90 * D;
    loading.add(pump);
    const acc = P.accumulator(mats);
    acc.position.set(-2.15, 0, 0.55);
    loading.add(acc);
    const jack = P.hydraulicJack(mats, { stroke: 0.18 });
    jack.position.set(-2.75, 0, 0.25); jack.rotation.y = -30 * D;
    loading.add(jack);

    // 管路：蓄能器 → P2 → 阀 → P1 → 主洞室
    const inletPanel = P.group({ p: [-1.86, 0.62, 0.45], name: 'inlet' });
    root.add(inletPanel);
    inletPanel.add(P.mesh(new THREE.BoxGeometry(0.06, 0.9, 0.05), mats.steelPaintDark, { p: [0, 0.15, 0] }));
    inletPanel.add(P.mesh(new THREE.BoxGeometry(0.4, 0.03, 0.16), mats.steelPaint, { p: [0.16, 0.62, 0] }));
    const pT1 = P.pressureTransmitter(mats, { label: 'P1' }); pT1.position.set(0.05, 0.635, 0); inletPanel.add(pT1);
    const pT2 = P.pressureTransmitter(mats, { label: 'P2' }); pT2.position.set(0.2, 0.635, 0); inletPanel.add(pT2);
    const mg = P.mechGauge(mats, { r: 0.042, maxLabel: '2.0' }); mg.position.set(-0.1, 0.66, 0); inletPanel.add(mg);
    const gv = P.gateValve(mats, { r: 0.03 }); gv.position.set(0.13, 0.5, 0); inletPanel.add(gv);
    loading.add(P.cable([[-2.05, 0.45, 0.55], [-1.95, 0.55, 0.5], [-1.83, 0.6, 0.47]], 0.011, mats.hoseBlue));
    loading.add(P.pipeRun([[-1.83, 0.62, 0.45], [-1.7, 0.75, 0.3], [-1.62, 0.85, 0.05], [-1.57, 0.85, 0]], 0.008, mats.steelMachined));
    HS([-1.86, 0.9, 0.45], 'P1 / P2 双通道测压', [
      'P1 在囊（洞）入口，P2 在隔离阀上游',
      'P1−P2 互为校核，区分腔内响应与管路渗漏',
      '另有机械表兜底 + 称重补水',
      '@Twin pressure lines P1/P2 cross-check cavity vs line seepage',
    ]);

    // 称重补水
    const scale = P.platformScale(mats);
    scale.position.set(-2.5, 0, -0.45);
    root.add(scale);
    const wt = P.waterTank(mats);
    wt.position.set(-2.5, 0.062, -0.45);
    root.add(wt);
    root.add(P.cable([[-2.42, 0.35, -0.4], [-2.1, 0.5, -0.1], [-1.87, 0.6, 0.4]], 0.008, mats.hoseBlue));
    HS([-2.5, 0.5, -0.45], '称重式补水', ['压降不敏感时的兜底判据', '体积法在微量渗漏不准，重量法分辨率高',
      '@Weighed make-up water as fallback leak evidence']);

    /* ---------------- 监测系统（照片同款：折叠桌 + 三本 + 机箱） ---------------- */
    const mon = P.group({ name: 'monitoring' });
    root.add(mon);
    const bench = P.workbench(mats, { w: 1.7, d: 0.6 });
    bench.position.set(0.35, 0, 2.5);
    mon.add(bench);
    const BY = 0.775;
    const lap1 = P.laptop(mats, screenTexture('strain')); lap1.position.set(-0.25, BY, 2.42); lap1.rotation.y = -160 * D; mon.add(lap1);
    // 实时屏：滚动绘制压力历史（传感器看到的加载史）
    const sc = document.createElement('canvas');
    sc.width = 512; sc.height = 320;
    const sg2 = sc.getContext('2d');
    const dynTex = new THREE.CanvasTexture(sc);
    dynTex.colorSpace = THREE.SRGBColorSpace;
    const hist = [];
    for (let i = 0; i < 150; i++) hist.push(0.05);
    let sampleAcc = 1;
    const drawScreen = () => {
      sg2.fillStyle = '#101214'; sg2.fillRect(0, 0, 512, 320);
      sg2.strokeStyle = '#1d2126';
      for (let x = 0; x < 512; x += 32) { sg2.beginPath(); sg2.moveTo(x, 0); sg2.lineTo(x, 320); sg2.stroke(); }
      for (let y = 0; y < 320; y += 32) { sg2.beginPath(); sg2.moveTo(0, y); sg2.lineTo(512, y); sg2.stroke(); }
      sg2.strokeStyle = '#d9ff58'; sg2.lineWidth = 2.5;
      sg2.beginPath();
      hist.forEach((val, i) => {
        const x = 14 + (i / (hist.length - 1)) * (512 - 30);
        const y = 300 - (val / 1.4) * 268;
        i === 0 ? sg2.moveTo(x, y) : sg2.lineTo(x, y);
      });
      sg2.stroke();
      sg2.fillStyle = '#d9ff58'; sg2.font = '600 15px monospace';
      sg2.fillText(`72CH LIVE · P = ${hist[hist.length - 1].toFixed(2)} MPa`, 14, 24);
      dynTex.needsUpdate = true;
    };
    drawScreen();
    lap1.userData.screen.material.map?.dispose?.();
    lap1.userData.screen.material.map = dynTex;
    const lap2 = P.laptop(mats, screenTexture('pressure')); lap2.position.set(0.3, BY, 2.55); lap2.rotation.y = -175 * D; mon.add(lap2);
    const lap3 = P.laptop(mats, screenTexture('ae')); lap3.position.set(0.85, BY, 2.44); lap3.rotation.y = -155 * D; mon.add(lap3);
    const daq = P.daqCase(mats, { label: 'DC-2042 · 72CH' }); daq.position.set(0.05, BY + 0.07, 2.72); daq.rotation.y = 180 * D; mon.add(daq);
    const luna = P.lunaHost(mats); luna.position.set(-0.62, BY + 0.055, 2.72); luna.rotation.y = 180 * D; mon.add(luna);
    const rm1 = P.remoteModule(mats); rm1.position.set(-0.35, BY + 0.016, 2.78); mon.add(rm1);
    const rm2 = P.remoteModule(mats); rm2.position.set(-0.18, BY + 0.016, 2.8); mon.add(rm2);
    const coil1 = P.cableCoil(mats, { r: 0.09 }); coil1.position.set(1.02, BY + 0.02, 2.75); coil1.rotation.x = 90 * D; mon.add(coil1);
    const coil2 = P.cableCoil(mats, { r: 0.075, turns: 6 }); coil2.position.set(1.25, BY + 0.018, 2.72); coil2.rotation.x = 90 * D; mon.add(coil2);
    const stool1 = P.stool(mats); stool1.position.set(-0.35, 0, 3.15); mon.add(stool1);
    const stool2 = P.stool(mats); stool2.position.set(0.55, 0, 3.2); mon.add(stool2);
    // 光纤/电缆下桌 → 上箱
    mon.add(P.cable([[0.6, 0.02, 2.3], [0.9, 0.02, 1.8], [1.35, 0.5, 1.0], [1.42, 1.74, 0.55]], 0.006, mats.fbYellow));
    mon.add(P.cable([[0.2, 0.02, 2.35], [0.5, 0.02, 1.9], [1.3, 0.6, 1.1], [1.38, 1.72, 0.5]], 0.008, mats.cableGrey));
    mon.add(P.cable([[-0.1, 0.02, 2.4], [0.3, 0.02, 2.0], [1.25, 0.7, 1.2], [1.28, 1.7, 0.35]], 0.007, mats.cableOrange));
    HS([0.35, 1.05, 2.55], '监测系统', [
      '3 台工作站 + 72 通道静态应变 + LUNA 解调 + AE 采集',
      '全场统一时基：时间对不齐，响应时序就没法用',
      '@One time base: 72 strain ch + FBG + AE, synchronised']);
    HS([-0.62, BY + 0.2, 2.72], '光纤解调仪', ['BOTDA / FBG 双链路', '下单前确认波段与接口（采购纪律三条之一）',
      '@Fiber interrogator (LUNA ODiSI class)']);

    // 信号流：光点沿光缆/电缆向采集端流动
    const fbgFlow = P.signalFlow(mats, [[-1.4, CY + 0.202, 0], [1.4, CY + 0.202, 0], [1.42, 1.73, 0.55], [0.9, 1.75, 1.6], [-0.3, 1.2, 2.5], [-0.62, 0.92, 2.68]], { color: 0xe8d44d, count: 4, speed: 0.05, tubeMat: mats.fbYellow });
    root.add(fbgFlow);
    const aeFlow = P.signalFlow(mats, [[1.25, 1.715, 0.2], [1.3, 1.72, 0.55], [0.9, 1.76, 1.6], [0.45, 1.2, 2.2], [0.2, 0.92, 2.62]], { color: 0xd9ff58, count: 3, speed: 0.07 });
    root.add(aeFlow);
    const strFlow = P.signalFlow(mats, [[1.28, 1.79, 0.3], [1.2, 1.72, 0.32], [0.9, 1.4, 1.7], [0.4, 1.0, 2.3], [0.1, 0.9, 2.6]], { color: 0xc96a2a, count: 3, speed: 0.06 });
    root.add(strFlow);

    /* ---------------- 摄像与场地 ---------------- */
    const cam = P.cctvCamera(mats);
    cam.position.set(2.7, 0, 2.0); cam.rotation.y = -125 * D;
    root.add(cam);
    // 现场道具：灭火器 / 锥桶 / 插线板 / 定位胶带
    const ext = P.fireExtinguisher(mats); ext.position.set(-3.25, 0, 1.65); ext.rotation.y = 25 * D; root.add(ext);
    const cone = P.trafficCone(mats); cone.position.set(2.95, 0, -1.05); root.add(cone);
    const strip = P.powerStrip(mats); strip.position.set(1.75, 0.002, 3.05); root.add(strip);
    for (const [tx, tz] of [[-1.7, -0.95], [1.7, -0.95], [-1.7, 0.95], [1.7, 0.95]]) {
      const tape = P.floorTapeX(mats); tape.position.set(tx, 0.004, tz); root.add(tape);
    }

    /* ---------------- 标签 ---------------- */
    const labels = [
      [[0, 2.12, 0], ['模型箱 3.0 × 1.6 × 1.8 m', '相似比 10:1 · 8.64 m³']],
      [[-0.95, 1.32, 0.4], ['UPVC 主洞室 Φ400 × 3 m', '四段 0.9 / 1.1 / 0.5 / 0.5']],
      [[segCenters[1] + 0.15, 1.55, -0.25], ['45° 预制裂缝带', '角点应力 2.058 × 内压']],
      [[0.42, 1.05, 0.55], ['多尺度柔性小洞室', '洞间岩桥 30 mm']],
      [[0.35, 1.32, 2.5], ['监测系统', '72 CH · FBG · AE · 统一时基']],
      [[-2.4, 1.25, 0.75], ['内压加载系统', '0.4 – 1.2 MPa · 四档速率']],
    ];
    for (const [pos, text] of labels) {
      const sp = P.labelSprite(text, { size: 0.085 });
      sp.position.set(...pos);
      root.add(sp);
    }

    /* ---------------- 动画元素 ---------------- */
    // 近洞壁应变热区（4 环）
    // 应力集中可视化：洞壁环（1.1677p，蓝）vs 裂缝带环（2.058p，酸绿先亮）
    const heatRings = [];
    const wallRings = [];
    const heatMat = new THREE.MeshBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    heatMat.userData.local = true;
    const wallMat = new THREE.MeshBasicMaterial({ color: 0x5ab8ff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    wallMat.userData.local = true;
    for (const c of segCenters) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.008, 8, 48), heatMat);
      ring.position.set(c, CY, 0); ring.rotation.y = 90 * D;
      root.add(ring); heatRings.push(ring);
      const wr = new THREE.Mesh(new THREE.TorusGeometry(0.212, 0.006, 8, 48), wallMat);
      wr.position.set(c, CY, 0); wr.rotation.y = 90 * D;
      root.add(wr); wallRings.push(wr);
    }
    // 应力流：内压升高时应力从洞壁流向裂缝带
    const stressFlows = [];
    for (const c of segCenters) {
      const f = P.signalFlow(mats, [[c, CY + 0.14, 0.1], [c, CY + 0.24, 0.06], [c, 1.08, 0.02], [c, 1.18, 0]], { color: 0xd9ff58, count: 2, speed: 0.3, dotR: 0.005, tubeR: 0.0008 });
      root.add(f);
      stressFlows.push(f);
    }
    // 起裂辉光 + 扩散涟漪
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff8a5a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    glowMat.userData.local = true;
    const glow = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.014, 8, 48), glowMat);
    glow.position.set(segCenters[1], CY, 0); glow.rotation.y = 90 * D;
    root.add(glow);
    const rippleMat = new THREE.MeshBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    rippleMat.userData.local = true;
    const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.004, 6, 48), rippleMat);
    ripple.position.set(segCenters[1], CY, 0); ripple.rotation.y = 90 * D;
    root.add(ripple);
    // AE 事件闪光
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    flashMat.userData.local = true;
    const flashes = aePos.map(([x, y, z]) => {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), flashMat);
      f.position.set(x, y + 0.02, z); f.visible = false;
      root.add(f);
      return f;
    });

    /* ---------------- 压力曲线：斜坡 + 保压 + 循环（与真实加载程序一致） ---------------- */
    const ramp = (t, t0, t1, a, b) => a + (b - a) * Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    const pressureAt = (t) => {
      if (t < 0.05) return ramp(t, 0, 0.05, 0.05, 0.5);              // 加载到预压
      if (t < 0.16) return 0.5;                                       // 预压保压
      if (t < 0.2) return ramp(t, 0.16, 0.2, 0.5, 0.6);               // 斜坡进入基准循环
      if (t < 0.38) { const f = (t - 0.2) / 0.18; return 0.6 + Math.sin(f * Math.PI * 4) * 0.2; }    // 基准循环
      if (t < 0.62) { const f = (t - 0.38) / 0.24; return 0.6 + Math.sin(f * Math.PI * 10) * 0.25; } // 四档速率
      if (t < 0.66) return ramp(t, 0.62, 0.66, 0.6, 0.8);             // 斜坡进入上限循环
      if (t < 0.88) { const f = (t - 0.66) / 0.22; return 0.8 + Math.sin(f * Math.PI * 20) * 0.4; }  // 上限循环
      if (t < 0.92) return ramp(t, 0.88, 0.92, 0.8, 1.02);            // 斜坡到起裂判据
      if (t < 0.96) return 1.02;                                      // 起裂保持
      return ramp(t, 0.96, 1, 1.02, 0.9);                             // 起裂后应力跌落（承载转移）
    };

    // 顶面测点随顶盖爆开（attach 保持世界变换）
    for (const o of [tBox, lvdt2, ...tcTop, ...aeSensors.slice(0, 6)]) cover.attach(o);

    return {
      root,
      hotspots,
      readout: (t, stage) => ({ pressure: `${pressureAt(t).toFixed(2)} MPa`, note: stage?.label || '' }),
      update(t, dt) {
        const p = pressureAt(t);
        // 机械表指针 + 控制柜数显 + 泵运转 + 信号流
        mg.userData.needle.rotation.z = D * (130 - 260 * (p / 2));
        sampleAcc += dt;
        if (sampleAcc > 0.05) {
          sampleAcc = 0;
          hist.push(p);
          if (hist.length > 150) hist.shift();
          drawScreen();
        }
        cab.userData.setDigits(p.toFixed(2));
        pump.userData.spin.rotation.x -= dt * 16;
        fbgFlow.userData.update(dt, true);
        aeFlow.userData.update(dt, true);
        strFlow.userData.update(dt, true);
        // 应力集中：裂缝带（2.058p）先于洞壁（1.1677p）达到峰值
        const strain = THREE.MathUtils.clamp((p - 0.4) / 0.8, 0, 1);
        heatMat.opacity = 0.06 + Math.min(1, strain * 1.4) * 0.42;
        wallMat.opacity = 0.05 + strain * 0.22;
        for (const f of stressFlows) f.userData.update(dt, p > 0.15, 0.4 + strain);
        // 起裂
        const initiating = p > 0.97;
        glowMat.opacity = initiating ? 0.35 + 0.25 * Math.sin(t * 90) : 0;
        // 起裂瞬间：试验台轻微震颤
        if (initiating) root.position.set((Math.random() - 0.5) * 0.008, (Math.random() - 0.5) * 0.006, (Math.random() - 0.5) * 0.008);
        else root.position.set(0, 0, 0);
        if (initiating) {
          refs.rippleK += dt * 1.4;
          if (refs.rippleK > 1.6) refs.rippleK = 0.9;
          ripple.scale.setScalar(refs.rippleK);
          rippleMat.opacity = 0.5 * (1.6 - refs.rippleK) / 0.7;
        } else rippleMat.opacity = 0;
        // AE 随机事件，压强越高越密
        refs.aeFlashT -= dt;
        if (refs.aeFlashT <= 0) {
          refs.aeFlashT = Math.max(0.12, 1.4 - p * 0.9) * (0.6 + Math.random() * 0.8);
          flashes.forEach((f) => (f.visible = false));
          const f = flashes[(Math.random() * flashes.length) | 0];
          f.visible = true;
          f.userData.k = 1;
        }
        for (const f of flashes) {
          if (!f.visible) continue;
          f.userData.k -= dt * 3.2;
          flashMat.opacity = Math.max(0, f.userData.k) * 0.8;
          if (f.userData.k <= 0) f.visible = false;
        }
      },
    };
  },
};
