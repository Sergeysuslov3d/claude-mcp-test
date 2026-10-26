// Time of day: dawn / day / sunset / dusk / night. Moving sun & moon, stars, drifting pixel clouds, scene relighting.
window.TOD = (function(){
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), sm=x=>{ x=clamp(x,0,1); return x*x*(3-2*x); }, lerp=(a,b,f)=>a+(b-a)*f;
  const PHASES=['night','dawn','day','sunset','dusk'];
  const PAL={
    night: { sky:['#05031a','#120a34','#26104c','#481a5e','#8a2a6c'], lamp:1,   stars:1,   cloud:['#3a3070','#1c1644'], gain:[1,1,1],          lift:[0,0,0],    sat:1 },
    dawn:  { sky:['#2a2a62','#5a4a8c','#c86a8c','#ff9c7c','#ffd6a0'], lamp:.5,  stars:.2,  cloud:['#ffd4b8','#a87498'], gain:[1.32,1.16,1.04], lift:[44,22,16],  sat:.95 },
    day:   { sky:['#2c78d0','#4a98e0','#78baf0','#a8d8f6','#d4ecf8'], lamp:.05, stars:0,   cloud:['#ffffff','#bcd0e4'], gain:[1.85,1.9,2.0],   lift:[22,30,42],  sat:.8 },
    sunset:{ sky:['#262a68','#7a3a7c','#e0507a','#ff9a5a','#ffd27a'], lamp:.45, stars:.08, cloud:['#ffc4a0','#94507e'], gain:[1.38,1.1,.95],   lift:[42,14,6],   sat:1.05 },
    dusk:  { sky:['#0e0e3a','#241a58','#5a2a68','#a8466a','#e0806a'], lamp:.88, stars:.6,  cloud:['#8a5a8c','#3a2a5c'], gain:[1.06,1.0,1.1],   lift:[8,4,18],   sat:1.02 }
  };
  const KEYS=[[0,'night'],[4.8,'night'],[6.2,'dawn'],[7.9,'day'],[16.7,'day'],[18.3,'sunset'],[19.5,'dusk'],[20.9,'night'],[24,'night']];
  const FIXED={ dawn:6.6, day:12.5, sunset:18.2, dusk:19.4, night:23.4 };
  let mode='auto', cycleStart=Date.now(), cycleBase=new Date().getHours();

  function hour(){
    if(mode==='auto'){ const d=new Date(); return d.getHours()+d.getMinutes()/60+d.getSeconds()/3600; }
    if(mode==='cycle') return (cycleBase+(Date.now()-cycleStart)/1000*24/480)%24;     // a full day in 8 minutes
    return FIXED[mode]||12;
  }
  function setMode(m){ mode=m; if(m==='cycle'){ cycleStart=Date.now(); cycleBase=hour.call&&new Date().getHours(); } }
  const lerpArr=(A,B,f)=>A.map((v,i)=>lerp(v,B[i],f));
  const lerpCol=(A,B,f)=>A.map((c,i)=>PX.mix(c,B[i],f));

  // weather turns the sky grey and hides sun/stars
  const OVER={ clear:0, drizzle:.38, rain:.55, storm:.8, fog:.5 };
  function at(h,weather){
    let a='night',b='night',f=0;
    for(let i=0;i<KEYS.length-1;i++){ const [h0,n0]=KEYS[i],[h1,n1]=KEYS[i+1]; if(h>=h0&&h<h1){ a=n0; b=n1; f=n0===n1?0:sm((h-h0)/(h1-h0)); break; } }
    const A=PAL[a], B=PAL[b];
    const ov=OVER[weather]||0;
    const P={ lamp:lerp(A.lamp,B.lamp,f), stars:lerp(A.stars,B.stars,f)*(1-ov), cloud:lerpCol(A.cloud,B.cloud,f) };
    const dayT=(h-6)/12, sunVis=sm((h-5.7)/.6)*sm((18.7-h)/.6)*(1-ov*.85);
    const mt=((h+6)%24-6)/12, moonH=(h>=18?h-18:h+6)/12;                          // moon from 18:00 to 06:00
    const moonVis=(h>=17.8||h<6.3)?(1-ov*.9):0;
    const lampK=clamp(.16+.84*Math.max(P.lamp,ov*.6),0,1);
    return { h, a, b, f, P, ov, lampK, sun:{x:clamp(dayT,0,1), y:Math.max(0,Math.sin(Math.PI*clamp(dayT,0,1))), vis:sunVis, low:1-Math.max(0,Math.sin(Math.PI*clamp(dayT,0,1)))},
      moon:{x:clamp(moonH,0,1), y:Math.max(0,Math.sin(Math.PI*clamp(moonH,0,1))), vis:moonVis} };
  }
  const label=h=>{ const H=Math.floor(h)%24, M=Math.floor((h-Math.floor(h))*60); return String(H).padStart(2,'0')+':'+String(M).padStart(2,'0'); };
  const phaseName=T=>T.f<.5?T.a:T.b;

  // per-pixel relight of a night-authored scenery layer into another phase
  function relight(ctx,phase,strength){
    if(phase==='night') return; const P=PAL[phase], k=strength==null?1:strength;
    const g=P.gain.map(v=>1+(v-1)*k), l=P.lift.map(v=>v*k), s=1+(P.sat-1)*k;
    const id=ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height), d=id.data;
    for(let i=0;i<d.length;i+=4){ if(!d[i+3]) continue; const r=d[i],gg=d[i+1],b=d[i+2], lum=.3*r+.59*gg+.11*b;
      d[i]=clamp((lum+(r-lum)*s)*g[0]+l[0],0,255); d[i+1]=clamp((lum+(gg-lum)*s)*g[1]+l[1],0,255); d[i+2]=clamp((lum+(b-lum)*s)*g[2]+l[2],0,255); }
    ctx.putImageData(id,0,0);
  }
  return { PHASES, PAL, hour, setMode, get mode(){ return mode; }, at, label, phaseName, relight, FIXED };
})();

// Sky painting: gradient (cached per phase), stars, sun, moon, clouds.
window.SKYX = (function(){
  const {R,P,disc,grad,rng,mix} = PX;
  const cache={};
  function gradientCanvas(sc,phase){
    const k=sc.id+'|'+phase; if(cache[k]) return cache[k];
    const r=sc.sky, [cv,c]=PX.makeCanvas(480,270), stops=(sc.skyStops&&sc.skyStops[phase])||TOD.PAL[phase].sky;
    grad(c,r.x,r.y,r.w,Math.max(r.h,(r.horizon||0)-r.y+10),stops);
    return cache[k]=cv;
  }
  const starCache={};
  function stars(c,sc,T,t){
    if(T.P.stars<.03) return; const r=sc.sky; let L=starCache[sc.id];
    if(!L){ const g=rng(sc.id.length*977+13); L=starCache[sc.id]=[]; for(let i=0;i<(r.w*r.h)/260;i++) L.push([r.x+Math.floor(g()*r.w),r.y+Math.floor(g()*r.h*.8),g()*6,g()]); }
    for(const [x,y,ph,b] of L){ const v=Math.sin(t*1.5+ph)*.5+.5; if(v*T.P.stars>.35-b*.2) P(c,x,y,b>.85?'#ffffff':(b>.5?'#d8deff':'#9aa4d8')); }
  }
  function celestial(c,sc,T,t){
    const r=sc.sky, hz=r.horizon||(r.y+r.h), x0=r.x+(r.sx0!=null?r.sx0:r.w*.08), x1=r.x+(r.sx1!=null?r.sx1:r.w*.92), arc=r.arc||(hz-r.y-14);
    c.save(); c.beginPath(); c.rect(r.x,r.y,r.w,hz-r.y+12); c.clip();
    if(T.moon.vis>.02){ const mx=x0+(x1-x0)*T.moon.x, my=hz+4-arc*T.moon.y; SK.glow(c,mx,my,22,'#c8d4ff',.5*T.moon.vis);
      disc(c,mx,my,7,'#f2f0ff'); disc(c,mx+3,my-2,6,mix('#f2f0ff','#c8c4e0',.4)); disc(c,mx,my,7,'rgba(242,240,255,'+(.0)+')'); P(c,mx-2,my-1,'#c8c4e0'); P(c,mx+1,my+2,'#c8c4e0'); R(c,mx-3,my+1,2,1,'#d4d0ea'); }
    if(T.sun.vis>.02){ const sx=x0+(x1-x0)*T.sun.x, sy=hz+6-arc*T.sun.y, low=T.sun.low, col=mix('#fff8d8','#ffb060',low), glow=mix('#fff0b0','#ff9a50',low);
      SK.glow(c,sx,sy,40+low*30,glow,(.5+low*.4)*T.sun.vis); disc(c,sx,sy,9+low*3,col); disc(c,sx,sy,6+low*2,mix(col,'#ffffff',.5)); }
    c.restore();
  }
  // pixel clouds: masks built once, coloured from the live palette
  const cloudMasks={};
  function mask(seed){
    if(cloudMasks[seed]) return cloudMasks[seed];
    const g=rng(seed), w=36+Math.floor(g()*70), h=10+Math.floor(g()*12), m=new Uint8Array(w*h), bumps=[];
    for(let i=0;i<4+Math.floor(g()*5);i++){ const rr=4+g()*(h*.7); bumps.push([rr+g()*(w-2*rr),h-rr-g()*2,rr]); }
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){ let inside=false; for(const [bx,by,br] of bumps){ if((x-bx)**2+((y-by)*1.3)**2<br*br){ inside=true; break; } } if(y>=h-3&&x>2&&x<w-3) inside=inside||g()<.0;
      if(inside){ const rel=y/h; m[y*w+x]=rel<.45?1:(rel<.7?(((x+y)&1)?1:2):(rel<.85?2:(((x+y)&1)?2:3))); } }
    return cloudMasks[seed]={w,h,m};
  }
  function clouds(c,sc,T,t){
    const r=sc.sky, cfg=sc.clouds||{}, n=Math.round((cfg.n||6)*(1+T.ov*1.2)), hz=r.horizon||(r.y+r.h);
    const light=mix(T.P.cloud[0],'#8a90a2',T.ov*.7), shade=mix(T.P.cloud[1],'#4a5064',T.ov*.6), mid=mix(light,shade,.5);
    const cols=[null,light,mid,shade], a=(cfg.alpha||.92)*(T.a==='night'&&T.b==='night'?.6:1);
    c.save(); c.beginPath(); c.rect(r.x,r.y,r.w,hz-r.y); c.clip(); c.globalAlpha=a;
    for(let i=0;i<n;i++){
      const M=mask((cfg.seed||7)*31+i), sp=(cfg.speed||3)*(.5+((i*37)%10)/10), span=r.w+M.w+40;
      const x=r.x-M.w+((i*173+t*sp)%span), y=r.y+(cfg.y0!=null?cfg.y0:4)+((i*29)%Math.max(8,((cfg.y1||60)-(cfg.y0||4))));
      for(let yy=0;yy<M.h;yy++){ let run=0, v0=0, xs=0; for(let xx=0;xx<=M.w;xx++){ const v=xx<M.w?M.m[yy*M.w+xx]:0; if(v!==v0){ if(v0) R(c,x+xs,y+yy,run,1,cols[v0]); v0=v; xs=xx; run=1; } else run++; } }
    }
    c.restore();
  }
  function overcast(c,sc,T){ if(T.ov<=0) return; const r=sc.sky, hz=r.horizon||(r.y+r.h); c.fillStyle='rgba(84,90,108,'+(T.ov*.5).toFixed(3)+')'; c.fillRect(r.x,r.y,r.w,hz-r.y); }
  function pos(sc,T){ const r=sc.sky, hz=r.horizon||(r.y+r.h), x0=r.x+(r.sx0!=null?r.sx0:r.w*.08), x1=r.x+(r.sx1!=null?r.sx1:r.w*.92), arc=r.arc||(hz-r.y-14);
    return { sun:{x:x0+(x1-x0)*T.sun.x, y:hz+6-arc*T.sun.y, vis:T.sun.vis, low:T.sun.low}, moon:{x:x0+(x1-x0)*T.moon.x, y:hz+4-arc*T.moon.y, vis:T.moon.vis}, hz }; }
  return { gradientCanvas, stars, celestial, clouds, overcast, pos };
})();
