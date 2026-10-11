/* ---------- lights ---------- */
const hemi=new THREE.HemisphereLight(0xfff1dc,0x2a2019,0.16);scene.add(hemi);
const spots=[[0,-4.6,1,0.5]].map(p=>{
  box(0.16,0.05,1.2,new THREE.MeshBasicMaterial({color:0xffe2b8,toneMapped:false}),p[0],RH-0.25,p[1],null,true);
  const l=new THREE.SpotLight(0xffd3a0,p[3],12,0.85,0.8,1.3);l.position.set(p[0],RH-0.3,p[1]);l.target.position.set(p[0],0,p[1]);
  if(p[2]&&!coarse){l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.bias=-0.0006;l.shadow.radius=4;l.shadow.camera.near=0.3;l.shadow.camera.far=8;}
  scene.add(l,l.target);return l;});
const neonL=new THREE.PointLight(0xff4fa0,1.0,9,1.6);neonL.position.set(0,2.2,-7.2);scene.add(neonL);
const tvL=new THREE.PointLight(0x7fa8ff,0.5,6,1.5);tvL.position.set(-10.2,1.5,2);scene.add(tvL);
let lampL=null;
const pendL=new THREE.PointLight(0xffc27a,1.0,6.5,1.6);pendL.position.set(-2.4,1.7,5.4);scene.add(pendL);
const aqL=new THREE.PointLight(0x6fe3ff,0.9,5.5,1.6);aqL.position.set(-8.6,1.25,-7.1);scene.add(aqL);
const winS=new THREE.PointLight(0xdcecff,0.6,11,1.4);winS.position.set(0.4,2.3,7.1);scene.add(winS);
const winE=new THREE.PointLight(0xdcecff,0.5,9,1.4);winE.position.set(10.1,2.3,-2.5);

