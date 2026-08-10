import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ThreeField.css';

export default function ThreeField(){
  const mount=useRef(null);
  useEffect(()=>{const host=mount.current;if(!host)return;let scene,camera,renderer,frame;try{
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,host.clientWidth/host.clientHeight,.1,100);camera.position.set(0,0,8);
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;host.appendChild(renderer.domElement);
    const group=new THREE.Group();scene.add(group);
    const mats=[new THREE.MeshPhysicalMaterial({color:0xd8ff63,metalness:.65,roughness:.22,transmission:.15,transparent:true,opacity:.82,wireframe:false}),new THREE.MeshPhysicalMaterial({color:0x7e6cff,metalness:.35,roughness:.18,transmission:.35,transparent:true,opacity:.55,wireframe:true}),new THREE.MeshStandardMaterial({color:0xffa84c,metalness:.8,roughness:.25,transparent:true,opacity:.65,wireframe:true})];
    const shapes=[new THREE.IcosahedronGeometry(1.15,2),new THREE.TorusKnotGeometry(.85,.22,128,24),new THREE.OctahedronGeometry(1.4,2),new THREE.SphereGeometry(1.05,32,20)];
    shapes.forEach((geo,i)=>{const mesh=new THREE.Mesh(geo,mats[i%3]);mesh.position.set((i-1.5)*1.2,Math.sin(i)*.65,(i%2)*-.8);mesh.rotation.set(i*.5,i*.8,i*.3);mesh.scale.setScalar(i===1?1.05:.8);group.add(mesh)});
    const points=[];for(let i=0;i<180;i++)points.push((Math.random()-.5)*8,(Math.random()-.5)*5,(Math.random()-.5)*4);const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(points,3));const ps=new THREE.Points(pg,new THREE.PointsMaterial({color:0xd8ff63,size:.018,transparent:true,opacity:.7}));group.add(ps);
    scene.add(new THREE.AmbientLight(0xffffff,1.7));const key=new THREE.PointLight(0xd8ff63,16,16);key.position.set(3,3,5);scene.add(key);const rim=new THREE.PointLight(0x7468ff,13,14);rim.position.set(-4,-2,3);scene.add(rim);
    const pointer={x:0,y:0},target={x:0,y:0};const move=e=>{const r=host.getBoundingClientRect();target.x=(e.clientX-r.left)/r.width-.5;target.y=(e.clientY-r.top)/r.height-.5};window.addEventListener('pointermove',move);
    const clock=new THREE.Clock();const tick=()=>{const t=clock.getElapsedTime();pointer.x+=(target.x-pointer.x)*.035;pointer.y+=(target.y-pointer.y)*.035;group.rotation.y=t*.12+pointer.x*.35;group.rotation.x=Math.sin(t*.3)*.08+pointer.y*.18;group.position.y=Math.sin(t*.65)*.08;ps.rotation.z=-t*.025;renderer.render(scene,camera);frame=requestAnimationFrame(tick)};tick();const resize=()=>{if(!host.clientWidth)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)};window.addEventListener('resize',resize);return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);renderer.dispose();host.removeChild(renderer.domElement);shapes.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());pg.dispose();ps.material.dispose()};
  }catch(error){console.warn('ThreeField unavailable',error)}},[]);
  return <div className="three-field" ref={mount} aria-hidden="true"><div className="three-field-label">GENERATIVE STUDY / 001</div></div>;
}
