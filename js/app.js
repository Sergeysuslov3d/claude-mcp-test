(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={ get(){ try{return JSON.parse(localStorage.getItem('lofi-leonida')||'{}');}catch(e){return {};} }, set(o){ try{ localStorage.setItem('lofi-leonida',JSON.stringify(Object.assign(store.get(),o))); }catch(e){} } };
const saved=store.get();

/* ---------- scene engine ---------- */
const cv=$('#scene'), ctx=cv.getContext('2d'); ctx.imageSmoothingEnabled=false;
const lowCv=document.createElement('canvas'); lowCv.width=480; lowCv.height=270; const low=lowCv.getContext('2d',{willReadFrequently:true}); low.imageSmoothingEnabled=false;
const fxOpt={ q:saved.q||'high', glow:saved.glow!==false, grain:saved.grain!==false, lines:!!saved.lines };
const bgs={};
// scenery per time-of-day phase (sky area left transparent), relit from the night-authored art
function scenery(i,phase){ const sc=SCENES[i], k=sc.id+'|'+phase; if(bgs[k]) return bgs[k];
  const [cv,c]=PX.makeCanvas(480,270); const L=TOD.PAL[phase].lamp; SK.lit=L; SK.k=Math.max(.15,L); sc.build(c,phase); SK.lit=1; SK.k=1;
  TOD.relight(c,phase,sc.relight==null?1:sc.relight); return bgs[k]=cv; }
function ensure(i){ const [cv,c]=PX.makeCanvas(480,270); const T=curT||TOD.at(TOD.hour(),'clear'); c.drawImage(SKYX.gradientCanvas(SCENES[i],T.a),0,0); c.drawImage(scenery(i,T.a),0,0); return cv; }
let curT=null;
let idx=0, weatherSel=saved.weather||'local', motion=saved.motion||((window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)?'light':'smooth');
let needRedraw=true, last=0; const t0=performance.now();
const effWeather=()=>weatherSel==='local'?SCENES[idx].weather:weatherSel;

function draw(t){
  const sc=SCENES[idx], w=effWeather(), T=TOD.at(TOD.hour(),w); curT=T;
  low.fillStyle='#000'; low.fillRect(0,0,480,270);
  low.drawImage(SKYX.gradientCanvas(sc,T.a),0,0); if(T.f>.01){ low.globalAlpha=T.f; low.drawImage(SKYX.gradientCanvas(sc,T.b),0,0); low.globalAlpha=1; }
  if(!sc.under){ SKYX.overcast(low,sc,T); SKYX.stars(low,sc,T,t); SK.k=1; SKYX.celestial(low,sc,T,t); SKYX.clouds(low,sc,T,t); }
  if(window.LIFE) LIFE.sky(low,sc,T,t);
  low.drawImage(scenery(idx,T.a),0,0); if(T.f>.01){ low.globalAlpha=T.f; low.drawImage(scenery(idx,T.b),0,0); low.globalAlpha=1; }
  SK.k=T.lampK; SK.lit=T.P.lamp;
  if(sc.water) LIFE.water(low,sc,T,t,sc.water[0],sc.water[1],sc.water[2]);
  WX.pending=null; WX.skip=fxOpt.q!=='classic';
  const env={weather:w,tod:T};
  sc.frame(low,t,env); if(sc.under) WX.pending=null;
  LIFE.people(low,sc,env,t);
  if(sc.id!=='apartment') CAST.draw(low,t,sc.id);
  if(sc.over) sc.over(low,t,env);
  if(window.LIFE) LIFE.front(low,sc,T,t);
  SK.k=1; SK.lit=1; WX.skip=false;
  FX.render(ctx,low,t,sc,w,fxOpt,T);
  const tl=$('#locTime'); if(tl){ const s=TOD.label(T.h)+(TOD.mode==='auto'?' local time':' · '+(TOD.mode==='cycle'?'time-lapse':TOD.mode)); if(tl.textContent!==s) tl.textContent=s; }
  if(WX.tickStorm(t,w==='storm')) Lofi.thunder();
}
function loop(now){
  requestAnimationFrame(loop);
  if(Lofi.state.playing){ const lv=Lofi.level(); const d=$('#npDot'); d.style.transform='scale('+(1+Math.min(1.4,lv*9))+')'; d.style.background=lv>.004?'#8dffb0':'#a093c8'; }
  const fps={smooth:30,light:14,still:0}[motion];
  if(!fps){ if(needRedraw){ draw(2.5); needRedraw=false; } return; }
  if(now-last<1000/fps-2) return; last=now; draw((now-t0)/1000);
}

/* ---------- audio state helpers ---------- */
const soundMul=(sc,id)=>{ const o=(saved.mix2||{})[sc.id]; return o&&o[id]!=null?o[id]:1; };
function mixFor(sc){ const m={}; for(const id in sc.sounds) m[id]=sc.sounds[id]*soundMul(sc,id); return m; }
function applyAudio(){ if(!Lofi.ctx) return; Lofi.setSceneSounds(mixFor(SCENES[idx])); Lofi.setWeather(effWeather()); }

/* ---------- navigation ---------- */
const nums=$('#nums');
SCENES.forEach((s,i)=>{ const b=document.createElement('button'); b.textContent=i+1; b.title=s.name; b.setAttribute('aria-label',s.name); b.onclick=()=>go(i); nums.appendChild(b); });
function go(i,instant){
  i=(i+SCENES.length)%SCENES.length;
  const apply=()=>{
    idx=i; const sc=SCENES[i]; ensure(i);
    $('#locName').textContent=sc.name; $('#locSub').textContent=sc.sub; $('#locTag').textContent=sc.tag;
    document.title=sc.name+' — Lofi Leonida';
    $$('#nums button').forEach((b,k)=>b.classList.toggle('on',k===i));
    try{ history.replaceState(null,'','#'+sc.id); }catch(e){}
    store.set({scene:sc.id}); needRedraw=true; applyAudio(); refreshPanel(); if(openPanel==='people') rerender('people'); markMap();
  };
  if(instant){ apply(); return; }
  const f=$('#fade'); f.classList.add('on'); setTimeout(()=>{ apply(); setTimeout(()=>f.classList.remove('on'),60); },200);
}
$('#prevLoc').onclick=()=>go(idx-1); $('#nextLoc').onclick=()=>go(idx+1);
window.addEventListener('hashchange',()=>{ const k=SCENES.findIndex(s=>s.id===location.hash.slice(1)); if(k>=0&&k!==idx) go(k); });

/* tour */
const TOURS=[0,5,10,15,30]; let tourI=Math.max(0,TOURS.indexOf(saved.tour||0)), tourTimer=null, tourStart=Date.now();
function setTour(i){ tourI=i; const m=TOURS[i]; $('#tourBtn').textContent='Tour: '+(m?m+' min':'off'); $('#tourBtn').classList.toggle('on',!!m); store.set({tour:m}); tourStart=Date.now(); clearInterval(tourTimer); if(m) tourTimer=setInterval(()=>{ if(Date.now()-tourStart>=m*60000){ tourStart=Date.now(); go(idx+1); } },5000); }
$('#tourBtn').onclick=()=>setTour((tourI+1)%TOURS.length);
const TMODES=[['auto','Time: live'],['cycle','Time: lapse'],['dawn','Dawn'],['day','Day'],['sunset','Sunset'],['dusk','Dusk'],['night','Night']];
function setTime(m){ TOD.setMode(m); store.set({tod:m}); const b=$('#timeBtn'); if(b){ b.textContent=TMODES.find(x=>x[0]===m)[1]; b.classList.toggle('on',m!=='auto'); } needRedraw=true; }
$('#timeBtn').onclick=()=>{ const i=TMODES.findIndex(x=>x[0]===TOD.mode); setTime(TMODES[(i+1)%TMODES.length][0]); };
setTime(saved.tod||'auto');

/* ---------- playback ---------- */
const playBtn=$('#playBtn');
function syncPlay(){ const p=Lofi.state.playing; document.body.classList.toggle('playing',p); playBtn.textContent=p?'⏸ Pause':'▶ Play'; playBtn.classList.toggle('hot',!p); }
function startMusic(){ Lofi.init(); Lofi.setVolume(saved.vol!=null?saved.vol:.8); Lofi.loadMix(saved.mixer||{}); applyAudio(); Lofi.play(); syncPlay(); }
function togglePlay(){ if(!Lofi.ctx){ startMusic(); } else { Lofi.toggle(); applyAudio(); syncPlay(); } }
playBtn.onclick=togglePlay; $('#bigPlay').onclick=startMusic;
$('#nextBtn').onclick=()=>{ if(!Lofi.ctx) startMusic(); Lofi.next(); syncPlay(); };
$('#prevBtn').onclick=()=>{ if(!Lofi.ctx) startMusic(); if(!Lofi.prev()) toast('No earlier track yet'); syncPlay(); };
$('#favBtn').onclick=()=>{ const T=Lofi.state.track; if(!T){ toast('Press play first'); return; } const had=isFav(T); if(had) favs=favs.filter(f=>!(f.seed===T.seed&&f.style===T.style)); else favs.push({seed:T.seed,style:T.style}); saved.favs=favs; store.set({favs}); updateFav(); refreshPanel(); toast(had?'Removed from favorites':'Saved to favorites'); };
$('#linkBtn').onclick=()=>{ const u=trackLink(); const done=()=>toast('Track link copied'); if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done,()=>toast(u)); else toast(u); };
const NOTE=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
Lofi.on('track',T=>{ $('#npText').textContent=T.name+' · '+Lofi.STYLES[T.style].name+' · '+T.bpm+' BPM'; updateFav(); refreshPanel(); });
Lofi.on('state',syncPlay); Lofi.on('queue',()=>refreshPanel());
if(saved.style&&(saved.style==='mix'||Lofi.STYLES[saved.style])) Lofi.state.style=saved.style;
Lofi.loadMix(saved.mixer||{}); if(saved.radio) Lofi.setRadio(true);
if(saved.energy!=null) Lofi.setEnergy(saved.energy); if(saved.band) Lofi.setBand(saved.band);

/* ---------- panels ---------- */
const panelsEl=$('#panels'); let openPanel=null;
const WEATHER=[['local','Local'],['drizzle','Drizzle'],['rain','Rain'],['storm','Thunderstorm'],['clear','Clear'],['fog','Fog']];
let focus={ mode:'focus', left:25*60, running:false, timer:null }, sleepEnd=0, sleepTimer=null;
const fmtT=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
let tasks=saved.tasks||[]; let reactOn=false; let jamOn=false;

const fmtD=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
let styleView=saved.styleView||'grid';
// yellow slider row: value shown as a percentage; fmt 'tempo' shows a speed multiplier
function sliderOut(val,fmt){ return fmt==='tempo'?'×'+(0.8+val/100*0.4).toFixed(2):(fmt==='key'?(val>0?'+':'')+val+' st':val+'%'); }
function slider(label,val,min,max,attr,fmt,def){
  const pct=((val-min)/(max-min)*100).toFixed(1);
  return '<div class="ys"><span>'+label+'</span><input type="range" min="'+min+'" max="'+max+'" value="'+val+'" '+attr+' data-def="'+def+'" data-fmt="'+fmt+'" style="--v:'+pct+'%"><output class="'+(val!==def?'chg':'')+'">'+sliderOut(val,fmt)+'</output></div>';
}

const fmtH=s=>{ const h=Math.floor(s/3600), m=Math.floor(s%3600/60); return h?h+'h '+m+'m':m+'m'; };
let qTab='next', favs=saved.favs||[];
const stats=Object.assign({day:'',today:0,total:0},saved.stats||{});
function tickStats(){ const d=new Date().toISOString().slice(0,10); if(stats.day!==d){ stats.day=d; stats.today=0; } stats.today++; stats.total++; if(stats.total%15===0){ saved.stats=stats; store.set({stats}); } }
setInterval(()=>{ if(Lofi.state.playing) tickStats(); },1000);
function toast(msg){ let t=$('#toast'); if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); } t.textContent=msg; t.classList.add('on'); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('on'),2300); }
const isFav=T=>!!T&&favs.some(f=>f.seed===T.seed&&f.style===T.style);
function updateFav(){ const b=$('#favBtn'), on=isFav(Lofi.state.track); b.textContent=on?'♥':'♡'; b.classList.toggle('on',on); }
function trackLink(){ const T=Lofi.state.track; const base=location.origin==='null'||location.protocol==='file:'?location.href.split('?')[0].split('#')[0]:location.origin+location.pathname; return base+(T?'?t='+T.seed+'-'+T.style:'')+location.hash; }
function afterPanel(){ if(openPanel==='people'){ const L=CAST.list(SCENES[idx].id); $$('#panelBox canvas.pv').forEach(cv=>{ const p=L.find(q=>q.id===cv.dataset.pid); if(p) CAST.portrait(cv,p); }); } }
function doAct(a,btn){
  if(a==='midi'){ const m=Lofi.midi(); if(!m){ toast('Press play to pick a track first'); return; } download(new Blob([m],{type:'audio/midi'}),'lofi-leonida-'+Lofi.state.track.name.replace(/\W+/g,'-')+'.mid'); toast('MIDI saved'); }
  else if(a==='rec'){ if(!Lofi.state.playing){ toast('Press play first'); return; } let left=30; btn.disabled=true; btn.textContent='Recording… 30s';
    const iv=setInterval(()=>{ left--; btn.textContent='Recording… '+left+'s'; },1000);
    Lofi.record(30).then(b=>{ clearInterval(iv); download(b,'lofi-leonida-'+Date.now()+'.webm'); btn.textContent='Saved ✓'; setTimeout(()=>{ btn.textContent='Record 30 s'; btn.disabled=false; },1800); })
      .catch(err=>{ clearInterval(iv); toast(err.message); btn.textContent='Record 30 s'; btn.disabled=false; }); }
}

const PANELS={
  vibe(){
    const S=Lofi.state, st=Lofi.STYLES, sel=S.style==='mix'?null:st[S.style];
    const swc=(attr,on)=>'<button class="switch'+(on?' on':'')+'" '+attr+' role="switch" aria-checked="'+on+'"><i></i></button>';
    const item=id=>{ const v=st[id]; return '<button class="sty'+(S.style===id?' sel':'')+'" data-style="'+id+'" title="'+esc(v.desc)+'"><span class="ic">'+v.icon+'</span><span>'+esc(v.name)+'</span></button>'; };
    return '<div class="ph"><h3>VIBE</h3><span>shape the music</span></div>'
     +'<div class="trow"><div><b>Radio</b> <kbd>O</kbd><p>the same song for everyone · '+esc(Lofi.radioLabel())+'</p></div>'+swc('data-radio="1"',S.radio)+'</div>'
     +'<div class="trow"><div><b>Jam</b> <kbd>J</kbd><p>the keys 1-8 play notes that fit the music</p></div>'+swc('data-jam="1"',jamOn)+'</div>'
     +'<div class="shead"><span>Style</span><div class="vtog"><button class="'+(styleView==='grid'?'on':'')+'" data-view="grid" aria-label="Grid view">▦</button><button class="'+(styleView==='list'?'on':'')+'" data-view="list" aria-label="List view">☰</button></div></div>'
     +'<button class="mixstyle'+(S.style==='mix'?' sel':'')+'" data-style="mix"><span class="ic">🔀</span> Mix</button>'
     +Lofi.GROUPS.map(([g,ids])=>'<h5>'+g.toUpperCase()+'</h5><div class="stygrid '+styleView+'">'+ids.map(item).join('')+'</div>').join('')
     +'<p class="sdesc">'+(S.style==='mix'?'<b>Mix</b> · a different style for every track':(sel?'<b>'+esc(sel.name)+'</b> · '+esc(sel.desc):''))+'</p>'
     +'<h4>ENERGY</h4><div class="seg">'+['Chill','Balanced','Upbeat'].map((n,i)=>'<button class="'+(S.energy===i?'on':'')+'" data-energy="'+i+'">'+n+'</button>').join('')+'</div>'
     +'<h4>BAND</h4><div class="seg">'+[['full','Full band'],['nodrums','No drums'],['chords','Chords only']].map(([k,n])=>'<button class="'+(S.band===k?'on':'')+'" data-band="'+k+'">'+n+'</button>').join('')+'</div>'
     +'<h4>VOLUME</h4>'+slider('Master',Math.round(S.vol*100),0,100,'data-vol="1"','',100);
  },
  queue(){
    const radio=Lofi.state.radio;
    const tabs='<div class="seg qtabs"><button class="'+(qTab==='next'?'on':'')+'" data-qtab="next">Up next</button><button class="'+(qTab==='favs'?'on':'')+'" data-qtab="favs">Favorites ('+favs.length+')</button></div>';
    let body;
    if(qTab==='favs'){
      body=favs.length?'<ol class="uq">'+favs.map(f=>{ const inf=Lofi.info(Lofi.makeTrack(f.seed,f.style)); return '<li data-seed="'+f.seed+'" data-sstyle="'+f.style+'"><button class="unfav" data-unfav="'+f.seed+'-'+f.style+'" aria-label="Remove from favorites">♥</button><div><b>'+esc(inf.name)+'</b><small>'+esc(inf.key)+' · '+inf.bpm+' bpm · '+esc(Lofi.STYLES[f.style].name)+'</small></div><span>'+fmtD(inf.dur)+'</span></li>'; }).join('')+'</ol>'
        :'<p class="empty">Press the ♡ on the track you like and it is saved here.</p>';
    } else {
      body='<ol class="uq">'+Lofi.queue().map((t,i)=>'<li data-seed="'+t.seed+'" data-sstyle="'+t.style+'"><em'+(i===0?' class="first"':'')+'>'+(i+1)+'</em><div><b>'+esc(t.name)+'</b><small>'+esc(t.key)+' · '+t.bpm+' bpm'+(radio?' · '+new Date(t.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'')+'</small></div><span>'+fmtD(t.dur)+'</span></li>').join('')+'</ol>';
    }
    return '<div class="ph"><h3>'+(qTab==='favs'?'FAVORITES':'UP NEXT')+'</h3><span>'+(radio&&qTab==='next'?'radio schedule':'pick a track to play it now')+'</span></div>'+tabs+body;
  },
  mixer(){
    const M=Lofi.MIX, D=Lofi.MIX_DEFAULT;
    const row=(id,label,max)=>slider(label,Math.round(M[id]*100),0,max||100,'data-mix="'+id+'"','',Math.round(D[id]*100));
    return '<div class="ph"><h3>MUSIC MIXER</h3><button class="lnk" data-reset-music="1">reset</button></div>'
     +'<div class="seg wrap">'+Object.keys(Lofi.PRESETS).map(n=>'<button data-preset="'+esc(n)+'">'+esc(n)+'</button>').join('')+'</div>'
     +'<h4>INSTRUMENTS</h4>'+row('keys','Keys',150)+row('bass','Bass',150)+row('drums','Drums',150)+row('melody','Melody',150)
     +'<div class="sep2"></div><h4>CHARACTER</h4>'+row('vinyl','Vinyl &amp; hiss')+row('tape','Tape warmth')+row('grit','Lo-fi grit')+row('reverb','Reverb')+row('bright','Brightness')+row('wobble','Tape wobble')
     +'<div class="sep2"></div><h4>FEEL</h4>'+row('swing','Swing')+row('human','Looseness')+row('pump','Pump')
     +slider('Key shift',M.key|0,-6,6,'data-mix="key"','key',0)+slider('Tempo',Math.round(M.tempo*100),0,100,'data-mix="tempo"','tempo',50);
  },
  people(){
    const sc=SCENES[idx], L=CAST.list(sc.id), apt=CAST.isApt(sc.id), spots=CAST.spotsFor(sc.id);
    const sw=(arr,cur,attr,pid)=>'<div class="sws">'+arr.map(c=>'<button class="sw'+(c===cur?' on':'')+'" style="background:'+c+'" '+attr+'="'+c+'" data-pid="'+pid+'" aria-label="'+c+'"></button>').join('')+'</div>';
    const card=p=>'<div class="pc"><div class="pc-top"><canvas class="pv" data-pid="'+p.id+'"></canvas>'
      +'<div class="pc-main"><input type="text" class="pname" value="'+esc(p.name)+'" maxlength="18" data-pid="'+p.id+'" aria-label="Name">'
      +'<select data-spot="1" data-pid="'+p.id+'" aria-label="Where">'+spots.map(([k,n])=>'<option value="'+k+'"'+(p.spot===k?' selected':'')+'>'+n+'</option>').join('')+'</select></div>'
      +'<button class="rm" data-rm="'+p.id+'" aria-label="Remove '+esc(p.name)+'" title="Remove">✕</button></div>'
      +'<div class="pc-opts"><div class="sl2"><small>Hair</small><select data-hairstyle="1" data-pid="'+p.id+'">'+CAST.STYLES.map(([k,n])=>'<option value="'+k+'"'+(p.hairStyle===k?' selected':'')+'>'+n+'</option>').join('')+'</select>'+sw(CAST.HAIR,p.hair,'data-c-hair',p.id)+'</div>'
      +'<div class="sl2"><small>Skin</small>'+sw(CAST.SKIN,p.skin,'data-c-skin',p.id)+'</div>'
      +'<div class="sl2"><small>Top</small>'+sw(CAST.TOP,p.top,'data-c-top',p.id)+'</div>'
      +'<div class="sl2"><small>Bottom</small>'+sw(CAST.BOTTOM,p.bottom,'data-c-bottom',p.id)+'</div>'
      +(!apt&&p.spot==='stand'?slider('Position',Math.round(p.x),0,100,'data-px="1" data-pid="'+p.id+'"','',50):'')
      +'<div class="row" style="margin-top:8px"><button class="chip sm" data-rand="'+p.id+'">Randomize look</button></div></div></div>';
    return '<div class="ph"><h3>PEOPLE · '+esc(sc.name.toUpperCase())+'</h3><span>'+L.length+' / '+CAST.MAXP+'</span></div>'
      +'<div class="row"><button class="chip sm hot" data-add-person="1">+ Add person</button><button class="chip sm" data-reset-cast="1">Default cast</button><button class="chip sm" data-clear-cast="1">Remove all</button></div>'
      +(L.length?L.map(card).join(''):'<p class="empty">Nobody here yet. Add a person and they will move in.</p>')
      +'<p class="empty">Original pixel residents. Name them anything you like.'+(apt?' Each spot in the apartment fits one person.':' In this place people stroll along the ground or stand where you place them.')+'</p>';
  },
  weather(){
    return `<h3>WEATHER</h3><p>Local uses this place's own weather. Rain and thunder change the sounds too.</p><h4>PICK ONE</h4>
    <div class="row">${WEATHER.map(([k,n])=>`<button class="chip sm ${weatherSel===k?'on':''}" data-weather="${k}">${n}</button>`).join('')}</div>`;
  },
  sounds(){
    const sc=SCENES[idx], ids=Object.keys(sc.sounds);
    const CONT=['wind','traffic','waves','crowd','rain','neon','industrial','crickets','frogs','fire'], EVT=['horns','thunder','siren'];
    const row=id=>slider(Lofi.SOUND_LABELS[id]||id,Math.round(soundMul(sc,id)*100),0,200,'data-snd="'+id+'"','',100);
    const a=CONT.filter(i=>ids.includes(i)), b=EVT.filter(i=>ids.includes(i));
    return '<div class="ph"><h3>CITY SOUNDS</h3><button class="lnk" data-reset-snd="1">reset</button></div>'+a.map(row).join('')+(b.length?'<div class="sep2"></div>'+b.map(row).join(''):'');
  },
  focus(){
    return `<h3>FOCUS &amp; SLEEP</h3>
    <div class="timer" id="fTime">${fmtT(focus.left)}</div>
    <div class="row"><button class="chip sm hot" data-f="toggle">${focus.running?'Pause':'Start'}</button><button class="chip sm" data-f="reset">Reset</button>
      <button class="chip sm ${focus.mode==='focus'?'on':''}" data-f="focus">Focus 25</button><button class="chip sm ${focus.mode==='break'?'on':''}" data-f="break">Break 5</button></div>
    <h4>SLEEP TIMER</h4><p id="sleepInfo">${sleepEnd?'Music fades out in '+Math.max(1,Math.round((sleepEnd-Date.now())/60000))+' min':'Fade the music out and stop.'}</p>
    <div class="row" style="margin-top:8px">${[0,15,30,60].map(m=>`<button class="chip sm ${(!m&&!sleepEnd)?'on':''}" data-sleep="${m}">${m?m+' min':'Off'}</button>`).join('')}</div>`;
  },
  tasks(){
    return `<h3>TASKS</h3><div class="row" style="flex-wrap:nowrap"><input type="text" id="taskIn" placeholder="Add a task and press Enter" maxlength="80"><button class="chip sm hot" data-task-add="1">Add</button></div>
    <ul class="tasks">${tasks.map((t,i)=>`<li class="${t.d?'done':''}"><input type="checkbox" data-task="${i}" ${t.d?'checked':''}><span>${esc(t.t)}</span><button data-task-del="${i}" aria-label="Delete">×</button></li>`).join('')||'<p style="margin-top:10px">Nothing yet.</p>'}</ul>
    <div class="row" style="margin-top:12px"><button class="chip sm" data-task-clear="1">Clear done</button></div>`;
  },
  notes(){ return `<h3>NOTES</h3><textarea id="noteIn" placeholder="Jot something down. Saved in this browser.">${esc(saved.notes||'')}</textarea><div class="row" style="margin-top:10px"><button class="chip sm" data-note-clear="1">Clear</button></div>`; },
  save(){ return '<div class="ph"><h3>SAVE</h3><span>take it with you</span></div><h4>PICTURE</h4><div class="row"><button class="chip" data-save="frame">Frame · 1920×1080</button><button class="chip" data-save="card">Postcard</button></div>'
    +'<h4>MUSIC</h4><div class="row"><button class="chip" data-act="rec">Record 30 s</button><button class="chip" data-act="midi">MIDI loop</button></div>'
    +'<p style="margin-top:10px">Recording captures what you hear, so start the music first. The MIDI file holds the chords, bass, melody and drums of this track.</p>'; },
  share(){
    const u=encodeURIComponent(location.href), tx=encodeURIComponent('Lofi Leonida: '+SCENES[idx].name+' — endless lofi in a pixel Vice City');
    return `<h3>SHARE</h3><div class="row share"><button class="chip" data-copy="page">Copy page link</button><button class="chip" data-copy="track">Copy link to this track</button>
    <a class="chip" target="_blank" rel="noopener noreferrer" href="https://twitter.com/intent/tweet?text=${tx}&url=${u}">X</a>
    <a class="chip" target="_blank" rel="noopener noreferrer" href="https://t.me/share/url?url=${u}&text=${tx}">Telegram</a>
    <a class="chip" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=${tx}%20${u}">WhatsApp</a>
    <a class="chip" target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/submit?url=${u}&title=${tx}">Reddit</a></div>
    <p style="margin-top:12px">Links open the sites in a new tab. The address shared is whatever this page is hosted at.</p>`;
  },
  settings(){
    return `<h3>SETTINGS</h3><h4>MOTION</h4><div class="row">${[['smooth','Smooth'],['light','Light'],['still','Still']].map(([k,n])=>`<button class="chip sm ${motion===k?'on':''}" data-motion="${k}">${n}</button>`).join('')}</div>
    <h4>PICTURE</h4><div class="row">${[['high','High · 960×540 + light'],['fast','Fast · 960×540'],['classic','Classic · 480×270']].map(([k,n])=>`<button class="chip sm ${fxOpt.q===k?'on':''}" data-q="${k}">${n}</button>`).join('')}</div>
    <div class="row" style="margin-top:8px"><button class="chip sm ${fxOpt.glow?'on':''}" data-fx="glow">Glow</button><button class="chip sm ${fxOpt.grain?'on':''}" data-fx="grain">Film grain</button><button class="chip sm ${fxOpt.lines?'on':''}" data-fx="lines">Retro lines</button></div>
    <h4>DISPLAY</h4><div class="row"><button class="chip sm ${document.body.classList.contains('no-title')?'':'on'}" data-title="1">Place title</button><button class="chip sm ${document.body.classList.contains('hide-react')?'':'on'}" data-reacts="1">Reactions</button></div>
    <h4>JAM</h4><div class="row"><button class="chip sm ${jamOn?'on':''}" data-jam="1">Keys 1–8 play notes (J)</button></div>
    <h4>LISTENING</h4><p>Today: ${fmtH(stats.today)} · All time: ${fmtH(stats.total)}</p>
    <p style="margin-top:14px">Settings are remembered in this browser.</p>`;
  }
};
function showPanel(name){
  if(openPanel===name){ closePanel(); return; }
  openPanel=name; panelsEl.innerHTML='<div class="panel" id="panelBox">'+PANELS[name]()+'</div>'; afterPanel();
  $$('#dock [data-panel]').forEach(b=>b.classList.toggle('open',b.dataset.panel===name));
}
function closePanel(){ openPanel=null; panelsEl.innerHTML=''; $$('#dock [data-panel]').forEach(b=>b.classList.remove('open')); }
function refreshPanel(){ if(!openPanel) return; const box=$('#panelBox'); if(!box) return; if(openPanel==='focus'||openPanel==='tasks'||openPanel==='notes'||openPanel==='people') return; const y=box.scrollTop; box.innerHTML=PANELS[openPanel](); box.scrollTop=y; }
$$('#dock [data-panel]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); showPanel(b.dataset.panel); });
document.addEventListener('pointerdown',e=>{ if(openPanel&&!e.target.closest('#panelBox,#dock')) closePanel(); });

// delegated panel actions
panelsEl.addEventListener('click',e=>{
  const b=e.target.closest('button,li[data-seed]'); if(!b) return; const d=b.dataset;
  if(d.style){ Lofi.setStyle(d.style); store.set({style:d.style,radio:false}); refreshPanel(); }
  else if(d.view){ styleView=d.view; store.set({styleView}); refreshPanel(); }
  else if(d.radio){ Lofi.setRadio(!Lofi.state.radio); if(Lofi.state.radio&&!Lofi.ctx) startMusic(); store.set({radio:Lofi.state.radio}); refreshPanel(); }
  else if(d.energy!=null){ Lofi.setEnergy(+d.energy); store.set({energy:+d.energy}); refreshPanel(); }
  else if(d.band){ Lofi.setBand(d.band); store.set({band:d.band}); refreshPanel(); }
  else if(d.seed){ if(!Lofi.ctx) startMusic(); Lofi.playSeed(+d.seed,d.sstyle); syncPlay(); }
  else if(d.weather){ weatherSel=d.weather; store.set({weather:weatherSel}); needRedraw=true; applyAudio(); refreshPanel(); }
  else if(d.resetSnd){ const m=saved.mix2||{}; delete m[SCENES[idx].id]; saved.mix2=m; store.set({mix2:m}); applyAudio(); refreshPanel(); }
  else if(d.resetMusic){ Lofi.resetMix(); saved.mixer={}; store.set({mixer:{}}); refreshPanel(); }
  else if(d.preset){ const m=Lofi.applyPreset(d.preset); saved.mixer=m; store.set({mixer:m}); refreshPanel(); }
  else if(d.f){ focusAction(d.f); }
  else if(d.sleep!=null){ setSleep(+d.sleep); }
  else if(d.taskAdd){ addTask(); }
  else if(d.taskDel!=null){ tasks.splice(+d.taskDel,1); saveTasks(); rerender('tasks'); }
  else if(d.taskClear){ tasks=tasks.filter(t=>!t.d); saveTasks(); rerender('tasks'); }
  else if(d.noteClear){ saved.notes=''; store.set({notes:''}); rerender('notes'); }
  else if(d.act){ doAct(d.act,b); }
  else if(d.qtab){ qTab=d.qtab; refreshPanel(); }
  else if(d.unfav){ favs=favs.filter(f=>(f.seed+'-'+f.style)!==d.unfav); saved.favs=favs; store.set({favs}); updateFav(); refreshPanel(); }
  else if(d.addPerson){ const p=CAST.add(SCENES[idx].id); if(!p) toast('No room left here'); rerender('people'); }
  else if(d.rm){ CAST.remove(SCENES[idx].id,d.rm); rerender('people'); }
  else if(d.rand){ CAST.randomize(SCENES[idx].id,d.rand); rerender('people'); }
  else if(d.resetCast){ CAST.reset(SCENES[idx].id); rerender('people'); }
  else if(d.clearCast){ CAST.clear(SCENES[idx].id); rerender('people'); }
  else if(d.cSkin){ CAST.update(SCENES[idx].id,d.pid,{skin:d.cSkin}); rerender('people'); }
  else if(d.cHair){ CAST.update(SCENES[idx].id,d.pid,{hair:d.cHair}); rerender('people'); }
  else if(d.cTop){ CAST.update(SCENES[idx].id,d.pid,{top:d.cTop}); rerender('people'); }
  else if(d.cBottom){ CAST.update(SCENES[idx].id,d.pid,{bottom:d.cBottom}); rerender('people'); }
  else if(d.save){ saveImage(d.save); }
  else if(d.copy){ copyLink(b,d.copy); }
  else if(d.motion){ motion=d.motion; store.set({motion}); needRedraw=true; refreshPanel(); }
  else if(d.title){ document.body.classList.toggle('no-title'); store.set({noTitle:document.body.classList.contains('no-title')}); refreshPanel(); }
  else if(d.reacts){ document.body.classList.toggle('hide-react'); store.set({hideReact:document.body.classList.contains('hide-react')}); refreshPanel(); }
  else if(d.jam){ jamOn=!jamOn; refreshPanel(); }
  else if(d.q){ fxOpt.q=d.q; store.set({q:d.q}); needRedraw=true; refreshPanel(); }
  else if(d.fx){ fxOpt[d.fx]=!fxOpt[d.fx]; store.set({[d.fx]:fxOpt[d.fx]}); needRedraw=true; refreshPanel(); }
});
panelsEl.addEventListener('input',e=>{
  const t=e.target;
  if(t.type==='range'){ const mn=+t.min, mx=+t.max; t.style.setProperty('--v',((t.value-mn)/(mx-mn)*100)+'%'); const o=t.nextElementSibling; if(o){ o.textContent=sliderOut(+t.value,t.dataset.fmt); o.classList.toggle('chg',t.value!==t.dataset.def); } }
  if(t.dataset.vol!==undefined){ const v=t.value/100; Lofi.setVolume(v); Lofi.state.vol=v; saved.vol=v; store.set({vol:v}); }
  else if(t.dataset.snd){ const id=t.dataset.snd, mul=t.value/100, sc=SCENES[idx]; const m=saved.mix2||{}; (m[sc.id]=m[sc.id]||{})[id]=mul; saved.mix2=m; store.set({mix2:m}); if(Lofi.ctx) Lofi.setSound(id,sc.sounds[id]*mul); }
  else if(t.classList&&t.classList.contains('pname')){ CAST.update(SCENES[idx].id,t.dataset.pid,{name:t.value}); }
  else if(t.dataset.px!==undefined){ CAST.update(SCENES[idx].id,t.dataset.pid,{x:+t.value}); }
  else if(t.dataset.mix){ Lofi.setMix(t.dataset.mix,t.dataset.mix==='key'?+t.value:t.value/100); saved.mixer=Object.assign({},Lofi.MIX); store.set({mixer:saved.mixer}); }
  else if(t.id==='noteIn'){ saved.notes=t.value; store.set({notes:t.value}); }
});
panelsEl.addEventListener('change',e=>{ const t=e.target;
  if(t.dataset.spot){ CAST.update(SCENES[idx].id,t.dataset.pid,{spot:t.value}); rerender('people'); return; }
  if(t.dataset.hairstyle){ CAST.update(SCENES[idx].id,t.dataset.pid,{hairStyle:t.value}); rerender('people'); return; } if(t.dataset.task!=null){ tasks[+t.dataset.task].d=t.checked; saveTasks(); rerender('tasks'); } });
panelsEl.addEventListener('keydown',e=>{ if(e.target.id==='taskIn'&&e.key==='Enter') addTask(); });
function rerender(n){ if(openPanel===n){ const b=$('#panelBox'); b.innerHTML=PANELS[n](); afterPanel(); } }
function saveTasks(){ saved.tasks=tasks; store.set({tasks}); }
function addTask(){ const i=$('#taskIn'); const v=(i.value||'').trim(); if(!v) return; tasks.push({t:v,d:false}); saveTasks(); rerender('tasks'); const n=$('#taskIn'); if(n) n.focus(); }

/* focus + sleep timers */
function focusAction(a){
  if(a==='toggle'){ focus.running=!focus.running; clearInterval(focus.timer); if(focus.running) focus.timer=setInterval(()=>{ focus.left--; if(focus.left<=0){ focus.running=false; clearInterval(focus.timer); focus.mode=focus.mode==='focus'?'break':'focus'; focus.left=(focus.mode==='focus'?25:5)*60; chime(); } const f=$('#fTime'); if(f) f.textContent=fmtT(focus.left); if(openPanel==='focus') rerender('focus'); },1000); }
  else if(a==='reset'){ focus.running=false; clearInterval(focus.timer); focus.left=(focus.mode==='focus'?25:5)*60; }
  else { focus.mode=a; focus.running=false; clearInterval(focus.timer); focus.left=(a==='focus'?25:5)*60; }
  rerender('focus');
}
function chime(){ if(!Lofi.ctx) return; [0,2,4].forEach((n,i)=>setTimeout(()=>Lofi.jam(n+3),i*180)); document.title='⏰ Time! — Lofi Leonida'; setTimeout(()=>document.title=SCENES[idx].name+' — Lofi Leonida',4000); }
function setSleep(m){ clearInterval(sleepTimer); sleepEnd=m?Date.now()+m*60000:0; if(m) sleepTimer=setInterval(()=>{ if(Date.now()>=sleepEnd){ clearInterval(sleepTimer); sleepEnd=0; fadeOut(); } },2000); rerender('focus'); }
function fadeOut(){ if(!Lofi.ctx) return; const v=Lofi.state.vol; let k=0; const iv=setInterval(()=>{ k++; Lofi.setVolume(Math.max(0,v*(1-k/20))); if(k>=20){ clearInterval(iv); Lofi.pause(); syncPlay(); Lofi.setVolume(v); } },500); }

/* save / share */
function download(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); }
function saveImage(kind){
  const sc=SCENES[idx];
  if(kind==='frame'){ const [c2,x2]=PX.makeCanvas(1920,1080); x2.drawImage(cv,0,0,1920,1080); c2.toBlob(b=>download(b,'lofi-leonida-'+sc.id+'.png'),'image/png'); }
  else { const [c2,x2]=PX.makeCanvas(1200,900); x2.fillStyle='#120c24'; x2.fillRect(0,0,1200,900); x2.fillStyle='#ff4fa0'; x2.fillRect(34,34,1132,640); x2.drawImage(cv,40,40,1120,630);
    const T=Lofi.state.track; const ff="'Press Start 2P','Courier New',monospace";
    x2.fillStyle='#f0e9ff'; x2.font='28px '+ff; x2.fillText(sc.name.toUpperCase(),44,740);
    x2.fillStyle='#ffd0ea'; x2.font='34px "VT323","Courier New",monospace'; x2.fillText(sc.sub,44,790);
    x2.fillStyle='#4ae8ff'; x2.fillText(new Date().toLocaleString([], {weekday:'short',hour:'2-digit',minute:'2-digit'})+(T?'  ·  '+T.name+' · '+T.bpm+' BPM':''),44,840);
    x2.fillStyle='#a093c8'; x2.font='14px '+ff; x2.fillText('LOFI LEONIDA',44,874);
    c2.toBlob(b=>download(b,'lofi-leonida-postcard-'+sc.id+'.png'),'image/png'); }
}
function copyLink(btn,kind){ const url=kind==='track'?trackLink():location.href; const done=()=>{ const o=btn.textContent; btn.textContent='Copied!'; setTimeout(()=>btn.textContent=o,1400); };
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done,fallback); else fallback();
  function fallback(){ const t=document.createElement('textarea'); t.value=url; document.body.appendChild(t); t.select(); try{document.execCommand('copy');}catch(e){} t.remove(); done(); } }

/* ---------- reactions + lanterns ---------- */
const reactBtn=$('#reactBtn'), layer=$('#reactLayer');
reactBtn.onclick=()=>{ reactOn=!reactOn; reactBtn.classList.toggle('toggled',reactOn); reactBtn.textContent=reactOn?'♥ Tap the scene':'♥ Together'; };
$('#screen').addEventListener('click',e=>{
  if(e.target.closest('#bigPlay,#fsBtn')||document.body.classList.contains('hide-react')) return;
  const r=$('#screen').getBoundingClientRect(); spawnReact((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100);
});
function spawnReact(px,py){ ICONS.spawn(layer,px,py); if(Lofi.ctx&&Lofi.state.playing) Lofi.jam(Math.floor(Math.random()*8)); }
function lantern(){ const l=document.createElement('div'); l.className='lantern'; l.style.left=(15+Math.random()*70)+'%'; layer.appendChild(l); setTimeout(()=>l.remove(),16200); if(Lofi.ctx) Lofi.jam(2+Math.floor(Math.random()*4)); }
$('#lanternBtn').onclick=lantern;

/* fullscreen */
function fs(){ const el=$('#screen'); const p=document.fullscreenElement?document.exitFullscreen():(el.requestFullscreen?el.requestFullscreen():null); if(p&&p.catch) p.catch(()=>{}); }
$('#fsBtn').onclick=fs; 

/* ---------- map modal: pan/zoom pixel map, named places, search ---------- */
const mapModal=$('#mapModal'); let mapBuilt=false, gridBuilt=false, curView='map';
const MS={s:1,s0:1,tx:0,ty:0,fitted:false}, KX=LeoMap.W/LeoMap.SRC_W, KY=LeoMap.H/LeoMap.SRC_H;
const drag={moved:0,sx:0,sy:0,pd:0,ptr:null};
const wrapEl=()=>$('#mapWrap');
function mapApply(){ const inner=$('#mapInner'); inner.style.transform='translate('+MS.tx+'px,'+MS.ty+'px) scale('+MS.s+')'; inner.style.setProperty('--inv',(1/MS.s).toFixed(4)); const rel=MS.s/MS.s0; inner.dataset.z=rel<1.7?1:(rel<3.2?2:3); }
function mapFit(){ const r=wrapEl().getBoundingClientRect(); if(!r.width) return; MS.s0=Math.min(r.width/LeoMap.W,r.height/LeoMap.H); MS.s=MS.s0; MS.tx=(r.width-LeoMap.W*MS.s)/2; MS.ty=(r.height-LeoMap.H*MS.s)/2; mapApply(); MS.fitted=true; }
function mapZoom(f,cx,cy){ const ns=Math.max(MS.s0*.9,Math.min(MS.s0*9,MS.s*f)); f=ns/MS.s; MS.tx=cx-(cx-MS.tx)*f; MS.ty=cy-(cy-MS.ty)*f; MS.s=ns; mapApply(); }
function mapFocus(x,y,rel){ const r=wrapEl().getBoundingClientRect(); MS.s=MS.s0*rel; MS.tx=r.width/2-x*KX*MS.s; MS.ty=r.height/2-y*KY*MS.s; mapApply(); }
function showPop(p){
  const pop=$('#mapPop'), sc=SCENES[p.near];
  pop.innerHTML='<button class="x" aria-label="Close">×</button><h4>'+esc(p.name)+'</h4><small>'+esc(p.kindLabel)+' · '+(p.official?'official name':'community map name')+'</small><p>'+esc(p.text)+'</p>'
    +'<div class="row"><button class="chip sm hot" data-go="'+p.near+'">Listen near here: '+esc(sc.name)+'</button><button class="chip sm" data-zoom="1">Zoom here</button></div>';
  pop.hidden=false; pop._p=p;
}
function buildMap(){
  if(mapBuilt) return; mapBuilt=true; LeoMap.render($('#mapCanvas'));
  const pins=$('#pins'), list=$('#mapList'), pl=$('#plabels');
  PLACES.forEach((p,i)=>{ const b=document.createElement('button'); b.className='pl t'+p.tier+(p.official?' off':'')+(p.kind==='water'?' water':''); b.textContent=p.name; b.style.left=(p.x*KX)+'px'; b.style.top=(p.y*KY)+'px'; b.dataset.i=i; pl.appendChild(b); });
  SCENES.forEach((s,i)=>{
    const b=document.createElement('button'); b.className='pin'; b.style.left=(s.mapAt[0]*KX)+'px'; b.style.top=(s.mapAt[1]*KY)+'px'; b.innerHTML=(i+1)+'<span>'+esc(s.name)+'</span>'; b.setAttribute('aria-label',s.name);
    b.onclick=e=>{ e.stopPropagation(); if(drag.moved>5) return; closeMap(); go(i); }; pins.appendChild(b);
    const li=document.createElement('li'); li.innerHTML='<div><b>'+esc(s.name)+'</b><small>'+esc(s.tag)+'</small></div>'; li.onclick=()=>{ closeMap(); go(i); }; list.appendChild(li);
  });
  const w=wrapEl(); drag.ptr=new Map();
  w.addEventListener('pointerdown',e=>{ if(e.target.closest('.mapzoom,.mappop')) return; drag.ptr.set(e.pointerId,[e.clientX,e.clientY]);
    if(drag.ptr.size===1){ drag.moved=0; drag.sx=e.clientX; drag.sy=e.clientY; } else { const [a,b]=[...drag.ptr.values()]; drag.pd=Math.hypot(a[0]-b[0],a[1]-b[1]); drag.moved=99; } w.classList.add('drag'); });
  window.addEventListener('pointermove',e=>{ if(!drag.ptr||!drag.ptr.has(e.pointerId)) return; const prev=drag.ptr.get(e.pointerId); drag.ptr.set(e.pointerId,[e.clientX,e.clientY]); const r=w.getBoundingClientRect();
    if(drag.ptr.size===1){ drag.moved=Math.max(drag.moved,Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)); MS.tx+=e.clientX-prev[0]; MS.ty+=e.clientY-prev[1]; mapApply(); }
    else if(drag.ptr.size===2){ const [a,b]=[...drag.ptr.values()], nd=Math.hypot(a[0]-b[0],a[1]-b[1]); if(drag.pd) mapZoom(nd/drag.pd,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top); drag.pd=nd; } });
  const up=e=>{ if(drag.ptr){ drag.ptr.delete(e.pointerId); if(!drag.ptr.size) w.classList.remove('drag'); drag.pd=0; } };
  window.addEventListener('pointerup',up); window.addEventListener('pointercancel',up);
  w.addEventListener('wheel',e=>{ e.preventDefault(); const r=w.getBoundingClientRect(); mapZoom(Math.exp(-e.deltaY*.0018),e.clientX-r.left,e.clientY-r.top); },{passive:false});
  w.addEventListener('dblclick',e=>{ if(e.target.closest('.pl,.pin,.mapzoom,.mappop')) return; const r=w.getBoundingClientRect(); mapZoom(1.8,e.clientX-r.left,e.clientY-r.top); });
  pl.addEventListener('click',e=>{ const b=e.target.closest('.pl'); if(!b||drag.moved>5) return; showPop(PLACES[+b.dataset.i]); });
  w.addEventListener('click',e=>{ if(drag.moved<=5&&!e.target.closest('.pl,.pin,.mapzoom,.mappop')) $('#mapPop').hidden=true; });
  $('#mapPop').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
    if(b.classList.contains('x')) $('#mapPop').hidden=true; else if(b.dataset.go!=null){ closeMap(); go(+b.dataset.go); } else if(b.dataset.zoom){ const p=$('#mapPop')._p; mapFocus(p.x,p.y,4); } });
  $('#mzIn').onclick=()=>{ const r=w.getBoundingClientRect(); mapZoom(1.5,r.width/2,r.height/2); };
  $('#mzOut').onclick=()=>{ const r=w.getBoundingClientRect(); mapZoom(1/1.5,r.width/2,r.height/2); };
  $('#mzReset').onclick=()=>{ mapFit(); $('#mapPop').hidden=true; };
  window.addEventListener('resize',()=>{ if(mapModal.hidden||curView!=='map') return; if(MS.s/MS.s0<1.08) mapFit(); else { const r=wrapEl().getBoundingClientRect(); const ratio=MS.s/MS.s0; MS.s0=Math.min(r.width/LeoMap.W,r.height/LeoMap.H); MS.s=MS.s0*ratio; mapApply(); } });
}
function markMap(){ $$('#pins .pin').forEach((p,i)=>p.classList.toggle('on',i===idx)); $$('#mapList li').forEach((p,i)=>p.classList.toggle('on',i===idx)); $$('#gridView .gcard').forEach((p,i)=>p.classList.toggle('on',i===idx)); }
function buildGrid(){
  if(gridBuilt) return; gridBuilt=true; const g=$('#gridView');
  SCENES.forEach((s,i)=>{ const d=document.createElement('button'); d.className='gcard'; const c=document.createElement('canvas'); c.width=160; c.height=90; const x=c.getContext('2d'); x.imageSmoothingEnabled=false; x.drawImage(ensure(i),0,0,160,90); d.appendChild(c);
    d.insertAdjacentHTML('beforeend','<b>'+(i+1)+'. '+esc(s.name)+'</b><small>'+esc(s.sub)+'</small>'); d.onclick=()=>{ closeMap(); go(i); }; g.appendChild(d); });
}
function renderPlaces(q){
  const v=$('#placesView'); q=(q||'').trim().toLowerCase();
  const list=PLACES.map((p,i)=>({p,i})).filter(o=>!q||o.p.name.toLowerCase().includes(q)||o.p.kindLabel.toLowerCase().includes(q)).sort((a,b)=>(b.p.official-a.p.official)||(a.p.tier-b.p.tier)||a.p.name.localeCompare(b.p.name));
  v.innerHTML=list.length?list.map(o=>'<button class="pcard'+(o.p.official?' off':'')+'" data-i="'+o.i+'"><b>'+esc(o.p.name)+'</b><small>'+esc(o.p.kindLabel)+(o.p.official?' · official':'')+' · near '+esc(SCENES[o.p.near].name)+'</small></button>').join(''):'<p>No places match.</p>';
}
$('#placesView').addEventListener('click',e=>{ const b=e.target.closest('.pcard'); if(!b) return; const p=PLACES[+b.dataset.i]; setMapView('map'); requestAnimationFrame(()=>{ mapFocus(p.x,p.y,p.tier===1?2.4:4); showPop(p); }); });
function openMap(view){ buildMap(); mapModal.hidden=false; markMap(); setMapView(view||'map'); }
function closeMap(){ mapModal.hidden=true; }
function setMapView(v){ curView=v; $('#mapView').hidden=v!=='map'; $('#placesView').hidden=v!=='places'; $('#gridView').hidden=v!=='grid';
  $('#tabMap').classList.toggle('hot',v==='map'); $('#tabPlaces').classList.toggle('hot',v==='places'); $('#tabGrid').classList.toggle('hot',v==='grid');
  if(v==='grid'){ buildGrid(); markMap(); } if(v==='places') renderPlaces($('#placeSearch').value);
  if(v==='map') requestAnimationFrame(()=>{ if(!MS.fitted) mapFit(); }); }
$('#mapBtn').onclick=()=>openMap('map'); $('#mapX').onclick=closeMap; $('#tabMap').onclick=()=>setMapView('map'); $('#tabGrid').onclick=()=>setMapView('grid'); $('#tabPlaces').onclick=()=>setMapView('places');
$('#placeSearch').addEventListener('input',e=>{ if(curView!=='places') setMapView('places'); else renderPlaces(e.target.value); });
mapModal.addEventListener('pointerdown',e=>{ if(e.target===mapModal) closeMap(); });

/* ---------- info modals ---------- */
const MODALS={
  about:`<h2>ABOUT LOFI LEONIDA</h2><p>An endless, generated lofi radio that lives in a pixel-art version of the State of Leonida: the apartment above Vice City, downtown, the beach, the Keys, the swamp, a motel, a sugar refinery and a mountain campsite.</p>
    <p>Everything here is original: the pixel art is drawn in code and the music is synthesised live in your browser. No samples, no copied tracks.</p>
    <p>It is an unofficial fan project, inspired by the lofi-city-site idea. It is not affiliated with or endorsed by Rockstar Games or Take-Two Interactive.</p>
    <h3>WHAT IS MISSING</h3><p>Features that need a server (shared chat, leaderboards, sign-in, listener counts, a shared radio) are not part of this offline-friendly version.</p>`,
  places:`<h2>THE PLACES</h2>`+'__PLACES__',
  music:`<h2>THE MUSIC</h2><p>Each track is built from a seed: a key, a chord loop, a tempo and a little melody motif. A tiny band plays it live: keys, bass, drums and a lead, with vinyl crackle and tape wobble on top.</p>
    <h3>STYLES</h3><ul><li>Chill, Jazzhop, Neo-soul: warm electric-piano chords, swung drums</li><li>Piano, Sad, Ambient: slow and sparse</li><li>Synthwave: four-on-the-floor and a saw-wave pad, very Vice</li><li>Chiptune: square-wave arpeggios</li></ul>
    <h3>CONTROLS</h3><p>Vibe lets you change style, energy and band. Pick anything from Up next to hear that track right away. Press J to turn the number keys into notes that fit the song.</p>`,
  keys:`<h2>SHORTCUTS</h2><table class="keys">
    <tr><td><span class="kbd">←</span><span class="kbd">→</span></td><td>Previous / next place</td></tr>
    <tr><td><span class="kbd">1–8</span></td><td>Jump to a place (or play notes when Jam is on)</td></tr>
    <tr><td><span class="kbd">Space</span></td><td>Play / pause</td></tr>
    <tr><td><span class="kbd">N</span></td><td>Next track</td></tr>
    <tr><td><span class="kbd">M</span></td><td>Open the map</td></tr>
    <tr><td><span class="kbd">W</span></td><td>Cycle weather</td></tr>
    <tr><td><span class="kbd">L</span></td><td>Release a lantern</td></tr>
    <tr><td><span class="kbd">J</span></td><td>Jam mode on / off</td></tr>
    <tr><td><span class="kbd">F</span></td><td>Fullscreen (or double-click the scene)</td></tr>
    <tr><td><span class="kbd">O</span></td><td>Radio on / off</td></tr>
    <tr><td><span class="kbd">↑</span><span class="kbd">↓</span></td><td>Volume</td></tr>
    <tr><td><span class="kbd">?</span></td><td>This list</td></tr></table>`,
  faq:`<h2>FAQ</h2><h3>NO SOUND?</h3><p>Browsers only start audio after a click. Press Play, then check your volume and the Sounds mixer.</p>
    <h3>DOES IT WORK OFFLINE?</h3><p>Yes, once the page is open. Only the pixel fonts come from the web and fall back to system fonts if offline.</p>
    <h3>CAN I USE IT ON STREAM OR AS A BACKGROUND?</h3><p>Open it fullscreen (F). The scene and music loop forever. Credit is appreciated.</p>
    <h3>WHY DOES THE MAP LOOK DIFFERENT FROM THE GAME?</h3><p>It is a stylized pixel rendition for choosing places. Rockstar has not published an official map, so positions are approximate.</p>
    <h3>MY CPU FAN IS LOUD</h3><p>Open Settings and switch Motion to Light or Still.</p>`
};
function openModal(k){
  let html=MODALS[k]||'';
  if(k==='places') html=html.replace('__PLACES__',SCENES.map((s,i)=>`<h3>${i+1}. ${esc(s.name.toUpperCase())}</h3><p>${esc(s.sub)} · ${esc(s.tag)}</p>`).join(''));
  $('#modalBody').innerHTML=html; $('#modal').hidden=false;
}
function closeModal(){ $('#modal').hidden=true; }
$$('[data-modal]').forEach(b=>b.onclick=()=>openModal(b.dataset.modal));
$('#modalX').onclick=closeModal; $('#modal').addEventListener('pointerdown',e=>{ if(e.target.id==='modal') closeModal(); });

/* ---------- keyboard ---------- */
document.addEventListener('keydown',e=>{
  if((e.target.closest&&e.target.closest('input,textarea,select'))||e.metaKey||e.ctrlKey||e.altKey) return;
  const k=e.key;
  if(k==='Escape'){ closeModal(); closeMap(); closePanel(); return; }
  if(!$('#modal').hidden||!mapModal.hidden) return;
  if(k==='ArrowLeft') go(idx-1); else if(k==='ArrowRight') go(idx+1);
  else if(k==='ArrowUp'||k==='ArrowDown'){ e.preventDefault(); const v=Math.max(0,Math.min(1,(Lofi.state.vol||0)+(k==='ArrowUp'?.05:-.05))); Lofi.setVolume(v); Lofi.state.vol=v; saved.vol=v; store.set({vol:v}); toast('Volume '+Math.round(v*100)+'%'); }
  else if(/^[1-8]$/.test(k)){ if(jamOn) Lofi.jam(+k-1); else go(+k-1); }
  else if(k===' '){ e.preventDefault(); togglePlay(); }
  else if(k==='n'||k==='N'){ $('#nextBtn').click(); }
  else if(k==='m'||k==='M') openMap('map');
  else if(k==='w'||k==='W'){ const i=WEATHER.findIndex(w=>w[0]===weatherSel); weatherSel=WEATHER[(i+1)%WEATHER.length][0]; store.set({weather:weatherSel}); needRedraw=true; applyAudio(); refreshPanel(); }
  else if(k==='l'||k==='L') lantern();
  else if(k==='t'||k==='T') $('#timeBtn').click();
  else if(k==='j'||k==='J'){ jamOn=!jamOn; refreshPanel(); }
  else if(k==='o'||k==='O'){ Lofi.setRadio(!Lofi.state.radio); if(Lofi.state.radio&&!Lofi.ctx) startMusic(); store.set({radio:Lofi.state.radio}); refreshPanel(); }
  else if(k==='f'||k==='F') fs();
  else if(k==='?') openModal('keys');
});

/* ---------- release countdown ---------- */
{ const REL=Date.UTC(2026,10,19,5,0,0), el=$('#gtaCount'); const tick=()=>{ const d=REL-Date.now(); if(d<=0){ el.textContent='GTA VI · out now'; return; } const D=Math.floor(d/864e5), H=Math.floor(d%864e5/36e5), M=Math.floor(d%36e5/6e4); el.textContent='GTA VI in '+D+'d '+String(H).padStart(2,'0')+'h '+String(M).padStart(2,'0')+'m'; }; tick(); setInterval(tick,30000); }
/* ---------- boot ---------- */
if(saved.noTitle) document.body.classList.add('no-title'); if(saved.hideReact) document.body.classList.add('hide-react');
let start=SCENES.findIndex(s=>s.id===location.hash.slice(1)); if(start<0) start=Math.max(0,SCENES.findIndex(s=>s.id===saved.scene));
setTour(tourI); go(start,true); syncPlay(); updateFav(); requestAnimationFrame(loop);
{ const q=new URLSearchParams(location.search).get('t'); const m=q&&/^(\d+)-([a-z]+)$/.exec(q); if(m&&Lofi.loadTrack(+m[1],m[2])) setTimeout(()=>toast('Shared track loaded · press play'),700); }
window.__lofi={go,SCENES,Lofi};
// immersive layout: keep the floating bars measured, fade the UI out when the mouse rests
{ const dk=document.getElementById('dock'), root=document.documentElement;
  const fit=()=>root.style.setProperty('--dockH',(dk.offsetHeight+16)+'px'); fit(); addEventListener('resize',fit); setTimeout(fit,300);
  let idle=0; const wake=()=>{ document.body.classList.remove('ui-hide'); clearTimeout(idle); idle=setTimeout(()=>{ if(document.body.classList.contains('playing')&&!document.querySelector('#panels .panel')&&document.getElementById('modal').hidden&&document.getElementById('mapModal').hidden) document.body.classList.add('ui-hide'); },6000); };
  ['mousemove','pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,wake,{passive:true})); wake(); }
})();
