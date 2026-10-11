/* ---------- checkers table ---------- */
const ck3={red:[],cream:[],x:-2.4,z:5.4};
{
  const tx=ck3.x,tz=ck3.z,wal=S(0x5c3d28,0.45,0,{map:woodTex}),blk=S(0x0d0d10,0.4,0.2),brass=S(0xb08d57,0.3,0.9);
  box(0.84,0.04,0.84,wal,tx,0.74,tz);cyl(0.05,0.06,0.7,blk,tx,0.37,tz);cyl(0.28,0.3,0.03,blk,tx,0.015,tz);
  box(0.58,0.012,0.58,S(0x2a1a10,0.5),tx,0.764,tz,null,true);
  const bt=mk(256,256,(g)=>{for(let r=0;r<8;r++)for(let c=0;c<8;c++){g.fillStyle=(r+c)%2?'#6b4226':'#e3cfa4';g.fillRect(c*32,r*32,32,32);}},true);
  const bp=sh(new THREE.Mesh(new THREE.PlaneGeometry(0.52,0.52),S(0xffffff,0.45,0,{map:bt})),true);bp.rotation.x=-Math.PI/2;bp.position.set(tx,0.772,tz);scene.add(bp);
  [-1,1].forEach(s=>{const cz=tz+s*0.8;box(0.42,0.04,0.42,wal,tx,0.45,cz);box(0.38,0.03,0.38,S(0x7a1f24,0.95,0,{map:fabricTex}),tx,0.485,cz);
    box(0.42,0.5,0.035,wal,tx,0.74,cz+s*0.195);[-1,1].forEach(a=>[-1,1].forEach(b=>box(0.035,0.44,0.035,wal,tx+a*0.185,0.22,cz+b*0.185)));
    solid(tx-0.22,tx+0.22,cz-0.22,cz+0.22);});
  cyl(0.004,0.004,RH-0.22-1.96,blk,tx,(RH-0.22+1.96)/2,tz,null,6);
  const shd=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.22,0.17,22,1,true),new THREE.MeshStandardMaterial({color:0x1d4a3a,roughness:0.4,side:THREE.DoubleSide,emissive:0x3a2a10,emissiveIntensity:0.6}));shd.position.set(tx,1.88,tz);shd.castShadow=false;scene.add(shd);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.04,10,8),new THREE.MeshBasicMaterial({color:0xffe2a8,toneMapped:false}));bulb.position.set(tx,1.83,tz);scene.add(bulb);cyl(0.02,0.02,0.05,brass,tx,1.98,tz,null,8);
  const pg=new THREE.CylinderGeometry(0.024,0.024,0.012,16),rm=S(0xc22a20,0.4),cm=S(0xefe4cd,0.4);
  for(let i=0;i<12;i++){[['red',rm],['cream',cm]].forEach(t=>{const m=sh(new THREE.Mesh(pg,t[1]));m.visible=false;scene.add(m);ck3[t[0]].push(m);});}
  solid(tx-0.44,tx+0.44,tz-0.44,tz+0.44);
  things.push({x:tx,z:tz,r:1.9,text:'Play checkers',fn:()=>openChk()});
}
function ckSync(b){
  let ri=0,ci=0;ck3.red.forEach(m=>m.visible=false);ck3.cream.forEach(m=>m.visible=false);
  for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const m=p>0?ck3.red[ri++]:ck3.cream[ci++];if(!m)continue;const k=Math.abs(p)===2;
    m.visible=true;m.scale.y=k?2.2:1;m.position.set(ck3.x+((i&7)-3.5)*0.065,0.773+(k?0.0132:0.006),ck3.z+((i>>3)-3.5)*0.065);}
}

