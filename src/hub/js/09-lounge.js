/* ---------- lounge ---------- */
const tvTex=mk(512,288,(g,w,h,t)=>{
  t=t||0;const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#101638');gr.addColorStop(1,'#2a1050');g.fillStyle=gr;g.fillRect(0,0,w,h);
  const bx=Math.abs(((t*60)%(2*(w-40)))-(w-40)),by=Math.abs(((t*43)%(2*(h-40)))-(h-40));g.fillStyle='rgba(47,208,138,.35)';g.fillRect(bx,by,40,40);
  title(g,'HIGH SCORES',w/2,44,44,'#ffc928');
  const st=trophyState();
  META.forEach((m,i)=>{const y=92+i*33;g.font='900 22px Nunito,sans-serif';g.textAlign='left';g.fillStyle='#fff8e7';g.fillText(m.name,28,y);
    g.textAlign='right';g.fillStyle='#2fd08a';g.fillText(st[i].rec.replace(/^(Best race|High score) /,''),w-28,y);});
  g.textAlign='center';g.fillStyle='#ff8fc0';g.font='900 20px Nunito,sans-serif';g.fillText('Trophies '+st.reduce((a,s)=>a+s.t.filter(x=>x[0]).length,0)+' of 15   ·   Checkers wins '+(readJ('chk-stats').w||0),w/2,h-22);
});
{
  const walnut=S(0x7a5236,0.5,0,{map:woodTex}),blk=S(0x0d0d10,0.35,0.3),fab=S(0x4d5a73,0.95,0,{map:fabricTex}),fab2=S(0x43506a,0.95,0,{map:fabricTex});
  /* rug, console, TV */
  const rug=sh(new THREE.Mesh(new THREE.PlaneGeometry(3.7,4.6),S(0xffffff,0.98,0,{map:rugTex})),true);rug.rotation.x=-Math.PI/2;rug.position.set(-8.55,0.012,2.2);scene.add(rug);
  box(0.45,0.42,2.4,walnut,-10.74,0.36,2);[-1,1].forEach(s=>[-1,1].forEach(q=>cyl(0.02,0.015,0.15,blk,-10.74+q*0.17,0.075,2+s*1.1,null,8)));
  [1.2,2,2.8].forEach(z=>box(0.01,0.34,0.012,blk,-10.512,0.36,z,null,true));
  box(0.1,0.07,1.05,blk,-10.68,0.61,2);box(0.2,0.06,0.3,S(0xf1f1f1,0.4),-10.76,0.6,2.95);box(0.12,0.03,0.16,S(0x22242a,0.5),-10.72,0.59,1.1);
  box(0.05,0.96,1.66,blk,-10.93,1.62,2);
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(1.58,0.88),new THREE.MeshBasicMaterial({map:tvTex,toneMapped:false}));scr.rotation.y=Math.PI/2;scr.position.set(-10.9,1.62,2);scene.add(scr);
  solid(-11,-10.48,0.75,3.25);
  /* sectional couch */
  box(1.05,0.3,2.6,fab2,-6.475,0.27,2);box(0.22,0.78,2.6,fab2,-6.06,0.58,2);box(1.05,0.62,0.22,fab2,-6.475,0.43,0.72);
  [1.14,2,2.86].forEach(z=>{box(0.8,0.17,0.84,fab,-6.6,0.5,z).rotation.y=(rnd()-0.5)*0.02;box(0.2,0.44,0.8,fab,-6.25,0.82,z).rotation.z=-0.16;});
  box(2.75,0.3,0.95,fab2,-7.325,0.27,3.775);box(2.75,0.78,0.22,fab2,-7.325,0.58,4.14);box(0.22,0.62,0.95,fab2,-8.68,0.43,3.775);
  [-8.15,-7.3,-6.45].forEach(x=>{box(0.84,0.17,0.72,fab,x,0.5,3.66);box(0.8,0.44,0.2,fab,x,0.82,3.95).rotation.x=0.16;});
  [[-6.4,0.72,1.05,0xe9b949,0.5],[-6.35,0.74,3.05,0xb8433f,-0.4],[-8.3,0.74,3.85,0x1f8a8a,0.3]].forEach(p=>{const m=box(0.4,0.4,0.13,S(p[3],0.95,0,{map:fabricTex}),p[0],p[1],p[2]);m.rotation.set(0.3,p[4],0.2);});
  [[-6.95,0.85],[-6.95,3.25],[-6,0.75],[-8.7,3.4],[-8.7,4.15],[-6,4.15]].forEach(p=>cyl(0.025,0.02,0.12,blk,p[0],0.06,p[1],null,8));
  solid(-7.02,-5.92,0.58,3.3);solid(-8.82,-5.92,3.3,4.28);
  things.push({x:-7.5,z:2,r:1.25,text:'Sit on the couch',fn:()=>sit()});
  /* coffee table */
  box(0.66,0.05,1.26,walnut,-8.5,0.42,2);box(0.56,0.03,1.1,walnut,-8.5,0.16,2);
  [-1,1].forEach(s=>[-1,1].forEach(q=>box(0.04,0.4,0.04,blk,-8.5+q*0.28,0.2,2+s*0.58)));
  cyl(0.045,0.04,0.09,S(0xf2efe8,0.4),-8.4,0.49,1.6,null,14);
  const bowl=cyl(0.13,0.07,0.08,S(0x2f9bff,0.4),-8.55,0.485,2.35,null,18);for(let i=0;i<14;i++)sph(0.028,S(0xfff3c4,0.9),-8.55+(rnd()-0.5)*0.17,0.53+rnd()*0.03,2.35+(rnd()-0.5)*0.17);
  [[-8.42,1.95,0.4,0x1d1d22],[-8.6,1.82,-0.5,0xf1f1f1]].forEach(p=>{const c=box(0.1,0.035,0.16,S(p[3],0.5),p[0],0.465,p[1]);c.rotation.y=p[2];});
  box(0.22,0.012,0.3,S(0xff4d6d,0.7),-8.5,0.182,2.2).rotation.y=0.2;box(0.22,0.012,0.3,S(0xffc928,0.7),-8.52,0.194,2.18).rotation.y=-0.1;
  solid(-8.85,-8.15,1.35,2.65);
  /* floor lamp */
  cyl(0.15,0.16,0.03,blk,-5.55,0.015,0.25);cyl(0.012,0.012,1.55,S(0xb08d57,0.3,0.9),-5.55,0.8,0.25,null,8);
  const shade=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.24,0.3,20,1,true),new THREE.MeshStandardMaterial({color:0xfff0d0,emissive:0xffc980,emissiveIntensity:0.9,side:THREE.DoubleSide,roughness:0.9}));shade.position.set(-5.55,1.62,0.25);scene.add(shade);
  lampL=new THREE.PointLight(0xffc27a,1.0,7,1.6);lampL.position.set(-5.55,1.6,0.25);scene.add(lampL);solid(-5.72,-5.38,0.08,0.42);
  /* bean bags */
  [[-9.6,5.2,0xb8433f],[-9.5,-0.5,0x1f8a8a]].forEach(p=>{const m=sph(0.5,S(p[2],0.95,0,{map:fabricTex}),p[0],0.3,p[1]);m.scale.set(1,0.62,1);solid(p[0]-0.4,p[0]+0.4,p[1]-0.4,p[1]+0.4);});
  /* bookshelf */
  const bz=-4.5;box(0.03,1.9,1.6,walnut,-10.97,0.95,bz);[-0.8,0.8].forEach(s=>box(0.34,1.9,0.03,walnut,-10.82,0.95,bz+s));
  const palette=[0xb8433f,0x1f8a8a,0xe9b949,0x4d5a73,0xf3e6c8,0x6c4bd8,0x2fd08a,0x2f9bff,0x23262b],bk=[];
  for(let s=0;s<5;s++){const y=0.04+s*0.46;box(0.34,0.03,1.6,walnut,-10.82,y,bz);
    if(s===2){box(0.22,0.07,0.34,S(0xff4d6d,0.6),-10.82,y+0.05,bz-0.4);box(0.22,0.07,0.34,S(0x2f9bff,0.6),-10.82,y+0.12,bz-0.38);box(0.2,0.06,0.3,S(0xffc928,0.6),-10.82,y+0.185,bz-0.4);sph(0.1,S(0x7fe0ff,0.2,0.3),-10.82,y+0.115,bz+0.4);continue;}
    let z=bz-0.76;while(z<bz+0.7){const w=0.03+rnd()*0.035,h=0.22+rnd()*0.12;if(rnd()<0.12){z+=0.08;continue;}bk.push([y+0.015+h/2,z+w/2,w,h,palette[Math.floor(rnd()*palette.length)],rnd()<0.1?0.15:0]);z+=w+0.004;}}
  box(0.34,0.03,1.6,walnut,-10.82,1.9,bz);
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),S(0xffffff,0.8),bk.length),d=new THREE.Object3D();
  bk.forEach((b,i)=>{d.position.set(-10.8,b[0],b[1]);d.scale.set(0.22,b[3],b[2]);d.rotation.set(b[5],0,0);d.updateMatrix();im.setMatrixAt(i,d.matrix);im.setColorAt(i,new THREE.Color(b[4]));});
  im.castShadow=true;scene.add(im);solid(-11,-10.62,bz-0.85,bz+0.85);
}
