// Fills the margins around the pulled-back scene with crisp mirrored copies of the live frame, so the picture seems to continue past its edges.
(function(){
  const scene=document.getElementById('scene'), screen=document.getElementById('screen'); if(!scene||!screen) return;
  const bg=document.createElement('canvas'); bg.id='sceneBg'; bg.setAttribute('aria-hidden','true');
  screen.insertBefore(bg,scene);
  const b=bg.getContext('2d'), wide=matchMedia('(min-width:700px)'); let last=0;
  function draw(){
    const W=screen.clientWidth, H=screen.clientHeight; if(!W||!H) return;
    const cw=Math.ceil(W/2), ch=Math.ceil(H/2); if(bg.width!==cw||bg.height!==ch){ bg.width=cw; bg.height=ch; }
    b.imageSmoothingEnabled=false;
    const z=wide.matches?(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom'))||1):1;
    // same geometry as #scene: object-fit contain in the window, then scaled by z around (50%, 40%)
    const iw=Math.min(W,H*16/9), sw=iw*z/2, sh=sw*9/16, cx=cw/2, cy=(.4*H+(.5*H-.4*H)*z)/2;
    for(let i=-4;i<=4;i++) for(let j=-3;j<=3;j++){
      const x=cx-sw/2+i*sw, y=cy-sh/2+j*sh; if(x>cw||y>ch||x+sw<0||y+sh<0) continue;
      const fx=Math.abs(i)%2, fy=Math.abs(j)%2;
      b.save(); b.translate(x+(fx?sw:0),y+(fy?sh:0)); b.scale(fx?-1:1,fy?-1:1);
      try{ b.drawImage(scene,0,0,sw+.5,sh+.5); }catch(e){}
      b.restore();
    }
  }
  function tick(now){ if(now-last>40){ last=now; draw(); } requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
})();
