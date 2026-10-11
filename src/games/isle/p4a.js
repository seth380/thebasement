/* ---------- sound ---------- */
let ac=null,master,nbuf,windG,seaG,humG;
function initAudio(){
  if(ac){if(ac.state==='suspended')ac.resume();return;}
  try{ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=0.9;master.connect(ac.destination);
    nbuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const loop=(type,f,q)=>{const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=nbuf;s.loop=true;fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(master);s.start();return g;};
    windG=loop('lowpass',320,0.4);seaG=loop('bandpass',700,0.5);
    const o=ac.createOscillator(),o2=ac.createOscillator();humG=ac.createGain();humG.gain.value=0;o.type='sawtooth';o.frequency.value=55;o2.type='sine';o2.frequency.value=110.6;const lf=ac.createBiquadFilter();lf.type='lowpass';lf.frequency.value=260;o.connect(lf);o2.connect(lf);lf.connect(humG);humG.connect(master);o.start();o2.start();
  }catch(e){ac=null;}
}
function tone(a,b,dur,vol,type,delay){if(!ac)return;try{const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+(delay||0);o.type=type||'sine';o.frequency.setValueAtTime(a,t);o.frequency.exponentialRampToValueAtTime(b,t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.05);}catch(e){}}
function rumble(f,dur,vol){if(!ac)return;try{const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain(),t=ac.currentTime;s.buffer=nbuf;fl.type='lowpass';fl.frequency.value=f;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(master);s.start(t);s.stop(t+dur);}catch(e){}}
const sfx={click:()=>tone(900,500,0.06,0.08,'square'),stone:()=>rumble(190,0.9,0.5),chime:()=>[523,659,784,1047].forEach((f,i)=>tone(f,f,1.2,0.07,'sine',i*0.16)),wrong:()=>tone(160,110,0.4,0.1,'sawtooth'),
  page:()=>rumble(2600,0.18,0.12),take:()=>{tone(880,1320,0.25,0.07,'triangle');},horn:()=>{tone(98,92,3.2,0.16,'sawtooth');tone(147,138,3.2,0.1,'sawtooth');}};

/* ---------- notes and journal ---------- */
function mapURL(){const c=document.createElement('canvas');c.width=640;c.height=560;const g=c.getContext('2d');g.fillStyle='#e6d6b0';g.fillRect(0,0,640,560);
  g.strokeStyle='#4a3a22';g.fillStyle='#d2c08f';g.lineWidth=3;g.beginPath();for(let a=0;a<=6.3;a+=0.1){const r=55+fbm(Math.cos(a)*55*0.035+7,Math.sin(a)*55*0.035+3)*16,x=320+Math.cos(a)*r*4.1,y=285+Math.sin(a)*r*4.1;a?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fill();g.stroke();
  const P=(x,z)=>[320+x*4.1,285+z*4.1];g.fillStyle='#4a3a22';g.font='italic 22px Georgia,serif';g.textAlign='center';
  [[0,50,'wreck'],[-44,8,'boat shed'],[0,-8,'the watchers'],[0,-29,'old door'],[40,0,'glass house'],[38,38,'the light']].forEach(s=>{const p=P(s[0],s[1]);g.beginPath();g.arc(p[0],p[1],6,0,7);g.fill();g.fillText(s[2],p[0],p[1]-12);});
  g.setLineDash([6,6]);g.lineWidth=2;PATHS.forEach(s=>{const a=P(s[0],s[1]),b=P(s[2],s[3]);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();});g.setLineDash([]);
  g.save();g.translate(560,90);g.beginPath();g.moveTo(0,-40);g.lineTo(10,0);g.lineTo(0,40);g.lineTo(-10,0);g.closePath();g.stroke();g.font='bold 24px Georgia,serif';g.fillText('N',0,-48);g.restore();return c.toDataURL();}
const NOTES=[
  {t:'A page from a ship’s log',h:()=>'<p><em>Third day in the fog.</em> We put in at the island the charts do not show. The keepers are gone, and everything they built is still. I have drawn what I found.</p><img class="note-img" alt="A hand-drawn map of the island: the wreck in the south, a boat shed in the west, four watcher pillars in the middle, an old door to the north, a glass house in the east and a light in the south-east. North is up." src="'+mapURL()+'"><p>The light would guide a ship out, if anyone could wake it.</p>'},
  {t:'A note nailed in the boat shed',h:()=>'<p>To whoever starts her up again, set the three dials as the keepers taught us:</p><p><em>First, what wakes the day.<br>Then, what the tide obeys.<br>Last, what sailors steer by.</em></p><p>Then pull the lever and stand back.</p>'},
  {t:'The painted panel in the glass house',h:()=>'<p>Four animals, each above something on the island.</p><p><em>The gull keeps watch on the light.<br>The crab remembers the boats.<br>The turtle bows to the old door.<br>The fish dreams of the glass house.</em></p><p>Each watcher on the plaza has a brass arm. Perhaps each one should point at what it loves.</p>'},
  {t:'The plate on the vessel machine',h:()=>'<p><em>Three vessels, forty measures between them.<br>The first holds twice the second.<br>The third holds ten less than the first.</em></p><p>Fill them true and the machine will give up its crystal.</p>'},
  {t:'A carving in the temple',h:()=>'<p style="font-size:30px;letter-spacing:.2em">I · II · III · IV</p><p><em>Each place wears its number and its sign.</em></p><p>There are brass plates around the island, each with a numeral and a symbol. The altar wants them in the keepers’ order.</p>'}
];
let state='menu',panelOpen=false;
function say(t){const e=$('say');e.textContent=t;e.classList.add('on');clearTimeout(say.t);say.t=setTimeout(()=>e.classList.remove('on'),5200);}
function openPanel(cls,html){panelOpen=true;$('pcard').className='card '+cls;$('pcard').innerHTML=html+'<div class="row"><button class="go alt" id="pclose" type="button">Close</button></div>';$('panel').hidden=false;$('pclose').addEventListener('click',closePanel);
  try{if(document.pointerLockElement===view)document.exitPointerLock();}catch(e){}for(const k in keys)keys[k]=false;}
function closePanel(){panelOpen=false;$('panel').hidden=true;if(state==='play'&&!coarse)lock();}
function readNote(i){sfx.page();if(F.notes.indexOf(i)<0){F.notes.push(i);save();}openPanel('parch','<div class="tag">'+NOTES[i].t+'</div>'+NOTES[i].h());}
function openJournal(){if(!F.notes.length){say('Your journal is empty. Look for anything written down.');return;}
  openPanel('parch','<div class="tag">Journal</div><h2>What you have found</h2><div class="pages">'+F.notes.map(i=>'<button type="button" data-n="'+i+'">'+NOTES[i].t+'</button>').join('')+'</div>');
  $('pcard').querySelectorAll('[data-n]').forEach(b=>b.addEventListener('click',()=>readNote(+b.dataset.n)));}
function bag(){$('items').innerHTML=(F.crystal&&!F.lens?'<span class="chip">Crystal</span> ':'')+(F.key&&!F.door?'<span class="chip">Brass key</span>':'');}

/* ---------- the puzzles ---------- */
const plq={};SYMS.forEach(n=>plq[n]=S(0xffffff,0.55,0.3,{map:plaque(n)}));
function setDials3D(){scene.userData.dials.forEach((m,i)=>{m.material[1]=plq[SYMS[F.dials[i]]];});}
function openDials(){
  if(F.power){say('The generator is running. The dials are locked in place.');return;}
  const draw=()=>{openPanel('brass','<div class="tag">Generator</div><h2>Three brass dials</h2><div class="row">'+[0,1,2].map(i=>'<div class="dial"><button class="arr" data-d="'+i+'" data-s="-1" type="button" aria-label="Dial '+(i+1)+' back">▲</button><div class="sym" role="img" aria-label="'+SYMS[F.dials[i]]+'" style="background-image:url('+symURL[SYMS[F.dials[i]]]+')"></div><button class="arr" data-d="'+i+'" data-s="1" type="button" aria-label="Dial '+(i+1)+' forward">▼</button></div>').join('')+'</div><button class="go" id="plever" type="button">Pull the lever</button>');
    $('pcard').querySelectorAll('.arr').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.d;F.dials[i]=(F.dials[i]+(+b.dataset.s)+6)%6;sfx.click();setDials3D();save();draw();}));
    $('plever').addEventListener('click',()=>{if(F.dials.join()==='0,1,2'){F.power=true;save();closePanel();sfx.stone();setTimeout(sfx.chime,500);say('The flywheel catches. Somewhere inland, lamps flicker on.');}else{sfx.wrong();say('The flywheel turns once and dies. The dials are not right.');}});};
  draw();
}
const PSOL=[3,6,0,2];
function turnPillar(i){
  if(F.pillars){say('It will not turn any more.');return;}
  F.dirs[i]=(F.dirs[i]+1)%8;pillars[i].target-=Math.PI/4;sfx.stone();
  if(F.dirs.join()===PSOL.join()){F.pillars=true;temple.doorCol.off=true;setTimeout(()=>{sfx.stone();sfx.chime();say('Stone grinds on stone to the north. The old door is moving.');},700);}
  save();
}
function openVessels(){
  if(!F.power){say('Three glass vessels and a cold machine. It needs power.');return;}
  if(F.crystal||F.lens||F.ready){say(F.ready&&!F.crystal?'The tray has opened. Something glints in it.':'The vessels are spent.');return;}
  const draw=()=>{openPanel('brass','<div class="tag">Vessel machine</div><h2>Fill the three vessels</h2><div class="row">'+[0,1,2].map(i=>'<div class="dial"><button class="arr" data-d="'+i+'" data-s="5" type="button" aria-label="More in vessel '+(i+1)+'">▲</button><div class="gauge" aria-label="Vessel '+(i+1)+'">'+F.vals[i]+'</div><button class="arr" data-d="'+i+'" data-s="-5" type="button" aria-label="Less in vessel '+(i+1)+'">▼</button></div>').join('')+'</div><p class="sm">First, second and third vessel, left to right.</p><button class="go" id="plever" type="button">Open the valve</button>');
    $('pcard').querySelectorAll('.arr').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.d;F.vals[i]=clamp(F.vals[i]+(+b.dataset.s),0,40);sfx.click();save();draw();}));
    $('plever').addEventListener('click',()=>{if(F.vals.join()==='20,10,10'){F.ready=true;save();closePanel();sfx.chime();say('The liquids settle and glow. A tray slides open beside the machine.');}else{sfx.wrong();say('The machine shudders and drains back. The measures are wrong.');}});};
  draw();
}
item(41.75,PADS[3].h+1.42,-2.5,0.6,()=>'Take the crystal',()=>{F.crystal=true;save();bag();sfx.take();say('A cut crystal, cold and faintly lit from inside.');}).cond=()=>F.ready&&!F.crystal;
const ASOL=['wave','eye','bird','star'];let aSeq=[];
function useAltar(){
  if(F.key||F.vault){say(F.key?'The altar has given what it had.':'The vault behind the altar stands open.');return;}
  if(!F.lens){if(F.crystal){F.lens=true;save();bag();sfx.chime();say('The crystal drops into the socket and the altar wakes. Six signs light up.');}else say('A stone altar with an empty brass socket, the size of a fist.');return;}
  aSeq=[];
  const draw=()=>{openPanel('brass','<div class="tag">Altar</div><h2>Four signs, in order</h2><div class="row">'+SYMS.map(n=>'<button class="sym sm" data-s="'+n+'" type="button" aria-label="'+n+'" aria-pressed="'+(aSeq.indexOf(n)>=0)+'" style="background-image:url('+symURL[n]+')"></button>').join('')+'</div><p class="sm">'+(aSeq.length?'Pressed '+aSeq.length+' of 4':'Press the first sign')+'</p>');
    $('pcard').querySelectorAll('.sym').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.s;if(aSeq.indexOf(n)>=0)return;aSeq.push(n);tone(330+aSeq.length*110,330+aSeq.length*110,0.5,0.08);
      if(aSeq.length<4){draw();return;}
      if(aSeq.join()===ASOL.join()){F.vault=true;save();closePanel();sfx.stone();setTimeout(sfx.chime,600);say('A slab behind the altar slides aside.');}else{aSeq=[];sfx.wrong();draw();say('The signs go dark, then light again. That was not the order.');}}));};
  draw();
}
function takeKey(){F.key=true;save();bag();sfx.take();say('A heavy brass key, shaped like a lighthouse.');}
let fogGoal=0.03,endT=0;
function useTower(){
  if(!F.door){if(F.key){F.door=true;save();bag();sfx.stone();say('The key turns. Inside the doorway is a single brass lever.');}else say('Locked. The keyhole is brass, and shaped like a small tower.');return;}
  if(F.beacon){say('The beacon turns overhead.');return;}
  F.beacon=true;save();sfx.click();setTimeout(sfx.horn,900);fogGoal=0.0065;endT=9;say('Far above you, something enormous begins to turn.');
}
