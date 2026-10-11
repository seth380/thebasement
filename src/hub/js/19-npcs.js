/* ---------- friends in the basement ---------- */
const npcs=[];
function npcMake(name,kind,head,color,lines,route){
  const cr=makeCritter({kind:kind,head:head,color:color},{shadow:true,map:fabricTex});scene.add(cr.g);
  const t=mk(256,64,(c,w,h)=>{c.fillStyle='rgba(29,22,64,.7)';c.fillRect(0,8,w,h-16);c.font='900 32px Nunito,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ffe9a8';c.fillText(name,w/2,h/2+1);},true);
  const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:t,toneMapped:false,depthWrite:false}));tag.scale.set(0.5,0.125,1);tag.position.y=1.72;cr.g.add(tag);
  const n={name:name,cr:cr,x:0,z:0,h:0,lines:lines,route:route,i:0,wait:0,pose:'walk',face:0,phase:rnd()*6,walk:0,mv:0,said:0};
  if(route){n.x=route[0][0];n.z=route[0][1];}npcs.push(n);return n;
}
{
  const N=Math.PI,W=-Math.PI/2,Sx=0;
  npcMake('Pepper','cat',0x9aa3b5,0x7b5cff,['This couch is the best seat in the house.','Have you beaten my kart time yet?','Winner picks the next game. Basement rules.'],null);
  npcMake('Biscuit','bear',0xb5733c,0xff7a1a,['The orange rings in Cloudtop Run give you a boost.','I keep losing at checkers. Do not tell anyone.','The fish like it when you feed them.'],
    [[0,-5.2],[1.15,-6.25,N,9,'play'],[0,-5.2],[-6.5,-5.2],[-8.6,-6.3,N,6,'look'],[-6.5,-5.2],[-6.5,-1.5],[-4.9,-1.2],[-5.2,3.0,W,7,'look'],[-4.9,-1.2],[-2,-1]]);
  npcMake('Clover','bunny',0xf4efe6,0xff5fa2,['Flick up-left for a kickflip. It took me ages to learn.','Want to play pool later?','The Warehouse has a huge bank on the east wall.'],
    [[-2,-1],[3.2,-0.5],[6.4,-0.75,N,6,'look'],[3.2,-0.5],[3.2,2.8],[5.4,3.75,Sx,6,'look'],[3.2,2.8],[0,3.2],[1.2,4.1,Sx,5,'look'],[0,3.2]]);
  npcMake('Moss','frog',0x7ddc4a,0x1fc46b,['Mudwalkers got me on wave four.','Auto-fire is my secret weapon.','I am reading every book on that shelf. Slowly.'],
    [[-3.45,-6.25,N,13,'play'],[-3.45,-5],[-6.5,-5.2],[-6.5,-1.5],[-9.9,-4.5,W,7,'look'],[-6.5,-1.5],[-6.5,-5.2],[-3.45,-5]]);
  const p=npcs[0];p.x=-6.62;p.z=2.86;p.h=W;p.pose='sit';
}
function npcTick(dt,t){
  npcs.forEach(n=>{
    const c=n.cr;let sw=0;
    if(n.pose==='sit'){c.g.position.set(n.x,0.2,n.z);c.g.rotation.y=n.h;c.legs[0].rotation.x=c.legs[1].rotation.x=-1.45;c.arms[0].rotation.x=c.arms[1].rotation.x=-0.5;c.head.rotation.y=Math.sin(t*0.4+n.phase)*0.25;return;}
    const st=n.route[n.i];
    if(n.wait>0){n.wait-=dt;n.mv+=(0-n.mv)*Math.min(1,dt*8);const d=Math.atan2(Math.sin(n.face-n.h),Math.cos(n.face-n.h));n.h+=Math.max(-4*dt,Math.min(4*dt,d));if(n.wait<=0){n.pose='walk';n.i=(n.i+1)%n.route.length;}}
    else{const dx=st[0]-n.x,dz=st[1]-n.z,d=Math.hypot(dx,dz);
      if(d<0.08){if(st.length>2){n.wait=st[3];n.face=st[2];n.pose=st[4];}else n.i=(n.i+1)%n.route.length;}
      else{const near=Math.hypot(P.x-n.x,P.z-n.z)<0.95&&(dx*(P.x-n.x)+dz*(P.z-n.z))>0;const want=Math.atan2(dx,dz),dh=Math.atan2(Math.sin(want-n.h),Math.cos(want-n.h));n.h+=Math.max(-5*dt,Math.min(5*dt,dh));
        if(!near&&Math.abs(dh)<0.9){const sp=Math.min(1.5*dt,d);n.x+=dx/d*sp;n.z+=dz/d*sp;n.mv+=(1-n.mv)*Math.min(1,dt*8);}else n.mv+=(0-n.mv)*Math.min(1,dt*8);}}
    n.walk+=dt*8*n.mv;sw=Math.sin(n.walk)*0.6*n.mv;
    c.g.position.set(n.x,Math.abs(Math.sin(n.walk))*0.02*n.mv,n.z);c.g.rotation.y=n.h;c.legs[0].rotation.x=sw;c.legs[1].rotation.x=-sw;
    if(n.pose==='play'&&n.wait>0){c.arms[0].rotation.x=-1.1+Math.sin(t*9+n.phase)*0.12;c.arms[1].rotation.x=-1.1+Math.sin(t*11)*0.14;c.head.rotation.y=0;}
    else{c.arms[0].rotation.x=-sw*0.8;c.arms[1].rotation.x=sw*0.8;c.head.rotation.y=n.wait>0?Math.sin(t*0.7+n.phase)*0.35:0;}
  });
}
function npcTalk(n){n.said=(n.said+1)%n.lines.length;toast(n.name+': '+n.lines[n.said]);}

const glowTex=mk(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(0.4,'rgba(255,255,255,.42)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h);},true);
