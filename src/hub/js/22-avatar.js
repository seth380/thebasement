/* ---------- avatar ---------- */
let avatar=null;
/* models found in assets/models/characters (empty in the single-file build) */
const MODEL_CHARS=GFX.roster.characters,MODEL_NPCS=GFX.roster.npcs;
/* a function declaration (not a const) because the NPCs, built earlier in the file order, call it */
function modelFor(id){const R=GFX.roster;return id?R.characters.find(m=>m.id===id)||R.npcs.find(m=>m.id===id)||null:null;}

function hatGroup(n){
  const hat=new THREE.Group();
  const dome=(r,m)=>{const d=sh(new THREE.Mesh(new THREE.SphereGeometry(r,18,10,0,Math.PI*2,0,Math.PI/2),m));hat.add(d);return d;};
  if(n===1){dome(0.282,S(0x2a2540,0.8));box(0.3,0.02,0.2,S(0x2a2540,0.8),0,0.03,0.3,hat);}
  if(n===2){dome(0.285,S(0x1fb5a8,0.95,0,{map:fabricTex}));cyl(0.288,0.288,0.07,S(0xf4efe6,0.95),0,0.03,0,hat,18);sph(0.06,S(0xf4efe6,0.95),0,0.3,0,hat);}
  if(n===3){const gm=S(0xffc928,0.22,1);cyl(0.17,0.19,0.1,gm,0,0.2,0,hat,18);for(let i=0;i<6;i++){const a=i/6*6.28,c=sh(new THREE.Mesh(new THREE.ConeGeometry(0.04,0.1,6),gm));c.position.set(Math.cos(a)*0.16,0.3,Math.sin(a)*0.16);hat.add(c);}}
  if(n===4){const c=sh(new THREE.Mesh(new THREE.ConeGeometry(0.14,0.36,16),S(0xff4d6d,0.6)));c.position.y=0.34;hat.add(c);sph(0.04,S(0xffc928,0.6),0,0.53,0,hat);}
  if(n===5){const fm=S(0x6b4a2c,0.9,0,{map:fabricTex});cyl(0.42,0.42,0.025,fm,0,0.13,0,hat,24);cyl(0.2,0.25,0.2,fm,0,0.24,0,hat,20);cyl(0.255,0.255,0.05,S(0x2a1d14,0.8),0,0.17,0,hat,20);}
  return hat;
}
function nameTag(name,y,col){
  const t=mk(256,64,(c,w,h)=>{c.fillStyle='rgba(29,22,64,.78)';c.beginPath();c.rect(0,6,w,h-12);c.fill();c.font='900 34px Nunito,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=col||'#fff8e7';c.fillText(name,w/2,h/2+1);},true);
  const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:t,toneMapped:false,depthWrite:false}));tag.scale.set(0.56,0.14,1);tag.position.y=y;return tag;
}
/* puts a hat on a rigged model: rides on the head bone, sits on top of the head */
function hatOnModel(a,n,height){
  if(!n)return;
  const head=a.bone(/head/i)||a.bone(/neck/i);if(!head)return;
  a.g.updateMatrixWorld(true);
  const hat=hatGroup(n),bw=head.getWorldPosition(new THREE.Vector3()),bs=head.getWorldScale(new THREE.Vector3()),bq=head.getWorldQuaternion(new THREE.Quaternion());
  /* top of the head mesh if the model names one, else top of the whole model */
  let hm=null;a.body.traverse(o=>{if(!hm&&o.isMesh&&/head/i.test(o.name))hm=o;});
  let topY=a.g.position.y+height*0.985,hw=height*0.3,cx=bw.x,cz=bw.z;
  if(hm){const hb=new THREE.Box3().setFromObject(hm);topY=hb.max.y-(hb.max.y-hb.min.y)*0.08;hw=Math.max(hb.max.x-hb.min.x,hb.max.z-hb.min.z);cx=(hb.min.x+hb.max.x)/2;cz=(hb.min.z+hb.max.z)/2;}
  const top=new THREE.Vector3(cx,topY,cz),s=Math.min(height/1.55*0.9,hw/0.56*0.95);
  hat.position.copy(head.worldToLocal(top.clone()));hat.quaternion.copy(bq.invert());hat.scale.set(s/bs.x,s/bs.y,s/bs.z);head.add(hat);
}
/* builds a character from a look {name,species,color,hat,model}; used for you, everyone online and the NPCs.
   With a model that has loaded, the result carries .actor (a rigged, animated body); otherwise it is a critter. */
function makeAvatarModel(look,o){
  o=o||{};const m=modelFor(look.model),h=o.height||1.5;
  const a=m?GFX.actor(m.file,{height:h}):null;
  if(a){
    hatOnModel(a,look.hat,h);
    if(look.name)a.g.add(nameTag(look.name,h+0.2+(look.hat>2?0.2:0),o.tagColor));
    return {g:a.g,actor:a};
  }
  const sp=SPECIES[look.species]||SPECIES[0],cr=makeCritter({kind:sp.kind,head:sp.head,color:look.color},{shadow:true,map:fabricTex});
  const hat=hatGroup(look.hat);hat.position.y=0.1;cr.head.add(hat);
  if(look.name)cr.g.add(nameTag(look.name,1.72+(look.hat>2?0.22:0),o.tagColor));
  return {g:cr.g,legs:cr.legs,arms:cr.arms,head:cr.head};
}
/* one place that animates a body, whichever kind it is.
   pose: 'walk' (move 0..1 blends idle to walk), 'sit', 'play' (hands busy at a cabinet), 'look' */
function animateBody(b,dt,move,pose,t,phase){
  if(b.actor){
    const A=b.actor;
    A.state(pose==='sit'?'sit':pose==='play'?'play':move>0.35?'walk':'idle');
    A.speed(move>0.35?0.6+move*0.55:1);A.update(dt);return;
  }
  const sw=Math.sin(phase)*0.7*move,sit=pose==='sit';
  b.legs[0].rotation.x=sit?-1.45:sw;b.legs[1].rotation.x=sit?-1.45:-sw;
  if(pose==='play'){b.arms[0].rotation.x=-1.1+Math.sin(t*9+phase)*0.12;b.arms[1].rotation.x=-1.1+Math.sin(t*11)*0.14;}
  else{b.arms[0].rotation.x=sit?-0.5:-sw*0.8;b.arms[1].rotation.x=sit?-0.5:sw*0.8;}
}
/* how high a body sits off the floor: critters perch on the cushion, models with a sit animation need less */
const SEAT=0.5;
const sitLift=b=>b.actor?(b.actor.has('sit')?b.actor.sitOffset(SEAT):0.2):0.2;
/* emotes 👋 😂 🎉 👍 make a model wave, laugh (no clip yet, so nothing), dance or nod */
const EMOTE_ANIM=['wave','','dance','yes'];
function bodyEmote(b,k){if(b&&b.actor&&EMOTE_ANIM[k])b.actor.once(EMOTE_ANIM[k]);}
function buildAvatar(){
  const keep=avatar?{x:avatar.g.position.x,z:avatar.g.position.z}:null;
  if(avatar){scene.remove(avatar.g);if(avatar.actor)avatar.actor.dispose();}
  avatar=makeAvatarModel(av);const g=avatar.g;scene.add(g);
  if(keep)g.position.set(keep.x,0,keep.z);
  /* a model still loading: show the critter now and swap when it arrives */
  const m=modelFor(av.model);if(m&&!avatar.actor)GFX.preload(m.file,()=>{if(modelFor(av.model)===m)buildAvatar();});
}
const P={x:0,z:-2.6,h:Math.PI,phase:0,move:0};
let mode='walk',sitY=0;
const keys={};let jx=0,jy=0;
