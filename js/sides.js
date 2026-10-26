// Side panels: new content drawn past the left and right edges of every scene, so a pulled-back scene fills a wide window.
// Each scene has its own design below (walls, shelves and a second window in the apartment, more towers and shops downtown,
// the pier running on at the Keys, and so on). Colours are sampled from the scene's own art, the panels are relit for the
// time of day and go through the same 2x pipeline, glow and grade as the scene, so the seam does not show.
window.SIDES=(function(){
  const {R,P,mix,line,disc,ell,text,textW,rng,makeCanvas}=PX;
  const NS=()=>window.NEWSTYLE;
  const hex=n=>'#'+(n&0xffffff).toString(16).padStart(6,'0');

  /* ---------- sampling the scene's own art (night-authored, before relight) ---------- */
  function rawOf(sc,phase){
    const [cv,c]=makeCanvas(480,270), L=TOD.PAL[phase].lamp; SK.lit=L; SK.k=Math.max(.15,L); sc.build(c,phase); SK.lit=1; SK.k=1;
    const d=c.getImageData(0,0,480,270).data;
    return { at(x,y){ x=Math.max(0,Math.min(479,x|0)); y=Math.max(0,Math.min(269,y|0)); const i=(y*480+x)*4; return d[i+3]<8?null:(d[i]<<16|d[i+1]<<8|d[i+2]); } };
  }

  /* ---------- drawing kit in "distance from the scene edge" units: d=0 touches the scene, d grows outward ---------- */
  function kit(c,E,side,raw,seed){
    const g={ c, E, side, r:rng(seed), lit:SK.lit };
    g.X=(d,w)=>side>0?Math.round(d):Math.round(E-d-(w||1));
    g.sx=xc=>side<0?xc-E:480+xc;                                     // canvas x -> scene x
    g.S=(x,y,fb)=>{ const v=raw.at(x,y); return v==null?(fb||'#000000'):hex(v); };
    g.mode=(y,x0,x1)=>{ const m=new Map(); let best=null, bn=0; for(let x=x0;x<=x1;x++){ const v=raw.at(x,y); if(v==null) continue; const n=(m.get(v)||0)+1; m.set(v,n); if(n>bn){ bn=n; best=v; } } return best==null?null:hex(best); };
    g.rect=(d,y,w,h,col)=>R(c,g.X(d,w),y,w,h,col);
    g.px=(d,y,col)=>R(c,g.X(d,1),y,1,1,col);
    g.fill=(y0,y1,col)=>R(c,0,y0,E,y1-y0,col);
    g.rows=(y0,y1,x0,x1)=>{ for(let y=y0;y<y1;y++){ const col=g.mode(y,x0,x1); if(col) R(c,0,y,E,1,col); } };
    g.rowsEx=(y0,y1,a,b)=>{ for(let y=y0;y<y1;y++){ const m=new Map(); let best=null,bn=0; for(let x=0;x<480;x++){ if(x>=a&&x<=b) continue; const v=raw.at(x,y); if(v==null) continue; const n=(m.get(v)||0)+1; m.set(v,n); if(n>bn){ bn=n; best=v; } } if(best!=null) R(c,0,y,E,1,hex(best)); } };
    g.text=(s,d,y,col,sz)=>PX.text(c,s,g.X(d,textW(s,sz)),y,col,sz);
    g.palm=(d,base,h,lean,col,col2)=>PX.palm(c,g.X(d,1),base,h,lean,col,col2,0);
    g.glow=(d,y,r,col,k)=>SK.glow(c,g.X(d,1),y,r,col,k==null?.55:k);
    g.lamp=(d,top,base,pole,light)=>{ g.rect(d,top,1,base-top,pole); g.rect(d-1,top-1,3,2,light); if(g.lit>.3) g.glow(d,top+1,7,light,.5*g.lit); };
    g.skyline=(base,minH,maxH,minW,maxW,pal,sd,opts)=>SK.skyline(c,0,E,base,minH,maxH,minW,maxW,pal,sd,opts);
    // road markings continue in phase with the scene: scan a row of the scene for its dashes
    g.dashes=(y,h,x0,x1)=>{ const road=g.mode(y,x0,x1); if(!road) return; const rn=parseInt(road.slice(1),16), runs=[]; let s=-1, col=null;
      for(let x=x0;x<=x1+1;x++){ const v=x<=x1?raw.at(x,y):rn; const on=v!=null&&v!==rn&&Math.abs((v>>16&255)-(rn>>16&255))+Math.abs((v>>8&255)-(rn>>8&255))+Math.abs((v&255)-(rn&255))>90;
        if(on&&s<0){ s=x; col=v; } else if(!on&&s>=0){ runs.push([s,x-s]); s=-1; } }
      const full=runs.filter(([a,l])=>a>x0&&a+l<x1); if(full.length<2) return;
      const len=full[0][1], per=full[1][0]-full[0][0], ph=full[0][0], dc=hex(col);
      for(let xc=0;xc<E;xc++){ const m=(((g.sx(xc)-ph)%per)+per)%per; if(m<len) R(c,xc,y,1,h,dc); } };
    g.shimmer=(y0,y1,col,n)=>{ for(let i=0;i<n;i++){ const y=y0+Math.floor(g.r()*(y1-y0)), x=Math.floor(g.r()*E), w=2+Math.floor(g.r()*6); R(c,x,y,w,1,col); } };
    g.win=(d,y,w,h,on,litCol,dark)=>g.rect(d,y,w,h,on?litCol:dark);
    g.on=p=>g.r()<p*g.lit;
    return g;
  }

  /* ---------- shared pieces ---------- */
  function pastelBlock(g,d,w,top,base,col,seed){                 // Art Deco hotel with a window grid
    const r=rng(seed), dark=mix(col,'#1a1030',.55), lit='#ffe2a0';
    g.rect(d,top,w,base-top,col); g.rect(d,top,w,2,mix(col,'#ffffff',.35)); g.rect(d+(g.side>0?w-2:0),top,2,base-top,mix(col,'#000000',.25));
    g.rect(d+2,top-3,w-4,3,mix(col,'#ffffff',.15));
    for(let y=top+6;y<base-8;y+=9) for(let x=3;x<w-4;x+=7){ g.rect(d+x,y,4,4,r()<.3*g.lit?lit:dark); g.rect(d+x,y+4,4,1,mix(col,'#000000',.15)); }
    g.rect(d+Math.floor(w/2)-3,base-8,6,8,mix(col,'#2a1a30',.6));
  }
  function crowd(g,y0,y1,bg,seed){                                 // packed grandstand
    const r=rng(seed), cols=['#ff6aa8','#7ae0ff','#ffd36a','#a07aff','#7affb0','#ff8a5a','#ffffff','#5a7aff'];
    g.fill(y0,y1,bg);
    for(let y=y0+2;y<y1-1;y+=5){ R(g.c,0,y+3,g.E,1,mix(bg,'#000000',.35)); for(let x=r()*3|0;x<g.E;x+=3){ if(r()<.82){ const col=cols[r()*cols.length|0]; R(g.c,x,y,2,2,col); R(g.c,x,y+2,2,1,mix(col,'#000000',.4)); } } }
  }
  function pine(g,d,base,h,col){ for(let i=0;i<h;i++){ const w=Math.max(1,Math.round((i/h)*h*.45)); g.rect(d-Math.floor(w/2),base-h+i,w,1,col); } g.rect(d,base-2,1,3,mix(col,'#000000',.3)); }
  function boat(g,d,y,col,sail){ g.rect(d,y,22,3,col); g.rect(d+2,y+3,18,2,mix(col,'#000000',.35)); g.rect(d+10,y-18,1,18,'#d8d8e0'); if(sail){ for(let i=0;i<16;i++) g.rect(d+11,y-17+i,Math.round(i*.55),1,sail); } }
  function umbrella(g,d,base,col){ g.rect(d,base-16,1,16,'#e8e0d0'); for(let i=0;i<4;i++) g.rect(d-7+i,base-18+i,15-2*i,1,i%2?mix(col,'#ffffff',.4):col); }
  function bigWindow(g,d,w,y,h,seed){                              // window onto the night city, framed like the scene's own
    const frame='#1a1428';
    g.rect(d,y,w,h,'#0c0a22');
    const [cv,c]=makeCanvas(w,h); PX.grad(c,0,0,w,h,['#0a0820','#1a0e3a','#3a1650','#6a2260']);
    const r=rng(seed); for(let i=0;i<w*h/60;i++) R(c,r()*w|0,r()*h*.5|0,1,1,'#cfd6ff');
    SK.skyline(c,0,w,h-10,h*.35|0,h*.85|0,8,18,['#c23a7e','#7a3ab8','#4a2a8a','#e05a9a','#3a2a6a'],seed);
    R(c,0,h-10,w,10,'#0e0c1e'); for(let x=2;x<w;x+=9) R(c,x,h-6,4,1,'#ffd27a');
    g.c.drawImage(cv,g.X(d,w),y);
    g.rect(d,y,w,2,frame); g.rect(d,y+h-2,w,2,frame); g.rect(d,y,2,h,frame); g.rect(d+w-2,y,2,h,frame); g.rect(d+Math.floor(w/2)-1,y,2,h,frame);
    g.rect(d-4,y-6,w+8,3,'#2a2240');                                   // curtain rod
    g.rect(d-4,y-3,6,h+10,'#3a1e56'); g.rect(d+w-2,y-3,6,h+10,'#3a1e56');
    g.rect(d-3,y-3,1,h+10,'#4e2a70'); g.rect(d+w-1,y-3,1,h+10,'#4e2a70');
    g.rect(d-2,y+h+2,w+4,3,'#2a2240');
  }

  /* ---------- per-scene designs ---------- */
  const D={
    apartment(g){
      const ceil=g.S(130,12), trim=g.S(130,26), wall=g.S(146,120), base=mix(wall,'#000000',.35), floor=g.mode(262,40,140)||'#1a1430';
      const L=g.side<0, wallEnd=L?214:184;
      g.fill(0,26,ceil); g.fill(26,28,trim); g.fill(28,wallEnd,wall);
      for(let y=34;y<wallEnd;y+=22) g.fill(y,y+1,mix(wall,'#000000',.06));
      g.fill(wallEnd,wallEnd+4,base); g.fill(wallEnd+4,270,floor);
      for(let y=wallEnd+9;y<270;y+=7) g.fill(y,y+1,mix(floor,'#000000',.18));
      for(let d=34;d<g.E;d+=96){ g.rect(d,6,30,4,'#2a2440'); g.rect(d+3,8,24,2,'#fff1c8'); if(g.lit>.3) g.glow(d+15,10,14,'#ffe2a0',.35*g.lit); }
      if(L){
        // hallway door, switch, coat hooks, shoe bench, monstera, second window
        g.rect(10,104,38,110,mix(wall,'#ffffff',.12)); g.rect(13,107,32,107,'#4a2e3a'); g.rect(16,112,26,40,'#56343f'); g.rect(16,158,26,52,'#56343f'); g.rect(17,162,1,44,'#6a4250');
        g.rect(40,160,3,3,'#e8c060'); g.rect(55,150,4,6,'#e8e0f0'); g.rect(56,152,2,2,'#b8b0c8');
        g.rect(64,118,22,2,'#6a4a3a'); [66,73,80].forEach(x=>g.rect(x,120,2,3,'#c8a060')); g.rect(64,122,7,22,'#2a6a8a'); g.rect(76,122,8,18,'#a03a5a');
        g.rect(60,196,30,4,'#6a4a3a'); g.rect(61,200,2,14,'#4a3428'); g.rect(87,200,2,14,'#4a3428'); g.rect(63,206,8,4,'#e8e8f0'); g.rect(74,206,8,4,'#ff5a9a');
        g.rect(104,192,16,22,'#b8502e'); g.rect(104,192,16,3,'#d0663a');
        [[112,150,9],[103,162,8],[121,160,8],[110,170,7],[118,178,6],[100,178,6]].forEach(([x,y,r])=>{ ell(g.c,g.X(x,1),y,r,r*.6|0,'#2e8a4a'); ell(g.c,g.X(x,1)-1,y-1,r-3,(r*.6|0)-2,'#4ab868'); });
        g.rect(112,180,1,12,'#1e5a30');
        if(g.E>140) bigWindow(g,140,74,52,116,71);
        g.rect(138,170,78,4,'#2a2240');
      } else {
        // bookcase, record frame, guitar, second window
        g.rect(6,66,40,118,'#4a2e2a'); g.rect(8,68,36,114,'#2a1a1e');
        const bc=['#e05a8a','#5ac8e0','#f0c060','#8a6ae0','#60d090','#f08a5a','#e8e8f0'];
        for(let s=0;s<4;s++){ const y=72+s*28; g.rect(8,y+22,36,3,'#4a2e2a'); let x=10; while(x<42){ const w=2+(g.r()*3|0), h=12+(g.r()*9|0); g.rect(x,y+22-h,w,h,bc[g.r()*bc.length|0]); x+=w+(g.r()<.2?3:1); } }
        g.rect(20,56,10,10,'#b8502e'); ell(g.c,g.X(25,1),52,7,5,'#3a9a58');
        g.rect(58,60,34,34,'#e8e0d0'); g.rect(60,62,30,30,'#1a1426'); disc(g.c,g.X(75,1),77,12,'#0a0a12'); disc(g.c,g.X(75,1),77,4,'#ff5a9a'); disc(g.c,g.X(75,1),77,1,'#0a0a12');
        g.rect(100,176,14,2,'#2a2240'); ell(g.c,g.X(107,1),166,7,9,'#c8702e'); ell(g.c,g.X(107,1),166,3,3,'#2a1410'); g.rect(106,120,2,40,'#5a3a20'); g.rect(105,116,4,5,'#3a2414');
        if(g.E>130) bigWindow(g,128,80,46,122,93);
        g.rect(126,172,84,4,'#2a2240');
        g.rect(214,150,16,34,'#b8502e'); ell(g.c,g.X(222,1),136,10,14,'#2e8a4a'); ell(g.c,g.X(220,1),132,6,9,'#4ab868');
      }
    },
    downtown(g){
      const tower=['#c23a7e','#7a3ab8','#4a2a8a','#d8c8b0','#e05a9a','#3a2a6a','#9a4ac0'];
      g.skyline(152,40,128,14,30,tower,g.side<0?311:733,{lit:.4});
      const shopTop=150, shopBot=215, signs=['PIZZA','TACOS','VINYL','NOODLE','ARCADE','BOOKS','GYM','NAILS','LAUNDRY','KARAOKE','DONUTS','RAMEN'];
      const neon=['#ff5ab4','#5ae8ff','#ffd24a','#7aff9a','#c87aff','#ff8a4a'], body=g.S(100,190,'#1a1630');
      g.fill(shopTop,shopBot,'#120e22');
      let d=0, i=g.side<0?0:6;
      while(d<g.E){ const w=58+(g.r()*24|0), nc=neon[i%neon.length], sg=signs[i%signs.length];
        g.rect(d+3,shopTop+2,w-6,shopBot-shopTop-2,body);
        g.rect(d+5,shopTop+4,w-10,12,'#0e0a1a'); g.text(sg,d+5+Math.max(0,((w-10)-textW(sg,1))>>1),shopTop+7,nc);
        g.rect(d+3,shopTop+18,w-6,3,nc); g.rect(d+3,shopTop+21,w-6,1,mix(nc,'#000000',.4));
        g.rect(d+8,shopTop+27,w-16,32,g.lit>.3?'#ffe6a8':'#3a3a58'); for(let x=d+8;x<d+w-10;x+=10) g.rect(x+9,shopTop+27,1,32,mix(body,'#000000',.2));
        g.rect(d+w-18,shopTop+40,8,25,'#2a2238');
        if(g.lit>.3) g.glow(d+w/2,shopTop+19,16,nc,.35*g.lit);
        g.lamp(d+w+1,shopTop-10,shopBot,'#2a2840','#ffe6b0');
        d+=w+3; i++; }
      g.rows(215,270,180,300); g.dashes(247,2,0,479); g.dashes(262,1,0,479);
    },
    beach(g){
      g.rows(128,270,250,330);
      if(g.side<0){
        const pal=[g.S(20,140,'#f0a8c8'),g.S(60,130,'#8ee0c8'),g.S(110,140,'#f6e08a'),'#c8b0f0','#ffc8a0'];
        let d=0,k=0; while(d<g.E){ const w=34+(g.r()*14|0), top=88+(g.r()*26|0); pastelBlock(g,d,w,top,186,pal[k%pal.length],50+k); d+=w+2; k++; }
        g.text('DECO',22,118,'#ff6ab8'); g.palm(56,186,30,4,'#2a3a2a','#3a6a3a'); g.palm(140,186,34,-3,'#2a3a2a','#3a6a3a');
        g.rows(186,270,40,140);
        for(let d=20;d<g.E;d+=70) umbrella(g,d,252,['#ff5a9a','#5ae0ff','#ffd24a'][(d/70|0)%3]);
      } else {
        g.rect(0,156,g.E,3,'#5a3e2e'); g.rect(0,154,g.E,1,'#8a6a50');
        for(let d=4;d<g.E;d+=12) g.rect(d,159,2,17,'#3e2a20');
        for(let d=20;d<g.E;d+=40) g.lamp(d,144,154,'#6a5a6a','#ffe2a0');
        g.rows(176,270,250,330);
        for(let d=30;d<g.E;d+=60) umbrella(g,d,250,['#ffb04a','#5ae0ff','#ff5a9a'][(d/60|0)%3]);
        g.rect(80,236,12,4,'#ff6a9a'); g.rect(150,242,12,4,'#5ae0ff');
      }
      g.dashes(199,1,0,479);
    },
    keys(g){
      g.rows(128,270,300,330); g.shimmer(132,270,'#5ad0e8',g.E/2|0);
      if(g.side<0){
        const deck=g.S(100,195,'#8a5a32'), edge=g.S(100,199,'#5a3a20'), post=g.mode(240,40,200)||'#3a2414';
        g.fill(192,198,deck); g.fill(198,201,edge); for(let x=0;x<g.E;x+=6) R(g.c,x,192,1,6,mix(deck,'#000000',.2));
        for(let d=10;d<g.E;d+=34) g.rect(d,201,4,69,'#4a2e1a');
        for(let d=40;d<g.E;d+=96) g.lamp(d,160,192,'#2a2030','#ffe2a0');
        g.rect(70,184,16,8,'#7a4a2a'); g.rect(70,184,16,2,'#a06a3a');
        ell(g.c,g.X(120,1),131,26,3,'#2a5a3a'); ell(g.c,g.X(120,1),130,18,2,'#3a7a4a');
        boat(g,150,216,'#e8e8f0','#ffb86a');
      } else {
        // a second hut on stilts, buoys, a moored sailboat
        const thatch=g.S(380,120,'#c89a4a'), wood=g.S(390,150,'#7a4a2a');
        for(let i=0;i<24;i++) g.rect(40+i,118-i*.9,60-2*i,1,i%3?thatch:mix(thatch,'#000000',.2));
        g.rect(46,118,48,22,wood); [52,62,72,82].forEach(x=>g.rect(x,124,6,8,g.lit>.3?'#ffcf5a':'#3a2a1a'));
        g.rect(40,140,60,3,'#5a3a20'); for(let d=44;d<100;d+=11) g.rect(d,143,3,50,'#4a2e1a');
        if(g.lit>.3) g.glow(70,128,20,'#ffb050',.35*g.lit);
        [[130,200],[190,186]].forEach(([d,y])=>{ g.rect(d,y,3,5,'#e84a4a'); g.rect(d,y+5,3,2,'#ffffff'); });
        boat(g,150,170,'#f0f0f8','#ffffff');
        ell(g.c,g.X(200,1),130,30,3,'#2a5a3a'); g.palm(196,129,12,2,'#1e3a24','#2e5a34');
      }
    },
    grassrivers(g){
      g.rows(100,270,200,280);
      const crown=g.S(240,80,'#14243a'), moss='#3a5a4a';
      for(let d=8;d<g.E;d+=38+(g.r()*20|0)){ const y=60+(g.r()*20|0);
        g.rect(d-1,y,3,128-y,'#0e1a26'); [[0,0,16,10],[-10,6,11,7],[11,5,12,8]].forEach(([dx,dy,rx,ry])=>ell(g.c,g.X(d+dx,1),y+dy,rx,ry,crown));
        for(let k=0;k<5;k++) g.rect(d-10+k*5,y+6,1,8+(g.r()*12|0),moss);
        if(g.r()<.6){ const rx=g.X(d,1); for(let k=-3;k<=3;k++) line(g.c,rx,140,rx+k*4,158,'#0e1a26'); g.rect(d,128,1,14,'#0e1a26'); } }
      for(let i=0;i<g.E/5;i++){ const d=g.r()*g.E|0, y=150+(g.r()*110|0); ell(g.c,g.X(d,1),y,3,1,g.r()<.5?'#2e7a3a':'#4aa058'); }
      for(let i=0;i<g.E/7;i++){ const d=g.r()*g.E|0, y=200+(g.r()*60|0), h=8+(g.r()*22|0); g.rect(d,y-h,1,h,'#1a3a24'); if(g.r()<.5) g.rect(d,y-h,2,4,'#4a2a1a'); }
      if(g.side<0){ const deck=g.S(60,193,'#6a4a2a'); g.fill(190,196,deck); for(let d=6;d<g.E;d+=28) g.rect(d,196,3,32,'#3a2414'); g.rect(30,180,10,10,'#3a7ae0'); }
      else { g.rect(60,150,2,12,'#e8e8f0'); g.rect(58,148,6,4,'#ffffff'); g.rect(62,146,4,1,'#e8c060'); }
    },
    gellhorn(g){
      g.rows(200,270,100,300);
      for(let d=-10;d<g.E;d+=38){ const x0=g.X(d,1); line(g.c,x0,270,x0+(g.side<0?-1:1)*12,215,'#c8a83a'); }
      for(let d=60;d<g.E;d+=170){ g.rect(d,34,3,166,'#1a1426'); g.rect(d-14,44,31,2,'#1a1426'); }
      for(let y of [46,52]) for(let x=0;x<g.E;x++) R(g.c,x,y+Math.round(3*Math.sin((x/170)*Math.PI)),1,1,'#120e1e');
      if(g.side<0){
        g.rect(14,150,90,50,'#2a2236'); g.rect(14,146,90,4,'#3a3048'); g.rect(26,160,18,26,g.lit>.3?'#ffd890':'#2a2a3a'); g.rect(60,164,34,22,'#16121e');
        g.rect(38,128,46,14,'#0e0a14'); g.text('LIQUOR',44,132,'#ff4a6a'); if(g.lit>.3) g.glow(60,135,22,'#ff4a6a',.45*g.lit);
        g.palm(124,200,44,5,'#120e18','#1a1626'); g.lamp(150,150,200,'#2a2840','#ffe2a0');
      } else {
        g.skyline(200,24,62,16,30,['#1a1830','#22203a','#2a2440','#16142a'],877,{lit:.25});
        g.rect(80,96,4,104,'#2a2238'); g.rect(60,80,44,18,'#0e0a14'); g.text('VACANCY',62,86,'#ff5ab4'); if(g.lit>.3) g.glow(82,89,24,'#ff5ab4',.45*g.lit);
      }
    },
    ambrosia(g){
      g.rows(138,270,150,330);
      const hill=g.S(150,146,'#3a2a4a');
      for(let x=0;x<g.E;x++){ const h=6+Math.round(4*Math.sin(x*.07)+3*Math.sin(x*.023+1)); R(g.c,x,150-h,1,h,hill); }
      for(let x=0;x<g.E;x+=3) R(g.c,x,141,1,9,'#2a2236'); g.fill(141,142,'#2a2236');
      g.dashes(181,1,0,479);
      const fur=mix(g.mode(240,150,330)||'#4a7a2a','#ffffff',.25);
      for(let k=1;k<12;k++){ const bx=(g.side<0?-1:1)*k*55+240; const x0=bx-g.sx(0), xv=240-g.sx(0); for(let y=186;y<270;y++){ const t=(y-170)/100, x=Math.round(xv+(x0-xv)*t); if(x>=0&&x<g.E) R(g.c,x,y,1,1,fur); } }
      if(g.side<0){ [[20,30,70],[60,26,60],[100,34,80]].forEach(([d,w,h])=>{ g.rect(d,150-h,w,h,'#d8d8e8'); ell(g.c,g.X(d+w/2,1),150-h,w/2,3,'#ececf6'); g.rect(d+w-3,150-h,3,h,'#a8a8c0'); }); g.rect(150,128,30,22,'#3a3048'); g.rect(156,134,6,4,g.lit>.3?'#ffd27a':'#2a2236'); }
      else { [[10,30,40],[46,26,52],[90,40,36]].forEach(([d,w,h])=>{ g.rect(d,150-h,w,h,'#d0d0e0'); for(let y=150-h+6;y<148;y+=8) g.rect(d,y,w,1,'#a8a8c0'); }); for(let i=0;i<70;i++){ const y=150-i; g.rect(170-Math.round(i*.12),y,1,1,'#5a4a6a'); g.rect(186+Math.round(i*.12),y,1,1,'#5a4a6a'); if(i%8===0) g.rect(170-Math.round(i*.12),y,17+Math.round(i*.24)-0,1,'#5a4a6a'); } }
    },
    kalaga(g){
      const ridge=g.S(240,125,'#1e2a4e'), rim='#5a78c8', forest=g.mode(175,0,400)||'#0e1e22', grass=g.mode(240,0,300)||'#0e1a14';
      for(let x=0;x<g.E;x++){ const sx=g.sx(x), h=Math.round(28+14*Math.sin(sx*.021)+8*Math.sin(sx*.057+2)+4*Math.sin(sx*.13)); R(g.c,x,150-h,1,h,ridge); P(g.c,x,150-h,rim); }
      g.rows(146,270,40,400);
      for(let d=6;d<g.E;d+=9+(g.r()*10|0)) pine(g,d,160+(g.r()*24|0),14+(g.r()*16|0),'#0a1618');
      for(let i=0;i<g.E;i++){ const d=g.r()*g.E|0, y=152+(g.r()*48|0); g.px(d,y,'#1e3a3a'); }
      if(g.side<0){ g.rect(60,236,24,3,'#5a3a1e'); g.rect(64,232,18,3,'#6a4a2a'); g.rect(110,220,2,24,'#6a4a2a'); g.rect(104,216,14,6,'#7a5a3a'); }
      else { g.rect(40,218,14,26,'#5a3a24'); g.rect(38,214,18,5,'#3a2414'); g.rect(45,226,4,6,g.lit>.3?'#ffcf5a':'#2a1a10'); ell(g.c,g.X(110,1),246,22,3,'#8a3a2a'); }
    },
    oceandrive(g){
      if(g.side<0){
        const wall=g.S(20,150,'#f0a8c8'), dark=mix(wall,'#1a1030',.6);
        for(let d=0;d<g.E;d++){ const top=Math.round(56-.42*d), bot=Math.round(232+.32*d); g.rect(d,top,1,bot-top,wall); g.rect(d,bot,1,270-bot,'#0a0812'); }
        for(let row=0;row<10;row++) for(let d=8;d<g.E;d+=16){ const top=56-.42*d, bot=232+.32*d, y=Math.round(top+8+row*(bot-top-16)/10), h=Math.round((bot-top)/16); g.rect(d,y,9,h,g.r()<.3*g.lit?'#ffe2a0':dark); }
        g.rect(40,40,10,80,'#1a1026'); g.text('H',42,50,'#ff6ab8'); g.text('O',42,62,'#ff6ab8'); g.text('T',42,74,'#ff6ab8'); g.text('E',42,86,'#ff6ab8'); g.text('L',42,98,'#ff6ab8');
      } else {
        g.rows(140,150,330,479); g.rows(150,270,400,479);
        for(let d=20;d<g.E;d+=46) umbrella(g,d,200+(d%3)*20,['#ff5a9a','#5ae0ff','#ffd24a'][(d/46|0)%3]);
        g.palm(10,190,40,-6,'#1a3a24','#2e6a3a'); g.palm(120,200,46,6,'#1a3a24','#2e6a3a');
        g.rect(70,226,30,1,'#e8e8f0'); g.rect(70,218,1,9,'#e8e8f0'); g.rect(99,218,1,9,'#e8e8f0');
      }
    },
    harbor(g){
      g.skyline(136,6,40,8,18,['#1a1e4a','#22285a','#2a2a6a','#1a1a3a'],g.side<0?401:409,{lit:.45});
      g.rows(136,270,150,300);
      g.shimmer(140,198,'#3a4aa0',g.E/3|0);
      if(g.side<0){ g.fill(116,119,'#3a3a5a'); g.rect(70,62,4,56,'#6a6a8a'); for(let k=1;k<=10;k++){ line(g.c,g.X(72,1),64,g.X(72-k*6,1),117,'#7a7aa0'); line(g.c,g.X(72,1),64,g.X(72+k*6,1),117,'#7a7aa0'); } }
      else { for(let c0 of [30,110]){ g.rect(c0,62,46,3,'#c83a3a'); g.rect(c0+8,62,3,74,'#a02a2a'); g.rect(c0+30,62,3,74,'#a02a2a'); for(let y=70;y<136;y+=12){ line(g.c,g.X(c0+8,1),y,g.X(c0+33,1),y+12,'#a02a2a'); } }
        for(let d=170;d<g.E;d+=20) g.rect(d,120,16,16,['#3a6ac8','#c84a3a','#e8a83a'][(d/20|0)%3]); }
      for(let d=30;d<g.E;d+=110){ g.rect(d,232,22,2,'#6a4a2a'); g.rect(d+2,234,1,6,'#4a3420'); g.rect(d+19,234,1,6,'#4a3420'); }
      for(let d=70;d<g.E;d+=110) g.lamp(d,206,236,'#3a3858','#ffe2a0');
    },
    lake(g){
      g.rows(150,270,g.side<0?0:410,g.side<0?70:479);
      const pal=g.side<0?[g.S(60,100,'#8a3a2a'),g.S(100,100,'#7a3426'),g.S(20,110,'#9a4a32')]:[g.S(400,100,'#7a6070'),g.S(440,110,'#8a6a7a'),g.S(330,110,'#6a5468')];
      g.skyline(150,40,92,22,36,pal,g.side<0?515:519,{lit:.45,winCols:['#ffd890','#ffe8b0']});
      for(let d=30;d<g.E;d+=90) g.lamp(d,158,196,'#2a2840','#ffe2a0');
      if(g.side>0){ g.rect(40,52,8,48,'#1a1020'); ['C','A','F','E'].forEach((ch,i)=>g.text(ch,42,56+i*11,'#ff5a9a')); if(g.lit>.3) g.glow(44,76,18,'#ff5a9a',.4*g.lit); }
      else { g.rect(60,180,26,16,'#3a5a3a'); g.rect(62,182,22,12,g.lit>.3?'#ffe6a8':'#2a3a2a'); }
      for(let y=204;y<270;y+=9) for(let x=(y/9|0)%2*12;x<g.E;x+=24) R(g.c,x,y,1,9,'#2a2638');
    },
    airport(g){
      g.rows(140,270,150,250);
      g.skyline(140,4,16,6,12,['#1a1a3a','#22224a'],611,{lit:.4});
      for(let d=10;d<g.E;d+=30) g.palm(d,140,10+(g.r()*6|0),1,'#0e1a1e','#1a3a2a');
      if(g.side<0){ g.rect(20,126,110,52,'#1e1e30'); for(let i=0;i<14;i++) g.rect(20+i*2,126-Math.round(Math.sin(i/13*Math.PI)*0),110-i*4,1,'#2a2a40'); for(let d=24;d<130;d+=10) g.rect(d,128,1,50,'#2a2a44'); g.text('HANGAR 2',48,118,'#c8c8e0');
        [[150,26],[184,20]].forEach(([d,w])=>{ g.rect(d,156,w,22,'#c8c8d8'); ell(g.c,g.X(d+w/2,1),156,w/2,3,'#e0e0ec'); }); }
      else { g.rect(0,120,Math.min(g.E,150),58,'#2a3a6a'); for(let d=4;d<Math.min(g.E,150);d+=8) g.rect(d,124,6,48,g.lit>.3?'#6ab0e8':'#3a5a8a'); g.rect(0,118,Math.min(g.E,150),3,'#8a9ac0');
        if(g.E>160){ g.rect(170,140,60,38,'#3a3a4a'); for(let y=146;y<178;y+=8) g.rect(170,y,60,1,'#2a2a38'); g.text('P',196,128,'#5ae0ff'); } }
      g.dashes(182,1,0,479); g.dashes(225,2,0,479);
      for(let d=6;d<g.E;d+=16){ g.px(d,203,'#ffe8a0'); g.px(d,248,'#ffe8a0'); }
    },
    reef(g){
      g.rows(0,270,200,300);
      const cols=['#ff6a8a','#ffb04a','#5ae8d0','#c87aff','#ffe05a','#ff5ab4','#6ab0ff'];
      for(let i=0;i<g.E/7;i++){ const d=g.r()*g.E|0, base=230+(g.r()*40|0), col=cols[g.r()*cols.length|0], k=g.r();
        if(k<.3){ for(let b=0;b<5;b++){ const x=g.X(d,1); line(g.c,x,base,x+(b-2)*4,base-12-(g.r()*12|0),col); } }
        else if(k<.55){ ell(g.c,g.X(d,1),base-4,8,5,col); ell(g.c,g.X(d,1)-1,base-6,5,3,mix(col,'#ffffff',.3)); }
        else if(k<.8){ for(let t=0;t<3;t++) g.rect(d+t*4,base-10-(t*5),3,10+t*5,col); }
        else { for(let a=0;a<12;a++) line(g.c,g.X(d,1),base,g.X(d,1)+Math.round(Math.cos(a/11*Math.PI)*12),base-Math.round(Math.sin(a/11*Math.PI)*12),col); } }
      for(let i=0;i<g.E/40;i++){ const d=g.r()*g.E|0; ell(g.c,g.X(d,1),250,14,6,'#1a2a3a'); }
      for(let i=0;i<g.E/30;i++){ const d=g.r()*g.E|0, y=60+(g.r()*120|0); g.rect(d,y,4,2,['#ffb04a','#5ae8d0','#ffe05a'][i%3]); g.px(d+(g.side>0?4:-1),y,'#ffffff'); }
    },
    pier(g){
      g.rows(148,270,0,479);
      if(g.side<0){
        for(let d=20;d<g.E;d+=60) umbrella(g,d,248-(d%2)*10,['#5ae0ff','#ff5a9a','#ffd24a'][(d/60|0)%3]);
        g.palm(40,212,46,4,'#1a2a24','#2e5a3a'); g.palm(150,214,52,-5,'#1a2a24','#2e5a3a');
        g.rect(90,232,40,1,'#e8e8f0'); g.rect(90,222,1,12,'#e8e8f0'); g.rect(129,222,1,12,'#e8e8f0');
        g.rect(196,240,12,4,'#ff8a4a'); g.rect(190,236,4,8,'#d8b080');
      } else {
        const deck=g.S(400,167,'#5a3e2e'), rail=g.S(400,162,'#c8c0d0');
        g.fill(165,170,deck); g.fill(162,163,rail); for(let x=0;x<g.E;x+=4) R(g.c,x,162,1,3,rail);
        for(let d=6;d<g.E;d+=16) g.rect(d,170,2,38,'#2a1e1a');
        const stalls=[['GAMES','#5ae0ff'],['FRIES','#ffd24a'],['ICE','#ff5ab4']];
        stalls.forEach(([s,cl],i)=>{ const d=20+i*44; if(d+36>g.E) return; g.rect(d,148,34,14,'#ffe6c8'); for(let x=0;x<34;x+=6) g.rect(d+x,144,3,4,cl); g.rect(d,144,34,1,'#ffffff'); g.text(s,d+3,151,mix(cl,'#000000',.4)); });
        for(let d=150;d<g.E;d+=40) g.lamp(d,146,162,'#4a4058','#ffe2a0');
        for(let x=0;x<Math.min(g.E,120);x++){ const y=Math.round(110+40*Math.cos(x/120*Math.PI*1.5)); g.px(x,y,'#e8e8f8'); if(x%10===0) g.rect(x,y,1,162-y,'#8a8aa0'); }
      }
    },
    speedway(g){
      const roof=g.S(240,92,'#3a3450'), bg=g.mode(150,0,480)||'#1a1428';
      g.fill(90,95,roof); crowd(g,95,175,bg,g.side<0?17:19);
      for(let d=50;d<g.E;d+=130){ g.rect(d,30,2,60,'#3a3a4a'); g.rect(d-7,24,16,6,'#2a2a3a'); for(let i=0;i<4;i++) g.rect(d-6+i*4,25,3,3,'#ffffff'); if(g.lit>.3) g.glow(d,27,26,'#fff6d0',.55*g.lit); }
      const ads=[['VICE OIL','#ff5a6a'],['LEONIDA','#5ae0ff'],['TURBO','#ffd24a'],['SUNDOWN','#ff8a4a'],['CRYSTAL','#c8c8ff']];
      g.fill(175,186,'#0e0a18'); let d=2,i=g.side<0?0:2; while(d<g.E){ const [s,cl]=ads[i%ads.length], w=textW(s,1)+10; g.rect(d,177,w,8,'#1a1428'); g.rect(d,177,w,1,cl); g.text(s,d+5,179,cl); d+=w+3; i++; }
      for(let x=0;x<g.E;x+=4) R(g.c,x,186,2,2,(x/4|0)%2?'#e83a3a':'#ffffff');
      g.rows(188,270,100,400); g.dashes(250,1,0,479);
    },
    hamlet(g){
      g.rows(180,270,230,250);
      for(let d=50;d<g.E;d+=150){ g.rect(d,90,2,92,'#1a1426'); g.rect(d-10,96,22,2,'#1a1426'); }
      for(let y of [98,104]) for(let x=0;x<g.E;x++) R(g.c,x,y+Math.round(3*Math.sin((x/150)*Math.PI)),1,1,'#120e1e');
      if(g.side<0){
        g.rect(40,120,3,60,'#2a2236'); g.rect(80,120,3,60,'#2a2236'); g.rect(26,90,72,32,'#e8e0d0'); g.rect(28,92,68,28,'#2a1e3a');
        g.text('LEONIDA',34,96,'#ffd24a'); g.text('BBQ 5 MI',34,106,'#ff6a5a'); if(g.lit>.3) g.glow(62,106,30,'#ffd24a',.3*g.lit);
        for(let i=0;i<g.E/14;i++){ const d=g.r()*g.E|0; ell(g.c,g.X(d,1),182,6,3,'#141e1a'); }
        g.palm(130,182,44,4,'#120e18','#1a2a20');
      } else {
        g.rect(20,140,90,42,'#2a2638'); g.rect(20,136,90,4,'#3a3448'); g.rect(30,150,30,22,g.lit>.3?'#ffe6a8':'#2a2a3a'); g.rect(70,152,14,30,'#16121e');
        g.rect(40,124,52,12,'#0e0a14'); g.text('LIQUOR',48,127,'#5ae0ff'); if(g.lit>.3) g.glow(66,130,24,'#5ae0ff',.4*g.lit);
        g.rect(124,170,6,12,'#3a3a48'); g.palm(160,182,46,-4,'#120e18','#1a2a20');
      }
      g.dashes(250,2,0,479);
    },
    rooftop(g){
      g.skyline(162,24,96,10,24,['#3a2a6a','#4a3a8a','#2a2458','#5a3a7a','#6a4a8a'],g.side<0?171:173,{lit:.45});
      const rail=g.S(240,160,'#e8e8f0');
      g.fill(158,160,rail); for(let x=0;x<g.E;x+=5) R(g.c,x,160,1,8,rail); g.fill(166,168,mix(rail,'#000000',.3));
      g.rowsEx(168,270,120,345);
      for(let y=180;y<270;y+=14) g.fill(y,y+1,'#2a2638');
      if(g.side<0){ umbrella(g,40,200,'#ffd24a'); g.rect(20,220,30,4,'#ffffff'); g.rect(20,224,30,2,'#ff5a9a'); g.rect(100,205,14,14,'#b8502e'); g.palm(107,206,30,2,'#1e5a30','#3a8a4a'); }
      else { g.rect(30,200,60,26,'#d8d8e8'); g.rect(34,204,52,18,'#3ad0e8'); g.rect(34,204,52,2,'#8af0ff'); umbrella(g,120,210,'#5ae0ff'); g.rect(150,220,30,4,'#ffffff'); g.rect(150,224,30,2,'#5ae0ff'); }
    },
    sunsetkey(g){
      g.rows(140,270,250,350);
      for(let d=30;d<g.E;d+=150){ ell(g.c,g.X(d+30,1),143,36,3,'#1a2a2a'); for(let k=0;k<4;k++) g.palm(d+10+k*14,142,10+(k%2)*3,1,'#14201e','#1e3a2a'); }
      const deck=g.S(240,208,'#7a5a3a');
      g.fill(205,211,deck); for(let x=0;x<g.E;x+=8) R(g.c,x,205,1,6,mix(deck,'#000000',.25)); for(let d=10;d<g.E;d+=40) g.rect(d,211,4,30,'#3a2a1e');
      g.fill(252,257,deck); for(let d=20;d<g.E;d+=48) g.rect(d,257,4,13,'#3a2a1e');
      for(let d=30;d<g.E;d+=90) boat(g,d,198,'#f0f0f8',(d/90|0)%2?'#ffffff':null);
      for(let d=70;d<g.E;d+=90) g.lamp(d,190,205,'#2a2030','#ffd27a');
      g.shimmer(150,250,'#3a4aa8',g.E/3|0);
    }
  };

  /* ---------- build the panels for a scene: still center + left/right panels + top/bottom bands ---------- */
  function render480(sc,T,weather,opt,low){
    const out=document.createElement('canvas'); out.width=960; out.height=540; const o=out.getContext('2d');
    const hold=FX.hi[sc.id], pend=WX.pending, skip=WX.skip; delete FX.hi[sc.id]; WX.pending=null; WX.skip=true; NS().building=true;
    try{ FX.render(o,low,5,sc,weather,opt,T); } finally{ if(hold) FX.hi[sc.id]=hold; WX.pending=pend; WX.skip=skip; NS().building=false; }
    return out;
  }
  function sideCanvas(sc,T,weather,opt,raw,side,E){
    const phase=T.a, L=TOD.PAL[phase].lamp, [mc,m]=makeCanvas(E,270);
    SK.lit=L; SK.k=Math.max(.15,L);
    try{ (D[sc.id]||(()=>{}))(kit(m,E,side,raw,(side<0?101:203)+sc.id.length*7)); } finally{ SK.lit=1; SK.k=1; }
    TOD.relight(m,phase,sc.relight==null?1:sc.relight);
    const [lc,low]=makeCanvas(480,270); low.fillStyle='#000'; low.fillRect(0,0,480,270);
    low.drawImage(SKYX.gradientCanvas(sc,T.a),0,0);
    const ox=side<0?480-E:0;
    if(!sc.under&&T.P.stars>.05){ const r=rng(side<0?7:9), hz=(sc.sky.horizon||140)-12; low.fillStyle='#cfd6ff';
      for(let i=0;i<E*hz/90*T.P.stars;i++){ low.globalAlpha=.4+.6*r(); low.fillRect(ox+(r()*E|0),r()*hz|0,1,1); } low.globalAlpha=1; }
    if(!sc.under) SKYX.overcast(low,sc,T);
    low.drawImage(mc,ox,0);
    const hi=render480(sc,T,weather,opt,low), [sc2,s2]=makeCanvas(2*E,540);
    s2.drawImage(hi,2*ox,0,2*E,540,0,0,2*E,540);
    return sc2;
  }
  function stillCenter(sc,T,weather,opt){
    const [lc,low]=makeCanvas(480,270); low.fillStyle='#000'; low.fillRect(0,0,480,270);
    low.drawImage(SKYX.gradientCanvas(sc,T.a),0,0);
    if(!sc.under){ SKYX.overcast(low,sc,T); SKYX.stars(low,sc,T,5); SK.k=1; SKYX.celestial(low,sc,T,5); }
    const raw=rawOf(sc,T.a), [bc,b]=makeCanvas(480,270), L=TOD.PAL[T.a].lamp; SK.lit=L; SK.k=Math.max(.15,L); sc.build(b,T.a); SK.lit=1; SK.k=1;
    TOD.relight(b,T.a,sc.relight==null?1:sc.relight); low.drawImage(bc,0,0);
    return { hi:render480(sc,T,weather,opt,low), raw };
  }
  // top and bottom bands: each column carries the colour of the picture's first/last row on and fades to the dark of the window edge
  function bands(ctx,W,V){
    if(V<=0) return; const H=ctx.canvas.height, id=ctx.getImageData(0,0,W,H), d=id.data, r=rng(5);
    for(let x=0;x<W;x++){
      const t0=(2*V*W+x)*4, b0=((H-2*V-1)*W+x)*4;
      for(let y=0;y<2*V;y++){ const k=(2*V-y)/(2*V); const i=(y*W+x)*4; const f=1-.55*k;
        d[i]=d[t0]*f+5*(1-f); d[i+1]=d[t0+1]*f+3*(1-f); d[i+2]=d[t0+2]*f+15*(1-f); d[i+3]=255;
        const j=((H-1-y)*W+x)*4, kb=(2*V-y)/(2*V), fb=1-.6*kb; d[j]=d[b0]*fb+5*(1-fb); d[j+1]=d[b0+1]*fb+3*(1-fb); d[j+2]=d[b0+2]*fb+15*(1-fb); d[j+3]=255; }
    }
    ctx.putImageData(id,0,0);
  }
  const cache={}, order=[];
  const up=v=>Math.min(240,Math.ceil(Math.max(v,0)/16)*16+8);
  function build(sc,T,weather,opt,E,V){
    const {hi,raw}=stillCenter(sc,T,weather,opt);
    const W=960+4*E, H=540+4*V, [cv,c]=makeCanvas(W,H);
    c.drawImage(hi,2*E,2*V);
    if(E>0){ c.drawImage(sideCanvas(sc,T,weather,opt,raw,-1,E),0,2*V); c.drawImage(sideCanvas(sc,T,weather,opt,raw,1,E),2*E+960,2*V); }
    bands(c,W,V);
    return { cv, l:E, r:E, t:V, b:V };
  }
  // panels covering at least l/r/t/b low-res pixels around the scene, built on first use and kept per scene and time of day
  function get(sc,T,weather,opt,l,r,t,b){
    const E=up(Math.max(l,r)), V=Math.min(120,up(Math.max(t,b))), key=sc.id+'|'+T.a+'|'+weather;
    let have=cache[key];
    if(!have||have.l<E||have.t<V){
      try{ have=cache[key]=build(sc,T,weather,opt,Math.max(E,have?have.l:0),Math.max(V,have?have.t:0)); }
      catch(e){ console.warn('sides',sc.id,e); return null; }
      order.push(key); while(order.length>8){ const k=order.shift(); if(k!==key) delete cache[k]; }
    }
    return have;
  }
  return { get, D };
})();
