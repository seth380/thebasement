/* ---------- input ---------- */
const KEYS={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
let near=null;
function act(){
  if(mode==='sit'){stand();return;}
  if(mode==='walk'&&near&&!modal())near.fn();
}
window.addEventListener('keydown',e=>{
  if(mode==='game'){if(e.code==='Escape')closeGame();return;}
  if(e.target&&e.target.tagName==='INPUT'){if(e.code==='Enter')closeCustom();return;}
  if(e.code==='Escape'){if(modal())closeOvers();else if(mode==='custom')closeCustom();return;}
  if(KEYS[e.code]){keys[KEYS[e.code]]=true;e.preventDefault();}
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

