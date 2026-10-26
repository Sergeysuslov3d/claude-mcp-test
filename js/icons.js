// Click reactions in a crime-caper HUD mood: wanted stars, cash, money bags, cars, palms... original pixel icons.
window.ICONS = (function(){
  const {R,P,disc,line,ell} = PX;
  const D={
    star:[11,11,c=>{ const pts=[[5,0],[6,3],[10,4],[7,6],[8,10],[5,8],[2,10],[3,6],[0,4],[4,3]]; c.fillStyle='#1a1408'; c.beginPath(); pts.forEach(([x,y],i)=>i?c.lineTo(x+.5,y+.5):c.moveTo(x+.5,y+.5)); c.closePath(); c.fill();
      c.fillStyle='#ffd23a'; c.beginPath(); [[5,1.5],[6,4],[8.7,4.6],[6.6,6.3],[7.2,9],[5,7.6],[2.8,9],[3.4,6.3],[1.3,4.6],[4,4]].forEach(([x,y],i)=>i?c.lineTo(x+.5,y+.5):c.moveTo(x+.5,y+.5)); c.closePath(); c.fill(); P(c,4,4,'#fff6b0'); }],
    cash:[14,8,c=>{ R(c,0,0,14,8,'#14301a'); R(c,1,1,12,6,'#5ac86a'); R(c,2,2,10,4,'#3a9a4a'); R(c,6,2,2,4,'#c8f0c0'); P(c,6,2,'#14301a'); P(c,7,5,'#14301a'); R(c,1,1,1,1,'#c8f0c0'); R(c,12,6,1,1,'#c8f0c0'); }],
    bag:[11,12,c=>{ R(c,3,0,5,2,'#5a3a1a'); R(c,4,2,3,1,'#c8a050'); ell(c,5,7,5,4,'#2a1a08'); ell(c,5,7,4,3,'#a87a3a'); R(c,4,5,3,1,'#2a1a08'); R(c,5,4,1,6,'#2a1a08'); R(c,4,7,3,1,'#2a1a08'); R(c,4,9,3,1,'#2a1a08'); P(c,2,5,'#d8b060'); }],
    car:[16,9,c=>{ R(c,1,4,14,3,'#ff4f9a'); R(c,4,1,7,3,'#ff4f9a'); R(c,5,2,2,2,'#9ad8ff'); R(c,8,2,2,2,'#9ad8ff'); R(c,1,4,14,1,'#ffb0d0'); R(c,0,6,16,1,'#e8eaf2'); disc(c,4,7,1,'#121018'); disc(c,12,7,1,'#121018'); P(c,15,5,'#fffbd0'); }],
    palm:[11,14,c=>{ line(c,5,13,6,5,'#8a5a2a'); line(c,6,13,7,5,'#6a4a2a'); [[0,4],[2,1],[6,0],[10,2],[11,5],[3,6],[9,7]].forEach(([x,y])=>line(c,6,4,x,y,'#3ac860')); P(c,6,4,'#2a7a3a'); P(c,5,5,'#8a4a2a'); }],
    shades:[13,5,c=>{ R(c,0,0,13,1,'#14101e'); R(c,1,1,5,3,'#14101e'); R(c,7,1,5,3,'#14101e'); R(c,2,1,2,1,'#ff4fa0'); R(c,8,1,2,1,'#4ae8ff'); }],
    flamingo:[9,13,c=>{ ell(c,3,7,3,2,'#f06a94'); line(c,5,6,7,1,'#f06a94'); R(c,6,0,3,2,'#f06a94'); P(c,8,1,'#1a1418'); line(c,3,9,3,12,'#d84a7a'); line(c,4,9,5,12,'#d84a7a'); }],
    cocktail:[9,12,c=>{ c.fillStyle='#bfefff'; c.beginPath(); c.moveTo(0,1); c.lineTo(9,1); c.lineTo(4.5,6); c.closePath(); c.fill(); R(c,1,2,7,1,'#ff7ab0'); R(c,4,6,1,4,'#e8eaf2'); R(c,2,10,5,1,'#e8eaf2'); P(c,7,0,'#ffd24a'); line(c,6,0,8,3,'#3ac860'); }],
    blip:[11,11,c=>{ disc(c,5,5,5,'#14101e'); disc(c,5,5,4,'#ffffff'); disc(c,5,5,3,'#ffd23a'); R(c,4,3,3,1,'#14101e'); R(c,5,3,1,5,'#14101e'); }],
    gem:[10,9,c=>{ c.fillStyle='#1a1430'; c.beginPath(); c.moveTo(2,0); c.lineTo(8,0); c.lineTo(10,3); c.lineTo(5,9); c.lineTo(0,3); c.closePath(); c.fill(); c.fillStyle='#4ae8ff'; c.beginPath(); c.moveTo(2.5,1); c.lineTo(7.5,1); c.lineTo(9,3); c.lineTo(5,7.5); c.lineTo(1,3); c.closePath(); c.fill(); R(c,3,1,2,2,'#e8ffff'); }]
  };
  const urls={};
  function url(kind){ if(urls[kind]) return urls[kind]; const [w,h,fn]=D[kind]; const [cv,c]=PX.makeCanvas(w,h); fn(c); return urls[kind]=cv.toDataURL(); }
  const KINDS=Object.keys(D);
  let n=0;
  function spawn(layer,px,py){
    n++;
    if(n%9===0){ const s=document.createElement('div'); s.className='gta-pop cash'; s.textContent='+$'+[50,100,250,500,1000,2500][Math.floor(Math.random()*6)]; place(layer,s,px,py,2600); return; }
    if(n%13===0){ const s=document.createElement('div'); s.className='gta-pop stars'; for(let i=0;i<5;i++){ const im=document.createElement('img'); im.src=url('star'); im.style.animationDelay=(i*.12)+'s'; if(i>2) im.className='dim'; s.appendChild(im); } place(layer,s,px,py,2800); return; }
    const kind=KINDS[Math.floor(Math.random()*KINDS.length)], im=document.createElement('img'); im.src=url(kind); im.className='gta-ic'; im.alt='';
    place(layer,im,px,py,2400);
  }
  function place(layer,el,px,py,ms){ el.style.left=px+'%'; el.style.top=py+'%'; el.style.setProperty('--dx',(Math.random()*44-22)+'px'); el.style.setProperty('--rot',(Math.random()*30-15)+'deg'); layer.appendChild(el); setTimeout(()=>el.remove(),ms); }
  return { spawn, url, KINDS };
})();
