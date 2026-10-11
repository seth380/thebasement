/* ---------- foosball: a top-down match against the computer ---------- */
const FB={on:false,ball:{x:300,y:170,vx:0,vy:0},u:0,au:[0,0,0,0],score:[0,0],kickT:0,stuck:0,serveT:0,over:'',diff:1,ctx:$('h-foos-cv').getContext('2d')};
const FBD=[['Easy',0.55],['Normal',0.85],['Hard',1.2]];
const FB_RODS=[{x:40,n:1,t:0},{x:110,n:2,t:0},{x:185,n:3,t:1},{x:260,n:5,t:0},{x:340,n:5,t:1},{x:415,n:3,t:0},{x:490,n:2,t:1},{x:560,n:1,t:1}];
FB_RODS.forEach(r=>{const sp=[0,0,130,95,0,58][r.n];r.base=[];for(let k=0;k<r.n;k++)r.base.push((k-(r.n-1)/2)*sp);r.range=r.n===1?58:156-(r.n-1)/2*sp;r.off=0;r.voff=0;});
{const d=parseInt(store.getItem('foos-diff'),10);if(d>=0&&d<3)FB.diff=d;}
function fbServe(dir){const b=FB.ball;b.x=300;b.y=170;const a=(Math.random()-0.5)*1.2;b.vx=Math.cos(a)*170*dir;b.vy=Math.sin(a)*170;FB.serveT=0.7;FB.stuck=0;}
function fbNew(){FB.score=[0,0];FB.over='';FB.u=0;FB.au=[0,0,0,0];fbServe(Math.random()<0.5?1:-1);fbHud();}
function fbHud(){$('h-foos-score').textContent=FB.score[0]+' : '+FB.score[1];$('h-foos-status').textContent=FB.over||'First to 5';const st=readJ('foos-stats');$('h-foos-rec').textContent='Wins '+(st.w||0)+'  ·  Losses '+(st.l||0);}
function fbTick(dt){
  const b=FB.ball,sk=FBD[FB.diff][1];
  if(!FB.over){
    FB.u=Math.max(-1,Math.min(1,FB.u+((keys.down?1:0)-(keys.up?1:0))*2.4*dt));
    if(FB.kickT>0)FB.kickT-=dt;
    let ai=0;
    FB_RODS.forEach(r=>{
      const old=r.off;
      if(r.t===0)r.off=FB.u*r.range;
      else{let want=0,bd=1e9;if(b.x<r.x+150||r.n===1)r.base.forEach(m=>{const o=Math.max(-r.range,Math.min(r.range,b.y-170-m));const d=Math.abs(o-r.off)+Math.abs(b.y-170-m-o)*3;if(d<bd){bd=d;want=o;}});
        r.errT=(r.errT||0)-dt;if(r.errT<=0){r.err=(Math.random()-0.5)*2*(30-FB.diff*10);r.errT=0.45+Math.random()*0.5;}
        want=Math.max(-r.range,Math.min(r.range,want+r.err));const sp=(r.n===1?92:122)*sk*dt;r.off+=Math.max(-sp,Math.min(sp,want-r.off));ai++;}
      r.voff=(r.off-old)/Math.max(dt,0.001);
    });
    if(FB.serveT>0)FB.serveT-=dt;
    else{
      const n=3;for(let k=0;k<n;k++){const h=dt/n;
        b.x+=b.vx*h;b.y+=b.vy*h;
        if(b.y<15){b.y=15;b.vy=Math.abs(b.vy);}if(b.y>325){b.y=325;b.vy=-Math.abs(b.vy);}
        const goal=Math.abs(b.y-170)<52;
        if(b.x<15&&!goal){b.x=15;b.vx=Math.abs(b.vx);}if(b.x>585&&!goal){b.x=585;b.vx=-Math.abs(b.vx);}
        if(b.x<-4||b.x>604){const me=b.x>300;FB.score[me?0:1]++;
          if(FB.score[me?0:1]>=5){FB.over=me?'You win!':'The computer wins.';const st=readJ('foos-stats');st[me?'w':'l']=(st[me?'w':'l']||0)+1;store.setItem('foos-stats',JSON.stringify(st));}
          else fbServe(me?-1:1);fbHud();foos.spin=1.2;return;}
        for(const r of FB_RODS)for(const m of r.base){const mx=r.x,my=170+m+r.off,dx=b.x-mx,dy=b.y-my,d=Math.hypot(dx,dy);
          if(d<17&&d>0.01){const nx=dx/d,ny=dy/d;b.x=mx+nx*17;b.y=my+ny*17;const dir=r.t?-1:1,pow=r.t?(225+Math.random()*90*sk):(FB.kickT>0?520:310);
            b.vx=dir*Math.max(Math.abs(b.vx)*0.7,pow);b.vy=b.vy*0.5+r.voff*0.45+ny*(r.t?150:230);}}
      }
      const sp=Math.hypot(b.vx,b.vy);if(sp>640){b.vx*=640/sp;b.vy*=640/sp;}
      b.vx*=1-0.22*dt;b.vy*=1-0.22*dt;
      if(sp<28){FB.stuck+=dt;if(FB.stuck>1.6){b.vx+=(Math.random()-0.5)*260;b.vy+=(Math.random()-0.5)*260;FB.stuck=0;}}else FB.stuck=0;
    }
  }
  /* draw */
  const g=FB.ctx;
  for(let i=0;i<10;i++){g.fillStyle=i%2?'#1f8a4c':'#22944f';g.fillRect(i*60,0,60,340);}
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=3;g.strokeRect(8,8,584,324);g.beginPath();g.moveTo(300,8);g.lineTo(300,332);g.stroke();g.beginPath();g.arc(300,170,46,0,7);g.stroke();
  g.fillStyle='#14141a';g.fillRect(0,118,8,104);g.fillRect(592,118,8,104);
  FB_RODS.forEach(r=>{g.strokeStyle='#cfd3da';g.lineWidth=4;g.beginPath();g.moveTo(r.x,0);g.lineTo(r.x,340);g.stroke();
    r.base.forEach(m=>{const y=170+m+r.off;g.fillStyle=r.t?'#2f6fd8':'#d8362b';g.strokeStyle='#1d1640';g.lineWidth=2;g.beginPath();g.ellipse(r.x,y,8,13,0,0,7);g.fill();g.stroke();
      g.fillStyle='#f3ead8';g.beginPath();g.arc(r.x,y,4.5,0,7);g.fill();});});
  g.fillStyle='#fff';g.strokeStyle='#1d1640';g.lineWidth=2;g.beginPath();g.arc(b.x,b.y,7,0,7);g.fill();g.stroke();
  if(FB.over){g.fillStyle='rgba(29,22,64,.6)';g.fillRect(0,130,600,80);g.fillStyle='#ffc928';g.font="38px 'Lilita One',sans-serif";g.textAlign='center';g.fillText(FB.over,300,183);}
}
{const cv=$('h-foos-cv'),mv=e=>{const r=cv.getBoundingClientRect();FB.u=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height*2-1)*1.3));};
  cv.addEventListener('pointermove',mv);cv.addEventListener('pointerdown',e=>{e.preventDefault();mv(e);FB.kickT=0.3;});}
diffRow('h-foos-diff',FBD,FB,'foos-diff');
function openFoos(){$('h-foos').hidden=false;FB.on=true;if(FB.over||!(FB.score[0]+FB.score[1]))fbNew();fbHud();}
$('h-foos-new').addEventListener('click',fbNew);

