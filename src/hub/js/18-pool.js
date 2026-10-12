/* ---------- pool: simplified eight-ball against the computer ---------- */
const PL={on:false,balls:[],turn:0,grp:[null,null],state:'aim',aim:0,over:'',potted:[],scratch:false,think:0,diff:1,ctx:$('h-pool-cv').getContext('2d'),aiPow:0};
const PLD=[['Easy',0.06],['Normal',0.025],['Hard',0.008]],PR=10,PCOL=['#fff','#f2c230','#2f6fd8','#d8362b','#7b4bd8','#f28a1a','#2a9a55','#8a2f3a','#16141c'];
const POCK=[[30,30,20],[400,26,16],[770,30,20],[30,370,20],[400,374,16],[770,370,20]];
{const d=parseInt(store.getItem('pool-diff'),10);if(d>=0&&d<3)PL.diff=d;}
function plNew(){
  const nums=[1,2,3,4,5,6,7,9,10,11,12,13,14,15];for(let i=nums.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)),t=nums[i];nums[i]=nums[j];nums[j]=t;}
  PL.balls=[{n:0,x:200,y:200,vx:0,vy:0,in:false}];
  for(let i=0;i<5;i++)for(let j=0;j<=i;j++){const n=(i===2&&j===1)?8:nums.pop();PL.balls.push({n:n,x:560+i*17.8,y:200+(j-i/2)*20.6,vx:0,vy:0,in:false});}
  PL.turn=0;PL.grp=[null,null];PL.state='aim';PL.over='';PL.aim=0;PL.potted=[];PL.scratch=false;plHud();
}
const plType=n=>n===8?'8':n<8?'S':'T';
function plLeft(who){const g=PL.grp[who];return g?PL.balls.filter(b=>!b.in&&b.n&&plType(b.n)===g).length:7;}
function plHud(){
  const g=PL.grp[0];$('h-pool-status').textContent=PL.over||((g?'You are '+(g==='S'?'solids':'stripes')+'. ':'Table is open. ')+(PL.state==='roll'?'':PL.turn===0?(g&&plLeft(0)===0?'Your shot: sink the 8.':'Your shot.'):'The computer is lining up.'));
  $('h-pool-shoot').disabled=!(PL.state==='aim'&&PL.turn===0&&!PL.over);
  const st=readJ('pool-stats');$('h-pool-rec').textContent='Wins '+(st.w||0)+'  ·  Losses '+(st.l||0);
}
function plShoot(pow){SFX.play('tile_land',{vol:0.5+pow/250,rate:0.8});const c=PL.balls[0];c.vx=Math.cos(PL.aim)*pow;c.vy=Math.sin(PL.aim)*pow;PL.state='roll';PL.potted=[];PL.scratch=false;plHud();}
function plResolve(){
  const who=PL.turn,c=PL.balls[0];let keep=false;
  if(PL.scratch){c.in=false;c.vx=c.vy=0;c.x=200;c.y=200;let tries=0;while(PL.balls.some(b=>b!==c&&!b.in&&Math.hypot(b.x-c.x,b.y-c.y)<PR*2.1)&&tries++<40)c.y=60+Math.random()*280;}
  if(PL.potted.indexOf(8)>=0){
    const cleared=PL.grp[who]&&PL.balls.every(b=>b.in||!b.n||b.n===8||plType(b.n)!==PL.grp[who])&&PL.potted.every(n=>n===8||plType(n)!==PL.grp[who]);
    const win=(cleared&&!PL.scratch)?who:1-who;PL.over=win===0?'You sank the 8. You win!':who===0?'The 8 went down too early. The computer wins.':'The computer wins this one.';
    if(win===0&&who===1)PL.over='The computer sank the 8 too early. You win!';
    if(win===0)addCoins(PAY.tableWin.pool,'Pool win');const st=readJ('pool-stats');st[win===0?'w':'l']=(st[win===0?'w':'l']||0)+1;store.setItem('pool-stats',JSON.stringify(st));PL.state='over';plHud();return;
  }
  const obj=PL.potted.filter(n=>n!==8);
  if(!PL.grp[who]&&obj.length&&!PL.scratch){PL.grp[who]=plType(obj[0]);PL.grp[1-who]=PL.grp[who]==='S'?'T':'S';}
  if(!PL.scratch&&obj.some(n=>plType(n)===PL.grp[who]))keep=true;
  if(!keep)PL.turn=1-who;
  PL.state='aim';PL.think=1.1;PL.aiSet=false;plHud();
}
function plClear(x1,y1,x2,y2,skip){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1;for(const b of PL.balls){if(b.in||skip.indexOf(b)>=0)continue;const t=Math.max(0,Math.min(1,((b.x-x1)*dx+(b.y-y1)*dy)/(L*L)));if(Math.hypot(x1+dx*t-b.x,y1+dy*t-b.y)<PR*2-1)return false;}return true;}
function plAI(){
  const c=PL.balls[0],g=PL.grp[1],left=plLeft(1);let best=null,bs=-1e9;
  const targets=PL.balls.filter(b=>!b.in&&b.n&&(g?(left===0?b.n===8:plType(b.n)===g):b.n!==8));
  targets.forEach(t=>POCK.forEach(k=>{const dx=k[0]-t.x,dy=k[1]-t.y,L=Math.hypot(dx,dy),gx=t.x-dx/L*PR*2,gy=t.y-dy/L*PR*2,ax=gx-c.x,ay=gy-c.y,A=Math.hypot(ax,ay);
    const cut=Math.acos(Math.max(-1,Math.min(1,(ax*dx+ay*dy)/(A*L))));if(cut>1.25)return;
    let sc=-cut*220-L*0.35-A*0.2;if(!plClear(c.x,c.y,gx,gy,[c,t]))sc-=500;if(!plClear(t.x,t.y,k[0],k[1],[c,t]))sc-=400;
    if(sc>bs){bs=sc;best={a:Math.atan2(ay,ax),pow:Math.min(1100,430+(A+L)*0.95+cut*240)};}}));
  if(!best){const t=targets[0]||PL.balls.find(b=>!b.in&&b.n);best={a:Math.atan2(t.y-c.y,t.x-c.x),pow:650};}
  const u=Math.random()+Math.random()+Math.random()-1.5;PL.aim=best.a+u*PLD[PL.diff][1]*1.6;PL.aiPow=best.pow;
}
function plTick(dt){
  const B=PL.balls,g=PL.ctx;if(AUD.poolT>0)AUD.poolT-=dt;
  if(PL.state==='roll'){
    const n=6,h=dt/n;let moving=false;
    for(let k=0;k<n;k++){
      for(const b of B){if(b.in)continue;b.x+=b.vx*h;b.y+=b.vy*h;
        let pot=false;for(const p of POCK)if(Math.hypot(b.x-p[0],b.y-p[1])<p[2]){pot=true;break;}
        if(pot){SFX.play('drop2',{vol:0.9});b.in=true;b.vx=b.vy=0;if(b.n===0)PL.scratch=true;else PL.potted.push(b.n);continue;}
        if(b.x<30+PR){b.x=30+PR;b.vx=Math.abs(b.vx)*0.86;}if(b.x>770-PR){b.x=770-PR;b.vx=-Math.abs(b.vx)*0.86;}
        if(b.y<30+PR){b.y=30+PR;b.vy=Math.abs(b.vy)*0.86;}if(b.y>370-PR){b.y=370-PR;b.vy=-Math.abs(b.vy)*0.86;}}
      for(let i=0;i<B.length;i++){const a=B[i];if(a.in)continue;for(let j=i+1;j<B.length;j++){const b=B[j];if(b.in)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
        if(d<PR*2&&d>0.001){const nx=dx/d,ny=dy/d,ov=(PR*2-d)/2;a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
          if(rv<0){if(rv<-25&&!(AUD.poolT>0)){AUD.poolT=0.03;SFX.play('tick',{vol:Math.min(1.4,-rv/260),rate:0.85,jitter:0.15});}const im=rv*0.98;a.vx+=nx*im;a.vy+=ny*im;b.vx-=nx*im;b.vy-=ny*im;}}}}
    }
    for(const b of B){if(b.in)continue;const sp=Math.hypot(b.vx,b.vy);if(sp<5){b.vx=b.vy=0;continue;}const ns=Math.max(0,sp-(46+sp*0.32)*dt);b.vx*=ns/sp;b.vy*=ns/sp;moving=true;}
    if(!moving)plResolve();
  }else if(PL.state==='aim'&&PL.turn===1&&!PL.over){
    if(!PL.aiSet){plAI();PL.aiSet=true;}
    PL.think-=dt;if(PL.think<=0)plShoot(PL.aiPow);
  }
  /* draw */
  g.fillStyle='#5a3a22';g.fillRect(0,0,800,400);g.fillStyle='#1c7a4a';g.fillRect(22,22,756,356);g.fillStyle='#1f8a52';g.fillRect(30,30,740,340);
  g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=2;g.beginPath();g.moveTo(200,30);g.lineTo(200,370);g.stroke();
  POCK.forEach(p=>{g.fillStyle='#0c0b10';g.beginPath();g.arc(p[0],p[1],p[2]-2,0,7);g.fill();});
  const c=B[0];
  if(PL.state==='aim'&&!PL.over&&c&&!c.in){
    const dx=Math.cos(PL.aim),dy=Math.sin(PL.aim);let tb=1e9;
    for(const b of B){if(b.in||b===c)continue;const lx=b.x-c.x,ly=b.y-c.y,tc=lx*dx+ly*dy;if(tc<0)continue;const d2=lx*lx+ly*ly-tc*tc;if(d2>4*PR*PR)continue;const t=tc-Math.sqrt(4*PR*PR-d2);if(t<tb)tb=t;}
    if(dx>0)tb=Math.min(tb,(770-PR-c.x)/dx);else if(dx<0)tb=Math.min(tb,(30+PR-c.x)/dx);if(dy>0)tb=Math.min(tb,(370-PR-c.y)/dy);else if(dy<0)tb=Math.min(tb,(30+PR-c.y)/dy);
    g.setLineDash([8,7]);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=2;g.beginPath();g.moveTo(c.x,c.y);g.lineTo(c.x+dx*tb,c.y+dy*tb);g.stroke();g.setLineDash([]);
    g.beginPath();g.arc(c.x+dx*tb,c.y+dy*tb,PR,0,7);g.stroke();
    const pw=PL.turn===0?+$('h-pool-pow').value:55,back=18+pw*0.5;
    g.strokeStyle='#e6c38a';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(c.x-dx*back,c.y-dy*back);g.lineTo(c.x-dx*(back+170),c.y-dy*(back+170));g.stroke();g.lineCap='butt';
  }
  for(const b of B){if(b.in)continue;const col=PCOL[b.n===0?0:b.n<=8?b.n:b.n-8];
    g.beginPath();g.arc(b.x,b.y,PR,0,7);g.fillStyle=b.n>8?'#fff8e7':col;g.fill();
    if(b.n>8){g.save();g.clip();g.fillStyle=col;g.fillRect(b.x-PR,b.y-4.5,PR*2,9);g.restore();g.beginPath();g.arc(b.x,b.y,PR,0,7);}
    g.strokeStyle='#14121c';g.lineWidth=1.5;g.stroke();
    if(b.n){g.fillStyle='#fff8e7';g.beginPath();g.arc(b.x,b.y,4.6,0,7);g.fill();g.fillStyle='#14121c';g.font='bold 7px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(b.n,b.x,b.y+0.5);}}
  let px=[40,760];B.forEach(b=>{if(!b.in||!b.n)return;const side=PL.grp[0]?(plType(b.n)===PL.grp[0]?0:1):0;g.fillStyle=PCOL[b.n<=8?b.n:b.n-8];g.beginPath();g.arc(px[side],11,7,0,7);g.fill();if(b.n>8){g.fillStyle='#fff8e7';g.fillRect(px[side]-7,8,14,2);g.fillRect(px[side]-7,12.5,14,2);}px[side]+=side?-17:17;});
  if(PL.over){g.fillStyle='rgba(29,22,64,.65)';g.fillRect(0,160,800,80);g.fillStyle='#ffc928';g.font="30px 'Lilita One',sans-serif";g.textAlign='center';g.textBaseline='middle';g.fillText(PL.over,400,200);}
}
{const cv=$('h-pool-cv'),mv=e=>{if(PL.state!=='aim'||PL.turn!==0||PL.over)return;const r=cv.getBoundingClientRect(),c=PL.balls[0],x=(e.clientX-r.left)/r.width*800,y=(e.clientY-r.top)/r.height*400;if(Math.hypot(x-c.x,y-c.y)>6)PL.aim=Math.atan2(y-c.y,x-c.x);};
  let down=false;cv.addEventListener('pointerdown',e=>{e.preventDefault();down=true;mv(e);});cv.addEventListener('pointermove',e=>{if(down||e.pointerType==='mouse')mv(e);});['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>{down=false;}));}
function plPlayerShoot(){if(PL.state==='aim'&&PL.turn===0&&!PL.over)plShoot(+$('h-pool-pow').value*11);}
$('h-pool-shoot').addEventListener('click',plPlayerShoot);
diffRow('h-pool-diff',PLD,PL,'pool-diff');
function openPool(){SFX.play('open');$('h-pool').hidden=false;PL.on=true;if(!PL.balls.length||PL.over)plNew();plHud();}
$('h-pool-new').addEventListener('click',plNew);
[].forEach.call(document.querySelectorAll('#h-wrap [data-close]'),b=>b.addEventListener('click',()=>closeOvers()));
/* pool table in the room */
{
  const px=6.4,pz=-2.2,wal=S(0x4a2f1c,0.45,0,{map:woodTex}),blk=S(0x0d0d10,0.4,0.2);
  box(2.7,0.16,1.5,wal,px,0.74,pz);const felt=sh(new THREE.Mesh(new THREE.PlaneGeometry(2.44,1.24),S(0x1f8a52,0.95,0,{map:fabricTex})),true);felt.rotation.x=-Math.PI/2;felt.position.set(px,0.826,pz);scene.add(felt);
  [-1,1].forEach(s=>{box(2.7,0.07,0.13,wal,px,0.855,pz+s*0.685);box(0.13,0.07,1.5,wal,px+s*1.285,0.855,pz);[-1,1].forEach(q=>box(0.14,0.68,0.14,wal,px+s*1.15,0.34,pz+q*0.55));});
  [[-1.22,-0.62],[0,-0.64],[1.22,-0.62],[-1.22,0.62],[0,0.64],[1.22,0.62]].forEach(p=>{const m=new THREE.Mesh(new THREE.CircleGeometry(0.07,14),new THREE.MeshBasicMaterial({color:0x08080a}));m.rotation.x=-Math.PI/2;m.position.set(px+p[0],0.83,pz+p[1]);scene.add(m);});
  const cols=[0xf2c230,0x2f6fd8,0xd8362b,0x7b4bd8,0xf28a1a,0x2a9a55,0x8a2f3a,0x16141c];let k=0;
  for(let i=0;i<5;i++)for(let j=0;j<=i;j++)sph(0.029,S(cols[k++%8],0.25),px+0.5+i*0.052,0.856,pz+(j-i/2)*0.06);
  sph(0.029,S(0xfff8e7,0.25),px-0.65,0.856,pz);const cue=cyl(0.008,0.014,1.4,S(0xe6c38a,0.4),px-0.3,0.9,pz+0.42,null,8);cue.rotation.set(0,0.2,Math.PI/2);
  box(1.5,0.06,0.3,S(0x1d4a3a,0.5),px,1.95,pz,null,true);[-0.5,0,0.5].forEach(x=>{const b=new THREE.Mesh(new THREE.SphereGeometry(0.05,10,8),new THREE.MeshBasicMaterial({color:0xffe6b0,toneMapped:false}));b.position.set(px+x,1.9,pz);scene.add(b);});
  [-0.6,0.6].forEach(x=>cyl(0.005,0.005,RH-0.22-1.98,blk,px+x,(RH-0.22+1.98)/2,pz,null,6));
  const l=new THREE.PointLight(0xffe2b0,0.95,5.5,1.6);l.position.set(px,1.75,pz);scene.add(l);
  solid(px-1.4,px+1.4,pz-0.8,pz+0.8);
  things.push({x:px,z:pz,r:2.0,text:'Play pool',fn:()=>openPool()});
}

