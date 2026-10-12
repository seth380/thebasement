/* ---------- sound in the basement ---------- */
/* Samples and the synth live in src/shared/sfx.js. This file is the room's own soundscape and the button clicks. */
const AUD={steps:null,fall:null,bubT:0,cabT:0,poolT:0};
function hubAudioQuiet(){if(AUD.steps)AUD.steps.vol(0);if(AUD.fall)AUD.fall.vol(0);}
function hubAudioTick(dt){
  if(!SFX.ready)return;
  if(!AUD.steps){AUD.steps=SFX.loop('steps',{vol:0});AUD.fall=SFX.noiseLoop({type:'lowpass',freq:1500,q:0.4,vol:0});}
  AUD.steps.vol(mode==='walk'?P.move*0.5:0);AUD.steps.rate(1.15);
  /* the waterfall: loud in the cave, a murmur on the stairs, nothing upstairs unless the bookcase is open */
  const dw=Math.hypot(P.x-(CAVE.x-5.6),P.z-CAVE.z),inCave=P.x<-11;
  AUD.fall.vol(inCave?Math.max(0.03,0.34*Math.min(1,5/Math.max(2.5,dw))):(sec.open&&Math.hypot(P.x+11,P.z+6.5)<3.5?0.02:0));
  AUD.fall.freq(inCave?900+1400*Math.min(1,4/Math.max(2,dw)):500);
  if(mode!=='walk'||lvl)return;
  /* aquarium bubbles */
  AUD.bubT-=dt;const da=Math.hypot(P.x+8.6,P.z+6.75);
  if(AUD.bubT<=0&&da<3.4){AUD.bubT=0.12+Math.random()*0.7;const f=500+Math.random()*700;SFX.blip(f,f*1.7,0.06,'sine',0.035*(1-da/3.4));}
  /* cabinets chirp to themselves when you walk past */
  AUD.cabT-=dt;
  if(AUD.cabT<=0&&P.z<-4.6&&Math.abs(P.x)<5.6){AUD.cabT=0.5+Math.random()*1.6;const n=[262,330,392,523,659][Math.floor(Math.random()*5)];SFX.blip(n,n,0.09,'square',0.012);SFX.blip(n*1.5,n*1.5,0.09,'square',0.01,{delay:0.1});}
}
/* every button in the basement clicks */
$('h-wrap').addEventListener('click',e=>{
  const b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b||b.id==='h-prompt')return;
  SFX.play(b.closest('.h-opts')||b.closest('#h-emotes')?'select':b.hasAttribute('data-close')||/leave|done/.test(b.id)?'close':'click');
},true);
$('h-b-snd').textContent=SFX.muted?'Sound off':'Sound on';
$('h-b-snd').addEventListener('click',()=>{SFX.mute(!SFX.muted);$('h-b-snd').textContent=SFX.muted?'Sound off':'Sound on';});
