// Real cassette photo: the hub spokes and the tape pack shimmer turn while the music plays;
// REW / FF spin them fast (and skip), the hand-written label shows the current track.
(function(){
  const $=s=>document.querySelector(s);
  const h1=$('#h1 i'), h2=$('#h2 i'), pack=$('#pack');
  let rot=0, speed=0, boost=0, playing=false, last=performance.now();
  (function frame(now){ requestAnimationFrame(frame); const dt=Math.min(.05,(now-last)/1000); last=now;
    boost*=Math.pow(.15,dt); speed+=(((playing?1:0)+boost)-speed)*Math.min(1,dt*3); rot-=speed*dt*160;
    h1.style.transform='rotate('+rot+'deg)'; h2.style.transform='rotate('+(rot*1.25)+'deg)'; pack.style.rotate=(rot*.6)+'deg'; })(last);
  Lofi.on('state',S=>{ playing=S.playing; });
  Lofi.on('track',T=>{ $('#tname').textContent=T.name.split(' ').slice(0,2).join(' '); const n=$('#now'); n.innerHTML='<b></b> · on tape'; n.firstChild.textContent=T.name; });
  $('#play').onclick=()=>{ if(!Lofi.ctx) return PhotoPage.start('jazzhop'); if(Lofi.state.playing) Lofi.pause(); else Lofi.play(); };
  $('#ff').onclick=()=>{ boost=6; if(Lofi.ctx) Lofi.next(); else PhotoPage.start('jazzhop'); };
  $('#rew').onclick=()=>{ boost=-6; if(Lofi.ctx) Lofi.prev(); };
  addEventListener('keydown',e=>{ if(e.code==='Space'){ e.preventDefault(); $('#play').click(); } });
})();
