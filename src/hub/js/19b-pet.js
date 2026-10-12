/* ---------- Pixel, the basement dog ---------- */
/* Needs the animal models (served page only). Wanders the open floor, trots over to you when you are close,
   has a food bowl under the south window, and can be petted. */
const PET={a:null,x:2.5,z:4.5,h:0,state:'rest',t:2,tx:0,tz:0,mv:0,bowl:{x:-1.3,z:7.25},barkT:0,petted:0};
{
  /* bowl: always there, so the corner looks lived-in even without the dog */
  const bm=S(0xd2453b,0.5),fm=S(0x8a5a34,0.9);
  cyl(0.15,0.12,0.07,bm,PET.bowl.x,0.035,PET.bowl.z,null,14);cyl(0.12,0.12,0.02,fm,PET.bowl.x,0.065,PET.bowl.z,null,14);
  const file='characters/animals/Husky.glb';
  GFX.preload(file,()=>{
    const a=GFX.actor(file,{height:0.78});if(!a)return;
    a.g.add(nameTag('Pixel',0.98,'#ffe9a8'));a.g.children[a.g.children.length-1].scale.set(0.42,0.105,1);
    scene.add(a.g);PET.a=a;
    PET.thing={x:0,z:0,r:1.1,text:'Pet Pixel',fn:petPet};things.push(PET.thing);
  });
}
/* the open floor Pixel likes to wander between */
const PET_SPOTS=[[2.5,4.5],[0.5,2.5],[-2.5,3.8],[-3.2,0.5],[1.5,-1.5],[4.5,1.5],[6.5,4.8],[-1.3,6.5],[3.5,-3.8],[-5.2,-3.2]];
function petBark(n){for(let i=0;i<(n||2);i++){SFX.blip(330,190,0.11,'square',0.05,{delay:i*0.22});SFX.blip(660,380,0.06,'triangle',0.03,{delay:i*0.22});}}
function petPet(){
  const p=PET;if(!p.a)return;
  p.state='happy';p.t=2.2;p.h=Math.atan2(P.x-p.x,P.z-p.z);p.petted++;
  p.a.once('dance');petBark(3);
  toast(['Pixel wags happily','Pixel rolls over for belly rubs','Good dog!','Pixel gives you a big lick'][p.petted%4]);
}
/* keeps Pixel out of furniture the same way you are kept out */
function petPush(r){
  const p=PET;p.x=Math.max(-RX+0.4,Math.min(RX-0.4,p.x));p.z=Math.max(-RZ+0.4,Math.min(RZ-0.4,p.z));
  for(const b of colliders){if(b.off)continue;const cx=Math.max(b.x0,Math.min(b.x1,p.x)),cz=Math.max(b.z0,Math.min(b.z1,p.z)),dx=p.x-cx,dz=p.z-cz,d=Math.hypot(dx,dz);
    if(d<r){if(d>0.0001){p.x=cx+dx/d*r;p.z=cz+dz/d*r;}else{p.x+=r;}}}
}
function petTick(dt){
  const p=PET,a=p.a;if(!a)return;
  /* the "Pet Pixel" prompt follows the dog around */
  p.thing.x=p.x;p.thing.z=p.z;
  const dP=Math.hypot(P.x-p.x,P.z-p.z),inBasement=P.x>-10.9;
  p.t-=dt;if(p.barkT>0)p.barkT-=dt;
  if(p.state!=='happy'){
    if(inBasement&&mode==='walk'&&dP<4.5&&dP>1.6&&P.move>0.3&&p.state!=='eat'){p.state='follow';}
    if(p.state==='follow'){p.tx=P.x-Math.sin(P.h)*1.1;p.tz=P.z-Math.cos(P.h)*1.1;if(dP>6||P.move<0.1&&dP<1.8){p.state='rest';p.t=2+Math.random()*3;}}
    else if(p.t<=0){
      if(p.state==='walk'||p.state==='rest'){
        if(Math.random()<0.25){p.state='bowl';p.tx=p.bowl.x;p.tz=p.bowl.z-0.45;}
        else{const s=PET_SPOTS[Math.floor(Math.random()*PET_SPOTS.length)];p.state='walk';p.tx=s[0]+(Math.random()-0.5);p.tz=s[1]+(Math.random()-0.5);}
        p.t=12;}
      else{p.state='rest';p.t=3+Math.random()*4;}
    }
  }else if(p.t<=0){p.state='rest';p.t=2;}
  let want=0,anim='idle';
  if(p.state==='walk'||p.state==='bowl'||p.state==='follow'){
    const dx=p.tx-p.x,dz=p.tz-p.z,d=Math.hypot(dx,dz);
    if(d<0.25){if(p.state==='bowl'){p.state='eat';p.t=4;p.h=0;}else if(p.state==='walk'){p.state='rest';p.t=2+Math.random()*4;}}
    else{const sp=p.state==='follow'&&d>2.5?3.2:1.1;want=1;const h=Math.atan2(dx,dz),dh=Math.atan2(Math.sin(h-p.h),Math.cos(h-p.h));p.h+=Math.max(-6*dt,Math.min(6*dt,dh));
      const s=Math.min(sp*dt,d)*Math.max(0,Math.cos(dh));p.x+=Math.sin(p.h)*s;p.z+=Math.cos(p.h)*s;anim=sp>2?'run':'walk';}
  }
  if(p.state==='eat'){anim='Eating';}
  if(p.state==='follow'&&dP<4&&!(p.barkT>0)&&Math.random()<dt*0.15){p.barkT=6;petBark(2);}
  petPush(0.32);
  p.mv+=(want-p.mv)*Math.min(1,dt*8);
  a.g.position.set(p.x,0,p.z);a.g.rotation.y=p.h;
  if(p.state!=='happy')a.state(anim);a.speed(anim==='walk'?1.1:1);a.update(dt);
}
