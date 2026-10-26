// Cassette page: a see-through pink tape you can drag to rotate (with inertia) and scroll to zoom.
// Reels turn while Lofi Leonida plays and the tape winds across; REW / FF spin them fast and skip.
(function(){
  const $=s=>document.querySelector(s);
  const rig=$('#rig'), zoom=$('#zoom');
  const TAPES=[ {name:'Vice Nights',style:'jazzhop',c:'255,46,160'}, {name:'Keys Drift',style:'ambient',c:'40,170,255'}, {name:'Grassrivers',style:'bossa',c:'30,200,140'},
    {name:'Sunset Strip',style:'synth',c:'255,120,40'}, {name:'Port Gellhorn',style:'chiptune',c:'150,80,255'} ];
  let cur=0;

  // rotate / zoom
  let rx=14, ry=-18, vx=0, vy=0, z=1, drag=null;
  rig.addEventListener('pointerdown',e=>{ rig.setPointerCapture(e.pointerId); rig.classList.add('drag'); drag={x:e.clientX,y:e.clientY}; });
  rig.addEventListener('pointermove',e=>{ if(!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.x=e.clientX; drag.y=e.clientY; vy=dx*.5; vx=-dy*.4; ry+=vy; rx=Math.max(-80,Math.min(80,rx+vx)); });
  const up=()=>{ drag=null; rig.classList.remove('drag'); }; rig.addEventListener('pointerup',up); rig.addEventListener('pointercancel',up);
  addEventListener('wheel',e=>{ e.preventDefault(); z=Math.max(.6,Math.min(1.7,z*(e.deltaY>0?.92:1.08))); zoom.style.setProperty('--z',z); },{passive:false});

  // reels
  let rot=0, speed=0, target=0, prog=0, playing=false, last=performance.now(), boost=0;
  const rl=$('#reelL i'), rr=$('#reelR i'), packL=$('#packL'), packR=$('#packR');
  function frame(now){ requestAnimationFrame(frame); const dt=Math.min(.05,(now-last)/1000); last=now;
    if(!drag){ ry+=vy; rx+=vx; vy*=.94; vx*=.9; if(Math.abs(vy)<.05) ry+=(-18+Math.sin(now/2600)*10-ry)*.008; rx+=(14-rx)*.01; }
    rig.style.setProperty('--rx',rx+'deg'); rig.style.setProperty('--ry',ry+'deg'); rig.style.setProperty('--hx',(40+Math.sin(ry*Math.PI/180)*45)+'%');
    target=(playing?1:0)+boost; boost*=Math.pow(.2,dt); speed+=(target-speed)*Math.min(1,dt*4); rot+=speed*dt*200;
    rl.style.transform='rotate('+(-rot)+'deg)'; rr.style.transform='rotate('+(-rot*1.15)+'deg)';
    packL.style.setProperty('--pl',(31-prog*14)+'%'); packR.style.setProperty('--pr',(17+prog*14)+'%'); }
  requestAnimationFrame(frame);

  // shelf of tapes (colour + music style)
  const tapes=$('#tapes');
  TAPES.forEach((t,i)=>{ const b=document.createElement('button'); b.className='tape'; b.style.setProperty('--c',t.c); b.title=t.name; b.setAttribute('aria-label','Play tape '+t.name); b.onclick=()=>load(i,true); tapes.appendChild(b); });
  function load(i,play){ cur=i; rig.style.setProperty('--c',TAPES[i].c); [...tapes.children].forEach((b,k)=>b.classList.toggle('on',k===i));
    if(play){ if(!Lofi.ctx){ Lofi.init(); Lofi.setVolume(.8); } Lofi.setStyle(TAPES[i].style); Lofi.playSeed(Math.floor(Math.random()*9000)+100,TAPES[i].style); } }
  load(0,false);

  $('#holoBtn').onclick=e=>{ const on=e.currentTarget.classList.toggle('on'); rig.style.setProperty('--ho',on?.65:0); };
  $('#play').onclick=()=>{ if(!Lofi.ctx){ load(cur,true); return; } if(Lofi.state.playing) Lofi.pause(); else Lofi.play(); };
  $('#ff').onclick=()=>{ boost=6; if(Lofi.ctx) Lofi.next(); else load(cur,true); };
  $('#rew').onclick=()=>{ boost=-6; if(Lofi.ctx) Lofi.prev(); };

  Lofi.on('track',T=>{ $('#tname').textContent=T.name; const n=$('#now'); n.innerHTML='<b></b> · '; n.firstChild.textContent=T.name; n.append(TAPES[cur].name); prog=0; });
  Lofi.on('state',S=>{ playing=S.playing; rig.classList.toggle('float',S.playing); $('#play').textContent=S.playing?'❚❚':'▶'; });
  Lofi.on('step',e=>{ prog=Math.min(1,e.step/(e.loops*64)); });
  addEventListener('keydown',e=>{ if(e.code==='Space'){ e.preventDefault(); $('#play').click(); } else if(e.key==='ArrowRight') load((cur+1)%TAPES.length,true); else if(e.key==='ArrowLeft') load((cur+TAPES.length-1)%TAPES.length,true); });
})();
