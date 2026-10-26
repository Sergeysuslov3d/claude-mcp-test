// The Apartment, HD: a real one-point-perspective room. Everything is built from 3D volumes
// (room box, cabinets, fridge, sofa, table, lamp, plants) projected by one camera, so tops and
// sides show and things recede correctly; ink outlines + two-tone shading; warm lamp key light,
// cool neon from the window. Residents stand on the floor at depth-correct sizes.
(function(){
  if(!PX.HD) return;
  const sc=SCENES.find(s=>s.id==='apartment'); if(!sc) return;
  const {mix,rng}=PX;
  const INK='#0d0a1c', IW=(PX.STYLE&&PX.STYLE.ink)||1, S={};

  // ---------- camera: world units ≈ cm, x right, y up, z away from the viewer ----------
  const F=330, CX=278, CY=112, EYE=160;
  const RX=290, RH=280, BZ=640;                         // room half-width, height, back wall depth
  const pr=(x,y,z)=>[CX+F*x/z, CY-F*(y-EYE)/z];
  const sz=(v,z)=>F*v/z;

  // ---------- drawing helpers ----------
  const BRUSH=!!(PX.STYLE&&PX.STYLE.brush);
  let grain=null; function grainPat(c){ if(!grain){ const [cv,g]=PX.makeCanvas(48,48), r=rng(5); for(let i=0;i<260;i++){ const x=r()*48, y=r()*48, l=1+r()*5, a=r()*Math.PI; g.strokeStyle=r()<.5?'rgba(0,0,0,.35)':'rgba(255,255,255,.28)'; g.lineWidth=.3+r()*.6; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); } grain=cv; } return c.createPattern(grain,'repeat'); }
  function rough(c,pts,closed,w,col,seed){ const r=rng(seed), P=closed?pts.concat([pts[0]]):pts; for(let pass=0;pass<2;pass++){ c.beginPath(); for(let i=0;i<P.length-1;i++){ const [x0,y0]=P[i], [x1,y1]=P[i+1], L=Math.hypot(x1-x0,y1-y0), n=Math.max(1,Math.round(L/6));
      for(let k=0;k<=n;k++){ const t=k/n, j=(r()-.5)*.5; const x=x0+(x1-x0)*t+j, y=y0+(y1-y0)*t+(r()-.5)*.5; (i===0&&k===0)?c.moveTo(x,y):c.lineTo(x,y); } }
      c.strokeStyle=col; c.lineWidth=w*(pass?.45:1)*(.8+r()*.4); c.lineJoin='round'; c.lineCap='round'; c.globalAlpha*=pass?.7:1; c.stroke(); c.globalAlpha/=pass?.7:1; } }
  let pseed=1;
  function poly(c,pts,fill,lw,stroke){ c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath();
    if(fill){ c.fillStyle=fill; c.fill(); if(BRUSH){ c.save(); c.clip(); c.globalCompositeOperation='soft-light'; c.globalAlpha=.55; c.fillStyle=grainPat(c); c.fillRect(0,0,480,270); c.restore(); } }
    if(lw!==0){ if(BRUSH) rough(c,pts,true,(lw==null?.5:lw)*IW,stroke||INK,pseed++); else { c.strokeStyle=stroke||INK; c.lineWidth=(lw==null?.5:lw)*IW; c.lineJoin='round'; c.stroke(); } } }
  const P3=(c,pts3,fill,lw,stroke)=>poly(c,pts3.map(p=>pr(p[0],p[1],p[2])),fill,lw,stroke);
  // axis-aligned box with only the faces the camera can see; col = {top, front, side} (or one colour)
  function box(c,x0,x1,y0,y1,z0,z1,col,lw){
    const C=typeof col==='string'?{front:col,top:mix(col,'#ffffff',.18),side:mix(col,'#000000',.28)}:col;
    if(x1<0) P3(c,[[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]],C.side,lw);
    if(x0>0) P3(c,[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],C.side,lw);
    if(y1<EYE) P3(c,[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],C.top,lw);
    if(y0>EYE) P3(c,[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],C.side,lw);
    P3(c,[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]],C.front,lw);
  }
  function cyl(c,x,z,r,y0,y1,col,colTop,lw){
    const b=pr(x,y0,z), t=pr(x,y1,z), w=sz(r,z), eb=Math.abs(pr(x,y0,z-r)[1]-pr(x,y0,z+r)[1])/2, et=Math.abs(pr(x,y1,z-r)[1]-pr(x,y1,z+r)[1])/2;
    const g=c.createLinearGradient(b[0]-w,0,b[0]+w,0); g.addColorStop(0,mix(col,'#000',.3)); g.addColorStop(.35,col); g.addColorStop(.62,mix(col,'#fff',.15)); g.addColorStop(1,mix(col,'#000',.38));
    c.beginPath(); c.moveTo(t[0]-w,t[1]); c.lineTo(b[0]-w,b[1]); c.ellipse(b[0],b[1],w,Math.max(.3,eb),0,Math.PI,0,true); c.lineTo(t[0]+w,t[1]); c.closePath(); c.fillStyle=g; c.fill(); c.strokeStyle=INK; c.lineWidth=(lw==null?.45:lw)*IW; c.stroke();
    c.beginPath(); c.ellipse(t[0],t[1],w,Math.max(.3,et),0,0,Math.PI*2); c.fillStyle=colTop||mix(col,'#fff',.25); c.fill(); c.stroke();
  }
  function frustum(c,x,z,r0,r1,y0,y1,col){ const b=pr(x,y0,z), t=pr(x,y1,z), w0=sz(r0,z), w1=sz(r1,z), e1=Math.abs(pr(x,y1,z-r1)[1]-pr(x,y1,z+r1)[1])/2, e0=Math.abs(pr(x,y0,z-r0)[1]-pr(x,y0,z+r0)[1])/2;
    c.beginPath(); c.moveTo(t[0]-w1,t[1]); c.lineTo(b[0]-w0,b[1]); c.ellipse(b[0],b[1],w0,Math.max(.3,e0),0,Math.PI,0,true); c.lineTo(t[0]+w1,t[1]); c.ellipse(t[0],t[1],w1,Math.max(.3,e1),0,0,Math.PI,true); c.closePath(); c.fillStyle=col; c.fill(); c.strokeStyle=INK; c.lineWidth=.5*IW; c.stroke(); }
  function glowAt(c,x,y,r,rgb,a,mode){ const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,'rgba('+rgb+','+a+')'); g.addColorStop(.45,'rgba('+rgb+','+(a*.45)+')'); g.addColorStop(1,'rgba('+rgb+',0)'); c.save(); if(mode) c.globalCompositeOperation=mode; c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); c.restore(); }
  function leaf(c,x,y,len,wid,ang,col,vein){ c.save(); c.translate(x,y); c.rotate(ang); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(len*.5,-wid,len,0); c.quadraticCurveTo(len*.5,wid,0,0); c.fillStyle=col; c.fill(); c.strokeStyle=INK; c.lineWidth=.35*IW; c.stroke(); c.strokeStyle=vein||'rgba(255,255,255,.22)'; c.lineWidth=.25; c.beginPath(); c.moveTo(0,0); c.lineTo(len*.88,0); c.stroke(); c.restore(); }
  function plant(c,x,z,potR,y0,potH,leafCol,n,spread,seed,leafLen){
    cyl(c,x,z,potR,y0,y0+potH,'#b8562f','#3a2416'); const t=pr(x,y0+potH,z), s=sz(1,z), r=rng(seed), LL=leafLen||potH*1.3;
    for(let i=0;i<n;i++){ const a=-Math.PI/2+(r()-.5)*spread, L=(LL*.7+r()*LL*.6)*s, ex=t[0]+Math.cos(a)*L, ey=t[1]+Math.sin(a)*L;
      c.strokeStyle='#2a6a3a'; c.lineWidth=Math.max(.4,s*1.2); c.beginPath(); c.moveTo(t[0],t[1]); c.quadraticCurveTo(t[0]+Math.cos(a)*L*.3,t[1]-L*.55,ex,ey); c.stroke();
      leaf(c,ex,ey,L*.55,L*.2,a+(r()-.5)*.8,leafCol[i%leafCol.length]); }
  }
  function vgradC(c,y,h,stops){ const g=c.createLinearGradient(0,y,0,y+h), n=stops.length-1; stops.forEach((s,i)=>g.addColorStop(i/n,s)); return g; }
  function sideGrad(c,x0,x1,a,b){ const g=c.createLinearGradient(x0,0,x1,0); g.addColorStop(0,a); g.addColorStop(1,b); return g; }

  // window opening on the back wall (world)
  const WX0=-215, WX1=215, WY0=58, WY1=262;
  const W0=pr(WX0,WY1,BZ), W1=pr(WX1,WY0,BZ), WIN={x:W0[0],y:W0[1],w:W1[0]-W0[0],h:W1[1]-W0[1]};

  // residents: depth-correct screen spots for this camera (x, feet y, size k)
  { const spot=(x,z,k)=>{ const p=pr(x,0,z); return {x:p[0],y:p[1],k}; };
    window.APT_HD={ 'win-a':spot(-95,600,1.12), 'win-b':spot(0,600,1.12), 'win-c':spot(95,600,1.12), sofa:spot(232,505,1.02), kitchen:spot(-190,450,1.46), rug:spot(25,410,1.6), dance:spot(-70,480,1.4) }; }

  function build(c,phase){
    pseed=1;
    const r=rng(9), bl=pr(-RX,0,BZ), br=pr(RX,0,BZ), tl=pr(-RX,RH,BZ), tr=pr(RX,RH,BZ);
    // room shell
    poly(c,[[0,0],[480,0],tr,tl],vgradC(c,0,tl[1],['#0a0920','#14123a']),0);
    poly(c,[[0,0],tl,bl,[0,270]],sideGrad(c,0,tl[0],'#141236','#221f50'),0);
    poly(c,[[480,0],tr,br,[480,270]],sideGrad(c,480,tr[0],'#151338','#26225a'),0);
    poly(c,[bl,br,[480,270],[0,270]],vgradC(c,bl[1],270-bl[1],['#2a2252','#1a1438','#0e0a22']),0);
    poly(c,[tl,tr,br,bl],vgradC(c,tl[1],bl[1]-tl[1],['#24205a','#1d1a48','#171338']),0);
    c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=.6; for(const [a,b] of [[tl,[0,0]],[tr,[480,0]],[bl,[0,270]],[br,[480,270]],[tl,tr],[bl,br],[tl,bl],[tr,br]]){ c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); }
    c.strokeStyle='rgba(0,0,0,.22)'; c.lineWidth=.4; for(let x=-RX;x<=RX;x+=40){ const a=pr(x,0,BZ), b=pr(x,0,330); c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); }
    for(const z of [600,560,520,480,440,400,360]){ const a=pr(-RX,0,z), b=pr(RX,0,z); c.strokeStyle='rgba(0,0,0,.12)'; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); }
    P3(c,[[-RX,0,BZ],[-RX,8,BZ],[-RX,8,330],[-RX,0,330]],'#100d26',.3); P3(c,[[RX,0,BZ],[RX,8,BZ],[RX,8,330],[RX,0,330]],'#100d26',.3); P3(c,[[-RX,0,BZ],[RX,0,BZ],[RX,8,BZ],[-RX,8,BZ]],'#100d26',.3);
    c.strokeStyle='#ff4fb0'; c.lineWidth=1.1; c.beginPath(); { const n1=pr(-RX,RH-6,330), n2=pr(-RX,RH-6,BZ), n3=pr(RX,RH-6,BZ), n4=pr(RX,RH-6,330); c.moveTo(n1[0],n1[1]); c.lineTo(n2[0],n2[1]); c.lineTo(n3[0],n3[1]); c.lineTo(n4[0],n4[1]); } c.stroke();
    // ---------- the city through the window ----------
    const {x:wx,y:wy,w:ww,h:wh}=WIN, base=wy+wh;
    c.clearRect(wx,wy,ww,wh*.72);
    S.stars=[];
    SK.skyline(c,wx,wx+ww,base-24,12,38,6,12,['#24305e','#1e2852','#2a3468'],21,{lit:.16,windows:true,winCols:['#ffcf7a','#7fd8ff','#ff9ccf','#ffe9b0']});
    c.fillStyle=vgradC(c,wy+30,base-wy-30,['rgba(120,80,170,0)','rgba(120,80,170,.3)']); c.fillRect(wx,wy+30,ww,base-wy-30);
    S.wins=SK.skyline(c,wx,wx+ww,base-18,34,78,14,26,['#b0367e','#5e3aa8','#2a8e9e','#b9a28e','#7a42b8','#c84a72'],33,{lit:.42,stepY:4,stepX:3,gap:2});
    { let best=null; for(const b of S.wins.blds){ if(b.w<20||b.x<wx+6||b.x+b.w>wx+ww-6) continue; const d=Math.abs(b.x+b.w/2-(wx+ww*.28))+(b.top>wy+40?200:0); if(!best||d<best.d) best={b,d}; }
      const b=best?best.b:{x:wx+50,w:20,top:wy+30}; S.sign={x:b.x+Math.floor((b.w-20)/2),y:b.top-10}; window.APT_SIGN=S.sign; const g=S.sign;
      c.strokeStyle=INK; c.lineWidth=.5; c.beginPath(); c.moveTo(g.x+4,g.y+8); c.lineTo(g.x+4,g.y+10); c.moveTo(g.x+16,g.y+8); c.lineTo(g.x+16,g.y+10); c.stroke(); c.fillStyle='#160a22'; c.beginPath(); c.roundRect(g.x,g.y,20,8,1); c.fill(); }
    c.fillStyle=vgradC(c,base-18,10,['#0d3550','#071a2c']); c.fillRect(wx,base-18,ww,10);
    for(let i=0;i<30;i++){ c.fillStyle='rgba('+['255,122,200','127,228,255','255,210,122'][i%3]+',.55)'; c.fillRect(wx+r()*ww,base-17+r()*3,.6,2+r()*4); }
    c.fillStyle='#14121f'; c.fillRect(wx,base-8,ww,8); c.fillStyle='#c8a83a'; for(let x=wx+3;x<wx+ww;x+=14) c.fillRect(x,base-4.4,6,.5);
    for(const [px,h,l] of [[wx+14,30,3],[wx+62,26,-2],[wx+138,34,4],[wx+200,30,-3]]) PX.palm(c,px,base-8,h,l,'#08081c','#0c0c26');
    S.road=base-5;
    c.fillStyle='#0f0d1e'; for(const [x,y,w,h] of [[wx-4,wy-4,ww+8,4],[wx-4,wy-4,4,wh+8],[wx+ww,wy-4,4,wh+8],[wx+ww/3-1.5,wy,3,wh],[wx+ww*2/3-1.5,wy,3,wh]]) c.fillRect(x,y,w,h);
    c.fillStyle='rgba(170,150,230,.35)'; c.fillRect(wx-4,wy-4,ww+8,.6);
    box(c,WX0-12,WX1+12,WY0-6,WY0,BZ-14,BZ,{front:'#2a2448',top:'#3a3462',side:'#1e1a36'},.5);
    c.save(); c.beginPath(); c.rect(wx,wy,ww,wh); c.clip(); c.fillStyle='rgba(200,220,255,.05)'; for(const a of [.15,.42,.7]){ c.beginPath(); c.moveTo(wx+ww*a,wy); c.lineTo(wx+ww*a+22,wy); c.lineTo(wx+ww*a-40,base); c.lineTo(wx+ww*a-62,base); c.fill(); } c.restore();
    // curtains
    { const rod=pr(0,WY1+14,BZ-8), rl=pr(WX0-50,0,BZ-8)[0], rr=pr(WX1+50,0,BZ-8)[0]; c.fillStyle='#8a7aa0'; c.fillRect(rl,rod[1]-.6,rr-rl,1.2);
      for(const [xa,xb] of [[WX0-48,WX0+6],[WX1-6,WX1+48]]){ const a=pr(xa,WY1+14,BZ-10), b=pr(xb,WY1+14,BZ-10), fl=pr(xa,0,BZ-10)[1]-2, n=7, g=c.createLinearGradient(a[0],0,b[0],0);
        for(let i=0;i<=n;i++) g.addColorStop(i/n,i%2?'#3c2678':'#24165a'); const mid=(a[0]+b[0])/2, sgn=xa<0?1:-1;
        c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.bezierCurveTo(b[0],a[1]+40,mid+sgn*4,fl-30,b[0]-sgn*2,fl); c.lineTo(a[0]+sgn*1,fl); c.bezierCurveTo(a[0],fl-40,a[0]-sgn*1,a[1]+40,a[0],a[1]); c.closePath(); c.fillStyle=g; c.fill(); c.strokeStyle=INK; c.lineWidth=.5*IW; c.stroke(); } }
    // floor reflection of the window
    { const fy=bl[1]; c.save(); c.globalAlpha=.28; c.filter='blur('+(PX.K*1.6)+'px)'; c.translate(0,fy*2); c.scale(1,-1); c.drawImage(c.canvas,wx,wy+wh*.35,ww,wh*.65,wx,fy-wh*.65*.9,ww,wh*.65*.9); c.restore(); c.filter='none'; }
    // ---------- back wall: clock, TV stand + CRT ----------
    { const k=pr(-250,212,BZ), rr=sz(16,BZ); c.fillStyle='#2a1c44'; c.beginPath(); c.arc(k[0],k[1],rr+1,0,7); c.fill(); c.strokeStyle=INK; c.lineWidth=.5; c.stroke(); c.fillStyle='#fff8ea'; c.beginPath(); c.arc(k[0],k[1],rr,0,7); c.fill();
      for(let i=0;i<12;i++){ const a=i*Math.PI/6; c.strokeStyle=i%3?'#9a8a7a':'#2a1c44'; c.lineWidth=i%3?.3:.5; c.beginPath(); c.moveTo(k[0]+Math.sin(a)*rr*.78,k[1]-Math.cos(a)*rr*.78); c.lineTo(k[0]+Math.sin(a)*rr*.93,k[1]-Math.cos(a)*rr*.93); c.stroke(); } S.clock={x:k[0],y:k[1],r:rr}; }
    box(c,-205,-100,0,48,560,620,{front:'#5a3480',top:'#7a4ea6',side:'#40225e'});
    box(c,-195,-118,48,98,572,612,{front:'#3e3e50',top:'#56566a',side:'#2c2c3a'});
    { const a=pr(-189,93,572), b=pr(-138,55,572); S.tv={x:a[0],y:a[1],w:b[0]-a[0],h:b[1]-a[1]}; c.fillStyle='#06060c'; c.beginPath(); c.roundRect(a[0],a[1],b[0]-a[0],b[1]-a[1],2); c.fill(); c.strokeStyle=INK; c.lineWidth=.4; c.stroke();
      c.fillStyle='#8a8a9a'; for(const y of [80,68]){ const k=pr(-130,y,572); c.beginPath(); c.arc(k[0],k[1],1.1,0,7); c.fill(); } }
    // ---------- left wall: poster, upper cabinets, counter, fridge ----------
    P3(c,[[-RX+1,222,450],[-RX+1,222,560],[-RX+1,138,560],[-RX+1,138,450]],'#efe2c6',.5);
    P3(c,[[-RX+2,216,456],[-RX+2,216,554],[-RX+2,144,554],[-RX+2,144,456]],'#1f5a9e',.3);
    { const q=pr(-RX+2,176,510); c.fillStyle='#7fc068'; c.beginPath(); c.ellipse(q[0],q[1],sz(14,510)*.5,sz(26,510),-.25,0,7); c.fill(); c.strokeStyle=INK; c.lineWidth=.35; c.stroke(); }
    box(c,-RX,-RX+36,190,250,450,620,{front:'#5e3690',top:'#4a2a74',side:'#6e44a4'});
    for(let z=460;z<610;z+=50){ P3(c,[[-RX+36,196,z],[-RX+36,196,z+44],[-RX+36,244,z+44],[-RX+36,244,z]],'#6e44a4',.35); const h=pr(-RX+36,205,z+40); c.fillStyle='#e6dcf4'; c.fillRect(h[0]-.4,h[1],.8,3); }
    box(c,-RX,-RX+62,0,88,450,630,{front:'#4a2a74',top:'#3a2060',side:'#5c3490'});
    for(let z=456;z<630;z+=58){ P3(c,[[-RX+62,8,z],[-RX+62,8,z+54],[-RX+62,80,z+54],[-RX+62,80,z]],'#5e3a96',.35); const h=pr(-RX+62,70,z+48); c.fillStyle='#e6dcf4'; c.fillRect(h[0]-.5,h[1],1,4); }
    box(c,-RX,-RX+66,88,94,446,634,{front:'#e8e0f2',top:'#f6f2fc',side:'#cfc4dc'});
    cyl(c,-RX+30,600,10,94,118,'#f0eef8','#d8d2e8'); { const s=pr(-RX+42,112,600), e=pr(-RX+52,118,600); c.strokeStyle='#f0eef8'; c.lineWidth=1; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(e[0],e[1]); c.stroke(); S.kettle=pr(-RX+30,122,600); }
    cyl(c,-RX+34,540,5,94,106,'#f4f0ff','#c8c0dc');
    plant(c,-RX+32,520,7,94,12,['#4fae5a','#3f9a4a','#5ac06a'],5,1.6,3,22);
    cyl(c,-RX+34,470,14,94,112,'#22a8a0','#178a84');
    plant(c,-236,610,20,0,44,['#3fae5a','#4cbe66','#35a050','#2e8a46'],10,2.0,11,62);
    // ---------- right side: shelf, sofa, rug, table, lamp ----------
    box(c,RX-30,RX,178,184,430,620,{front:'#3a2654',top:'#4a3466',side:'#2e1e46'});
    for(let i=0;i<16;i++){ const z=444+i*9+(i>9?16:0), h=18+((i*7)%4)*2, col=['#e0507a','#4ab8c8','#e8c85a','#8a6ad0','#f4f0e8'][i%5]; box(c,RX-22,RX-6,184,184+h,z,z+6,{front:col,top:mix(col,'#fff',.25),side:mix(col,'#000',.3)},.3); }
    box(c,RX-28,RX,0,104,400,612,{front:'#9a2870',top:'#b43482',side:'#86205e'});
    box(c,RX-96,RX-28,0,44,404,608,{front:'#c4388a',top:'#d84a9a',side:'#a62a74'});
    for(const z of [404,506]) box(c,RX-92,RX-30,44,52,z+3,z+99,{front:'#d44a98',top:'#e85eac',side:'#b4307c'},.4);
    box(c,RX-100,RX-28,0,68,596,616,{front:'#b0307e',top:'#c4408c',side:'#8e2062'});
    { const p=pr(RX-40,74,590); c.save(); c.translate(p[0],p[1]); c.rotate(-.2); c.fillStyle='#f0a8c0'; c.beginPath(); c.roundRect(-5,-7,10,13,3); c.fill(); c.strokeStyle=INK; c.lineWidth=.4; c.stroke(); c.restore(); }
    { const ctr=pr(85,0,425), rx=sz(150,425), ry=Math.abs(pr(85,0,385)[1]-pr(85,0,470)[1])/2; c.fillStyle='#3c1c64'; c.beginPath(); c.ellipse(ctr[0],ctr[1],rx,ry,0,0,7); c.fill(); c.strokeStyle=INK; c.lineWidth=.5; c.stroke();
      c.strokeStyle='#7a4ab0'; c.lineWidth=.7; c.beginPath(); c.ellipse(ctr[0],ctr[1],rx*.88,ry*.84,0,0,7); c.stroke(); c.strokeStyle='rgba(255,170,220,.35)'; c.setLineDash([2.4,2]); c.beginPath(); c.ellipse(ctr[0],ctr[1],rx*.72,ry*.66,0,0,7); c.stroke(); c.setLineDash([]); }
    { const lx=176, lz=592, b=pr(lx,0,lz); c.fillStyle='#8a6a30'; c.beginPath(); c.ellipse(b[0],b[1],sz(16,lz),1.6,0,0,7); c.fill(); c.strokeStyle=INK; c.lineWidth=.45; c.stroke();
      cyl(c,lx,lz,2,0,168,'#d8b060','#e8c070',.35); frustum(c,lx,lz,26,17,150,192,'#ffe6a4'); S.lamp=pr(lx,170,lz); }
    { const [fc,fg]=PX.makeCanvas(480,270); buildFront(fg); TOD.relight(fg,phase||'night',sc.relight==null?1:sc.relight); (S.front||(S.front={}))[phase||'night']=fc; }
  }

  // things nearer to us than the residents: drawn on their own layer, over the people
  function buildFront(c){
    box(c,-RX,-RX+70,0,196,392,444,{front:'#9aa8c2',top:'#b4c2d8',side:'#aab8d0'});
    P3(c,[[-RX,120,392],[-RX+70,120,392]],null,.5); for(const [y0,y1] of [[60,100],[140,180]]) P3(c,[[-RX+62,y0,392],[-RX+62,y1,392]],null,1.1,'#5a6680');
    for(const [y,col] of [[176,'#f4a0c0'],[156,'#f4e48a'],[96,'#8ae0a8']]){ const a=pr(-RX+12,y,392), b=pr(-RX+34,y-16,392); c.fillStyle=col; c.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]); c.strokeStyle=INK; c.lineWidth=.3; c.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1]); }
    box(c,-RX+6,-RX+62,196,212,400,436,{front:'#1d1630',top:'#2a2244',side:'#14101e'}); S.turntable=pr(-RX+34,212,418);
    for(const [x,z] of [[36,450],[146,450],[36,400],[146,400]]) box(c,x-3,x+3,0,40,z-3,z+3,'#2a2a40',.35);
    box(c,28,154,40,45,392,458,{front:'#9ad4e2',top:'rgba(200,240,250,.85)',side:'#7ac4d4'},.45);
    cyl(c,52,418,5,45,58,'#f4f0ff','#c8c0dc'); plant(c,90,428,7,45,13,['#4fae5a','#3f9a4a','#5ac06a'],5,1.5,7,26); box(c,112,140,45,50,410,430,'#e0507a',.35); box(c,115,137,50,54,413,427,'#4ab8c8',.35);
    // near sofa arm last (closest to us)
    box(c,RX-100,RX-28,0,68,396,418,{front:'#b0307e',top:'#c4408c',side:'#8e2062'});
    S.cat=pr(RX-64,68,407);
  }
  const cars=[ {x:0,v:22,col:'#f4c030',dir:1}, {x:.7,v:-30,col:'#a45ad8',dir:-1}, {x:.4,v:16,col:'#30c0c8',dir:1}, {x:.55,v:-20,col:'#e8e8f0',dir:-1} ];
  function frame(c,t,env){
    const lamp=env.tod?env.tod.lampK:1, {x:wx,y:wy,w:ww,h:wh}=WIN;
    SK.twinkle(c,S.wins,t,'#2a1a40'); SK.starTwinkle(c,S.stars,t);
    { const ax=wx+((t*6)%ww), ay=wy+10; c.fillStyle='#dfe4ff'; c.fillRect(ax-2,ay-.4,4,.8); if(((t*2)|0)%2) glowAt(c,ax+2,ay,4,'255,74,74',.6); }
    { const g=S.sign; if(Math.sin(t*9)<=.9){ PX.text(c,'HOTEL',g.x+2,g.y+1.6,'#ff8ad0',1); glowAt(c,g.x+10,g.y+4,20,'255,90,180',.3,'lighter'); } }
    for(const k of cars){ const span=ww+24, x=wx-12+(((k.x*span)+k.v*t)%span+span)%span, y=S.road+(k.dir>0?-1.6:1); if(x<wx||x>wx+ww-9) continue;
      c.fillStyle=k.col; c.beginPath(); c.roundRect(x,y-1.1,9,2,1); c.fill(); c.beginPath(); c.roundRect(x+2.2,y-2.5,4.6,1.6,[1,1,0,0]); c.fill();
      glowAt(c,k.dir>0?x+9:x,y-.4,5,'255,250,210',.5,'lighter'); glowAt(c,k.dir>0?x:x+9,y-.4,3,'255,60,60',.45,'lighter'); }
    WX.draw(c,t,env.weather,[wx,wy,ww,wh]);
    if(env.weather!=='clear'&&env.weather!=='fog') for(let i=0;i<8;i++){ const x=wx+10+i*(ww/8), y=wy+((t*5+i*23)%wh); c.strokeStyle='rgba(210,235,255,.45)'; c.lineWidth=.5; c.beginPath(); c.moveTo(x,y-4); c.lineTo(x+.3,y); c.stroke(); }
    { const p=S.turntable; c.fillStyle='#0a0614'; c.beginPath(); c.ellipse(p[0],p[1],7,1.8,0,0,7); c.fill(); const a=t*2.6; c.fillStyle='#ff4fa0'; c.beginPath(); c.arc(p[0]+Math.cos(a)*5,p[1]+Math.sin(a)*1.2,.55,0,7); c.fill(); }
    for(let i=0;i<4;i++){ const ph=((t*.55+i*.25)%1), p=S.kettle; c.fillStyle='rgba(235,235,255,'+(.4*(1-ph)).toFixed(2)+')'; c.beginPath(); c.arc(p[0]+Math.sin(t*2+i*2)*1.6,p[1]-ph*16,1+ph*1.8,0,7); c.fill(); }
    { const v=S.tv, cols=['#4ae8ff','#ff7ac8','#ffe08a','#8dffb0'], k=Math.floor(t*5)%4; c.save(); c.beginPath(); c.roundRect(v.x,v.y,v.w,v.h,2); c.clip(); c.fillStyle='#0a0a18'; c.fillRect(v.x,v.y,v.w,v.h);
      for(let i=0;i<6;i++){ c.fillStyle=cols[(k+i)%4]; c.fillRect(v.x+((i*7+Math.floor(t*9))%Math.max(1,v.w-4)),v.y+1+(i*3)%Math.max(1,v.h-3),4,1.6); } c.fillStyle='rgba(255,255,255,.16)'; c.fillRect(v.x,v.y+((t*10)%v.h),v.w,.6); c.restore();
      glowAt(c,v.x+v.w/2,v.y+v.h+14,34,'110,220,255',.14+Math.sin(t*13)*.03,'lighter'); }
    { const f=pr(0,RH,430), ph=(t*7)%6.2832; c.fillStyle='#2a2438'; c.fillRect(f[0]-.7,0,1.4,f[1]+6); for(let k=0;k<3;k++){ const a=ph+k*2.0944, dx=Math.cos(a)*sz(60,430), dy=Math.sin(a)*3; c.fillStyle=k%2?'rgba(74,58,106,.9)':'rgba(106,90,138,.9)'; c.beginPath(); c.ellipse(f[0]+dx/2,f[1]+6+dy/2,Math.abs(dx)/2+.6,1.2,0,0,7); c.fill(); }
      c.fillStyle='#8a7aaa'; c.beginPath(); c.ellipse(f[0],f[1]+6,2.8,1.7,0,0,7); c.fill(); }
    { const k=S.clock, d=new Date(), s=d.getSeconds(), m=d.getMinutes()+s/60, h=(d.getHours()%12)+m/60; c.lineCap='round';
      c.strokeStyle='#2a1c44'; c.lineWidth=.8; c.beginPath(); c.moveTo(k.x,k.y); c.lineTo(k.x+Math.sin(h*Math.PI/6)*k.r*.5,k.y-Math.cos(h*Math.PI/6)*k.r*.5); c.stroke();
      c.lineWidth=.55; c.beginPath(); c.moveTo(k.x,k.y); c.lineTo(k.x+Math.sin(m*Math.PI/30)*k.r*.78,k.y-Math.cos(m*Math.PI/30)*k.r*.78); c.stroke();
      c.strokeStyle='#ff4fa0'; c.lineWidth=.3; c.beginPath(); c.moveTo(k.x,k.y); c.lineTo(k.x+Math.sin(s*Math.PI/30)*k.r*.86,k.y-Math.cos(s*Math.PI/30)*k.r*.86); c.stroke(); }
    CAST.draw(c,t,'apartment');
    { const T=env.tod, fa=S.front&&(S.front[T?T.a:'night']||S.front.night); if(fa) c.drawImage(fa,0,0); const fb=T&&T.f>.01&&S.front&&S.front[T.b]; if(fb){ c.save(); c.globalAlpha=T.f; c.drawImage(fb,0,0); c.restore(); } }
    { const p=S.cat, b=Math.sin(t*2)*.4, tail=Math.sin(t*1.7)>.55?1:0; c.save(); c.translate(p[0],p[1]-4+b);
      c.fillStyle='#d8823a'; c.strokeStyle=INK; c.lineWidth=.5*IW; c.beginPath(); c.ellipse(0,0,9,4.6,0,0,7); c.fill(); c.stroke();
      c.beginPath(); c.arc(-7.4,-1.6,3.5,0,7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-10,-3.4); c.lineTo(-9.4,-7); c.lineTo(-7.4,-4.6); c.closePath(); c.moveTo(-6.6,-4.8); c.lineTo(-4.6,-7); c.lineTo(-4.4,-3.6); c.closePath(); c.fill(); c.stroke();
      c.lineWidth=.4; c.beginPath(); c.moveTo(-9.2,-1.4); c.quadraticCurveTo(-8.4,-.6,-7.6,-1.4); c.moveTo(-6.8,-1.4); c.quadraticCurveTo(-6,-.6,-5.2,-1.4); c.stroke();
      c.strokeStyle='#a85a1a'; c.lineWidth=1.6; c.lineCap='round'; c.beginPath(); c.moveTo(8,1); c.quadraticCurveTo(12,-1-tail*2,10,-5-tail*2); c.stroke(); c.restore(); }
    const fl=1+Math.sin(t*23)*.03+(Math.sin(t*.7)>.97?-.25:0), L=S.lamp;
    glowAt(c,L[0],L[1]-6,90,'255,180,100',.34*fl*lamp,'lighter'); glowAt(c,L[0],L[1]-6,20,'255,232,170',.45*fl*lamp,'lighter');
    { const fpt=pr(176,0,592); glowAt(c,fpt[0],fpt[1],90,'255,170,90',.26*fl*lamp,'lighter'); }
    glowAt(c,WIN.x+WIN.w/2,WIN.y+WIN.h+30,150,'150,90,255',.12,'lighter');
    for(let i=0;i<12;i++){ const x=L[0]-30+((i*17+t*3)%60), y=L[1]+((i*29+Math.sin(t+i)*10+t*2)%90); c.fillStyle='rgba(255,236,180,.5)'; c.beginPath(); c.arc(x,y,.45,0,7); c.fill(); }
    { const v=c.createRadialGradient(CX,150,70,CX,150,330); v.addColorStop(0,'rgba(6,4,18,0)'); v.addColorStop(.6,'rgba(6,4,18,.2)'); v.addColorStop(1,'rgba(6,4,18,.6)'); c.fillStyle=v; c.fillRect(0,0,480,270); }
  }

  sc.build=build; sc.frame=frame;
})();
