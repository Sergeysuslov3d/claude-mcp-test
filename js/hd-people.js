// HD illustrated people (anime-lofi style): a small skeleton per pose, tapered limbs, clothes,
// hair styles, simple face, two-tone cel shading and an optional rim light. Same footprint as the
// pixel people: feet at (x,y), about 81 units tall at k=1, facing right when side-on.
(function(){
  if(!PX.HD) return;
  const {mix}=PX;

  function seg(c,a,b,w1,w2,col){
    const dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
    c.fillStyle=col; c.beginPath();
    c.moveTo(a[0]+nx*w1/2,a[1]+ny*w1/2); c.lineTo(b[0]+nx*w2/2,b[1]+ny*w2/2); c.lineTo(b[0]-nx*w2/2,b[1]-ny*w2/2); c.lineTo(a[0]-nx*w1/2,a[1]-ny*w1/2); c.closePath(); c.fill();
    c.beginPath(); c.arc(a[0],a[1],w1/2,0,Math.PI*2); c.arc(b[0],b[1],w2/2,0,Math.PI*2); c.fill();
  }
  const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  // cel shading: hard-edged horizontal gradient (shadow on the far side from the light)
  function cel(c,x0,x1,base,shade,litRight){ const g=c.createLinearGradient(x0,0,x1,0); if(litRight){ g.addColorStop(0,shade); g.addColorStop(.38,shade); g.addColorStop(.38,base); g.addColorStop(1,base); } else { g.addColorStop(0,base); g.addColorStop(.62,base); g.addColorStop(.62,shade); g.addColorStop(1,shade); } return g; }

  // ---------- poses: joints in body units, feet origin ----------
  function pose(name,t){
    const b=Math.sin(t*1.2)*.35;
    const J={ view:'front', neck:[0,-64+b], head:[0,-71.5+b], sh:[[-6.4,-61+b],[6.4,-61+b]], hip:[[-2.9,-35],[2.9,-35]],
      knee:[[-2.6,-19],[2.6,-19]], ank:[[-2.7,-3],[2.7,-3]], el:[[-7.8,-49+b],[7.8,-49+b]], hand:[[-8.2,-38.5+b],[8.2,-38.5+b]], bob:b };
    if(name==='back'){ J.view='back'; J.el[1]=[8.6,-50+b]; J.hand[1]=[5.4,-57.5+b]; J.mug=[5.6,-60+b]; }
    else if(name==='cook'){ J.view='back'; const a=Math.sin(t*5); J.el[1]=[9.2,-51+b]; J.hand[1]=[12+a*1.6,-47+b]; J.spoon=[13+a*1.6,-47+b]; }
    else if(name==='dance'){ const a=Math.sin(t*6), d=Math.abs(Math.sin(t*6))*1.6; Object.assign(J,{bob:-d}); for(const k of ['neck','head']) J[k]=[J[k][0],J[k][1]-d];
      J.sh=J.sh.map(p=>[p[0],p[1]-d]); J.el=[[-10,-66-d+a*3],[10,-66-d-a*3]]; J.hand=[[-8.5,-76-d+a*3],[8.5,-76-d-a*3]];
      J.knee=[[-3.4+a,-19.5],[3.4+a,-19.5]]; J.hip=[[-2.9,-35-d],[2.9,-35-d]]; }
    else if(name==='walk'){ J.view='side'; const s=Math.sin(t*5.2), q=Math.cos(t*5.2);
      J.hip=[[0,-35],[0,-35]]; J.knee=[[s*4.2,-19.5],[-s*4.2,-19.5]]; J.ank=[[s*7,-3+Math.max(0,q)*1.5],[-s*7,-3+Math.max(0,-q)*1.5]];
      J.sh=[[0,-61],[0,-61]]; J.el=[[-s*4,-49],[s*4,-49]]; J.hand=[[-s*6.4,-38.5],[s*6.4,-38.5]]; J.neck=[.6,-64]; J.head=[1,-71.5]; }
    else if(name==='read'){ J.view='front'; const rb=Math.sin(t*1.2)*.3; J.seated=true;
      J.hip=[[-3,-12],[3,-12]]; J.knee=[[-11,-6],[11,-6]]; J.ank=[[5,-3],[-5,-3]]; J.neck=[0,-40+rb]; J.head=[0,-47.5+rb];
      J.sh=[[-6.2,-37+rb],[6.2,-37+rb]]; J.el=[[-8,-27],[8,-27]]; J.hand=[[-4,-23],[4,-23]]; J.book=[0,-23]; }
    else if(name==='sofa'){ J.view='sideL'; const sb=Math.sin(t*1.3)*.4, nod=Math.sin(t*.5)>.6?.8:0; J.seated=true;
      J.hip=[[6,-30],[5,-30]]; J.knee=[[-9,-22.5],[-10,-21.5]]; J.ank=[[-18,-5.5],[-19.5,-4.5]];
      J.sh=[[8,-56+sb],[6,-55+sb]]; J.neck=[7.4,-58.5+sb]; J.head=[7,-66+sb+nod];
      J.el=[[-1,-72+sb],[-1,-43+sb]]; J.hand=[[4.5,-71+sb],[-7,-33+sb]]; J.pad=[-8.5,-32+sb]; }
    return J;
  }

  // ---------- hair ----------
  function hairBackLayer(c,st,col,H,view){
    if(st==='bald'||st==='cap') return;
    c.fillStyle=col;
    if(st==='long'){ c.beginPath(); c.moveTo(H[0]-6.2,H[1]-2); c.quadraticCurveTo(H[0]-7.4,H[1]+10,H[0]-5.6,H[1]+17); c.lineTo(H[0]+5.6,H[1]+17); c.quadraticCurveTo(H[0]+7.4,H[1]+10,H[0]+6.2,H[1]-2); c.closePath(); c.fill(); }
    if(st==='curly'){ for(let i=0;i<9;i++){ const a=Math.PI*(.9+i*.14); c.beginPath(); c.arc(H[0]+Math.cos(a)*6.4,H[1]+Math.sin(a)*6.6+1,2.8,0,7); c.fill(); } }
    if(st==='bun'){ c.beginPath(); c.arc(H[0]+(view==='side'?-3.5:0),H[1]-7.4,2.8,0,7); c.fill(); }
  }
  function hairTop(c,st,col,colS,H,view){
    if(st==='bald') return;
    if(st==='cap'){ c.fillStyle='#c8443e'; c.beginPath(); c.ellipse(H[0],H[1]-2.6,5.9,4.6,0,Math.PI,0); c.fill(); c.fillStyle='#a8302c';
      if(view==='front'){ c.beginPath(); c.ellipse(H[0],H[1]-2.2,6.6,1.4,0,0,Math.PI*2); c.fill(); }
      else if(view==='side'){ c.beginPath(); c.ellipse(H[0]+5,H[1]-2.4,4,1.1,-.08,0,Math.PI*2); c.fill(); }
      else if(view==='sideL'){ c.beginPath(); c.ellipse(H[0]-5,H[1]-2.4,4,1.1,.08,0,Math.PI*2); c.fill(); }
      return; }
    c.fillStyle=col;
    if(view==='back'){ c.beginPath(); c.ellipse(H[0],H[1]-.4,5.9,6.9,0,0,Math.PI*2); c.fill(); if(st==='long'){ c.beginPath(); c.roundRect(H[0]-5.9,H[1],11.8,17,[0,0,3,3]); c.fill(); } }
    else { const dir=view==='side'?1:view==='sideL'?-1:0;
      c.beginPath(); c.ellipse(H[0]-dir*1.2,H[1]-2.2,5.9,5.2,0,Math.PI*.92,Math.PI*2.08); c.fill();
      // fringe: a few pointed locks over the forehead
      c.beginPath(); const fx=H[0]+dir*1.5; c.moveTo(fx-5.8,H[1]-2); for(let i=0;i<5;i++){ const x=fx-5.8+i*2.9; c.lineTo(x+1.4,H[1]+(i%2?1.2:.2)); c.lineTo(x+2.9,H[1]-2.2); } c.lineTo(fx+5.8,H[1]-3); c.closePath(); c.fill();
      if(dir){ c.beginPath(); c.moveTo(H[0]-dir*5.6,H[1]-2.5); c.quadraticCurveTo(H[0]-dir*7,H[1]+3,H[0]-dir*4.8,H[1]+(st==='long'?14:4)); c.lineTo(H[0]-dir*2,H[1]+1); c.closePath(); c.fill(); }
      else if(st==='long'||st==='curly'){ for(const s of [-1,1]){ c.beginPath(); c.moveTo(H[0]+s*5.6,H[1]-2); c.quadraticCurveTo(H[0]+s*6.8,H[1]+6,H[0]+s*5.4,H[1]+(st==='long'?15:7)); c.lineTo(H[0]+s*3.8,H[1]+2); c.closePath(); c.fill(); } }
      if(st==='curly'){ for(let i=0;i<6;i++){ c.beginPath(); c.arc(H[0]-5+i*2,H[1]-6.2+(i%2)*.8,2,0,7); c.fill(); } }
      if(st==='bun'){ c.beginPath(); c.arc(H[0]-dir*2.6,H[1]-7.6,2.6,0,7); c.fill(); }
    }
    // sheen
    c.strokeStyle=mix(col,'#ffffff',.35); c.globalAlpha*=.55; c.lineWidth=.55; c.beginPath(); c.arc(H[0]+.6,H[1]-1.5,4.2,Math.PI*1.18,Math.PI*1.52); c.stroke(); c.globalAlpha/=.55;
  }

  function face(c,H,view,skinS){
    if(view==='front'){ c.fillStyle='#1c1424'; for(const s of [-1,1]){ c.beginPath(); c.ellipse(H[0]+s*2.25,H[1]+.6,.62,.95,0,0,7); c.fill(); }
      c.fillStyle='#ffffff'; for(const s of [-1,1]){ c.beginPath(); c.arc(H[0]+s*2.25+.2,H[1]+.25,.22,0,7); c.fill(); }
      c.strokeStyle='#2a1a24'; c.lineWidth=.32; for(const s of [-1,1]){ c.beginPath(); c.moveTo(H[0]+s*1.4,H[1]-1.3); c.lineTo(H[0]+s*3.1,H[1]-1.5); c.stroke(); }
      c.strokeStyle=mix(skinS,'#5a1a2a',.5); c.lineWidth=.35; c.beginPath(); c.moveTo(H[0]-.7,H[1]+3.6); c.quadraticCurveTo(H[0],H[1]+4.1,H[0]+.7,H[1]+3.6); c.stroke();
      c.fillStyle='rgba(255,120,140,.28)'; for(const s of [-1,1]){ c.beginPath(); c.ellipse(H[0]+s*3.2,H[1]+2.4,1,.55,0,0,7); c.fill(); } }
    else if(view==='side'||view==='sideL'){ const d=view==='side'?1:-1; c.fillStyle='#1c1424'; c.beginPath(); c.ellipse(H[0]+d*3,H[1]+.4,.5,.9,0,0,7); c.fill();
      c.strokeStyle='#2a1a24'; c.lineWidth=.3; c.beginPath(); c.moveTo(H[0]+d*2.2,H[1]-1.3); c.lineTo(H[0]+d*3.8,H[1]-1.4); c.stroke();
      c.fillStyle='rgba(255,120,140,.25)'; c.beginPath(); c.ellipse(H[0]+d*2.8,H[1]+2.5,.9,.5,0,0,7); c.fill(); }
  }

  function drawRaw(c,x,y,p,t,poseName,k,o){
    o=o||{}; k=k||1;
    const J=pose(poseName,t), view=J.view, litR=view!=='sideL';
    const skin=p.skin, skinS=mix(skin,'#3a1838',.3), top=p.top, topS=mix(top,'#1c1238',.32), bot=p.bottom, botS=mix(bot,'#0a0818',.34),
      hair=p.hair, hairS=mix(hair,'#000000',.3), shoe='#eeecf6', shoeS='#b4b0c6', rim=o.rim, detail=k*PX.K>=1.1;
    c.save(); c.translate(x,y); c.scale(k,k); c.lineCap='round'; c.lineJoin='round';
    // contact shadow
    c.fillStyle='rgba(6,4,16,.32)'; c.beginPath(); c.ellipse(J.seated?(view==='sideL'?-8:0):0,.4,J.seated?14:7,1.5,0,0,Math.PI*2); c.fill();
    const H=J.head, far=view==='sideL'?0:1;   // which side is the far (shadowed) limb
    const leg=i=>{ seg(c,J.hip[i],J.knee[i],4.6,3.6,i===far?botS:bot); seg(c,J.knee[i],J.ank[i],3.6,2.8,i===far?botS:bot);
      const a=J.ank[i], fwd=view==='sideL'?-1:view==='side'?1:(i?1:-1)*.4; c.fillStyle=i===far?shoeS:shoe; c.beginPath(); c.ellipse(a[0]+fwd*1.4,a[1]+1.6,view==='front'||view==='back'?2:2.8,1.45,0,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(a[0]+fwd*1.4-2.4,a[1]+2.4,4.8,.5); };
    const arm=i=>{ const sh=J.sh[i], el=J.el[i], hd=J.hand[i], col=i===far?skinS:skin;
      seg(c,sh,el,3.1,2.5,col); seg(c,el,hd,2.5,2.1,col); c.fillStyle=col; c.beginPath(); c.arc(hd[0],hd[1],1.35,0,7); c.fill();
      seg(c,sh,lerp(sh,el,.55),3.9,3.5,i===far?topS:top); };       // sleeve
    // back limbs first
    if(view==='back'||view==='front'){ leg(0); leg(1); }
    else { leg(far); arm(far); }
    if(view==='back'){ hairBackLayer(c,p.hairStyle,hair,H,view); }
    else if(view!=='back') hairBackLayer(c,p.hairStyle,hairS,H,view);
    // torso (tee) + waistband
    { const sh=J.sh, hp=J.hip, side=view==='side'||view==='sideL';
      c.fillStyle=cel(c,(sh[0][0]+hp[0][0])/2-5,(sh[1][0]+hp[1][0])/2+5,top,topS,litR); c.beginPath();
      if(side){ const n=J.neck, pv=lerp(hp[0],hp[1],.5); const d=view==='side'?1:-1; c.moveTo(n[0]-4.6*d,n[1]+2); c.quadraticCurveTo(n[0]+5.4*d,n[1]+1,pv[0]+4.4*d,pv[1]-6); c.lineTo(pv[0]+4.2*d,pv[1]+1.4); c.lineTo(pv[0]-4.4*d,pv[1]+1.4); c.quadraticCurveTo(pv[0]-5.4*d,pv[1]-12,n[0]-4.6*d,n[1]+2); }
      else { c.moveTo(sh[0][0]-1.2,sh[0][1]-.4); c.quadraticCurveTo(0,sh[0][1]-2.4,sh[1][0]+1.2,sh[1][1]-.4); c.lineTo(hp[1][0]+2.3,hp[1][1]+1.2); c.quadraticCurveTo(0,hp[1][1]+2.2,hp[0][0]-2.3,hp[0][1]+1.2); }
      c.closePath(); c.fill();
      if(!side){ c.strokeStyle=topS; c.lineWidth=.4; c.beginPath(); c.moveTo(-1.5,-48+J.bob); c.quadraticCurveTo(-.4,-44+J.bob,-1,-40+J.bob); c.stroke(); }   // fold
      if(rim){ c.strokeStyle=rim; c.globalAlpha*=.85; c.lineWidth=.7; c.stroke(); c.globalAlpha/=.85; } }
    if(view==='back'||view==='front'){ arm(0); arm(1); } else { leg(1-far); }
    // neck + head
    seg(c,J.neck,[J.neck[0],J.neck[1]+2.4],2.6,2.8,skinS);
    c.fillStyle=view==='back'?skinS:cel(c,H[0]-5.5,H[0]+5.5,skin,skinS,litR); c.beginPath();
    if(view==='front'||view==='back'){ c.moveTo(H[0]-5.3,H[1]-1.5); c.quadraticCurveTo(H[0]-5.4,H[1]+4.2,H[0],H[1]+6.4); c.quadraticCurveTo(H[0]+5.4,H[1]+4.2,H[0]+5.3,H[1]-1.5); c.arc(H[0],H[1]-1.5,5.3,0,Math.PI,true); }
    else { const d=view==='side'?1:-1; c.ellipse(H[0],H[1],5.2,6.2,0,0,Math.PI*2); c.moveTo(H[0]+d*4.6,H[1]+.6); c.lineTo(H[0]+d*5.9,H[1]+2); c.lineTo(H[0]+d*4.4,H[1]+3); }
    c.fill();
    if(view!=='back'){ c.fillStyle=skinS; c.beginPath(); c.ellipse(H[0]+(view==='side'?-2.2:view==='sideL'?2.2:-5.2),H[1]+1,1.1,1.6,0,0,7); c.fill(); }   // ear
    if(detail&&view!=='back') face(c,H,view,skinS);
    hairTop(c,p.hairStyle,hair,hairS,H,view);
    if(rim){ c.strokeStyle=rim; c.globalAlpha*=.7; c.lineWidth=.6; c.beginPath(); c.arc(H[0],H[1]-.5,6.3,Math.PI*1.1,Math.PI*1.9); c.stroke(); c.globalAlpha/=.7; }
    if(view==='side'||view==='sideL') arm(1-far);
    // props
    if(J.mug){ c.fillStyle='#f4f0ff'; c.beginPath(); c.roundRect(J.mug[0]-1.6,J.mug[1]-1.6,3.4,3.8,.6); c.fill(); c.strokeStyle='#f4f0ff'; c.lineWidth=.6; c.beginPath(); c.arc(J.mug[0]+2,J.mug[1]+.3,1,-Math.PI/2,Math.PI/2); c.stroke();
      for(let i=0;i<3;i++){ const yy=J.mug[1]-3-i*3.4-((t*5)%3.4); c.fillStyle='rgba(225,232,255,'+(.42-i*.12)+')'; c.beginPath(); c.arc(J.mug[0]+Math.sin(t*2.6+i)*1,yy,.8+i*.25,0,7); c.fill(); } }
    if(J.spoon){ c.strokeStyle='#c8c0d0'; c.lineWidth=.6; c.beginPath(); c.moveTo(J.spoon[0],J.spoon[1]); c.lineTo(J.spoon[0]+1.5,J.spoon[1]+6); c.stroke(); }
    if(J.book){ c.fillStyle='#f4f0ff'; c.beginPath(); c.moveTo(J.book[0]-6,J.book[1]-3); c.lineTo(J.book[0],J.book[1]-2); c.lineTo(J.book[0]+6,J.book[1]-3); c.lineTo(J.book[0]+6,J.book[1]+3.4); c.lineTo(J.book[0],J.book[1]+4.2); c.lineTo(J.book[0]-6,J.book[1]+3.4); c.closePath(); c.fill();
      c.fillStyle='#c8443e'; c.fillRect(J.book[0]-.25,J.book[1]-2,.5,6.2); c.strokeStyle='rgba(60,40,80,.35)'; c.lineWidth=.25; for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(J.book[0]-5,J.book[1]-1+i*1.4); c.lineTo(J.book[0]-1,J.book[1]-.4+i*1.4); c.stroke(); } }
    if(J.pad){ c.fillStyle='#2a2a3a'; c.beginPath(); c.roundRect(J.pad[0]-2.6,J.pad[1]-1,5.2,2.2,1); c.fill(); c.fillStyle='#6ff'; c.fillRect(J.pad[0]-1.6,J.pad[1]-.4,.6,.6); c.fillStyle='#f6a'; c.fillRect(J.pad[0]+1,J.pad[1]-.4,.6,.6); }
    c.restore();
  }
  // ink outline: draw the figure off-screen, then stamp a dark silhouette around it like anime line art
  const bufs={};
  function draw(c,x,y,p,t,poseName,k,o){
    k=k||1; const W=Math.ceil(76*k)+6, H=Math.ceil(98*k)+6, key=W+'x'+H;
    let B=bufs[key]; if(!B){ const [cv,g]=PX.makeCanvas(W,H), [sv,sg]=PX.makeCanvas(W,H); B=bufs[key]={cv,g,sv,sg}; }
    const {cv,g,sv,sg}=B, ox=W/2, oy=H-3, lw=Math.max(.35,.55*k+.12)*((PX.STYLE&&PX.STYLE.ink)||1);
    if(PX.STYLE&&PX.STYLE.rim&&!(o&&o.rim)) o=Object.assign({},o||{},{rim:PX.STYLE.rim});
    g.save(); g.setTransform(cv.__k||1,0,0,cv.__k||1,0,0); g.clearRect(0,0,W,H); g.restore();
    drawRaw(g,ox,oy,p,t,poseName,k,o);
    sg.save(); sg.setTransform(sv.__k||1,0,0,sv.__k||1,0,0); sg.clearRect(0,0,W,H); sg.globalCompositeOperation='source-over'; sg.drawImage(cv,0,0); sg.globalCompositeOperation='source-in'; sg.fillStyle='#120a1a'; sg.fillRect(0,0,W,H); sg.restore();
    for(const [dx,dy] of [[-lw,0],[lw,0],[0,-lw],[0,lw]]) c.drawImage(sv,x-ox+dx,y-oy+dy);
    c.drawImage(cv,x-ox,y-oy);
  }
  window.HDP=draw;
})();
