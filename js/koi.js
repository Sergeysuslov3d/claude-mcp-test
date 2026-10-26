// Koi pond: goldfish drawn from thousands of glowing particles swimming in dark water.
// Ripples open on the kick drum of the music; a tap (or the VORTEX button) gathers every particle
// into a spinning rose, then lets the fish swim off again. Canvas 2D, additive light, no libraries.
(function(){
  const $=s=>document.querySelector(s);
  const cv=$('#pond'), g=cv.getContext('2d');
  let W=0,H=0,DPR=1;
  function size(){ DPR=Math.min(2,devicePixelRatio||1); W=innerWidth; H=innerHeight; cv.width=W*DPR; cv.height=H*DPR; g.setTransform(DPR,0,0,DPR,0,0); }
  addEventListener('resize',size); size();
  const rnd=(a,b)=>a+Math.random()*(b-a);

  /* ---------- fish ---------- */
  // palettes: red ranchu, kohaku (white + red), orange, calico-ish
  // Japanese koi (nishikigoi) varieties: the colour of a particle depends on where it sits on the body
  const WHITE=[255,250,244], RED=[240,62,40], BLACK=[46,36,44], GOLD=[255,196,80], BLUE=[150,182,210], ORANGE=[255,130,60];
  const VARIETIES=[
    { name:'kohaku', pat:(u,s,n)=> n>-.02&&u<.84?RED:WHITE },
    { name:'tancho', pat:(u,s)=> Math.hypot((u-.07)/.06,s/.55)<1?RED:WHITE },
    { name:'sanke',  pat:(u,s,n,m)=> m>.62&&u<.8?BLACK:(n>.05&&u<.84?RED:WHITE) },
    { name:'showa',  pat:(u,s,n,m)=> n>.25&&u<.84?RED:(m>.2?WHITE:BLACK) },
    { name:'ogon',   pat:(u,s,n)=> n>.55?[255,226,140]:GOLD },
    { name:'asagi',  pat:(u,s)=> Math.abs(s)>.62&&u<.7?ORANGE:BLUE } ];
  const SEG=18;
  class Fish{
    constructor(i){
      // the same five koi every visit: fixed size, speed, pattern seed and variety per fish
      this.len=Math.min(W,H)*[.36,.32,.38,.31,.34][i%5]; this.x=rnd(.2,.8)*W; this.y=rnd(.2,.8)*H; this.a=rnd(0,Math.PI*2); this.v=[.6,.52,.66,.56,.62][i%5]; this.turn=0; this.seed=11+i*23.7;
      this.kind=VARIETIES[i%VARIETIES.length]; this.spine=[]; for(let k=0;k<SEG;k++) this.spine.push({x:this.x-Math.cos(this.a)*k*this.len/SEG, y:this.y-Math.sin(this.a)*k*this.len/SEG});
      const sd=this.seed, noise=(u,s,f)=>.5*Math.sin(u*f*1.7+sd)*Math.cos(s*2.3+sd*1.3)+.35*Math.sin(u*f*3.1-s*1.7+sd*2.1)+.25*Math.sin(u*f*5.3+s*3.1+sd*.7);
      // particles: u = along body (0 nose → 1 tail tip), s = across (-1..1), part 0 body / 1 pectoral fins / 2 tail
      this.p=[]; const N=W<700?900:1700;
      for(let k=0;k<N;k++){ const r=Math.random(); let u,s,kind;
        if(r<.76){ u=rnd(0,.84); s=Math.random()<.3?(Math.random()<.5?-1:1)*rnd(.86,1):(Math.random()*2-1)*Math.pow(Math.random(),.45); kind=0; }   // slender body, bright outline
        else if(r<.84){ u=rnd(.18,.3); s=(Math.random()<.5?-1:1)*rnd(1,1.75); kind=1; }                                                    // wide pectoral fins
        else { u=rnd(.84,1); s=(Math.random()<.5?-1:1)*rnd(.15,1)*Math.pow(Math.random(),.3)+rnd(-.05,.05); kind=2; }                    // forked tail
        let c=kind===0?this.kind.pat(u,s,noise(u,s,7),noise(u,s+3,11)):this.kind.pat(.5,.9,0,1);
        if(kind!==0) c=c.map(v=>Math.round(v*.85+38));                       // fins and tail: paler, see-through
        this.p.push({u,s,kind,c,sz:rnd(.8,1.8),tw:rnd(0,6.28),x:this.x,y:this.y,k:Math.random(),j:(Math.random()+Math.random()+Math.random()-1.5)/1.5}); }
    }
    width(u){ // koi outline: rounded snout, long torpedo body, thin stalk, small forked tail
      if(u<.84) return this.len*.12*Math.pow(Math.sin(Math.PI*(u+.05)/.98),.75);
      if(u<.87) return this.len*.03;
      return this.len*(.03+.13*(u-.87)/.13); }
    step(dt,t){
      // wander: smooth noise turning, steer back from edges, gentle speed changes
      const n=Math.sin(t*.7+this.seed)*.6+Math.sin(t*.31+this.seed*2)*.4; this.turn+=(n*.9-this.turn)*dt*1.5;
      const top=120, bot=170, side=90, cx=W/2-this.x, cy=H/2-this.y;
      if(this.x<side||this.x>W-side||this.y<top||this.y>H-bot){ const want=Math.atan2(cy,cx); let d=want-this.a; d=Math.atan2(Math.sin(d),Math.cos(d)); this.turn+=d*dt*7; if(this.flee) this.flee=false; }
      let boost=1;
      // reaction to a tap, like real koi: the ones close by startle and dart away, the rest come over to look
      if(vortOn){ const dx=vx-this.x, dy=vy-this.y, d=Math.hypot(dx,dy)||1, near=Math.min(W,H)*.22;
        if(this.flee==null) this.flee=d<near;
        let want=this.flee?Math.atan2(-dy,-dx):Math.atan2(dy,dx); if(!this.flee&&d<70) want+=Math.PI/2;   // arrived: drift round the spot
        let dd=want-this.a; dd=Math.atan2(Math.sin(dd),Math.cos(dd));
        this.turn+=(dd*(this.flee?6:2.2)-this.turn)*Math.min(1,dt*(this.flee?6:2.5));
        boost=this.flee?1+2.4*Math.max(0,1-vortT/1.6):(d<70?.55:1.25); }
      else this.flee=null;
      const sp=(this.v+Math.sin(t*1.3+this.seed)*.25)*60*boost, maxTurn=Math.max(.6,sp/(this.len*.55));
      this.turn=Math.max(-maxTurn,Math.min(maxTurn,this.turn)); this.a+=this.turn*dt;
      this.x+=Math.cos(this.a)*sp*dt; this.y+=Math.sin(this.a)*sp*dt;
      // spine follows the head like a rope, with a swimming wave
      const S=this.spine; S[0].x=this.x; S[0].y=this.y; const sl=this.len/SEG;
      let prev=this.a+Math.PI; const MAXB=.2;
      for(let k=1;k<SEG;k++){ const a=S[k-1], b=S[k]; let ang=Math.atan2(b.y-a.y,b.x-a.x), dd=Math.atan2(Math.sin(ang-prev),Math.cos(ang-prev));
        if(dd>MAXB) ang=prev+MAXB; else if(dd<-MAXB) ang=prev-MAXB; b.x=a.x+Math.cos(ang)*sl; b.y=a.y+Math.sin(ang)*sl; prev=ang; }
    }
    at(u,s,t){ // world position of a body point
      const f=u*(SEG-1), k=Math.min(SEG-2,Math.floor(f)), fr=f-k, A=this.spine[k], B=this.spine[k+1];
      const x=A.x+(B.x-A.x)*fr, y=A.y+(B.y-A.y)*fr; let nx=-(B.y-A.y), ny=B.x-A.x; const l=Math.hypot(nx,ny)||1; nx/=l; ny/=l;
      const wave=Math.sin(t*3.4-u*5+this.seed)*u*u*this.len*.1;             // koi swim with a slow body wave
      const w=this.width(u)*s+wave; return [x+nx*w,y+ny*w]; }
  }

  /* ---------- ripples and drifting dust ---------- */
  const ripples=[]; function ripple(x,y,big){ ripples.push({x,y,r:4,a:big?1:.7,sp:big?120:80}); if(ripples.length>14) ripples.shift(); }
  const dust=[]; for(let i=0;i<(W<700?160:320);i++) dust.push({x:Math.random()*W,y:Math.random()*H,v:rnd(4,14),s:rnd(.5,1.4),a:rnd(.05,.35)});

  let fish=[]; function spawn(){ fish=[]; const n=W<700?3:5; for(let i=0;i<n;i++) fish.push(new Fish(i)); } spawn();
  // resizing keeps the same fish: just bring any that ended up outside back into the pond
  addEventListener('resize',()=>{ for(const f of fish){ f.x=Math.min(W-40,Math.max(40,f.x)); f.y=Math.min(H-40,Math.max(40,f.y)); } });

  /* ---------- vortex: every particle flies into a spinning rose ---------- */
  let vort=0, vortT=0, vortOn=false, vx=0, vy=0;
  function vortex(x,y){ vortOn=true; vortT=0; vx=x; vy=y; ripple(x,y,true); for(const f of fish) f.flee=null; }
  // rose: a few loose spiral arms with wavy petals, slowly turning; particles of all fish are mixed along it
  function roseTarget(k,t,j){ const R=Math.min(W,H)*.3, th=k*Math.PI*2*4.2+t*.7+j*.12, r=R*(.06+.94*Math.pow(k,.85))*(1+.09*Math.sin(th*5-t))+j*R*.075*(.4+k);
    return [vx+Math.cos(th)*r, vy+Math.sin(th)*r*.92]; }

  cv.addEventListener('pointerdown',e=>{ vortex(e.clientX,e.clientY); });
  const vb=$('#vortexBtn'); if(vb) vb.onclick=()=>vortex(W/2,H/2);

  /* ---------- music ---------- */
  let playing=false;
  if(window.Lofi){
    Lofi.on('step',e=>{ if(!e||e.motif==null) return; if(e.drums&&(e.s===0||e.s===8)){ const f=fish[Math.floor(Math.random()*fish.length)]; if(f) setTimeout(()=>ripple(f.x,f.y,false),Math.max(0,(e.t-Lofi.ctx.currentTime)*1000)); } });
    Lofi.on('state',S=>{ playing=S.playing; const b=$('#play'); if(b){ b.textContent=S.playing?'❚❚':'▶'; b.setAttribute('aria-label',S.playing?'Pause':'Play'); } });
    Lofi.on('track',T=>{ const n=$('#now'); if(n) n.textContent=T.name; });
    const start=()=>{ if(!Lofi.ctx){ Lofi.init(); Lofi.setVolume(.8); } Lofi.setStyle('ambient'); Lofi.playSeed(Math.floor(Math.random()*9000)+100,'ambient'); };
    $('#play').onclick=()=>{ if(!Lofi.ctx||!Lofi.state.track) return start(); Lofi.state.playing?Lofi.pause():Lofi.play(); };
    $('#next').onclick=()=>{ if(!Lofi.ctx) return start(); Lofi.next(); };
    addEventListener('keydown',e=>{ if(e.code==='Space'){ e.preventDefault(); $('#play').click(); } else if(e.key==='v') vortex(W/2,H/2); });
  }

  /* ---------- draw ---------- */
  let last=performance.now(), t=0;
  function draw(dt){ t+=dt;
    if(vortOn){ vortT+=dt; if(vortT>5) vortOn=false; }
    const target=vortOn?1:0; vort+=(target-vort)*Math.min(1,dt*(vortOn?2.2:1.3));
    const ease=0;   // the fish keep their shape; the swirl is done by steering
    // water: dark with a faint warm glow, slight trails
    g.globalCompositeOperation='source-over'; g.fillStyle='rgba(5,3,8,.38)'; g.fillRect(0,0,W,H);
    g.globalCompositeOperation='lighter';
    for(const d of dust){
      d.y-=d.v*dt; d.x+=Math.sin(t*.5+d.y*.01)*.2; if(d.y<-4){ d.y=H+4; d.x=Math.random()*W; } g.fillStyle='rgba(255,150,110,'+d.a+')'; g.fillRect(d.x,d.y,d.s,d.s); }
    for(const r of ripples){ r.r+=r.sp*dt; r.a-=dt*.32; if(r.a<=0) continue; const n=Math.min(140,Math.floor(r.r*.9)+20);
      for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; g.fillStyle='rgba(255,120,90,'+(r.a*.5).toFixed(3)+')'; g.fillRect(r.x+Math.cos(a)*r.r,r.y+Math.sin(a)*r.r,1.4,1.4); }
      for(let i=0;i<n;i+=2){ const a=i/n*Math.PI*2, rr=r.r*.72; g.fillStyle='rgba(255,90,70,'+(r.a*.25).toFixed(3)+')'; g.fillRect(r.x+Math.cos(a)*rr,r.y+Math.sin(a)*rr,1.2,1.2); } }
    while(ripples.length&&ripples[0].a<=0) ripples.shift();
    let idx=0; const total=fish.reduce((s,f)=>s+f.p.length,0);
    for(const f of fish){ f.step(dt,t);
      for(const p of f.p){ let [x,y]=f.at(p.u,p.s,t);
        if(ease>0.001){ const [rx,ry]=roseTarget(p.k,t,p.j); x+=(rx-x)*ease; y+=(ry-y)*ease; }
        p.x+=(x-p.x)*Math.min(1,dt*(p.kind===2?7:12)); p.y+=(y-p.y)*Math.min(1,dt*(p.kind===2?7:12));
        const tw=.6+.4*Math.sin(t*3+p.tw), al=(p.kind===2?.4:p.kind===1?.32:.55+.4*(1-Math.abs(p.s)))*tw*(playing?1:.85);
        g.fillStyle='rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+','+al.toFixed(3)+')'; g.fillRect(p.x,p.y,p.sz,p.sz); idx++; }
      // eyes: two small bright points near the head (hidden while in the rose)
      if(ease<.5){ for(const s of [-.6,.6]){ const [ex,ey]=f.at(.05,s,t); g.fillStyle='rgba(255,255,255,'+(.9*(1-ease*2))+')'; g.fillRect(ex-1,ey-1,2.2,2.2); } }
    }
  }
  (function frame(now){ requestAnimationFrame(frame); const dt=Math.min(.05,(now-last)/1000); last=now; draw(dt); })(last);
  // ?debug: step the animation by hand (the preview pane throttles rAF)
  if(/[?&]debug\b/.test(location.search)) window.__koiTick=sec=>{ for(let i=0;i<sec*60;i++) draw(1/60); };
})();
