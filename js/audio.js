// Generative music engine + ambience mixer, all synthesised live with Web Audio. No samples, no copyrighted music.
window.Lofi = (function(){
  let ctx=null, master, comp, musicBus, wobble, lp, revIn, ambBus, crackleGain, analyser, anBuf, echoIn, echoDelay;
  let keysBus, bassBus, drumBus, melBus, wobL1, wobL2, duckK, duckB, satWet, satDry, gritGain, hissGain, recDest;
  const S = { playing:false, style:'jazzhop', energy:1, band:'full', vol:.8, vinyl:true, track:null, weather:'clear', radio:false, queue:null, lpBase:3200, history:[] };
  const DEV_MUTE = /[?&]mute\b/.test(location.search); // open the page with ?mute to silence everything while developing
  const listeners = {};
  const emit=(e,d)=>(listeners[e]||[]).forEach(f=>f(d));
  const on=(e,f)=>{ (listeners[e]=listeners[e]||[]).push(f); };

  /* ---------- mixer (all values 0..1, instruments up to 1.5) ---------- */
  const MIX_DEFAULT={ keys:1, bass:1, drums:1, melody:1, vinyl:0, reverb:.5, bright:.5, wobble:.5, tempo:.5, tape:.35, grit:0, swing:.5, human:.5, pump:.3, key:0 };
  const MIX=Object.assign({},MIX_DEFAULT);
  const PRESETS={
    'Tape':      { bright:.35, wobble:.8, vinyl:.13, reverb:.5, tape:.6 },
    'Clean':     { bright:.8,  wobble:.1, vinyl:0,   reverb:.3, tape:.1, human:.25 },
    'Dusty':     { bright:.25, wobble:.9, vinyl:.18, reverb:.6, tape:.55, grit:.3 },
    'Boom bap':  { swing:.72, human:.75, drums:1.25, bright:.4, pump:.45, tape:.5 },
    'Late night':{ drums:.55, melody:.6, bright:.4, reverb:.7, tempo:.35, pump:.2 }
  };
  function applyMix(){
    if(!ctx) return; const t=ctx.currentTime;
    keysBus.gain.setTargetAtTime(MIX.keys,t,.05); bassBus.gain.setTargetAtTime(MIX.bass,t,.05);
    drumBus.gain.setTargetAtTime(MIX.drums,t,.05); melBus.gain.setTargetAtTime(MIX.melody,t,.05);
    revIn.gain.setTargetAtTime(MIX.reverb,t,.05);
    wobL1.gain.setTargetAtTime(.0032*MIX.wobble,t,.1); wobL2.gain.setTargetAtTime(.0006*MIX.wobble,t,.1);
    lp.frequency.setTargetAtTime(Math.min(16000,Math.max(500,S.lpBase*Math.pow(2,(MIX.bright-.5)*3))),t,.1);
    // record crackle/hiss only while music actually plays: silence when paused
    const vin=S.vinyl&&S.playing?MIX.vinyl:0; crackleGain.gain.setTargetAtTime(vin,t,.1);
    hissGain.gain.setTargetAtTime(vin*.045,t,.1);
    if(ambBus) ambBus.gain.setTargetAtTime(S.playing?.9:0,t,.3);   // scene ambience (rain, waves, traffic) also rests while paused
    satWet.gain.setTargetAtTime(MIX.tape*.75,t,.1); satDry.gain.setTargetAtTime(1-MIX.tape*.35,t,.1);
    gritGain.gain.setTargetAtTime(MIX.grit*.45,t,.1);
  }
  function setMix(id,v){ if(id in MIX){ MIX[id]=v; applyMix(); } }
  function loadMix(o){ for(const k in o) if(k in MIX&&k!=='vinyl'&&typeof o[k]==='number') MIX[k]=o[k]; applyMix(); }   // vinyl noise always starts off
  function resetMix(){ Object.assign(MIX,MIX_DEFAULT); applyMix(); }
  function applyPreset(name){ resetMix(); Object.assign(MIX,PRESETS[name]||{}); applyMix(); return Object.assign({},MIX); }

  /* ---------- music theory ---------- */
  const CH={ maj7:[0,4,7,11], m7:[0,3,7,10], dom7:[0,4,7,10], m9:[0,3,7,10,14], maj9:[0,4,7,11,14], m6:[0,3,7,9], sus:[0,5,7,10],
             maj:[0,4,7], min:[0,3,7], dim:[0,3,6], sus2:[0,2,7], pwr:[0,7,12] };
  const PROG_MAJ=[
    [[2,'m7'],[7,'dom7'],[0,'maj7'],[9,'m7']], [[0,'maj7'],[9,'m7'],[2,'m7'],[7,'dom7']],
    [[5,'maj7'],[4,'m7'],[2,'m7'],[0,'maj9']], [[0,'maj9'],[5,'maj7'],[4,'m7'],[9,'m7']]
  ];
  const PROG_MIN=[
    [[0,'m9'],[8,'maj7'],[3,'maj7'],[10,'dom7']], [[0,'m7'],[5,'m7'],[10,'dom7'],[3,'maj7']], [[0,'m7'],[8,'maj7'],[5,'m7'],[7,'dom7']]
  ];
  const PROGS={
    bossa:[[[2,'m7'],[7,'dom7'],[0,'maj7'],[9,'m7']],[[0,'maj7'],[2,'m7'],[7,'dom7'],[0,'maj9']]],
    house:[[[0,'m7'],[8,'maj7'],[3,'maj7'],[10,'dom7']],[[0,'m9'],[0,'m9'],[5,'m7'],[7,'m7']]],
    dnb:[[[0,'m9'],[8,'maj9'],[3,'maj7'],[10,'dom7']],[[0,'m7'],[5,'m7'],[8,'maj7'],[7,'dom7']]],
    dub:[[[0,'m7'],[0,'m7'],[5,'m7'],[7,'m7']]],
    medieval:[[[0,'min'],[10,'maj'],[7,'min'],[0,'min']],[[0,'min'],[5,'maj'],[10,'maj'],[0,'min']]],
    japanese:[[[0,'sus2'],[5,'sus2'],[7,'sus2'],[3,'sus2']],[[0,'sus2'],[3,'sus2'],[5,'sus2'],[0,'sus2']]],
    oud:[[[0,'pwr'],[1,'pwr'],[0,'pwr'],[7,'pwr']],[[0,'pwr'],[10,'pwr'],[1,'pwr'],[0,'pwr']]],
    sitar:[[[0,'pwr'],[0,'pwr'],[0,'pwr'],[0,'pwr']],[[0,'pwr'],[0,'pwr'],[7,'pwr'],[0,'pwr']]],
    spooky:[[[0,'min'],[6,'dim'],[0,'min'],[1,'maj']],[[0,'min'],[8,'maj'],[6,'dim'],[7,'maj']]],
    classical:[[[0,'maj'],[7,'maj'],[9,'min'],[4,'min']],[[5,'maj'],[0,'maj'],[5,'maj'],[7,'dom7']]]
  };
  const PENT_MAJ=[0,2,4,7,9], PENT_MIN=[0,3,5,7,10];
  const SC={ dorian:[0,2,3,5,7,9,10], hirajoshi:[0,2,3,7,8], hijaz:[0,1,4,5,7,8,10], bhairav:[0,1,4,5,7,8,11], spooky:[0,2,3,6,7,8,11], major:[0,2,4,5,7,9,11] };

  // timbre = chord instrument, mel = lead instrument, comp = chord rhythm, arp = arpeggio mode
  const STYLES={
    jazzhop: { name:'Jazzhop',  icon:'💿', group:'Chill',  bpm:[82,90],  timbre:'ep',     mel:'tri',    comp:'jazzhop', drums:'boom',  swing:.30, melody:.45, bass:'root', bassHit:7, minor:.3, desc:'dusty drums, jazzy electric-piano chords and a lazy swing' },
    piano:   { name:'Piano',    icon:'🎹', group:'Chill',  bpm:[64,72],  timbre:'piano',  mel:'tri',    arp:'8',          drums:'soft',  swing:.08, melody:.50, bass:'root', minor:.4,  desc:'a sleepy felt piano, simple warm chords, soft drums' },
    ambient: { name:'Ambient',  icon:'🌙', group:'Chill',  bpm:[56,64],  timbre:'pad',    mel:'bell',   comp:'pad',     drums:'none',  swing:0,   melody:.12, bass:'long', minor:.5,  drone:true, desc:'slow evolving pads, no drums, space to think' },
    guitar:  { name:'Guitar',   icon:'🎸', group:'Chill',  bpm:[70,80],  timbre:'pluck',  mel:'pluck',  arp:'8',          drums:'soft',  swing:.12, melody:.30, bass:'root', minor:.35, desc:'a warm nylon-string guitar picking quiet patterns' },
    sad:     { name:'Sad',      icon:'🌧', group:'Chill',  bpm:[60,68],  timbre:'tri',    mel:'tri',    comp:'chill',   drums:'soft',  swing:.10, melody:.32, bass:'root', minor:1,   desc:'slow minor chords and a lonely little melody' },
    neosoul: { name:'Neo-soul', icon:'🎤', group:'Chill',  bpm:[78,86],  timbre:'ep',     mel:'tri',    comp:'neo',     drums:'neo',   swing:.24, melody:.34, bass:'root', minor:.25, desc:'rich chords, loose drums, a smooth late-night groove' },
    bossa:   { name:'Bossa',    icon:'🌴', group:'Groove', bpm:[88,98],  timbre:'pluck',  mel:'pluck',  comp:'bossa',   drums:'bossa', swing:.05, melody:.35, bass:'walk', minor:.2, prog:'bossa', desc:'soft nylon guitar, rim clicks and a gentle sway' },
    synth:   { name:'Synth',    icon:'👾', group:'Groove', bpm:[96,106], timbre:'saw',    mel:'saw',    comp:'pad',     drums:'four',  swing:0,   melody:.40, bass:'arp', bassWave:'saw', minor:.6, extraArp:true, pumpMul:1.6, desc:'neon pads, four-on-the-floor and a driving bass' },
    house:   { name:'House',    icon:'🪩', group:'Groove', bpm:[120,124],timbre:'tri',    mel:'saw',    comp:'house',   drums:'house', swing:0,   melody:.30, bass:'house', minor:.7, prog:'house', pumpMul:1.7, desc:'a steady kick, offbeat stabs and a rolling bassline' },
    dnb:     { name:'Liquid DnB',icon:'⚡',group:'Groove', bpm:[168,174],timbre:'pad',    mel:'bell',   comp:'pad',     drums:'dnb',   swing:0,   melody:.50, bass:'long', bassWave:'saw', minor:.6, prog:'dnb', pumpMul:1.4, desc:'fast breakbeats under smooth, floating pads' },
    dub:     { name:'Dub',      icon:'🔊', group:'Groove', bpm:[68,74],  timbre:'ep',     mel:'tri',    comp:'dub',     drums:'dub',   swing:0,   melody:.20, bass:'dub', minor:.8, prog:'dub', echo:.5, desc:'deep sub bass, offbeat skanks and long echoes' },
    chiptune:{ name:'Chiptune', icon:'🎮', group:'Groove', bpm:[112,124],timbre:'square', mel:'square', arp:'16',         drums:'noise', swing:0,   melody:.70, bass:'arp', minor:.4,  desc:'bleeps, bloops and 8-bit arpeggios' },
    medieval:{ name:'Medieval', icon:'🏰', group:'Themed', bpm:[86,96],  timbre:'pluck',  mel:'pluck',  arp:'8',          drums:'frame', swing:.04, melody:.50, bass:'off', scale:'dorian', modeName:'dorian', prog:'medieval', drone:true, desc:'a plucked lute over a low drone and a hand drum' },
    japanese:{ name:'Japanese', icon:'⛩', group:'Themed', bpm:[60,70],  timbre:'koto',   mel:'koto',   comp:'sparse',  drums:'taiko', swing:0,   melody:.60, bass:'off', scale:'hirajoshi', modeName:'hirajoshi', prog:'japanese', desc:'a koto and a distant drum, wide open space' },
    oud:     { name:'Oud',      icon:'🪔', group:'Themed', bpm:[90,100], timbre:'oud',    mel:'oud',    arp:'8',          drums:'frame', swing:.04, melody:.60, bass:'off', scale:'hijaz', modeName:'hijaz', prog:'oud', drone:true, desc:'a plucked oud in a winding scale over a frame drum' },
    sitar:   { name:'Sitar',    icon:'🪕', group:'Themed', bpm:[70,80],  timbre:'sitar',  mel:'sitar',  comp:'sparse',  drums:'frame', swing:0,   melody:.60, bass:'off', scale:'bhairav', modeName:'bhairav', prog:'sitar', drone:true, desc:'a buzzing sitar over a steady drone' },
    spooky:  { name:'Spooky',   icon:'🎃', group:'Themed', bpm:[60,70],  timbre:'bell',   mel:'bell',   comp:'sparse',  drums:'none',  swing:0,   melody:.45, bass:'long', scale:'spooky', modeName:'dark', prog:'spooky', drone:true, desc:'a music box, a low drone and things that go bump' },
    classical:{name:'Classical',icon:'🎻', group:'Themed', bpm:[66,76],  timbre:'piano',  mel:'tri',    arp:'8',          drums:'none',  swing:0,   melody:.50, bass:'long', scale:'major', modeName:'major', prog:'classical', extraPad:true, desc:'warm strings under a gently flowing piano' }
  };
  const STYLE_IDS=Object.keys(STYLES);
  const GROUPS=['Chill','Groove','Themed'].map(g=>[g,STYLE_IDS.filter(id=>STYLES[id].group===g)]);
  const COMP={ chill:[0,10], jazzhop:[0,6,10], neo:[0,3,8,11], bossa:[0,3,6,10,12], house:[2,6,10,14], dub:[4,12], sparse:[0,6,12], long:[0] };
  const A1=['paper','dim','nostalgic','silver','velvet','quiet','golden','midnight','salt','pastel','slow','hazy','neon','tidal','amber','lazy'];
  const A2=['moons','night shift','letters','east river','umbrellas','balconies','postcards','sunsets','ferries','receipts','tapes','lanterns','mixtapes','sirens','palms','windows'];
  const A3=['ocean beach','vice city','port gellhorn','the keys','grassrivers','ambrosia','little cube','mount kalaga','downtown','sunset key','vice beach','lake leonida'];
  const KEYN=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const mulberry=(a)=>()=>{ a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296; };
  const f2m=m=>440*Math.pow(2,(m-69)/12);
  const pickProg=(st,minor,r)=>{ const arr=st.prog?PROGS[st.prog]:(minor?PROG_MIN:PROG_MAJ); return arr[Math.floor(r()*arr.length)]; };

  function makeTrack(seed, style){
    if(!STYLES[style]) style='jazzhop';
    const r=mulberry(seed*7919+13), st=STYLES[style];
    const minor=!st.scale&&r()<st.minor;
    const prog=pickProg(st,minor,r);
    const keyRoot=[0,2,3,5,7,8,10][Math.floor(r()*7)];
    const bpm=Math.round(st.bpm[0]+r()*(st.bpm[1]-st.bpm[0]));
    const scale=st.scale?SC[st.scale]:(minor?PENT_MIN:PENT_MAJ);
    const motif=[]; for(let i=0;i<16;i++) motif.push(r()<.45?scale[Math.floor(r()*scale.length)]+(r()<.3?12:0):null);
    const name=A1[Math.floor(r()*A1.length)]+' '+A2[Math.floor(r()*A2.length)]+(r()<.7?' in '+A3[Math.floor(r()*A3.length)]:'');
    const loops=Math.max(2,Math.round((150+r()*60)*bpm/960));
    return { seed, style, minor, prog, keyRoot, bpm, motif, scale, name, loops, dur:Math.round(loops*960/bpm), mode:st.modeName||(minor?'minor':'major') };
  }
  const keyLabel=T=>KEYN[T.keyRoot]+' '+T.mode;

  /* ---------- radio: everyone gets the same song for the same 3-minute slot ---------- */
  const SLOT=180000, slotOf=ms=>Math.floor(ms/SLOT), hourStyle=ms=>STYLE_IDS[Math.floor(ms/3600000)%STYLE_IDS.length];
  function radioTrack(ms){ const slot=slotOf(ms), T=makeTrack(slot*131+7,hourStyle(ms)); T.loops=Math.ceil(SLOT/1000/(960/T.bpm))+1; T.dur=Math.round(SLOT/1000); T.radioSlot=slot; return T; }
  const radioLabel=()=>STYLES[hourStyle(Date.now())].name+' hour';

  /* ---------- audio graph ---------- */
  function init(){
    if(ctx) return;
    const AC=window.AudioContext||window.webkitAudioContext; ctx=new AC();
    master=ctx.createGain(); master.gain.value=DEV_MUTE?0:S.vol;
    comp=ctx.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=3; comp.attack.value=.01; comp.release.value=.25;
    const hp=ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=32; master.connect(hp); hp.connect(comp); comp.connect(ctx.destination);
    recDest=ctx.createMediaStreamDestination(); comp.connect(recDest);
    analyser=ctx.createAnalyser(); analyser.fftSize=512; comp.connect(analyser); anBuf=new Uint8Array(analyser.fftSize);
    musicBus=ctx.createGain(); musicBus.gain.value=.7;
    keysBus=ctx.createGain(); bassBus=ctx.createGain(); drumBus=ctx.createGain(); melBus=ctx.createGain();
    duckK=ctx.createGain(); duckB=ctx.createGain(); keysBus.connect(duckK); duckK.connect(musicBus); bassBus.connect(duckB); duckB.connect(musicBus); drumBus.connect(musicBus); melBus.connect(musicBus);
    // ensemble chorus on the keys: two slowly modulated delays panned left and right
    const mkCh=(delay,rate,pan)=>{ const d=ctx.createDelay(.05); d.delayTime.value=delay; const l=ctx.createOscillator(); l.frequency.value=rate; const lg=ctx.createGain(); lg.gain.value=.0022; l.connect(lg); lg.connect(d.delayTime); l.start();
      const g=ctx.createGain(); g.gain.value=.3; keysBus.connect(d); d.connect(g); let o=g; if(ctx.createStereoPanner){ const p=ctx.createStereoPanner(); p.pan.value=pan; g.connect(p); o=p; } o.connect(duckK); };
    mkCh(.016,.7,-.6); mkCh(.024,.55,.6);
    wobble=ctx.createDelay(.05); wobble.delayTime.value=.012;
    const lfo=ctx.createOscillator(); lfo.frequency.value=.45; wobL1=ctx.createGain(); wobL1.gain.value=.0016; lfo.connect(wobL1); wobL1.connect(wobble.delayTime); lfo.start();
    const lfo2=ctx.createOscillator(); lfo2.frequency.value=5.2; wobL2=ctx.createGain(); wobL2.gain.value=.0003; lfo2.connect(wobL2); wobL2.connect(wobble.delayTime); lfo2.start();
    lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3400; lp.Q.value=.5;
    musicBus.connect(wobble); wobble.connect(lp);
    // tape saturation (soft clip), subtle bit-crush grit, slow filter breathing
    const mixOut=ctx.createGain(); mixOut.connect(master);
    satDry=ctx.createGain(); lp.connect(satDry); satDry.connect(mixOut);
    const NN=1024, sc=new Float32Array(NN), qc=new Float32Array(NN); for(let i=0;i<NN;i++){ const x=i/(NN-1)*2-1; sc[i]=Math.tanh(x*3)/Math.tanh(3); qc[i]=Math.round(x*40)/40; }
    const shaper=ctx.createWaveShaper(); shaper.curve=sc; shaper.oversample='2x'; satWet=ctx.createGain(); satWet.gain.value=0; lp.connect(shaper); shaper.connect(satWet); satWet.connect(mixOut);
    const crush=ctx.createWaveShaper(); crush.curve=qc; gritGain=ctx.createGain(); gritGain.gain.value=0; lp.connect(crush); crush.connect(gritGain); gritGain.connect(mixOut);
    const lfoF=ctx.createOscillator(); lfoF.frequency.value=.05; const lfoFG=ctx.createGain(); lfoFG.gain.value=220; lfoF.connect(lfoFG); lfoFG.connect(lp.frequency); lfoF.start();
    // reverb
    const conv=ctx.createConvolver(), len=ctx.sampleRate*2.2, ir=ctx.createBuffer(2,len,ctx.sampleRate);
    for(let ch=0;ch<2;ch++){ const d=ir.getChannelData(ch); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6); }
    conv.buffer=ir; revIn=ctx.createGain(); revIn.gain.value=.5; const rg=ctx.createGain(); rg.gain.value=.28; revIn.connect(conv); conv.connect(rg); rg.connect(master);
    // tempo-synced echo (dub)
    echoIn=ctx.createGain(); echoDelay=ctx.createDelay(2); echoDelay.delayTime.value=.5; const fb=ctx.createGain(); fb.gain.value=.45; const ef=ctx.createBiquadFilter(); ef.type='lowpass'; ef.frequency.value=1800;
    echoIn.connect(echoDelay); echoDelay.connect(ef); ef.connect(fb); fb.connect(echoDelay); const eo=ctx.createGain(); eo.gain.value=.7; ef.connect(eo); eo.connect(master);
    // noise
    noiseW=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate); { const d=noiseW.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
    noiseB=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate); { const d=noiseB.getChannelData(0); let l=0; for(let i=0;i<d.length;i++){ l=(l+.02*(Math.random()*2-1))/1.02; d[i]=l*3.5; } }
    crackleBuf=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate); { const d=crackleBuf.getChannelData(0); for(let i=0;i<d.length;i++){ d[i]=(Math.random()*2-1)*.012; if(Math.random()<.0007) d[i]=(Math.random()*2-1)*(.3+Math.random()*.5); } }
    const cs=ctx.createBufferSource(); cs.buffer=crackleBuf; cs.loop=true; const chp=ctx.createBiquadFilter(); chp.type='highpass'; chp.frequency.value=900;
    crackleGain=ctx.createGain(); crackleGain.gain.value=0; cs.connect(chp); chp.connect(crackleGain); crackleGain.connect(master); cs.start();
    const hs=ctx.createBufferSource(); hs.buffer=noiseW; hs.loop=true; const hb=ctx.createBiquadFilter(); hb.type='bandpass'; hb.frequency.value=5200; hb.Q.value=.4;
    hissGain=ctx.createGain(); hissGain.gain.value=0; hs.connect(hb); hb.connect(hissGain); hissGain.connect(master); hs.start();
    ambBus=ctx.createGain(); ambBus.gain.value=.9; ambBus.connect(master);
    buildAmbience(); applyMix();
    setInterval(tickEvents,350);
  }
  let noiseW, noiseB, crackleBuf, echoAmt=0;

  /* ---------- instruments ---------- */
  function out(node,send,bus,echo){ node.connect(bus||musicBus); if(send){ const g=ctx.createGain(); g.gain.value=send; node.connect(g); g.connect(revIn); } if(echo){ const e=ctx.createGain(); e.gain.value=echo; node.connect(e); e.connect(echoIn); } }
  function adsr(g,t,peak,a,dur,tail){ g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+a); g.gain.exponentialRampToValueAtTime(.0002,t+a+dur+tail); }

  function keyNote(t,m,dur,vel,timbre,bus,send){
    const f=f2m(m), g=ctx.createGain(), flt=ctx.createBiquadFilter(); flt.type='lowpass'; flt.Q.value=.4;
    const oscs=[]; let tail=.5, a=.006, cut=Math.min(5000,f*3.5), peak=.11*vel, snd=send!=null?send:.35, sweep=false;
    const osc=(type,det,mul)=>{ const o=ctx.createOscillator(); o.type=type; o.frequency.value=f*(mul||1); o.detune.value=det||0; oscs.push(o); return o; };
    const partial=(type,mul,amp,dec)=>{ const o=ctx.createOscillator(); o.type=type; o.frequency.value=f*mul; const pg=ctx.createGain(); pg.gain.setValueAtTime(amp,t); pg.gain.exponentialRampToValueAtTime(.001,t+dec); o.connect(pg); pg.connect(flt); o.start(t); o.stop(t+dec+.2); };
    const dip=(o,cents,time)=>{ o.detune.setValueAtTime(cents,t); o.detune.linearRampToValueAtTime(0,t+time); };
    switch(timbre){
      case 'tri': osc('triangle',-7); osc('triangle',7); tail=.9; break;
      case 'ep': osc('sine'); osc('triangle',5); partial('sine',2,.45,.35); tail=1.1; cut=3200; break;
      case 'piano': osc('triangle'); partial('sine',2,.3,.5); tail=1.4; a=.004; cut=3600; break;
      case 'saw': osc('sawtooth',-9); osc('sawtooth',0); osc('sawtooth',9); tail=.4; peak=.05*vel; sweep=true; flt.frequency.setValueAtTime(900,t); flt.frequency.exponentialRampToValueAtTime(2400,t+.08); flt.frequency.exponentialRampToValueAtTime(900,t+dur+.2); break;
      case 'square': osc('square'); tail=.12; peak=.035*vel; cut=6000; a=.002; break;
      case 'pad': osc('sawtooth',-12); osc('sawtooth',-4); osc('sawtooth',4); osc('sawtooth',12); a=1.2; tail=1.8; cut=800; peak=.04*vel; break;
      case 'drone': osc('sawtooth',-8); osc('sawtooth',0); osc('sawtooth',8); a=.9; tail=1.6; cut=420; peak=.035*vel; snd=.6; break;
      case 'strings': osc('sawtooth',-11); osc('sawtooth',-4); osc('sawtooth',5); osc('sawtooth',12); a=.22; tail=1.1; cut=2000; peak=.04*vel; snd=.7; break;
      case 'pluck': osc('triangle'); partial('sine',2,.25,.3); a=.003; tail=.55; peak=.12*vel; sweep=true; flt.frequency.setValueAtTime(Math.min(5200,f*7),t); flt.frequency.exponentialRampToValueAtTime(Math.max(300,f*1.6),t+.35); break;
      case 'koto': osc('sine'); partial('sine',3,.5,.12); partial('sine',2,.25,.4); a=.002; tail=1; cut=6500; peak=.13*vel; dip(oscs[0],45,.06); break;
      case 'oud': { const o=osc('triangle',-6); osc('triangle',6); osc('sawtooth',0).detune.value=3; a=.003; tail=.7; peak=.1*vel; sweep=true; flt.Q.value=2.5; flt.frequency.setValueAtTime(Math.min(5000,f*8),t); flt.frequency.exponentialRampToValueAtTime(Math.max(300,f*1.8),t+.4); dip(o,-60,.05); break; }
      case 'sitar': { const o=osc('sawtooth'); osc('square',7); a=.004; tail=1.1; peak=.05*vel; sweep=true; flt.Q.value=5; flt.frequency.setValueAtTime(Math.min(6000,f*10),t); flt.frequency.exponentialRampToValueAtTime(Math.max(400,f*2.2),t+.5); dip(o,-90,.05); break; }
      case 'bell': osc('sine'); partial('sine',2.76,.5,.9); partial('sine',5.4,.2,.4); a=.002; tail=1.4; cut=7000; peak=.1*vel; break;
      default: osc('triangle');
    }
    if(!sweep) flt.frequency.value=cut;
    oscs.forEach(o=>{ o.connect(flt); o.start(t); o.stop(t+a+dur+tail+.1); });
    flt.connect(g); out(g,snd,bus||keysBus,echoAmt); adsr(g,t,peak,a,Math.max(.1,dur),tail);
  }
  function bassNote(t,m,dur,vel,type){
    const f=f2m(m), o=ctx.createOscillator(), o2=ctx.createOscillator(), g=ctx.createGain(), flt=ctx.createBiquadFilter();
    o.type=type==='saw'?'sawtooth':'sine'; o.frequency.value=f; o2.type='triangle'; o2.frequency.value=f*2; const g2=ctx.createGain(); g2.gain.value=.18;
    flt.type='lowpass'; flt.frequency.value=type==='saw'?600:320;
    o.connect(flt); o2.connect(g2); g2.connect(flt); flt.connect(g); out(g,0,bassBus); adsr(g,t,.2*vel,.01,dur,.12);
    o.start(t); o2.start(t); o.stop(t+dur+.4); o2.stop(t+dur+.4);
  }
  const LEAD_KEYS=['bell','koto','pluck','oud','sitar','piano','strings'];
  function melNote(t,m,vel,timbre){
    if(LEAD_KEYS.includes(timbre)) return keyNote(t,m,.3,vel*.85,timbre,melBus,.55);
    const f=f2m(m), o=ctx.createOscillator(), g=ctx.createGain(); o.type=timbre==='square'?'square':(timbre==='saw'?'sawtooth':'triangle'); o.frequency.value=f;
    const flt=ctx.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=timbre==='saw'?1800:3000; o.connect(flt); flt.connect(g); out(g,.55,melBus,echoAmt*.6);
    const vib=ctx.createOscillator(); vib.frequency.value=5.5; const vg=ctx.createGain(); vg.gain.value=timbre==='square'?0:3; vib.connect(vg); vg.connect(o.detune); vib.start(t); vib.stop(t+1.3);
    adsr(g,t,(timbre==='square'?.03:.075)*vel,.012,.18,.65); o.start(t); o.stop(t+1.2);
  }
  function kick(t,v){ const o=ctx.createOscillator(), g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(130,t); o.frequency.exponentialRampToValueAtTime(42,t+.14); out(g,0,drumBus); o.connect(g); g.gain.setValueAtTime(.55*v,t); g.gain.exponentialRampToValueAtTime(.001,t+.32); o.start(t); o.stop(t+.35); }
  function tom(t,v){ const o=ctx.createOscillator(), g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(180,t); o.frequency.exponentialRampToValueAtTime(80,t+.18); out(g,.15,drumBus); o.connect(g); g.gain.setValueAtTime(.5*v,t); g.gain.exponentialRampToValueAtTime(.001,t+.3); o.start(t); o.stop(t+.34); }
  function noiseHit(t,dur,hp,lpf,vel,band,buf,echo){ const s=ctx.createBufferSource(); s.buffer=buf||noiseW; const g=ctx.createGain(); let n=s;
    if(hp){ const f=ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp; n.connect(f); n=f; }
    if(band){ const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=band; f.Q.value=.8; n.connect(f); n=f; }
    if(lpf){ const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=lpf; n.connect(f); n=f; }
    n.connect(g); out(g,0,drumBus,echo); g.gain.setValueAtTime(vel,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); s.start(t,Math.random()); s.stop(t+dur+.05); }
  const snare=(t,v,soft,echo)=>{ noiseHit(t,soft?.12:.2,1200,6000,.28*v,0,null,echo); const o=ctx.createOscillator(), g=ctx.createGain(); o.type='triangle'; o.frequency.value=soft?200:175; o.connect(g); out(g,0,drumBus,echo); g.gain.setValueAtTime(.18*v,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); o.start(t); o.stop(t+.15); };
  const hat=(t,v,open)=>noiseHit(t,open?.22:.045,7500,0,.16*v,0);
  const clap=(t,v)=>{ for(let i=0;i<3;i++) noiseHit(t+i*.012,.1,1500,0,.14*v,2000); };
  const tek=(t,v)=>noiseHit(t,.06,2200,7000,.2*v,0);
  const rim=(t,v)=>{ noiseHit(t,.03,2500,0,.12*v,0); const o=ctx.createOscillator(), g=ctx.createGain(); o.type='triangle'; o.frequency.value=520; o.connect(g); out(g,0,drumBus); g.gain.setValueAtTime(.12*v,t); g.gain.exponentialRampToValueAtTime(.001,t+.04); o.start(t); o.stop(t+.06); };

  /* ---------- sequencer ---------- */
  let step=0, nextTime=0, timer=null, loopCount=0, motifLive=null;
  const DRUMS={
    boom:{k:[0,10],s:[4,12],h:[0,2,4,6,8,10,12,14],ho:[14],gk:[7]},
    soft:{k:[0],s:[8],h:[4,12],ho:[],gk:[],soft:true},
    neo:{k:[0,3,10],s:[4,12],h:[0,2,3,4,6,8,10,11,12,14],ho:[15],gk:[7]},
    four:{k:[0,4,8,12],s:[4,12],h:[2,6,10,14],ho:[],gk:[],clap:true},
    noise:{k:[0,8],s:[4,12],h:[0,2,4,6,8,10,12,14],ho:[],gk:[10]},
    bossa:{k:[0,6,8,14],s:[],h:[0,2,4,6,8,10,12,14],ho:[],gk:[],rim:[0,3,6,10,12]},
    house:{k:[0,4,8,12],s:[],c:[4,12],h:[1,3,5,7,9,11,13,15],ho:[2,6,10,14],gk:[]},
    dnb:{k:[0,10],s:[4,12],gs:[7,15],h:[0,2,4,6,8,10,12,14],ho:[],gk:[]},
    dub:{k:[8],s:[8],h:[0,2,4,6,8,10,12,14],ho:[],gk:[],echo:true},
    frame:{k:[],s:[],h:[],ho:[],gk:[],tom:[0,6,10],tek:[4,8,12,14]},
    taiko:{k:[],s:[],h:[],ho:[],gk:[],tom:[0,8,12]},
    none:{k:[],s:[],h:[],ho:[],gk:[]}
  };
  /* voice leading: pick the inversion/octave closest to the previous chord */
  let voiceCache=[null,null,null,null], lastCent=62, lastTop=72, sect={drums:true,melody:true,bass:true};
  function voiceFor(bar,rootM,ivs){
    if(voiceCache[bar]) return voiceCache[bar];
    const base=ivs.map(i=>rootM+i), n=base.length; let best=null, bd=1e9;
    for(let inv=0;inv<n;inv++) for(const sh of [-12,0,12]){
      const v=base.map((m,k)=>m+(k<inv?12:0)+sh+12).sort((x,y)=>x-y);
      if(v[0]<50||v[n-1]>79) continue;
      const cent=v.reduce((x,y)=>x+y,0)/n, d=Math.abs(cent-lastCent)+Math.abs(v[n-1]-lastTop)*.3;
      if(d<bd){ bd=d; best=v; }
    }
    if(!best) best=base.map(m=>{ let x=m+12; while(x>77) x-=12; return x; });
    lastCent=best.reduce((x,y)=>x+y,0)/n; lastTop=best[n-1]; voiceCache[bar]=best; return best;
  }
  const snapChord=(note,voice)=>{ const pcs=voice.map(v=>v%12); for(const d of [0,1,-1,2,-2]) if(pcs.includes((((note+d)%12)+12)%12)) return note+d; return note; };
  // song shape: intro (keys + bass) -> melody enters -> full -> breakdown -> full -> outro
  function setSect(){ const T=S.track, total=S.radio?6:T.loops, i=S.radio?loopCount%6:loopCount;
    sect={drums:true,melody:true,bass:true};
    if(total>=4){ if(i===0){ sect.drums=false; sect.melody=false; } else if(i===1) sect.melody=false; if(i===total-1){ sect.melody=false; sect.drums=false; } if(total>=6&&i===Math.floor(total/2)) sect.drums=false; }
    voiceCache=[null,null,null,null]; }
  function duck(t,st){ const a=Math.min(.85,MIX.pump*.7*(st.pumpMul||1)); if(a<=.01) return; [duckK,duckB].forEach(g=>{ g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(1-a,t); g.gain.linearRampToValueAtTime(1,t+.22); }); }
  function schedule(){
    const T=S.track, st=STYLES[T.style];
    const bpm=T.bpm*(S.energy===0?.93:S.energy===2?1.1:1)*(.8+MIX.tempo*.4), sd=60/bpm/4, beat=sd*4;
    const swing=Math.max(0,(st.swing||0)*(MIX.swing*2)+(MIX.swing>.5?(MIX.swing-.5)*.3:0)), hj=.006+MIX.human*.03, key=MIX.key|0;
    echoAmt=st.echo||0;
    while(nextTime<ctx.currentTime+.18){
      const bar=Math.floor(step/16)%4, s=step%16, chord=T.prog[bar];
      const swingOff=(s%2===1)?swing*sd*1.6:0, hum=(Math.random()-.5)*hj;
      const t=nextTime+swingOff+hum;
      const rootM=48+T.keyRoot+key+chord[0]-(chord[0]>6?12:0), ivs=CH[chord[1]];
      const voice=voiceFor(bar,rootM,ivs);
      const vel=.76+Math.random()*(.2+MIX.human*.2), tm=st.timbre; let played=null;
      // ----- chords / harmony -----
      if(st.arp==='16'){ keyNote(t,voice[s%voice.length]+(s%8>=4?12:0),sd*1.2,vel*.9,tm); }
      else if(st.arp==='8'){ if(s%2===0&&(st.group!=='Themed'||Math.random()<.85)) keyNote(t,voice[(s/2)%voice.length]+(st.group==='Themed'&&s%8===6?12:0),sd*2.6,vel*.8,tm); }
      else if(st.comp==='pad'){ if(s===0) voice.forEach(m=>keyNote(t,m-12,beat*4.2,.8,'pad')); }
      else { const hits=COMP[st.comp]||[0,10]; if(hits.includes(s)&&(s===0||Math.random()<.78)){
        const short=(st.comp==='house'||st.comp==='dub'); const dur=short?sd*1.4:(s===0?beat*2.4:beat*.9);
        if(st.comp==='sparse'){ keyNote(t,voice[Math.floor(Math.random()*voice.length)],beat*1.2,vel,tm); } else voice.forEach((m,i)=>keyNote(t+i*(.008+Math.random()*.012),m,dur,vel*(s===0?1:.7),tm)); } }
      if(st.extraArp&&s%2===0&&s%4!==0&&Math.random()<.6) keyNote(t,voice[(s/2)%voice.length]+12,sd*1.8,.7,'saw');
      if(st.extraPad&&s===0) voice.forEach(m=>keyNote(t,m-12,beat*4,.7,'strings'));
      if(st.drone&&s===0){ keyNote(t,rootM-12,beat*4.2,.7,'drone'); keyNote(t,rootM-5,beat*4.2,.5,'drone'); }
      // ----- bass / melody / drums -----
      if(S.band!=='chords'){
        const bm=rootM-12+(rootM-12<36?12:0), bw=st.bassWave||'sine';
        switch(sect.bass?st.bass:'off'){
          case 'off': break;
          case 'long': if(s===0) bassNote(t,bm,beat*3,.8,bw); if(bw==='saw'&&s===10) bassNote(t,bm,beat*1.2,.8,'saw'); break;
          case 'arp': if(s%2===0) bassNote(t,bm+(s%8===4?12:(s%8===6?7:0)),sd*1.7,.85,bw); break;
          case 'walk': if(s===0) bassNote(t,bm,beat*1.8,.9,'sine'); if(s===8) bassNote(t,bm+7,beat*1.8,.8,'sine'); break;
          case 'dub': if(s===0||s===6||s===10) bassNote(t,bm,beat*(s===0?2:1),1.15,'sine'); break;
          case 'house': if(s%4===2) bassNote(t,bm+(s===14?7:0),sd*2.2,.9,'saw'); break;
          default: if(s===0||s===(st.bassHit||10)||(s===14&&Math.random()<.35)) bassNote(t,bm+(s===14?7:0),beat*(s===0?1.6:.8),.9,'sine');
        }
        const mv=motifLive[s];
        if(sect.melody&&mv!==null&&Math.random()<(st.melody*(S.energy===0?.55:S.energy===2?1.4:1)+.1)){
          let n=T.keyRoot+key+60+mv; if(s%8===0||(s%4===0&&Math.random()<.5)) n=snapChord(n,voice);
          melNote(t,n,.7+Math.random()*.3,st.mel); played=n; }
      }
      if(S.band==='full'&&sect.drums){
        const D=DRUMS[st.drums]||DRUMS.none, e=S.energy, ec=D.echo?st.echo:0, late=MIX.human*.012;
        if(D.k.includes(s)){ kick(t,.9+Math.random()*.1); duck(t,st); } else if(D.gk.includes(s)&&Math.random()<.35) kick(t,.5);
        if(D.s.includes(s)){ snare(t+late,.9,D.soft,ec); if(D.clap) clap(t+late,.9); }
        if(D.c&&D.c.includes(s)){ clap(t,.95); duck(t,st); }
        if(D.gs&&D.gs.includes(s)&&Math.random()<.5) snare(t+late,.35,true);
        if(D.rim&&D.rim.includes(s)) rim(t,.8);
        if(D.tom&&D.tom.includes(s)) tom(t,.9);
        if(D.tek&&D.tek.includes(s)) tek(t,.8);
        if(D.h.includes(s)&&(e>0||s%4===0)) hat(t-(Math.random()*.006),(.45+Math.random()*(.3+MIX.human*.3))*(s%4===0?1.15:.8),false);
        if(e===2&&st.drums!=='none'&&s%2===1&&Math.random()<.4) hat(t,.4,false);
        if(D.ho.includes(s)&&Math.random()<.5) hat(t,.7,true);
      }
      // timeline for visualisers (vinyl page): what plays on this 16th, scheduled at audio time t
      if(listeners.step) emit('step',{t,s,bar,step,loop:loopCount,loops:T.loops,note:played,melody:sect.melody,drums:sect.drums,motif:motifLive,keyRoot:T.keyRoot+key,sd});
      nextTime+=sd; step++;
      if(step%64===0){
        loopCount++;
        if(S.radio){ if(slotOf(Date.now())!==T.radioSlot){ nextRadio(); return; } }
        else if(loopCount>=T.loops){ loopCount=0; next(); return; }
        motifLive=T.motif.map(m=>(Math.random()<.22)?(Math.random()<.5?null:T.scale[Math.floor(Math.random()*T.scale.length)]):m);
        setSect();
      }
    }
  }
  function startTrack(){
    const T=S.track; motifLive=T.motif.slice(); loopCount=0; step=0; lastCent=62; lastTop=72;
    if(S.radio&&T.radioSlot!=null){ const el=(Date.now()-T.radioSlot*SLOT)/1000; step=Math.max(0,Math.floor(el/(60/T.bpm/4))); loopCount=Math.floor(step/64); }
    setSect(); nextTime=ctx.currentTime+.08;
    const sid=T.style; S.lpBase=sid==='ambient'?2400:(sid==='chiptune'?7000:(['synth','dnb','house','japanese','oud','sitar'].includes(sid)?4600:3200));
    echoDelay.delayTime.value=60/T.bpm*.75; applyMix(); emit('track',T);
  }
  const resolveStyle=()=>S.style==='mix'?STYLE_IDS[Math.floor(Math.random()*STYLE_IDS.length)]:S.style;
  function mkQueue(){ S.queue=[]; for(let i=0;i<5;i++) S.queue.push({seed:Math.floor(Math.random()*9000)+100,style:resolveStyle()}); }
  function info(T){ return { seed:T.seed, style:T.style, name:T.name, key:keyLabel(T), bpm:T.bpm, dur:T.dur }; }
  function queue(){
    if(S.radio){ const now=Date.now(), slot=slotOf(now); return [1,2,3,4,5].map(i=>Object.assign(info(radioTrack((slot+i)*SLOT)),{radio:true,at:(slot+i)*SLOT})); }
    if(!S.queue) mkQueue(); return S.queue.map(q=>info(makeTrack(q.seed,q.style)));
  }
  function pushHist(){ if(S.track&&!S.radio){ S.history.push({seed:S.track.seed,style:S.track.style}); if(S.history.length>30) S.history.shift(); } }
  function prev(){ if(S.radio||!S.history.length) return false; const h=S.history.pop(); S.track=makeTrack(h.seed,h.style); if(S.playing) startTrack(); else emit('track',S.track); emit('queue',queue()); return true; }
  function loadTrack(seed,style){ if(!STYLES[style]) return false; S.radio=false; S.track=makeTrack(seed,style); emit('track',S.track); return true; }
  function next(){
    if(S.radio){ nextRadio(); return; }
    pushHist();
    if(!S.queue) mkQueue(); const q=S.queue.shift(); S.queue.push({seed:Math.floor(Math.random()*9000)+100,style:resolveStyle()});
    S.track=makeTrack(q.seed,q.style); if(S.playing) startTrack(); else emit('track',S.track); emit('queue',queue());
  }
  function nextRadio(){ S.track=radioTrack(Date.now()); if(S.playing) startTrack(); else emit('track',S.track); emit('queue',queue()); }
  function setTrack(seed,style){ S.track=makeTrack(seed,style||resolveStyle()); if(S.playing&&ctx) startTrack(); else emit('track',S.track); }
  function play(){ init(); if(ctx.state==='suspended') ctx.resume(); if(!S.track) S.track=S.radio?radioTrack(Date.now()):makeTrack(Math.floor(Math.random()*9000)+100,resolveStyle());
    if(S.playing) return; S.playing=true; startTrack(); timer=setInterval(()=>{ if(S.playing) schedule(); },40); applyMix(); emit('state',S); }
  function pause(){ S.playing=false; clearInterval(timer); timer=null; if(ctx) applyMix(); emit('state',S); }
  function toggle(){ S.playing?pause():play(); }
  function playSeed(seed,style){ if(S.radio) setRadio(false); pushHist(); S.track=makeTrack(seed,style||S.track&&S.track.style||resolveStyle()); if(S.playing) startTrack(); else play(); emit('track',S.track); }
  function setStyle(id){ S.style=id; if(S.radio) S.radio=false; mkQueue(); if(S.track) setTrack(Math.floor(Math.random()*9000)+100); emit('queue',queue()); emit('state',S); }
  function setRadio(on){ S.radio=!!on; if(on){ S.track=radioTrack(Date.now()); if(S.playing) startTrack(); else emit('track',S.track); } else { mkQueue(); } emit('queue',queue()); emit('state',S); }
  const setEnergy=e=>{ S.energy=e; }; const setBand=b=>{ S.band=b; };
  function setVolume(v){ S.vol=v; if(master) master.gain.setTargetAtTime(DEV_MUTE?0:v,ctx.currentTime,.05); }
  function setVinyl(on){ S.vinyl=on; applyMix(); }
  function scratch(v){ if(!ctx) return; const now=ctx.currentTime, a=Math.min(1,Math.abs(v)), s=ctx.createBufferSource(); s.buffer=noiseB; s.playbackRate.value=.6+a*2.4;
    const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.setValueAtTime(400+a*2600,now); f.frequency.exponentialRampToValueAtTime(220+a*900,now+.09); f.Q.value=2.2;
    const g=ctx.createGain(); g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(.22*a+.04,now+.01); g.gain.exponentialRampToValueAtTime(.001,now+.12);
    s.connect(f); f.connect(g); g.connect(master); s.start(now,Math.random()*2); s.stop(now+.14);
    musicBus.gain.cancelScheduledValues(now); musicBus.gain.setValueAtTime(.7*Math.max(.25,1-a*.7),now); musicBus.gain.linearRampToValueAtTime(.7,now+.25); }

  /* ---------- jam: keys 1-8 play notes that fit the current key ---------- */
  function jam(i){ init(); if(ctx.state==='suspended') ctx.resume(); const T=S.track||makeTrack(1,resolveStyle()); const sc=T.scale; const deg=i%sc.length, oct=Math.floor(i/sc.length);
    melNote(ctx.currentTime+.01,T.keyRoot+60+sc[deg]+oct*12,1,STYLES[T.style].mel); }

  /* ---------- ambience ---------- */
  const SND={};
  const SOUND_LABELS={ rain:'Rain', thunder:'Thunder', traffic:'Traffic', waves:'Water', wind:'Wind', frogs:'Frogs', crickets:'Crickets', neon:'Neon hum', siren:'Sirens', industrial:'Refinery hum', fire:'Campfire', crowd:'Crowd', horns:'Ship horns' };
  function loopSrc(buf){ const s=ctx.createBufferSource(); s.buffer=buf; s.loop=true; s.loopStart=Math.random()*1; s.start(); return s; }
  function chain(src,nodes){ let n=src; nodes.forEach(x=>{ n.connect(x); n=x; }); return n; }
  function filt(type,f,q){ const x=ctx.createBiquadFilter(); x.type=type; x.frequency.value=f; if(q) x.Q.value=q; return x; }
  function lfoTo(param,freq,depth){ const o=ctx.createOscillator(); o.frequency.value=freq; const g=ctx.createGain(); g.gain.value=depth; o.connect(g); g.connect(param); o.start(); }
  function buildAmbience(){
    const mk=(id)=>{ const g=ctx.createGain(); g.gain.value=0; g.connect(ambBus); SND[id]={gain:g,level:0}; return g; };
    let g=mk('rain'); chain(loopSrc(noiseW),[filt('highpass',1400),filt('lowpass',8000)]).connect(g);
    { const b=ctx.createGain(); b.gain.value=.5; chain(loopSrc(noiseB),[filt('lowpass',1200),b]).connect(g); }
    g=mk('traffic'); { const m=ctx.createGain(); m.gain.value=.7; chain(loopSrc(noiseB),[filt('lowpass',420),m]).connect(g); lfoTo(m.gain,.06,.25); }
    g=mk('waves'); { const m=ctx.createGain(); m.gain.value=.5; chain(loopSrc(noiseB),[filt('lowpass',1100),m]).connect(g); lfoTo(m.gain,.11,.45); const m2=ctx.createGain(); m2.gain.value=.25; chain(loopSrc(noiseW),[filt('bandpass',1800,.5),m2]).connect(g); lfoTo(m2.gain,.11,.22); }
    g=mk('wind'); { const f=filt('bandpass',500,.7); const m=ctx.createGain(); m.gain.value=.5; chain(loopSrc(noiseW),[f,m]).connect(g); lfoTo(f.frequency,.07,260); lfoTo(m.gain,.13,.3); }
    g=mk('crowd'); { const f=filt('bandpass',900,.6), f2=filt('bandpass',1700,.8), m=ctx.createGain(); m.gain.value=.45; chain(loopSrc(noiseW),[f,m]).connect(g); const m2=ctx.createGain(); m2.gain.value=.25; chain(loopSrc(noiseW),[f2,m2]).connect(g); lfoTo(m.gain,.31,.25); lfoTo(m2.gain,.23,.18); lfoTo(f.frequency,.17,160); }
    g=mk('crickets'); { const o=ctx.createOscillator(); o.frequency.value=4300; const m=ctx.createGain(); m.gain.value=0; const l=ctx.createOscillator(); l.type='square'; l.frequency.value=14; const lg=ctx.createGain(); lg.gain.value=.5; l.connect(lg); lg.connect(m.gain); const l2=ctx.createOscillator(); l2.frequency.value=.35; const l2g=ctx.createGain(); l2g.gain.value=.5; l2.connect(l2g); l2g.connect(m.gain); o.connect(m); m.connect(g); o.start(); l.start(); l2.start(); }
    g=mk('neon'); { const o=ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=100; const f=filt('lowpass',500); const m=ctx.createGain(); m.gain.value=.35; o.connect(f); f.connect(m); m.connect(g); o.start(); const o2=ctx.createOscillator(); o2.type='square'; o2.frequency.value=200.5; const m2=ctx.createGain(); m2.gain.value=.05; o2.connect(m2); m2.connect(g); o2.start(); lfoTo(m.gain,3.1,.04); }
    g=mk('industrial'); { const o=ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=55; const f=filt('lowpass',180); const m=ctx.createGain(); m.gain.value=.5; o.connect(f); f.connect(m); m.connect(g); o.start(); const m3=ctx.createGain(); m3.gain.value=.4; chain(loopSrc(noiseB),[filt('lowpass',260),m3]).connect(g); }
    mk('thunder'); mk('frogs'); mk('siren'); mk('fire'); mk('horns');
  }
  function ambLevel(id){ const s=SND[id]; if(!s) return 0; const wx=S.weather; let m=1;
    if(id==='rain') m={drizzle:.4,rain:1,storm:1.5,clear:0,fog:0,local:1}[wx]??1;
    if(id==='thunder') m=(wx==='storm')?1.2:0;
    return s.level*m; }
  function applyAmb(){ if(!ctx) return; for(const id in SND){ SND[id].gain.gain.setTargetAtTime(Math.min(1.6,ambLevel(id))*(id==='rain'?.55:(id==='thunder'?1:.6)),ctx.currentTime,.25); } }
  function setSound(id,v){ if(!SND[id]){ if(!ctx) init(); } if(SND[id]){ SND[id].level=v; applyAmb(); } }
  function setWeather(w){ S.weather=w; applyAmb(); }
  function setSceneSounds(map){ init(); for(const id in SND) SND[id].level=0; for(const id in map) if(SND[id]) SND[id].level=map[id]; applyAmb(); emit('sounds',map); }
  function thunder(){ if(!ctx||!SND.thunder) return; const t=ctx.currentTime+.4+Math.random()*.6, g=SND.thunder.gain;
    const s=ctx.createBufferSource(); s.buffer=noiseB; const f=filt('lowpass',380), e=ctx.createGain(); s.connect(f); f.connect(e); e.connect(g);
    e.gain.setValueAtTime(.0001,t); e.gain.exponentialRampToValueAtTime(.9,t+.15); e.gain.exponentialRampToValueAtTime(.0001,t+3.4); s.start(t,Math.random()*2); s.stop(t+3.6); }
  function tickEvents(){ if(!ctx||ctx.state!=='running') return;
    const now=ctx.currentTime, lv=id=>SND[id]?SND[id].level:0;
    if(lv('frogs')>0&&Math.random()<.6){ const o=ctx.createOscillator(), g=ctx.createGain(), f=filt('bandpass',500+Math.random()*350,6); o.type='sawtooth'; o.frequency.value=90+Math.random()*60; o.connect(f); f.connect(g); g.connect(SND.frogs.gain);
      const n=2+Math.floor(Math.random()*4), d=.09; for(let i=0;i<n;i++){ g.gain.setValueAtTime(.0001,now+i*d); g.gain.linearRampToValueAtTime(.5,now+i*d+.02); g.gain.linearRampToValueAtTime(.0001,now+i*d+.07); } o.start(now); o.stop(now+n*d+.1); SND.frogs.gain.gain.setTargetAtTime(lv('frogs')*.5,now,.1); }
    if(lv('siren')>0&&Math.random()<.025){ const o=ctx.createOscillator(), g=ctx.createGain(), f=filt('lowpass',1800); o.type='sine'; o.connect(f); f.connect(g); g.connect(SND.siren.gain); SND.siren.gain.gain.setTargetAtTime(lv('siren')*.12,now,.1);
      for(let i=0;i<6;i++) o.frequency.setValueAtTime(i%2?780:620,now+i*.55); g.gain.setValueAtTime(.0001,now); g.gain.linearRampToValueAtTime(.6,now+.8); g.gain.linearRampToValueAtTime(.0001,now+3.6); o.start(now); o.stop(now+3.7); }
    if(lv('horns')>0&&Math.random()<.012){ const g=ctx.createGain(), f=filt('lowpass',520); f.connect(g); g.connect(SND.horns.gain); SND.horns.gain.gain.setTargetAtTime(lv('horns')*.3,now,.1);
      for(const hz of [98,147,196]){ const o=ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=hz; o.connect(f); o.start(now); o.stop(now+3.2); }
      g.gain.setValueAtTime(.0001,now); g.gain.linearRampToValueAtTime(.5,now+.35); g.gain.setValueAtTime(.5,now+1.6); g.gain.linearRampToValueAtTime(.0001,now+3); }
    if(lv('traffic')>0&&Math.random()<.04){ const o=ctx.createOscillator(), g=ctx.createGain(), f=filt('lowpass',900); o.type='square'; o.frequency.value=Math.random()<.5?330:392; o.connect(f); f.connect(g); g.connect(ambBus); g.gain.setValueAtTime(.0001,now); g.gain.linearRampToValueAtTime(.022*lv('traffic'),now+.03); g.gain.linearRampToValueAtTime(.0001,now+.28); o.start(now); o.stop(now+.3); }
    if(lv('fire')>0){ const pops=Math.random()<.7?1+Math.floor(Math.random()*3):0; for(let i=0;i<pops;i++){ const t=now+Math.random()*.3; const s=ctx.createBufferSource(); s.buffer=noiseW; const f=filt('bandpass',1500+Math.random()*3000,2), g=ctx.createGain(); s.connect(f); f.connect(g); g.connect(SND.fire.gain); g.gain.setValueAtTime(.35,t); g.gain.exponentialRampToValueAtTime(.001,t+.03+Math.random()*.04); s.start(t,Math.random()); s.stop(t+.1); }
      SND.fire.gain.gain.setTargetAtTime(lv('fire')*.8,now,.1);
      if(!SND.fire.bed){ const b=ctx.createGain(); b.gain.value=.25; chain(loopSrc(noiseB),[filt('bandpass',300,.6),b]).connect(SND.fire.gain); SND.fire.bed=true; } }
  }


  /* ---------- record the output + export the loop as MIDI ---------- */
  function record(sec){ return new Promise((res,rej)=>{
    if(!ctx||!recDest||!window.MediaRecorder) return rej(new Error('Recording needs music playing in a modern browser'));
    let mime=''; for(const m of ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus']) if(MediaRecorder.isTypeSupported(m)){ mime=m; break; }
    const chunks=[], mr=new MediaRecorder(recDest.stream,mime?{mimeType:mime}:undefined);
    mr.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); }; mr.onstop=()=>res(new Blob(chunks,{type:mr.mimeType||'audio/webm'})); mr.start(); setTimeout(()=>mr.stop(),sec*1000); }); }
  function midi(){
    const T=S.track; if(!T) return null; const st=STYLES[T.style], PPQ=96, ST=PPQ/4, key=MIX.key|0;
    const vlq=n=>{ const b=[n&127]; while((n>>=7)) b.unshift((n&127)|128); return b; };
    const trk=ev=>{ ev.sort((x,y)=>x.t-y.t||(x.o||0)-(y.o||0)); let last=0; const d=[]; for(const e of ev){ d.push(...vlq(e.t-last),...e.b); last=e.t; } d.push(0,255,47,0); const L=d.length; return [77,84,114,107,L>>24&255,L>>16&255,L>>8&255,L&255,...d]; };
    const on=(t,ch,n,v,len,out)=>{ out.push({t,o:1,b:[144|ch,n,v]}); out.push({t:t+len,o:0,b:[128|ch,n,0]}); };
    const meta=[]; const us=Math.round(60000000/T.bpm); meta.push({t:0,b:[255,81,3,us>>16&255,us>>8&255,us&255]}); meta.push({t:0,b:[255,88,4,4,2,24,8]});
    const ch=[{t:0,b:[192,st.group==='Themed'?24:4]}], bs=[{t:0,b:[193,38]}], ml=[{t:0,b:[194,st.mel==='square'?80:11]}], dr=[];
    const sv=[voiceCache.slice(),lastCent,lastTop]; voiceCache=[null,null,null,null]; lastCent=62; lastTop=72;
    const D=DRUMS[st.drums]||DRUMS.none;
    for(let rep=0;rep<2;rep++) for(let bar=0;bar<4;bar++){
      const chord=T.prog[bar], rootM=48+T.keyRoot+key+chord[0]-(chord[0]>6?12:0), voice=voiceFor(bar,rootM,CH[chord[1]]), t0=(rep*4+bar)*16*ST;
      voice.forEach(n=>on(t0,0,n,70,16*ST-4,ch)); on(t0,1,Math.max(28,rootM-12+(rootM-12<36?12:0)),90,8*ST,bs);
      for(let s=0;s<16;s++){ const mv=T.motif[s]; if(mv!==null&&st.bass!=='off'||mv!==null) on(t0+s*ST,2,snapChord(T.keyRoot+key+60+mv,voice),80,ST,ml);
        const p=(arr,note,vel)=>{ if(arr&&arr.includes(s)) on(t0+s*ST,9,note,vel,ST/2,dr); };
        p(D.k,36,100); p(D.s,38,90); p(D.c,39,90); p(D.rim,37,70); p(D.tom,45,85); p(D.h,42,60); p(D.ho,46,70); }
    }
    voiceCache=sv[0]; lastCent=sv[1]; lastTop=sv[2];
    const body=[...trk(meta),...trk(ch),...trk(bs),...trk(ml),...trk(dr)];
    return new Uint8Array([77,84,104,100,0,0,0,6,0,1,0,5,PPQ>>8,PPQ&255,...body]);
  }

  function level(){ if(!analyser) return 0; analyser.getByteTimeDomainData(anBuf); let s=0; for(let i=0;i<anBuf.length;i++){ const v=(anBuf[i]-128)/128; s+=v*v; } return Math.sqrt(s/anBuf.length); }
  return { level, init, play, pause, toggle, next, prev, loadTrack, scratch, record, midi, playSeed, setStyle, setRadio, setEnergy, setBand, setVolume, setVinyl, jam, setSound, setWeather, setSceneSounds, thunder, queue, on,
    setMix, loadMix, resetMix, applyPreset, MIX, MIX_DEFAULT, PRESETS, STYLES, STYLE_IDS, GROUPS, SOUND_LABELS, radioLabel, keyLabel, info, state:S,
    get ctx(){ return ctx; }, makeTrack };
})();
