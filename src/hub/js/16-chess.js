/* ---------- chess: rules and computer player ---------- */
const CH_V=[0,100,320,330,500,900,20000],CH_PST=[];for(let i=0;i<64;i++)CH_PST.push(14-((Math.abs(3.5-(i>>3))+Math.abs(3.5-(i&7)))*4|0));
const CH_N=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],CH_K=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],CH_B=[[-1,-1],[-1,1],[1,-1],[1,1]],CH_R=[[-1,0],[1,0],[0,-1],[0,1]];
function chInit(){const b=new Int8Array(64),back=[4,2,3,5,6,3,2,4];for(let c=0;c<8;c++){b[c]=-back[c];b[8+c]=-1;b[48+c]=1;b[56+c]=back[c];}return {b:b,turn:1,cs:15,ep:-1,half:0};}
function chAttacked(b,sq,by){
  const r=sq>>3,c=sq&7,pr=r+by;
  if(pr>=0&&pr<8){if(c>0&&b[pr*8+c-1]===by)return true;if(c<7&&b[pr*8+c+1]===by)return true;}
  for(const d of CH_N){const rr=r+d[0],cc=c+d[1];if(rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===2*by)return true;}
  for(const d of CH_K){const rr=r+d[0],cc=c+d[1];if(rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===6*by)return true;}
  for(const d of CH_B){let rr=r+d[0],cc=c+d[1];while(rr>=0&&rr<8&&cc>=0&&cc<8){const p=b[rr*8+cc];if(p){if(p===3*by||p===5*by)return true;break;}rr+=d[0];cc+=d[1];}}
  for(const d of CH_R){let rr=r+d[0],cc=c+d[1];while(rr>=0&&rr<8&&cc>=0&&cc<8){const p=b[rr*8+cc];if(p){if(p===4*by||p===5*by)return true;break;}rr+=d[0];cc+=d[1];}}
  return false;
}
function chPseudo(s,capsOnly){
  const b=s.b,t=s.turn,out=[];
  for(let i=0;i<64;i++){const p=b[i];if(!p||(p>0)!==(t>0))continue;const a=p*t,r=i>>3,c=i&7;
    if(a===1){const nr=r-t,start=t>0?6:1,prom=t>0?0:7;
      if(nr>=0&&nr<8){
        if(!capsOnly&&!b[nr*8+c]){if(nr===prom)out.push({f:i,t:nr*8+c,pr:5});else{out.push({f:i,t:nr*8+c});if(r===start&&!b[(r-2*t)*8+c])out.push({f:i,t:(r-2*t)*8+c,dp:1});}}
        for(const dc of [-1,1]){const cc=c+dc;if(cc<0||cc>7)continue;const to=nr*8+cc,q=b[to];
          if(q&&(q>0)!==(t>0)){if(nr===prom)out.push({f:i,t:to,pr:5,cap:1});else out.push({f:i,t:to,cap:1});}
          else if(to===s.ep)out.push({f:i,t:to,ep:1,cap:1});}
      }
    }else if(a===2||a===6){
      for(const d of (a===2?CH_N:CH_K)){const rr=r+d[0],cc=c+d[1];if(rr<0||rr>7||cc<0||cc>7)continue;const q=b[rr*8+cc];if(!q){if(!capsOnly)out.push({f:i,t:rr*8+cc});}else if((q>0)!==(t>0))out.push({f:i,t:rr*8+cc,cap:1});}
      if(a===6&&!capsOnly){const home=t>0?60:4;if(i===home&&!chAttacked(b,home,-t)){
        if(s.cs&(t>0?1:4)&&!b[home+1]&&!b[home+2]&&b[home+3]===4*t&&!chAttacked(b,home+1,-t)&&!chAttacked(b,home+2,-t))out.push({f:i,t:home+2,ck:1});
        if(s.cs&(t>0?2:8)&&!b[home-1]&&!b[home-2]&&!b[home-3]&&b[home-4]===4*t&&!chAttacked(b,home-1,-t)&&!chAttacked(b,home-2,-t))out.push({f:i,t:home-2,cq:1});}}
    }else{for(const d of (a===3?CH_B:a===4?CH_R:CH_K)){let rr=r+d[0],cc=c+d[1];while(rr>=0&&rr<8&&cc>=0&&cc<8){const q=b[rr*8+cc];if(!q){if(!capsOnly)out.push({f:i,t:rr*8+cc});}else{if((q>0)!==(t>0))out.push({f:i,t:rr*8+cc,cap:1});break;}rr+=d[0];cc+=d[1];}}}
  }
  return out;
}
function chMake(s,m){
  const b=s.b.slice(),t=s.turn,p=b[m.f];let cs=s.cs,ep=-1;
  b[m.f]=0;if(m.ep)b[m.t+8*t]=0;b[m.t]=m.pr?m.pr*t:p;
  if(m.dp)ep=m.f-8*t;
  if(m.ck){b[m.t+1]=0;b[m.t-1]=4*t;}
  if(m.cq){b[m.t-2]=0;b[m.t+1]=4*t;}
  if(p===6)cs&=~3;else if(p===-6)cs&=~12;
  if(m.f===63||m.t===63)cs&=~1;if(m.f===56||m.t===56)cs&=~2;if(m.f===7||m.t===7)cs&=~4;if(m.f===0||m.t===0)cs&=~8;
  return {b:b,turn:-t,cs:cs,ep:ep,half:(m.cap||Math.abs(p)===1)?0:s.half+1};
}
function chKing(b,t){for(let i=0;i<64;i++)if(b[i]===6*t)return i;return -1;}
function chLegal(s){const out=[];for(const m of chPseudo(s,false)){const n=chMake(s,m);if(!chAttacked(n.b,chKing(n.b,s.turn),-s.turn))out.push(m);}return out;}
function chInCheck(s){return chAttacked(s.b,chKing(s.b,s.turn),-s.turn);}
function chEval(b){let v=0;for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const a=Math.abs(p);let x=CH_V[a]+(a===6?0:CH_PST[i]*(a===1?0.6:1));if(a===1)x+=(p>0?6-(i>>3):(i>>3)-1)*6;v+=p>0?x:-x;}return v;}
function chQ(s,a,be,d){
  const stand=chEval(s.b)*s.turn;if(d<=0||stand>=be)return stand;if(stand>a)a=stand;
  const ms=chPseudo(s,true).sort((x,y)=>Math.abs(s.b[y.t])-Math.abs(s.b[x.t]));
  for(const m of ms){const n=chMake(s,m);if(chAttacked(n.b,chKing(n.b,s.turn),-s.turn))continue;const v=-chQ(n,-be,-a,d-1);if(v>=be)return v;if(v>a)a=v;}
  return a;
}
function chSearch(s,d,a,be){
  if(d<=0)return chQ(s,a,be,4);
  const ms=chLegal(s);if(!ms.length)return chInCheck(s)?-90000-d:0;
  const key=m=>m.cap?Math.abs(s.b[m.t])*10-Math.abs(s.b[m.f])+100:0;ms.sort((x,y)=>key(y)-key(x));
  let best=-1e9;for(const m of ms){const v=-chSearch(chMake(s,m),d-1,-be,-a);if(v>best)best=v;if(v>a)a=v;if(a>=be)break;}return best;
}
function chBest(s,depth,rand){
  const ms=chLegal(s);if(!ms.length)return null;if(rand&&Math.random()<rand)return ms[Math.floor(Math.random()*ms.length)];
  let best=-1e9,pick=null,a=-1e9;for(const m of ms){const v=-chSearch(chMake(s,m),depth-1,-1e9,-a+12)+Math.random()*8;if(v>best){best=v;pick=m;}if(v-12>a)a=v-12;}return pick;
}
const chs={s:null,legal:[],sel:-1,last:[],over:'',diff:1},CHD=[['Easy',1,0.3],['Normal',2,0],['Hard',4,0]],CH_G='♟♞♝♜♛♚';
{const d=parseInt(store.getItem('chess-diff'),10);if(d>=0&&d<3)chs.diff=d;}
/* chess table in the room */
const ch3={g:new THREE.Group(),x:1.2,z:5.7,geo:[],top:[]};scene.add(ch3.g);
{
  const tx=ch3.x,tz=ch3.z,wal=S(0x5c3d28,0.45,0,{map:woodTex}),blk=S(0x0d0d10,0.4,0.2);
  box(0.84,0.04,0.84,wal,tx,0.74,tz);cyl(0.05,0.06,0.7,blk,tx,0.37,tz);cyl(0.28,0.3,0.03,blk,tx,0.015,tz);
  box(0.58,0.012,0.58,S(0x1a1a1f,0.5),tx,0.764,tz,null,true);
  const bt=mk(256,256,(g)=>{for(let r=0;r<8;r++)for(let c=0;c<8;c++){g.fillStyle=(r+c)%2?'#4a5a48':'#e8e4d2';g.fillRect(c*32,r*32,32,32);}},true);
  const bp=sh(new THREE.Mesh(new THREE.PlaneGeometry(0.52,0.52),S(0xffffff,0.45,0,{map:bt})),true);bp.rotation.x=-Math.PI/2;bp.position.set(tx,0.772,tz);scene.add(bp);
  [-1,1].forEach(s=>{const cz=tz+s*0.8;box(0.42,0.04,0.42,wal,tx,0.45,cz);box(0.38,0.03,0.38,S(0x1f5c66,0.95,0,{map:fabricTex}),tx,0.485,cz);
    box(0.42,0.5,0.035,wal,tx,0.74,cz+s*0.195);[-1,1].forEach(a=>[-1,1].forEach(b=>box(0.035,0.44,0.035,wal,tx+a*0.185,0.22,cz+b*0.185)));solid(tx-0.22,tx+0.22,cz-0.22,cz+0.22);});
  const H=[0,0.03,0.045,0.05,0.04,0.06,0.07];
  for(let a=1;a<=6;a++){ch3.geo[a]=new THREE.CylinderGeometry(0.011,0.02,H[a],10);ch3.geo[a].translate(0,H[a]/2,0);}
  ch3.top=[null,new THREE.SphereGeometry(0.013,8,6),new THREE.BoxGeometry(0.016,0.03,0.032),new THREE.ConeGeometry(0.013,0.032,8),new THREE.CylinderGeometry(0.019,0.017,0.016,8),new THREE.SphereGeometry(0.017,8,6),new THREE.BoxGeometry(0.012,0.036,0.012)];
  ch3.H=H;ch3.wm=S(0xefe4cd,0.4);ch3.bm=S(0x26222c,0.4);
  solid(tx-0.44,tx+0.44,tz-0.44,tz+0.44);
  things.push({x:tx,z:tz,r:1.9,text:'Play chess',fn:()=>openChess()});
}
function chSync(b){
  while(ch3.g.children.length)ch3.g.remove(ch3.g.children[0]);
  for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const a=Math.abs(p),m=p>0?ch3.wm:ch3.bm,x=ch3.x+((i&7)-3.5)*0.065,z=ch3.z+((i>>3)-3.5)*0.065;
    const base=new THREE.Mesh(ch3.geo[a],m);base.position.set(x,0.773,z);base.castShadow=true;ch3.g.add(base);
    const top=new THREE.Mesh(ch3.top[a],m);top.position.set(x,0.773+ch3.H[a]+0.008,z);ch3.g.add(top);}
}
function chRender(){
  const s=chs.s,b=s.b,dests=chs.sel>=0?chs.legal.filter(m=>m.f===chs.sel).map(m=>m.t):[];let h='';
  for(let i=0;i<64;i++){const r=i>>3,c=i&7,p=b[i],can=s.turn===1&&!chs.over&&p>0&&chs.legal.some(m=>m.f===i);
    const nm='abcdefgh'[c]+(8-r)+(p?', '+(p>0?'white ':'black ')+['','pawn','knight','bishop','rook','queen','king'][Math.abs(p)]:'');
    h+='<button type="button" class="h-sq'+((r+c)%2?' d':'')+(i===chs.sel?' sel':'')+(dests.indexOf(i)>=0?' dest':'')+(chs.last.indexOf(i)>=0?' last':'')+(can?' can':'')+'" data-i="'+i+'" aria-label="'+nm+'">'+(p?'<span class="h-cp '+(p>0?'w':'b')+'">'+CH_G[Math.abs(p)-1]+'</span>':'')+'</button>';}
  $('h-chess-board').innerHTML=h;
  $('h-chess-status').textContent=chs.over?chs.over:s.turn===1?(chInCheck(s)?'Check! Your move.':'Your move. You are white.'):'The computer is thinking.';
  const st=readJ('chess-stats');$('h-chess-rec').textContent='Wins '+(st.w||0)+'  ·  Losses '+(st.l||0)+'  ·  Draws '+(st.d||0);
  chSync(b);
}
function chNew(){chs.s=chInit();chs.legal=chLegal(chs.s);chs.sel=-1;chs.last=[];chs.over='';chRender();}
function chEnd(r,why){if(r==='w')addCoins(PAY.tableWin.chess*(chs.diff>=2?2:1),'Chess win');else if(r==='d')addCoins(PAY.tableDraw,'Chess draw');SFX.play(r==='w'?'win':r==='l'?'error':'bong',{delay:0.25});chs.over=why;const st=readJ('chess-stats');st[r]=(st[r]||0)+1;store.setItem('chess-stats',JSON.stringify(st));}
function chCommit(m){
  SFX.play(chs.s.b[m.t]?'remove':'place');
  const mover=chs.s.turn;chs.s=chMake(chs.s,m);chs.last=[m.f,m.t];chs.sel=-1;chs.legal=chLegal(chs.s);
  if(!chs.legal.length){if(chInCheck(chs.s))chEnd(mover===1?'w':'l',mover===1?'Checkmate. You win!':'Checkmate. The computer wins this one.');else chEnd('d','Stalemate. It is a draw.');}
  else if(chs.s.half>=100)chEnd('d','Draw: fifty moves without a capture or pawn move.');
  else if(chs.s.turn===-1)setTimeout(chAI,450);
  chRender();
}
function chAI(){if(!chs.s||chs.s.turn!==-1||chs.over)return;const d=CHD[chs.diff],m=chBest(chs.s,d[1],d[2]);if(m)chCommit(m);}
$('h-chess-board').addEventListener('click',e=>{
  const t=e.target.closest('.h-sq');if(!t||!chs.s||chs.s.turn!==1||chs.over)return;const i=+t.dataset.i;
  const mv=chs.sel>=0&&chs.legal.find(m=>m.f===chs.sel&&m.t===i);
  if(mv){chCommit(mv);return;}
  chs.sel=chs.s.b[i]>0&&chs.legal.some(m=>m.f===i)?i:-1;chRender();
});
function diffRow(id,list,obj,key){list.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.id=id+i;b.textContent=d[0];b.setAttribute('aria-pressed',i===obj.diff);
  b.addEventListener('click',()=>{obj.diff=i;store.setItem(key,String(i));[].forEach.call($(id).children,(c,n)=>c.setAttribute('aria-pressed',n===i));});$(id).appendChild(b);});}
diffRow('h-chess-diff',CHD,chs,'chess-diff');
function openChess(){SFX.play('open');if(!chs.s)chNew();$('h-chess').hidden=false;chRender();}
$('h-chess-new').addEventListener('click',chNew);
chSync(chInit().b);

