/* ---------- panels ---------- */
function fill(id,items,cur,cb,sw){
  const el=$(id);el.innerHTML='';
  items.forEach((it,i)=>{const b=document.createElement('button');b.type='button';b.id=id+'-'+i;b.setAttribute('aria-pressed',i===cur);
    if(sw){b.style.background='#'+it.toString(16).padStart(6,'0');b.setAttribute('aria-label','Color '+(i+1));}else b.textContent=it;
    b.addEventListener('click',()=>{[].forEach.call(el.children,(c,n)=>c.setAttribute('aria-pressed',n===i));cb(i);store.setItem('hub-avatar',JSON.stringify(av));buildAvatar();});el.appendChild(b);});
}
/* the character row: tabs for each group (the classic animals, then each folder of models), one group's choices shown at a time.
   Picking a classic animal clears the model. The minigames always use your classic animal. */
const GROUP_NAMES={'':'More','modular-men':'People',monsters:'Monsters',animals:'Animals'};
let charTab=null;
function charPicker(){
  const el=$('h-species');el.innerHTML='';
  const groups=[{key:'classic',name:'Classic',items:SPECIES.map((s,i)=>({name:s.name,on:!av.model&&av.species===i,pick:()=>{av.species=i;av.model='';}}))}];
  MODEL_CHARS.forEach(m=>{const k=m.group||'';let g=groups.find(q=>q.key===k);if(!g){g={key:k,name:GROUP_NAMES[k]||k.replace(/[-_]/g,' ').replace(/^./,c=>c.toUpperCase()),items:[]};groups.push(g);}
    g.items.push({name:m.name,on:av.model===m.id,price:charOwned(m)?0:charPrice(m),pick:()=>{if(!charOwned(m)){closeCustom();openShop('chars');return false;}av.model=m.id;}});});
  const ORDER=['classic','modular-men','monsters','animals'];groups.sort((a,b)=>(ORDER.indexOf(a.key)+1||99)-(ORDER.indexOf(b.key)+1||99));
  if(!charTab)charTab=(groups.find(g=>g.items.some(i=>i.on))||groups[0]).key;
  if(groups.length>1){
    const tabs=document.createElement('div');tabs.className='h-tabs';tabs.setAttribute('role','tablist');
    groups.forEach(g=>{const t=document.createElement('button');t.type='button';t.textContent=g.name;t.setAttribute('role','tab');t.setAttribute('aria-selected',g.key===charTab);
      t.addEventListener('click',()=>{charTab=g.key;charPicker();});tabs.appendChild(t);});
    el.appendChild(tabs);}
  const box=document.createElement('div');box.className='h-opts';el.appendChild(box);
  const g=groups.find(q=>q.key===charTab)||groups[0];
  g.items.forEach((it,i)=>{const b=document.createElement('button');b.type='button';b.textContent=it.price?'🔒 '+it.name+' · '+it.price:it.name;b.setAttribute('aria-pressed',it.on);
    if(it.price)b.style.opacity='0.7';
    b.addEventListener('click',()=>{if(it.pick()===false)return;store.setItem('hub-avatar',JSON.stringify(av));buildAvatar();charPicker();});box.appendChild(b);});
}
function openCustom(first){
  if(mode==='sit')stand();
  mode='custom';$('h-custom').hidden=false;$('h-btns').hidden=true;$('h-prompt').hidden=true;
  $('h-c-title').textContent=first?'Make your character':'Your character';$('h-c-done').textContent=first?'Enter the basement':'Done';
  $('h-name').value=av.name;
  charPicker();
  const cols=COLORS.concat(SHOP_COLORS.filter(c=>owns('col-'+c.n.toLowerCase())).map(c=>c.c));
  fill('h-colors',cols,cols.indexOf(av.color),i=>av.color=cols[i],true);
  const hats=HAT_DEFS.map((h,i)=>i).filter(hatOwned);
  fill('h-hats',hats.map(i=>HAT_DEFS[i].n).concat(['More in the shop']),hats.indexOf(av.hat),i=>{if(i>=hats.length){closeCustom();openShop('hats');return;}av.hat=hats[i];});
}
function closeCustom(){store.setItem('hub-avatar',JSON.stringify(av));$('h-custom').hidden=true;$('h-btns').hidden=false;mode='walk';}
$('h-name').addEventListener('input',e=>{av.name=e.target.value.trim().slice(0,12);buildAvatar();});
$('h-c-done').addEventListener('click',closeCustom);
$('h-b-look').addEventListener('click',()=>openCustom());
function openTrophies(){SFX.play('open');refreshTrophies();$('h-troph').hidden=false;}
$('h-b-troph').addEventListener('click',openTrophies);
$('h-t-close').addEventListener('click',()=>closeOvers());
function sit(){SFX.play('drop2');mode='sit';P.x=-6.62;P.z=2;P.h=-Math.PI/2;}
function stand(){mode='walk';P.x=-7.35;P.z=2;}

