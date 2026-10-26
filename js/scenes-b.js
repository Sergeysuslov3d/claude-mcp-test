// Scenes 5-8: Grassrivers, Port Gellhorn, Ambrosia, Mount Kalaga. Original pixel art.
(function(){
  const {R,P,rng,mix,line,disc,ell,grad,dither,text,textW,palm} = PX;

  /* ========================= GRASSRIVERS ========================= */
  (function(){
    const S={};
    function mangrove(c,x,base,h,col,r){
      // trunk + stilt roots + blobby canopy + hanging moss
      R(c,x-1,base-h,3,h,col);
      for(let i=0;i<5;i++){ const dx=(i-2)*5; line(c,x,base-h*.4,x+dx*1.6,base,col); }
      for(let i=0;i<6;i++) disc(c,x+Math.round((r()-.5)*34),base-h+Math.round((r()-.7)*10),6+Math.round(r()*7),col);
      for(let i=0;i<7;i++){ const mx=x+Math.round((r()-.5)*40), my=base-h+4; R(c,mx,my,1,6+Math.round(r()*14),mix(col,'#6a8a6a',.3)); }
    }
    function build(c){
      const r=rng(21);
      c.clearRect(0,0,480,120); S.stars=[];
      // far tree line
      for(let x=0;x<480;x+=14) disc(c,x,116+Math.round(Math.sin(x*.11)*3),9+(x%3)*2,'#1c2a46');
      R(c,0,118,480,14,'#1c2a46');
      for(let x=24;x<480;x+=70) mangrove(c,x,130,34+(x%25),'#16223c',r);
      // water
      grad(c,0,128,480,142,['#d08a6a','#6a5a7e','#2e4a60','#143444','#0a2230']);
      // lily pads
      for(let i=0;i<46;i++){ const x=Math.floor(r()*480), y=146+Math.floor(r()*110); ell(c,x,y,3+Math.round(r()*3),1+Math.round(y/130),'#2a6a3a'); if(r()<.2) P(c,x,y-1,'#ff9ac8'); }
      // mid mangroves
      for(const [x,h] of [[40,58],[150,70],[300,62],[430,74]]) mangrove(c,x,160,h,'#0e1a2e',r);
      // boardwalk on stilts with an airboat-tours sign, rope rail and a cooler
      R(c,0,192,128,5,'#6a4a30'); R(c,0,192,128,1,'#9a7a50'); for(let x=0;x<128;x+=8) R(c,x,193,1,4,'#4a3220');
      for(let x=4;x<128;x+=20){ R(c,x,197,3,30,'#3a2818'); R(c,x,180,2,12,'#4a3220'); } for(let x=0;x<128;x+=2) P(c,x,182+Math.round(Math.sin(x*.16)*1.5+1.5),'#c8a870');
      R(c,70,150,52,22,'#e8d8b0'); R(c,70,150,52,2,'#fff4d8'); R(c,72,152,48,18,'#2a6a4a'); text(c,'AIRBOAT',76,154,'#ffe8b0',1); text(c,'TOURS',82,162,'#ffd24a',1); R(c,80,172,2,20,'#3a2818'); R(c,110,172,2,20,'#3a2818');
      R(c,20,184,12,8,'#3a8ad8'); R(c,20,184,12,2,'#e8f0ff'); R(c,40,186,6,6,'#d83a3a'); P(c,42,185,'#ffd24a');
      // a half-sunk old skiff and cypress knees
      c.fillStyle='#5a4a3a'; c.beginPath(); c.moveTo(196,214); c.lineTo(236,206); c.lineTo(240,212); c.lineTo(200,220); c.closePath(); c.fill(); line(c,198,214,236,207,'#8a6a4a'); R(c,220,200,1,8,'#3a2a1a');
      for(let i=0;i<14;i++){ const x=150+Math.floor(r()*300), y=176+Math.floor(r()*70); R(c,x,y-4-Math.floor(r()*4),3,6,'#1a1410'); P(c,x+1,y-6,'#3a2a1a'); }
      // water hyacinth clumps with lilac flowers
      for(let i=0;i<10;i++){ const x=Math.floor(r()*480), y=186+Math.floor(r()*70); ell(c,x,y,7,2,'#2a7a3a'); ell(c,x-3,y-1,3,2,'#3a9a4a'); for(let k=0;k<3;k++) P(c,x-3+k*3,y-3,['#c89aff','#e8b8ff','#a87ae8'][k]); }
      // heron nest high in a mangrove
      ell(c,432,94,9,3,'#3a2a1a'); R(c,430,88,3,5,'#e8e4f0'); R(c,432,85,2,4,'#e8e4f0'); R(c,433,85,4,1,'#ffd24a');
      // foreground reeds
      for(let i=0;i<40;i++){ const x=Math.floor(r()*480), h=26+Math.floor(r()*40), l=Math.round((r()-.5)*8); line(c,x,270,x+l,270-h,'#0a1a14'); if(r()<.4) R(c,x+l-1,270-h-5,3,7,'#2a1a14'); }
    }
    const flam=[{x:156,y:214,ph:0},{x:330,y:222,ph:2},{x:372,y:206,ph:4}];
    const flies=[]; { const r=rng(5); for(let i=0;i<34;i++) flies.push({x:r()*480,y:90+r()*150,sx:.5+r()*1.4,sy:.4+r()*1.2,ph:r()*6}); }
    function flamingo(c,x,y,t,ph){
      const dip=Math.sin(t*.5+ph)>.7;
      line(c,x,y,x,y+22,'#e8688a'); R(c,x-1,y+22,4,1,'#e8688a');
      ell(c,x+2,y-3,7,5,'#f08aa4'); R(c,x+4,y-5,6,3,'#e8688a'); R(c,x-4,y-4,4,3,'#d85a7a');
      if(dip){ line(c,x+8,y-4,x+12,y+4,'#f08aa4'); R(c,x+11,y+4,4,2,'#2a1a2a'); }
      else { line(c,x+8,y-4,x+10,y-14,'#f08aa4'); line(c,x+10,y-14,x+14,y-18,'#f08aa4'); R(c,x+13,y-19,4,3,'#f08aa4'); R(c,x+16,y-18,3,2,'#f4e8d4'); R(c,x+18,y-18,1,2,'#2a1a2a'); }
      R(c,x-5,y+22,10,1,'rgba(240,138,164,.3)');
    }
    function frame(c,t,env){
      SK.starTwinkle(c,S.stars,t);
      // mist
      for(let b=0;b<3;b++){ SK.fog(c,114+b*10,18,'216,200,232',.22-b*.05); c.fillStyle='rgba(216,200,232,.12)'; c.fillRect(((t*(3+b)+b*90)%520)-40,122+b*10,100,6); }
      // water shimmer
      for(let i=0;i<24;i++){ const x=(i*61+t*6)%480, y=150+(i*19)%100; if(Math.sin(t*2+i)>.6) P(c,x,y,'#bfe0ff'); }
      // alligator cruising
      const gx=((t*9)%620)-80, gy=222+Math.sin(t*.7)*2;
      R(c,gx,gy,34,3,'#16301f'); R(c,gx+34,gy,10,2,'#16301f'); R(c,gx-12,gy+1,12,2,'#16301f'); for(let k=0;k<7;k++) P(c,gx+4+k*4,gy-1,'#0e2014');
      R(c,gx+30,gy-2,3,2,'#16301f'); P(c,gx+31,gy-2,'#ffdc4a'); P(c,gx+34,gy-2,'#ffdc4a');
      c.fillStyle='rgba(200,230,255,.35)'; c.fillRect(gx-20,gy+3,70,1); c.fillRect(gx-10,gy+5,50,1);
      // flamingos
      for(const f of flam) flamingo(c,f.x,f.y,t,f.ph);
      // airboat
      const ap=((t*.06)%1), ax=ap*720-120; if(ax>-60&&ax<540){ R(c,ax,172,34,4,'#d8d0c0'); R(c,ax+2,176,30,2,'#6a5a4a'); R(c,ax+22,160,4,12,'#3a3a46');
        for(let k=0;k<3;k++) R(c,ax+19+k*2,152+k*3,1,22-k*6,'rgba(220,220,240,.5)'); R(c,ax-16,177,18,1,'rgba(255,255,255,.5)'); R(c,ax-30,178,14,1,'rgba(255,255,255,.3)'); }
      // dragonflies + fireflies
      for(const f of flies){ const x=(f.x+Math.sin(t*f.sx+f.ph)*22+480)%480, y=f.y+Math.cos(t*f.sy+f.ph)*12, a=(Math.sin(t*2+f.ph)+1)/2; if(a>.35){ P(c,x,y,'#f4ff8a'); if(a>.8) SK.glow(c,Math.round(x),Math.round(y),4,'#f4ff8a',.8); } }
      // roseate spoonbills drifting over
      for(let i=0;i<4;i++){ const x=((t*16+i*26)%620)-60, y=70+i*6+Math.sin(t*2+i)*2, f=Math.floor(t*5+i)%2; R(c,x,y,7,2,'#ff8ab0'); R(c,x+7,y,3,1,'#ff8ab0'); R(c,x+10,y,4,1,'#d8b088'); R(c,x+1,y-(f?3:0),5,1+(f?0:1),'#ff6a9a'); }
      // water snake s-curving across
      { const sx=((t*7)%640)-80, sy=242; for(let k=0;k<14;k++) P(c,sx-k*2,sy+Math.round(Math.sin(t*4-k*.7)*2),k<2?'#3a4a2a':'#2a3a1a'); P(c,sx+1,sy-1,'#ffdc4a'); }
      // raccoon nosing around the boardwalk
      { const rx=8+((Math.sin(t*.25)+1)*40), d=Math.cos(t*.25)>0?1:-1, st=Math.floor(t*5)%2; R(c,rx,186,10,5,'#6a6a72'); R(c,rx+(d>0?9:-4),184,5,5,'#8a8a92'); R(c,rx+(d>0?11:-3),185,2,1,'#14101e'); for(let k=0;k<3;k++) R(c,rx+(d>0?-4:10)-k*(d>0?2:-2),187,2,2,k%2?'#2a2a32':'#9a9aa2'); P(c,rx+1,191,'#2a2a32'); P(c,rx+8-st,191,'#2a2a32'); }
      // manatee surfacing for a breath
      { const ph=(t%28)/28; if(ph<.2){ const up=Math.sin(ph/.2*Math.PI); ell(c,268,232-Math.round(up*2),9,Math.max(1,Math.round(up*3)),'#6a7a8a'); P(c,262,231-Math.round(up*2),'#2a3a4a'); if(up>.6) for(let k=0;k<3;k++) P(c,262+k,226-k,'rgba(255,255,255,.6)'); ell(c,268,234,14,2,'rgba(220,240,255,.3)'); } }
      // fish jumping + rings
      { const ph=(t*.3)%1; if(ph<.25){ const q=ph/.25, fx=160+q*20, fy=200-Math.sin(q*Math.PI)*12; R(c,fx,fy,4,2,'#c8d8c0'); P(c,fx+4,fy,'#e8f0e0'); } }
      // blue dragonflies darting
      for(let i=0;i<5;i++){ const jump=Math.floor(t*.7+i), x=40+((jump*97+i*71)%400)+Math.sin(t*9+i)*1.5, y=170+((jump*53+i*29)%70); R(c,x,y,5,1,'#3ab8ff'); P(c,x+5,y,'#1a5a8a'); if(Math.floor(t*20+i)%2){ P(c,x+1,y-1,'rgba(220,240,255,.8)'); P(c,x+3,y-1,'rgba(220,240,255,.8)'); } }
      DET.frame('grassrivers',c,t,env);
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'grassrivers', name:'Grassrivers', sub:'Fireflies in the mangroves', tag:'Grassrivers', weather:'clear', build, frame,
      sounds:{ frogs:.5, crickets:.4, wind:.1, rain:.2, thunder:.1 }, mapAt:[640,1690] });
  })();

  /* ========================= PORT GELLHORN ========================= */
  (function(){
    const S={};
    function build(c){
      c.clearRect(0,0,480,150); S.stars=[];
      // distant strip mall + highway lights
      SK.skyline(c,0,480,160,10,26,16,34,['#1a1838','#14122e'],5,{lit:.08,winCols:['#6a6aa8','#8a7ab8','#5a5a98','#7a6aa8']});
      R(c,0,160,480,6,'#10102a'); for(let x=6;x<480;x+=18){ R(c,x,158,2,1,'#ffe8b0'); }
      // power lines
      for(const y of [34,40]) { for(let x=0;x<480;x++) P(c,x,y+Math.round(Math.sin(x*.012)*6+6),'#0a0818'); }
      for(const x of [60,230,400]){ R(c,x,30,2,134,'#0a0818'); R(c,x-10,34,22,2,'#0a0818'); R(c,x-8,42,18,2,'#0a0818'); }
      // two-storey motel: rooms off an open balcony walkway, stairs at the end
      R(c,22,94,308,6,'#1a1430'); R(c,22,94,308,1,'#5a4a8a'); R(c,26,100,300,100,'#2a2040'); for(let y=102;y<200;y+=4) R(c,26,y,300,1,'#2c2244');
      R(c,26,144,300,5,'#3a3060'); R(c,26,144,300,1,'#6a5a9a'); R(c,26,149,300,2,'#14102a');                 // upper walkway slab
      for(let x=26;x<326;x+=3) R(c,x,134,1,10,'#5a4a8a'); R(c,26,133,300,1,'#8a7ab8');                     // railing
      for(const x of [26,96,166,236,306]) R(c,x,151,4,49,'#3a3060');                                         // posts
      for(let i=0;i<7;i++){ const x=36+i*38;
        // upper room: door + window with curtains
        R(c,x+14,108,13,25,'#3a2a5a'); R(c,x+14,108,13,1,'#6a5a9a'); P(c,x+24,121,'#e8c860'); text(c,String(20+i),x+16,102,'#c8b8e8',1);
        R(c,x,112,11,12,i%3===2?'#ffd890':'#14102a'); R(c,x,112,11,1,'#5a4a8a'); R(c,x,112,3,12,'#7a3a5a'); R(c,x+8,112,3,12,'#7a3a5a'); R(c,x+1,124,9,1,'#5a4a8a');
        // lower room
        R(c,x+14,166,13,32,'#3a2a5a'); R(c,x+14,166,13,1,'#6a5a9a'); P(c,x+24,182,'#e8c860'); text(c,String(10+i),x+16,158,'#c8b8e8',1);
        R(c,x,170,11,13,i%3===1?'#ffd890':'#14102a'); R(c,x,170,11,1,'#5a4a8a'); R(c,x,170,3,13,'#4a3a6a'); R(c,x+8,170,3,13,'#4a3a6a'); R(c,x+1,183,9,1,'#5a4a8a');
        R(c,x+3,190,5,8,'#1a1430'); R(c,x+2,189,7,1,'#4a3a6a'); }  // AC unit under each window
      // stairs up to the walkway
      for(let i=0;i<12;i++) R(c,326+i*0,148+i*4,10,2,'#4a3a6a'); R(c,326,100,0,0,'#000'); line(c,326,134,336,196,'#5a4a8a');
      // vending + ice machines
      R(c,336,160,22,40,'#c83a5a'); R(c,338,164,18,22,'#ffe8b0'); for(let i=0;i<3;i++) for(let j=0;j<4;j++) R(c,340+j*4,166+i*6,3,4,['#ff5a8a','#5ae8ff','#ffd27a','#9aff7a'][(i+j)%4]);
      R(c,338,190,18,6,'#6a1a2a'); SK.glow(c,347,176,26,'#ffe8b0',.5);
      R(c,364,166,24,34,'#4aa8d8'); R(c,366,170,20,12,'#d8f4ff'); text(c,'ICE',368,186,'#fff',1);
      // sign pole
      R(c,420,70,4,130,'#1a1430'); R(c,396,56,52,34,'#1a0e2a'); R(c,398,58,48,30,'#2a1440'); R(c,396,56,52,1,'#ff5ab4'); R(c,396,89,52,1,'#5ae8ff');
      // star
      c.fillStyle='#ffd27a'; c.beginPath(); c.moveTo(406,63); c.lineTo(408,68); c.lineTo(413,68); c.lineTo(409,71); c.lineTo(411,76); c.lineTo(406,73); c.lineTo(401,76); c.lineTo(403,71); c.lineTo(399,68); c.lineTo(404,68); c.closePath(); c.fill();
      text(c,'STARLET',416,60,'#ff7ac8',1); text(c,'MOTEL',416,67,'#5ae8ff',1);
      R(c,406,98,34,12,'#1a0e2a'); R(c,404,96,38,1,'#ff3a3a');
      // lot
      grad(c,0,200,480,70,['#181330','#100c24','#0a081a']);
      for(let x=10;x<480;x+=36){ line(c,x,214,x-10,268,'#d8c868'); }
      // lamp posts
      for(const x of [12,200,330]){ R(c,x,150,2,60,'#2a2a3c'); R(c,x-5,148,10,2,'#2a2a3c'); R(c,x-5,150,4,2,'#ffe8b0'); SK.glow(c,x-3,153,26,'#ffe8b0',.6); }
      // wet reflections
      SK.reflect(c,[[44,'#ffd890',3],[200,'#ffe8b0',3],[426,'#ff7ac8',3],[346,'#ff5a8a',3],[440,'#5ae8ff',2]],204,268,0);
    }
    function frame(c,t,env){
      SK.starTwinkle(c,S.stars,t);
      // sign flicker: VACANCY with NO flickering in
      const flick=Math.sin(t*13)>.55&&Math.sin(t*3.1)>.2;
      text(c,'VACANCY',409,101,flick?'#5a1a1a':'#ff3a3a',1);
      if(Math.sin(t*2.2)>.8) R(c,398,58,48,30,'#2a1440');
      if(!(Math.sin(t*1.7)>.93)){ SK.glow(c,422,76,34,'#ff5ab4',.35); }
      // motel windows TV flicker
      const col=['#5ae8ff','#ff7ac8','#b8f0ff'][Math.floor(t*3)%3]; R(c,77,113,5,10,col); R(c,153,171,5,11,col);
      // headlights sweeping on the highway behind
      const hx=((t*40)%560)-40; R(c,hx,159,3,1,'#fffbd0'); R(c,hx+4,159,3,1,'#fffbd0'); R(c,hx-20,159,20,1,'rgba(255,248,200,.3)');
      // moths around lamps
      for(const [lx,ly] of [[9,152],[197,152],[327,152]]) for(let k=0;k<3;k++){ const a=t*3+k*2.1+lx; P(c,lx+Math.cos(a)*7,ly+Math.sin(a*1.3)*5,'#e8e0c8'); }
      // parked cars, same style as every other car on the site
      LIFE.car(c,52,236,'sedan','#8a2a3a',1,t,{lamp:0,wet:env.weather!=='clear'}); LIFE.car(c,212,238,'van','#2a5a7a',-1,t,{lamp:0,wet:env.weather!=='clear'});
      DET.frame('gellhorn',c,t,env);
      WX.draw(c,t,env.weather,[0,0,480,270]);
      if(env.weather!=='clear'){ for(let i=0;i<8;i++){ const ph=((t*1.4+i*.55)%1); ell(c,20+i*58+((i*17)%20),226+(i%4)*10,Math.round(1+ph*6),Math.round(ph*1.8),'rgba(200,225,255,'+(0.5*(1-ph))+')'); } }
    }
    SCENES.push({ id:'gellhorn', name:'Port Gellhorn', sub:'Vacancy, always', tag:'Starlet Motel · Port Gellhorn', weather:'rain', build, frame,
      sounds:{ rain:.5, neon:.25, traffic:.15, thunder:.15, siren:.1 }, mapAt:[370,800] });
  })();

  /* ========================= AMBROSIA ========================= */
  (function(){
    const S={};
    function build(c){
      c.clearRect(0,0,480,150); S.stars=[];
      // distant ridge of trees
      for(let x=0;x<480;x+=10) disc(c,x,150+Math.round(Math.sin(x*.1)*2),7,'#4a3a4a');
      // refinery complex
      R(c,210,96,150,70,'#3a2f46'); R(c,210,96,150,3,'#5a4a68'); R(c,212,104,146,2,'#2a2236');
      for(let i=0;i<10;i++) R(c,216+i*14,110,8,10,i%3?'#ffd070':'#2a2236');
      R(c,250,120,70,46,'#2a2236');
      // rooftop sign: two framed boards on legs, lettering centred inside each
      { const sign=(txt,cx,y,col)=>{ const w=textW(txt,1)+8, x=Math.round(cx-w/2); R(c,x+4,y+9,1,96-y-9,'#2a2236'); R(c,x+w-5,y+9,1,96-y-9,'#2a2236');
          R(c,x,y,w,9,'#2a2236'); R(c,x+1,y+1,w-2,7,'#46395a'); R(c,x+1,y+1,w-2,1,'#5a4a70'); text(c,txt,x+4,y+2,col,1); };
        sign('ALLIED CRYSTAL',285,84,'#ffe8b0'); sign('SUGAR',285,72,'#ff9a5a'); }
      // chimneys with red bands
      for(const x of [350,376]){ R(c,x,18,12,148,'#d8d0e0'); R(c,x,18,12,148,'#d8d0e0'); for(let y=22;y<150;y+=22){ R(c,x,y,12,8,'#d83a3a'); } R(c,x,18,3,148,'#fff'); R(c,x+9,18,3,148,'#9a90a8'); R(c,x-2,14,16,4,'#6a6078'); }
      // tanks + pipes
      for(const [x,w,h] of [[170,34,54],[130,28,44],[400,38,60],[440,30,48]]){ R(c,x,166-h,w,h,'#b8b0c8'); R(c,x,166-h,w,3,'#e8e0f4'); R(c,x+w-4,166-h,4,h,'#8a82a0'); for(let y=166-h+8;y<166;y+=10) R(c,x,y,w,1,'#8a82a0'); }
      for(let x=170;x<460;x+=2) P(c,x,150+Math.round(Math.sin(x*.05)*1),'#6a5a78'); R(c,170,140,290,2,'#6a5a78');
      // silo + fence at left
      R(c,10,90,34,76,'#c8c0d4'); R(c,10,90,34,4,'#e8e0f4'); R(c,38,90,6,76,'#9a90a8'); ell(c,27,90,17,5,'#a8a0b8');
      for(let x=50;x<130;x+=5) R(c,x,152,1,14,'#3a2f46'); R(c,50,156,80,1,'#3a2f46');
      // rail line + road
      R(c,0,168,480,4,'#2a2236'); R(c,0,172,480,1,'#6a5a78'); R(c,0,176,480,10,'#2a2236'); for(let x=4;x<480;x+=20) R(c,x,181,10,1,'#e8c860');
      // cane fields: perspective rows
      grad(c,0,186,480,84,['#9a8a3a','#7a8a2c','#4a7a2a','#2a5a22']);
      for(let i=-14;i<26;i++){ line(c,i*20+10,186,i*46-120,270,'#2f5a1e'); line(c,i*20+11,186,i*46-119,270,'#b8a84a'); }
      // light poles
      for(const x of [205,300]){ R(c,x,156,2,22,'#2a2236'); R(c,x-3,155,8,2,'#2a2236'); P(c,x-2,157,'#ffe8b0'); }
    }
    const puffs=[]; { const r=rng(3); for(let i=0;i<18;i++) puffs.push({s:r(),cx:r()<.5?356:382,sp:6+r()*5,sz:4+r()*5}); }
    const bikers=[{x:0,v:55,y:178},{x:-50,v:55,y:180},{x:-100,v:55,y:178}];
    function frame(c,t,env){
      SK.starTwinkle(c,S.stars,t);
      // smoke
      for(const p of puffs){ const ph=((t*.07+p.s)%1), x=p.cx+6+ph*80+Math.sin(t+p.s*9)*3, y=16-ph*10+ph*ph*40*0, r=Math.round(p.sz*(0.6+ph)); const a=(1-ph)*.55; c.fillStyle='rgba(235,225,240,'+a+')'; c.beginPath(); c.arc(Math.round(x),Math.round(y+ph*-14),r,0,7); c.fill(); }
      // aviation lights
      if(((t*1.4)|0)%2){ P(c,355,16,'#ff3a3a'); P(c,381,16,'#ff3a3a'); }
      // freight train crossing on the rail line (far)
      const tx=((t*22)%900)-420; R(c,tx,160,24,8,'#8a2a2a'); R(c,tx+22,158,10,10,'#e8a030');
      for(let k=1;k<9;k++){ R(c,tx-k*28,162,26,6,['#3a5a8a','#8a6a3a','#5a5a68'][k%3]); R(c,tx-k*28,162,26,1,'rgba(255,255,255,.25)'); }
      // bikers with headlights
      for(const b of bikers){ const x=((b.x+b.v*t)%640)-80; LIFE.bike(c,x,b.y+4,'#c83a3a',1,t,'#14101c',1); }
      // cane swaying (bright tips)
      for(let i=0;i<40;i++){ const x=(i*13)%480, y=190+(i*7)%70, s=Math.sin(t*1.5+i*.7)*1.5; P(c,x+s,y,'#d8c85a'); }
      // birds
      for(let i=0;i<4;i++){ const x=((i*130+t*14)%540)-30, y=60+i*12+Math.sin(t*3+i)*3; R(c,x,y,2,1,'#2a1c2a'); R(c,x-2,y-1,2,1,'#2a1c2a'); R(c,x+2,y-1,2,1,'#2a1c2a'); }
      DET.frame('ambrosia',c,t,env);
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'ambrosia', name:'Ambrosia', sub:'Sugar smoke at sundown', tag:'Allied Crystal refinery · Ambrosia', weather:'clear', build, frame,
      sounds:{ industrial:.3, wind:.25, traffic:.1, rain:.2, thunder:.1 }, mapAt:[840,880] });
  })();

  /* ========================= MOUNT KALAGA ========================= */
  (function(){
    const S={};
    function pine(c,x,base,h,col,hi){
      for(let i=0;i<h;i+=3){ const w=Math.round((h-i)*.3)+1; R(c,x-w,base-h+i,w*2+1,3,col); }
      R(c,x,base,1,3,col);
      if(hi) for(let i=0;i<h;i+=6) P(c,x-Math.round((h-i)*.2),base-h+i+1,hi);
    }
    function build(c){
      const r=rng(77);
      c.clearRect(0,0,480,150);
      S.stars=[];
      // mountain layers: jagged ridge lines built from a pulled random walk
      const ridge=(base,amp,seed,col,hi)=>{ const rr=rng(seed); let h=amp*.5;
        for(let x=0;x<480;x++){ const target=amp*(.55+.45*Math.sin(x*.011+seed)*Math.sin(x*.027+seed*3)); h+= (target-h)*.08+(rr()-.5)*5; h=Math.max(6,h);
          const y=Math.round(base-h); R(c,x,y,1,270-y,col); if(hi){ P(c,x,y,hi); if(rr()<.5) P(c,x,y+1,hi); } } };
      ridge(168,100,1,'#18244e','#6a7ab8'); ridge(184,78,2,'#111a3e','#3a4a82'); ridge(200,54,3,'#0b1230',null);
      SK.fog(c,132,34,'154,168,216',.16);
      // forest wall: two dense rows
      for(let x=-4;x<490;x+=8) pine(c,x,224,40+(x*7%36),'#143048','#3f7a96');
      for(let x=2;x<490;x+=11) pine(c,x,240,58+(x*5%42),'#0a1c2c','#285a74');
      SK.fog(c,200,30,'170,184,224',.12);
      // clearing
      grad(c,0,222,480,48,['#142418','#0e1a14','#08120e']);
      for(let i=0;i<60;i++) P(c,(i*83)%480,226+(i*17)%40,'#1c3224');
      // logs around fire
      R(c,214,246,16,4,'#3a2414'); R(c,258,246,16,4,'#3a2414'); R(c,214,246,16,1,'#5a3a22');
      for(let x=230;x<258;x+=5) R(c,x,248,4,2,'#4a2c18');
      // tent (left)
      c.fillStyle='#d8702a'; c.beginPath(); c.moveTo(58,252); c.lineTo(96,206); c.lineTo(134,252); c.closePath(); c.fill();
      c.fillStyle='#b05a20'; c.beginPath(); c.moveTo(96,206); c.lineTo(134,252); c.lineTo(110,252); c.closePath(); c.fill();
      c.fillStyle='#3a1a08'; c.beginPath(); c.moveTo(88,252); c.lineTo(96,222); c.lineTo(104,252); c.closePath(); c.fill();
      R(c,96,206,1,46,'#7a3a14'); R(c,58,252,76,2,'#1a0c04');
      // cabin far right
      R(c,430,196,44,30,'#4a2e1e'); c.fillStyle='#2a1a10'; c.beginPath(); c.moveTo(426,198); c.lineTo(452,178); c.lineTo(478,198); c.closePath(); c.fill(); R(c,440,206,10,12,'#ffd070'); R(c,458,206,8,20,'#1a0e08'); R(c,446,172,5,12,'#3a2a22');
    }
    const sparks=[]; { const r=rng(2); for(let i=0;i<20;i++) sparks.push({o:r(),x:(r()-.5)*14,sp:.35+r()*.5}); }
    function frame(c,t,env){
      SK.starTwinkle(c,S.stars,t);
      // shooting star
      const ss=(t%17); if(ss<.6){ const x=300-ss*160, y=20+ss*90; line(c,x,y,x+14,y-8,'#ffffff'); line(c,x+14,y-8,x+24,y-13,'rgba(255,255,255,.4)'); }
      // mountain lion padding along a ridge
      const lp=((t*.045)%1); if(lp<.55){ const x=60+lp/.55*340, y=176-Math.abs(Math.sin(x*.05))*3; const st=Math.floor(t*5)%2; R(c,x,y-5,9,3,'#0a0a10'); R(c,x+8,y-7,4,3,'#0a0a10'); P(c,x+9,y-8,'#0a0a10'); R(c,x-5,y-5,5,1,'#0a0a10'); R(c,x+1,y-2,1,2+(st?0:-1),'#0a0a10'); R(c,x+7,y-2,1,2+(st?-1:0),'#0a0a10'); P(c,x+11,y-6,'#ffd24a'); }
      // owl blink on pine
      if(((t*.4)|0)%5===0){ P(c,402,196,'#ffd24a'); P(c,405,196,'#ffd24a'); }
      // campfire: flames flicker, glow pulses
      const fx=244, fy=248, g=.5+Math.sin(t*14)*.08+Math.sin(t*5.3)*.06;
      SK.glow(c,fx,fy-4,70,'#ff9a3a',g*1.2); SK.glow(c,fx,fy-4,36,'#ffd070',g);
      const h1=8+Math.sin(t*11)*2.5, h2=6+Math.sin(t*9+1)*2, h3=5+Math.sin(t*13+2)*2;
      c.fillStyle='#d83a1a'; c.beginPath(); c.moveTo(fx-9,fy); c.lineTo(fx-2,fy-h1-6); c.lineTo(fx+1,fy-4); c.lineTo(fx+5,fy-h2-5); c.lineTo(fx+10,fy); c.closePath(); c.fill();
      c.fillStyle='#ff8a2a'; c.beginPath(); c.moveTo(fx-6,fy); c.lineTo(fx-1,fy-h1-2); c.lineTo(fx+3,fy-3); c.lineTo(fx+5,fy-h3-2); c.lineTo(fx+7,fy); c.closePath(); c.fill();
      c.fillStyle='#ffe070'; c.beginPath(); c.moveTo(fx-3,fy); c.lineTo(fx,fy-h2); c.lineTo(fx+4,fy); c.closePath(); c.fill();
      R(c,fx-12,fy-1,24,3,'#3a2414'); R(c,fx-10,fy,20,1,'#6a3a1a');
      for(const s of sparks){ const ph=((t*s.sp+s.o)%1), x=fx+s.x*ph+Math.sin(t*3+s.o*9)*3, y=fy-6-ph*54; if(ph<.9) P(c,x,y,ph<.4?'#ffe070':'#ff8a2a'); }
      LIFE.car(c,306,252,'pickup','#3a5a7a',-1,t,{lamp:0});
      // tent glows warm
      PX.dither(c,86,226,20,22,'#ffb050',.22+Math.sin(t*14)*.04);
      // fire light on the nearest trees + figure silhouettes sitting by the fire
      R(c,226,236,6,12,'#0a0a10'); R(c,226,232,6,5,'#0a0a10'); R(c,262,238,6,10,'#0a0a10'); R(c,262,234,6,5,'#0a0a10');
      // fog drift
      DET.frame('kalaga',c,t,env);
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'kalaga', name:'Mount Kalaga', sub:'Campfire above the fog', tag:'Mount Kalaga National Park', weather:'clear', build, frame,
      sounds:{ wind:.3, crickets:.3, fire:.45, rain:.2, thunder:.1 }, mapAt:[700,390] });
  })();
})();
