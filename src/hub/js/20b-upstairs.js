/* ---------- upstairs: kitchen, living room and bedroom ----------
   The floor above the basement, on the same 22 m by 16 m footprint, reached by the stairs in the south-east corner.
   Only one floor is drawn at a time: going up hides the basement (and its lights), going down hides this one.
   Everything here sits in one group raised UY off the ground, so x and z are the same as the basement's. */
const UY=3.0,UH=2.7;
const U=new THREE.Group();U.position.y=UY;U.visible=false;scene.add(U);
let lvl=0;
/* the three rooms, so the camera stays on your side of a wall */
const UROOMS=[{x0:2,x1:RX,z0:-RZ,z1:RZ},{x0:-RX,x1:2,z0:-RZ,z1:0},{x0:-RX,x1:2,z0:0,z1:RZ}];
function uRoom(x,z){return x>=2?UROOMS[0]:z<0?UROOMS[1]:UROOMS[2];}
const ub=(w,h,d,m,x,y,z,ns)=>box(w,h,d,m,x,y,z,U,ns),uc=(rt,rb,h,m,x,y,z,seg)=>cyl(rt,rb,h,m,x,y,z,U,seg),us=(r,m,x,y,z)=>sph(r,m,x,y,z,U);
const usolid=(x0,x1,z0,z1)=>colliders.push({x0:x0,x1:x1,z0:z0,z1:z1,lv:1});
const uthing=o=>things.push(Object.assign({lv:1},o));
const UP={fire:false,cook:0,flip:0,stack:0,fridge:0,siz:null,busy:false,tick:0,day:1};
{
  /* ---- materials and textures ---- */
  const wt=(t,su,sv)=>{t=t.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(su||1,sv||1);return t;};
  const tileTex=mk(256,256,(g,w,h)=>{for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%2?'#f7f0e1':'#93d2c3';g.fillRect(x*64,y*64,64,64);}
    g.strokeStyle='rgba(110,100,80,.3)';g.lineWidth=2;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,h);g.moveTo(0,i*64);g.lineTo(w,i*64);g.stroke();}noise(g,w,h,8);},true);
  const brickTex=mk(256,128,(g,w,h)=>{g.fillStyle='#d9cbb8';g.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=-1;c<5;c++){const x=c*64+(r%2)*32+2,y=r*16+2;g.fillStyle='hsl('+(8+rnd()*12)+','+(40+rnd()*15)+'%,'+(38+rnd()*10)+'%)';g.fillRect(x,y,60,12);}noise(g,w,h,12);},true);
  const cream=S(0xfbf7ee,0.5),white=S(0xffffff,0.55),blk=S(0x17151c,0.4,0.3),steel=S(0xc9ced4,0.3,0.85),brass=S(0xc9a25e,0.35,0.85);
  const wood=S(0xc48c5a,0.5,0,{map:woodTex}),darkWood=S(0x7a5236,0.5,0,{map:woodTex});
  const PAINT={living:0xf2dfbd,kitchen:0xc4e8d3,bedroom:0xcdb5f0},pm={},pb={};
  for(const k in PAINT){pm[k]=pb[k]=S(PAINT[k],0.92);}

  /* ---- floors (world-space UVs, so pieces line up) and ceiling ---- */
  const uFloor=(x0,x1,z0,z1,mat,tile)=>{const g=new THREE.PlaneGeometry(x1-x0,z1-z0);g.rotateX(-Math.PI/2);const p=g.attributes.position,uv=g.attributes.uv,cx=(x0+x1)/2,cz=(z0+z1)/2;
    for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+cx)/tile,-(p.getZ(i)+cz)/tile);const m=new THREE.Mesh(g,mat);m.position.set(cx,0,cz);m.receiveShadow=true;U.add(m);return m;};
  const woodF=S(0xffe9d2,0.55,0,{map:wt(floorTex)});
  uFloor(2,9.8,-RZ,RZ,woodF,3.4);uFloor(9.8,RX,-RZ,4.3,woodF,3.4);uFloor(9.8,RX,6.8,RZ,woodF,3.4);
  uFloor(-RX,2,-RZ,0,S(0xffffff,0.45,0,{map:wt(tileTex)}),1.6);
  uFloor(-RX,2,0,RZ,S(0xe6b8dc,1,0,{map:wt(fabricTex)}),0.7);
  {const c=new THREE.Mesh(new THREE.PlaneGeometry(RX*2,RZ*2),S(0xfbf6ee,0.95));c.rotation.x=Math.PI/2;c.position.y=UH;U.add(c);}

  /* ---- outside walls with windows (and the front door) ---- */
  const glassM=new THREE.MeshStandardMaterial({color:0xbfe0f0,transparent:true,opacity:0.12,roughness:0.03,depthWrite:false});
  function winAt(g,o){
    const l=o.c-o.w/2,r=o.c+o.w/2,h=o.y1-o.y0,yc=(o.y0+o.y1)/2,d=0.22;
    box(o.w+0.12,0.05,d,cream,o.c,o.y0-0.025,-d/2+0.03,g,true);box(o.w+0.12,0.05,d,cream,o.c,o.y1+0.025,-d/2+0.03,g,true);
    [l-0.03,r+0.03].forEach(x=>box(0.06,h+0.1,d,cream,x,yc,-d/2+0.03,g,true));
    box(o.w+0.26,0.04,0.17,cream,o.c,o.y0-0.02,0.07,g,true);
    box(o.w+0.24,0.08,0.025,cream,o.c,o.y1+0.04,0.013,g,true);[l-0.04,r+0.04].forEach(x=>box(0.08,h+0.04,0.025,cream,x,yc,0.013,g,true));
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(o.w,h),glassM);gl.position.set(o.c,yc,-0.13);g.add(gl);
    box(0.04,h,0.04,cream,o.c,yc,-0.13,g,true);box(o.w,0.04,0.04,cream,o.c,yc,-0.13,g,true);
    if(o.curt)[l-0.22,r+0.22].forEach(x=>{const c=box(0.34,h+0.55,0.05,S(o.curt,0.95,0,{map:fabricTex}),x,yc+0.05,0.09,g,true);c.scale.x=1;});
    if(o.curt)box(o.w+1.0,0.03,0.03,brass,o.c,o.y1+0.3,0.1,g,true);
  }
  function doorAt(g,o){
    const l=o.c-o.w/2,r=o.c+o.w/2;
    box(o.w-0.02,o.y1-0.01,0.06,S(0x2f9bb0,0.5),o.c,(o.y1-0.01)/2,-0.1,g);
    sph(0.04,brass,o.c+o.w*0.36,1.0,-0.05,g);
    const wnd=new THREE.Mesh(new THREE.PlaneGeometry(o.w*0.5,0.4),new THREE.MeshBasicMaterial({color:0xfff4d6,toneMapped:false}));wnd.position.set(o.c,1.65,-0.065);g.add(wnd);
    box(o.w+0.24,0.09,0.03,cream,o.c,o.y1+0.045,0.015,g,true);[l-0.05,r+0.05].forEach(x=>box(0.1,o.y1,0.03,cream,x,o.y1/2,0.015,g,true));
  }
  /* one outside wall: a group on the wall line with local +z into the room; pieces are [from,to,room,openings] along it */
  function uWall(px,pz,rot,pieces){
    const g=new THREE.Group();g.position.set(px,0,pz);g.rotation.y=rot;U.add(g);
    const plane=(x0,x1,y0,y1,m)=>{if(x1-x0<0.01||y1-y0<0.01)return;const w=x1-x0,h=y1-y0,q=new THREE.Mesh(uvPlane(w,h,w/2.6,h/2.6),m);q.position.set((x0+x1)/2,(y0+y1)/2,0);q.receiveShadow=true;g.add(q);};
    const base=(x0,x1)=>{if(x1-x0>0.01)box(x1-x0,0.12,0.025,cream,(x0+x1)/2,0.06,0.013,g,true);};
    pieces.forEach(([a,b,room,ops])=>{
      const m=pm[room];let x=a;
      (ops||[]).slice().sort((p,q)=>p.c-q.c).forEach(o=>{const l=o.c-o.w/2,r=o.c+o.w/2;
        plane(x,l,0,UH,m);base(x,l);plane(l,r,0,o.y0,m);plane(l,r,o.y1,UH,m);if(!o.door)base(l,r);
        (o.door?doorAt:winAt)(g,o);x=r;});
      plane(x,b,0,UH,m);base(x,b);box(b-a,0.07,0.04,cream,(a+b)/2,UH-0.035,0.02,g,true);
    });
  }
  const W=(c,o)=>Object.assign({c:c,w:1.3,y0:0.9,y1:2.2},o||{});
  uWall(0,-RZ,0,[[-RX,2,'kitchen',[W(-6.5,{w:1.4,y0:1.18,y1:2.15})]],[2,RX,'living',[W(3.8)]]]);
  uWall(0,RZ,Math.PI,[[-RX,-2,'living',[{c:-5.5,w:1.0,y0:0,y1:2.15,door:true},W(-8.1)]],[-2,RX,'bedroom',[W(7.6,{curt:0xff9cc6}),W(3.5,{curt:0xff9cc6})]]]);
  uWall(RX,0,-Math.PI/2,[[-RZ,RZ,'living',[W(-5.5),W(1.4)]]]);
  uWall(-RX,0,Math.PI/2,[[-RZ,0,'bedroom',[W(-1.6,{curt:0xff9cc6}),W(-6.8,{curt:0xff9cc6})]],[0,RZ,'kitchen',[W(4.4)]]]);

  /* ---- inside walls: boxes painted for the room on each side, with a wide opening to the kitchen and a door to the bedroom ---- */
  const WT=0.12;
  function uIWall(axis,at,a,b,mPos,mNeg,ops){
    const mats=axis==='x'?[mPos,mNeg,cream,cream,cream,cream]:[cream,cream,cream,cream,mPos,mNeg];
    const seg=(s0,s1,y0,y1)=>{if(s1-s0<0.01)return;const L=s1-s0,h=y1-y0,c=(s0+s1)/2;
      const m=sh(new THREE.Mesh(axis==='x'?new THREE.BoxGeometry(WT,h,L):new THREE.BoxGeometry(L,h,WT),mats));
      if(axis==='x')m.position.set(at,(y0+y1)/2,c);else m.position.set(c,(y0+y1)/2,at);U.add(m);
      if(y0===0){if(axis==='x')usolid(at-WT/2,at+WT/2,s0,s1);else usolid(s0,s1,at-WT/2,at+WT/2);
        [-1,1].forEach(sd=>{const o=sd*(WT/2+0.012);if(axis==='x')ub(0.025,0.12,L,cream,at+o,0.06,c,true);else ub(L,0.12,0.025,cream,c,0.06,at+o,true);});}};
    const trimAt=(s,h)=>[-1,1].forEach(sd=>{const o=sd*(WT/2+0.012);if(axis==='x')ub(0.03,h,0.09,cream,at+o,h/2,s,true);else ub(0.09,h,0.03,cream,s,h/2,at+o,true);});
    let s=a;
    (ops||[]).forEach(o=>{const l=o.c-o.w/2,r=o.c+o.w/2;seg(s,l,0,UH);seg(l,r,o.h,UH);trimAt(l-0.045,o.h);trimAt(r+0.045,o.h);
      [-1,1].forEach(sd=>{const of=sd*(WT/2+0.012);if(axis==='x')ub(0.03,0.09,o.w+0.18,cream,at+of,o.h+0.045,o.c,true);else ub(o.w+0.18,0.09,0.03,cream,o.c,o.h+0.045,at+of,true);});s=r;});
    seg(s,b,0,UH);
  }
  uIWall('x',2,-RZ,0,pb.living,pb.kitchen,[{c:-3.8,w:4.4,h:2.35}]);
  uIWall('x',2,0,RZ,pb.living,pb.bedroom,[{c:2.6,w:1.1,h:2.1}]);
  uIWall('z',0,-RX,2-WT/2,pb.bedroom,pb.kitchen,[]);

  /* ---- lights: soft sky light, daylight through the windows, a ceiling lamp in each room ---- */
  const uHemi=new THREE.HemisphereLight(0xfff4e6,0x8c7a66,0.5);U.add(uHemi);
  const uSun=new THREE.DirectionalLight(0xfff0d8,0.6);uSun.position.set(9,9,6);uSun.target.position.set(-2,0,-1);U.add(uSun,uSun.target);
  if(!coarse){uSun.castShadow=true;uSun.shadow.mapSize.set(1024,1024);const c=uSun.shadow.camera;c.left=-15;c.right=15;c.top=13;c.bottom=-13;c.near=1;c.far=40;uSun.shadow.bias=-0.0008;uSun.shadow.radius=3;}
  const lampM=new THREE.MeshBasicMaterial({color:0xfff1d6,toneMapped:false});
  UP.lamps=[[6.5,-0.5],[-5.5,-4],[-4.5,4]].map(p=>{const d=uc(0.3,0.34,0.06,lampM,p[0],UH-0.03,p[1],24);d.castShadow=false;
    const l=new THREE.PointLight(0xffdcb0,0.7,14,1.2);l.position.set(p[0],UH-0.4,p[1]);U.add(l);return l;});
  UP.hemi=uHemi;UP.sun=uSun;

  const glowS=(col,s,op)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,transparent:true,opacity:op||0.6,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));sp.scale.set(s,s,1);return sp;};
  const uPlant=(x,z,s)=>{s=s||1;uc(0.2*s,0.15*s,0.34*s,S(0xd9774a,0.8),x,0.17*s,z);const lm=S(0x3f9a55,0.7);
    for(let i=0;i<9;i++){const a=i/9*6.28,l=us(1,lm,x+Math.cos(a)*0.14*s,(0.62+rnd()*0.25)*s,z+Math.sin(a)*0.14*s);l.scale.set(0.07*s,(0.34+rnd()*0.14)*s,0.15*s);l.rotation.set(Math.sin(a)*0.5,-a,-Math.cos(a)*0.5);}
    usolid(x-0.24*s,x+0.24*s,z-0.24*s,z+0.24*s);};
  const picture=(w,h,draw,x,y,z,ry)=>{const t=mk(Math.round(w*256),Math.round(h*256),draw,true),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;U.add(g);
    box(w+0.08,h+0.08,0.03,S(0xffffff,0.5),0,0,0.015,g,true);const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),S(0xffffff,0.8,0,{map:t}));p.position.z=0.032;g.add(p);return g;};

  /* ================= living room ================= */
  {
    const fab=S(0x7d8fd0,0.95,0,{map:fabricTex}),fab2=S(0x6a7cbf,0.95,0,{map:fabricTex});
    /* sofa facing the TV on the east wall */
    ub(1.0,0.3,2.7,fab2,5.55,0.27,-2);ub(0.22,0.8,2.7,fab2,5.14,0.6,-2);[-3.35,-0.65].forEach(z=>ub(1.0,0.62,0.22,fab2,5.55,0.43,z));
    [-2.82,-2,-1.18].forEach(z=>{ub(0.78,0.17,0.8,fab,5.68,0.5,z);ub(0.2,0.44,0.78,fab,5.33,0.82,z).rotation.z=0.16;});
    [[5.45,-3.0,0xffc928,0.4],[5.45,-1.0,0xff7aa8,-0.35]].forEach(p=>{const m=ub(0.13,0.4,0.4,S(p[2],0.95,0,{map:fabricTex}),p[0],0.76,p[1]);m.rotation.set(p[3],0,-0.25);});
    [[5.1,-3.3],[5.1,-0.7],[6.0,-3.3],[6.0,-0.7]].forEach(p=>uc(0.025,0.02,0.12,blk,p[0],0.06,p[1],8));
    usolid(5.03,6.05,-3.46,-0.54);
    uthing({x:6.6,z:-2,r:1.2,text:'Sit on the sofa',fn:()=>sit(SOFA_UP)});
    /* rug and coffee table */
    const rugT=mk(512,600,(g,w,h)=>{g.fillStyle='#f6ead2';g.fillRect(0,0,w,h);const cs=['#ff8fa8','#ffc928','#7fd6c2','#8fa6ff'];for(let i=0;i<4;i++){g.strokeStyle=cs[i];g.lineWidth=14;g.strokeRect(22+i*20,22+i*20,w-44-i*40,h-44-i*40);}
      for(let y=0;y<5;y++)for(let x=0;x<4;x++){g.fillStyle=cs[(x+y)%4];g.beginPath();g.arc(150+x*70,170+y*65,14,0,7);g.fill();}noise(g,w,h,10);},true);
    const rug=new THREE.Mesh(new THREE.PlaneGeometry(3.3,4.2),S(0xffffff,0.98,0,{map:rugT}));rug.rotation.x=-Math.PI/2;rug.position.set(7.5,0.008,-2);rug.receiveShadow=true;U.add(rug);
    ub(0.66,0.05,1.25,wood,7.35,0.42,-2);[[7.1,-2.5],[7.6,-2.5],[7.1,-1.5],[7.6,-1.5]].forEach(p=>uc(0.03,0.03,0.4,darkWood,p[0],0.2,p[1],8));
    ub(0.22,0.05,0.3,S(0xff5f5f,0.7),7.3,0.47,-2.3);uc(0.05,0.045,0.1,S(0xfff8e7,0.5),7.45,0.5,-1.6,12);
    usolid(7.0,7.7,-2.66,-1.34);
    /* TV on the east wall */
    ub(0.45,0.5,2.3,S(0xf6f1e6,0.5),10.74,0.25,-2);[-2.6,-1.4].forEach(z=>ub(0.01,0.3,0.5,darkWood,10.51,0.27,z,true));
    ub(0.06,0.96,1.7,blk,10.94,1.55,-2);
    const scr=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.88),new THREE.MeshBasicMaterial({map:tvTex,toneMapped:false}));scr.rotation.y=-Math.PI/2;scr.position.set(10.905,1.55,-2);U.add(scr);
    usolid(10.5,RX,-3.2,-0.8);
    /* fireplace on the north wall */
    ub(2.0,1.25,0.5,S(0xffffff,0.9,0,{map:brickTex}),6.5,0.625,-7.75);
    const fb=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.72),new THREE.MeshBasicMaterial({color:0x140c08}));fb.position.set(6.5,0.46,-7.495);U.add(fb);
    ub(2.5,0.08,0.75,S(0x8f8a84,0.8),6.5,0.04,-7.45);ub(2.4,0.1,0.42,darkWood,6.5,1.3,-7.63);
    [-0.18,0.18].forEach((d,i)=>{const lg=uc(0.06,0.06,0.62,S(0x6b4226,0.9),6.5+d*0.4,0.14+i*0.07,-7.4,8);lg.rotation.z=Math.PI/2;lg.rotation.y=d;});
    const fire=new THREE.Group();fire.position.set(6.5,0.16,-7.38);fire.visible=false;U.add(fire);UP.fireG=fire;UP.flames=[];
    [[0,0.38,0xffb030],[-0.16,0.26,0xff6a20],[0.16,0.28,0xff7a20],[0,0.2,0xfff070]].forEach(q=>{const f=new THREE.Mesh(new THREE.ConeGeometry(0.1,q[1],8),new THREE.MeshBasicMaterial({color:q[2],transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));f.position.set(q[0],q[1]/2,0.02);fire.add(f);UP.flames.push(f);});
    const fg=glowS(0xff8a30,1.5,0.7);fg.position.set(0,0.25,0.05);fire.add(fg);
    UP.fireL=new THREE.PointLight(0xff9a40,0,7,1.5);UP.fireL.position.set(6.5,0.7,-6.9);U.add(UP.fireL);
    usolid(5.5,7.5,-RZ,-7.48);
    uthing({x:6.5,z:-6.6,r:1.3,text:()=>UP.fire?'Put out the fire':'Light the fire',fn:()=>{UP.fire=!UP.fire;SFX.play(UP.fire?'switch':'toggle');if(UP.fire)SFX.burst(300,1800,0.5,0.12);toast(UP.fire?'Cozy':'The fire is out');}});
    picture(1.0,0.66,(g,w,h)=>{g.fillStyle='#fffdf4';g.fillRect(0,0,w,h);const cs=['#ff5f5f','#ffa53a','#ffd84a','#5fd06a','#4aa8ff','#a77bff'];
      g.lineWidth=12;cs.forEach((c,i)=>{g.strokeStyle=c;g.beginPath();g.arc(w/2,h*0.95,h*0.7-i*12,Math.PI,0);g.stroke();});
      g.fillStyle='#ffd84a';g.beginPath();g.arc(w*0.85,h*0.2,18,0,7);g.fill();g.fillStyle='#1d1640';g.font='900 26px Nunito,sans-serif';g.textAlign='center';g.fillText('HOME SWEET HOME',w/2,h*0.95-8);},6.5,1.85,-RZ+0.02,0);
    /* bookshelf, lamp, plants, armchair */
    {const x=9.4,z=-7.78;ub(1.5,2.0,0.03,darkWood,x,1.0,-7.98);[-0.74,0.74].forEach(d=>ub(0.04,2.0,0.4,darkWood,x+d,1.0,z));
     const pal=[0xb8433f,0x1f8a8a,0xe9b949,0x4d5a73,0xf3e6c8,0x6c4bd8,0x2fd08a,0xff8fb8];
     for(let k=0;k<5;k++){const y=0.03+k*0.48;ub(1.5,0.03,0.4,darkWood,x,y,z);if(k===4)break;let px=x-0.7;while(px<x+0.62){const w=0.03+rnd()*0.04,h=0.24+rnd()*0.14;ub(w,h,0.24,S(pal[Math.floor(rnd()*8)],0.8),px+w/2,y+0.015+h/2,z+0.02,true);px+=w+0.005;}}
     usolid(x-0.78,x+0.78,-RZ,-7.56);}
    {const x=4.9,z=-3.9;uc(0.16,0.18,0.03,blk,x,0.015,z,16);uc(0.015,0.015,1.5,brass,x,0.76,z,8);
     const sm=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.22,0.28,16,1,true),new THREE.MeshBasicMaterial({color:0xffe6b8,toneMapped:false,side:THREE.DoubleSide}));sm.position.set(x,1.58,z);U.add(sm);
     const gs=glowS(0xffc070,1.2,0.45);gs.position.set(x,1.55,z);U.add(gs);usolid(x-0.18,x+0.18,z-0.18,z+0.18);}
    uPlant(2.55,-7.45);uPlant(10.6,-7.5);uPlant(10.55,3.6,1.1);uPlant(2.55,7.45,0.9);
    {const g=new THREE.Group();g.position.set(8.3,0,1.9);g.rotation.y=-2.35;U.add(g);const f=S(0xf08a3c,0.95,0,{map:fabricTex}),f2=S(0xffb066,0.95,0,{map:fabricTex});
     box(0.8,0.22,0.78,f,0,0.2,0,g);const bk=box(0.8,0.62,0.16,f,0,0.68,-0.34,g);bk.rotation.x=-0.12;
     [-1,1].forEach(s=>{box(0.14,0.3,0.78,f,s*0.4,0.42,0,g);const a=cyl(0.08,0.08,0.78,f,s*0.4,0.57,0,g,12);a.rotation.x=Math.PI/2;});
     box(0.64,0.12,0.62,f2,0,0.37,0.05,g);const pl=box(0.4,0.36,0.1,S(0x7fd6c2,0.95,0,{map:fabricTex}),0,0.62,-0.22,g);pl.rotation.x=-0.2;
     [[-0.33,-0.3],[0.33,-0.3],[-0.33,0.3],[0.33,0.3]].forEach(p=>cyl(0.025,0.02,0.1,darkWood,p[0],0.05,p[1],g,8));
     usolid(7.8,8.8,1.4,2.4);
     uthing({x:7.7,z:1.1,r:1.1,text:'Check under the cushion',fn:()=>{const d=new Date().toISOString().slice(0,10);
       if(store.getItem('up-cushion')===d){SFX.play('pluck',{rate:0.7});toast('Just crumbs. Try again tomorrow');return;}
       store.setItem('up-cushion',d);SFX.play('coin');addCoins(10,'Found under the cushion');}});}
    /* front door and mat */
    {const mt=mk(256,128,(g,w,h)=>{g.fillStyle='#8a5a33';g.fillRect(0,0,w,h);g.strokeStyle='#5c3a1e';g.lineWidth=8;g.strokeRect(8,8,w-16,h-16);g.fillStyle='#f6e2b8';g.font='900 46px Nunito,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('HELLO',w/2,h/2);},true);
     const m=new THREE.Mesh(new THREE.PlaneGeometry(1.1,0.55),S(0xffffff,1,0,{map:mt}));m.rotation.x=-Math.PI/2;m.rotation.z=Math.PI;m.position.set(5.5,0.008,7.55);m.receiveShadow=true;U.add(m);}
    uthing({x:5.5,z:7.1,r:1.1,text:'Peek outside',fn:()=>{SFX.play('open',{rate:0.8});const night=hour<6.5||hour>19.5;
      const L=night?['Lots of stars out tonight','The street lights are on. Bedtime soon?','An owl is hooting somewhere']:['Nice day for the swings','The mailbox is empty. Maybe tomorrow','A squirrel is staring at you','Someone is mowing their lawn'];toast(L[Math.floor(Math.random()*L.length)]);}});
    /* the stairwell: a railed hole with steps going down toward the basement */
    const tread=S(0x9a6a44,0.55,0,{map:woodTex}),riser=S(0xf2ebdd,0.8),shaft=S(0xd9c7a8,0.95);
    ub(1.2,2.4,0.04,shaft,10.4,-1.2,4.3,true);ub(0.04,2.4,2.5,shaft,9.8,-1.2,5.55,true);ub(0.04,2.4,2.5,shaft,10.98,-1.2,5.55,true);
    for(let i=0;i<9;i++){const top=-0.2*(i+1),h=2.4+top,z=6.8-0.27*(i+0.5);ub(1.14,h,0.27,riser,10.4,-2.4+h/2,z,true);ub(1.16,0.03,0.29,tread,10.4,top+0.015,z,true);}
    {const gb=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.6),new THREE.MeshBasicMaterial({color:0x8a6a48}));gb.rotation.x=-Math.PI/2;gb.position.set(10.4,-2.38,5.1);U.add(gb);}
    ub(1.2,0.04,0.08,tread,10.4,-0.02,6.84,true);
    [4.25,5.1,5.95,6.8].forEach(z=>uc(0.035,0.035,1.0,cream,9.75,0.5,z,10));[10.4,10.98].forEach(x=>uc(0.035,0.035,1.0,cream,x,0.5,4.25,10));
    ub(0.07,0.06,2.62,tread,9.75,1.01,5.525);ub(1.3,0.06,0.07,tread,10.37,1.01,4.25);
    for(let z=4.45;z<6.7;z+=0.22)uc(0.012,0.012,0.95,cream,9.75,0.48,z,6);for(let x=9.95;x<10.95;x+=0.22)uc(0.012,0.012,0.95,cream,x,0.48,4.25,6);
    usolid(9.68,RX,4.18,6.82);
    uthing({x:10.4,z:7.35,r:1.15,text:'Go downstairs',fn:()=>goLevel(0,9.3,3.3,Math.PI*0.9)});
  }

  /* ================= kitchen ================= */
  {
    const cab=S(0xf8f5ee,0.5),door=S(0xfffdf8,0.45),top=S(0xd8a878,0.45,0,{map:woodTex});
    /* counters along the north wall, with the stove and the sink */
    ub(5.55,0.86,0.62,cab,-7.175,0.43,-7.69);ub(1.3,0.86,0.62,cab,-2.95,0.43,-7.69);
    ub(5.6,0.04,0.66,top,-7.175,0.88,-7.67);ub(1.35,0.04,0.66,top,-2.95,0.88,-7.67);
    for(let x=-9.65;x<-2.5;x+=0.6){if(x>-4.5&&x<-3.5)continue;ub(0.54,0.7,0.02,door,x,0.42,-7.37,true);ub(0.02,0.14,0.03,brass,x+0.2,0.66,-7.35,true);}
    ub(7.65,0.25,0.02,S(0xdff1f4,0.3),-6.12,1.025,-7.99,true);
    ub(0.64,0.012,0.44,S(0x7d858c,0.25,0.8),-6.5,0.905,-7.66,true);uc(0.025,0.025,0.32,steel,-6.5,1.06,-7.92,10);ub(0.04,0.04,0.22,steel,-6.5,1.21,-7.82,true);
    /* stove: burners glow while you cook */
    ub(0.78,0.86,0.64,S(0xf2f2f2,0.4,0.2),-4,0.43,-7.68);ub(0.8,0.04,0.66,blk,-4,0.88,-7.67);
    const oven=new THREE.Mesh(new THREE.PlaneGeometry(0.58,0.32),S(0x22252b,0.15,0.4));oven.position.set(-4,0.42,-7.355);U.add(oven);
    for(let k=0;k<4;k++)uc(0.018,0.018,0.03,blk,-4.27+k*0.18,0.78,-7.35,8).rotation.x=Math.PI/2;
    UP.burn=S(0x2a2a2e,0.5,0,{emissive:0xff3a10,emissiveIntensity:0});
    [[-4.18,-7.84],[-3.82,-7.84],[-4.18,-7.5],[-3.82,-7.5]].forEach(p=>uc(0.11,0.11,0.012,UP.burn,p[0],0.906,p[1],20));
    ub(0.82,0.28,0.5,steel,-4,1.72,-7.75);ub(0.32,0.92,0.26,steel,-4,2.24,-7.87);
    const pan=new THREE.Group();pan.position.set(-4.18,0.93,-7.5);pan.visible=false;U.add(pan);UP.pan=pan;
    {const p=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.13,0.04,20),blk);pan.add(p);const hd=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.025,0.035),blk);hd.position.set(0.25,0.01,0);pan.add(hd);
     UP.cake=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.025,18),S(0xe9b064,0.7));UP.cake.position.y=0.03;pan.add(UP.cake);}
    /* upper cabinets */
    [[-8.72,2.46],[-5.05,0.9],[-2.85,1.1]].forEach(q=>{ub(q[1],0.8,0.36,cab,q[0],1.9,-7.82);const n=Math.max(1,Math.round(q[1]/0.6)),dw=q[1]/n;for(let i=0;i<n;i++)ub(dw-0.05,0.72,0.02,door,q[0]-q[1]/2+dw*(i+0.5),1.9,-7.63,true);});
    usolid(-9.95,-2.3,-RZ,-7.34);
    uthing({x:-4,z:-6.8,r:1.2,text:()=>UP.cook>0?'Cooking…':'Make pancakes',fn:()=>{if(UP.cook>0)return;UP.cook=3.4;UP.pan.visible=true;UP.cake.position.y=0.03;UP.cake.rotation.x=0;
      SFX.play('switch');if(!UP.siz&&SFX.noiseLoop)UP.siz=SFX.noiseLoop({type:'highpass',freq:2600,q:0.6,vol:0});if(UP.siz)UP.siz.vol(0.05);toast('Sizzle…');}});
    /* fridge with a drawing on the door; it opens to show what is inside */
    {const fm=S(0x9fd8cc,0.35,0.1),x=-10.5;
     ub(0.9,1.95,0.04,fm,x,0.975,-7.98);[-0.43,0.43].forEach(d=>ub(0.04,1.95,0.72,fm,x+d,0.975,-7.64));ub(0.9,0.04,0.72,fm,x,1.93,-7.64);ub(0.9,0.06,0.72,fm,x,0.03,-7.64);
     const inside=new THREE.Mesh(new THREE.PlaneGeometry(0.82,1.84),new THREE.MeshBasicMaterial({color:0xeef8ff,toneMapped:false}));inside.position.set(x,0.98,-7.95);U.add(inside);
     [0.5,0.95,1.4].forEach(y=>ub(0.82,0.015,0.6,glassM,x,y,-7.65,true));
     [[-0.25,0.56,0xff5f5f],[0,0.58,0xffc928],[0.22,0.55,0x5fd06a],[-0.2,1.02,0xff8fb8],[0.15,1.04,0xffffff],[0,1.48,0x4aa8ff]].forEach(q=>us(0.07,S(q[2],0.6),x+q[0],q[1]+0.03,-7.62).castShadow=false);
     const piv=new THREE.Group();piv.position.set(x-0.45,0,-7.28);U.add(piv);UP.fdoor=piv;
     box(0.9,1.9,0.06,fm,0.45,0.98,0,piv);box(0.03,0.6,0.05,steel,0.82,1.2,0.05,piv,true);
     const dr=mk(160,200,(g,w,h)=>{g.fillStyle='#fffef6';g.fillRect(0,0,w,h);g.lineWidth=6;g.lineCap='round';
       g.strokeStyle='#ff9a3a';g.beginPath();g.arc(120,40,20,0,7);g.stroke();g.strokeStyle='#5fb0ff';g.beginPath();g.moveTo(10,180);g.lineTo(150,180);g.stroke();
       g.strokeStyle='#ff5fa2';g.strokeRect(30,90,70,70);g.beginPath();g.moveTo(25,92);g.lineTo(65,55);g.lineTo(105,92);g.stroke();g.strokeStyle='#3fb04a';g.beginPath();g.moveTo(125,178);g.lineTo(125,120);g.stroke();g.beginPath();g.arc(125,110,16,0,7);g.stroke();},true);
     const dp=new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.38),S(0xffffff,0.9,0,{map:dr}));dp.position.set(0.4,1.35,0.032);dp.rotation.z=0.06;piv.add(dp);
     sph(0.03,S(0xff4d6d,0.4),0.4,1.55,0.04,piv);
     usolid(x-0.45,x+0.45,-RZ,-7.25);
     const SNACK=['A juice box. Refreshing!','Leftover pizza. Cold pizza is the best pizza','Ice cream! Save some for later','Carrot sticks. Crunchy!','A whole jar of pickles','Chocolate pudding!','Strawberries. Yum'];
     uthing({x:-10.4,z:-6.7,r:1.15,text:'Open the fridge',fn:()=>{UP.fridge=2.8;SFX.play('open',{rate:0.9});toast(SNACK[Math.floor(Math.random()*SNACK.length)]);}});}
    /* island with stools, a fruit bowl and a plate for pancakes */
    ub(2.6,0.88,0.9,S(0x5aa39b,0.6),-5.6,0.44,-4.2);ub(2.75,0.05,1.05,S(0xf3efe8,0.3),-5.6,0.905,-4.2);
    [-6.5,-5.6,-4.7].forEach((x,i)=>{uc(0.2,0.2,0.06,S([0xff8f6b,0xffc928,0xb48cf0][i],0.6),x,0.7,-3.3,16);uc(0.03,0.03,0.68,steel,x,0.34,-3.3,8);uc(0.16,0.16,0.02,steel,x,0.01,-3.3,12);usolid(x-0.2,x+0.2,-3.5,-3.1);});
    {const bw=new THREE.Mesh(new THREE.SphereGeometry(0.2,16,8,0,6.29,Math.PI/2,Math.PI/2),S(0xffffff,0.4));bw.position.set(-6.4,1.1,-4.2);U.add(bw);
     [[0,0xff7a1a],[0.1,0xff3b3b],[-0.09,0x9be04a],[0.03,0xffd84a]].forEach((q,i)=>us(0.075,S(q[1],0.5),-6.4+q[0],0.99+(i>2?0.06:0),-4.2+(i%2?0.07:-0.06)));}
    uc(0.17,0.15,0.02,S(0xffffff,0.3),-4.9,0.94,-4.25,20);
    UP.cakes=[];for(let i=0;i<8;i++){const c=uc(0.11,0.11,0.024,S(0xe9b064,0.7),-4.9,0.962+i*0.026,-4.25,18);c.visible=false;UP.cakes.push(c);}
    UP.syrup=uc(0.06,0.08,0.012,S(0x8a4a10,0.2),-4.9,0,-4.25,14);UP.syrup.visible=false;
    usolid(-6.95,-4.25,-4.7,-3.7);
    /* round table with four chairs and a pendant lamp */
    {const x=-9.0,z=-2.3;uc(0.75,0.75,0.05,wood,x,0.75,z,28);uc(0.07,0.09,0.72,darkWood,x,0.37,z,10);uc(0.35,0.35,0.03,darkWood,x,0.015,z,18);
     [0xff8f6b,0xffc928,0x6fd0c0,0xb48cf0].forEach((c,i)=>{const a=i*Math.PI/2+0.4,g=new THREE.Group();g.position.set(x+Math.sin(a)*0.95,0,z+Math.cos(a)*0.95);g.rotation.y=a;U.add(g);const m=S(c,0.6);
       box(0.44,0.05,0.44,m,0,0.46,0,g);box(0.44,0.5,0.05,m,0,0.73,0.2,g);[[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]].forEach(p=>{const l=cyl(0.02,0.02,0.45,m,p[0],0.225,p[1],g,6);l.castShadow=true;});});
     uc(0.008,0.008,0.75,blk,x,UH-0.37,z,6);const sh2=new THREE.Mesh(new THREE.ConeGeometry(0.28,0.24,20,1,true),new THREE.MeshBasicMaterial({color:0xffe1b0,toneMapped:false,side:THREE.DoubleSide}));sh2.position.set(x,UH-0.84,z);U.add(sh2);
     const gs=glowS(0xffc070,1.4,0.4);gs.position.set(x,UH-0.95,z);U.add(gs);
     usolid(x-1.15,x+1.15,z-1.15,z+1.15);}
    /* clock over the door to the bedroom wall */
    {const m=new THREE.Mesh(new THREE.CircleGeometry(0.22,32),S(0xffffff,0.6,0,{map:clockTex,emissive:0xffffff,emissiveMap:clockTex,emissiveIntensity:0.1}));m.position.set(-6,2.0,-WT/2-0.015);m.rotation.y=Math.PI;U.add(m);}
    uPlant(1.5,-0.5,0.8);
  }

  /* ================= bedroom ================= */
  {
    const frame=S(0xfffaf3,0.55),lav=S(0xff9cc6,0.7);
    /* bed against the west wall, with a starry quilt and two plushies */
    const quilt=mk(256,256,(g,w,h)=>{g.fillStyle='#ff9cc6';g.fillRect(0,0,w,h);for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%2?'#ffb8d6':'#ff8fbd';g.fillRect(x*64,y*64,64,64);}
      g.fillStyle='#fff6c8';for(let i=0;i<10;i++){const cx=32+(i%4)*64,cy=32+Math.floor(i/4)*64*1.4;g.save();g.translate(cx,cy);g.beginPath();for(let k=0;k<10;k++){const r=k%2?7:16,a=k*Math.PI/5-Math.PI/2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.fill();g.restore();}
      noise(g,w,h,8);},true);
    ub(2.15,0.3,1.7,frame,-9.9,0.2,4.2);ub(2.0,0.22,1.6,S(0xffffff,0.8),-9.92,0.46,4.2);ub(1.45,0.06,1.68,S(0xffffff,0.9,0,{map:quilt}),-9.55,0.6,4.2);
    ub(0.16,0.08,1.68,S(0xfff6ee,0.9),-10.31,0.6,4.2);
    [3.82,4.58].forEach(z=>{const p=ub(0.38,0.14,0.64,S(0xffffff,0.9,0,{map:fabricTex}),-10.6,0.65,z);p.rotation.z=0.18;});
    ub(0.1,1.1,1.75,lav,-10.93,0.55,4.2);{const a=uc(0.875,0.875,0.1,lav,-10.93,1.1,4.2,28);a.rotation.z=Math.PI/2;}
    ub(0.08,0.6,1.72,frame,-8.84,0.32,4.2);
    {const bear=makeCritter({kind:'bear',head:0xc98b55,color:0xff9cc6},{shadow:true,map:fabricTex});bear.g.scale.setScalar(0.36);bear.g.position.set(-10.3,0.66,3.72);bear.g.rotation.y=Math.PI/2;U.add(bear.g);
     const bun=makeCritter({kind:'bunny',head:0xf4efe6,color:0x8fd8ff},{shadow:true,map:fabricTex});bun.g.scale.setScalar(0.34);bun.g.position.set(-10.3,0.66,4.7);bun.g.rotation.y=Math.PI/2+0.3;U.add(bun.g);}
    usolid(-RX,-8.8,3.33,5.07);
    uthing({x:-8.3,z:4.2,r:1.25,text:'Take a nap',fn:napTime});
    /* nightstands, one with a lamp */
    [2.9,5.5].forEach((z,i)=>{ub(0.5,0.55,0.48,frame,-10.72,0.275,z);ub(0.01,0.12,0.36,brass,-10.465,0.4,z,true);usolid(-RX,-10.45,z-0.26,z+0.26);
      if(!i){uc(0.08,0.1,0.22,S(0xffc928,0.5),-10.72,0.66,z,12);const sm=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.17,0.2,16,1,true),new THREE.MeshBasicMaterial({color:0xfff0c8,toneMapped:false,side:THREE.DoubleSide}));sm.position.set(-10.72,0.86,z);U.add(sm);
        const gs=glowS(0xffd080,1.0,0.45);gs.position.set(-10.72,0.86,z);U.add(gs);}
      else{ub(0.22,0.14,0.08,S(0x7fd6c2,0.5),-10.72,0.62,z);ub(0.2,0.04,0.28,S(0x8fa6ff,0.7),-10.7,0.57,z+0.1);}});
    /* wardrobe: changes your look, like the dresser downstairs */
    ub(1.7,2.15,0.6,S(0xfffaf3,0.5),-6.5,1.075,0.37);ub(0.012,1.95,0.01,S(0xd8cfc0,0.6),-6.5,1.08,0.675,true);
    [-0.12,0.12].forEach(d=>sph(0.035,brass,-6.5+d,1.1,0.69));ub(1.8,0.06,0.66,S(0xfffaf3,0.5),-6.5,2.18,0.37,true);
    usolid(-7.38,-5.62,0.06,0.72);
    uthing({x:-6.5,z:1.4,r:1.2,text:'Change your look',fn:()=>openCustom()});
    /* cubby shelf with coloured bins */
    ub(1.3,1.0,0.4,S(0xfffaf3,0.5),-3.4,0.5,0.26);[0xff8fb8,0xffc928,0x7fd6c2,0xb48cf0,0x8fa6ff,0xff8f6b].forEach((c,i)=>ub(0.36,0.36,0.04,S(c,0.8),-3.4+((i%3)-1)*0.41,0.29+Math.floor(i/3)*0.44,0.47,true));
    usolid(-4.08,-2.72,0.06,0.48);
    /* desk under the south window */
    {const x=-3.5;ub(1.4,0.05,0.65,S(0xfffaf3,0.5),x,0.74,7.62);[-0.65,0.65].forEach(d=>ub(0.05,0.72,0.6,S(0xfffaf3,0.5),x+d,0.36,7.62));
     const pp=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.3),S(0xffffff,0.9,0,{map:mk(128,96,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.lineWidth=4;g.strokeStyle='#ff5fa2';g.beginPath();g.arc(40,50,22,0,7);g.stroke();g.strokeStyle='#5fb0ff';g.beginPath();g.moveTo(70,80);g.lineTo(110,20);g.stroke();},true)}));
     pp.rotation.x=-Math.PI/2;pp.position.set(x-0.1,0.768,7.55);pp.rotation.z=0.15;U.add(pp);
     [0xff3b3b,0xffc928,0x3bb0ff,0x5fd06a].forEach((c,i)=>{const cr=uc(0.012,0.012,0.14,S(c,0.6),x+0.35,0.775,7.45+i*0.04,6);cr.rotation.z=Math.PI/2;});
     const g=new THREE.Group();g.position.set(x,0,6.95);U.add(g);const cm=S(0xff8fb8,0.6);box(0.44,0.05,0.44,cm,0,0.46,0,g);box(0.44,0.45,0.05,cm,0,0.71,-0.2,g);
     [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]].forEach(p=>cyl(0.02,0.02,0.45,cm,p[0],0.225,p[1],g,6));
     usolid(x-0.75,x+0.75,7.28,RZ);}
    /* toy corner: toy chest, beanbag and a dollhouse */
    ub(0.9,0.5,0.55,S(0x8fa6ff,0.7),-10.4,0.25,7.3);ub(0.94,0.06,0.59,S(0xffc928,0.6),-10.4,0.53,7.3);usolid(-RX,-9.93,6.98,RZ);
    {const b=us(0.48,S(0x7fd6c2,0.95,0,{map:fabricTex}),-8.7,0.28,7.15);b.scale.y=0.6;usolid(-9.1,-8.3,6.75,7.55);}
    {const x=-6.7,z=7.55;ub(0.75,0.55,0.4,S(0xfff3d6,0.6),x,0.275,z);const r=uc(0,0.58,0.32,S(0xff5f7a,0.6),x,0.71,z,4);r.rotation.y=Math.PI/4;r.scale.z=0.62;
     [[-0.18,0.36],[0.18,0.36],[-0.18,0.14],[0.18,0.14]].forEach(p=>ub(0.12,0.12,0.01,S(0x8fd8ff,0.3),x+p[0],p[1],z-0.205,true));ub(0.12,0.2,0.01,S(0xff8fb8,0.5),x,0.1,z-0.205,true);
     usolid(x-0.42,x+0.42,z-0.25,RZ);}
    /* round rainbow rug */
    {const t=mk(512,512,(g,w,h)=>{const cs=['#ff8fa8','#ffb36b','#ffe06b','#9be08a','#7fd6ff','#b9a2ff','#fff4e6'];g.fillStyle=cs[0];g.fillRect(0,0,w,h);cs.forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.arc(256,256,250-i*34,0,7);g.fill();});noise(g,w,h,10);},true);
     const r=new THREE.Mesh(new THREE.CircleGeometry(1.6,40),S(0xffffff,1,0,{map:t}));r.rotation.x=-Math.PI/2;r.position.set(-5.6,0.008,4.3);r.receiveShadow=true;U.add(r);}
    /* rainbow picture over the bed, and glow-in-the-dark stars on the ceiling */
    picture(1.3,0.62,(g,w,h)=>{g.fillStyle='#e8f6ff';g.fillRect(0,0,w,h);const cs=['#ff5f5f','#ffa53a','#ffd84a','#5fd06a','#4aa8ff','#a77bff'];g.lineWidth=11;
      cs.forEach((c,i)=>{g.strokeStyle=c;g.beginPath();g.arc(w/2,h,h*0.85-i*11,Math.PI,0);g.stroke();});g.fillStyle='#fff';[[60,h-20],[w-60,h-20]].forEach(p=>{g.beginPath();g.arc(p[0],p[1],22,0,7);g.arc(p[0]+24,p[1]+4,18,0,7);g.arc(p[0]-24,p[1]+4,18,0,7);g.fill();});},-RX+0.02,1.95,4.2,Math.PI/2);
    {const st=mk(64,64,(g,w,h)=>{g.fillStyle='#fff';g.beginPath();for(let k=0;k<10;k++){const r=k%2?12:30,a=k*Math.PI/5-Math.PI/2;g.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r);}g.fill();},true);
     UP.starM=new THREE.MeshBasicMaterial({map:st,color:0xd8ffb0,transparent:true,opacity:0.3,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending});
     for(let i=0;i<34;i++){const s=0.1+rnd()*0.14,m=new THREE.Mesh(new THREE.PlaneGeometry(s,s),UP.starM);m.rotation.set(Math.PI/2,0,rnd()*6);m.position.set(-10.4+rnd()*11.8,UH-0.01,0.5+rnd()*7);U.add(m);}}
    uPlant(1.5,7.45,0.8);
  }

  /* ================= outside: lawn, fence, trees and a swing set (dimmed with the daylight, like the view downstairs) ================= */
  {
    const gy=1.9-UY,grass=oMat(0x5f9d48);
    [[-120,120,-120,-RZ],[-120,120,RZ,120],[-120,-RX,-RZ,RZ],[RX,120,-RZ,RZ]].forEach(q=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(q[1]-q[0],q[3]-q[2]),grass);m.rotation.x=-Math.PI/2;m.position.set((q[0]+q[1])/2,gy,(q[2]+q[3])/2);U.add(m);});
    const path=new THREE.Mesh(new THREE.PlaneGeometry(1.4,12),oMat(0xc9bba4));path.rotation.x=-Math.PI/2;path.position.set(5.5,gy+0.01,14);U.add(path);
    /* picket fence round the yard */
    const pk=oMat(0xf4f0e6),n=Math.round(2*(44+36)/0.5),pm2=new THREE.InstancedMesh(new THREE.BoxGeometry(0.1,0.9,0.05),pk,n),d=new THREE.Object3D();let k=0;
    const run=(x1,z1,x2,z2)=>{const L=Math.hypot(x2-x1,z2-z1),ry=Math.atan2(x2-x1,z2-z1);for(let s=0;s<L&&k<n;s+=0.5){d.position.set(x1+(x2-x1)*s/L,gy+0.45,z1+(z2-z1)*s/L);d.rotation.y=ry+Math.PI/2;d.updateMatrix();pm2.setMatrixAt(k++,d.matrix);}
      [0.3,0.65].forEach(y=>{const r=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.06,L),pk);r.position.set((x1+x2)/2,gy+y,(z1+z2)/2);r.rotation.y=ry;U.add(r);});};
    run(-22,-18,22,-18);run(22,-18,22,18);run(22,18,6.6,18);run(4.4,18,-22,18);run(-22,18,-22,-18);pm2.count=k;U.add(pm2);
    /* swing set in the back yard */
    {const red=oMat(0xe0503c),yel=oMat(0xffc928),x=-8,z=13;[-1.4,1.4].forEach(dx=>[-0.7,0.7].forEach(dz=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.6,8),red);l.position.set(x+dx,gy+1.2,z+dz*0.55);l.rotation.x=dz>0?-0.27:0.27;U.add(l);}));
     const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,3,8),red);bar.rotation.z=Math.PI/2;bar.position.set(x,gy+2.45,z);U.add(bar);
     [-0.55,0.55].forEach(dx=>{[-0.18,0.18].forEach(rx=>{const r=new THREE.Mesh(new THREE.BoxGeometry(0.02,1.9,0.02),oMat(0x6b5a4a));r.position.set(x+dx+rx,gy+1.5,z);U.add(r);});const s=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.05,0.22),yel);s.position.set(x+dx,gy+0.55,z);U.add(s);});}
    /* a mailbox by the path */
    {const p=new THREE.Mesh(new THREE.BoxGeometry(0.08,1.0,0.08),oMat(0x7a5236));p.position.set(4.3,gy+0.5,17.4);U.add(p);const b=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.24,0.45),oMat(0x2f6fd0));b.position.set(4.3,gy+1.1,17.4);U.add(b);}
    /* trees: cones and balls until the nature models arrive */
    const items=[],stand=[],trunk=oMat(0x5a4030),leaf=[0x2f6b35,0x3a7d3e,0x46904a].map(c=>oMat(c));
    for(let i=0;i<46;i++){const a=rnd()*6.283,r=26+rnd()*40,x=Math.cos(a)*r*1.2,z=Math.sin(a)*r,s=0.9+rnd()*0.7,v=Math.floor(rnd()*5);
      items.push({v:v,x:x,y:gy,z:z,ry:rnd()*6.28,h:(6+rnd()*3)*s});
      const t=new THREE.Mesh(new THREE.CylinderGeometry(0.15*s,0.22*s,2.4*s,6),trunk);t.position.set(x,gy+1.2*s,z);U.add(t);stand.push(t);
      const c=new THREE.Mesh(new THREE.IcosahedronGeometry(1.9*s,0),leaf[i%3]);c.position.set(x,gy+3.6*s,z);U.add(c);stand.push(c);}
    [[-15,-12],[15,-13],[16,12],[-16,6],[-4,15],[12,15]].forEach((p,i)=>items.push({v:i%5,x:p[0],y:gy,z:p[1],ry:i*1.3,h:6+i%3}));
    GFX.scatter([1,2,3,4,5].map(n=>'nature/CommonTree_'+n+'.gltf'),items,U,{mat:m=>oMat(0xc8d8b8,{map:m.map,alphaTest:0.5,side:THREE.DoubleSide}),done:()=>stand.forEach(s=>s.visible=false)});
  }
  /* bump detail for the upstairs-only textures (the shared ones are done in 20e-levels.js) */
  GFX.bumpAll(U,[[tileTex,0.7],[brickTex,1.4]]);
}
const SOFA_UP={x:5.72,z:-2,h:Math.PI/2,stand:[6.55,-2],cam:[4.15,1.95,-2],look:[11,1.25,-2]};

/* the stairs from the basement (going between floors lives in 20e-levels.js) */
things.push({x:10.4,z:3.75,r:0.95,text:'Go upstairs',fn:()=>goLevel(1,8.7,6.6,-2.36)});
function napTime(){
  if(UP.busy)return;UP.busy=true;SFX.play('drop2');fadeEl.style.transition='opacity .9s ease';fadeEl.style.opacity='1';
  setTimeout(()=>{const night=hour>=18||hour<6;hour=night?7.5:(hour+3)%24;worldTick=0;UP.tick=0;
    fadeEl.style.opacity='0';setTimeout(()=>{fadeEl.style.transition='opacity .35s ease';UP.busy=false;},900);
    SFX.play('win',{vol:0.6});toast(night?'Good morning! Rise and shine':'What a nice nap');},1500);
}
function upTick(dt,t){
  if(lvl!==1)return;
  UP.tick-=dt;if(UP.tick<=0){UP.tick=0.25;const a=(hour-6)/24*Math.PI*2,el=Math.sin(a),day=Math.max(0,Math.min(1,(el+0.12)/0.4));UP.day=day;
    UP.hemi.intensity=0.12+0.16*day;UP.sun.intensity=0.08+0.7*day;UP.sun.color.setHex(day>0.5?0xfff0d8:0xffc898);UP.lamps.forEach(l=>l.intensity=0.95-0.5*day);UP.starM.opacity=0.08+0.8*(1-day);}
  /* fire */
  UP.fireG.visible=UP.fire;UP.fireL.intensity+=((UP.fire?1.3+Math.sin(t*13)*0.15+Math.sin(t*7.3)*0.12:0)-UP.fireL.intensity)*Math.min(1,dt*6);
  if(UP.fire)UP.flames.forEach((f,i)=>{f.scale.y=0.85+Math.sin(t*(9+i*2.3)+i)*0.2;f.scale.x=f.scale.z=0.9+Math.sin(t*7+i)*0.1;});
  /* pancakes: burners glow, the pancake flips halfway, then it lands on the stack */
  if(UP.cook>0){UP.cook-=dt;UP.burn.emissiveIntensity=Math.min(1.6,UP.burn.emissiveIntensity+dt*3);
    const c=UP.cook;if(c<2.0&&c>1.3){const f=(2.0-c)/0.7;UP.cake.position.y=0.03+Math.sin(f*Math.PI)*0.35;UP.cake.rotation.x=f*Math.PI;}
    if(c<=0){UP.pan.visible=false;if(UP.siz)UP.siz.vol(0);if(UP.stack<UP.cakes.length)UP.cakes[UP.stack++].visible=true;
      UP.syrup.visible=true;UP.syrup.position.y=0.962+UP.stack*0.026;SFX.play('tile_match');toast(UP.stack>1?UP.stack+' pancakes! Stack them high':'Pancakes!');}}
  else if(UP.burn.emissiveIntensity>0)UP.burn.emissiveIntensity=Math.max(0,UP.burn.emissiveIntensity-dt*1.5);
  /* fridge door */
  if(UP.fridge>0)UP.fridge-=dt;UP.fdoor.rotation.y+=((UP.fridge>0?-1.9:0)-UP.fdoor.rotation.y)*Math.min(1,dt*6);
}
