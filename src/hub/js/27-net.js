/* ---------- multiplayer: other people in the basement ---------- */
/* Only switches on when the page is served by server/server.js (or ?server=wss://... is given).
   Everyone in the same room code (?room=abc) sees each other walk around. No chat, just emotes. */
const EMOTES=['👋','😂','🎉','👍'];
const NET={ws:null,on:false,id:0,room:'',peers:new Map(),tries:0,look:'',bub:null,url:''};
{
  const q=new URLSearchParams(location.search),s=q.get('server')||window.BASEMENT_SERVER||'';
  NET.room=(q.get('room')||'main').toLowerCase().replace(/[^a-z0-9\-]/g,'').slice(0,16)||'main';
  if(s==='auto'){if(/^https?:$/.test(location.protocol))NET.url=(location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws';}
  else if(/^wss?:\/\//.test(s))NET.url=s;
}
function netBubble(){
  const c=document.createElement('canvas');c.width=256;c.height=96;const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,toneMapped:false,depthWrite:false,transparent:true}));sp.scale.set(0.9,0.34,1);sp.visible=false;sp.renderOrder=6;scene.add(sp);
  return {sp:sp,c:c,t:t,text:'',life:0};
}
function netSay(b,text,life){
  b.life=life;if(b.text===text)return;b.text=text;
  const g=b.c.getContext('2d');g.clearRect(0,0,256,96);if(!text)return;
  const big=text.length<=2;g.font=big?'64px sans-serif':'900 30px Nunito,sans-serif';g.textAlign='center';g.textBaseline='middle';
  const w=big?96:Math.min(248,g.measureText(text).width+36),x=128-w/2;
  g.fillStyle='rgba(255,248,231,.95)';g.strokeStyle='#1d1640';g.lineWidth=5;g.beginPath();
  const r=22,y=8,h=80;g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fill();g.stroke();
  g.fillStyle='#1d1640';g.fillText(text,128,big?52:50);b.t.needsUpdate=true;
}
function netStatusText(s){if(s.indexOf('game:')===0){const m=META.find(m=>m.id===s.slice(5));return m?'Playing '+m.name.split(' ').slice(-1)[0]:'';}return '';}
function netAddPeer(p){
  netDropPeer(p.id);
  const look={name:p.name||'Guest',species:p.av.species,color:p.av.color,hat:p.av.hat,model:p.av.model||''},m=makeAvatarModel(look);
  const mm=modelFor(look.model);if(mm&&!m.actor)GFX.preload(mm.file,()=>{const q=NET.peers.get(p.id);if(q&&!q.m.actor)netAddPeer({id:p.id,name:p.name,av:p.av,x:q.x,z:q.z,h:q.h,s:q.s});});
  m.g.position.set(p.x,floorY(p.x),p.z);m.g.rotation.y=p.h;scene.add(m.g);
  NET.peers.set(p.id,{id:p.id,m:m,x:p.x,z:p.z,h:p.h,tx:p.x,tz:p.z,th:p.h,mv:0,tmv:0,s:p.s||'',l:p.l||0,phase:0,sitY:0,bub:netBubble(),name:look.name});
  netCount();
}
function netDropPeer(id){
  const p=NET.peers.get(id);if(!p)return;
  scene.remove(p.m.g);if(p.m.actor)p.m.actor.dispose();else p.m.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});scene.remove(p.bub.sp);p.bub.t.dispose();p.bub.sp.material.dispose();
  NET.peers.delete(id);netCount();
}
function netCount(){
  const b=$('h-b-net');b.hidden=!NET.on;$('h-emotes').hidden=!NET.on;
  if(NET.on)b.textContent=(NET.peers.size?NET.peers.size+1+' here':'Just you')+' · room '+NET.room;
}
function netSend(o){if(NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify(o));}
function netLook(){return {name:av.name,av:{species:av.species,color:av.color,hat:av.hat,model:av.model||''}};}
function netConnect(){
  let ws;try{ws=new WebSocket(NET.url);}catch(e){return;}
  NET.ws=ws;
  ws.onopen=()=>{const l=netLook();NET.look=JSON.stringify(l);ws.send(JSON.stringify({t:'hello',room:NET.room,name:l.name,av:l.av}));};
  ws.onmessage=ev=>{
    let m;try{m=JSON.parse(ev.data);}catch(e){return;}
    if(m.t==='welcome'){NET.on=true;NET.id=m.id;NET.tries=0;[...NET.peers.keys()].forEach(netDropPeer);m.peers.forEach(netAddPeer);netCount();}
    else if(m.t==='join'){SFX.play('join');netAddPeer(m.p);toast((m.p.name||'A guest')+' came downstairs');}
    else if(m.t==='leave'){const p=NET.peers.get(m.id);if(p){SFX.play('leave');toast(p.name+' went upstairs');}netDropPeer(m.id);}
    else if(m.t==='av'){const p=NET.peers.get(m.id);if(p)netAddPeer({id:m.id,name:m.name,av:m.av,x:p.x,z:p.z,h:p.h,s:p.s});}
    else if(m.t==='e'){const p=NET.peers.get(m.id);if(p){bodyEmote(p.m,m.k);netSay(p.bub,EMOTES[m.k]||EMOTES[0],2.6);SFX.play('pluck',{vol:0.7,rate:1+m.k*0.12});}}
    else if(m.t==='full'){NET.tries=99;toast('That room is full');}
    else if(m.t==='s'){for(const a of m.p){const p=NET.peers.get(a[0]);if(!p)continue;p.tx=a[1];p.tz=a[2];p.th=a[3];p.tmv=a[4];p.s=a[5];p.l=a[6]||0;}}
  };
  ws.onclose=()=>{
    const was=NET.on;NET.on=false;NET.ws=null;[...NET.peers.keys()].forEach(netDropPeer);netCount();
    if(was)toast('Lost the connection, trying again');
    if(++NET.tries<=8)setTimeout(netConnect,Math.min(30000,2000*NET.tries));
  };
  ws.onerror=()=>{};
}
function netEmote(k){
  if(!NET.on)return;
  if(!NET.bub)NET.bub=netBubble();
  SFX.play('pluck',{rate:1+k*0.12});bodyEmote(avatar,k);netSay(NET.bub,EMOTES[k],2.6);netSend({t:'e',k:k});
}
/* runs on a timer, not in the frame loop, so friends still see what you are up to while you are inside a cabinet */
setInterval(()=>{
  if(!NET.on)return;
  const s=mode==='game'&&game?'game:'+game.id:mode==='sit'?'sit':'';
  netSend({t:'p',x:P.x,z:P.z,h:P.h,m:mode==='walk'?P.move:0,s:s,l:lvl});
  if(mode!=='custom'){const l=netLook(),j=JSON.stringify(l);if(j!==NET.look){NET.look=j;netSend({t:'av',name:l.name,av:l.av});}}
},100);
function netFrame(dt){
  const k=1-Math.exp(-10*dt);
  for(const p of NET.peers.values()){
    if(Math.hypot(p.tx-p.x,p.tz-p.z)>4){p.x=p.tx;p.z=p.tz;}
    p.x+=(p.tx-p.x)*k;p.z+=(p.tz-p.z)*k;
    let dh=p.th-p.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));p.h+=dh*k;
    p.mv+=(p.tmv-p.mv)*k;p.phase+=dt*9;
    const sit=p.s==='sit',a=p.m;p.sitY+=((sit?sitLift(a):0)-p.sitY)*Math.min(1,dt*10);
    const y=floorY(p.x)+(p.l?UY:0)+p.sitY;a.g.position.set(p.x,y+(a.actor?0:Math.abs(Math.sin(p.phase))*0.025*p.mv),p.z);a.g.rotation.y=p.h;
    animateBody(a,dt,p.mv,sit?'sit':'walk',tvT,p.phase);
    const b=p.bub;if(b.life>0)b.life-=dt;
    if(b.life<=0){const st=netStatusText(p.s);if(st)netSay(b,st,0.5);else b.text='';}
    b.sp.visible=b.life>0&&!!b.text;b.sp.position.set(p.x,y+2.15,p.z);
  }
  const b=NET.bub;if(b){if(b.life>0)b.life-=dt;b.sp.visible=b.life>0;b.sp.position.set(P.x,floorY(P.x)+(lvl?UY:0)+2.15,P.z);}
}
$('h-b-net').addEventListener('click',()=>{
  const link=location.origin+location.pathname+'?room='+NET.room;
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(link).then(()=>toast('Invite link copied'),()=>toast('Room code: '+NET.room));else toast('Room code: '+NET.room);
});
EMOTES.forEach((e,i)=>{const b=document.createElement('button');b.type='button';b.className='h-pill';b.textContent=e;b.setAttribute('aria-label','Emote '+(i+1));b.addEventListener('click',()=>netEmote(i));$('h-emotes').appendChild(b);});
window.addEventListener('keydown',e=>{
  if(mode!=='walk'||modal()||e.repeat||(e.target&&e.target.tagName==='INPUT'))return;
  const i=['Digit1','Digit2','Digit3','Digit4'].indexOf(e.code);if(i>=0)netEmote(i);
});
if(NET.url)netConnect();
