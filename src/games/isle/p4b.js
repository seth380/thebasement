/* ---------- player, input, loop ---------- */
const view=$('view'),keys={};
const P={x:0,z:51,y:0,vy:0};let yaw=0,pitch=0,locked=false,noLock=false,wasLocked=false,jx=0,jy=0,touchLook=null,bob=0,time=0,stepT=0,hot=null,mouseX=0,mouseY=0;
if(F.pos){P.x=F.pos[0];P.z=F.pos[1];yaw=F.pos[2]||0;}
function groundY(x,z){let h=H(x,z);if(x>PIER.x0&&x<PIER.x1&&z>PIER.z0&&z<PIER.z1)h=Math.max(h,PIER.y);return h;}
function blocked(x,z){if(x>PIER.x0-0.2&&x<PIER.x1+0.6&&z>PIER.z0&&z<PIER.z1)return false;return H(x,z)<-0.28;}
function collide(){
  const r=0.38;
  for(const c of cols){if(c.off)continue;
    if(c.r!==undefined){const dx=P.x-c.x,dz=P.z-c.z,d=Math.hypot(dx,dz),m=c.r+r;if(d<m&&d>1e-4){P.x=c.x+dx/d*m;P.z=c.z+dz/d*m;}}
    else{const qx=clamp(P.x,c.x0,c.x1),qz=clamp(P.z,c.z0,c.z1),dx=P.x-qx,dz=P.z-qz,d=Math.hypot(dx,dz);if(d>=r)continue;
      if(d>1e-4){P.x=qx+dx/d*r;P.z=qz+dz/d*r;}else{const l=P.x-c.x0,rr=c.x1-P.x,t=P.z-c.z0,b=c.z1-P.z,m=Math.min(l,rr,t,b);if(m===l)P.x=c.x0-r;else if(m===rr)P.x=c.x1+r;else if(m===t)P.z=c.z0-r;else P.z=c.z1+r;}}}
}
function lock(){if(noLock||!view.requestPointerLock){noLock=true;return;}try{const p=view.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(e){}}
document.addEventListener('pointerlockchange',()=>{if(!view.isConnected)return;locked=document.pointerLockElement===view;if(locked)wasLocked=true;$('lockhint').hidden=locked||coarse||state!=='play'||panelOpen;});
document.addEventListener('pointerlockerror',()=>{if(!view.isConnected||wasLocked)return;noLock=true;$('lockhint').textContent='Move the mouse toward an edge to turn';$('lockhint').hidden=false;});
function use(){if(state!=='play'||panelOpen)return;if(hot){hot.use();}}
const KEYS={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowLeft:'left',ArrowRight:'right',ArrowUp:'w',ArrowDown:'s',ShiftLeft:'run',ShiftRight:'run'};
window.addEventListener('keydown',e=>{
  if(state==='menu'){if(e.code==='Enter'&&!e.repeat){e.preventDefault();start();}return;}
  if(e.target&&e.target.tagName==='INPUT')return;
  if(panelOpen){if(e.code==='KeyE'||e.code==='KeyJ'){e.preventDefault();closePanel();}return;}
  if(KEYS[e.code]){keys[KEYS[e.code]]=true;e.preventDefault();return;}
  if(e.repeat)return;
  if(e.code==='KeyE'||e.code==='Space'||e.code==='Enter'){e.preventDefault();use();}
  else if(e.code==='KeyJ')openJournal();
});
window.addEventListener('keyup',e=>{if(KEYS[e.code])keys[KEYS[e.code]]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
window.addEventListener('mousemove',e=>{if(state!=='play'||panelOpen)return;
  if(locked){yaw-=e.movementX*0.0021;pitch=clamp(pitch-e.movementY*0.0021,-1.35,1.35);}
  else{const r=view.getBoundingClientRect();mouseX=((e.clientX-r.left)/r.width)*2-1;mouseY=((e.clientY-r.top)/r.height)*2-1;}});
view.addEventListener('mousedown',e=>{if(state!=='play'||coarse||panelOpen)return;e.preventDefault();if(!locked&&!noLock){lock();return;}if(e.button===0)use();});
view.addEventListener('contextmenu',e=>e.preventDefault());
view.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||state!=='play')return;touchLook={id:e.pointerId,x:e.clientX,y:e.clientY};});
view.addEventListener('pointermove',e=>{if(!touchLook||e.pointerId!==touchLook.id)return;yaw-=(e.clientX-touchLook.x)*0.005;pitch=clamp(pitch-(e.clientY-touchLook.y)*0.004,-1.35,1.35);touchLook.x=e.clientX;touchLook.y=e.clientY;});
['pointerup','pointercancel'].forEach(n=>view.addEventListener(n,e=>{if(touchLook&&e.pointerId===touchLook.id)touchLook=null;}));
{const st=$('stick'),kn=$('knob');let id=null;
  const mv=e=>{const r=st.getBoundingClientRect();let dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}jx=dx;jy=dy;kn.style.transform='translate('+dx*33+'px,'+dy*33+'px)';};
  st.addEventListener('pointerdown',e=>{e.preventDefault();id=e.pointerId;try{st.setPointerCapture(id);}catch(x){}mv(e);});
  st.addEventListener('pointermove',e=>{if(e.pointerId===id)mv(e);});
  ['pointerup','pointercancel'].forEach(n=>st.addEventListener(n,()=>{id=null;jx=jy=0;kn.style.transform='';}));
  $('tuse').addEventListener('pointerdown',e=>{e.preventDefault();use();});}
$('bjournal').addEventListener('click',openJournal);

function resize(){const w=$('game').clientWidth,h=$('game').clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=camera.aspect<1?80:66;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);resize();
const fwd=new THREE.Vector3(),tv=new THREE.Vector3(),lerpTo=(o,k,v,r)=>{o[k]+=(v-o[k])*r;};
let last=performance.now(),saveT=0,powK=F.power?1:0;
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;time+=dt;
  const play=state==='play';
  if(play&&!panelOpen){
    if(noLock&&!coarse){const ax=Math.abs(mouseX)>0.3?mouseX:0,ay=Math.abs(mouseY)>0.35?mouseY:0;yaw-=ax*Math.abs(ax)*2*dt;pitch=clamp(pitch-ay*Math.abs(ay)*1.2*dt,-1.35,1.35);}
    yaw+=((keys.left?1:0)-(keys.right?1:0))*1.7*dt;
    let f=(keys.w?1:0)-(keys.s?1:0)-jy,r=(keys.d?1:0)-(keys.a?1:0)+jx;const l=Math.hypot(f,r);if(l>1){f/=l;r/=l;}
    const sp=(keys.run?5.6:3.3)*(1-smooth(-0.1,-0.28,H(P.x,P.z))*0.5),ox=P.x,oz=P.z;
    P.x+=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*sp*dt;P.z+=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*sp*dt;collide();
    if(blocked(P.x,P.z)){if(!blocked(P.x,oz))P.z=oz;else if(!blocked(ox,P.z))P.x=ox;else{P.x=ox;P.z=oz;}}
    const moved=Math.hypot(P.x-ox,P.z-oz);bob+=moved*2.1;stepT+=moved;if(stepT>1.7){stepT=0;rumble(P.x>PIER.x0&&P.x<PIER.x1&&P.z>PIER.z0&&P.z<PIER.z1?900:420,0.09,0.09);}
    saveT+=dt;if(saveT>4){saveT=0;F.pos=[+P.x.toFixed(1),+P.z.toFixed(1),+yaw.toFixed(2)];save();}
  }
  const gy=groundY(P.x,P.z);P.y+=(gy-P.y)*Math.min(1,dt*12);
  if(state==='menu'){const a=time*0.05;camera.position.set(Math.cos(a)*30,PADS[1].h+7+Math.sin(time*0.2),-8+Math.sin(a)*30);camera.lookAt(0,PADS[1].h+2,-8);}
  else{camera.position.set(P.x,P.y+EYE+Math.sin(bob)*0.035,P.z);camera.rotation.set(pitch,yaw,0);}
  /* what the ring is on */
  hot=null;
  if(play&&!panelOpen){camera.getWorldDirection(fwd);let best=1e9;for(const it of ITEMS){if(it.cond&&!it.cond())continue;tv.copy(it.p).sub(camera.position);const d=tv.length();if(d>3.9)continue;const along=tv.dot(fwd);if(along<0.2)continue;const off=Math.sqrt(Math.max(0,d*d-along*along));if(off<it.r*(coarse?1.4:1)&&d<best){const lb=it.label();if(lb){best=d;hot=it;hot._l=lb;}}}}
  $('ret').className=hot?'hot':'';const pr=hot?hot._l+(coarse?'':'  ·  E'):'';if($('prompt').textContent!==pr)$('prompt').textContent=pr;

  /* the world moving on its own */
  T.wnorm.offset.x=time*0.006;T.wnorm.offset.y=time*0.011;
  powK+=((F.power?1:0)-powK)*Math.min(1,dt*0.9);
  lamps.forEach((l,i)=>{const k=powK*(0.92+Math.sin(time*7+i*2)*0.04);l.gl.material.emissiveIntensity=k*2.2;l.halo.material.opacity=k*0.5;});
  pLights.forEach(l=>l.intensity=powK*1.3);
  const fl=scene.userData.fly;fl[0].rotation.x+=dt*powK*9;
  pillars.forEach(p=>{p.top.rotation.y+=(p.target-p.top.rotation.y)*Math.min(1,dt*4);});
  const th=PADS[2].h,lh=PADS[3].h;
  lerpTo(temple.door.position,'y',th+(F.pillars?-1.75:1.6),Math.min(1,dt*0.9));
  lerpTo(lab.door.position,'z',F.power?1.75:0,Math.min(1,dt*1.5));lab.doorCol.off=F.power;
  lerpTo(temple.lid.position,'x',F.vault?1.2:0,Math.min(1,dt*1.2));temple.key.visible=!!F.vault&&!F.key;
  temple.lens.visible=F.lens;temple.lens.rotation.y+=dt;lab.crystal.visible=!!F.ready&&!F.crystal;lab.crystal.rotation.y+=dt;
  lab.liq.forEach((m,i)=>{const s=Math.max(0.02,F.vals[i]/40*1.4);m.scale.y+=(s-m.scale.y)*Math.min(1,dt*5);m.position.y=lh+1.2+m.scale.y/2;m.material.emissiveIntensity=F.ready?1.1:0.35*powK;});
  temple.fire.forEach((f,i)=>{f.scale.set(1+Math.sin(time*11+i)*0.12,1+Math.sin(time*13+i*2)*0.2,1);});temple.light.intensity=1.0+Math.sin(time*9)*0.12+Math.sin(time*23)*0.06+(F.lens?0.5:0);
  lerpTo(tower.door.rotation,'y',F.door?-1.9:0,Math.min(1,dt*1.5));lerpTo(tower.lever.rotation,'z',F.beacon?-0.7:0.7,Math.min(1,dt*3));
  if(F.beacon){tower.beams.visible=true;tower.beams.rotation.y+=dt*0.55;tower.bulb.material.emissiveIntensity+=(4-tower.bulb.material.emissiveIntensity)*dt;tower.light.intensity+=(2.2-tower.light.intensity)*dt;}
  scene.fog.density+=((F.beacon?0.0065:fogGoal)-scene.fog.density)*Math.min(1,dt*0.25);
  if(endT>0){endT-=dt;if(endT<=0&&state==='play'){$('endtext').textContent='The beam sweeps the water and the fog pulls back from it. Out past the reef you can see open sea, and the way home. You found '+F.notes.length+' of '+NOTES.length+' writings.';$('results').hidden=false;panelOpen=true;try{document.exitPointerLock();}catch(e){}}}
  const mp=mgeo.attributes.position;for(let i=0;i<NM;i++){let x=mp.getX(i)+Math.sin(time*0.3+i)*dt*0.25,y=mp.getY(i)+Math.sin(time*0.5+i*1.7)*dt*0.12,z=mp.getZ(i)+Math.cos(time*0.27+i)*dt*0.25;
    if(x-camera.position.x>20)x-=40;if(x-camera.position.x<-20)x+=40;if(z-camera.position.z>20)z-=40;if(z-camera.position.z<-20)z+=40;mp.setXYZ(i,x,y,z);}mp.needsUpdate=true;
  sunL.target.position.set(camera.position.x,0,camera.position.z);sunL.position.set(camera.position.x-60,62,camera.position.z+22);
  if(ac&&windG){const shore=smooth(30,58,Math.hypot(P.x,P.z));windG.gain.value=0.05+Math.sin(time*0.23)*0.02+Math.sin(time*0.61)*0.012;seaG.gain.value=(0.012+shore*0.05)*(0.6+0.4*Math.sin(time*0.7));
    humG.gain.value=powK*0.05*(1-smooth(4,22,Math.hypot(P.x+44,P.z-3.5)));}
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}

/* ---------- flow ---------- */
function start(){initAudio();state='play';panelOpen=false;$('menu').hidden=true;$('results').hidden=true;$('panel').hidden=true;$('hud').hidden=false;bag();if(!coarse)lock();
  if(!F.notes.length&&!F.power)setTimeout(()=>say('Cold sand, and fog in every direction. There is a page on the crate by your boat.'),1200);}
function menu(){state='menu';panelOpen=false;$('hud').hidden=true;$('results').hidden=true;$('panel').hidden=true;$('menu').hidden=false;try{document.exitPointerLock();}catch(e){}
  const n=[F.power,F.pillars,F.crystal||F.lens,F.vault,F.beacon].filter(Boolean).length;$('saveline').textContent=n||F.notes.length?'Your progress is saved: '+n+' of 5 mechanisms solved.':'';$('wipe').hidden=!(n||F.notes.length);$('start').textContent=n||F.notes.length?'Return to the island':'Step ashore';}
$('start').addEventListener('click',start);
$('again').addEventListener('click',()=>{$('results').hidden=true;panelOpen=false;endT=0;if(!coarse)lock();});
$('change').addEventListener('click',menu);
$('wipe').addEventListener('click',()=>{try{localStorage.setItem('isle-save','{}');}catch(e){}F={power:false,pillars:false,dirs:[6,2,4,7],dials:[1,3,0],vals:[5,25,15],crystal:false,lens:false,key:false,door:false,beacon:false,notes:[]};
  P.x=0;P.z=51;yaw=0;pitch=0;pillars.forEach((p,i)=>{p.target=-F.dirs[i]*Math.PI/4;});temple.doorCol.off=false;setDials3D();fogGoal=0.03;tower.beams.visible=false;tower.bulb.material.emissiveIntensity=0;tower.light.intensity=0;menu();});
P.y=groundY(P.x,P.z);setDials3D();menu();
requestAnimationFrame(frame);
