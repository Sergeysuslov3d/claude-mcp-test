// Fills the margins around the pulled-back scene: a live copy of the frame, lightly softened and stretched to cover the window.
(function(){
  const scene=document.getElementById('scene'), screen=document.getElementById('screen'); if(!scene||!screen) return;
  const bg=document.createElement('canvas'); bg.id='sceneBg'; bg.width=240; bg.height=135; bg.setAttribute('aria-hidden','true');
  screen.insertBefore(bg,scene);
  const b=bg.getContext('2d'); let last=0;
  function tick(now){
    if(now-last>50){ last=now; try{ b.drawImage(scene,0,0,240,135); }catch(e){} }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
