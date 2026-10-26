// Extra life for the outdoor places: small animated scenes drawn in code (original pixel art).
window.DET = (function(){
  const {R,P,line,disc,ell,text} = PX;
  const puff=(c,x,y,r,a,col)=>disc(c,Math.round(x),Math.round(y),Math.max(1,Math.round(r)),'rgba('+(col||'235,235,245')+','+Math.max(0,a).toFixed(2)+')');
  const D={};

  /* ---------------- Downtown Vice City ---------------- */
  D.downtown=(c,t)=>{
    // police-style helicopter with a sweeping searchlight
    { const hx=((t*16)%640)-80, hy=34+Math.sin(t*.7)*5, bx=hx+6+Math.sin(t*.9)*30, by=200;
      for(let i=0;i<46;i++){ const k=i/46, x1=hx+(bx-hx)*k, y1=hy+4+(by-hy)*k, w=1+k*9; c.fillStyle='rgba(255,250,220,'+(0.11*(1-k*.6)).toFixed(3)+')'; c.fillRect(Math.round(x1-w/2),Math.round(y1),Math.max(1,Math.round(w)),4); }
      R(c,hx,hy,14,5,'#14101c'); R(c,hx+12,hy+1,10,2,'#14101c'); R(c,hx+22,hy-3,1,6,'#14101c'); R(c,hx+3,hy-3,8,1,'#2a2438');
      const rot=Math.floor(t*30)%2; R(c,hx-6+rot*3,hy-4,24-rot*6,1,'rgba(200,200,220,.6)');
      if(((t*3)|0)%2) P(c,hx+7,hy+5,'#ff3a3a'); if(((t*2)|0)%2) P(c,hx+22,hy-3,'#ffffff'); }
    // aircraft warning lights on the towers
    for(const [x,y] of [[96,58],[212,48],[420,40]]) if(((t*1.2+x)|0)%2) P(c,x,y,'#ff3a3a');
    // traffic light cycling red / green / yellow
    { const ph=t%10, col=ph<5?'red':(ph<9?'green':'yellow'); R(c,461,196,2,28,'#2a2a3c'); R(c,458,186,8,16,'#0a0716');
      const cs={red:'#ff3a3a',yellow:'#ffd24a',green:'#3aff7a'};
      [['red',189],['yellow',193],['green',197]].forEach(([k,y])=>{ R(c,461,y,2,2,k===col?cs[k]:'#2a2236'); });
      SK.glow(c,462,col==='red'?190:(col==='yellow'?194:198),9,cs[col],.55); }
    // hot-dog cart with steam and fairy lights
    { R(c,384,206,26,9,'#d8d0c0'); R(c,384,206,26,2,'#f4eefa'); R(c,386,196,22,3,'#e0507a'); for(let i=0;i<5;i++) R(c,386+i*5,196,3,3,'#f4eefa');
      R(c,396,198,1,8,'#6a5a7a'); disc(c,388,216,2,'#1a1426'); disc(c,406,216,2,'#1a1426');
      for(let i=0;i<3;i++){ const q=(t*8+i*6)%14; puff(c,392+Math.sin(t*2+i)*2+i*4,204-q,2,.5-q/30); }
      for(let x=384;x<410;x+=6) P(c,x,194+((x/6)%2),((t*2+x)|0)%2?'#ffe08a':'#ff7ac8'); }
    // metro entrance
    { R(c,26,176,2,38,'#2a2a3c'); R(c,6,176,24,11,'#0a0716'); R(c,6,176,24,1,'#3aff9a'); text(c,'METRO',8,180,'#3aff9a',1);
      R(c,4,202,30,12,'#0e2a22'); for(let i=0;i<4;i++) R(c,6+i*7,204+i,6,1,'#3aff9a'); SK.glow(c,18,208,20,'#3aff9a',.28); }
    // OPEN neon blinking in the cafe window
    if(Math.sin(t*6)>-.6) text(c,'OPEN',38,184,'#ff5ab4',1);
    // a stray cat crossing the sidewalk
    { const cx=((t*9)%600)-40, st=Math.floor(t*4)%2; R(c,cx,208,8,3,'#0a0716'); R(c,cx+7,206,3,3,'#0a0716'); P(c,cx+8,205,'#0a0716'); P(c,cx+10,205,'#0a0716'); R(c,cx-3,206,1+st,3,'#0a0716'); R(c,cx+1,211,1,2+st,'#0a0716'); R(c,cx+6,211,1,3-st,'#0a0716'); P(c,cx+9,207,'#8dffb0'); }
  };

  /* ---------------- Ocean Beach ---------------- */
  D.beach=(c,t)=>{
    // kite on a string, flown by a kid on the sand
    { const kx=350+Math.sin(t*.6)*12, ky=58+Math.cos(t*.5)*6; line(c,kx,ky+5,401,215,'rgba(255,255,255,.5)');
      c.fillStyle='#ff5a9a'; c.beginPath(); c.moveTo(kx,ky-6); c.lineTo(kx+5,ky); c.lineTo(kx,ky+6); c.lineTo(kx-5,ky); c.closePath(); c.fill(); R(c,kx-5,ky,5,1,'#ffd27a');
      for(let i=1;i<6;i++) P(c,kx+Math.sin(t*3+i)*2,ky+6+i*3,i%2?'#2ad0c8':'#ffd27a');
      LIFE.personAt(c,398,232,LIFE.look(11),t,'front',.26,1); }
    // beach volleyball
    { R(c,138,214,1,24,'#e8e0f0'); R(c,202,214,1,24,'#e8e0f0'); for(let x=139;x<202;x+=2) for(let y=216;y<224;y+=2) P(c,x,y,'rgba(240,235,250,.8)'); R(c,138,215,65,1,'#fff');
      const ph=(t*.5)%2, dir=ph<1?1:-1, q=ph%1, bx=dir>0?126+q*90:216-q*90, by=222-Math.sin(q*Math.PI)*34; disc(c,bx,by,2,'#fff6e0'); P(c,bx,by,'#ff5a9a');
      for(const [px,sd] of [[124,1],[218,-1]]){ const jump=((dir*sd>0)&&q>.85)||((dir*sd<0)&&q<.15)?-5:0; LIFE.personAt(c,px,236+jump,LIFE.look(sd>0?3:8),t,'front',.32,sd); } }
    // ice-cream cart with a striped awning
    { const X=330, Y=217; R(c,X,Y-12,26,10,'#f8e0a0'); R(c,X,Y-12,26,2,'#fff'); for(let i=0;i<6;i++) R(c,X-2+i*5,Y-22,5,4,i%2?'#ff5a9a':'#fff'); R(c,X,Y-18,1,8,'#6a5a7a'); R(c,X+25,Y-18,1,8,'#6a5a7a');
      ell(c,X+13,Y+1,15,2,'rgba(60,30,40,.25)'); disc(c,X+4,Y,2,'#1a1426'); disc(c,X+22,Y,2,'#1a1426'); P(c,X+12,Y-8,'#ff5a9a'); P(c,X+16,Y-8,'#2ad0c8'); }
    // two surfers riding the swell
    for(const [x0,sp,ph] of [[60,7,0],[320,-6,2]]){ const x=((x0+t*sp)%520+520)%520-20, y=162+Math.sin(t*1.2+ph)*2; R(c,x,y+4,12,1,'#fff6e0'); R(c,x+4,y-2,2,6,'#2a1a3a'); R(c,x+4,y-4,2,2,'#d79a72'); R(c,x+2,y,2,1,'#2a1a3a'); R(c,x+6,y,2,1,'#2a1a3a'); }
    // a dog sprinting along the shore
    { const dx=((t*36)%600)-30, f=Math.floor(t*8)%2; R(c,dx,236,8,4,'#6a4a2a'); R(c,dx+7,234,4,4,'#6a4a2a'); R(c,dx+10,235,2,1,'#2a1a14'); R(c,dx+(f?1:2),240,1,3,'#6a4a2a'); R(c,dx+(f?5:4),240,1,3,'#6a4a2a'); R(c,dx-3,233+f,3,1,'#6a4a2a'); }
    // lifeguard flag
    R(c,303,138,1,16,'#fff'); { const w=Math.sin(t*5); R(c,304,139,6,3,'#ff3a3a'); R(c,310+(w>0?1:0),140,2,2,'#ff3a3a'); }
  };

  /* ---------------- Leonida Keys ---------------- */
  D.keys=(c,t)=>{
    // twinkling string lights on the tiki roof and along the dock
    for(let i=0;i<14;i++){ const x=348+i*8, y=126+Math.round(Math.sin(i*.9)*2); if(((t*2+i)|0)%3) P(c,x,y,['#ffe8b0','#ff9ab8','#9ae8ff'][i%3]); }
    for(let x=4;x<230;x+=10){ const y=192+Math.round(Math.sin(x*.2)*1.5); if(((t*1.5+x*.3)|0)%2) P(c,x,y,'#ffd890'); }
    // patrons swaying at the bar
    // patrons seen through the lit bar windows, each centred in its own window and clipped to it
    for(const [i,col] of [[0,'#1a0e08'],[1,'#2a1a14'],[3,'#1a0e08'],[4,'#2a1a14']]){ const wx=370+i*14, b=Math.sin(t*1.5+i*2)>.3?1:0;
      c.save(); c.beginPath(); c.rect(wx,140,8,8); c.clip(); R(c,wx+2,144+b,4,5,col); R(c,wx+3,141+b,2,3,col); R(c,wx+1,146+b,6,3,col); c.restore(); }
    // a sea turtle swimming past
    { const tx=((t*6)%560)-30, ty=238+Math.sin(t*.8)*3, f=Math.floor(t*2)%2; ell(c,tx,ty,7,4,'#3a6a4a'); ell(c,tx,ty-1,5,2,'#5a9a6a'); R(c,tx+7,ty-1,4,3,'#6a9a5a'); R(c,tx-2,ty+3+f,3,2,'#4a7a5a'); R(c,tx+3,ty+3-f,3,2,'#4a7a5a'); }
    // a fish leaps now and then
    { const ph=(t*.35)%1; if(ph<.3){ const q=ph/.3, fx=300+q*50, fy=204-Math.sin(q*Math.PI)*16; R(c,fx,fy,5,2,'#c8e8f0'); R(c,fx-2,fy,2,2,'#9ac8d8'); P(c,fx+4,fy-1,'#fff'); }
      if(ph>.28&&ph<.45){ const r=(ph-.28)*40; ell(c,350,206,Math.round(r*1.5),Math.max(1,Math.round(r*.5)),'rgba(255,255,255,'+(.5-(ph-.28)).toFixed(2)+')'); } }
    // blinking buoys
    for(const x of [252,424]){ const by=196+Math.sin(t*1.3+x)*1.5; R(c,x,by-5,4,6,'#e8e0f0'); R(c,x,by-3,4,2,'#ff3a3a'); if(((t*1.5)|0)%2){ P(c,x+1,by-7,'#ff3a3a'); SK.glow(c,x+2,by-7,5,'#ff3a3a',.5); } }
    // seagull on a lamp post and a crab on the planks
    { R(c,130,177,6,3,'#f4f0f8'); R(c,134,175,3,3,'#f4f0f8'); P(c,137,176,'#ffb84a'); if(((t*.4)|0)%7===0) R(c,128,175,3,1,'#f4f0f8'); R(c,130,180,1,2,'#ffb84a');
      const cx=40+(Math.sin(t*.6)+1)*60, cf=Math.floor(t*6)%2; R(c,cx,203,5,3,'#e8604a'); P(c,cx,202,'#e8604a'); P(c,cx+4,202,'#e8604a'); R(c,cx-1,205+cf,1,1,'#e8604a'); R(c,cx+5,206-cf,1,1,'#e8604a'); }
    // a paddleboarder far out
    { const px=((t*5)%560)-20; R(c,px,148,10,1,'#fff6e0'); R(c,px+4,142,2,6,'#1a1028'); line(c,px+5,144,px+8,149,'#6a4a2a'); }
  };

  /* ---------------- Grassrivers ---------------- */
  D.grassrivers=(c,t)=>{
    // stilt shack with a lit window, lantern, dock and rowboat
    { R(c,392,164,4,36,'#2a1a14'); R(c,424,164,4,36,'#2a1a14'); R(c,384,160,52,5,'#4a3220'); R(c,388,138,44,22,'#5a3a24');
      c.fillStyle='#3a2418'; c.beginPath(); c.moveTo(382,140); c.lineTo(410,122); c.lineTo(438,140); c.closePath(); c.fill();
      const fl=.75+Math.sin(t*11)*.1+Math.sin(t*3)*.08; R(c,396,146,10,9,'#ffd070'); SK.glow(c,401,150,16,'#ffb050',fl*.6); R(c,418,146,8,14,'#1a0e08');
      R(c,432,150,1,12,'#3a2a1a'); disc(c,433,163,2,'#ffb050'); SK.glow(c,433,163,10,'#ffb050',.5+Math.sin(t*8)*.1);
      R(c,360,170,30,3,'#4a3220'); const bb=Math.sin(t*1.1); R(c,346,176+bb,26,4,'#6a4a2a'); R(c,348,174+bb,22,2,'#8a6a3a'); disc(c,360,172+bb,1,'#ffb050'); }
    // a turtle sunning on a log
    { R(c,210,205,42,5,'#3a2a1a'); R(c,210,205,42,1,'#5a4a2a'); ell(c,230,203,6,3,'#3a5a3a'); const hd=Math.sin(t*.5)>.4?2:0; R(c,235,201-hd,3,3,'#5a7a4a'); }
    // frogs on lily pads, throats pulsing
    for(const [x,y,ph] of [[120,236,0],[330,242,2],[420,232,4]]){ const pulse=Math.sin(t*5+ph)>.2; ell(c,x,y+2,7,2,'#2a6a3a'); R(c,x-2,y-3,5,4,'#4a9a3a'); R(c,x-2,y-4,1,1,'#ffe08a'); R(c,x+2,y-4,1,1,'#ffe08a'); if(pulse) R(c,x-1,y,3,2,'#c8e88a'); }
    // fish rings on the surface
    for(let i=0;i<4;i++){ const ph=((t*.5+i*.27)%1), x=90+((i*97)%300), y=184+(i*23)%60; if(ph<.7) ell(c,x,y,Math.max(1,Math.round(ph*14)),Math.max(1,Math.round(ph*4)),'rgba(220,235,255,'+(.45*(1-ph/.7)).toFixed(2)+')'); }
    // bats at dusk
    for(let i=0;i<3;i++){ const bx=((t*(18+i*4)+i*140)%560)-30, by=40+i*14+Math.sin(t*3+i)*5, f=Math.floor(t*10+i)%2; R(c,bx,by,3,2,'#0a0a14'); R(c,bx-3,by-(f?2:0),3,1,'#0a0a14'); R(c,bx+3,by-(f?2:0),3,1,'#0a0a14'); }
    // an egret wading
    { const st=((t*.3)|0)%6===0; R(c,300,196,5,4,'#f4f0f8'); R(c,303,188,2,9,'#f4f0f8'); R(c,302,186,4,3,'#f4f0f8'); R(c,306,187,4,1,'#ffd24a'); R(c,301,200,1,6,'#2a2a2a'); R(c,304,200,1,6,'#2a2a2a'); if(st) R(c,308,189,3,1,'#f4f0f8'); }
  };

  /* ---------------- Port Gellhorn ---------------- */
  D.gellhorn=(c,t)=>{
    // OFFICE sign and a warm window
    { R(c,292,152,32,12,'#2a1840'); R(c,292,152,32,1,'#ff5ab4'); text(c,'OFFICE',296,156,Math.sin(t*9)>-.8?'#ff9a5a':'#6a3a2a',1); R(c,296,170,24,20,'#ffd890'); R(c,296,170,24,2,'#fff0c0'); SK.glow(c,308,182,22,'#ffd890',.3); }
    // distant police lights on the highway
    { const ph=t%25; if(ph<8){ const a=Math.floor(t*5)%2, x=150+Math.sin(ph*.4)*10; R(c,x-4,158,10,2,'#14101c'); R(c,x-3,156,3,2,a?'#ff3a3a':'#3a2a3a'); R(c,x+1,156,3,2,a?'#3a2a3a':'#3a6aff'); SK.glow(c,x+(a?-2:3),157,14,a?'#ff3a3a':'#3a6aff',.5); } }
    // a car pulling in, headlights sweeping the wet lot
    LIFE.car(c,520-((t*22)%700),259,'sedan','#5a5a7a',-1,t,{wet:true,speed:22});
    // a stray dog trotting past the doors
    { const dx=((t*8)%560)-30, sniff=Math.sin(t*.8)>.5, f=sniff?0:Math.floor(t*6)%2; R(c,dx,201,9,4,'#8a6a4a'); R(c,dx+8,sniff?202:199,4,4,'#8a6a4a'); R(c,dx+(f?1:2),205,1,3,'#8a6a4a'); R(c,dx+(f?6:5),205,1,3,'#8a6a4a'); R(c,dx-3,199+f,3,1,'#8a6a4a'); }
    // a cat on the roof
    { const sw=Math.sin(t*1.5)>0?1:0; R(c,196,89,5,5,'#0a081a'); R(c,197,86,3,3,'#0a081a'); P(c,197,85,'#0a081a'); P(c,199,85,'#0a081a'); R(c,201,90+sw,4,1,'#0a081a'); P(c,198,87,'#ffd24a'); }
    // litter tumbling along the ground
    { const lx=((t*30)%560)-20, ly=262-Math.abs(Math.sin(t*5))*4, f=Math.floor(t*8)%2; R(c,lx,ly,f?4:3,f?3:4,'#d8d0c0'); }
    // one lamp that flickers
    if(Math.sin(t*17)>.9) SK.glow(c,197,153,26,'#0a081a',.35);
  };

  /* ---------------- Ambrosia ---------------- */
  D.ambrosia=(c,t)=>{
    // conveyor belt carrying sacks
    R(c,262,160,76,3,'#2a2236'); for(let x=264;x<338;x+=6) P(c,x,163+((x/6+Math.floor(t*6))%2),'#6a5a78');
    for(let i=0;i<4;i++){ const sx=262+((t*14+i*19)%70); R(c,sx,155,7,5,'#e8dcc0'); R(c,sx,155,7,1,'#fff6e0'); }
    // steam vents on the roof
    for(const x of [218,336]){ R(c,x,90,3,6,'#6a5a78'); R(c,x-1,89,5,1,'#8a7a98'); for(let i=0;i<4;i++){ const ph=((t*.5+i*.25+x*.01)%1); puff(c,x+1+ph*8+Math.sin(t+i)*1.5,87-ph*22,2+ph*3,.5*(1-ph)); } }
    // furnace glow and the silo's warning light
    SK.glow(c,300,160,20,'#ff7a3a',.25+Math.sin(t*9)*.05); if(((t*1.5)|0)%2){ P(c,27,88,'#ff3a3a'); SK.glow(c,27,88,6,'#ff3a3a',.5); }
    // windmill
    { const wx=452; line(c,wx-5,188,wx,130,'#4a3a4a'); line(c,wx+5,188,wx,130,'#4a3a4a'); R(c,wx-1,130,3,3,'#8a7a8a'); for(let i=0;i<4;i++){ const a=t*1.2+i*Math.PI/2; line(c,wx,131,wx+Math.cos(a)*14,131+Math.sin(a)*14,'#d8d0e0'); } }
    // tractor crawling through the cane, dust behind (big rear wheel, cab with glass, exhaust)
    { const tx=((t*10)%680)-90, y=244, bob=Math.round(Math.sin(t*6)*.6); for(let i=0;i<7;i++) puff(c,tx-6-i*9,y-4-i*.8,3+i*.9,.36*(1-i/7),'200,180,130');
      const sp=Math.floor(t*4)%4;
      R(c,tx+12,y-22+bob,40,12,'#c8402a'); R(c,tx+12,y-22+bob,40,2,'#e8684a'); R(c,tx+40,y-20+bob,14,8,'#a8301a'); for(let i=0;i<4;i++) R(c,tx+42,y-19+i*2+bob,10,1,'#6a1a0a');
      R(c,tx+6,y-40+bob,22,20,'#c8402a'); R(c,tx+8,y-38+bob,18,10,'#9ac8e8'); R(c,tx+9,y-37+bob,4,8,'#d8f0ff'); R(c,tx+16,y-38+bob,1,10,'#c8402a'); R(c,tx+4,y-42+bob,26,3,'#2a2a36');
      R(c,tx+14,y-34+bob,5,5,'#2a1a14'); R(c,tx+14,y-36+bob,5,2,'#e8c85a');   // driver + cap
      R(c,tx+46,y-34+bob,2,13,'#3a3a46'); R(c,tx+45,y-35+bob,4,2,'#2a2a36'); if(((t*3)|0)%2) puff(c,tx+47,y-40,2,.5,'90,90,100');
      R(c,tx+52,y-14,4,3,'#e8c85a'); P(c,tx+54,y-13,'#fffbd0');
      disc(c,tx+14,y-11,11,'#1a1426'); disc(c,tx+14,y-11,6,'#e8c85a'); disc(c,tx+14,y-11,2,'#8a6a20'); for(let k=0;k<12;k++){ const a=k*Math.PI/6+sp*.3; P(c,tx+14+Math.round(Math.cos(a)*10),y-11+Math.round(Math.sin(a)*10),'#3a3446'); }
      disc(c,tx+46,y-6,6,'#1a1426'); disc(c,tx+46,y-6,3,'#e8c85a'); P(c,tx+46,y-6,'#8a6a20'); }
    // crows circling
    for(let i=0;i<5;i++){ const a=t*.35+i*1.3, cx=200+Math.cos(a)*90+i*20, cy=120+Math.sin(a*1.3)*22, f=Math.floor(t*6+i)%2; R(c,cx,cy,3,1,'#0a0612'); R(c,cx-2,cy-(f?1:0),2,1,'#0a0612'); R(c,cx+3,cy-(f?1:0),2,1,'#0a0612'); }
    // a pickup on the road
    LIFE.car(c,520-((t*28)%660),186,'pickup','#4a6a9a',-1,t,{speed:28});
  };

  /* ---------------- Mount Kalaga ---------------- */
  D.kalaga=(c,t)=>{
    // cabin: chimney smoke, warm window, porch lantern
    for(let i=0;i<5;i++){ const ph=((t*.25+i*.2)%1); puff(c,449-ph*22+Math.sin(t*1.2+i)*2,170-ph*40,2+ph*4,.4*(1-ph),'200,205,225'); }
    { const fl=.8+Math.sin(t*10)*.08; SK.glow(c,445,212,18,'#ffd070',fl*.55); R(c,440,206,10,12,'#ffd070'); R(c,426,208,1,6,'#3a2a22'); disc(c,426,216,2,'#ffb050'); SK.glow(c,426,216,10,'#ffb050',.5+Math.sin(t*7)*.1); }
    // a deer grazing at the forest edge, every so often
    { const ph=(t%45)/45; if(ph<.35){ const q=ph/.35, x=150+Math.sin(q*3)*16+q*14, grz=Math.sin(t*1.5)>.2; R(c,x,224,12,6,'#1a1612'); R(c,x+11,grz?228:221,4,5,'#1a1612'); R(c,x+13,grz?226:218,1,3,'#1a1612'); R(c,x+14,grz?226:218,1,3,'#1a1612');
        R(c,x+1,230,1,7,'#1a1612'); R(c,x+4,230,1,7,'#1a1612'); R(c,x+9,230,1,7,'#1a1612'); R(c,x+11,230,1,7,'#1a1612'); R(c,x-2,224,2,2,'#e8e0d0'); } }
    // bats over the trees
    for(let i=0;i<3;i++){ const bx=((t*(20+i*5)+i*160)%560)-30, by=80+i*20+Math.sin(t*4+i)*6, f=Math.floor(t*12+i)%2; R(c,bx,by,3,2,'#05060e'); R(c,bx-3,by-(f?2:0),3,1,'#05060e'); R(c,bx+3,by-(f?2:0),3,1,'#05060e'); }
    // fireflies in the clearing
    for(let i=0;i<14;i++){ const fx=(i*37+Math.sin(t*.7+i)*20+480)%480, fy=222+(i*11)%40+Math.cos(t*.9+i*2)*8, a=(Math.sin(t*2+i)+1)/2; if(a>.5){ P(c,fx,fy,'#e8ff8a'); if(a>.85) SK.glow(c,Math.round(fx),Math.round(fy),4,'#e8ff8a',.7); } }
    // hanging lantern at the tent
    { R(c,126,208,1,12,'#5a4a3a'); R(c,124,220,5,6,'#ffd070'); R(c,124,219,5,1,'#3a2a1a'); SK.glow(c,126,223,16,'#ffd070',.4+Math.sin(t*9)*.08); }
    // marshmallow on a stick over the fire
    { const sw=Math.sin(t*.9)*3; line(c,266,236,250+sw,243,'#6a4a2a'); disc(c,250+sw,243,1,Math.floor(t*.5)%2?'#fff6e0':'#d8a060'); }
    // trail-camera LED
    if(((t*.33)|0)%2===0&&((t*3)|0)%2===0) P(c,302,200,'#ff3a3a');
    // coyote on a far ridge, head up
    { const up=Math.sin(t*.35)>.3; R(c,408,150,8,4,'#0a0f1e'); R(c,414,up?144:148,3,6,'#0a0f1e'); R(c,416,up?142:147,3,2,'#0a0f1e'); R(c,406,149,2,4,'#0a0f1e'); R(c,409,154,1,4,'#0a0f1e'); R(c,414,154,1,4,'#0a0f1e'); }
  };

  return { frame(id,c,t,env){ const f=D[id]; if(f) f(c,t,env||{}); } };
})();
