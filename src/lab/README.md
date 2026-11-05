# /lab 三维试验室 — 架构说明

把五套试验方案按 1:1 尺寸程序化建模的 Three.js 展示层。无外部模型/贴图资源，全部代码生成。

## 文件结构

```
src/lab/
├── engine.js        渲染引擎（单例）：灯光/环境、OrbitControls、
│                    剖切（局部裁剪+切入补间+指示面）、爆炸补间、
│                    对象拾取（信息卡+OBB 选中框）、热点标注（CSS2D）、
│                    时间轴/读数回传、阶段叙述、rAF+节流兜底循环
├── materials.js     程序化材质与纹理（PBR + 凹凸/粗糙度图）、
│                    文本/仪表盘/屏幕/裂纹等 canvas 贴图工厂
├── parts.js         公共部件库（约 40 个工厂）：传感器家族、仪器、
│                    管路阀件、泵站、结构件、道具、尺寸标注线、信号流
├── LabPage.jsx      /lab 页面：场景页签、HUD（读数/控制/时间轴/图例）、
│                    右栏（参数/测点列表/原理卡）、深链与快捷键
└── scenes/
    ├── multiscale.js  场景一：多尺度洞室循环内压试验台（10:1）
    ├── sealing.js     场景二：20 MPa 柔性密封试验（含第一轮回放）
    ├── hongan.js      场景三：100:1 缩尺热循环试验
    ├── mine.js        场景四：废弃矿硐储库试验平台（默认剖切）
    └── soiltank.js    场景五：土箱渗漏侵蚀孪生（默认剖切 + 六段物理）
```

## 场景模块约定

每个场景默认导出：

```js
{
  id, n, titleCn, titleEn, kicker,
  desc, principle,            // 介绍 + 原理一句话
  facts: [[k, v], ...],       // 右栏参数卡
  stages: [{ at, label, sub, warn? }],   // 时间轴阶段（at 为 0–1 进度）
  stageHotspots: [i, ...],    // 阶段 → 观测测点（播放时自动高亮叙述）
  view: { pos, target },      // 默认相机
  features: { explode, clip, clipRange },
  clipDefault: { axis, pos }, // 可选：进入场景即剖开
  clipLegend: [..],           // 剖切图例
  options: [{ id, label, default }],  // 场景开关（如第一轮回放）
  build({ THREE, mats, viewer }) {
    return {
      root,                    // THREE.Group 场景根
      hotspots: [{ at, title, lines, tone? }],  // at: [x,y,z] 或 Object3D
      setOption(id, val),      // 可选：响应 options
      readout: (t, stage) => ({ pressure, note }),
      update(t, dt, ui),       // 每帧：动画逻辑（dt 已按 0.05 钳制）
    };
  },
}
```

## 关键机制

- **拾取**：部件用 `P.pickable(obj, title, lines)` 挂元数据；引擎悬停/点击射线拾取，
  信息卡 + 定向选中框（世界 AABB → 局部 → 角点回世界，贴合旋转姿态）。
- **爆炸**：`P.setExplode(obj, dir, dist)`；引擎主循环向 `_explodeTarget` 补间；
  `userData.isDim` 的对象（尺寸标注线）在爆炸时自动隐藏。
- **剖切**：`viewer.setClip({ enabled, axis, pos })` 只作用于场景本体（地面/网格豁免）；
  `userData.local = true` 的材质会被引擎在场景销毁时回收。
- **信号流**：`P.signalFlow(mats, points, opts)` 返回带 `userData.update(dt, active, speedMul)`
  的光点组，在场景 update 中驱动。
- **快照**：`viewer.snapshot()` 同步渲染一帧并返回 dataURL（截图导出即基于此）。

## 已知取舍

- 剖切面双面盖板（stencil caps）需要全部网格水密 + 双份材质渲染；
  现有几何大量使用开口圆柱（内衬/洞室断面靠 BackSide 表现），收益/风险比不划算，明确不做。
- 静态网格合批（matrixAutoUpdate 冻结/mergeGeometries）未做：桌面端帧率充裕，
  若未来移动端吃紧，优先合并模型箱格构与螺栓阵列。
