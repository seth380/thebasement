/* ---------- things you can buy and place in your bases ----------
   Every item is drawn in code (so it works in the single-file build too). build(colour) returns a group standing on the floor,
   centred, with its front facing +z. w and d are its footprint in metres; flat items (rugs) can go under other things.
   colors: the colours it can be painted (the Colour button cycles them). use: something to do with it once it is placed.
   tick: how it moves (lava lamp blobs, disco ball, fish). */
const DECO_PAL=[0x3fa8a0,0xe8b23a,0xd9774f,0x34507a,0x8bb35a,0x6c4bd8,0xff4d6d,0xf4ead6];
const DECO_CATS=[['furniture','Furniture'],['fun','Fun'],['plants','Plants'],['lights','Lights'],['rugs','Rugs']];
const DECO_ITEMS=(()=>{
  const gB=c=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
  const gS=(c,s,op)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:c,transparent:true,opacity:op===undefined?0.55:op,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));sp.scale.set(s,s,1);return sp;};
  const fab=c=>S(c,0.95,0,{map:fabricTex}),lite=(c,k)=>new THREE.Color(c).lerp(new THREE.Color(0xffffff),k||0.3).getHex();
  const wood=S(0xc48c5a,0.5,0,{map:woodTex}),dark=S(0x7a5236,0.5,0,{map:woodTex}),blk=S(0x1d1f26,0.45,0.3),steel=S(0xc9ced4,0.3,0.85),gold=S(0xffc928,0.25,1),white=S(0xf4f4f2,0.45);
  const glass=()=>new THREE.MeshStandardMaterial({color:0xdff2ff,transparent:true,opacity:0.18,roughness:0.05,metalness:0.1,depthWrite:false});
  const G=()=>new THREE.Group();
  /* a soft patch of light lying on the floor */
  const pool=(c,s,op)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({map:glowTex,color:c,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));m.rotation.x=-Math.PI/2;m.position.y=0.012;m.renderOrder=2;return m;};
  const legs4=(g,w,d,h,m,r)=>[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>cyl(r||0.025,r||0.02,h,m,q[0]*w/2,h/2,q[1]*d/2,g,8));
  const pot=(g,r,h,c)=>{cyl(r,r*0.78,h,S(c||0xd9774f,0.8),0,h/2,0,g,16);const soil=cyl(r*0.94,r*0.94,0.02,S(0x3a2a1c,1),0,h-0.01,0,g,16);soil.castShadow=false;};
  const rugTex=(w,h,draw)=>mk(w,h,draw,true);
  const items=[
  /* ---- furniture ---- */
  {id:'beanbag',name:'Beanbag',cat:'furniture',price:0,w:0.9,d:0.9,colors:DECO_PAL,build:c=>{const g=G(),m=fab(c);const b=sph(0.45,m,0,0.27,0,g);b.scale.set(1,0.6,1);const t=sph(0.3,m,0,0.44,-0.14,g);t.scale.set(1.1,0.75,0.75);return g;}},
  {id:'armchair',name:'Armchair',cat:'furniture',price:120,w:0.9,d:0.85,colors:DECO_PAL,build:c=>{const g=G(),f=fab(c),f2=fab(lite(c));
    box(0.8,0.22,0.78,f,0,0.2,0,g);box(0.8,0.62,0.16,f,0,0.68,-0.34,g).rotation.x=-0.12;
    [-1,1].forEach(s=>{box(0.14,0.3,0.78,f,s*0.4,0.42,0,g);const a=cyl(0.08,0.08,0.78,f,s*0.4,0.57,0,g,12);a.rotation.x=Math.PI/2;});
    box(0.64,0.12,0.62,f2,0,0.37,0.05,g);legs4(g,0.66,0.6,0.1,dark);return g;}},
  {id:'loveseat',name:'Little sofa',cat:'furniture',price:250,w:1.6,d:0.85,colors:DECO_PAL,build:c=>{const g=G(),f=fab(c),f2=fab(lite(c,0.2));
    box(1.5,0.28,0.8,f,0,0.26,0,g);box(1.5,0.62,0.2,f,0,0.62,-0.32,g);[-1,1].forEach(s=>box(0.18,0.5,0.8,f,s*0.75,0.43,0,g));
    [-1,1].forEach(s=>{box(0.64,0.14,0.62,f2,s*0.33,0.47,0.06,g);box(0.62,0.38,0.14,f2,s*0.33,0.75,-0.2,g).rotation.x=-0.18;});legs4(g,1.4,0.7,0.12,dark);return g;}},
  {id:'coffee',name:'Coffee table',cat:'furniture',price:80,w:1.05,d:0.6,build:()=>{const g=G();box(1.0,0.05,0.56,wood,0,0.42,0,g);box(0.9,0.03,0.46,dark,0,0.14,0,g);legs4(g,0.9,0.46,0.42,dark,0.025);
    box(0.24,0.04,0.3,S(0x34507a,0.7),-0.2,0.47,0.02,g).rotation.y=0.2;cyl(0.04,0.035,0.09,S(0xf4ead6,0.4),0.28,0.49,-0.08,g,12);return g;}},
  {id:'books',name:'Bookshelf',cat:'furniture',price:150,w:1.05,d:0.36,build:()=>{const g=G();box(1.0,1.6,0.03,dark,0,0.8,-0.15,g);[-1,1].forEach(k=>box(0.03,1.6,0.33,dark,k*0.5,0.8,0,g));
    const pal=[0x34507a,0x3fa8a0,0xe8b23a,0xd9774f,0x8bb35a,0xf4ead6,0x6b4a8f,0xb8433f];let sd=7;const r=()=>(sd=(sd*9301+49297)%233280)/233280;
    for(let k=0;k<5;k++){const y=0.03+k*0.39;box(1.0,0.03,0.33,wood,0,y,0,g,true);if(k===4)break;let px=-0.46;while(px<0.44){const w=0.03+r()*0.04,h=0.22+r()*0.12;box(w,h,0.24,S(pal[Math.floor(r()*8)],0.8),px+w/2,y+0.015+h/2,0.02,g,true);px+=w+0.005;}}return g;}},
  {id:'gamechair',name:'Gaming chair',cat:'furniture',price:180,w:0.7,d:0.7,colors:DECO_PAL,build:c=>{const g=G(),cm=S(c,0.5),bk=S(0x23262b,0.5);
    for(let i=0;i<5;i++){const l=box(0.32,0.04,0.05,bk,0,0.06,0,g);l.rotation.y=i*1.2566;l.translateX(0.16);}cyl(0.04,0.04,0.36,steel,0,0.26,0,g,10);
    box(0.56,0.1,0.54,bk,0,0.48,0,g);const back=box(0.52,0.85,0.1,bk,0,0.95,-0.24,g);back.rotation.x=-0.12;
    [-0.13,0.13].forEach(x=>{const st=box(0.08,0.7,0.105,cm,x,0.95,-0.235,g,true);st.rotation.x=-0.12;});box(0.3,0.1,0.06,cm,0,1.34,-0.29,g).rotation.x=-0.12;
    [-1,1].forEach(s=>{box(0.06,0.04,0.34,bk,s*0.31,0.7,0.0,g);box(0.04,0.2,0.04,bk,s*0.31,0.6,-0.08,g);});return g;}},
  {id:'desk',name:'Computer desk',cat:'furniture',price:220,w:1.25,d:0.65,build:()=>{const g=G();box(1.2,0.04,0.6,white,0,0.74,0,g);[-1,1].forEach(s=>box(0.04,0.72,0.56,white,s*0.58,0.36,0,g));
    const sc=mk(256,144,(c,w,h)=>{const gr=c.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#2f9bff');gr.addColorStop(1,'#6c4bd8');c.fillStyle=gr;c.fillRect(0,0,w,h);c.fillStyle='#ffc928';c.font='900 34px Nunito,sans-serif';c.textAlign='center';c.fillText('GG!',w/2,h/2+12);},true);
    box(0.6,0.36,0.03,blk,0,1.06,-0.18,g);const s=new THREE.Mesh(new THREE.PlaneGeometry(0.56,0.32),new THREE.MeshBasicMaterial({map:sc,toneMapped:false}));s.position.set(0,1.06,-0.163);g.add(s);
    box(0.06,0.14,0.05,blk,0,0.82,-0.2,g);box(0.2,0.015,0.14,blk,0,0.762,-0.2,g);box(0.42,0.02,0.13,blk,0,0.77,0.08,g);const ms=sph(0.03,blk,0.32,0.775,0.08,g);ms.scale.set(1,0.6,1.4);
    const k=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.11),gB(0x38c8ff));k.rotation.x=-Math.PI/2;k.position.set(0,0.781,0.08);k.material.transparent=true;k.material.opacity=0.35;g.add(k);return g;}},
  {id:'sidetable',name:'Side table',cat:'furniture',price:40,w:0.5,d:0.5,build:()=>{const g=G();cyl(0.25,0.25,0.04,wood,0,0.55,0,g,20);cyl(0.04,0.05,0.53,dark,0,0.265,0,g,8);cyl(0.18,0.2,0.02,dark,0,0.01,0,g,16);
    const b=cyl(0.04,0.035,0.08,S(0x3fa8a0,0.4),0.06,0.61,0.03,g,10);const pl=sph(0.06,S(0x3f9a55,0.7),0.06,0.69,0.03,g);pl.scale.y=1.3;return g;}},
  /* ---- fun ---- */
  {id:'claw',name:'Claw machine',cat:'fun',price:300,w:0.85,d:0.85,colors:DECO_PAL,build:c=>{const g=G(),cm=S(c,0.45);
    box(0.8,0.9,0.8,cm,0,0.45,0,g);box(0.82,0.04,0.82,S(0x23262b,0.4),0,0.92,0,g);const gl=box(0.76,0.66,0.76,glass(),0,1.27,0,g,true);gl.castShadow=false;
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>box(0.04,0.66,0.04,cm,q[0]*0.38,1.27,q[1]*0.38,g));box(0.8,0.26,0.8,cm,0,1.73,0,g);
    const mq=mk(256,64,(x,w,h)=>{x.fillStyle='#1d1640';x.fillRect(0,0,w,h);x.fillStyle='#ffc928';x.font='900 44px Nunito,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('CLAW!',w/2,h/2+3);},true);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(0.66,0.18),new THREE.MeshBasicMaterial({map:mq,toneMapped:false}));m.position.set(0,1.73,0.405);g.add(m);
    [0xff4d6d,0xffc928,0x3fa8a0,0x8bb35a,0x6c4bd8,0xd9774f,0x2f9bff].forEach((p,i)=>{const s=sph(0.09,S(p,0.8,0,{map:fabricTex}),-0.25+(i%4)*0.17,1.0+Math.floor(i/4)*0.1,-0.2+((i*3)%4)*0.13,g);s.castShadow=false;});
    const cl=G();cl.position.set(0.1,1.55,0.05);g.add(cl);cyl(0.006,0.006,0.2,steel,0,0.05,0,cl,6);[0,2.09,4.19].forEach(a=>{const f=box(0.012,0.09,0.012,steel,Math.sin(a)*0.04,-0.08,Math.cos(a)*0.04,cl);f.rotation.set(Math.cos(a)*0.4,0,-Math.sin(a)*0.4);});
    const bt=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.02,12),gB(0xff4d6d));bt.position.set(0.22,0.93,0.3);g.add(bt);cyl(0.008,0.008,0.08,blk,-0.15,0.97,0.3,g,6);sph(0.025,S(0xff4d6d,0.3),-0.15,1.02,0.3,g);
    const gs=gS(0xffc928,0.9,0.4);gs.position.set(0,1.73,0.45);g.add(gs);g.userData.claw=cl;return g;},
    tick:(g,t)=>{const cl=g.userData.claw;cl.position.x=Math.sin(t*0.7)*0.22;cl.position.z=Math.cos(t*0.5)*0.2;},
    use:{text:'Try the claw',fn:()=>{SFX.play('switch');SFX.blip(400,900,0.6,'square',0.025);setTimeout(()=>{if(Math.random()<0.35){SFX.play('win');toast(['You won a plush bear!','You won a squishy frog!','You won a tiny dragon!'][Math.floor(Math.random()*3)]);}else{SFX.play('error');toast('So close! It slipped');}},900);}}},
  {id:'jukebox',name:'Jukebox',cat:'fun',price:250,w:0.75,d:0.5,build:()=>{const g=G(),wm=S(0x8a3b2a,0.4,0,{map:woodTex});
    box(0.7,1.1,0.45,wm,0,0.55,0,g);const top=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.45,24,1,false,-Math.PI/2,Math.PI),wm);top.rotation.x=Math.PI/2;top.rotation.y=Math.PI/2;top.position.set(0,1.1,0);g.add(top);
    const tubes=[];[0.31,0.25].forEach((r,i)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(r,0.025,8,30,Math.PI),gB(i?0xff4d6d:0xffc928));t.position.set(0,1.1,0.23);g.add(t);tubes.push(t);});
    [-1,1].forEach(s=>{const b=box(0.05,0.9,0.03,gB(0x38c8ff),s*0.3,0.55,0.225,g,true);tubes.push(b);});
    const pn=mk(128,128,(c,w,h)=>{c.fillStyle='#2a1d14';c.fillRect(0,0,w,h);for(let y=10;y<h;y+=12){c.fillStyle='#d8b070';c.fillRect(14,y,w-28,4);}},true);
    const p=new THREE.Mesh(new THREE.PlaneGeometry(0.46,0.42),S(0xffffff,0.5,0.2,{map:pn}));p.position.set(0,0.4,0.226);g.add(p);
    const rec=new THREE.Mesh(new THREE.PlaneGeometry(0.46,0.28),gB(0xffe8b0));rec.position.set(0,0.9,0.226);g.add(rec);const gs=gS(0xffb050,1.3,0.35);gs.position.set(0,1.0,0.35);g.add(gs);
    g.userData.tubes=tubes;return g;},
    tick:(g,t)=>{g.userData.tubes.forEach((m,i)=>m.material.color.setHSL(((t*0.15+i*0.25)%1),0.85,0.6));},
    use:{text:'Play the jukebox',fn:()=>{const N=[[523,0],[659,0.18],[784,0.36],[659,0.54],[698,0.72],[880,0.9],[784,1.08],[659,1.26],[587,1.44],[523,1.62]];N.forEach(n=>SFX.blip(n[0],n[0],0.16,'triangle',0.04,{delay:n[1]}));toast('♪ Now playing: Basement Boogie');}}},
  {id:'drums',name:'Drum kit',cat:'fun',price:260,w:1.3,d:1.0,colors:DECO_PAL,build:c=>{const g=G(),sh=S(c,0.3,0.4),hd=S(0xf4f4f2,0.6),chr=steel;
    const bd=cyl(0.3,0.3,0.34,sh,0,0.32,-0.05,g,24);bd.rotation.x=Math.PI/2;const fh=cyl(0.29,0.29,0.35,hd,0,0.32,-0.05,g,24);fh.rotation.x=Math.PI/2;fh.scale.set(1,1.01,1);
    const lg=mk(128,128,(x,w,h)=>{x.fillStyle='#f4f4f2';x.fillRect(0,0,w,h);x.fillStyle='#1d1640';x.font='900 30px Nunito,sans-serif';x.textAlign='center';x.fillText('ROCK',w/2,70);},true);
    const lf=new THREE.Mesh(new THREE.CircleGeometry(0.28,24),S(0xffffff,0.6,0,{map:lg}));lf.position.set(0,0.32,0.126);g.add(lf);
    [[-0.18,0.72,-0.05,0.13],[0.18,0.72,-0.05,0.13]].forEach(q=>{cyl(q[3],q[3],0.14,sh,q[0],q[1],q[2],g,18);cyl(q[3]*0.98,q[3]*0.98,0.142,hd,q[0],q[1],q[2],g,18);});
    cyl(0.17,0.17,0.13,sh,0.42,0.6,0.25,g,18);cyl(0.168,0.168,0.132,hd,0.42,0.6,0.25,g,18);cyl(0.012,0.012,0.54,chr,0.42,0.27,0.25,g,6);
    cyl(0.2,0.2,0.2,sh,-0.48,0.45,0.2,g,18);cyl(0.198,0.198,0.202,hd,-0.48,0.45,0.2,g,18);cyl(0.012,0.012,0.35,chr,-0.48,0.17,0.2,g,6);
    [[-0.55,1.05,-0.25],[0.55,1.12,-0.2]].forEach(q=>{cyl(0.012,0.012,q[1],chr,q[0],q[1]/2,q[2],g,6);const cy=cyl(0.24,0.2,0.012,gold,q[0],q[1],q[2],g,24);cy.rotation.z=0.15;});
    cyl(0.17,0.17,0.08,S(0x23262b,0.6),0,0.5,0.52,g,16);cyl(0.02,0.02,0.46,chr,0,0.23,0.52,g,6);return g;},
    use:{text:'Play the drums',fn:()=>{const R=[[0,'k'],[0.25,'s'],[0.5,'k'],[0.62,'k'],[0.75,'s'],[1.0,'c']];R.forEach(q=>{if(q[1]==='k')SFX.blip(120,40,0.18,'sine',0.12,{delay:q[0]});else if(q[1]==='s')SFX.burst(1800,4000,0.12,0.12,{delay:q[0]});else SFX.burst(5000,9000,0.6,0.08,{delay:q[0],type:'highpass'});});toast('Ba-dum tss!');}}},
  {id:'hoop',name:'Basketball hoop',cat:'fun',price:180,w:0.8,d:0.9,build:()=>{const g=G();box(0.6,0.12,0.7,S(0x23262b,0.6),0,0.06,-0.1,g);cyl(0.04,0.04,1.95,steel,0,1.0,-0.35,g,10);
    box(0.06,0.06,0.3,steel,0,1.92,-0.22,g);box(0.8,0.5,0.03,S(0xf4f4f2,0.4),0,2.0,-0.06,g);box(0.3,0.2,0.035,S(0xd9774f,0.6),0,1.92,-0.058,g,true);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.012,6,24),S(0xff7a1a,0.4,0.3));rim.rotation.x=Math.PI/2;rim.position.set(0,1.82,0.13);g.add(rim);
    const net=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.1,0.2,12,1,true),new THREE.MeshStandardMaterial({color:0xffffff,wireframe:true}));net.position.set(0,1.71,0.13);g.add(net);
    sph(0.12,S(0xff7a1a,0.6),0.25,0.12,0.25,g);return g;},
    use:{text:'Shoot a hoop',fn:()=>{SFX.play('hop');setTimeout(()=>{const ok=Math.random()<0.55;SFX.play(ok?'tile_match':'impact',{vol:0.6});toast(ok?'Swish! Nothing but net':'Off the rim!');},700);}}},
  {id:'trampoline',name:'Trampoline',cat:'fun',price:220,w:1.6,d:1.6,colors:DECO_PAL,build:c=>{const g=G();
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;cyl(0.025,0.025,0.34,steel,Math.sin(a)*0.72,0.17,Math.cos(a)*0.72,g,8);}
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.72,0.07,10,40),S(c,0.6));ring.rotation.x=Math.PI/2;ring.position.y=0.36;g.add(ring);
    const mat=new THREE.Mesh(new THREE.CircleGeometry(0.66,40),S(0x1d1f26,0.8));mat.rotation.x=-Math.PI/2;mat.position.y=0.345;g.add(mat);g.userData.mat=mat;return g;},
    use:{text:'Bounce',fn:o=>{DECO.hop={t:0,o:o};SFX.play('hop',{rate:0.8});}}},
  {id:'gumball',name:'Gumball machine',cat:'fun',price:90,w:0.45,d:0.45,colors:[0xd0312d,0x3fa8a0,0x34507a,0xe8b23a],build:c=>{const g=G(),cm=S(c,0.35);
    cyl(0.18,0.22,0.08,cm,0,0.04,0,g,16);cyl(0.05,0.06,0.7,cm,0,0.43,0,g,12);box(0.24,0.2,0.24,cm,0,0.86,0,g);box(0.06,0.05,0.02,steel,0,0.86,0.125,g,true);
    const gl=sph(0.2,glass(),0,1.15,0,g);gl.castShadow=false;const cols=[0xff4d6d,0xffc928,0x2fd08a,0x2f9bff,0xff8fb8,0xffffff];for(let i=0;i<22;i++){const a=i*2.4,r=0.05+((i*37)%10)/80,s=sph(0.035,S(cols[i%6],0.35),Math.sin(a)*r,1.02+((i*13)%9)/45,Math.cos(a)*r,g);s.castShadow=false;}
    cyl(0.07,0.07,0.05,cm,0,1.36,0,g,12);return g;},
    use:{text:'Get a gumball',fn:()=>{SFX.play('coin',{rate:0.8});setTimeout(()=>{SFX.play('drop',{rate:1.6,vol:0.6});toast('A '+['cherry','lemon','blue raspberry','apple','bubblegum','mystery'][Math.floor(Math.random()*6)]+' gumball!');},500);}}},
  {id:'robot',name:'Robot buddy',cat:'fun',price:200,w:0.6,d:0.5,colors:[0x9aa3ad,0xe8b23a,0x3fa8a0,0xd9774f,0x34507a],build:c=>{const g=G(),cm=S(c,0.35,0.6),bk=S(0x23262b,0.4,0.4);
    [-1,1].forEach(s=>{box(0.12,0.4,0.14,cm,s*0.1,0.2,0,g);box(0.16,0.06,0.2,bk,s*0.1,0.03,0.02,g);});box(0.42,0.42,0.3,cm,0,0.62,0,g);
    const pn=box(0.22,0.14,0.01,bk,0,0.66,0.152,g,true);const ls=[0xff4d6d,0x2fd08a,0xffc928].map((cc,i)=>{const l=new THREE.Mesh(new THREE.CircleGeometry(0.018,10),gB(cc));l.position.set(-0.06+i*0.06,0.66,0.158);g.add(l);return l;});
    [-1,1].forEach(s=>{const a=cyl(0.04,0.04,0.36,cm,s*0.26,0.6,0,g,10);a.rotation.z=s*0.2;sph(0.06,bk,s*0.3,0.42,0,g);});
    box(0.32,0.26,0.26,cm,0,1.0,0,g);const eyes=[-1,1].map(s=>{const e=new THREE.Mesh(new THREE.CircleGeometry(0.04,14),gB(0x5fe8ff));e.position.set(s*0.075,1.02,0.131);g.add(e);return e;});
    cyl(0.008,0.008,0.14,steel,0,1.2,0,g,6);const tip=new THREE.Mesh(new THREE.SphereGeometry(0.025,10,8),gB(0xff4d6d));tip.position.y=1.28;g.add(tip);g.userData.eyes=eyes;g.userData.ls=ls;g.userData.tip=tip;return g;},
    tick:(g,t)=>{const b=(t%3.3)<0.12;g.userData.eyes.forEach(e=>e.scale.y=b?0.15:1);g.userData.ls.forEach((l,i)=>l.visible=Math.sin(t*4+i*2)>-0.3);g.userData.tip.visible=Math.sin(t*3)>0;},
    use:{text:'Say hi to the robot',fn:()=>{[0,1,2].forEach(k=>SFX.blip(500+Math.random()*900,700+Math.random()*900,0.07,'square',0.03,{delay:k*0.09}));toast(['BEEP BOOP. HELLO, HUMAN','I AM FULLY CHARGED','DOES NOT COMPUTE. LOL'][Math.floor(Math.random()*3)]);}}},
  {id:'rocket',name:'Rocket model',cat:'fun',price:350,w:0.8,d:0.8,build:()=>{const g=G(),wh=S(0xf4f4f2,0.35,0.2),rd=S(0xd9774f,0.45);
    cyl(0.3,0.3,0.08,S(0x23262b,0.5),0,0.04,0,g,20);cyl(0.2,0.2,1.2,wh,0,0.78,0,g,20);const n=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.42,20),rd);n.position.y=1.59;n.castShadow=true;g.add(n);
    cyl(0.205,0.205,0.08,rd,0,1.02,0,g,20);[0,2.09,4.19].forEach(a=>{const f=box(0.03,0.36,0.22,rd,Math.sin(a)*0.24,0.32,Math.cos(a)*0.24,g);f.rotation.y=a;});
    const w=new THREE.Mesh(new THREE.CircleGeometry(0.065,18),gB(0x7fe8ff));w.position.set(0,1.18,0.201);g.add(w);const r=new THREE.Mesh(new THREE.TorusGeometry(0.07,0.012,6,20),steel);r.position.set(0,1.18,0.2);g.add(r);
    const fl=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.3,14),gB(0xffa030));fl.rotation.x=Math.PI;fl.position.y=0.03;fl.visible=false;g.add(fl);g.userData.fl=fl;return g;},
    use:{text:'Launch countdown',fn:o=>{['3','2','1','Blast off!'].forEach((s,i)=>setTimeout(()=>{toast(s);SFX.blip(i<3?600:300,i<3?600:1400,i<3?0.12:0.8,i<3?'square':'sawtooth',0.04);if(i===3){o.g.userData.fl.visible=true;setTimeout(()=>o.g.userData.fl.visible=false,1500);}},i*800));}}},
  {id:'fishtank',name:'Fish tank',cat:'fun',price:200,w:1.05,d:0.45,build:()=>{const g=G();box(1.0,0.7,0.42,dark,0,0.35,0,g);const gl=box(1.0,0.5,0.4,glass(),0,0.96,0,g,true);gl.castShadow=false;
    const wa=box(0.96,0.42,0.36,new THREE.MeshStandardMaterial({color:0x2a9fd0,transparent:true,opacity:0.35,roughness:0.1,emissive:0x0b4f8a,emissiveIntensity:0.5,depthWrite:false}),0,0.92,0,g,true);wa.castShadow=false;
    box(0.96,0.05,0.36,S(0xe8d4a8,1),0,0.74,0,g,true);box(1.02,0.03,0.42,S(0x23262b,0.5),0,1.22,0,g);
    for(let i=0;i<4;i++){const p=cyl(0.01,0.015,0.2+i*0.04,S(0x3f9a55,0.8),-0.35+i*0.08,0.85,-0.1,g,5);p.rotation.z=(i-1.5)*0.15;}
    const fish=[0xff7a1a,0xffc928,0x2fd08a].map(cc=>{const f=G();const b=sph(0.035,S(cc,0.5),0,0,0,f);b.scale.set(1.6,1,0.6);const tl=new THREE.Mesh(new THREE.ConeGeometry(0.025,0.04,4),S(cc,0.5));tl.rotation.z=Math.PI/2;tl.position.x=-0.07;f.add(tl);g.add(f);return f;});
    const gs=gS(0x6fe3ff,1.2,0.25);gs.position.set(0,0.95,0.25);g.add(gs);g.userData.fish=fish;return g;},
    tick:(g,t)=>{g.userData.fish.forEach((f,i)=>{const a=t*(0.5+i*0.17)+i*2;f.position.set(Math.sin(a)*0.38,0.88+Math.sin(a*1.7+i)*0.08,Math.cos(a*0.8)*0.1);f.rotation.y=Math.cos(a)>0?0:Math.PI;});}},
  {id:'trophy',name:'Giant trophy',cat:'fun',price:400,w:0.6,d:0.6,build:()=>{const g=G();box(0.5,0.3,0.5,S(0x23262b,0.5),0,0.15,0,g);box(0.36,0.12,0.36,S(0x23262b,0.5),0,0.36,0,g);
    cyl(0.05,0.08,0.3,gold,0,0.57,0,g,14);const cup=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.1,0.38,24,1,true),new THREE.MeshStandardMaterial({color:0xffc928,roughness:0.2,metalness:1,side:THREE.DoubleSide}));cup.position.y=0.91;cup.castShadow=true;g.add(cup);
    sph(0.1,gold,0,0.72,0,g);[-1,1].forEach(s=>{const h=new THREE.Mesh(new THREE.TorusGeometry(0.09,0.018,8,16,Math.PI),gold);h.position.set(s*0.22,0.93,0);h.rotation.z=-s*Math.PI/2;g.add(h);});
    const pl=mk(128,32,(x,w,h)=>{x.fillStyle='#c9a25e';x.fillRect(0,0,w,h);x.fillStyle='#1d1640';x.font='900 20px Nunito,sans-serif';x.textAlign='center';x.fillText('CHAMPION',w/2,23);},true);
    const p=new THREE.Mesh(new THREE.PlaneGeometry(0.34,0.085),S(0xffffff,0.3,0.6,{map:pl}));p.position.set(0,0.17,0.251);g.add(p);const gs=gS(0xffd060,1.2,0.3);gs.position.y=0.95;g.add(gs);return g;}},
  {id:'telescope',name:'Telescope',cat:'fun',price:150,w:0.7,d:0.7,build:()=>{const g=G(),br=S(0xc9a25e,0.3,0.8),bk=S(0x23262b,0.4,0.4);
    [0,2.09,4.19].forEach(a=>{const l=cyl(0.012,0.012,1.05,bk,Math.sin(a)*0.16,0.5,Math.cos(a)*0.16,g,6);l.rotation.set(Math.cos(a)*0.3,0,-Math.sin(a)*0.3);});
    const tb=G();tb.position.y=1.02;tb.rotation.x=-0.55;g.add(tb);cyl(0.06,0.05,0.7,S(0x34507a,0.4,0.3),0,0,0.08,tb,16).rotation.x=Math.PI/2;cyl(0.065,0.065,0.05,br,0,0,0.43,tb,16).rotation.x=Math.PI/2;return g;},
    use:{text:'Look through the telescope',fn:()=>{SFX.play('select');toast(['You can see the next room. Very close up','A spider on the ceiling waves at you','Is that… a sock?'][Math.floor(Math.random()*3)]);}}},
  /* ---- plants ---- */
  {id:'plant',name:'Potted plant',cat:'plants',price:0,w:0.5,d:0.5,colors:[0xd9774f,0xf4ead6,0x34507a,0x3fa8a0],build:c=>{const g=G();pot(g,0.2,0.34,c);const lm=S(0x3f9a55,0.7);
    for(let i=0;i<9;i++){const a=i/9*6.28,l=sph(1,lm,Math.cos(a)*0.14,0.62+((i*7)%4)*0.06,Math.sin(a)*0.14,g);l.scale.set(0.07,0.36,0.15);l.rotation.set(Math.sin(a)*0.5,-a,-Math.cos(a)*0.5);}return g;}},
  {id:'palm',name:'Palm tree',cat:'plants',price:60,w:0.6,d:0.6,build:()=>{const g=G();pot(g,0.24,0.36,0xc9b79a);const tr=S(0x8a6a44,0.9);
    for(let i=0;i<6;i++)cyl(0.05-i*0.004,0.06-i*0.004,0.24,tr,Math.sin(i*0.5)*0.03,0.48+i*0.22,0,g,8);const lf=S(0x3f9a52,0.8,0,{side:THREE.DoubleSide});
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2,l=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.8,4),lf);l.position.set(Math.sin(a)*0.3,1.72,Math.cos(a)*0.3);l.rotation.set(Math.cos(a)*1.25,0,-Math.sin(a)*1.25);l.scale.z=0.25;l.castShadow=true;g.add(l);}return g;}},
  {id:'cactus',name:'Cactus',cat:'plants',price:40,w:0.4,d:0.4,build:()=>{const g=G();pot(g,0.16,0.24,0xe8b23a);const cm=S(0x4a9a52,0.8);cyl(0.09,0.1,0.6,cm,0,0.54,0,g,10);sph(0.09,cm,0,0.84,0,g);
    [[-1,0.55],[1,0.68]].forEach(q=>{const a=cyl(0.05,0.05,0.14,cm,q[0]*0.13,q[1],0,g,8);a.rotation.z=Math.PI/2;cyl(0.05,0.05,0.18,cm,q[0]*0.19,q[1]+0.08,0,g,8);sph(0.05,cm,q[0]*0.19,q[1]+0.17,0,g);});
    const fl=new THREE.Mesh(new THREE.SphereGeometry(0.035,8,6),S(0xff8fb8,0.6));fl.position.set(0.02,0.93,0);g.add(fl);return g;}},
  {id:'flowers',name:'Flower pot',cat:'plants',price:50,w:0.45,d:0.45,colors:[0xff4d6d,0xffc928,0x6c4bd8,0xf4f4f2,0xff8fb8],build:c=>{const g=G();pot(g,0.18,0.28,0x3fa8a0);const st=S(0x3f9a55,0.8),fm=S(c,0.6),ct=S(0xffc928,0.5);
    for(let i=0;i<7;i++){const a=i*2.4,r=0.04+((i*3)%4)*0.025,x=Math.sin(a)*r,z=Math.cos(a)*r,h=0.2+((i*5)%4)*0.06;cyl(0.008,0.008,h,st,x,0.28+h/2,z,g,5);
      for(let k=0;k<5;k++){const pa=k/5*Math.PI*2,p=sph(0.03,fm,x+Math.cos(pa)*0.035,0.29+h,z+Math.sin(pa)*0.035,g);p.scale.y=0.5;}sph(0.022,ct,x,0.3+h,z,g);}return g;}},
  {id:'bonsai',name:'Bonsai',cat:'plants',price:80,w:0.5,d:0.4,build:()=>{const g=G();box(0.44,0.1,0.3,S(0x34507a,0.5),0,0.05,0,g);const tr=S(0x6b4a2c,0.9);
    const t1=cyl(0.03,0.05,0.25,tr,0,0.22,0,g,8);t1.rotation.z=0.4;const t2=cyl(0.025,0.03,0.2,tr,-0.1,0.38,0,g,8);t2.rotation.z=-0.6;const lm=S(0x4f8f3a,0.8);
    [[-0.16,0.48,0,0.11],[0.02,0.44,0.02,0.09],[-0.05,0.56,-0.03,0.08],[0.1,0.36,0,0.07]].forEach(q=>{const p=sph(q[3],lm,q[0],q[1],q[2],g);p.scale.y=0.6;});return g;}},
  /* ---- lights ---- */
  {id:'floorlamp',name:'Floor lamp',cat:'lights',price:60,w:0.45,d:0.45,colors:[0xfff0cc,0xffd0a0,0xc8e8ff,0xffc0e0],build:c=>{const g=G();cyl(0.16,0.18,0.03,blk,0,0.015,0,g,16);cyl(0.015,0.015,1.5,S(0xc9a25e,0.35,0.85),0,0.76,0,g,8);
    const sh=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.22,0.28,16,1,true),new THREE.MeshBasicMaterial({color:c,toneMapped:false,side:THREE.DoubleSide}));sh.position.y=1.58;g.add(sh);
    const gs=gS(c,1.6,0.45);gs.position.y=1.5;g.add(gs);g.add(pool(c,2.6,0.22));return g;}},
  {id:'lavalamp',name:'Lava lamp',cat:'lights',price:70,w:0.3,d:0.3,colors:[0xff4d6d,0x2fd08a,0x6c4bd8,0xffc928,0x2f9bff],build:c=>{const g=G(),bm=S(0xc9ced4,0.25,0.9);
    const b=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.1,0.18,16),bm);b.position.y=0.09;b.castShadow=true;g.add(b);
    const lq=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.07,0.36,16),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(0.45),transparent:true,opacity:0.6,toneMapped:false}));lq.position.y=0.36;g.add(lq);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.045,0.08,14),bm);cap.position.y=0.58;g.add(cap);
    const blobs=[0,1,2].map(i=>{const bb=new THREE.Mesh(new THREE.SphereGeometry(0.03+i*0.006,10,8),gB(c));g.add(bb);return bb;});const gs=gS(c,0.9,0.5);gs.position.y=0.36;g.add(gs);g.userData.blobs=blobs;return g;},
    tick:(g,t)=>{g.userData.blobs.forEach((b,i)=>{const p=(Math.sin(t*0.4+i*2.1)+1)/2;b.position.set(Math.sin(t*0.3+i)*0.01,0.22+p*0.28,0);b.scale.y=1+Math.sin(t+i)*0.3;});}},
  {id:'neon',name:'Neon sign',cat:'lights',price:150,w:0.9,d:0.3,colors:[0xff4fa0,0x38c8ff,0x2fd08a,0xffc928],build:c=>{const g=G();box(0.5,0.06,0.25,blk,0,0.03,0,g);cyl(0.015,0.015,1.0,blk,0,0.53,-0.05,g,6);
    box(0.9,0.42,0.04,S(0x1d1f26,0.5),0,1.2,-0.05,g);const col='#'+new THREE.Color(c).getHexString();
    const t=mk(256,128,(x,w,h)=>{x.font='400 64px '+FD;x.textAlign='center';x.textBaseline='middle';x.shadowColor=col;x.shadowBlur=16;x.strokeStyle=col;x.lineWidth=8;x.strokeText('GAME ON',w/2,h/2+4);x.shadowBlur=0;x.strokeStyle='#fff';x.lineWidth=2.5;x.strokeText('GAME ON',w/2,h/2+4);},true);
    const p=new THREE.Mesh(new THREE.PlaneGeometry(0.86,0.4),new THREE.MeshBasicMaterial({map:t,transparent:true,toneMapped:false,depthWrite:false}));p.position.set(0,1.2,-0.025);g.add(p);
    const gs=gS(c,1.4,0.35);gs.position.set(0,1.2,0.1);g.add(gs);g.userData.p=p;return g;},
    tick:(g,t)=>{g.userData.p.material.opacity=(t%7)<0.08||((t%7)>0.15&&(t%7)<0.2)?0.3:1;}},
  {id:'disco',name:'Disco ball',cat:'lights',price:200,w:0.5,d:0.5,build:()=>{const g=G();cyl(0.18,0.2,0.04,blk,0,0.02,0,g,16);cyl(0.012,0.012,1.6,steel,0,0.82,0,g,6);
    const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(0.2,2),new THREE.MeshStandardMaterial({color:0xe8ecf2,metalness:1,roughness:0.12,flatShading:true}));ball.position.y=1.82;ball.castShadow=true;g.add(ball);
    const sp=[0xff4fa0,0x38c8ff,0xffc928,0x2fd08a,0xffffff].map(cc=>{const s=pool(cc,0.55,0.6);g.add(s);return s;});g.userData.ball=ball;g.userData.sp=sp;return g;},
    tick:(g,t)=>{g.userData.ball.rotation.y=t*0.8;g.userData.sp.forEach((s,i)=>{const a=t*0.9+i*1.26;s.position.set(Math.sin(a)*1.1,0.012+i*0.002,Math.cos(a)*1.1);s.material.opacity=0.45+Math.sin(t*5+i)*0.15;});}},
  {id:'glowcube',name:'Glow cube',cat:'lights',price:50,w:0.45,d:0.45,colors:[0xff4fa0,0x38c8ff,0x2fd08a,0xffc928,0xb48cff],build:c=>{const g=G();const cu=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.4,0.4),new THREE.MeshBasicMaterial({color:new THREE.Color(c).lerp(new THREE.Color(0xffffff),0.25),toneMapped:false}));cu.position.y=0.2;g.add(cu);
    const gs=gS(c,1.3,0.45);gs.position.y=0.25;g.add(gs);g.userData.cu=cu;return g;},
    tick:(g,t)=>{g.userData.cu.material.color.offsetHSL(0,0,Math.sin(t*1.5)*0.002);}},
  /* ---- rugs (flat: things can stand on them) ---- */
  {id:'ruground',name:'Round rug',cat:'rugs',price:0,w:2.0,d:2.0,flat:true,colors:DECO_PAL,build:c=>{const g=G(),cc='#'+new THREE.Color(c).getHexString(),c2='#'+new THREE.Color(lite(c,0.55)).getHexString();
    const t=rugTex(256,256,(x,w,h)=>{[cc,c2,cc,'#f4ead6',cc].forEach((k,i)=>{x.fillStyle=k;x.beginPath();x.arc(128,128,126-i*24,0,7);x.fill();});noise(x,w,h,10);});
    const r=new THREE.Mesh(new THREE.CircleGeometry(1.0,40),S(0xffffff,1,0,{map:t}));r.rotation.x=-Math.PI/2;r.position.y=0.006;r.receiveShadow=true;g.add(r);return g;}},
  {id:'rugstripe',name:'Striped rug',cat:'rugs',price:40,w:2.4,d:1.6,flat:true,colors:DECO_PAL,build:c=>{const g=G(),cc='#'+new THREE.Color(c).getHexString();
    const t=rugTex(256,170,(x,w,h)=>{x.fillStyle='#f4ead6';x.fillRect(0,0,w,h);for(let i=0;i<7;i++){x.fillStyle=i%2?cc:'#2a2c33';x.fillRect(16+i*33,10,18,h-20);}noise(x,w,h,10);});
    const r=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.6),S(0xffffff,1,0,{map:t}));r.rotation.x=-Math.PI/2;r.position.y=0.006;r.receiveShadow=true;g.add(r);return g;}},
  {id:'rugcheck',name:'Checker rug',cat:'rugs',price:60,w:2.0,d:2.0,flat:true,colors:DECO_PAL,build:c=>{const g=G(),cc='#'+new THREE.Color(c).getHexString();
    const t=rugTex(256,256,(x,w,h)=>{for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.fillStyle=(i+j)%2?cc:'#f4ead6';x.fillRect(i*32,j*32,32,32);}noise(x,w,h,10);});
    const r=new THREE.Mesh(new THREE.PlaneGeometry(2.0,2.0),S(0xffffff,1,0,{map:t}));r.rotation.x=-Math.PI/2;r.position.y=0.006;r.receiveShadow=true;g.add(r);return g;}},
  {id:'rugstars',name:'Space rug',cat:'rugs',price:80,w:2.2,d:1.6,flat:true,build:()=>{const g=G();
    const t=rugTex(256,186,(x,w,h)=>{x.fillStyle='#1b2a4a';x.fillRect(0,0,w,h);x.fillStyle='#ffd25a';for(let i=0;i<14;i++){const cx=(i*67)%w,cy=(i*41)%h;x.save();x.translate(cx,cy);x.beginPath();for(let k=0;k<10;k++){const r=k%2?4:10,a=k*Math.PI/5-Math.PI/2;x.lineTo(Math.cos(a)*r,Math.sin(a)*r);}x.fill();x.restore();}
      x.fillStyle='#d9774f';x.beginPath();x.arc(60,120,22,0,7);x.fill();x.strokeStyle='#e8b23a';x.lineWidth=4;x.beginPath();x.ellipse(60,120,36,9,-0.3,0,7);x.stroke();x.fillStyle='#3fa8a0';x.beginPath();x.arc(190,60,14,0,7);x.fill();noise(x,w,h,8);});
    const r=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.6),S(0xffffff,1,0,{map:t}));r.rotation.x=-Math.PI/2;r.position.y=0.006;r.receiveShadow=true;g.add(r);return g;}}
  ];
  const by={};items.forEach(it=>by[it.id]=it);items.by=by;return items;
})();
