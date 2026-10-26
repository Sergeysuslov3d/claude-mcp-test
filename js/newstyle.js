// New style layer for the Lofi Leonida engine. Loaded after scenes-core.js and before the scenes, it swaps the shared
// brushes (gradients, skyline, palms) for more detailed ones and adds mirrored reflections on water and wet streets.
// Scene code is untouched, so every object stays where the site puts it and every animation still runs.
(function(){
  const {R,P,rng,mix,line,disc} = PX;
  const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
  const NS = window.NEWSTYLE = { on:true, reflect:true };

  /* ---------- gradients: interpolate many bands between the stops, dither only between neighbouring bands ---------- */
  const gradCache={};
  PX.grad=function(c,x,y,w,h,stops){
    if(h<=0||w<=0) return;
    const n=Math.max(stops.length, Math.min(40, Math.round(h/5)));
    const key=stops.join(',')+'|'+n; let pal=gradCache[key];
    if(!pal){ pal=gradCache[key]=[]; const m=stops.length-1;
      for(let i=0;i<n;i++){ const f=m*i/(n-1), k=Math.min(m-1,Math.floor(f)); pal.push(m?mix(stops[k],stops[k+1],f-k):stops[0]); } }
    for(let j=0;j<h;j++){
      const t=h>1?j/(h-1):0, f=t*(n-1), i=Math.min(n-2,Math.floor(f)), k=f-i;
      if(n<2){ R(c,x,y+j,w,1,pal[0]); continue; }
      // runs of equal colour per row keep this fast
      let run=0, cur=null, xs=x;
      for(let i2=0;i2<=w;i2++){
        const col=i2<w?(k>(BAYER[(y+j)&3][(x+i2)&3]+.5)/16?pal[i+1]:pal[i]):null;
        if(col!==cur){ if(cur) { c.fillStyle=cur; c.fillRect(xs,y+j,run,1); } cur=col; xs=x+i2; run=1; } else run++;
      }
    }
  };

  // the sky module grabbed the old grad at load time, so its gradient canvas is rebuilt here with the new one
  const skyCache={};
  SKYX.gradientCanvas=function(sc,phase){
    const k=sc.id+'|'+phase; if(skyCache[k]) return skyCache[k];
    const r=sc.sky, [cv,c]=PX.makeCanvas(480,270), stops=(sc.skyStops&&sc.skyStops[phase])||TOD.PAL[phase].sky;
    PX.grad(c,r.x,r.y,r.w,Math.max(r.h,(r.horizon||0)-r.y+10),stops);
    return skyCache[k]=cv;
  };

  /* ---------- skyline: identical random sequence (same sizes, colours and window grid), richer facades ---------- */
  SK.skyline=function(c,x0,x1,base,minH,maxH,minW,maxW,pal,seed,opts){
    opts=opts||{}; const r=rng(seed), ru=rng(seed*7+3), ex=rng(seed*13+11), wins=[]; wins.blds=[]; let x=x0;
    const cols=opts.winCols||['#ffd27a','#8de8ff','#fff1b8','#ff9ccf'], litP=(opts.lit||.34), sy=opts.stepY||4, sx=opts.stepX||3;
    while(x<x1){
      const w=Math.min(x1-x,Math.round(minW+r()*(maxW-minW))), h=Math.round(minH+r()*(maxH-minH));
      const base_col=pal[Math.floor(r()*pal.length)], glass=mix(base_col,'#0a0a24',.38), glassHi=mix(base_col,'#bfe2ff',.25);
      const top=base-h, dark=mix(base_col,'#000000',.35), deep=mix(base_col,'#05030f',.5), hi=mix(base_col,'#ffffff',.22);
      // body with a soft fall-off toward the street, shaded side and rim light
      PX.grad(c,x,top,w,h,[base_col,base_col,mix(base_col,'#0a0820',.18),mix(base_col,'#0a0820',.4)]);
      wins.blds.push({x,w,top,col:base_col});
      const side=Math.max(1,Math.round(w/6));
      R(c,x+w-side,top,side,h,dark); R(c,x+w-side,top,1,h,mix(base_col,'#000000',.22));
      R(c,x,top,1,h,hi); R(c,x,top,w,1,mix(base_col,'#ffffff',.3));
      const ant=r()<.35; if(ant){ R(c,x+Math.floor(w/2),top-4,1,4,mix(base_col,'#ffffff',.2)); }
      // pilasters between window columns on wide towers
      if(w>=20) for(let px=x+4+sx*2;px<x+w-side-2;px+=sx*3) R(c,px,top+2,1,h-2,mix(base_col,'#000000',.12));
      if(opts.windows!==false){
        let row=0;
        for(let wy=top+3;wy<base-3;wy+=sy){
          row++;
          if(row%4===0) R(c,x+1,wy+sy-1,w-side-1,1,dark);                        // floor ledge every fourth storey
          for(let wx=x+2;wx<x+w-2;wx+=sx){
            const u=ru(), col=cols[Math.floor(r()*cols.length)], blink=r()<.18, ph=r();
            if(wx>=x+w-side-1) continue;                                            // shaded side has no windows
            if(u<litP*SK.lit){ R(c,wx,wy,1,2,col); P(c,wx,wy,mix(col,'#ffffff',.35)); }
            else { R(c,wx,wy,1,2,glass); if(SK.lit<.5&&((wx+wy)%3===0)) R(c,wx,wy,1,1,glassHi); }
            if(blink) wins.push([wx,wy,col,ph*6,u,litP,glass]);
          }
        }
      }
      // rooftop kit (own random stream, so the layout above never shifts)
      if(w>=10&&h>14){
        const k=ex();
        if(k<.3){ const tx=x+2+Math.floor(ex()*Math.max(1,w-8)); R(c,tx,top-6,5,4,dark); R(c,tx+1,top-7,3,1,dark); R(c,tx,top-2,1,2,deep); R(c,tx+4,top-2,1,2,deep); R(c,tx,top-6,1,4,mix(base_col,'#ffffff',.12)); }
        else if(k<.55){ R(c,x+2,top-3,w-4,3,base_col); R(c,x+2,top-3,w-4,1,mix(base_col,'#ffffff',.3)); R(c,x+4,top-5,w-8,2,base_col); R(c,x+w-side-1,top-3,side,3,dark); }
        else if(k<.8){ for(let i=0;i<1+Math.floor(ex()*3);i++){ const ax=x+1+Math.floor(ex()*(w-4)); R(c,ax,top-2,3,2,mix(base_col,'#9a9ab0',.5)); R(c,ax,top-2,3,1,mix(base_col,'#ffffff',.35)); } }
        if(ant&&SK.lit>.4){ P(c,x+Math.floor(w/2),top-5,'#ff4a5a'); }
        if(ex()<.22){ const nc=['#ff5ab4','#5ae8ff','#c87aff','#ffd27a'][Math.floor(ex()*4)]; R(c,x,top+1,w-side,1,mix(base_col,nc,.35+.6*SK.lit)); }
      }
      x+=w+(opts.gap||0);
    }
    return wins;
  };

  /* ---------- palms: ringed trunk and leafy fronds, same signature and sway ---------- */
  PX.palm=function(c,x,base,h,lean,col,col2,sway){
    sway=sway||0; col2=col2||col;
    const tx=x+lean, ty=base-h, ring=mix(col,'#000000',.35), lit=mix(col,'#ffffff',.12);
    for(let i=1;i<=h;i++){
      const t=i/h, xx=x+lean*t*t, yy=base-i, th=t<.3?3:(t<.7?2:2);
      R(c,xx,yy,th,1,col); P(c,xx,yy,lit);
      if(i%3===0) R(c,xx,yy,th,1,ring);
    }
    const cxp=tx+sway*.5, cyp=ty, leaf=mix(col2,'#000000',.25);
    const fr=[[-1,-.25],[-1,.3],[-.6,.7],[-.15,.85],[.3,.8],[.7,.6],[1,.3],[1,-.25],[-.5,-.55],[.45,-.55]];
    fr.forEach(([dx,dy],k)=>{
      const len=h*.44+(k%2)*3, steps=Math.max(6,Math.round(len));
      let px0=cxp, py0=cyp;
      for(let s=1;s<=steps;s++){
        const t=s/steps, bend=t*t;
        const xx=cxp+dx*len*t+sway*bend, yy=cyp+dy*len*.8*t-Math.abs(dx)*5*Math.sin(t*Math.PI)*(1-t*.6)+bend*len*.18;
        line(c,px0,py0,xx,yy,t<.5?col:col2); px0=xx; py0=yy;
        if(s>2&&s%2===0){                                                      // leaflets hanging off the rib
          const lnn=Math.round((1.5+2.5*Math.sin(t*Math.PI))*(len/18));
          const dir=dx>=0?1:-1;
          for(let q=1;q<=lnn;q++){ P(c,xx+dir*Math.floor(q/2),yy+q,q>lnn/2?leaf:col2); }
        }
      }
    });
    // coconuts and crown
    R(c,cxp-1,cyp+1,2,2,mix(col,'#6a4a2a',.5)); R(c,cxp+1,cyp+2,2,2,mix(col,'#6a4a2a',.4));
    disc(c,cxp,cyp,1,col);
  };

  /* ---------- reflections: water bands mirror what stands above them; streets shine after rain ---------- */
  // wet: [axis y, bottom y, strength] for paved streets that get a glossy mirror
  NS.WET={ downtown:[224,270,.32], gellhorn:[214,270,.28], hamlet:[204,270,.22], speedway:[214,270,.16], airport:[214,270,.14], rooftop:[200,270,.2] };
  const snap=document.createElement('canvas'); snap.width=480; snap.height=270; const sc2=snap.getContext('2d');
  function mirror(low,y0,y1,x0,x1,k,t,amp){
    const h=y1-y0; if(h<=0) return;
    low.save(); low.globalCompositeOperation='screen';
    for(let y=0;y<h;y++){
      const src=y0-1-y; if(src<0) break;
      const d=y/h, dx=Math.round(Math.sin(t*1.4+y*.55+Math.sin(t*.5+y*.09)*2)*amp*(.4+d*1.4));
      const a=k*(1-d*.75)*(y%5===4?.6:1); if(a<=.01) continue;
      low.globalAlpha=a; low.drawImage(snap,x0,src,x1-x0,1,x0+dx,y0+y,x1-x0,1);
    }
    low.restore();
  }
  const render=FX.render;
  FX.render=function(ctx,low,t,sc,weather,opt,T){
    if(NS.on&&NS.reflect){
      sc2.clearRect(0,0,480,270); sc2.drawImage(low.canvas,0,0);
      if(sc.water){ const [y0,y1,o]=sc.water, cl=(o&&o.clip)||[0,480]; mirror(low,y0,y1,cl[0],cl[1],.42,t,1); }
      const wt=NS.WET[sc.id]; if(wt){ const k=wt[2]*(weather&&weather!=='clear'?1.25:.8); mirror(low,wt[0],wt[1],0,480,k,t,.6); }
    }
    return render.apply(this,arguments);
  };
})();
