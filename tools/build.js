/* Builds the whole arcade into dist/.
   dist/index.html            full page, served by server/server.js (multiplayer on)
   dist/basement-arcade.html  single-file fragment for publishing as a Claude artifact (single player) */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),src=path.join(root,'src'),dist=path.join(root,'dist');
const read=f=>fs.readFileSync(path.join(src,f),'utf8');
const THREE_TAG='<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>';
const must=(s,a,b)=>{if(!s.includes(a))throw new Error('missing: '+a.slice(0,50));return s.split(a).join(b);};

/* Fogbound Isle is written in parts; join them into one game page first */
function isle(){
  const js=['p2.js','p3.js','p3b.js','p4a.js','p4b.js'].map(f=>read('games/isle/'+f)).join('\n').replace("'use strict';\n",'');
  return read('games/isle/p1.html')+'\n'+THREE_TAG+'\n<script>\n(function(){\n\'use strict\';\n'+js+'\n})();\n</script>\n';
}
/* [cabinet id, source, name of the character list inside the game] */
const games=[['kart','kart.html','RACERS'],['skate','skate.html','SKATERS'],['range','range.html','CAST'],['waterfare','waterfare.html','CAST'],['isle',null,'CAST']];
let tpl='',scr='';
for(const [id,file,cast] of games){
  const s=file?read('games/'+file):isle();
  const style=s.match(/<style>([\s\S]*?)<\/style>/)[1];
  let markup=s.slice(s.indexOf('</style>')+8,s.indexOf('<script src='));
  let js=s.slice(s.lastIndexOf('<script>')+8,s.lastIndexOf('</script>')).trim();
  if(!js.startsWith('(function(){')||!js.endsWith('})();'))throw new Error('wrapper '+id);
  /* each game becomes a function the hub can start and stop; window, requestAnimationFrame and localStorage are sandboxed stand-ins */
  js='GAMES.'+id+'=function(root,api,window,requestAnimationFrame,localStorage){'+js.slice(12,-5)+'};';
  js=must(js,"const $=id=>document.getElementById(id);","const $=id=>root.querySelector('#'+id);");
  js=must(js,"const hex=n=>'#'+n.toString(16).padStart(6,'0');","const hex=n=>'#'+n.toString(16).padStart(6,'0');api.cast("+cast+");");
  const ex='<button class="go alt" data-exit type="button">Back to the basement</button>';
  const n0=markup.length;
  markup=markup.replace(/(<button class="go" id="start"[^>]*>[^<]*<\/button>)/,'$1'+ex).replace(/(<button class="go alt" id="change"[^>]*>[^<]*<\/button>)/,'$1'+ex);
  if(markup.length!==n0+2*ex.length)throw new Error('exit '+id);
  tpl+='<template id="tpl-'+id+'"><style>'+style+'</style>'+markup+'</template>\n';scr+='<script>\n'+js+'\n</script>\n';
}
const hubJs=fs.readdirSync(path.join(src,'hub/js')).filter(f=>f.endsWith('.js')).sort().map(f=>read('hub/js/'+f).replace(/\n$/,'')).join('\n');
let hub=read('hub/index.html');
hub=must(hub,'<!--GAME_TEMPLATES-->',tpl);
hub=must(hub,'<!--GAME_SCRIPTS-->','<script>\n'+read('shared/critter.js')+'\n'+read('shared/sfx.js')+'\n</script>\n'+scr);
hub=must(hub,'<!--HUB_SCRIPT-->',"<script>\n(function(){\n'use strict';\n"+hubJs+'\n})();\n</script>');
fs.mkdirSync(dist,{recursive:true});
fs.writeFileSync(path.join(dist,'basement-arcade.html'),hub);
/* the served page uses the copies in assets/ so it does not depend on a CDN */
const local=must(hub,THREE_TAG,'<script src="assets/vendor/three.min.js"></script><script src="assets/vendor/GLTFLoader.js"></script>');
fs.cpSync(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true});
const page='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>html,body{margin:0;height:100%;background:#120e24}[hidden]{display:none!important}</style>\n<script>window.BASEMENT_SERVER="auto";window.BASEMENT_ASSETS="assets/";</script>\n</head>\n<body>\n'+local+'\n</body>\n</html>\n';
fs.writeFileSync(path.join(dist,'index.html'),page);
console.log('built dist/index.html',page.length,'bytes');
