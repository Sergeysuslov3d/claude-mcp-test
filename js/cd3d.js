// Realistic CD case (three.js): clear polycarbonate case with refraction and studio reflections,
// a hinged lid, an iridescent disc with sticker art, soft contact shadow. Tap to open, drag to turn.
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { wearMap, paperBump } from './real.js';

const $=s=>document.querySelector(s);
const host=$('#world3d');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(2,devicePixelRatio)); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1; renderer.transmissionResolutionScale=1; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.VSMShadowMap;
host.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer); scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
const camera=new THREE.PerspectiveCamera(28,1,.1,200);
let camDist=56; const camTilt=1.28;   // nearly face-on, like a product shot
function placeCam(){ camera.position.set(0,Math.sin(camTilt)*camDist,Math.cos(camTilt)*camDist); camera.lookAt(0,0,0); }
function resize(){ const w=host.clientWidth, h=host.clientHeight; renderer.setSize(w,h); camera.aspect=w/h; camDist=w/h<.8?Math.min(100,40/(w/h)):56; camera.updateProjectionMatrix(); placeCam(); }
addEventListener('resize',resize);

// lights + ground that only catches shadow
const key=new THREE.DirectionalLight(0xffffff,1.3); key.position.set(-8,22,10); key.castShadow=true; key.shadow.mapSize.set(2048,2048);
Object.assign(key.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:60}); key.shadow.radius=14; key.shadow.blurSamples=24; key.shadow.bias=-.0005; scene.add(key);
scene.add(new THREE.AmbientLight(0xffffff,.2));

// render mode: '3d' (realistic, full resolution) or 'lofi' (same scene drawn in big crisp pixels)
let MODE=(()=>{ try{ return localStorage.getItem('lofi-obj-mode')||'3d'; }catch(e){ return '3d'; } })();
const PIX=4;
function applyMode(){ const lo=MODE==='lofi'; renderer.domElement.style.imageRendering=lo?'pixelated':'auto'; renderer.domElement.style.filter=lo?'saturate(1.25) contrast(1.08)':'none';
  renderer.setPixelRatio(lo?1/PIX:Math.min(2,devicePixelRatio)); renderer.shadowMap.type=lo?THREE.PCFShadowMap:THREE.VSMShadowMap; key.shadow.radius=lo?1:14; if(key.shadow.map){ key.shadow.map.dispose(); key.shadow.map=null; } renderer.shadowMap.needsUpdate=true;
  scene.traverse(o=>{ if(o.material&&o.material.needsUpdate!==undefined) o.material.needsUpdate=true; });
  // glass refraction turns into speckle at pixel size: in LO-FI draw the plastic as plain see-through instead
  // the page background lives in CSS, so refraction can't see it: draw the plastic as see-through glass in both modes
  for(const m of [plastic,frosted]){ m.transmission=0; m.transparent=true; m.opacity=lo?.28:.16; m.depthWrite=false; m.needsUpdate=true; }
  const b=document.getElementById('modeBtn'); if(b){ b.textContent=lo?'LO-FI':'3D'; b.classList.toggle('on',lo); }
  resize(); }
function setMode(m){ MODE=m; try{ localStorage.setItem('lofi-obj-mode',m); }catch(e){} applyMode(); }

const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.ShadowMaterial({opacity:.18})); ground.rotation.x=-Math.PI/2; ground.position.y=-.02; ground.receiveShadow=true;   // no floor: the case floats over the page gradient

// materials
const WEAR=wearMap(9,22);
// crystal-clear polystyrene: flat faces almost vanish, the shape reads from the bright/dark edges (see EDGE lines below)
const plastic=new THREE.MeshPhysicalMaterial({ color:0xffffff, metalness:0, roughness:.02, transmission:1, thickness:.05, ior:1.5, clearcoat:1, clearcoatRoughness:0,
  specularIntensity:1, envMapIntensity:1.3 });
// glass fresnel: clear when looked at straight on, silvery and opaque at grazing angles (walls, rims, the lid edge)
plastic.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>',
  'float fr=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.2);\n'+
  'gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(0.36,0.40,0.48),fr*0.55)+vec3(0.10)*fr;\n'+
  'gl_FragColor.a=clamp(gl_FragColor.a+fr*0.8,0.0,1.0);\n#include <dithering_fragment>'); };
const frosted=plastic.clone(); frosted.onBeforeCompile=plastic.onBeforeCompile;
const at=(m,x,y,z,rx)=>{ m.position.set(x,y,z); if(rx) m.rotation.x=rx; return m; };
const rb=(w,h,d,r,mat)=>{ const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,4,r),mat); m.castShadow=true; m.receiveShadow=true; return m; };

// ---------- the case ----------
const S=14, caseG=new THREE.Group(); scene.add(caseG);
caseG.add(at(rb(S,.28,S,.12,plastic),0,.14,0));
{ const black=new THREE.MeshPhysicalMaterial({color:'#fbf7f2',roughness:.3,metalness:0,clearcoat:1,clearcoatRoughness:.1,iridescence:.35,iridescenceIOR:1.4,roughnessMap:WEAR});
  void black; }                 // tray floor
for(const [x,z,w,d] of [[0,-S/2+.18,S,.36],[0,S/2-.18,S,.36],[-S/2+.18,0,.36,S],[S/2-.18,0,.36,S]]){ const m=rb(w,1.05,d,.12,plastic); m.position.set(x,.52,z); caseG.add(m); }   // outer walls
for(const [x,z,w,d] of [[0,-S/2+1.05,S-2.4,.16],[0,S/2-1.05,S-2.4,.16],[-S/2+1.05,0,.16,S-2.4],[S/2-1.05,0,.16,S-2.4]]){ const m=rb(w,.62,d,.06,frosted); m.position.set(x,.45,z); caseG.add(m); }   // inner rib frame
for(const [x,z] of [[0,-S/2+.7],[0,S/2-.7],[S/2-.7,0]]){ const m=rb(Math.abs(z)>1?1.8:.7,.8,Math.abs(z)>1?.7:1.8,.1,plastic); m.position.set(x,.6,z); caseG.add(m); }               // clips
// centre rosette that grips the disc
const rosette=new THREE.Group(); caseG.add(rosette);
rosette.add(at(new THREE.Mesh(new THREE.TorusGeometry(1.25,.12,16,64),plastic),0,.55,0,Math.PI/2));
for(let i=0;i<10;i++){ const t=rb(.55,.3,.18,.05,plastic), a=i/10*Math.PI*2; t.position.set(Math.cos(a)*.95,.62,Math.sin(a)*.95); t.rotation.y=-a; rosette.add(t); }

// ---------- disc ----------
const discG=new THREE.Group(); caseG.add(discG); discG.position.y=.62;
const discTop=new THREE.MeshPhysicalMaterial({ map:null, bumpMap:paperBump(6), bumpScale:.35, metalness:.05, roughness:.42, clearcoat:.5, clearcoatRoughness:.2, iridescence:.35, iridescenceIOR:1.5, iridescenceThicknessRange:[200,700], envMapIntensity:.22 });
const discEdge=new THREE.MeshPhysicalMaterial({ color:0xdfe3ec, metalness:.9, roughness:.18 });
const R=6.0, top=new THREE.Mesh(new THREE.RingGeometry(.75,R,160,1),discTop); top.rotation.x=-Math.PI/2; top.position.y=.07; top.castShadow=true; discG.add(top);
const side=new THREE.Mesh(new THREE.CylinderGeometry(R,R,.12,160,1,true),discEdge); side.castShadow=true; discG.add(side);
const under=new THREE.Mesh(new THREE.RingGeometry(.75,R,160,1),new THREE.MeshPhysicalMaterial({color:0xcfd4de,metalness:1,roughness:.12,iridescence:1,iridescenceIOR:1.8,side:THREE.DoubleSide})); under.rotation.x=Math.PI/2; under.position.y=-.06; discG.add(under);
const ringTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=512; const g=c.getContext('2d'); g.translate(256,256); g.fillStyle='rgba(255,255,255,.55)'; g.font='600 15px JetBrains Mono, monospace'; const t='LL-0019 · MADE IN LEONIDA · IFPI L019 · ', R1=200;
  for(let i=0;i<t.length*2;i++){ g.save(); g.rotate(i/(t.length*2)*Math.PI*2); g.fillText(t[i%t.length],0,-R1); g.restore(); } g.strokeStyle='rgba(255,255,255,.6)'; g.lineWidth=3; g.beginPath(); g.arc(0,0,150,0,7); g.stroke(); g.beginPath(); g.arc(0,0,236,0,7); g.stroke();
  const tx=new THREE.CanvasTexture(c); tx.colorSpace=THREE.SRGBColorSpace; return tx; })();
const clearRing=new THREE.Mesh(new THREE.RingGeometry(.75,1.9,96),new THREE.MeshPhysicalMaterial({color:0xffffff,map:ringTex,roughness:.12,transmission:.9,thickness:.1,transparent:true,opacity:.92}));
{ const uv=clearRing.geometry.attributes.uv, pos=clearRing.geometry.attributes.position; for(let i=0;i<uv.count;i++) uv.setXY(i,pos.getX(i)/3.8+.5,pos.getY(i)/3.8+.5); uv.needsUpdate=true; }
{ const rim=new THREE.Mesh(new THREE.RingGeometry(R-.22,R,160),new THREE.MeshPhysicalMaterial({color:0xe8ecf4,metalness:1,roughness:.08,iridescence:1,iridescenceIOR:2})); rim.rotation.x=-Math.PI/2; rim.position.y=.072; discG.add(rim);
  const ridge=new THREE.Mesh(new THREE.TorusGeometry(1.55,.035,8,96),new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.15,transmission:.8})); ridge.rotation.x=Math.PI/2; ridge.position.y=.08; discG.add(ridge); } clearRing.rotation.x=-Math.PI/2; clearRing.position.y=.075; discG.add(clearRing);

// sticker / pressing art drawn on a canvas, mapped onto the ring top
function rng(s){ return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }; }
function art(kind){
  const N=1024, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'), r=rng(kind.length*7919+3), C=N/2;
  const holo=(x0,y0,x1,y1)=>{ const h=g.createLinearGradient(x0,y0,x1,y1); ['#ff8ad0','#8ae8ff','#b8ff9a','#ffe68a','#c8a0ff','#ff8ad0'].forEach((cc,i)=>h.addColorStop(i/5,cc)); return h; };
  const stk=(fn,x,y,rot,s)=>{ g.save(); g.translate(x,y); g.rotate(rot); g.scale(s,s); g.shadowColor='rgba(0,0,0,.55)'; g.shadowBlur=10; g.shadowOffsetY=4; fn(); g.restore(); };
  const word=(t,size,fill)=>{ g.font='900 '+size+'px Rubik, Arial Black, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round'; g.strokeStyle='#2a0f3d'; g.lineWidth=size*.42; g.strokeText(t,0,0); g.strokeStyle='#fff'; g.lineWidth=size*.24; g.strokeText(t,0,0); g.fillStyle=fill; g.fillText(t,0,0); };
  const star=(R1,R2)=>{ g.beginPath(); for(let j=0;j<10;j++){ const a=j*Math.PI/5-Math.PI/2, rr=j%2?R2:R1; g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } g.closePath(); };
  if(kind==='stickers'){
    { const bg=g.createLinearGradient(0,0,N,N); ['#ff3d8b','#ff6f4f','#ffa63d'].forEach((cc,i)=>bg.addColorStop(i/2,cc)); g.fillStyle=bg; g.fillRect(0,0,N,N); }
    stk(()=>word('LOFI',120,holo(-130,-40,130,40)),C-60,C-280,-.12,1);
    { const brand=(window.LabelText?LabelText.get():'LEONIDA'), sz=Math.max(46,Math.min(100,100*7/Math.max(7,brand.length))); stk(()=>word(brand,sz,holo(-200,-30,200,30)),C+40,C+250,.08,1); }
    stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-115,-42,230,84,42); g.fill(); g.fillStyle='#ff4fa0'; g.beginPath(); g.roundRect(-104,-32,208,64,32); g.fill(); g.fillStyle='#fff'; g.font='800 36px Rubik, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('VICE CITY',0,2); },C+250,C-100,.3,1);
    stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.arc(0,0,104,0,7); g.fill(); const sg=g.createLinearGradient(0,-92,0,92); sg.addColorStop(0,'#ffd27a'); sg.addColorStop(1,'#ff4fa0'); g.fillStyle=sg; g.beginPath(); g.arc(0,0,92,0,7); g.fill(); g.fillStyle='#2a0f3a'; for(let k=0;k<4;k++) g.fillRect(-100,16+k*18,200,5+k*2); },C-270,C+40,0,1);
    stk(()=>{ g.fillStyle='#fff'; g.font='900 150px Rubik, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('♥',0,0); g.fillStyle=holo(-60,-60,60,60); g.font='900 120px Rubik, sans-serif'; g.fillText('♥',0,4); },C-180,C-140,-.25,1);
    for(const [x,y,s] of [[C+250,C+100,1.6],[C-100,C+370,1.1],[C+150,C-370,1],[C-370,C-180,.9],[C+340,C+300,.8]]) stk(()=>{ g.fillStyle='#fff'; star(38,16); g.fill(); g.fillStyle=holo(-30,-30,30,30); star(30,12); g.fill(); },x,y,r()*.6,s);
    stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-96,-60,192,120,16); g.fill(); g.fillStyle='#7a5aff'; g.beginPath(); g.roundRect(-86,-50,172,100,12); g.fill(); g.fillStyle='#fff4fa'; g.fillRect(-70,-40,140,30); g.fillStyle='#14101e'; for(const xx of [-36,36]){ g.beginPath(); g.arc(xx,20,18,0,7); g.fill(); } g.fillStyle='#fff'; for(const xx of [-36,36]){ g.beginPath(); g.arc(xx,20,6,0,7); g.fill(); } },C+200,C+350,-.35,.9);
    stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-76,-76,152,152,22); g.fill(); for(let i=0;i<4;i++) for(let j=0;j<4;j++){ g.fillStyle=(i+j)%2?'#14101e':'#ffffff'; g.fillRect(-66+i*33,-66+j*33,33,33); } },C-330,C+250,.2,.75);
    stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-100,-36,200,72,36); g.fill(); g.fillStyle='#2ad0c8'; g.font='900 42px Rubik, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('SIDE A',0,3); },C+70,C-150,-.05,.85);
  } else if(kind==='gold'){
    const gg=g.createRadialGradient(C*.8,C*.7,30,C,C,C); gg.addColorStop(0,'#ff8ad0'); gg.addColorStop(.55,'#a24dff'); gg.addColorStop(1,'#4a1fa8'); g.fillStyle=gg; g.fillRect(0,0,N,N);
    g.strokeStyle='rgba(255,255,255,.6)'; g.lineWidth=4; g.beginPath(); g.arc(C+250,C+110,80,0,7); g.stroke(); g.beginPath(); g.arc(C+250,C+110,14,0,7); g.stroke();
    g.strokeRect(C-260,C-50,100,74); g.beginPath(); g.arc(C-210,C-13,20,0,7); g.stroke(); g.beginPath(); g.moveTo(C-270,C-240); g.lineTo(C-100,C-240); g.stroke();
    g.font='700 30px JetBrains Mono, monospace'; g.fillStyle='rgba(255,255,255,.9)'; g.textAlign='center'; g.fillText('NEON NIGHT · LEONIDA',C,C+230);
  } else if(kind==='pearl'){
    const pg=g.createConicGradient(0,C,C); ['#f6c8dc','#e8b0d0','#f8e0ec','#d8a8d8','#f6c8dc'].forEach((cc,i)=>pg.addColorStop(i/4,cc)); g.fillStyle=pg; g.fillRect(0,0,N,N);
    g.font='900 italic 86px Rubik, sans-serif'; g.textAlign='center'; g.fillStyle='#fff'; g.strokeStyle='#d0508e'; g.lineWidth=7; g.strokeText('sunset strip',C,C-250); g.fillText('sunset strip',C,C-250);
  } else {
    const sg=g.createConicGradient(.6,C,C); ['#e8fbff','#7fe3dc','#ffffff','#5ccbe8','#e8fbff','#9fe8d8','#e8fbff'].forEach((cc,i)=>sg.addColorStop(i/6,cc)); g.fillStyle=sg; g.fillRect(0,0,N,N);
    g.font='800 48px Rubik, sans-serif'; g.textAlign='center'; g.fillStyle='#0d4a5a'; g.fillText('LEONIDA KEYS',C,C+290);
  }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return {tex:t,url:c.toDataURL('image/jpeg',.8)};
}
const DISCS=[ {id:'stickers',name:'Vice Beach',style:'jazzhop',metal:.05,irid:.12}, {id:'gold',name:'Neon Night',style:'synth',metal:.5,irid:.5},
  {id:'pearl',name:'Pink Pearl',style:'bossa',metal:.25,irid:.9}, {id:'silver',name:'Leonida Keys',style:'ambient',metal:.8,irid:.8} ].map(d=>Object.assign(d,art(d.id)));
// RingGeometry UVs are planar in (-R..R), remap so the square art covers the disc
{ const uv=top.geometry.attributes.uv, pos=top.geometry.attributes.position; for(let i=0;i<uv.count;i++){ uv.setXY(i,pos.getX(i)/(2*R)+.5,pos.getY(i)/(2*R)+.5); } uv.needsUpdate=true; }


// front booklet behind the clear lid: a Leonida sunset postcard (GTA 6 palette)
function coverTex(){
  const N=1400, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d');
  const sky=g.createLinearGradient(0,0,0,N*.62); ['#5b2ca8','#c63fa0','#ff5f8a','#ff9a5a','#ffd27a'].forEach((cc,i)=>sky.addColorStop(i/4,cc)); g.fillStyle=sky; g.fillRect(0,0,N,N);
  // striped sun
  g.save(); g.beginPath(); g.arc(N*.5,N*.6,N*.26,Math.PI,0); g.clip(); const sg=g.createLinearGradient(0,N*.34,0,N*.6); sg.addColorStop(0,'#fff3a8'); sg.addColorStop(1,'#ff7a6a'); g.fillStyle=sg; g.fillRect(0,0,N,N);
  g.globalCompositeOperation='destination-out'; for(let i=0;i<7;i++){ const y=N*.47+i*i*3.2+i*12; g.fillRect(0,y,N,4+i*2.4); } g.restore();
  // sea
  const sea=g.createLinearGradient(0,N*.6,0,N); sea.addColorStop(0,'#2fd5c6'); sea.addColorStop(1,'#1b4fa8'); g.fillStyle=sea; g.fillRect(0,N*.6,N,N*.4);
  g.fillStyle='rgba(255,240,200,.55)'; for(let i=0;i<14;i++){ const w=N*.36*(1-i/16), y=N*.62+i*i*1.6+i*10; g.fillRect(N*.5-w/2,y,w,3+i*.4); }
  // palms
  const palm=(x,y,s,lean)=>{ g.save(); g.translate(x,y); g.scale(s,s); g.fillStyle='#2a0f3d'; g.beginPath(); g.moveTo(-9,0); g.quadraticCurveTo(lean*.5,-260,lean,-520); g.lineTo(lean+10,-520); g.quadraticCurveTo(lean*.5+14,-260,9,0); g.fill();
    g.translate(lean+5,-520); for(let i=0;i<9;i++){ g.save(); g.rotate(-2.9+i*.72); g.beginPath(); g.moveTo(0,0); g.quadraticCurveTo(110,-40,230,30); g.quadraticCurveTo(110,-10,0,10); g.fill(); g.restore(); } g.restore(); };
  palm(N*.1,N*.98,1.15,60); palm(N*.22,N*1.02,.8,-30); palm(N*.9,N*.99,1.25,-70);
  // title
  g.textAlign='center'; g.textBaseline='alphabetic'; g.lineJoin='round';
  const brand=(window.LabelText?LabelText.get():'LEONIDA'); let bs=190; g.font='italic 900 '+bs+'px Rubik, Arial Black, sans-serif'; while(bs>70&&g.measureText(brand).width>N*.86){ bs-=5; g.font='italic 900 '+bs+'px Rubik, Arial Black, sans-serif'; } g.strokeStyle='#2a0f3d'; g.lineWidth=bs*.115; g.strokeText(brand,N/2,N*.25); const tg=g.createLinearGradient(0,N*.13,0,N*.25); tg.addColorStop(0,'#ffffff'); tg.addColorStop(1,'#ffd1e6'); g.fillStyle=tg; g.fillText(brand,N/2,N*.25);
  g.font='800 64px Rubik, sans-serif'; g.fillStyle='#fff'; g.fillText('L O F I   S E S S I O N S',N/2,N*.105);
  g.font='700 34px JetBrains Mono, monospace'; g.fillStyle='rgba(255,255,255,.9)'; g.textAlign='left'; g.fillText('VICE CITY · 2026',60,N-50); g.textAlign='right'; g.fillText('SIDE A + B',N-60,N-50);
  g.strokeStyle='rgba(255,255,255,.85)'; g.lineWidth=6; g.strokeRect(30,30,N-60,N-60);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t;
}

// ---------- lid on its hinge ----------
const hinge=new THREE.Group(); hinge.position.set(-S/2,1.08,0); caseG.add(hinge);
const lid=new THREE.Group(); lid.position.set(S/2,0,0); hinge.add(lid);
lid.add(at(rb(S,.22,S,.1,plastic),0,.11,0));
for(const [x,z,w,d] of [[0,-S/2+.55,S-.4,.5],[0,S/2-.55,S-.4,.5],[-S/2+.55,0,.5,S-.4],[S/2-.55,0,.5,S-.4]]){ const m=rb(w,.34,d,.08,frosted); m.position.set(x,.3,z); lid.add(m); }
for(const z of [-4.6,4.6]){ const k=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,2.2,24),plastic); k.rotation.x=Math.PI/2; k.position.set(-S/2+.05,.05,z); k.castShadow=true; lid.add(k);
  const pin=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,2.5,16),frosted); pin.rotation.x=Math.PI/2; pin.position.set(-S/2+.05,.05,z); lid.add(pin); }
{ const tab=rb(.5,.2,2.6,.08,plastic); tab.position.set(S/2+.15,.1,0); lid.add(tab); }
// booklet sits under the clear lid, held by the lid's tabs, so it lifts away when the case opens
{ const bookMat=new THREE.MeshPhysicalMaterial({map:coverTex(),bumpMap:paperBump(7),bumpScale:.25,roughness:.55,clearcoat:.4,clearcoatRoughness:.25,side:THREE.DoubleSide});
  const bk=new THREE.Mesh(new THREE.PlaneGeometry(S-.9,S-.9),bookMat);
  // custom label word: redraw the cover and the sticker disc
  if(window.LabelText) LabelText.on(()=>{ bookMat.map=coverTex(); bookMat.needsUpdate=true; const d=DISCS[0]; Object.assign(d,art(d.id));
    if(cur===0){ discTop.map=d.tex; discTop.needsUpdate=true; } const c=document.querySelector('#chips .chip'); if(c) c.style.backgroundImage='url('+d.url+')'; });
  bk.rotation.x=-Math.PI/2; bk.position.set(0,-.015,0); bk.receiveShadow=true; lid.add(bk); }

// ---------- interaction ----------
let rotY=-.35, tilt=0, vY=0, drag=null, moved=0, open=false, lidA=0, lift=0, playing=false, spin=0, cur=0;
const el=renderer.domElement;
el.addEventListener('pointerdown',e=>{ el.setPointerCapture(e.pointerId); drag={x:e.clientX,y:e.clientY}; moved=0; el.style.cursor='grabbing'; });
el.addEventListener('pointermove',e=>{ if(!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.x=e.clientX; drag.y=e.clientY; moved+=Math.abs(dx)+Math.abs(dy); vY=dx*.008; rotY+=vY; tilt=Math.max(-.5,Math.min(.5,tilt+dy*.004)); });
const up=()=>{ if(!drag) return; drag=null; el.style.cursor='grab'; if(moved<6) toggle(); };
el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up); el.style.cursor='grab';
addEventListener('wheel',e=>{ e.preventDefault(); camDist=Math.max(26,Math.min(70,camDist*(e.deltaY>0?1.06:.94))); placeCam(); },{passive:false});
function toggle(f){ open=f==null?!open:f; }

const clock=new THREE.Clock();
function frame(){ requestAnimationFrame(frame); const dt=Math.min(.05,clock.getDelta()), t=clock.elapsedTime;
  if(!drag){ rotY+=vY; vY*=.93; rotY+=(-.35+Math.sin(t*.15)*.18-rotY)*.004; tilt*=.97; }
  caseG.rotation.set(tilt,rotY,0); caseG.position.y=Math.sin(t*.55)*.12;
  lidA+=((open?1:0)-lidA)*Math.min(1,dt*1.5); hinge.rotation.z=lidA*1.95;
  lift+=((open?1:0)-lift)*Math.min(1,dt*1.1); discG.position.y=.62+lift*1.5;
  spin+=(((open&&playing)?1:0)-spin)*Math.min(1,dt*.8); discG.rotation.y-=spin*dt*2;
  renderer.render(scene,camera); }
// crisp edges of the clear plastic: a dark line plus a light line on every hard edge, like the rim of glass
{ const dark=new THREE.LineBasicMaterial({color:'#4d5566',transparent:true,opacity:.8}), light=new THREE.LineBasicMaterial({color:'#ffffff',transparent:true,opacity:1});
  const meshes=[]; caseG.traverse(o=>{ if(o.isMesh&&(o.material===plastic||o.material===frosted)) meshes.push(o); });
  for(const m of meshes){ const eg=new THREE.EdgesGeometry(m.geometry,28); m.add(new THREE.LineSegments(eg,dark)); const hl=new THREE.LineSegments(eg,light); hl.scale.setScalar(1.004); m.add(hl); } }
applyMode(); frame();

// ---------- pill + music ----------
const chips=$('#chips');
DISCS.forEach((d,i)=>{ const b=document.createElement('button'); b.className='chip'; b.style.backgroundImage='url('+d.url+')'; b.title=d.name; b.setAttribute('aria-label','Play '+d.name); b.onclick=()=>load(i,true); chips.appendChild(b); });
function load(i,play){ cur=i; const d=DISCS[i]; discTop.map=d.tex; discTop.metalness=d.metal; discTop.iridescence=d.irid; discTop.needsUpdate=true; [...chips.children].forEach((b,k)=>b.classList.toggle('on',k===i));
  if(play){ toggle(true); if(!Lofi.ctx){ Lofi.init(); Lofi.setVolume(.8); } Lofi.setStyle(d.style); Lofi.playSeed(Math.floor(Math.random()*9000)+100,d.style); } }
load(0,false);
Lofi.on('track',T=>{ const n=$('#now'); n.innerHTML='<b></b> · '; n.firstChild.textContent=T.name; n.append(DISCS[cur].name); });
Lofi.on('state',S=>{ playing=S.playing; $('#play').textContent=S.playing?'❚❚':'▶'; });
$('#play').onclick=()=>{ if(!Lofi.ctx){ load(cur,true); return; } if(Lofi.state.playing) Lofi.pause(); else { toggle(true); Lofi.play(); } };
$('#next').onclick=()=>{ if(!Lofi.ctx) return load(cur,true); Lofi.next(); };
$('#open').onclick=()=>toggle();
{ const b=document.getElementById('modeBtn'); if(b) b.onclick=()=>setMode(MODE==='lofi'?'3d':'lofi'); }
addEventListener('keydown',e=>{ if(e.code==='Space'){ e.preventDefault(); $('#play').click(); } else if(e.key==='ArrowRight') load((cur+1)%DISCS.length,true); else if(e.key==='ArrowLeft') load((cur+DISCS.length-1)%DISCS.length,true); else if(e.key==='o') toggle(); });
