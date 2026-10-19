/* ---------- decorate: buy things with coins and place them in any base ----------
   Press Decorate (or B). Pick something from the tray, move the mouse (or tap the floor) to put it where you want,
   R to turn it, click (or Place) to put it down. Click something you placed to pick it up again; Put away sends it back to your
   storage. What you own and where it stands is saved in this browser, per base. Things with something to do (a jukebox,
   a trampoline) get their own E prompt once they are placed. */
const DECO={on:false,held:null,hover:null,tab:'furniture',arm:null,inv:{},placed:[],ray:new THREE.Raycaster(),ndc:new THREE.Vector2(),mouse:false,tap:null,hop:null,thumbs:{},thumbQ:[],tq:false};
try{DECO.inv=JSON.parse(store.getItem('deco-inv'))||{};}catch(e){}
/* places that must stay clear: stairs, lifts, the secret door, where you arrive */
const DECO_KEEP=[[[10.4,3.6,0.9],[10.0,-3.6,0.95],[9.7,-3.6,0.7],[-10.2,-6.5,1.1]],[[10.4,7.35,0.8],[8.7,6.6,0.7]],[[-2.5,-8.3,1.1],[-2.5,-7.7,0.7]],[[-8.3,-4.3,1.25],[-6.9,-4.3,0.7]]];
const DECO_SHADOW=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),id=g.createImageData(64,64);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){const dx=Math.max(0,Math.abs(x+0.5-32)-12)/20,dy=Math.max(0,Math.abs(y+0.5-32)-12)/20,a=Math.pow(1-Math.min(1,Math.hypot(dx,dy)),1.8);id.data[(y*64+x)*4+3]=a*255;}
  g.putImageData(id,0,0);return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),color:0x000000,transparent:true,opacity:0.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});})();
const decoPar=lv=>lv===0?scene:LV[lv].g;
const decoCol=(it,d)=>it.colors?it.colors[(d.c||0)%it.colors.length]:undefined;
/* the footprint, turned in steps of 45 degrees, as a box lined up with the room */
function decoBox(it,x,z,r){const a=r*Math.PI/4,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a)),hw=(it.w*c+it.d*s)/2,hd=(it.w*s+it.d*c)/2;return {x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd};}
function decoSave(){const out={};DECO.placed.forEach(o=>{(out[o.lv]=out[o.lv]||[]).push({i:o.d.i,x:Math.round(o.d.x*100)/100,z:Math.round(o.d.z*100)/100,r:o.d.r|0,c:o.d.c|0});});
  store.setItem('deco-placed',JSON.stringify(out));store.setItem('deco-inv',JSON.stringify(DECO.inv));}
function decoMake(d,lv){
  const it=DECO_ITEMS.by[d.i];if(!it)return null;const par=decoPar(lv),g=it.build(decoCol(it,d));
  g.position.set(d.x,0,d.z);g.rotation.y=d.r*Math.PI/4;g.traverse(m=>{if(m.isMesh&&!m.material.transparent&&!m.material.isMeshBasicMaterial){m.castShadow=true;m.receiveShadow=true;}});par.add(g);
  const bb=decoBox(it,d.x,d.z,d.r),o={d:d,lv:lv,it:it,g:g,sh:null,col:null,th:null};g.userData.deco=o;
  if(!it.flat){const sh=new THREE.Mesh(new THREE.PlaneGeometry(bb.x1-bb.x0+0.5,bb.z1-bb.z0+0.5),DECO_SHADOW);sh.rotation.x=-Math.PI/2;sh.position.set(d.x,0.014,d.z);sh.renderOrder=1;par.add(sh);o.sh=sh;
    o.col={x0:bb.x0+0.04,x1:bb.x1-0.04,z0:bb.z0+0.04,z1:bb.z1-0.04,lv:lv,deco:true};colliders.push(o.col);}
  if(it.use){const a=d.r*Math.PI/4,f=it.d/2+0.55;o.th={lv:lv,x:d.x+Math.sin(a)*f,z:d.z+Math.cos(a)*f,r:1.0,text:it.use.text,fn:()=>it.use.fn(o)};things.push(o.th);}
  DECO.placed.push(o);return o;
}
function decoRemove(o){
  const par=decoPar(o.lv);par.remove(o.g);if(o.sh)par.remove(o.sh);
  o.g.traverse(m=>{if(m.geometry)m.geometry.dispose();});if(o.col){const i=colliders.indexOf(o.col);if(i>=0)colliders.splice(i,1);}
  if(o.th){const i=things.indexOf(o.th);if(i>=0)things.splice(i,1);}const i=DECO.placed.indexOf(o);if(i>=0)DECO.placed.splice(i,1);
}
/* everything placed before, back where it was */
try{const saved=JSON.parse(store.getItem('deco-placed'))||{};for(const lv in saved)(saved[lv]||[]).forEach(d=>{if(LV[+lv])decoMake(d,+lv);});}catch(e){}

/* ---- the see-through copy that follows the mouse while you place something ---- */
function decoGhost(it,c){
  const root=new THREE.Group(),g=it.build(c);root.add(g);
  g.traverse(m=>{if(!m.material)return;m.castShadow=false;const mm=m.material.clone();mm.transparent=true;mm.opacity=(mm.opacity===undefined?1:mm.opacity)*0.62;mm.depthWrite=false;m.material=mm;m.renderOrder=3;});
  const fp=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x2fd08a,transparent:true,opacity:0.32,depthWrite:false,toneMapped:false}));fp.rotation.x=-Math.PI/2;fp.position.y=0.02;fp.renderOrder=2;root.add(fp);
  root.userData={g:g,fp:fp};return root;
}
function decoHold(it,from,orig){
  decoDrop();const d=orig?Object.assign({},orig):{i:it.id,x:P.x,z:P.z,r:0,c:0};
  if(!orig){const a=Math.round(P.h/(Math.PI/4));d.r=((a%8)+8)%8;}
  DECO.held={it:it,d:d,from:from,orig:orig||null,ghost:decoGhost(it,decoCol(it,d)),ok:false};decoPar(lvl).add(DECO.held.ghost);
  if(!DECO.mouse&&!DECO.tap){d.x=P.x+Math.sin(P.h)*1.8;d.z=P.z+Math.cos(P.h)*1.8;}
  SFX.play('select');decoTools();
}
function decoDrop(){const h=DECO.held;if(!h)return;decoPar(lvl).remove(h.ghost);h.ghost.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();});DECO.held=null;decoTools();}
function decoInside(x,z){if(lvl===0)return x>-RX+0.15&&x<RX-0.15&&z>-RZ+0.15&&z<RZ-0.15;const v={x:x,z:z};LV[lvl].walk(v,0.15);return Math.abs(v.x-x)<1e-6&&Math.abs(v.z-z)<1e-6;}
function decoFits(it,x,z,r){
  const b=decoBox(it,x,z,r);
  for(const p of [[b.x0,b.z0],[b.x1,b.z0],[b.x0,b.z1],[b.x1,b.z1]])if(!decoInside(p[0],p[1]))return false;
  for(const k of DECO_KEEP[lvl]||[]){const cx=Math.max(b.x0,Math.min(b.x1,k[0])),cz=Math.max(b.z0,Math.min(b.z1,k[1]));if(Math.hypot(cx-k[0],cz-k[1])<k[2])return false;}
  if(it.flat)return true;
  for(const c of colliders){if(c.off||(c.lv||0)!==lvl)continue;if(b.x0+0.03<c.x1&&b.x1-0.03>c.x0&&b.z0+0.03<c.z1&&b.z1-0.03>c.z0)return false;}
  return true;
}
function decoPlace(){
  const h=DECO.held;if(!h)return;
  if(!h.ok){SFX.play('error');toast('It does not fit there');return;}
  if(h.from==='inv'&&h.it.price>0)DECO.inv[h.it.id]=Math.max(0,(DECO.inv[h.it.id]||0)-1);
  const o=decoMake({i:h.d.i,x:h.d.x,z:h.d.z,r:h.d.r,c:h.d.c},lvl);decoDrop();decoSave();renderDeco();
  SFX.play(['place_a','place_b','place_c','place_d'][Math.floor(Math.random()*4)]);
  if(o&&o.it.use&&!store.getItem('deco-use-tip')){store.setItem('deco-use-tip','1');setTimeout(()=>toast('Press Done, then walk up to it to use it'),300);}
}
function decoPutAway(){
  const h=DECO.held;if(!h)return;
  if(h.from==='placed'&&h.it.price>0)DECO.inv[h.it.id]=(DECO.inv[h.it.id]||0)+1;
  decoDrop();decoSave();renderDeco();SFX.play('remove_a');toast(h.it.name+' put away');
}
/* Esc with something in hand: a thing picked up goes back where it was */
function decoCancel(){const h=DECO.held;if(!h)return false;if(h.from==='placed'&&h.orig)decoMake(h.orig,lvl);decoDrop();decoSave();return true;}
function decoTurn(k){const h=DECO.held;if(!h)return;h.d.r=(((h.d.r+(k||1))%8)+8)%8;SFX.play('tick');}
function decoRecolour(){const h=DECO.held;if(!h||!h.it.colors)return;h.d.c=((h.d.c||0)+1)%h.it.colors.length;const old=h.ghost;decoPar(lvl).remove(old);h.ghost=decoGhost(h.it,decoCol(h.it,h.d));decoPar(lvl).add(h.ghost);SFX.play('pluck',{rate:1.3});}
/* pick up the thing under the mouse or finger */
function decoPick(){const o=DECO.hover;if(!o)return;const orig=Object.assign({},o.d);decoRemove(o);decoHold(o.it,'placed',orig);DECO.hover=null;decoSave();}

/* ---- the tray ---- */
function decoCount(it){return it.price===0?Infinity:(DECO.inv[it.id]||0);}
function renderDeco(){
  $('h-deco-coins').textContent='🪙 '+coins().toLocaleString('en-US');
  const tabs=$('h-deco-tabs');tabs.innerHTML='';
  DECO_CATS.forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t[1];b.setAttribute('role','tab');b.setAttribute('aria-selected',t[0]===DECO.tab);
    b.addEventListener('click',()=>{DECO.tab=t[0];DECO.arm=null;renderDeco();});tabs.appendChild(b);});
  const list=$('h-deco-list');list.innerHTML='';
  DECO_ITEMS.filter(it=>it.cat===DECO.tab).forEach(it=>{
    const n=decoCount(it),armed=DECO.arm===it.id,b=document.createElement('button');b.type='button';b.className='h-dc'+(armed?' h-arm':'');
    b.setAttribute('aria-pressed',!!(DECO.held&&DECO.held.it===it));
    const img=document.createElement('img');img.alt='';img.dataset.id=it.id;if(DECO.thumbs[it.id])img.src=DECO.thumbs[it.id];b.appendChild(img);
    const nm=document.createElement('span');nm.textContent=it.name;b.appendChild(nm);
    const sm=document.createElement('small');sm.textContent=it.price===0?'Free':n>0?'You have '+n:armed?'Buy for 🪙 '+it.price+'?':'🪙 '+it.price;b.appendChild(sm);
    b.title=it.price===0?'Free: place as many as you like':n>0?'Click to place one':'Costs '+it.price+' coins';
    b.addEventListener('click',()=>{
      if(n>0){DECO.arm=null;decoHold(it,'inv');renderDeco();return;}
      if(!armed){if(coins()<it.price){toast('You need '+(it.price-coins())+' more coins for the '+it.name);SFX.play('error');return;}DECO.arm=it.id;renderDeco();return;}
      if(!spendCoins(it.price)){toast('Not enough coins yet');return;}
      DECO.inv[it.id]=(DECO.inv[it.id]||0)+1;DECO.arm=null;decoSave();SFX.play('win');toast(it.name+' is yours! Put it anywhere');decoHold(it,'inv');renderDeco();});
    list.appendChild(b);});
  decoTools();if(!DECO.tq)decoThumbsQueue();
}
function decoTools(){
  if(!$('h-deco'))return;const h=DECO.held;
  $('h-d-turn').disabled=!h;$('h-d-col').hidden=!(h&&h.it.colors);$('h-d-place').hidden=!h;$('h-d-away').hidden=!h;
  $('h-d-help').textContent=h?(DECO.touch?'Tap the floor to move it, then Place':'Click to put it down · R turns it · Esc cancels'):(DECO.touch?'Pick something, or tap a thing you placed to move it':'Pick something below, or click a thing you placed to move it');
}
function decoOpen(){
  if(mode!=='walk'||UP.busy)return;DECO.on=true;DECO.lvl=lvl;unlook();$('h-deco').hidden=false;$('h-wrap').classList.add('h-decoing');
  $('h-b-deco').textContent='Done decorating';renderDeco();SFX.play('open');
}
function decoClose(){
  if(!DECO.on)return;decoCancel();DECO.on=false;DECO.arm=null;DECO.hover=null;$('h-deco').hidden=true;$('h-wrap').classList.remove('h-decoing');
  $('h-b-deco').textContent='Decorate';if(decoHoverFp)decoHoverFp.visible=false;SFX.play('close');
}
$('h-b-deco').addEventListener('click',()=>{DECO.on?decoClose():decoOpen();});
$('h-d-done').addEventListener('click',decoClose);
$('h-d-turn').addEventListener('click',()=>decoTurn(1));
$('h-d-col').addEventListener('click',decoRecolour);
$('h-d-place').addEventListener('click',decoPlace);
$('h-d-away').addEventListener('click',decoPutAway);

/* ---- mouse and touch on the room ---- */
const decoUI=t=>t&&t.closest&&t.closest('button,input,#h-deco,.h-over,.h-panel,.h-card');
function decoNdc(e){const r=$('h-view').getBoundingClientRect();DECO.ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);}
$('h-wrap').addEventListener('pointermove',e=>{if(!DECO.on||e.pointerType!=='mouse')return;DECO.touch=false;DECO.mouse=true;decoNdc(e);});
$('h-wrap').addEventListener('pointerdown',e=>{
  if(!DECO.on||decoUI(e.target))return;decoNdc(e);
  if(e.pointerType==='mouse'){DECO.touch=false;DECO.mouse=true;if(e.button===2){decoCancel();return;}if(DECO.held)decoPlace();else decoPick();return;}
  /* a finger: move the held thing there, or pick up what is there */
  DECO.touch=true;DECO.mouse=false;const hit=decoFloor();if(DECO.held){if(hit)DECO.tap=hit;}else{decoHoverUpdate();decoPick();}decoTools();
});
$('h-wrap').addEventListener('contextmenu',e=>{if(DECO.on)e.preventDefault();});
$('h-wrap').addEventListener('wheel',e=>{if(!DECO.on||!DECO.held)return;e.preventDefault();decoTurn(e.deltaY>0?1:-1);},{passive:false});
function decoFloor(){DECO.ray.setFromCamera(DECO.ndc,camera);const o=DECO.ray.ray.origin,d=DECO.ray.ray.direction,y=lvl?lvY(lvl):0;if(d.y>-0.02)return null;const t=(y-o.y)/d.y;if(t<0||t>40)return null;return {x:o.x+d.x*t,z:o.z+d.z*t};}
let decoHoverFp=null;
function decoHoverUpdate(){
  DECO.ray.setFromCamera(DECO.ndc,camera);const gs=DECO.placed.filter(o=>o.lv===lvl).map(o=>o.g),hits=DECO.ray.intersectObjects(gs,true);let o=null;
  for(const h of hits){let p=h.object;while(p&&!(p.userData&&p.userData.deco))p=p.parent;if(p){o=p.userData.deco;break;}}
  DECO.hover=o;
  if(!decoHoverFp){decoHoverFp=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xffc928,transparent:true,opacity:0.35,depthWrite:false,toneMapped:false}));decoHoverFp.rotation.x=-Math.PI/2;decoHoverFp.renderOrder=2;}
  if(o){const b=decoBox(o.it,o.d.x,o.d.z,o.d.r),par=decoPar(lvl);if(decoHoverFp.parent!==par)par.add(decoHoverFp);decoHoverFp.visible=true;decoHoverFp.position.set((b.x0+b.x1)/2,0.025,(b.z0+b.z1)/2);decoHoverFp.scale.set(b.x1-b.x0+0.1,b.z1-b.z0+0.1,1);}
  else decoHoverFp.visible=false;
}

/* ---- little pictures of each thing for the tray, drawn a couple per frame the first time it opens ---- */
const DECO_TH={scene:null,cam:null,rt:null,px:null};
function decoThumbsQueue(){DECO.tq=true;DECO.thumbQ=DECO_ITEMS.map(it=>it.id).filter(id=>!DECO.thumbs[id]);}
function decoThumbStep(){
  const id=DECO.thumbQ.shift();if(!id)return;const it=DECO_ITEMS.by[id],T=DECO_TH,S2=160;
  if(!T.scene){T.scene=new THREE.Scene();T.scene.add(new THREE.HemisphereLight(0xffffff,0x8a7a6a,1.0));const l=new THREE.DirectionalLight(0xffffff,0.8);l.position.set(2,4,3);T.scene.add(l);
    T.cam=new THREE.PerspectiveCamera(30,1,0.05,60);T.rt=new THREE.WebGLRenderTarget(S2,S2);T.rt.texture.encoding=THREE.sRGBEncoding;T.px=new Uint8Array(S2*S2*4);}
  const g=it.build(decoCol(it,{c:0}));T.scene.add(g);const box3=new THREE.Box3().setFromObject(g),c=box3.getCenter(new THREE.Vector3()),sz=box3.getSize(new THREE.Vector3());
  const r=Math.max(0.25,Math.max(sz.x,sz.y,sz.z)*0.62),dir=new THREE.Vector3(0.9,it.flat?2.2:0.75,1.4).normalize();T.cam.position.copy(c).addScaledVector(dir,r/Math.sin(15*Math.PI/180)*0.95);T.cam.lookAt(c);
  const prevT=renderer.getRenderTarget(),cc=new THREE.Color();renderer.getClearColor(cc);const ca=renderer.getClearAlpha(),env=T.scene.environment;
  renderer.setClearColor(0x000000,0);renderer.setRenderTarget(T.rt);renderer.clear();renderer.render(T.scene,T.cam);renderer.readRenderTargetPixels(T.rt,0,0,S2,S2,T.px);renderer.setRenderTarget(prevT);renderer.setClearColor(cc,ca);
  T.scene.remove(g);g.traverse(m=>{if(m.geometry)m.geometry.dispose();});
  const cv=document.createElement('canvas');cv.width=cv.height=S2;const x=cv.getContext('2d'),im=x.createImageData(S2,S2);
  for(let y=0;y<S2;y++)im.data.set(T.px.subarray((S2-1-y)*S2*4,(S2-y)*S2*4),y*S2*4);x.putImageData(im,0,0);
  DECO.thumbs[id]=cv.toDataURL();document.querySelectorAll('#h-deco-list img[data-id="'+id+'"]').forEach(i=>i.src=DECO.thumbs[id]);
}

/* ---- every frame ---- */
function decoTick(dt,t){
  /* things that move (only in the base you are in) */
  DECO.placed.forEach(o=>{if(o.lv===lvl&&o.it.tick)o.it.tick(o.g,t,dt);});
  /* the trampoline */
  const hp=DECO.hop;if(hp&&avatar){if(!hp.on){hp.on=true;if(hp.o.col)hp.o.col.off=true;P.x=hp.o.d.x;P.z=hp.o.d.z;}hp.t+=dt;const k=hp.t/0.55,y=Math.abs(Math.sin(k*Math.PI))*(0.9-k*0.12);avatar.g.position.y+=0.35+y;const m=hp.o.g.userData.mat;if(m)m.position.y=0.345-Math.max(0,0.12-y)*0.6;
    if(hp.t===dt||Math.floor((hp.t-dt)/0.55)!==Math.floor(hp.t/0.55))SFX.play('hop',{rate:0.8+Math.random()*0.3});
    if(hp.t>2.2){DECO.hop=null;if(hp.o.col)hp.o.col.off=false;const a=hp.o.d.r*Math.PI/4,f=hp.o.it.d/2+0.5;P.x=hp.o.d.x+Math.sin(a)*f;P.z=hp.o.d.z+Math.cos(a)*f;if(m)m.position.y=0.345;toast('Boing!');}}
  /* while decorating you are the camera: your character steps out of view so the floor is clear */
  if(avatar&&avatar.g.visible===DECO.on&&!DECO.hop)avatar.g.visible=!DECO.on;
  if(!DECO.on)return;
  if(DECO.lvl!==lvl){decoClose();return;}
  if(DECO.thumbQ.length){try{decoThumbStep();}catch(e){console.error('thumbnail failed',e);}}
  const h=DECO.held;
  if(h){
    /* follow the mouse, the last tap, or a spot in front of you */
    let p=null;if(DECO.mouse)p=decoFloor();else if(DECO.tap)p=DECO.tap;
    if(p){h.d.x=Math.round(p.x*4)/4;h.d.z=Math.round(p.z*4)/4;}
    h.ok=decoFits(h.it,h.d.x,h.d.z,h.d.r);
    const gh=h.ghost,b=decoBox(h.it,h.d.x,h.d.z,h.d.r),fp=gh.userData.fp;gh.position.set(h.d.x,0,h.d.z);gh.userData.g.rotation.y=h.d.r*Math.PI/4;
    fp.position.set(0,0.02,0);fp.scale.set(b.x1-b.x0,b.z1-b.z0,1);fp.material.color.setHex(h.ok?0x2fd08a:0xff4d6d);
    if(decoHoverFp)decoHoverFp.visible=false;
  }else if(DECO.mouse)decoHoverUpdate();
}
