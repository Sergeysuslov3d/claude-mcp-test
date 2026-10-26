// Living layer: birds, aircraft, detailed cars, water reflections and people with things to do. Original pixel art.
window.LIFE = (function(){
  const {R,P,line,disc,ell,mix} = PX;
  const fr=x=>x-Math.floor(x);

  /* ======================= BIRDS ======================= */
  // each sprite drawn facing right; flip by drawing with negative direction
  function bird(c,kind,x,y,t,dir,ph){
    const f=Math.floor(t*(kind==='pelican'?3:kind==='flamingo'?4:7)+ph)%2, d=dir<0?-1:1;
    const Lx=(dx)=>x+dx*d;
    if(kind==='gull'){ R(c,Math.min(Lx(0),Lx(4)),y,5,2,'#f4f2f8'); P(c,Lx(5),y,'#ffb84a');
      if(f){ line(c,Lx(1),y,Lx(-2),y-3,'#f4f2f8'); line(c,Lx(3),y,Lx(6),y-3,'#f4f2f8'); P(c,Lx(-2),y-3,'#3a3a4a'); P(c,Lx(6),y-3,'#3a3a4a'); }
      else { line(c,Lx(1),y,Lx(-3),y+1,'#e8e6f0'); line(c,Lx(3),y,Lx(7),y+1,'#e8e6f0'); } }
    else if(kind==='pelican'){ R(c,Math.min(Lx(0),Lx(9)),y,10,3,'#8a7a6a'); R(c,Math.min(Lx(9),Lx(15)),y,7,1,'#e8b850'); R(c,Math.min(Lx(9),Lx(13)),y+1,5,1,'#d8a040'); P(c,Lx(10),y-1,'#f4f0e8');
      const wy=f?-4:0; line(c,Lx(2),y,Lx(-7),y+wy,'#5a4a3a'); line(c,Lx(6),y,Lx(15),y+wy,'#5a4a3a'); line(c,Lx(3),y+1,Lx(-6),y+1+wy,'#7a6a5a'); }
    else if(kind==='flamingo'){ R(c,Math.min(Lx(0),Lx(5)),y,6,2,'#f08aa4'); line(c,Lx(6),y,Lx(13),y-1,'#f08aa4'); R(c,Math.min(Lx(13),Lx(15)),y-2,3,2,'#f08aa4'); P(c,Lx(16),y-1,'#1a1418');
      line(c,Lx(0),y+1,Lx(-8),y+2,'#e8688a'); const wy=f?-4:2; line(c,Lx(2),y,Lx(0),y+wy,'#f08aa4'); line(c,Lx(4),y,Lx(6),y+wy,'#f08aa4'); P(c,Lx(0),y+wy,'#1a1418'); P(c,Lx(6),y+wy,'#1a1418'); }
    else if(kind==='egret'){ R(c,Math.min(Lx(0),Lx(5)),y,6,2,'#f8f8fc'); line(c,Lx(6),y,Lx(9),y-2,'#f8f8fc'); P(c,Lx(10),y-2,'#ffd24a'); line(c,Lx(0),y+1,Lx(-6),y+1,'#2a2a2a');
      const wy=f?-4:2; line(c,Lx(2),y,Lx(-2),y+wy,'#f0f0f6'); line(c,Lx(4),y,Lx(8),y+wy,'#f0f0f6'); }
    else if(kind==='pigeon'){ R(c,Math.min(Lx(0),Lx(3)),y,4,2,'#8a8aa0'); P(c,Lx(4),y,'#5a6a8a'); const wy=f?-2:1; line(c,Lx(1),y,Lx(-1),y+wy,'#6a6a80'); line(c,Lx(2),y,Lx(4),y+wy,'#6a6a80'); }
    else if(kind==='crow'){ R(c,Math.min(Lx(0),Lx(3)),y,4,2,'#120e16'); P(c,Lx(4),y,'#120e16'); const wy=f?-3:1; line(c,Lx(1),y,Lx(-3),y+wy,'#120e16'); line(c,Lx(2),y,Lx(6),y+wy,'#120e16'); }
    else if(kind==='parrot'){ R(c,Math.min(Lx(0),Lx(4)),y,5,2,'#3ac860'); P(c,Lx(5),y,'#ffd24a'); line(c,Lx(0),y+1,Lx(-4),y+2,'#2a7ad0'); const wy=f?-3:1; line(c,Lx(1),y,Lx(-1),y+wy,'#e83a3a'); line(c,Lx(3),y,Lx(5),y+wy,'#e83a3a'); }
    else if(kind==='bat'){ const j=Math.round(Math.sin(t*20+ph)); R(c,x,y+j,2,2,'#06060c'); line(c,x,y+j,x-3,y+j-(f?2:-1),'#06060c'); line(c,x+1,y+j,x+4,y+j-(f?2:-1),'#06060c'); }
    else if(kind==='hawk'){ R(c,Math.min(Lx(0),Lx(4)),y,5,2,'#5a3a24'); P(c,Lx(5),y,'#e8c060'); line(c,Lx(1),y,Lx(-6),y-1,'#4a2e1c'); line(c,Lx(3),y,Lx(10),y-1,'#4a2e1c'); line(c,Lx(-6),y-1,Lx(-7),y,'#2a1a10'); }
  }
  function perched(c,kind,x,y,t,ph){
    const peck=Math.sin(t*2+ph)>.7?1:0;
    if(kind==='gull'){ R(c,x,y-4,5,3,'#f4f2f8'); R(c,x-1,y-3,2,2,'#8a8a98'); R(c,x+4,y-6+peck,3,3,'#f4f2f8'); P(c,x+7,y-5+peck,'#ffb84a'); P(c,x+1,y-1,'#ffb84a'); P(c,x+3,y-1,'#ffb84a'); }
    else if(kind==='pelican'){ R(c,x,y-6,6,5,'#8a7a6a'); R(c,x+4,y-10,3,5,'#f4f0e8'); R(c,x+6,y-9+peck,6,2,'#e8b850'); R(c,x+1,y-1,1,2,'#4a3a2a'); R(c,x+4,y-1,1,2,'#4a3a2a'); }
    else if(kind==='pigeon'){ R(c,x,y-3,4,3,'#8a8aa0'); R(c,x+3,y-5+peck,2,2,'#6a7a9a'); P(c,x+5,y-4+peck,'#c8a060'); }
    else if(kind==='crow'){ R(c,x,y-3,4,3,'#120e16'); R(c,x+3,y-5+peck,2,2,'#120e16'); P(c,x+5,y-4+peck,'#3a3a3a'); }
    else if(kind==='egret'){ R(c,x,y-6,4,4,'#f8f8fc'); R(c,x+3,y-11,1,5,'#f8f8fc'); R(c,x+3,y-12,3,2,'#f8f8fc'); P(c,x+6,y-11,'#ffd24a'); R(c,x+1,y-2,1,2,'#2a2a2a'); }
    else if(kind==='owl'){ R(c,x,y-6,5,6,'#5a4a3a'); R(c,x,y-7,1,1,'#5a4a3a'); R(c,x+4,y-7,1,1,'#5a4a3a'); const bl=Math.sin(t*.7+ph)>.92; P(c,x+1,y-5,bl?'#5a4a3a':'#ffd24a'); P(c,x+3,y-5,bl?'#5a4a3a':'#ffd24a'); }
  }
  // flocks pass on a schedule computed from time alone (no state)
  function flocks(c,sc,T,t){
    const B=sc.birds; if(!B) return; const night=T.P.lamp>.7;
    if(B.clip){ c.save(); c.beginPath(); c.rect(B.clip[0],B.clip[1],B.clip[2],B.clip[3]); c.clip(); }
    (B.fly||[]).forEach((f,fi)=>{
      if(f.night===true&&!night) return; if(f.night===false&&night) return;
      const kind=night&&f.nightKind?f.nightKind:f.kind, period=f.every||30, n=f.n||3, sp=f.speed||22, dir=f.dir||(fi%2?-1:1);
      const k=Math.floor((t+fi*7)/period), t0=k*period-fi*7, dt=t-t0, span=520;
      for(let i=0;i<n;i++){
        const x=dir>0? -30+dt*sp - i*(f.gap||9): 510-dt*sp + i*(f.gap||9);
        if(x<-40||x>520) continue;
        const y=(f.y||40)+((k*37+i*13)%(f.spread||18))+Math.sin(t*1.3+i)*2+(f.v?Math.abs(i-(n-1)/2)*3:0);
        bird(c,kind,Math.round(x),Math.round(y),t,dir,i*1.7);
      }
    });
    // birds landing on perches, staying a while, then leaving
    (B.perch||[]).forEach((p,pi)=>{
      if(p.night===false&&night) return; const kind=night&&p.nightKind?p.nightKind:p.kind;
      const cyc=p.every||28, u=fr((t+pi*11)/cyc);
      if(u<.12){ const q=u/.12, sx=p.x-120*(pi%2?-1:1), sy=p.y-60; bird(c,kind,Math.round(sx+(p.x-sx)*q),Math.round(sy+(p.y-6-sy)*q),t,pi%2?-1:1,pi); }
      else if(u<.72) perched(c,kind,p.x,p.y,t,pi);
      else if(u<.84){ const q=(u-.72)/.12; bird(c,kind,Math.round(p.x+q*140*(pi%2?-1:1)),Math.round(p.y-6-q*70),t,pi%2?-1:1,pi); }
    });
    if(B.clip) c.restore();
  }

  /* ======================= AIRCRAFT ======================= */
  function aircraft(c,sc,T,t){
    const A=sc.air; if(A===false) return; const r=sc.sky, hz=r.horizon||(r.y+r.h), night=T.P.lamp>.55;
    // airliner high up with contrail by day, blinking lights by night
    { const per=46, u=fr((t+(r.w%17))/per); if(u<.7){ const q=u/.7, x=r.x-20+q*(r.w+40), y=r.y+Math.max(6,(hz-r.y)*.18)+q*6;
        if(!night&&T.ov<.4){ for(let i=0;i<60;i++){ const a=(1-i/60)*.5; c.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')'; c.fillRect(Math.round(x-6-i*2),Math.round(y+1-i*.2),2,1); } }
        R(c,x-6,y,10,2,night?'#2a2a3a':'#e8ecf4'); R(c,x-2,y-2,3,2,night?'#2a2a3a':'#c8ccd8'); R(c,x-6,y-2,2,2,night?'#2a2a3a':'#c8ccd8');
        if(((t*2)|0)%2) P(c,x+3,y,'#ff4a4a'); if(((t*1.3)|0)%2) P(c,x-6,y-2,'#ffffff'); } }
    // small prop plane towing a banner low over the water/beach scenes
    if(A&&A.banner){ const per=70, u=fr(t/per); if(u<.55){ const q=u/.55, x=520-q*620, y=A.banner;
      R(c,x,y,9,3,'#f4f0f8'); R(c,x+3,y-2,3,2,'#f4f0f8'); R(c,x+2,y-1,6,1,'#ff5a7a'); P(c,x-1,y+1,(t*20|0)%2?'#888':'#ccc');
      line(c,x+9,y+1,x+20,y+2,'#c8c8d0'); R(c,x+20,y-1,48,7,'#fff6e0'); R(c,x+20,y-1,48,1,'#ff5a9a'); PX.text(c,A.text||'VISIT VICE BEACH',x+22,y,'#e0306a',1); } }
    // seaplane landing on the water (Keys)
    if(A&&A.seaplane){ const per=60, u=fr(t/per); if(u<.6){ const q=u/.6, x=-40+q*560, y=A.seaplane-Math.max(0,(.6-q))*80;
      R(c,x,y,14,3,'#f4f0f8'); R(c,x+3,y-3,8,3,'#f4f0f8'); R(c,x+4,y-2,5,1,'#4a8ac8'); R(c,x-4,y-4,3,4,'#e05a3a'); R(c,x+2,y+4,10,1,'#c8c8d0'); P(c,x+15,y+1,(t*20|0)%2?'#888':'#ccc');
      if(q>.6){ c.fillStyle='rgba(255,255,255,.5)'; c.fillRect(Math.round(x-10),Math.round(y+6),12,1); } } }
  }

  /* ======================= CARS ======================= */
  const SPEC={
    sedan:{len:42,r0:12,r1:30,rh:5,w:[8,33]}, police:{len:42,r0:12,r1:30,rh:5,w:[8,33]}, taxi:{len:42,r0:12,r1:30,rh:5,w:[8,33]},
    muscle:{len:38,r0:13,r1:26,rh:4,w:[7,30]}, convertible:{len:40,r0:14,r1:24,rh:0,w:[7,32]}, super:{len:38,r0:12,r1:26,rh:3,low:1,w:[7,30]},
    pickup:{len:44,r0:20,r1:32,rh:6,w:[8,35]}, lowrider:{len:42,r0:12,r1:29,rh:4,low:1,w:[8,33]}, van:{len:38,r0:4,r1:33,rh:8,w:[7,30]}
  };
  const sprCache={};
  function sideSprite(model,col,dir){
    const key=model+col+dir; if(sprCache[key]) return sprCache[key];
    const S=SPEC[model], L=S.len, W=L+2, H=22, [cv,g]=PX.makeCanvas(W,H), gy=18;
    const r=(x,y,w,h,cl)=>{ g.fillStyle=cl; g.fillRect(x,y,w,h); };
    const dark=mix(col,'#000000',.38), light=mix(col,'#ffffff',.35), glass='#1e2c48', glassHi='#8ac6ec', chrome='#e8eaf2';
    const low=S.low?1:0, top=gy-9+low, belt=gy-9+low;
    // lower body
    r(1,top,L,6-low,col); r(1,top,L,1,light); r(1,top+4-low,L,1,dark); r(1,top+5-low,L,1,mix(col,'#000',.6));
    // roof / cabin
    if(S.rh>0){ g.fillStyle=col; g.beginPath(); g.moveTo(S.r0-3,belt); g.lineTo(S.r0+1,belt-S.rh); g.lineTo(S.r1-1,belt-S.rh); g.lineTo(S.r1+3,belt); g.closePath(); g.fill();
      r(S.r0+1,belt-S.rh,S.r1-S.r0-2,1,light);
      g.fillStyle=glass; g.beginPath(); g.moveTo(S.r0-1,belt); g.lineTo(S.r0+2,belt-S.rh+1); g.lineTo(S.r1-2,belt-S.rh+1); g.lineTo(S.r1+1,belt); g.closePath(); g.fill();
      r(Math.round((S.r0+S.r1)/2),belt-S.rh+1,1,S.rh-1,col); r(S.r0+3,belt-S.rh+2,3,1,glassHi); r(Math.round((S.r0+S.r1)/2)+2,belt-S.rh+2,2,1,glassHi); }
    else { r(S.r0+2,belt-4,1,4,chrome); r(S.r0+3,belt-4,3,1,glassHi); r(S.r0+10,belt-4,2,3,'#d79a72'); r(S.r0+10,belt-5,3,1,'#2a1a18'); r(S.r0+9,belt-2,4,2,'#3a8ad8'); r(S.r0+12,belt-3,1,1,'#14101e'); r(S.r0+5,belt-1,12,1,'#5a2a2a'); }
    // pickup bed / van details
    if(model==='pickup'){ r(2,top-3,S.r0-4,3,col); r(2,top-3,S.r0-4,1,light); r(2,top-2,1,2,dark); }
    if(model==='van'){ r(8,belt-S.rh+2,5,4,glass); r(15,belt-S.rh+2,7,4,glass); r(1,top+1,L,1,mix(col,'#fff',.15)); }
    // trim, doors, handles, bumpers, lights
    r(1,top+2,L,1,chrome); r(S.r0+2,top+1,1,4,dark); r(Math.round((S.r0+S.r1)/2)+1,top+1,1,4,dark); r(S.r0+5,top+2,2,1,dark); r(Math.round((S.r0+S.r1)/2)+4,top+2,2,1,dark);
    r(0,top+3,2,2,chrome); r(L,top+3,2,2,chrome); r(L,top+1,1,2,'#fffbd0'); r(0,top+1,1,2,'#e8303a');
    // wheel arches
    for(const wx of S.w){ g.fillStyle='#0a0810'; g.beginPath(); g.arc(wx,gy-3,4.5,Math.PI,0); g.fill(); }
    // paint jobs
    if(model==='police'){ r(S.r0-2,top,S.r1-S.r0+5,5-low,'#14141c'); r(S.r0+1,belt-S.rh-1,S.r1-S.r0-2,1,'#2a2a3a'); r(S.r0+4,top+2,12,1,'#f4f4f8'); }
    if(model==='taxi'){ for(let x=S.r0;x<S.r1;x+=2) r(x,top+2,1,1,'#1a1a1a'); r(Math.round((S.r0+S.r1)/2)-3,belt-S.rh-2,6,2,'#fff6c0'); }
    if(model==='muscle'){ r(1,top+1,L,1,'#f4f4f8'); r(L-14,top-1,6,1,dark); }
    if(model==='lowrider'){ r(1,top+3,L,1,'#ffd24a'); r(6,top+1,L-12,1,mix(col,'#fff',.5)); }
    if(model==='super'){ g.fillStyle=dark; g.beginPath(); g.moveTo(L,top); g.lineTo(L-8,top-1); g.lineTo(L-8,top+1); g.fill(); r(2,top-2,5,2,dark); }
    if(dir<0){ const [c2,g2]=PX.makeCanvas(W,H); g2.translate(W,0); g2.scale(-1,1); g2.drawImage(cv,0,0); return sprCache[key]=c2; }
    return sprCache[key]=cv;
  }
  // 2x sprite with a 1px outline, top highlight and under-shadow so cars read at the same scale as people
  const bigCache={}, CS=2;
  function bigSprite(model,col,dir,s){
    const key=model+col+dir+s; if(bigCache[key]) return bigCache[key];
    const sm=sideSprite(model,col,dir); if(s===1) return bigCache[key]=sm;
    const W=sm.width*s+2, H=sm.height*s+2, [cv,g]=PX.makeCanvas(W,H);
    g.drawImage(sm,0,0,sm.width,sm.height,1,1,sm.width*s,sm.height*s);
    const id=g.getImageData(0,0,W,H), d=id.data, src=new Uint8ClampedArray(d), A=(x,y)=>x<0||y<0||x>=W||y>=H?0:src[(y*W+x)*4+3];
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4;
      if(!src[i+3]){ if(A(x-1,y)||A(x+1,y)||A(x,y-1)||A(x,y+1)){ d[i]=10; d[i+1]=8; d[i+2]=18; d[i+3]=255; } continue; }
      if(!A(x,y-1)){ d[i]=Math.min(255,src[i]+70); d[i+1]=Math.min(255,src[i+1]+70); d[i+2]=Math.min(255,src[i+2]+70); }
      else if(!A(x,y-2)&&y>1){ d[i]=Math.min(255,src[i]+28); d[i+1]=Math.min(255,src[i+1]+28); d[i+2]=Math.min(255,src[i+2]+28); } }
    g.putImageData(id,0,0);
    return bigCache[key]=cv;
  }
  // x = left edge, y = ground line; o.s = pixel scale (default 2, 1 for far away)
  function car(c,x,y,model,col,dir,t,o){
    o=o||{}; const s=o.s||CS, S=SPEC[model]||SPEC.sedan, m=model in SPEC?model:'sedan', W1=S.len+2, spr=bigSprite(m,col,dir,s), gy=18*s;
    const bounce=model==='lowrider'&&o.hop?Math.round(Math.abs(Math.sin(t*4+x*.01))*3*s):0;
    x=Math.round(x); y=Math.round(y);
    c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(x+2*s,y,W1*s-4*s,2); c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(x+s,y+2,W1*s-2*s,1);
    const ox=s>1?1:0;
    if(o.wet){ c.save(); c.globalAlpha=.2; c.translate(0,2*y+2); c.scale(1,-1); c.drawImage(spr,x-ox,y-gy-bounce-ox); c.restore(); }
    c.drawImage(spr,x-ox,y-gy-bounce-ox);
    const rr=s>1?Math.round(3.2*s):3, sp=Math.floor(t*(o.speed||0)*.35)%8, wd=dir<0?-1:1;
    for(const w0 of S.w){ const wx=x+Math.round(((dir<0?W1-1-w0:w0)+.5)*s), wy=y-rr;
      disc(c,wx,wy,rr,'#121018'); if(s>1){ disc(c,wx,wy,rr-2,'#3a3a46'); disc(c,wx,wy,rr-3,model==='lowrider'?'#ffd24a':'#b8bac8');
        const a=wd*sp*Math.PI/4; for(let k=0;k<3;k++){ const q=a+k*Math.PI*2/3; P(c,wx+Math.round(Math.cos(q)*2),wy+Math.round(Math.sin(q)*2),k?'#5a5a68':'#f0f0f8'); }
        P(c,wx,wy,'#2a2a34'); P(c,wx-rr+1,wy-1,'#4a4a56'); }
      else { const q=(wd*sp*Math.PI/4); disc(c,wx,wy,1,model==='lowrider'?'#ffd24a':'#a8aab8'); P(c,wx+Math.round(Math.cos(q)),wy+Math.round(Math.sin(q)),'#e8e8f0'); } }
    const lamp=o.lamp==null?SK.k:o.lamp;
    if(lamp>.35){ const hx=dir>0?x+(W1-1)*s:x, tx=dir>0?x:x+(W1-1)*s, ly=y-gy+(top0(S)+1)*s-bounce, L=18*s;
      for(let i=0;i<L;i++){ c.fillStyle='rgba(255,246,200,'+(.22*(1-i/L)*lamp).toFixed(3)+')'; c.fillRect(hx+(dir>0?i:-i),ly-Math.floor(i/(3*s)),1,2*s+Math.floor(i/3)); }
      R(c,tx,ly,s,s,'#ff3040'); SK.glow(c,tx,ly,4*s,'#ff3040',.6*lamp); R(c,hx,ly,s,s,'#fffbd0'); }
    if(model==='police'&&o.lights){ const b=Math.floor(t*6)%2, mid=Math.round((S.r0+S.r1)/2), cx=x+(dir<0?W1-1-mid:mid)*s, cy=y-gy+(9-S.rh-2)*s-bounce;
      R(c,cx-3*s,cy,3*s,s,b?'#ff2a3a':'#401018'); R(c,cx,cy,3*s,s,b?'#202a60':'#3a6aff'); SK.glow(c,cx+(b?-2:2)*s,cy,10*s,b?'#ff2a3a':'#3a6aff',.6); }
  }
  car.len=(model,s)=>((SPEC[model]||SPEC.sedan).len+2)*(s||CS);
  const top0=S=>(18-9)+(S.low?1:0);
  // motorbike with rider, drawn small then scaled like the cars
  const [bkCv,bkG]=PX.makeCanvas(22,24);
  function bike(c,x,y,col,dir,t,look,s){
    s=s||CS; x=Math.round(x); y=Math.round(y); const d=dir<0?-1:1, an=d>0?2:19, L=v=>an+v*d, g=bkG, gy=22;
    g.clearRect(0,0,22,24);
    disc(g,L(2),gy-3,3,'#121018'); disc(g,L(14),gy-3,3,'#121018'); P(g,L(2),gy-3,'#a8aab8'); P(g,L(14),gy-3,'#a8aab8');
    line(g,L(2),gy-3,L(8),gy-6,'#3a3a46'); line(g,L(8),gy-6,L(14),gy-3,'#3a3a46'); R(g,Math.min(L(5),L(11)),gy-8,7,3,col); R(g,Math.min(L(11),L(13)),gy-10,3,2,'#2a2a36');
    R(g,Math.min(L(6),L(9)),gy-15,4,7,look||'#2a2a3a'); R(g,Math.min(L(8),L(11)),gy-19,4,4,'#d8d8e0'); R(g,Math.min(L(10),L(11)),gy-18,2,2,'#3a6ad0'); P(g,L(16),gy-7,'#fffbd0');
    c.drawImage(bkCv,0,0,22,24,x-an*s,y-gy*s,22*s,24*s);
    if(SK.k>.35){ const hx=x+(L(16)-an)*s; SK.glow(c,hx,y-7*s,6*s,'#fff6c0',.5*SK.k); }
  }
  // front / rear view for streets that run into the distance
  const frCache={};
  function frontSprite(col,view){
    const key=col+view; if(frCache[key]) return frCache[key];
    const [cv,g]=PX.makeCanvas(26,18), r=(x,y,w,h,cl)=>{ g.fillStyle=cl; g.fillRect(x,y,w,h); }, dark=mix(col,'#000',.4), light=mix(col,'#fff',.3);
    r(4,1,18,6,col); r(6,2,14,4,'#1e2c48'); r(7,2,4,1,'#8ac6ec'); r(2,7,22,7,col); r(2,7,22,1,light); r(2,12,22,2,dark);
    if(view==='front'){ r(3,9,4,2,'#fffbd0'); r(19,9,4,2,'#fffbd0'); r(9,9,8,3,'#2a2a34'); for(let i=0;i<4;i++) r(10+i*2,9,1,3,'#8a8a98'); }
    else { r(3,9,4,2,'#e8303a'); r(19,9,4,2,'#e8303a'); r(10,10,6,2,'#e8e8d8'); }
    r(1,13,24,1,'#e8eaf2'); r(2,14,4,3,'#121018'); r(20,14,4,3,'#121018');
    return frCache[key]=cv;
  }
  function carFR(c,x,y,col,view,s,lamp){
    const spr=frontSprite(col,view), w=Math.max(4,Math.round(26*s)), h=Math.max(3,Math.round(18*s));
    c.drawImage(spr,Math.round(x-w/2),Math.round(y-h),w,h);
    if(lamp>.35){ const ly=Math.round(y-h*.4); if(view==='front'){ SK.glow(c,Math.round(x-w*.33),ly,Math.max(3,Math.round(8*s)),'#fff6c0',.7*lamp); SK.glow(c,Math.round(x+w*.33),ly,Math.max(3,Math.round(8*s)),'#fff6c0',.7*lamp); }
      else { SK.glow(c,Math.round(x-w*.33),ly,Math.max(2,Math.round(5*s)),'#ff3040',.6*lamp); SK.glow(c,Math.round(x+w*.33),ly,Math.max(2,Math.round(5*s)),'#ff3040',.6*lamp); } }
  }

  /* ======================= PEOPLE ======================= */
  const LOOKS=[]; { const g=PX.rng(99); for(let i=0;i<40;i++) LOOKS.push({ skin:CAST.SKIN[Math.floor(g()*6)], hair:CAST.HAIR[Math.floor(g()*8)], hairStyle:CAST.STYLES[Math.floor(g()*6)][0], top:CAST.TOP[Math.floor(g()*8)], bottom:CAST.BOTTOM[Math.floor(g()*5)] }); }
  const look=i=>LOOKS[i%LOOKS.length];
  function personAt(c,x,y,p,t,pose,k,dir){
    if(dir<0){ c.save(); c.translate(Math.round(x)*2,0); c.scale(-1,1); CAST.person(c,Math.round(x),y,p,t,pose,k); c.restore(); } else CAST.person(c,Math.round(x),y,p,t,pose,k);
  }
  function dog(c,x,y,t,dir,col){ const f=Math.floor(t*8)%2, d=dir<0?-1:1, L=v=>x+v*d; col=col||'#8a5a3a';
    R(c,Math.min(L(0),L(7)),y-5,8,3,col); R(c,Math.min(L(7),L(10)),y-7,4,3,col); P(c,L(11),y-6,'#1a1010'); R(c,Math.min(L(-2),L(0)),y-6+f,2,1,col);
    R(c,L(f?1:2),y-2,1,2,col); R(c,L(f?6:5),y-2,1,2,col); }
  const umbrella=(c,x,y,k,col)=>{ const w=Math.round(22*k), top=Math.round(y-92*k); R(c,x-w/2,top,w,Math.max(1,Math.round(3*k)),col); R(c,x-w/2+2,top-1,w-4,1,col); R(c,x,top,1,Math.round(20*k),'#2a2a3a'); };
  // npc kinds; e = {kind,x,y,k,x0,x1,speed,look}
  const PS=.85;   // global people scale so they sit right next to cars, doors and props
  function npc(c,e,i,t,env){
    const k=(e.k||.5)*PS, p=look(e.look!=null?e.look:i*3+1), rain=env.weather&&env.weather!=='clear'&&env.weather!=='fog'&&!e.indoor;
    if(e.kind==='walk'||e.kind==='jog'||e.kind==='dogwalk'||e.kind==='skate'||e.kind==='couple'){
      const L=(e.x1-e.x0), sp=(e.speed||(e.kind==='jog'?20:e.kind==='skate'?28:9)), ph=(t*sp+i*137)%(2*L), fwd=ph<L, x=e.x0+(fwd?ph:2*L-ph), dir=fwd?1:-1;
      const tt=e.kind==='jog'?t*1.8:t;
      if(e.kind==='skate'){ const jump=fr(t*.25+i*.3)<.08?-Math.round(Math.sin(fr(t*.25+i*.3)/.08*Math.PI)*5):0; R(c,x-6,e.y-1+jump,12,1,'#3a2a2a'); P(c,x-5,e.y+jump,'#ddd'); P(c,x+4,e.y+jump,'#ddd'); personAt(c,x,e.y-2+jump,p,0,'front',k,dir); return; }
      personAt(c,x,e.y,p,tt,'walk',k,dir);
      if(e.kind==='couple') personAt(c,x+Math.round(10*k)*(dir>0?-1:1),e.y,look(i*3+7),tt+.3,'walk',k,dir);
      if(e.kind==='dogwalk'){ const dx=x+dir*Math.round(22*k); line(c,x+dir*Math.round(8*k),e.y-Math.round(46*k),dx,e.y-Math.round(4*k),'rgba(220,60,60,.8)'); dog(c,dx,e.y,t,dir); }
      if(rain&&e.kind!=='jog') umbrella(c,x,e.y,k,['#e0507a','#2ad0c8','#ffd24a','#6a5ac8'][i%4]);
      return; }
    if(e.kind==='photo'){ personAt(c,e.x,e.y,p,t,'front',k,1); const cyc=fr(t/6+i*.37); if(cyc<.5){ R(c,e.x+Math.round(4*k),e.y-Math.round(76*k),Math.max(2,Math.round(6*k)),Math.max(2,Math.round(4*k)),'#1a1a24'); if(cyc>.44&&cyc<.47) SK.glow(c,e.x+Math.round(6*k),e.y-Math.round(74*k),10,'#ffffff',1); } return; }
    if(e.kind==='music'){ personAt(c,e.x,e.y,p,t,'front',k,1); const gx=e.x-Math.round(4*k), gy=e.y-Math.round(46*k); ell(c,gx,gy,Math.max(2,Math.round(7*k)),Math.max(2,Math.round(5*k)),'#c8843a'); line(c,gx,gy,gx+Math.round(18*k),gy-Math.round(12*k),'#5a3a1a');
      for(let n=0;n<2;n++){ const q=fr(t*.4+n*.5), nx=e.x+Math.round(10*k)+q*10, ny=gy-q*30; if(q<.9) PX.text(c,'',0,0,'#fff'), R(c,nx,ny,1,3,'#ffe08a'), R(c,nx+1,ny,2,1,'#ffe08a'), P(c,nx-1,ny+3,'#ffe08a'); }
      R(c,e.x+Math.round(10*k),e.y-3,Math.round(10*k),3,'#5a3a2a'); if(fr(t/9+i*.2)<.06) P(c,e.x+Math.round(14*k),e.y-4,'#ffd24a'); return; }
    if(e.kind==='sit'||e.kind==='cafe'||e.kind==='bench'){
      if(e.kind==='cafe'){ R(c,e.x+Math.round(10*k),e.y-Math.round(22*k),Math.round(18*k),2,'#e8e0d0'); R(c,e.x+Math.round(18*k),e.y-Math.round(20*k),1,Math.round(20*k),'#4a4050'); const lift=fr(t/7+i*.3)<.15?Math.round(6*k):0; R(c,e.x+Math.round(12*k),e.y-Math.round(26*k)-lift,Math.max(2,Math.round(3*k)),Math.max(2,Math.round(4*k)),'#f4f0ff');
        const q=fr(t*.6+i); P(c,e.x+Math.round(13*k),e.y-Math.round(30*k)-q*4-lift,'rgba(255,255,255,.6)'); }
      if(e.kind==='bench'){ R(c,e.x-Math.round(16*k),e.y-Math.round(20*k),Math.round(40*k),2,'#6a4a30'); R(c,e.x-Math.round(16*k),e.y-Math.round(34*k),Math.round(40*k),2,'#6a4a30'); R(c,e.x-Math.round(14*k),e.y-Math.round(20*k),1,Math.round(20*k),'#3a2a20'); R(c,e.x+Math.round(22*k),e.y-Math.round(20*k),1,Math.round(20*k),'#3a2a20');
        personAt(c,e.x+Math.round(12*k),e.y-Math.round(4*k),look(i*3+5),t+1,'read',k*.9,1); }
      personAt(c,e.x,e.y-Math.round(4*k),p,t,'read',k*.9,1); return; }
    if(e.kind==='lie'){ const sk=p.skin; R(c,e.x-Math.round(14*k),e.y-3,Math.round(30*k),3,['#ff5a9a','#2ad0c8','#ffb040'][i%3]); R(c,e.x-Math.round(10*k),e.y-Math.round(6*k),Math.round(18*k),Math.max(2,Math.round(4*k)),sk); R(c,e.x-Math.round(4*k),e.y-Math.round(6*k),Math.round(8*k),Math.max(2,Math.round(4*k)),p.top); R(c,e.x+Math.round(8*k),e.y-Math.round(7*k),Math.max(2,Math.round(5*k)),Math.max(2,Math.round(5*k)),sk); R(c,e.x+Math.round(8*k),e.y-Math.round(8*k),Math.max(2,Math.round(5*k)),2,p.hair); return; }
    if(e.kind==='fish'){ personAt(c,e.x,e.y,p,t,'front',k,1); const rx=e.x+Math.round(6*k), ry=e.y-Math.round(50*k), tx=rx+Math.round(34*k), ty=ry-Math.round(16*k); line(c,rx,ry,tx,ty,'#3a2a1a'); const bob=Math.round(Math.sin(t*2+i)*1); line(c,tx,ty,tx+2,e.y+(e.line||16)+bob,'rgba(255,255,255,.4)'); P(c,tx+2,e.y+(e.line||16)+bob,'#ff3a3a');
      if(fr(t/20+i*.4)<.05){ R(c,tx,e.y+(e.line||16)-8,4,2,'#c8e8f0'); } return; }
    if(e.kind==='dance') { personAt(c,e.x,e.y,p,t,'dance',k,1); return; }
    if(e.kind==='stand') { personAt(c,e.x,e.y,p,t,'front',k,1); return; }
    if(e.kind==='cyclist'){ const L=(e.x1-e.x0), ph=(t*(e.speed||26)+i*97)%L, x=e.dir<0?e.x1-ph:e.x0+ph; bike(c,x,e.y,['#e0507a','#3a8ad8','#ffd24a'][i%3],e.dir||1,t,p.top,e.s); return; }
  }
  function people(c,sc,env,t,filter){ const L=sc.npcs; if(!L) return; L.forEach((e,i)=>{ if(filter&&!filter(e)) return; npc(c,e,i,t,env); }); }

  /* ======================= WATER ======================= */
  // sun / moon glitter column + drifting glints on a water band
  function water(c,sc,T,t,y0,y1,opts){
    opts=opts||{}; if(opts.clip){ c.save(); c.beginPath(); c.rect(opts.clip[0],y0,opts.clip[1]-opts.clip[0],y1-y0); c.clip(); }
    const sp=SKYX.pos(sc,T), body=(sp.sun.vis>.05)?sp.sun:(sp.moon.vis>.05?sp.moon:null);
    if(body){ const warm=body===sp.sun?(T.sun.low>.6?'#ffcf80':'#fff4d0'):'#e8ecff', vis=body.vis;
      for(let y=y0;y<y1;y+=2){ const d=(y-y0)/(y1-y0), w=4+d*opts.spread*(body===sp.sun?1:.6)||4+d*30, x=body.x+Math.sin(t*1.6+y*.9)*2*(1+d*3);
        if(fr(Math.sin(y*12.9898+Math.floor(t*3))*43758.5)<.6){ c.fillStyle=warm; c.globalAlpha=Math.min(1,vis*(.85-d*.5)); c.fillRect(Math.round(x-w/2+((y*7)%5)-2),y,Math.round(w*(.4+fr(y*.37)*.6)),1); c.globalAlpha=1; } } }
    const n=opts.glints||30; for(let i=0;i<n;i++){ const x=(i*61+t*(3+i%5)*(i%2?1:-1)%480+480)%480, y=y0+((i*29)%(y1-y0)); if(Math.sin(t*2.4+i*1.7)>.6) P(c,x,y,T.P.lamp>.6?'#9ab8e8':'#ffffff'); }
    if(opts.lights) opts.lights.forEach(([x,col])=>{ for(let y=y0;y<Math.min(y1,y0+30);y+=2){ if(Math.sin(t*3+y+x)>-.2) R(c,x+Math.sin(t*2+y*.6)*1.5,y,2,1,col); } });
    if(opts.clip) c.restore();
  }

  return { sky:(c,sc,T,t)=>aircraft(c,sc,T,t), front:(c,sc,T,t)=>flocks(c,sc,T,t), bird, perched, car, carFR, bike, dog, people, npc, water, look, personAt, SPEC };
})();
