/* ---------- coins and the shop catalogue ----------
   Coins are earned everywhere (games, table games, trophies, the secret chest, a daily bonus) and spent in the shop.
   Like the rest of the save they live in this browser. */
function coins(){return Math.max(0,Math.floor(+store.getItem('coins')||0));}
let coinLog=[];/* earnings while inside a cabinet, announced on the way back out */
function addCoins(n,why){
  n=Math.round(n);if(!(n>0))return;
  store.setItem('coins',coins()+n);
  if(mode==='game'){coinLog.push([n,why]);return;}
  coinHud(n);if(why)toast('+'+n+' coins · '+why);SFX.play('coin');
}
function spendCoins(n){if(coins()<n)return false;store.setItem('coins',coins()-n);coinHud(-n);return true;}
function ownedSet(){try{return new Set(JSON.parse(store.getItem('owned'))||[]);}catch(e){return new Set();}}
function owns(id){return ownedSet().has(id);}
function grant(id){const s=ownedSet();s.add(id);store.setItem('owned',JSON.stringify([...s]));}

/* every hat, by number (the number is what is saved). shop: price; secret: unlocked by the cave chest */
const HAT_DEFS=[{n:'None'},{n:'Cap'},{n:'Beanie'},{n:'Crown',price:300},{n:'Party hat',price:120},{n:'Explorer hat',secret:true},
  {n:'Cowboy hat',price:200},{n:'Viking helmet',price:400},{n:'Headphones',price:150}];
const hatOwned=i=>{const h=HAT_DEFS[i];return !!h&&(h.secret?!!store.getItem('secret-chest'):!h.price||owns('hat-'+i));};
/* outfit colours: the first nine are free, the rest are in the shop */
const SHOP_COLORS=[{n:'Gold',c:0xd9a520,price:250},{n:'Mint',c:0x7fe0c0,price:120},{n:'Lava',c:0xff3d1f,price:150},{n:'Snow',c:0xf2f4f7,price:100},{n:'Midnight',c:0x152a5c,price:120}];
/* kart paint: overrides your outfit colour on your kart, jet ski and plane */
const KART_PAINTS=[{id:'kp-gold',n:'Gold rush',c:0xffc928,price:300},{id:'kp-chrome',n:'Chrome',c:0xc9d3dc,price:250},{id:'kp-neon',n:'Neon green',c:0x39ff6a,price:150},
  {id:'kp-candy',n:'Candy pink',c:0xff6fb5,price:200},{id:'kp-midnight',n:'Midnight',c:0x1b1f4a,price:150},{id:'kp-lava',n:'Lava',c:0xff4b1a,price:200}];
/* model characters: people are free; monsters and animals are unlocked with coins */
const charPrice=m=>m.group==='monsters'?(m.name==='Yeti'?300:150):m.group==='animals'?250:0;
const charOwned=m=>!charPrice(m)||owns('char-'+m.id);
/* what each thing pays */
const PAY={trophy:[50,100,200],daily:25,chest:100,tableWin:{chk:25,chess:40,foos:25,pool:25},tableDraw:8};

/* once a day, the first visit pays a little */
function dailyBonus(){const d=new Date().toISOString().slice(0,10);if(store.getItem('daily')===d)return;store.setItem('daily',d);
  setTimeout(()=>addCoins(PAY.daily,'Daily bonus'),2500);}
