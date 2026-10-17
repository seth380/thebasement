/* ---------- levels: the basement, upstairs, the hero cave and the star deck ----------
   Only one is drawn at a time. Each lives in its own group at its own height, has bounds to walk in, a way of keeping the camera
   inside, a spot to arrive at, and (except upstairs, which has the stairs) a lift or teleporter that travels between all of them.
   The one marked home is where you start. */
const rectIn=(x0,x1,z0,z1)=>(v,m)=>{v.x=Math.max(x0+m,Math.min(x1-m,v.x));v.z=Math.max(z0+m,Math.min(z1-m,v.z));};
const ellipseIn=(A,B)=>(v,m)=>{const d=Math.hypot(v.x/(A-m),v.z/(B-m));if(d>1){v.x/=d;v.z/=d;}};
const LV=[
  {name:'Basement Arcade',icon:'🕹️',about:'The arcade, pool, foosball, the aquarium and a secret',y:0,g:null,sky:true,arrive:[9.7,-3.6,-Math.PI/2]},
  {name:'Upstairs',icon:'🏠',about:'Kitchen, living room and bedroom',y:UY,g:U,sky:true,ceil:UH,arrive:[8.7,6.6,-2.36],
    walk:rectIn(-RX,RX,-RZ,RZ),cam:v=>{const R=uRoom(P.x,P.z);rectIn(R.x0,R.x1,R.z0,R.z1)(v,0.3);},hello:'Upstairs! A kitchen, a living room and a bedroom'},
  {name:'Hero Cave',icon:'🦇',about:'A hero car, suits, a super computer and bats',y:CAVE_Y,g:CG,sky:false,ceil:6,arrive:[-2.5,-7.7,0],
    walk:ellipseIn(14,10),cam:v=>ellipseIn(14,10)(v,0.8),hello:'The Hero Cave! Watch out for bats'},
  {name:'Star Deck',icon:'🚀',about:'A spaceship with a hyperdrive, a hover-bot and snacks',y:DECK_Y,g:SG,sky:false,ceil:3.6,arrive:[-6.9,-4.3,Math.PI/2],
    walk:rectIn(-11,11,-7,7),cam:v=>rectIn(-11,11,-7,7)(v,0.3),hello:'Welcome aboard the Star Deck!'}
];
const lvY=n=>(LV[n]||LV[0]).y;
const fadeEl=document.createElement('div');fadeEl.style.cssText='position:absolute;inset:0;background:#0b0816;opacity:0;pointer-events:none;transition:opacity .35s ease';$('h-view').after(fadeEl);
const lvHidden=[];
/* show one level: everything that belongs to the basement (the scene's own children) is hidden for any other level, and the other levels' groups are hidden.
   That also stops one level's lights from leaking into another, and the hidden ones cost nothing to draw */
function setLevel(n){
  lvHidden.forEach(o=>o.visible=true);lvHidden.length=0;
  lvl=n;const L=LV[n];LV.forEach(q=>{if(q.g)q.g.visible=q===L;});
  if(n){
    const keep=new Set([avatar.g]);LV.forEach(q=>{if(q.g)keep.add(q.g);});if(L.sky){keep.add(sun);keep.add(moon);}
    NET.peers.forEach(p=>{keep.add(p.m.g);keep.add(p.bub.sp);});if(NET.bub)keep.add(NET.bub.sp);
    scene.children.forEach(o=>{if(keep.has(o)||(L.sky&&o.isPoints&&o.material===starM)||!o.visible)return;o.visible=false;lvHidden.push(o);});
  }
  if(DK.hum&&n!==3)DK.hum.vol(0);
  const tag=document.querySelector('#h-tag b');if(tag)tag.textContent=L.name;
}
function goLevel(n,x,z,h,snd){
  if(UP.busy||mode!=='walk')return;UP.busy=true;
  SFX.play(snd||'steps',{vol:0.9,rate:1.1});fadeEl.style.opacity='1';
  setTimeout(()=>{setLevel(n);P.x=x;P.z=z;P.h=h;P.move=0;camSnap=true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{fadeEl.style.opacity='0';UP.busy=false;}));
    const k='seen-lv'+n;if(LV[n].hello&&!store.getItem(k)&&!(n===1&&store.getItem('up-seen'))){store.setItem(k,'1');setTimeout(()=>toast(LV[n].hello),400);}},380);
}
function travel(n){const a=LV[n].arrive;goLevel(n,a[0],a[1],a[2],n>=2?'start':'steps');}
function homeBase(){const n=parseInt(store.getItem('home-base'),10);return n>=0&&n<LV.length?n:0;}
/* where you wake up: called once at start */
function goHome(){const n=homeBase();if(!n)return;setLevel(n);const a=LV[n].arrive;P.x=a[0];P.z=a[1];P.h=a[2];camSnap=true;}

/* ---- the travel panel ---- */
let liftFrom=null;
function openLift(from){liftFrom=from||null;if(from)from.t=1.6;renderLift();$('h-lift').hidden=false;SFX.play('open');}
function renderLift(){
  const home=homeBase(),list=$('h-lift-list');list.innerHTML='';
  LV.forEach((L,i)=>{
    const row=document.createElement('div');row.className='h-item'+(i===lvl?' h-on':'');
    row.innerHTML='<span class="h-ico" aria-hidden="true">'+L.icon+'</span><div><b>'+L.name+(i===home?' <em class="h-home">★ home</em>':'')+'</b><small>'+L.about+'</small></div>';
    const hb=document.createElement('button');hb.type='button';hb.className='h-buy h-star';hb.textContent=i===home?'★':'☆';
    hb.title=i===home?'This is your home base: you start here':'Make this your home base';hb.setAttribute('aria-label',hb.title);
    hb.addEventListener('click',()=>{store.setItem('home-base',String(i));SFX.play('select');toast(L.name+' is your home base now');renderLift();});
    const go=document.createElement('button');go.type='button';go.className='h-buy';go.textContent=i===lvl?'You are here':'Go';go.disabled=i===lvl;
    go.addEventListener('click',()=>{$('h-lift').hidden=true;if(liftFrom)liftFrom.t=1.2;travel(i);});
    row.appendChild(hb);row.appendChild(go);list.appendChild(row);
  });
}
$('h-lift-close').addEventListener('click',()=>{$('h-lift').hidden=true;SFX.play('close');});

/* ---- a lift in the basement too, on the east wall between the fridge and the dresser ---- */
{const L=liftDoors(scene,10.9,-3.6,-Math.PI/2,{frame:0x4a2f1c});things.push({x:10.05,z:-3.6,r:1.1,text:'Take the lift',fn:()=>openLift(L)});}

function lvTick(dt,t){
  upTick(dt,t);caveTick(dt,t);deckTick(dt,t);liftTick(dt);
}
