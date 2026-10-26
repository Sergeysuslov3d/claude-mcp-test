// Fills the margins around the pulled-back scene. First choice is the outpainted picture (js/outpaint.js), which continues the scene with new
// content; until it is ready, crisp mirrored copies of the live frame stand in. A window-wide vignette sits on top of both.
(function(){
  const scene=document.getElementById('scene'), screen=document.getElementById('screen'); if(!scene||!screen) return;
  const bg=document.createElement('canvas'); bg.id='sceneBg'; bg.setAttribute('aria-hidden','true'); screen.insertBefore(bg,scene);
  const vig=document.createElement('div'); vig.id='vig'; vig.setAttribute('aria-hidden','true'); scene.after(vig);
  const b=bg.getContext('2d'), wide=matchMedia('(min-width:700px)'), narrow=matchMedia('(max-width:699px),(max-aspect-ratio:1/1)'); let last=0;
  function draw(){
    if(narrow.matches) return;
    const W=screen.clientWidth, H=screen.clientHeight; if(!W||!H) return;
    const cw=Math.ceil(W/2), ch=Math.ceil(H/2); if(bg.width!==cw||bg.height!==ch){ bg.width=cw; bg.height=ch; }
    b.imageSmoothingEnabled=false;
    const z=wide.matches?(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom'))||1):1;
    // same geometry as #scene: object-fit contain in the window, then scaled by z around (50%, 40%)
    const iw=Math.min(W,H*16/9), sw=iw*z/2, sh=sw*9/16, cx=cw/2, cy=(.4*H+(.5*H-.4*H)*z)/2, sb=sw/960;
    const x0=cx-sw/2, y0=cy-sh/2, px=2*sb;                       // px: bg pixels per low-res scene pixel
    const need={ l:Math.max(0,Math.ceil(x0/px)), r:Math.max(0,Math.ceil((cw-x0-sw)/px)), t:Math.max(0,Math.ceil(y0/px)), b:Math.max(0,Math.ceil((ch-y0-sh)/px)) };
    let ext=null; const NS=window.NEWSTYLE, cur=NS&&NS.cur;
    if(NS&&NS.outpaint&&cur&&window.OUTPAINT&&(need.l+need.r+need.t+need.b>0)) ext=OUTPAINT.get(cur.sc,cur.T,cur.weather,cur.opt,need.l,need.r,need.t,need.b);
    const covered=ext&&ext.l>=need.l&&ext.r>=need.r&&ext.t>=need.t&&ext.b>=need.b;
    if(!covered){
      for(let i=-4;i<=4;i++) for(let j=-3;j<=3;j++){
        const x=cx-sw/2+i*sw, y=cy-sh/2+j*sh; if(x>cw||y>ch||x+sw<0||y+sh<0) continue;
        const fx=Math.abs(i)%2, fy=Math.abs(j)%2;
        b.save(); b.translate(x+(fx?sw:0),y+(fy?sh:0)); b.scale(fx?-1:1,fy?-1:1);
        try{ b.drawImage(scene,0,0,sw+.5,sh+.5); }catch(e){}
        b.restore();
      }
    }
    if(ext) b.drawImage(ext.cv,x0-ext.l*px,y0-ext.t*px,ext.cv.width*sb,ext.cv.height*sb);
  }
  function tick(now){ if(now-last>40){ last=now; draw(); } requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
})();
