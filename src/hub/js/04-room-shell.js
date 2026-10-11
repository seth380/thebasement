/* ---------- room shell: 22 m by 16 m ---------- */
const RX=11,RZ=8,RH=2.9,WIN={y0:1.85,y1:2.55,w:1.3};
let hour=17.2;
const outside=[];
function oMat(hex,extra){const m=new THREE.MeshBasicMaterial(Object.assign({color:hex},extra||{}));outside.push([m,new THREE.Color(hex)]);return m;}
function uvPlane(w,h,su,sv){const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*su,uv.getY(i)*sv);return g;}
const paintTex=wrap(mk(512,512,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);
  for(let i=0;i<70;i++){g.fillStyle='rgba(0,0,0,'+(0.008+rnd()*0.022)+')';g.beginPath();g.ellipse(rnd()*w,rnd()*h,40+rnd()*90,30+rnd()*70,rnd()*3,0,7);g.fill();}
  for(let x=0;x<w;x+=3){g.fillStyle='rgba(0,0,0,'+rnd()*0.04+')';g.fillRect(x,0,2,h);}
  noise(g,w,h,18);},true),1,1);
const panelTex=wrap(mk(512,256,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle='hsl('+(21+rnd()*6)+',40%,'+(21+rnd()*8)+'%)';g.fillRect(i*64,0,64,h);
    for(let k=0;k<30;k++){g.fillStyle='rgba(20,8,0,'+(0.05+rnd()*0.1)+')';g.fillRect(i*64+rnd()*60,rnd()*h,1+rnd()*1.5,h*(0.2+rnd()*0.6));}
    g.fillStyle='rgba(0,0,0,.6)';g.fillRect(i*64,0,3,h);g.fillStyle='rgba(255,220,180,.12)';g.fillRect(i*64+3,0,2,h);}
  noise(g,w,h,8);},true),1,1);
const corrTex=wrap(mk(64,8,(g,w,h)=>{for(let x=0;x<w;x++){const v=Math.round(150+Math.sin(x/64*Math.PI*16)*70);g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(x,0,1,h);}},true),1,1);
const pineM=[0x1b4529,0x205232,0x26603a,0x2d7044].map(c=>oMat(c)),trunkM=oMat(0x4a3423),gravelM=oMat(0x8c8474),wellM=oMat(0xb4b8be,{map:corrTex,side:THREE.DoubleSide});
function windowAt(g,c){
  const yc=(WIN.y0+WIN.y1)/2,hh=WIN.y1-WIN.y0,fr=S(0xe4dccb,0.6),tr=S(0x4a2f1c,0.55,0,{map:woodTex});
  box(WIN.w+0.16,0.04,0.36,tr,c,WIN.y0-0.02,-0.1,g,true);box(WIN.w,0.03,0.28,fr,c,WIN.y1+0.015,-0.14,g,true);
  [-1,1].forEach(s=>{box(0.03,hh,0.28,fr,c+s*(WIN.w/2+0.015),yc,-0.14,g,true);box(0.07,hh+0.14,0.025,tr,c+s*(WIN.w/2+0.035),yc,0.013,g,true);box(0.05,hh,0.04,fr,c+s*(WIN.w/2-0.025),yc,-0.2,g,true);});
  box(WIN.w+0.14,0.07,0.025,tr,c,WIN.y1+0.035,0.013,g,true);
  box(WIN.w,0.05,0.04,fr,c,WIN.y0+0.025,-0.2,g,true);box(WIN.w,0.05,0.04,fr,c,WIN.y1-0.025,-0.2,g,true);box(0.04,hh,0.04,fr,c,yc,-0.2,g,true);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(WIN.w,hh),new THREE.MeshStandardMaterial({color:0x9fc4d8,transparent:true,opacity:0.1,roughness:0.03,depthWrite:false}));gl.position.set(c,yc,-0.2);g.add(gl);
  const well=new THREE.Mesh(new THREE.CylinderGeometry(0.82,0.82,0.7,18,1,true,Math.PI/2,Math.PI),wellM);well.position.set(c,1.66,-0.3);g.add(well);
  const gr=new THREE.Mesh(new THREE.CircleGeometry(0.82,18,0,Math.PI),gravelM);gr.rotation.x=-Math.PI/2;gr.position.set(c,1.8,-0.3);g.add(gr);
}
function outsideView(g){
  const tl=mk(1024,256,(c,w,h)=>{c.fillStyle='#fff';for(let x=0;x<w;x+=14){const th=90+rnd()*150;c.beginPath();c.moveTo(x-16,h);c.lineTo(x+7,h-th);c.lineTo(x+30,h);c.fill();}},true);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(420,3.2),oMat(0x12301c,{map:tl,transparent:true}));m.position.set(0,3.4,-140);g.add(m);
  const real=[],stand=[];
  for(let i=0;i<22;i++){
    const x=-95+i*9+rnd()*6,z=-(55+rnd()*55),sc=0.95+rnd()*0.85;
    real.push({v:i%5,x:x,y:1.9,z:z,ry:rnd()*6.28,h:(7.3+rnd()*1.5)*sc});
    const t=new THREE.Mesh(new THREE.CylinderGeometry(0.1*sc,0.16*sc,2*sc,6),trunkM);t.position.set(x,1.9+sc,z);g.add(t);stand.push(t);
    for(let k=0;k<4;k++){const c=new THREE.Mesh(new THREE.ConeGeometry((1.55-0.32*k)*sc,2*sc,7),pineM[(k+i)%4]);c.position.set(x,1.9+(2.2+k*1.15)*sc,z);c.rotation.y=rnd()*3;g.add(c);stand.push(c);}
  }
  /* with the nature models available, real pines replace the cone trees; unlit and dimmed with the daylight like the rest outside */
  GFX.scatter([1,2,3,4,5].map(n=>'nature/Pine_'+n+'.gltf'),real,g,{
    mat:m=>oMat(0xb8c8b0,{map:m.map,alphaTest:0.5,side:THREE.DoubleSide}),
    done:()=>stand.forEach(s=>s.visible=false)});
}
{
  const f=sh(new THREE.Mesh(new THREE.PlaneGeometry(RX*2,RZ*2),S(0xffffff,0.5,0,{map:floorTex})),true);f.rotation.x=-Math.PI/2;scene.add(f);
  const c=new THREE.Mesh(new THREE.PlaneGeometry(RX*2,RZ*2),S(0x2b211a,0.95));c.rotation.x=Math.PI/2;c.position.y=RH;scene.add(c);
  const nj=54,jm=new THREE.InstancedMesh(new THREE.BoxGeometry(0.045,0.22,RZ*2),S(0x4a382a,0.9,0,{map:woodTex}),nj),d=new THREE.Object3D();
  for(let i=0;i<nj;i++){d.position.set(-RX+0.2+i*0.407,RH-0.11,0);d.updateMatrix();jm.setMatrixAt(i,d.matrix);}scene.add(jm);
  box(RX*2,0.28,0.2,S(0x3f2f23,0.85,0,{map:woodTex}),0,RH-0.36,1.5);
  [-4,4.5].forEach(x=>{cyl(0.05,0.05,RH-0.5,S(0x23262b,0.45,0.8),x,(RH-0.5)/2,1.5);cyl(0.1,0.1,0.02,S(0x23262b,0.5,0.8),x,0.01,1.5);solid(x-0.1,x+0.1,1.4,1.6);});
  box(0.5,0.24,9.2,S(0xb9bdc4,0.38,0.85),6.5,RH-0.36,-3.4,null,true);
  const paint=S(0x1a2c50,0.88,0,{map:paintTex}),panel=S(0xffffff,0.55,0,{map:panelTex}),trimW=S(0x4a2f1c,0.5,0,{map:woodTex});
  [[0,-RZ,0,RX*2,1,[]],[0,RZ,Math.PI,RX*2,-1,[-5.4,0.4,6.4]],[RX,0,-Math.PI/2,RZ*2,1,[-5.3,0.2]],[-RX,0,Math.PI/2,RZ*2,-1,[],[5.8,7.2]]].forEach(W=>{
    const g=new THREE.Group();g.position.set(W[0],0,W[1]);g.rotation.y=W[2];scene.add(g);const L=W[3];
    const add=(x0,x1,y0,y1)=>{if(x1-x0<0.01)return;const m=sh(new THREE.Mesh(uvPlane(x1-x0,y1-y0,(x1-x0)/2.6,(y1-y0)/2.6),paint),true);m.position.set((x0+x1)/2,(y0+y1)/2,0);g.add(m);};
    const dr=W[6],segs=dr?[[-L/2,dr[0]],[dr[1],L/2]]:[[-L/2,L/2]];
    segs.forEach(q=>{const w=q[1]-q[0],c=(q[0]+q[1])/2,wp=sh(new THREE.Mesh(uvPlane(w,1,w/1.6,1),panel),true);wp.position.set(c,0.5,0.012);g.add(wp);
      box(w,0.045,0.05,trimW,c,1.02,0.025,g,true);box(w,0.13,0.03,trimW,c,0.065,0.027,g,true);add(q[0],q[1],0.95,WIN.y0);});
    add(-L/2,L/2,WIN.y1,RH);
    const ws=W[5].map(u=>u*W[4]).sort((a,b)=>a-b);let x=-L/2;
    ws.forEach(cx=>{add(x,cx-WIN.w/2,WIN.y0,WIN.y1);x=cx+WIN.w/2;windowAt(g,cx);});add(x,L/2,WIN.y0,WIN.y1);
    if(ws.length)outsideView(g);
  });
}
/* place something flat against a wall: wall is 'n','s','e','w'; u runs along the wall */
function onWall(obj,wall,u,y,off){
  off=off||0.02;
  if(wall==='n'){obj.position.set(u,y,-RZ+off);obj.rotation.y=0;}
  else if(wall==='s'){obj.position.set(u,y,RZ-off);obj.rotation.y=Math.PI;}
  else if(wall==='e'){obj.position.set(RX-off,y,u);obj.rotation.y=-Math.PI/2;}
  else{obj.position.set(-RX+off,y,u);obj.rotation.y=Math.PI/2;}
  scene.add(obj);return obj;
}

