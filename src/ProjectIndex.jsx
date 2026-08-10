import { useMemo, useState } from 'react';
import './ProjectIndex.css';

const all=[
 {year:'2026',title:'Animating the Invisible',type:'Film / Research',label:'MA FINAL PROJECT'},
 {year:'2025',title:'WISH',type:'Game / World',label:'INTERACTIVE NARRATIVE'},
 {year:'2025',title:'Project',type:'Web / Code',label:'CREATIVE TECHNOLOGY'},
 {year:'2024',title:'Sanhe Drifters',type:'Film / Sound',label:'AUDIOVISUAL WORK'},
 {year:'2024',title:'The Panoramic Palace Museum',type:'Space / Code',label:'INTERACTIVE INSTALLATION'},
 {year:'2024',title:'Interactive Storytelling for National Railway Museum',type:'Museum / Web',label:'PUBLIC EXPERIENCE'},
 {year:'2024',title:'Student Roamer',type:'Service / Interface',label:'UX AND INTERACTION'},
 {year:'2024',title:'Yun House',type:'Web / Experience',label:'DIGITAL ENVIRONMENT'}
];
export default function ProjectIndex(){const [filter,setFilter]=useState('All');const types=['All','Film','Game','Web','Space'];const visible=useMemo(()=>filter==='All'?all:all.filter(x=>x.type.startsWith(filter)),[filter]);return <section className="project-index"><div className="index-head"><span>PROJECT INDEX / 001—008</span><div className="index-filters">{types.map(t=><button className={filter===t?'active':''} onClick={()=>setFilter(t)} key={t}>{t}</button>)}</div></div><div className="index-list">{visible.map((p,i)=><article className="index-row" key={p.title}><span className="index-number">{String(i+1).padStart(2,'0')}</span><strong>{p.title}</strong><span>{p.label}</span><small>{p.year}</small><b>-&gt;</b></article>)}</div></section>}
