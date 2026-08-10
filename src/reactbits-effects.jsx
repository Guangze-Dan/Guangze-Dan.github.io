import React, { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* 文字动效                                                              */
/* ------------------------------------------------------------------ */

/* SplitText：字符依次展开进场（滚动进入视口时触发） */
export function SplitText({ children, as: Tag = 'span', className = '', delay = 34, threshold = 0.3 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  const text = String(children);
  return (
    <Tag ref={ref} className={`rb-split ${className} ${visible ? 'is-in' : ''}`} aria-label={text}>
      {text.split('').map((ch, index) => (
        <span className="rb-split-char" key={index} style={{ transitionDelay: `${index * delay}ms` }}>
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </Tag>
  );
}

/* BlurText：字符从模糊到清晰进场 */
export function BlurText({ children, as: Tag = 'span', className = '', delay = 45, threshold = 0.3 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  const text = String(children);
  return (
    <Tag ref={ref} className={`rb-blur ${className} ${visible ? 'is-in' : ''}`} aria-label={text}>
      {text.split('').map((ch, index) => (
        <span className="rb-blur-char" key={index} style={{ transitionDelay: `${index * delay}ms` }}>
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </Tag>
  );
}

/* WordReveal：单词依次上浮显现 */
export function WordReveal({ children, className = '', delay = 70 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const words = String(children).split(/\s+/).filter(Boolean);
  return (
    <span ref={ref} className={`rb-words ${className} ${visible ? 'is-in' : ''}`} aria-label={String(children)}>
      {words.map((word, index) => (
        <span className="rb-words-item" key={index} style={{ transitionDelay: `${index * delay}ms` }}>
          {word}
        </span>
      ))}
    </span>
  );
}

/* ShinyText：流光扫过文字 */
export function ShinyText({ children, className = '', speed = 3.2 }) {
  return <span className={`rb-shiny ${className}`} style={{ '--shine-speed': `${speed}s` }}>{children}</span>;
}

/* GradientText：主题色渐变文字 */
export function GradientText({ children, className = '', from = '#d9ff58', via = '#262d62', to = '#d56b83' }) {
  return <span className={`rb-gradient ${className}`} style={{ backgroundImage: `linear-gradient(115deg, ${from}, ${via}, ${to})` }}>{children}</span>;
}

/* RotatingText：圆形环绕文字徽章 */
export function RotatingText({ text = 'SCROLL TO EXPLORE \u00B7 \u5411\u4e0b\u63a2\u7d22 \u00B7 ', className = '' }) {
  return (
    <div className={`rb-rotating ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <path id="rb-circle-path" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className="rb-rotating-text">
          <textPath href="#rb-circle-path">{text}</textPath>
        </text>
      </svg>
    </div>
  );
}

/* TextPressure：画布压力文字（鼠标靠近时字符纵向拉伸） */
export function TextPressure({ text = '', className = '', fontSize = 90, fontWeight = 600, pressure = 0.62, maxFontSize = 120 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;
    const ctx = canvas.getContext('2d');
    const pointer = { x: -999, y: -999, active: false };
    let width = 0;
    let height = 0;
    let frame;
    const chars = text.split('');
    const charMetrics = [];

    const layout = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const parentWidth = Math.min(window.innerWidth * 0.84, 1600);
      ctx.font = `${fontWeight} ${fontSize}px "DM Mono", "Space Grotesk", sans-serif`;
      const total = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0);
      let scale = 1;
      if (total > parentWidth && total > 0) scale = parentWidth / total;
      const drawSize = Math.round(fontSize * scale);
      ctx.font = `${fontWeight} ${drawSize}px "DM Mono", "Space Grotesk", sans-serif`;
      width = Math.round(total * scale);
      height = Math.round(drawSize * 1.08);
      wrap.style.width = `${width}px`;
      wrap.style.height = `${height}px`;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      charMetrics.length = 0;
      const measured = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0);
      let x = (width - measured) / 2;
      chars.forEach((ch) => {
        const w = ctx.measureText(ch).width;
        charMetrics.push({ ch, x: x + w / 2, w });
        x += w;
      });
    };

    const onMove = (event) => {
      const rect = wrap.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'currentColor';
      charMetrics.forEach(({ ch, x, w }) => {
        const dist = pointer.active ? Math.max(0, Math.abs(pointer.x - x) - w / 2) : 9999;
        const influence = Math.max(0, 1 - dist / (width * 0.16));
        const scale = 1 + influence * pressure;
        ctx.save();
        ctx.translate(x, height / 2);
        ctx.scale(1, scale);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      });
      frame = requestAnimationFrame(draw);
    };

    layout();
    const onResize = () => { layout(); };
    window.addEventListener('resize', onResize);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [text, fontSize, fontWeight, pressure]);
  return (
    <span ref={wrapRef} className={`rb-pressure ${className}`} style={{ fontSize: `${maxFontSize}px` }}>
      <canvas ref={canvasRef} aria-label={text} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 卡片交互                                                              */
/* ------------------------------------------------------------------ */

/* SpotlightCard：鼠标聚光跟随 */
export function SpotlightCard({ children, className = '', radius = 340 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      el.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, []);
  return (
    <div ref={ref} className={`rb-spotlight ${className}`} style={{ '--spot-radius': `${radius}px` }}>
      {children}
    </div>
  );
}

/* TiltedCard：3D 倾斜（跟随鼠标，仅悬停时运行动画循环） */
export function TiltedCard({ children, className = '', max = 9 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let frame;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let running = false;
    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      cx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      cy = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };
    const onLeave = () => { cx = 0; cy = 0; };
    const tick = () => {
      tx += (cx - tx) * 0.14;
      ty += (cy - ty) * 0.14;
      el.style.transform = `perspective(950px) rotateX(${(-ty * max).toFixed(2)}deg) rotateY(${(tx * max).toFixed(2)}deg) scale3d(1.02,1.02,1)`;
      if (Math.abs(tx) > 0.001 || Math.abs(ty) > 0.001 || Math.abs(cx) > 0.001 || Math.abs(cy) > 0.001) {
        frame = requestAnimationFrame(tick);
      } else {
        el.style.transform = 'perspective(950px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        running = false;
      }
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [max]);
  return <div ref={ref} className={`rb-tilt ${className}`}>{children}</div>;
}

/* GlareHover：悬停扫光（配合 CSS） */
export function GlareHover({ children, className = '' }) {
  return <div className={`rb-glare ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* 光标 / 按钮                                                           */
/* ------------------------------------------------------------------ */

/* Magnet：磁吸效果 */
export function Magnet({ children, className = '', strength = 0.32 }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return undefined;
    const onMove = (event) => {
      const rect = wrap.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      inner.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    };
    const onLeave = () => {
      inner.style.transform = 'translate(0, 0)';
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    return () => {
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);
  return (
    <span ref={wrapRef} className={`rb-magnet ${className}`}>
      <span ref={innerRef} className="rb-magnet-inner">{children}</span>
    </span>
  );
}

/* CustomCursor：自定义圆点 + 跟随圆环 */
export function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    setEnabled(true);
    const dot = dotRef.current;
    const ring = ringRef.current;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let frame;
    const onMove = (event) => {
      mx = event.clientX;
      my = event.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    };
    const onOver = (event) => {
      const target = event.target;
      const interactive = target && target.closest && target.closest('a, button, input, video, [role="button"], .m-project, .m-service');
      ring.classList.toggle('is-hover', Boolean(interactive));
    };
    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      frame = requestAnimationFrame(tick);
    };
    document.documentElement.classList.add('rb-cursor-on');
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, true);
    frame = requestAnimationFrame(tick);
    return () => {
      document.documentElement.classList.remove('rb-cursor-on');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver, true);
      cancelAnimationFrame(frame);
    };
  }, []);
  if (!enabled) return null;
  return (
    <>
      <div ref={dotRef} className="rb-cursor rb-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="rb-cursor rb-cursor-ring" aria-hidden="true" />
    </>
  );
}

/* TrailCursor：光点拖尾 */
export function TrailCursor({ count = 16, maxAge = 52 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = canvas.getContext('2d');
    const points = [];
    let frame;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const onMove = (event) => {
      mx = event.clientX;
      my = event.clientY;
      points.push({ x: mx, y: my, age: 0 });
      if (points.length > count) points.shift();
    };
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const point of points) {
        point.age += 1;
        const life = Math.max(0, 1 - point.age / maxAge);
        ctx.globalAlpha = life * 0.55;
        ctx.fillStyle = '#d9ff58';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1 + life * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      while (points.length && points[0].age >= maxAge) points.shift();
      frame = requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, [count, maxAge]);
  return <canvas ref={canvasRef} className="rb-trail" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* 页面氛围                                                              */
/* ------------------------------------------------------------------ */

/* ScrollProgress：顶部阅读进度条 */
export function ScrollProgress() {
  const barRef = useRef(null);
  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      barRef.current.style.transform = `scaleX(${max > 0 ? root.scrollTop / max : 0})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return <div ref={barRef} className="rb-scroll-progress" aria-hidden="true" />;
}

/* Noise：全屏噪点质感 */
export function Noise({ opacity = 0.05 }) {
  return <div className="rb-noise" style={{ opacity }} aria-hidden="true" />;
}

/* ClickSpark：点击火花 */
export function ClickSpark() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = canvas.getContext('2d');
    const colors = ['#d9ff58', '#f1f0eb', '#d56b83', '#262d62'];
    let particles = [];
    let frame;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const onClick = (event) => {
      const count = 10;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
        const speed = 1.8 + Math.random() * 3.2;
        particles.push({
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: colors[i % colors.length],
        });
      }
      if (particles.length > 140) particles.splice(0, particles.length - 140);
    };
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.09;
        p.vx *= 0.96;
        p.life -= 0.028;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2.6, 2.6);
      }
      frame = requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('click', onClick);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', onClick);
    };
  }, []);
  return <canvas ref={canvasRef} className="rb-click-spark" aria-hidden="true" />;
}

/* Aurora：极光背景 */
export function Aurora({ className = '' }) {
  return (
    <div className={`rb-aurora ${className}`} aria-hidden="true">
      <span className="rb-aurora-blob rb-aurora-a" />
      <span className="rb-aurora-blob rb-aurora-b" />
      <span className="rb-aurora-blob rb-aurora-c" />
    </div>
  );
}
