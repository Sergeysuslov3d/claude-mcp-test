// Shared for the photo pages: tilt the photo toward the pointer, slide a sheen across it,
// and wire the play / skip buttons to the generative music.
window.PhotoPage=(function(){
  const $=s=>document.querySelector(s), photo=$('#photo');
  let tx=0, ty=0, ax=0, ay=0;
  addEventListener('pointermove',e=>{ tx=e.clientX/innerWidth-.5; ty=e.clientY/innerHeight-.5; });
  (function frame(){ requestAnimationFrame(frame); ax+=(tx-ax)*.08; ay+=(ty-ay)*.08;
    photo.style.setProperty('--ty',(ax*7)+'deg'); photo.style.setProperty('--tx',(-ay*5)+'deg'); photo.style.setProperty('--sx',(50+ax*90)+'%'); })();
  function start(style){ if(!Lofi.ctx){ Lofi.init(); Lofi.setVolume(.8); } if(style){ Lofi.setStyle(style); Lofi.playSeed(Math.floor(Math.random()*9000)+100,style); } else Lofi.play(); }
  Lofi.on('state',S=>{ document.body.classList.toggle('playing',S.playing); const b=$('#play'); if(b) b.textContent=S.playing?'❚❚':'▶'; });
  return { start };
})();
