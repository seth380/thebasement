/* ---------- the star deck ----------
   A spaceship lounge with a wall of windows onto space: a ringed planet, a moon, drifting rocks, and a hyperdrive that jumps to a new planet.
   A captain's chair, a holotable, a hover-bot called Bolt, a snack replicator, an airlock you should not open, a teleporter and an arcade wall.
   Its group floats high above the house (only one base is drawn at a time). */
const DECK_Y=60,SG=new THREE.Group();SG.position.y=DECK_Y;SG.visible=false;scene.add(SG);
const DK={warp:0,swapped:false,lines:null,planet:null,ptex:null,ring:null,rocks:[],holo:null,holoMode:0,bot:null,botT:0,botI:0,snackT:0,snack:null,beam:null,beamT:0,airT:0,hum:null,lights:{},place:'Planet Pebble-9'};
{
  const db=(w,h,d,m,x,y,z,ns)=>box(w,h,d,m,x,y,z,SG,ns),dc=(rt,rb,h,m,x,y,z,seg)=>cyl(rt,rb,h,m,x,y,z,SG,seg);
  const dsolid=(x0,x1,z0,z1)=>colliders.push({x0:x0,x1:x1,z0:z0,z1:z1,lv:3});
  const dthing=o=>things.push(Object.assign({lv:3},o));
  const glowB=c=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
  const glowS=(col,s,op)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,transparent:true,opacity:op===undefined?0.6:op,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));sp.scale.set(s,s,1);return sp;};
  const DW=11,DD=7,DH=3.6;
  /* ---- panels ---- */
  const panelT=(base,seam,lights)=>{const t=mk(256,256,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);g.strokeStyle=seam;g.lineWidth=4;g.strokeRect(2,2,w-4,h-4);g.lineWidth=2;g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.stroke();
      for(let i=0;i<4;i++){g.fillStyle=seam;g.beginPath();g.arc(14+(i%2)*(w-28),14+Math.floor(i/2)*(h-28),4,0,7);g.fill();}if(lights){g.fillStyle=lights;g.fillRect(w/2-30,h-30,60,6);}noise(g,w,h,8);},true);
    t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
  const floorT=panelT('#2a3140','#141822','#38c8ff');floorT.repeat.set(DW*2/1.6,DD*2/1.6);
  const wallT=panelT('#dfe5ee','#9aa6b8',null);wallT.repeat.set(10,1.5);
  const ceilT=panelT('#c9d1dd','#8a96a8',null);ceilT.repeat.set(10,6);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(DW*2,DD*2),S(0xffffff,0.45,0.4,{map:floorT}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;SG.add(fl);
  const ce=new THREE.Mesh(new THREE.PlaneGeometry(DW*2,DD*2),S(0xffffff,0.8,0.2,{map:ceilT}));ce.rotation.x=Math.PI/2;ce.position.y=DH;SG.add(ce);
  const wallM=S(0xffffff,0.55,0.3,{map:wallT}),hull=S(0x8994a6,0.35,0.7),dark=S(0x161a22,0.5,0.4);
  /* side and back walls */
  [[-DW,0,Math.PI/2,DD*2],[DW,0,-Math.PI/2,DD*2],[0,DD,Math.PI,DW*2]].forEach(q=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(q[3],DH),wallM);m.position.set(q[0],DH/2,q[1]);m.rotation.y=q[2];m.receiveShadow=true;SG.add(m);});
  /* light strips along the ceiling and the base of the walls */
  [-3.5,0,3.5].forEach(z=>db(DW*2-1,0.04,0.18,glowB(0xe8f6ff),0,DH-0.03,z,true));
  [[0,DD-0.03,DW*2,0.03],[-DW+0.03,0,0.03,DD*2],[DW-0.03,0,0.03,DD*2]].forEach(q=>db(q[2],0.04,q[3],glowB(0x38c8ff),q[0],0.15,q[1],true));
  /* the window wall: struts, a sill and big panes of glass */
  db(DW*2,0.55,0.45,hull,0,0.275,-DD+0.2);db(DW*2,0.45,0.45,hull,0,DH-0.225,-DD+0.2);
  db(DW*2,0.04,0.1,glowB(0x38c8ff),0,0.56,-DD+0.43,true);
  [-11,-6.6,-2.2,2.2,6.6,11].forEach(x=>db(0.3,DH,0.45,hull,x,DH/2,-DD+0.2));
  {const gl=new THREE.MeshStandardMaterial({color:0x9fd0ff,transparent:true,opacity:0.07,roughness:0.02,metalness:0.4,depthWrite:false});
   const p=new THREE.Mesh(new THREE.PlaneGeometry(DW*2,DH-1),gl);p.position.set(0,0.55+(DH-1)/2,-DD+0.12);SG.add(p);}
  dsolid(-DW,DW,-DD,-DD+0.45);

  /* ---- space outside: stars, a ringed planet, a moon, a sun, drifting rocks ---- */
  {const st=mk(2048,1024,(g,w,h)=>{g.fillStyle='#03040c';g.fillRect(0,0,w,h);
      [['rgba(110,60,200,.20)',600,420,520],['rgba(40,140,220,.16)',1400,560,600],['rgba(255,80,160,.10)',1000,300,420]].forEach(n=>{const r=g.createRadialGradient(n[1],n[2],0,n[1],n[2],n[3]);r.addColorStop(0,n[0]);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
      for(let i=0;i<2600;i++){const b=rnd(),s=b>0.985?2.2:b>0.9?1.4:0.8;g.fillStyle='rgba(255,255,255,'+(0.35+rnd()*0.65)+')';g.fillRect(rnd()*w,rnd()*h,s,s);}},true);
   const sky=new THREE.Mesh(new THREE.SphereGeometry(170,48,24),new THREE.MeshBasicMaterial({map:st,side:THREE.BackSide,toneMapped:false,depthWrite:false}));sky.renderOrder=-2;SG.add(sky);DK.sky=sky;
   DK.ptex=mk(512,256,(g,w,h,hue)=>{hue=hue===undefined?28:hue;for(let y=0;y<h;y++){const b=Math.sin(y*0.09)*0.5+Math.sin(y*0.031+1)*0.5;g.fillStyle='hsl('+(hue+b*18)+','+(55+b*15)+'%,'+(48+b*14)+'%)';g.fillRect(0,y,w,1);}
      for(let i=0;i<40;i++){g.fillStyle='hsla('+(hue+30)+',70%,80%,.12)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,20+rnd()*60,3+rnd()*6,0,0,7);g.fill();}},true);
   DK.planet=new THREE.Mesh(new THREE.SphereGeometry(34,48,32),new THREE.MeshStandardMaterial({map:DK.ptex,roughness:0.9,emissive:0x221810,emissiveIntensity:0.25}));DK.planet.position.set(26,-10,-112);DK.planet.rotation.z=0.25;SG.add(DK.planet);
   const rt=mk(512,8,(g,w,h)=>{const r=g.createLinearGradient(0,0,w,0);[[0,'rgba(255,230,190,0)'],[0.15,'rgba(255,230,190,.55)'],[0.4,'rgba(220,180,140,.25)'],[0.55,'rgba(255,240,210,.6)'],[0.85,'rgba(200,170,140,.3)'],[1,'rgba(200,170,140,0)']].forEach(q=>r.addColorStop(q[0],q[1]));g.fillStyle=r;g.fillRect(0,0,w,h);},true);
   const rg=new THREE.RingGeometry(42,64,96,1),uv=rg.attributes.uv,pp=rg.attributes.position;for(let i=0;i<uv.count;i++){const r=Math.hypot(pp.getX(i),pp.getY(i));uv.setXY(i,(r-42)/22,0.5);}
   DK.ring=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({map:rt,transparent:true,side:THREE.DoubleSide,depthWrite:false,toneMapped:false}));DK.ring.position.copy(DK.planet.position);DK.ring.rotation.set(-1.25,0.2,0.3);SG.add(DK.ring);
   DK.moon=new THREE.Mesh(new THREE.SphereGeometry(6,24,16),new THREE.MeshStandardMaterial({color:0xc8ccd6,roughness:1}));DK.moon.position.set(-46,22,-128);SG.add(DK.moon);
   const sunG=glowS(0xfff0d0,90,0.55);sunG.position.set(-110,46,-150);SG.add(sunG);DK.sunG=sunG;
   const rm=new THREE.MeshStandardMaterial({color:0x8a7f74,roughness:1,flatShading:true});
   for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(0.6+rnd()*2.2,0),rm);m.position.set(-70+rnd()*140,-18+rnd()*36,-40-rnd()*90);SG.add(m);DK.rocks.push({m:m,v:0.5+rnd()*1.5,r:(rnd()-0.5)*0.6});}
   const sl=new THREE.DirectionalLight(0xffe6c8,0.5);sl.position.set(-110,46,-150);SG.add(sl,sl.target);}
  /* hyperspace streaks, shown during a jump */
  {const N=260,pos=new Float32Array(N*6),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
   DK.lines=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xd8f0ff,transparent:true,opacity:0,toneMapped:false}));DK.lines.visible=false;DK.lines.frustumCulled=false;SG.add(DK.lines);
   DK.streak=[];for(let i=0;i<N;i++){let x,y;do{x=(rnd()-0.5)*120;y=(rnd()-0.5)*70;}while(Math.hypot(x,y*1.4)<10);DK.streak.push({x:x,y:y,z:-20-rnd()*140});}}

  /* ---- captain's chair and the helm ---- */
  {const C=[0,-2.9];const g=new THREE.Group();g.position.set(C[0],0,C[1]);SG.add(g);const red=S(0xc8323c,0.6),wh=S(0xe6ebf2,0.4,0.3);
   cyl(0.45,0.55,0.1,dark,0,0.05,0,g,24);cyl(0.12,0.12,0.4,hull,0,0.3,0,g,12);box(0.8,0.14,0.75,wh,0,0.42,0,g);box(0.62,0.08,0.6,red,0,0.52,-0.02,g);
   box(0.8,1.15,0.14,wh,0,1.1,0.38,g).rotation.x=0.08;box(0.6,0.95,0.06,red,0,1.12,0.3,g).rotation.x=0.08;[-1,1].forEach(s=>{box(0.14,0.12,0.7,wh,s*0.46,0.72,0,g);const p=new THREE.Mesh(new THREE.PlaneGeometry(0.1,0.3),glowB(s<0?0x38c8ff:0xffc928));p.rotation.x=-Math.PI/2;p.position.set(s*0.46,0.785,-0.1);g.add(p);});
   DK.seat={x:C[0],z:C[1],h:Math.PI,stand:[C[0],C[1]+1.1],cam:[C[0],2.05,C[1]+1.7],look:[C[0],1.75,-DD-4]};
   dsolid(C[0]-0.5,C[0]+0.5,C[1]-0.45,C[1]+0.5);
   dthing({x:C[0],z:C[1]+1.1,r:0.85,text:"Sit in the captain's chair",fn:()=>sit(DK.seat)});
   /* helm: a curved console with glowing buttons and a hyperdrive lever */
   for(let i=-2;i<=2;i++){const a=i*0.3,x=Math.sin(a)*2.0,z=-4.4-Math.cos(a)*0.6+0.6,m=db(0.85,0.85,0.55,hull,x,0.42,z);m.rotation.y=-a;const tp=db(0.86,0.06,0.6,dark,x,0.87,z);tp.rotation.y=-a;tp.rotation.x=0.25;
     for(let k=0;k<3;k++){const b=new THREE.Mesh(new THREE.CircleGeometry(0.045,12),glowB([0xff4a5a,0x4dff9a,0x38c8ff,0xffc928][(i+k+4)%4]));b.rotation.x=-Math.PI/2;b.position.set(-0.25+k*0.25,0.032,0);tp.add(b);}}
   const lev=new THREE.Group();lev.position.set(1.95,0.92,-4.15);SG.add(lev);DK.lever=lev;cyl(0.03,0.03,0.45,S(0xc9ced4,0.3,0.9),0,0.22,0,lev,8);sph(0.08,S(0xff4a5a,0.4),0,0.46,0,lev);lev.rotation.x=-0.5;
   dsolid(-2.4,2.4,-5.1,-3.95);
   dthing({x:2.5,z:-3.3,r:1.05,text:()=>DK.warp>0?'Jumping…':'Engage hyperdrive',fn:()=>{if(DK.warp>0)return;DK.warp=3.4;DK.swapped=false;SFX.play('start');SFX.burst(80,1600,2.2,0.2);toast('Hold on tight!');}});}

  /* ---- holotable ---- */
  {const H=[-5.2,0.6];dc(0.9,1.0,0.85,hull,H[0],0.425,H[1],32);dc(0.95,0.95,0.06,dark,H[0],0.88,H[1],32);
   const top=new THREE.Mesh(new THREE.CircleGeometry(0.85,40),glowB(0x0f4a6a));top.rotation.x=-Math.PI/2;top.position.set(H[0],0.915,H[1]);SG.add(top);
   const holo=new THREE.Group();holo.position.set(H[0],1.65,H[1]);SG.add(holo);DK.holo=holo;const hm=new THREE.MeshBasicMaterial({color:0x5fe0ff,wireframe:true,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
   const pl=new THREE.Mesh(new THREE.SphereGeometry(0.42,18,12),hm);holo.add(pl);const rg=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.01,6,48),hm);rg.rotation.x=1.3;holo.add(rg);
   DK.moons=[0,1,2].map(i=>{const m=new THREE.Mesh(new THREE.SphereGeometry(0.06,10,8),hm);holo.add(m);return m;});DK.holoPlanet=[pl,rg];
   {const N=700,pos=new Float32Array(N*3);for(let i=0;i<N;i++){const arm=i%3,r=Math.pow(rnd(),0.7)*0.75,a=arm*2.09+r*5+rnd()*0.4;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=(rnd()-0.5)*0.05;pos[i*3+2]=Math.sin(a)*r;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));DK.galaxy=new THREE.Points(g,new THREE.PointsMaterial({color:0xbfe8ff,size:0.03,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false}));DK.galaxy.visible=false;holo.add(DK.galaxy);}
   const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.85,0.5,0.8,32,1,true),new THREE.MeshBasicMaterial({color:0x38c8ff,transparent:true,opacity:0.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));beam.position.set(H[0],1.32,H[1]);SG.add(beam);
   dsolid(H[0]-1,H[0]+1,H[1]-1,H[1]+1);
   dthing({x:H[0]+1.5,z:H[1],r:1.1,text:()=>DK.holoMode?'Show the planet':'Show the galaxy',fn:()=>{DK.holoMode=1-DK.holoMode;DK.galaxy.visible=!!DK.holoMode;DK.holoPlanet.forEach(m=>m.visible=!DK.holoMode);DK.moons.forEach(m=>m.visible=!DK.holoMode);SFX.play('toggle');}});
   DK.lights.holo=new THREE.PointLight(0x38c8ff,0.8,7,1.5);DK.lights.holo.position.set(H[0],1.6,H[1]);SG.add(DK.lights.holo);}

  /* ---- Bolt, the hover-bot ---- */
  {const g=new THREE.Group();SG.add(g);const wh=S(0xf2f5fa,0.3,0.2),vis=new THREE.MeshBasicMaterial({color:0x101828});
   const body=sph(0.3,wh,0,0,0,g);const v=new THREE.Mesh(new THREE.SphereGeometry(0.305,24,12,Math.PI/2-0.9,1.8,1.2,0.7),vis);g.add(v);
   const eyes=[-0.08,0.08].map(x=>{const e=new THREE.Mesh(new THREE.CircleGeometry(0.035,12),glowB(0x5fe8ff));e.position.set(x,0.03,0.302);g.add(e);return e;});
   cyl(0.008,0.008,0.22,S(0x9aa6b8,0.3,0.8),0,0.38,0,g,6);sph(0.035,new THREE.MeshBasicMaterial({color:0xff4a5a,toneMapped:false}),0,0.5,0,g);
   [-1,1].forEach(s=>{const f=box(0.1,0.04,0.18,wh,s*0.33,-0.05,0,g);f.rotation.z=s*0.4;});
   const gl=glowS(0x5fe8ff,0.9,0.5);gl.position.y=-0.38;g.add(gl);
   DK.bot={g:g,x:4,z:1.5,h:0,eyes:eyes,said:0};g.position.set(4,1.05,1.5);
   const LINES=['Beep boop! The arcade is at the back.','I calculate a 97% chance you play Waterfare next.','Do not open the airlock. I mean it. Beep.','I polished the windows. Space is very dusty.','Try the hyperdrive lever. New planet every time!','My favourite snack is a bolt. Get it? Bolt!'];
   DK.botThing={lv:3,x:4,z:1.5,r:1.25,text:'Talk to Bolt',fn:()=>{const b=DK.bot;b.said=(b.said+1)%LINES.length;toast('Bolt: '+LINES[b.said]);[0,1,2].forEach(k=>SFX.blip(700+Math.random()*900,900+Math.random()*1200,0.07,'square',0.03,{delay:k*0.09}));b.h=Math.atan2(P.x-b.x,P.z-b.z);DK.botT=2.5;}};
   things.push(DK.botThing);}

  /* ---- snack replicator in the west wall ---- */
  {const R=[-10.7,3.2];db(0.6,2.3,1.5,hull,R[0],1.15,R[1]);const ni=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.0),glowB(0x1a6a8a));ni.rotation.y=Math.PI/2;ni.position.set(R[0]+0.31,1.3,R[1]);SG.add(ni);
   const pad=new THREE.Mesh(new THREE.CircleGeometry(0.28,24),glowB(0x7fe8ff));pad.rotation.x=-Math.PI/2;pad.position.set(R[0]+0.45,0.92,R[1]);SG.add(pad);db(0.5,0.06,0.9,dark,R[0]+0.45,0.89,R[1]);
   const lb=mk(256,64,(c,w,h)=>{c.fillStyle='#0c1420';c.fillRect(0,0,w,h);c.fillStyle='#7fe8ff';c.font='900 30px Nunito,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('SNACKS',w/2,h/2+2);},true);
   const lm=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.2),new THREE.MeshBasicMaterial({map:lb,toneMapped:false}));lm.rotation.y=Math.PI/2;lm.position.set(R[0]+0.31,2.0,R[1]);SG.add(lm);
   const sn=new THREE.Group();sn.position.set(R[0]+0.45,0.95,R[1]);SG.add(sn);DK.snack=sn;DK.snackPad=pad;
   dsolid(-DW,R[0]+0.75,R[1]-0.75,R[1]+0.75);
   const SN=[['A glowing milkshake',()=>{cyl(0.07,0.06,0.2,new THREE.MeshBasicMaterial({color:0x8affc8,toneMapped:false}),0,0.1,0,sn,12);cyl(0.008,0.008,0.15,S(0xff4d6d,0.5),0.03,0.22,0,sn,6);}],
     ['Space pizza (zero gravity cheese)',()=>{const c=new THREE.Mesh(new THREE.ConeGeometry(0.15,0.02,3),S(0xffc23a,0.7));c.position.y=0.02;sn.add(c);[0,1,2].forEach(k=>sph(0.02,S(0xd0312d,0.6),Math.cos(k*2)*0.05,0.04,Math.sin(k*2)*0.05,sn));}],
     ['A moon donut',()=>{const d=new THREE.Mesh(new THREE.TorusGeometry(0.08,0.035,10,20),S(0xff8fb8,0.6));d.rotation.x=Math.PI/2;d.position.y=0.04;sn.add(d);}],
     ['Comet candy',()=>{sph(0.06,new THREE.MeshBasicMaterial({color:0xffd84a,toneMapped:false}),0,0.08,0,sn);}],
     ['Freeze-dried ice cream',()=>{box(0.14,0.06,0.08,S(0xfff0e0,0.8),0,0.03,0,sn);box(0.14,0.06,0.08,S(0xff8fb8,0.8),0,0.09,0,sn);}]];
   dthing({x:R[0]+1.5,z:R[1],r:1.1,text:'Order a snack',fn:()=>{while(sn.children.length)sn.remove(sn.children[0]);const s=SN[Math.floor(Math.random()*SN.length)];s[1]();DK.snackT=1;SFX.play('tile_match',{rate:1.3});SFX.blip(400,1600,0.3,'sine',0.04);toast(s[0]+'!');}});}

  /* ---- airlock in the east wall ---- */
  {const A=[10.95,2.6],g=new THREE.Group();g.position.set(A[0],0,A[1]);g.rotation.y=-Math.PI/2;SG.add(g);
   const hz=mk(128,16,(c,w,h)=>{for(let x=-16;x<w;x+=32){c.fillStyle='#ffc928';c.beginPath();c.moveTo(x,h);c.lineTo(x+16,0);c.lineTo(x+32,0);c.lineTo(x+16,h);c.fill();}c.globalCompositeOperation='destination-over';c.fillStyle='#16181d';c.fillRect(0,0,w,h);},true);
   [[0,2.55,1.9,0.18],[-0.95,1.3,0.18,2.6],[0.95,1.3,0.18,2.6]].forEach(q=>{const t=hz.clone();t.needsUpdate=true;t.wrapS=THREE.RepeatWrapping;t.repeat.set(Math.max(q[2],q[3])/0.6,1);const m=new THREE.Mesh(new THREE.PlaneGeometry(q[2],q[3]),new THREE.MeshBasicMaterial({map:t}));if(q[3]>q[2]){m.rotation.z=Math.PI/2;m.geometry=new THREE.PlaneGeometry(q[3],q[2]);}m.position.set(q[0],q[1],0.03);g.add(m);});
   box(1.7,2.4,0.1,hull,0,1.2,0.0,g);const pw=new THREE.Mesh(new THREE.CircleGeometry(0.28,24),new THREE.MeshBasicMaterial({map:DK.sky.material.map,toneMapped:false}));pw.position.set(0,1.6,0.06);g.add(pw);
   box(0.04,2.2,0.12,dark,0,1.15,0.05,g,true);
   DK.airL=new THREE.Mesh(new THREE.SphereGeometry(0.08,12,8),new THREE.MeshBasicMaterial({color:0x661010,toneMapped:false}));DK.airL.position.set(0,2.8,0.08);g.add(DK.airL);
   dthing({x:A[0]-1.2,z:A[1],r:1.1,text:'Open the airlock',fn:()=>{DK.airT=2.5;SFX.play('error');toast(['Better not. Space is very cold','Bolt says absolutely not','The airlock is locked. Phew'][Math.floor(Math.random()*3)]);}});}

  /* ---- hydroponic garden in the corner ---- */
  {const x=9.6,z=-5.2;db(2.2,0.5,0.6,hull,x,0.25,z);db(2.2,0.04,0.6,dark,x,1.3,z,true);const gl=new THREE.Mesh(new THREE.BoxGeometry(2.1,0.03,0.1),glowB(0xd06bff));gl.position.set(x,2.2,z);SG.add(gl);
   for(let i=0;i<9;i++)sph(0.12+rnd()*0.08,S([0x4dd06a,0x7fe060,0x2fa850][i%3],0.7),x-0.9+i*0.225,0.62+rnd()*0.1,z,SG);
   for(let i=0;i<7;i++)sph(0.1,S([0xff5f5f,0xffd84a,0x9be04a][i%3],0.5),x-0.8+i*0.27,1.42,z,SG);
   const pl=new THREE.PointLight(0xd06bff,0.5,4,1.6);pl.position.set(x,1.9,z+0.3);SG.add(pl);dsolid(x-1.15,x+1.15,z-0.35,z+0.35);}

  /* ---- arcade wall at the back ---- */
  {const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.3,0.82),new THREE.MeshBasicMaterial({map:neonTex,transparent:true,toneMapped:false,depthWrite:false}));sign.position.set(0,2.85,DD-0.06);sign.rotation.y=Math.PI;SG.add(sign);
   db(11,0.05,0.05,glowB(0xff4fa0),0,2.3,DD-0.05,true);
   META.forEach((m,i)=>cabinet(m,(i-2)*2.05,i,{par:SG,z:DD-0.52,ry:Math.PI/2,lv:3}));
   DK.lights.arcade=new THREE.PointLight(0xff4fa0,0.8,8,1.5);DK.lights.arcade.position.set(0,2.6,5);SG.add(DK.lights.arcade);}

  /* ---- teleporter: the way back to the other bases ---- */
  {const T=[-8.3,-4.3];dc(0.95,1.0,0.12,hull,T[0],0.06,T[1],32);const top=new THREE.Mesh(new THREE.CircleGeometry(0.82,32),glowB(0x1f7fae));top.rotation.x=-Math.PI/2;top.position.set(T[0],0.125,T[1]);SG.add(top);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(0.88,0.04,8,40),glowB(0x7fe8ff));ring.rotation.x=Math.PI/2;ring.position.set(T[0],0.13,T[1]);SG.add(ring);
   dc(1.0,1.0,0.1,hull,T[0],DH-0.05,T[1],32);const tr=new THREE.Mesh(new THREE.TorusGeometry(0.85,0.04,8,40),glowB(0x7fe8ff));tr.rotation.x=Math.PI/2;tr.position.set(T[0],DH-0.1,T[1]);SG.add(tr);
   DK.beam=new THREE.Mesh(new THREE.CylinderGeometry(0.82,0.82,DH-0.2,32,1,true),new THREE.MeshBasicMaterial({color:0x7fe8ff,transparent:true,opacity:0.06,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));DK.beam.position.set(T[0],(DH-0.2)/2+0.1,T[1]);SG.add(DK.beam);
   DK.pad={t:0};dthing({x:T[0],z:T[1],r:1.0,text:'Use the teleporter',fn:()=>openLift(DK.pad)});}

  /* ---- light ---- */
  const hemi=new THREE.HemisphereLight(0xdfe8ff,0x2a3040,0.5);SG.add(hemi);
  const sp=new THREE.SpotLight(0xeef6ff,0.8,14,1.2,0.7,1.2);sp.position.set(0,DH-0.1,0.5);sp.target.position.set(0,0,0.5);SG.add(sp,sp.target);
  if(!coarse){sp.castShadow=true;sp.shadow.mapSize.set(1024,1024);sp.shadow.bias=-0.0006;sp.shadow.camera.near=0.5;sp.shadow.camera.far=8;}
  DK.lights.helm=new THREE.PointLight(0x38c8ff,0.7,7,1.5);DK.lights.helm.position.set(0,1.6,-4.6);SG.add(DK.lights.helm);
  GFX.bumpAll(SG,[[floorT,0.9],[wallT,0.6],[ceilT,0.5]]);
}
const PLANET_A=['Zor','Bli','Kee','Mo','Vex','Lun','Pip','Quo','Taz','Nim'],PLANET_B=['bo','ria','zz','tron','nia','lax','dle','o'];
function deckTick(dt,t){
  if(lvl!==3)return;
  if(SFX.ready&&SFX.noiseLoop&&!DK.hum)DK.hum=SFX.noiseLoop({type:'lowpass',freq:140,q:0.5,vol:0});
  DK.planet.rotation.y+=dt*0.02;DK.ring.rotation.z+=dt*0.004;DK.rocks.forEach(r=>{r.m.position.x+=r.v*dt;r.m.rotation.x+=r.r*dt;r.m.rotation.y+=r.r*dt*0.7;if(r.m.position.x>80)r.m.position.x=-80;});
  /* hyperdrive: the view streaks, the old planet goes, a new one is waiting at the other end */
  const w=DK.warp>0;if(w){DK.warp-=dt;const p=1-DK.warp/3.4,sp=Math.sin(Math.min(1,p)*Math.PI),pos=DK.lines.geometry.attributes.position.array;
    DK.lines.visible=true;DK.lines.material.opacity=Math.min(1,sp*1.6);const v=40+sp*360,len=1+sp*26;
    DK.streak.forEach((s,i)=>{s.z+=v*dt;if(s.z>-8)s.z=-160;pos.set([s.x,s.y,s.z,s.x,s.y,s.z-len],i*6);});DK.lines.geometry.attributes.position.needsUpdate=true;
    const hide=p>0.18&&p<0.82;[DK.planet,DK.ring,DK.moon,DK.sunG].forEach(m=>m.visible=!hide);DK.rocks.forEach(r=>r.m.visible=!hide);DK.sky.material.color.setScalar(1-sp*0.5);
    DK.lever.rotation.x=0.5;
    if(p>0.5&&!DK.swapped){DK.swapped=true;DK.ptex.userData.go(Math.floor(Math.random()*360));DK.ring.visible=Math.random()<0.7;DK.ringOn=DK.ring.visible;
      DK.planet.scale.setScalar(0.7+Math.random()*0.6);DK.place='Planet '+PLANET_A[Math.floor(Math.random()*PLANET_A.length)]+PLANET_B[Math.floor(Math.random()*PLANET_B.length)]+'-'+(1+Math.floor(Math.random()*99));}
    if(DK.warp<=0){DK.lines.visible=false;DK.sky.material.color.setScalar(1);[DK.planet,DK.moon,DK.sunG].forEach(m=>m.visible=true);DK.ring.visible=DK.ringOn!==false;DK.rocks.forEach(r=>r.m.visible=true);DK.lever.rotation.x=-0.5;
      SFX.play('land');toast('Arrived at '+DK.place+'!');}}
  if(DK.hum)DK.hum.vol(0.05+(w?0.12:0));
  /* holotable */
  DK.holo.rotation.y+=dt*0.5;DK.moons.forEach((m,i)=>{const a=t*(0.8+i*0.4)+i*2;m.position.set(Math.cos(a)*(0.55+i*0.12),Math.sin(a*0.7)*0.08,Math.sin(a)*(0.55+i*0.12));});
  /* Bolt drifts between spots, bobbing, and turns to you when you talk */
  {const b=DK.bot,SP=[[4,1.5],[2,4.2],[-1.5,2.2],[6.5,-1.5],[3.5,-1]];if(DK.botT>0)DK.botT-=dt;else{const s=SP[DK.botI],dx=s[0]-b.x,dz=s[1]-b.z,d=Math.hypot(dx,dz);
      if(d<0.1){DK.botI=(DK.botI+1)%SP.length;DK.botT=2+Math.random()*3;}else{const st=Math.min(d,0.8*dt);b.x+=dx/d*st;b.z+=dz/d*st;const h=Math.atan2(dx,dz),dh=Math.atan2(Math.sin(h-b.h),Math.cos(h-b.h));b.h+=dh*Math.min(1,dt*3);}}
   b.g.position.set(b.x,1.05+Math.sin(t*2.2)*0.07,b.z);b.g.rotation.y=b.h;b.g.rotation.z=Math.sin(t*1.3)*0.05;DK.botThing.x=b.x;DK.botThing.z=b.z;
   const blink=(t%4)<0.12;b.eyes.forEach(e=>e.scale.y=blink?0.15:1);}
  if(DK.snackT>0){DK.snackT-=dt;DK.snack.scale.setScalar(1-Math.max(0,DK.snackT-0.6)*2.5);DK.snackPad.material.color.setHex(DK.snackT>0.4?0xffffff:0x7fe8ff);}
  if(DK.airT>0){DK.airT-=dt;DK.airL.material.color.setHex(Math.sin(t*14)>0?0xff2020:0x661010);}else DK.airL.material.color.setHex(0x661010);
  if(DK.pad.t>0)DK.pad.t-=dt;DK.beam.material.opacity=0.06+Math.max(0,DK.pad.t)*0.35+Math.sin(t*3)*0.02;
}
