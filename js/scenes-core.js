// Scene registry, weather overlays and shared building blocks.
window.SCENES = [];

window.WX = (function(){
  const {R,rng} = PX;
  const mk = (n,seed)=>{ const r=rng(seed), a=[]; for(let i=0;i<n;i++) a.push({x:r(),y:r(),v:.7+r()*.6,l:r()}); return a; };
  const drops = { drizzle: mk(70,11), rain: mk(170,12), storm: mk(300,13) };
  const cfg = {
    drizzle:{ speed:70,  len:[2,3], col:'rgba(190,215,255,.45)', wind:.05 },
    rain:   { speed:150, len:[3,5], col:'rgba(190,220,255,.6)',  wind:.12 },
    storm:  { speed:230, len:[4,7], col:'rgba(200,225,255,.7)',  wind:.35 }
  };
  const storm = { next:6, flashAt:-9, flashes:0 };

  function draw(c,t,kind,clip,opts){
    opts=opts||{};
    if(window.WX){ WX.pending={kind:kind,clip:clip}; if(WX.skip) return; }
    const [cx,cy,cw,ch]=clip||[0,0,480,270];
    if(kind==='fog'){ fog(c,t,cx,cy,cw,ch); return; }
    const k=cfg[kind], d=drops[kind]; if(!k) return;
    c.save(); c.beginPath(); c.rect(cx,cy,cw,ch); c.clip();
    c.fillStyle=k.col;
    for(let i=0;i<d.length;i++){
      const o=d[i], sp=k.speed*o.v, len=Math.round(k.len[0]+o.l*(k.len[1]-k.len[0]));
      const y=((o.y*(ch+12)+sp*t)%(ch+12))-6;
      const x=((o.x*cw - k.wind*sp*t*.5)%cw+cw)%cw;
      c.fillRect(cx+Math.floor(x),cy+Math.floor(y),1,len);
    }
    if(kind==='storm'){
      const a=flashAlpha(t); if(a>0){ c.fillStyle=`rgba(210,225,255,${a})`; c.fillRect(cx,cy,cw,ch); }
    }
    c.restore();
  }

  const hiDrops = { drizzle: mk(150,21), rain: mk(380,22), storm: mk(620,23) };
  // native 960x540 weather: context is scaled x2, clip is in design units
  function drawHi(c,t,kind,clip){
    if(!kind||kind==='clear') return;
    const [cx,cy,cw,ch]=clip||[0,0,480,270];
    c.save(); c.beginPath(); c.rect(cx,cy,cw,ch); c.clip();
    if(kind==='fog'){
      for(let b=0;b<4;b++){ const y=cy+ch*(.3+b*.16), off=((t*(1.5+b*.7)+b*60)%(cw+80))-40;
        const g=c.createLinearGradient(0,y-12,0,y+14); g.addColorStop(0,'rgba(205,212,235,0)'); g.addColorStop(.5,'rgba(205,212,235,'+(.16-b*.025).toFixed(3)+')'); g.addColorStop(1,'rgba(205,212,235,0)');
        c.fillStyle=g; c.fillRect(cx,y-12,cw,26); c.fillStyle='rgba(215,220,240,.05)'; c.fillRect(cx+off,y-4,70,8); }
      c.restore(); return;
    }
    const k=cfg[kind], d=hiDrops[kind]; if(!k){ c.restore(); return; }
    c.strokeStyle=k.col; c.lineWidth=.5; c.beginPath();
    for(let i=0;i<d.length;i++){
      const o=d[i], sp=k.speed*o.v, len=k.len[0]+o.l*(k.len[1]-k.len[0]);
      const y=((o.y*(ch+12)+sp*t)%(ch+12))-6, x=((o.x*cw-k.wind*sp*t*.5)%cw+cw)%cw;
      c.moveTo(cx+x,cy+y); c.lineTo(cx+x-k.wind*len*.8,cy+y+len);
    }
    c.stroke();
    if(kind==='storm'){ const a=flashAlpha(t); if(a>0){ c.fillStyle='rgba(210,225,255,'+a+')'; c.fillRect(cx,cy,cw,ch); } }
    c.restore();
  }
  function fog(c,t,cx,cy,cw,ch){
    c.save(); c.beginPath(); c.rect(cx,cy,cw,ch); c.clip();
    for(let b=0;b<5;b++){
      const y=cy+ch*(.35+b*.14), off=((t*(2+b))%cw);
      PX.dither(c,cx,Math.round(y),cw,Math.round(ch*.16),'#cbd5e8',.28-b*.03);
      c.fillStyle='rgba(200,210,235,.06)'; c.fillRect(cx+off-20,Math.round(y),40,6);
    }
    c.restore();
  }
  function flashAlpha(t){
    const dt=t-storm.flashAt; if(dt<0||dt>.5) return 0;
    return Math.max(0,(dt<.08?.55:(dt<.16?.12:(dt<.22?.4:0)))*(1-dt*1.2));
  }
  // call every frame while storm is active; returns true on the frame a flash starts
  function tickStorm(t,active){
    if(!active){ storm.next=t+4; return false; }
    if(t>=storm.next){ storm.flashAt=t; storm.next=t+7+Math.random()*12; return true; }
    return false;
  }
  return { draw, drawHi, tickStorm, flashAlpha };
})();

// Shared drawing helpers used by several scenes
window.SK = (function(){
  const {R,P,rng,mix,line,disc,grad} = PX;

  // buildings. Lit windows depend on SK.lit (0 = daylight, 1 = night); positions never change between phases.
  function skyline(c,x0,x1,base,minH,maxH,minW,maxW,pal,seed,opts){
    opts=opts||{}; const r=rng(seed), ru=rng(seed*7+3), wins=[]; wins.blds=[]; let x=x0;
    const cols=opts.winCols||['#ffd27a','#8de8ff','#fff1b8','#ff9ccf'], litP=(opts.lit||.34);
    while(x<x1){
      const w=Math.min(x1-x,Math.round(minW+r()*(maxW-minW))), h=Math.round(minH+r()*(maxH-minH));
      const base_col=pal[Math.floor(r()*pal.length)], glass=mix(base_col,'#0a0a24',.38), glassHi=mix(base_col,'#bfe2ff',.25);
      R(c,x,base-h,w,h,base_col); wins.blds.push({x,w,top:base-h,col:base_col});
      R(c,x,base-h,1,h,mix(base_col,'#ffffff',.22));
      R(c,x+w-1,base-h,1,h,mix(base_col,'#000000',.35));
      R(c,x,base-h,w,1,mix(base_col,'#ffffff',.3));
      if(r()<.35) R(c,x+Math.floor(w/2),base-h-4,1,4,mix(base_col,'#ffffff',.2));
      if(opts.windows!==false){
        for(let wy=base-h+3;wy<base-3;wy+=opts.stepY||4) for(let wx=x+2;wx<x+w-2;wx+=opts.stepX||3){
          const u=ru(), col=cols[Math.floor(r()*cols.length)], blink=r()<.18, ph=r()*6;
          if(u<litP*SK.lit){ R(c,wx,wy,1,2,col); }
          else { R(c,wx,wy,1,2,glass); if(SK.lit<.5&&((wx+wy)%3===0)) R(c,wx,wy,1,1,glassHi); }
          if(blink) wins.push([wx,wy,col,ph,u,litP,glass]);
        }
      }
      x+=w+(opts.gap||0);
    }
    return wins;
  }
  function twinkle(c,wins,t,dark){
    for(const [x,y,col,ph,u,litP,glass] of wins){ if(u==null){ const on=((t*.55+ph)%4)<3.1; R(c,x,y,1,2,on?col:dark); continue; }
      const lit=u<litP*SK.lit; if(!lit) continue; const on=((t*.55+ph)%4)<3.1; R(c,x,y,1,2,on?col:(glass||dark)); }
  }
  function stars(c,x,y,w,h,n,seed,col){
    const r=rng(seed), out=[];
    for(let i=0;i<n;i++){ const sx=x+Math.floor(r()*w), sy=y+Math.floor(r()*h); P(c,sx,sy,col||'#cfd6ff'); out.push([sx,sy,r()*6]); }
    return out;
  }
  function starTwinkle(c,list,t){
    for(const [x,y,ph] of list){ const v=Math.sin(t*1.6+ph); if(v>.75) P(c,x,y,'#ffffff'); else if(v<-.8) P(c,x,y,'#1a1036'); }
  }
  // soft radial glow: dithered sprite cached per radius/colour, faded with globalAlpha
  const glowCache={};
  function glow(c,cx,cy,r,col,strength){
    r=Math.round(r); const key=r+col; let sp=glowCache[key];
    if(!sp){
      const [cv,g]=PX.makeCanvas(r*2+1,r*2+1); g.fillStyle=col;
      const B=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
      for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){ const d=Math.sqrt(x*x+y*y)/r; if(d>=1) continue;
        const dens=Math.pow(1-d,1.6)*.8; if((B[(y+r)&3][(x+r)&3]+.5)/16<dens) g.fillRect(x+r,y+r,1,1); }
      sp=glowCache[key]=cv;
    }
    const a=c.globalAlpha; c.globalAlpha=Math.max(0,Math.min(1,strength*(col==='#0a081a'?1:SK.k))); c.drawImage(sp,Math.round(cx)-r,Math.round(cy)-r); c.globalAlpha=a;
  }
  // smooth translucent fog band
  function fog(c,y,h,rgb,a){ for(let j=0;j<h;j++){ const k=Math.sin((j+.5)/h*Math.PI); c.fillStyle='rgba('+rgb+','+(a*k).toFixed(3)+')'; c.fillRect(0,y+j,480,1); } }
  // wet-road reflection of an array of [x,color] bright spots
  function reflect(c,spots,y0,y1,t){
    spots.forEach(([x,col,w],i)=>{
      for(let y=y0;y<y1;y+=2){ const j=Math.sin(t*3+y*.7+i)*1.5; R(c,x+j,y,w||2,1,col); }
    });
  }
  return { skyline, twinkle, stars, starTwinkle, glow, reflect, fog, k:1, lit:1 };
})();
