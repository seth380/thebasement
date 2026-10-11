/* ---------- posters, windows, clock ---------- */
function title(g,txt,x,y,size,col,max){g.font=size+'px '+FD;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  const lines=[];let cur='';txt.split(' ').forEach(wd=>{const t=cur?cur+' '+wd:wd;if(max&&g.measureText(t).width>max&&cur){lines.push(cur);cur=wd;}else cur=t;});lines.push(cur);
  lines.forEach((l,i)=>{const yy=y+(i-(lines.length-1)/2)*size*1.02;g.strokeStyle='#1d1640';g.lineWidth=size*0.16;g.strokeText(l,x,yy);g.fillStyle=col;g.fillText(l,x,yy);});}
const POSTERS=[
  (g,w,h)=>{g.fillStyle='#2f9bff';g.fillRect(0,0,w,h);g.fillStyle='#fff3a6';g.beginPath();g.arc(w*0.75,h*0.2,50,0,7);g.fill();
    g.fillStyle='#6fd44b';g.beginPath();g.ellipse(w/2,h*0.78,w,h*0.3,0,0,7);g.fill();
    g.fillStyle='#4a4466';g.beginPath();g.moveTo(w*0.3,h);g.quadraticCurveTo(w*0.2,h*0.6,w*0.62,h*0.5);g.lineTo(w*0.7,h*0.52);g.quadraticCurveTo(w*0.45,h*0.66,w*0.8,h);g.fill();
    g.fillStyle='#ff4d6d';g.fillRect(w*0.4,h*0.66,70,32);g.fillStyle='#1d1640';g.beginPath();g.arc(w*0.43,h*0.705,13,0,7);g.arc(w*0.55,h*0.705,13,0,7);g.fill();
    title(g,'TURBO MEADOW KART',w/2,h*0.3,58,'#ffc928',w*0.9);},
  (g,w,h)=>{['#3b63d9','#7a5cd0','#c8609a','#ff8a6a','#ffb37a','#ffd3a1'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(0,i*h/6,w,h/6+1);});
    g.fillStyle='#fff3a6';g.beginPath();g.arc(w/2,h*0.6,90,Math.PI,0);g.fill();
    g.save();g.translate(w/2,h*0.74);g.rotate(-0.25);g.fillStyle='#1d1640';g.beginPath();g.ellipse(0,0,130,20,0,0,7);g.fill();g.fillStyle='#fff8e7';g.beginPath();g.arc(-80,26,13,0,7);g.arc(80,26,13,0,7);g.fill();g.restore();
    title(g,'SUNDOWN SKATE PARK',w/2,h*0.25,56,'#fff8e7',w*0.9);},
  (g,w,h)=>{g.fillStyle='#e08a4f';g.fillRect(0,0,w,h);g.fillStyle='#c96f3f';g.fillRect(0,h*0.7,w,h*0.3);
    [[150,'#1d1640'],[140,'#fff8e7'],[92,'#ff4d6d'],[46,'#ffc928']].forEach(r=>{g.fillStyle=r[1];g.beginPath();g.arc(w/2,h*0.5,r[0],0,7);g.fill();});
    title(g,'COPPER CANYON RANGE',w/2,h*0.86,50,'#fff8e7',w*0.9);title(g,'STEADY HANDS',w/2,h*0.12,40,'#ffc928');},
  (g,w,h)=>{g.fillStyle='#0d1030';g.fillRect(0,0,w,h);for(let i=0;i<90;i++){g.fillStyle='rgba(255,255,255,'+(0.3+rnd()*0.7)+')';g.fillRect(rnd()*w,rnd()*h,2,2);}
    g.fillStyle='#8d8aa0';g.beginPath();g.ellipse(w/2,h*0.52,150,120,0.3,0,7);g.fill();g.fillStyle='#6f6c84';[[-60,-30,26],[50,30,34],[10,-60,16],[-30,50,20]].forEach(c=>{g.beginPath();g.arc(w/2+c[0],h*0.52+c[1],c[2],0,7);g.fill();});
    g.fillStyle='#7fe0ff';g.beginPath();g.arc(w/2+20,h*0.4,44,Math.PI,0);g.fill();g.fillStyle='#ffc928';g.fillRect(w/2+16,h*0.33,8,-40);
    title(g,'ASTEROID BASE',w/2,h*0.12,54,'#7fe0ff',w*0.9);title(g,'COMING SOON',w/2,h*0.88,40,'#ffc928');},
  (g,w,h)=>{g.fillStyle='#fff8e7';g.fillRect(0,0,w,h);['#ff4d6d','#ffc928','#2fd08a','#2f9bff','#6c4bd8'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(0,h*0.62+i*34,w,34);});
    title(g,'HIGH SCORE CLUB',w/2,h*0.3,84,'#ff4d6d',w*0.8);title(g,'MEMBERS ONLY',w/2,h*0.92,34,'#fff8e7');},
  (g,w,h)=>{g.fillStyle='#6c4bd8';g.fillRect(0,0,w,h);const px=['0011100','0111110','1101011','1111111','0101010','1010101'];
    px.forEach((row,y)=>row.split('').forEach((b,x)=>{if(b==='1'){g.fillStyle='#2fd08a';g.fillRect(w/2-140+x*40,h*0.22+y*40,36,36);}}));
    title(g,'GAME ON',w/2,h*0.8,96,'#ffc928');},
  (g,w,h)=>{g.fillStyle='#f3e6c8';g.fillRect(0,0,w,h);g.strokeStyle='#1d1640';g.lineWidth=10;g.strokeRect(20,20,w-40,h-40);
    title(g,'BASEMENT RULES',w/2,h*0.14,50,'#ff4d6d',w*0.85);
    ['1. Have fun','2. Winner picks','the next game','3. No sore losers','4. Snacks stay','off the couch'].forEach((l,i)=>{g.font='900 38px Nunito,sans-serif';g.textAlign='center';g.fillStyle='#1d1640';g.fillText(l,w/2,h*0.3+i*66);});}
];
function poster(i,wall,u,y){
  const grp=new THREE.Group(),t=mk(512,720,POSTERS[i]);
  box(0.74,1.04,0.03,S(0x17140f,0.5),0,0,0,grp);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(0.68,0.98),S(0xffffff,0.75,0,{map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:0.1}));p.position.z=0.017;grp.add(p);
  onWall(grp,wall,u,y,0.02);grp.rotation.z=(rnd()-0.5)*0.035;
}
poster(4,'n',-5.9,1.65);poster(1,'n',5.3,1.6);
poster(5,'w',-1.3,1.7);poster(3,'w',5.9,1.6);
poster(6,'s',-8.2,1.55);poster(2,'s',-2.6,1.6);poster(3,'s',3.4,1.6);
poster(1,'e',1.6,1.6);poster(0,'e',-3.6,1.6);
const clockTex=mk(256,256,(g,w,h)=>{g.fillStyle='#fff8e7';g.beginPath();g.arc(128,128,124,0,7);g.fill();g.strokeStyle='#1d1640';g.lineWidth=10;g.stroke();
  for(let i=0;i<12;i++){const a=i*Math.PI/6;g.fillStyle='#1d1640';g.beginPath();g.arc(128+Math.sin(a)*100,128-Math.cos(a)*100,i%3?4:8,0,7);g.fill();}
  const hh=(hour%12)*Math.PI/6,mm=(hour%1)*Math.PI*2;g.lineCap='round';
  g.lineWidth=10;g.beginPath();g.moveTo(128,128);g.lineTo(128+Math.sin(hh)*56,128-Math.cos(hh)*56);g.stroke();
  g.lineWidth=6;g.strokeStyle='#ff4d6d';g.beginPath();g.moveTo(128,128);g.lineTo(128+Math.sin(mm)*86,128-Math.cos(mm)*86);g.stroke();});
{const m=new THREE.Mesh(new THREE.CircleGeometry(0.2,32),S(0xffffff,0.6,0,{map:clockTex,emissive:0xffffff,emissiveMap:clockTex,emissiveIntensity:0.12}));onWall(m,'w',-2.4,2.15,0.03);}
/* sky seen through the windows: sun, moon, stars */
const sun=new THREE.Mesh(new THREE.SphereGeometry(2.6,16,12),new THREE.MeshBasicMaterial({color:0xfff2c0,toneMapped:false}));scene.add(sun);
const moon=new THREE.Mesh(new THREE.SphereGeometry(1.8,16,12),new THREE.MeshBasicMaterial({color:0xe6ecf8,toneMapped:false}));scene.add(moon);
const starM=new THREE.PointsMaterial({color:0xffffff,size:0.5,transparent:true,opacity:0,depthWrite:false});
{const pts=[];for(let i=0;i<420;i++){const a=rnd()*Math.PI*2,e=0.05+rnd()*1.1,r=95;pts.push(Math.cos(a)*Math.cos(e)*r,2+Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.Points(g,starM));}
const cNight=new THREE.Color(0x060a18),cDay=new THREE.Color(0x8cc4f0),cDusk=new THREE.Color(0xff8a55),cMoonL=new THREE.Color(0x5f7fc0),cDayL=new THREE.Color(0xdcecff);
let worldTick=0,clockTick=0,timeTxt='';
function updateWorld(dt){
  hour=(hour+dt*24/480)%24;
  worldTick-=dt;if(worldTick>0)return;worldTick=0.2;
  const a=(hour-6)/24*Math.PI*2,el=Math.sin(a),day=Math.max(0,Math.min(1,(el+0.12)/0.4)),dusk=Math.max(0,1-Math.abs(el)/0.3);
  scene.background.copy(cNight).lerp(cDay,day).lerp(cDusk,dusk*0.6);
  outside.forEach(o=>{o[0].color.copy(o[1]).multiplyScalar(0.1+0.9*day).lerp(cDusk,dusk*0.22);});
  [winS,winE].forEach((l,i)=>{l.color.copy(cMoonL).lerp(cDayL,day).lerp(cDusk,dusk*0.55);l.intensity=(0.14+0.7*day+0.15*dusk)*(i?0.8:1);});
  hemi.intensity=0.045+0.085*day;if(lampL)lampL.intensity=1.05-0.4*day;pendL.intensity=1.05-0.35*day;
  sun.position.set(Math.cos(a)*45,2+Math.sin(a)*32,30);moon.position.set(-Math.cos(a)*45,2-Math.sin(a)*32,30);starM.opacity=1-day;
  const hh=Math.floor(hour),mi=Math.floor((hour%1)*6)*10,t=((hh+11)%12+1)+':'+String(mi).padStart(2,'0')+(hh<12?' AM':' PM');
  if(t!==timeTxt){timeTxt=t;$('h-time').textContent=' · '+t;}
}

