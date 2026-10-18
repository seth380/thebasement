/* ---------- the hero cave ----------
   A big cavern with a waterfall, bats, a hero car on a turntable, a wall of computer screens, three suits in glass cases,
   a punching bag, a giant coin and its own arcade wall. It lives in its own group far below the basement (only one base is drawn at a time),
   so its x and z are just like the basement's. */
const CAVE_Y=-40,CG=new THREE.Group();CG.position.y=CAVE_Y;CG.visible=false;scene.add(CG);
/* lift doors, shared by the basement and the cave: a steel frame and two doors that slide apart when you use it */
const LIFTS=[];
function liftDoors(par,x,z,ry,o){
  o=o||{};const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;par.add(g);
  const frame=S(o.frame||0x3a3f48,0.35,0.7),steel=S(0xb9c0c9,0.25,0.9,{map:o.tex||null});
  [-1,1].forEach(s=>box(0.18,2.4,0.16,frame,s*0.69,1.2,0,g));box(1.56,0.34,0.16,frame,0,2.57,0,g);
  const back=new THREE.Mesh(new THREE.PlaneGeometry(1.2,2.3),new THREE.MeshBasicMaterial({color:0x0c0f14}));back.position.set(0,1.15,-0.07);g.add(back);
  const doors=[-1,1].map(s=>box(0.6,2.28,0.04,steel,s*0.3,1.14,-0.03,g));
  doors.forEach(d=>box(0.012,2.28,0.045,S(0x6d747d,0.4,0.8),0,0,0.001,d,true));
  const ind=mk(128,48,(c,w,h)=>{c.fillStyle='#14161c';c.fillRect(0,0,w,h);c.fillStyle='#ffc928';c.font='900 30px Nunito,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('▲ ▼',w/2,h/2+2);},true);
  const im=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.16),new THREE.MeshBasicMaterial({map:ind,toneMapped:false}));im.position.set(0,2.57,0.085);g.add(im);
  box(0.13,0.3,0.04,frame,0.95,1.2,0.03,g);
  const btn=new THREE.Mesh(new THREE.CircleGeometry(0.035,16),new THREE.MeshBasicMaterial({color:0x7fe8ff,toneMapped:false}));btn.position.set(0.95,1.24,0.052);g.add(btn);
  const L={g:g,doors:doors,open:0,t:0};LIFTS.push(L);return L;
}
function liftTick(dt){LIFTS.forEach(L=>{if(L.t>0)L.t-=dt;L.open+=((L.t>0?1:0)-L.open)*Math.min(1,dt*5);L.doors.forEach((d,i)=>{d.position.x=(i?1:-1)*(0.3+0.56*L.open);});});}

const CV={bats:[],scr:[],scrI:0,alert:0,rev:0,spin:0,bag:null,bagV:[0,0],combo:0,comboT:0,fall:null,mist:[],lights:{}};
{
  const cb=(w,h,d,m,x,y,z,ns)=>box(w,h,d,m,x,y,z,CG,ns),cc=(rt,rb,h,m,x,y,z,seg)=>cyl(rt,rb,h,m,x,y,z,CG,seg);
  const csolid=(x0,x1,z0,z1)=>colliders.push({x0:x0,x1:x1,z0:z0,z1:z1,lv:2});
  const cthing=o=>things.push(Object.assign({lv:2},o));
  /* ---- textures ---- */
  const rockT=mk(256,256,(g,w,h)=>{g.fillStyle='#4a5160';g.fillRect(0,0,w,h);for(let i=0;i<260;i++){g.fillStyle='rgba('+(rnd()<0.5?'20,24,32':'120,130,150')+','+rnd()*0.22+')';g.beginPath();g.ellipse(rnd()*w,rnd()*h,4+rnd()*24,3+rnd()*12,rnd()*3,0,7);g.fill();}noise(g,w,h,26);},true);
  rockT.wrapS=rockT.wrapT=THREE.RepeatWrapping;
  const grateT=mk(128,128,(g,w,h)=>{g.fillStyle='#2b3038';g.fillRect(0,0,w,h);g.strokeStyle='#596270';g.lineWidth=3;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(i*16,0);g.lineTo(i*16,h);g.stroke();g.beginPath();g.moveTo(0,i*16);g.lineTo(w,i*16);g.stroke();}noise(g,w,h,10);},true);
  grateT.wrapS=grateT.wrapT=THREE.RepeatWrapping;
  const rock=new THREE.MeshStandardMaterial({color:0x6a7486,roughness:1,flatShading:true});
  const steel=S(0x3b414c,0.4,0.75),dark=S(0x16181d,0.5,0.4),glowB=c=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
  const glowS=(col,s,op)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,transparent:true,opacity:op||0.6,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));sp.scale.set(s,s,1);return sp;};

  /* ---- the cavern: a lumpy dome, a rock floor and a steel deck ---- */
  const SH=[16,9,12];
  {const g=new THREE.IcosahedronGeometry(1,4),p=g.attributes.position,v=new THREE.Vector3();
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=1+Math.sin(v.x*7.1+v.y*3.3)*Math.cos(v.z*6.3+v.y*4.1)*0.07+Math.sin(v.x*17+v.z*13)*0.025;p.setXYZ(i,v.x*SH[0]*n,1.5+v.y*SH[1]*n,v.z*SH[2]*n);}
   g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x3a4252,roughness:1,flatShading:true,side:THREE.BackSide}));m.receiveShadow=true;CG.add(m);}
  const roofAt=(x,z)=>1.5+SH[1]*Math.sqrt(Math.max(0,1-(x/SH[0])**2-(z/SH[2])**2));
  {const t=rockT.clone();t.needsUpdate=true;t.repeat.set(8,6);const f=new THREE.Mesh(new THREE.CircleGeometry(1,48),S(0x8a93a3,1,0,{map:t}));f.scale.set(15.8,11.8,1);f.rotation.x=-Math.PI/2;f.receiveShadow=true;CG.add(f);}
  {const t=grateT.clone();t.needsUpdate=true;t.repeat.set(13.5/1.2,14/1.2);const d=new THREE.Mesh(new THREE.PlaneGeometry(13.5,14),S(0xffffff,0.5,0.6,{map:t}));d.rotation.x=-Math.PI/2;d.position.set(2.75,0.012,-1);d.receiveShadow=true;CG.add(d);
   const hz=mk(256,16,(g,w,h)=>{for(let x=-16;x<w;x+=32){g.fillStyle='#ffc928';g.beginPath();g.moveTo(x,h);g.lineTo(x+16,0);g.lineTo(x+32,0);g.lineTo(x+16,h);g.fill();}g.globalCompositeOperation='destination-over';g.fillStyle='#16181d';g.fillRect(0,0,w,h);},true);
   hz.wrapS=THREE.RepeatWrapping;[[2.75,-8,13.5,0],[2.75,6,13.5,0],[-4,-1,14,Math.PI/2],[9.5,-1,14,Math.PI/2]].forEach(q=>{const t=hz.clone();t.needsUpdate=true;t.wrapS=THREE.RepeatWrapping;t.repeat.set(q[2]/1.2,1);
     const m=new THREE.Mesh(new THREE.PlaneGeometry(q[2],0.18),new THREE.MeshBasicMaterial({map:t}));m.rotation.x=-Math.PI/2;m.rotation.z=q[3];m.position.set(q[0],0.016,q[1]);CG.add(m);});}
  /* stalactites from the roof, stalagmites round the edge */
  for(let i=0;i<46;i++){const a=rnd()*6.283,r=Math.sqrt(rnd())*0.9,x=Math.cos(a)*r*SH[0],z=Math.sin(a)*r*SH[2],l=0.8+rnd()*2.4,y=roofAt(x,z)-0.2;
    const c=new THREE.Mesh(new THREE.ConeGeometry(0.18+rnd()*0.35,l,6),rock);c.rotation.x=Math.PI;c.position.set(x,y-l/2,z);CG.add(c);}
  for(let i=0;i<30;i++){const a=rnd()*6.283,r=0.92+rnd()*0.1,x=Math.cos(a)*r*14.6,z=Math.sin(a)*r*10.6,l=0.6+rnd()*1.8;
    if(z>5.5&&Math.abs(x)<7)continue;const c=new THREE.Mesh(new THREE.ConeGeometry(0.25+rnd()*0.35,l,6),rock);c.position.set(x,l/2,z);c.castShadow=true;CG.add(c);}

  /* ---- waterfall into a pool ---- */
  {cb(3.6,6.2,1.4,rock,-9,3.1,-8.9,true);
   const lip=new THREE.Mesh(new THREE.IcosahedronGeometry(0.9,1),new THREE.MeshStandardMaterial({color:0x2f6b44,roughness:1,flatShading:true}));lip.scale.set(1.6,0.45,0.9);lip.position.set(-9,5.2,-8.1);CG.add(lip);
   const ft=mk(128,512,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<70;i++){const x=rnd()*w,l=60+rnd()*200,y=rnd()*h;g.strokeStyle='rgba(235,255,255,'+(0.25+rnd()*0.5)+')';g.lineWidth=2+rnd()*5;g.beginPath();g.moveTo(x,y);g.lineTo(x,y+l);g.stroke();g.beginPath();g.moveTo(x,y-h);g.lineTo(x,y+l-h);g.stroke();}},true);ft.wrapT=THREE.RepeatWrapping;
   CV.fall=new THREE.Mesh(new THREE.PlaneGeometry(1.8,5.1),new THREE.MeshBasicMaterial({map:ft,color:0xbff5f0,transparent:true,opacity:0.9,depthWrite:false,toneMapped:false}));CV.fall.position.set(-9,2.55,-8.15);CG.add(CV.fall);
   const pond=new THREE.Mesh(new THREE.CircleGeometry(1.7,28),new THREE.MeshStandardMaterial({color:0x2a8f8a,roughness:0.08,metalness:0.3,transparent:true,opacity:0.88,emissive:0x0f5a55,emissiveIntensity:0.6}));pond.rotation.x=-Math.PI/2;pond.position.set(-9,0.03,-6.8);CG.add(pond);
   for(let i=0;i<12;i++){const a=i/12*6.283,s=0.25+rnd()*0.25,m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,0),rock);m.position.set(-9+Math.cos(a)*1.8,s*0.3,-6.8+Math.sin(a)*1.8);CG.add(m);}
   for(let i=0;i<3;i++){const sp=glowS(0xdffaf6,2.4,0.32);sp.position.set(-9+(i-1)*0.6,0.5,-7.6);CG.add(sp);CV.mist.push(sp);}
   csolid(-10.8,-7.2,-8.6,-5.1);}

  /* ---- bats circling under the roof ---- */
  {const bm=new THREE.MeshBasicMaterial({color:0x101216,side:THREE.DoubleSide}),wg=new THREE.BufferGeometry();
   wg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0.42,0.05,-0.1,0.3,0,0.15, 0,0,0,0.3,0,0.15,0.08,0,0.18],3));wg.computeVertexNormals();
   for(let i=0;i<9;i++){const g=new THREE.Group(),body=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,6),bm);body.scale.set(1,0.8,1.6);g.add(body);
     const w=[1,-1].map(s=>{const m=new THREE.Mesh(wg,bm);m.scale.x=s;g.add(m);return m;});CG.add(g);
     CV.bats.push({g:g,w:w,r:4+rnd()*7,y:4.5+rnd()*2.5,s:(0.35+rnd()*0.4)*(rnd()<0.5?-1:1),a:rnd()*6.28,f:9+rnd()*5});}}

  /* ---- the computer: a curved wall of screens, a desk and a chair ---- */
  {const C=[4.5,-4.6],R=2.6;
   const draw=[
     (g,w,h,t)=>{g.fillStyle='#04121c';g.fillRect(0,0,w,h);g.strokeStyle='#1f8fd0';g.lineWidth=2;[30,60,90].forEach(r=>{g.beginPath();g.arc(w/2,h/2,r,0,7);g.stroke();});
       const a=t*1.6;g.fillStyle='rgba(80,220,255,.35)';g.beginPath();g.moveTo(w/2,h/2);g.arc(w/2,h/2,95,a,a+0.5);g.fill();g.fillStyle='#7fffd0';[[0.6,50],[2.4,75],[4.1,35]].forEach(q=>{g.beginPath();g.arc(w/2+Math.cos(q[0])*q[1],h/2+Math.sin(q[0])*q[1],4,0,7);g.fill();});},
     (g,w,h,t)=>{g.fillStyle='#06101a';g.fillRect(0,0,w,h);g.strokeStyle='#1a4060';g.lineWidth=2;for(let x=0;x<w;x+=24){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}for(let y=0;y<h;y+=24){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
       g.fillStyle='#2a6a9a';[[20,30,40,50],[80,20,30,70],[140,60,50,40],[60,110,60,30],[180,100,40,40]].forEach(b=>g.fillRect(b[0],b[1],b[2],b[3]));g.fillStyle=Math.sin(t*6)>0?'#ffd84a':'#ff7a2a';g.beginPath();g.arc(160+Math.sin(t)*30,80,6,0,7);g.fill();},
     (g,w,h,t)=>{g.fillStyle='#0a0f18';g.fillRect(0,0,w,h);for(let i=0;i<8;i++){const v=0.3+0.6*Math.abs(Math.sin(t*1.3+i*0.8));g.fillStyle=i%2?'#38d0ff':'#7f6bff';g.fillRect(16+i*28,h-14-v*(h-40),20,v*(h-40));}g.fillStyle='#9fd8ff';g.font='900 16px Nunito,sans-serif';g.fillText('POWER',14,22);},
     (g,w,h,t)=>{g.fillStyle='#04140c';g.fillRect(0,0,w,h);g.strokeStyle='#4dff9a';g.lineWidth=3;g.beginPath();for(let x=0;x<w;x+=3){const p=((x+t*90)%120)/120,y=h/2-(p>0.45&&p<0.5?60:p>0.5&&p<0.55?-30:0)+Math.sin(x*0.2)*2;x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.fillStyle='#4dff9a';g.font='900 16px Nunito,sans-serif';g.fillText('HEART RATE  72',12,22);},
     (g,w,h,t)=>{g.fillStyle='#0b0d14';g.fillRect(0,0,w,h);g.fillStyle='#9fe8ff';g.font='700 14px monospace';const L=['> scan city ... ok','> check fridge ... ok','> bats: 9','> snacks: low','> arcade: online','> waterfall: wet','> hero: ready'];const k=Math.floor(t*2)%L.length;for(let i=0;i<6;i++)g.fillText(L[(k+i)%L.length],10,24+i*22);}
   ];
   const big=(g,w,h,t)=>{const al=CV.alert>0;g.fillStyle=al?(Math.sin(t*12)>0?'#5a0a12':'#2a0408'):'#071420';g.fillRect(0,0,w,h);g.strokeStyle=al?'#ff4a5a':'#38c8ff';g.lineWidth=6;g.strokeRect(10,10,w-20,h-20);
     g.fillStyle=al?'#ffd0d0':'#bff0ff';g.font='900 46px Nunito,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(al?CV.msg[0]:'ALL QUIET',w/2,h/2-18);g.font='700 22px Nunito,sans-serif';g.fillText(al?CV.msg[1]:'The city is safe. For now.',w/2,h/2+30);g.textAlign='left';g.textBaseline='alphabetic';};
   CV.msg=['',''];
   const screen=(fn,w,h,pw,ph,a,y,r)=>{const t=mk(w,h,(g,W,H,tt)=>fn(g,W,H,tt||0),true),m=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));
     m.position.set(C[0]+Math.sin(a)*r,y,C[1]-Math.cos(a)*r);m.rotation.y=-a;CG.add(m);const fr=box(pw+0.08,ph+0.08,0.06,dark,0,0,-0.04,m,true);CV.scr.push({t:t});return m;};
   draw.forEach((fn,i)=>screen(fn,256,160,1.15,0.72,(i-2)*0.42,1.5,R));
   screen(big,512,256,2.6,1.3,0,2.65,R+0.05);
   [-1,1].forEach(s=>screen(draw[s<0?1:2],256,160,1.4,0.86,s*0.62,2.65,R));
   /* curved desk */
   for(let i=-3;i<=3;i++){const a=i*0.27,m=cb(0.66,0.08,0.62,steel,C[0]+Math.sin(a)*2.0,0.78,C[1]-Math.cos(a)*2.0);m.rotation.y=-a;const l=cb(0.6,0.74,0.08,dark,C[0]+Math.sin(a)*2.25,0.37,C[1]-Math.cos(a)*2.25);l.rotation.y=-a;
     const k=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.12),glowB([0x38c8ff,0x7f6bff,0x4dff9a][(i+3)%3]));k.rotation.x=-Math.PI/2;k.rotation.z=a;k.position.set(C[0]+Math.sin(a)*1.95,0.825,C[1]-Math.cos(a)*1.95);CG.add(k);}
   /* chair */
   {const g=new THREE.Group();g.position.set(C[0],0,C[1]-0.7);CG.add(g);const cm=S(0x1d2129,0.6);cyl(0.3,0.3,0.03,dark,0,0.03,0,g,5);cyl(0.04,0.04,0.42,steel,0,0.24,0,g,8);
    box(0.62,0.1,0.58,cm,0,0.47,0,g);box(0.62,0.7,0.1,cm,0,0.85,0.3,g).rotation.x=0.1;[-1,1].forEach(s=>box(0.06,0.25,0.4,cm,s*0.33,0.62,0.05,g));}
   csolid(C[0]-2.3,C[0]+2.3,C[1]-2.9,C[1]-1.65);
   CV.seat={x:C[0],z:C[1]-0.7,h:Math.PI,stand:[C[0],C[1]+0.5],cam:[C[0],2.15,C[1]+0.9],look:[C[0],1.8,C[1]-2.6]};
   cthing({x:C[0],z:C[1]+0.35,r:0.85,text:'Sit at the computer',fn:()=>sit(CV.seat)});
   const CALLS=[['ALERT!','A cat is stuck up a tree. Rescued!'],['ALERT!','Someone left the fridge open upstairs'],['ALERT!','Waterfare high score under attack'],['ALERT!','The bats want a snack'],['ALL CLEAR','Nothing to see here. Go play!'],['ALERT!','Pancake emergency in the kitchen']];
   cthing({x:C[0]+2.2,z:C[1]-0.6,r:1.0,text:'Scan the city',fn:()=>{const m=CALLS[Math.floor(Math.random()*CALLS.length)];CV.msg=m;CV.alert=3.5;SFX.play('start');SFX.blip(900,1500,0.12,'square',0.05);toast(m[1]);}});
   CV.lights.desk=new THREE.PointLight(0x4fb8ff,1.0,9,1.4);CV.lights.desk.position.set(C[0],2.2,C[1]-1);CG.add(CV.lights.desk);}

  /* ---- hero car on a turntable ---- */
  {const T=[-7.2,2.9];const tt=new THREE.Group();tt.position.set(T[0],0,T[1]);CG.add(tt);CV.tt=tt;
   cc(2.65,2.7,0.14,S(0x23272f,0.35,0.8),T[0],0.07,T[1],40);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(2.66,0.035,6,64),glowB(0x38a8ff));ring.rotation.x=Math.PI/2;ring.position.set(T[0],0.14,T[1]);CG.add(ring);
   const car=new THREE.Group();car.position.y=0.14;tt.add(car);
   const body=S(0x1c2029,0.32,0.65),glass=new THREE.MeshStandardMaterial({color:0x1d2c3d,roughness:0.08,metalness:0.6});
   const prof=(pts,depth,m,y)=>{const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));const g=new THREE.ExtrudeGeometry(s,{depth:depth,bevelEnabled:true,bevelThickness:0.04,bevelSize:0.04,bevelSegments:2});g.translate(0,0,-depth/2);const me=sh(new THREE.Mesh(g,m));me.position.y=y||0;car.add(me);return me;};
   prof([[-2.1,0.22],[2.05,0.22],[2.2,0.4],[1.25,0.66],[0.25,0.8],[-1.0,0.84],[-2.05,0.72],[-2.2,0.42]],1.74,body);
   prof([[1.0,0.68],[0.2,0.97],[-0.75,1.02],[-1.15,0.86]],1.22,glass);
   [[-1.35,0.9],[1.35,0.9],[-1.35,-0.9],[1.35,-0.9]].forEach(p=>{const w=cyl(0.38,0.38,0.3,S(0x0e0f12,0.8),p[0],0.38,p[1],car,20);w.rotation.x=Math.PI/2;
     const rim=new THREE.Mesh(new THREE.TorusGeometry(0.24,0.03,6,20),glowB(0x38c8ff));rim.position.set(p[0],0.38,p[1]+Math.sign(p[1])*0.16);car.add(rim);});
   [-1,1].forEach(s=>{const st=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.03,0.01),glowB(0x38c8ff));st.position.set(0,0.5,s*0.92);car.add(st);
     box(0.05,0.08,0.34,glowB(0xffffff),2.18,0.42,s*0.55,car,true);box(0.05,0.06,0.4,glowB(0xff2a3a),-2.2,0.55,s*0.55,car,true);});
   const fin=box(0.6,0.32,0.06,body,-1.75,0.95,0,car);fin.rotation.z=0.35;
   const ug=new THREE.Mesh(new THREE.PlaneGeometry(4.6,2.4),new THREE.MeshBasicMaterial({map:glowTex,color:0x3f8cff,transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));ug.rotation.x=-Math.PI/2;ug.position.y=0.03;car.add(ug);CV.ug=ug;
   CV.jets=[-0.4,0.4].map(z=>{const j=glowS(0x5fb8ff,0.9,0);j.position.set(-2.35,0.5,z);car.add(j);return j;});
   CV.lights.car=new THREE.PointLight(0x3f8cff,0.8,8,1.4);CV.lights.car.position.set(T[0],1.4,T[1]);CG.add(CV.lights.car);
   csolid(T[0]-2.4,T[0]+2.4,T[1]-2.4,T[1]+2.4);
   cthing({x:T[0]+2.9,z:T[1]-1.2,r:1.2,text:'Start the engine',fn:()=>{CV.rev=3;SFX.play('engine',{vol:0.8,rate:0.8});SFX.burst(120,900,0.9,0.18);toast('VROOOM!');}});}

  /* ---- three hero suits in glass cases ---- */
  {const SUITS=[{n:'Comet',c:0xe8423a,cape:0xffc928,k:'bear',e:'★',l:'The Comet suit: faster than a shooting star'},{n:'Tidal',c:0x1fb5a8,cape:0xf4f0e6,k:'cat',e:'≈',l:'The Tidal suit: never loses a water fight'},{n:'Volt',c:0x7b5cff,cape:0xffd84a,k:'bunny',e:'ϟ',l:'The Volt suit: powered by arcade tokens'}];
   const gl=new THREE.MeshStandardMaterial({color:0xcfe8ff,transparent:true,opacity:0.14,roughness:0.05,metalness:0.2,depthWrite:false});
   [[10.6,-3.6],[11.7,0],[10.6,3.6]].forEach((p,i)=>{const s=SUITS[i],g=new THREE.Group();g.position.set(p[0],0,p[1]);g.rotation.y=Math.atan2(-p[0],-p[1]);CG.add(g);
     cyl(0.6,0.65,0.25,steel,0,0.125,0,g,24);cyl(0.6,0.6,0.08,dark,0,2.42,0,g,24);
     const gc=new THREE.Mesh(new THREE.CylinderGeometry(0.58,0.58,2.1,24,1,true),gl);gc.position.y=1.32;g.add(gc);
     const cap=glowS(0xbfe6ff,1.2,0.35);cap.position.y=2.3;g.add(cap);
     const cr=makeCritter({kind:s.k,head:0x8a8f99,color:s.c},{shadow:true,map:fabricTex});cr.g.scale.setScalar(0.9);cr.g.position.y=0.25;g.add(cr.g);
     const cp=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.42,1.05,14,1,true,Math.PI*0.62,Math.PI*0.76),S(s.cape,0.8,0,{side:THREE.DoubleSide}));cp.position.set(0,0.95,-0.04);g.add(cp);
     const em=mk(64,64,(c,w,h)=>{c.fillStyle='#ffd84a';c.beginPath();c.arc(32,32,30,0,7);c.fill();c.fillStyle='#1d1640';c.font='900 40px Nunito,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(s.e,32,34);},true);
     const ep=new THREE.Mesh(new THREE.CircleGeometry(0.1,20),new THREE.MeshBasicMaterial({map:em,toneMapped:false}));ep.position.set(0,0.98,0.22);g.add(ep);
     const pl=mk(256,64,(c,w,h)=>{c.fillStyle='#16181d';c.fillRect(0,0,w,h);c.fillStyle='#ffd84a';c.font='900 34px Nunito,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(s.n.toUpperCase(),w/2,h/2+2);},true);
     const pm=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.125),new THREE.MeshBasicMaterial({map:pl,toneMapped:false}));pm.position.set(0,0.13,0.651);g.add(pm);
     csolid(p[0]-0.7,p[0]+0.7,p[1]-0.7,p[1]+0.7);
     const f=[-p[0],-p[1]],d=Math.hypot(f[0],f[1]);cthing({x:p[0]+f[0]/d*1.4,z:p[1]+f[1]/d*1.4,r:1.0,text:'Look at the '+s.n+' suit',fn:()=>{SFX.play('select');toast(s.l);}});});
   CV.lights.suits=new THREE.PointLight(0xffe2b8,0.9,8,1.4);CV.lights.suits.position.set(9.4,3,0);CG.add(CV.lights.suits);}

  /* ---- punching bag ---- */
  {const piv=new THREE.Group();piv.position.set(7.4,3.6,4.4);CG.add(piv);CV.bag=piv;
   const ch=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,1.2,6),steel);ch.position.y=-0.6;piv.add(ch);
   const bag=sh(new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,1.15,20),S(0xb8282f,0.55)));bag.position.y=-1.8;piv.add(bag);
   [-1.25,-2.35].forEach(y=>{const r=new THREE.Mesh(new THREE.CylinderGeometry(0.33,0.33,0.06,20),dark);r.position.y=y;piv.add(r);});
   cc(0.06,0.06,0.5,steel,7.4,3.85,4.4,8);
   const mat=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4),S(0x2a5fd0,0.9));mat.rotation.x=-Math.PI/2;mat.position.set(7.4,0.02,4.4);CG.add(mat);
   csolid(7.05,7.75,4.05,4.75);
   cthing({x:7.4,z:3.25,r:1.1,text:'Punch the bag',fn:()=>{CV.bagV[0]-=1.6+Math.random()*0.6;CV.bagV[1]+=(Math.random()-0.5)*1.2;SFX.play('impact',{rate:0.8+Math.random()*0.3});
     CV.combo=CV.comboT>0?CV.combo+1:1;CV.comboT=1.4;if(CV.combo>1)toast('Combo x'+CV.combo+'!');if(avatar&&avatar.actor)avatar.actor.once('punch');}});}

  /* ---- the big coin ---- */
  {const cx=-12.1,cz=-0.4,g=new THREE.Group();g.position.set(cx,0,cz);g.rotation.y=Math.PI/2;CG.add(g);
   const face=mk(256,256,(c,w,h)=>{c.fillStyle='#ffcf3a';c.fillRect(0,0,w,h);c.strokeStyle='#c9952a';c.lineWidth=10;c.beginPath();c.arc(128,128,110,0,7);c.stroke();c.fillStyle='#c9952a';c.font='900 120px Nunito,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('★',128,120);c.font='900 24px Nunito,sans-serif';c.fillText('ONE BIG COIN',128,205);},true);
   const gold=S(0xffc928,0.25,1),fm=S(0xffffff,0.3,0.8,{map:face,emissive:0x3a2a00,emissiveIntensity:0.4});
   const coin=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.35,0.22,48),[gold,fm,fm]);coin.rotation.x=Math.PI/2;coin.position.y=1.55;coin.rotation.z=0.06;coin.castShadow=true;g.add(coin);
   box(1.2,0.22,0.8,steel,0,0.11,0,g);const gs=glowS(0xffd060,3.4,0.25);gs.position.set(0,1.55,0.3);g.add(gs);
   csolid(cx-0.5,cx+0.5,cz-1.4,cz+1.4);
   cthing({x:cx+1.4,z:cz,r:1.2,text:'Polish the big coin',fn:()=>{const d=new Date().toISOString().slice(0,10);
     if(store.getItem('cave-coin')===d){SFX.play('pluck',{rate:1.2});toast('It is already shiny. Come back tomorrow');return;}
     store.setItem('cave-coin',d);SFX.play('coin');addCoins(15,'Polished the big coin');}});}

  /* ---- arcade wall on the south side ---- */
  {cb(11.6,3.3,0.3,S(0x262a33,0.45,0.6),0,1.65,7.4);[[0,3.3],[0,0.06]].forEach(q=>{const s=new THREE.Mesh(new THREE.BoxGeometry(11.6,0.05,0.05),glowB(0xff4fa0));s.position.set(q[0],q[1],7.24);CG.add(s);});
   [-5.8,5.8].forEach(x=>{const s=new THREE.Mesh(new THREE.BoxGeometry(0.05,3.3,0.05),glowB(0x38c8ff));s.position.set(x,1.65,7.24);CG.add(s);});
   const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.3,0.82),new THREE.MeshBasicMaterial({map:neonTex,transparent:true,toneMapped:false,depthWrite:false}));sign.position.set(0,2.75,7.23);sign.rotation.y=Math.PI;CG.add(sign);
   META.forEach((m,i)=>cabinet(m,(i-2)*2.05,i,{par:CG,z:6.71,ry:Math.PI/2,lv:2}));
   csolid(-5.9,5.9,7.2,7.6);
   CV.lights.arcade=new THREE.PointLight(0xff4fa0,1.0,9,1.5);CV.lights.arcade.position.set(0,2.6,5.4);CG.add(CV.lights.arcade);}

  /* ---- lift back to the other bases, set in a steel bulkhead ---- */
  cb(3.4,3.8,0.5,S(0x2b3038,0.45,0.6),-2.5,1.9,-9.75);
  CV.lift=liftDoors(CG,-2.5,-9.42,0,{frame:0x23272f});
  colliders.push({x0:-4.2,x1:-0.8,z0:-10.5,z1:-9.3,lv:2});
  cthing({x:-2.5,z:-8.5,r:1.15,text:'Take the lift',fn:()=>openLift(CV.lift)});

  /* ---- light: cool and dim, with pools of colour ---- */
  const hemi=new THREE.HemisphereLight(0x7088b8,0x141820,0.32);CG.add(hemi);
  const sp=new THREE.SpotLight(0xdfe8ff,1.3,26,0.95,0.6,1.2);sp.position.set(1.5,9,-0.5);sp.target.position.set(1.5,0,-0.5);CG.add(sp,sp.target);
  if(!coarse){sp.castShadow=true;sp.shadow.mapSize.set(1024,1024);sp.shadow.bias=-0.0006;sp.shadow.camera.near=1;sp.shadow.camera.far=16;}
  CV.lights.fall=new THREE.PointLight(0x5fffe0,0.9,9,1.4);CV.lights.fall.position.set(-9,2.4,-6);CG.add(CV.lights.fall);
  GFX.bumpAll(CG,[[rockT,1.3],[grateT,1.1]]);
}
function caveTick(dt,t){
  if(lvl!==2)return;
  CV.bats.forEach(b=>{b.a+=b.s*dt;const x=Math.cos(b.a)*b.r,z=Math.sin(b.a)*b.r*0.7;b.g.position.set(x,b.y+Math.sin(t*2+b.r)*0.3,z);b.g.rotation.y=-b.a+(b.s>0?0:Math.PI);
    const f=Math.sin(t*b.f+b.r)*0.9;b.w[0].rotation.z=f;b.w[1].rotation.z=-f;});
  if(Math.random()<dt*0.12&&SFX.blip)SFX.blip(2600,3400,0.05,'sine',0.012);
  CV.fall.material.map.offset.y=t*0.9;CV.mist.forEach((m,i)=>{m.material.opacity=0.24+Math.sin(t*2+i*2)*0.1;});
  /* one screen redrawn at a time keeps it cheap */
  CV.scrI=(CV.scrI+1)%CV.scr.length;CV.scr[CV.scrI].t.userData.go(t);if(CV.alert>0)CV.alert-=dt;
  /* car */
  if(CV.rev>0)CV.rev-=dt;const rv=Math.max(0,Math.min(1,CV.rev));CV.tt.rotation.y+=dt*(0.18+rv*1.4);
  CV.jets.forEach(j=>{j.material.opacity=rv*(0.7+Math.random()*0.3);});CV.ug.material.opacity=0.55+rv*0.4+Math.sin(t*3)*0.08;CV.lights.car.intensity=0.8+rv*0.9;
  /* bag swings back under a spring */
  const b=CV.bag,v=CV.bagV;v[0]+=(-b.rotation.x*16-v[0]*1.6)*dt;v[1]+=(-b.rotation.z*16-v[1]*1.6)*dt;b.rotation.x+=v[0]*dt;b.rotation.z+=v[1]*dt;
  if(CV.comboT>0)CV.comboT-=dt;
  CV.lights.desk.intensity=CV.alert>0?1.2+Math.sin(t*12)*0.4:1.0;CV.lights.desk.color.setHex(CV.alert>0&&CV.msg[0]==='ALERT!'?0xff4a5a:0x4fb8ff);
}
