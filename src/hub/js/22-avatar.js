/* ---------- avatar ---------- */
let avatar=null;
/* builds a character from a look {name,species,color,hat}; used for you and for everyone else online */
function makeAvatarModel(av){
  const sp=SPECIES[av.species]||SPECIES[0],cr=makeCritter({kind:sp.kind,head:sp.head,color:av.color},{shadow:true,map:fabricTex}),g=cr.g,head=cr.head,legs=cr.legs,arms=cr.arms;
  const hat=new THREE.Group();hat.position.y=0.1;head.add(hat);
  const dome=(r,m)=>{const d=sh(new THREE.Mesh(new THREE.SphereGeometry(r,18,10,0,Math.PI*2,0,Math.PI/2),m));hat.add(d);return d;};
  if(av.hat===1){dome(0.282,S(0x2a2540,0.8));box(0.3,0.02,0.2,S(0x2a2540,0.8),0,0.03,0.3,hat);}
  if(av.hat===2){dome(0.285,S(0x1fb5a8,0.95,0,{map:fabricTex}));cyl(0.288,0.288,0.07,S(0xf4efe6,0.95),0,0.03,0,hat,18);sph(0.06,S(0xf4efe6,0.95),0,0.3,0,hat);}
  if(av.hat===3){const gm=S(0xffc928,0.22,1);cyl(0.17,0.19,0.1,gm,0,0.2,0,hat,18);for(let i=0;i<6;i++){const a=i/6*6.28,c=sh(new THREE.Mesh(new THREE.ConeGeometry(0.04,0.1,6),gm));c.position.set(Math.cos(a)*0.16,0.3,Math.sin(a)*0.16);hat.add(c);}}
  if(av.hat===4){const c=sh(new THREE.Mesh(new THREE.ConeGeometry(0.14,0.36,16),S(0xff4d6d,0.6)));c.position.y=0.34;hat.add(c);sph(0.04,S(0xffc928,0.6),0,0.53,0,hat);}
  if(av.hat===5){const fm=S(0x6b4a2c,0.9,0,{map:fabricTex});cyl(0.42,0.42,0.025,fm,0,0.13,0,hat,24);cyl(0.2,0.25,0.2,fm,0,0.24,0,hat,20);cyl(0.255,0.255,0.05,S(0x2a1d14,0.8),0,0.17,0,hat,20);}
  let tag=null;
  if(av.name){const t=mk(256,64,(c,w,h)=>{c.fillStyle='rgba(29,22,64,.78)';c.beginPath();c.rect(0,6,w,h-12);c.fill();c.font='900 34px Nunito,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff8e7';c.fillText(av.name,w/2,h/2+1);},true);
    tag=new THREE.Sprite(new THREE.SpriteMaterial({map:t,toneMapped:false,depthWrite:false}));tag.scale.set(0.56,0.14,1);tag.position.y=1.72+(av.hat>2?0.22:0);g.add(tag);}
  return {g:g,legs:legs,arms:arms,head:head};
}
function buildAvatar(){
  const keep=avatar?{x:avatar.g.position.x,z:avatar.g.position.z}:null;
  if(avatar)scene.remove(avatar.g);
  avatar=makeAvatarModel(av);const g=avatar.g;scene.add(g);
  if(keep)g.position.set(keep.x,0,keep.z);
}
const P={x:0,z:-2.6,h:Math.PI,phase:0,move:0};
let mode='walk',sitY=0;
const keys={};let jx=0,jy=0;

