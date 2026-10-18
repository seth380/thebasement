/* ---------- running a game inside the basement ---------- */
let game=null;
function openGame(i){
  if(game)return;unlook();
  const m=META[i],root=document.createElement('div');root.className='h-gameroot';
  root.appendChild($('tpl-'+m.id).content.cloneNode(true));
  const leave=document.createElement('button');leave.type='button';leave.className='h-leave';leave.textContent='Leave game (Esc)';root.appendChild(leave);
  document.body.appendChild(root);
  $('h-wrap').hidden=true;
  const ctl=new AbortController(),acs=[],timeouts=new Set(),intervals=new Set(),AC=window.AudioContext||window.webkitAudioContext;
  game={root:root,ctl:ctl,acs:acs,timeouts:timeouts,intervals:intervals,dead:false,id:m.id};
  const g=game;
  /* Timers belong to this cabinet: nothing can fire into a removed game after leaving it. */
  const later=(fn,delay,...args)=>{
    if(g.dead)return null;
    const id=setTimeout(()=>{timeouts.delete(id);if(!g.dead)fn(...args);},delay);
    timeouts.add(id);return id;
  };
  const cancelLater=id=>{clearTimeout(id);timeouts.delete(id);};
  const every=(fn,delay,...args)=>{
    if(g.dead)return null;
    const id=setInterval(()=>{if(!g.dead)fn(...args);},delay);
    intervals.add(id);return id;
  };
  const cancelEvery=id=>{clearInterval(id);intervals.delete(id);};
  const win={THREE:window.THREE,devicePixelRatio:window.devicePixelRatio,matchMedia:q=>window.matchMedia(q),
    addEventListener:(t,f)=>window.addEventListener(t,f,{signal:ctl.signal}),
    AudioContext:AC?function(){const a=new AC();acs.push(a);return a;}:undefined};
  store.setItem(m.pick,String(av.species));
  /* what a game can ask of the basement: your colours, and paying out coins */
  const paint=KART_PAINTS.find(k=>k.id===store.getItem('kart-paint')&&owns(k.id));
  const api={cast:arr=>{if(arr[av.species])arr[av.species].kart=paint?paint.c:av.color;},
    coins:(n,why)=>addCoins(n,why),owns:id=>owns(id),coinsLeft:()=>coins(),
    buy:(id,price)=>{if(owns(id))return true;if(!spendCoins(price))return false;grant(id);return true;},
    onDocument:(type,listener,options)=>{
      if(g.dead)return;
      const opts=typeof options==='boolean'?{capture:options}:(options||{});
      document.addEventListener(type,listener,{...opts,signal:ctl.signal});
    }};
  coinLog=[];
  try{window.GAMES[m.id](root,api,win,f=>{if(!g.dead)requestAnimationFrame(t=>{if(!g.dead)f(t);});},store,
    later,cancelLater,every,cancelEvery);}catch(e){console.error('cabinet failed:',e&&e.stack||e);closeGame();toast('That cabinet would not start');return;}
  root.querySelectorAll('[data-exit]').forEach(b=>b.addEventListener('click',closeGame));
  leave.addEventListener('click',closeGame);
  mode='game';hubAudioQuiet();SFX.play('start');POST.free();
}
function closeGame(){
  if(!game)return;
  const g=game;game=null;g.dead=true;SFX.endGame();SFX.play('exit');
  g.ctl.abort();g.timeouts.forEach(clearTimeout);g.intervals.forEach(clearInterval);
  g.timeouts.clear();g.intervals.clear();
  try{if(document.pointerLockElement&&g.root.contains(document.pointerLockElement))document.exitPointerLock();}catch(e){}
  g.acs.forEach(a=>{try{a.close();}catch(e){}});
  const cv=g.root.querySelector('canvas');
  try{const gl=cv.getContext('webgl2')||cv.getContext('webgl');const ex=gl&&gl.getExtension('WEBGL_lose_context');if(ex)ex.loseContext();}catch(e){}
  g.root.remove();$('h-wrap').hidden=false;mode='walk';
  for(const k in keys)keys[k]=false;
  resize();refreshTrophies(true);last=performance.now();requestAnimationFrame(frame);
  /* coins won inside the cabinet, announced on the way out */
  const won=coinLog.reduce((a,c)=>a+c[0],0);coinLog=[];
  if(won>0){coinHud(won);setTimeout(()=>{toast('+'+won+' coins from '+META.find(m=>m.id===g.id).name);SFX.play('coin');for(let i=1;i<4;i++)SFX.play('coin',{delay:i*0.12,rate:1+i*0.08});},300);}
}

