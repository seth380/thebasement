/* ---------- saved data (shared with the three games) ---------- */
let mem={};try{mem=JSON.parse(localStorage.getItem('basement-v1'))||{};}catch(e){mem={};}
const store={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{mem[k]=String(v);try{localStorage.setItem('basement-v1',JSON.stringify(mem));}catch(e){}}};
const readJ=k=>{try{return JSON.parse(store.getItem(k))||{};}catch(e){return {};}};
const firstRun=!store.getItem('hub-avatar');
const av=Object.assign({name:'',species:0,color:0xff7a1a,hat:0},readJ('hub-avatar'));
const SPECIES=[{name:'Bear',kind:'bear',head:0xb5733c},{name:'Cat',kind:'cat',head:0x9aa3b5},{name:'Bunny',kind:'bunny',head:0xf4efe6},{name:'Frog',kind:'frog',head:0x7ddc4a}];
const COLORS=[0xff7a1a,0x7b5cff,0xff5fa2,0x1fc46b,0x2f9bff,0xff4d6d,0xffc928,0x1fb5a8,0x2a2540];
const HATS=['None','Cap','Beanie','Crown','Party hat'];
const META=[
  {id:'kart',name:'Turbo Meadow Kart',c1:'#2f9bff',c2:'#6fd44b',hex:0x2fd08a,key:'tmk-best',pick:'tmk-racer'},
  {id:'skate',name:'Sundown Skate Park',c1:'#3b63d9',c2:'#ff9e7a',hex:0x6c4bd8,key:'ssp-best',pick:'ssp-skater'},
  {id:'range',name:'Copper Canyon Range',c1:'#27b3c9',c2:'#e08a4f',hex:0xffc928,key:'ccr-best',pick:'ccr-cast'},
  {id:'waterfare',name:'Modern Waterfare',c1:'#16323f',c2:'#3fd8ff',hex:0x3d8f9a,key:'mwf-best',pick:'mwf-cast'},
  {id:'isle',name:'Fogbound Isle',c1:'#587d86',c2:'#c9a15a',hex:0x7a6a4a,key:'isle-save',pick:'isle-cast'}
];
const fmtT=t=>{const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(2);};
const num=n=>Math.round(n).toLocaleString('en-US');
function trophyState(){
  const k=readJ('tmk-best').ev||{},ids=['meadow','pine','lagoon','sky'],done=ids.filter(i=>k[i]&&k[i].total).length,wins=ids.filter(i=>k[i]&&k[i].place===1).length;
  const s=readJ('ssp-best').score||0,r=readJ('ccr-best').score||0,mw=readJ('mwf-best'),mww=mw.wins||[0,0,0],mwn=mww[0]+mww[1]+mww[2],isl=readJ('isle-save'),isn=[isl.power,isl.pillars,isl.crystal||isl.lens,isl.vault,isl.beacon].filter(Boolean).length;
  return [
    {rec:done?'Races won '+wins+' of 4':'No race finished yet',t:[[done>0,'Finish any race'],[wins>0,'Win any race'],[wins===4,'Win all four races']]},
    {rec:s?'High score '+num(s):'No run yet',t:[[s>=3000,'Score 3,000'],[s>=8000,'Score 8,000'],[s>=15000,'Score 15,000']]},
    {rec:r?'High score '+num(r):'No round yet',t:[[r>=3000,'Score 3,000'],[r>=7000,'Score 7,000'],[r>=12000,'Score 12,000']]},
    {rec:mwn?'Wins '+mwn:'No match won yet',t:[[mwn>0,'Win a match'],[!!mw.ten,'Win on Regular or Veteran with 10 soaks'],[mww[2]>0,'Win on Veteran']]},
    {rec:isn?isn+' of 5 mechanisms solved':'Not explored yet',t:[[!!isl.power,'Wake the generator'],[!!isl.vault,'Open the temple vault'],[!!isl.beacon,'Light the beacon']]}
  ];
}

