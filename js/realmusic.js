// Two music modes for the object pages:
//   'mine' (Feel Gen) — the generated Lofi Leonida engine (default)
//   'real' (Added)    — the listener's own list of real songs: type a name, pick the song (names + covers from the
//                       iTunes Search API), the site finds it on YouTube (/api/yt) and plays it in YouTube's own
//                       embedded player. Nothing is downloaded or re-hosted. If YouTube can't play it, the
//                       30-second Apple Music preview plays instead.
// Load right after js/audio.js and before the page scripts: it wraps window.Lofi so the page code
// (play / pause / next, 'track' + 'state' events) drives whichever source is active.
(function(){
  const L=window.Lofi; if(!L) return;
  const KEY='lofi-music-mode';
  let mode=(()=>{ try{ return localStorage.getItem(KEY)==='real'?'real':'mine'; }catch(e){ return 'mine'; } })();

  // ---- route page listeners: engine events only in 'mine', ours only in 'real'
  const H={}, on0=L.on;
  L.on=function(ev,fn){ (H[ev]=H[ev]||[]).push(fn); return on0.call(L,ev,(...a)=>{ if(mode==='mine') fn(...a); }); };
  const emit=(ev,d)=>{ (H[ev]||[]).forEach(fn=>{ try{ fn(d); }catch(e){ console.error(e); } }); };

  const S0=L.state, RS={ playing:false, track:null, real:true };
  Object.defineProperty(L,'state',{ get(){ return mode==='real'?RS:S0; }, configurable:true });
  // pages start the engine when Lofi.ctx is empty; in 'real' mode the player is "ready" so play/pause toggles directly
  const ctxGet=Object.getOwnPropertyDescriptor(L,'ctx').get;
  Object.defineProperty(L,'ctx',{ get(){ return mode==='real'?true:ctxGet.call(L); }, configurable:true });
  const O={}; for(const k of ['play','pause','toggle','next','prev','playSeed','setStyle']) O[k]=L[k];
  L.play=(...a)=>mode==='real'?R.play():O.play(...a);
  L.pause=(...a)=>mode==='real'?R.pause():O.pause(...a);
  L.toggle=(...a)=>mode==='real'?(RS.playing?R.pause():R.play()):O.toggle(...a);
  L.next=(...a)=>mode==='real'?R.step(1):O.next(...a);
  L.prev=(...a)=>mode==='real'?R.step(-1):O.prev(...a);
  L.playSeed=(...a)=>mode==='real'?R.play():O.playSeed(...a);
  L.setStyle=(...a)=>mode==='real'?undefined:O.setStyle(...a);

  // ---- UI
  const css=`
.rm-switch{ position:fixed; left:50%; top:84px; transform:translateX(-50%); z-index:20; display:flex; padding:4px; gap:2px; background:rgba(255,255,255,.75); backdrop-filter:blur(10px); border-radius:999px; box-shadow:0 4px 18px rgba(42,15,61,.1); }
.rm-switch button{ border:none; background:none; font:700 11px/1 Rubik, sans-serif; color:#6a6478; padding:8px 14px; border-radius:999px; cursor:pointer; letter-spacing:.02em; }
.rm-switch button.on{ background:#1b1922; color:#fff; }
.rm-panel{ position:fixed; left:0; top:0; bottom:0; z-index:25; width:330px; display:flex; flex-direction:column; gap:10px; padding:22px 16px 18px; background:rgba(255,255,255,.9); backdrop-filter:blur(16px); border-radius:0 24px 24px 0; box-shadow:10px 0 40px rgba(42,15,61,.16); font-family:Rubik, sans-serif; box-sizing:border-box;
  transform:translateX(-104%); transition:transform .45s cubic-bezier(.2,.8,.2,1); visibility:hidden; }
.rm-on .rm-panel{ visibility:visible; } .rm-panel.open{ transform:none; }
.rm-tab{ position:fixed; left:0; top:50%; z-index:24; transform:translateY(-50%); display:none; border:none; cursor:pointer; padding:16px 9px; border-radius:0 16px 16px 0;
  background:linear-gradient(180deg,#ff4f9a,#ff8a3d); color:#fff; font:800 11px/1 Rubik, sans-serif; letter-spacing:.12em; writing-mode:vertical-rl; transform-origin:left center; box-shadow:4px 0 16px rgba(255,79,154,.35); }
.rm-on .rm-tab{ display:block; } .rm-tab:hover{ padding-left:13px; }
.rm-head{ display:flex; align-items:center; gap:6px; }
.rm-head b{ font:800 15px Rubik, sans-serif; color:#1b1922; flex:1; }
.rm-close{ width:30px; height:30px; border-radius:50%; border:none; background:#f3eff8; color:#6a6478; font:700 16px/1 Rubik, sans-serif; cursor:pointer; }
.rm-tabs{ display:flex; gap:4px; }
.rm-tabs button{ border:none; background:#f3eff8; color:#6a6478; font:700 11px Rubik, sans-serif; padding:7px 12px; border-radius:999px; cursor:pointer; }
.rm-tabs button.on{ background:#1b1922; color:#fff; }
.rm-sec{ font:800 10px Rubik, sans-serif; letter-spacing:.12em; color:#ff4f9a; padding:6px 6px 2px; }
.rm-panel form{ display:flex; gap:6px; }
.rm-panel input{ flex:1; min-width:0; border:1px solid #e6e1ee; border-radius:12px; padding:10px 12px; font:500 13px Rubik, sans-serif; color:#1b1922; background:#fff; outline:none; }
.rm-panel input:focus{ border-color:#ff4f9a; }
.rm-panel form button{ border:none; border-radius:12px; padding:0 14px; background:linear-gradient(135deg,#ff4f9a,#ff8a3d); color:#fff; font:700 12px Rubik, sans-serif; cursor:pointer; }
.rm-note{ font-size:10.5px; color:#8a8494; line-height:1.4; }
.rm-list{ overflow:auto; display:flex; flex-direction:column; gap:2px; min-height:0; }
.rm-item{ position:relative; display:flex; align-items:center; gap:10px; padding:6px; border-radius:12px; cursor:pointer; text-align:left; width:100%; box-sizing:border-box; }
.rm-item:hover{ background:#f6f2fa; } .rm-item.on{ background:#ffe3ee; } .rm-item.busy{ opacity:.55; pointer-events:none; }
.rm-item img{ width:42px; height:42px; border-radius:8px; object-fit:cover; flex:none; background:#eee; }
.rm-item b{ display:block; font-size:12.5px; font-weight:700; color:#1b1922; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rm-item span{ display:block; font-size:11px; color:#8a8494; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rm-item > div{ min-width:0; flex:1; }
.rm-item i{ font-style:normal; flex:none; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px; }
.rm-plus{ background:linear-gradient(135deg,#ff4f9a,#ff8a3d); color:#fff; } .rm-x{ color:#b0a9bc; } .rm-x:hover{ background:#f0eaf6; color:#1b1922; }
.rm-back{ border:none; background:none; text-align:left; font:700 11px Rubik, sans-serif; color:#ff4f9a; padding:4px 6px 6px; cursor:pointer; }
.rm-empty{ font-size:12px; color:#8a8494; padding:10px 6px; line-height:1.45; }
.rm-embed{ border-radius:12px; overflow:hidden; background:#000; flex:none; }
.rm-embed:empty{ display:none; }
.rm-embed iframe{ width:100%; height:158px; border:0; display:block; }
@media (max-width:560px){ .rm-on .lnow{ display:none; } .rm-switch{ top:108px; } .rm-panel{ width:88vw; } .rm-embed iframe{ height:130px; } }`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  const sw=document.createElement('div'); sw.className='rm-switch';
  sw.innerHTML='<button data-m="mine" title="Music generated live, never the same twice">Feel Gen</button><button data-m="real" title="Your own songs — type a name, the site finds it">Added</button>';
  const panel=document.createElement('div'); panel.className='rm-panel';
  panel.setAttribute('aria-label','Songs'); panel.innerHTML='<div class="rm-head"><b>Songs</b><button type="button" class="rm-close" aria-label="Close">×</button></div><form autocomplete="off"><input type="search" placeholder="Type a song or artist" aria-label="Type a song or artist" maxlength="120"><button type="submit">Find</button></form>'
    +'<div class="rm-tabs"><button type="button" data-v="gta">GTA 6</button><button type="button" data-v="lib">My list</button></div>'
    +'<div class="rm-note">Type a name, tap the song — it’s added to your list and plays from YouTube.</div><div class="rm-embed"></div><div class="rm-list"></div>';
  const tab=document.createElement('button'); tab.type='button'; tab.className='rm-tab'; tab.textContent='♪ SONGS'; tab.setAttribute('aria-label','Open songs');
  const drawer=open=>{ panel.classList.toggle('open',open); tab.style.visibility=open?'hidden':''; if(open) setTimeout(()=>input.focus({preventScroll:true}),300); };
  tab.onclick=()=>drawer(true); panel.querySelector('.rm-close').onclick=()=>drawer(false);
  panel.querySelector('.rm-tabs').addEventListener('click',e=>{ const b=e.target.closest('button'); if(b){ view=b.dataset.v; if(view==='gta') loadGTA(); render(); } });
  const input=panel.querySelector('input'), list=panel.querySelector('.rm-list'), embed=panel.querySelector('.rm-embed'), note=panel.querySelector('.rm-note');
  document.body.append(sw,panel,tab);

  // ---- "Added": the listener's own saved list (this browser only)
  const LIB='lofi-added', MAX=80;
  const okItem=it=>it&&typeof it.title==='string'&&(!it.art||/^https:\/\//.test(it.art))&&
    ((it.yt&&/^[\w-]{11}$/.test(it.yt))||(it.preview&&/^https:\/\/[\w.-]+\.itunes\.apple\.com\//.test(it.preview)));
  let lib=(()=>{ try{ const a=JSON.parse(localStorage.getItem(LIB)||'[]'); return Array.isArray(a)?a.filter(okItem).slice(0,MAX):[]; }catch(e){ return []; } })();
  const subs=[]; const notify=()=>subs.forEach(fn=>{ try{ fn(); }catch(e){ console.error(e); } });
  const save=()=>{ notify(); try{ localStorage.setItem(LIB,JSON.stringify(lib.map(({title,artist,art,yt,alt,preview})=>({title,artist,art,yt,alt,preview})))); }catch(e){} };
  let results=[], view=lib.length?'lib':'gta';
  // songs heard in the official GTA VI trailers (Trailer 1, Trailer 2, Extended Look)
  const GTA6=[['Tom Petty','Love Is a Long Road'],['The Pointer Sisters','Hot Together'],['Wang Chung','Everybody Have Fun Tonight'],['Jay Ferguson','Thunder Island'],
    ['Tammy Wynette',"Talkin' to Myself Again"],['Joan Jett & the Blackhearts',"I Love Rock 'n' Roll"],['Zenglen','Child Support'],['Birdman','Pop Bottles'],['Sexyy Red','Pound Town'],
    ['Kodak Black','Skrilla'],['The Bellamy Brothers','Let Your Love Flow'],['Def Leppard','Love Bites'],['Depeche Mode','People Are People'],['Phil Collins','Against All Odds (Take a Look at Me Now)'],['Cliff Richard','Devil Woman']];
  let gta=null, gtaBusy=false;
  async function loadGTA(){ if(gta||gtaBusy) return; gtaBusy=true;
    try{ const c=JSON.parse(sessionStorage.getItem('lofi-gta6')||'null'); if(Array.isArray(c)&&c.length){ gta=c; gtaBusy=false; render(); return; } }catch(e){}
    const got=await Promise.all(GTA6.map(async([artist,title])=>{ const base={ title, artist, art:'', preview:'' };
      try{ const r=await fetch('https://itunes.apple.com/search?media=music&entity=song&limit=5&term='+encodeURIComponent(artist+' '+title)); const j=await r.json();
        const x=(j.results||[]).find(x=>String(x.artistName||'').toLowerCase().includes(artist.toLowerCase().split(' ')[0].replace('the',''))||true);
        if(x){ base.art=String(x.artworkUrl100||'').replace('100x100','200x200'); if(/^https:\/\/[\w.-]+\.itunes\.apple\.com\//.test(x.previewUrl||'')) base.preview=x.previewUrl; if(!/^https:\/\//.test(base.art)) base.art=''; } }catch(e){}
      return base; }));
    gta=got; gtaBusy=false; try{ sessionStorage.setItem('lofi-gta6',JSON.stringify(gta)); }catch(e){} render(); }

  // ---- player: YouTube's embedded player (controlled over postMessage), Apple preview as fallback
  const MUTE=/[?&]mute\b/.test(location.search);   // ?mute = silent while developing
  const YT='https://www.youtube-nocookie.com';
  const audio=new Audio(); audio.preload='none'; audio.muted=MUTE;
  let cur=-1, frame=null, usingYT=false, tryIdx=0, ytDur=0;
  const ytCmd=(func,args=[])=>{ if(frame&&frame.contentWindow) frame.contentWindow.postMessage(JSON.stringify({ event:'command', func, args }),YT); };
  function mountYT(id){ embed.textContent=''; const f=frame=document.createElement('iframe');
    f.src=YT+'/embed/'+id+'?enablejsapi=1&autoplay=1&rel=0&playsinline=1'+(MUTE?'&mute=1':'')+'&origin='+encodeURIComponent(location.origin);
    f.allow='autoplay; encrypted-media'; f.referrerPolicy='strict-origin-when-cross-origin'; f.title='YouTube player';
    f.addEventListener('load',()=>{ let n=0; const hello=setInterval(()=>{ if(frame!==f||n++>10) return clearInterval(hello); f.contentWindow.postMessage(JSON.stringify({ event:'listening', id:1, channel:'widget' }),YT); },300); });
    embed.appendChild(f); usingYT=true; }
  addEventListener('message',e=>{ if(e.origin!==YT||!frame||e.source!==frame.contentWindow) return; let d; try{ d=JSON.parse(e.data); }catch(err){ return; }
    const it=lib[cur]; if(!it) return;
    if(d.event==='onError'){ // not embeddable / removed: try the next match, then the preview
      const ids=[it.yt,...(it.alt||[])]; tryIdx++; if(tryIdx<ids.length) mountYT(ids[tryIdx]); else playPreview(it); return; }
    const ps=d.event==='onStateChange'?d.info:(d.event==='infoDelivery'&&d.info&&d.info.playerState!=null?d.info.playerState:null);
    if(ps===0) R.step(1);                                   // ended
    else if(ps===1&&!RS.playing){ RS.playing=true; emit('state',RS); }
    else if(ps===2&&RS.playing){ RS.playing=false; emit('state',RS); }
    if(d.event==='infoDelivery'&&d.info&&d.info.currentTime!=null){ if(d.info.duration) ytDur=d.info.duration; if(ytDur){ emit('progress',{ cur:d.info.currentTime, dur:ytDur }); if(document.body.dataset.realstep!=null) emit('step',{ step:Math.round(d.info.currentTime/ytDur*64), loops:1 }); } } });
  function playPreview(it){ embed.textContent=''; frame=null; usingYT=false; if(!it.preview){ note.textContent='This song can’t be played here — try another version.'; RS.playing=false; emit('state',RS); return; }
    audio.src=it.preview; audio.currentTime=0; audio.play().catch(()=>{}); note.textContent='YouTube won’t play this one here — playing a 30-second preview.'; }
  audio.addEventListener('ended',()=>R.step(1));
  audio.addEventListener('timeupdate',()=>{ if(!usingYT&&audio.duration) emit('progress',{ cur:audio.currentTime, dur:audio.duration }); if(!usingYT&&audio.duration&&document.body.dataset.realstep!=null) emit('step',{ step:Math.round(audio.currentTime/audio.duration*64), loops:1 }); });

  const R={
    play(){ if(cur<0||!lib[cur]){ if(lib.length) return R.start(0); input.focus(); return; }
      if(usingYT) ytCmd('playVideo'); else audio.play().catch(()=>{}); RS.playing=true; emit('state',RS); },
    pause(){ audio.pause(); if(usingYT) ytCmd('pauseVideo'); RS.playing=false; emit('state',RS); },
    step(d){ if(!lib.length) return; R.start((Math.max(0,cur)+d+lib.length)%lib.length); },
    start(i){ const it=lib[i]; if(!it) return; cur=i; tryIdx=0; ytDur=0; audio.pause();
      if(it.yt) mountYT(it.yt); else playPreview(it);
      RS.track={ name:it.title, artist:it.artist, art:it.art }; RS.playing=true;
      emit('track',{ name:it.artist?it.title+' — '+it.artist:it.title, title:it.title, artist:it.artist, art:it.art||'', style:'real', bpm:0, real:true }); emit('state',RS); render();
      if(innerWidth<=560) drawer(false); notify(); }
  };

  // ---- list rendering
  function row(it,on,onClick,extra){ const b=document.createElement('div'); b.className='rm-item'+(on?' on':''); b.setAttribute('role','button'); b.tabIndex=0;
    const img=document.createElement('img'); img.alt=''; img.loading='lazy'; if(it.art) img.src=it.art;
    const d=document.createElement('div'), t=document.createElement('b'), a=document.createElement('span'); t.textContent=it.title; a.textContent=it.artist||''; d.append(t,a);
    b.append(img,d); if(extra) b.appendChild(extra); b.onclick=e=>onClick(e,b); b.onkeydown=e=>{ if(e.key==='Enter') onClick(e,b); }; return b; }
  function render(){ list.textContent='';
    panel.querySelectorAll('.rm-tabs button').forEach(b=>{ b.classList.toggle('on',b.dataset.v===view); if(b.dataset.v==='lib') b.textContent='My list ('+lib.length+')'; });
    if(view==='gta'){
      const h=document.createElement('div'); h.className='rm-sec'; h.textContent='FROM THE GTA VI TRAILERS'; list.appendChild(h);
      if(!gta){ const e=document.createElement('div'); e.className='rm-empty'; e.textContent='Loading…'; list.appendChild(e); loadGTA(); return; }
      gta.forEach(it=>{ const plus=document.createElement('i'); plus.className='rm-plus'; plus.textContent='+'; list.appendChild(row(it,false,(e,el)=>addSong(it,el),plus)); });
      return; }
    if(view==='search'){
      const back=document.createElement('button'); back.type='button'; back.className='rm-back'; back.textContent='← Back'; back.onclick=()=>{ view=lib.length?'lib':'gta'; render(); }; list.appendChild(back);
      results.forEach(it=>{ const plus=document.createElement('i'); plus.className='rm-plus'; plus.textContent='+'; list.appendChild(row(it,false,(e,el)=>addSong(it,el),plus)); });
      return; }
    if(!lib.length){ const e=document.createElement('div'); e.className='rm-empty'; e.textContent='Your list is empty. Type a song or artist above.'; list.appendChild(e); return; }
    lib.forEach((it,i)=>{ const x=document.createElement('i'); x.className='rm-x'; x.textContent='×'; x.title='Remove';
      x.onclick=e=>{ e.stopPropagation(); if(i===cur){ R.pause(); embed.textContent=''; frame=null; usingYT=false; cur=-1; } else if(cur>i) cur--; lib.splice(i,1); save(); render(); };
      list.appendChild(row(it,i===cur,()=>R.start(i),x)); }); }

  async function addSong(it,el){ if(el) el.classList.add('busy'); note.textContent='Finding “'+it.title+'” on YouTube…';
    let ids=[];
    try{ const r=await fetch('/api/yt?q='+encodeURIComponent(it.artist+' '+it.title+' official audio')); const j=await r.json(); ids=(j.ids||[]).filter(x=>/^[\w-]{11}$/.test(x)); }catch(e){}
    const song={ title:it.title, artist:it.artist, art:it.art, preview:it.preview, yt:ids[0]||'', alt:ids.slice(1,4) };
    if(!okItem(song)){ note.textContent='Couldn’t find that one — try another song.'; if(el) el.classList.remove('busy'); return; }
    lib=[song,...lib.filter(x=>!(x.title===song.title&&x.artist===song.artist))].slice(0,MAX); save(); view='lib';
    note.textContent=song.yt?'Added — playing from YouTube.':'Added — YouTube didn’t answer, playing a 30-second preview.'; R.start(0); }

  panel.querySelector('form').addEventListener('submit',async e=>{ e.preventDefault(); const q=input.value.trim(); if(!q) return;
    note.textContent='Searching…';
    try{ const r=await fetch('https://itunes.apple.com/search?media=music&entity=song&limit=15&term='+encodeURIComponent(q)); const j=await r.json();
      results=(j.results||[]).map(x=>({ title:String(x.trackName||'').slice(0,120), artist:String(x.artistName||'').slice(0,80), art:String(x.artworkUrl100||'').replace('100x100','200x200'), preview:String(x.previewUrl||'') }))
        .filter(x=>x.title&&/^https:\/\//.test(x.art||'https://')&&(!x.preview||/^https:\/\/[\w.-]+\.itunes\.apple\.com\//.test(x.preview)))
        .filter((x,i,arr)=>arr.findIndex(y=>y.title.toLowerCase()===x.title.toLowerCase()&&y.artist.toLowerCase()===x.artist.toLowerCase())===i);
      view='search'; render(); note.textContent=results.length?'Tap a song to add it to your list.':'Nothing found — try another name.';
    }catch(err){ note.textContent='Search is unavailable right now — try again in a moment.'; } });

  function setMode(m){ if(m===mode) return;
    if(m==='real'){ if(S0.playing) O.pause(); } else { R.pause(); }
    mode=m; try{ localStorage.setItem(KEY,m); }catch(e){}
    document.body.classList.toggle('rm-on',m==='real'); [...sw.children].forEach(b=>b.classList.toggle('on',b.dataset.m===m));
    emit('state',L.state); if(m==='mine'&&S0.track) emit('track',S0.track); if(m==='real'&&RS.track) emit('track',{ name:RS.track.artist?RS.track.name+' — '+RS.track.artist:RS.track.name, title:RS.track.name, artist:RS.track.artist, art:RS.track.art||'', style:'real', real:true });
    if(m==='real') drawer(true); else drawer(false);  notify(); }
  sw.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b) setMode(b.dataset.m); });
  document.body.classList.toggle('rm-on',mode==='real'); [...sw.children].forEach(b=>b.classList.toggle('on',b.dataset.m===mode));
  input.addEventListener('keydown',e=>e.stopPropagation());   // typing must not trigger the page shortcuts (space, arrows)
  render();
  window.RealMusic={ get mode(){ return mode; }, setMode, on:fn=>subs.push(fn), list:()=>lib.slice(), get current(){ return cur; },
    play(i){ if(mode!=='real') setMode('real'); if(lib[i]) R.start(i); }, remove(i){ if(!lib[i]) return; if(i===cur){ R.pause(); embed.textContent=''; frame=null; usingYT=false; cur=-1; } else if(cur>i) cur--; lib.splice(i,1); save(); render(); },
    open:()=>{ if(mode!=='real') setMode('real'); else drawer(true); } };
})();
