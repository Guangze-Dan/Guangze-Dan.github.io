// Lab 渲染引擎：灯光、环境、控制器、剖切、爆炸、热点标注、时间轴动画。
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildMaterials, makeBackdrop } from './materials.js';
import { getLang } from '../lang.js';
import { LAB_EN, enLines } from './scene-en.js';

const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export class LabViewer {
  constructor(container, { onHotspot, onReadout, onStage, onTourEnd, onClipChange, onStepEnter, onPlayChange, onTourStep, onLockChange } = {}) {
    this.container = container;
    this.onHotspot = onHotspot || (() => {});
    this.onReadout = onReadout || (() => {});
    this.onStage = onStage || (() => {});
    this.onTourEnd = onTourEnd || (() => {});
    this.onClipChange = onClipChange || (() => {});
    this.onStepEnter = onStepEnter || (() => {});
    this.onPlayChange = onPlayChange || (() => {});
    this.onTourStep = onTourStep || (() => {});
    this.onLockChange = onLockChange || (() => {});
    this.lockedAt = null; // 聚焦锁定点（点小数字/设备推近后非空），用于"返回宏观"按钮

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.clippingPlanes = [];
    this.renderer.localClippingEnabled = true;
    this._clipTargets = null;   // 剖切白名单（本体组）
    this._autoClip = false;     // 聚焦触发的临时剖切
    this._stepIdx = -1;         // 流程模式步号（-1 = 未进入）
    container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.className = 'lab-labels';
    container.appendChild(this.labelRenderer.domElement);

    // 对象拾取信息卡（悬停设备显示，点击固定）+ 悬停包围框
    this.pickCard = document.createElement('div');
    this.pickCard.className = 'lab-pick-card';
    this.pickCard.style.display = 'none';
    container.appendChild(this.pickCard);
    this.pickables = [];
    this.pinnedPick = null;
    this._ray = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._lastMove = 0;
    this._downPos = null;
    this._hoverBox = new THREE.Box3();
    // 定向选中框：随物体旋转，贴合度优于包围盒
    this.selOutline = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0.9 })
    );
    this.selOutline.visible = false;
    this.selOutline.frustumCulled = false;
    container.addEventListener('pointermove', (e) => this.#onPointerMove(e));
    container.addEventListener('pointerdown', (e) => { this._downPos = [e.clientX, e.clientY]; });
    container.addEventListener('pointerup', (e) => this.#onPointerUp(e));
    container.addEventListener('pointerdown', () => {
      for (const h of this.hotspotObjs) {
        if (h.el.classList.contains('is-narrate')) continue;
        h.el.classList.remove('is-on');
      }
      this.onHotspot(null);
    }, { capture: true });
    container.addEventListener('pointerleave', () => this.#hidePick());
    container.addEventListener('dblclick', (e) => {
      const hit = this.#pickAt(e);
      if (hit) {
        const c = this._hoverBox.setFromObject(hit).getCenter(new THREE.Vector3());
        const size = this._hoverBox.getSize(new THREE.Vector3()).length();
        const dir = this.camera.position.clone().sub(c).normalize();
        this.flyTo([c.x + dir.x * size * 0.9, c.y + dir.y * size * 0.9 + 0.2, c.z + dir.z * size * 0.9], [c.x, c.y, c.z]);
      } else {
        this.flyTo(this.activeScene.view.pos, this.activeScene.view.target);
      }
    });

    this.scene = new THREE.Scene();
    this.backdrop = makeBackdrop();
    this.scene.background = this.backdrop;
    this.scene.backgroundBlurriness = 0.3;
    this.scene.environmentIntensity = 0.55;
    this.scene.fog = new THREE.Fog(0x101318, 16, 40);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.05, 80);
    this.camera.position.set(6, 4, 7);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.minDistance = 0.35;
    this.controls.maxDistance = 20;
    // 用户接管时自动结束导览模式
    this.controls.addEventListener('start', () => {
      if (this.controls.autoRotate) {
        this.controls.autoRotate = false;
        this.onTourEnd();
      }
    });

    this.mats = buildMaterials();
    this.sharedMats = new Set(Object.values(this.mats));
    this.#setupEnvironment();
    this.#setupLights();
    this.#setupGround();
    this.#setupClipHelper();

    this.sceneRoot = null;
    this.activeScene = null;
    this.hotspotObjs = [];
    this.explodeEntries = [];
    this.timeline = 0;
    this.playing = false;
    this.playSpeed = 1;
    this.clock = new THREE.Clock();
    this.flyState = null;
    this.readoutTimer = 0;
    this.paused = false;
    this._lastLoop = performance.now();
    // rAF 节流兜底（后台/嵌入式 WebView 场景保持画面与 HUD 活性）
    this.stallGuard = setInterval(() => {
      if (performance.now() - this._lastLoop > 60) this.#loop();
    }, 120);
    this.raf = requestAnimationFrame(() => this.#loop());

    this.ro = new ResizeObserver(() => this.#resize());
    this.ro.observe(container);
    this.#resize();
  }

  #setupEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = env.texture;
    this.envRT = env;
    pmrem.dispose();
  }

  #setupLights() {
    this.scene.add(new THREE.HemisphereLight(0xcfd4d8, 0x17181a, 0.62));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4.5, 7, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
    key.shadow.camera.near = 1; key.shadow.camera.far = 20;
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.02;
    this.scene.add(key);
    this.keyLight = key;
    const rim = new THREE.DirectionalLight(0x9db8e8, 0.8);
    rim.position.set(-5, 3.5, -4.5);
    this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffe8c8, 0.38);
    fill.position.set(2, 2.5, -5);
    this.scene.add(fill);
  }

  #setupGround() {
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(16, 72),
      this.mats.floor
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -0.002;
    disc.receiveShadow = true;
    this.scene.add(disc);
    const grid = new THREE.GridHelper(16, 32, 0x2c2f36, 0x1d2025);
    grid.material.transparent = true; grid.material.opacity = 0.4;
    grid.position.y = 0.001;
    this.scene.add(grid);
    const shadowCatcher = new THREE.Mesh(
      new THREE.CircleGeometry(12, 48),
      new THREE.ShadowMaterial({ opacity: 0.36 })
    );
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.position.y = 0.003;
    shadowCatcher.receiveShadow = true;
    this.scene.add(shadowCatcher);
    // 悬停选中框（场景就绪后挂载）
    this.scene.add(this.selOutline);
  }

  #resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /* ---------- 场景管理 ---------- */

  setScene(mod) {
    this.#clearScene();
    // 切换淡入：先压暗画布，重建后恢复
    this.renderer.domElement.style.opacity = '0';
    this.activeScene = mod;
    let built;
    try {
      built = mod.build({ THREE, mats: this.mats, viewer: this });
    } catch (err) {
      // 场景构建失败不炸全站：占位场景 + HUD 提示
      console.error(`[lab] scene build failed: ${mod.id}`, err);
      const root = new THREE.Group();
      built = {
        root,
        hotspots: [],
        readout: () => ({ pressure: '—', note: `场景构建失败：${err?.message || err}` }),
      };
    }
    this.built = built;
    this.sceneRoot = built.root;
    this.updateFn = built.update || null;
    this.readoutFn = built.readout || null;
    this.optionFn = built.setOption || null;
    // 剖切白名单：只切试验本体（围岩/洞室/水囊/土箱），桌椅泵柜等外围设备永不切。
    // 材质是跨部件共享的（mats.steelPaint 同时用于本体与设备），先把本体材质克隆私有化，
    // 否则给材质挂 clippingPlanes 会把设备一起切掉。
    this._clipTargets = built.clipTargets?.length ? built.clipTargets : null;
    this._autoClip = false;
    if (this._clipTargets) {
      const cloneMap = new Map();
      for (const t of this._clipTargets) {
        t.traverse((o) => {
          if (!o.material) return;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          const fresh = mats.map((m) => {
            if (!('clippingPlanes' in m)) return m;
            if (!cloneMap.has(m)) {
              const c = m.clone();
              c.userData = { ...c.userData, _clipClone: true }; // 贴图与原材质共享，清理时只释放材质本体
              cloneMap.set(m, c);
            }
            return cloneMap.get(m);
          });
          o.material = Array.isArray(o.material) ? fresh : fresh[0];
        });
      }
      this._clippedMats = [...cloneMap.values()];
    } else {
      this._clippedMats = null;
    }
    this.scene.add(this.sceneRoot);
    this.sceneRoot.updateWorldMatrix(true, true);
    this._bbox = new THREE.Box3().setFromObject(this.sceneRoot);
    // 收集精灵标签（随"标注"开关一起显隐）
    this.spriteLabels = [];
    this.sceneRoot.traverse((o) => { if (o.isSprite) this.spriteLabels.push(o); });
    // 收集可拾取对象
    this.pickables = [];
    this.pinnedPick = null;
    this.pickCard.style.display = 'none';
    this.sceneRoot.traverse((o) => { if (o.userData?.pick) this.pickables.push(o); });
    this.#collectExplode();
    this.#buildHotspots(built.hotspots || []);
    this.timeline = 0;
    this.playing = false;
    this._lastNarrStage = -1;
    this.setExplode(this._explodeValue || 0);
    // 场景自带默认剖切（如土箱剖面叙事），否则延续当前状态
    if (mod.clipDefault) this.setClip({ enabled: true, ...mod.clipDefault });
    else if (this._clip?.enabled) this.setClip(this._clip);
    // 电影感入场：相机从 1.8 倍距离外推近到机位
    const tgt = new THREE.Vector3(...mod.view.target);
    const pos = new THREE.Vector3(...mod.view.pos);
    const start = tgt.clone().add(pos.clone().sub(tgt).multiplyScalar(1.8)).add(new THREE.Vector3(0, 0.5, 0));
    this.camera.position.copy(start);
    this.controls.target.copy(tgt);
    this.flyTo(mod.view.pos, mod.view.target);
    requestAnimationFrame(() => {
      this.renderer.domElement.style.transition = 'opacity .28s ease';
      this.renderer.domElement.style.opacity = '1';
    });
    return built;
  }

  #clearScene() {
    if (this.sceneRoot) {
      this.sceneRoot.traverse((o) => {
        if (o.isCSS2DObject) return;
        if (o.geometry && !o.geometry.userData?.shared) o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
        for (const m of mats) {
          if (this.sharedMats.has(m)) continue;
          if (m.userData?._clipClone) { m.dispose(); continue; } // 剖切克隆：贴图共享，只释放材质
          m.map?.dispose?.();
          m.dispose();
        }
      });
      this.scene.remove(this.sceneRoot);
      this.sceneRoot = null;
    }
    for (const h of this.hotspotObjs) h.el.remove();
    this.hotspotObjs = [];
    this.explodeEntries = [];
    this.updateFn = null; this.readoutFn = null; this.optionFn = null;
    this.onHotspot(null);
  }

  #collectExplode() {
    this.explodeEntries = [];
    this.sceneRoot?.traverse((o) => {
      if (o.userData?.explodeDir) {
        o.userData._base = o.position.clone();
        this.explodeEntries.push(o);
      }
    });
  }

  #buildHotspots(list) {
    const en = getLang() === 'en';
    this.hotspotObjs = [];
    list.forEach((hs, i) => {
      // 英文模式：就地改写标题/行（'@' 行丢弃），built.hotspots 与画布气泡保持同源
      if (en) {
        hs.title = LAB_EN[hs.title]?.title || hs.title;
        hs.lines = enLines(hs.lines);
      } else {
        hs.lines = hs.lines.filter((l) => !l.startsWith('@')); // 内页纯中文：'@' 行是英文摘要
      }
      const el = document.createElement('div');
      el.className = 'lab-hs' + (hs.tone === 'warn' ? ' lab-hs-warn' : '');
      el.innerHTML = `<span class="lab-hs-dot">${i + 1}</span><div class="lab-hs-tip"><b>${hs.title}</b>${(hs.lines || []).map((l) => l.startsWith('@') ? `<i class="lab-hs-en">${l.slice(1)}</i>` : `<span>${l}</span>`).join('')}</div>`;
      // 悬停只亮场景气泡；React 信息卡留给侧栏点击/聚焦，避免同一内容双窗
      const on = () => el.classList.add('is-on');
      const off = () => el.classList.remove('is-on');
      el.addEventListener('pointerenter', on);
      el.addEventListener('pointerleave', off);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        off();
        this.focusHotspot(i);
        // 触屏没有 hover，点开后限时自动收起，避免长期遮挡
        clearTimeout(el._tipTimer);
        el._tipTimer = setTimeout(() => { if (!el.classList.contains('is-narrate')) this.onHotspot(null); }, 4200);
      });
      const css = new CSS2DObject(el);
      const parent = hs.at?.isObject3D ? hs.at : this.sceneRoot;
      if (!hs.at?.isObject3D) css.position.set(...(hs.at || [0, 0, 0]));
      parent.add(css);
      const wp = new THREE.Vector3();
      css.getWorldPosition(wp);
      this.hotspotObjs.push({ css, el, worldPos: wp, data: hs });
    });
  }

  /* ---------- 交互状态 ---------- */

  setExplode(k) {
    this._explodeTarget = k;
    // 具体位移在主循环里向目标补间，交互更顺滑
  }

  #applyExplode(k) {
    for (const o of this.explodeEntries) {
      const base = o.userData._base;
      o.position.copy(base).addScaledVector(o.userData.explodeDir, k * (o.userData.explodeDist ?? 0.5));
    }
    // 部件分离后尺寸标注随之隐藏，避免"标注悬空"
    this.sceneRoot?.traverse((o) => {
      if (o.userData?.isDim) o.visible = k < 0.05;
    });
  }

  #setupClipHelper() {
    this.clipHelper = new THREE.Group();
    this.clipHelper.visible = false;
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0.055, side: THREE.DoubleSide, depthWrite: false });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0.55 });
    this._clipPlaneMat = planeMat;
    this._clipEdgeMat = edgeMat;
    this._clipPlaneGeo = new THREE.PlaneGeometry(1, 1);
    const plane = new THREE.Mesh(this._clipPlaneGeo, planeMat);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(this._clipPlaneGeo), edgeMat);
    this.clipHelper.add(plane, edges);
    this.clipHelper.userData.plane = plane;
    this.clipHelper.userData.edges = edges;
    this.scene.add(this.clipHelper);
  }

  setClip({ enabled, axis = 'z', pos = 0 }) {
    const prev = this._clip;
    this._clip = { enabled, axis, pos };
    // 开启剖切时从场景外侧切入，而不是凭空出现
    if (enabled && (!prev || !prev.enabled || prev.axis !== axis)) {
      const maxMap = this._bbox ? { x: this._bbox.max.x + 0.6, y: this._bbox.max.y + 0.6, z: this._bbox.max.z + 0.6 } : { x: pos, y: pos, z: pos };
      this._clipAnim = { from: maxMap[axis], k: 0 };
    } else {
      this._clipAnim = null;
    }
    // 关闭剖切时向场景外侧滑出，而不是瞬间消失
    if (!enabled && prev?.enabled) {
      const maxMap = this._bbox ? { x: this._bbox.max.x + 0.6, y: this._bbox.max.y + 0.6, z: this._bbox.max.z + 0.6 } : { x: prev.pos, y: prev.pos, z: prev.pos };
      this._clipOut = { from: prev.pos, axis: prev.axis, exit: maxMap[prev.axis], k: 0 };
    } else {
      this._clipOut = null;
    }
    this.#applyClip(pos, axis, enabled);
  }

  #applyClip(pos, axis, enabled) {
    const plane = enabled
      ? [new THREE.Plane(new THREE.Vector3(...(axis === 'x' ? [-1, 0, 0] : axis === 'y' ? [0, -1, 0] : [0, 0, -1])), pos)]
      : null;
    if (this._clippedMats) {
      // 本体私有材质：直接挂/摘剖面
      for (const m of this._clippedMats) m.clippingPlanes = plane;
    } else if (this.sceneRoot) {
      // 兼容旧场景：无白名单时退回全场景
      this.sceneRoot.traverse((o) => {
        const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
        for (const m of mats) {
          if ('clippingPlanes' in m) m.clippingPlanes = plane;
        }
      });
    }
    this.onClipChange({ enabled, axis, pos });
    // 剖切面指示器
    const h = this.clipHelper;
    h.visible = !!enabled;
    if (enabled && this._bbox) {
      const size = this._bbox.getSize(new THREE.Vector3());
      const c = this._bbox.getCenter(new THREE.Vector3());
      const pad = 0.18;
      let sx = 1, sy = 1;
      if (axis === 'z') { sx = size.x + pad; sy = size.y + pad; h.position.set(c.x, c.y, pos); h.rotation.set(0, 0, 0); }
      else if (axis === 'x') { sx = size.z + pad; sy = size.y + pad; h.position.set(pos, c.y, c.z); h.rotation.set(0, Math.PI / 2, 0); }
      else { sx = size.x + pad; sy = size.z + pad; h.position.set(c.x, pos, c.z); h.rotation.set(-Math.PI / 2, 0, 0); }
      h.userData.plane.scale.set(sx, sy, 1);
      h.userData.edges.scale.set(sx, sy, 1);
    }
  }

  // 热点聚焦：Zoom in 推近展示 + 高亮标记 + 信息卡同步
  focusHotspot(i) {
    const hs = this.hotspotObjs[i];
    if (!hs?.worldPos) return;
    for (const h of this.hotspotObjs) h.el.classList.remove('is-focus');
    const p = hs.worldPos;
    const dir = this.camera.position.clone().sub(p);
    if (dir.lengthSq() < 1e-4) dir.set(1, 0.6, 1);
    dir.normalize();
    const dist = 0.75; // 紧凑特写
    const camPos = p.clone().addScaledVector(dir, dist);
    camPos.y = Math.max(camPos.y, p.y + 0.12);
    this.flyTo([camPos.x, camPos.y, camPos.z], [p.x, p.y, p.z], false, {
      dur: 1.05, ease: easeInOutCubic, arc: 0.16, lockAt: p.clone(),
    });
    // flyTo 内部会 clearPick，自动剖切必须排在其后，否则刚开就被还原
    this.#maybeAutoClip(p);
    hs.el.classList.add('is-focus'); // flyTo 会清一次，聚焦标记在其后补上
    this.onHotspot({ index: i, ...hs.data }); // 信息卡同步显示聚焦内容
  }

  // 响应式剖切：聚焦被本体包裹的测点时自动开剖切（剖面落在测点稍后方），退出时还原
  #maybeAutoClip(p) {
    if (this._stepIdx >= 0) return;           // 流程模式有自己的剖切编排
    if (this._tour) return;                    // 自动巡游同理
    const targets = this._clipTargets;
    if (!targets?.length) return;
    if (this._clip?.enabled) { this._autoClip = false; return; }
    const box = new THREE.Box3();
    for (const t of targets) box.expandByObject(t);
    if (box.isEmpty() || !box.containsPoint(p)) return;
    const axis = this.activeScene?.features?.clip || 'z';
    const range = this.activeScene?.features?.clipRange || [-1, 1];
    const comp = { x: 0, y: 1, z: 2 }[axis];
    const pos = THREE.MathUtils.clamp(p.getComponent(comp) + 0.35, range[0], range[1]);
    this._autoClip = true;
    this.setClip({ enabled: true, axis, pos });
  }

  // 还原聚焦时自动打开的剖切
  #restoreAutoClip() {
    if (!this._autoClip) return;
    this._autoClip = false;
    const mod = this.activeScene;
    if (mod?.clipDefault) this.setClip({ enabled: true, ...mod.clipDefault });
    else this.setClip({ enabled: false });
  }

  setLabelsVisible(v) {
    this._labelsOn = v;
    // CSS2DRenderer 每帧按 object.visible 重写 el.style.display，
    // 所以必须切 CSS2DObject.visible（真开关），只改行内样式会被下一帧冲掉
    for (const h of this.hotspotObjs) {
      h.css.visible = v;
      h.el.style.display = v ? '' : 'none';
    }
    for (const sp of this.spriteLabels || []) sp.visible = v;
  }

  /* ---------- 线路视图：结构褪为剪影，只留发光线路 ---------- */
  setLineView(on) {
    this._lineView = on;
    if (!this._lineBackup) this._lineBackup = new Map();
    const LINE_COLORS = { fiber: 0xe8d44d, signal: 0xff9a3c, fluid: 0x5ab8ff, power: 0xf2f1ec };
    this.sceneRoot?.traverse((o) => {
      if (!o.isMesh) {
        return;
      }
      let mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
      if (!mats.length) return;
      const type = o.userData.lineType || o.parent?.userData?.lineType;
      // 网格有线路类型但其材质是共享且未标记：克隆一份专属材质，避免整体共享材质变色
      if (on && type && mats.some((m) => !m.userData?.lineType)) {
        if (!o.userData._lineMat) {
          const clone = mats[0].clone();
          clone.userData = { ...mats[0].userData, lineType: type };
          o.userData._origMat = mats[0];
          o.userData._lineMat = clone;
        }
        o.material = o.userData._lineMat;
        mats = [o.userData._lineMat];
      } else if (!on && o.userData._origMat) {
        o.material = o.userData._origMat;
        o.userData._lineMat.dispose?.();
        o.userData._lineMat = null;
        mats = [o.userData._origMat];
      }
      for (const m of mats) {
        if (this.sharedMats.has(m) && !type) continue; // 共享结构材质不动（下面按材质组处理一次）
        if (!this._lineBackup.has(m)) {
          this._lineBackup.set(m, {
            color: m.color?.clone?.(), emissive: m.emissive?.clone?.(),
            emissiveIntensity: m.emissiveIntensity, transparent: m.transparent, opacity: m.opacity,
          });
        }
        const b = this._lineBackup.get(m);
        if (on) {
          if (type) {
            // 线路：高亮发光
            m.color?.set(LINE_COLORS[type] ?? 0xd9ff58);
            if (m.emissive) { m.emissive.set(LINE_COLORS[type] ?? 0xd9ff58); m.emissiveIntensity = 1.1; }
            m.transparent = false; m.opacity = 1;
          } else if (!this.sharedMats.has(m)) {
            // 非共享结构件：隐去
            m.transparent = true; m.opacity = 0.05;
          }
        } else if (b) {
          if (b.color) m.color?.copy(b.color);
          if (b.emissive) { m.emissive?.copy(b.emissive); m.emissiveIntensity = b.emissiveIntensity; }
          m.transparent = b.transparent; m.opacity = b.opacity;
        }
      }
    });
    // 进入线路视图时自动取景：靠近到能看清全部细线
    if (on && this._bbox) {
      const c = this._bbox.getCenter(new THREE.Vector3());
      const size = this._bbox.getSize(new THREE.Vector3()).length();
      const dir = this.camera.position.clone().sub(c).normalize();
      const dist = size * 0.75;
      this.flyTo([c.x + dir.x * dist, c.y + dir.y * dist + size * 0.08, c.z + dir.z * dist], [c.x, c.y, c.z], false, { dur: 0.8 });
    }
    // 共享结构材质（钢/岩/砂等）：线路视图下统一压暗（地面除外）
    for (const m of this.sharedMats) {
      if (!m.color || m === this.mats.floor) continue;
      if (m.userData?.lineType) continue; // 线缆材质不压暗
      if (!this._lineBackup.has(m)) {
        this._lineBackup.set(m, { color: m.color.clone(), transparent: m.transparent, opacity: m.opacity });
      }
      const b = this._lineBackup.get(m);
      if (on) { m.transparent = true; m.opacity = 0.07; }
      else { m.color.copy(b.color); m.transparent = b.transparent; m.opacity = b.opacity; }
    }
  }

  setOption(id, val) { this.optionFn?.(id, val); }

  flyTo(pos, target, instant = false, opts = {}) {
    this.clearPick();
    const p = new THREE.Vector3(...pos);
    const t = new THREE.Vector3(...target);
    this.setLock(opts.lockAt ?? null);
    if (instant) {
      this.camera.position.copy(p);
      this.controls.target.copy(t);
      this.controls.update();
      return;
    }
    this.flyState = {
      p0: this.camera.position.clone(), p1: p,
      t0: this.controls.target.clone(), t1: t, k: 0,
      dur: opts.dur ?? 0.9,
      ease: opts.ease ?? easeInOut,
      arc: opts.arc ?? 0,                    // 推轨弧高（米）
      lockAt: opts.lockAt ?? null,           // 到位后播锁定环的位置
    };
  }

  // 锁定状态：点小数字/设备推近后非空 → UI 显示"返回宏观"按钮
  setLock(at) {
    const had = Boolean(this.lockedAt);
    this.lockedAt = at || null;
    if (Boolean(this.lockedAt) !== had) this.onLockChange(Boolean(this.lockedAt));
  }

  // 到位锁定环：Zoom in 结束时在目标处播一圈扩散环
  #spawnLockRing(at) {
    if (!this.lockRing) {
      const geo = new THREE.TorusGeometry(0.05, 0.005, 8, 40);
      const mat = new THREE.MeshBasicMaterial({ color: 0xd9ff58, transparent: true, opacity: 0.9, depthWrite: false });
      mat.userData.local = true;
      this.lockRing = new THREE.Mesh(geo, mat);
      this.lockRing.visible = false;
      this.scene.add(this.lockRing);
      this._lockRingGeo = geo;
      this._lockRingMat = mat;
    }
    this.lockRing.position.copy(at);
    this.lockRing.userData.k = 0;
    this.lockRing.visible = true;
  }

  setTimeline(t) { this.timeline = THREE.MathUtils.clamp(t, 0, 1); }

  // 立即把所有补间落到终态（测试/节流环境用；正常环境由主循环自然过渡）
  finishTweens() {
    this._explodeValue = this._explodeTarget ?? 0;
    this.#applyExplode(this._explodeValue);
    this._explodeApplied = this._explodeValue;
    if (this._clipAnim && this._clip) {
      this._clipAnim = null;
      this.#applyClip(this._clip.pos, this._clip.axis, true);
    }
  }

  /* ---------- 对象拾取 ---------- */

  #pickAt(e) {
    if (!this.pickables.length || !this.sceneRoot) return null;
    if (e.target?.closest?.('.lab-hs')) return null; // 热点标记优先，不透传拾取
    const rect = this.renderer.domElement.getBoundingClientRect();
    this._ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this._ray.setFromCamera(this._ndc, this.camera);
    const hits = this._ray.intersectObjects(this.pickables, true);
    if (!hits.length) return null;
    // 命中对象向上找到带 pick 元数据的祖先
    let o = hits[0].object;
    while (o && !o.userData?.pick) o = o.parent;
    return o && o !== this.sceneRoot ? o : null;
  }

  // 定向选中框：世界 AABB → 物体局部空间 → 8 角点 → 随物体姿态变换回世界
  #updateSelOutline(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert();
    const local = box.clone().applyMatrix4(inv);
    const corners = [];
    for (const x of [local.min.x, local.max.x]) for (const y of [local.min.y, local.max.y]) for (const z of [local.min.z, local.max.z]) corners.push(new THREE.Vector3(x, y, z));
    const pairs = [[0, 4], [1, 5], [2, 6], [3, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 1], [2, 3], [4, 5], [6, 7]];
    const pts = [];
    for (const [a, b] of pairs) {
      pts.push(corners[a].clone().applyMatrix4(obj.matrixWorld), corners[b].clone().applyMatrix4(obj.matrixWorld));
    }
    this.selOutline.geometry.dispose();
    this.selOutline.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    this.selOutline.visible = true;
  }

  #showPick(obj, e) {
    const d = obj.userData.pick;
    this.pickCard.innerHTML = `<b>${d.title}</b>${(d.lines || []).map((l) => `<span>${l}</span>`).join('')}<small>点击固定 / 双击飞近</small>`;
    this.pickCard.style.display = 'block';
    const rect = this.container.getBoundingClientRect();
    const x = Math.min(e.clientX - rect.left + 14, rect.width - 240);
    const y = Math.min(e.clientY - rect.top + 14, rect.height - 120);
    this.pickCard.style.left = `${Math.max(8, x)}px`;
    this.pickCard.style.top = `${Math.max(8, y)}px`;
    this.renderer.domElement.classList.add("lab-pick-hover");
    this.#updateSelOutline(obj);
  }

  #hidePick() {
    if (this.pinnedPick) return;
    this.pickCard.style.display = 'none';
    this.selOutline.visible = false;
    this.renderer.domElement.classList.remove("lab-pick-hover");
  }

  #onPointerMove(e) {
    const now = performance.now();
    if (now - this._lastMove < 80) return;
    this._lastMove = now;
    if (this._downPos) return; // 拖拽中不拾取
    const hit = this.#pickAt(e);
    if (hit && !this.pinnedPick) this.#showPick(hit, e);
    else if (!hit && !this.pinnedPick) this.#hidePick();
    if (hit) this.#updateSelOutline(hit);
    else if (!this.pinnedPick) this.selOutline.visible = false;
  }

  #onPointerUp(e) {
    const down = this._downPos;
    this._downPos = null;
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; // 拖拽不是点击
    const hit = this.#pickAt(e);
    if (hit) {
      this.pinnedPick = hit;
      this.#showPick(hit, e);
      // 点击设备：Zoom in 推近展示
      const box = new THREE.Box3().setFromObject(hit);
      const c = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();
      const dir = this.camera.position.clone().sub(c);
      if (dir.lengthSq() < 1e-4) dir.set(1, 0.5, 1);
      dir.normalize();
      const dist = THREE.MathUtils.clamp(size * 1.5, 0.7, 2.2);
      const camPos = c.clone().addScaledVector(dir, dist);
      camPos.y = Math.max(camPos.y, c.y + dist * 0.25);
      this.flyTo([camPos.x, camPos.y, camPos.z], [c.x, c.y, c.z], false, {
        dur: 1.0, ease: easeInOutCubic, arc: dist * 0.12, lockAt: c.clone(),
      });
    } else {
      this.pinnedPick = null;
      this.#hidePick();
    }
  }

  // 清除拾取固定与聚焦高亮（复位/飞走时调用）
  clearPick() {
    this.pinnedPick = null;
    this.pickCard.style.display = 'none';
    this.selOutline.visible = false;
    for (const h of this.hotspotObjs) h.el.classList.remove('is-focus');
    this.#restoreAutoClip();
  }

  /* ---------- 线性巡游：局部 → 局部 → … → 宏观 ---------- */

  startTour(stops) {
    if (!stops?.length) return;
    this.clearPick();
    this._tour = { stops, i: -1, phase: 'move', t: 0, moveDur: 1.15 };
    this.#tourGoto(0);
  }

  stopTour() {
    if (!this._tour) return;
    this._tour = null;
    this.onTourStep(null);
  }

  #tourGoto(i) {
    const T = this._tour;
    if (!T) return;
    const st = T.stops[i];
    const mod = this.activeScene;
    let toPos, toTarget;
    if (st.macro) {
      toTarget = new THREE.Vector3(...mod.view.target);
      const v = new THREE.Vector3(...mod.view.pos);
      toPos = toTarget.clone().add(v.clone().sub(toTarget).multiplyScalar(1.08));
    } else {
      const hs = this.hotspotObjs[st.focus ?? 0];
      if (!hs) { this.#tourNext(i); return; }
      const p = hs.worldPos;
      const dir = this.camera.position.clone().sub(p);
      if (dir.lengthSq() < 1e-4) dir.set(1, 0.6, 1);
      dir.normalize();
      toTarget = p.clone();
      toPos = p.clone().addScaledVector(dir, st.dist ?? 1.2);
      toPos.y = Math.max(toPos.y, p.y + 0.12);
    }
    T.i = i;
    T.phase = 'move';
    T.t = 0;
    T.from = { p: this.camera.position.clone(), t: this.controls.target.clone() };
    T.to = { p: toPos, t: toTarget };
    const hsData = st.macro ? null : this.hotspotObjs[st.focus ?? 0]?.data;
    const enLine = hsData?.lines?.find((l) => l.startsWith('@'));
    this.onTourStep({
      index: i, total: T.stops.length,
      label: st.macro ? '宏观全景' : hsData?.title,
      labelEn: st.macro ? 'Whole rig' : (enLine ? enLine.slice(1) : hsData?.title),
      caption: st.caption,
    });
  }

  #tourNext(i) {
    if (!this._tour) return;
    if (i + 1 >= this._tour.stops.length) {
      this._tour = null;
      this.onTourStep(null);
      this.onTourEnd();
    } else {
      this.#tourGoto(i + 1);
    }
  }

  /* ---------- 流程模式：逐步编排状态 ---------- */

  enterStep(i) {
    const steps = this.activeScene?.steps;
    if (!steps || !steps[i]) return;
    this._stepIdx = i;
    const st = steps[i];
    this.onStepEnter(i, st);
    if (st.option) this.setOption(st.option.id, st.option.value);
    this.setExplode(st.explode ?? 0);
    const stepClip = st.clip || (st.play ? this.activeScene?.demoClip : null);
    if (stepClip) this.setClip({ enabled: true, ...stepClip });
    else this.setClip({ enabled: false });
    this.setTimeline(st.timeline ?? 0);
    this.playing = !!st.play;
    this.onPlayChange(this.playing);
    if (st.focus != null) this.focusHotspot(st.focus);
    else if (st.view) this.flyTo(st.view.pos, st.view.target);
  }

  exitStepMode() {
    this._stepIdx = -1;
    this._autoClip = false;
    const mod = this.activeScene;
    if (!mod) return;
    this.setExplode(0);
    if (mod.clipDefault) this.setClip({ enabled: true, ...mod.clipDefault });
    else this.setClip({ enabled: false });
    this.setTimeline(0);
    this.playing = false;
    this.onPlayChange(false);
    this.flyTo(mod.view.pos, mod.view.target);
  }

  // 纯净截图：隐藏全部标注与精灵，按倍率渲染一帧，用于作品集封面
  captureClean({ scale = 2 } = {}) {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    const prevRatio = this.renderer.getPixelRatio();
    const prevLabels = this.labelRenderer.domElement.style.display;
    const spriteState = (this.spriteLabels || []).map((sp) => sp.visible);
    const hotspotState = this.hotspotObjs.map((x) => x.el.style.display);

    this.labelRenderer.domElement.style.display = 'none';
    const prevHelper = this.clipHelper.visible;
    this.clipHelper.visible = false;
    const prevSel = this.selOutline.visible;
    this.selOutline.visible = false;
    for (const sp of this.spriteLabels || []) sp.visible = false;
    for (const x of this.hotspotObjs) x.el.style.display = 'none';

    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(w, h, false);
    this.renderer.render(this.scene, this.camera);
    const url = this.renderer.domElement.toDataURL('image/png');

    // 还原
    this.renderer.setPixelRatio(prevRatio);
    this.renderer.setSize(w, h, false);
    this.labelRenderer.domElement.style.display = prevLabels;
    this.clipHelper.visible = prevHelper;
    this.selOutline.visible = prevSel;
    (this.spriteLabels || []).forEach((sp, i) => { sp.visible = spriteState[i]; });
    this.hotspotObjs.forEach((x, i) => { x.el.style.display = hotspotState[i]; });
    this.renderer.render(this.scene, this.camera);
    return url;
  }

  // 封面帧：完整模型（强制关剖切）、无任何文字标注
  // 取景优先用场景默认机位 pos/target（乘 zoom 拉远）；否则按包围盒自动计算
  captureCover({ scale = 2, azim = 0.55, elev = 0.38, pad = 0.95, zoom = 1.1, pos, target } = {}) {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    const prevRatio = this.renderer.getPixelRatio();
    const prevLabels = this.labelRenderer.domElement.style.display;
    const prevHelper = this.clipHelper.visible;
    const prevSel = this.selOutline.visible;
    const spriteState = (this.spriteLabels || []).map((sp) => sp.visible);
    const hotspotState = this.hotspotObjs.map((x) => x.el.style.display);
    const prevCamPos = this.camera.position.clone();
    const prevTarget = this.controls?.target.clone();

    // 强制解除全部材质剖切，得到完整模型
    const savedClip = new Map();
    this.sceneRoot?.traverse((o) => {
      const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
      for (const m of mats) {
        if ('clippingPlanes' in m) { savedClip.set(m, m.clippingPlanes); m.clippingPlanes = null; }
      }
    });
    this.labelRenderer.domElement.style.display = 'none';
    this.clipHelper.visible = false;
    this.selOutline.visible = false;
    for (const sp of this.spriteLabels || []) sp.visible = false;
    for (const x of this.hotspotObjs) x.el.style.display = 'none';

    // 自动取景
    if (pos && target) {
      const t = new THREE.Vector3(...target);
      const dir = new THREE.Vector3(...pos).sub(t).normalize();
      const dist = new THREE.Vector3(...pos).sub(t).length() * zoom;
      this.camera.position.copy(t).addScaledVector(dir, dist);
      this.camera.lookAt(t);
    } else if (this._bbox) {
      const c = this._bbox.getCenter(new THREE.Vector3());
      const r = this._bbox.getSize(new THREE.Vector3()).length() / 2;
      const dir = new THREE.Vector3(
        Math.cos(elev) * Math.sin(azim),
        Math.sin(elev),
        Math.cos(elev) * Math.cos(azim),
      );
      const fov = THREE.MathUtils.degToRad(this.camera.fov || 45);
      const dist = (r / Math.sin(fov / 2)) * pad;
      this.camera.position.copy(c).addScaledVector(dir, dist);
      this.camera.lookAt(c);
    }

    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(w, h, false);
    this.renderer.render(this.scene, this.camera);
    const url = this.renderer.domElement.toDataURL('image/png');

    // 还原
    this.renderer.setPixelRatio(prevRatio);
    this.renderer.setSize(w, h, false);
    for (const [m, p] of savedClip) m.clippingPlanes = p;
    this.labelRenderer.domElement.style.display = prevLabels;
    this.clipHelper.visible = prevHelper;
    this.selOutline.visible = prevSel;
    (this.spriteLabels || []).forEach((sp, i) => { sp.visible = spriteState[i]; });
    this.hotspotObjs.forEach((x, i) => { x.el.style.display = hotspotState[i]; });
    if (prevCamPos) this.camera.position.copy(prevCamPos);
    if (prevTarget && this.controls) { this.controls.target.copy(prevTarget); this.controls.update(); }
    this.renderer.render(this.scene, this.camera);
    return url;
  }

  // 同步渲染一帧并返回 dataURL（自动化/调试用，绕过合成器）
  snapshot() {
    this._lastLoop = 0;
    this.#loop();
    return this.renderer.domElement.toDataURL('image/png');
  }

  /* ---------- 主循环 ---------- */

  #loop() {
    this.raf = requestAnimationFrame(() => this.#loop());
    const now = performance.now();
    if (now - this._lastLoop < 15) return; // rAF 与兜底计时器去重
    this._lastLoop = now;
    const raw = this.clock.getDelta();
    const dt = Math.min(raw, 0.05);

    if (this.flyState) {
      const f = this.flyState;
      f.k = Math.min(1, f.k + raw / (f.dur ?? 0.9)); // 相机飞行用真实时间，不受 dt 钳制影响
      const e = (f.ease ?? easeInOut)(f.k);
      this.camera.position.lerpVectors(f.p0, f.p1, e);
      if (f.arc > 0) this.camera.position.y += Math.sin(f.k * Math.PI) * f.arc; // 推轨弧线
      this.controls.target.lerpVectors(f.t0, f.t1, e);
      if (f.k >= 1) {
        if (f.lockAt) this.#spawnLockRing(f.lockAt);
        this.flyState = null;
      }
    }

    // 到位锁定环动画
    if (this.lockRing?.visible) {
      const rk = this.lockRing.userData.k + dt / 0.55;
      if (rk >= 1) { this.lockRing.visible = false; }
      else {
        this.lockRing.userData.k = rk;
        this.lockRing.scale.setScalar(0.4 + rk * 2.4);
        this._lockRingMat.opacity = 0.9 * (1 - rk);
        this.lockRing.lookAt(this.camera.position);
      }
    }

    // 线性巡游：匀速推进，不插值缓动
    if (this._tour) {
      const T = this._tour;
      const st = T.stops[T.i] || {};
      T.t += raw;
      if (T.phase === 'move') {
        const k = Math.min(1, T.t / T.moveDur);
        this.camera.position.lerpVectors(T.from.p, T.to.p, k);
        this.controls.target.lerpVectors(T.from.t, T.to.t, k);
        if (k >= 1) { T.phase = 'hold'; T.t = 0; }
      } else if (T.t >= (st.hold ?? 1.8)) {
        this.#tourNext(T.i);
      }
    }

    if (this.playing) {
      this.timeline += dt * 0.045 * this.playSpeed;
      if (this.timeline >= 1) {
        this.timeline = 0;
        // 回卷暗场：示意"更换试件，进入下一轮"
        const el = this.renderer.domElement;
        el.style.transition = 'opacity .09s';
        el.style.opacity = '0.45';
        setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '1'; }, 110);
      }
    }

    // 爆炸补间
    if (this._explodeTarget === undefined) this._explodeTarget = 0;
    if (this._explodeValue === undefined) { this._explodeValue = 0; this._explodeApplied = -1; }
    if (Math.abs(this._explodeValue - this._explodeTarget) > 0.0005) {
      this._explodeValue += (this._explodeTarget - this._explodeValue) * Math.min(1, dt * 7);
      if (Math.abs(this._explodeValue - this._explodeTarget) <= 0.0008) this._explodeValue = this._explodeTarget;
    }
    if (this._explodeApplied !== this._explodeValue) {
      this.#applyExplode(this._explodeValue);
      this._explodeApplied = this._explodeValue;
    }
    // 剖切切入补间
    if (this._clipAnim && this._clip) {
      const a = this._clipAnim;
      a.k = Math.min(1, a.k + dt / 0.45);
      const eff = a.from + (this._clip.pos - a.from) * easeInOut(a.k);
      this.#applyClip(eff, this._clip.axis, true);
      if (a.k >= 1) this._clipAnim = null;
    }
    // 剖切滑出补间
    if (this._clipOut) {
      const o = this._clipOut;
      o.k = Math.min(1, o.k + dt / 0.35);
      const eff = o.from + (o.exit - o.from) * easeInOut(o.k);
      this.#applyClip(eff, o.axis, true);
      if (o.k >= 1) {
        this._clipOut = null;
        this.#applyClip(0, o.axis, false);
      }
    }
    // 剖面指示器呼吸 + 选中框呼吸
    if (this.clipHelper.visible) this._clipPlaneMat.opacity = 0.05 + 0.02 * Math.sin(now * 0.004);
    if (this.selOutline.visible) this.selOutline.material.opacity = 0.65 + 0.3 * Math.sin(now * 0.005);

    if (this.updateFn) this.updateFn(this.timeline, dt, { playing: this.playing });

    this.readoutTimer += dt;
    if (this.readoutTimer > 0.18) {
      this.readoutTimer = 0;
      const stage = this.stageAt(this.timeline);
      this.onStage(stage);
      if (this.readoutFn) this.onReadout(this.readoutFn(this.timeline, stage));
      else this.onReadout(null);
      // 阶段驱动的测点叙述：播放进入新阶段时，高亮"正在观测这段物理"的测点
      if (this.activeScene?.stageHotspots && stage.index !== this._lastNarrStage) {
        this._lastNarrStage = stage.index;
        const hi = this.activeScene.stageHotspots[stage.index];
        for (const h of this.hotspotObjs) h.el.classList.remove('is-narrate');
        if (hi != null && this.hotspotObjs[hi]) this.hotspotObjs[hi].el.classList.add('is-narrate');
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  stageAt(t) {
    const stages = this.activeScene?.stages || [];
    for (let i = stages.length - 1; i >= 0; i--) if (t >= stages[i].at - 1e-6) return { index: i, ...stages[i] };
    return stages.length ? { index: 0, ...stages[0] } : { index: -1, label: '' };
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    clearInterval(this.stallGuard);
    this.ro.disconnect();
    this.#clearScene();
    this.controls.dispose();
    this.renderer.dispose();
    this.envRT?.dispose?.();
    this.scene.environment?.dispose?.();
    this.backdrop?.dispose?.();
    this._clipPlaneGeo?.dispose();
    this._clipPlaneMat?.dispose();
    this._clipEdgeMat?.dispose();
    this.scene.remove(this.clipHelper);
    this.scene.remove(this.selOutline);
    this.selOutline.geometry?.dispose?.();
    this.selOutline.material?.dispose?.();
    this.scene.remove(this.lockRing);
    this._lockRingGeo?.dispose?.();
    this._lockRingMat?.dispose?.();
    this.pickCard?.remove();
    for (const h of this.hotspotObjs) h.el.remove();
    this.renderer.domElement.remove();
    this.labelRenderer.domElement.remove();
  }
}
