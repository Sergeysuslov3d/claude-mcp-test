// The line above the controls (was a usage hint) shows just the name of the playing track.
// Needs js/audio.js (window.Lofi) loaded first.
(function(){
  if(!window.Lofi) return;
  const hint=document.querySelector('.lhint'); if(!hint) return;
  const st=document.createElement('style'); st.textContent='body .lhint.np-title{ font-size:13px; font-weight:700; color:#3a3348; text-transform:capitalize; letter-spacing:0; }';
  document.head.appendChild(st);
  hint.textContent=''; hint.classList.add('np-title');
  Lofi.on('track',T=>{ hint.textContent=T.name; });
})();
