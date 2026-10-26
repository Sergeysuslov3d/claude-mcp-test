// Colour themes for the object pages (vinyl, cassette, CD). Load in <head> so the page never flashes.
// The choice is shared by all pages; without one each page keeps its own look (<html data-default-theme>).
(function(){
  const KEY='lofi-theme', root=document.documentElement;
  const THEMES=[ ['light','Light',['#ffffff','#ffd9e8']], ['dark','Dark',['#0d0b14','#ff4fa0']], ['neon','Neon',['#07060d','#19f5ff','#ff2bd6']],
    ['nature','Nature',['#eef4e4','#3f8f5a']], ['sunset','Sunset',['#ffd6a5','#ff6b4a','#c8a2ff']], ['ocean','Ocean',['#06141f','#2fd5c6']], ['vice','Vice City',['#ff3d8b','#2fd5c6','#3b1b7a']] ];
  const ok=t=>THEMES.some(x=>x[0]===t);
  const saved=(()=>{ try{ return localStorage.getItem(KEY); }catch(e){ return null; } })();
  const mark=()=>{ document.querySelectorAll('.theme-pop button').forEach(b=>b.classList.toggle('on',b.dataset.t===root.dataset.theme)); };
  const apply=t=>{ root.dataset.theme=t; mark(); };
  apply(ok(saved)?saved:(root.dataset.defaultTheme||'light'));
  window.Theme={ list:THEMES.map(x=>x[0]), get:()=>root.dataset.theme, set(t){ if(!ok(t)) return; apply(t); try{ localStorage.setItem(KEY,t); }catch(e){} dispatchEvent(new Event('themechange')); } };
  addEventListener('DOMContentLoaded',()=>{
    const nav=document.querySelector('.lnav, .vtop nav'); if(!nav) return;
    const b=document.createElement('button'); b.id='themeBtn'; b.type='button'; b.className='theme-btn'; b.textContent='◐'; b.title='Colour theme'; b.setAttribute('aria-label','Colour theme'); b.setAttribute('aria-haspopup','true');
    const pop=document.createElement('div'); pop.className='theme-pop'; pop.setAttribute('role','menu');
    for(const [id,name,cols] of THEMES){ const o=document.createElement('button'); o.type='button'; o.dataset.t=id; o.setAttribute('role','menuitemradio');
      const sw=document.createElement('i'); sw.style.background=cols.length>2?'linear-gradient(135deg,'+cols.join(',')+')':'linear-gradient(135deg,'+cols[0]+' 50%,'+cols[1]+' 50%)';
      o.append(sw,document.createTextNode(name)); o.onclick=()=>{ Theme.set(id); pop.classList.remove('open'); }; pop.appendChild(o); }
    b.onclick=e=>{ e.stopPropagation(); pop.classList.toggle('open'); };
    addEventListener('pointerdown',e=>{ if(!pop.contains(e.target)&&e.target!==b) pop.classList.remove('open'); });
    addEventListener('keydown',e=>{ if(e.key==='Escape') pop.classList.remove('open'); });
    nav.append(b); document.body.appendChild(pop); mark();
  });
})();
