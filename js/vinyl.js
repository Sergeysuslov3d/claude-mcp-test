// Vinyl page: a marbled record that spins at 33⅓ while Lofi Leonida plays, a tonearm that drops
// and tracks inward, a progress ring, scratching by dragging the record, and the melody written
// out note by note ("lyrics"), lit in time with the music. Original artwork, generated live.
(function(){
  const $=s=>document.querySelector(s);
  const cv=$('#vinyl'), g=cv.getContext('2d'), deck=$('#deck'), lyr=$('#lyrics');
  const MIRROR=document.body.classList.contains('mirror');   // record on the right, lyrics on the left
  let W=0,H=0,DPR=1, R=200, CX=0, CY=0, mobile=false, labelCv=null, labelFor='', T=null;

  function size(){ DPR=Math.min(2,window.devicePixelRatio||1); const r=deck.getBoundingClientRect(); W=r.width; H=r.height; cv.width=W*DPR; cv.height=H*DPR; g.setTransform(DPR,0,0,DPR,0,0);
    mobile=W<760; if(mobile){ R=Math.min(W*.42,H*.24); CX=W/2; CY=H*.26; } else { R=Math.min(H*.47,W*.3); CX=MIRROR?W*.82:W*.18; CY=H*.5; } labelCv=null; }
  addEventListener('resize',size); size();

  /* ---------- marbled record surface (per track) ---------- */
  const PAL=[ ['#2a0f3a','#ff4fa0','#ffb05a','#6a3fc0','#ff7ac8','#1a0a2a'], ['#06222e','#2ad0c8','#7fe4ff','#3a5ad8','#e8f8ff','#08121e'],
    ['#2a1006','#ff6a3a','#ffd27a','#c8304a','#fff0c0','#14060a'], ['#160a2a','#b98aff','#ff9ccf','#4ae8ff','#f4eefa','#0a0618'] ];
  function hash(x,y,s){ let h=(x*374761393+y*668265263+s*982451653)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; }
  function vnoise(x,y,s){ const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi, u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
    const a=hash(xi,yi,s), b=hash(xi+1,yi,s), c=hash(xi,yi+1,s), d=hash(xi+1,yi+1,s); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; }
  const fbm=(x,y,s)=>vnoise(x,y,s)*.55+vnoise(x*2.1,y*2.1,s+1)*.28+vnoise(x*4.3,y*4.3,s+2)*.17;
  const hex=h=>{ const n=parseInt(h.slice(1),16); return [n>>16&255,n>>8&255,n&255]; };
  let disc=null;
  function makeDisc(seed){
    const N=420, c=document.createElement('canvas'); c.width=c.height=N; const x=c.getContext('2d'), id=x.createImageData(N,N), d=id.data;
    const pal=PAL[seed%PAL.length].map(hex), s=seed%997;
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){
      const u=i/N*3.2, v=j/N*3.2, w1=fbm(u,v,s), w2=fbm(u+5.2,v+1.3,s), q=fbm(u+2.4*w1,v+2.4*w2,s+7);
      const t=(Math.sin((q*5.5+w1*2)*Math.PI)*.5+.5), k=Math.min(pal.length-1.001,t*(pal.length-1)), a=Math.floor(k), f=k-a, A=pal[a], B=pal[a+1], o=(j*N+i)*4;
      d[o]=A[0]+(B[0]-A[0])*f; d[o+1]=A[1]+(B[1]-A[1])*f; d[o+2]=A[2]+(B[2]-A[2])*f; d[o+3]=255; }
    x.putImageData(id,0,0); disc=c; labelCv=null;
  }
  // centre label: cream paper, curved title, 33⅓
  const WORD=()=>window.LabelText?LabelText.get():'LEONIDA';
  if(window.LabelText) LabelText.on(()=>{ labelCv=null; });
  let artImg=null, artFor='';
  function labelKey(T){ return (T?(T.real?'r'+T.name:T.seed+T.style):'')+WORD()+(artImg&&artImg.complete&&artImg.naturalWidth?'a':''); }
  function makeLabel(T){
    const r=Math.round(R*.34*DPR), c=document.createElement('canvas'); c.width=c.height=r*2; const x=c.getContext('2d'); x.translate(r,r);
    if(T&&T.real&&artImg&&artImg.complete&&artImg.naturalWidth){ // the song's cover printed on the label
      x.save(); x.beginPath(); x.arc(0,0,r,0,7); x.clip(); x.drawImage(artImg,-r,-r,r*2,r*2); x.restore();
      x.strokeStyle='rgba(0,0,0,.25)'; x.lineWidth=r*.02; x.beginPath(); x.arc(0,0,r*.97,0,7); x.stroke();
      x.fillStyle='#f4eefa'; x.beginPath(); x.arc(0,0,r*.09,0,7); x.fill(); x.fillStyle='#1a0a12'; x.beginPath(); x.arc(0,0,r*.05,0,7); x.fill();
      labelCv=c; labelFor=labelKey(T); return; }
    const gr=x.createRadialGradient(0,0,r*.1,0,0,r); gr.addColorStop(0,'#fff4f6'); gr.addColorStop(1,'#f3c6d6'); x.fillStyle=gr; x.beginPath(); x.arc(0,0,r,0,7); x.fill();
    x.strokeStyle='rgba(120,30,70,.35)'; x.lineWidth=r*.012; for(const k of [.93,.62]){ x.beginPath(); x.arc(0,0,r*k,0,7); x.stroke(); }
    const arc=(txt,rad,start,size,col,dir)=>{ x.save(); x.font='700 '+size+'px Rubik, sans-serif'; x.fillStyle=col; x.textAlign='center'; x.textBaseline='middle';
      const chars=[...txt], step=size*.62/rad; let a=start-dir*step*(chars.length-1)/2; for(const ch of chars){ x.save(); x.rotate(a); x.translate(0,-rad*dir); if(dir<0) x.rotate(Math.PI); x.fillText(ch,0,0); x.restore(); a+=dir*step; } x.restore(); };
    arc((T?T.name:'Lofi Leonida').toUpperCase().slice(0,28),r*.78,0,r*.11,'#7a1f4a',1);
    arc(('LOFI '+WORD()+' · SIDE A').slice(0,30),r*.78,Math.PI,r*.075,'#a0426e',-1);
    x.fillStyle='#d8305a'; x.font='800 '+(r*.26)+'px Rubik, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('33⅓',0,-r*.05);
    x.fillStyle='#a0426e'; x.font='700 '+(r*.075)+'px Rubik, sans-serif'; x.fillText('RPM · '+(T&&T.real?String(T.artist||'').toUpperCase().slice(0,18):T&&Lofi.STYLES[T.style]?Lofi.STYLES[T.style].name.toUpperCase():'LOFI'),0,r*.2);
    x.fillStyle='#1a0a12'; x.beginPath(); x.arc(0,0,r*.05,0,7); x.fill();
    labelCv=c; labelFor=labelKey(T);
  }

  /* ---------- motion: spin, tonearm, scratch ---------- */
  let ang=0, omega=0, armA=0, playing=false, prog=0, drag=null, lastScratch=0;
  // accent colour of the current theme (halo, progress ring)
  let ACC=[255,79,160], PALE=false;
  function readTheme(){ const v=getComputedStyle(document.documentElement).getPropertyValue('--acc').trim(); if(/^#[0-9a-f]{6}$/i.test(v)) ACC=hex(v);
    PALE=['light','nature','sunset'].includes(document.documentElement.dataset.theme); }
  readTheme(); addEventListener('themechange',readTheme);
  const OMEGA=2*Math.PI*14/60;   // slower than a real 33⅓ — calmer to watch
  function pAngle(e){ const r=cv.getBoundingClientRect(); return Math.atan2(e.clientY-r.top-CY,e.clientX-r.left-CX); }
  function onDisc(e){ const r=cv.getBoundingClientRect(), dx=e.clientX-r.left-CX, dy=e.clientY-r.top-CY; return Math.hypot(dx,dy)<R; }
  cv.addEventListener('pointerdown',e=>{ if(!onDisc(e)) return; cv.setPointerCapture(e.pointerId); cv.classList.add('drag'); drag={a:pAngle(e),t:performance.now()}; $('#hint').style.opacity=0; });
  cv.addEventListener('pointermove',e=>{ if(!drag) return; const a=pAngle(e); let da=a-drag.a; if(da>Math.PI) da-=2*Math.PI; if(da<-Math.PI) da+=2*Math.PI;
    const now=performance.now(), dt=Math.max(8,now-drag.t); ang+=da; drag.v=da/dt*1000; drag.a=a; drag.t=now;
    if(Lofi.ctx&&now-lastScratch>45&&Math.abs(drag.v)>.6){ Lofi.scratch(Math.min(1,Math.abs(drag.v)/14)); lastScratch=now; } });
  const end=()=>{ if(!drag) return; omega=drag.v||0; drag=null; cv.classList.remove('drag'); };
  cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',end);

  function draw(now){
    requestAnimationFrame(draw);
    const dt=Math.min(.05,(now-(draw.t||now))/1000); draw.t=now;
    if(!drag){ omega+=((playing?OMEGA:0)-omega)*Math.min(1,dt*(playing?2.2:1.1)); ang+=omega*dt; }
    armA+=((playing?1:0)-armA)*Math.min(1,dt*2.4);
    g.clearRect(0,0,W,H);
    // halo behind the record
    const hg=g.createRadialGradient(CX,CY,R*.6,CX,CY,R*1.6); hg.addColorStop(0,'rgba('+ACC+',.12)'); hg.addColorStop(1,'rgba('+ACC+',0)'); g.fillStyle=hg; g.fillRect(0,0,W,H);
    // record body
    g.save(); g.translate(CX,CY); g.rotate(ang);
    g.save(); g.beginPath(); g.arc(0,0,R,0,7); g.clip(); if(disc) g.drawImage(disc,-R,-R,R*2,R*2); else { g.fillStyle='#16101e'; g.fillRect(-R,-R,R*2,R*2); }
    // grooves
    for(let r=R*.36;r<R*.97;r+=2.2){ g.strokeStyle=(Math.floor(r)%3)?'rgba(0,0,0,.10)':'rgba(255,255,255,.05)'; g.lineWidth=1; g.beginPath(); g.arc(0,0,r,0,7); g.stroke(); }
    g.strokeStyle='rgba(0,0,0,.35)'; g.lineWidth=2; for(const k of [.55,.74]){ g.beginPath(); g.arc(0,0,R*k,0,7); g.stroke(); }
    g.restore();
    g.strokeStyle='#0a0810'; g.lineWidth=R*.03; g.beginPath(); g.arc(0,0,R*.985,0,7); g.stroke();
    if(!labelCv||labelFor!==labelKey(T)) makeLabel(T);
    g.drawImage(labelCv,-R*.34,-R*.34,R*.68,R*.68);
    g.restore();
    // fixed sheen (light doesn't turn with the record)
    g.save(); if(MIRROR){ g.translate(CX*2,0); g.scale(-1,1); }
    g.save(); g.beginPath(); g.arc(CX,CY,R,0,7); g.clip(); g.globalCompositeOperation='screen';
    for(const [a0,a1,al] of [[-.95,-.55,.16],[2.2,2.55,.10]]){ g.fillStyle='rgba(255,255,255,'+al+')'; g.beginPath(); g.moveTo(CX,CY); g.arc(CX,CY,R,a0,a1); g.closePath(); g.fill(); }
    g.restore();
    // progress ring of ticks on the right side of the record
    const n=56, a0=-1.15, a1=1.15; for(let i=0;i<n;i++){ const a=a0+(a1-a0)*i/(n-1), lit=i/(n-1)<=prog, big=i%7===0, r0=R+14, r1=R+(big?28:21);
      g.strokeStyle=lit?'rgba('+ACC+','+(.55+.45*Math.sin(now/300+i*.4)*.5+.2)+')':(PALE?'rgba(27,25,34,.16)':'rgba(255,255,255,.14)'); g.lineWidth=big?2:1.2; g.beginPath(); g.moveTo(CX+Math.cos(a)*r0,CY+Math.sin(a)*r0); g.lineTo(CX+Math.cos(a)*r1,CY+Math.sin(a)*r1); g.stroke(); }
    { const a=a0+(a1-a0)*prog; g.fillStyle='rgb('+ACC+')'; g.beginPath(); g.arc(CX+Math.cos(a)*(R+36),CY+Math.sin(a)*(R+36),3.2,0,7); g.fill(); g.strokeStyle='rgba('+ACC+',.5)'; g.lineWidth=1; g.beginPath(); g.arc(CX+Math.cos(a)*(R+36),CY+Math.sin(a)*(R+36),6.5,0,7); g.stroke(); }
    // tonearm: pivot above-right, rests off the record, drops on and tracks inward with progress
    { const px=CX+R*.78, py=CY-R*1.04, len=R*1.12, rest=1.02, play=1.42+prog*.22, a=rest+(play-rest)*armA;
      const hx=px+Math.cos(a)*len, hy=py+Math.sin(a)*len;
      g.lineCap='round'; g.strokeStyle='rgba(0,0,0,.45)'; g.lineWidth=R*.035; g.beginPath(); g.moveTo(px+6,py+8); g.lineTo(hx+6,hy+8); g.stroke();
      const mg=g.createLinearGradient(px,py,hx,hy); mg.addColorStop(0,'#f4f4fa'); mg.addColorStop(.5,'#9a9aaa'); mg.addColorStop(1,'#e8e8f0'); g.strokeStyle=mg; g.lineWidth=R*.028; g.beginPath(); g.moveTo(px,py); g.lineTo(hx,hy); g.stroke();
      g.save(); g.translate(hx,hy); g.rotate(a+.5); g.fillStyle='#2a2a34'; g.fillRect(-R*.03,-R*.02,R*.11,R*.06); g.fillStyle='#c8c8d4'; g.fillRect(R*.06,-R*.012,R*.03,R*.035); g.restore();
      const pg=g.createRadialGradient(px-4,py-4,2,px,py,R*.11); pg.addColorStop(0,'#ffffff'); pg.addColorStop(1,'#6a6a7a'); g.fillStyle=pg; g.beginPath(); g.arc(px,py,R*.1,0,7); g.fill(); g.fillStyle='#22222c'; g.beginPath(); g.arc(px,py,R*.04,0,7); g.fill(); }
    g.restore();
  }
  requestAnimationFrame(draw);

  /* ---------- the melody as lyrics ---------- */
  const NN=['c','db','d','eb','e','f','gb','g','ab','a','bb','b'], nm=m=>NN[((m%12)+12)%12]+(Math.floor(m/12)-1);
  let lines=[], cur=null, colorI=0;
  function beats(motif,keyRoot){ const out=[]; for(let b=0;b<4;b++){ const ns=[]; for(let s=b*4;s<b*4+4;s++) if(motif[s]!=null) ns.push(nm(keyRoot+60+motif[s])); out.push(ns); } return out; }
  function tokText(ns){ return !ns.length?'_':ns.length===1?ns[0]:'['+ns.join(' ')+']'; }
  function section(e){ if(!e.melody) return e.loop===0?'intro':'break'; if(!e.drums) return 'bridge'; if(e.loop>=e.loops-1) return 'outro'; return ['verse','verse','hook','drop'][e.loop%4]; }
  function mkLine(label,bs,ghost){ const el=document.createElement('div'); el.className='line'; el.innerHTML='<span class="lab"></span>'; el.firstChild.textContent=label;
    const toks=bs.map(ns=>{ const t=document.createElement('span'); t.className='tk'+(ghost?' ghost':''); t.textContent=tokText(ns); el.appendChild(t); return t; });
    lyr.appendChild(el); return {el,toks,bs:bs.map(x=>x.slice()),played:[[],[],[],[]]}; }
  function layout(){ const ci=lines.indexOf(cur); lines.forEach((L,i)=>{ const d=i-ci, el=L.el;
      if(d<0){ el.style.transform='translateY(calc(-50% + '+(d*2.3)+'em)) rotateX('+(-d*14)+'deg)'; el.style.opacity=Math.max(0,.45+d*.22); el.style.filter='blur('+(-d*.6)+'px)'; }
      else if(d===0){ el.style.transform='translateY(-50%)'; el.style.opacity=1; el.style.filter='none'; el.classList.add('cur'); }
      else { el.style.transform='translateY(calc(-50% + '+(d*2.5)+'em)) rotateX('+(-d*22)+'deg) translateZ('+(-d*40)+'px)'; el.style.opacity=Math.max(0,.62-d*.17); el.style.filter='blur('+(d*.9)+'px)'; el.classList.remove('cur'); } });
    while(lines.length&&lines.indexOf(cur)>3){ lines.shift().el.remove(); } }
  function reset(placeholder){ lyr.innerHTML=''; lines=[]; cur=null;
    if(placeholder){ cur=mkLine('side a',[['press'],['play'],['to'],['drop the needle']],false); lines.push(cur);
      for(let i=1;i<4;i++) lines.push(mkLine('...',[['_'],['_'],['_'],['_']],true)); layout(); } }
  reset(true);

  function onStep(e){
    if(e.s===0){ // a new bar: promote the next line, keep three ghost lines queued below
      const bs=beats(e.motif,e.keyRoot), label=section(e);
      let i=lines.indexOf(cur); let nxt=lines[i+1];
      if(!nxt||!nxt.pending){ nxt=mkLine(label,bs,true); nxt.pending=true; lines.splice(i+1,0,nxt); }
      nxt.el.firstChild.textContent=label; nxt.bs=bs; nxt.toks.forEach((t,k)=>t.textContent=tokText(bs[k]));
      if(cur) cur.toks.forEach(t=>{ t.classList.remove('hit','c0','c1','c2','c3'); t.classList.add('done'); });
      cur=nxt; cur.pending=false; cur.toks.forEach(t=>t.classList.remove('ghost'));
      // ghosts of what's coming (same motif, as it stands now)
      let have=lines.length-1-lines.indexOf(cur);
      while(have<3){ const g2=mkLine(['verse','hook','verse','drop'][(e.loop+have)%4],beats(e.motif,e.keyRoot),true); g2.pending=true; lines.push(g2); have++; }
      layout();
    }
    if(!cur) return;
    const b=e.s>>2, tk=cur.toks[b];
    if(e.note!=null){ cur.played[b].push(nm(e.note)); tk.textContent=tokText(cur.played[b]); tk.classList.remove('hit','c0','c1','c2','c3'); void tk.offsetWidth; tk.classList.add('hit','c'+(colorI++%4)); }
    for(let k=0;k<b;k++){ const t=cur.toks[k]; if(!t.classList.contains('hit')) t.classList.add('done'); }
    prog=Math.min(1,e.step/(e.loops*64)); const el=e.step*e.sd, tot=e.loops*64*e.sd, f=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
    $('#vTime').innerHTML='<b>'+f(el)+'</b> / '+f(tot);
  }
  Lofi.on('step',e=>{ if(e.motif==null) return; const d=Math.max(0,(e.t-Lofi.ctx.currentTime)*1000); setTimeout(()=>onStep(e),d); });
  const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
  Lofi.on('progress',p=>{ if(!p.dur) return; prog=Math.min(1,p.cur/p.dur); $('#vTime').innerHTML='<b>'+fmt(p.cur)+'</b> / '+fmt(p.dur); });
  const strSeed=t=>{ let h=7; for(const ch of String(t)) h=(h*31+ch.charCodeAt(0))>>>0; return h; };
  Lofi.on('track',tr=>{ T=tr; makeDisc(tr.real?strSeed(tr.name):tr.seed); prog=0;
    if(tr.real){ $('#vTitle').textContent=tr.title||tr.name; $('#vStyle').textContent=tr.artist||'Added';
      if(tr.art&&artFor!==tr.art){ artFor=tr.art; artImg=new Image(); artImg.onload=()=>{ labelCv=null; }; artImg.src=tr.art.replace('200x200','600x600'); }
      reset(false); cur=mkLine('now playing',[[tr.title||tr.name]],false); lines.push(cur); lines.push(mkLine(tr.artist||'',[['from YouTube']],true)); layout(); $('#vTime').innerHTML='<b>0:00</b> / 0:00'; return; }
    $('#vTitle').textContent=tr.name; $('#vStyle').textContent=(Lofi.STYLES[tr.style]?Lofi.STYLES[tr.style].name:'Lofi')+' · '+tr.bpm+' BPM'; reset(false); });
  Lofi.on('state',S=>{ playing=S.playing; $('#vPlay').textContent=S.playing?'❚❚':'▶'; $('#vPlay').setAttribute('aria-label',S.playing?'Pause':'Play'); });
  makeDisc(7);

  $('#vPlay').onclick=()=>{ if(!Lofi.ctx){ Lofi.init(); Lofi.setVolume(.8); } if(Lofi.state.playing) Lofi.pause(); else Lofi.play(); };
  $('#vNext').onclick=()=>{ if(!Lofi.ctx) return $('#vPlay').click(); Lofi.next(); };
  $('#vPrev').onclick=()=>{ if(!Lofi.ctx) return; Lofi.prev(); };
  addEventListener('keydown',e=>{ if(e.code==='Space'){ e.preventDefault(); $('#vPlay').click(); } else if(e.key==='ArrowRight') $('#vNext').click(); else if(e.key==='ArrowLeft') $('#vPrev').click(); });
})();
