import { useEffect, useRef, useState } from 'react';
import './DriftWall.css';

const DriftWall = ({ items, columns = 4, speed = 18, pauseOnHover = false }) => {
  const root = useRef(null); const [hovered, setHovered] = useState(null);
  const groups = Array.from({ length: columns }, (_, c) => items.filter((_, i) => i % columns === c));
  useEffect(() => { const el=root.current; if(!el||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return; let frame,last=performance.now(),offset=0; const tick=now=>{const dt=(now-last)/1000;last=now;if(!(pauseOnHover&&hovered!==null)){offset=(offset+dt*speed)%360;el.style.setProperty('--drift-offset',`${offset}px`)}frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[speed,pauseOnHover,hovered]);
  return <div ref={root} className="drift-wall" onPointerLeave={()=>setHovered(null)}><div className="drift-plane">{groups.map((group,c)=><div className="drift-column" key={c}><div className="drift-track" style={{animationDuration:`${22+c*4}s`,animationDirection:c%2?'reverse':'normal'}}>{[...group,...group,...group].map((item,i)=><a className={`drift-tile ${hovered===`${c}-${i}`?'active':''}`} key={`${c}-${i}`} href={item.href||'#work'} onPointerEnter={()=>setHovered(`${c}-${i}`)}><img src={item.image} alt=""/><span>{item.title}</span><b>{item.id}</b></a>)}</div></div>)}</div><div className="drift-caption"><span>DRIFT WALL / SELECTED WORK</span><span>HOVER TO PAUSE / DRAG TO EXPLORE</span></div></div>;
};
export default DriftWall;
