/* ---------- mood lighting: sconces, string lights, underglow ---------- */
function underglow(x,z,w,d,col,op){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:glowTex,color:col,transparent:true,opacity:op||0.55,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));m.rotation.x=-Math.PI/2;m.position.set(x,0.022,z);m.renderOrder=2;scene.add(m);return m;}
const glows=[underglow(-6.9,2.4,5.6,7.2,0x8a4dff,1),underglow(6.4,-2.2,5.6,4.2,0x2fe0c8,0.95),underglow(5.4,5,4,3.4,0xff5a3a,0.85),underglow(-2.4,5.4,3,3,0xffb84a,0.85),underglow(1.2,5.7,3,3,0x4ad8ff,0.85),underglow(-10.4,2,2.2,4.2,0x4a7dff,0.85),underglow(-8.6,-7.2,3.4,2.4,0x2fe0c8,0.85)];
META.forEach((m,i)=>glows.push(underglow((i-2)*2.05,-6.9,2.2,2.6,m.hex,0.9)));
{
  const strip=(w,d,x,y,z,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.025,d),new THREE.MeshBasicMaterial({color:c,toneMapped:false}));m.position.set(x,y,z);scene.add(m);};
  strip(0.03,2.5,-6.99,0.1,2,0xa66bff);strip(2.6,0.03,-7.3,0.1,3.3,0xa66bff);strip(2.4,0.03,6.4,0.64,-2.95,0x4ff0d8);strip(2.4,0.03,6.4,0.64,-1.45,0x4ff0d8);
  const brass=S(0xb08d57,0.35,0.85),shadeM=new THREE.MeshBasicMaterial({color:0xffd7a0,toneMapped:false,side:THREE.DoubleSide});
  [['w',0.3],['w',3.9],['s',-6.8],['s',-1.1],['s',4.9],['e',3.0],['e',-2.6],['n',-10.3],['n',10.4]].forEach(q=>{
    const g=new THREE.Group();box(0.12,0.3,0.03,brass,0,0,0.015,g,true);box(0.03,0.03,0.1,brass,0,-0.06,0.06,g,true);
    const sh2=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.11,0.24,12,1,true),shadeM);sh2.position.set(0,0.06,0.12);g.add(sh2);
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffb060,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));halo.scale.set(1.3,1.3,1);halo.position.set(0,0.08,0.14);g.add(halo);
    const wash=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.2),new THREE.MeshBasicMaterial({map:glowTex,color:0xffa050,transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));wash.position.set(0,0.2,0.012);g.add(wash);
    onWall(g,q[0],q[1],1.78,0.02);});
  [[-1,1.9,7.3],[10.3,1.9,0.6]].forEach(p=>{const l=new THREE.PointLight(0xffa860,0.6,9,1.5);l.position.set(p[0],p[1],p[2]);scene.add(l);});
  const cg=new THREE.PointLight(0x8a4dff,0.9,5,1.5);cg.position.set(-6.7,0.3,2.4);scene.add(cg);
}
const xmas={mesh:null,base:[],t:0};
{
  const pts=[],y0=2.6,hook=1.5,sag=(d)=>-0.09*Math.sin(Math.PI*((d%hook)/hook));
  const run=(x1,z1,x2,z2,yy)=>{const L=Math.hypot(x2-x1,z2-z1);for(let d=0.15;d<L;d+=0.34)pts.push([x1+(x2-x1)*d/L,yy+sag(d),z1+(z2-z1)*d/L]);};
  const a=RX-0.09,b=RZ-0.09;run(-a,-b,a,-b,y0+0.12);run(a,-b,a,b,y0);run(a,b,-a,b,y0);run(-a,b,-a,-b,y0);run(-a,1.37,a,1.37,2.36);
  const cols=[0xff3b3b,0x39d353,0x3b82ff,0xffc93b,0xff5fd0],m=new THREE.InstancedMesh(new THREE.SphereGeometry(0.03,6,5),new THREE.MeshBasicMaterial({toneMapped:false}),pts.length),d=new THREE.Object3D(),c=new THREE.Color();
  pts.forEach((p,i)=>{d.position.set(p[0],p[1],p[2]);d.updateMatrix();m.setMatrixAt(i,d.matrix);c.setHex(cols[i%5]);m.setColorAt(i,c);xmas.base.push(cols[i%5]);});
  scene.add(m);xmas.mesh=m;
}
function xmasTick(dt){xmas.t-=dt;if(xmas.t>0)return;xmas.t=0.14;const c=new THREE.Color(),n=xmas.base.length;for(let k=0;k<9;k++){const i=Math.floor(Math.random()*n);c.setHex(xmas.base[i]).multiplyScalar(0.3+Math.random()*1.1);xmas.mesh.setColorAt(i,c);}xmas.mesh.instanceColor.needsUpdate=true;}

