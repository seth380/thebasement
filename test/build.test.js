/* The published hub must generate parseable, lifecycle-scoped cabinet scripts. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

test('build bundles all cabinets with scoped timers and document listeners',()=>{
  const root=path.join(__dirname,'..');
  execFileSync(process.execPath,['tools/build.js'],{cwd:root});
  const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');

  for(const id of ['kart','skate','range','waterfare','isle']){
    assert.ok(html.includes('GAMES.'+id+'=function(root,api,window,requestAnimationFrame,localStorage,setTimeout,clearTimeout,setInterval,clearInterval)'),id+' missing lifecycle parameters');
  }
  assert.equal((html.match(/api\.onDocument\('pointerlockchange'/g)||[]).length,2);
  assert.equal((html.match(/api\.onDocument\('pointerlockerror'/g)||[]).length,2);
  assert.equal((html.match(/document\.addEventListener\('pointerlockchange'/g)||[]).length,0);

  const scripts=[...html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)];
  let parsed=0;
  for(const [,source] of scripts){
    if(!source.trim())continue;
    new vm.Script(source);
    parsed++;
  }
  assert.ok(parsed>=6,'expected inline cabinet and hub scripts');
});
