// 场景四：废弃矿硐储库围岩劣化大型模型试验平台（NSFC 区域创新发展联合基金）
// 交变荷载下的劣化、疲劳与气密性能。
import * as THREE from 'three';
import * as P from '../parts.js';
import { screenTexture } from '../materials.js';

const D = Math.PI / 180;

export default {
  id: 'mine',
  n: '04',
  titleCn: '废弃矿硐储库试验平台',
  titleEn: 'Abandoned-Mine CAES Test Platform',
  kicker: '科研工程 / 可靠性评价 · NSFC 联合基金 · 技术骨干',
  desc: '为废弃矿硐压缩空气储库搭建的围岩劣化大型模型试验平台：不规则矿硐形态 + 衬砌，交变荷载（幅值 / 频率 / 循环次数）可控，同步监测力学响应、疲劳损伤与裂缝分布，服务运行与可靠性评价。',
  principle: '原理一句话：交变荷载累积疲劳损伤——裂缝随循环扩展，最终考验衬砌气密性。',
  facts: [
    ['项目', 'NSFC 区域创新发展联合基金'],
    ['对象', '废弃矿硐 + 衬砌储库'],
    ['荷载', '交变（幅值/频率/循环）'],
    ['监测', '力学响应 · 损伤演化'],
    ['关注', '劣化 / 疲劳 / 裂缝分布'],
    ['产出', '运行参数与可靠性评价'],
  ],
  stages: [
    { at: 0.0, label: '初次加压', sub: '建立运行压力区间' },
    { at: 0.2, label: '交变循环', sub: '幅值 · 频率 · 循环次数', },
    { at: 0.55, label: '疲劳损伤累积', sub: '裂缝萌生 · 分布扩展', warn: true },
    { at: 0.8, label: '气密性评价', sub: '衬砌缺陷渗漏可视化' },
  ],
  view: { pos: [3.4, 2.6, 3.8], target: [0, 0.85, 0] },
  features: { explode: true, clip: 'z', clipRange: [-0.8, 0.8] },
  clipDefault: { axis: 'z', pos: 0.34 },
  readoutLabel: '硐内压 · 交变荷载',
  principleTree: {
    title: '劣化-气密链 · 交变荷载的后果',
    focus: 3, clip: { axis: 'z', pos: 0.34 }, timeline: 0.7,
    nodes: [
      { label: '交变荷载', sub: '幅值 / 频率 / 循环' },
      { label: '疲劳累积', sub: '损伤随循环增长' },
      { label: '裂缝萌生扩展', sub: '衬砌面可见', warn: true },
      { label: '衬砌缺陷贯通', sub: '密封路径打开', warn: true },
      { label: '气密失效', sub: '渗漏可视化' },
      { label: '可靠性评价', sub: '运行参数优化' },
    ],
  },
  clipLegend: ['衬砌内表面与钢拱架', '两硐联络巷', '疲劳裂缝（衬砌面，随循环扩展）'],
  // 阶段 → 观测测点（初次加压/交变→框架 · 疲劳→FBG+AE · 气密→衬砌评价）
  stageHotspots: [0, 0, 3, 4],
  steps: [
    { title: '废弃矿硐为何能储气', sub: '现成洞室 + 密封衬砌 = 最低成本储库',
      detail: ['矿硐形态不规则——受力与圆形洞室完全不同', '本平台复现两硐一联 + 钢拱架 + 衬砌的实际支护', '交变荷载下围岩劣化与气密性是两大核心问题'],
      view: { pos: [4.2, 3.1, 4.6], target: [0, 0.85, 0] }, clip: { axis: 'z', pos: 0.34 }, timeline: 0 },
    { title: '两硐一联', sub: '主硐 + 副硐 + 联络巷',
      detail: ['硐间岩柱应力叠加是设计关键', '衬砌 + 钢拱架按矿硐实际支护复现', '联络巷是施工与运行的真实通道'],
      focus: 2, clip: { axis: 'z', pos: 0.34 }, timeline: 0 },
    { title: '交变加载', sub: '幅值 · 频率 · 循环次数',
      detail: ['4 台伺服作动器 + 侧向约束自平衡体系', '幅值 / 频率 / 循环次数程序控制，速率分档对比', '加载史就是储库数十年的运行缩影（正在播放）'],
      focus: 0, clip: { axis: 'z', pos: 0.34 }, timeline: 0.3, play: true },
    { title: '疲劳损伤累积', sub: '裂缝随循环萌生扩展', tree: true,
      detail: ['FBG 沿程梯度 + AE 定位逐循环追踪', '衬砌上的红色裂纹随循环数扩展（观看衬砌面）', '损伤演化直接写进可靠性评价'],
      focus: 3, clip: { axis: 'z', pos: 0.34 }, timeline: 0.7 },
    { title: '气密失效', sub: '衬砌缺陷 → 渗漏可视化',
      detail: ['缺陷点渗漏粒子可见——气密性能决定能否投运', '劣化 / 疲劳 / 裂缝分布 + 气密性 = 可靠性评价输入'],
      focus: 4, clip: { axis: 'z', pos: 0.34 }, timeline: 0.92 },
    { title: '产出', sub: '运行参数与可靠性评价',
      detail: ['试验结果直接支撑储库实际运行参数优化', '可靠性评价方法可迁移到任何废弃矿硐储库'],
      focus: 3, clip: { axis: 'z', pos: 0.34 }, timeline: 0.92 },
  ],

  build({ mats }) {
    const root = new THREE.Group();
    const hotspots = [];
    const HS = (at, title, lines, tone) => hotspots.push({ at, title, lines, tone });

    /* ---------------- 反力框架 ---------------- */
    const frame = P.group({ name: 'frame' });
    root.add(frame);
    P.pickable(frame, '交变加载框架', ['4 台伺服作动器 + 侧向约束']);
    for (const x of [-1.15, 1.15]) {
      frame.add(P.mesh(new THREE.BoxGeometry(0.14, 2.0, 0.14), mats.steelPaintDark, { p: [x, 1.0, 0] }));
      for (const z of [-0.7, 0.7]) frame.add(P.mesh(new THREE.BoxGeometry(0.12, 0.1, 1.5), mats.steelPaintDark, { p: [x, 0.05, 0] }));
    }
    frame.add(P.mesh(new THREE.BoxGeometry(2.6, 0.16, 0.2), mats.steelPaintDark, { p: [0, 2.06, 0] }));
    frame.add(P.mesh(new THREE.BoxGeometry(2.6, 0.2, 0.24), mats.steelPaint, { p: [0, 0.14, 0], recv: true }));
    // 顶部 4 台伺服作动器压岩块
    const actuators = [];
    for (const x of [-0.75, -0.25, 0.25, 0.75]) {
      const jack = P.hydraulicJack(mats, { stroke: 0.16, r: 0.06 });
      jack.position.set(x, 1.75, 0);
      jack.rotation.x = Math.PI;
      frame.add(jack);
      actuators.push(jack);
      frame.add(P.mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 20), mats.steelMachined, { p: [x, 1.42, 0] }));
    }
    HS([0, 2.2, 0], '交变加载框架', ['4 台伺服作动器 + 侧向约束', '幅值 / 频率 / 循环次数程序控制', '加载速率分档对比',
      '@4 servo actuators: amplitude / frequency / cycles']);
    HS([0, 1.98, 0], '反力横梁', ['与立柱形成自平衡反力体系',
      '@Self-balancing reaction frame']);

    /* ---------------- 岩块 + 不规则矿硐群 ---------------- */
    const rock = P.group({ name: 'rock' });
    root.add(rock);
    P.pickable(rock, '矿硐群岩体模型', ['两硐一联 · 衬砌 + 钢拱架']);
    rock.add(P.mesh(new THREE.BoxGeometry(2.1, 1.34, 1.36), mats.rock, { p: [0, 0.91, 0], recv: true }));
    // 不规则矿硐 ×2（椭圆断面 + 联络巷），内衬砌
    const rooms = [
      { z: 0.33, ry: 0.24, rz: 0.2, len: 1.9 },
      { z: -0.35, ry: 0.2, rz: 0.16, len: 1.9 },
    ];
    for (const r of rooms) {
      const voidM = new THREE.MeshStandardMaterial({ color: 0x191b1d, roughness: 0.95, side: THREE.BackSide });
      voidM.userData.local = true;
      const cav = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, r.len, 36, 1, false), voidM);
      cav.position.set(0, 0.72, r.z);
      cav.rotation.z = 90 * D;
      cav.scale.set(r.rz, 1, r.ry);
      rock.add(cav);
      // 衬砌（亮一层，BackSide 内表面 + 外表面薄壳）
      const lining = new THREE.Mesh(
        new THREE.CylinderGeometry(1.02, 1.02, r.len - 0.04, 36, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xb3aca0, roughness: 0.85, side: THREE.DoubleSide })
      );
      lining.userData.local = true;
      lining.position.copy(cav.position); lining.rotation.copy(cav.rotation); lining.scale.copy(cav.scale);
      rock.add(lining);
      // 钢拱架
      for (let i = 0; i < 7; i++) {
        const x = -0.8 + i * 0.27;
        const arch = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.018, 8, 28, Math.PI), mats.steelPaintDark);
        arch.position.set(x, 0.72, r.z);
        arch.scale.set(r.rz * 1.02, r.ry * 1.02, 1);
        arch.rotation.y = 90 * D;
        rock.add(arch);
      }
      // 联络巷（连接两硐）
      const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.36, 20), voidM);
      cross.position.set(0.2, 0.72, 0);
      cross.rotation.x = 90 * D;
      rock.add(cross);
    }
    // 端部约束
    for (const x of [-1.12, 1.12]) {
      rock.add(P.mesh(new THREE.BoxGeometry(0.06, 1.3, 1.32), mats.steelPaintDark, { p: [x, 0.91, 0] }));
    }
    // 硐内补光（剖切后内壁可读）
    for (const z of [0.33, -0.35]) {
      const pl = new THREE.PointLight(0xfff2d8, 1.4, 2.2, 1.6);
      pl.position.set(0, 1.0, z);
      root.add(pl);
    }
    HS([0, 0.72, 0.55], '不规则矿硐 + 衬砌', ['两硐一联：主硐 + 副硐 + 联络巷', '钢拱架 + 衬砌支护，复现矿硐实际形态', '衬砌缺陷是气密性评价的关键路径',
      '@Two rooms + cross adit, steel arches + lining']);

    /* ---------------- 监测 ---------------- */
    const mon = P.group({ name: 'monitoring' });
    root.add(mon);
    // FBG 网格（衬砌表面沿程）
    mon.add(P.fbgRun(mats, [[-0.85, 0.72, 0.33 + 0.245], [-0.3, 0.72, 0.572], [0.3, 0.72, 0.572], [0.85, 0.72, 0.55]], { beads: 8 }));
    mon.add(P.fbgRun(mats, [[-0.85, 0.72, -0.35 - 0.205], [0, 0.72, -0.565], [0.85, 0.72, -0.5]], { beads: 7 }));
    mon.add(P.fbgRun(mats, [[0.2, 0.72, 0.1], [0.2, 0.72, -0.12]], { beads: 2 }));
    // AE 阵列（岩面）
    const aePos = [[-0.7, 1.6, 0.25], [0, 1.6, 0.25], [0.7, 1.6, 0.25], [-0.35, 1.6, -0.25], [0.35, 1.6, -0.25], [0.9, 1.6, 0]];
    const aeFlashMeshes = [];
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    flashMat.userData.local = true;
    for (const [x, y, z] of aePos) {
      const s = P.aeSensor(mats);
      s.position.set(x, y + 0.02, z);
      mon.add(s);
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), flashMat);
      f.position.set(x, y + 0.05, z); f.visible = false;
      mon.add(f);
      aeFlashMeshes.push(f);
    }
    // 应变砖预埋（裂缝带）
    for (const [x, z] of [[-0.5, 0.62], [0.45, 0.62], [0.1, -0.58]]) {
      const b = P.strainBrick(mats, [0.015, 0.03, 0.015], { label: 'F' + ((x * 10) | 0) });
      b.position.set(x, 1.28, z);
      mon.add(b);
    }
    HS([-0.4, 1.72, 0.25], 'FBG + AE 阵列', ['衬砌沿程应变梯度 + 微破裂定位', '疲劳损伤演化逐循环追踪',
      '@FBG gradient + AE array track fatigue per cycle']);

    // 信号流：液压油路脉动
    const oilFlow = P.signalFlow(mats, [[-1.6, 0.45, 0.5], [-1.3, 0.6, 0.3], [-1.15, 1.5, 0], [-0.9, 1.62, 0]], { color: 0x8fd0f0, count: 3, speed: 0.08, tubeR: 0.001 });
    root.add(oilFlow);

    /* ---------------- 泵站与采集 ---------------- */
    const cab = P.controlCabinet(mats, { label: '交变加载' });
    cab.position.set(-1.85, 0, 0.6); cab.rotation.y = 50 * D;
    root.add(cab);
    root.add(P.cable([[-1.6, 0.45, 0.5], [-1.3, 0.6, 0.3], [-1.15, 1.5, 0], [-0.9, 1.62, 0]], 0.012, mats.hoseBlack));
    const bench = P.workbench(mats, { w: 1.2, d: 0.55 });
    bench.position.set(1.75, 0, 0.5); bench.rotation.y = -35 * D;
    root.add(bench);
    const lap = P.laptop(mats, screenTexture('strain'));
    lap.position.set(-0.2, 0.775, 0.02);
    lap.rotation.y = 145 * D;
    bench.add(lap);
    const daq = P.daqCase(mats, { w: 0.32, label: 'FATIGUE · N' });
    daq.position.set(0.3, 0.845, 0.06);
    daq.rotation.y = 155 * D;
    bench.add(daq);
    root.add(P.cable([[1.2, 0.02, 0.45], [1.0, 0.6, 0.3], [0.95, 1.65, 0.25]], 0.006, mats.cableGrey));
    const ext = P.fireExtinguisher(mats); ext.position.set(2.75, 0, 1.75); ext.rotation.y = -35 * D;
    root.add(ext);
    const cone = P.trafficCone(mats); cone.position.set(-1.0, 0, 1.75); root.add(cone);
    for (const [tx, tz] of [[-1.3, -0.85], [1.3, -0.85], [-1.3, 0.85], [1.3, 0.85]]) {
      const tape = P.floorTapeX(mats); tape.position.set(tx, 0.004, tz); root.add(tape);
    }

    /* ---------------- 疲劳裂缝（程序化裂纹纹理，衬砌面） ---------------- */
    const crackMat = mats.crack;
    crackMat.opacity = 0;
    const crackPatches = [];
    // 裂缝贴在两硐衬砌内表面（朝硐内空腔；默认剖切 pos=0.34 时前硐空腔侧可见）
    for (const [x, z, ry] of [[-0.6, 0.132, 5], [-0.1, 0.136, -12], [0.5, 0.13, 20], [0.78, 0.128, -8], [0.2, -0.152, 172], [-0.35, -0.153, 190], [0.75, -0.548, -6], [-0.7, -0.545, 12]]) {
      const patch = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.1), crackMat);
      patch.position.set(x, 0.72 + (Math.random() - 0.5) * 0.1, z);
      patch.rotation.set(0, (ry * D), (Math.random() - 0.5) * 0.7);
      root.add(patch);
      crackPatches.push(patch);
    }
    // 气密渗漏可视化（缺陷点）
    const leakN = 90;
    const leakPos = new Float32Array(leakN * 3);
    const leakVel = [];
    for (let i = 0; i < leakN; i++) { leakPos[i * 3 + 1] = -1; leakVel.push(new THREE.Vector3()); }
    const leakGeo = new THREE.BufferGeometry();
    leakGeo.setAttribute('position', new THREE.BufferAttribute(leakPos, 3));
    const leakMat = new THREE.PointsMaterial({ color: 0x8fd9a0, size: 0.014, transparent: true, opacity: 0.75, depthWrite: false });
    leakMat.userData.local = true;
    const leak = new THREE.Points(leakGeo, leakMat);
    root.add(leak);

    for (const [pos, text] of [
      [[0, 2.5, 0], ['交变加载', '幅值 / 频率 / 循环次数']],
      [[0, 1.05, 0.75], ['矿硐群模型', '衬砌 + 钢拱架 + 联络巷']],
      [[1.75, 1.2, 0.5], ['疲劳损伤追踪', '裂缝分布 · 气密性']],
    ]) {
      const sp = P.labelSprite(text, { size: 0.08 });
      sp.position.set(...pos);
      root.add(sp);
    }
    HS([0.2, 0.75, 0.62], '气密性评价', ['衬砌缺陷渗漏可视化', '支撑储库实际运行与可靠性评价',
      '@Lining-defect leakage visualised for gas tightness']);

    let flashT = 0;
    return {
      root,
      hotspots,
      readout: (t, stage) => ({ pressure: `${(0.4 + 0.4 * (0.5 + 0.5 * Math.sin(t * Math.PI * 8))).toFixed(2)} MPa · 第 ${Math.round(t * 48)} 循`, note: stage?.label || '' }),
      update(t, dt) {
        oilFlow.userData.update(dt, true);
        const cyc = t * 22;
        // 作动器随循环微动
        actuators.forEach((a, i) => {
          a.children[1].position.y = 0.16 + Math.sin(cyc + i * 0.8) * 0.012;
        });
        // 疲劳裂缝随循环数扩展（裂纹纹理渐显）
        const fat = THREE.MathUtils.smoothstep(t, 0.35, 0.8);
        crackMat.opacity = fat * (0.85 + 0.15 * Math.sin(t * 60));
        // AE 事件随损伤加密
        flashT -= dt;
        if (flashT <= 0) {
          flashT = Math.max(0.15, 1.6 - t * 1.7) * (0.6 + Math.random() * 0.8);
          aeFlashMeshes.forEach((f) => (f.visible = false));
          const f = aeFlashMeshes[(Math.random() * aeFlashMeshes.length) | 0];
          f.visible = true; f.userData.k = 1;
        }
        for (const f of aeFlashMeshes) {
          if (!f.visible) continue;
          f.userData.k -= dt * 3;
          flashMat.opacity = Math.max(0, f.userData.k) * 0.85;
          if (f.userData.k <= 0) f.visible = false;
        }
        // 气密渗漏粒子（后期出现）
        const leakOn = t > 0.8;
        leak.visible = leakOn;
        if (leakOn) {
          const arr = leak.geometry.attributes.position;
          for (let i = 0; i < arr.count; i++) {
            const v = leakVel[i];
            arr.array[i * 3] += v.x * dt;
            arr.array[i * 3 + 1] += v.y * dt;
            arr.array[i * 3 + 2] += v.z * dt;
            v.y -= dt * 0.6;
            if (arr.array[i * 3 + 1] < 0.02 || Math.random() < 0.01) {
              arr.array[i * 3] = 0.2 + (Math.random() - 0.5) * 0.02;
              arr.array[i * 3 + 1] = 0.62;
              arr.array[i * 3 + 2] = 0.52;
              v.set((Math.random() - 0.5) * 0.25, 0.35 + Math.random() * 0.4, 0.35 + Math.random() * 0.3);
            }
          }
          arr.needsUpdate = true;
        }
      },
    };
  },
};
