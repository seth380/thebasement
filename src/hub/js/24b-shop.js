/* ---------- the shop ----------
   Tabs of things to buy with coins. Buying takes two taps ("Buy for 150?" then confirm) so nothing is bought by accident.
   Owned things can be put on straight from here. */
let shopTab='chars',shopArm=null;
function coinHud(delta){
  $('h-coins').textContent=coins().toLocaleString('en-US');
  if(delta){const b=$('h-coinbox');b.classList.remove('h-bump');void b.offsetWidth;b.classList.add('h-bump');}
}
function shopItems(tab){
  if(tab==='chars')return MODEL_CHARS.filter(m=>charPrice(m)).map(m=>({id:'char-'+m.id,name:m.name,sub:m.group==='animals'?'Animal':'Monster',price:charPrice(m),
    owned:charOwned(m),on:av.model===m.id,use:()=>{av.model=m.id;}}));
  if(tab==='hats')return HAT_DEFS.map((h,i)=>({i:i,h:h})).filter(q=>q.h.price||q.h.secret).map(q=>({id:'hat-'+q.i,name:q.h.n,sub:q.h.secret?'Hidden somewhere in the basement':'',price:q.h.price||0,
    owned:hatOwned(q.i),locked:q.h.secret&&!hatOwned(q.i),on:av.hat===q.i,use:()=>{av.hat=q.i;}}));
  if(tab==='colors')return SHOP_COLORS.map(c=>({id:'col-'+c.n.toLowerCase(),name:c.n,sw:c.c,price:c.price,owned:owns('col-'+c.n.toLowerCase()),on:av.color===c.c,use:()=>{av.color=c.c;}}));
  if(tab==='kart')return KART_PAINTS.map(k=>({id:k.id,name:k.n,sw:k.c,sub:'Kart, jet ski and plane',price:k.price,owned:owns(k.id),on:store.getItem('kart-paint')===k.id,
    use:()=>{store.setItem('kart-paint',store.getItem('kart-paint')===k.id?'':k.id);}}));
  return [];
}
const SHOP_TABS=[['chars','Characters'],['hats','Hats'],['colors','Colours'],['kart','Kart paint']];
function renderShop(){
  $('h-shop-bal').textContent=coins().toLocaleString('en-US');
  const tabs=$('h-shop-tabs');tabs.innerHTML='';
  SHOP_TABS.forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t[1];b.setAttribute('role','tab');b.setAttribute('aria-selected',t[0]===shopTab);
    b.addEventListener('click',()=>{shopTab=t[0];shopArm=null;renderShop();});tabs.appendChild(b);});
  const list=$('h-shop-list');list.innerHTML='';
  const items=shopItems(shopTab);
  if(!items.length){list.innerHTML='<p class="h-empty">Nothing here yet.</p>';return;}
  items.forEach(it=>{
    const row=document.createElement('div');row.className='h-item'+(it.on?' h-on':'');
    const sw=it.sw!==undefined?'<i style="background:#'+it.sw.toString(16).padStart(6,'0')+'"></i>':'';
    row.innerHTML=sw+'<div><b>'+it.name+'</b>'+(it.sub?'<small>'+it.sub+'</small>':'')+'</div>';
    const b=document.createElement('button');b.type='button';b.className='h-buy';
    if(it.owned){b.textContent=it.on?(shopTab==='kart'?'Using · tap to remove':'Wearing'):'Use';b.disabled=it.on&&shopTab!=='kart';
      b.addEventListener('click',()=>{it.use();store.setItem('hub-avatar',JSON.stringify(av));buildAvatar();SFX.play('select');renderShop();});}
    else if(it.locked){b.textContent='Find it';b.disabled=true;}
    else if(shopArm===it.id){b.textContent='Buy for '+it.price+'?';b.className='h-buy h-sure';
      b.addEventListener('click',()=>{if(!spendCoins(it.price)){toast('Not enough coins yet');return;}grant(it.id);it.use();store.setItem('hub-avatar',JSON.stringify(av));buildAvatar();
        shopArm=null;SFX.play('win');toast(it.name+' is yours!');renderShop();});}
    else{const short=it.price-coins();b.textContent='🪙 '+it.price;if(short>0)b.title='You need '+short+' more coins';
      b.addEventListener('click',()=>{if(coins()<it.price){toast('You need '+(it.price-coins())+' more coins for '+it.name);SFX.play('error');return;}shopArm=it.id;renderShop();});}
    row.appendChild(b);list.appendChild(row);
  });
}
function openShop(tab){if(tab)shopTab=tab;shopArm=null;renderShop();$('h-shop').hidden=false;SFX.play('open');}
$('h-b-shop').addEventListener('click',()=>openShop());
$('h-shop-close').addEventListener('click',()=>{$('h-shop').hidden=true;});
coinHud();dailyBonus();
/* coins someone had before the shop existed: anything they were already wearing stays theirs */
{const m=modelFor(av.model);if(m&&charPrice(m)&&!owns('char-'+m.id))grant('char-'+m.id);
 if(HAT_DEFS[av.hat]&&HAT_DEFS[av.hat].price&&!owns('hat-'+av.hat))grant('hat-'+av.hat);}
