// HD renderer: the scenes keep drawing in 480x270 design units, but every canvas is backed by
// K device pixels per unit, shapes are drawn smooth (real circles, anti-aliased strokes, true
// gradients, painted palms, set type) instead of pixel by pixel. Loaded right after pixel.js.
(function(){
  // graphics mode: 'hd' (default, detailed) or 'pixel' (the original 480x270 pixel look)
  // HD experiment is parked: the site always shows the classic pixel graphics
  let mode='pixel';
  if(mode!=='hd'){ PX.HD=false; PX.K=1; window.HD={K:1,on:false}; return; }
  const dpr=window.devicePixelRatio||1, span=Math.max(screen.width||1920,screen.height||1080)*dpr;
  const K=Math.max(2,Math.min(4,Math.round(span/480)));
  window.HD={K,on:true};

  // canvases made through PX.makeCanvas carry their scale; drawImage(canvas,x,y) then draws them
  // at their design size, and source rectangles are given in design units too
  const proto=CanvasRenderingContext2D.prototype, _draw=proto.drawImage;
  proto.drawImage=function(img,a,b,c,d,e,f,g,h){
    const k=img&&img.__k;
    if(!k) return _draw.apply(this,arguments);
    if(arguments.length===3) return _draw.call(this,img,a,b,img.width/k,img.height/k);
    if(arguments.length===5) return _draw.call(this,img,a,b,c,d);
    return _draw.call(this,img,a*k,b*k,c*k,d*k,e,f,g,h);
  };
  function makeCanvas(w,h){
    const cv=document.createElement('canvas'); cv.width=Math.max(1,Math.round(w*K)); cv.height=Math.max(1,Math.round(h*K)); cv.__k=K;
    const c=cv.getContext('2d'); c.setTransform(K,0,0,K,0,0); c.imageSmoothingEnabled=true; c.imageSmoothingQuality='high'; return [cv,c];
  }

  const R=(c,x,y,w,h,col)=>{ if(w<=0||h<=0) return; c.fillStyle=col; c.fillRect(x,y,w,h); };
  const P=(c,x,y,col)=>{ c.fillStyle=col; c.beginPath(); c.arc(x+.5,y+.5,.62,0,Math.PI*2); c.fill(); };
  function line(c,x0,y0,x1,y1,col,lw){
    c.save(); c.strokeStyle=col; c.lineWidth=lw||1; c.lineCap='round'; c.beginPath(); c.moveTo(x0+.5,y0+.5); c.lineTo(x1+.5,y1+.5); c.stroke(); c.restore();
  }
  function disc(c,cx,cy,r,col){ c.fillStyle=col; c.beginPath(); c.arc(cx+.5,cy+.5,Math.max(.5,r+.5),0,Math.PI*2); c.fill(); }
  function ell(c,cx,cy,rx,ry,col){ c.fillStyle=col; c.beginPath(); c.ellipse(cx+.5,cy+.5,Math.max(.5,rx+.5),Math.max(.5,ry+.5),0,0,Math.PI*2); c.fill(); }
  function grad(c,x,y,w,h,stops){
    const g=c.createLinearGradient(0,y,0,y+h), n=stops.length-1; stops.forEach((s,i)=>g.addColorStop(n?i/n:0,s));
    c.fillStyle=g; c.fillRect(x,y,w,h);
  }
  function dither(c,x,y,w,h,col,density){ c.save(); c.globalAlpha*=Math.min(1,density*1.1); c.fillStyle=col; c.fillRect(x,y,w,h); c.restore(); }

  // set type for signs: each glyph sits in the same 4s cell the pixel font used, so layouts don't move
  const FONT='"Rubik", "Arial Black", "Segoe UI", sans-serif';
  function text(c,str,x,y,col,s){
    s=s||1; let cx=x; c.save(); c.fillStyle=col; c.textAlign='center'; c.textBaseline='alphabetic'; c.font='800 '+(7*s)+'px '+FONT;
    for(const ch of String(str).toUpperCase()){ if(ch!==' ') c.fillText(ch,cx+1.5*s,y+5*s,3.9*s); cx+=4*s; }
    c.restore(); return cx-x;
  }

  // painted palm: curved ringed trunk, crown of leaf blades with leaflets; same footprint as the pixel palm
  function palm(c,x,base,h,lean,col,col2,sway){
    sway=sway||0; col2=col2||col;
    const tx=x+lean, ty=base-h, cxp=tx+sway*.5, cyp=ty, wB=Math.max(1.6,h*.045), wT=Math.max(.9,h*.022);
    c.save();
    c.fillStyle=col; c.beginPath();
    const pts=[]; for(let i=0;i<=16;i++){ const t=i/16; pts.push([x+lean*t*t+(i===16?sway*.5:0)*t,base-h*t,wB+(wT-wB)*t]); }
    c.moveTo(pts[0][0]-pts[0][2],pts[0][1]); pts.forEach(p=>c.lineTo(p[0]-p[2],p[1])); for(let i=pts.length-1;i>=0;i--) c.lineTo(pts[i][0]+pts[i][2],pts[i][1]); c.closePath(); c.fill();
    c.strokeStyle=col2; c.globalAlpha=.55; c.lineWidth=.5; for(let i=1;i<16;i+=1.5){ const p=pts[Math.floor(i)]; c.beginPath(); c.moveTo(p[0]-p[2],p[1]); c.lineTo(p[0]+p[2],p[1]+.6); c.stroke(); }
    c.globalAlpha=1;
    const fr=[[-1,-.2],[-1,.35],[-.55,.7],[0,.8],[.55,.7],[1,.35],[1,-.2],[-.5,-.5],[.5,-.5]];
    fr.forEach(([dx,dy],k)=>{
      const len=h*.42+(k%2)*3, ex=cxp+dx*len+sway, ey=cyp+dy*len*.8, mx=cxp+dx*len*.55, my=cyp-Math.abs(dx)*5-2+dy*2;
      const fc=k%2?col2:col, wid=Math.max(.8,len*.07);
      c.strokeStyle=fc; c.lineWidth=Math.max(.5,wid*.35); c.lineCap='round';
      c.beginPath(); c.moveTo(cxp,cyp); c.quadraticCurveTo(mx,my,ex,ey); c.stroke();
      // leaflets along the rib
      c.lineWidth=Math.max(.35,wid*.28);
      for(let i=2;i<=9;i++){ const t=i/10, u=1-t, px=u*u*cxp+2*u*t*mx+t*t*ex, py=u*u*cyp+2*u*t*my+t*t*ey, dxt=2*u*(mx-cxp)+2*t*(ex-mx), dyt=2*u*(my-cyp)+2*t*(ey-my), L=Math.hypot(dxt,dyt)||1, nx=-dyt/L, ny=dxt/L, ll=wid*(1.6-t)*1.6;
        for(const sgn of [1,-1]){ c.beginPath(); c.moveTo(px,py); c.lineTo(px+nx*ll*sgn+dxt/L*ll*.5,py+ny*ll*sgn+dyt/L*ll*.5+ll*.35); c.stroke(); } }
    });
    disc(c,cxp-.5,cyp+.5,Math.max(1,h*.03),col);
    c.restore();
  }

  // art-direction presets (picked with ?style=N or localStorage 'lofi-style'); each one is modelled on a reference:
  // palette grade, colour tint, ink weight, rim-light colour, painterly texture and glow strength
  const STYLES={
    1:{ name:'Teal Underpass', filter:'saturate(.5) contrast(1.18) brightness(.82)', tint:'#1c7484', tintA:.72, shade:'#06202a', shadeA:.45, warm:null, bloom:.55, vig:1.25, tex:.20, ink:1.25, rim:'#f4f0b8' },
    2:{ name:'Blue Lantern',   filter:'saturate(1.25) contrast(1.22) brightness(.86)', tint:'#1a32c8', tintA:.58, shade:'#060a3a', shadeA:.35, warm:{x:.78,y:.4,r:.55,col:'255,150,50',a:.22}, bloom:.7, vig:1.1, tex:.14, ink:1.15, rim:'#ffb04a' },
    3:{ name:'Campfire Warm',  filter:'saturate(.95) contrast(1.28) sepia(.35) brightness(.9)', tint:'#a8541a', tintA:.46, shade:'#1a0a04', shadeA:.4, warm:{x:.78,y:.55,r:.6,col:'255,160,60',a:.25}, bloom:.6, vig:1.45, tex:.22, ink:1.7, rim:'#ffd070' },
    4:{ name:'Dusk Courts',    filter:'saturate(.62) contrast(1.12) brightness(.88)', tint:'#2a4866', tintA:.62, shade:'#0a1626', shadeA:.35, warm:{x:.92,y:.85,r:.75,col:'255,150,60',a:.34}, bloom:.55, vig:1.15, tex:.16, ink:1.2, rim:'#ffbd6a' },
    6:{ name:'Painted Anime', filter:'saturate(.82) contrast(1.16) brightness(.9)', tint:'#1d5a86', tintA:.38, shade:'#06142a', shadeA:.38, warm:{x:.72,y:.42,r:.6,col:'255,170,80',a:.22}, bloom:.6, vig:1.25, tex:.30, ink:1.5, rim:'#ffd38a', brush:true },
    7:{ name:'HD Pixel', filter:'saturate(1.12) contrast(1.1)', tint:null, tintA:0, shade:'#0a0418', shadeA:.25, warm:null, bloom:.4, vig:1, tex:0, ink:1.2, rim:'#7fe4ff', pixel:2, levels:7 },
    5:{ name:'Neon Vice Painted', filter:'saturate(1.12) contrast(1.14) brightness(.95)', tint:null, tintA:0, shade:'#0a0418', shadeA:.3, warm:null, bloom:.55, vig:1.2, tex:.16, ink:1.35, rim:'#7fe4ff' },
  };
  let sid=null; try{ const m=/[?&]style=(\d)/.exec(location.search); sid=m?m[1]:localStorage.getItem('lofi-style'); }catch(e){}
  const STYLE=STYLES[sid]||null; if(STYLE) STYLE.id=+sid;
  Object.assign(PX,{R,P,line,disc,ell,grad,dither,text,palm,makeCanvas,K,HD:true,STYLE,STYLES});
  // fonts arrive after the first frames: tell the app to rebuild its cached scenery once they're in
  if(document.fonts&&document.fonts.load) document.fonts.load('800 20px "Rubik"').then(()=>window.dispatchEvent(new Event('hd-fonts'))).catch(()=>{});
})();
