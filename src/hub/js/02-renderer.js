/* ---------- renderer ---------- */
let renderer;
try{
  if(!window.THREE) throw 0;
  renderer=new THREE.WebGLRenderer({canvas:$('h-view'),antialias:true});
}catch(e){ $('h-ui').hidden=true; $('h-nogl').hidden=false; return; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,coarse?1.5:2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.95;
renderer.shadowMap.enabled=!coarse;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0c0a09);
const camera=new THREE.PerspectiveCamera(58,1,0.1,260);
{
  const pm=new THREE.PMREMGenerator(renderer),es=new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.BoxGeometry(10,6,10),new THREE.MeshBasicMaterial({color:0x17130f,side:THREE.BackSide})));
  [[0,2.9,0,2,0.1,2,0xffd9a8],[-4.9,1,0,0.1,2,3,0x6f9fe0],[0,1,-4.9,3,1,0.1,0xff5fa2],[4.9,1.5,0,0.1,1.5,2,0xffd9a0]].forEach(p=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(p[3],p[4],p[5]),new THREE.MeshBasicMaterial({color:p[6]}));m.position.set(p[0],p[1],p[2]);es.add(m);});
  scene.environment=pm.fromScene(es,0.04).texture;
}

let seed=90210;
function rnd(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
const FD="'Lilita One','Arial Rounded MT Bold',sans-serif";
const redraws=[];
function mk(w,h,draw,once){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const go=a=>{g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);draw(g,w,h,a);t.needsUpdate=true;};
  go();if(!once)redraws.push(go);t.userData={go};return t;
}
function S(color,rough,metal,extra){return new THREE.MeshStandardMaterial(Object.assign({color:color,roughness:rough===undefined?0.8:rough,metalness:metal||0},extra||{}));}
function sh(m,ns){m.castShadow=!ns;m.receiveShadow=true;return m;}
function box(w,h,d,mat,x,y,z,par,ns){const m=sh(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat),ns);m.position.set(x,y,z);(par||scene).add(m);return m;}
function cyl(rt,rb,h,mat,x,y,z,par,seg){const m=sh(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||18),mat));m.position.set(x,y,z);(par||scene).add(m);return m;}
function sph(r,mat,x,y,z,par){const m=sh(new THREE.Mesh(new THREE.SphereGeometry(r,18,14),mat));m.position.set(x,y,z);(par||scene).add(m);return m;}
const colliders=[],things=[];
const solid=(x0,x1,z0,z1)=>colliders.push({x0:x0,x1:x1,z0:z0,z1:z1});

