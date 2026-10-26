// Surface-wear textures that make CG plastic and paper read as real objects:
// micro-scratches + fingerprint smudges as roughness maps, and a paper-fibre bump map.
import * as THREE from './vendor/three.module.min.js';

function rng(s){ return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }; }

// grey = base roughness, lighter strokes/smudges = rougher (scratches, finger oils)
export function wearMap(seed=1,base=34){
  const N=1024, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'), r=rng(seed*7919+11);
  g.fillStyle=`rgb(${base},${base},${base})`; g.fillRect(0,0,N,N);
  // fine hairline scratches, mostly in one polishing direction
  for(let i=0;i<900;i++){ const x=r()*N, y=r()*N, a=(r()<.7?.35:r()*Math.PI), l=8+r()*90, v=base+30+r()*90|0;
    g.strokeStyle=`rgba(${v},${v},${v},${.25+r()*.45})`; g.lineWidth=.4+r()*.9; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); }
  // a few deeper arcs
  for(let i=0;i<40;i++){ const x=r()*N, y=r()*N, rr=30+r()*160, a0=r()*6; g.strokeStyle='rgba(170,170,170,.35)'; g.lineWidth=.7; g.beginPath(); g.arc(x,y,rr,a0,a0+.3+r()*.6); g.stroke(); }
  // fingerprint smudges: soft ovals made of faint concentric ridges
  for(let f=0;f<6;f++){ const x=r()*N, y=r()*N, sx=26+r()*20, sy=36+r()*24, rot=r()*3;
    g.save(); g.translate(x,y); g.rotate(rot); for(let k=0;k<14;k++){ g.strokeStyle=`rgba(140,140,140,${.10-k*.006})`; g.lineWidth=1.6; g.beginPath(); g.ellipse(0,0,sx*(k/14+.2),sy*(k/14+.2),0,0,Math.PI*2); g.stroke(); } g.restore(); }
  // dust specks
  for(let i=0;i<500;i++){ const v=150+r()*100|0; g.fillStyle=`rgba(${v},${v},${v},.7)`; g.fillRect(r()*N,r()*N,1+r()*1.5,1+r()*1.5); }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}

// paper fibre bump for printed labels / booklets
export function paperBump(seed=3){
  const N=512, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'), id=g.createImageData(N,N), d=id.data, r=rng(seed);
  for(let i=0;i<d.length;i+=4){ const v=118+r()*20; d[i]=d[i+1]=d[i+2]=v; d[i+3]=255; } g.putImageData(id,0,0);
  for(let i=0;i<1600;i++){ const x=r()*N, y=r()*N, a=r()*Math.PI, l=3+r()*14, v=r()<.5?90:170; g.strokeStyle=`rgba(${v},${v},${v},.25)`; g.lineWidth=.6; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,3); return t;
}

// tick-marked clear window insert of a cassette (white printed scale on transparent film)
export function windowInsert(){
  const c=document.createElement('canvas'); c.width=1024; c.height=360; const g=c.getContext('2d');
  g.strokeStyle='rgba(255,255,255,.85)'; g.fillStyle='rgba(255,255,255,.85)'; g.lineWidth=3;
  for(let i=0;i<=20;i++){ const x=80+i*43, h=i%5===0?40:22; g.beginPath(); g.moveTo(x,300); g.lineTo(x,300-h); g.stroke(); }
  g.font='700 26px JetBrains Mono, monospace'; g.textAlign='center'; for(let i=0;i<=4;i++) g.fillText(String(i*25),80+i*215,250);
  g.lineWidth=2; g.beginPath(); g.moveTo(60,310); g.lineTo(964,310); g.stroke();
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
