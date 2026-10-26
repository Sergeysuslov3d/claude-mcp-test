// Scenes 2-4: Downtown Vice City, Ocean Beach, Leonida Keys. Original pixel art.
(function(){
  const {R,P,rng,mix,line,disc,ell,grad,dither,text,textW,palm} = PX;

  /* ========================= DOWNTOWN ========================= */
  (function(){
    const S={};
    const signs=[['CAFE',34,'#ffb84a'],['BAR',130,'#ff5ab4'],['SUSHI',212,'#5ae8ff'],['HOTEL',308,'#ff8a5a'],['DELI',396,'#9aff7a']];
    function build(c){
      c.clearRect(0,0,480,130); S.stars=[];
      SK.skyline(c,0,480,130,20,70,10,22,['#1a1d4a','#221a52','#181c40'],4,{lit:.15,winCols:['#4a5a9a','#6a7ab8','#4a4a8a','#5a6aa8']});
      S.wins=SK.skyline(c,0,480,170,60,150,22,40,['#c53a8a','#6a3fc0','#2ab8b8','#d9c7ae','#8a4ad0','#e0507a','#3a52c8'],7,{lit:.42,gap:2});
      // billboard (made-up ad)
      R(c,318,58,92,34,'#0e0a1e'); R(c,320,60,88,30,'#1a0f3a'); R(c,318,58,92,1,'#ff5ab4'); R(c,318,91,92,1,'#5ae8ff');
      text(c,'OCEAN VIEW',326,64,'#ffe8b0',2); text(c,'LUXURY LIVING',326,80,'#5ae8ff',1);
      R(c,360,92,3,16,'#0e0a1e');
      // storefront row
      R(c,0,168,480,46,'#0f0b1e');
      signs.forEach(([name,x,col],i)=>{
        const w=82; R(c,x-6,150,w,64,['#2a1848','#1c2850','#3a1a4a','#1a2a44','#34204a'][i]); R(c,x-6,150,w,1,'#5a4a8a');
        R(c,x-6,170,w,5,col); dither(c,x-6,175,w,6,col,.25);        // awning + glow
        R(c,x,158,textW(name,2)+6,12,'#0a0716'); text(c,name,x+3,161,col,2);
        R(c,x,180,w-14,28,'#ffd890'); R(c,x,196,w-14,12,'#e0a860'); R(c,x,180,w-14,2,'#fff0c0');
        for(let k=0;k<3;k++) R(c,x+4+k*20,196,10,12,'#0f0b1e');      // silhouettes inside
        R(c,x+w-12,184,6,28,'#20142e');                               // door
      });
      // sidewalk + street
      R(c,0,214,480,10,'#3a3050'); R(c,0,214,480,1,'#5a4a7a');
      grad(c,0,224,480,46,['#171226','#100c1e','#0a0816']);
      for(let x=10;x<480;x+=46) R(c,x,246,24,2,'#c8b04a');
      for(let x=0;x<480;x+=12) R(c,x,262+((x/12)%2),6,2,'#2a2440');
      // streetlights
      for(const x of [70,250,430]){ R(c,x,128,2,86,'#2a2a3c'); R(c,x-8,127,10,2,'#2a2a3c'); R(c,x-10,129,6,2,'#ffe8b0'); SK.glow(c,x-7,132,22,'#ffe8b0',.7); }
    }
    // two lanes; every car in a lane shares the lane speed so nobody drives through anybody
    const cars=[{x:0,v:40,col:'#f4c030',y:242,dir:1,m:'taxi'},{x:240,v:40,col:'#30b8c8',y:242,dir:1,m:'lowrider',hop:1},{x:480,v:40,col:'#e83a3a',y:242,dir:1,bike:1},
                {x:60,v:-52,col:'#f0f0f4',y:268,dir:-1,m:'police',lights:1},{x:300,v:-52,col:'#e03a8a',y:268,dir:-1,m:'super'},{x:540,v:-52,col:'#3a5a3a',y:268,dir:-1,m:'pickup'}];
    const peds=[{x:40,v:9,c:'#ff5ab4'},{x:200,v:-7,c:'#5ae8ff'},{x:340,v:11,c:'#ffd27a'}];
    function car(c,x,y,col,dir,taxi){
      R(c,x,y,26,6,col); R(c,x+5,y-5,15,5,col); R(c,x+7,y-4,5,3,'#bfeaff'); R(c,x+13,y-4,5,3,'#bfeaff');
      R(c,x,y+5,26,1,'#0a0716'); R(c,x+3,y+6,5,3,'#0a0716'); R(c,x+18,y+6,5,3,'#0a0716');
      if(taxi) R(c,x+10,y-7,6,2,'#fff6a0');
      const hx=dir>0?x+26:x-1, tx=dir>0?x-1:x+26;
      R(c,hx,y+1,1,2,'#fffbd0'); R(c,tx,y+1,1,2,'#ff3a3a');
      R(c,hx+(dir>0?1:-14),y+1,14,2,'rgba(255,248,200,.18)');
      R(c,x+2,y+10,22,2,'rgba(255,200,230,.18)');          // wet reflection
    }
    function frame(c,t,env){
      SK.twinkle(c,S.wins,t,'#241238'); SK.starTwinkle(c,S.stars,t);
      // neon flicker on a couple of signs
      if(Math.sin(t*7)>.93){ R(c,130,158,26,12,'#0a0716'); }
      if(Math.sin(t*5.3+2)>.95){ R(c,308,158,36,12,'#0a0716'); }
      // billboard LED sweep
      const sw=326+((t*30)%80); R(c,sw|0,86,3,1,'#ff5ab4');
      // pedestrians with umbrellas
      DET.frame('downtown',c,t,env);
      WX.draw(c,t,env.weather,[0,0,480,270]);
      // puddle ripples
      for(let i=0;i<6;i++){ const ph=((t*1.3+i*.7)%1); if(env.weather!=='clear'){ const x=30+i*76+((i*13)%20), y=228+(i%3)*14; ell(c,x,y,Math.round(1+ph*5),Math.round(ph*1.6),'rgba(200,225,255,'+(0.5*(1-ph))+')'); } }
    }
    function over(c,t,env){
      for(const k of cars){ const x=(((k.x+k.v*t)%720)+720)%720-120; if(k.bike) LIFE.bike(c,x,k.y,k.col,k.dir,t,'#2a2a3a'); else LIFE.car(c,x,k.y,k.m,k.col,k.dir,t,{wet:env.weather!=='clear',lights:k.lights,hop:k.hop,speed:Math.abs(k.v)}); }
    }
    SCENES.push({ id:'downtown', name:'Downtown Vice City', sub:'Neon after midnight', tag:'Downtown · Vice City', weather:'drizzle', build, frame, over,
      sounds:{ rain:.3, traffic:.55, crowd:.25, neon:.12, siren:.1, thunder:.1 }, mapAt:[1060,1230] });
  })();

  /* ========================= OCEAN BEACH ========================= */
  (function(){
    const S={};
    function build(c){
      c.clearRect(0,0,480,130); S.stars=[];
      // sun, half sunk
      // cloud bands
      // sea
      grad(c,0,128,480,50,['#f08a74','#b04a8a','#4a2a8a','#1e2a72']);
      // distant boat
      R(c,120,126,8,3,'#1a1030'); R(c,123,120,1,6,'#1a1030'); R(c,124,121,4,5,'#ffe8c0');
      // sand
      grad(c,0,176,480,94,['#f0c898','#e0a878','#c08868','#a07060']);
      // promenade
      R(c,0,185,480,27,'#5a3a6a'); R(c,0,185,480,2,'#8a6a9a'); R(c,0,212,480,8,'#9a7a9a'); R(c,0,212,480,1,'#c8a8c8'); R(c,0,220,480,1,'#5a3a5a'); for(let x=0;x<480;x+=12) R(c,x,212,1,8,'#7a5a7a');
      for(let x=0;x<480;x+=40) R(c,x,199,20,1,'#d8c8e8');
      // art deco hotels (left)
      const hotels=[[0,70,'#f6a8c0','#ff5a9a'],[44,96,'#8ee0d0','#2ad0c8'],[92,78,'#f8e0a0','#ffb040'],[136,62,'#f6a8c0','#7a7aff']];
      hotels.forEach(([x,h,col,neon],i)=>{
        const w=42, y0=186-h;
        R(c,x,y0,w,h,col); R(c,x,y0,w,2,mix(col,'#fff',.4)); R(c,x+w-3,y0,3,h,mix(col,'#000',.18));
        R(c,x+4,y0-6,w-8,6,col); R(c,x+10,y0-10,w-20,4,col);                     // stepped crown
        R(c,x,y0+h*.35|0,w,2,neon); R(c,x,y0+h*.7|0,w,2,neon);                     // neon bands
        for(let wy=y0+8;wy<184-10;wy+=12) for(let wx=x+5;wx<x+w-6;wx+=10){ disc(c,wx+2,wy+2,2,'#2a2250'); P(c,wx+1,wy+1,'#ffd27a'); }
        R(c,x+w/2-4,174,8,12,'#2a2250'); R(c,x+4,170,w-8,2,neon);                 // door + awning line
      });
      // vertical neon sign
      R(c,163,98,16,64,'#ff5ab4'); R(c,164,99,14,62,'#1a1030'); R(c,161,104,2,1,'#6a5a7a'); R(c,161,154,2,1,'#6a5a7a');
      ['O','C','E','A','N'].forEach((ch,i)=>text(c,ch,171-Math.ceil(textW(ch,2)/2),102+i*12,['#ff5ab4','#5ae8ff','#ffd27a','#ff5ab4','#5ae8ff'][i],2));
      // lifeguard tower
      R(c,290,170,3,14,'#7a4a5a'); R(c,314,170,3,14,'#7a4a5a'); line(c,291,174,315,183,'#6a3a4a'); line(c,315,174,291,183,'#6a3a4a'); R(c,286,156,34,16,'#f6a8c0'); R(c,286,156,34,3,'#ffe0ec'); R(c,284,152,38,5,'#2ad0c8');
      R(c,292,162,10,7,'#2a2250'); R(c,306,162,8,7,'#8ee0d0'); R(c,312,154,1,0,'#fff');
      // pier
      R(c,370,152,110,4,'#5a3a4a'); R(c,370,152,110,1,'#9a7a8a');
      for(let x=374;x<480;x+=10){ R(c,x,156,2,18,'#3a2230'); if(x%20===4){ R(c,x,146,1,6,'#3a2230'); SK.glow(c,x,146,8,'#ffe8b0',.7); } }
      // umbrellas
      for(const [x,y,col] of [[226,236,'#ff5a9a'],[262,244,'#2ad0c8'],[424,240,'#ffb040']]){
        ell(c,x+4,y,16,3,'rgba(60,30,40,.25)'); R(c,x,y-34,2,34,'#e8e0f0'); R(c,x+1,y-34,1,34,'#9a8aa8');
        R(c,x-16,y-36,34,3,col); R(c,x-12,y-39,26,3,col); R(c,x-6,y-41,14,2,col); for(let i=0;i<4;i++) R(c,x-14+i*9,y-36,4,3,'#fff6ee'); R(c,x-16,y-33,34,1,mix(col,'#000',.3)); }
      // beach towels + cooler + bucket
      R(c,206,240,18,8,'#ff5a9a'); R(c,206,242,18,1,'#fff'); R(c,246,250,18,8,'#2ad0c8'); R(c,246,252,18,1,'#fff'); R(c,410,246,18,8,'#ffb040');
      R(c,436,240,10,7,'#3a8ad8'); R(c,436,240,10,2,'#e8f0ff'); R(c,190,246,5,5,'#ff3a3a'); P(c,192,245,'#ffd24a');
    }
    const gulls=[{x:30,y:60,v:14,ph:0},{x:200,y:48,v:10,ph:2},{x:360,y:76,v:12,ph:4}];
    const walkers=[{x:60,v:7,c:'#ff5ab4'},{x:300,v:-6,c:'#5ae8ff'},{x:420,v:5,c:'#ffd27a'}];
    function frame(c,t,env){
      // sparkles on sea
      for(let i=0;i<30;i++){ const x=(i*47+t*(5+i%4))%480, y=134+(i*13)%40; if(Math.sin(t*3+i)>.5) P(c,x,y,'#ffe8b0'); }
      SK.starTwinkle(c,S.stars,t);
      // waves rolling in
      for(let i=0;i<5;i++){ const ph=((t*.35+i*.2)%1), y=Math.round(172+ph*10); const a=1-ph;
        c.fillStyle='rgba(255,246,235,'+(0.75*a)+')'; for(let x=((i*37)%30);x<480;x+=30) c.fillRect(x,y,22,1);
        c.fillStyle='rgba(255,246,235,'+(0.35*a)+')'; for(let x=((i*37)%30)+8;x<480;x+=30) c.fillRect(x,y+1,12,1); }
      // palms (sway)
      const sw=Math.sin(t*.9)*2;
      palm(c,196,184,60,6,'#1a0f2a','#2a1a3a',sw); palm(c,268,184,50,-5,'#1a0f2a','#2a1a3a',-sw); palm(c,448,185,64,5,'#1a0f2a','#2a1a3a',sw);
      // gulls
      // convertible on the promenade
      LIFE.car(c,560-((t*26)%680),197,'muscle','#2ad0c8',-1,t,{speed:26}); LIFE.car(c,((30+t*34)%640)-70,210,'convertible','#ff5a9a',1,t,{speed:34});
      // walkers
      // neon sign flicker
      if(Math.sin(t*8)>.94) R(c,164,99,14,62,'#1a0e28');
      DET.frame('beach',c,t,env);
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'beach', name:'Ocean Beach', sub:'Last light on the boardwalk', tag:'Ocean Beach · Vice City', weather:'clear', build, frame,
      sounds:{ waves:.6, wind:.15, crowd:.3, traffic:.1, rain:.2, horns:.25, thunder:.1 }, mapAt:[1300,1180] });
  })();

  /* ========================= LEONIDA KEYS ========================= */
  (function(){
    const S={};
    function build(c){
      c.clearRect(0,0,480,126); S.stars=[];
      // sea
      grad(c,0,126,480,144,['#f09a6a','#2a7aa0','#1a8aa8','#0f6a90','#0a4a78']);
      // islets with palms (far)
      for(const [x,y,w] of [[40,130,70],[250,128,60],[380,132,80]]){ ell(c,x,y,w/2,4,'#1a3a3a'); ell(c,x,y-1,w/2-4,3,'#2a6a4a'); }
      // tiki bar on stilts (right)
      R(c,340,150,120,5,'#6a4a30'); R(c,340,150,120,1,'#9a7a50');
      for(let x=346;x<456;x+=18) R(c,x,155,3,26,'#4a3220');
      R(c,356,124,90,28,'#8a5a38'); R(c,356,124,90,3,'#b8884c');
      c.fillStyle='#c89a50'; c.beginPath(); c.moveTo(346,126); c.lineTo(400,100); c.lineTo(456,126); c.closePath(); c.fill();
      for(let i=0;i<12;i++) line(c,352+i*9,126,400+(i-6)*2,102,'#a87a38');
      R(c,364,136,74,16,'#2a1a14'); for(let i=0;i<5;i++) R(c,370+i*14,140,8,8,'#ffb050');
      text(c,'TIKI BAR',374,128,'#ffe8b0',1);
      for(let x=348;x<456;x+=8){ const y=126+Math.round(Math.sin(x*.4)*2); P(c,x,y,'#ffe8b0'); P(c,x+1,y,'#ff9ab8'); }
      // dock (foreground left)
      R(c,0,206,230,10,'#7a5a3a'); R(c,0,206,230,1,'#b8885a'); for(let x=0;x<230;x+=14) R(c,x,206,1,10,'#4a3220');
      for(let x=10;x<230;x+=36){ R(c,x,216,4,40,'#3a2818'); }
      R(c,0,216,230,3,'#2a1c10');
      // lantern posts
      for(const x of [30,130,214]){ R(c,x,184,2,22,'#3a2818'); R(c,x-2,182,6,3,'#ffe8b0'); SK.glow(c,x+1,184,14,'#ffd890',.7); }
      // fisher silhouette
      R(c,170,190,5,12,'#1a1028'); R(c,170,186,5,5,'#1a1028'); R(c,168,185,9,2,'#c89a50'); line(c,175,192,206,176,'#2a1a14'); line(c,206,176,208,204,'rgba(255,255,255,.4)');
      // sandbar with rocks where the second palm grows; planter box for the dock palm
      ell(c,262,210,34,6,'#0c5a78'); ell(c,262,207,30,5,'#e8cc90'); ell(c,262,206,26,3,'#f4dca8'); R(c,236,208,52,1,'rgba(255,255,255,.5)');
      for(const [x,y,r] of [[240,205,3],[284,206,2],[276,203,2]]){ disc(c,x,y,r,'#6a6a72'); P(c,x-1,y-r+1,'#9a9aa4'); }
      R(c,252,203,6,3,'#c8443e'); R(c,253,202,4,1,'#ffd24a');   // a little bucket left on the sand
      R(c,50,196,20,10,'#6a4226'); R(c,50,196,20,2,'#9a6a3a'); R(c,52,198,16,1,'#4a2c18'); R(c,50,204,20,2,'#3a2414');
    }
    function yacht(c,x,y){ R(c,x,y,46,8,'#f4f0f8'); R(c,x+4,y-6,30,6,'#f4f0f8'); R(c,x+10,y-4,18,3,'#2a5a9a'); R(c,x,y+7,46,2,'#ff5a7a'); R(c,x+36,y-10,1,10,'#c8c0d0'); }
    function sail(c,x,y){ R(c,x,y,28,5,'#6a4a30'); R(c,x+13,y-30,1,30,'#c8c0d0'); c.fillStyle='#fff6e8'; c.beginPath(); c.moveTo(x+14,y-30); c.lineTo(x+14,y-2); c.lineTo(x+30,y-2); c.closePath(); c.fill(); c.fillStyle='#ff9a5a'; c.beginPath(); c.moveTo(x+12,y-26); c.lineTo(x+12,y-2); c.lineTo(x+2,y-2); c.closePath(); c.fill(); }
    function frame(c,t,env){
      SK.starTwinkle(c,S.stars,t);
      for(let i=0;i<34;i++){ const x=(i*41+t*(4+i%5))%480, y=132+(i*17)%130; if(Math.sin(t*2.5+i)>.55) P(c,x,y,i%3?'#d8f4ff':'#ffe0a0'); }
      // gentle swell lines
      for(let i=0;i<8;i++){ const y=150+i*14, x=((t*(6+i)*(i%2?1:-1))%480+480)%480; c.fillStyle='rgba(180,235,255,.28)'; c.fillRect(x-30,y,60,1); c.fillRect(x+170,y+4,40,1); }
      yacht(c,252,172+Math.round(Math.sin(t*.9)*1.4)); sail(c,300,186+Math.round(Math.sin(t*.8+1)*1.2));
      // passing fishing boat
      const bx=(((t*7)%640)-80); R(c,bx,166,24,5,'#c84a3a'); R(c,bx+4,160,10,6,'#f4f0f8'); R(c,bx+18,156,1,10,'#2a2a3a');
      // dolphin arcs
      const dp=((t*.22)%1); if(dp<.35){ const q=dp/.35, x=70+q*60, y=176-Math.sin(q*Math.PI)*22; for(let k=0;k<6;k++) R(c,x-k*2,y+k*(q<.5?1:-1)*0.7,4,3,'#6a8aa8'); R(c,x+4,y-1,3,2,'#6a8aa8'); R(c,x-12,y+(q<.5?4:-4),4,2,'#6a8aa8'); if(q>.8) ell(c,x-12,178,5,1,'rgba(255,255,255,.6)'); }
      // pelican gliding
      const px=(((t*10)%560)-40), py=70+Math.sin(t*.9)*6, f=Math.floor(t*2)%3;
      R(c,px,py,10,3,'#3a2a2a'); R(c,px+9,py,5,2,'#d8a850'); R(c,px+13,py+1,5,1,'#d8a850'); line(c,px+2,py,px-6,py-(f?4:1),'#3a2a2a'); line(c,px+6,py,px+14,py-(f?4:1),'#3a2a2a');
      // palms on the dock edge, swaying
      const sw=Math.sin(t*.8)*2; palm(c,60,197,56,5,'#10241c','#1a3a2a',sw); palm(c,264,205,48,-4,'#10241c','#1a3a2a',-sw);
      DET.frame('keys',c,t,env);
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'keys', name:'Leonida Keys', sub:'Slow tides, loud bars', tag:'Leonida Keys', weather:'clear', build, frame,
      sounds:{ waves:.55, wind:.2, crowd:.1, rain:.2, horns:.35, thunder:.1 }, mapAt:[330,1900] });
  })();
})();
