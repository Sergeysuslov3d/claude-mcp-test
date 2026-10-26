// More places: Waning Sands pier, Sundown Speedway, Hamlet gas & diner, a downtown rooftop pool, Sunset Key marina.
// Original pixel art, night-authored (relit by the time-of-day system); sky areas stay transparent.
(function(){
  const {R,P,rng,mix,line,disc,ell,grad,text,textW,palm} = PX;
  const fr=x=>x-Math.floor(x);
  const NEON=['#ff5ab4','#5ae8ff','#ffd27a','#9aff7a','#ff8a5a','#b48aff'];

  /* ===================== WANING SANDS PIER ===================== */
  (function(){
    const S={}, FW={x:322,y:92,r:54};
    const track=[[392,168],[400,120],[414,96],[426,120],[434,150],[446,104],[458,78],[470,112],[480,150]];
    // Catmull-Rom through the control points -> dense path the cars ride on
    const PATH=[]; for(let i=0;i<track.length-1;i++){ const p0=track[Math.max(0,i-1)],p1=track[i],p2=track[i+1],p3=track[Math.min(track.length-1,i+2)];
      for(let k=0;k<12;k++){ const u=k/12, u2=u*u, u3=u2*u, f=(a,b,c2,d)=>.5*((2*b)+(-a+c2)*u+(2*a-5*b+4*c2-d)*u2+(-a+3*b-3*c2+d)*u3); PATH.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]); } }
    PATH.push(track[track.length-1]);
    const CUM=[0]; for(let i=1;i<PATH.length;i++) CUM.push(CUM[i-1]+Math.hypot(PATH[i][0]-PATH[i-1][0],PATH[i][1]-PATH[i-1][1])); const TL=CUM[CUM.length-1];
    function build(c){
      grad(c,0,150,480,62,['#2a2a6a','#202060','#16184c','#0e1038']);
      grad(c,0,208,480,62,['#a88a7a','#8a6a62','#6a5050']);
      for(let i=0;i<200;i++) P(c,(i*53)%480,212+(i*31)%58,i%2?'#9a7a6a':'#b8968a');
      // pier deck + pilings
      R(c,190,166,290,6,'#6a4a3a'); R(c,190,166,290,1,'#9a7a5a'); for(let x=196;x<480;x+=14){ R(c,x,172,3,40,'#3a2a22'); R(c,x,186,3,1,'#5a4a3a'); }
      // carnival booths: low stalls standing on the deck, behind the rail
      [['#ff5ab4','PRIZES'],['#5ae8ff','TACOS'],['#ffd27a','SODA']].forEach(([col,name],i)=>{ const x=204+i*34;
        R(c,x,149,30,17,'#2a1a3a'); R(c,x+29,149,1,17,'#1a1028'); for(let k=0;k<5;k++) R(c,x-1+k*6.4|0,144,7,5,k%2?'#f4f0f8':col); R(c,x-1,149,32,1,mix(col,'#000',.35));
        text(c,name,x+15-textW(name,1)/2|0,151,'#fff',1); R(c,x+3,157,24,6,'#ffd890'); R(c,x+3,157,24,1,'#fff4d0'); R(c,x+2,163,26,1,'#6a4a3a'); });
      for(let x=190;x<480;x+=6) R(c,x,160,1,6,'#d8c8b8'); R(c,190,160,290,1,'#e8d8c8');
      // ferris wheel support legs
      line(c,FW.x-30,166,FW.x,FW.y,'#d8d4e8'); line(c,FW.x+30,166,FW.x,FW.y,'#d8d4e8'); line(c,FW.x-29,166,FW.x+1,FW.y,'#a8a4c0');
      // coaster lattice
      for(let i=0;i<PATH.length-1;i++){ const [x0,y0]=PATH[i],[x1,y1]=PATH[i+1]; line(c,x0,y0+2,x1,y1+2,'#b8b4d0'); if(i%3===0) line(c,x0,y0+2,x0,166,'#8a86a8'); }
      for(let i=0;i<PATH.length-1;i++){ const [x0,y0]=PATH[i],[x1,y1]=PATH[i+1]; line(c,x0,y0,x1,y1,'#e8e4f4'); }
      // carnival booths
      // beach details: lifeguard chair, umbrellas, sandcastle
      // lifeguard tower: hut on stilts with a ramp, sized against the people on the sand
      for(const x of [44,82]){ R(c,x,180,3,40,'#e8e0e8'); R(c,x+1,180,1,40,'#b8a8b8'); } line(c,46,196,84,212,'#c8b8c8'); line(c,84,196,46,212,'#c8b8c8');
      R(c,36,176,56,5,'#f4f0f4'); R(c,40,150,48,26,'#ff8a5a'); R(c,40,150,48,2,'#ffb48a'); R(c,46,156,14,10,'#2a3a5a'); R(c,64,156,18,10,'#2a3a5a'); R(c,47,157,3,8,'#8ac6ec');
      R(c,36,146,56,5,'#2ad0c8'); R(c,40,143,48,3,'#1aa8a0'); text(c,'5',61,168,'#fff',1); line(c,92,180,118,218,'#c8b8c8'); line(c,93,180,119,218,'#a898a8');
      R(c,64,128,1,15,'#e8e0e8'); R(c,65,128,8,5,'#ff3a3a');
      // umbrellas, towels, cooler, surfboard
      for(const [x,y,col] of [[134,236,'#ff5a9a'],[176,248,'#ffd24a'],[22,252,'#5ae8ff']]){
        ell(c,x+4,y,15,3,'rgba(60,30,40,.25)'); R(c,x,y-34,2,34,'#e8e0f0'); R(c,x+1,y-34,1,34,'#9a8aa8');
        R(c,x-16,y-36,34,3,col); R(c,x-12,y-39,26,3,col); R(c,x-6,y-41,14,2,col); for(let i=0;i<4;i++) R(c,x-14+i*9,y-36,4,3,'#fff6ee'); R(c,x-16,y-33,34,1,mix(col,'#000',.3)); }
      R(c,122,242,24,9,'#2ad0c8'); R(c,122,245,24,1,'#fff'); R(c,162,254,24,9,'#ff8a5a'); R(c,162,257,24,1,'#fff'); R(c,192,250,12,9,'#3a8ad8'); R(c,192,250,12,2,'#e8f0ff');
      c.fillStyle='#ffd24a'; c.beginPath(); c.ellipse(106,232,4,14,-.2,0,Math.PI*2); c.fill(); line(c,104,220,108,244,'#ff5a9a');
      disc(c,70,262,4,'#ffffff'); R(c,66,261,8,2,'#ff3a3a'); R(c,69,258,2,8,'#3a8ad8');
      R(c,96,256,18,8,'#c8a07a'); R(c,99,248,12,8,'#c8a07a'); R(c,102,242,6,6,'#c8a07a'); for(let x=96;x<114;x+=3) P(c,x,256,'#a88060'); P(c,105,240,'#ff3a3a');
    }
    function frame(c,t,env){
      const lamp=env.tod?env.tod.lampK:1, rot=t*.18;
      // ferris wheel: rim, spokes, swinging gondolas
      c.strokeStyle='#e8e4f4'; c.lineWidth=1; c.beginPath(); c.arc(FW.x,FW.y,FW.r,0,Math.PI*2); c.stroke(); c.beginPath(); c.arc(FW.x,FW.y,FW.r-4,0,Math.PI*2); c.stroke();
      for(let i=0;i<12;i++){ const a=rot+i*Math.PI/6, x=FW.x+Math.cos(a)*FW.r, y=FW.y+Math.sin(a)*FW.r; line(c,FW.x,FW.y,x,y,'#c8c4dc');
        R(c,x-3,y+1,7,5,NEON[i%6]); R(c,x-3,y+1,7,1,'#fff'); if(lamp>.3){ const on=((t*3+i)|0)%3; if(on) SK.glow(c,x,y,7,NEON[i%6],.55); } }
      disc(c,FW.x,FW.y,4,'#f4f0f8'); if(lamp>.3) for(let i=0;i<24;i++){ const a=-rot*1.5+i*Math.PI/12; if(((t*6+i)|0)%2) P(c,FW.x+Math.cos(a)*FW.r,FW.y+Math.sin(a)*FW.r,'#ffe8b0'); }
      // coaster car riding the track
      { const at=d=>{ d=Math.max(0,Math.min(TL-.01,d)); let i=0; while(CUM[i+1]<d) i++; const [x0,y0]=PATH[i],[x1,y1]=PATH[i+1], q=(d-CUM[i])/(CUM[i+1]-CUM[i]); return [x0+(x1-x0)*q,y0+(y1-y0)*q,Math.atan2(y1-y0,x1-x0)]; };
        const head=fr(t/11)*(TL+30);
        for(let k=0;k<3;k++){ const d=head-k*6; if(d<0||d>TL) continue; const [x,y,a]=at(d);
          c.save(); c.translate(x,y); c.rotate(a); c.fillStyle='#e83a5a'; c.fillRect(-2.5,-4,5,4); c.fillStyle='#ff8aa0'; c.fillRect(-2.5,-4,5,1); c.fillStyle='#d79a72'; c.fillRect(-1,-6,2,2); c.restore(); } }
      // string lights chase along the pier rail
      for(let x=192;x<480;x+=5){ const on=((t*8+x/5)|0)%4!==0; if(on) P(c,x,158,NEON[(x/5|0)%6]); }
      // reflections of the wheel
      if(lamp>.3) for(let y=176;y<206;y+=2) if(Math.sin(t*3+y)>-.2) R(c,FW.x-20+Math.sin(t*2+y*.5)*3,y,40,1,'rgba(255,140,200,.12)');
      // waves on the sand
      for(let i=0;i<3;i++){ const ph=fr(t*.3+i*.33), y=208+ph*8; c.fillStyle='rgba(255,250,240,'+(.6*(1-ph)).toFixed(2)+')'; for(let x=(i*23)%30;x<190;x+=30) c.fillRect(x,Math.round(y),20,1); }
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'pier', name:'Waning Sands Pier', sub:'Ferris wheel lights over the surf', tag:'Waning Sands', weather:'clear', build, frame,
      sounds:{ waves:.5, crowd:.45, wind:.15, horns:.1, rain:.2, thunder:.1 }, mapAt:[1253,860],
      sky:{x:0,y:0,w:480,h:150,horizon:154}, relight:.6, clouds:{n:7,y0:4,y1:70,seed:31,speed:3}, water:[152,208,{spread:60}], air:{banner:46,text:'WANING SANDS'},
      birds:{ fly:[{kind:'gull',y:40,n:4,every:17,speed:24},{kind:'pelican',y:70,n:4,every:41,speed:15,v:1,night:false}], perch:[{kind:'gull',x:84,y:143},{kind:'gull',x:232,y:143,every:33}] },
      npcs:[{kind:'walk',x0:196,x1:470,y:166,k:.24,speed:5},{kind:'couple',x0:200,x1:460,y:166,k:.24,speed:4},{kind:'fish',x:470,y:166,k:.24,line:20},{kind:'lie',x:132,y:248,k:.46},{kind:'dogwalk',x0:0,x1:190,y:266,k:.44,speed:8},{kind:'jog',x0:0,x1:190,y:224,k:.36},{kind:'stand',x:60,y:176,k:.3}] });
  })();

  /* ===================== SUNDOWN SPEEDWAY ===================== */
  (function(){
    const S={};
    // side-on main straight: grandstand behind, pit wall, two racing lines, catch fence in front
    function build(c){
      // grandstand: stepped tiers with a roof
      R(c,0,92,480,6,'#3a3048'); R(c,0,92,480,1,'#6a5a7a');
      for(let x=0;x<480;x+=40){ R(c,x+18,98,3,20,'#2a2238'); }
      R(c,0,104,480,62,'#2a2238');
      S.crowd=[]; const g=rng(41);
      for(let row=0;row<10;row++){ const y=108+row*6; R(c,0,y+4,480,1,'#3a3048');
        for(let x=1+(row%2)*2;x<478;x+=4){ if(g()<.12) continue; const col=NEON[Math.floor(g()*6)], skin=['#f1c7a5','#d9a27c','#b97a52','#8a5636','#5e3a24'][Math.floor(g()*5)];
          R(c,x,y+1,3,3,mix(col,'#2a2238',.35)); P(c,x+1,y,skin); if(g()<.18) S.crowd.push([x,y,col]); } }
      // sponsor boards along the pit wall
      R(c,0,166,480,14,'#e8e4f0'); R(c,0,166,480,1,'#ffffff'); R(c,0,179,480,2,'#8a8498');
      const ads=[['VICE OIL','#ff5ab4','#14101e'],['SUNDOWN','#ffd27a','#2a1440'],['LEONIDA','#5ae8ff','#10203a'],['TURBO','#ff8a2a','#1a1010'],['CRYSTAL','#e8e4f0','#3a2a5a']];
      for(let i=0;i<8;i++){ const [t,fg,bg]=ads[i%5], x=i*60+2; R(c,x,168,56,10,bg); text(c,t,x+4,171,fg,1); }
      // track: asphalt with rumble strips and lane line
      grad(c,0,181,480,73,['#2a2632','#221e2a','#1a1622']);
      for(let x=0;x<480;x+=8){ R(c,x,181,4,3,'#e83a3a'); R(c,x+4,181,4,3,'#f4f0f8'); }
      for(let x=0;x<480;x+=24) R(c,x,222,14,1,'#d8d0c0');
      for(let i=0;i<120;i++) P(c,(i*53)%480,186+(i*29)%64,'#2e2a38');
      // tyre marks
      for(let i=0;i<6;i++) R(c,30+i*80,236+(i%2)*6,40,1,'#14101a');
      // checkered start/finish line
      for(let y=182;y<254;y+=3) for(let x=0;x<6;x+=3) R(c,236+x+((y/3)%2?3:0),y,3,3,'#f4f0f8');
      R(c,232,90,2,92,'#5a5266'); R(c,246,90,2,92,'#5a5266'); R(c,232,86,16,6,'#14101e'); text(c,'FIN',234,87,'#ffd27a',1);
      // grass verge + catch fence in front
      R(c,0,254,480,16,'#2a4a2a'); R(c,0,254,480,1,'#e8e4f0');
      // floodlight towers + scoreboard
      S.flood=[]; for(const x of [30,160,320,450]){ R(c,x,30,3,62,'#4a4a5a'); R(c,x-8,24,19,8,'#3a3a4a'); for(let k=0;k<4;k++) R(c,x-6+k*4,26,3,4,'#fff8d0'); S.flood.push(x); }
      R(c,196,40,88,40,'#14101e'); R(c,196,40,88,2,'#ff5ab4'); text(c,'SUNDOWN',212,46,'#ffd27a',2); text(c,'500',230,62,'#5ae8ff',2); R(c,238,80,4,12,'#2a2238');
    }
    // two racing lines; cars in a lane share a base speed so they never drive through each other
    const lanes=[{y:216,v:210,cars:[['super','#e83a3a',7],['muscle','#3a8ae8',24],['super','#ffd24a',3]]},
                 {y:250,v:240,cars:[['muscle','#2ad0a0',88],['super','#ff5ab4',11],['muscle','#f4f0e8',42],['super','#8a5aff',51]]}];
    function frame(c,t,env){
      const lamp=env.tod?env.tod.lampK:1;
      for(const [x,y,col] of S.crowd){ const up=Math.sin(t*4+x*.7+y)>.75; R(c,x,y+1,3,3,mix(col,'#2a2238',.35)); if(up){ P(c,x-1,y-1,mix(col,'#fff',.3)); P(c,x+3,y-1,mix(col,'#fff',.3)); } }
      for(const x of S.flood){ SK.glow(c,x+2,28,26,'#fff8d0',.9); if(lamp>.4){ c.fillStyle='rgba(255,250,220,.05)'; c.beginPath(); c.moveTo(x-6,30); c.lineTo(x+10,30); c.lineTo(x+60,250); c.lineTo(x-50,250); c.fill(); } }
      text(c,'LAP '+(1+Math.floor(t/12)%200),216,74,'#ff5ab4',1);
      for(const ln of lanes){ const n=ln.cars.length, span=900;
        ln.cars.forEach(([m,col,num],i)=>{ const jitter=Math.sin(t*.7+i*2)*14, x=((t*ln.v+i*(span/n)+jitter)%span+span)%span-140;
          if(x<-100||x>490) return;
          for(let k=1;k<6;k++) R(c,Math.round(x-k*10),ln.y-10-(k%3)*4,8,1,'rgba(255,255,255,'+(.18-k*.03).toFixed(2)+')');
          LIFE.car(c,x,ln.y,m,col,1,t,{speed:ln.v});
          const L=LIFE.car.len(m); disc(c,Math.round(x+L*.45),ln.y-13,5,'#f4f0f8'); text(c,String(num),Math.round(x+L*.45)-(num>9?3:1),ln.y-15,'#14101e',1);
          if(Math.sin(t*9+i)>.85){ for(let k=0;k<3;k++) P(c,Math.round(x-2-k*2),ln.y-6+((k+i)%2),'#ffb040'); } }); }
      // catch fence in front of the cars
      for(let x=0;x<480;x+=12) R(c,x,240,1,30,'#6a6276'); R(c,0,240,480,1,'#8a8298'); R(c,0,256,480,1,'#6a6276');
      for(let y=242;y<270;y+=3) for(let x=(y%2)*2;x<480;x+=4) P(c,x,y,'rgba(150,140,170,.3)');
      // flag marshal on the start gantry
      { const w=Math.sin(t*8)*2; R(c,238,154,4,10,'#ff8a2a'); R(c,238,150,4,4,'#d79a72'); line(c,241,152,247,146,'#cfcfdf'); for(let y=0;y<6;y+=2) for(let x=0;x<8;x+=2) R(c,247+x,140+y+Math.round(w*(x/8)),2,2,((x+y)/2)%2?'#fff':'#111'); }
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'speedway', name:'Sundown Speedway', sub:'Floodlights and V8 thunder', tag:'Sundown', weather:'clear', build, frame,
      sounds:{ traffic:.7, crowd:.6, industrial:.2, wind:.15, rain:.2, thunder:.1 }, mapAt:[1010,365],
      sky:{x:0,y:0,w:480,h:92,horizon:96}, relight:.8, clouds:{n:5,y0:2,y1:40,seed:33,speed:3},
      birds:{ fly:[{kind:'crow',y:20,n:3,every:31,speed:22,nightKind:'bat'}] },
      npcs:[{kind:'photo',x:70,y:166,k:.26},{kind:'stand',x:400,y:166,k:.26},{kind:'walk',x0:280,x1:470,y:166,k:.26,speed:5}] });
  })();

  /* ===================== HAMLET GAS & DINER ===================== */
  (function(){
    const S={};
    function build(c){
      // far treeline, power poles
      for(let x=0;x<480;x+=8) disc(c,x,154+Math.round(Math.sin(x*.09)*3),7,'#1a2a20'); R(c,0,156,480,4,'#1a2a20');
      for(const x of [20,140,260,380,500]){ R(c,x,92,2,68,'#1a1420'); R(c,x-8,96,18,2,'#1a1420'); }
      c.strokeStyle='rgba(10,8,16,.9)'; c.lineWidth=1; c.beginPath(); for(let i=0;i<4;i++){ c.moveTo(-100+i*120+21,97); c.quadraticCurveTo(-40+i*120+21,106,20+i*120+21,97); } c.stroke();
      // lot
      grad(c,0,160,480,70,['#2a2430','#221e2a','#1a1622']);
      // gas station canopy + store
      R(c,36,120,180,40,'#3a2e3a'); R(c,36,120,180,2,'#5a4a5a'); R(c,46,130,60,26,'#ffd890'); R(c,46,146,60,10,'#e0a860'); for(let i=0;i<4;i++) R(c,50+i*14,148,8,8,['#ff5a5a','#5ae8ff','#ffd24a','#9aff7a'][i]);
      R(c,120,126,30,34,'#20182a'); R(c,124,130,22,30,'#ffcf80');
      R(c,24,100,210,12,'#e8e4f0'); R(c,24,112,210,3,'#e0303a'); text(c,'GAS',110,102,'#e0303a',2);
      for(const x of [60,124,188]){ R(c,x,116,4,48,'#c8c4d4'); }
      // pumps
      for(const x of [72,140,200]){ R(c,x,172,12,20,'#e0303a'); R(c,x+2,175,8,6,'#14101e'); R(c,x+2,184,8,2,'#ffd24a'); R(c,x+12,176,2,10,'#1a1a2a'); R(c,x-2,192,16,3,'#5a5a6a'); }
      // price sign
      R(c,12,60,40,40,'#14101e'); R(c,12,60,40,2,'#e0303a'); text(c,'REG',16,66,'#fff',1); text(c,'3.49',16,74,'#ffd24a',1); text(c,'DSL',16,84,'#fff',1); text(c,'3.89',16,92,'#9aff7a',1); R(c,30,100,4,60,'#2a2a36');
      // retro diner
      R(c,264,118,200,46,'#c8c8d8'); R(c,264,118,200,4,'#e8e8f4'); for(let y=124;y<160;y+=3) R(c,264,y,200,1,'#b0b0c4'); R(c,264,150,200,6,'#e0303a');
      S.win=[]; for(let i=0;i<8;i++){ const x=272+i*24; R(c,x,126,18,20,'#ffcf80'); R(c,x,126,18,2,'#fff0c0'); S.win.push(x); }
      R(c,430,124,24,40,'#3a2a3a'); R(c,434,128,16,36,'#ffd890');
      R(c,300,72,8,46,'#2a2a36'); R(c,270,52,70,22,'#14101e'); R(c,270,52,70,2,'#ff5ab4'); text(c,'DINER',282,57,'#ff7ab0',2);
      // road
      R(c,0,230,480,40,'#16121e'); R(c,0,230,480,1,'#3a3446'); for(let x=0;x<480;x+=30) R(c,x,250,16,2,'#d8b84a');
      // forecourt details: ice chest, propane cage, air pump, payphone, trash cans, news box, oil cans
      R(c,152,138,22,22,'#e8f0ff'); R(c,152,138,22,3,'#3a8ad8'); text(c,'ICE',155,144,'#3a8ad8',1); R(c,152,152,22,1,'#9ab0c8');
      R(c,180,140,18,20,'#3a3a46'); for(let x=181;x<198;x+=3) R(c,x,140,1,20,'#6a6a7a'); for(let i=0;i<3;i++) R(c,183+i*5,148,3,10,'#e8e8f0');
      R(c,234,168,8,20,'#3a7a3a'); R(c,235,170,6,5,'#14101e'); line(c,242,176,248,190,'#14101e');
      R(c,246,132,12,22,'#2a2a36'); R(c,248,136,8,8,'#9ac8e8'); R(c,250,146,4,6,'#14101e'); R(c,251,154,2,20,'#2a2a36');
      for(const x of [22,224]){ R(c,x,180,10,14,'#4a4a5a'); R(c,x-1,178,12,3,'#5a5a6a'); }
      R(c,10,182,8,12,'#d83a3a'); R(c,11,184,6,4,'#e8e4f0');
      for(let i=0;i<5;i++) R(c,108+i*5,156,4,4,['#ffd24a','#3a8ad8','#d83a3a','#3aaa5a','#ffd24a'][i]);
      text(c,'OPEN',438,116,'#7aff9a',1); R(c,264,160,200,3,'#8a8a9a');
      // diner stools out front + menu board
      for(let i=0;i<4;i++){ R(c,330+i*22,174,8,2,'#e0303a'); R(c,333+i*22,176,2,10,'#c8c8d8'); }
      R(c,406,166,18,22,'#14101e'); R(c,408,168,14,1,'#ffd24a'); for(let i=0;i<4;i++) R(c,408,172+i*4,10,1,'#e8e4f0'); line(c,406,188,402,196,'#14101e'); line(c,424,188,428,196,'#14101e');
    }
    function frame(c,t,env){
      const lamp=env.tod?env.tod.lampK:1;
      // canopy lights + sign glows
      for(const x of [60,124,188]) SK.glow(c,x+2,118,26,'#fff8e0',.8);
      if(Math.sin(t*9)>-.85) SK.glow(c,305,62,36,'#ff5ab4',.5); else R(c,282,57,56,10,'#14101e');
      SK.glow(c,124,104,30,'#ff3040',.35);
      // diner patrons
      for(let i=0;i<8;i++){ const x=S.win[i]; if((i*7)%3===0) continue; R(c,x+6,136,6,10,'#2a2238'); R(c,x+7,132,4,4,'#2a2238'); }
      // the waitress standing at the counter
      { const x=S.win[3]; R(c,x+6,134,6,12,'#5ae8ff'); R(c,x+6,141,6,1,'#f4f0ff'); R(c,x+7,130,4,4,'#c98a62'); R(c,x+7,129,4,1,'#5a3a2a'); }
      // moths
      for(const [lx,ly] of [[62,120],[126,120],[190,120]]) for(let k=0;k<3;k++){ const a=t*3+k*2.1+lx; P(c,lx+Math.cos(a)*8,ly+Math.sin(a*1.3)*5,'#e8e0c8'); }
      // traffic on the highway: a big rig + others
      // a car filling up at the pump, a parked pickup by the diner
      LIFE.car(c,92,206,'sedan','#e8e8f0',1,t,{lamp:0}); LIFE.car(c,348,214,'pickup','#4a6a8a',-1,t,{lamp:0});
      { const nz=Math.floor(t*.2)%4; if(nz<3){ line(c,152,186,170,194,'#1a1a2a'); } }
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    function over(c,t,env){
      const lamp=env.tod?env.tod.lampK:1;
      // big rig, same 2x detail as the cars: cab with sleeper, chrome stacks, long box trailer
      { const x=Math.round(560-((t*34)%1000)), y=258, sp=Math.floor(t*6)%4;
        R(c,x+4,y-46,44,40,'#3a5a8a'); R(c,x+4,y-46,44,2,'#6a8ab8'); R(c,x,y-26,6,16,'#3a5a8a'); R(c,x,y-26,6,1,'#6a8ab8');
        R(c,x+8,y-42,16,14,'#9ac8e8'); R(c,x+9,y-41,4,12,'#d8f0ff'); R(c,x+26,y-40,16,14,'#2a3a5a'); R(c,x+27,y-39,2,3,'#e8c860');
        R(c,x,y-12,50,4,'#c8ccd8'); R(c,x,y-12,50,1,'#f4f4f8'); R(c,x,y-20,3,6,'#fffbd0'); for(let i=0;i<4;i++) R(c,x+1,y-24+i*2,4,1,'#c8ccd8');
        R(c,x+44,y-62,3,28,'#c8ccd8'); R(c,x+44,y-62,1,28,'#f4f4f8'); if(((t*4)|0)%3===0) disc(c,x+45,y-66,2,'rgba(80,80,90,.5)');
        R(c,x+50,y-56,176,46,'#e8e4f0'); R(c,x+50,y-56,176,2,'#ffffff'); R(c,x+50,y-12,176,3,'#6a6a7a'); for(let k=x+56;k<x+226;k+=12) R(c,k,y-54,1,42,'#d0ccd8');
        R(c,x+64,y-46,148,20,'#e03a5a'); text(c,'LEONIDA FREIGHT',x+80,y-40,'#ffffff',2);
        R(c,x+218,y-50,6,40,'#c8c4d0'); R(c,x+224,y-30,2,4,'#ff3040');
        for(const w of [12,40,52,176,190,204]){ disc(c,x+w,y-5,6,'#121018'); disc(c,x+w,y-5,3,'#8a8a98'); P(c,x+w+[2,0,-2,0][sp],y-5+[0,2,0,-2][sp],'#d8d8e0'); }
        if(lamp>.35){ SK.glow(c,x,y-18,14,'#fff6c0',.8); for(let i=0;i<30;i++){ c.fillStyle='rgba(255,246,200,'+(.2*(1-i/30)*lamp).toFixed(3)+')'; c.fillRect(x-i,y-19-Math.floor(i/8),1,4+Math.floor(i/4)); } SK.glow(c,x+225,y-28,6,'#ff3040',.6); } }
      LIFE.car(c,((t*38)%760)-110,268,'pickup','#8a3a2a',1,t,{speed:38});
      LIFE.car(c,640-((t*50)%880),268,'muscle','#ffd24a',-1,t,{speed:50});
    }
    SCENES.push({ id:'hamlet', name:'Hamlet', sub:'Gas, coffee and a neon diner', tag:'Hamlet · Grassrivers road', weather:'clear', build, frame, over,
      sounds:{ traffic:.4, neon:.3, crickets:.4, frogs:.2, wind:.15, rain:.3, thunder:.15 }, mapAt:[822,1585],
      sky:{x:0,y:0,w:480,h:150,horizon:158}, relight:.9, clouds:{n:6,y0:4,y1:80,seed:35,speed:2.5},
      birds:{ fly:[{kind:'crow',y:40,n:3,every:29,speed:20,nightKind:'bat'},{kind:'hawk',y:30,n:1,every:41,speed:10,night:false}], perch:[{kind:'crow',x:140,y:94,night:false},{kind:'crow',x:262,y:94,every:37,night:false},{kind:'owl',x:380,y:92,every:45}] },
      npcs:[{kind:'stand',x:200,y:204,k:.36},{kind:'walk',x0:270,x1:460,y:194,k:.34,speed:4},{kind:'stand',x:446,y:208,k:.36},{kind:'dogwalk',x0:0,x1:480,y:228,k:.38,speed:6}] });
  })();

  /* ===================== ROOFTOP POOL ===================== */
  (function(){
    const S={};
    function build(c){
      // skyline far below the rooftop edge
      SK.skyline(c,0,480,168,14,46,6,13,['#20204a','#1a1a40','#26245a'],71,{lit:.3,stepY:3,stepX:2});
      S.wins=SK.skyline(c,0,480,168,30,90,10,20,['#3a2a6a','#4a2a5a','#2a3a6a','#5a2a6a'],72,{lit:.45,stepY:3,stepX:2,gap:2});
      // rooftop deck
      grad(c,0,168,480,102,['#3a2e4a','#2e2440','#241c34']); for(let x=0;x<480;x+=16) line(c,x,168,x-40+((x/16)%2)*4,270,'#2a2038'); R(c,0,166,480,3,'#e8e4f0'); for(let x=0;x<480;x+=8) R(c,x,158,1,8,'#c8c4d8'); R(c,0,158,480,1,'#e8e4f0');
      // pool
      R(c,124,194,212,32,'#d8d4e8'); R(c,128,197,204,26,'#1aa8c8'); R(c,128,197,204,3,'#7ae0f0'); for(let i=0;i<4;i++) R(c,134+i*8,195,1,4,'#f4f4f8'); R(c,128,220,204,3,'#0e88a8');
      // LED dance floor in front of the pool
      S.floor=[]; for(let j=0;j<4;j++) for(let i=0;i<12;i++){ const x=150+i*15, y=236+j*8; R(c,x,y,14,7,'#2a1e3a'); S.floor.push([x,y,i+j]); }
      // loungers + umbrellas
      for(const x of [24,60,372,408]){ R(c,x,232,30,5,'#f4f0f8'); R(c,x,224,8,8,'#f4f0f8'); R(c,x+2,237,1,5,'#8a8aa0'); R(c,x+26,237,1,5,'#8a8aa0'); R(c,x+10,233,18,2,['#ff5ab4','#5ae8ff','#ffd27a','#9aff7a'][x%4]); }
      for(const [x,col] of [[54,'#ff5ab4'],[402,'#5ae8ff']]){ R(c,x,196,2,38,'#4a4060'); R(c,x-18,192,38,4,col); R(c,x-13,189,28,3,col); R(c,x-6,187,14,2,col); }
      // potted palms
      for(const x of [104,352]){ R(c,x-7,220,14,14,'#8a5a3a'); R(c,x-8,218,16,3,'#a8703a'); palm(c,x,220,44,2,'#1e5a3a','#2a7a4a',0); }
      // DJ booth + bar
      R(c,196,172,88,20,'#14101e'); R(c,196,172,88,2,'#ff5ab4'); for(let i=0;i<4;i++) R(c,204+i*20,176,12,4,'#2a2a3a'); text(c,'DJ',234,183,'#5ae8ff',1); for(const x of [186,286]){ R(c,x,160,10,32,'#1a1426'); disc(c,x+5,170,3,'#3a3446'); disc(c,x+5,182,4,'#3a3446'); }
      R(c,420,182,56,16,'#5a3a2a'); R(c,420,182,56,2,'#8a5a3a'); for(let i=0;i<5;i++) R(c,424+i*10,174,3,8,NEON[i]);
      // helipad corner
      c.strokeStyle='#e8e4f0'; c.beginPath(); c.arc(30,186,16,0,Math.PI*2); c.stroke(); text(c,'H',28,183,'#e8e4f0',1);
    }
    function frame(c,t,env){
      const lamp=env.tod?env.tod.lampK:1;
      SK.twinkle(c,S.wins,t,'#2a2a5a');
      // pool shimmer + a swimmer
      for(let i=0;i<26;i++){ const x=130+((i*29+t*8)%198), y=199+(i*7)%22; if(Math.sin(t*3+i)>.2) R(c,x,y,4+(i%3),1,'rgba(220,255,255,.55)'); }
      // LED floor + DJ bobbing behind the decks
      for(const [x,y,k] of S.floor){ const on=Math.sin(t*4+k*.9)>.1; if(on){ R(c,x,y,14,7,mix(NEON[(k+Math.floor(t*2))%6],'#2a1e3a',.45)); R(c,x,y,14,1,'rgba(255,255,255,.25)'); } }
      { const b=Math.round(Math.abs(Math.sin(t*4))*2); R(c,234,160-b,12,12,'#2a2238'); R(c,236,152-b,8,8,'#c98a62'); R(c,234,151-b,12,3,'#14101e'); R(c,233,155-b,2,4,'#14101e'); R(c,245,155-b,2,4,'#14101e'); R(c,196,172,88,2,'#ff5ab4'); }
      // swimmer doing laps: touches the wall, turns, swims back
      { const L=164, ph=(t*10)%(2*L), fwd=ph<L, x=142+(fwd?ph:2*L-ph), d=fwd?1:-1, y=Math.round(208+Math.sin(t*2)*2), s=Math.floor(t*4)%2, X=v=>Math.round(x+v*d);
        R(c,Math.min(X(0),X(8)),y,8,3,'#d79a72'); R(c,Math.min(X(8),X(12)),y-1,4,4,'#2a1a18'); R(c,Math.min(X(-3+s),X(s)),y-2,3,1,'#d79a72'); R(c,Math.min(X(-3),X(0)),y+3-s,3,1,'#d79a72');
        for(let k=0;k<4;k++) R(c,Math.min(X(-6-k*4),X(-4-k*4)),y+1,2,1,'rgba(255,255,255,.5)'); }
      // DJ lights sweeping + string lights
      for(let i=0;i<3;i++){ const a=Math.sin(t*1.5+i*2)*.6-Math.PI/2, x=220+i*20; c.fillStyle='rgba('+['255,90,180','90,232,255','255,210,122'][i]+','+(.1*lamp+.03).toFixed(3)+')'; c.beginPath(); c.moveTo(x,176); c.lineTo(x+Math.cos(a-.08)*160,176+Math.sin(a-.08)*160); c.lineTo(x+Math.cos(a+.08)*160,176+Math.sin(a+.08)*160); c.fill(); }
      for(let x=0;x<480;x+=6){ const y=150+Math.round(Math.sin(x*.03)*4); if(((t*4+x/6)|0)%3) P(c,x,y,NEON[(x/6|0)%6]); }
      // helicopter dropping in now and then
      { const u=fr(t/40); if(u<.5){ const q=u/.5, x=-40+q*70, y=40+q*130; R(c,x,y,16,6,'#2a2a3a'); R(c,x+14,y+1,10,2,'#2a2a3a'); R(c,x+2,y+1,6,3,'#9ac8e8'); R(c,x-6+((t*30)|0)%2*4,y-3,26,1,'rgba(200,200,220,.7)'); if(((t*3)|0)%2) P(c,x+8,y+6,'#ff3a3a'); if(lamp>.4) SK.glow(c,x+8,y+8,10,'#fff6c0',.6); } }
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'rooftop', name:'Rooftop Pool', sub:'A party above Downtown', tag:'Downtown · Vice City', weather:'clear', build, frame,
      sounds:{ crowd:.55, traffic:.25, wind:.2, neon:.08, siren:.12, rain:.2, thunder:.1 }, mapAt:[1075,1285],
      sky:{x:0,y:0,w:480,h:156,horizon:164}, relight:.85, clouds:{n:6,y0:4,y1:70,seed:37,speed:3},
      birds:{ fly:[{kind:'pigeon',y:60,n:4,every:23,speed:30,nightKind:'bat'},{kind:'gull',y:40,n:2,every:31,speed:22,dir:-1}], perch:[{kind:'pigeon',x:120,y:158,night:false},{kind:'pigeon',x:330,y:158,every:31,night:false}] },
      npcs:[{kind:'dance',x:176,y:254,k:.42},{kind:'dance',x:214,y:264,k:.44},{kind:'dance',x:252,y:256,k:.42},{kind:'dance',x:292,y:266,k:.44},{kind:'dance',x:318,y:252,k:.42},{kind:'lie',x:40,y:236,k:.4},{kind:'lie',x:388,y:236,k:.4},{kind:'stand',x:446,y:204,k:.32},{kind:'stand',x:462,y:206,k:.32},{kind:'photo',x:120,y:262,k:.44}] });
  })();

  /* ===================== SUNSET KEY MARINA ===================== */
  (function(){
    const S={};
    function dock1(c){ R(c,0,206,480,6,'#7a5a3a'); R(c,0,206,480,1,'#b8885a'); for(let x=0;x<480;x+=12) R(c,x,206,1,6,'#4a3220'); for(let x=30;x<480;x+=60) R(c,x,200,4,6,'#2a2a3a'); }
    function yacht(c,x,y,col){ R(c,x,y,70,10,'#f4f0f8'); R(c,x+8,y-8,48,8,'#f4f0f8'); R(c,x+18,y-14,26,6,'#e8e4f0'); for(let i=0;i<6;i++) R(c,x+12+i*7,y-6,4,3,'#2a3a6a'); R(c,x+22,y-12,18,3,'#2a3a6a'); R(c,x,y+8,70,2,col); R(c,x+34,y-22,1,8,'#c8c4d4'); }
    function build(c){
      // distant islands
      for(const [x,w] of [[60,90],[260,60],[400,110]]){ ell(c,x,148,w/2,5,'#1a2a2a'); for(let i=0;i<4;i++) palm(c,x-w/3+i*w/5,146,14,1,'#14281c','#1e3a2a',0); }
      grad(c,0,146,480,124,['#2a2a6a','#1e2e66','#16265a','#0e1a44']);
      // marina docks
      R(c,0,206,480,6,'#7a5a3a'); R(c,0,206,480,1,'#b8885a'); for(let x=0;x<480;x+=12) R(c,x,206,1,6,'#4a3220'); for(let x=6;x<480;x+=40) R(c,x,212,4,30,'#3a2818');
      R(c,0,252,480,6,'#7a5a3a'); R(c,0,252,480,1,'#b8885a'); for(let x=20;x<480;x+=48) R(c,x,258,4,12,'#3a2818');
      // beach bar on stilts (left)
      R(c,10,150,90,6,'#6a4a30'); for(let x=14;x<100;x+=16) R(c,x,156,3,50,'#4a3220'); R(c,20,128,70,22,'#8a5a38'); c.fillStyle='#c89a50'; c.beginPath(); c.moveTo(12,130); c.lineTo(55,108); c.lineTo(98,130); c.closePath(); c.fill();
      R(c,26,134,58,12,'#2a1a14'); for(let i=0;i<4;i++) R(c,30+i*14,137,8,7,'#ffb050'); text(c,'SUNSET',34,130,'#ffe8b0',1);
      // bollards + ropes
      for(let x=30;x<480;x+=60){ R(c,x,200,4,6,'#2a2a3a'); }
    }
    function frame(c,t,env){
      const lamp=env.tod?env.tod.lampK:1;
      // moored yachts + sailboats bobbing
      yacht(c,130,196+Math.round(Math.sin(t*.8)*1),'#e0306a'); yacht(c,300,194+Math.round(Math.sin(t*.7+1)*1),'#2a7ad0');
      // the near edge of the back dock covers the yacht hulls (they are moored behind it)
      dock1(c);
      // jet ski carving a wake
      { const a=t*.5, x=240+Math.cos(a)*170, y=176+Math.sin(a*2)*10, d=-Math.sin(a)>0?1:-1; R(c,x-5,y,11,3,'#ffd24a'); R(c,x-1,y-5,3,5,'#2a2a3a'); R(c,x-1,y-7,3,2,'#d79a72'); for(let k=1;k<12;k++){ const px=240+Math.cos(a-k*.04)*170, py=176+Math.sin((a-k*.04)*2)*10+3; P(c,px,py,'rgba(255,255,255,'+(.7-k*.05).toFixed(2)+')'); P(c,px,py+1,'rgba(255,255,255,'+(.4-k*.03).toFixed(2)+')'); } }
      // speedboat across the bay
      { const x=((t*30)%700)-100; R(c,x,160,24,5,'#e83a3a'); R(c,x+6,156,8,4,'#f4f0f8'); for(let i=0;i<14;i++) R(c,x-2-i*4,163+(i%2),3,1,'rgba(255,255,255,'+(.6-i*.04).toFixed(2)+')'); }
      // tiki torches + bar lights
      for(const x of [14,96]){ R(c,x,140,2,12,'#4a3220'); const f=Math.sin(t*14+x)*1.5; R(c,x-1,136+f*.3,4,4,'#ff8a2a'); P(c,x,135,'#ffe070'); SK.glow(c,x,137,10,'#ff9a3a',.8); }
      for(let x=20;x<92;x+=6) if(((t*2+x)|0)%3) P(c,x,128,['#ffe8b0','#ff9ab8','#9ae8ff'][x%3]);
      // dock lamp posts
      for(const x of [120,280,440]){ R(c,x,184,2,22,'#2a2030'); R(c,x-2,182,6,3,'#ffe8b0'); SK.glow(c,x+1,184,14,'#ffd890',.8); }
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    // sailboats in the front basin sit in front of the dock walkers, behind the people on the near quay
    function over(c,t,env){
      for(const [x,y] of [[230,240],[400,242],[50,240]]){ const b=Math.round(Math.sin(t*.9+x)); R(c,x,y+b,40,7,'#f4f0f8'); R(c,x+3,y+6+b,34,2,'#2a3a6a'); R(c,x+19,y-46+b,2,46,'#c8c0d0'); c.fillStyle='rgba(244,240,248,.95)'; c.beginPath(); c.moveTo(x+21,y-46+b); c.lineTo(x+21,y-3+b); c.lineTo(x+40,y-3+b); c.fill(); c.fillStyle='rgba(255,200,120,.9)'; c.beginPath(); c.moveTo(x+18,y-40+b); c.lineTo(x+18,y-3+b); c.lineTo(x+4,y-3+b); c.fill(); }
      LIFE.people(c,SCENES.find(q=>q.id==='sunsetkey'),env,t,e=>e.y>=250);
    }
    SCENES.push({ id:'sunsetkey', name:'Sunset Key Marina', sub:'Yachts, jet skis and rum punch', tag:'Sunset Key · Leonida Keys', weather:'clear', build, frame, over,
      sounds:{ waves:.5, crowd:.3, horns:.3, wind:.2, rain:.2, thunder:.1 }, mapAt:[320,1912],
      sky:{x:0,y:0,w:480,h:142,horizon:148}, relight:.55, clouds:{n:7,y0:4,y1:80,seed:39,speed:2.5}, water:[148,252,{spread:80,lights:[[30,'#ffb050'],[60,'#ffb050'],[120,'#ffd890'],[280,'#ffd890']]}], air:{seaplane:136},
      birds:{ fly:[{kind:'pelican',y:60,n:5,every:39,speed:15,v:1,night:false},{kind:'gull',y:40,n:3,every:21,speed:22,dir:-1},{kind:'flamingo',y:90,n:5,every:67,speed:17,gap:12,night:false}], perch:[{kind:'pelican',x:66,y:206,night:false},{kind:'gull',x:330,y:206,every:31},{kind:'gull',x:448,y:252,every:37}] },
      npcs:[{kind:'walk',x0:0,x1:480,y:206,k:.26,speed:5},{kind:'couple',x0:20,x1:460,y:206,k:.26,speed:4},{kind:'fish',x:210,y:252,k:.36,line:10},{kind:'stand',x:56,y:150,k:.2},{kind:'stand',x:74,y:150,k:.2},{kind:'photo',x:360,y:252,k:.36},{kind:'dogwalk',x0:0,x1:480,y:252,k:.36,speed:7}] });
  })();
})();
