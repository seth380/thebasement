/* ---------- the secret: a bookcase, a stairwell and a waterfall cave ---------- */
const SZ0=-7.2,SZ1=-5.8,CAVE={x:-24.5,z:-6.5,r:6.3,y:-3};
const sec={open:!!store.getItem('secret-open'),chest:!!store.getItem('secret-chest'),piv:null,col:null,lid:null,fall:null,mist:[],cx:CAVE.x+2.6,cz:CAVE.z-3.9,gold:null};
function floorY(x){return x>-11?0:-3*Math.min(1,(-11-x)/6);}
{
  const wal=S(0x5c3d28,0.5,0,{map:woodTex}),rockT=mk(256,256,(g,w,h)=>{g.fillStyle='#5a6258';g.fillRect(0,0,w,h);for(let i=0;i<240;i++){g.fillStyle='rgba('+(rnd()<0.45?'40,90,50':rnd()<0.5?'20,22,20':'150,150,140')+','+rnd()*0.2+')';g.beginPath();g.ellipse(rnd()*w,rnd()*h,4+rnd()*26,3+rnd()*14,rnd()*3,0,7);g.fill();}noise(g,w,h,30);},true);
  rockT.wrapS=rockT.wrapT=THREE.RepeatWrapping;const rock=S(0x8a948a,1,0,{map:rockT}),moss=new THREE.MeshStandardMaterial({color:0x23522a,roughness:1,flatShading:true});
  /* bookcase on a hinge */
  const piv=new THREE.Group();piv.position.set(-10.98,0,SZ0);scene.add(piv);sec.piv=piv;if(sec.open)piv.rotation.y=1.7;
  box(0.03,1.86,1.4,wal,0.02,0.93,0.7,piv);[0,1.4].forEach(z=>box(0.34,1.86,0.03,wal,0.17,0.93,z,piv));
  const pal=[0xb8433f,0x1f8a8a,0xe9b949,0x4d5a73,0xf3e6c8,0x6c4bd8,0x2fd08a,0x23262b];
  for(let k=0;k<5;k++){const y=0.03+k*0.455;box(0.34,0.03,1.4,wal,0.17,y,0.7,piv);if(k===4)break;let z=0.06;while(z<1.3){const w=0.03+rnd()*0.035,h=0.22+rnd()*0.14;box(0.22,h,w,S(pal[Math.floor(rnd()*8)],0.8),0.17,y+0.015+h/2,z+w/2,piv,true);z+=w+0.004;}}
  const odd=box(0.24,0.3,0.05,S(0xc0281e,0.6),0.25,1.1,0.72,piv);box(0.012,0.1,0.052,S(0xffc928,0.3,1),0.372,1.1,0.72,piv,true);
  sec.col={x0:-11,x1:-10.6,z0:SZ0,z1:SZ1,off:sec.open};colliders.push(sec.col);
  things.push({x:-10.3,z:-6.5,r:1.35,text:'Pull the red book',cond:()=>!sec.open,fn:()=>{SFX.play('switch');SFX.play('scrape',{delay:0.25,rate:0.6,vol:0.9});SFX.play('scrape',{delay:0.8,rate:0.5,vol:0.7});sec.open=true;sec.col.off=true;store.setItem('secret-open','1');toast('Something behind the bookcase clicks');}});
  [-1,1].forEach(k=>box(0.14,1.9,0.06,S(0x4a2f1c,0.55,0,{map:woodTex}),-11.05,0.95,k>0?SZ1+0.03:SZ0-0.03));
  /* stairwell */
  for(let i=0;i<12;i++)box(0.5,3.4,1.5,rock,-11.25-i*0.5,-(i+1)*0.25-1.7,-6.5,null,true);
  [[SZ0-0.02,0],[SZ1+0.02,Math.PI]].forEach(q=>{const t=rockT.clone();t.needsUpdate=true;t.repeat.set(3,3);const m=new THREE.Mesh(new THREE.PlaneGeometry(7.4,7),S(0x7a847a,1,0,{map:t}));m.position.set(-14.6,-0.6,q[0]);m.rotation.y=q[1];scene.add(m);});
  const ce=box(7.4,0.12,1.6,rock,-14.5,0.42,-6.5,null,true);ce.rotation.z=0.43;
  /* cave shell with a hole where the stairs come in */
  const ico=new THREE.IcosahedronGeometry(1,3).toNonIndexed(),ip=ico.attributes.position,out=[],v=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
  for(let i=0;i<ip.count;i+=3){for(let k=0;k<3;k++){v[k].fromBufferAttribute(ip,i+k);const n=Math.sin(v[k].x*9.1+v[k].y*5.3)*Math.cos(v[k].z*7.7+v[k].y*3.1)*0.09;v[k].multiplyScalar(1+n);v[k].set(CAVE.x+v[k].x*7.3,CAVE.y+1.3+v[k].y*5.2,CAVE.z+v[k].z*7.3);}
    const cx=(v[0].x+v[1].x+v[2].x)/3,cy=(v[0].y+v[1].y+v[2].y)/3,cz=(v[0].z+v[1].z+v[2].z)/3;if(cx>CAVE.x+5.2&&Math.abs(cz-CAVE.z)<1.5&&cy<-0.9&&cy>-3.4)continue;
    v.forEach(q=>out.push(q.x,q.y,q.z));}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(out,3));sg.computeVertexNormals();
  scene.add(new THREE.Mesh(sg,new THREE.MeshStandardMaterial({color:0x232c26,roughness:1,flatShading:true,side:THREE.BackSide})));
  const fl=new THREE.Mesh(new THREE.CircleGeometry(7.6,32),S(0x7d8c7d,1,0,{map:(()=>{const t=rockT.clone();t.needsUpdate=true;t.repeat.set(5,5);return t;})()}));fl.rotation.x=-Math.PI/2;fl.position.set(CAVE.x,CAVE.y,CAVE.z);scene.add(fl);
  /* pond and waterfall */
  const pond=new THREE.Mesh(new THREE.CircleGeometry(2.5,28),new THREE.MeshStandardMaterial({color:0x2a8f8a,roughness:0.08,metalness:0.3,transparent:true,opacity:0.85,emissive:0x0f5a55,emissiveIntensity:0.5}));pond.rotation.x=-Math.PI/2;pond.position.set(CAVE.x-2.9,CAVE.y+0.06,CAVE.z);scene.add(pond);
  const ft=mk(128,512,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<70;i++){const x=rnd()*w,l=60+rnd()*200,y=rnd()*h;g.strokeStyle='rgba(235,255,255,'+(0.25+rnd()*0.5)+')';g.lineWidth=2+rnd()*5;g.beginPath();g.moveTo(x,y);g.lineTo(x+(rnd()-0.5)*6,y+l);g.stroke();g.beginPath();g.moveTo(x,y-h);g.lineTo(x,y+l-h);g.stroke();}},true);ft.wrapT=THREE.RepeatWrapping;
  sec.fall=new THREE.Mesh(new THREE.PlaneGeometry(1.9,6.6),new THREE.MeshBasicMaterial({map:ft,color:0xbff5f0,transparent:true,opacity:0.9,depthWrite:false,toneMapped:false,side:THREE.DoubleSide}));sec.fall.rotation.y=Math.PI/2;sec.fall.position.set(CAVE.x-5.6,CAVE.y+3.25,CAVE.z);scene.add(sec.fall);
  box(1.4,7,2.6,rock,CAVE.x-6.5,CAVE.y+3.2,CAVE.z,null,true);box(1.2,0.5,2.2,moss,CAVE.x-6.2,CAVE.y+6.3,CAVE.z,null,true);
  for(let i=0;i<3;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xdffaf6,transparent:true,opacity:0.35,depthWrite:false}));sp.position.set(CAVE.x-5.2+i*0.3,CAVE.y+0.5,CAVE.z+(i-1)*0.6);sp.scale.set(2.6,1.8,1);scene.add(sp);sec.mist.push(sp);}
  /* moss, stones and glowing mushrooms */
  for(let i=0;i<40;i++){const a=rnd()*6.283,r=4.3+rnd()*2.4,x=CAVE.x+Math.cos(a)*r,z=CAVE.z+Math.sin(a)*r;if(x>CAVE.x+4.4&&Math.abs(z-CAVE.z)<1.3)continue;if(Math.hypot(x-CAVE.x+2.9,z-CAVE.z)<2.3)continue;
    const s2=0.2+rnd()*0.55,m=new THREE.Mesh(new THREE.IcosahedronGeometry(s2,1),rnd()<0.6?moss:new THREE.MeshStandardMaterial({color:0x3c403c,roughness:1,flatShading:true}));m.position.set(x,CAVE.y+s2*0.3,z);m.scale.y=0.55;m.rotation.y=rnd()*6;scene.add(m);}
  const capM=new THREE.MeshBasicMaterial({color:0x7dfff0,toneMapped:false}),stM=new THREE.MeshBasicMaterial({color:0xd8fff8,toneMapped:false});
  const shroom=(x,y,z,s2)=>{const g=new THREE.Group();g.position.set(x,y,z);const st=new THREE.Mesh(new THREE.CylinderGeometry(0.012*s2,0.018*s2,0.12*s2,5),stM);st.position.y=0.06*s2;g.add(st);const c=new THREE.Mesh(new THREE.SphereGeometry(0.06*s2,8,5,0,6.3,0,1.6),capM);c.position.y=0.11*s2;g.add(c);scene.add(g);};
  for(let i=0;i<60;i++){const a=rnd()*6.283,r=3+rnd()*3.4,x=CAVE.x+Math.cos(a)*r,z=CAVE.z+Math.sin(a)*r;if(x>CAVE.x+4.2&&Math.abs(z-CAVE.z)<1)continue;shroom(x,CAVE.y,z,0.8+rnd()*1.6);}
  for(let i=0;i<12;i++)shroom(-11.4-i*0.5,-(i+1)*0.25,i%2?SZ0+0.12:SZ1-0.12,1.2);
  /* real plants from the nature kit, when it is available: ferns and plants round the walls and the pond, mushrooms, mossy rocks */
  {const F=['Fern_1','Plant_1','Plant_7','Plant_1_Big','Mushroom_Common','Mushroom_Laetiporus','Rock_Medium_1','Rock_Medium_2','Grass_Common_Tall','Grass_Wispy_Tall'].map(n=>'nature/'+n+'.gltf');
   const H=[0.9,0.7,0.8,1.3,0.35,0.3,0.8,0.6,0.9,0.6],its=[];
   const free=(x,z)=>!(x>CAVE.x+3.9&&Math.abs(z-CAVE.z)<1.6)&&Math.hypot(x-sec.cx,z-sec.cz)>1.2;
   for(let i=0;i<70;i++){
     const near=i<26,a=rnd()*6.283,r=near?2.6+rnd()*0.7:4.4+rnd()*1.9,x=(near?CAVE.x-2.9:CAVE.x)+Math.cos(a)*r,z=CAVE.z+Math.sin(a)*r;
     if(!free(x,z)||Math.hypot(x-CAVE.x,z-CAVE.z)>6.4)continue;
     const v=near?[0,1,2,9,4][i%5]:[0,0,3,8,4,5,6,7,2,9][i%10];its.push({v:v,x:x,y:CAVE.y,z:z,ry:rnd()*6.28,h:H[v]*(0.75+rnd()*0.6)});}
   GFX.scatter(F,its,scene,{});}
  const cl=new THREE.PointLight(0x7dffe8,1.25,15,1.4);cl.position.set(CAVE.x-1,CAVE.y+2.6,CAVE.z);scene.add(cl);
  /* treasure chest */
  const gold=S(0xffc928,0.25,1),cw=S(0x6b4226,0.7,0,{map:woodTex}),cx=sec.cx,cz=sec.cz,cy=CAVE.y;
  box(1.5,0.3,1.1,rock,cx,cy+0.15,cz,null,true);box(0.9,0.46,0.6,cw,cx,cy+0.53,cz);[-0.3,0.3].forEach(d=>box(0.07,0.48,0.62,gold,cx+d,cy+0.53,cz));
  const lid=new THREE.Group();lid.position.set(cx,cy+0.76,cz-0.3);scene.add(lid);sec.lid=lid;
  const lm=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.9,14,1,false,0,Math.PI),cw);lm.rotation.z=Math.PI/2;lm.rotation.y=0;lm.position.set(0,0,0.3);lid.add(lm);
  [-0.3,0.3].forEach(d=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(0.31,0.31,0.07,14,1,false,0,Math.PI),gold);b.rotation.z=Math.PI/2;b.position.set(d,0,0.3);lid.add(b);});
  box(0.1,0.12,0.03,gold,0,-0.04,0.61,lid,true);
  sec.gold=new THREE.Group();sec.gold.position.set(cx,cy+0.74,cz);scene.add(sec.gold);
  for(let i=0;i<26;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.012,10),gold);c.position.set((rnd()-0.5)*0.7,rnd()*0.08,(rnd()-0.5)*0.42);c.rotation.set(rnd()*1.2,rnd()*3,rnd()*1.2);sec.gold.add(c);}
  const gs=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffd060,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));gs.scale.set(2.2,2.2,1);gs.position.y=0.25;sec.gold.add(gs);
  sec.gold.visible=sec.chest;if(sec.chest)lid.rotation.x=-1.9;
  things.push({x:cx,z:cz+0.6,r:1.6,text:()=>sec.chest?'The chest is open':'Open the old chest',fn:()=>{if(sec.chest){toast('Gold coins, and room for more secrets');return;}SFX.play('open',{rate:0.7});for(let i=0;i<5;i++)SFX.play('coin',{delay:0.35+i*0.13,rate:0.9+i*0.06});SFX.play('win',{delay:1.1});sec.chest=true;store.setItem('secret-chest','1');setTimeout(()=>addCoins(PAY.chest,'Treasure!'),3200);toast('Gold, and an explorer’s hat. It is in your wardrobe now.');}});
}
function secTick(dt,t){
  const p=sec.piv;p.rotation.y+=((sec.open?1.7:0)-p.rotation.y)*Math.min(1,dt*1.6);
  sec.fall.material.map.offset.y=t*0.9;sec.mist.forEach((m,i)=>{m.material.opacity=0.26+Math.sin(t*2+i*2)*0.1;m.position.y=CAVE.y+0.5+Math.sin(t*1.3+i)*0.12;});
  sec.lid.rotation.x+=((sec.chest?-1.9:0)-sec.lid.rotation.x)*Math.min(1,dt*2.5);sec.gold.visible=sec.chest;
}

