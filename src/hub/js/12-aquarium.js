/* ---------- aquarium ---------- */
const fish=[],bubbles=[],weeds=[];let feedT=0;
{
  const ax=-8.6,az=-7.62,w=1.6,h=0.62,d=0.46,y0=0.82,wal=S(0x5c3d28,0.5,0,{map:woodTex}),blk=S(0x0d0d10,0.4,0.2);
  box(w+0.1,y0-0.02,d+0.1,wal,ax,(y0-0.02)/2,az);[-0.4,0.4].forEach(s=>box(0.012,0.6,0.012,blk,ax+s,0.4,az+d/2+0.056,null,true));box(0.012,0.6,0.012,blk,ax,0.4,az+d/2+0.056,null,true);
  box(w+0.04,0.035,d+0.04,blk,ax,y0+0.005,az);box(w+0.04,0.08,d+0.04,blk,ax,y0+h+0.04,az);
  box(w-0.02,h,0.01,new THREE.MeshBasicMaterial({color:0x0a2f55}),ax,y0+h/2,az-d/2+0.012,null,true);
  const gt=mk(128,128,(g,W,H)=>{g.fillStyle='#cdb98f';g.fillRect(0,0,W,H);noise(g,W,H,70);},true);
  box(w-0.03,0.05,d-0.03,S(0xffffff,0.95,0,{map:gt}),ax,y0+0.045,az,null,true);
  const water=new THREE.Mesh(new THREE.BoxGeometry(w-0.03,h-0.06,d-0.03),new THREE.MeshStandardMaterial({color:0x3aa6d8,transparent:true,opacity:0.2,roughness:0.1,emissive:0x0d4f7a,emissiveIntensity:0.7,depthWrite:false}));water.position.set(ax,y0+h/2-0.01,az);scene.add(water);
  const glass=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:0xcfefff,transparent:true,opacity:0.1,roughness:0.02,depthWrite:false}));glass.position.set(ax,y0+h/2,az);scene.add(glass);
  const strip=box(w-0.1,0.012,0.05,new THREE.MeshBasicMaterial({color:0xcff6ff,toneMapped:false}),ax,y0+h-0.005,az,null,true);
  [[-0.5,0.11,0x6d6f78],[0.2,0.08,0x7c7468],[0.42,0.06,0x5f6470]].forEach(r=>{const m=sh(new THREE.Mesh(new THREE.IcosahedronGeometry(r[1],0),new THREE.MeshStandardMaterial({color:r[2],roughness:0.9,flatShading:true})));m.position.set(ax+r[0],y0+0.09,az-0.05+rnd()*0.1);m.rotation.set(rnd()*3,rnd()*3,0);scene.add(m);});
  box(0.1,0.06,0.07,S(0x6b4226,0.7),ax-0.15,y0+0.1,az+0.05);box(0.1,0.02,0.07,S(0xffc928,0.25,1),ax-0.15,y0+0.14,az+0.03).rotation.x=-0.5;
  const wm=new THREE.MeshStandardMaterial({color:0x2fae5f,roughness:0.7,emissive:0x0f5a2a,emissiveIntensity:0.5});
  [-0.68,-0.6,-0.3,0.05,0.56,0.66,0.3].forEach((x,i)=>{const g=new THREE.Group();g.position.set(ax+x,y0+0.07,az-0.12+(i%3)*0.06);
    for(let k=0;k<3;k++){const hh=0.16+rnd()*0.22,c=new THREE.Mesh(new THREE.ConeGeometry(0.014,hh,5),wm);c.position.set((k-1)*0.025,hh/2,0);c.rotation.z=(k-1)*0.12;g.add(c);}
    scene.add(g);weeds.push({g:g,p:rnd()*6});});
  const cols=[0xff7a1a,0xffd23f,0x4fc3ff,0xff5fa2,0xe8eef2,0xff7a1a,0x9b7bff,0xffd23f,0x4fc3ff];
  cols.forEach((c,i)=>{const g=new THREE.Group(),sz=0.045+rnd()*0.03,m=new THREE.MeshStandardMaterial({color:c,roughness:0.4,emissive:c,emissiveIntensity:0.3});
    const b=new THREE.Mesh(new THREE.SphereGeometry(sz,12,10),m);b.scale.set(1,0.62,0.4);g.add(b);
    const t=new THREE.Mesh(new THREE.ConeGeometry(sz*0.55,sz*0.9,4),m);t.rotation.z=-Math.PI/2;t.scale.z=0.3;const tp=new THREE.Group();tp.position.x=-sz*0.85;t.position.x=-sz*0.4;tp.add(t);g.add(tp);
    const e=new THREE.Mesh(new THREE.SphereGeometry(sz*0.13,6,6),new THREE.MeshBasicMaterial({color:0x111111}));e.position.set(sz*0.6,sz*0.15,sz*0.32);g.add(e);const e2=e.clone();e2.position.z=-sz*0.32;g.add(e2);
    scene.add(g);fish.push({g:g,tail:tp,cx:ax+(rnd()-0.5)*0.3,cy:y0+0.16+rnd()*0.34,cz:az+(rnd()-0.5)*0.12,amp:0.42+rnd()*0.22,sp:0.35+rnd()*0.5,ph:rnd()*6,up:0,top:y0+h-0.1,face:0});});
  /* real fish from the Cute Fish Pack when available: each swaps in for a stand-in fish, swims, and darts about at feeding time */
  const FISH=['Clownfish','BlueTang','YellowTang','Goldfish','Betta','MandarinFish','ZebraClownFish','RoyalGramma','MoorishIdol','Puffer','Tetra','ButterflyFish'];
  fish.forEach((f,i)=>{const file='fish/'+FISH[i%FISH.length]+'.glb';GFX.preload(file,()=>{
    const a=GFX.actor(file,{size:FISH[i%FISH.length]==='Puffer'?0.14:0.17+rnd()*0.05,center:true,yaw:Math.PI/2,start:'Swimming_Normal'});if(!a)return;
    /* the pack's colours export a little dull; lift them once per material */
    a.body.traverse(o=>{if(o.isMesh&&!o.material.userData.lift){o.material.userData.lift=1;o.material.color.multiplyScalar(2.3);o.material.roughness=0.45;}});
    f.g.children.slice().forEach(c=>{if(c!==f.tail)c.visible=false;});f.tail.visible=false;f.g.add(a.g);f.actor=a;});});
  for(let i=0;i<9;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(0.008+rnd()*0.006,6,6),new THREE.MeshBasicMaterial({color:0xdff7ff,transparent:true,opacity:0.7}));scene.add(m);bubbles.push({m:m,x:ax+0.62+(rnd()-0.5)*0.05,z:az+(rnd()-0.5)*0.05,y0:y0+0.08,h:h-0.14,p:rnd()});}
  solid(ax-0.87,ax+0.87,-RZ,az+0.3);
  things.push({x:ax,z:-6.75,r:1.2,text:'Feed the fish',fn:()=>{SFX.play('glass');for(let i=0;i<6;i++)SFX.blip(500+i*90,1100+i*90,0.07,'sine',0.04,{delay:0.15+i*0.11});feedT=6;toast('The fish swim up to eat');}});
}

