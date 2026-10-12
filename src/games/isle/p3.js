/* ---------- saved progress ---------- */
let F={power:false,pillars:false,dirs:[6,2,4,7],dials:[1,3,0],vals:[5,25,15],crystal:false,lens:false,key:false,door:false,beacon:false,notes:[]};
function loadSave(){try{const s=JSON.parse(localStorage.getItem('isle-save'));if(s&&s.dirs)F=Object.assign(F,s);}catch(e){}}
function save(){try{localStorage.setItem('isle-save',JSON.stringify(F));}catch(e){}
  /* coins for each mechanism solved the first time */
  try{const solved=[F.power,F.pillars,F.crystal||F.lens,F.vault,F.beacon].filter(Boolean).length,paid=+localStorage.getItem('isle-paid')||0;
    if(solved>paid){localStorage.setItem('isle-paid',String(solved));if(typeof api!=='undefined'&&api&&api.coins)api.coins(40*(solved-paid),'Isle puzzle solved');}}catch(e){}}
loadSave();

/* ---------- signs: six symbols and four animals, drawn once and reused in the world and in panels ---------- */
const SYMS=['sun','moon','star','wave','bird','eye'],ANIMALS=['gull','crab','turtle','fish'],ROMAN=['I','II','III','IV'];
function glyph(g,name,cx,cy,r,col){
  g.save();g.translate(cx,cy);g.strokeStyle=col;g.fillStyle=col;g.lineWidth=r*0.13;g.lineCap='round';g.lineJoin='round';
  if(name==='sun'){g.beginPath();g.arc(0,0,r*0.42,0,7);g.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(Math.cos(a)*r*0.62,Math.sin(a)*r*0.62);g.lineTo(Math.cos(a)*r*0.95,Math.sin(a)*r*0.95);g.stroke();}}
  else if(name==='moon'){g.beginPath();g.arc(0,0,r*0.8,0.9,5.4);g.arc(r*0.38,0,r*0.62,4.75,1.55,true);g.closePath();g.fill();}
  else if(name==='star'){g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,q=i%2?r*0.38:r*0.92;g.lineTo(Math.cos(a)*q,Math.sin(a)*q);}g.closePath();g.fill();}
  else if(name==='wave'){for(let k=-1;k<=1;k++){g.beginPath();for(let x=-r*0.9;x<=r*0.9;x+=r*0.1)g.lineTo(x,k*r*0.42+Math.sin(x/r*5)*r*0.16);g.stroke();}}
  else if(name==='bird'||name==='gull'){g.beginPath();g.moveTo(-r*0.9,-r*0.1);g.quadraticCurveTo(-r*0.4,-r*0.75,0,r*0.05);g.quadraticCurveTo(r*0.4,-r*0.75,r*0.9,-r*0.1);g.stroke();if(name==='gull'){g.beginPath();g.arc(0,r*0.3,r*0.12,0,7);g.fill();}}
  else if(name==='eye'){g.beginPath();g.moveTo(-r*0.9,0);g.quadraticCurveTo(0,-r*0.8,r*0.9,0);g.quadraticCurveTo(0,r*0.8,-r*0.9,0);g.stroke();g.beginPath();g.arc(0,0,r*0.28,0,7);g.fill();}
  else if(name==='crab'){g.beginPath();g.ellipse(0,r*0.1,r*0.5,r*0.34,0,0,7);g.fill();[-1,1].forEach(s=>{g.beginPath();g.moveTo(s*r*0.4,-r*0.05);g.lineTo(s*r*0.75,-r*0.5);g.stroke();g.beginPath();g.arc(s*r*0.78,-r*0.62,r*0.17,0,7);g.stroke();for(let k=0;k<3;k++){g.beginPath();g.moveTo(s*r*0.45,r*0.2+k*r*0.12);g.lineTo(s*r*0.9,r*0.35+k*r*0.2);g.stroke();}});}
  else if(name==='turtle'){g.beginPath();g.ellipse(0,0,r*0.55,r*0.42,0,0,7);g.stroke();g.beginPath();g.arc(r*0.75,0,r*0.17,0,7);g.fill();[[-0.4,-0.5],[0.35,-0.5],[-0.4,0.5],[0.35,0.5]].forEach(q=>{g.beginPath();g.arc(q[0]*r,q[1]*r,r*0.13,0,7);g.fill();});g.beginPath();g.moveTo(-r*0.55,0);g.lineTo(-r*0.85,r*0.1);g.stroke();}
  else if(name==='fish'){g.beginPath();g.ellipse(-r*0.1,0,r*0.6,r*0.34,0,0,7);g.stroke();g.beginPath();g.moveTo(r*0.45,0);g.lineTo(r*0.92,-r*0.38);g.lineTo(r*0.92,r*0.38);g.closePath();g.fill();g.beginPath();g.arc(-r*0.4,-r*0.06,r*0.07,0,7);g.fill();}
  g.restore();
}
const symURL={};SYMS.concat(ANIMALS).forEach(n=>{const c=document.createElement('canvas');c.width=c.height=128;glyph(c.getContext('2d'),n,64,64,50,'#e7c98a');symURL[n]=c.toDataURL();});
function plaque(name,roman){return tex(256,256,(g,w,h)=>{g.drawImage(T.brass.image,0,0,w,h);g.fillStyle='rgba(40,30,12,.35)';g.fillRect(0,0,w,h);g.strokeStyle='#3a2a10';g.lineWidth=10;g.strokeRect(8,8,w-16,h-16);glyph(g,name,128,roman?112:128,roman?70:86,'#2a1c08');if(roman){g.fillStyle='#2a1c08';g.font='bold 54px Georgia,serif';g.textAlign='center';g.fillText(roman,128,236);}});}
function stoneSign(draw){return tex(512,512,(g,w,h)=>{g.drawImage(T.stone.image,0,0);g.fillStyle='rgba(120,112,96,.55)';g.fillRect(0,0,w,h);draw(g,w,h);});}

const ITEMS=[];function item(x,y,z,r,label,use){const it={p:new THREE.Vector3(x,y,z),r:r,label:label,use:use,on:true};ITEMS.push(it);return it;}
const stoneM=S(0xffffff,0.95,0,{map:T.stone}),woodM=S(0xffffff,0.9,0,{map:T.wood}),brassM=S(0xffffff,0.45,0.55,{map:T.brass,envMapIntensity:1.7}),darkM=S(0x1d1c19,0.6,0.5),glassM=new THREE.MeshStandardMaterial({color:0xbfe0dc,transparent:true,opacity:0.22,roughness:0.05,metalness:0.2,side:THREE.DoubleSide});
function plaqueAt(name,roman,x,y,z,ry,size){const m=mesh(new THREE.BoxGeometry(size||0.5,size||0.5,0.04),[brassM,brassM,brassM,brassM,S(0xffffff,0.55,0.3,{map:plaque(name,roman)}),brassM],x,y,z);m.rotation.y=ry||0;return m;}
const lamps=[];function lampPost(x,z){const h=H(x,z);mesh(cy(0.07,0.1,2.6,8),darkM,x,h+1.3,z);mesh(bx(0.5,0.05,0.5),darkM,x,h+2.62,z);
  const gl=mesh(new THREE.SphereGeometry(0.2,12,10),new THREE.MeshStandardMaterial({color:0x3a3a34,emissive:0xffc978,emissiveIntensity:0,roughness:0.3}),x,h+2.38,z);gl.castShadow=false;
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:T.glow,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.set(2.6,2.6,1);halo.position.set(x,h+2.38,z);scene.add(halo);lamps.push({gl:gl,halo:halo});colC(x,z,0.2);}
[[0,34],[0,20],[0,6],[-20,-1],[-34,5],[20,-4],[30,-1],[14,40],[26,39],[0,-19]].forEach(p=>lampPost(p[0]+1.8,p[1]));
const pLights=[[-44,3.6,3.5,0xffc27a],[40,3.4,0,0xcfe8ff],[0,3.2,-8,0xffc27a]].map(p=>{const l=new THREE.PointLight(p[3],0,16,1.6);l.position.set(p[0],H(p[0],p[2])+p[1],p[2]);scene.add(l);return l;});

/* ---------- beach: the wrecked boat ---------- */
{
  const bh=H(1.5,47.2),g=new THREE.Group();g.position.set(1.5,bh+0.35,47.2);g.rotation.set(0.1,0.5,0.32);scene.add(g);
  const hull=mesh(new THREE.CylinderGeometry(0.85,0.5,4.4,10,1,true,0,Math.PI),S(0xffffff,0.9,0,{map:T.wood,side:THREE.DoubleSide}),0,0,0,g);hull.rotation.set(Math.PI/2,0,Math.PI/2);hull.scale.z=0.75;
  [-1.2,0.2,1.4].forEach(z=>mesh(bx(1.5,0.06,0.3),woodM,0,0.02,z,g));
  mesh(cy(0.035,0.035,2.6,6),woodM,0.9,bh+0.25,49).rotation.set(1.5,0.4,0);
  mesh(bx(0.7,0.6,0.7),woodM,-1.2,bh+0.3,46.2).rotation.y=0.4;colC(1.5,47.2,1.6);colC(-1.2,46.2,0.5);
  const n=mesh(new THREE.PlaneGeometry(0.34,0.44),S(0xefe3c8,0.9),-1.2,bh+0.615,46.2);n.rotation.set(-Math.PI/2,0,0.3);n.castShadow=false;
  item(-1.2,bh+0.7,46.2,0.5,()=>'Read the page on the crate',()=>readNote(0));
}
/* ---------- dock, pier and generator shed ---------- */
const PIER={x0:-71,x1:-52.5,z0:6.7,z1:9.3,y:1.0};
{
  const dh=PADS[0].h;
  for(let x=PIER.x0+0.3;x<PIER.x1;x+=0.52){const p=mesh(bx(0.47,0.09,2.6),woodM,x,PIER.y-0.045+(rnd()-0.5)*0.02,8);p.rotation.y=(rnd()-0.5)*0.03;}
  for(let x=PIER.x0+1;x<PIER.x1;x+=4.4)[-1,1].forEach(s=>{mesh(cy(0.14,0.16,5,8),woodM,x,PIER.y-1.9,8+s*1.25);});
  [-1,1].forEach(s=>mesh(bx(PIER.x1-PIER.x0,0.14,0.14),woodM,(PIER.x0+PIER.x1)/2,PIER.y-0.18,8+s*1.2));
  mesh(cy(0.2,0.2,0.9,8),woodM,PIER.x0+0.6,PIER.y+0.45,9);mesh(new THREE.TorusGeometry(0.26,0.05,6,14),S(0xb9a57c,0.9),PIER.x0+0.6,PIER.y+0.55,9).rotation.x=Math.PI/2;
  /* shed: open to the south */
  const sx=-44,sz=3.5;
  mesh(bx(4.6,0.16,3.4),woodM,sx,dh+0.08,sz);
  mesh(bx(4.6,2.5,0.14),woodM,sx,dh+1.35,sz-1.6);[-1,1].forEach(s=>mesh(bx(0.14,2.5,3.3),woodM,sx+s*2.23,dh+1.35,sz));
  const roof=mesh(bx(5.2,0.14,4.1),S(0x4a4f4a,0.7,0.4),sx,dh+2.78,sz+0.1);roof.rotation.x=0.14;
  colB(sx-2.35,sx+2.35,sz-1.75,sz-1.45);colB(sx-2.35,sx-2.1,sz-1.7,sz+1.65);colB(sx+2.1,sx+2.35,sz-1.7,sz+1.65);
  /* generator */
  mesh(bx(1.5,0.5,0.9),darkM,sx-0.9,dh+0.41,sz-0.9);const drum=mesh(cy(0.42,0.42,1.2,18),brassM,sx-0.9,dh+1.05,sz-0.9);drum.rotation.z=Math.PI/2;
  const fly=mesh(new THREE.TorusGeometry(0.5,0.07,8,24),darkM,sx-1.75,dh+1.05,sz-0.9);fly.rotation.y=Math.PI/2;[0,1,2].forEach(k=>{const sp=mesh(bx(0.04,0.95,0.04),darkM,sx-1.75,dh+1.05,sz-0.9);sp.rotation.x=k*Math.PI/3;fly.userData[k]=sp;});
  scene.userData.fly=[fly,fly.userData[0],fly.userData[1],fly.userData[2]];
  mesh(cy(0.05,0.05,1.9,8),brassM,sx-0.3,dh+1.9,sz-1.3);colB(sx-2.1,sx-0.1,sz-1.5,sz-0.4);
  /* dial panel on the back wall */
  mesh(bx(1.5,1.0,0.08),brassM,sx+0.95,dh+1.5,sz-1.5);
  const dialM=[0,1,2].map(i=>{const m=mesh(cy(0.2,0.2,0.05,20),[brassM,S(0xffffff,0.55,0.3,{map:plaque(SYMS[F.dials[i]])}),brassM],sx+0.5+i*0.45,dh+1.55,sz-1.44);m.rotation.x=Math.PI/2;return m;});
  scene.userData.dials=dialM;
  item(sx+0.95,dh+1.5,sz-1.4,0.8,()=>F.power?'The generator is humming':'Look at the brass dials',()=>openDials());
  const n=mesh(new THREE.PlaneGeometry(0.4,0.52),S(0xefe3c8,0.9),sx+2.15,dh+1.55,sz+0.2);n.rotation.y=-Math.PI/2;n.castShadow=false;
  item(sx+2.1,dh+1.55,sz+0.2,0.5,()=>'Read the note nailed to the wall',()=>readNote(1));
  mesh(bx(0.2,2.6,0.2),woodM,sx+2.6,dh+1.3,sz+2.2);plaqueAt('wave','I',sx+2.6,dh+1.7,sz+2.32,0,0.42);colC(sx+2.6,sz+2.2,0.25);
}
/* ---------- plaza and the four watchers ---------- */
const pillars=[];
{
  const ph=PADS[1].h,px=0,pz=-8;
  const rose=tex(512,512,(g,w,h)=>{g.drawImage(T.stone.image,0,0);g.fillStyle='rgba(150,140,120,.35)';g.fillRect(0,0,w,h);g.translate(256,256);g.strokeStyle='#3a342a';g.lineWidth=5;[240,170,60].forEach(r=>{g.beginPath();g.arc(0,0,r,0,7);g.stroke();});
    for(let i=0;i<8;i++){g.save();g.rotate(i*Math.PI/4);g.fillStyle=i%2?'rgba(58,52,42,.55)':'#3a342a';g.beginPath();g.moveTo(0,-(i%2?120:165));g.lineTo(i%2?14:22,0);g.lineTo(-(i%2?14:22),0);g.closePath();g.fill();g.restore();}
    g.fillStyle='#3a342a';g.font='bold 54px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText('N',0,-204);});
  const disc=mesh(cy(9.5,9.7,0.2,48),[stoneM,S(0xffffff,0.9,0,{map:rose}),stoneM],px,ph+0.02,pz);disc.castShadow=false;disc.rotation.y=Math.PI;
  [[-5,-5,'gull'],[5,-5,'crab'],[-5,5,'turtle'],[5,5,'fish']].forEach((q,i)=>{
    const x=px+q[0],z=pz+q[1];mesh(cy(0.62,0.72,0.3,10),stoneM,x,ph+0.25,z);mesh(cy(0.45,0.5,2.1,10),stoneM,x,ph+1.4,z);
    const top=new THREE.Group();top.position.set(x,ph+2.45,z);scene.add(top);
    mesh(bx(0.95,0.7,0.95),stoneM,0,0.35,0,top);
    [0,1,2,3].forEach(k=>{const p=mesh(new THREE.PlaneGeometry(0.62,0.62),S(0xffffff,0.9,0,{map:stoneSign((g,w,h)=>glyph(g,q[2],256,256,200,'#2f2a22'))}),0,0.35,0,top);p.rotation.y=k*Math.PI/2;p.translateZ(0.48);p.castShadow=false;});
    const arm=mesh(bx(0.09,0.09,1.15),brassM,0,0.78,-0.5,top);const tip=mesh(new THREE.ConeGeometry(0.14,0.36,4),brassM,0,0.78,-1.18,top);tip.rotation.x=-Math.PI/2;
    mesh(new THREE.SphereGeometry(0.13,10,8),brassM,0,0.78,0,top);
    top.rotation.y=-F.dirs[i]*Math.PI/4;pillars.push({top:top,name:q[2],target:-F.dirs[i]*Math.PI/4});colC(x,z,0.75);
    item(x,ph+1.5,z,0.9,()=>F.pillars?'The '+q[2]+' watcher is locked in place':'Turn the '+q[2]+' watcher',()=>turnPillar(i));
  });
  mesh(bx(0.7,1.2,0.3),stoneM,px+3.2,ph+0.6,pz+7.2);plaqueAt('bird','III',px+3.2,ph+0.85,pz+7.37,0,0.42);colC(px+3.2,pz+7.2,0.45);
}
