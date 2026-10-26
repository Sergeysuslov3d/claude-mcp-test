// Fills the window around the pulled-back scene with the side panels from js/sides.js (new content that continues the scene).
// A window-wide vignette sits on top of both.
(function(){
  const scene=document.getElementById('scene'), screen=document.getElementById('screen'); if(!scene||!screen) return;
  const bg=document.createElement('canvas'); bg.id='sceneBg'; bg.setAttribute('aria-hidden','true'); screen.insertBefore(bg,scene);
  const vig=document.createElement('div'); vig.id='vig'; vig.setAttribute('aria-hidden','true'); scene.after(vig);
  const b=bg.getContext('2d'), wide=matchMedia('(min-width:700px)'), narrow=matchMedia('(max-width:699px),(max-aspect-ratio:1/1)'); let last=0, shown=null;
  function draw(){
    if(narrow.matches) return;
    const W=screen.clientWidth, H=screen.clientHeight; if(!W||!H) return;
    const NS=window.NEWSTYLE, cur=NS&&NS.cur; if(!cur||!window.SIDES) return;
    const z=wide.matches?(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom'))||1):1;
    // same geometry as #scene: object-fit contain in the window, then scaled by z around (50%, 40%)
    const iw=Math.min(W,H*16/9), sw=iw*z, sh=sw*9/16, x0=(W-sw)/2, y0=.4*H+(.5*H-.4*H)*z-sh/2, px=sw/480;   // px: screen pixels per scene pixel
    const need={ l:Math.ceil(x0/px), r:Math.ceil((W-x0-sw)/px), t:Math.ceil(y0/px), b:Math.ceil((H-y0-sh)/px) };
    const ext=SIDES.get(cur.sc,cur.T,cur.weather,cur.opt,need.l,need.r,need.t,need.b); if(!ext) return;
    const key=ext.cv+'|'+W+'x'+H+'|'+z;
    if(shown===ext&&bg.width===W&&bg.height===H&&bg.dataset.k===key) return;   // panels are still images: redraw only when they or the window change
    if(bg.width!==W||bg.height!==H){ bg.width=W; bg.height=H; }
    b.imageSmoothingEnabled=false; b.fillStyle='#0a0818'; b.fillRect(0,0,W,H);
    b.drawImage(ext.cv,x0-ext.l*px,y0-ext.t*px,ext.cv.width*px/2,ext.cv.height*px/2);
    shown=ext; bg.dataset.k=key;
  }
  function tick(now){ if(now-last>100){ last=now; draw(); } requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
})();
