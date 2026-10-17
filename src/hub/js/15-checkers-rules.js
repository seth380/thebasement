/* ---------- checkers rules and computer player ---------- */
function ckInit(){const b=new Int8Array(64);for(let r=0;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2){if(r<3)b[r*8+c]=-1;else if(r>4)b[r*8+c]=1;}return b;}
function ckJumps(b,r,c,p,caps,path,out){
  let found=false;const s=p>0?1:-1,king=Math.abs(p)===2,drs=king?[-1,1]:[p>0?-1:1];
  for(const dr of drs)for(const dc of [-1,1]){
    const mr=r+dr,mc=c+dc,lr=r+2*dr,lc=c+2*dc;
    if(lr<0||lr>7||lc<0||lc>7)continue;
    const mid=b[mr*8+mc];if(mid===0||(mid>0)===(s>0)||b[lr*8+lc]!==0)continue;
    found=true;b[mr*8+mc]=0;
    const np=path.concat(lr*8+lc),nc=caps.concat(mr*8+mc),crown=!king&&((s>0&&lr===0)||(s<0&&lr===7));
    if(crown||!ckJumps(b,lr,lc,p,nc,np,out))out.push({from:np[0],path:np.slice(1),caps:nc,crown:crown});
    b[mr*8+mc]=mid;
  }
  return found;
}
function ckMoves(b,s){
  const js=[],ms=[];
  for(let i=0;i<64;i++){const p=b[i];if(p===0||(p>0)!==(s>0))continue;b[i]=0;ckJumps(b,i>>3,i&7,p,[],[i],js);b[i]=p;}
  if(js.length)return js;
  for(let i=0;i<64;i++){const p=b[i];if(p===0||(p>0)!==(s>0))continue;const r=i>>3,c=i&7,king=Math.abs(p)===2;
    for(const dr of (king?[-1,1]:[p>0?-1:1]))for(const dc of [-1,1]){const nr=r+dr,nc=c+dc;if(nr<0||nr>7||nc<0||nc>7||b[nr*8+nc]!==0)continue;
      ms.push({from:i,path:[nr*8+nc],caps:[],crown:!king&&((p>0&&nr===0)||(p<0&&nr===7))});}}
  return ms;
}
function ckApply(b,m){const n=b.slice();let p=n[m.from];n[m.from]=0;for(const i of m.caps)n[i]=0;if(m.crown)p=p>0?2:-2;n[m.path[m.path.length-1]]=p;return n;}
function ckEval(b){let v=0;for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const r=i>>3;
  if(p===1)v-=100+(7-r)*4+(r===7?8:0);else if(p===2)v-=180;else if(p===-1)v+=100+r*4+(r===0?8:0);else v+=180;}return v;}
function ckSearch(b,s,d,a,be){
  const ms=ckMoves(b,s);if(!ms.length)return -100000-d;
  if(d<=0&&!ms[0].caps.length)return s<0?ckEval(b):-ckEval(b);
  if(d<-8)return s<0?ckEval(b):-ckEval(b);
  let best=-1e9;for(const m of ms){const v=-ckSearch(ckApply(b,m),-s,d-1,-be,-a);if(v>best)best=v;if(v>a)a=v;if(a>=be)break;}return best;
}
function ckBest(b,depth,rand){
  const ms=ckMoves(b,-1);if(!ms.length)return null;if(rand&&Math.random()<rand)return ms[Math.floor(Math.random()*ms.length)];
  let best=-1e9,pick=[];for(const m of ms){const v=-ckSearch(ckApply(b,m),1,depth-1,-1e9,1e9);if(v>best+0.5){best=v;pick=[m];}else if(Math.abs(v-best)<=0.5)pick.push(m);}
  return pick[Math.floor(Math.random()*pick.length)];
}
const ck={b:null,turn:1,legal:[],sel:-1,prefix:[],last:[],over:'',diff:1,noCap:0};
const CKD=[['Easy',2,0.3],['Normal',4,0],['Hard',8,0]];
{const d=parseInt(store.getItem('chk-diff'),10);if(d>=0&&d<3)ck.diff=d;}
function ckCands(){return ck.legal.filter(m=>m.from===ck.sel&&ck.prefix.every((p,k)=>m.path[k]===p));}
function ckView(){
  if(ck.sel<0||!ck.prefix.length)return ck.b;
  const m=ckCands()[0],v=ck.b.slice(),p=v[ck.sel];v[ck.sel]=0;
  for(let k=0;k<ck.prefix.length;k++)if(m.caps[k]!==undefined)v[m.caps[k]]=0;
  v[ck.prefix[ck.prefix.length-1]]=p;return v;
}
function ckRender(){
  const v=ckView(),dests=ck.sel>=0&&ck.turn===1?ckCands().map(m=>m.path[ck.prefix.length]):[],cur=ck.prefix.length?ck.prefix[ck.prefix.length-1]:ck.sel;
  let h='';
  for(let i=0;i<64;i++){const r=i>>3,c=i&7,dark=(r+c)%2,p=v[i];
    const can=ck.turn===1&&!ck.over&&!ck.prefix.length&&p>0&&ck.legal.some(m=>m.from===i);
    const nm='abcdefgh'[c]+(8-r)+(p?(p>0?', your ':', computer ')+(Math.abs(p)===2?'king':'piece'):'');
    h+='<button type="button" class="h-sq'+(dark?' d':'')+(i===cur?' sel':'')+(dests.indexOf(i)>=0?' dest':'')+(ck.last.indexOf(i)>=0?' last':'')+(can?' can':'')+'" data-i="'+i+'"'+(dark?'':' tabindex="-1"')+' aria-label="'+nm+'">'+(p?'<span class="h-pc '+(p>0?'r':'b')+(Math.abs(p)===2?' k':'')+'"></span>':'')+'</button>';}
  $('h-chk-board').innerHTML=h;
  $('h-chk-status').textContent=ck.over?ck.over:ck.turn===1?(ck.prefix.length?'Keep jumping with the same piece.':ck.legal[0]&&ck.legal[0].caps.length?'Your move. You have to jump.':'Your move. You are red.'):'The computer is thinking.';
  const st=readJ('chk-stats');$('h-chk-rec').textContent='Wins '+(st.w||0)+'  ·  Losses '+(st.l||0)+'  ·  Draws '+(st.d||0);
  ckSync(v);
}
function ckNew(){ck.b=ckInit();ck.turn=1;ck.legal=ckMoves(ck.b,1);ck.sel=-1;ck.prefix=[];ck.last=[];ck.over='';ck.noCap=0;ckRender();}
function ckEnd(r){if(r==='w')addCoins(PAY.tableWin.chk,'Checkers win');else if(r==='d')addCoins(PAY.tableDraw,'Checkers draw');SFX.play(r==='w'?'win':r==='l'?'error':'bong',{delay:0.25});ck.over=r==='w'?'You win!':r==='l'?'The computer wins this one.':'Draw.';ck.turn=0;const st=readJ('chk-stats');st[r]=(st[r]||0)+1;store.setItem('chk-stats',JSON.stringify(st));}
function ckCommit(m,s){
  SFX.play(m.caps.length?'remove':'place');
  ck.b=ckApply(ck.b,m);ck.last=[m.from].concat(m.path);ck.noCap=m.caps.length?0:ck.noCap+1;ck.sel=-1;ck.prefix=[];
  const nm=ckMoves(ck.b,-s);
  if(!nm.length)ckEnd(s===1?'w':'l');else if(ck.noCap>=80)ckEnd('d');
  else{ck.turn=-s;if(s===-1)ck.legal=nm;else setTimeout(ckAI,550);}
  ckRender();
}
function ckAI(){if(ck.turn!==-1||ck.over)return;const d=CKD[ck.diff],m=ckBest(ck.b,d[1],d[2]);if(m)ckCommit(m,-1);}
$('h-chk-board').addEventListener('click',e=>{
  const t=e.target.closest('.h-sq');if(!t||ck.turn!==1||ck.over)return;const i=+t.dataset.i;
  if(!ck.prefix.length&&ck.b[i]>0&&ck.legal.some(m=>m.from===i)){ck.sel=i;ckRender();return;}
  if(ck.sel<0)return;
  const cs=ckCands().filter(m=>m.path[ck.prefix.length]===i);if(!cs.length)return;
  ck.prefix.push(i);const done=cs.find(m=>m.path.length===ck.prefix.length);
  if(done)ckCommit(done,1);else ckRender();
});
CKD.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.id='h-chk-d'+i;b.textContent=d[0];b.setAttribute('aria-pressed',i===ck.diff);
  b.addEventListener('click',()=>{ck.diff=i;store.setItem('chk-diff',String(i));[].forEach.call($('h-chk-diff').children,(c,n)=>c.setAttribute('aria-pressed',n===i));});$('h-chk-diff').appendChild(b);});
function openChk(){SFX.play('open');if(!ck.b)ckNew();$('h-chk').hidden=false;ckRender();}
$('h-chk-new').addEventListener('click',ckNew);
$('h-chk-leave').addEventListener('click',()=>closeOvers());
ckSync(ckInit());
const OVERS=['h-troph','h-chk','h-chess','h-foos','h-pool','h-shop','h-lift'];
const modal=()=>OVERS.some(id=>!$(id).hidden);
function closeOvers(){if(modal())SFX.play('close');OVERS.forEach(id=>{$(id).hidden=true;});FB.on=false;PL.on=false;}

/* things that move on their own */
function animate(dt,t){
  if(feedT>0)feedT-=dt;
  fish.forEach(f=>{
    f.up+=((feedT>0?1:0)-f.up)*Math.min(1,dt*1.5);
    const a=t*f.sp+f.ph,vx=Math.cos(a);
    f.g.position.set(f.cx+Math.sin(a)*f.amp,(f.cy+Math.sin(a*0.9+f.ph)*0.05)*(1-f.up)+(f.top-Math.abs(Math.sin(a*3))*0.04)*f.up,f.cz+Math.sin(a*1.7+f.ph*2)*0.1);
    f.face+=((vx>0?0:Math.PI)-f.face)*Math.min(1,dt*5);f.g.rotation.y=f.face;f.tail.rotation.y=Math.sin(t*9+f.ph)*0.5;
    if(f.actor){f.actor.state(feedT>0?'Swimming_Fast':'Swimming_Normal');f.actor.update(dt);}
  });
  bubbles.forEach(b=>{b.p=(b.p+dt*0.45)%1;b.m.position.set(b.x+Math.sin(b.p*20)*0.01,b.y0+b.p*b.h,b.z);});
  weeds.forEach(w=>{w.g.rotation.z=Math.sin(t*1.3+w.p)*0.14;});
  if(foos.spin>0){foos.spin-=dt;foos.rods.forEach((r,i)=>{r.a+=dt*(13+i)*r.dir*Math.min(1,foos.spin);r.g.rotation.z=r.a;});
    foos.ball.position.x=foos.x+Math.sin(t*6)*0.45;foos.ball.position.z=foos.z+Math.sin(t*4.3)*0.22;}
  else foos.rods.forEach(r=>{if(r.a!==0){r.a=Math.atan2(Math.sin(r.a),Math.cos(r.a));r.a*=Math.max(0,1-dt*6);if(Math.abs(r.a)<0.002)r.a=0;r.g.rotation.z=r.a;}});
}

