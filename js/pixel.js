// Tiny pixel-art toolkit: everything in the scenes is drawn with these, at 480x270.
window.PX = (function(){
  const W = 480, H = 270;

  function rng(seed){
    let s = (seed >>> 0) || 1;
    return function(){ s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  const R = (c,x,y,w,h,col)=>{ c.fillStyle = col; c.fillRect(Math.round(x),Math.round(y),Math.max(0,Math.round(w)),Math.max(0,Math.round(h))); };
  const P = (c,x,y,col)=>R(c,x,y,1,1,col);

  function hexToRgb(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(x=>x+x).join(''); const n=parseInt(h,16); return [n>>16&255,n>>8&255,n&255]; }
  function mix(a,b,t){ const A=hexToRgb(a),B=hexToRgb(b); return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join(''); }

  function line(c,x0,y0,x1,y1,col){
    x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
    const dx=Math.abs(x1-x0), dy=-Math.abs(y1-y0), sx=x0<x1?1:-1, sy=y0<y1?1:-1; let err=dx+dy;
    c.fillStyle=col;
    for(;;){ c.fillRect(x0,y0,1,1); if(x0===x1&&y0===y1)break; const e2=2*err; if(e2>=dy){err+=dy;x0+=sx;} if(e2<=dx){err+=dx;y0+=sy;} }
  }
  function disc(c,cx,cy,r,col){
    c.fillStyle=col;
    for(let y=-r;y<=r;y++){ const w=Math.floor(Math.sqrt(r*r-y*y)+.5); c.fillRect(Math.round(cx)-w,Math.round(cy)+y,w*2+1,1); }
  }
  function ell(c,cx,cy,rx,ry,col){
    c.fillStyle=col;
    for(let y=-ry;y<=ry;y++){ const w=Math.floor(rx*Math.sqrt(1-(y*y)/(ry*ry+.0001))+.5); c.fillRect(Math.round(cx)-w,Math.round(cy)+y,w*2+1,1); }
  }
  const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
  // vertical gradient, banded with ordered dither between neighbouring stops
  function grad(c,x,y,w,h,stops){
    const n=stops.length-1;
    for(let j=0;j<h;j++){
      const t=h>1?j/(h-1):0, f=Math.min(n-.0001,t*n), i=Math.floor(f), k=f-i;
      for(let i2=0;i2<w;i2++){
        const th=(BAYER[(y+j)&3][(x+i2)&3]+.5)/16;
        c.fillStyle = k>th?stops[i+1]:stops[i];
        c.fillRect(x+i2,y+j,1,1);
      }
    }
  }
  // dithered translucent patch (for glow/fog without alpha blending artefacts)
  function dither(c,x,y,w,h,col,density){
    c.fillStyle=col;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){ if((BAYER[(y+j)&3][(x+i)&3]+.5)/16<density) c.fillRect(x+i,y+j,1,1); }
  }

  // 3x5 pixel font
  const G={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101111011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
    '0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110',
    '-':'000000111000000','.':'000000000000010','!':'010010010000010',':':'000010000010000','&':'010101010101011',"'":'010010000000000',' ':'000000000000000'};
  function text(c,str,x,y,col,s){
    s=s||1; let cx=x; c.fillStyle=col;
    for(const ch of String(str).toUpperCase()){
      const g=G[ch]||G[' '];
      for(let i=0;i<15;i++) if(g[i]==='1') c.fillRect(cx+(i%3)*s,y+Math.floor(i/3)*s,s,s);
      cx+=4*s;
    }
    return cx-x;
  }
  const textW=(str,s)=>String(str).length*4*(s||1)-(s||1);

  // palm tree silhouette/fronds. lean = px of horizontal drift at the crown
  function palm(c,x,base,h,lean,col,col2,sway){
    sway=sway||0;
    const tx=x+lean, ty=base-h;
    let px0=x,py0=base;
    for(let i=1;i<=h;i++){
      const t=i/h, xx=x+lean*t*t, yy=base-i;
      R(c,xx,yy,t<.5?2:1,1,col); px0=xx;py0=yy;
    }
    const cxp=tx+sway*.5, cyp=ty;
    const fr=[[-1,-.2],[-1,.35],[-.55,.7],[0,.8],[.55,.7],[1,.35],[1,-.2],[-.5,-.5],[.5,-.5]];
    fr.forEach(([dx,dy],k)=>{
      const len=h*.42+(k%2)*3;
      const ex=cxp+dx*len+sway, ey=cyp+dy*len*.8;
      const mx=cxp+dx*len*.55, my=cyp-Math.abs(dx)*5-2+dy*2;
      // two-segment frond
      line(c,cxp,cyp,mx,my,col); line(c,mx,my,ex,ey,col2||col);
      if(len>9) line(c,mx,my+1,ex,ey+1,col2||col);
    });
    disc(c,cxp,cyp+1,1,col);
  }

  function makeCanvas(w,h){ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const c=cv.getContext('2d'); c.imageSmoothingEnabled=false; return [cv,c]; }

  return { W,H,rng,R,P,mix,line,disc,ell,grad,dither,text,textW,palm,makeCanvas };
})();
