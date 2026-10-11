/* ---------- east side: dresser and mirror, fridge, plants, stairs ---------- */
{
  const white=S(0xece7dc,0.55),blk=S(0x15131a,0.4,0.3);
  box(0.5,0.9,1.2,white,10.72,0.45,-1.5);[0.22,0.5,0.78].forEach(y=>{box(0.012,0.24,1.1,S(0xdcd6c8,0.5),10.466,y,-1.5,null,true);[-0.3,0.3].forEach(z=>sph(0.018,S(0xb08d57,0.3,0.9),10.455,y,-1.5+z));});
  const mt=mk(128,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#dfeaf2');gr.addColorStop(0.5,'#9fb4c4');gr.addColorStop(1,'#cfdde8');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(10,h);g.lineTo(50,0);g.lineTo(74,0);g.lineTo(34,h);g.fill();},true);
  const mg=new THREE.Group();box(0.8,1.15,0.04,S(0xb08d57,0.35,0.8),0,0,0,mg);const gl=new THREE.Mesh(new THREE.PlaneGeometry(0.7,1.05),S(0xffffff,0.08,0.3,{map:mt}));gl.position.z=0.022;mg.add(gl);onWall(mg,'e',-1.5,1.72,0.03);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(0.11,16,8,0,Math.PI*2,0,Math.PI/2),S(0xff4d6d,0.8));cap.position.set(10.68,0.9,-1.85);cap.castShadow=true;scene.add(cap);box(0.14,0.012,0.1,S(0xff4d6d,0.8),10.58,0.906,-1.85);
  cyl(0.07,0.08,0.06,S(0xffc928,0.25,1),10.7,0.93,-1.2,null,12);
  solid(10.45,11,-2.12,-0.88);things.push({x:9.9,z:-1.5,r:1.3,text:'Change your look',fn:()=>openCustom()});
  /* fridge and gumball machine */
  box(0.56,0.86,0.56,S(0xc5c9cf,0.35,0.8),10.68,0.43,-5.1);box(0.012,0.5,0.03,blk,10.39,0.5,-4.9,null,true);
  cyl(0.11,0.13,0.12,S(0xd0312d,0.35),10.68,0.92,-5.1);const gm=sph(0.15,new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:0.28,roughness:0.05}),10.68,1.11,-5.1);gm.castShadow=false;
  for(let i=0;i<16;i++)sph(0.03,S(COLORS[i%8],0.35),10.68+(rnd()-0.5)*0.17,1.02+rnd()*0.1,-5.1+(rnd()-0.5)*0.17).castShadow=false;
  cyl(0.06,0.09,0.04,S(0xd0312d,0.35),10.68,1.27,-5.1);solid(10.38,11,-5.4,-4.8);
  /* plants */
  [[-10.35,-2.4],[10.3,2.7],[-10.3,6.9]].forEach(p=>{cyl(0.2,0.15,0.34,S(0xb5653a,0.8),p[0],0.17,p[1]);const lm=S(0x2f7d4a,0.7);
    for(let i=0;i<9;i++){const a=i/9*6.28,l=sph(1,lm,p[0]+Math.cos(a)*0.14,0.62+rnd()*0.25,p[1]+Math.sin(a)*0.14);l.scale.set(0.07,0.34+rnd()*0.14,0.15);l.rotation.set(Math.sin(a)*0.5,-a,-Math.cos(a)*0.5);}
    solid(p[0]-0.24,p[0]+0.24,p[1]-0.24,p[1]+0.24);});
  /* stairs up */
  const tread=S(0x7a5236,0.6,0,{map:woodTex});
  for(let i=0;i<12;i++){box(1.1,0.2*(i+1),0.27,S(0xd8d1c2,0.8),10.42,0.1*(i+1),4.4+0.27*i);box(1.14,0.03,0.3,tread,10.42,0.2*(i+1)+0.015,4.39+0.27*i);}
  const rail=box(0.05,0.05,4.1,tread,9.84,1.75,5.95);rail.rotation.x=-0.637;
  [0,1,2,3].forEach(i=>cyl(0.018,0.018,0.86,blk,9.84,0.2*(i*3+1)+0.5,4.45+0.27*i*3+0.2,null,8));
  const hole=new THREE.Mesh(new THREE.PlaneGeometry(1.2,2.2),new THREE.MeshBasicMaterial({color:0xffe2b0,toneMapped:false}));hole.rotation.x=Math.PI/2;hole.position.set(10.42,RH-0.005,6.7);scene.add(hole);
  
  solid(9.78,11,4.24,8);
}

