// Residents: original, faceless pixel people you can add, remove and customise per place.
window.CAST = (function(){
  const {R,mix,line} = PX;
  const SKIN=['#f0c8a0','#e0b48a','#d79a72','#b87a52','#8a5a3a','#5e3a24'];
  const HAIR=['#1e1214','#3a2a22','#6a4a2a','#a8742a','#d8b060','#8f8f9a','#c8443e','#4a6ad0'];
  const TOP=['#e6def2','#e7a3be','#2a3a52','#c8443e','#4a8a6a','#e8c85a','#6d62b8','#f2f2f2'];
  const BOTTOM=['#2a2740','#6d62b8','#3a4a6a','#8a6a4a','#d8d0c0'];
  const STYLES=[['short','Short'],['long','Long'],['cap','Cap'],['bun','Bun'],['curly','Curly'],['bald','Bald']];
  const SPOTS_APT=[['sofa','On the sofa'],['win-b','At the window'],['win-a','Window · left'],['win-c','Window · right'],['kitchen','In the kitchen'],['rug','Reading on the rug'],['dance','Dancing']];
  const SPOTS_OUT=[['stroll','Strolling'],['stand','Standing around']];
  // where people walk in the outdoor scenes (feet line, left/right limits, size)
  const WALK={ downtown:{y:214,x0:10,x1:470,k:.62}, beach:{y:222,x0:10,x1:470,k:.6}, keys:{y:207,x0:6,x1:224,k:.55}, grassrivers:{y:192,x0:6,x1:122,k:.5},
               gellhorn:{y:244,x0:10,x1:470,k:.62}, kalaga:{y:254,x0:20,x1:460,k:.6} };
  const APT={ sofa:{x:436,y:182}, 'win-a':{x:232,y:206}, 'win-b':{x:264,y:206}, 'win-c':{x:354,y:206}, kitchen:{x:82,y:238}, rug:{x:318,y:250}, dance:{x:236,y:242} };
  const MAXP=6;
  let uidN=1; const uid=()=>'p'+(Date.now().toString(36))+(uidN++);

  const rnd=a=>a[Math.floor(Math.random()*a.length)];
  function make(spot,over){ return Object.assign({ id:uid(), name:'Resident', spot, skin:rnd(SKIN), hairStyle:rnd(STYLES)[0], hair:rnd(HAIR), top:rnd(TOP), bottom:rnd(BOTTOM), x:50 },over||{}); }
  function defaults(){ return { apartment:[
    make('sofa',{name:'Resident 1',skin:SKIN[2],hairStyle:'short',hair:'#2a1a18',top:'#e6def2',bottom:'#6d62b8'}),
    make('win-b',{name:'Resident 2',skin:SKIN[1],hairStyle:'long',hair:'#1e1214',top:'#e7a3be',bottom:'#2a2740'}) ] }; }

  let data=null;
  function load(){ try{ const r=JSON.parse(localStorage.getItem('lofi-leonida-cast')||'null'); data=(r&&typeof r==='object')?r:defaults(); }catch(e){ data=defaults(); } }
  function save(){ try{ localStorage.setItem('lofi-leonida-cast',JSON.stringify(data)); }catch(e){} }
  load();

  const isApt=id=>id==='apartment';
  const spotsFor=id=>isApt(id)?SPOTS_APT:SPOTS_OUT;
  const list=id=>data[id]||(data[id]=[]);
  function add(id){
    const L=list(id); if(L.length>=MAXP) return null;
    const used=L.map(p=>p.spot); let spot;
    if(isApt(id)){ const free=SPOTS_APT.map(s=>s[0]).filter(s=>!used.includes(s)); if(!free.length) return null; spot=free[0]; }
    else spot=L.length%2?'stand':'stroll';
    const p=make(spot,{ name:'Resident '+(L.length+1), x:20+Math.random()*60 }); L.push(p); save(); return p;
  }
  function remove(id,pid){ data[id]=list(id).filter(p=>p.id!==pid); save(); }
  function update(id,pid,patch){ const p=list(id).find(q=>q.id===pid); if(!p) return; Object.assign(p,patch); if(isApt(id)&&patch.spot){ list(id).forEach(q=>{ if(q!==p&&q.spot===patch.spot){ const free=SPOTS_APT.map(s=>s[0]).find(s=>!list(id).some(z=>z!==q&&z.spot===s)&&s!==patch.spot); if(free) q.spot=free; } }); } save(); }
  function randomize(id,pid){ update(id,pid,{ skin:rnd(SKIN), hairStyle:rnd(STYLES)[0], hair:rnd(HAIR), top:rnd(TOP), bottom:rnd(BOTTOM) }); }
  function reset(id){ const d=defaults(); data[id]=d[id]||[]; save(); }
  function clear(id){ data[id]=[]; save(); }

  /* ---------- drawing ---------- */
  function hairFront(B,st,col,hx,hy){
    if(st==='bald') return; B(hx-1,hy-3,13,5,col);
    if(st==='long'){ B(hx-2,hy,3,20,col); B(hx+10,hy,3,20,col); }
    else if(st==='short'){ B(hx-1,hy,2,4,col); B(hx+10,hy,2,4,col); }
    else if(st==='cap'){ B(hx-1,hy-5,13,6,'#c8443e'); B(hx-4,hy,6,2,'#a8302c'); }
    else if(st==='bun'){ B(hx+3,hy-7,6,5,col); B(hx-1,hy,2,6,col); B(hx+10,hy,2,6,col); }
    else if(st==='curly'){ B(hx-3,hy-5,17,8,col); B(hx-3,hy,3,10,col); B(hx+11,hy,3,10,col); }
  }
  function hairBack(B,st,col,hx,hy){
    if(st==='bald') return; B(hx-1,hy-3,13,10,col);
    if(st==='long') B(hx-2,hy,15,22,col); else if(st==='cap') B(hx-1,hy-5,13,6,'#c8443e'); else if(st==='bun') B(hx+3,hy-7,6,5,col); else if(st==='curly') B(hx-3,hy-5,17,12,col);
  }

  // one generic body: pose = 'back' | 'front' | 'walk' | 'dance' | 'cook' | 'read' | 'sofa'
  function person(c,x,y,p,t,pose,k,o){
    o=o||{}; k=k||1;
    const r=v=>Math.round(v*k), B=(dx,dy,w,h,col)=>R(c,x+r(dx),y+r(dy),Math.max(1,r(w)),Math.max(1,r(h)),col);
    const skin=p.skin, skinD=mix(skin,'#000000',.18), topD=mix(p.top,'#000000',.2), shoe='#ece8f8', bot=p.bottom, rim=o.rim;
    if(pose==='sofa'){   // seated, facing left, controller in hand, slow breathing
      const b=Math.round(Math.sin(t*1.3)*.6), nod=Math.sin(t*.5)>.6?1:0;
      B(-18,-30+b,24,7,bot); B(-24,-30+b,8,7,bot); B(-26,-25,7,23,skinD); B(-28,-6,12,4,shoe);
      B(-24,-22,6,20,skin); B(-26,-5,12,4,shoe);
      B(0,-60+b,14,32,p.top); B(0,-60+b,2,32,topD); B(2,-40+b,10,2,topD);
      B(4,-76+b,5,18,skin); B(-6,-80+b,14,5,skin); B(-10,-84+b,6,6,skin);
      B(-4,-52+b,5,18,skinD); B(-6,-36+b,6,5,skinD);
      B(1,-74+b+nod,11,12,skin); hairFront(B,p.hairStyle==='long'?'short':p.hairStyle,p.hair,1,-74+b+nod);
      B(-10,-32+b,8,3,'#2a2a3a'); B(-8,-31+b,1,1,'#6ff'); B(-5,-31+b,1,1,'#f6a');
      return;
    }
    const bob=pose==='dance'?Math.round(Math.sin(t*6)*2*k):Math.round(Math.sin(t*1.1)*.5*k);
    const swing=pose==='walk'?(Math.floor(t*4)%2?1:-1):0;
    if(pose==='read'){   // sitting cross-legged on the floor, holding a book
      const b=Math.round(Math.sin(t*1.2)*.5);
      B(-14,-10,28,8,bot); B(-16,-4,8,4,shoe); B(8,-4,8,4,shoe);
      B(-7,-36+b,15,26,p.top); B(-7,-36+b,2,26,topD);
      B(-5,-48+b,11,12,skin); hairFront(B,p.hairStyle,p.hair,-5,-48+b);
      B(-9,-26,18,10,'#f4f0ff'); B(-9,-26,1,10,'#c8443e'); const pf=Math.floor(t*.35)%2; B(pf?1:-4,-26,4,10,'#d8d2ec');
      B(-9,-30+b,3,10,skinD); B(6,-30+b,3,10,skinD);
      return;
    }
    // legs
    const la=pose==='dance'?Math.round(Math.sin(t*6)*3):swing*3, lb=-la;
    B(-5+la,-32+bob*0,4,32,bot); B(1+lb,-32,4,32,bot); B(-6+la,-2,5,3,shoe); B(1+lb,-2,5,3,shoe);
    // torso
    B(-7,-66+bob,15,36,p.top); if(pose!=='back'||!rim) B(-7,-66+bob,2,36,topD);
    if(rim&&pose==='back'){ B(-7,-66+bob,1,36,rim); B(7,-66+bob,1,36,rim); }
    // arms
    if(pose==='dance'){ const a=Math.sin(t*6); B(-11,-70+bob+Math.round(a*3),4,18,skin); B(8,-70+bob-Math.round(a*3),4,18,skin); B(-12,-72+bob+Math.round(a*3),6,4,skin); B(8,-72+bob-Math.round(a*3),6,4,skin); }
    else if(pose==='cook'){ const a=Math.sin(t*5)*3; B(-10,-60+bob,4,22,skinD); B(7,-60+bob,4,12,skin); B(7+Math.round(a),-50+bob,12,4,skin); B(19+Math.round(a),-52+bob,2,10,'#c8c0d0'); }
    else if(pose==='back'){ B(-10,-60+bob,4,20,skin); B(8,-60+bob,4,12,skin); B(9,-68+bob,5,5,skin); B(10,-71+bob,6,5,'#f4f0ff'); for(let i=0;i<3;i++) R(c,x+r(12)+Math.round(Math.sin(t*3+i)*1.2),y+r(-76)-i*4-((t*6)%4|0)+bob,1,1,'rgba(220,230,255,.7)'); }
    else if(pose==='walk'){ B(-10+swing*2,-62+bob,4,22,skin); B(8-swing*2,-62+bob,4,22,skinD); }
    else { B(-10,-62+bob,4,24,skin); B(8,-62+bob,4,24,skin); }
    // head
    if(pose==='back'||pose==='cook'){ B(-5,-78+bob,11,12,skin); hairBack(B,p.hairStyle,p.hair,-5,-78+bob); }
    else { B(-5,-78+bob,11,12,skin); hairFront(B,p.hairStyle,p.hair,-5,-78+bob); if(pose==='walk'){ B(swing>0?3:-5,-72+bob,2,2,skinD); } }
  }

  function placeApt(p,t){
    const s=APT[p.spot]; if(!s) return null; const pose={sofa:'sofa','win-a':'back','win-b':'back','win-c':'back',kitchen:'cook',rug:'read',dance:'dance'}[p.spot];
    return { x:s.x, y:s.y, pose, k:1, rim:p.spot.startsWith('win')?'#7fe4ff':null };
  }
  function placeOut(sceneId,p,i,t){
    const w=WALK[sceneId]; if(!w) return null; const L=w.x1-w.x0, k=w.k*.64;
    if(p.spot==='stand'){ return { x:w.x0+(p.x/100)*L, y:w.y, pose:'front', k }; }
    const sp=16+((p.id.charCodeAt(p.id.length-1)||3)%7)*3, ph=(t*sp+i*97)%(2*L), fwd=ph<L, x=w.x0+(fwd?ph:2*L-ph);
    return { x, y:w.y, pose:'walk', k, dir:fwd?1:-1 };
  }
  function draw(c,t,sceneId){
    const L=list(sceneId); if(!L.length) return;
    const items=L.map((p,i)=>({p,pl:isApt(sceneId)?placeApt(p,t):placeOut(sceneId,p,i,t)})).filter(o=>o.pl).sort((a,b)=>a.pl.y-b.pl.y);
    for(const {p,pl} of items){
      if(pl.dir<0){ c.save(); c.translate(Math.round(pl.x)*2,0); c.scale(-1,1); person(c,Math.round(pl.x),pl.y,p,t,pl.pose,pl.k,pl); c.restore(); }
      else person(c,Math.round(pl.x),pl.y,p,t,pl.pose,pl.k,pl);
    }
  }
  // small portrait for the editor
  function portrait(cv,p){ cv.width=44; cv.height=64; const c=cv.getContext('2d'); c.imageSmoothingEnabled=false; c.clearRect(0,0,44,64); person(c,22,62,p,0,'front',.7); }

  return { person, make, SKIN,HAIR,TOP,BOTTOM,STYLES,MAXP, spotsFor, list, add, remove, update, randomize, reset, clear, draw, portrait, isApt };
})();
