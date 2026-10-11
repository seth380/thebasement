/* ---------- temple: door, altar and vault ---------- */
const temple={door:null,doorCol:null,lens:null,lid:null,key:null,fire:[]};
{
  const th=PADS[2].h,z0=-34,z1=-25,Hh=4.2;
  mesh(bx(9.4,0.3,10.4),stoneM,0,th+0.05,-29.3).castShadow=false;
  [[0,-22.9,5.6,0.18,1.6],[0,-23.8,7,0.3,1.4]].forEach(s=>mesh(bx(s[2],s[3],s[4]),stoneM,0,th-0.1+s[3]/2+(s[1]<-23.5?0.1:0),s[1]));
  mesh(bx(8.6,Hh,0.6),stoneM,0,th+Hh/2,z0);[-1,1].forEach(s=>{mesh(bx(0.6,Hh,9.6),stoneM,s*4,th+Hh/2,-29.5);mesh(bx(2.9,Hh,0.6),stoneM,s*2.55,th+Hh/2,z1);});
  mesh(bx(2.2,1.0,0.6),stoneM,0,th+Hh-0.5,z1);mesh(bx(9.6,0.5,11.4),stoneM,0,th+Hh+0.25,-29.2);
  const tri=new THREE.Shape();tri.moveTo(-5,0);tri.lineTo(5,0);tri.lineTo(0,1.7);tri.closePath();const ped=mesh(new THREE.ExtrudeGeometry(tri,{depth:0.7,bevelEnabled:false}),stoneM,0,th+Hh+0.5,-24.2);
  [-3.6,-1.9,1.9,3.6].forEach(x=>{mesh(cy(0.36,0.42,Hh,12),stoneM,x,th+Hh/2,-23.6);mesh(bx(1,0.25,1),stoneM,x,th+Hh-0.12,-23.6);colC(x,-23.6,0.5);});
  mesh(bx(8.4,0.5,1.6),stoneM,0,th+Hh+0.25,-23.7);
  const carve=stoneSign((g,w,h)=>{SYMS.forEach((n,i)=>glyph(g,n,56+i*80,256,30,'#2f2a22'));});carve.repeat.set(1,0.24);carve.offset.set(0,0.38);
  const fr=mesh(new THREE.PlaneGeometry(4.6,0.55),S(0xffffff,0.9,0,{map:carve}),0,th+Hh-0.45,z1+0.31);fr.castShadow=false;
  colB(-4.3,4.3,z0-0.3,z0+0.3);colB(-4.3,-3.7,z0,z1);colB(3.7,4.3,z0,z1);colB(-4.3,-1.1,z1-0.3,z1+0.3);colB(1.1,4.3,z1-0.3,z1+0.3);
  temple.doorCol={x0:-1.1,x1:1.1,z0:z1-0.3,z1:z1+0.3,off:F.pillars};cols.push(temple.doorCol);
  temple.door=mesh(bx(2.2,3.2,0.45),S(0xffffff,0.9,0,{map:stoneSign((g,w,h)=>{g.strokeStyle='#2f2a22';g.lineWidth=10;g.strokeRect(40,40,w-80,h-80);ANIMALS.forEach((n,i)=>glyph(g,n,150+(i%2)*212,160+Math.floor(i/2)*200,66,'#2f2a22'));})}),0,th+(F.pillars?-1.75:1.6),z1);
  item(0,th+1.5,z1+0.4,1.2,()=>F.pillars?'':'A stone door. Four animals are carved on it',()=>say('The door has no handle. Four animals are carved into it: gull, crab, turtle, fish.')).cond=()=>!F.pillars;
  /* inside */
  const al=mesh(bx(1.7,1.0,1.0),stoneM,0,th+0.7,-31.4);mesh(new THREE.TorusGeometry(0.2,0.045,8,20),brassM,0,th+1.22,-31.4).rotation.x=Math.PI/2;colB(-0.95,0.95,-32,-30.8);
  temple.lens=mesh(new THREE.OctahedronGeometry(0.19,0),new THREE.MeshStandardMaterial({color:0x9ff3ea,emissive:0x3fd0c0,emissiveIntensity:1.4,roughness:0.1,transparent:true,opacity:0.9}),0,th+1.5,-31.4);temple.lens.visible=F.lens;temple.lens.castShadow=false;
  item(0,th+1.25,-31.2,0.9,()=>F.key?'The altar is quiet now':F.lens?'Study the altar':F.crystal?'Set the crystal in the altar':'Look at the altar',()=>useAltar());
  temple.lid=mesh(bx(1.1,0.9,0.25),stoneM,F.key||F.vault?1.2:0,th+2.0,z0+0.5);mesh(bx(1.0,0.8,0.2),S(0x15130f,1),0,th+2.0,z0+0.36).castShadow=false;
  temple.key=mesh(bx(0.08,0.3,0.03),brassM,0,th+1.95,z0+0.55);mesh(new THREE.TorusGeometry(0.07,0.02,6,14),brassM,0,0.2,0,temple.key);temple.key.visible=!!F.vault&&!F.key;
  item(0,th+2.0,z0+0.6,0.6,()=>'Take the brass key',()=>takeKey()).cond=()=>F.vault&&!F.key;
  const ins=mesh(new THREE.PlaneGeometry(2.2,1.3),S(0xffffff,0.9,0,{map:stoneSign((g,w,h)=>{g.fillStyle='#2f2a22';g.font='bold 60px Georgia,serif';g.textAlign='center';['I   II   III   IV'].forEach((l,i)=>g.fillText(l,256,150));g.font='italic 34px Georgia,serif';g.fillText('each place wears its number',256,260);g.fillText('and its sign',256,310);})}),-3.68,th+1.9,-29.5);ins.rotation.y=Math.PI/2;ins.castShadow=false;
  item(-3.6,th+1.9,-29.5,1.0,()=>'Read the carving on the wall',()=>readNote(4));
  [-2.6,2.6].forEach(x=>{mesh(cy(0.1,0.16,1.1,8),darkM,x,th+0.75,-32.8);mesh(cy(0.34,0.16,0.22,12),brassM,x,th+1.4,-32.8);
    const f=mesh(new THREE.ConeGeometry(0.2,0.5,8),new THREE.MeshBasicMaterial({color:0xff8a2a,transparent:true,opacity:0.92,toneMapped:false}),x,th+1.75,-32.8);f.castShadow=false;temple.fire.push(f);colC(x,-32.8,0.3);});
  temple.light=new THREE.PointLight(0xffa85a,1.1,11,1.5);temple.light.position.set(0,th+2.6,-31);scene.add(temple.light);
}
/* ---------- the glass house (lab) ---------- */
const lab={door:null,doorCol:null,liq:[],crystal:null};
{
  const lh=PADS[3].h,cx=40,cz=0,R=3.5;
  mesh(cy(5.2,5.4,0.3,24),stoneM,cx,lh+0.05,cz).castShadow=false;mesh(cy(4.2,4.2,0.06,24),woodM,cx,lh+0.24,cz).castShadow=false;
  const wallSeg=(x,z,w,d,gap)=>{mesh(bx(w,1.0,d),stoneM,x,lh+0.7,z);const g=mesh(bx(Math.max(0.06,w-0.14),2.3,Math.max(0.06,d-0.14)),glassM,x,lh+2.35,z);g.castShadow=false;mesh(bx(w,0.14,d),brassM,x,lh+3.55,z);mesh(bx(w,0.08,d),brassM,x,lh+1.24,z);colB(x-w/2-0.05,x+w/2+0.05,z-d/2-0.05,z+d/2+0.05);};
  wallSeg(cx,cz-R,2*R,0.2);wallSeg(cx,cz+R,2*R,0.2);wallSeg(cx+R,cz,0.2,2*R);wallSeg(cx-R,cz-2.2,0.2,2.6);wallSeg(cx-R,cz+2.2,0.2,2.6);
  [[-R,-R],[R,-R],[-R,R],[R,R],[-R,-0.9],[-R,0.9]].forEach(p=>mesh(bx(0.22,3.4,0.22),brassM,cx+p[0],lh+1.9,cz+p[1]));
  mesh(bx(0.22,0.9,1.8),brassM,cx-R,lh+3.17,cz);
  const dome=mesh(new THREE.SphereGeometry(5.1,24,10,0,Math.PI*2,0,Math.PI/2),S(0x5f9a8a,0.55,0.6,{side:THREE.DoubleSide}),cx,lh+3.6,cz);dome.scale.y=0.5;
  mesh(new THREE.SphereGeometry(0.3,10,8),brassM,cx,lh+6.3,cz);mesh(cy(0.04,0.04,1.4,6),brassM,cx,lh+7,cz);
  lab.doorCol={x0:cx-R-0.2,x1:cx-R+0.2,z0:cz-0.9,z1:cz+0.9,off:F.power};cols.push(lab.doorCol);
  lab.door=mesh(bx(0.12,2.5,1.8),woodM,cx-R,lh+1.5,cz+(F.power?1.75:0));mesh(new THREE.TorusGeometry(0.12,0.03,6,14),brassM,-0.08,0,0.5,lab.door).rotation.y=Math.PI/2;
  item(cx-R-0.2,lh+1.5,cz,1.0,()=>'A locked door. A dead lamp hangs over it',()=>say('The door is held shut by a brass bolt with a wire running into the wall. No power, no door.')).cond=()=>!F.power;
  plaqueAt('eye','II',cx-R-0.13,lh+1.7,cz+1.75,-Math.PI/2,0.42);
  /* vessel machine */
  mesh(bx(4.2,0.9,0.9),darkM,cx,lh+0.7,cz-2.75);colB(cx-2.2,cx+2.2,cz-3.3,cz-2.25);
  [-1.3,0,1.3].forEach((x,i)=>{const g=mesh(cy(0.34,0.34,1.5,18),glassM,cx+x,lh+1.9,cz-2.75);g.castShadow=false;mesh(cy(0.38,0.38,0.08,18),brassM,cx+x,lh+2.68,cz-2.75);mesh(cy(0.38,0.38,0.08,18),brassM,cx+x,lh+1.16,cz-2.75);
    const l=mesh(cy(0.3,0.3,1,18),new THREE.MeshStandardMaterial({color:[0x3fd0c0,0xe0733a,0xc9a15a][i],emissive:[0x3fd0c0,0xe0733a,0xc9a15a][i],emissiveIntensity:0.35,roughness:0.2,transparent:true,opacity:0.85}),cx+x,lh+1.2,cz-2.75);l.castShadow=false;lab.liq.push(l);});
  mesh(bx(1.5,0.5,0.06),brassM,cx,lh+0.85,cz-2.27);
  item(cx,lh+1.5,cz-2.4,1.3,()=>F.crystal||F.lens?'The vessels have settled':'Work the three vessels',()=>openVessels());
  mesh(bx(0.5,0.06,0.4),brassM,cx+1.75,lh+1.18,cz-2.5);lab.crystal=mesh(new THREE.OctahedronGeometry(0.17,0),temple.lens.material,cx+1.75,lh+1.42,cz-2.5);lab.crystal.visible=false;lab.crystal.castShadow=false;
  /* mural of the four watchers */
  const mural=tex(1024,512,(g,w,h)=>{g.fillStyle='#d9cba8';g.fillRect(0,0,w,h);grain(g,w,h,22);g.strokeStyle='#4a3a22';g.lineWidth=8;g.strokeRect(14,14,w-28,h-28);
    const pic=[['gull',(x,y)=>{g.fillRect(x-10,y-70,20,140);g.beginPath();g.moveTo(x-22,y-70);g.lineTo(x+22,y-70);g.lineTo(x,y-110);g.fill();g.beginPath();g.arc(x,y-78,34,0,7);g.stroke();}],
      ['crab',(x,y)=>{g.beginPath();g.moveTo(x-60,y+20);g.quadraticCurveTo(x,y+70,x+60,y+20);g.closePath();g.fill();g.fillRect(x-4,y-60,8,80);g.beginPath();g.moveTo(x+4,y-60);g.lineTo(x+50,y-10);g.lineTo(x+4,y-10);g.fill();}],
      ['turtle',(x,y)=>{g.fillRect(x-60,y-50,120,14);[-45,-15,15,45].forEach(d=>g.fillRect(x+d-7,y-36,14,100));g.beginPath();g.moveTo(x-70,y-50);g.lineTo(x+70,y-50);g.lineTo(x,y-95);g.fill();}],
      ['fish',(x,y)=>{g.strokeRect(x-55,y-20,110,80);g.beginPath();g.arc(x,y-20,55,Math.PI,0);g.stroke();g.beginPath();g.moveTo(x,y-75);g.lineTo(x,y-100);g.stroke();}]];
    pic.forEach((p,i)=>{const x=140+i*248;glyph(g,p[0],x,120,62,'#3a2a14');g.strokeStyle='#3a2a14';g.fillStyle='#3a2a14';g.lineWidth=6;g.beginPath();g.moveTo(x,200);g.lineTo(x,262);g.moveTo(x-14,246);g.lineTo(x,264);g.lineTo(x+14,246);g.stroke();p[1](x,380);});});
  const mm=mesh(new THREE.PlaneGeometry(4.6,2.3),S(0xffffff,0.9,0,{map:mural}),cx+R-0.13,lh+2.2,cz);mm.rotation.y=-Math.PI/2;mm.castShadow=false;
  item(cx+R-0.3,lh+2.1,cz,1.6,()=>'Study the painted panel',()=>readNote(2));
  const pl=mesh(new THREE.PlaneGeometry(0.9,0.36),S(0xefe3c8,0.9),cx,lh+0.85,cz-2.235);pl.castShadow=false;
  item(cx,lh+0.85,cz-2.2,0.6,()=>'Read the plate on the machine',()=>readNote(3));
  mesh(bx(1.6,0.8,0.8),woodM,cx+2.4,lh+0.67,cz+2.6);colB(cx+1.5,cx+3.3,cz+2.1,cz+3.2);mesh(new THREE.SphereGeometry(0.3,16,12),S(0x5f8f9a,0.3,0.4),cx+2.4,lh+1.42,cz+2.6);mesh(cy(0.04,0.2,0.12,10),brassM,cx+2.4,lh+1.12,cz+2.6);
}
/* ---------- lighthouse ---------- */
const tower={door:null,bulb:null,beams:null,light:null,lever:null};
{
  const hh=PADS[4].h,x=38,z=38;
  mesh(cy(1.75,2.35,15,24),S(0xffffff,0.9,0,{map:T.stone}),x,hh+7.5,z);mesh(cy(2.4,2.4,0.3,24),darkM,x,hh+15.1,z);mesh(new THREE.TorusGeometry(2.35,0.05,6,28),brassM,x,hh+16,z).rotation.x=Math.PI/2;
  const lg=mesh(cy(1.35,1.35,2.2,16,1,true),glassM,x,hh+16.4,z);lg.castShadow=false;mesh(new THREE.ConeGeometry(1.7,1.3,16),S(0x5f9a8a,0.55,0.6),x,hh+18.1,z);
  tower.bulb=mesh(new THREE.SphereGeometry(0.5,14,12),new THREE.MeshStandardMaterial({color:0x4a4a44,emissive:0xfff0c0,emissiveIntensity:0}),x,hh+16.3,z);tower.bulb.castShadow=false;
  tower.beams=new THREE.Group();tower.beams.position.set(x,hh+16.3,z);tower.beams.visible=false;scene.add(tower.beams);
  [0,Math.PI].forEach(a=>{const b=new THREE.Mesh(new THREE.ConeGeometry(4.5,70,20,1,true),new THREE.MeshBasicMaterial({color:0xfff2cc,transparent:true,opacity:0.04,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,fog:false}));b.rotation.z=Math.PI/2;b.position.x=35;const g=new THREE.Group();g.add(b);g.rotation.y=a;tower.beams.add(g);});
  tower.light=new THREE.PointLight(0xfff0c8,0,90,1.2);tower.light.position.set(x,hh+16.3,z);scene.add(tower.light);
  colC(x,z,2.5);
  mesh(bx(0.5,2.5,1.5),S(0x0d0c0a,1),x-2.12,hh+1.3,z).castShadow=false;
  const piv=new THREE.Group();piv.position.set(x-2.4,hh+1.3,z-0.65);scene.add(piv);mesh(bx(0.1,2.3,1.3),woodM,0,0,0.65,piv);mesh(new THREE.SphereGeometry(0.06,8,6),brassM,-0.08,0,1.15,piv);tower.door=piv;if(F.door)piv.rotation.y=-1.9;
  plaqueAt('star','IV',x-2.3,hh+1.75,z+1.25,-Math.PI/2-0.45,0.42);
  tower.lever=mesh(bx(0.06,0.7,0.06),brassM,x-2.05,hh+1.35,z);tower.lever.rotation.z=F.beacon?-0.7:0.7;mesh(new THREE.SphereGeometry(0.08,8,6),S(0xb03a2e,0.4),0,0.36,0,tower.lever);
  item(x-2.5,hh+1.3,z,1.1,()=>F.door?(F.beacon?'The lever is thrown':'Throw the lever'):F.key?'Unlock the lighthouse door':'A heavy door with a brass keyhole',()=>useTower());
}
