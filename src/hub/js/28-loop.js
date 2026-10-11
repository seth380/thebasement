/* ---------- loop ---------- */
function resize(){const w=$('h-wrap').clientWidth,h=$('h-wrap').clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=camera.aspect<1?74:58;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);
const camT=new THREE.Vector3(),lookT=new THREE.Vector3(),look=new THREE.Vector3();
let camSnap=true,last=performance.now(),tvT=0,tvTick=0;
function collide(){
  const r=0.3;
  const inDoor=sec.open&&P.z>SZ0+0.3&&P.z<SZ1-0.3;
  if(P.x<-RX+0.38&&(inDoor||P.x<-RX)){
    if(P.x>CAVE.x+CAVE.r-0.25)P.z=Math.max(SZ0+0.34,Math.min(SZ1-0.34,P.z));
    else{let dx=P.x-CAVE.x,dz=P.z-CAVE.z,d=Math.hypot(dx,dz);if(d>CAVE.r){P.x=CAVE.x+dx/d*CAVE.r;P.z=CAVE.z+dz/d*CAVE.r;}
      [[CAVE.x-2.9,CAVE.z,2.5],[sec.cx,sec.cz,0.75]].forEach(c=>{dx=P.x-c[0];dz=P.z-c[1];d=Math.hypot(dx,dz);if(d<c[2]&&d>0.001){P.x=c[0]+dx/d*c[2];P.z=c[1]+dz/d*c[2];}});}
    if(P.x<-RX)return;
  }else{P.x=Math.max(-RX+0.38,Math.min(RX-0.38,P.x));P.z=Math.max(-RZ+0.38,Math.min(RZ-0.38,P.z));}
  for(const n of npcs){if(n.pose==='sit')continue;const dx=P.x-n.x,dz=P.z-n.z,d=Math.hypot(dx,dz);if(d<0.6&&d>0.001){P.x=n.x+dx/d*0.6;P.z=n.z+dz/d*0.6;}}
  for(const b of colliders){
    if(b.off)continue;
    const cx=Math.max(b.x0,Math.min(b.x1,P.x)),cz=Math.max(b.z0,Math.min(b.z1,P.z));let dx=P.x-cx,dz=P.z-cz;const d=Math.hypot(dx,dz);
    if(d>=r)continue;
    if(d>0.0001){P.x=cx+dx/d*r;P.z=cz+dz/d*r;}
    else{const l=P.x-b.x0,rr=b.x1-P.x,t=P.z-b.z0,bt=b.z1-P.z,m=Math.min(l,rr,t,bt);
      if(m===l)P.x=b.x0-r;else if(m===rr)P.x=b.x1+r;else if(m===t)P.z=b.z0-r;else P.z=b.z1+r;}
  }
}
function frame(now){
  if(mode==='game')return;
  const dt=Math.min(0.05,(now-last)/1000);last=now;tvT+=dt;
  let fwd=0,turn=0;
  if(mode==='walk'&&!modal()){
    fwd=(keys.up?1:0)-(keys.down?1:0)-jy;turn=(keys.left?1:0)-(keys.right?1:0)-jx;
    fwd=Math.max(-1,Math.min(1,fwd));turn=Math.max(-1,Math.min(1,turn));
    if(Math.abs(fwd)<0.15)fwd=0;if(Math.abs(turn)<0.15)turn=0;
    P.h+=turn*2.5*dt;const sp=fwd>0?3.3:1.8;
    P.x+=Math.sin(P.h)*fwd*sp*dt;P.z+=Math.cos(P.h)*fwd*sp*dt;collide();
  }
  P.move+=((fwd?1:0)-P.move)*Math.min(1,dt*10);P.phase+=dt*9*(fwd<0?-0.7:1);
  const a=avatar,sitting=mode==='sit';
  sitY+=((sitting?sitLift(a):0)-sitY)*Math.min(1,dt*10);
  const fy=floorY(P.x);a.g.position.set(P.x,fy+sitY+(a.actor?0:Math.abs(Math.sin(P.phase))*0.025*P.move),P.z);a.g.rotation.y=P.h;
  animateBody(a,dt,P.move,sitting?'sit':'walk',tvT,P.phase);
  if(a.head){a.head.rotation.y=mode==='custom'?Math.sin(tvT*0.8)*0.25:0;a.head.position.y=1.14+Math.sin(tvT*2)*0.004;}

  /* camera */
  const fx=Math.sin(P.h),fz=Math.cos(P.h);
  if(mode==='custom'){camT.set(P.x+fx*2.5+fz*0.5,1.35,P.z+fz*2.5-fx*0.5);lookT.set(P.x,0.95,P.z);}
  else if(sitting){camT.set(-5.05,1.95,2.0);lookT.set(-11,1.25,2);}
  else{camT.set(P.x-fx*3.5,2.05,P.z-fz*3.5);lookT.set(P.x+fx*0.8,1.05,P.z+fz*0.8);}
  if(P.x>-10.9||mode!=='walk'){camT.x=Math.max(-RX+0.35,Math.min(RX-0.35,camT.x));camT.z=Math.max(-RZ+0.35,Math.min(RZ-0.35,camT.z));}
  else{camT.x=Math.max(-30.5,Math.min(-10.4,camT.x));
    if(camT.x>CAVE.x+CAVE.r-0.2)camT.z=Math.max(SZ0+0.3,Math.min(SZ1-0.3,camT.z));else{const dx=camT.x-CAVE.x,dz=camT.z-CAVE.z,d=Math.hypot(dx,dz);if(d>CAVE.r+0.3){camT.x=CAVE.x+dx/d*(CAVE.r+0.3);camT.z=CAVE.z+dz/d*(CAVE.r+0.3);}}
    camT.y=floorY(camT.x)+(camT.x>CAVE.x+CAVE.r?1.75:2.3);lookT.y+=fy;}
  const k=camSnap?1:1-Math.exp(-4.5*dt);camSnap=false;
  camera.position.lerp(camT,k);look.lerp(lookT,k);camera.lookAt(look);

  /* what is in reach */
  near=null;
  if(mode==='walk'){let bd=1e9;for(const t of things){if(t.cond&&!t.cond())continue;const d=Math.hypot(P.x-t.x,P.z-t.z);if(d<t.r&&d<bd){bd=d;near=t;}}
    for(const n of npcs){const d=Math.hypot(P.x-n.x,P.z-n.z);if(d<1.25&&d<bd+0.4){bd=d;near={text:'Talk to '+n.name,fn:()=>npcTalk(n)};}}}
  const pt=mode==='sit'?'Stand up':near?(typeof near.text==='function'?near.text():near.text):'';
  const pe=$('h-prompt');if(pt&&!modal()){pe.hidden=false;const full=(coarse?'':'E  ·  ')+pt;if(pe.textContent!==full)pe.textContent=full;}else pe.hidden=true;

  tvTick-=dt;if(tvTick<=0){tvTick=0.25;tvTex.userData.go(tvT);}
  updateWorld(dt);animate(dt,tvT);xmasTick(dt);secTick(dt,tvT);npcTick(dt,tvT);if(FB.on)fbTick(dt);if(PL.on)plTick(dt);
  clockTick-=dt;if(clockTick<=0){clockTick=2;clockTex.userData.go();}
  tvL.intensity=0.5+Math.sin(tvT*3.1)*0.06;neonL.intensity=1.0+Math.sin(tvT*17)*0.04;aqL.intensity=0.9+Math.sin(tvT*1.7)*0.06;
  if(toastT>0){toastT-=dt;if(toastT<=0)$('h-toast').textContent='';}
  netFrame(dt);hubAudioTick(dt);
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}

buildAvatar();resize();refreshTrophies(false);
if(firstRun)openCustom(true);
if(document.fonts&&document.fonts.load)document.fonts.load('40px "Lilita One"').then(()=>redraws.forEach(f=>f())).catch(()=>{});
requestAnimationFrame(frame);
