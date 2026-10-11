/* ---------- shared sound ----------
   SFX.play('coin') plays a recorded sample from assets/audio when the page has them
   (window.BASEMENT_ASSETS is set), and falls back to a small synthesized blip when it does not.
   Loops and noise beds return a handle: h.vol(0..1), h.rate(x), h.stop().
   Pass {game:true} from inside a cabinet so the sound stops when the player leaves the game. */
window.SFX=(function(){
  const FILES='bong break click click2 close coin confirm drop drop2 engine error exit fall glass goal hop impact join jump_a jump_b jump_c land leave open place_a place_b place_c place_d pluck remove_a remove_b scrape select skid start steps switch tick tile_land tile_match tile_swap toggle weapon win'.split(' ');
  const VARIANTS={jump:['jump_a','jump_b','jump_c'],place:['place_a','place_b','place_c','place_d'],remove:['remove_a','remove_b']};
  /* the packs are recorded at very different levels; these even them out */
  const GAIN={steps:6,land:5,coin:2.4,jump_a:2.2,jump_b:2.2,jump_c:2,weapon:1.6,hop:1.5,engine:0.55,skid:1.3,impact:0.9,fall:0.8,break:0.8,click:0.9,tick:0.8};
  /* [start Hz, end Hz, seconds, wave] used when there is no sample */
  const BLIP={click:[900,700,0.04,'square'],click2:[700,600,0.04,'square'],tick:[1200,1000,0.03,'square'],select:[660,880,0.07,'triangle'],toggle:[520,660,0.06,'triangle'],open:[440,660,0.1,'triangle'],close:[660,440,0.1,'triangle'],
    confirm:[660,990,0.16,'triangle'],win:[784,1568,0.3,'triangle'],goal:[523,1046,0.3,'triangle'],error:[220,160,0.2,'sawtooth'],coin:[1320,1980,0.12,'square'],start:[330,880,0.25,'triangle'],exit:[880,330,0.25,'triangle'],
    join:[520,780,0.18,'sine'],leave:[780,520,0.18,'sine'],pluck:[700,500,0.1,'triangle'],drop:[300,180,0.1,'sine'],drop2:[240,140,0.12,'sine'],place:[420,300,0.05,'square'],remove:[300,200,0.09,'square'],glass:[1500,1800,0.08,'sine'],
    tile_match:[880,1320,0.1,'triangle'],tile_land:[330,260,0.05,'square'],tile_swap:[500,620,0.05,'square'],impact:[160,70,0.14,'sawtooth'],hop:[380,620,0.1,'square'],jump:[380,620,0.1,'square'],bong:[330,320,0.3,'sine'],switch:[500,400,0.05,'square'],weapon:[600,900,0.07,'square']};
  let ac=null,master=null,gameBus=null,noiseBuf=null,muted=false,started=false;
  const buf={},gameLoops=new Set();
  try{muted=localStorage.getItem('basement-mute')==='1';}catch(e){}

  function ctx(){
    if(ac)return ac;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    try{ac=new AC();}catch(e){return null;}
    master=ac.createGain();master.gain.value=muted?0:1;master.connect(ac.destination);
    gameBus=ac.createGain();gameBus.connect(master);
    load();return ac;
  }
  function load(){
    const base=window.BASEMENT_ASSETS;if(!base||started)return;started=true;
    FILES.forEach(n=>{
      fetch(base+'audio/'+n+'.mp3').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(a=>new Promise((ok,no)=>ac.decodeAudioData(a,ok,no))).then(b=>{buf[n]=b;}).catch(()=>{});
    });
  }
  function unlock(){const a=ctx();if(a&&a.state==='suspended')a.resume().catch(()=>{});}
  ['pointerdown','keydown','touchend'].forEach(t=>window.addEventListener(t,unlock,{capture:true,passive:true}));
  document.addEventListener('visibilitychange',()=>{if(!ac)return;if(document.hidden)ac.suspend().catch(()=>{});else ac.resume().catch(()=>{});});

  const pick=n=>{const v=VARIANTS[n];return v?v[Math.floor(Math.random()*v.length)]:n;};
  const out=o=>(o&&o.game)?gameBus:master;
  function blip(f0,f1,dur,type,vol,o){
    const a=ctx();if(!a||a.state!=='running')return;
    try{const os=a.createOscillator(),g=a.createGain(),t=a.currentTime+((o&&o.delay)||0);os.type=type||'square';os.frequency.setValueAtTime(f0,t);os.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol),t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);os.connect(g);g.connect(out(o));os.start(t);os.stop(t+dur+0.02);}catch(e){}
  }
  function noiseBuffer(){
    if(noiseBuf)return noiseBuf;const n=ac.sampleRate*2;noiseBuf=ac.createBuffer(1,n,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return noiseBuf;
  }
  /* a burst of filtered noise that sweeps from f0 to f1: splashes, squirts, whooshes */
  function burst(f0,f1,dur,vol,o){
    const a=ctx();if(!a||a.state!=='running')return;
    try{const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime+((o&&o.delay)||0);s.buffer=noiseBuffer();s.loop=true;f.type=(o&&o.type)||'bandpass';f.Q.value=(o&&o.q)||1.2;
      f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol),t+Math.min(0.03,dur*0.3));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      s.connect(f);f.connect(g);g.connect(out(o));s.start(t,Math.random());s.stop(t+dur+0.03);}catch(e){}
  }
  function play(name,o){
    const a=ctx();if(!a||a.state!=='running')return;
    o=o||{};const n=pick(name),b=buf[n],vol=o.vol===undefined?1:o.vol;
    if(!b){const k=BLIP[name]||BLIP[n];if(k)blip(k[0]*(o.rate||1),k[1]*(o.rate||1),k[2],k[3],0.07*vol,o);return;}
    try{const s=a.createBufferSource(),g=a.createGain();s.buffer=b;s.playbackRate.value=(o.rate||1)*(o.jitter?1+(Math.random()-0.5)*o.jitter:1);g.gain.value=vol*(GAIN[n]||1);s.connect(g);g.connect(out(o));s.start(a.currentTime+(o.delay||0));}catch(e){}
  }
  function handle(o,make){
    /* starts as soon as the sound system is running and the sample has arrived, so it is safe to create early */
    const h={s:null,g:null,f:null,v:(o&&o.vol)||0,r:(o&&o.rate)||1,dead:false,
      vol(v){h.v=v;if(!h.s)tryStart();if(h.g)h.g.gain.setTargetAtTime(v*h.k,ac.currentTime,0.06);},
      rate(r){h.r=r;if(h.s&&h.s.playbackRate)h.s.playbackRate.setTargetAtTime(r,ac.currentTime,0.06);},
      freq(x){if(h.f)h.f.frequency.setTargetAtTime(x,ac.currentTime,0.08);},
      stop(){h.dead=true;gameLoops.delete(h);if(h.s){try{h.s.stop();}catch(e){}h.s=null;}},k:1};
    function tryStart(){if(h.dead||h.s)return;const a=ctx();if(!a||a.state!=='running')return;try{make(h,a);}catch(e){h.s=null;}}
    if(o&&o.game)gameLoops.add(h);
    tryStart();return h;
  }
  function loop(name,o){
    return handle(o,(h,a)=>{const b=buf[name];if(!b)return;const s=a.createBufferSource(),g=a.createGain();s.buffer=b;s.loop=true;
      /* mp3 adds a little silence at both ends; skip it so the loop does not click */
      s.loopStart=0.06;s.loopEnd=Math.max(0.1,b.duration-0.06);s.playbackRate.value=h.r;h.k=GAIN[name]||1;g.gain.value=h.v*h.k;s.connect(g);g.connect(out(o));s.start(0,0.06);h.s=s;h.g=g;});
  }
  function noiseLoop(o){
    return handle(o,(h,a)=>{const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=noiseBuffer();s.loop=true;f.type=o.type||'lowpass';f.frequency.value=o.freq||800;f.Q.value=o.q||0.7;
      g.gain.value=h.v;s.connect(f);f.connect(g);g.connect(out(o));s.start(0,Math.random());h.s=s;h.g=g;h.f=f;});
  }
  return {play:play,blip:blip,burst:burst,loop:loop,noiseLoop:noiseLoop,unlock:unlock,
    get muted(){return muted;},
    mute(m){muted=!!m;try{localStorage.setItem('basement-mute',muted?'1':'0');}catch(e){}if(master)master.gain.value=muted?0:1;},
    gameMute(m){if(gameBus)gameBus.gain.value=m?0:1;},
    endGame(){[...gameLoops].forEach(h=>h.stop());if(gameBus)gameBus.gain.value=1;},
    get ready(){return !!(ac&&ac.state==='running');},has:n=>!!buf[n]};
})();
