// Fills the margins around the pulled-back scene: a small copy of the live frame, blurred and stretched to cover the window.
(function(){
  const scene=document.getElementById('scene'), screen=document.getElementById('screen'); if(!scene||!screen) return;
  const bg=document.createElement('canvas'); bg.id='sceneBg'; bg.width=96; bg.height=54; bg.setAttribute('aria-hidden','true');
  screen.insertBefore(bg,scene);
  const b=bg.getContext('2d'); let last=0;
  function tick(now){
    if(now-last>90){ last=now; try{ b.drawImage(scene,0,0,96,54); }catch(e){} }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
