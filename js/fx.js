// 2x pixel pipeline: scenes are drawn at 480x270, smoothed to 960x540 with the Scale2x/EPX rule
// (keeps hard pixels, rounds diagonals), then a native 960x540 detail layer, light and grade go on top.
window.FX = (function(){
  const LW=480, LH=270, W=960, H=540;
  const hi={};                       // per-scene native-resolution detail layers
  let dstImg=null, dst32=null;

  function scale2x(low,high){
    const srcImg=low.getImageData(0,0,LW,LH), src=new Uint32Array(srcImg.data.buffer);
    if(!dstImg){ dstImg=high.createImageData(W,H); dst32=new Uint32Array(dstImg.data.buffer); }
    const dst=dst32, w2=W;
    for(let y=0;y<LH;y++){
      const row=y*LW, up=y>0?row-LW:row, dn=y<LH-1?row+LW:row, o0=y*2*w2;
      for(let x=0;x<LW;x++){
        const i=row+x, P=src[i], A=src[up+x], D=src[dn+x], C=x>0?src[i-1]:P, B=x<LW-1?src[i+1]:P;
        let e0=P,e1=P,e2=P,e3=P;
        if(C!==B&&A!==D){ if(A===C) e0=A; if(A===B) e1=B; if(D===C) e2=C; if(D===B) e3=B; }
        const o=o0+x*2; dst[o]=e0; dst[o+1]=e1; dst[o+w2]=e2; dst[o+w2+1]=e3;
      }
    }
    high.putImageData(dstImg,0,0);
  }

  /* ---------- reusable post layers ---------- */
  const mk=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
  const bloomA=mk(240,135), bloomB=mk(120,68), bA=bloomA.getContext('2d'), bB=bloomB.getContext('2d');
  const vig=(()=>{ const c=mk(W,H), g=c.getContext('2d'), r=g.createRadialGradient(W/2,H*.48,H*.32,W/2,H*.5,H*.95);
    r.addColorStop(0,'rgba(4,2,12,0)'); r.addColorStop(.62,'rgba(4,2,12,.16)'); r.addColorStop(1,'rgba(4,2,12,.62)'); g.fillStyle=r; g.fillRect(0,0,W,H); return c; })();
  const grain=(()=>{ const c=mk(256,256), g=c.getContext('2d'), id=g.createImageData(256,256);
    for(let i=0;i<id.data.length;i+=4){ const v=Math.random()<.5?0:255; id.data[i]=id.data[i+1]=id.data[i+2]=v; id.data[i+3]=(Math.random()*70)|0; } g.putImageData(id,0,0); return c; })();
  const lines=(()=>{ const c=mk(4,4), g=c.getContext('2d'); g.fillStyle='rgba(0,0,0,.22)'; g.fillRect(0,0,4,1); g.fillStyle='rgba(255,255,255,.03)'; g.fillRect(0,2,4,1); return c; })();
  const GRADE={
    apartment:['rgba(90,50,170,.50)','rgba(255,120,190,.30)'], downtown:['rgba(60,30,140,.50)','rgba(255,100,160,.38)'],
    beach:['rgba(90,40,160,.42)','rgba(255,170,90,.46)'], keys:['rgba(40,90,200,.38)','rgba(255,170,100,.38)'],
    grassrivers:['rgba(60,40,140,.45)','rgba(40,170,150,.36)'], gellhorn:['rgba(30,20,100,.52)','rgba(230,60,170,.34)'],
    ambrosia:['rgba(110,60,150,.38)','rgba(255,170,60,.46)'], kalaga:['rgba(20,40,150,.50)','rgba(40,130,120,.32)']
  };
  const gradeCache={};
  function gradeFill(ctx,id){
    let g=gradeCache[id]; const cols=GRADE[id]||GRADE.apartment;
    if(!g){ g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,cols[0]); g.addColorStop(1,cols[1]); gradeCache[id]=g; }
    ctx.globalCompositeOperation='soft-light'; ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.globalCompositeOperation='source-over';
  }
  function bloom(ctx,amount){
    bA.imageSmoothingEnabled=true; bB.imageSmoothingEnabled=true;
    try{ bA.filter='brightness(.72) contrast(1.7)'; }catch(e){}
    bA.clearRect(0,0,240,135); bA.drawImage(ctx.canvas,0,0,240,135); try{ bA.filter='none'; }catch(e){}
    bB.clearRect(0,0,120,68); bB.drawImage(bloomA,0,0,120,68);
    ctx.save(); ctx.imageSmoothingEnabled=true; ctx.globalCompositeOperation='screen'; ctx.globalAlpha=amount; ctx.drawImage(bloomB,0,0,W,H); ctx.globalAlpha=amount*.5; ctx.drawImage(bloomA,0,0,W,H); ctx.restore();
  }

  // helpers for the native detail layers: drawn in design units (480x270) on a 2x context, so .5 steps land on real pixels
  const q=v=>Math.round(v*2)/2;
  const R=(c,x,y,w,h,col)=>{ c.fillStyle=col; c.fillRect(q(x),q(y),Math.max(.5,q(w)),Math.max(.5,q(h))); };
  const rng=seed=>{ let s=(seed>>>0)||1; return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }; };
  const softGlow=(c,x,y,r,rgb,a)=>{ const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba('+rgb+','+a+')'); g.addColorStop(1,'rgba('+rgb+',0)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); };

  /* ---------- full frame: low-res frame is already drawn into `low` ---------- */
  function render(ctx,low,t,sc,weather,opt,T){
    ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
    if(opt.q==='classic'){ ctx.imageSmoothingEnabled=false; ctx.drawImage(low.canvas,0,0,W,H); return; }
    scale2x(low,ctx);
    // native detail: weather first, then this place's own fine layer
    ctx.save(); ctx.setTransform(2,0,0,2,0,0); ctx.imageSmoothingEnabled=false;
    if(WX.pending) WX.drawHi(ctx,t,WX.pending.kind,WX.pending.clip);
    const f=hi[sc.id]; if(f) f(ctx,t,{weather,glow:opt.q==='high',tod:T,sp:T?SKYX.pos(sc,T):null,day:T?1-T.P.lamp:0});
    ctx.restore();
    if(opt.q==='high'){
      if(opt.glow) bloom(ctx,.30);
      gradeFill(ctx,sc.id);
      ctx.drawImage(vig,0,0);
      if(opt.grain){ const ox=(Math.random()*256)|0, oy=(Math.random()*256)|0; ctx.save(); ctx.globalAlpha=.075; ctx.fillStyle=ctx.createPattern(grain,'repeat'); ctx.translate(-ox,-oy); ctx.fillRect(ox,oy,W,H); ctx.restore(); }
      if(opt.lines){ ctx.save(); ctx.fillStyle=ctx.createPattern(lines,'repeat'); ctx.fillRect(0,0,W,H); ctx.restore(); }
    }
  }
  return { render, hi, R, rng, softGlow, q, scale2x };
})();
