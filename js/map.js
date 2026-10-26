// Pixel-art map of Leonida drawn in code (own rendition; not an official map). 480x692 base, scaled up crisp.
window.LeoMap = (function(){
  const SRC_W=1386, SRC_H=2000, W=480, H=692, K=W/SRC_W, U=K/0.1732;

  const COAST=[[790,105],[700,118],[600,148],[500,180],[400,225],[310,290],[240,380],[200,470],[170,540],[165,610],[195,680],[250,740],[290,800],[300,880],[275,960],[285,1040],[330,1110],[345,1200],[400,1270],[430,1340],[470,1410],[520,1500],[560,1590],[620,1660],[700,1705],[800,1735],[900,1745],
    [975,1690],[1030,1620],[1080,1550],[1090,1470],[1130,1400],[1190,1340],[1280,1325],[1340,1290],[1340,1210],[1335,1130],[1290,1060],[1255,1000],[1240,920],[1250,840],[1230,760],[1265,690],[1295,610],[1290,520],[1250,440],[1215,350],[1170,260],[1110,190],[1040,140],[950,110],[870,100]];

  function spline(pts,closed){
    const n=pts.length, P=i=>pts[(i+n)%n]; const out=[];
    for(let i=0;i<(closed?n:n-1);i++){ const p0=closed?P(i-1):pts[Math.max(i-1,0)], p1=pts[i], p2=closed?P(i+1):pts[i+1], p3=closed?P(i+2):pts[Math.min(i+2,n-1)];
      for(let t=0;t<1;t+=.2){ const t2=t*t,t3=t2*t; out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
        .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]); } }
    return out;
  }
  const path=(c,pts,close)=>{ c.beginPath(); pts.forEach(([x,y],i)=>{ const X=x*K,Y=y*K; i?c.lineTo(X,Y):c.moveTo(X,Y); }); if(close) c.closePath(); };

  function solid(dst,color,fn){
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d'); c.fillStyle='#000'; c.strokeStyle='#000'; fn(c);
    const id=c.getImageData(0,0,W,H), d=id.data; const r=parseInt(color.slice(1,3),16), g=parseInt(color.slice(3,5),16), b=parseInt(color.slice(5,7),16);
    for(let i=0;i<d.length;i+=4){ if(d[i+3]>=110){ d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255; } else d[i+3]=0; }
    c.putImageData(id,0,0); dst.drawImage(cv,0,0);
  }
  const ellP=(c,x,y,rx,ry,rot)=>{ c.beginPath(); c.ellipse(x*K,y*K,rx*K,ry*K,(rot||0)*Math.PI/180,0,Math.PI*2); };
  const polyP=(c,pts)=>path(c,pts,true);
  function bres(c,x0,y0,x1,y1,col,th){ x0=Math.round(x0*K);y0=Math.round(y0*K);x1=Math.round(x1*K);y1=Math.round(y1*K); const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1; let e=dx+dy; c.fillStyle=col; th=th||1; for(;;){ c.fillRect(x0,y0,th,th); if(x0===x1&&y0===y1)break; const e2=2*e; if(e2>=dy){e+=dy;x0+=sx;} if(e2<=dx){e+=dx;y0+=sy;} } }
  function road(c,pts,col,th){ const s=spline(pts,false); for(let i=0;i<s.length-1;i++) bres(c,s[i][0],s[i][1],s[i+1][0],s[i+1][1],col,th); }
  // street grid inside a rotated rectangle
  function streets(c,cx,cy,w,h,rot,step,col){ const a=rot*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a);
    const P=(u,v)=>[cx+u*ca-v*sa, cy+u*sa+v*ca];
    for(let u=-w/2;u<=w/2;u+=step){ const A=P(u,-h/2), B=P(u,h/2); bres(c,A[0],A[1],B[0],B[1],col); }
    for(let v=-h/2;v<=h/2;v+=step){ const A=P(-w/2,v), B=P(w/2,v); bres(c,A[0],A[1],B[0],B[1],col); } }
  function runways(c,x,y,len,rot,n,gap,col){ const a=rot*Math.PI/180; for(let i=0;i<n;i++){ const o=(i-(n-1)/2)*gap, ox=-Math.sin(a)*o, oy=Math.cos(a)*o; bres(c,x+ox-Math.cos(a)*len/2,y+oy-Math.sin(a)*len/2,x+ox+Math.cos(a)*len/2,y+oy+Math.sin(a)*len/2,col,2); } }

  function render(cv){
    cv.width=W; cv.height=H; const c=cv.getContext('2d'); c.imageSmoothingEnabled=false;
    const coast=spline(COAST,true);
    // water: deep, dotted texture, faint grid
    c.fillStyle='#2a5fa8'; c.fillRect(0,0,W,H);
    for(let y=0;y<H;y+=3) for(let x=(y/3)%2*2;x<W;x+=6){ c.fillStyle='#2f68b2'; c.fillRect(x,y,1,1); }
    c.fillStyle='rgba(120,180,255,.16)'; for(let x=0;x<W;x+=48) c.fillRect(x,0,1,H); for(let y=0;y<H;y+=48) c.fillRect(0,y,W,1);
    solid(c,'#3f8ad0',cc=>{ cc.lineWidth=22*U/2; cc.lineJoin='round'; path(cc,coast,true); cc.stroke(); });
    solid(c,'#62b0e0',cc=>{ cc.lineWidth=14*U/2; cc.lineJoin='round'; path(cc,coast,true); cc.stroke(); });
    solid(c,'#8cd2ea',cc=>{ cc.lineWidth=7*U/2; cc.lineJoin='round'; path(cc,coast,true); cc.stroke(); });
    // keys
    const keys=[[310,1890,95,32,-12],[500,1962,62,30,6],[690,1986,28,13,0],[150,1600,14,8,0],[1252,1453,26,16,0],[1140,1505,20,14,0],[1335,1405,34,22,0],[1120,1325,18,10,0],[490,712,36,26,0]];
    solid(c,'#62b0e0',cc=>keys.forEach(([x,y,rx,ry,r])=>{ ellP(cc,x,y,rx+26,ry+22,r); cc.fill(); }));
    solid(c,'#8cd2ea',cc=>keys.forEach(([x,y,rx,ry,r])=>{ ellP(cc,x,y,rx+12,ry+10,r); cc.fill(); }));
    solid(c,'#f0e0a0',cc=>keys.forEach(([x,y,rx,ry,r])=>{ ellP(cc,x,y,rx+4,ry+3,r); cc.fill(); }));
    solid(c,'#a8d070',cc=>keys.forEach(([x,y,rx,ry,r])=>{ ellP(cc,x,y,Math.max(4,rx-4),Math.max(3,ry-3),r); cc.fill(); }));
    solid(c,'#f0e0a0',cc=>{ cc.lineWidth=2.6*U/2; path(cc,spline([[560,1990],[700,1965],[800,1925],[860,1870],[900,1790],[900,1745]],false)); cc.stroke(); });
    // land
    solid(c,'#f0e0a0',cc=>{ path(cc,coast,true); cc.fill(); });
    solid(c,'#c6dc88',cc=>{ cc.save(); cc.translate(W/2,H/2); cc.scale(.987,.987); cc.translate(-W/2,-H/2); path(cc,coast,true); cc.fill(); cc.restore(); });
    solid(c,'#62b0e0',cc=>{ cc.lineWidth=3*U/2; path(cc,spline([[1232,1030],[1272,1110],[1276,1200],[1250,1290]],false)); cc.stroke(); });
    // forests / mountains with contour rings
    const ring=(x,y,rx,ry,r,cols)=>cols.forEach((col,i)=>solid(c,col,cc=>{ const f=1-i*.2; ellP(cc,x,y,rx*f,ry*f,r); cc.fill(); }));
    ring(700,540,200,270,0,['#a6c670','#98b866','#8aab5c','#7c9e52']);
    ring(920,640,110,130,10,['#a6c670','#98b866','#8aab5c']);
    ring(780,330,70,60,0,['#7c9e52','#6e9048']);
    ring(880,450,95,70,0,['#8fb35c','#7fa44e']);                 // Redhill forests
    ring(450,1050,90,160,0,['#b0d078','#a2c46c']);
    ring(730,1110,120,90,0,['#a0cc78','#8fc070']);               // Cypress reserve
    // rivers
    const RIV='#62b0e0';
    for(const pts of [[[700,380],[740,470],[800,540],[880,610],[930,690]],[[560,470],[640,560],[700,620],[770,640]],[[950,890],[900,1000],[820,1100],[770,1190]],[[420,262],[520,300],[600,360]]])
      solid(c,RIV,cc=>{ cc.lineWidth=1.6*U/2*2; path(cc,spline(pts,false)); cc.stroke(); });
    // lake
    solid(c,'#8cd2ea',cc=>{ ellP(cc,950,780,100,115,0); cc.fill(); }); solid(c,'#62b0e0',cc=>{ ellP(cc,950,780,84,98,0); cc.fill(); });
    solid(c,'#62b0e0',cc=>{ ellP(cc,640,470,30,18,0); cc.fill(); });
    // swamps
    solid(c,'#a6cf80',cc=>{ polyP(cc,[[470,1430],[620,1400],[760,1440],[900,1470],[960,1560],[940,1660],[860,1710],[700,1690],[590,1640],[520,1560]]); cc.fill(); });
    for(let i=0;i<260;i++){ const a=(i*97%100)/100, b=(i*57%100)/100, x=500+a*430, y=1440+b*270; c.fillStyle=(i%3)?'#7ab8a8':'#5aa0a0'; c.fillRect(Math.round(x*K),Math.round(y*K),(i%4)+2,1); }
    for(let i=0;i<120;i++){ const a=(i*71%100)/100, b=(i*43%100)/100, x=300+a*260, y=200+b*180; c.fillStyle=(i%2)?'#7ab8a8':'#6aa890'; c.fillRect(Math.round(x*K),Math.round(y*K),(i%3)+2,1); }  // northern swamps
    for(let i=0;i<110;i++){ const a=(i*53%100)/100, b=(i*31%100)/100, x=560+a*300, y=1000+b*230; c.fillStyle='#7ab8a8'; c.fillRect(Math.round(x*K),Math.round(y*K),(i%3)+2,1); }
    // urban areas
    const urban='#d6cfe4', urbanD='#b6aed0', STREET='#a49cc2';
    solid(c,urban,cc=>{ polyP(cc,[[930,1180],[1000,1060],[1080,990],[1170,960],[1190,1100],[1160,1250],[1150,1330],[1100,1450],[1040,1560],[965,1500],[905,1400],[925,1300]]); cc.fill(); });
    solid(c,urban,cc=>{ ellP(cc,350,640,100,150,12); cc.fill(); });
    solid(c,urban,cc=>{ ellP(cc,940,210,170,70,28); cc.fill(); });
    solid(c,urban,cc=>{ ellP(cc,1308,1170,28,115,3); cc.fill(); });
    solid(c,urban,cc=>{ ellP(cc,1245,890,16,60,0); cc.fill(); });
    solid(c,urban,cc=>{ ellP(cc,1135,690,12,55,0); cc.fill(); });
    solid(c,urban,cc=>{ ellP(cc,825,870,42,30,0); cc.fill(); });
    solid(c,urban,cc=>{ ellP(cc,470,1300,48,50,0); cc.fill(); });
    solid(c,urban,cc=>{ ellP(cc,330,1895,70,24,-12); cc.fill(); });
    solid(c,urban,cc=>{ ellP(cc,822,1585,40,26,0); cc.fill(); ellP(cc,640,1585,22,14,0); cc.fill(); ellP(cc,780,490,32,18,0); cc.fill(); ellP(cc,1330,1000,16,30,0); cc.fill(); ellP(cc,1345,1130,14,26,0); cc.fill(); });
    solid(c,urban,cc=>{ ellP(cc,490,712,28,20,0); cc.fill(); ellP(cc,1190,1322,50,26,10); cc.fill(); ellP(cc,1250,1453,18,10,0); cc.fill(); });
    solid(c,urbanD,cc=>{ ellP(cc,1010,1100,46,60,0); cc.fill(); ellP(cc,1040,1250,40,50,0); cc.fill(); });
    // street grids
    streets(c,1050,1210,200,300,-8,26,STREET); streets(c,350,640,150,230,12,24,STREET); streets(c,940,205,230,90,28,24,STREET); streets(c,470,1300,70,70,0,14,STREET);
    streets(c,1308,1170,30,170,3,16,STREET); streets(c,822,1585,56,34,0,12,STREET); streets(c,825,870,56,40,0,12,STREET); streets(c,330,1895,100,30,-12,12,STREET);
    // racetrack + S.E.R.A. station
    solid(c,'#3a3f52',cc=>{ ellP(cc,1010,365,64,34,-22); cc.fill(); }); solid(c,'#a6c670',cc=>{ ellP(cc,1010,365,44,20,-22); cc.fill(); });
    solid(c,'#8a8fa8',cc=>{ ellP(cc,1228,470,20,20,0); cc.fill(); ellP(cc,1262,486,16,16,0); cc.fill(); }); solid(c,'#c6dc88',cc=>{ ellP(cc,1228,470,10,10,0); cc.fill(); ellP(cc,1262,486,7,7,0); cc.fill(); });
    // airports
    solid(c,'#5a5f70',cc=>{ cc.fillRect(840*K,1240*K,150*K,70*K); cc.fillRect(380*K,1010*K,60*K,130*K); cc.fillRect(1050*K,340*K,100*K,36*K); cc.fillRect(300*K,470*K,130*K,70*K); });
    runways(c,915,1275,130,-20,3,16,'#d6d8e6'); runways(c,410,1075,110,80,2,14,'#d6d8e6'); runways(c,1100,358,90,-20,2,10,'#d6d8e6'); runways(c,365,505,100,-35,2,12,'#d6d8e6');
    // roads (highways + loops)
    const RC='#6a6f86';
    road(c,[[1090,1450],[1085,1180],[1100,900],[1090,640],[1040,430],[940,250]],RC,2);
    road(c,[[1090,1450],[900,1420],[600,1370],[520,1000],[440,760],[500,520],[780,300],[940,250]],RC,2);
    road(c,[[500,520],[780,560],[1090,640]],RC,1); road(c,[[520,1000],[820,880],[1085,900]],RC,1); road(c,[[600,1370],[800,1500],[960,1560]],RC,1);
    road(c,[[1090,1450],[1260,1230],[1300,1160]],RC,1); road(c,[[1020,1560],[1000,1650],[900,1745]],RC,2);
    road(c,[[430,1340],[560,1380],[600,1370]],RC,1); road(c,[[780,300],[860,440],[900,560]],RC,1); road(c,[[330,640],[430,700],[500,712]],RC,1);
    road(c,[[300,1890],[500,1962],[690,1986],[900,1790]],'#e8d890',1);
    // peaks
    solid(c,'#eef2dc',cc=>{ ellP(cc,775,323,12,10,0); cc.fill(); ellP(cc,715,577,8,7,0); cc.fill(); ellP(cc,598,642,7,6,0); cc.fill(); ellP(cc,915,596,8,7,0); cc.fill(); });
    // lava-like scar on Mt. Mountain
    road(c,[[650,550],[668,610],[690,650]],'#e8884a',2);
  }
  return { render, SRC_W, SRC_H, W, H };
})();
