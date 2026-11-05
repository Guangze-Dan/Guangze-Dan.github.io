// /lab — 三维试验室：五个试验方案场景的实时三维模型。
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { SiteNav, SiteFooter } from '../main.jsx';
import { LabViewer } from './engine.js';
import { getLang, setLang, subscribeLang } from '../lang.js';
import { localizeScene, SCENE_TOUR } from './scene-en.js';
import multiscale from './scenes/multiscale.js';
import sealing from './scenes/sealing.js';
import hongan from './scenes/hongan.js';
import mine from './scenes/mine.js';
import soiltank from './scenes/soiltank.js';
import './lab.css';

const SCENES = [multiscale, sealing, hongan, mine, soiltank];

// 封面机位：方位角/仰角（captureCover 按包围盒自动取距）
const COVER_VIEWS = {
  multiscale: { azim: 0.62, elev: 0.40 },
  sealing: { azim: -0.66, elev: 0.30 },
  hongan: { azim: 0.48, elev: 0.36 },
  mine: { azim: 0.72, elev: 0.28 },
  soiltank: { azim: 0.44, elev: 0.52 },
};

const RELATED = [
  { slug: 'caes-multiscale-cavern', label: '多尺度洞室试验', en: 'Multiscale rig' },
  { slug: 'abandoned-mine-caes', label: '废弃矿硐储库', en: 'Mine CAES' },
  { slug: 'hp-flexible-sealing', label: '柔性密封试验', en: 'Flexible sealing' },
];

function useEngine() {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  return { containerRef, engineRef };
}

export default function LabPage() {
  const { containerRef, engineRef } = useEngine();
  const [sceneIdx, setSceneIdx] = useState(() => {
    const q = Number(new URLSearchParams(window.location.search).get('scene'));
    return Number.isInteger(q) && q >= 0 && q < SCENES.length ? q : 0;
  });
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [timeline, setTimeline] = useState(0);
  const [explode, setExplode] = useState(0);
  const [clipOn, setClipOn] = useState(false);
  const [clipAxis, setClipAxis] = useState('z');
  const [clipPos, setClipPos] = useState(0);
  const [labelsOn, setLabelsOn] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(pointer: coarse)').matches;
  });
  const [readout, setReadout] = useState(null);
  const [stage, setStage] = useState(null);
  const [hotspot, setHotspot] = useState(null);
  const [options, setOptions] = useState({});
  const [hsList, setHsList] = useState([]);
  const [tour, setTour] = useState(false);
  const [glError, setGlError] = useState(null);
  const [shotFlash, setShotFlash] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [stepMode, setStepMode] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [stepInfo, setStepInfo] = useState(null);
  const [fs, setFs] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  // 控制条动态避让：实测左上读数宽度写入 --readout-reserve（场景/语言/字号变化都会触发）
  useEffect(() => {
    if (!ready) return undefined;
    const vp = containerRef.current;
    const ro = vp?.querySelector('.lab-hud-readout');
    if (!vp || !ro || typeof ResizeObserver === 'undefined') return undefined;
    const apply = () => {
      const w = ro.getBoundingClientRect().width;
      const vw = vp.clientWidth || window.innerWidth;
      const reserve = Math.min(Math.max(w + 44, 180), Math.max(vw - 170, 180));
      vp.style.setProperty('--readout-reserve', `${Math.round(reserve)}px`);
    };
    apply();
    const obs = new ResizeObserver(apply);
    obs.observe(ro);
    window.addEventListener('resize', apply);
    return () => { obs.disconnect(); window.removeEventListener('resize', apply); };
  }, [ready, sceneIdx]);
  const backToOverview = () => {
    const viewer = engineRef.current;
    if (!viewer) return;
    viewer.clearPick();
    setHotspot(null);
    viewer.flyTo(SCENES[sceneIdxRef.current].view.pos, SCENES[sceneIdxRef.current].view.target);
  };
  const coverMode = useMemo(() => new URLSearchParams(window.location.search).get('cover') === '1', []);
  const [coverDone, setCoverDone] = useState(0);
  useEffect(() => {
    const h = () => setFs(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  const [lang, setLangState] = useState(getLang());
  useEffect(() => subscribeLang(setLangState), []);
  const scene = useMemo(() => localizeScene(SCENES[sceneIdx], lang), [sceneIdx, lang]);
  const T = (zh, en) => (lang === 'en' ? en : zh);

  useEffect(() => {
    document.title = T('三维试验室 / 3D TESTBED · 但光泽作品集', '3D Testbed · Guangze Dan — Portfolio');
    // 3D 视口需要原生光标（grab / pointer 反馈）：进入试验室时停用站点自定义光标
    document.documentElement.classList.remove('rb-cursor-on');
    return () => document.documentElement.classList.add('rb-cursor-on');
  }, [lang]);

  // 引擎只建一次（WebGL 不可用时给出兜底提示）
  useEffect(() => {
    let viewer;
    try {
      viewer = new LabViewer(containerRef.current, {
        onHotspot: (hs) => setHotspot(hs),
        onReadout: (ro) => {
          if (!ro) return;
          setReadout(ro);
          setTimeline(ro.t ?? 0);
        },
        onStage: (st) => setStage(st),
        onTourEnd: () => setTour(false),
        onClipChange: ({ enabled, axis, pos }) => {
          setClipOn(enabled);
          // 自动剖切/流程模式改了剖面位置时，滑条跟着走
          if (axis) setClipAxis(axis);
          if (typeof pos === 'number') setClipPos(pos);
        },
        onLockChange: (on) => setZoomed(on),
        onStepEnter: (i, st) => setStepInfo({ index: i, ...st }),
        onPlayChange: (p) => setPlaying(p),
        onTourStep: (info) => setTourStep(info),
      });
    } catch (err) {
      setGlError(err?.message || String(err));
      return undefined;
    }
    engineRef.current = viewer;
    if (typeof window !== 'undefined') window.__viewer = viewer; // 调试/自动化入口
    setReady(true);
    return () => { viewer.dispose(); engineRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 切场景
  useEffect(() => {
    const viewer = engineRef.current;
    if (!viewer || !ready) return;
    viewer.setScene(scene);
    setHsList((viewer.built?.hotspots || []).map((h) => h.title));
    viewer.setLabelsVisible(labelsOn);
    setExplode(0); viewer.setExplode(0);
    setStepMode(false); setStepInfo(null);
    // 线路视图跨场景保持
    if (lineView) viewer.setLineView(true);
    setPlaying(false); viewer.playing = false;
    setOptions(Object.fromEntries((scene.options || []).map((o) => [o.id, o.default])));
    // 场景自带默认剖切时同步 UI
    const def = scene.clipDefault;
    setClipOn(!!def);
    viewer.setClip(def ? { enabled: true, ...def } : { enabled: false });
    setClipAxis(scene.features?.clip || 'z');
    const range = scene.features?.clipRange || [-1, 1];
    setClipPos(def ? def.pos : range[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIdx, ready]);

  // 封面批量导出模式：/lab?cover=1 → 逐场景下载完整无标注封面 PNG
  useEffect(() => {
    if (!ready || !coverMode) return;
    const viewer = engineRef.current;
    if (!viewer) return;
    const timer = window.setTimeout(() => {
      const v = COVER_VIEWS[scene.id] || {};
      viewer.setClip({ enabled: false });
      viewer.setLabelsVisible(false);
      const url = viewer.captureCover({
        scale: 2,
        azim: v.azim ?? 0.55,
        elev: v.elev ?? 0.38,
        pos: scene.view?.pos,
        target: scene.view?.target,
      });
      const name = `lab-${sceneIdx + 1}-${scene.id}-cover.png`;
      // 直传仅限本地封面流水线（dev 接收服务），线上直接走下载，避免无效请求报错
      if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        fetch('http://localhost:19527/cover', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name, data: url }),
        }).catch(() => null);
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
      }
      setCoverDone(sceneIdx + 1);
      if (sceneIdx + 1 < SCENES.length) {
        window.setTimeout(() => {
          window.location.replace(`/lab?cover=1&scene=${sceneIdx + 1}`);
        }, 1200);
      }
    }, 1600);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sceneIdx, coverMode]);

  const togglePlay = useCallback(() => {
    const viewer = engineRef.current;
    if (!viewer) return;
    viewer.playing = !viewer.playing;
    setPlaying(viewer.playing);
    // 开始播放时自动剖开，否则看不到内部响应
    const dc = sceneRef.current?.demoClip;
    if (viewer.playing && dc && viewer._clip?.enabled !== true) {
      viewer.setClip({ enabled: true, ...dc });
      setClipOn(true);
      setClipAxis(dc.axis);
      setClipPos(dc.pos);
    }
  }, []);

  const sceneRef = useRef(scene);
  useEffect(() => { sceneRef.current = scene; }, [scene]);

  // 键盘：1–5 切场景 · 空格播放 · C 剖切 · R 复位
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key >= '1' && e.key <= '5') setSceneIdx(Number(e.key) - 1);
      else if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'c' || e.key === 'C') {
        const viewer = engineRef.current;
        if (!viewer) return;
        const next = !(viewer._clip?.enabled);
        const base = viewer._clip || { axis: 'z', pos: 0 };
        viewer.setClip({ ...base, enabled: next });
        setClipOn(next);
      }
      else if (e.key === 'e' || e.key === 'E') {
        const viewer = engineRef.current;
        if (!viewer) return;
        const next = (viewer._explodeValue || 0) > 0.01 ? 0 : 0.6;
        viewer.setExplode(next);
        setExplode(next);
      }
      else if (e.key === 'l' || e.key === 'L') {
        setLabelsOn((v) => { engineRef.current?.setLabelsVisible(!v); return !v; });
      }
      else if (e.key === 'r' || e.key === 'R') {
        engineRef.current?.flyTo(SCENES[sceneIdxRef.current].view.pos, SCENES[sceneIdxRef.current].view.target);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay]);

  const sceneIdxRef = useRef(sceneIdx);
  const stepIdxRef = useRef(stepIdx);
  useEffect(() => { sceneIdxRef.current = sceneIdx; }, [sceneIdx]);
  useEffect(() => { stepIdxRef.current = stepIdx; }, [stepIdx]);

  // 深链：/lab?scene=N（保留其他查询参数，如 cover=1）
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (sceneIdx) q.set('scene', String(sceneIdx)); else q.delete('scene');
    const qs = q.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, [sceneIdx]);

  const onScrub = (e) => {
    const t = Number(e.target.value) / 1000;
    const viewer = engineRef.current;
    if (!viewer) return;
    if (viewer.playing) { viewer.playing = false; setPlaying(false); }
    viewer.setTimeline(t);
    setTimeline(t);
  };

  const applyClip = (on, axis, pos) => {
    engineRef.current?.setClip({ enabled: on, axis, pos });
  };

  const stageChips = scene.stages || [];
  const clipRange = scene.features?.clipRange || [-1, 1];

  // 时间轴阶段着色：危险段红调
  const timelineBg = (() => {
    if (!stageChips.length) return undefined;
    const stops = [];
    stageChips.forEach((st, i) => {
      const a = (i === 0 ? 0 : stageChips[i - 1].at) * 100;
      const b = st.at * 100;
      const color = st.warn ? 'rgba(255,90,72,.32)' : (i % 2 === 0 ? '#262930' : '#1b1d22');
      stops.push(`${color} ${a}%`, `${color} ${b}%`);
    });
    stops.push('#1b1d22 100%');
    return `linear-gradient(90deg, ${stops.join(', ')})`;
  })();

  const toggleTour = useCallback(() => {
    const viewer = engineRef.current;
    if (!viewer) return;
    if (viewer._tour) {
      viewer.stopTour();
      setTour(false);
      return;
    }
    const stops = SCENE_TOUR[scene.id] || [];
    if (!stops.length) return;
    // 巡游时自动剖开 + 播放，局部看细节、最后拉远看宏观
    const dc = scene.demoClip || scene.clipDefault;
    if (dc) { viewer.setClip({ enabled: true, ...dc }); setClipOn(true); }
    if (!viewer.playing) { viewer.playing = true; setPlaying(true); }
    viewer.startTour(stops);
    setTour(true);
  }, [scene]);

  // 流程模式：逐步编排状态 + 解说
  const steps = scene.steps || [];
  const enterStepMode = useCallback(() => {
    const viewer = engineRef.current;
    if (!viewer || !steps.length) return;
    setStepMode(true);
    setStepIdx(0);
    viewer.enterStep(0);
  }, [steps.length]);

  const exitStepMode = useCallback(() => {
    setStepMode(false);
    setStepInfo(null);
    engineRef.current?.exitStepMode();
  }, []);

  const gotoStep = useCallback((i) => {
    const idx = Math.max(0, Math.min(steps.length - 1, i));
    setStepIdx(idx);
    engineRef.current?.enterStep(idx);
  }, [steps.length]);

  const toggleStepMode = useCallback(() => {
    if (stepMode) exitStepMode();
    else enterStepMode();
  }, [stepMode, enterStepMode, exitStepMode]);

  // 原理流程树：Zoom in 到关键测点，然后因果链从左往右生长
  const [tree, setTree] = useState(null);
  const [tourStep, setTourStep] = useState(null);
  const [lineView, setLineView] = useState(false);
  const treeTimerRef = useRef(null);
  const openTree = useCallback(() => {
    const p = scene.principleTree;
    const viewer = engineRef.current;
    if (!p || !viewer) return;
    viewer.playing = false;
    setPlaying(false);
    const clip = p.clip || scene.demoClip;
    if (clip) viewer.setClip({ enabled: true, ...clip });
    else viewer.setClip({ enabled: false });
    if (p.timeline != null) viewer.setTimeline(p.timeline);
    viewer.finishTweens();
    viewer.focusHotspot(p.focus ?? 0);
    setTree(p);
  }, [scene]);

  const closeTree = useCallback(() => {
    setTree(null);
    if (treeTimerRef.current) { window.clearTimeout(treeTimerRef.current); treeTimerRef.current = null; }
  }, []);

  // Esc 关闭原理树
  useEffect(() => {
    if (!tree) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeTree(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tree, closeTree]);

  // 流程模式中标记 tree: true 的步骤，进入后自动生长原理树
  useEffect(() => {
    if (!stepMode || !stepInfo?.tree) return undefined;
    treeTimerRef.current = window.setTimeout(() => {
      const p = scene.principleTree;
      if (p) {
        const viewer = engineRef.current;
        if (viewer) {
          viewer.playing = false;
          setPlaying(false);
          if (p.clip) viewer.setClip({ enabled: true, ...p.clip });
          if (p.timeline != null) viewer.setTimeline(p.timeline);
          setTree(p);
        }
      }
    }, 1300);
    return () => { if (treeTimerRef.current) window.clearTimeout(treeTimerRef.current); };
  }, [stepMode, stepInfo, scene]);

  // 流程模式下 ←/→ 翻步，Esc 退出
  useEffect(() => {
    if (!stepMode) return undefined;
    const onKey = (e) => {
      const tag = e.target?.tagName || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') gotoStep(stepIdxRef.current + 1);
      else if (e.key === 'ArrowLeft') gotoStep(stepIdxRef.current - 1);
      else if (e.key === 'Escape') exitStepMode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepMode, gotoStep, exitStepMode]);

  if (glError) {
    return (
      <div className="majd-site lab-page">
        <SiteNav />
        <main>
          <section className="lab-hero">
            <div className="m-section-kicker">{T('/ 试验室', '/ 3D TESTBED')}</div>
            <h1>当前环境<em>不支持 WebGL</em>。</h1>
            <p>三维试验室需要启用 WebGL 的浏览器（Chrome / Edge / Firefox / Safari 均可）。错误信息：{glError}</p>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="majd-site lab-page">
      <SiteNav />
      <main>
        <section className="lab-hero">
          <div className="m-section-kicker">{T('/ 试验室 / 3D TESTBED', '/ 3D TESTBED')}</div>
          <h1>{T('把试验方案，建成', 'Every test plan, rebuilt as ')}<em>{T('可以走进去', 'a room you can enter')}</em>{T('的三维模型。', '.')}</h1>
          <p>
            {T('全部按方案尺寸与实拍照片程序化建模：每一颗螺栓、每一根引线、每一个测点都有出处。拖动剖切看构造内部，拉开爆炸图看装配层级，按播放走一遍加载程序。',
              'Everything is built procedurally to the scheme dimensions and site photographs: every bolt, every lead, every gauge has a source. Cut it open, explode the assembly, or play the loading programme.')}
          </p>
          <div className="lab-hero-meta">
            <span>{T('Three.js 实时渲染', 'Three.js realtime')}</span>
            <span>{T('5 个场景 · 60+ 部件', '5 scenes · 60+ parts')}</span>
            <span>{T('方案尺寸 1:1 建模', 'Built to scheme dimensions')}</span>
          </div>
        </section>

        <nav className="lab-tabs" aria-label="场景切换">
          {SCENES.map((s, i) => (
            <button key={s.id} type="button" className={`lab-tab ${i === sceneIdx ? 'is-active' : ''}`} onClick={() => setSceneIdx(i)}>
              <small>{s.n}</small>
              <span>{localizeScene(s, lang).titleCn}</span>
            </button>
          ))}
        </nav>

        <section className="lab-main">
          <div className="lab-viewport" ref={containerRef}>
            {zoomed && !stepMode && !coverMode && (
              <button type="button" className="lab-back" onClick={backToOverview}>← {T('返回宏观', 'Back to overview')}</button>
            )}
            {coverMode && (
              <div className="lab-cover-badge" style={{ position: 'absolute', left: 14, bottom: 14, zIndex: 30, color: '#d9ff58', font: '600 13px "DM Mono", monospace', letterSpacing: '.08em' }}>
                COVER {coverDone}/{SCENES.length} · {scene.id}
              </div>
            )}
            <div className={`lab-shot-flash ${shotFlash ? 'is-on' : ''}`} aria-hidden="true" />
            <div className="lab-hud-readout">
              <strong>{readout?.pressure || '—'}</strong>
              <span className="lab-hud-unit">{scene.readoutLabel}</span>
              {stage?.label && (
                <span className={`lab-hud-stage ${stage.warn ? 'is-warn' : ''}`}>
                  {stage.label}<small>{stage.sub}</small>
                </span>
              )}
            </div>
            <div className="lab-hud-controls">
              <button type="button" className={`lab-ctl ${clipOn ? 'is-on' : ''}`} aria-label={T('剖切视图', 'Section view')} onClick={() => { const v = !clipOn; setClipOn(v); applyClip(v, clipAxis, clipPos); }}>{T('剖切', 'Section')}</button>
              {clipOn && (
                <>
                  <div className="lab-seg">
                    {['x', 'y', 'z'].map((ax) => (
                      <button key={ax} type="button" className={clipAxis === ax ? 'is-on' : ''} onClick={() => { setClipAxis(ax); applyClip(true, ax, clipPos); }}>{ax.toUpperCase()}</button>
                    ))}
                  </div>
                  <input type="range" aria-label="剖切位置" min={clipRange[0] * 100} max={clipRange[1] * 100} value={clipPos * 100}
                    onChange={(e) => { const v = Number(e.target.value) / 100; setClipPos(v); applyClip(true, clipAxis, v); }} />
                  <span className="lab-clip-val">{clipAxis} = {clipPos.toFixed(2)} m</span>
                </>
              )}
              <span className="lab-ctl-sep" data-g={T('视图', 'View')} />
              <label className="lab-ctl-lab">{T('爆炸', 'Explode')}<input type="range" aria-label="爆炸视图" min={0} max={100} value={explode * 100}
                onChange={(e) => { const v = Number(e.target.value) / 100; setExplode(v); engineRef.current?.setExplode(v); }} /></label>
              <button type="button" className={`lab-ctl ${labelsOn ? 'is-on' : ''}`} title={T('显示/隐藏测点编号', 'Show or hide gauge numbers')} aria-label={T('标注显示', 'Annotations')} onClick={() => { const v = !labelsOn; setLabelsOn(v); engineRef.current?.setLabelsVisible(v); }}>{T('标注', 'Labels')}</button>
              <button type="button" className={`lab-ctl ${lineView ? 'is-on' : ''}`} title={T('线路视图：结构褪为剪影，只留线缆与管路', 'Line view: structure fades, cabling and piping glow')}
                aria-label={T('线路视图', 'Line view')} onClick={() => { const v = !lineView; setLineView(v); engineRef.current?.setLineView(v); }}>{T('线路', 'Lines')}</button>
              <span className="lab-ctl-sep" data-g={T('模式', 'Mode')} />
              <button type="button" className="lab-ctl" title={T('因果链流程树：Zoom in 后从左往右生长', 'Cause chain: zoom in, then grows left to right')} aria-label={T('原理流程树', 'Principle tree')} onClick={openTree}>{T('原理', 'Principle')}</button>
              <button type="button" className={`lab-ctl ${stepMode ? 'is-on' : ''}`} title={T('按试验步骤逐段讲解', 'Walk through the test step by step')} aria-label={T('流程模式', 'Step mode')} onClick={toggleStepMode}>{T('流程', 'Steps')}</button>
              <button type="button" className={`lab-ctl ${tour ? 'is-on' : ''}`} title={T('线性巡游：局部 → 局部 → 宏观全景', 'Linear tour: part → part → whole rig')} aria-label={T('巡游', 'Tour')} onClick={toggleTour}>{T('巡游', 'Tour')}</button>
              <span className="lab-ctl-sep" data-g={T('工具', 'Tools')} />
              <button type="button" className="lab-ctl" title={T('纯净截图：隐藏全部标注，导出 2x PNG（适合做封面）', 'Clean capture: no annotations, 2x PNG for covers')} aria-label={T('纯净截图', 'Clean capture')} onClick={() => {
                const viewer = engineRef.current;
                if (!viewer) return;
                const a = document.createElement('a');
                a.href = viewer.captureClean({ scale: 2 });
                a.download = `lab-${scene.id}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
                a.click();
                setShotFlash(true);
                window.setTimeout(() => setShotFlash(false), 500);
              }}>{T('截图', 'Capture')}</button>
              <button type="button" className={`lab-ctl ${fs ? 'is-on' : ''}`} title={fs ? T('退出全屏（Esc 也可以）', 'Exit fullscreen (Esc works too)') : T('全屏查看试验台', 'View the testbed fullscreen')} aria-label={fs ? T('退出全屏', 'Exit fullscreen') : T('全屏', 'Fullscreen')} onClick={toggleFullscreen}>{fs ? T('退出全屏', 'Exit') : T('全屏', 'Fullscreen')}</button>
              <button type="button" className="lab-ctl" title={T('回到默认机位', 'Back to the default camera')} onClick={() => engineRef.current?.flyTo(scene.view.pos, scene.view.target)}>{T('复位', 'Reset')}</button>
            </div>
            <div className="lab-hud-timeline">
              <button type="button" className="lab-play" onClick={togglePlay} aria-label={playing ? '暂停' : '播放'}>
                {playing ? '❙❙' : '▶'}
              </button>
              <input type="range" min={0} max={1000} value={Math.round(timeline * 1000)} onChange={onScrub}
                style={timelineBg ? { background: timelineBg } : undefined} />
              <div className="lab-speed">
                {['0.5×', '1×', '2×'].map((sp, i) => (
                  <button key={sp} type="button" className={playSpeed === [0.5, 1, 2][i] ? 'is-on' : ''}
                    onClick={() => { const val = [0.5, 1, 2][i]; setPlaySpeed(val); if (engineRef.current) engineRef.current.playSpeed = val; }}>{sp}</button>
                ))}
              </div>
              <div className="lab-stages">
                {stageChips.map((st, i) => (
                  <button key={i} type="button" title={`${st.label} · ${st.sub}`}
                    className={`lab-stage-chip ${stage?.index === i ? 'is-active' : ''} ${st.warn ? 'is-warn' : ''}`}
                    onClick={() => {
                      engineRef.current?.setTimeline(st.at + 0.001);
                      setTimeline(st.at + 0.001);
                      const viewer = engineRef.current;
                      if (viewer && !viewer.playing) { viewer.playing = true; setPlaying(true); }
                    }}>
                    {st.label}
                  </button>
                ))}
              </div>
              <span className="lab-kbd-hint">{T('1–5 切换 · 空格播放 · C 剖切 · E 爆炸 · L 标注 · R 复位', '1–5 scenes · Space play · C section · E explode · L labels · R reset')}</span>
            </div>
            {tour && tourStep && (
              <div className="lab-tour-caption">
                <small>{T('线性巡游', 'Linear tour')} {tourStep.index + 1}/{tourStep.total}</small>
                <b>{T(tourStep.label, tourStep.labelEn || tourStep.label)}</b>
              </div>
            )}
            {stepMode && stepInfo && (
              <div className="lab-stepbar">
                <button type="button" aria-label="上一步" disabled={stepIdx === 0} onClick={() => gotoStep(stepIdx - 1)}>‹</button>
                <div className="lab-stepbar-info">
                  <small>{T('流程模式', 'Step mode')} · {stepIdx + 1} / {steps.length} · {T('←→ 翻步', '←→ to step')}</small>
                  <b>{stepInfo.title}</b>
                  <span>{stepInfo.sub}</span>
                </div>
                <button type="button" aria-label="下一步" disabled={stepIdx === steps.length - 1} onClick={() => gotoStep(stepIdx + 1)}>›</button>
              </div>
            )}
            {lineView && (
              <div className="lab-line-legend">
                <b>{T('线路视图 · 连接拓扑', 'Line view · connections')}</b>
                <span data-c="fiber">{T('光纤 / FBG', 'Fiber / FBG')}</span>
                <span data-c="signal">{T('信号 / 数据', 'Signal / data')}</span>
                <span data-c="fluid">{T('流体 / 气压', 'Fluid / gas')}</span>
                <span data-c="power">{T('电力 / 动力', 'Power')}</span>
              </div>
            )}
            {tree && (
              <div className="lab-tree" onClick={(e) => e.stopPropagation()}>
                <div className="lab-tree-head">
                  <b>▸ {tree.title}</b>
                  <button type="button" aria-label="关闭原理流程树" onClick={closeTree}>✕</button>
                </div>
                <div className="lab-tree-flow">
                  {tree.nodes.map((n, i) => (
                    <div key={i} className={`lab-tree-seg ${n.warn ? 'is-warn' : ''}`} style={{ '--d': `${0.25 + i * 0.42}s` }}>
                      {i > 0 && <span className="lab-tree-link" />}
                      <div className="lab-tree-node">
                        <b>{i + 1}</b>
                        <div>
                          <span>{n.label}</span>
                          <small>{n.sub}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {clipOn && scene.clipLegend && (
              <div className="lab-clip-legend">
                <b>{T('剖面图例', 'Section legend')}</b>
                {scene.clipLegend.map((l, i) => <span key={i}>{l}</span>)}
              </div>
            )}
            {stepMode && stepInfo && (
              <div className="lab-step-card">
                <b>{stepInfo.title}</b>
                <em>{stepInfo.sub}</em>
                {(stepInfo.detail || []).map((l, i) => <span key={i}>{l}</span>)}
                {stepInfo.tree && (
                  <button type="button" className="lab-step-tree-btn" onClick={openTree}>{T('原理流程树', 'Principle tree')} ›</button>
                )}
                <small>{T('› 下一步揭示后续原理 · Esc 退出流程', '› Next step reveals the reasoning · Esc to exit')}</small>
              </div>
            )}
            {!stepMode && hotspot && (
              <div className="lab-hotspot-card">
                <b>{hotspot.title}</b>
                {(hotspot.lines || []).map((l, i) => <span key={i}>{l}</span>)}
              </div>
            )}
          </div>

          <aside className="lab-panel">
            <div className="lab-panel-head">
              <small>{scene.n} / {scene.kicker}</small>
              <h2>{scene.titleCn}</h2>
              <p>{scene.desc}</p>
              {scene.principle && <p className="lab-principle">{scene.principle}</p>}
            </div>
            {(scene.options || []).length > 0 && (
              <div className="lab-options">
                {scene.options.map((o) => (
                  <label key={o.id}>
                    <input type="checkbox" checked={!!options[o.id]}
                      onChange={(e) => { const v = e.target.checked; setOptions((s) => ({ ...s, [o.id]: v })); engineRef.current?.setOption(o.id, v); }} />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            )}
            <dl className="lab-facts">
              {scene.facts.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <div className="lab-hs-list">
              <h3>{T('测点与构造', 'Gauges and parts')} <small>{T('点击定位 · 画布中悬停查看', 'Click to focus · hover in the scene')}</small></h3>
              <ol>
                {hsList.map((t, i) => (
                  <li key={i} onClick={() => engineRef.current?.focusHotspot(i)}>{t}</li>
                ))}
              </ol>
            </div>
          </aside>
        </section>

        <section className="lab-related">
          <span>{T('对应作品', 'RELATED WORKS')}</span>
          {RELATED.map((r) => <a key={r.slug} href={`/work/${r.slug}`}>{T(r.label, r.en)} →</a>)}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
