/* ---------- input ---------- */
const KEYS={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
let near=null;
function act(){
  if(DECO.on){if(DECO.held)decoPlace();return;}
  if(mode==='sit'){stand();return;}
  if(mode==='walk'&&near&&!modal())near.fn();
}
window.addEventListener('keydown',e=>{
  if(mode==='game'){if(e.code==='Escape')closeGame();return;}
  if(e.target&&e.target.tagName==='INPUT'){if(e.code==='Enter')closeCustom();return;}
  if(e.code==='Escape'){if(modal())closeOvers();else if(DECO.on){if(!decoCancel())decoClose();}else if(mode==='custom')closeCustom();return;}
  if(KEYS[e.code]){keys[KEYS[e.code]]=true;e.preventDefault();}
  /* decorating: B opens and closes it; R and Q turn, C changes colour, X or Delete puts the thing away */
  else if(e.code==='KeyB'&&!e.repeat&&!modal()&&mode==='walk'){DECO.on?decoClose():decoOpen();}
  else if(DECO.on&&(e.code==='KeyR'||e.code==='KeyQ')){decoTurn(e.code==='KeyR'?1:-1);}
  else if(DECO.on&&e.code==='KeyC'&&!e.repeat){decoRecolour();}
  else if(DECO.on&&(e.code==='KeyX'||e.code==='Delete'||e.code==='Backspace')&&!e.repeat){e.preventDefault();decoPutAway();}
  else if((e.code==='KeyE'||e.code==='Enter'||e.code==='Space')&&!e.repeat){
    if(e.target&&e.target.tagName==='BUTTON'&&e.code!=='KeyE')return;
    e.preventDefault();if(FB.on){FB.kickT=0.3;return;}if(PL.on){if(e.code==='Space')plPlayerShoot();return;}if(mode==='custom')closeCustom();else act();}
});
window.addEventListener('keyup',e=>{if(KEYS[e.code])keys[KEYS[e.code]]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
$('h-prompt').addEventListener('click',act);
{
  const st=$('h-stick'),kn=$('h-knob');let id=null;
  const mv=e=>{const r=st.getBoundingClientRect();let dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2);
    const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}jx=dx;jy=dy;kn.style.transform='translate('+dx*36+'px,'+dy*36+'px)';};
  const up=()=>{id=null;jx=jy=0;kn.style.transform='';};
  st.addEventListener('pointerdown',e=>{e.preventDefault();id=e.pointerId;try{st.setPointerCapture(id);}catch(x){}mv(e);});
  st.addEventListener('pointermove',e=>{if(e.pointerId===id)mv(e);});
  ['pointerup','pointercancel'].forEach(n=>st.addEventListener(n,up));
}


/* mouse look: click the view to take the mouse (like the games). The mouse turns you and tilts the camera,
   A and D step sideways, Esc gives the mouse back. Without it, the old keyboard turning still works. */
let looking=false,camPitch=0.23;
function unlook(){if(document.pointerLockElement)try{document.exitPointerLock();}catch(e){}}
$('h-wrap').addEventListener('click',e=>{
  if(coarse||looking||mode!=='walk'||modal()||DECO.on)return;
  const t=e.target;if(t&&t.closest&&t.closest('button,input,.h-panel,.h-over,.h-card'))return;
  try{const r=$('h-view').requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(x){}
});
document.addEventListener('pointerlockchange',()=>{looking=document.pointerLockElement===$('h-view');
  $('h-hint').textContent=looking?'Mouse to look · W A S D to move · E to use · Esc to free the mouse':'Click to look around with the mouse · W A S D or arrow keys to walk · E to use';});
document.addEventListener('mousemove',e=>{if(!looking)return;P.h-=e.movementX*0.0026;camPitch=Math.max(-0.12,Math.min(0.95,camPitch+e.movementY*0.0022));});
