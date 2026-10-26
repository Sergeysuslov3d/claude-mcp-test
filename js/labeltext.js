// Custom brand word printed on the cassette label / CD cover instead of "LEONIDA".
// Adds a ✎ button to the control pill; the word is saved in this browser.
// Pages read window.LabelText.get() when drawing and redraw on LabelText.on(fn).
(function(){
  const KEY='lofi-label-text', DEF='LEONIDA', subs=[];
  const clean=v=>String(v||'').replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().toUpperCase().slice(0,14);
  let word=(()=>{ try{ return clean(localStorage.getItem(KEY))||DEF; }catch(e){ return DEF; } })();
  const LT=window.LabelText={ get:()=>word, on:fn=>subs.push(fn),
    set(v){ const w=clean(v)||DEF; if(w===word) return; word=w; try{ w===DEF?localStorage.removeItem(KEY):localStorage.setItem(KEY,w); }catch(e){} subs.forEach(fn=>{ try{ fn(w); }catch(e){ console.error(e); } }); } };

  const css=`.lt-pop{ position:fixed; left:50%; bottom:96px; transform:translateX(-50%) translateY(8px); z-index:30; display:flex; gap:6px; align-items:center; padding:8px; background:rgba(255,255,255,.95); backdrop-filter:blur(12px);
  border-radius:16px; box-shadow:0 10px 30px rgba(42,15,61,.18); opacity:0; pointer-events:none; transition:opacity .2s, transform .2s; font-family:Rubik, sans-serif; }
.lt-pop.open{ opacity:1; pointer-events:auto; transform:translateX(-50%); }
.lt-pop input{ width:170px; border:1px solid #e6e1ee; border-radius:10px; padding:9px 11px; font:800 italic 14px Rubik, sans-serif; letter-spacing:.04em; text-transform:uppercase; color:#1b1922; outline:none; }
.lt-pop input:focus{ border-color:#ff4f9a; }
.lt-pop button{ border:none; border-radius:10px; padding:9px 12px; font:700 11px Rubik, sans-serif; cursor:pointer; }
.pill #ltBtn{ white-space:nowrap; }
.lt-ok{ background:linear-gradient(135deg,#ff4f9a,#ff8a3d); color:#fff; } .lt-reset{ background:#f3eff8; color:#6a6478; }
@media (max-width:560px){ .lt-pop{ bottom:170px; } .lt-pop input{ width:130px; } .lt-l{ display:none; } }`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  const pop=document.createElement('form'); pop.className='lt-pop'; pop.autocomplete='off';
  pop.innerHTML='<input maxlength="14" aria-label="Label text" placeholder="LEONIDA"><button type="submit" class="lt-ok">Save</button><button type="button" class="lt-reset" title="Back to LEONIDA">Reset</button>';
  document.body.appendChild(pop);
  const inp=pop.querySelector('input');
  const open=o=>{ pop.classList.toggle('open',o); if(o){ inp.value=word; setTimeout(()=>{ inp.focus(); inp.select(); },50); } };
  inp.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Escape') open(false); });
  inp.addEventListener('input',()=>LT.set(inp.value));            // live preview while typing
  pop.addEventListener('submit',e=>{ e.preventDefault(); LT.set(inp.value); open(false); });
  pop.querySelector('.lt-reset').onclick=()=>{ LT.set(DEF); inp.value=DEF; open(false); };
  addEventListener('pointerdown',e=>{ if(pop.classList.contains('open')&&!pop.contains(e.target)&&e.target.id!=='ltBtn') open(false); });

  const pill=document.querySelector('.pill')||document.querySelector('.ctrl'), mb=document.getElementById('modeBtn');
  if(pill){ const b=document.createElement('button'); b.className='txt'; b.id='ltBtn'; b.type='button'; if(pill.classList.contains('ctrl')) b.textContent='✎'; else b.innerHTML='✎<span class="lt-l"> TEXT</span>'; b.title='Change the LEONIDA text'; b.setAttribute('aria-label','Change the label text');
    b.onclick=()=>open(!pop.classList.contains('open')); if(mb) mb.after(b); else pill.appendChild(b); }
})();
