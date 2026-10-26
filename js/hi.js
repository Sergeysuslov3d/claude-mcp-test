// Native-resolution (960x540) detail layers, one per place. Context is scaled x2: coordinates are design units,
// half-steps land on real pixels. Everything here is original pixel/vector art drawn in code.
(function(){
  const {R,rng,softGlow} = FX, H = FX.hi;
  const pick=(a,i)=>a[i%a.length];
  const WIN=['#ffd27a','#8de8ff','#ff9ccf','#fff1b8'];

  // palm frond: curved rachis + leaflets on both sides
  function frond(c,x,y,ang,len,col,lw){
    const cx=x+Math.cos(ang)*len*.5, cy=y+Math.sin(ang)*len*.5-len*.16, ex=x+Math.cos(ang)*len, ey=y+Math.sin(ang)*len+len*.14;
    c.strokeStyle=col; c.lineWidth=lw||.8; c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(cx,cy,ex,ey); c.stroke();
    c.lineWidth=(lw||.8)*.6; c.beginPath();
    for(let i=1;i<=16;i++){
      const u=i/17, bx=(1-u)*(1-u)*x+2*u*(1-u)*cx+u*u*ex, by=(1-u)*(1-u)*y+2*u*(1-u)*cy+u*u*ey, l=len*.24*(1-u*.5);
      const nx=-Math.sin(ang), ny=Math.cos(ang), tx=Math.cos(ang)*.5, ty=Math.sin(ang)*.5+.35;
      c.moveTo(bx,by); c.lineTo(bx+nx*l+tx*l,by+ny*l+ty*l); c.moveTo(bx,by); c.lineTo(bx-nx*l+tx*l,by-ny*l+ty*l);
    }
    c.stroke();
  }
  function leaf(c,x,y,rx,ry,rot,fill,vein){
    c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=fill; c.beginPath(); c.ellipse(0,0,rx,ry,0,0,Math.PI*2); c.fill();
    if(vein){ c.strokeStyle=vein; c.lineWidth=.35; c.beginPath(); c.moveTo(-rx,0); c.lineTo(rx,0); for(let i=-3;i<=3;i++){ c.moveTo(i*rx/4,0); c.lineTo(i*rx/4+rx*.12,-ry*.8); c.moveTo(i*rx/4,0); c.lineTo(i*rx/4+rx*.12,ry*.8); } c.stroke(); }
    c.restore();
  }
  const body=o=>{ const s=o.sp; if(!s) return null; if(s.sun.vis>.05) return {x:s.sun.x,y:s.sun.y,v:s.sun.vis,sun:1,low:s.sun.low}; if(s.moon.vis>.05) return {x:s.moon.x,y:s.moon.y,v:s.moon.vis,sun:0}; return null; };
  const pine=(c,x,y,h,col)=>{ c.fillStyle=col; for(let i=0;i<h;i+=3){ const w=(h-i)*.32; c.fillRect(x-w,y-h+i,w*2,3.5); } };

  /* ================= The Apartment ================= */
  H.apartment=(c,t,o)=>{
    const r=rng(11);
    for(let x=2;x<150;x+=4) R(c,x,31,.5,76,'rgba(255,255,255,.03)'); for(let x=402;x<478;x+=4) R(c,x,31,.5,86,'rgba(255,255,255,.03)');
    // curtain folds either side of the window
    for(let i=0;i<14;i++){ const a=.5+.35*Math.sin(i*1.3); R(c,146+i,40,1,146,'rgba(60,28,98,'+a.toFixed(2)+')'); R(c,398+i,40,1,146,'rgba(60,28,98,'+(.5+.35*Math.sin(i*1.1+1)).toFixed(2)+')'); }
    R(c,140,38,26,1.5,'#7a6a8a'); R(c,392,38,26,1.5,'#7a6a8a'); R(c,139,37,2,3,'#9a8aaa'); R(c,165,37,2,3,'#9a8aaa'); R(c,391,37,2,3,'#9a8aaa'); R(c,417,37,2,3,'#9a8aaa');
    // glass sheen
    c.save(); c.beginPath(); c.rect(160,44,236,142); c.clip(); c.fillStyle='rgba(255,255,255,.03)';
    c.beginPath(); c.moveTo(196,44); c.lineTo(230,44); c.lineTo(156,186); c.lineTo(122,186); c.fill(); c.beginPath(); c.moveTo(262,44); c.lineTo(276,44); c.lineTo(202,186); c.lineTo(188,186); c.fill(); c.restore();
    // far windows twinkling, headlights on the bay road
    for(let i=0;i<120;i++){ const x=162+r()*232, y=92+r()*66, ph=r()*6, sp=.5+r()*.9; if(Math.sin(t*sp+ph)>-.25) R(c,x,y,.5,.5,pick(WIN,i)); }
    for(let i=0;i<7;i++){ const dir=i%2?1:-1, x=162+(((i*47+t*(13+i*3)*dir)%236)+236)%236, y=177+(i%2)*3; R(c,x,y,1,.5,dir>0?'#fffbd0':'#ff4a4a'); R(c,x+(dir>0?-1.5:1.5),y,.5,.5,dir>0?'#ff4a4a':'#fffbd0'); }
    if(o.weather!=='clear'&&o.weather!=='fog') for(let i=0;i<10;i++){ const x=166+i*23+((i*7)%9), y=44+((t*(6+i%3)+i*37)%150); R(c,x,y,.5,2.5,'rgba(200,225,255,.26)'); R(c,x-.5,y+2.5,1.5,1.5,'rgba(255,255,255,.45)'); }
    // light pools and neon haze
    const lk=1-(o.day||0)*.85; softGlow(c,373,100,46,'255,235,160',.15*lk); softGlow(c,373,204,56,'255,225,150',.09*lk); { const g=window.APT_SIGN||{x:212,y:64}; softGlow(c,g.x+10,g.y+4,26,'255,122,200',.16*lk); } { const b=body(o); if(b) softGlow(c,b.x,b.y,34,b.sun?'255,230,170':'255,240,200',.14*b.v); }
    // dust in the lamp light, floor shimmer
    for(let i=0;i<16;i++) R(c,338+((i*17+t*2.4)%64),102+((i*31+Math.sin(t+i)*8+t*1.7)%90),.5,.5,'rgba(255,240,190,.5)');
    for(let i=0;i<7;i++) R(c,184+((i*41+t*5)%190),198+i*8,14,.5,'rgba(255,190,235,.06)');
    // foreground leaves (depth)
    leaf(c,8,268,26,7,-.5,'rgba(8,28,18,.94)','rgba(40,110,70,.5)'); leaf(c,26,272,24,6,-1.05,'rgba(10,34,22,.94)','rgba(40,110,70,.5)'); leaf(c,3,252,15,5,-.1,'rgba(8,24,16,.94)','rgba(40,110,70,.4)');
    leaf(c,476,270,24,6,-2.7,'rgba(8,28,18,.9)','rgba(40,110,70,.45)'); leaf(c,462,274,22,5,-2.1,'rgba(10,34,22,.9)','rgba(40,110,70,.45)');
  };

  /* ================= Downtown Vice City ================= */
  H.downtown=(c,t,o)=>{
    const r=rng(23);
    for(const [x,col] of [[34,'255,184,74'],[130,'255,90,180'],[212,'90,232,255'],[308,'255,138,90'],[396,'154,255,122']]) softGlow(c,x+36,178,46,col,.13);
    for(let i=0;i<170;i++){ const x=r()*480, y=30+r()*116, ph=r()*6, sp=.5+r()*.9; if(Math.sin(t*sp+ph)>-.2) R(c,x,y,.5,.5,pick(WIN,i)); }
    for(const [x,w,col] of [[34,70,'255,184,74'],[124,60,'255,90,180'],[206,80,'90,232,255'],[302,60,'255,138,90'],[390,70,'154,255,122']]){
      const g=c.createLinearGradient(0,224,0,268); g.addColorStop(0,'rgba('+col+',.22)'); g.addColorStop(1,'rgba('+col+',0)'); c.fillStyle=g; c.fillRect(x,224,w,46);
      for(let k=0;k<5;k++) R(c,x+k*w/5+Math.sin(t*2+k+x)*1.5,228+k*7,w/9,.5,'rgba('+col+',.25)'); }
    for(const x of [63,243,423]){ const g=c.createLinearGradient(0,132,0,214); g.addColorStop(0,'rgba(255,232,176,.18)'); g.addColorStop(1,'rgba(255,232,176,0)'); c.fillStyle=g; c.beginPath(); c.moveTo(x-2,132); c.lineTo(x+2,132); c.lineTo(x+28,214); c.lineTo(x-28,214); c.fill(); }
    c.strokeStyle='rgba(6,3,14,.85)'; c.lineWidth=.6; c.beginPath(); c.moveTo(0,22); c.quadraticCurveTo(240,40,480,24); c.moveTo(0,30); c.quadraticCurveTo(240,50,480,34); c.stroke();
    R(c,0,16,5,254,'rgba(6,3,14,.92)'); R(c,-1,18,16,2,'rgba(6,3,14,.92)'); R(c,0,27,12,1.5,'rgba(6,3,14,.92)'); R(c,3,40,2,3,'rgba(255,200,120,.8)');
    for(let i=0;i<5;i++){ const ph=((t*.4+i*.2)%1), x=300+Math.sin(t*2+i)*3, y=258-ph*40, g=c.createRadialGradient(x,y,0,x,y,3+ph*9); g.addColorStop(0,'rgba(235,235,250,'+(.2*(1-ph)).toFixed(3)+')'); g.addColorStop(1,'rgba(235,235,250,0)'); c.fillStyle=g; c.fillRect(x-14,y-14,28,28); }
    R(c,296,258,8,2,'rgba(20,16,32,.9)');
  };

  /* ================= Ocean Beach ================= */
  H.beach=(c,t,o)=>{
    const r=rng(31);
    const b=body(o); if(b){ softGlow(c,b.x,Math.min(b.y,128),b.sun?120:60,b.sun?'255,190,110':'200,210,255',(b.sun?.22:.12)*b.v);
    for(let i=0;i<80;i++){ const y=130+r()*46, w=(5+(y-130)*.35)*(.4+r()*.6), x=b.x+(r()-.5)*(12+(y-130)*.9)+Math.sin(t*1.5+i)*1.5; if(Math.sin(t*2+i*1.7)>-.25) R(c,x,y,w,.5,b.sun?'rgba(255,236,170,.55)':'rgba(220,228,255,.4)'); } }
    for(let i=0;i<16;i++) R(c,((i*61+t*(3+i%4)*(i%2?1:-1))%480+480)%480,150+i*1.6,8+(i%5)*3,.5,'rgba(255,255,255,.18)');
    const g=c.createLinearGradient(0,176,0,190); g.addColorStop(0,'rgba(255,190,150,.24)'); g.addColorStop(1,'rgba(255,190,150,0)'); c.fillStyle=g; c.fillRect(0,176,480,14);
    softGlow(c,175,130,32,'255,90,180',.16);
    for(let i=0;i<24;i++){ const x=(i*83+t*3)%480, y=186+(i*37)%80; if(Math.sin(t*3+i)>.55) R(c,x,y,.5,.5,'rgba(255,245,210,.7)'); }
    const col='rgba(16,6,28,.95)';
    for(const [x,y,a,l] of [[-2,-4,.5,78],[-2,-4,.2,66],[6,-6,.85,60],[482,-4,Math.PI-.5,78],[482,-4,Math.PI-.2,66],[474,-6,Math.PI-.85,60]]) frond(c,x,y,a+Math.sin(t*.8+x)*.015,l,col,1);
    softGlow(c,480,0,150,'255,170,90',.08);
  };

  /* ================= Leonida Keys ================= */
  H.keys=(c,t,o)=>{
    const r=rng(41);
    const b=body(o); if(b&&b.sun){ softGlow(c,b.x,Math.min(b.y,126),130,'255,190,110',.2*b.v);
    if(b.low>.4) for(let i=0;i<6;i++){ const a=-1.4+i*.16+Math.sin(t*.2+i)*.02; c.fillStyle='rgba(255,220,160,'+(.04*b.v).toFixed(3)+')'; c.beginPath(); c.moveTo(b.x,b.y); c.lineTo(b.x+Math.cos(a)*360,b.y+Math.sin(a)*360); c.lineTo(b.x+Math.cos(a+.09)*360,b.y+Math.sin(a+.09)*360); c.fill(); } }
    for(let i=0;i<110;i++){ const x=r()*480, y=130+r()*140, ph=r()*6; if(Math.sin(t*(1.4+r())+ph)>.65) R(c,x,y,.5+(i%3===0?.5:0),.5,i%4?'rgba(255,240,200,.8)':'rgba(190,240,255,.8)'); }
    for(let i=0;i<12;i++){ const x=352+i*9, y=184+((t*6+i*13)%40); R(c,x+Math.sin(t*2+i)*1.5,y,1.5,.5,'rgba(255,200,120,'+Math.max(0,.45-(y-184)/90).toFixed(2)+')'); }
    softGlow(c,400,136,54,'255,176,80',.15);
    c.strokeStyle='rgba(18,9,5,.9)'; c.lineWidth=.8; c.beginPath(); c.moveTo(0,238); c.quadraticCurveTo(60,266,126,240); c.stroke();
    R(c,-1,232,4,38,'rgba(18,9,5,.92)'); R(c,126,236,3,34,'rgba(18,9,5,.92)');
    for(const [x,y,a,l] of [[-2,-4,.45,76],[-2,-4,.15,64],[7,-6,.8,58]]) frond(c,x,y,a+Math.sin(t*.7)*.015,l,'rgba(14,34,26,.95)',1);
    softGlow(c,480,0,140,'255,150,90',.07);
  };

  /* ================= Grassrivers ================= */
  H.grassrivers=(c,t,o)=>{
    const r=rng(51);
    for(let b=0;b<3;b++){ const y=118+b*13, g=c.createLinearGradient(0,y-10,0,y+14); g.addColorStop(0,'rgba(216,200,232,0)'); g.addColorStop(.5,'rgba(216,200,232,'+(.18-b*.04)+')'); g.addColorStop(1,'rgba(216,200,232,0)'); c.fillStyle=g; c.fillRect(0,y-10,480,24); R(c,((t*(3+b)+b*130)%560)-60,y,120,3,'rgba(220,208,236,.07)'); }
    { const b=body(o); if(b){ softGlow(c,b.x,b.y,34,'255,240,200',.14*b.v);
    for(let i=0;i<22;i++){ const y=126+i*2.2, w=3+(i%4)*2, x=b.x+Math.sin(t*1.7+i*1.3)*3; R(c,x-w/2,y,w,.5,'rgba(255,240,200,'+((.45-i*.015)*b.v).toFixed(2)+')'); } } }
    for(let i=0;i<30;i++){ const x=(i*61+Math.sin(t*.5+i)*12+480)%480, y=100+(i*17)%150+Math.cos(t*.8+i*2)*6, a=(Math.sin(t*1.8+i)+1)/2; if(a>.55){ R(c,x,y,.5,.5,'#f4ff9a'); if(a>.85) softGlow(c,x,y,4,'244,255,154',.35); } }
    for(let i=0;i<16;i++){ const x=14+i*30+(i%3)*6, len=14+(i*13)%22, sw=Math.sin(t*.9+i)*1.2; c.strokeStyle='rgba(60,84,60,.55)'; c.lineWidth=.45; c.beginPath(); c.moveTo(x,0); c.quadraticCurveTo(x+sw,len*.5,x+sw*1.6,len); c.stroke(); }
    leaf(c,10,266,26,7,-.45,'rgba(6,20,14,.95)','rgba(40,100,70,.4)'); leaf(c,34,272,24,6,-1.0,'rgba(8,26,18,.95)','rgba(40,100,70,.4)'); leaf(c,474,268,24,6,-2.7,'rgba(6,20,14,.95)','rgba(40,100,70,.4)'); leaf(c,452,274,22,5,-2.1,'rgba(8,26,18,.95)','rgba(40,100,70,.4)');
    for(let i=0;i<7;i++){ const ph=((t*.3+i*.19)%1), x=60+i*62, y=208+((i*29)%40); c.strokeStyle='rgba(220,235,255,'+(.3*(1-ph)).toFixed(2)+')'; c.lineWidth=.4; c.beginPath(); c.ellipse(x,y,ph*8,ph*2.4,0,0,7); c.stroke(); }
  };

  /* ================= Port Gellhorn ================= */
  H.gellhorn=(c,t,o)=>{
    const r=rng(61);
    for(const [x,w,col] of [[44,16,'255,216,144'],[200,16,'255,232,176'],[300,26,'255,216,144'],[338,22,'255,90,138'],[372,24,'90,200,255'],[420,40,'255,90,180'],[430,34,'255,60,60']]){
      const g=c.createLinearGradient(0,204,0,268); g.addColorStop(0,'rgba('+col+',.26)'); g.addColorStop(1,'rgba('+col+',0)'); c.fillStyle=g; c.fillRect(x,204,w,64);
      for(let k=0;k<6;k++) R(c,x+Math.sin(t*2.2+k+x)*1.4,208+k*9,w*.7,.5,'rgba('+col+',.22)'); }
    softGlow(c,422,74,38,'255,90,180',.18); softGlow(c,422,100,24,'255,60,60',.12);
    for(let i=0;i<4;i++){ const ph=((t*.35+i*.25)%1), x=346+Math.sin(t*1.5+i)*2, y=170-ph*26, g=c.createRadialGradient(x,y,0,x,y,3+ph*6); g.addColorStop(0,'rgba(230,236,250,'+(.18*(1-ph)).toFixed(3)+')'); g.addColorStop(1,'rgba(230,236,250,0)'); c.fillStyle=g; c.fillRect(x-10,y-10,20,20); }
    for(let i=0;i<60;i++){ const x=r()*480, y=28+r()*120, ph=r()*6; if(Math.sin(t*(.6+r())+ph)>.3) R(c,x,y,.5,.5,'#cfd6ff'); }
    c.strokeStyle='rgba(5,3,12,.9)'; c.lineWidth=.65; c.beginPath(); for(const y of [10,18,26]){ c.moveTo(0,y); c.quadraticCurveTo(240,y+22,480,y+2); } c.stroke();
    R(c,468,0,5,270,'rgba(5,3,12,.9)'); R(c,452,8,36,2,'rgba(5,3,12,.9)'); R(c,456,16,28,1.5,'rgba(5,3,12,.9)');
    for(let i=0;i<30;i++){ const x=(i*47+t*3)%480, y=((t*34+i*29)%270); R(c,x,y,.5,2,'rgba(190,215,255,.22)'); }
  };

  /* ================= Ambrosia ================= */
  H.ambrosia=(c,t,o)=>{
    { const b=body(o); if(b&&b.sun){ softGlow(c,b.x,b.y,130,'255,190,100',.24*b.v); if(b.low>.4) for(let i=0;i<6;i++){ const a=-.1-i*.12+Math.sin(t*.15+i)*.01; c.fillStyle='rgba(255,210,140,'+(.05*b.v).toFixed(3)+')'; c.beginPath(); c.moveTo(b.x,b.y); c.lineTo(b.x+Math.cos(a)*420,b.y+Math.sin(a)*420); c.lineTo(b.x+Math.cos(a-.07)*420,b.y+Math.sin(a-.07)*420); c.fill(); } } }
    for(let i=0;i<9;i++){ const y=192+i*8, off=Math.sin(t*1.4+i)*3; c.strokeStyle='rgba(255,220,150,.07)'; c.lineWidth=.4; c.beginPath(); for(let x=0;x<=480;x+=12) c.lineTo(x,y+Math.sin(x*.07+t*2+i)*1.1+off*.2); c.stroke(); }
    for(let i=0;i<30;i++){ const x=(i*53+t*4)%480, y=100+(i*37)%150+Math.sin(t+i)*5; R(c,x,y,.5,.5,'rgba(255,230,170,.55)'); }
    for(let i=0;i<5;i++){ const x=18+i*3, ph=((t*.3+i*.2)%1), y=82-ph*30; const g=c.createRadialGradient(x+ph*30,y,0,x+ph*30,y,5+ph*9); g.addColorStop(0,'rgba(240,235,245,'+(.2*(1-ph)).toFixed(3)+')'); g.addColorStop(1,'rgba(240,235,245,0)'); }
    c.strokeStyle='rgba(30,24,10,.9)'; c.lineWidth=.55;
    for(let i=0;i<22;i++){ const x=i*22+((i*7)%9)-4, h=26+(i*13)%18, sw=Math.sin(t*1.3+i*.7)*2.2; c.beginPath(); c.moveTo(x,272); c.quadraticCurveTo(x+sw*.4,272-h*.6,x+sw,272-h); c.stroke(); for(let k=1;k<4;k++){ c.beginPath(); c.moveTo(x+sw*(k/4),272-h*(k/4)); c.lineTo(x+sw*(k/4)+7,272-h*(k/4)-5); c.stroke(); } }
    softGlow(c,300,160,40,'255,130,60',.12+Math.sin(t*8)*.02);
  };

  /* ================= Mount Kalaga ================= */
  H.kalaga=(c,t,o)=>{
    const r=rng(71);
    const st=o.tod?o.tod.P.stars:1; if(st>.05) for(let i=0;i<150;i++){ const x=r()*480, y=r()*150, ph=r()*6, b=Math.sin(t*(1+r()*1.5)+ph); if(b>-.6) R(c,x,y,.5,.5,'rgba(235,240,255,'+((.35+b*.4)*st).toFixed(2)+')'); }
    { const b=body(o); if(b) softGlow(c,b.x,b.y,46,b.sun?'255,220,160':'210,220,255',.18*b.v); }
    for(let b=0;b<3;b++){ const y=140+b*30, g=c.createLinearGradient(0,y-10,0,y+14); g.addColorStop(0,'rgba(160,176,220,0)'); g.addColorStop(.5,'rgba(160,176,220,'+(.15-b*.03)+')'); g.addColorStop(1,'rgba(160,176,220,0)'); c.fillStyle=g; c.fillRect(0,y-10,480,24); R(c,((t*(2+b)+b*150)%600)-80,y,140,3,'rgba(190,200,235,.06)'); }
    for(let i=0;i<18;i++){ const ph=((t*.45+i*.17)%1), x=244+Math.sin(t*1.7+i*2)*10+ph*(i%2?6:-6), y=246-ph*70; if(ph<.9){ R(c,x,y,.5,.5,ph<.4?'#ffe58a':'#ff9a3a'); } }
    softGlow(c,244,244,70,'255,150,60',.16+Math.sin(t*12)*.03); softGlow(c,445,210,34,'255,208,112',.13);
    for(const [x,y,l] of [[-6,-2,90],[24,-4,64],[486,-2,92],[462,-4,66]]){ const dir=x<240?1:-1; c.strokeStyle='rgba(6,16,14,.95)'; c.lineWidth=1.1; c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+dir*l*.5,y+l*.14,x+dir*l,y+l*.32); c.stroke();
      c.lineWidth=.45; c.beginPath(); for(let i=1;i<28;i++){ const u=i/28, bx=x+dir*l*u, by=y+l*.32*u+Math.sin(u*3)*2; c.moveTo(bx,by); c.lineTo(bx+dir*3,by+9+(i%3)*2); c.moveTo(bx,by); c.lineTo(bx-dir*1,by+10+(i%2)*3); } c.stroke(); }
    for(let i=0;i<16;i++){ const x=(i*43+Math.sin(t*.7+i)*20+480)%480, y=222+(i*11)%42+Math.cos(t*.9+i*2)*8, a=(Math.sin(t*2+i)+1)/2; if(a>.5){ R(c,x,y,.5,.5,'#e8ff8a'); if(a>.85) softGlow(c,x,y,4,'232,255,138',.4); } }
  };
})();
