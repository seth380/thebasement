/* ---------- panels ---------- */
function fill(id,items,cur,cb,sw){
  const el=$(id);el.innerHTML='';
  items.forEach((it,i)=>{const b=document.createElement('button');b.type='button';b.id=id+'-'+i;b.setAttribute('aria-pressed',i===cur);
    if(sw){b.style.background='#'+it.toString(16).padStart(6,'0');b.setAttribute('aria-label','Color '+(i+1));}else b.textContent=it;
    b.addEventListener('click',()=>{[].forEach.call(el.children,(c,n)=>c.setAttribute('aria-pressed',n===i));cb(i);store.setItem('hub-avatar',JSON.stringify(av));buildAvatar();});el.appendChild(b);});
}
function openCustom(first){
  if(mode==='sit')stand();
  mode='custom';$('h-custom').hidden=false;$('h-btns').hidden=true;$('h-prompt').hidden=true;
  $('h-c-title').textContent=first?'Make your character':'Your character';$('h-c-done').textContent=first?'Enter the basement':'Done';
  $('h-name').value=av.name;
  fill('h-species',SPECIES.map(s=>s.name),av.species,i=>av.species=i);
  fill('h-colors',COLORS,COLORS.indexOf(av.color),i=>av.color=COLORS[i],true);
  fill('h-hats',HATS,av.hat,i=>av.hat=i);
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

