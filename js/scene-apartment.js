// Scene 1: the protagonists' apartment above Vice City. Original pixel art, 480x270.
(function(){
  const {R,P,rng,mix,line,disc,ell,grad,dither,text} = PX;
  const WIN = {x:160,y:44,w:236,h:142};          // window glass
  const S = {};

  function figureSofa(c,t){
    // seated figure, facing the window (left). breathing + slow head nod
    const b=Math.round(Math.sin(t*1.3)*.6), nod=Math.sin(t*.5)>.6?1:0;
    const skin='#d79a72', skinD='#b87a58';
    // legs stretched forward
    R(c,418,152+b,24,7,'#6d62b8');   R(c,412,152+b,8,7,'#6d62b8');
    R(c,410,157,7,23,skinD); R(c,408,176,12,4,'#e8e4ff');
    R(c,412,160,6,20,skin);  R(c,410,177,12,4,'#ffffff');
    // torso (tank top)
    R(c,436,122+b,14,32,'#e6def2'); R(c,436,122+b,2,32,'#bdb3d6');
    R(c,438,142+b,10,2,'#cfc4e6');
    // arm behind head
    R(c,440,106+b,5,18,skin); R(c,430,102+b,14,5,skin); R(c,426,98+b,6,6,skin);
    // other arm resting
    R(c,432,130+b,5,18,skinD); R(c,430,146+b,6,5,skinD);
    // head, hair, beard hint
    R(c,437,108+b+nod,11,12,skin); R(c,437,105+b+nod,12,5,'#2a1a18'); R(c,447,108+b+nod,2,8,'#2a1a18');
    R(c,438,117+b+nod,8,3,'#4a2e24');
    // controller glow in lap
    R(c,426,150+b,8,3,'#2a2a3a'); P(c,428,151+b,'#6ff'); P(c,431,151+b,'#f6a');
  }

  function figureWindow(c,t){
    // standing at the window, back to us, holding a mug. cyan rim light from the city.
    const sway=Math.round(Math.sin(t*.9)*.6), x=262;
    R(c,x-5,150,4,32,'#2a2740'); R(c,x+1,150,4,32,'#2a2740');          // legs
    R(c,x-6,180,5,3,'#ece8f8'); R(c,x+1,180,5,3,'#ece8f8');            // shoes
    R(c,x-7,116+sway,15,36,'#e7a3be');                                  // oversized tee
    R(c,x-7,116+sway,1,36,'#7fe4ff'); R(c,x+7,116+sway,1,36,'#7fe4ff'); // rim
    R(c,x-10,122+sway,4,20,'#d79a72'); R(c,x+8,122+sway,4,12,'#d79a72'); // arms
    R(c,x+9,114+sway,5,5,'#d79a72'); R(c,x+10,111+sway,6,5,'#f4f0ff');  // arm up with mug
    R(c,x-5,104+sway,11,12,'#d79a72');                                    // head (back)
    R(c,x-6,100+sway,13,7,'#1e1214'); R(c,x-7,104+sway,3,22,'#1e1214'); R(c,x+5,104+sway,3,22,'#1e1214'); // long hair
    // steam
    for(let i=0;i<3;i++){ const yy=106-i*4-((t*6)%4); P(c,x+12+Math.round(Math.sin(t*3+i)*1.2),yy+sway,'rgba(220,230,255,.7)'); }
  }

  function build(c){
    // ---------- room ----------
    R(c,0,0,480,270,'#1a1030');
    R(c,0,0,480,26,'#0a0716'); R(c,0,26,480,2,'#b83a8e'); R(c,0,28,480,1,'#6a1f58');
    for(const lx of [92,350]){ R(c,lx,8,18,3,'#fff8e0'); dither(c,lx-8,6,34,10,'#ffe8b0',.18); }
    // walls
    R(c,0,29,156,161,'#1b1034'); R(c,400,29,80,161,'#21123a');
    for(let y=29;y<190;y+=3) { R(c,0,y,156,1,'#1d1238'); R(c,400,y,80,1,'#23143e'); }
    // ---------- window with city outside ----------
    const wx=WIN.x, wy=WIN.y, ww=WIN.w;
    c.clearRect(wx,wy,ww,106);
    S.stars = [];
    SK.skyline(c,wx,wx+ww,152,18,56,7,15,['#1a2050','#161b44','#202860'],21,{lit:.16,windows:true,winCols:['#4a5a9a','#6a7ab8','#3a4a88','#5a6aa8']});
    S.wins = SK.skyline(c,wx,wx+ww,160,44,104,18,32,['#c53a8a','#6a3fc0','#2ab8b8','#d9c7ae','#8a4ad0','#e0507a'],33,{lit:.42,stepY:4,stepX:3,gap:2});
    // rooftop signs on a couple of towers
    { let best=null; for(const b of S.wins.blds){ if(b.w<20||b.x<WIN.x+6||b.x+b.w>WIN.x+WIN.w-6) continue; const d=Math.abs(b.x+b.w/2-222)+(b.top>96?200:0); if(!best||d<best.d) best={b,d}; }
      const b=best?best.b:{x:213,w:20,top:76}; S.sign={x:b.x+Math.floor((b.w-20)/2),y:b.top-10};
      const g=S.sign; R(c,g.x+3,g.y+8,1,2,'#14081e'); R(c,g.x+16,g.y+8,1,2,'#14081e'); R(c,g.x+1,g.y+9,18,1,'#14081e');
      R(c,g.x,g.y,20,8,'#14081e'); R(c,g.x,g.y,20,1,'#3a1a40'); text(c,'HOTEL',g.x+2,g.y+2,'#ff7ac8',1); window.APT_SIGN=g; }
    // bay + reflections
    grad(c,wx,160,ww,16,['#0b3a52','#082a40','#05182a']);
    for(let i=0;i<24;i++){ const rx=wx+4+i*10+(i%3)*2; R(c,rx,162+(i%4)*3,2,1,['#ff7ac8','#7fe4ff','#ffd27a'][i%3]); }
    // road + guard rail
    R(c,wx,176,ww,10,'#14121f'); R(c,wx,175,ww,1,'#3a3a52');
    for(let x=wx+4;x<wx+ww;x+=18) R(c,x,181,8,1,'#c8a83a');
    for(let x=wx+10;x<wx+ww;x+=44){ R(c,x,160,1,16,'#2a2a3a'); R(c,x-2,159,5,1,'#ffe8b0'); dither(c,x-5,156,11,8,'#ffe8b0',.2); }
    // palms in front of the skyline
    for(const [px,h,l] of [[176,40,4],[226,34,-3],[300,44,5],[376,38,-4]]) PX.palm(c,px,176,h,l,'#07071a','#0a0a22');
    // ---------- frame, mullions, curtains ----------
    R(c,wx-4,wy-4,ww+8,4,'#12101e'); R(c,wx-4,wy-4,ww+8,1,'#3a3258');
    R(c,wx-4,wy-4,4,146,'#12101e'); R(c,wx+ww,wy-4,4,146,'#12101e');
    R(c,238,wy,3,142,'#12101e'); R(c,318,wy,3,142,'#12101e');
    R(c,wx-4,186,ww+8,4,'#0e0c18'); R(c,wx-4,186,ww+8,1,'#3a3258');
    // ---------- floor with glossy reflection ----------
    grad(c,0,190,480,80,['#2a1250','#1a0c38','#0e0820']);
    for(let y=191;y<268;y+=2){
      const sy=Math.round(186-(y-190)*1.05);
      if(sy<wy) break;
      c.globalAlpha=.34*(1-(y-190)/90);
      c.drawImage(c.canvas,wx,sy,ww,1,wx+Math.sin(y*.5)*0,y,ww,1);
    }
    c.globalAlpha=1;
    for(let i=0;i<6;i++) R(c,wx-20+i*60,196+i*10,70,1,'#3a2060');
    // ---------- left: fridge, counter, poster ----------
    R(c,0,108,30,112,'#8d9db6'); R(c,0,108,2,112,'#b4c2d8'); R(c,28,108,2,112,'#6a7893');
    R(c,0,160,30,2,'#6a7893'); R(c,22,126,2,16,'#5a6680'); R(c,22,170,2,16,'#5a6680');
    R(c,4,116,9,10,'#f4a0c0'); R(c,5,118,6,1,'#c85a86'); R(c,5,121,5,1,'#c85a86');
    R(c,8,131,9,10,'#f4e48a'); R(c,9,133,6,1,'#b8a650'); R(c,9,136,4,1,'#b8a650');
    R(c,5,146,8,8,'#8ae0a8');
    R(c,30,172,122,5,'#d8cfe0'); R(c,30,172,122,1,'#f4eefa');
    R(c,30,177,122,44,'#5a2f7a'); R(c,30,177,122,1,'#7a4a9a');
    for(let i=0;i<4;i++){ R(c,31+i*30,180,28,38,'#6a3a8c'); R(c,31+i*30,180,28,1,'#8a5aac'); R(c,42+i*30,184,3,8,'#e0d4f0'); }
    R(c,30,221,122,3,'#241040');
    // counter items: kettle, mug, plant, teal pot
    R(c,40,158,10,14,'#f0eef8'); R(c,50,162,4,2,'#f0eef8'); R(c,40,156,10,2,'#c9c2d8'); P(c,45,154,'#ff7ac8');
    R(c,62,166,6,6,'#f0eef8'); R(c,68,167,2,3,'#f0eef8');
    R(c,86,166,8,6,'#a8452a'); R(c,88,158,2,8,'#3f9a4a'); R(c,85,160,3,3,'#3f9a4a'); R(c,91,157,3,4,'#52b85a');
    R(c,118,162,22,10,'#1fa8a0'); R(c,116,160,26,3,'#17857f');
    // poster on wall: a pixel map of Leonida
    R(c,52,50,62,52,'#e8d9c0'); R(c,54,52,58,48,'#1d4a8a');
    ell(c,83,76,13,20,'#7fb860'); R(c,76,60,14,6,'#4a8a4a'); ell(c,89,84,5,8,'#8a8aa0');
    for(let i=0;i<4;i++) R(c,68+i*8,96,4,1,'#7fb860');
    text(c,'LEONIDA',62,54,'#fff2d0',1);
    // ---------- right: shelf, sofa ----------
    R(c,408,82,66,3,'#3a2450');
    for(let i=0;i<9;i++) R(c,410+i*4,68+(i%3),3,14-(i%3),['#e0507a','#4ab8c8','#e8c85a'][i%3]);
    R(c,454,70,10,12,'#a8452a'); R(c,456,60,2,10,'#3f9a4a'); R(c,453,62,3,4,'#52b85a'); R(c,459,59,3,5,'#3f9a4a');
    // sofa: back, seat, arm
    R(c,452,118,28,66,'#a62a74'); R(c,452,118,28,3,'#c4408c'); R(c,452,121,2,63,'#c4408c');
    R(c,398,152,64,28,'#c4388a'); R(c,398,152,64,3,'#e052a4');
    R(c,392,140,14,44,'#8e2062'); R(c,392,140,14,3,'#a8307c');
    R(c,398,180,70,4,'#6a1646');
    R(c,396,184,4,6,'#1a0a2a'); R(c,462,184,4,6,'#1a0a2a');
    for(let i=0;i<3;i++) R(c,430+i*0,154,1,26,'#a0307a');
    R(c,442,132,12,18,'#d98aa0'); R(c,443,134,10,1,'#b86a82');  // pillow
    // ---------- centre: coffee table + rug ----------
    ell(c,330,246,92,12,'#3a1a5c'); ell(c,330,246,84,9,'#4a2270');
    for(let i=-3;i<=3;i++) R(c,330+i*20,240,10,1,'#6a3a96');
    R(c,284,214,84,3,'#7ac4d4'); R(c,284,214,84,1,'#d2f4fa'); R(c,286,217,3,16,'#2a2a40'); R(c,364,217,3,16,'#2a2a40');
    R(c,296,206,8,8,'#f4f0ff'); R(c,304,208,2,4,'#f4f0ff');   // mug
    R(c,326,202,10,12,'#a8452a'); R(c,329,192,2,10,'#3f9a4a'); R(c,325,194,4,4,'#52b85a'); R(c,333,191,4,5,'#3f9a4a');
    R(c,344,210,18,4,'#e0507a'); R(c,346,208,14,2,'#4ab8c8');  // books
    // floor lamp
    R(c,372,114,2,92,'#c8a050'); ell(c,373,208,7,2,'#8a6a30');
    c.fillStyle='#fff0a0'; c.beginPath(); c.moveTo(361,114); c.lineTo(385,114); c.lineTo(381,90); c.lineTo(365,90); c.closePath(); c.fill();
    for(let i=0;i<14;i++) P(c,364+(i*3)%16,92+((i*5)%20),'#f0d060');
    // big plant by the window
    // big plant on the floor at the end of the counter
    { const px=158, py=224; ell(c,px,py+16,13,3,'#0e0820');
      R(c,px-10,py+2,20,14,'#8a3a22'); R(c,px-12,py,24,4,'#a8482a'); R(c,px-12,py,24,1,'#c8603a'); R(c,px-10,py+2,2,14,'#a84a2a'); R(c,px+7,py+2,3,14,'#6a2a18');
      for(const [dx,dy,l] of [[-8,-30,16],[2,-40,18],[10,-26,14],[-14,-16,12],[16,-14,12],[-3,-22,12]]){ line(c,px,py,px+dx,py+dy,'#2a8a46'); disc(c,px+dx,py+dy,Math.round(l/4),'#3fae5a'); P(c,px+dx-1,py+dy-1,'#6ad07a'); P(c,px+dx+1,py+dy+1,'#2a7a3a'); } }

    // --- extra detail: wall clock ring, turntable on the fridge, low TV table, ceiling fan rod ---
    disc(c,134,62,10,'#2a1c44'); disc(c,134,62,9,'#efe6d0'); disc(c,134,62,8,'#fff8e8');
    for(let i=0;i<12;i++){ const a=i*Math.PI/6; P(c,134+Math.round(Math.sin(a)*7),62-Math.round(Math.cos(a)*7),i%3===0?'#2a1c44':'#9a8a7a'); }
    R(c,3,98,26,10,'#1a1228'); R(c,3,98,26,2,'#3a2c58'); R(c,24,102,3,3,'#ff4fa0'); R(c,5,106,2,2,'#0a0614'); R(c,25,106,2,2,'#0a0614');
    R(c,170,214,48,3,'#6a3a8c'); R(c,172,217,3,14,'#241040'); R(c,213,217,3,14,'#241040'); R(c,170,214,48,1,'#8a5aac');
    R(c,177,196,34,18,'#3a3a4a'); R(c,177,196,34,2,'#5a5a6c'); R(c,179,199,24,12,'#0a0a12'); R(c,205,200,4,2,'#8a8a9a'); R(c,205,204,4,2,'#8a8a9a');
    R(c,239,0,2,8,'#2a2438');
    // dust-mote sunbeam under the lamp is animated in frame
    // moody floor shadow under furniture
    dither(c,284,230,84,8,'#07040f',.4);
  }

  // cars on the road behind the glass
  const cars=[ {x:170,v:22,col:'#f4c030',dir:1}, {x:360,v:-30,col:'#a45ad8',dir:-1}, {x:250,v:16,col:'#30c0c8',dir:1}, {x:300,v:-20,col:'#e8e8f0',dir:-1} ];

  function frame(c,t,env){
    // outside
    SK.twinkle(c,S.wins,t,'#2a1a40'); SK.starTwinkle(c,S.stars,t);
    // aircraft blink
    const ax=WIN.x+((t*6)%WIN.w); if(((t*2)|0)%2) P(c,ax,58,'#ff4a4a'); P(c,ax+2,58,'#ffffff');
    // neon sign flicker
    { const g=S.sign; if(Math.sin(t*9)>.9) R(c,g.x+1,g.y+1,18,6,'#14081e'); else PX.text(c,'HOTEL',g.x+2,g.y+2,'#ff7ac8',1); }
    // bay shimmer
    for(let i=0;i<10;i++){ const x=WIN.x+((i*37+t*8)%WIN.w); P(c,x,164+(i%5)*2,'#9ef0ff'); }
    // cars
    for(const k of cars){
      const x=WIN.x+(((k.x-WIN.x)+k.v*t)%(WIN.w+30)+WIN.w+30)%(WIN.w+30)-10, y=k.dir>0?179:182;
      if(x<WIN.x||x>WIN.x+WIN.w-12) continue;
      R(c,x,y,12,3,k.col); R(c,x+3,y-2,6,2,k.col); R(c,x+4,y-2,4,1,'#bfeaff');
      P(c,x+(k.dir>0?12:-1),y+1,'#fffbd0'); P(c,x+(k.dir>0?-1:12),y+1,'#ff4a4a');
      R(c,x+(k.dir>0?13:-6),y+1,5,1,'rgba(255,248,200,.35)');
    }
    // weather (rain stays on the glass)
    WX.draw(c,t,env.weather,[WIN.x,WIN.y,WIN.w,WIN.h]);
    if(env.weather!=='clear'&&env.weather!=='fog'){
      // drops creeping down the pane
      for(let i=0;i<7;i++){ const x=WIN.x+14+i*33, y=WIN.y+((t*5+i*23)%130); R(c,x,y,1,3,'rgba(210,235,255,.5)'); P(c,x,y+3,'rgba(255,255,255,.6)'); }
    }
    // interior foreground
    CAST.draw(c,t,'apartment');
    // lamp + tv-ish glow flicker
    const fl=.14+Math.sin(t*23)*.01+(Math.sin(t*.7)>.97?-.06:0);
    c.save(); c.globalAlpha=1; SK.glow(c,373,106,34,'#ffe8a0',fl*3.2); SK.glow(c,373,200,40,'#ffe8a0',fl*2); c.restore();

    // ceiling fan (spinning blades drawn as alternating streaks)
    { const ph=(t*7)%6.2832; for(let k=0;k<3;k++){ const a=ph+k*2.0944, dx=Math.round(Math.cos(a)*30), dy=Math.round(Math.sin(a)*3); R(c,240+Math.min(0,dx),8+dy,Math.abs(dx)+1,2,k%2?'#4a3a6a':'#6a5a8a'); } R(c,238,7,5,4,'#8a7aaa'); }
    // wall clock hands follow the real time
    { const d=new Date(), s=d.getSeconds(), m=d.getMinutes()+s/60, h=(d.getHours()%12)+m/60;
      line(c,134,62,134+Math.sin(h*Math.PI/6)*4.5,62-Math.cos(h*Math.PI/6)*4.5,'#2a1c44'); line(c,134,62,134+Math.sin(m*Math.PI/30)*6.5,62-Math.cos(m*Math.PI/30)*6.5,'#2a1c44');
      P(c,134+Math.round(Math.sin(s*Math.PI/30)*7),62-Math.round(Math.cos(s*Math.PI/30)*7),'#ff4fa0'); }
    // turntable on the fridge: spinning record
    { ell(c,14,100,10,2,'#0a0614'); const a=t*2.6; R(c,14+Math.round(Math.cos(a)*7),99+Math.round(Math.sin(a)*1.2),2,1,'#ff4fa0'); R(c,14+Math.round(Math.cos(a+Math.PI)*7),99+Math.round(Math.sin(a+Math.PI)*1.2),1,1,'#7fe4ff'); line(c,24,95,16,99,'#c8c0e0'); }
    // kettle steam
    for(let i=0;i<3;i++){ const yy=152-((t*8+i*5)%14); P(c,48+Math.round(Math.sin(t*2+i*2)*1.4),yy,'rgba(235,235,255,'+(0.7-(152-yy)/24)+')'); }
    // CRT TV: flickering screen + glow on the floor
    { const cols=['#4ae8ff','#ff7ac8','#ffe08a','#8dffb0']; const k=Math.floor(t*5)%4; R(c,179,199,24,12,'#0a0a12'); for(let i=0;i<5;i++) R(c,179+((i*7+Math.floor(t*9))%20),200+(i*3)%10,4,2,cols[(k+i)%4]);
      R(c,179,205+Math.floor((t*10)%7),24,1,'rgba(255,255,255,.18)'); SK.glow(c,191,214,26,'#7fe4ff',.18+Math.sin(t*13)*.03); }
    // sleeping cat on the sofa arm: breathing + tail flick
    { const b=Math.round(Math.sin(t*2)*.5), tail=Math.sin(t*1.7)>.55?1:0;
      ell(c,399,138+b,8,4,'#c8742a'); R(c,392,135+b,6,4,'#c8742a'); R(c,391,133+b,2,2,'#c8742a'); R(c,395,133+b,2,2,'#c8742a'); R(c,393,136+b,3,1,'#f4d8a8');
      R(c,404,136+b,5,2,'#a85a1a'); R(c,408,134-tail*2+b,2,3,'#a85a1a'); R(c,396,139+b,2,1,'#1a1010'); }
    // dust motes drifting in the lamp light
    for(let i=0;i<8;i++){ const x=345+((i*17+t*3)%50), y=118+((i*29+Math.sin(t+i)*10+t*2)%70); P(c,x,y,'rgba(255,240,180,.55)'); }
    // console LED
    if(((t*1.2)|0)%2) P(c,392,148,'#ff3a5a');
  }

  SCENES.push({
    id:'apartment', name:'The Apartment', sub:'Rain over Vice City', tag:'Little Cube · Vice City',
    weather:'rain', build, frame,
    sounds:{ rain:.5, thunder:.2, traffic:.3, neon:.12 },
    mapAt:[1010,1130]
  });
})();
