'use strict';
const $=id=>document.getElementById(id);
const CAST=[{name:'Biscuit',kind:'bear',kart:0xff7a1a,head:0xb5733c},{name:'Pepper',kind:'cat',kart:0x7b5cff,head:0x9aa3b5},{name:'Clover',kind:'bunny',kart:0xff5fa2,head:0xffffff},{name:'Moss',kind:'frog',kart:0x1fc46b,head:0x7ddc4a}];
const hex=n=>'#'+n.toString(16).padStart(6,'0');
const coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const EYE=1.65,FOGC=0x9fb1ad;

let renderer;
try{
  if(!window.THREE) throw 0;
  renderer=new THREE.WebGLRenderer({canvas:$('view'),antialias:true});
}catch(e){ $('menu').hidden=true; $('nogl').hidden=false; return; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,coarse?1.5:2));
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.9;
renderer.shadowMap.enabled=!coarse;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
/* glow and colour (shared/post.js): the lighthouse lamp, lanterns and the sun through the fog bloom softly */
const post=GFX.post(renderer,{strength:0.7,threshold:0.78,knee:0.4,spread:1.3,vignette:0.3,sat:1.04,contrast:1.05,warm:0.02});
const scene=new THREE.Scene();scene.background=new THREE.Color(FOGC);scene.fog=new THREE.FogExp2(FOGC,0.03);
const camera=new THREE.PerspectiveCamera(66,1,0.08,700);camera.rotation.order='YXZ';
const hemi=new THREE.HemisphereLight(0xbfd4d2,0x3d3a2e,0.5);scene.add(hemi);
const sunL=new THREE.DirectionalLight(0xffd29a,1.3);scene.add(sunL,sunL.target);
if(!coarse){sunL.castShadow=true;sunL.shadow.mapSize.set(2048,2048);const c=sunL.shadow.camera;c.left=-42;c.right=42;c.top=42;c.bottom=-42;c.near=10;c.far=220;sunL.shadow.bias=-0.0007;sunL.shadow.normalBias=0.04;}

let seed=1907;
function rnd(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
const hash=(i,j)=>{const n=Math.sin(i*127.1+j*311.7)*43758.5453;return n-Math.floor(n);};
function vn(x,z){const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);return (hash(i,j)*(1-u)+hash(i+1,j)*u)*(1-v)+(hash(i,j+1)*(1-u)+hash(i+1,j+1)*u)*v;}
const fbm=(x,z)=>vn(x,z)*0.5+vn(x*2.03,z*2.03)*0.25+vn(x*4.1,z*4.1)*0.125+vn(x*8.2,z*8.2)*0.0625;
function tex(w,h,draw,rx,ry){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;if(rx){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry||rx);}return t;}
function grain(g,w,h,amt){const d=g.getImageData(0,0,w,h),a=d.data;for(let i=0;i<a.length;i+=4){const n=(rnd()-0.5)*amt;a[i]+=n;a[i+1]+=n;a[i+2]+=n;}g.putImageData(d,0,0);}
const S=(c,r,m,e)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r===undefined?0.85:r,metalness:m||0},e||{}));
function mesh(geo,mat,x,y,z,par){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;(par||scene).add(m);return m;}
const bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d),cy=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||16);

/* ---------- textures ---------- */
const T={};
T.detail=tex(256,256,(g,w,h)=>{g.fillStyle='#d6d6d6';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle='rgba('+(rnd()<0.5?'255,255,255':'0,0,0')+','+rnd()*0.1+')';g.beginPath();g.arc(rnd()*w,rnd()*h,1+rnd()*5,0,7);g.fill();}grain(g,w,h,40);},70);
T.stone=tex(512,512,(g,w,h)=>{g.fillStyle='#8f8a7c';g.fillRect(0,0,w,h);for(let r=0;r<8;r++){let x=(r%2)*-48;while(x<w){const bw=70+rnd()*50;g.fillStyle='hsl('+(40+rnd()*12)+','+(8+rnd()*8)+'%,'+(46+rnd()*14)+'%)';g.fillRect(x+2,r*64+2,bw-4,60);x+=bw;}}
  for(let i=0;i<60;i++){g.fillStyle='rgba(60,80,50,'+rnd()*0.16+')';g.beginPath();g.ellipse(rnd()*w,rnd()*h,10+rnd()*40,6+rnd()*18,rnd()*3,0,7);g.fill();}
  g.strokeStyle='rgba(30,28,22,.55)';g.lineWidth=1.2;for(let i=0;i<22;i++){let x=rnd()*w,y=rnd()*h;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=(rnd()-0.5)*50;y+=rnd()*40;g.lineTo(x,y);}g.stroke();}grain(g,w,h,26);},1);
T.rock=tex(256,256,(g,w,h)=>{g.fillStyle='#807c72';g.fillRect(0,0,w,h);for(let i=0;i<220;i++){g.fillStyle='rgba('+(rnd()<0.5?'30,30,26':'210,205,190')+','+rnd()*0.14+')';g.beginPath();g.ellipse(rnd()*w,rnd()*h,4+rnd()*26,3+rnd()*12,rnd()*3,0,7);g.fill();}grain(g,w,h,34);},2);
T.wood=tex(256,512,(g,w,h)=>{for(let i=0;i<4;i++){g.fillStyle='hsl('+(26+rnd()*8)+','+(22+rnd()*10)+'%,'+(30+rnd()*10)+'%)';g.fillRect(i*64,0,64,h);for(let k=0;k<50;k++){g.fillStyle='rgba(20,12,5,'+(0.05+rnd()*0.12)+')';g.fillRect(i*64+rnd()*60,rnd()*h,1+rnd()*2,30+rnd()*160);}g.fillStyle='rgba(10,6,2,.7)';g.fillRect(i*64,0,3,h);}
  for(let i=0;i<14;i++){g.fillStyle='rgba(190,200,170,'+rnd()*0.12+')';g.fillRect(rnd()*w,rnd()*h,20+rnd()*60,4+rnd()*10);}grain(g,w,h,18);},1);
T.brass=tex(128,128,(g,w,h)=>{g.fillStyle='#b8924e';g.fillRect(0,0,w,h);for(let i=0;i<70;i++){g.fillStyle='rgba('+(rnd()<0.5?'70,110,90':'255,230,170')+','+rnd()*0.14+')';g.beginPath();g.ellipse(rnd()*w,rnd()*h,3+rnd()*16,2+rnd()*8,rnd()*3,0,7);g.fill();}grain(g,w,h,16);},1);
T.bark=tex(64,256,(g,w,h)=>{g.fillStyle='#7c6a52';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=10){g.fillStyle='rgba(40,28,16,'+(0.25+rnd()*0.25)+')';g.fillRect(0,y+rnd()*3,w,3);}grain(g,w,h,24);},1,3);
T.blade=tex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<13;i++){const x=6+rnd()*52,t=8+rnd()*30,l=(rnd()-0.5)*16;g.strokeStyle='hsl('+(88+rnd()*16)+','+(30+rnd()*10)+'%,'+(30+rnd()*13)+'%)';g.lineWidth=2.4;g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+l*0.3,h-(h-t)*0.6,x+l,t);g.stroke();}});
T.glow=tex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,240,205,1)');r.addColorStop(0.25,'rgba(255,225,170,.55)');r.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),d=g.createImageData(256,256),hh=(x,y)=>fbm(x/256*8,y/256*8)+fbm((x+90)/256*19,(y+40)/256*19)*0.4;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const dx=(hh((x+1)%256,y)-hh((x+255)%256,y))*6,dy=(hh(x,(y+1)%256)-hh(x,(y+255)%256))*6,l=Math.hypot(dx,dy,1),i=(y*256+x)*4;d.data[i]=(-dx/l*0.5+0.5)*255;d.data[i+1]=(-dy/l*0.5+0.5)*255;d.data[i+2]=(1/l*0.5+0.5)*255;d.data[i+3]=255;}
  g.putImageData(d,0,0);T.wnorm=new THREE.CanvasTexture(c);T.wnorm.wrapS=T.wnorm.wrapT=THREE.RepeatWrapping;T.wnorm.repeat.set(46,46);}

/* ---------- sky and light ---------- */
{
  const g=new THREE.SphereGeometry(520,32,18),col=[],p=g.attributes.position,top=new THREE.Color(0x587d86).convertSRGBToLinear(),mid=new THREE.Color(FOGC).convertSRGBToLinear(),warm=new THREE.Color(0xe3cfa6).convertSRGBToLinear(),c=new THREE.Color();
  for(let i=0;i<p.count;i++){const y=p.getY(i)/520,west=clamp(-p.getX(i)/520,0,1);c.copy(mid).lerp(top,smooth(0.22,0.9,y)).lerp(warm,west*west*smooth(0.2,0.34,y)*(1-smooth(0.34,0.7,y))*0.6);col.push(c.r,c.g,c.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const dome=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false}));scene.add(dome);
  const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:T.glow,fog:false,transparent:true,opacity:0.85,depthWrite:false,blending:THREE.AdditiveBlending}));sun.scale.set(150,150,1);sun.position.set(-440,120,150);scene.add(sun);
  const pm=new THREE.PMREMGenerator(renderer),es=new THREE.Scene();{const dc=dome.clone();dc.material=dome.material.clone();dc.material.color.setHex(0x6e6e6e);es.add(dc);}scene.environment=pm.fromScene(es,0.03).texture;
}

/* ---------- the island's shape ---------- */
const PADS=[{x:-44,z:8,r:8},{x:0,z:-8,r:12},{x:0,z:-29,r:13.5},{x:40,z:0,r:9},{x:38,z:38,r:6.5},{x:0,z:48,r:5}];
const PATHS=[[0,44,0,3],[0,-18,0,-22],[-8,-7,-40,8],[8,-7,33,0],[3,41,33,38]];
function H0(x,z){
  const r=Math.hypot(x,z),R=55+fbm(x*0.035+7,z*0.035+3)*16;let h=Math.min(2.6,(R-r)*0.14);
  if(h>0.6)h+=(fbm(x*0.06+20,z*0.06+9)-0.45)*2.2*smooth(0.6,2.2,h);
  h+=14*Math.exp(-(x*x+(z+47)*(z+47))/(2*15*15))*smooth(-8,4,R-r+6);
  h+=5.5*Math.exp(-((x-41)*(x-41)+z*z)/(2*11*11));
  h+=3.2*Math.exp(-((x-38)*(x-38)+(z-38)*(z-38))/(2*6.5*6.5));
  if(h<0)h=Math.max(-5,h*1.3);
  return h;
}
PADS.forEach(p=>{p.h=Math.max(1.1,H0(p.x,p.z));});PADS[2].h=PADS[1].h+0.6;
function H(x,z){let h=H0(x,z);for(const p of PADS){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r)h=h+(p.h-h)*(1-smooth(p.r*0.68,p.r,d));}return h;}
function pathD(x,z){let b=1e9;for(const s of PATHS){const dx=s[2]-s[0],dz=s[3]-s[1],t=clamp(((x-s[0])*dx+(z-s[1])*dz)/(dx*dx+dz*dz),0,1),d=Math.hypot(x-s[0]-dx*t,z-s[1]-dz*t);if(d<b)b=d;}return b;}
const onPad=(x,z,m)=>PADS.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+(m||0));
{
  const N=170,g=new THREE.PlaneGeometry(230,230,N,N);g.rotateX(-Math.PI/2);const p=g.attributes.position,col=[],c=new THREE.Color();
  const sand=new THREE.Color(0xcdb98a),wet=new THREE.Color(0x9c8860),deep=new THREE.Color(0x4f6f69),g1=new THREE.Color(0x4f7040),g2=new THREE.Color(0x3a582f),rock=new THREE.Color(0x77736a),dirt=new THREE.Color(0x957f5c);
  for(let i=0;i<p.count;i++)p.setY(i,H(p.getX(i),p.getZ(i)));
  g.computeVertexNormals();const nn=g.attributes.normal;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=p.getY(i),n=fbm(x*0.21,z*0.21);
    if(h<0.25)c.copy(deep).lerp(wet,smooth(-1.6,0.25,h));else c.copy(wet).lerp(sand,smooth(0.25,0.8,h));
    c.lerp(g1.clone().lerp(g2,n),smooth(1.15,1.75,h+n*0.5));
    c.lerp(rock,smooth(0.80,0.62,nn.getY(i)));
    if(h>0.5)c.lerp(dirt,(1-smooth(0.7,1.9,pathD(x,z)))*0.85);
    col.push(c.r,c.g,c.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const m=new THREE.Mesh(g,S(0xffffff,0.96,0,{vertexColors:true,map:T.detail}));m.receiveShadow=true;scene.add(m);
}
const water=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.MeshStandardMaterial({color:0x2b5d63,roughness:0.14,metalness:0.6,normalMap:T.wnorm,normalScale:new THREE.Vector2(0.55,0.55),transparent:true,opacity:0.9}));
water.rotation.x=-Math.PI/2;water.position.y=0;scene.add(water);

/* ---------- plants and stones ---------- */
const cols=[];   // things you cannot walk through: {x,z,r} circles or {x0,x1,z0,z1} boxes
const colC=(x,z,r)=>cols.push({x:x,z:z,r:r}),colB=(x0,x1,z0,z1)=>cols.push({x0:x0,x1:x1,z0:z0,z1:z1});
{
  const d=new THREE.Object3D();
  /* palms */
  const spots=[];for(let n=0;n<900&&spots.length<34;n++){const a=rnd()*6.283,r=30+rnd()*24,x=Math.cos(a)*r,z=Math.sin(a)*r,h=H(x,z);if(h<0.75||h>3.4||onPad(x,z,2)||pathD(x,z)<3||spots.some(s=>Math.hypot(s.x-x,s.z-z)<4.5))continue;spots.push({x:x,z:z,h:h});}
  const fg=new THREE.BufferGeometry(),fp=[],fc=[],fi=[],SEG=8,cA=new THREE.Color(0x3f6b34),cB=new THREE.Color(0x7d9a4a),cc=new THREE.Color();
  for(let s=0;s<=SEG;s++){const t=s/SEG,zz=t*3.6,y=0.5*t-1.5*t*t,w=0.55*Math.sin(Math.PI*Math.min(1,t*1.15+0.08))*(1-t*0.35);cc.copy(cA).lerp(cB,t);
    [[-w,-0.16*(1-t)],[0,0],[w,-0.16*(1-t)]].forEach(q=>{fp.push(q[0],y+q[1],zz);fc.push(cc.r,cc.g,cc.b);});
    if(s<SEG){const b=s*3;fi.push(b,b+3,b+1,b+1,b+3,b+4,b+1,b+4,b+2,b+2,b+4,b+5);}}
  fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3));fg.setAttribute('color',new THREE.Float32BufferAttribute(fc,3));fg.setIndex(fi);fg.computeVertexNormals();
  const fronds=new THREE.InstancedMesh(fg,S(0xffffff,0.75,0,{vertexColors:true,side:THREE.DoubleSide}),spots.length*11);fronds.castShadow=true;let fk=0;
  const bark=S(0xffffff,0.95,0,{map:T.bark});
  spots.forEach(s=>{const ht=6+rnd()*4,lean=1+rnd()*2.4,la=rnd()*6.283,lx=Math.cos(la)*lean,lz=Math.sin(la)*lean;
    const cv=new THREE.CatmullRomCurve3([new THREE.Vector3(0,-0.4,0),new THREE.Vector3(lx*0.15,ht*0.35,lz*0.15),new THREE.Vector3(lx*0.55,ht*0.72,lz*0.55),new THREE.Vector3(lx,ht,lz)]);
    const tr=mesh(new THREE.TubeGeometry(cv,10,0.2,7),bark,s.x,s.h,s.z);tr.scale.set(1,1,1);
    for(let k=0;k<11;k++){d.position.set(s.x+lx,s.h+ht-0.05,s.z+lz);d.rotation.set(0.25+rnd()*0.5-(k>7?0.7:0),k/11*6.283+rnd()*0.4,0,'YXZ');d.scale.setScalar(0.85+rnd()*0.4);d.updateMatrix();fronds.setMatrixAt(fk++,d.matrix);}
    for(let k=0;k<3;k++)mesh(new THREE.SphereGeometry(0.17,8,6),S(0x5a4630,0.8),s.x+lx+(rnd()-0.5)*0.5,s.h+ht-0.35,s.z+lz+(rnd()-0.5)*0.5);
    colC(s.x,s.z,0.35);});
  scene.add(fronds);
  /* grass */
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute([-0.5,0,0,0.5,0,0,0.5,0.8,0,-0.5,0.8,0, 0,0,-0.5,0,0,0.5,0,0.8,0.5,0,0.8,-0.5],3));
  gg.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],2));gg.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);gg.setAttribute('normal',new THREE.Float32BufferAttribute(new Array(24).fill(0).map((v,i)=>i%3===1?1:0),3));
  const NG=coarse?900:2600,grass=new THREE.InstancedMesh(gg,new THREE.MeshBasicMaterial({color:0xa9b79a,map:T.blade,alphaTest:0.45,side:THREE.DoubleSide}),NG);let gk=0;
  for(let n=0;n<NG*6&&gk<NG;n++){const x=(rnd()-0.5)*124,z=(rnd()-0.5)*124,h=H(x,z);if(h<1.25||onPad(x,z,-1.5)||pathD(x,z)<1.7)continue;d.position.set(x,h-0.03,z);d.rotation.set(0,rnd()*3.14,0);d.scale.set(0.8+rnd()*0.9,0.6+rnd()*1.0,0.8+rnd()*0.9);d.updateMatrix();grass.setMatrixAt(gk++,d.matrix);}
  grass.count=gk;scene.add(grass);
  /* rocks and shrubs */
  const NR=90,rocks=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),S(0xffffff,0.95,0,{map:T.rock,flatShading:true}),NR);rocks.castShadow=rocks.receiveShadow=true;let rk=0;
  for(let n=0;n<3000&&rk<NR;n++){const a=rnd()*6.283,r=rnd()<0.55?50+rnd()*13:rnd()*52,x=Math.cos(a)*r,z=Math.sin(a)*r,h=H(x,z);if(h<-1.2||onPad(x,z,1.5)||pathD(x,z)<2.6)continue;const s=0.4+rnd()*rnd()*2.4;
    d.position.set(x,h+s*0.15,z);d.rotation.set(rnd()*6,rnd()*6,rnd()*6);d.scale.set(s*(0.8+rnd()*0.6),s*(0.5+rnd()*0.5),s*(0.8+rnd()*0.6));d.updateMatrix();rocks.setMatrixAt(rk++,d.matrix);if(s>1.1&&h>-0.2)colC(x,z,s*0.8);}
  rocks.count=rk;scene.add(rocks);
  const NS=70,shr=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),S(0x35522c,0.9,0,{flatShading:true}),NS);shr.castShadow=true;let sk2=0;
  for(let n=0;n<2000&&sk2<NS;n++){const x=(rnd()-0.5)*110,z=(rnd()-0.5)*110,h=H(x,z);if(h<1.4||onPad(x,z,1)||pathD(x,z)<2.4)continue;const s=0.5+rnd()*0.9;d.position.set(x,h+s*0.3,z);d.rotation.set(0,rnd()*6,0);d.scale.set(s*1.3,s*0.8,s*1.3);d.updateMatrix();shr.setMatrixAt(sk2++,d.matrix);}
  shr.count=sk2;scene.add(shr);
}
const NM=coarse?120:260,mpos=new Float32Array(NM*3),mgeo=new THREE.BufferGeometry();for(let i=0;i<NM;i++){mpos[i*3]=(rnd()-0.5)*40;mpos[i*3+1]=rnd()*6;mpos[i*3+2]=(rnd()-0.5)*40;}
mgeo.setAttribute('position',new THREE.BufferAttribute(mpos,3));const motes=new THREE.Points(mgeo,new THREE.PointsMaterial({color:0xfff0c8,size:0.045,transparent:true,opacity:0.4,depthWrite:false}));motes.frustumCulled=false;scene.add(motes);
