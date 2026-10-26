// New places: Ocean Drive (street perspective), Port Vice City promenade, Lake Leonida bridge,
// Vice City International Airport, and the reef under the Keys. Original pixel art, night-authored (relit by TOD).
(function(){
  const {R,P,rng,mix,line,disc,ell,grad,dither,text,textW,palm} = PX;
  const fr=x=>x-Math.floor(x);
  const quad=(c,a,b,d,e,col)=>{ c.fillStyle=col; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.lineTo(d[0],d[1]); c.lineTo(e[0],e[1]); c.closePath(); c.fill(); };
  const lerp=(a,b,t)=>a+(b-a)*t, L2=(p,q,t)=>[lerp(p[0],q[0],t),lerp(p[1],q[1],t)];

  /* ===================== OCEAN DRIVE ===================== */
  (function(){
    const VP=[300,146], S={};
    // depth z (0 = at the bottom of the screen) -> scale
    const sc=z=>1/(1+z*.55);
    const onLine=(xb,z)=>{ const s=sc(z); return [VP[0]+(xb-VP[0])*s, VP[1]+(270-VP[1])*s, s]; };
    function build(c){
      // distant skyline haze beyond the street
      SK.skyline(c,228,300,148,8,30,5,9,['#3a2a5a','#2e2450','#44305e'],41,{lit:.3,stepY:3,stepX:2});
      // sea on the right horizon
      grad(c,300,138,180,14,['#3a2a6a','#2a3a7a','#1a2a5a']);
      // beach sand, right
      c.fillStyle='#c89a88'; c.beginPath(); c.moveTo(VP[0],VP[1]); c.lineTo(480,150); c.lineTo(480,270); c.lineTo(430,270); c.closePath(); c.fill();
      for(let i=0;i<300;i++){ const g=rng(i+3)(); const x=310+((i*53)%170), y=152+((i*29)%118); if(x>VP[0]+(y-VP[1])*1.0) P(c,x,y,i%3?'#b88a7a':'#d8aa94'); }
      // right sidewalk + grass strip
      quad(c,VP,[396,270],[430,270],VP,'#5a3a5a'); c.fillStyle='#4a6a4a'; c.beginPath(); c.moveTo(VP[0],VP[1]); c.lineTo(380,270); c.lineTo(398,270); c.closePath(); c.fill();
      // road
      c.fillStyle='#1c1428'; c.beginPath(); c.moveTo(VP[0],VP[1]); c.lineTo(380,270); c.lineTo(104,270); c.closePath(); c.fill();
      for(let i=0;i<14;i++){ const z0=i*1.1, a=onLine(242,z0), b=onLine(242,z0+.45); line(c,a[0],a[1],b[0],b[1],'#d8b84a'); }
      // curbs
      line(c,VP[0],VP[1],104,270,'#8a6a8a'); line(c,VP[0],VP[1],380,270,'#8a6a8a');
      // left sidewalk
      c.fillStyle='#6a4a6a'; c.beginPath(); c.moveTo(VP[0],VP[1]); c.lineTo(104,270); c.lineTo(20,270); c.closePath(); c.fill();
      for(let i=0;i<10;i++){ const a=onLine(104,i*1.4), b=onLine(20,i*1.4); line(c,a[0],a[1],b[0],b[1],'#5a3a5a'); }
      // crosswalk
      for(let i=0;i<9;i++){ const x0=118+i*30; c.fillStyle='#e8e0ec'; c.beginPath(); c.moveTo(x0,262); c.lineTo(x0+16,262); c.lineTo(x0+14,252); c.lineTo(x0+2,252); c.closePath(); c.fill(); }
      // art-deco hotels along the left, receding
      const B=[ [0,1.1,.95,'#f6a8c8','#ff5aa0','HOTEL'], [1.1,2.1,.8,'#9ee8d8','#2ad0c8'], [2.1,3.3,1,'#f8e4a8','#ffb040','SUNSET'], [3.3,4.7,.75,'#c8b0f0','#7a6aff'], [4.7,6.6,.9,'#f6a8c8','#ff5aa0'], [6.6,9.4,.8,'#a8e0f0','#4ab8e8'], [9.4,14,.7,'#f8e4a8','#ffb040'] ];
      const base=z=>onLine(-24,z), topMax=z=>{ const b=base(z); return [b[0],b[1]-230*b[2]]; };
      S.signs=[];
      B.forEach(([z0,z1,hf,col,neon,name],i)=>{
        const b0=base(z0), b1=base(z1), t0=L2(b0,topMax(z0),hf), t1=L2(b1,topMax(z1),hf);
        quad(c,b0,b1,t1,t0,col);
        quad(c,t0,t1,[t1[0],t1[1]+3*b1[2]+1],[t0[0],t0[1]+3*b0[2]+1],mix(col,'#ffffff',.35));       // cornice
        const pt=(u,v)=>L2(L2(b0,b1,u),L2(t0,t1,u),v);
        // neon bands
        for(const v of [.32,.62]){ const a=pt(0,v), e=pt(1,v); line(c,a[0],a[1],e[0],e[1],neon); line(c,a[0],a[1]+1,e[0],e[1]+1,mix(neon,'#000',.3)); }
        // windows
        const cols=Math.max(2,Math.round(8*b0[2])), rows=Math.max(3,Math.round(9*hf));
        for(let u=0;u<cols;u++) for(let v=0;v<rows;v++){ const uu=(u+.25)/cols, vv=.14+(v/rows)*.8; if(vv>.3&&vv<.36||vv>.6&&vv<.66) continue;
          const p0=pt(uu,vv), p1=pt(uu+.5/cols,vv), p2=pt(uu+.5/cols,vv+.45/rows), p3=pt(uu,vv+.45/rows); quad(c,p0,p1,p2,p3,(u+v+i)%3?'#2a2450':'#3a3468'); }
        // ground-floor arcade
        const a0=pt(0,0), a1=pt(1,0), h0=pt(0,.16), h1=pt(1,.16); quad(c,a0,a1,h1,h0,mix(col,'#000',.35));
        for(let u=0;u<cols;u++){ const p0=pt((u+.15)/cols,.01), p1=pt((u+.85)/cols,.01), p2=pt((u+.85)/cols,.13), p3=pt((u+.15)/cols,.13); quad(c,p0,p1,p2,p3,'#ffcf80'); }
        if(name&&b0[2]>.3) S.signs.push([pt(.2,.4),name,neon,b0[2]]);
      });
      // vertical neon sign on the nearest hotel
      R(c,58,40,16,92,'#1a1030'); R(c,58,40,16,1,'#ff5aa0'); 'PALMS'.split('').forEach((ch,i)=>text(c,ch,61,46+i*17,'#ff7ac8',2));
      R(c,120,104,62,14,'#1a1030'); text(c,'SUNSET',126,107,'#ffd27a',2);
      // lifeguard tower on the beach
      R(c,452,196,2,14,'#7a4a5a'); R(c,466,196,2,14,'#7a4a5a'); R(c,446,186,28,10,'#9ee8d8'); R(c,444,183,32,4,'#ff5aa0'); R(c,452,189,7,5,'#2a2250');
      // beach life on the right, scaled by distance (y): umbrellas, towels, a juice kiosk, surfboards, volleyball net
      const sz=y=>Math.max(.25,(y-146)/124);
      const umb=(x,y,col)=>{ const k=sz(y), h=Math.round(30*k), w=Math.round(30*k); ell(c,x+2,y,Math.round(w*.5),Math.max(1,Math.round(2*k)),'rgba(80,40,60,.3)'); R(c,x,y-h,Math.max(1,Math.round(2*k)),h,'#e8e0f0');
        R(c,x-w/2|0,y-h-Math.round(3*k),w,Math.max(1,Math.round(3*k)),col); R(c,(x-w*.35)|0,y-h-Math.round(6*k),Math.round(w*.7),Math.max(1,Math.round(3*k)),col); for(let i=0;i<3;i++) R(c,(x-w/2+w*(i*.35+.1))|0,y-h-Math.round(3*k),Math.max(1,Math.round(3*k)),Math.max(1,Math.round(3*k)),'#fff6ee'); };
      const towel=(x,y,col)=>{ const k=sz(y); R(c,x,y,Math.round(16*k),Math.max(2,Math.round(6*k)),col); R(c,x,y+1,Math.round(16*k),1,'#fff'); };
      for(const [x,y,col] of [[412,170,'#ff5a9a'],[446,182,'#2ad0c8'],[470,214,'#ffb040'],[432,236,'#7a6aff'],[408,198,'#ffd24a']]){ towel(x+4,y-2,['#ff8a5a','#2ad0c8','#ff5a9a','#ffd24a','#9ae8ff'][x%5]); umb(x,y,col); }
      // juice kiosk with a striped roof further down the beach
      { const x=376,y=184,k=sz(y)*1.6; R(c,x,y-Math.round(16*k),Math.round(26*k),Math.round(16*k),'#f8e0a0'); for(let i=0;i<5;i++) R(c,x+Math.round(i*5.2*k),y-Math.round(22*k),Math.round(5.2*k),Math.round(6*k),i%2?'#fff':'#2ad0c8');
        R(c,x+Math.round(3*k),y-Math.round(12*k),Math.round(20*k),Math.round(5*k),'#2a2250'); }
      // surfboards stuck in the sand + volleyball net
      for(const [x,col] of [[452,'#ff5a9a'],[458,'#ffd24a'],[464,'#2ad0c8']]){ c.fillStyle=col; c.beginPath(); c.ellipse(x,246,3,14,.08,0,7); c.fill(); R(c,x,234,1,24,'rgba(255,255,255,.5)'); }
      R(c,372,206,1,18,'#e8e0f0'); R(c,420,212,1,18,'#e8e0f0'); for(let i=0;i<=24;i++){ const x=372+i*2, y=208+i*.25; P(c,x,y,'#fff'); P(c,x,y+3,'rgba(255,255,255,.6)'); P(c,x,y+6,'rgba(255,255,255,.4)'); }
      // left sidewalk: café tables under the arcades, a bike rack, a newsstand, potted palms
      for(const z of [.9,2.4,4.2]){ const a=onLine(72,z), k=a[2], x=Math.round(a[0]), y=Math.round(a[1]); R(c,x-Math.round(6*k),y-Math.round(10*k),Math.round(12*k),Math.max(1,Math.round(2*k)),'#ffffff'); R(c,x,y-Math.round(10*k),Math.max(1,Math.round(2*k)),Math.round(10*k),'#c8c4d4');
        for(const d of [-1,1]){ R(c,x+d*Math.round(9*k),y-Math.round(7*k),Math.round(4*k)+1,Math.round(7*k),'#ff5aa0'); } }
      { const a=onLine(96,1.6), k=a[2], x=Math.round(a[0]), y=Math.round(a[1]); for(let i=0;i<4;i++) R(c,x+Math.round(i*6*k),y-Math.round(12*k),Math.max(1,Math.round(k)),Math.round(12*k),'#8a8a98'); R(c,x,y-Math.round(12*k),Math.round(20*k),Math.max(1,Math.round(k)),'#8a8a98');
        disc(c,x+Math.round(4*k),y-Math.round(4*k),Math.max(2,Math.round(4*k)),'#2a2a36'); disc(c,x+Math.round(14*k),y-Math.round(4*k),Math.max(2,Math.round(4*k)),'#2a2a36'); }
      { const a=onLine(60,3.2), k=a[2], x=Math.round(a[0]), y=Math.round(a[1]); R(c,x,y-Math.round(26*k),Math.round(18*k),Math.round(26*k),'#2a6a4a'); R(c,x,y-Math.round(26*k),Math.round(18*k),Math.max(1,Math.round(3*k)),'#ffd24a'); R(c,x+Math.round(3*k),y-Math.round(18*k),Math.round(12*k),Math.round(8*k),'#ffcf80'); }
      for(const z of [.3,1.9,3.6]){ const a=onLine(100,z), k=a[2], x=Math.round(a[0]), y=Math.round(a[1]); R(c,x-Math.round(5*k),y-Math.round(8*k),Math.round(10*k),Math.round(8*k),'#c8643a'); palm(c,x,y-Math.round(8*k),Math.round(22*k),2,'#14301e','#2a6a3a',0); }
      // string lights along the left sidewalk
      S.bulbs=[]; for(let i=0;i<46;i++){ const q=i/46, a=onLine(70,q*6), y=a[1]-58*a[2]+Math.sin(q*Math.PI*6)*3*a[2]; S.bulbs.push([Math.round(a[0]),Math.round(y)]); P(c,a[0],y,'#ffe8b0'); }
    }
    const cars=[...Array(9)].map((_,i)=>({ lane:i%2?'out':'in', off:i*1.7, sp:.32+(i%3)*.06, col:['#ff4f9a','#4ae8ff','#f4f0e8','#ffd24a','#7a5aff','#e83a3a','#2ad0a0','#f4a040','#c8c8d8'][i] }));
    function frame(c,t,env){
      const lamp=env.tod?env.tod.lampK:1;
      SK.twinkle(c,[],t,'#000');
      // palms + lamp posts on the right, receding
      for(const z of [11,7,4.4,2.6,1.4,.5]){ const a=onLine(392,z), s=a[2], sw=Math.sin(t*.9+z)*2*s; palm(c,Math.round(a[0]),Math.round(a[1]),Math.round(120*s),Math.round(6*s),'#14301e','#1e4a2a',sw); }
      for(const z of [9,5,2.2,.4]){ const a=onLine(108,z), s=a[2], h=Math.round(80*s); R(c,a[0],a[1]-h,Math.max(1,Math.round(2*s)),h,'#2a1a3a'); R(c,a[0]-Math.round(6*s),a[1]-h,Math.round(10*s)+1,Math.max(1,Math.round(2*s)),'#2a1a3a'); SK.glow(c,a[0]-Math.round(4*s),a[1]-h+2,Math.max(4,Math.round(24*s)),'#ffe8b0',.75); }
      // string-light twinkle + neon pulse
      for(const [x,y] of S.bulbs) if(Math.sin(t*2+x)>.2) P(c,x,y,['#ffe8b0','#ff9ac8','#9ae8ff'][x%3]);
      if(Math.sin(t*6)>.9) R(c,58,40,16,92,'#1a1030');
      // traffic in perspective: far first
      const list=cars.map(k=>{ const span=12, u=fr(t*k.sp*.12+k.off/span), z=k.lane==='out'?u*span:(1-u)*span; return {k,z}; }).sort((a,b)=>b.z-a.z);
      for(const {k,z} of list){ const a=onLine(k.lane==='out'?300:184,z), s=a[2]*2.3; LIFE.carFR(c,a[0],a[1],k.col,k.lane==='out'?'rear':'front',s,lamp); }
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'oceandrive', name:'Ocean Drive', sub:'Pastel hotels and neon on Vice Beach', tag:'Vice Beach · Vice City', weather:'clear', build, frame,
      sounds:{ traffic:.45, crowd:.4, waves:.3, neon:.1, horns:.1, rain:.2, thunder:.1 }, mapAt:[1300,1110],
      sky:{x:0,y:0,w:480,h:140,horizon:146,sx0:150,sx1:470,arc:120}, relight:.55, clouds:{n:7,y0:4,y1:70,seed:21,speed:3},
      birds:{ fly:[{kind:'gull',y:40,n:4,every:21,speed:24,spread:20},{kind:'parrot',y:60,n:3,every:53,speed:30,night:false}], perch:[{kind:'gull',x:458,y:183},{kind:'pigeon',x:66,y:40,every:31,night:false}] },
      air:{banner:52,text:'OCEAN DRIVE'},
      npcs:[{kind:'cafe',x:40,y:246,k:.6},{kind:'cafe',x:96,y:214,k:.42},{kind:'walk',x0:24,x1:94,y:268,k:.52,speed:6},{kind:'dogwalk',x0:404,x1:476,y:264,k:.52,speed:5},{kind:'photo',x:420,y:236,k:.46},{kind:'stand',x:202,y:196,k:.32},{kind:'stand',x:186,y:212,k:.38},{kind:'lie',x:452,y:250,k:.5}] });
  })();

  /* ===================== PORT VICE CITY PROMENADE ===================== */
  (function(){
    const S={};
    function build(c){
      // far shore: skyline with a landmark tower, port cranes, cable bridge
      SK.skyline(c,0,480,136,10,40,7,14,['#1e1a44','#24204e','#1a183c'],51,{lit:.25,stepY:3,stepX:2});
      S.wins=SK.skyline(c,120,330,136,24,74,10,18,['#3a2a6a','#2a3a7a','#4a2a6a','#30306a'],52,{lit:.42,stepY:3,stepX:2,gap:1});
      R(c,262,40,10,96,'#2a2a5a'); R(c,262,40,1,96,'#5a5a9a'); R(c,264,28,6,12,'#3a3a6a'); R(c,266,10,2,18,'#8a8ab8'); for(let y=46;y<132;y+=5) R(c,264,y,6,1,'#5a5a9a');
      for(const x of [372,410,448]){ line(c,x,136,x+4,70,'#c83a3a'); line(c,x+18,136,x+14,70,'#c83a3a'); R(c,x-12,68,44,3,'#c83a3a'); R(c,x+20,62,4,6,'#c83a3a'); for(let y=80;y<136;y+=12) line(c,x+1,y,x+17,y+8,'#a82a2a'); }
      // bridge deck + pylons + cables
      R(c,0,116,250,3,'#3a3a5a'); R(c,0,119,250,1,'#1a1a30');
      for(const px of [70,180]){ R(c,px,74,4,45,'#4a4a6a'); for(let i=0;i<7;i++){ line(c,px+2,76,px-56+i*8,116,'rgba(200,200,230,.5)'); line(c,px+2,76,px+60-i*8,116,'rgba(200,200,230,.5)'); } }
      for(let x=0;x<250;x+=10) P(c,x,115,'#ffe8b0');
      // water with lit-window reflections
      grad(c,0,136,480,70,['#2a2a62','#1e1e50','#141440','#0c0c30']);
      for(let x=0;x<480;x+=3){ if(x>110&&x<340&&((x*7)%5)<3) for(let y=138;y<190;y+=2) if(((x+y)*13)%7<2) R(c,x,y,2,1,'rgba(255,210,140,.25)'); }
      for(let y=138;y<200;y+=2) R(c,265+((y*3)%5)-2,y,4,1,'rgba(255,220,180,.18)');
      // promenade: railing, pavement, lamp posts, kiosk, benches, trees
      grad(c,0,206,480,64,['#4a3a5a','#3a2e4a','#2a2238']); for(let x=-20;x<500;x+=24) line(c,x,206,x-30,270,'#33283f'); for(let y=214;y<270;y+=10) R(c,0,y,480,1,'#33283f');
      R(c,0,198,480,2,'#8a7a9a'); R(c,0,204,480,2,'#5a4a6a'); for(let x=4;x<480;x+=12) R(c,x,198,2,8,'#6a5a7a');
      // kiosk
      R(c,226,168,72,40,'#5a3a2a'); R(c,226,168,72,2,'#8a5a3a'); for(let i=0;i<9;i++) R(c,222+i*9,160,9,9,i%2?'#f4f0e8':'#e0303a'); R(c,222,169,80,2,'#a82a2a');
      R(c,232,176,60,18,'#ffd890'); R(c,232,188,60,6,'#e0a860'); for(let i=0;i<3;i++) R(c,236+i*18,178,12,6,['#ff7a8a','#7ae0ff','#ffe07a'][i]);
      text(c,'SNACKS',240,196,'#2a1a14',1); R(c,226,208,72,2,'#2a1a14');
      // benches
      for(const bx of [60,392]){ R(c,bx,228,40,3,'#6a4a30'); R(c,bx,220,40,2,'#6a4a30'); R(c,bx+2,231,2,8,'#2a1a14'); R(c,bx+36,231,2,8,'#2a1a14'); }
      // trees framing both sides
      for(const [tx,dir] of [[6,1],[474,-1]]){ R(c,tx-4,30,9,240,'#1a1220'); R(c,tx-4,30,2,240,'#2a1e30'); for(let i=0;i<40;i++){ const g=rng(tx+i); disc(c,tx+dir*(g()*60-10),g()*70,6+g()*10,i%3?'#0e1a14':'#162a1e'); } }
    }
    function frame(c,t,env){
      SK.twinkle(c,S.wins,t,'#1e1e50');
      const lamp=env.tod?env.tod.lampK:1;
      // tower beacon, crane lights, car lights on the bridge
      if(((t*1.2)|0)%2) P(c,267,10,'#ff3a3a'); for(const x of [394,432,470]) if(((t+x)|0)%2) P(c,x,62,'#ff3a3a');
      for(let i=0;i<8;i++){ const x=((t*(20+i*3)+i*60)%280)-10, y=116-x*0; if(x>0&&x<250) P(c,x,114,i%2?'#fffbd0':'#ff4a4a'); }
      // boats: moored sailboats, a ferry crossing, a speedboat with wake (clipped so they pass behind the kiosk)
      c.save(); c.beginPath(); c.rect(0,0,480,270); c.rect(298,158,-76,52); c.clip('evenodd');
      for(const [x,y] of [[40,176],[150,182],[430,178]]){ const b=Math.round(Math.sin(t*.8+x)*1); R(c,x,y+b,22,4,'#e8e4f0'); R(c,x+10,y-22+b,1,22,'#c8c0d0'); c.fillStyle='rgba(240,236,250,.9)'; c.beginPath(); c.moveTo(x+11,y-22+b); c.lineTo(x+11,y-2+b); c.lineTo(x+21,y-2+b); c.fill(); }
      { const x=((t*9)%620)-80; R(c,x,150,46,7,'#e8e4f0'); R(c,x+6,144,30,6,'#d8d4e8'); for(let i=0;i<6;i++) R(c,x+8+i*5,146,3,2,'#ffd27a'); R(c,x,157,46,2,'#3a3a6a'); if(lamp>.4) SK.glow(c,x+23,148,18,'#ffd27a',.4); }
      { const x=520-((t*40)%720); R(c,x,190,18,4,'#f4f0f8'); R(c,x+4,187,6,3,'#2a3a6a'); for(let i=0;i<10;i++) R(c,x+18+i*4,191+(i%2),3,1,'rgba(255,255,255,'+(.6-i*.05)+')'); }
      c.restore();
      // lamp posts
      for(const x of [130,350]){ R(c,x,140,3,66,'#1a1426'); R(c,x-4,138,11,3,'#1a1426'); R(c,x-2,141,7,4,'#ffe8b0'); SK.glow(c,x+1,143,30,'#ffe8b0',.8); SK.glow(c,x+1,206,40,'#ffe0a0',.35); }
      // vendor in the kiosk
      { const b=Math.round(Math.sin(t*1.4)); R(c,256,180+b,8,10,'#e8e0f0'); R(c,257,174+b,6,6,'#c98a62'); R(c,256,172+b,8,3,'#e03a3a'); }
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'harbor', name:'Port Vice City', sub:'The skyline across the bay', tag:'Bayside promenade · Vice City', weather:'clear', build, frame,
      sounds:{ waves:.4, crowd:.3, horns:.45, wind:.2, traffic:.15, rain:.2, thunder:.1 }, mapAt:[1190,1330],
      sky:{x:0,y:0,w:480,h:132,horizon:138}, relight:.85, clouds:{n:6,y0:4,y1:60,seed:23,speed:2.5},
      water:[136,206,{spread:60,lights:[[150,'#ffd27a'],[200,'#ff9ac8'],[290,'#9ae8ff']]}],
      birds:{ fly:[{kind:'gull',y:46,n:4,every:19,speed:22},{kind:'pelican',y:84,n:4,every:47,speed:14,v:1,dir:-1,night:false}], perch:[{kind:'gull',x:150,y:198},{kind:'gull',x:318,y:198,every:37},{kind:'pigeon',x:128,y:138,every:29,night:false}] },
      npcs:[{kind:'fish',x:186,y:212,k:.42,line:-14},{kind:'fish',x:332,y:212,k:.42,line:-12},{kind:'bench',x:72,y:232,k:.4},{kind:'couple',x0:20,x1:460,y:252,k:.5,speed:6},{kind:'dogwalk',x0:10,x1:470,y:264,k:.54,speed:9},{kind:'photo',x:420,y:244,k:.5},{kind:'stand',x:270,y:234,k:.46},{kind:'jog',x0:0,x1:480,y:258,k:.5}] });
  })();

  /* ===================== LAKE LEONIDA BRIDGE ===================== */
  (function(){
    const S={};
    function build(c){
      // distant dome + trees on the far shore
      for(let x=0;x<480;x+=9) disc(c,x,132+Math.round(Math.sin(x*.07)*3),8,'#1a2a2a');
      // far-shore park the dome stands in: lawn, tree line, quay
      R(c,140,132,200,38,'#16241e'); for(let x=140;x<340;x+=7) disc(c,x,146+Math.round(Math.sin(x*.13)*2),6,'#1e3428');
      R(c,140,160,200,6,'#2a3a2a'); R(c,140,166,200,6,'#5a5266'); for(let x=140;x<340;x+=10) R(c,x,166,1,6,'#3a3446');
      // domed hall on a plinth with steps down to the quay
      disc(c,230,104,16,'#7ac8a8'); disc(c,226,99,6,'#9ae0c0'); R(c,214,104,32,4,'#c8c4d4'); R(c,228,82,4,8,'#d8d4e0'); P(c,229,80,'#ff3a3a');
      R(c,206,108,48,46,'#d8d4e0'); R(c,206,108,48,2,'#f4f0f8'); R(c,252,108,2,46,'#b8b4c8'); for(let i=0;i<5;i++) R(c,210+i*9,114,4,36,'#a8a4b8');
      R(c,212,126,4,8,'#ffcf80'); R(c,244,126,4,8,'#ffcf80');
      R(c,200,154,60,3,'#c8c4d4'); R(c,196,157,68,3,'#b8b4c8'); R(c,192,160,76,3,'#a8a4b8'); R(c,192,163,76,3,'#8a8698');
      for(const x of [176,284]){ R(c,x,148,1,14,'#2a2236'); R(c,x-1,147,3,2,'#ffe8b0'); }
      // banks: warm brick terraces on both sides
      const rows=[[0,150,[0,38,64,92,120,148],'#7a3a2a'],[300,480,[300,330,362,394,428,456],'#6a4a6a']];
      S.wins=[];
      rows.forEach(([x0,x1,xs,col],ri)=>{ xs.forEach((x,i)=>{ const w=(xs[i+1]||x1)-x, h=70+((i*23+ri*17)%50), y0=170-h, cc=i%2?col:mix(col,'#4a2a3a',.3);
        R(c,x,y0,w,h,cc); R(c,x,y0,w,2,mix(cc,'#fff',.25)); R(c,x+w-1,y0,1,h,mix(cc,'#000',.3)); R(c,x+2,y0-4,w-4,4,mix(cc,'#000',.2));
        for(let wy=y0+8;wy<160;wy+=12) for(let wx=x+4;wx<x+w-5;wx+=8){ const lit=((wx*7+wy*3)%5)<2; R(c,wx,wy,4,6,lit?'#ffcf80':'#2a2236'); R(c,wx,wy,4,1,'#e8e0d0'); if(lit) S.wins.push([wx,wy]); } }); });
      // shopfronts with signs
      R(c,6,150,60,20,'#1a3a2a'); R(c,10,154,52,12,'#ffd890'); text(c,'BAIT SHOP',12,144,'#7aff9a',1); R(c,6,142,60,8,'#0e1a14');
      R(c,404,150,60,20,'#3a1a2a'); R(c,408,154,52,12,'#ffd890'); R(c,404,142,60,8,'#1a0a12'); text(c,'DINER',418,144,'#ff7ab0',1);
      R(c,440,40,8,60,'#1a0a12'); 'BAR'.split('').forEach((ch,i)=>text(c,ch,442,46+i*14,'#ff5a8a',2));
      // water
      grad(c,0,170,480,100,['#2a2a5a','#1e2048','#141638','#0c0e28']);
      // quay walls
      R(c,0,166,140,6,'#5a5266'); R(c,340,166,140,6,'#5a5266'); for(let x=0;x<480;x+=10){ if(x<140||x>340) R(c,x,166,1,6,'#3a3446'); }
      // near embankments where the bridge lands
      for(const [x0,w,dir] of [[0,84,1],[396,84,-1]]){ R(c,x0,204,w,8,'#7a7288'); R(c,x0,204,w,1,'#a8a0b8'); for(let x=x0;x<x0+w;x+=8) R(c,x,205,1,7,'#5a5266');
        R(c,x0,212,w,58,'#4a4258'); for(let y=216;y<270;y+=6) for(let x=x0+((y/6)%2)*6;x<x0+w;x+=12) R(c,x,y,11,1,'#3a3448');
        const ex=dir>0?x0+w-1:x0; R(c,ex,204,1,66,'#2a2436'); R(c,dir>0?x0+w-6:x0+2,236,4,4,'#8a8098'); R(c,dir>0?x0+w-5:x0+3,237,2,2,'#4a4258');
        for(let y=214;y<268;y+=4) if(((y*7)%9)<2) R(c,dir>0?x0+w-3:x0+1,y,2,1,'#2a5a3a'); }
      R(c,20,186,2,18,'#1a1426'); R(c,17,182,8,5,'#2a2236'); R(c,18,183,6,3,'#ffe8b0'); R(c,458,186,2,18,'#1a1426'); R(c,455,182,8,5,'#2a2236'); R(c,456,183,6,3,'#ffe8b0');
      R(c,40,198,22,2,'#6a4a30'); R(c,40,192,22,2,'#6a4a30'); R(c,42,200,1,4,'#2a1a14'); R(c,59,200,1,4,'#2a1a14');   // bench on the near bank
      // the arched footbridge with white lattice railings
      c.strokeStyle='#e8e4f0'; c.lineWidth=2; c.beginPath(); c.moveTo(70,206); c.quadraticCurveTo(240,128,410,206); c.stroke();
      c.lineWidth=1; c.strokeStyle='#c8c4d8'; c.beginPath(); c.moveTo(70,198); c.quadraticCurveTo(240,120,410,198); c.stroke();
      for(let i=0;i<=34;i++){ const u=i/34, x=lerp(70,410,u), y1=lerp(lerp(206,128,u),lerp(128,206,u),u), y2=y1-8; line(c,x,y1,x,y2,'#d8d4e8'); if(i%2) line(c,x,y2,x+5,y1,'#b8b4cc'); }
      c.strokeStyle='#8a86a0'; c.lineWidth=1; c.beginPath(); c.moveTo(70,210); c.quadraticCurveTo(240,140,410,210); c.stroke();
      // lamp arches on the bridge
      S.lamps=[]; for(const u of [.22,.5,.78]){ const x=lerp(70,410,u), y=lerp(lerp(206,128,u),lerp(128,206,u),u)-8; c.strokeStyle='#e8e4f0'; c.beginPath(); c.arc(x,y-10,7,Math.PI,0); c.stroke(); R(c,x-1,y-20,2,4,'#e8e4f0'); S.lamps.push([x,y-18]); }
      // embankment lamp posts
      for(const x of [30,450]){ R(c,x,120,2,48,'#1a1426'); R(c,x-3,116,8,5,'#2a2236'); R(c,x-2,117,6,3,'#ffe8b0'); }
    }
    function frame(c,t,env){
      for(const [x,y] of S.wins) if(Math.sin(t*.5+x*y)>.97) R(c,x,y,4,6,'#2a2236');
      for(const [x,y] of S.lamps){ P(c,x,y,'#fff4c0'); SK.glow(c,x,y,16,'#ffe8b0',.8); }
      for(const x of [31,451]) SK.glow(c,x,119,22,'#ffe8b0',.7);
      // people crossing the bridge (on the curve)
      // people walk in from a bank, cross the bridge and leave on the other bank
      for(let i=0;i<4;i++){ const d=i%2?1:-1, u=fr(t*.016+i*.27), path=80+360+80, p=u*path; let x,y;
        if(p<80){ x=-10+p; y=209; } else if(p<440){ const q=(p-80)/360; x=lerp(70,410,q); y=lerp(lerp(206,128,q),lerp(128,206,q),q)-1; } else { x=410+(p-440); y=209; }
        if(d<0) x=480-x; LIFE.personAt(c,x,Math.round(y),LIFE.look(i*5+2),t+i,'walk',.28,d); }
      // reflections of lamps and windows
      for(const [x] of S.lamps) for(let y=212;y<262;y+=3) if(Math.sin(t*2+y*.4+x)>-.3) R(c,x-2+Math.sin(t*1.5+y)*2,y,4,1,'rgba(255,230,170,.35)');
      // a little motorboat slipping under the bridge, ducks drifting
      c.save(); c.beginPath(); c.rect(84,170,312,100); c.clip();
      { const x=((t*12)%620)-80; R(c,x,236,26,5,'#e8e4f0'); R(c,x+4,231,10,5,'#3a6aa8'); R(c,x,241,26,1,'#3a3a5a'); for(let i=0;i<8;i++) R(c,x-6-i*4,239+(i%2),3,1,'rgba(255,255,255,'+(.5-i*.05)+')'); }
      for(let i=0;i<4;i++){ const x=(i*90+Math.sin(t*.2+i)*20+t*2)%480, y=222+i*9; R(c,x,y,5,2,'#4a3a2a'); R(c,x+4,y-2,2,2,'#2a6a3a'); P(c,x+6,y-1,'#ffb84a'); }
      c.restore();
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'lake', name:'Lake Leonida', sub:'Lamps on the old footbridge', tag:'Lake Leonida', weather:'drizzle', build, frame,
      sounds:{ crowd:.3, waves:.25, wind:.15, traffic:.1, rain:.4, thunder:.1 }, mapAt:[950,800],
      sky:{x:0,y:0,w:480,h:130,horizon:136}, relight:.9, clouds:{n:7,y0:4,y1:70,seed:25,speed:2},
      water:[170,270,{spread:30,glints:20,clip:[84,396]}],
      birds:{ fly:[{kind:'gull',y:44,n:3,every:23,speed:20},{kind:'pigeon',y:70,n:4,every:29,speed:30,dir:-1,nightKind:'bat'}], perch:[{kind:'gull',x:240,y:120,every:30},{kind:'pigeon',x:30,y:116,every:27,night:false}] },
      npcs:[{kind:'walk',x0:0,x1:130,y:164,k:.3,speed:5},{kind:'walk',x0:350,x1:480,y:164,k:.3,speed:5},{kind:'music',x:110,y:164,k:.3},{kind:'stand',x:380,y:164,k:.3}] });
  })();

  /* ===================== VICE CITY INTERNATIONAL AIRPORT ===================== */
  (function(){
    const S={};
    function jet(c,x,y,s,col,dir,ang,lamp,gear){
      c.save(); c.translate(x,y); c.rotate(ang||0); c.scale(dir*s,s);
      c.fillStyle='#e8ecf4'; c.beginPath(); c.moveTo(-60,-6); c.lineTo(48,-6); c.quadraticCurveTo(62,-5,64,0); c.quadraticCurveTo(62,5,48,6); c.lineTo(-56,6); c.lineTo(-66,-2); c.closePath(); c.fill();
      c.fillStyle=col; c.fillRect(-60,1,108,2);
      c.fillStyle='#2a3a5a'; for(let i=-50;i<44;i+=4) c.fillRect(i,-3,2,2); c.fillRect(54,-4,6,3);
      c.fillStyle=col; c.beginPath(); c.moveTo(-58,-6); c.lineTo(-68,-28); c.lineTo(-56,-28); c.lineTo(-32,-6); c.closePath(); c.fill();
      c.fillStyle='#b8bcc8'; c.beginPath(); c.moveTo(-6,2); c.lineTo(-28,14); c.lineTo(-20,14); c.lineTo(10,3); c.closePath(); c.fill();
      c.fillStyle='#8a8e9a'; c.fillRect(-14,6,14,5);
      if(gear){ c.fillStyle='#14101c'; c.fillRect(-10,6,2,6); c.fillRect(40,6,2,6); c.fillRect(-12,11,6,3); c.fillRect(38,11,6,3); }
      c.restore();
      if(lamp>.3){ const b=((Date.now()/400)|0)%2; P(c,Math.round(x+dir*64*s),Math.round(y),'#fffbd0'); if(b){ P(c,Math.round(x-dir*66*s),Math.round(y-2*s),'#ff3a3a'); P(c,Math.round(x-dir*20*s),Math.round(y+12*s),'#3aff6a'); } }
    }
    S.jet=jet;
    function build(c){
      // distant palms + city haze
      SK.skyline(c,0,480,150,6,22,8,16,['#2a2450','#22204a'],61,{lit:.2,stepY:3,stepX:2});
      for(let x=10;x<480;x+=37) palm(c,x,150,22,2,'#14301e','#1e4a2a',0);
      // ground: grass, taxiway, runway
      grad(c,0,150,480,120,['#2a3a2a','#1e2e1e','#162216']);
      R(c,0,176,480,16,'#2a2a34'); R(c,0,176,480,1,'#4a4a56'); for(let x=0;x<480;x+=14) R(c,x,183,7,1,'#d8b84a');
      R(c,0,204,480,44,'#24242c'); R(c,0,204,480,1,'#e8e8f0'); R(c,0,247,480,1,'#e8e8f0'); for(let x=0;x<480;x+=24) R(c,x,225,14,2,'#e8e8f0');
      for(let i=0;i<8;i++) R(c,20+i*6,210,3,12,'#e8e8f0');
      // hangar (left)
      c.fillStyle='#4a4a5a'; c.beginPath(); c.moveTo(0,176); c.quadraticCurveTo(84,62,168,176); c.closePath(); c.fill(); for(let i=1;i<8;i++){ const x=i*21; line(c,x,176,84+(x-84)*.4,104+Math.abs(x-84)*.3,'#3e3e4e'); }
      R(c,22,132,124,44,'#1e1e2a'); for(let x=24;x<146;x+=10) R(c,x,132,1,44,'#2e2e3c'); R(c,22,132,124,1,'#6a6a7a'); text(c,'HANGAR 3',62,120,'#e8e8f0',1);
      // fuel truck + stairs truck parked by the hangar
      R(c,172,169,11,5,'#e8e4f0'); R(c,172,169,11,1,'#fff'); R(c,183,167,5,7,'#d83a3a'); R(c,184,168,3,2,'#8ac6ec'); R(c,174,174,2,2,'#14101c'); R(c,184,174,2,2,'#14101c');
      // control tower
      R(c,196,80,10,96,'#c8c4d4'); R(c,196,80,2,96,'#e8e4f0'); R(c,186,64,30,16,'#3a4a6a'); R(c,188,66,26,10,'#8ac6ec'); R(c,184,62,34,3,'#e8e4f0'); R(c,200,50,2,12,'#a8a8b8');
      // terminal with glass curtain wall and jet bridges
      R(c,270,120,210,56,'#5a5a72'); R(c,270,120,210,3,'#8a8aa0'); for(let x=274;x<480;x+=8) R(c,x,128,6,40,'#2a3a5a'); for(let x=274;x<480;x+=8) R(c,x,128,6,1,'#8ac6ec');
      R(c,330,108,120,12,'#2a2a3a'); text(c,'VICE CITY INTL',338,111,'#ffe8b0',1);
      for(const x of [300,380]){ R(c,x,164,50,6,'#8a8aa0'); R(c,x+46,164,4,14,'#6a6a7a'); }
    }
    function frame(c,t,env){
      const lamp=env.tod?env.tod.lampK:1;
      // runway edge + approach strobes
      for(let x=4;x<480;x+=16){ P(c,x,204,'#7ab8ff'); P(c,x,247,'#7ab8ff'); if(lamp>.4){ SK.glow(c,x,204,3,'#7ab8ff',.7); } }
      { const k=Math.floor(t*6)%8; R(c,20+k*6,208,3,2,'#ffffff'); SK.glow(c,21+k*6,209,6,'#ffffff',.8); }
      // tower beacon, terminal windows
      if(((t*1.3)|0)%2){ P(c,201,50,'#ff3a3a'); SK.glow(c,201,50,6,'#ff3a3a',.7); }
      // parked jet at the gate
      S.jet(c,420,160,1.15,'#e0306a',-1,0,lamp,true);
      // taxiing jet
      { const x=640-((t*10)%960); S.jet(c,x,186,1.05,'#2a7ad0',-1,0,lamp,true); }
      // take-off roll then climb
      { const u=fr(t/34); let x,y,a; if(u<.5){ x=-120+u/.5*380; y=232; a=0; } else { const q=(u-.5)/.5; x=260+q*420; y=232-q*q*200; a=-.2*Math.min(1,q*3); } S.jet(c,x,y,1.45,'#ffb040',1,a,lamp,u<.6); }
      // landing approach high on the left
      { const u=fr(t/41+.4); if(u<.6){ const q=u/.6, x=-60+q*300, y=60+q*140; S.jet(c,x,y,.7,'#3ac860',1,.18,lamp,true); if(lamp>.3) SK.glow(c,x+26,y+4,10,'#fffbd0',.8); } }
      // baggage tug with carts
      { const x=((t*16)%640)-80; R(c,x,196,12,7,'#ffd24a'); R(c,x+2,192,6,4,'#3a4a6a'); disc(c,x+3,203,2,'#14101c'); disc(c,x+10,203,2,'#14101c');
        for(let i=1;i<4;i++){ const bx=x-i*16; R(c,bx,197,13,5,'#6a6a7a'); R(c,bx+1,191,11,6,['#e0507a','#4ab8e8','#7aff9a'][i-1]); R(c,bx+1,191,11,1,'#fff'); disc(c,bx+2,203,2,'#14101c'); disc(c,bx+11,203,2,'#14101c'); R(c,bx+13,199,3,1,'#3a3a46'); } }
      // windsock
      { const sw=Math.sin(t*1.3)*2; R(c,150,150,1,26,'#e8e8f0'); R(c,151,150,4,3,'#ff6a2a'); R(c,155,151+sw*.3,4,2,'#f4f0f0'); R(c,159,151+sw*.5,3,2,'#ff6a2a'); }
      WX.draw(c,t,env.weather,[0,0,480,270]);
    }
    SCENES.push({ id:'airport', name:'Vice City International', sub:'Arrivals over the palms', tag:'Vice City International Airport', weather:'clear', build, frame,
      sounds:{ wind:.3, industrial:.3, traffic:.15, rain:.2, thunder:.1 }, mapAt:[865,1295],
      sky:{x:0,y:0,w:480,h:146,horizon:150}, relight:.8, clouds:{n:6,y0:4,y1:80,seed:27,speed:3},
      birds:{ fly:[{kind:'egret',y:120,n:2,every:37,speed:18,night:false},{kind:'gull',y:60,n:3,every:29,speed:22,nightKind:'bat'}] } });
  })();

  /* ===================== THE REEF (under the Keys) ===================== */
  (function(){
    const S={};
    function coral(c,x,y,kind,col,g){
      if(kind==='brain'){ ell(c,x,y,14,8,col); ell(c,x,y-2,12,6,mix(col,'#fff',.2)); for(let i=-10;i<11;i+=3) line(c,x+i,y-6+Math.abs(i)*.2,x+i+2,y+2,mix(col,'#000',.25)); }
      else if(kind==='fan'){ for(let i=0;i<12;i++){ const a=-Math.PI*.85+i*.13; line(c,x,y,x+Math.cos(a)*22,y+Math.sin(a)*24,col); } }
      else if(kind==='stag'){ const br=(px,py,a,l,d)=>{ if(d>3||l<3) return; const ex=px+Math.cos(a)*l, ey=py+Math.sin(a)*l; line(c,px,py,ex,ey,col); line(c,px+1,py,ex+1,ey,col); br(ex,ey,a-.5,l*.7,d+1); br(ex,ey,a+.45,l*.7,d+1); }; br(x,y,-Math.PI/2,14,0); }
      else if(kind==='tube'){ for(let i=0;i<4;i++){ const h=10+((i*7)%10); R(c,x+i*4,y-h,3,h,col); R(c,x+i*4,y-h,3,1,mix(col,'#000',.4)); } }
      else if(kind==='anemone'){ ell(c,x,y,6,3,col); for(let i=-5;i<6;i+=2) line(c,x+i,y-2,x+i*1.4,y-9,mix(col,'#fff',.3)); }
    }
    function build(c){
      const g=rng(91);
      grad(c,0,0,480,270,['#0e3a5a','#0a2e4e','#082442','#061a34','#04122a']);
      // shipwreck silhouette in the blue distance
      c.fillStyle='#0a2a44'; c.beginPath(); c.moveTo(300,212); c.lineTo(330,160); c.lineTo(470,150); c.lineTo(476,206); c.closePath(); c.fill();
      for(let i=0;i<6;i++) disc(c,344+i*20,176,2,'#06203a'); line(c,400,152,410,96,'#0a2a44'); line(c,401,152,411,96,'#0a2a44'); line(c,410,104,436,120,'#0a2a44');
      // rocks + sand
      grad(c,0,222,480,48,['#3a4a5a','#2e3e4e','#24303e']); for(let i=0;i<260;i++) P(c,Math.floor(g()*480),224+Math.floor(g()*46),g()<.5?'#4a5a6a':'#283442');
      for(const [x,y,rx,ry] of [[80,222,46,22],[230,232,30,14],[420,226,50,20],[12,240,30,24]]){ ell(c,x,y,rx,ry,'#2a2a3e'); ell(c,x-4,y-4,rx-8,ry-8,'#34344a'); }
      disc(c,92,214,7,'#0a0a16');                              // eel hole
      // far reef wall in blue haze
      for(let i=0;i<46;i++){ const x=Math.floor(g()*480), h=8+g()*30, w=6+g()*16, col=mix(['#2a5a7a','#3a4a7a','#2a6a6a'][i%3],'#0a2e4e',.35); ell(c,x,222-h/2,w,h/2,col); if(i%3===0) for(let k=0;k<5;k++) line(c,x,222-h,x+(k-2)*4,222-h-6-g()*8,col); }
      // sponges, sea whips and a giant barrel sponge
      for(const [x,h,col] of [[18,30,'#c8642a'],[176,22,'#9a4ad8'],[318,26,'#d8a03a'],[404,34,'#3aa8a8']]){ R(c,x,232-h,8,h,col); R(c,x+1,232-h,6,2,mix(col,'#000',.5)); R(c,x+8,236-h*.7,6,h*.7,mix(col,'#fff',.15)); R(c,x+9,236-h*.7,4,2,mix(col,'#000',.5)); }
      for(let i=0;i<14;i++){ const x=10+i*34+Math.floor(g()*10), h=16+g()*24, col=['#ff5a8a','#ffb43a','#d85aff','#ff7a5a'][i%4]; c.strokeStyle=col; c.lineWidth=1; c.beginPath(); c.moveTo(x,238); c.quadraticCurveTo(x+6,238-h*.6,x+2,238-h); c.stroke(); }
      ell(c,438,214,16,22,'#7a3a5a'); ell(c,438,196,12,4,'#2a1020'); for(let y=200;y<234;y+=5) R(c,424,y,28,1,'#8a4a6a');
      // corals
      const C=[['brain',150,228,'#d86a8a'],['fan',196,226,'#a85ad8'],['stag',260,230,'#ff9a4a'],['tube',300,232,'#ffd24a'],['anemone',340,236,'#ff6a9a'],['brain',372,240,'#8ad86a'],['fan',30,222,'#ff6a8a'],['stag',120,236,'#ffb46a'],['tube',450,228,'#6ad8d8'],['anemone',212,240,'#d8a8ff'],['fan',470,220,'#ffa86a']];
      for(const [k,x,y,col] of C) coral(c,x,y,k,col,g);
      const K=['brain','fan','stag','tube','anemone'], PAL=['#ff6a9a','#ffd24a','#8ad86a','#ff9a4a','#6ad8d8','#d8a8ff','#ff5a5a','#5aa8ff'];
      for(let i=0;i<34;i++) coral(c,Math.floor(g()*480),238+Math.floor(g()*28),K[i%5],PAL[Math.floor(g()*PAL.length)],g);
      // starfish, shells, sea urchins
      const star=(x,y,col)=>{ for(let a=0;a<5;a++){ const q=a*Math.PI*2/5-Math.PI/2; line(c,x,y,x+Math.round(Math.cos(q)*4),y+Math.round(Math.sin(q)*4),col); } P(c,x,y,mix(col,'#fff',.4)); };
      star(64,258,'#ff7a3a'); star(250,262,'#ff4a6a'); star(392,256,'#ffb43a'); star(470,264,'#d85aff');
      for(const [x,y] of [[140,264],[300,266],[360,260]]){ ell(c,x,y,3,2,'#f4e0d0'); line(c,x-2,y,x+2,y-1,'#c8a090'); }
      for(const [x,y] of [[110,252],[226,256],[420,262]]){ disc(c,x,y,2,'#1a1030'); for(let a=0;a<8;a++){ const q=a*Math.PI/4; P(c,x+Math.round(Math.cos(q)*4),y+Math.round(Math.sin(q)*4),'#2a1a40'); } }
      // anchor line from a boat above
      line(c,60,0,90,200,'rgba(200,190,170,.6)'); R(c,84,198,12,3,'#6a6a7a'); R(c,89,190,2,10,'#6a6a7a');
    }
    const PXF=['#ffd24a','#ff6a9a','#4ab8ff','#8ad86a','#ff9a4a','#c8a8ff'];
    const fishSchool=(c,t,cx,cy,n,col,sp,ph)=>{ for(let i=0;i<n;i++){ const a=t*sp+ph+i*.4, x=cx+Math.sin(a*.3)*140+Math.cos(i*1.7)*10, y=cy+Math.sin(a*.7+i)*8+Math.sin(i*2.3)*6, d=Math.cos(a*.3)>0?1:-1;
      R(c,Math.round(x),Math.round(y),3,1,col); P(c,Math.round(x-d),Math.round(y),mix(col,'#000',.3)); P(c,Math.round(x+d*3),Math.round(y),'#ffffff'); } };
    function frame(c,t,env){
      const T=env.tod, day=T?1-T.P.lamp:.5;
      // surface shimmer + boat hull above
      for(let i=0;i<40;i++){ const x=(i*29+t*6*(i%2?1:-1)%480+480)%480; R(c,x,2+(i%4)*2,10+(i%3)*4,1,'rgba(180,240,255,'+(.25+day*.35).toFixed(2)+')'); }
      R(c,30,0,80,4,'#061624'); R(c,36,4,68,2,'#061624');
      // light rays
      for(let i=0;i<6;i++){ const x=60+i*80+Math.sin(t*.3+i)*20; c.fillStyle='rgba(180,240,255,'+(.04+day*.06).toFixed(3)+')'; c.beginPath(); c.moveTo(x,0); c.lineTo(x+18,0); c.lineTo(x+70,222); c.lineTo(x+30,222); c.fill(); }
      // caustics on the sand
      for(let i=0;i<22;i++){ const x=(i*23+Math.sin(t*.8+i)*8)%480, y=228+(i*7)%36; R(c,x,y,6+Math.sin(t*2+i)*3,1,'rgba(200,250,255,'+(.08+day*.18).toFixed(2)+')'); }
      // sea grass sway
      for(let i=0;i<30;i++){ const x=8+i*16+((i*7)%9), h=10+((i*13)%14), sw=Math.sin(t*1.2+i)*3; c.strokeStyle='#2a8a5a'; c.lineWidth=1; c.beginPath(); c.moveTo(x,262); c.quadraticCurveTo(x+sw*.5,262-h*.5,x+sw,262-h); c.stroke(); }
      // schools of reef fish
      fishSchool(c,t,240,90,22,'#ffd24a',.9,0); fishSchool(c,t,200,150,30,'#c8e8f0',1.1,2); fishSchool(c,t,300,190,16,'#4ab8ff',1.3,4); fishSchool(c,t,120,40,20,'#9ad8ff',.7,6); fishSchool(c,t,380,120,12,'#ff8a5a',1,1);
      // angelfish + parrotfish
      for(const [x0,y,col,col2,sp,ph] of [[0,120,'#ffd24a','#1a1a2a',7,0],[200,200,'#3ad8a8','#2a6ad8',5,3],[340,60,'#ff8a4a','#ffffff',6,1]]){ const x=((x0+t*sp)%560)-40, b=Math.round(Math.sin(t*2+ph));
        ell(c,x,y+b,6,4,col); R(c,x-2,y-3+b,1,7,col2); R(c,x+2,y-3+b,1,7,col2); c.fillStyle=col; c.beginPath(); c.moveTo(x-6,y+b); c.lineTo(x-11,y-4+b); c.lineTo(x-11,y+4+b); c.fill(); P(c,x+4,y-1+b,'#0a0a14'); }
      // sea turtle gliding by
      { const x=((t*6)%620)-60, y=120+Math.sin(t*.4)*12, f=Math.sin(t*2);
        ell(c,x,y,13,8,'#5a7a4a'); ell(c,x,y-1,10,6,'#7a9a5a'); for(let i=-6;i<8;i+=4) line(c,x+i,y-5,x+i+2,y+4,'#4a6a3a'); disc(c,x+15,y-1,4,'#8aa86a'); P(c,x+17,y-2,'#0a0a14');
        line(c,x+6,y+5,x+12+f*3,y+12,'#8aa86a'); line(c,x+7,y+5,x+13+f*3,y+12,'#8aa86a'); line(c,x+6,y-6,x+14-f*3,y-14,'#8aa86a'); line(c,x+7,y-6,x+15-f*3,y-14,'#8aa86a'); line(c,x-10,y+5,x-15,y+9,'#7a9a5a'); }
      // moray eel peeking from its hole
      { const out=Math.max(0,Math.sin(t*.4))*8, open=Math.sin(t*2)>.3; R(c,92-2,214-out,5,out+2,'#8a9a3a'); R(c,92-3,214-out-3,6,4,'#9aaa4a'); P(c,93,214-out-2,'#0a0a14'); if(open) R(c,90,214-out,3,1,'#c83a3a'); }
      // divers with tanks, fins and bubbles
      for(let i=0;i<2;i++){ const x=((t*(9+i*3)+i*240)%640)-80, y=150+i*30+Math.sin(t*.6+i)*6, f=Math.sin(t*4+i);
        R(c,x,y,18,5,['#1a1a2a','#2a1a3a'][i]); R(c,x+4,y-3,10,3,'#e8e8f0'); R(c,x+5,y-4,8,1,'#ffd24a'); R(c,x+18,y-1,5,5,'#c98a62'); R(c,x+19,y,4,2,'#4ab8ff');
        line(c,x,y+2,x-8,y+2+f*3,'#ffd24a'); line(c,x,y+4,x-8,y+4-f*3,'#ffd24a');
        for(let b=0;b<4;b++){ const q=fr(t*.5+b*.25+i*.1), by=y-6-q*70, bx=x+20+Math.sin(t*3+b)*2; if(by>4) disc(c,bx,by,1+(b%2),'rgba(220,250,255,.6)'); }
        if(T&&T.P.lamp>.5){ c.fillStyle='rgba(255,250,210,.12)'; c.beginPath(); c.moveTo(x+22,y+1); c.lineTo(x+90,y-14); c.lineTo(x+90,y+22); c.fill(); } }
      // manta ray gliding high
      { const x=((t*11)%720)-120, y=70+Math.sin(t*.3)*10, f=Math.sin(t*1.6)*4;
        c.fillStyle='#1a2a44'; c.beginPath(); c.moveTo(x+22,y); c.lineTo(x,y-14-f); c.lineTo(x-6,y); c.lineTo(x,y+14+f); c.closePath(); c.fill(); R(c,x-26,y,22,1,'#1a2a44'); R(c,x+20,y-3,5,2,'#1a2a44'); R(c,x+20,y+2,5,2,'#1a2a44'); R(c,x+2,y-6,8,3,'#2a3e5a'); }
      // jellyfish pulsing upward
      for(let i=0;i<4;i++){ const ph=fr(t*.02+i*.25), x=70+i*110+Math.sin(t*.5+i)*12, y=230-ph*240, p=Math.abs(Math.sin(t*2+i)), w=5+Math.round(p*2), col=['#ff9ae8','#9ae8ff','#e8c8ff','#ffd2a8'][i];
        if(y<-20) continue; ell(c,x,y,w,4-Math.round(p),'rgba(255,200,240,.55)'); ell(c,x,y-1,w-2,2,col); for(let k=-2;k<=2;k++) line(c,x+k*2,y+3,x+k*2+Math.sin(t*3+k)*2,y+14+Math.round(p*3),'rgba(255,220,250,.45)'); if(T&&T.P.lamp>.4) SK.glow(c,x,y,10,col,.5); }
      // octopus on the left rock, changing colour
      { const hue=['#c84a3a','#d8843a','#8a4a7a'][Math.floor(t*.2)%3], wob=Math.sin(t*1.5); ell(c,58,204,7,6,hue); disc(c,55,203,1,'#fff'); disc(c,60,203,1,'#fff'); P(c,55,203,'#000'); P(c,60,203,'#000');
        for(let k=0;k<6;k++){ const a=Math.PI*.15+k*Math.PI*.14; line(c,52+k*2,208,52+k*2+Math.cos(a+wob*.3)*8,212+Math.sin(a)*4,hue); } }
      // clownfish darting around an anemone
      for(let i=0;i<3;i++){ const a=t*1.6+i*2.1, x=340+Math.cos(a)*10, y=228+Math.sin(a*1.3)*5, d=-Math.sin(a)>0?1:-1; ell(c,Math.round(x),Math.round(y),3,2,'#ff7a1a'); R(c,Math.round(x),Math.round(y)-2,1,4,'#fff'); P(c,Math.round(x-d*3),Math.round(y),'#ff7a1a'); P(c,Math.round(x+d*2),Math.round(y-1),'#000'); }
      // seahorse bobbing by the sea grass
      { const y=236+Math.sin(t*.9)*3; R(c,268,y,3,8,'#ffb43a'); R(c,269,y-3,4,3,'#ffb43a'); R(c,272,y-2,3,1,'#ffb43a'); P(c,270,y-2,'#000'); R(c,269,y+8,2,2,'#ffb43a'); P(c,268,y+10,'#ffb43a'); }
      // crab scuttling sideways on the sand
      { const x=150+Math.sin(t*.35)*70, f=Math.floor(t*8)%2; R(c,x,258,8,4,'#e85a3a'); R(c,x+1,257,6,1,'#ff8a5a'); P(c,x+2,256,'#000'); P(c,x+5,256,'#000'); R(c,x-2,256-f,2,2,'#e85a3a'); R(c,x+8,256-f,2,2,'#e85a3a'); for(let k=0;k<3;k++){ P(c,x-1,260+k-f%2,'#c84a2a'); P(c,x+8,260+k-(1-f),'#c84a2a'); } }
      // big grouper cruising low and slow
      { const x=520-((t*4)%640), y=200+Math.sin(t*.5)*4; ell(c,x,y,16,7,'#6a5a4a'); ell(c,x,y+2,14,4,'#8a7a5a'); for(let k=-10;k<12;k+=5) P(c,x+k,y-2,'#4a3a2a'); c.fillStyle='#6a5a4a'; c.beginPath(); c.moveTo(x+15,y); c.lineTo(x+24,y-6); c.lineTo(x+24,y+6); c.fill(); P(c,x-11,y-2,'#fff'); P(c,x-11,y-2,'#000'); R(c,x-16,y+1,4,1,'#3a2a1a'); }
      // little fish hiding in the corals
      for(let i=0;i<16;i++){ const bx=20+i*30, ph=Math.sin(t*1.2+i*1.7), x=bx+ph*8, y=214+(i%4)*8+Math.cos(t*2+i)*2; R(c,Math.round(x),Math.round(y),2,1,PXF[i%PXF.length]); P(c,Math.round(x+(ph>0?2:-1)),Math.round(y),'#ffffff'); }
      // drifting plankton
      for(let i=0;i<50;i++){ const x=(i*67+t*(2+i%3))%480, y=(i*41+Math.sin(t*.4+i)*6+480)%220; P(c,x,y,'rgba(200,240,255,'+(.15+((i*13)%10)/40).toFixed(2)+')'); }
      // bioluminescence at night
      if(T&&T.P.lamp>.6) for(let i=0;i<40;i++){ const x=(i*47+Math.sin(t*.3+i)*20)%480, y=(i*31+t*2)%220+10; if(Math.sin(t*2+i)>.5) P(c,x,y,'#7affff'); }
    }
    SCENES.push({ id:'reef', name:'The Reef', sub:'Under the Leonida Keys', tag:'Coral reef · Leonida Keys', weather:'clear', build, frame, under:true,
      sounds:{ waves:.55, wind:0 }, mapAt:[520,1960],
      sky:{x:0,y:0,w:480,h:1,horizon:1}, relight:.85, clouds:{n:0}, air:false,
      skyStops:{ night:['#000000','#000000','#000000','#000000','#000000'] } });
  })();
})();
