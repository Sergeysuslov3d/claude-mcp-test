// Outpainting: grows the picture past its own edges. For every scene and time of day a still copy of the finished frame is made,
// then new columns (left, right) and rows (top, bottom) are built from the scene's own fragments, chosen so that each step continues
// what is already there (horizon, water, ground, skyline, sky). The result is a bigger image the window can show without empty edges.
window.OUTPAINT=(function(){
  const BH=18, K=3, RUNMAX=20, LAMBDA=7;
  const NS=()=>window.NEWSTYLE;
  const rngOf=seed=>{ let s=(seed>>>0)||1; return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }; };
  const d=(a,b)=>{ const r=(a&255)-(b&255), g=((a>>>8)&255)-((b>>>8)&255), bl=((a>>>16)&255)-((b>>>16)&255); return (r<0?-r:r)+(g<0?-g:g)+(bl<0?-bl:bl); };

  // P = {w,h, lo:Uint32Array (w*h), hi:Uint32Array (2w*2h)}
  function flipH(P){ const {w,h}=P, lo=new Uint32Array(w*h), hi=new Uint32Array(4*w*h);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) lo[y*w+x]=P.lo[y*w+(w-1-x)];
    for(let y=0;y<2*h;y++) for(let x=0;x<2*w;x++) hi[y*2*w+x]=P.hi[y*2*w+(2*w-1-x)];
    return {w,h,lo,hi}; }
  function transpose(P){ const {w,h}=P, lo=new Uint32Array(w*h), hi=new Uint32Array(4*w*h);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) lo[x*h+y]=P.lo[y*w+x];
    for(let y=0;y<2*h;y++) for(let x=0;x<2*w;x++) hi[x*2*h+y]=P.hi[y*2*w+x];
    return {w:h,h:w,lo,hi}; }

  // append n columns to the right; every band of rows picks its own source column so layered scenes (sky / skyline / water / ground) each keep their own structure
  function* extendRight(P,n,seed){
    const {w,h}=P, W2=w+n, rand=rngOf(seed), lo=new Uint32Array(W2*h), hi=new Uint32Array(4*W2*h);
    for(let y=0;y<h;y++) lo.set(P.lo.subarray(y*w,y*w+w),y*W2);
    for(let y=0;y<2*h;y++) hi.set(P.hi.subarray(y*2*w,y*2*w+2*w),y*2*W2);
    const nb=Math.ceil(h/BH), prev=new Array(nb).fill(-9), run=new Array(nb).fill(0), recent=[]; for(let b=0;b<nb;b++) recent.push([]);
    const wgt=[1,.6,.4];
    for(let s=0;s<n;s++){
      const x=w+s; let up=-1;
      for(let b=0;b<nb;b++){
        const y0=b*BH, y1=Math.min(h,y0+BH); let best=1e18, bc=K;
        const rc=recent[b], noRun=run[b]>=RUNMAX;
        for(let c=K;c<w;c++){
          if(noRun&&Math.abs(c-(prev[b]+1))<=RUNMAX) continue;
          let cost=0;
          for(let j=0;j<K;j++){ const a=x-1-j, q=c-1-j; let sj=0; for(let y=y0;y<y1;y++) sj+=d(lo[y*W2+a],lo[y*W2+q]); cost+=sj*wgt[j]; if(cost>best) break; }
          if(cost>best) continue;
          if(up>=0) cost+=LAMBDA*Math.min(Math.abs(c-up),40)*(y1-y0)/BH;
          for(let r=rc.length-1;r>=Math.max(0,rc.length-36);r--) if(Math.abs(c-rc[r])<5){ cost+=260*(y1-y0)/BH; break; }
          cost*=1+.1*rand();
          if(cost<best){ best=cost; bc=c; }
        }
        run[b]=bc===prev[b]+1?run[b]+1:0; prev[b]=bc; rc.push(bc); up=bc;
        for(let y=y0;y<y1;y++){
          lo[y*W2+x]=lo[y*W2+bc];
          for(let dy=0;dy<2;dy++) for(let dx=0;dx<2;dx++) hi[(2*y+dy)*2*W2+2*x+dx]=hi[(2*y+dy)*2*W2+2*bc+dx];
        }
      }
      if(s%3===2) yield;
    }
    return {w:W2,h,lo,hi};
  }
  function* grow(P,left,right,top,bottom,seed){
    let Q=P;
    if(right>0){ const g=extendRight(Q,right,seed); let r; while(!(r=g.next()).done) yield; Q=r.value; }
    if(left>0){ const g=extendRight(flipH(Q),left,seed+1); let r; while(!(r=g.next()).done) yield; Q=flipH(r.value); }
    if(bottom>0){ const g=extendRight(transpose(Q),bottom,seed+2); let r; while(!(r=g.next()).done) yield; Q=transpose(r.value); }
    if(top>0){ const g=extendRight(flipH(transpose(Q)),top,seed+3); let r; while(!(r=g.next()).done) yield; Q=transpose(flipH(r.value)); }
    return Q;
  }

  /* ---------- still copy of the finished frame (no cars, people or animation) ---------- */
  const sceneryCache={};
  function scenery(sc,phase){ const k=sc.id+'|'+phase; if(sceneryCache[k]) return sceneryCache[k];
    const [cv,c]=PX.makeCanvas(480,270), L=TOD.PAL[phase].lamp; SK.lit=L; SK.k=Math.max(.15,L); sc.build(c,phase); SK.lit=1; SK.k=1;
    TOD.relight(c,phase,sc.relight==null?1:sc.relight); return sceneryCache[k]=cv; }
  function stillFrame(sc,T,weather,opt){
    const [lc,low]=PX.makeCanvas(480,270); low.fillStyle='#000'; low.fillRect(0,0,480,270);
    low.drawImage(SKYX.gradientCanvas(sc,T.a),0,0); if(T.f>.01){ low.globalAlpha=T.f; low.drawImage(SKYX.gradientCanvas(sc,T.b),0,0); low.globalAlpha=1; }
    if(!sc.under){ SKYX.overcast(low,sc,T); SKYX.stars(low,sc,T,5); SK.k=1; SKYX.celestial(low,sc,T,5); SKYX.clouds(low,sc,T,5); }
    low.drawImage(scenery(sc,T.a),0,0); if(T.f>.01){ low.globalAlpha=T.f; low.drawImage(scenery(sc,T.b),0,0); low.globalAlpha=1; }
    SK.k=T.lampK; SK.lit=T.P.lamp; if(sc.water) LIFE.water(low,sc,T,5,sc.water[0],sc.water[1],sc.water[2]); SK.k=1; SK.lit=1;
    const out=document.createElement('canvas'); out.width=960; out.height=540; const o=out.getContext('2d');
    const pend=WX.pending, skip=WX.skip; WX.pending=null; WX.skip=true;
    NS().building=true; try{ FX.render(o,low,5,sc,weather,opt,T); } finally{ NS().building=false; WX.pending=pend; WX.skip=skip; }
    return out;
  }
  const C=6;                                                     // edge columns/rows left out: they hold edge artefacts that would be copied outward
  function toPlanes(out){
    const hiD=out.getContext('2d').getImageData(0,0,960,540), src=new Uint32Array(hiD.data.buffer.slice(0)), w=480-2*C, h=270-2*C;
    const hi=new Uint32Array(4*w*h), lo=new Uint32Array(w*h);
    for(let y=0;y<2*h;y++) for(let x=0;x<2*w;x++) hi[y*2*w+x]=src[(2*C+y)*960+2*C+x];
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) lo[y*w+x]=hi[(2*y)*2*w+2*x];
    return {w,h,lo,hi};
  }
  function toCanvas(P){ const cv=document.createElement('canvas'); cv.width=2*P.w; cv.height=2*P.h; const c=cv.getContext('2d'), id=c.createImageData(cv.width,cv.height); new Uint32Array(id.data.buffer).set(P.hi); c.putImageData(id,0,0); return cv; }

  /* ---------- job queue: one build at a time, a few steps per tick so the page never stalls ---------- */
  const done={}, order=[]; let job=null, token=0;
  const keyOf=(sc,T)=>sc.id+'|'+T.a;
  const up=v=>Math.min(300,Math.ceil(v/16)*16+16);
  function start(sc,T,weather,opt,l,r,t,b){
    const key=keyOf(sc,T), my=++token, seed=[...sc.id].reduce((a,ch)=>a*31+ch.charCodeAt(0),7)+T.a.length;
    const P=toPlanes(stillFrame(sc,T,weather,opt));
    job={key,l,r,t,b,gen:grow(P,l,r,t,b,seed)};
    (function step(){ if(my!==token) return; const t1=performance.now(); let res;
      while(performance.now()-t1<10){ res=job.gen.next(); if(res.done) break; }
      if(res&&res.done){ done[key]={cv:toCanvas(res.value),l:l-C,r:r-C,t:t-C,b:b-C}; order.push(key); while(order.length>6) delete done[order.shift()]; job=null; }
      else setTimeout(step,0); })();
  }
  // extension (low-res pixels per side) wanted by the window; returns the finished image for this scene when it covers it, else the best older one or null
  function get(sc,T,weather,opt,l,r,t,b){
    const key=keyOf(sc,T), have=done[key]; l=up(l); r=up(r); t=up(t); b=up(b);
    if(have&&have.l>=l&&have.r>=r&&have.t>=t&&have.b>=b) return have;
    const gl=l+C, gr=r+C, gt=t+C, gb=b+C;                       // columns/rows to generate (the cropped edge has to be re-grown too)
    if(!job||job.key!==key||job.l<gl||job.r<gr||job.t<gt||job.b<gb)
      start(sc,T,weather,opt,Math.max(gl,have?have.l+C:0),Math.max(gr,have?have.r+C:0),Math.max(gt,have?have.t+C:0),Math.max(gb,have?have.b+C:0));
    return have||null;
  }
  return { get };
})();
