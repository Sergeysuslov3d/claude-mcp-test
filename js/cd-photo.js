// Real CD photo: our disc lies in the empty tray in the photo's perspective and spins while the
// music plays; picking another disc lifts the old one out and drops the new one in.
(function(){
  const $=s=>document.querySelector(s);
  function rng(s){ return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }; }
  function art(kind){
    const N=900, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'), r=rng(kind.length*7919+3), C=N/2;
    g.save(); g.beginPath(); g.arc(C,C,C,0,7); g.clip();
    const holo=(x0,y0,x1,y1)=>{ const h=g.createLinearGradient(x0,y0,x1,y1); ['#ff8ad0','#8ae8ff','#b8ff9a','#ffe68a','#c8a0ff','#ff8ad0'].forEach((cc,i)=>h.addColorStop(i/5,cc)); return h; };
    const stk=(fn,x,y,rot,s)=>{ g.save(); g.translate(x,y); g.rotate(rot); g.scale(s,s); g.shadowColor='rgba(0,0,0,.5)'; g.shadowBlur=8; g.shadowOffsetY=3; fn(); g.restore(); };
    const word=(t,size,fill)=>{ g.font='900 '+size+'px Rubik, Arial Black, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round'; g.strokeStyle='#fff'; g.lineWidth=size*.28; g.strokeText(t,0,0); g.fillStyle=fill; g.fillText(t,0,0); };
    const star=(R1,R2)=>{ g.beginPath(); for(let j=0;j<10;j++){ const a=j*Math.PI/5-Math.PI/2, rr=j%2?R2:R1; g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } g.closePath(); };
    if(kind==='stickers'){
      g.fillStyle='#0b0a10'; g.fillRect(0,0,N,N);
      stk(()=>word('LOFI',104,holo(-110,-36,110,36)),C-50,C-240,-.12,1);
      stk(()=>word('LEONIDA',86,holo(-170,-26,170,26)),C+34,C+215,.08,1);
      stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-100,-36,200,72,36); g.fill(); g.fillStyle='#ff4fa0'; g.beginPath(); g.roundRect(-90,-27,180,54,27); g.fill(); g.fillStyle='#fff'; g.font='800 31px Rubik, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('VICE CITY',0,2); },C+215,C-85,.3,1);
      stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.arc(0,0,90,0,7); g.fill(); const sg=g.createLinearGradient(0,-80,0,80); sg.addColorStop(0,'#ffd27a'); sg.addColorStop(1,'#ff4fa0'); g.fillStyle=sg; g.beginPath(); g.arc(0,0,80,0,7); g.fill(); g.fillStyle='#2a0f3a'; for(let k=0;k<4;k++) g.fillRect(-86,14+k*15,172,4+k*2); },C-230,C+35,0,1);
      stk(()=>{ g.fillStyle='#fff'; g.font='900 130px Rubik, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('♥',0,0); g.fillStyle=holo(-50,-50,50,50); g.font='900 104px Rubik, sans-serif'; g.fillText('♥',0,3); },C-155,C-120,-.25,1);
      for(const [x,y,s] of [[C+215,C+90,1.4],[C-85,C+320,1],[C+130,C-320,.9],[C-320,C-150,.8],[C+290,C+260,.7]]) stk(()=>{ g.fillStyle='#fff'; star(34,14); g.fill(); g.fillStyle=holo(-26,-26,26,26); star(27,11); g.fill(); },x,y,r()*.6,s);
      stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-84,-52,168,104,14); g.fill(); g.fillStyle='#7a5aff'; g.beginPath(); g.roundRect(-75,-44,150,88,10); g.fill(); g.fillStyle='#fff4fa'; g.fillRect(-60,-35,120,26); g.fillStyle='#14101e'; for(const xx of [-31,31]){ g.beginPath(); g.arc(xx,18,15,0,7); g.fill(); } g.fillStyle='#fff'; for(const xx of [-31,31]){ g.beginPath(); g.arc(xx,18,5,0,7); g.fill(); } },C+170,C+300,-.35,.9);
      stk(()=>{ g.fillStyle='#fff'; g.beginPath(); g.roundRect(-66,-66,132,132,18); g.fill(); for(let i=0;i<4;i++) for(let j=0;j<4;j++){ g.fillStyle=(i+j)%2?'#14101e':'#ffffff'; g.fillRect(-57+i*28.5,-57+j*28.5,28.5,28.5); } },C-285,C+215,.2,.75);
    } else if(kind==='gold'){
      const gg=g.createRadialGradient(C*.8,C*.7,30,C,C,C); gg.addColorStop(0,'#f0cf88'); gg.addColorStop(.6,'#bf8c33'); gg.addColorStop(1,'#7a5410'); g.fillStyle=gg; g.fillRect(0,0,N,N);
      g.strokeStyle='rgba(255,236,190,.6)'; g.lineWidth=4; g.beginPath(); g.arc(C+220,C+100,70,0,7); g.stroke(); g.strokeRect(C-230,C-45,90,64); g.font='700 27px JetBrains Mono, monospace'; g.fillStyle='rgba(255,236,190,.8)'; g.textAlign='center'; g.fillText('LOFI LEONIDA · 1987',C,C+205);
    } else if(kind==='pearl'){
      const pg=g.createConicGradient(0,C,C); ['#f6c8dc','#e8b0d0','#f8e0ec','#d8a8d8','#f6c8dc'].forEach((cc,i)=>pg.addColorStop(i/4,cc)); g.fillStyle=pg; g.fillRect(0,0,N,N);
      g.font='900 italic 76px Rubik, sans-serif'; g.textAlign='center'; g.fillStyle='#fff'; g.strokeStyle='#d0508e'; g.lineWidth=6; g.strokeText('sunset strip',C,C-215); g.fillText('sunset strip',C,C-215);
    } else {
      const sg=g.createConicGradient(.6,C,C); ['#f4f6fa','#a8afc0','#ffffff','#9aa2b6','#eef0f6','#b8bfcf','#f4f6fa'].forEach((cc,i)=>sg.addColorStop(i/6,cc)); g.fillStyle=sg; g.fillRect(0,0,N,N);
      g.font='800 42px Rubik, sans-serif'; g.textAlign='center'; g.fillStyle='#3a4258'; g.fillText('CHROME KEYS',C,C+255);
    }
    g.restore(); return c.toDataURL('image/jpeg',.88);
  }
  const DISCS=[ {id:'stickers',name:'Vice City Stickers',style:'jazzhop'}, {id:'gold',name:'Gold Pressing',style:'bossa'}, {id:'pearl',name:'Pink Pearl',style:'synth'}, {id:'silver',name:'Chrome Keys',style:'ambient'} ].map(d=>Object.assign(d,{url:art(d.id)}));

  const tray=$('#tray'), disc=$('#disc'), gloss=$('#gloss'), chips=$('#chips');
  let cur=0, ang=0, spin=0, playing=false, last=performance.now();
  DISCS.forEach((d,i)=>{ const b=document.createElement('button'); b.className='chip'; b.style.backgroundImage='url('+d.url+')'; b.title=d.name; b.setAttribute('aria-label','Play '+d.name); b.onclick=()=>load(i,true); chips.appendChild(b); });
  function show(i){ disc.style.backgroundImage='url('+DISCS[i].url+')'; [...chips.children].forEach((b,k)=>b.classList.toggle('on',k===i)); }
  function load(i,play){ if(i!==cur){ tray.classList.add('lift'); setTimeout(()=>{ show(i); tray.classList.remove('lift'); },380); } else show(i); cur=i; if(play) PhotoPage.start(DISCS[i].style); }
  show(0);
  (function frame(now){ requestAnimationFrame(frame); const dt=Math.min(.05,(now-last)/1000); last=now; spin+=((playing?1:0)-spin)*Math.min(1,dt*1.6); ang+=spin*dt*200; disc.style.rotate=ang+'deg'; })(last);
  Lofi.on('state',S=>{ playing=S.playing; });
  Lofi.on('track',T=>{ const n=$('#now'); n.innerHTML='<b></b> · '; n.firstChild.textContent=T.name; n.append(DISCS[cur].name); });
  $('#play').onclick=()=>{ if(!Lofi.ctx) return PhotoPage.start(DISCS[cur].style); if(Lofi.state.playing) Lofi.pause(); else Lofi.play(); };
  $('#next').onclick=()=>{ if(!Lofi.ctx) return PhotoPage.start(DISCS[cur].style); Lofi.next(); };
  addEventListener('keydown',e=>{ if(e.code==='Space'){ e.preventDefault(); $('#play').click(); } else if(e.key==='ArrowRight') load((cur+1)%DISCS.length,true); else if(e.key==='ArrowLeft') load((cur+DISCS.length-1)%DISCS.length,true); });
})();
