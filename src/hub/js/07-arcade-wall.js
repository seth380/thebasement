/* ---------- arcade wall ---------- */
const neonTex=mk(1024,256,(g,w,h)=>{g.font='170px '+FD;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  for(let k=0;k<3;k++){g.shadowColor='#ff3f9a';g.shadowBlur=40;g.strokeStyle='#ff5fa8';g.lineWidth=14;g.strokeText('ARCADE',w/2,h/2+6);}
  g.shadowBlur=0;g.strokeStyle='#ffe6f2';g.lineWidth=5;g.strokeText('ARCADE',w/2,h/2+6);});
{const m=new THREE.Mesh(new THREE.PlaneGeometry(3.3,0.82),new THREE.MeshBasicMaterial({map:neonTex,transparent:true,toneMapped:false,depthWrite:false}));onWall(m,'n',0,2.32,0.05);}
{const t=mk(1024,256,(g)=>{for(let x=0;x<16;x++)for(let y=0;y<4;y++){g.fillStyle=(x+y)%2?'#16141c':'#e9e4d8';g.fillRect(x*64,y*64,64,64);}},true);
  const m=sh(new THREE.Mesh(new THREE.PlaneGeometry(8.4,2.1),S(0xffffff,0.5,0,{map:t})),true);m.rotation.x=-Math.PI/2;m.position.set(0,0.006,-6.2);scene.add(m);}
function cabinet(meta,x,idx){
  const g=new THREE.Group();g.position.set(x,0,-7.48);g.rotation.y=-Math.PI/2;scene.add(g);
  const side=S(meta.hex,0.45),dark=S(0x15131a,0.5),trim=S(0x0c0b10,0.35,0.4);
  const s=new THREE.Shape();[[-0.4,0],[0.35,0],[0.35,0.86],[0.52,0.95],[0.47,1.06],[0.2,1.15],[0.08,1.66],[0.3,1.72],[0.3,1.97],[-0.4,2.0]].forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));
  const sg=new THREE.ExtrudeGeometry(s,{depth:0.04,bevelEnabled:false});
  [-0.37,0.33].forEach(z=>{const m=sh(new THREE.Mesh(sg,side));m.position.z=z;g.add(m);});
  box(0.7,0.86,0.66,dark,-0.03,0.43,0,g);box(0.42,1.14,0.66,dark,-0.18,1.43,0,g);box(0.66,0.26,0.66,dark,-0.05,1.85,0,g);
  const scr=mk(256,208,(c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,meta.c1);gr.addColorStop(1,meta.c2);c.fillStyle=gr;c.fillRect(0,0,w,h);
    title(c,meta.name.toUpperCase(),w/2,h*0.42,34,'#ffc928',w*0.9);c.font='900 18px Nunito,sans-serif';c.textAlign='center';c.fillStyle='#fff8e7';c.fillText('PRESS START',w/2,h*0.84);});
  const bez=new THREE.Mesh(new THREE.PlaneGeometry(0.66,0.56),trim);bez.rotation.order='YXZ';bez.rotation.set(-0.236,Math.PI/2,0);bez.position.set(0.137,1.405,0);g.add(bez);
  const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.56,0.455),new THREE.MeshBasicMaterial({map:scr,toneMapped:false}));sc.rotation.order='YXZ';sc.rotation.set(-0.236,Math.PI/2,0);sc.position.set(0.143,1.407,0);g.add(sc);
  const mq=mk(512,160,(c,w,h)=>{c.fillStyle=meta.c1;c.fillRect(0,0,w,h);c.fillStyle=meta.c2;c.fillRect(0,h*0.7,w,h*0.3);title(c,meta.name.toUpperCase(),w/2,h*0.48,meta.name.length>17?44:48,'#fff8e7');});
  const mqm=new THREE.Mesh(new THREE.PlaneGeometry(0.66,0.21),new THREE.MeshBasicMaterial({map:mq,toneMapped:false}));mqm.rotation.y=Math.PI/2;mqm.position.set(0.305,1.845,0);g.add(mqm);
  const cp=box(0.3,0.05,0.66,trim,0.36,0.985,0,g);cp.rotation.z=-0.2;
  cyl(0.012,0.012,0.09,S(0xc9ccd2,0.3,0.9),0.36,1.05,0.16,g,8);sph(0.032,S(0xff4d6d,0.3),0.36,1.1,0.16,g);
  [0xffc928,0x2fd08a,0x2f9bff].forEach((c,i)=>cyl(0.024,0.024,0.02,S(c,0.3),0.37+(i%2)*0.04,1.012-(i%2)*0.008,-0.04-i*0.075,g,12));
  box(0.02,0.3,0.24,S(0x2a2830,0.4,0.6),0.352,0.5,0,g);
  [-0.05,0.05].forEach(z=>box(0.012,0.06,0.035,new THREE.MeshBasicMaterial({color:0xff5a4a,toneMapped:false}),0.364,0.52,z,g,true));
  box(0.012,0.04,0.66,side,0.352,0.8,0,g,true);
  solid(x-0.44,x+0.44,-8,-6.92);
  things.push({x:x,z:-6.35,r:1.15,text:'Play '+meta.name,fn:()=>openGame(idx)});
}
META.forEach((m,i)=>cabinet(m,(i-2)*2.05,i));

