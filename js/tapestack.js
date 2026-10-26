// Tape shelf: the playlist as a pile of cassettes seen from the spine.
// Feel Gen mode → the six house tapes; Added mode → the listener's own songs (newest lands on top).
// Hover pulls a tape out a little, click plays it (the big 3D cassette follows), × takes it off the shelf.
(function(){
  if(!window.RealMusic) return;
  // <script data-side="left|right" data-kind="tape|cd|vinyl">: which edge, and what the spines look like
  const CFG=document.currentScript?document.currentScript.dataset:{}; const SIDE=CFG.side==='left'?'left':'right', KIND=CFG.kind||'tape';
  const TITLE={ tape:'TAPE SHELF', cd:'CD SHELF', vinyl:'RECORD CRATE' }[KIND]||'TAPE SHELF', UNIT={ tape:['tape','tapes'], cd:['CD','CDs'], vinyl:['record','records'] }[KIND]||['tape','tapes'];
  const PAL=[ ['#ff4f9a','#ff8a5c','#ffc46b'], ['#ff6fae','#c86bff','#7a4dff'], ['#22d3c5','#4cc3ff','#8fe3ff'], ['#ffb347','#ff7a45','#ff4f7a'], ['#8a4dff','#d24dff','#ff4f9a'], ['#3f7dff','#22d3c5','#a6f0c6'] ];
  const SHELL=['#f7f3ee','#ffe3ee','#e2f6f3','#fff1de','#eee6ff','#e8f0ff'];
  const hash=s=>{ let h=7; for(const c of String(s)) h=(h*31+c.charCodeAt(0))>>>0; return h; };

  const css=`
.ts{ position:fixed; right:22px; top:120px; bottom:120px; z-index:6; width:236px; display:flex; flex-direction:column; font-family:Rubik, system-ui, sans-serif; pointer-events:none; }
.ts-head{ display:flex; align-items:baseline; justify-content:space-between; padding:0 6px 8px 16px; color:var(--mute,#8d8a96); font:800 10px Rubik, sans-serif; letter-spacing:.14em; }
.ts-head b{ font-weight:800; color:var(--ink,#1b1922); }
.ts-pile{ position:relative; flex:0 1 auto; min-height:0; transition:width .6s cubic-bezier(.22,.8,.25,1), padding .6s cubic-bezier(.22,.8,.25,1); overflow-y:auto; overflow-x:hidden; padding:10px 12px 10px 34px; display:flex; flex-direction:column; gap:5px; pointer-events:auto; scrollbar-width:none; }
.ts-pile::-webkit-scrollbar{ display:none; }
.ts-tape{ --sh:#f7f3ee; position:relative; flex:none; height:38px; border-radius:5px; cursor:pointer; display:flex; align-items:center; gap:8px; padding:0 8px 0 6px;
  background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0) 40%,rgba(0,0,0,.08)),var(--sh);
  box-shadow:0 1px 0 rgba(255,255,255,.7) inset,0 -2px 0 rgba(0,0,0,.08) inset,0 3px 8px rgba(30,15,50,.18);
  transform:translateX(var(--x,0)) rotate(var(--r,0deg)); transition:transform .35s cubic-bezier(.2,.9,.3,1.2), box-shadow .3s; }
.ts-tape::before{ content:''; position:absolute; left:0; right:0; top:50%; height:1px; background:rgba(0,0,0,.06); }
.ts-tape:hover{ transform:translateX(calc(var(--x,0px) - 12px)) rotate(0deg); }
.ts-tape.on{ transform:translateX(-26px) rotate(0deg); box-shadow:0 0 0 2px var(--acc,#ff4fa0),0 8px 22px rgba(30,15,50,.3); }
.ts-tape.drop{ animation:ts-drop .55s cubic-bezier(.2,.9,.3,1.25); }
@keyframes ts-drop{ from{ transform:translateY(-46px) rotate(-6deg); opacity:0; } to{ transform:translateX(var(--x,0)) rotate(var(--r,0deg)); opacity:1; } }
.ts-band{ position:absolute; left:46px; right:30px; top:auto; bottom:4px; height:5px; border-radius:2px; background:var(--band); opacity:.9; }
.ts-lab{ position:relative; flex:1; min-width:0; height:26px; margin-bottom:6px; border-radius:3px; background:#fbf6ec; display:flex; flex-direction:column; justify-content:center; padding:0 7px; box-shadow:0 0 0 1px rgba(0,0,0,.05); }
.ts-lab b{ font:italic 600 11.5px/1.1 Rubik, sans-serif; color:#1d3fbf; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-transform:none; }
.ts-lab span{ font:800 7.5px/1.2 Rubik, sans-serif; letter-spacing:.08em; color:#2b1240; opacity:.6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-transform:uppercase; }
.ts-art{ flex:none; width:28px; height:28px; border-radius:4px; object-fit:cover; background:var(--band); box-shadow:0 0 0 1px rgba(0,0,0,.08); }
.ts-side{ flex:none; width:16px; height:16px; border-radius:3px; border:1.5px solid #2a2433; font:900 9px/13px Rubik, sans-serif; color:#2a2433; text-align:center; }
.ts-x{ position:absolute; right:-8px; top:-8px; width:20px; height:20px; border-radius:50%; border:none; background:#fff; color:#6a6478; font:700 12px/1 Rubik, sans-serif; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.2); opacity:0; transition:opacity .2s; }
.ts-tape:hover .ts-x{ opacity:1; }
.ts-reel{ flex:none; width:14px; height:14px; border-radius:50%; border:2px dotted #2a2433; opacity:0; }
.ts-tape.on .ts-reel{ opacity:.8; } .ts-tape.on.spin .ts-reel{ animation:ts-spin 1.6s linear infinite; }
@keyframes ts-spin{ to{ transform:rotate(360deg); } }
.ts-empty{ pointer-events:auto; margin:8px 4px 0 30px; padding:14px; border-radius:14px; border:1.5px dashed color-mix(in srgb,var(--ink,#1b1922) 22%,transparent); color:var(--mute,#8d8a96); font-size:12px; line-height:1.45; text-align:center; }
.ts-empty button{ margin-top:8px; border:none; border-radius:999px; padding:7px 14px; background:linear-gradient(135deg,var(--acc,#ff4f9a),var(--acc2,#ff8a3d)); color:#fff; font:700 11px Rubik, sans-serif; cursor:pointer; }
/* folded by default: just thin coloured spines at the edge; hover / keyboard focus opens the shelf */
.ts-head, .ts-tape, .ts-tape > *, .ts-empty{ transition:opacity .5s ease, height .6s cubic-bezier(.22,.8,.25,1), transform .6s cubic-bezier(.22,.8,.25,1), box-shadow .5s ease; }
/* opening: tapes unfold one after another from the top; closing: all fold together, a little faster */
.ts.open .ts-tape, .ts.open .ts-tape > *{ transition-delay:calc(var(--i,0) * 45ms); }
.ts:not(.open) .ts-tape, .ts:not(.open) .ts-tape > *{ transition-duration:.4s; transition-delay:0ms; }
.ts.open .ts-head{ transition-delay:.12s; }
.ts:not(.open) .ts-head{ opacity:0; }
.ts:not(.open) .ts-pile{ gap:4px; }
.ts:not(.open) .ts-pile{ width:46px; margin-left:auto; padding:10px 8px; }
.ts:not(.open) .ts-tape{ height:7px; opacity:.38; transform:none !important; box-shadow:none; animation:none; }
.ts:not(.open) .ts-tape.on{ opacity:.9; transform:translateX(-6px) !important; }
.ts:not(.open) .ts-tape > *:not(.ts-band){ opacity:0; pointer-events:none; }
.ts:not(.open) .ts-band{ left:0; right:0; top:0; bottom:0; height:auto; border-radius:3px; }
.ts:not(.open) .ts-empty{ opacity:0; }
.ts:not(.open) .ts-pile{ overflow:hidden; }
/* left-hand shelf (vinyl): mirrored */
.ts.vinyl{ top:150px; bottom:150px; }
.ts.left{ right:auto; left:22px; }
.ts.left .ts-pile{ padding:10px 34px 10px 12px; }
.ts.left:not(.open) .ts-pile{ margin-left:0; margin-right:auto; }
.ts.left .ts-tape:hover{ transform:translateX(calc(var(--x,0px) * -1 + 12px)) rotate(0deg); }
.ts.left .ts-tape.on{ transform:translateX(26px) rotate(0deg); }
.ts.left:not(.open) .ts-tape.on{ transform:translateX(6px) !important; }
.ts.left .ts-x{ right:auto; left:-8px; }
.ts.left .ts-head{ padding:0 16px 8px 6px; }
.ts:not(.open) .ts-pile{ max-height:32vh; }
/* CD spines: clear jewel case edge with a printed insert */
.ts.cd .ts-tape{ border-radius:3px; background:linear-gradient(180deg,rgba(255,255,255,.85),rgba(235,238,245,.55) 45%,rgba(205,210,222,.7)); box-shadow:0 0 0 1px rgba(150,160,180,.45) inset,0 3px 8px rgba(30,15,50,.16); }
.ts.cd .ts-tape::before{ top:auto; bottom:5px; background:rgba(120,130,150,.25); }
.ts.cd .ts-lab{ background:var(--band); } .ts.cd .ts-lab b{ color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.35); } .ts.cd .ts-lab span{ color:#fff; opacity:.85; }
.ts.cd .ts-reel{ border:none; background:radial-gradient(circle,#fff 0 18%,transparent 19%),conic-gradient(#ffd6ec,#c9f4ff,#e8ffd0,#ffe9b8,#e3d1ff,#ffd6ec); }
/* vinyl spines: cardboard sleeve edges */
.ts.vinyl .ts-tape{ border-radius:2px; height:34px; background:linear-gradient(90deg,rgba(0,0,0,.08),transparent 8%),var(--band); box-shadow:0 1px 0 rgba(255,255,255,.35) inset,0 3px 8px rgba(30,15,50,.22); }
.ts.vinyl .ts-tape::before{ display:none; }
.ts.vinyl .ts-band{ display:none; }
.ts.vinyl .ts-lab{ background:rgba(255,255,255,.88); }
.ts.vinyl .ts-reel{ border:none; background:radial-gradient(circle,#ff4f9a 0 22%,#111 23% 100%); }
.ts.vinyl:not(.open) .ts-tape{ height:7px; }
@media (max-width:900px){ .ts{ display:none; } }
@media (prefers-reduced-motion:reduce){ .ts-tape, .ts-tape.drop, .ts-reel{ transition:none; animation:none !important; } }`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  const root=document.createElement('aside'); root.className='ts '+KIND+(SIDE==='left'?' left':''); root.setAttribute('aria-label',TITLE.charAt(0)+TITLE.slice(1).toLowerCase());
  root.innerHTML='<div class="ts-head"><span>'+TITLE+'</span><b></b></div><div class="ts-pile"></div>'; document.body.appendChild(root);
  const pile=root.querySelector('.ts-pile'), count=root.querySelector('.ts-head b');
  let seen=new Set(), first=true, playing=false;

  function tapeEl({ key, title, sub, side, band, shell, art, on, onPlay, onRemove }){
    const el=document.createElement('div'); el.className='ts-tape'+(on?' on':''); el.setAttribute('role','button'); el.tabIndex=0; el.title=title+(sub?' — '+sub:'');
    const h=hash(key); el.style.setProperty('--r',((h%7)-3)*.35+'deg'); el.style.setProperty('--x',-(h%10)+'px'); el.style.setProperty('--sh',shell); el.style.setProperty('--band','linear-gradient(90deg,'+band.join(',')+')');
    let lead; if(art){ lead=document.createElement('img'); lead.className='ts-art'; lead.alt=''; lead.loading='lazy'; lead.src=art; } else { lead=document.createElement('i'); lead.className='ts-side'; lead.textContent=side||'A'; }
    const lab=document.createElement('div'); lab.className='ts-lab'; const t=document.createElement('b'), s=document.createElement('span'); t.textContent=title; s.textContent=sub||''; lab.append(t,s);
    const bandEl=document.createElement('i'); bandEl.className='ts-band'; const reel=document.createElement('i'); reel.className='ts-reel';
    el.append(lead,lab,reel,bandEl);
    if(onRemove){ const x=document.createElement('button'); x.type='button'; x.className='ts-x'; x.textContent='×'; x.title='Take off the shelf'; x.setAttribute('aria-label','Remove '+title); x.onclick=e=>{ e.stopPropagation(); onRemove(); }; el.appendChild(x); }
    el.onclick=onPlay; el.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); e.stopPropagation(); onPlay(); } };
    el.style.setProperty('--i',pile.children.length);
    if(!first&&!seen.has(key)) el.classList.add('drop');
    return el; }

  function render(){
    // the shelf always holds the saved songs (My list), whatever music mode is on; a tap plays the song
    const real=true; pile.textContent=''; const keys=new Set();
    if(real){
      const list=RealMusic.list(), cur=RealMusic.current; count.textContent=list.length?list.length+' '+(list.length===1?UNIT[0]:UNIT[1]):'';
      if(!list.length){ const e=document.createElement('div'); e.className='ts-empty'; e.innerHTML='Your saved songs live here as '+UNIT[1]+'.<br>'; const b=document.createElement('button'); b.type='button'; b.textContent='Add songs'; b.onclick=()=>RealMusic.open(); e.appendChild(b); pile.appendChild(e); }
      list.forEach((it,i)=>{ const key='r:'+it.title+'|'+it.artist, h=hash(key); keys.add(key);
        pile.appendChild(tapeEl({ key, title:it.title, sub:it.artist, art:it.art, band:PAL[h%PAL.length], shell:SHELL[h%SHELL.length], on:RealMusic.mode==='real'&&i===cur, onPlay:()=>RealMusic.play(i), onRemove:()=>RealMusic.remove(i) })); });
    } else if(window.CassetteDeck){
      const D=CassetteDeck; count.textContent=D.tapes.length+' tapes';
      D.tapes.forEach((tp,i)=>{ const key='g:'+tp.name; keys.add(key); const S=window.Lofi&&Lofi.STYLES&&Lofi.STYLES[tp.style];
        pile.appendChild(tapeEl({ key, title:tp.name, sub:'Lofi · '+(S?S.name:tp.style), side:'A', band:tp.band||PAL[i%PAL.length], shell:tp.c||SHELL[i%SHELL.length], on:i===D.current, onPlay:()=>D.play(i) })); });
    }
    seen=keys; first=false; markPlaying(); }
  function markPlaying(){ pile.querySelectorAll('.ts-tape').forEach(el=>el.classList.toggle('spin',playing&&el.classList.contains('on'))); }

  // hover intent: open after a short pause, close a moment after the pointer leaves
  let tOpen=0, tClose=0; const setOpen=o=>{ clearTimeout(tOpen); clearTimeout(tClose); if(o) tOpen=setTimeout(()=>root.classList.add('open'),170); else tClose=setTimeout(()=>root.classList.remove('open'),380); };
  pile.addEventListener('pointerenter',()=>setOpen(true)); pile.addEventListener('pointerleave',()=>setOpen(false));
  root.addEventListener('focusin',()=>{ clearTimeout(tClose); root.classList.add('open'); }); root.addEventListener('focusout',e=>{ if(!root.contains(e.relatedTarget)) setOpen(false); });
  RealMusic.on(render); addEventListener('tapechange',()=>setTimeout(render,0));
  Lofi.on('state',S=>{ playing=!!S.playing; markPlaying(); });
  // the deck module loads after this script: draw once it is ready
  render();
})();
