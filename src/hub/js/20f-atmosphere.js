/* ---------- atmosphere: soft contact shadows, darker corners, sunlight patches and floating dust ----------
   Cheap tricks that make rooms feel solid without expensive lighting:
   - every piece of furniture (anything with a collider) gets a soft dark patch on the floor under and around it
   - the floor and the walls darken a little where they meet, as real corners do
   - windows lay a warm patch of daylight on the floor that fades with the time of day
   - dust drifts slowly in the light */
const ATM={patches:[],motes:[]};
{
  const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);return t;};
  /* a soft rounded-rectangle shadow: dark in the middle, fading out at the edges */
  const aoT=tex(128,128,(g,w,h)=>{const id=g.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const dx=Math.max(0,Math.abs(x+0.5-w/2)-w*0.22)/(w*0.28),dy=Math.max(0,Math.abs(y+0.5-h/2)-h*0.22)/(h*0.28),d=Math.min(1,Math.hypot(dx,dy)),a=Math.pow(1-d,1.8);
      const i=(y*w+x)*4;id.data[i]=id.data[i+1]=id.data[i+2]=0;id.data[i+3]=a*255;}g.putImageData(id,0,0);});
  /* a strip that is dark on one edge and clear on the other, for where floors meet walls */
  const edgeT=tex(4,64,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'rgba(0,0,0,1)');r.addColorStop(0.35,'rgba(0,0,0,.35)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
  const shade=(op)=>new THREE.MeshBasicMaterial({map:aoT,color:0x000000,transparent:true,opacity:op,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const edgeM=(op)=>new THREE.MeshBasicMaterial({map:edgeT,color:0x000000,transparent:true,opacity:op,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide});
  const PARENT=[scene,U,CG,SG],OP=[0.42,0.5,0.45,0.4];
  /* contact shadows from the colliders of every level */
  const mats=OP.map(o=>shade(o));
  colliders.forEach(c=>{
    const lv=c.lv||0,w=c.x1-c.x0,d=c.z1-c.z0;if(c.off||w<0.16||d<0.16||w*d>14)return;
    if(lv===1&&c.x0>9.5&&c.z0>4&&c.z1<7)return; /* the stairwell upstairs is a hole, not furniture */
    if(lv===0&&c.x1<-10.4&&c.z0>=-7.3&&c.z1<=-5.7)return; /* the secret bookcase swings away */
    const p=0.32,m=new THREE.Mesh(new THREE.PlaneGeometry(w+p*2,d+p*2),mats[lv]);m.rotation.x=-Math.PI/2;m.position.set((c.x0+c.x1)/2,0.016,(c.z0+c.z1)/2);m.renderOrder=1;PARENT[lv].add(m);});
  /* darker where floors meet walls: a strip on the floor and one up the wall, round each room */
  const edges=(par,x0,x1,z0,z1,op,y0)=>{const fm=edgeM(op),wm=edgeM(op*0.8);y0=y0||0;
    [[x0,x1,z0,0],[x0,x1,z1,Math.PI],[z0,z1,x0,Math.PI/2],[z0,z1,x1,-Math.PI/2]].forEach((q,i)=>{const L=q[1]-q[0],mid=(q[0]+q[1])/2,alongX=i<2;
      const f=new THREE.Mesh(new THREE.PlaneGeometry(L,0.7),fm);f.rotation.x=-Math.PI/2;f.rotation.z=q[3];
      f.position.set(alongX?mid:q[2]+(i===2?0.35:-0.35),y0+0.017,alongX?q[2]+(i===0?0.35:-0.35):mid);par.add(f);
      const v=new THREE.Mesh(new THREE.PlaneGeometry(L,0.45),wm);v.rotation.y=alongX?(i===0?0:Math.PI):(i===2?Math.PI/2:-Math.PI/2);v.rotation.z=Math.PI;
      v.position.set(alongX?mid:q[2]+(i===2?0.02:-0.02),y0+0.225,alongX?q[2]+(i===0?0.02:-0.02):mid);par.add(v);});};
  edges(scene,-RX,RX,-RZ,RZ,0.5);
  UROOMS.forEach(R=>edges(U,R.x0+(R.x0>-RX?0.06:0),R.x1-(R.x1<RX?0.06:0),R.z0+(R.z0>-RZ?0.06:0),R.z1-(R.z1<RZ?0.06:0),0.42));
  edges(SG,-11,11,-6.55,7,0.4);
  /* daylight on the floor under the windows (upstairs and the basement window wells); faded by the time of day */
  const sunT=tex(64,128,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'rgba(255,255,255,0)');r.addColorStop(0.15,'rgba(255,255,255,.9)');r.addColorStop(0.7,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h);
    g.globalCompositeOperation='destination-in';const s=g.createLinearGradient(0,0,w,0);s.addColorStop(0,'rgba(0,0,0,0)');s.addColorStop(0.12,'rgba(0,0,0,1)');s.addColorStop(0.88,'rgba(0,0,0,1)');s.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=s;g.fillRect(0,0,w,h);
    g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,.55)';g.fillRect(w/2-2,0,4,h);g.fillRect(0,h*0.45,w,4);});
  const patch=(par,lv,x,z,w,len,ry,op)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,len),new THREE.MeshBasicMaterial({map:sunT,color:0xffe2b0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
    m.rotation.x=-Math.PI/2;m.rotation.z=ry;m.position.set(x,0.02,z);m.renderOrder=2;par.add(m);ATM.patches.push({m:m,lv:lv,op:op});};
  /* upstairs: windows on each outside wall (the kitchen's is over the counter, so it has none) */
  [[3.8,-RZ],[8.1,RZ],[-7.6,RZ],[-3.5,RZ]].forEach(q=>patch(U,1,q[0],q[1]+(q[1]<0?1.25:-1.25),1.5,2.5,0,0.5));
  [[-5.5],[1.4]].forEach(q=>patch(U,1,RX-1.25,q[0],1.5,2.5,Math.PI/2,0.5));
  [[1.6],[6.8],[-4.4]].forEach(q=>patch(U,1,-RX+1.25,q[0],1.5,2.5,Math.PI/2,0.5));
  /* basement window wells: small, high and dim */
  [5.4,-0.4,-6.4].forEach(x=>patch(scene,0,x,RZ-1.3,1.3,2.0,0,0.22));
  [-5.3,0.2].forEach(z=>patch(scene,0,RX-1.3,z,1.3,2.0,Math.PI/2,0.22));
  /* dust: a few hundred specks drifting in each room */
  const dustM=c=>new THREE.PointsMaterial({map:glowTex,color:c,size:0.045,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,toneMapped:false});
  const motes=(par,lv,x0,x1,z0,z1,y0,y1,n,c)=>{const pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=x0+Math.random()*(x1-x0);pos[i*3+1]=y0+Math.random()*(y1-y0);pos[i*3+2]=z0+Math.random()*(z1-z0);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const p=new THREE.Points(g,dustM(c));p.frustumCulled=false;par.add(p);
    ATM.motes.push({p:p,lv:lv,b:[x0,x1,y0,y1,z0,z1],seed:Math.random()*100});};
  motes(scene,0,-RX,RX,-RZ,RZ,0.2,RH-0.2,coarse?120:260,0xffd8a8);
  motes(U,1,-RX,RX,-RZ,RZ,0.2,UH-0.2,coarse?120:240,0xfff0d0);
  motes(CG,2,-12,12,-8,8,0.3,6,coarse?140:300,0xbfe8ff);
}
function atmTick(dt,t){
  /* daylight patches follow the time of day (strongest around noon) */
  const a=(hour-6)/24*Math.PI*2,day=Math.max(0,Math.min(1,(Math.sin(a)+0.05)/0.45));
  ATM.patches.forEach(q=>{if(q.lv!==lvl)return;q.m.material.opacity=q.op*day;});
  ATM.motes.forEach(q=>{if(q.lv!==lvl)return;const pa=q.p.geometry.attributes.position,b=q.b,s=q.seed;
    for(let i=0;i<pa.count;i+=1){let x=pa.getX(i)+Math.sin(t*0.21+i*1.7+s)*dt*0.05,y=pa.getY(i)+Math.sin(t*0.13+i*0.9)*dt*0.03+dt*0.006,z=pa.getZ(i)+Math.cos(t*0.17+i*1.3+s)*dt*0.05;
      if(y>b[3])y=b[2];pa.setXYZ(i,x,y,z);}pa.needsUpdate=true;});
}
