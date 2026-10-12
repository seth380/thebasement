/* ---------- friends in the basement ---------- */
const npcs=[];
function npcMake(name,kind,head,color,lines,route,model){
  const look={name:name,species:Math.max(0,SPECIES.findIndex(s=>s.kind===kind)),color:color,hat:0};
  const b=makeAvatarModel(look,{tagColor:'#ffe9a8'});scene.add(b.g);
  const n={name:name,model:model,look:look,b:b,x:0,z:0,h:0,lines:lines,route:route,i:0,wait:0,pose:'walk',face:0,phase:rnd()*6,walk:0,mv:0,said:0};
  if(route){n.x=route[0][0];n.z=route[0][1];}npcs.push(n);return n;
}
/* each NPC asks for its own model (a person, a mech, a panda, an alien); without that file it borrows a mech from assets/models/npcs.
   They stay critters until the model loads */
function npcReskin(n,m){
  GFX.preload(m.file,()=>{
    const nb=makeAvatarModel(Object.assign({},n.look,{model:m.id}),{tagColor:'#ffe9a8',height:m.height||1.55});if(!nb.actor)return;
    scene.remove(n.b.g);n.b=nb;scene.add(nb.g);
    /* a model that cannot sit gets up off the couch: it watches TV from behind it and strolls around instead */
    if(n.pose==='sit'&&!nb.actor.has('sit')){const W=-Math.PI/2;n.route=[[-3.6,1.4],[-3.6,2.6,W,10,'look'],[-2.2,4.6],[0.4,4.4,0,5,'look'],[-2.2,4.6]];n.i=0;n.x=-3.6;n.z=1.4;n.pose='walk';}
  });
}
{
  const N=Math.PI,W=-Math.PI/2,Sx=0;
  npcMake('Pepper','cat',0x9aa3b5,0x7b5cff,['This couch is the best seat in the house.','Have you beaten my kart time yet?','Winner picks the next game. Basement rules.'],null,'characters-modular-men-casual-hoodie');
  npcMake('Biscuit','bear',0xb5733c,0xff7a1a,['The orange rings in Cloudtop Run give you a boost.','I keep losing at checkers. Do not tell anyone.','The fish like it when you feed them.'],
    [[0,-5.2],[1.15,-6.25,N,9,'play'],[0,-5.2],[-6.5,-5.2],[-8.6,-6.3,N,6,'look'],[-6.5,-5.2],[-6.5,-1.5],[-4.9,-1.2],[-5.2,3.0,W,7,'look'],[-4.9,-1.2],[-2,-1]],'npcs-mechs-leela');
  npcMake('Clover','bunny',0xf4efe6,0xff5fa2,['Flick up-left for a kickflip. It took me ages to learn.','Want to play pool later?','The Warehouse has a huge bank on the east wall.'],
    [[-2,-1],[3.2,-0.5],[6.4,-0.75,N,6,'look'],[3.2,-0.5],[3.2,2.8],[5.4,3.75,Sx,6,'look'],[3.2,2.8],[0,3.2],[1.2,4.1,Sx,5,'look'],[0,3.2]],'characters-monsters-panda');
  npcMake('Moss','frog',0x7ddc4a,0x1fc46b,['Mudwalkers got me on wave four.','Auto-fire is my secret weapon.','I am reading every book on that shelf. Slowly.'],
    [[-3.45,-6.25,N,13,'play'],[-3.45,-5],[-6.5,-5.2],[-6.5,-1.5],[-9.9,-4.5,W,7,'look'],[-6.5,-1.5],[-6.5,-5.2],[-3.45,-5]],'characters-monsters-cactus');
  const p=npcs[0];p.x=-6.62;p.z=2.86;p.h=W;p.pose='sit';
  const NM=GFX.roster.npcs;npcs.forEach((n,i)=>{const m=modelFor(n.model)||(NM.length?NM[i%NM.length]:null);if(m)npcReskin(n,m);});
}
function npcTick(dt,t){
  npcs.forEach(n=>{
    const b=n.b;
    if(n.pose==='sit'){
      /* a model with no sitting animation stands behind the couch and watches TV instead */
      if(b.actor&&!b.actor.has('sit')){b.g.position.set(-6.1,0,4.35);b.g.rotation.y=n.h;animateBody(b,dt,0,'look',t,n.phase);return;}
      b.g.position.set(n.x,sitLift(b),n.z);b.g.rotation.y=n.h;animateBody(b,dt,0,'sit',t,n.phase);
      if(b.head)b.head.rotation.y=Math.sin(t*0.4+n.phase)*0.25;return;}
    const st=n.route[n.i];
    if(n.wait>0){n.wait-=dt;n.mv+=(0-n.mv)*Math.min(1,dt*8);const d=Math.atan2(Math.sin(n.face-n.h),Math.cos(n.face-n.h));n.h+=Math.max(-4*dt,Math.min(4*dt,d));if(n.wait<=0){n.pose='walk';n.i=(n.i+1)%n.route.length;}}
    else{const dx=st[0]-n.x,dz=st[1]-n.z,d=Math.hypot(dx,dz);
      if(d<0.08){if(st.length>2){n.wait=st[3];n.face=st[2];n.pose=st[4];}else n.i=(n.i+1)%n.route.length;}
      else{const near=Math.hypot(P.x-n.x,P.z-n.z)<0.95&&(dx*(P.x-n.x)+dz*(P.z-n.z))>0;const want=Math.atan2(dx,dz),dh=Math.atan2(Math.sin(want-n.h),Math.cos(want-n.h));n.h+=Math.max(-5*dt,Math.min(5*dt,dh));
        if(!near&&Math.abs(dh)<0.9){const sp=Math.min(1.5*dt,d);n.x+=dx/d*sp;n.z+=dz/d*sp;n.mv+=(1-n.mv)*Math.min(1,dt*8);}else n.mv+=(0-n.mv)*Math.min(1,dt*8);}}
    n.walk+=dt*8*n.mv;
    b.g.position.set(n.x,b.actor?0:Math.abs(Math.sin(n.walk))*0.02*n.mv,n.z);b.g.rotation.y=n.h;
    animateBody(b,dt,n.mv,n.pose==='play'&&n.wait>0?'play':'walk',t,n.walk);
    if(b.head)b.head.rotation.y=n.pose!=='play'&&n.wait>0?Math.sin(t*0.7+n.phase)*0.35:0;
  });
}
function npcTalk(n){if(n.b.actor)n.b.actor.once('wave');SFX.play('pluck',{rate:0.8+n.said*0.1});n.said=(n.said+1)%n.lines.length;toast(n.name+': '+n.lines[n.said]);}

const glowTex=mk(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(0.4,'rgba(255,255,255,.42)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h);},true);
