// CD case page: tap the clear case to open it (the disc lifts out and spins while music plays),
// drag to turn it, pick a disc from the pill. Disc faces are drawn on a canvas: a black disc
// covered in holographic Leonida stickers, plus gold, silver and pearl pressings.
(function(){
  const $=s=>document.querySelector(s);
  const rig=$('#rig');
  const DISCS=[ {id:'stickers',name:'Vice City Stickers',style:'jazzhop'}, {id:'gold',name:'Gold Pressing',style:'bossa'}, {id:'pearl',name:'Pink Pearl',style:'synth'}, {id:'silver',name:'Chrome Keys',style:'ambient'} ];

  /* ---------- disc faces ---------- */
  function rng(s){ return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }; }
  function face(kind){
    const N=640, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'), r=rng(kind.length*7919+3), C=N/2;
    g.save(); g.beginPath(); g.arc(C,C,C,0,7); g.clip();
    if(kind==='stickers'){
      g.fillStyle='#0c0b12'; g.fillRect(0,0,N,N);
      const holo=(x0,y0,x1,y1)=>{ const h=g.createLinearGradient(x0,y0,x1,y1); ['#ff8ad0','#8ae8ff','#b8ff9a','#ffe68a','#c8a0ff','#ff8ad0'].forEach((cc,i)=>h.addColorStop(i/5,cc)); return h; };
      const stk=(fn,x,y,rot,s)=>{ g.save(); g.translate(x,y); g.rotate(rot); g.scale(s,s); g.shadowColor='rgba(0,0,0,.5)'; g.shadowBlur=8; g.shadowOffsetY=3; fn(); g.restore(); };
      const word=(t,size,fill)=>{ g.font='900 '+size+'px Rubik, Arial Black, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round'; g.strokeStyle='#fff'; g.lineWidth=size*.28; g.strokeText(t,0,0); g.fillStyle=fill; g.fillText(t,0,0); };
      // logo stickers
      stk(()=>word('LOFI',74,holo(-80,-30,80,30)),C-40,C-170,-.12,1);
      stk(()=>word('LEONIDA',64,holo(-120,-20,120,20)),C+30,C+150,.08,1);
      stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-70,-26,140,52,26); g.fill(); g.fillStyle='#ff4fa0'; g.beginPath(); g.roundRect(-64,-20,128,40,20); g.fill(); g.fillStyle='#fff'; g.font='800 22px Rubik, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('VICE CITY',0,1); },C+150,C-60,.3,1);
      // sun + palms sticker
      stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.arc(0,0,64,0,7); g.fill(); const sg=g.createLinearGradient(0,-56,0,56); sg.addColorStop(0,'#ffd27a'); sg.addColorStop(1,'#ff4fa0'); g.fillStyle=sg; g.beginPath(); g.arc(0,0,56,0,7); g.fill(); g.fillStyle='#2a0f3a'; for(let k=0;k<4;k++) g.fillRect(-60,10+k*11,120,3+k*1.5); },C-160,C+30,0,1);
      // flamingo-ish heart, stars, cassette, car, checker
      stk(()=>{ g.fillStyle='#fff'; g.font='900 92px Rubik, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('♥',0,0); g.fillStyle=holo(-40,-40,40,40); g.font='900 74px Rubik, sans-serif'; g.fillText('♥',0,2); },C-110,C-80,-.25,1);
      const star=(R1,R2)=>{ g.beginPath(); for(let j=0;j<10;j++){ const a=j*Math.PI/5-Math.PI/2, rr=j%2?R2:R1; g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } g.closePath(); };
      for(const [x,y,s] of [[C+150,C+60,1],[C-60,C+220,.7],[C+90,C-220,.6],[C-220,C-110,.55]]) stk(()=>{ g.fillStyle='#fff'; star(38,16); g.fill(); g.fillStyle=holo(-30,-30,30,30); star(30,12); g.fill(); },x,y,r()*.6,s);
      stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-58,-36,116,72,10); g.fill(); g.fillStyle='#7a5aff'; g.beginPath(); g.roundRect(-52,-30,104,60,7); g.fill(); g.fillStyle='#fff4fa'; g.fillRect(-42,-24,84,18); g.fillStyle='#14101e'; for(const xx of [-22,22]){ g.beginPath(); g.arc(xx,12,11,0,7); g.fill(); } g.fillStyle='#fff'; for(const xx of [-22,22]){ g.beginPath(); g.arc(xx,12,4,0,7); g.fill(); } },C+120,C+210,-.35,.9);
      stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-46,-46,92,92,14); g.fill(); for(let i=0;i<4;i++) for(let j=0;j<4;j++){ g.fillStyle=(i+j)%2?'#14101e':'#ffffff'; g.fillRect(-40+i*20,-40+j*20,20,20); } },C-200,C+150,.2,.75);
      stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-60,-22,120,44,22); g.fill(); g.fillStyle='#2ad0c8'; g.font='900 26px Rubik, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('SIDE A',0,2); },C+40,C-90,-.05,.85);
    } else if(kind==='gold'){
      const gg=g.createRadialGradient(C*.8,C*.7,20,C,C,C); gg.addColorStop(0,'#e8c27a'); gg.addColorStop(.6,'#b8862e'); gg.addColorStop(1,'#7a5410'); g.fillStyle=gg; g.fillRect(0,0,N,N);
      g.strokeStyle='rgba(255,236,190,.55)'; g.lineWidth=2.5; g.beginPath(); g.arc(C+150,C+70,48,0,7); g.stroke(); g.beginPath(); g.arc(C+150,C+70,8,0,7); g.stroke();
      g.strokeRect(C-160,C-30,62,46); g.beginPath(); g.arc(C-129,C-7,12,0,7); g.stroke();
      g.beginPath(); g.moveTo(C-170,C-150); g.lineTo(C-120,C-150); g.moveTo(C-100,C-150); g.lineTo(C-60,C-150); g.stroke(); for(const x of [C-160,C-110]){ g.beginPath(); g.arc(x,C-150,8,0,7); g.stroke(); }
      g.beginPath(); g.moveTo(C-40,C-200); g.lineTo(C+120,C-150); g.moveTo(C,C+190); g.lineTo(C+90,C+170); g.stroke();
      g.font='700 18px JetBrains Mono, monospace'; g.fillStyle='rgba(255,236,190,.7)'; g.textAlign='center'; g.fillText('LOFI LEONIDA · 1987',C,C+140);
    } else if(kind==='pearl'){
      const pg=g.createConicGradient?g.createConicGradient(0,C,C):null; if(pg){ ['#f6c8dc','#e8b0d0','#f8e0ec','#d8a8d8','#f6c8dc'].forEach((cc,i)=>pg.addColorStop(i/4,cc)); g.fillStyle=pg; } else g.fillStyle='#f0c0d8'; g.fillRect(0,0,N,N);
      g.fillStyle='rgba(255,255,255,.35)'; for(let i=0;i<60;i++){ g.beginPath(); g.arc(r()*N,r()*N,2+r()*5,0,7); g.fill(); }
      g.font='900 italic 54px Rubik, sans-serif'; g.textAlign='center'; g.fillStyle='#fff'; g.strokeStyle='#d0508e'; g.lineWidth=4; g.strokeText('sunset strip',C,C-150); g.fillText('sunset strip',C,C-150);
    } else {
      const sg=g.createConicGradient?g.createConicGradient(.6,C,C):null; if(sg){ ['#f4f6fa','#a8afc0','#ffffff','#9aa2b6','#eef0f6','#b8bfcf','#f4f6fa'].forEach((cc,i)=>sg.addColorStop(i/6,cc)); g.fillStyle=sg; } else g.fillStyle='#d8dce6'; g.fillRect(0,0,N,N);
      g.strokeStyle='rgba(80,90,110,.35)'; g.lineWidth=1; for(let rr=C*.4;rr<C;rr+=9){ g.beginPath(); g.arc(C,C,rr,0,7); g.stroke(); }
      g.font='800 30px Rubik, sans-serif'; g.textAlign='center'; g.fillStyle='#3a4258'; g.fillText('CHROME KEYS',C,C+180);
    }
    // centre clear ring + data rings
    g.restore(); g.save(); g.beginPath(); g.arc(C,C,C*.26,0,7); g.fillStyle='rgba(235,238,245,.9)'; g.fill(); g.restore();
    return c.toDataURL('image/png');
  }
  const FACES=DISCS.map(d=>face(d.id));

  /* ---------- open / turn ---------- */
  let rz=-6, rx=40, vz=0, drag=null, moved=0, open=false, playing=false, cur=0;
  rig.addEventListener('pointerdown',e=>{ rig.setPointerCapture(e.pointerId); rig.classList.add('drag'); drag={x:e.clientX,y:e.clientY}; moved=0; });
  rig.addEventListener('pointermove',e=>{ if(!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.x=e.clientX; drag.y=e.clientY; moved+=Math.abs(dx)+Math.abs(dy); vz=-dx*.45; rz+=vz; rx=Math.max(8,Math.min(70,rx-dy*.25)); });
  const up=()=>{ if(!drag) return; drag=null; rig.classList.remove('drag'); if(moved<6) toggle(); };
  rig.addEventListener('pointerup',up); rig.addEventListener('pointercancel',up);
  function toggle(force){ open=force==null?!open:force; rig.classList.toggle('open',open); rig.classList.toggle('spin',open&&playing); }
  function frame(){ requestAnimationFrame(frame); if(!drag){ rz+=vz; vz*=.93; rz+=(-6+Math.sin(performance.now()/3000)*6-rz)*.01; rx+=(40-rx)*.02; }
    rig.style.setProperty('--rz',rz+'deg'); rig.style.setProperty('--rx',rx+'deg'); rig.style.setProperty('--sx',(50+Math.sin(rz/40)*30)+'%'); $('#disc').style.setProperty('--sa',(-rz*2)+'deg'); }
  requestAnimationFrame(frame);

  /* ---------- pill ---------- */
  const chips=$('#chips');
  DISCS.forEach((d,i)=>{ const b=document.createElement('button'); b.className='chip'; b.style.backgroundImage='url('+FACES[i]+')'; b.title=d.name; b.setAttribute('aria-label','Play '+d.name); b.onclick=()=>load(i,true); chips.appendChild(b); });
  function load(i,play){ cur=i; $('#face').style.backgroundImage='url('+FACES[i]+')'; [...chips.children].forEach((b,k)=>b.classList.toggle('on',k===i));
    if(play){ toggle(true); if(!Lofi.ctx){ Lofi.init(); Lofi.setVolume(.8); } Lofi.setStyle(DISCS[i].style); Lofi.playSeed(Math.floor(Math.random()*9000)+100,DISCS[i].style); } }
  load(0,false);
  Lofi.on('track',T=>{ $('#now').innerHTML='<b></b> · '; $('#now b').textContent=T.name; $('#now').append(DISCS[cur].name); });
  Lofi.on('state',S=>{ playing=S.playing; rig.classList.toggle('spin',open&&playing); $('#play').textContent=S.playing?'❚❚':'▶'; });
  $('#play').onclick=()=>{ if(!Lofi.ctx){ load(cur,true); return; } if(Lofi.state.playing) Lofi.pause(); else { toggle(true); Lofi.play(); } };
  $('#next').onclick=()=>{ if(!Lofi.ctx) return load(cur,true); Lofi.next(); };
  $('#open').onclick=()=>toggle();
  addEventListener('keydown',e=>{ if(e.code==='Space'){ e.preventDefault(); $('#play').click(); } else if(e.key==='ArrowRight') load((cur+1)%DISCS.length,true); else if(e.key==='ArrowLeft') load((cur+DISCS.length-1)%DISCS.length,true); else if(e.key==='o') toggle(); });
})();
