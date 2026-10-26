// Realistic cassette (three.js): translucent pink shell with real thickness, printed holo label
// with a clear window, reels and tape packs inside that wind with the song, metal screws,
// studio reflections and a soft shadow. Drag to rotate, scroll to zoom.
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { wearMap, paperBump, windowInsert } from './real.js';

const $=s=>document.querySelector(s);
const host=$('#world3d');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(2,devicePixelRatio)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.VSMShadowMap; host.appendChild(renderer.domElement);
const scene=new THREE.Scene();
scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;
const camera=new THREE.PerspectiveCamera(30,1,.1,200); let dist=26;
function placeCam(){ camera.position.set(0,2.2,dist); camera.lookAt(0,-.4,0); }
function resize(){ const w=host.clientWidth, h=host.clientHeight; renderer.setSize(w,h); camera.aspect=w/h;
  // leave room for the tape shelf on the right: look a bit to the right so the cassette sits left of centre
  if(document.body.classList.contains('has-shelf')&&w>900) camera.setViewOffset(w,h,Math.min(150,w*.11),0,w,h); else camera.clearViewOffset(); if(w/h<.8) dist=Math.max(dist,Math.min(60,25/(w/h))); camera.updateProjectionMatrix(); placeCam(); }
addEventListener('resize',resize);
const key=new THREE.DirectionalLight(0xffffff,1.4); key.position.set(-6,14,10); key.castShadow=true; key.shadow.mapSize.set(2048,2048); Object.assign(key.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:1,far:50}); key.shadow.radius=14; key.shadow.blurSamples=24; scene.add(key);
scene.add(new THREE.AmbientLight(0xffffff,.25));

// render mode: '3d' (realistic, full resolution) or 'lofi' (same scene drawn in big crisp pixels)
let MODE=(()=>{ try{ return localStorage.getItem('lofi-obj-mode')||'3d'; }catch(e){ return '3d'; } })();
const PIX=4;
function applyMode(){ const lo=MODE==='lofi'; renderer.domElement.style.imageRendering=lo?'pixelated':'auto'; renderer.domElement.style.filter=lo?'saturate(1.25) contrast(1.08)':'none';
  renderer.setPixelRatio(lo?1/PIX:Math.min(2,devicePixelRatio)); renderer.shadowMap.type=lo?THREE.PCFShadowMap:THREE.VSMShadowMap; key.shadow.radius=lo?1:14; if(key.shadow.map){ key.shadow.map.dispose(); key.shadow.map=null; } renderer.shadowMap.needsUpdate=true;
  scene.traverse(o=>{ if(o.material&&o.material.needsUpdate!==undefined) o.material.needsUpdate=true; });
  const b=document.getElementById('modeBtn'); if(b){ b.textContent=lo?'LO-FI':'3D'; b.classList.toggle('on',lo); }
  resize(); }
function setMode(m){ MODE=m; try{ localStorage.setItem('lofi-obj-mode',m); }catch(e){} applyMode(); }

const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({opacity:.12})); ground.rotation.x=-Math.PI/2; ground.position.y=-5.4; ground.receiveShadow=true; scene.add(ground);

// ---------- shell ----------
const W=10, H=6.3, D=1.2, tape=new THREE.Group(); scene.add(tape);
function rrect(w,h,r){ const s=new THREE.Shape(); s.moveTo(-w/2+r,-h/2); s.lineTo(w/2-r,-h/2); s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r); s.lineTo(w/2,h/2-r); s.quadraticCurveTo(w/2,h/2,w/2-r,h/2); s.lineTo(-w/2+r,h/2); s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r); s.lineTo(-w/2,-h/2+r); s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2); return s; }
const WEAR=wearMap(5,40);
const RIDGES=(()=>{ const c=document.createElement('canvas'); c.width=64; c.height=8; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,64,8);
  for(let i=0;i<8;i++){ const gr=g.createLinearGradient(i*8,0,i*8+8,0); gr.addColorStop(0,'#fff'); gr.addColorStop(.5,'#555'); gr.addColorStop(1,'#fff'); g.fillStyle=gr; g.fillRect(i*8,0,8,8); }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1.4,1); return t; })();
const shellMat=new THREE.MeshPhysicalMaterial({ bumpMap:RIDGES, bumpScale:1.2, roughnessMap:WEAR, color:'#f7f3ee', metalness:0, roughness:.42, clearcoat:.35, clearcoatRoughness:.3, sheen:.2, envMapIntensity:.7 });
// both halves have the window opening cut through (the real thing: you can see right through the tape)
function shellShape(){ const s=rrect(W,H,.42), w=new THREE.Path(), x0=-2.85, x1=2.85, y0=-.22, y1=1.32, r=.3;
  w.moveTo(x0+r,y0); w.lineTo(x1-r,y0); w.quadraticCurveTo(x1,y0,x1,y0+r); w.lineTo(x1,y1-r); w.quadraticCurveTo(x1,y1,x1-r,y1); w.lineTo(x0+r,y1); w.quadraticCurveTo(x0,y1,x0,y1-r); w.lineTo(x0,y0+r); w.quadraticCurveTo(x0,y0,x0+r,y0);
  s.holes.push(w); return s; }
// edges stay smooth (ridges only on the faces), otherwise the top edge looks hatched
const shellSide=shellMat.clone(); shellSide.bumpMap=null;
const half=(z)=>{ const g=new THREE.ExtrudeGeometry(shellShape(),{depth:D/2-.04,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:3,curveSegments:12}); const m=new THREE.Mesh(g,[shellMat,shellSide]); m.position.z=z; m.castShadow=true; return m; };
tape.add(half(-D/2+.04)); tape.add(half(.04));
{ const glass=new THREE.MeshStandardMaterial({color:'#d8d0e4',roughness:.35,metalness:0,envMapIntensity:.12,transparent:true,opacity:.07,depthWrite:false});   // faint window plastic: no white glare at an angle
  for(const z of [D/2-.05,-D/2+.05]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(5.7,1.54),glass); p.position.set(0,.55,z); tape.add(p); } }
// seam between the two halves: a thin rim only, tinted like the shell
const seamMat=new THREE.MeshStandardMaterial({color:'#d9d2ca',roughness:.6});
{ const sh=rrect(W+.02,H+.02,.43), hole=rrect(W-.24,H-.24,.3); sh.holes.push(hole); const seam=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.03,bevelEnabled:false}),seamMat); seam.position.z=-.015; tape.add(seam); }
// raised trapezoid at the bottom front with its holes
{ const s=new THREE.Shape(); s.moveTo(-3.3,-H/2+.02); s.lineTo(3.3,-H/2+.02); s.lineTo(2.85,-H/2+1.35); s.lineTo(-2.85,-H/2+1.35); s.closePath();
  const t=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.14,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2}),shellMat); t.position.z=D/2; t.castShadow=true; tape.add(t);
  const holeMat=new THREE.MeshStandardMaterial({color:'#2a2433',roughness:.6});
  for(const [x,r] of [[-1.9,.36],[1.9,.36],[-.7,.16],[.7,.16]]){ const h=new THREE.Mesh(new THREE.CircleGeometry(r,32),holeMat); h.position.set(x,-H/2+.68,D/2+.19); tape.add(h); } }
// screws
{ const metal=new THREE.MeshPhysicalMaterial({color:'#d8dbe4',metalness:1,roughness:.22}), slot=new THREE.MeshStandardMaterial({color:'#4a4e5e'});
  for(const [x,y] of [[-W/2+.45,H/2-.45],[W/2-.45,H/2-.45],[-W/2+.45,-H/2+.45],[W/2-.45,-H/2+.45],[0,-H/2+.32]]){ const s=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.08,24),metal); s.rotation.x=Math.PI/2; s.position.set(x,y,D/2+.05); tape.add(s);
    const sl=new THREE.Mesh(new THREE.BoxGeometry(.26,.05,.02),slot); sl.position.set(x,y,D/2+.1); sl.rotation.z=.7; tape.add(sl); } }

// ---------- inside: reels + tape packs ----------
const reelY=.55, reels=[], packs=[], tapePaths=[];
const packMat=new THREE.MeshStandardMaterial({color:'#3a1a12',roughness:.55,metalness:.1});
// the wound tape: near-black, glossy, with fine concentric rings (as on a real pack)
const ringTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=512; const g=c.getContext('2d'); g.fillStyle='#0c0c10'; g.fillRect(0,0,512,512);
  for(let r=40;r<256;r+=1.5){ g.strokeStyle='rgba(255,255,255,'+(Math.random()*.06).toFixed(3)+')'; g.lineWidth=1; g.beginPath(); g.arc(256,256,r,0,7); g.stroke(); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
const rimMat=new THREE.MeshStandardMaterial({color:'#efe4d6',emissive:'#3a2c22',roughness:.5,side:THREE.DoubleSide});
const packSide=new THREE.MeshStandardMaterial({color:'#17110f',roughness:.75,metalness:0,envMapIntensity:.25});   // matte wound tape, no shine
const packCap=new THREE.MeshPhysicalMaterial({map:ringTex,roughness:.45,metalness:.1,clearcoat:.2,clearcoatRoughness:.4,envMapIntensity:.4});
function hubTex(){ const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d'); g.translate(128,128); g.fillStyle='#fff'; g.beginPath(); g.arc(0,0,112,0,7); g.fill();
  g.globalCompositeOperation='destination-out'; g.beginPath(); g.arc(0,0,56,0,7); g.fill(); for(let i=0;i<6;i++){ g.save(); g.rotate(i*Math.PI/3); g.fillRect(-10,-62,20,20); g.restore(); }
  g.globalCompositeOperation='source-over'; g.fillStyle='#fff'; for(let i=0;i<6;i++){ g.save(); g.rotate(i*Math.PI/3+Math.PI/6); g.fillRect(-7,-54,14,22); g.restore(); }
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; }
const hubMat=new THREE.MeshStandardMaterial({map:hubTex(),alphaTest:.5,roughness:.35});
for(const x of [-2.1,2.1]){
  const pack=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.86,64),[packSide,packCap,packCap]); pack.rotation.x=Math.PI/2; pack.position.set(x,reelY,0); tape.add(pack); packs.push(pack);
  // light rim on the wound tape: a bright arc that shows in the dark middle window and moves as the tape winds
  { const rim=new THREE.Mesh(new THREE.RingGeometry(.955,1,96),rimMat); rim.rotation.x=-Math.PI/2; rim.position.y=.432; pack.add(rim); }
  const reel=new THREE.Group(); reel.position.set(x,reelY,0); tape.add(reel); reels.push(reel);
  const core=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.94,48),new THREE.MeshStandardMaterial({color:'#121016',roughness:.5})); core.rotation.x=Math.PI/2; reel.add(core);
  for(const z of [.475,-.475]){ const f=new THREE.Mesh(new THREE.CircleGeometry(.56,48),hubMat); f.position.z=z; if(z<0) f.rotation.y=Math.PI; reel.add(f); }
}
{ const white=new THREE.MeshStandardMaterial({color:'#f2f0ee',roughness:.35}), steel=new THREE.MeshPhysicalMaterial({color:'#c8ccd6',metalness:1,roughness:.28}), felt=new THREE.MeshStandardMaterial({color:'#6a5440',roughness:1});
  const tapeMat=new THREE.MeshStandardMaterial({color:'#3a1a12',roughness:.35,metalness:.25,side:THREE.DoubleSide});
  for(const x of [-3.75,3.75]){ const rl=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.5,32),white); rl.rotation.x=Math.PI/2; rl.position.set(x,-2.05,0); tape.add(rl);
    const pin=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.56,16),steel); pin.rotation.x=Math.PI/2; pin.position.set(x,-2.05,0); tape.add(pin); }
  for(const x of [-2.4,2.4]){ const g=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.5,20),white); g.rotation.x=Math.PI/2; g.position.set(x,-2.55,0); tape.add(g); }
  const pad=new THREE.Mesh(new THREE.BoxGeometry(.7,.22,.36),felt); pad.position.set(0,-2.62,0); tape.add(pad);
  const spring=new THREE.Mesh(new THREE.BoxGeometry(1.9,.04,.3),steel); spring.position.set(0,-2.46,0); tape.add(spring);
  const seg=(x0,y0,x1,y1)=>{ const L=Math.hypot(x1-x0,y1-y0), m=new THREE.Mesh(new THREE.PlaneGeometry(L,.42),tapeMat); m.position.set((x0+x1)/2,(y0+y1)/2,0); m.rotation.order='ZXY'; m.rotation.z=Math.atan2(y1-y0,x1-x0); m.rotation.x=Math.PI/2; tape.add(m); return m; };
  tapePaths.push(seg(-3.0,reelY-.7,-3.98,-2.05), seg(3.0,reelY-.7,3.98,-2.05)); seg(-3.75,-2.29,3.75,-2.73);
  const film=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.6),new THREE.MeshPhysicalMaterial({map:windowInsert(),transparent:true,roughness:.1,transmission:.2,opacity:.95})); film.visible=false;
  const notch=new THREE.MeshStandardMaterial({color:'#2a2433',roughness:.8}); for(const x of [-3.9,3.9]){ const n=new THREE.Mesh(new THREE.BoxGeometry(.5,.02,D*.36),notch); n.position.set(x,H/2+.045,-D*.14); /* flush slot in the top edge */ tape.add(n); } }

// ---------- printed label (front) and side-B label (back) ----------
const LW=9.1, LH=4.55, LY=.55;          // label covers the face above the trapezoid; LY = reel centre line
// label layout copied from a classic tape: cream writing strip on top, thin stripe, a big colour band
// with the brand, and a dark window panel with two hub holes and the tape slot in the middle
let tagLine='LOFI CASSETTE';
if(window.LabelText) LabelText.on(()=>{ if(typeof TAPES==='undefined') return; labelMat.map=labelTex(lastTitle,'A',TAPES[cur]); backMat.map=labelTex('','B',TAPES[cur]); labelMat.needsUpdate=backMat.needsUpdate=true; });   // small caption next to LEONIDA: the artist when a real song plays
function labelTex(title,side,tp){
  tp=tp||TAPES[cur]||TAPES[0];
  const c=document.createElement('canvas'); c.width=2048; c.height=Math.round(2048*LH/LW); const g=c.getContext('2d'), w=c.width, h=c.height, k=w/LW;
  const X=x=>(x+LW/2)*k, Y=y=>(LH/2-y)*k;     // label-local units -> canvas px
  g.beginPath(); g.roundRect(0,0,w,h,34); g.clip();
  g.fillStyle='#fbf6ec'; g.fillRect(0,0,w,h);
  // colour band: GTA 6 sunset gradient for this tape
  const by=Y(-.38), band=g.createLinearGradient(0,by,w,h); tp.band.forEach((cc,i,arr)=>band.addColorStop(i/(arr.length-1),cc)); g.fillStyle=band; g.fillRect(0,by,w,h-by);
  // soft sun + palm silhouettes in the band (Leonida postcard)
  g.save(); g.globalAlpha=.22; g.fillStyle='#fff'; g.beginPath(); g.arc(w*.84,h*.98,h*.3,0,7); g.fill(); g.restore();
  g.save(); g.fillStyle=tp.ink; g.globalAlpha=.18; const palm=(x,y,s)=>{ g.save(); g.translate(x,y); g.scale(s,s); g.fillRect(-4,-160,8,160); for(let i=0;i<7;i++){ g.save(); g.translate(0,-160); g.rotate(-1.4+i*.47); g.beginPath(); g.ellipse(46,0,52,9,0,0,7); g.fill(); g.restore(); } g.restore(); };
  palm(w*.06,h,1.1); palm(w*.12,h,.8); palm(w*.94,h,1.25); g.restore();
  // stripes between the strip and the band
  g.fillStyle=tp.stripe; g.fillRect(0,by-34,w,22); g.fillStyle=tp.band[0]; g.fillRect(0,by-10,w,10);
  // writing strip: side box, handwriting lines, small print, write-protect box
  g.strokeStyle='#2a2433'; g.lineWidth=5; g.beginPath(); g.roundRect(70,48,108,108,14); g.stroke();
  g.fillStyle='#2a2433'; g.font='900 82px Rubik, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(side,124,106);
  g.strokeStyle='rgba(42,36,51,.55)'; g.lineWidth=3; for(const yy of [118,196]){ g.beginPath(); g.moveTo(230,yy); g.lineTo(w-300,yy); g.stroke(); }
  g.fillStyle=tp.stripe; g.font='700 30px JetBrains Mono, monospace'; g.fillText('HIGH BIAS · LL-90 · TYPE II',w/2,250);
  g.strokeStyle='#2a2433'; g.lineWidth=4; g.strokeRect(w-200,62,62,62); g.font='700 20px JetBrains Mono, monospace'; g.fillStyle='#2a2433'; g.fillText('WRITE',w-169,148); g.fillText('PROTECT',w-169,172);
  // track title handwritten in marker on the first line
  g.save(); g.translate(250,106); g.rotate(-.015); g.textAlign='left'; g.fillStyle='#1d3fbf'; g.font='italic 600 64px Rubik, sans-serif'; g.fillText((title||'side '+side.toLowerCase()).slice(0,30),0,0); g.restore();
  // dark window panel with the hub holes and the tape slot cut out
  const px0=X(-3.15), px1=X(3.15), py0=Y(.92), py1=Y(-.92);
  g.fillStyle='#231f2b'; g.beginPath(); g.roundRect(px0,py0,px1-px0,py1-py0,28); g.fill();
  g.strokeStyle='rgba(255,255,255,.18)'; g.lineWidth=4; g.beginPath(); g.roundRect(px0+10,py0+10,px1-px0-20,py1-py0-20,22); g.stroke();
  g.fillStyle='rgba(255,255,255,.55)'; g.font='700 20px JetBrains Mono, monospace'; for(let i=0;i<=10;i++){ const xx=X(-1.05+i*.21); g.fillRect(xx-1.5,Y(-.46),3,i%5?10:20); }
  g.save(); g.globalCompositeOperation='destination-out';
  for(const x of [-2.1,2.1]){ g.beginPath(); g.arc(X(x),Y(0),.66*k,0,7); g.fill(); }
  g.beginPath(); g.roundRect(X(-1.1),Y(.36),2.2*k,.72*k,12); g.fill(); g.restore();
  for(const x of [-2.1,2.1]){ g.strokeStyle='#b8b0c4'; g.lineWidth=6; g.beginPath(); g.arc(X(x),Y(0),.66*k+3,0,7); g.stroke(); }
  // brand on the band
  g.save(); g.translate(80,h-70); g.rotate(-.02); g.textAlign='left'; g.textBaseline='alphabetic'; const brand=(window.LabelText?LabelText.get():'LEONIDA'); let bs=168; g.font='italic 900 '+bs+'px Rubik, Arial Black, sans-serif'; while(bs>60&&g.measureText(brand).width>X(.6)-90){ bs-=4; g.font='italic 900 '+bs+'px Rubik, Arial Black, sans-serif'; }
  g.lineJoin='round'; g.strokeStyle='#fff'; g.lineWidth=bs*.11; g.strokeText(brand,0,0); g.fillStyle=tp.ink; g.fillText(brand,0,0); g.restore();
  g.textAlign='left'; g.fillStyle=tp.ink; g.font='800 34px Rubik, sans-serif'; { let fs=34; g.font='800 '+fs+'px Rubik, sans-serif'; const maxW=w-300-X(.75); while(fs>18&&g.measureText(tagLine).width>maxW){ fs-=2; g.font='800 '+fs+'px Rubik, sans-serif'; } g.fillText(tagLine,X(.75),h-118); } g.font='700 26px JetBrains Mono, monospace'; g.fillText('VICE CITY TAPE CO.',X(.75),h-78);
  g.fillStyle='#fff'; g.beginPath(); g.roundRect(w-260,h-200,170,120,14); g.fill(); g.fillStyle=tp.stripe; g.font='900 92px Rubik, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('90',w-175,h-136);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t;
}
const PAPER=paperBump(4);
const labelMat=new THREE.MeshPhysicalMaterial({ map:null, bumpMap:PAPER, bumpScale:.35, transparent:true, alphaTest:.5, roughness:.7, metalness:0, sheen:.3, sheenRoughness:.8, clearcoat:.25, clearcoatRoughness:.3, iridescence:0, iridescenceIOR:1.5, envMapIntensity:.5 });
const label=new THREE.Mesh(new THREE.PlaneGeometry(LW,LH),labelMat); label.position.set(0,LY,D/2+.075); tape.add(label);
const backMat=new THREE.MeshPhysicalMaterial({ map:null, bumpMap:PAPER, bumpScale:.35, transparent:true, alphaTest:.5, roughness:.7, clearcoat:.25, iridescence:0 });
const back=new THREE.Mesh(new THREE.PlaneGeometry(LW,LH),backMat); back.position.set(0,LY,-D/2-.075); back.rotation.y=Math.PI; tape.add(back);
// the inside of the shell: a dark back wall behind the reels and grey side walls around the window,
// so looking in at an angle shows the tape and the hubs instead of seeing straight through
{ const inner=new THREE.MeshStandardMaterial({color:'#1b1519',roughness:.85,side:THREE.DoubleSide});
  for(const x of [-2.15,2.15]){ const back=new THREE.Mesh(new THREE.PlaneGeometry(2.1,2.1),inner); back.position.set(x,.55,-.46); tape.add(back); }
  const frost=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.1),inner);   // dark middle too
  frost.position.set(0,.55,-.46); tape.add(frost);
  const wall=new THREE.MeshStandardMaterial({color:'#2a2228',roughness:.9,side:THREE.DoubleSide});
  for(const [w,h,x,y] of [[5.7,.06,0,1.29],[5.7,.06,0,-.19],[.06,1.54,-2.82,.55],[.06,1.54,2.82,.55]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,D-.1),wall); m.position.set(x,y,0); tape.add(m); } }
tape.traverse(o=>{ if(o.isMesh) o.castShadow=true; });

// ---------- interaction ----------
let ry=-.32, rx=.16, vy=0, vx=0, drag=null; const el=renderer.domElement; el.style.cursor='grab';
el.addEventListener('pointerdown',e=>{ el.setPointerCapture(e.pointerId); drag={x:e.clientX,y:e.clientY}; el.style.cursor='grabbing'; });
el.addEventListener('pointermove',e=>{ if(!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.x=e.clientX; drag.y=e.clientY; vy=dx*.009; vx=dy*.006; ry+=vy; rx=Math.max(-1.2,Math.min(1.2,rx+vx)); });
const up=()=>{ drag=null; el.style.cursor='grab'; }; el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
addEventListener('wheel',e=>{ e.preventDefault(); dist=Math.max(14,Math.min(48,dist*(e.deltaY>0?1.06:.94))); placeCam(); },{passive:false});

let playing=false, speed=0, boost=0, prog=0, holo=false;
const clock=new THREE.Clock();
function frame(){ requestAnimationFrame(frame); const dt=Math.min(.05,clock.getDelta()), t=clock.elapsedTime;
  if(!drag){ ry+=vy; rx=Math.max(-1.2,Math.min(1.2,rx+vx)); vy*=.94; vx*=.9; if(Math.abs(vy)<.002) ry+=(-.32+Math.sin(t*.35)*.22-ry)*.008; rx+=(.16-rx)*.01; }
  tape.rotation.set(rx,ry,0); tape.position.y=Math.sin(t*1.2)*.12+(playing?.15:0);
  boost*=Math.pow(.2,dt); speed+=(((playing?1:0)+boost)-speed)*Math.min(1,dt*4);
  reels[0].rotation.z-=speed*dt*4.2; reels[1].rotation.z-=speed*dt*4.2*1.1;
  const rl=1.85-prog*.95, rr=.9+prog*.95; packs[0].scale.set(rl,1,rl); packs[1].scale.set(rr,1,rr);
  labelMat.iridescence=holo?.5:0; backMat.iridescence=holo?.45:0; labelMat.roughness=holo?.4:.7; labelMat.clearcoat=holo?.8:.25;
  renderer.render(scene,camera); }
applyMode(); frame();

// ---------- pill + music ----------
const TAPES=[
  {name:'Vice Beach',style:'jazzhop',c:'#f7f3ee',chip:'#ff4f9a',band:['#ff4f9a','#ff8a5c','#ffc46b'],stripe:'#e0337f',ink:'#2b1240'},
  {name:'Ocean Drive',style:'synth',c:'#ffe3ee',chip:'#ff3d8b',band:['#ff6fae','#c86bff','#7a4dff'],stripe:'#7a4dff',ink:'#1c0f3d'},
  {name:'Leonida Keys',style:'ambient',c:'#e2f6f3',chip:'#19c3b8',band:['#22d3c5','#4cc3ff','#8fe3ff'],stripe:'#ff4f9a',ink:'#0d2c3a'},
  {name:'Sunset Strip',style:'bossa',c:'#fff1de',chip:'#ff8a3d',band:['#ffb347','#ff7a45','#ff4f7a'],stripe:'#19a8b8',ink:'#3a1418'},
  {name:'Neon Night',style:'house',c:'#eee6ff',chip:'#8a4dff',band:['#8a4dff','#d24dff','#ff4f9a'],stripe:'#22d3c5',ink:'#160a30'},
  {name:'Port Gellhorn',style:'chiptune',c:'#e8f0ff',chip:'#3f7dff',band:['#3f7dff','#22d3c5','#a6f0c6'],stripe:'#ff8a3d',ink:'#0b1838'} ];
let cur=0, lastTitle=''; const tapesEl=$('#tapes');
TAPES.forEach((tp,i)=>{ const b=document.createElement('button'); b.className='tape'; b.style.setProperty('--c',hexRgb(tp.chip)); b.title=tp.name; b.setAttribute('aria-label','Play tape '+tp.name); b.onclick=()=>load(i,true); tapesEl.appendChild(b); });
function hexRgb(h){ const n=parseInt(h.slice(1),16); return (n>>16&255)+','+(n>>8&255)+','+(n&255); }
function load(i,play){ cur=i; dispatchEvent(new Event('tapechange')); shellMat.color.set(TAPES[i].c); shellSide.color.set(TAPES[i].c); seamMat.color.set(TAPES[i].c).multiplyScalar(.86); labelMat.map=labelTex(lastTitle,'A',TAPES[i]); backMat.map=labelTex('','B',TAPES[i]); labelMat.needsUpdate=backMat.needsUpdate=true; [...tapesEl.children].forEach((b,k)=>b.classList.toggle('on',k===i));
  if(play){ if(!Lofi.ctx){ Lofi.init(); Lofi.setVolume(.8); } Lofi.setStyle(TAPES[i].style); Lofi.playSeed(Math.floor(Math.random()*9000)+100,TAPES[i].style); } }
load(0,false);
// for the tape shelf: the generated-music tapes and which one is in the deck
window.CassetteDeck={ tapes:TAPES, get current(){ return cur; }, play:i=>load(i,true) };
{ const b=document.getElementById('modeBtn'); if(b) b.onclick=()=>setMode(MODE==='lofi'?'3d':'lofi'); }
$('#holoBtn').onclick=e=>{ holo=e.currentTarget.classList.toggle('on'); };
$('#play').onclick=()=>{ if(!Lofi.ctx){ load(cur,true); return; } if(Lofi.state.playing) Lofi.pause(); else Lofi.play(); };
$('#ff').onclick=()=>{ boost=7; if(Lofi.ctx) Lofi.next(); else load(cur,true); };
$('#rew').onclick=()=>{ boost=-7; if(Lofi.ctx) Lofi.prev(); };
Lofi.on('track',T=>{ tagLine=T.real&&T.artist?String(T.artist).toUpperCase().slice(0,40):'LOFI CASSETTE'; lastTitle=T.real&&T.title?T.title:T.name; labelMat.map=labelTex(lastTitle,'A',TAPES[cur]); labelMat.needsUpdate=true; const n=$('#now'); n.innerHTML='<b></b> · '; n.firstChild.textContent=T.name; n.append(TAPES[cur].name); prog=0; });
Lofi.on('state',S=>{ playing=S.playing; $('#play').textContent=S.playing?'❚❚':'▶'; });
Lofi.on('step',e=>{ prog=Math.min(1,e.step/(e.loops*64)); });
addEventListener('keydown',e=>{ if(e.code==='Space'){ e.preventDefault(); $('#play').click(); } else if(e.key==='ArrowRight') load((cur+1)%TAPES.length,true); else if(e.key==='ArrowLeft') load((cur+TAPES.length-1)%TAPES.length,true); });
