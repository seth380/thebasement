/* Regression checks for malformed HTTP input and access-code handling. */
const test=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const net=require('node:net');
const path=require('node:path');
const {spawn}=require('node:child_process');

async function freePort(){
  const listener=net.createServer();
  await new Promise((resolve,reject)=>{
    listener.once('error',reject);
    listener.listen(0,'127.0.0.1',resolve);
  });
  const port=listener.address().port;
  await new Promise(resolve=>listener.close(resolve));
  return port;
}

function startServer(port){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[path.join(__dirname,'../server/server.js'),'--code','pass'],{
      env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']
    });
    let stdout='',stderr='',done=false;
    const finish=err=>{
      if(done)return;
      done=true;clearTimeout(timeout);
      if(err){child.kill();reject(err);}else resolve(child);
    };
    const timeout=setTimeout(()=>finish(new Error('Server did not start: '+stderr)),5000);
    child.stdout.on('data',b=>{
      stdout+=b.toString();
      if(stdout.includes('The Basement is open.'))finish();
    });
    child.stderr.on('data',b=>{stderr+=b.toString();});
    child.once('error',finish);
    child.once('exit',code=>finish(new Error('Server exited '+code+': '+stderr)));
  });
}

function request(port,url){
  return new Promise((resolve,reject)=>{
    const req=http.get({hostname:'127.0.0.1',port,path:url},res=>{
      res.resume();
      res.once('end',()=>resolve({status:res.statusCode,headers:res.headers}));
      res.once('error',reject);
    });
    req.once('error',reject);
  });
}

test('malformed paths and same-length Unicode codes do not crash the server',async t=>{
  const port=await freePort(),child=await startServer(port);
  t.after(()=>child.kill());
  assert.equal((await request(port,'/healthz')).status,200);

  // An invalid percent encoding previously threw from decodeURIComponent.
  assert.equal((await request(port,'/%E0%A4%A')).status,400);
  assert.equal((await request(port,'/healthz')).status,200);

  // Four Unicode characters have a different byte length from "pass".
  // crypto.timingSafeEqual used to throw when comparing these buffers.
  const wrong=await request(port,'/?code='+encodeURIComponent('éééé'));
  assert.equal(wrong.status,403);
  assert.equal((await request(port,'/healthz')).status,200);

  // Correct links should still set the authentication cookie and redirect.
  const valid=await request(port,'/?code=pass');
  assert.equal(valid.status,303);
  assert.match(valid.headers['set-cookie'][0],/^bcode=/);
});
