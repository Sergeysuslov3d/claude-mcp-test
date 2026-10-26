
// render every scene through the same steps as app.js draw(), frozen at one moment; ?t=seconds ?tod=night|day|sunset
const qs=new URLSearchParams(location.search), tt=+(qs.get('t')||3), mode=qs.get('tod')||'night', only=qs.get('s');
TOD.setMode(mode);
const fxOpt={q:'high',glow:true,grain:false,lines:false};
const bgs={};
function scenery(sc,phase){ const k=sc.id+'|'+phase; if(bgs[k]) return bgs[k]; const [cv,c]=PX.makeCanvas(480,270); const L=TOD.PAL[phase].lamp; SK.lit=L; SK.k=Math.max(.15,L); sc.build(c,phase); SK.lit=1; SK.k=1; TOD.relight(c,phase,sc.relight==null?1:sc.relight); return bgs[k]=cv; }
function render(sc,t){
  const [lc,low]=PX.makeCanvas(480,270); const w=sc.weather, T=TOD.at(TOD.hour(),w);
  low.fillStyle='#000'; low.fillRect(0,0,480,270); low.drawImage(SKYX.gradientCanvas(sc,T.a),0,0);
  if(!sc.under){ SKYX.overcast(low,sc,T); SKYX.stars(low,sc,T,t); SK.k=1; SKYX.celestial(low,sc,T,t); SKYX.clouds(low,sc,T,t); }
  LIFE.sky(low,sc,T,t); low.drawImage(scenery(sc,T.a),0,0); SK.k=T.lampK; SK.lit=T.P.lamp;
  if(sc.water) LIFE.water(low,sc,T,t,sc.water[0],sc.water[1],sc.water[2]);
  WX.pending=null; WX.skip=true; const env={weather:w,tod:T};
  sc.frame(low,t,env); LIFE.people(low,sc,env,t); if(sc.id!=='apartment') CAST.draw(low,t,sc.id); if(sc.over) sc.over(low,t,env); LIFE.front(low,sc,T,t);
  SK.k=1; SK.lit=1; WX.skip=false;
  const out=document.createElement('canvas'); out.width=960; out.height=540; const ctx=out.getContext('2d'); FX.render(ctx,low,t,sc,w,fxOpt,T); return out;
}
const g=document.getElementById('g');
SCENES.forEach((sc,i)=>{ if(only&&!sc.id.includes(only)) return; const c=render(sc,tt); c.title=(i+1)+' '+sc.id; if(only){ c.style.width='1440px'; c.style.height='810px'; g.style.display='block'; }
  const crop=qs.get('crop'); if(crop){ const [x,y,w,h]=crop.split(',').map(Number), z=Math.floor(1440/w); const o=document.createElement('canvas'); o.width=w*z; o.height=h*z; const oc=o.getContext('2d'); oc.imageSmoothingEnabled=false; oc.drawImage(c,x*2,y*2,w*2,h*2,0,0,w*z,h*z); o.style.width=o.width+'px'; o.style.height=o.height+'px'; g.appendChild(o); return; }
  g.appendChild(c); });
