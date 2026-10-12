/* The Basement server: serves the built game and relays who is where in each room.
   No accounts and no chat. A room is just a short code in the link (?room=abc). */
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto');
const {WebSocketServer}=require('ws');

const PORT=process.env.PORT||8080;
const DIST=path.join(__dirname,'..','dist');
const MAX_ROOM=12,MAX_ROOMS=200,TICK_MS=100,MAX_MSGS_PER_SEC=40;
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.json':'application/json','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.bin':'application/octet-stream','.ico':'image/x-icon'};

/* ---- optional access code ----
   Start with `npm run dev -- --code something` (or BASEMENT_CODE=something) to require it, e.g. on a public link.
   Visitors enter it once (or open a link ending in ?code=something) and a cookie remembers them for 30 days. */
const argCode=(()=>{const i=process.argv.indexOf('--code');return i>0?process.argv[i+1]||'':'';})();
const CODE=(argCode||process.env.BASEMENT_CODE||'').trim();
const TOKEN=CODE?crypto.createHash('sha256').update('basement:'+CODE).digest('hex'):'';
const hasPass=req=>{if(!CODE)return true;const m=/(?:^|;\s*)bcode=([a-f0-9]{64})/.exec(req.headers.cookie||'');
  return !!m&&crypto.timingSafeEqual(Buffer.from(m[1]),Buffer.from(TOKEN));};
const sameCode=c=>typeof c==='string'&&c.length===CODE.length&&crypto.timingSafeEqual(Buffer.from(c),Buffer.from(CODE));
const passCookie='bcode='+TOKEN+'; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function gatePage(res,wrong){
  res.writeHead(wrong?403:401,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
  res.end('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Basement</title>'+
  '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#120e24;color:#fff8e7;font:700 16px system-ui,sans-serif}form{display:grid;gap:12px;width:min(320px,calc(100% - 32px))}'+
  'h1{margin:0;font-size:28px}input,button{font:inherit;padding:12px;border-radius:10px;border:2px solid #fff8e7}input{background:#fff8e7;color:#1d1640}button{background:#ffc928;color:#1d1640;cursor:pointer}p{margin:0;opacity:.8;font-weight:400}</style>'+
  '<form method="post" action="/enter"><h1>The Basement</h1><p>'+(wrong?'That code is not right. Try again.':'Enter the code you were sent.')+'</p>'+
  '<label for="c" style="font-weight:400">Code</label><input id="c" name="code" autocomplete="off" autofocus required><button type="submit">Go downstairs</button></form></html>');
}
const server=http.createServer((req,res)=>{
  const url=new URL(req.url||'/','http://x');let p=decodeURIComponent(url.pathname);
  if(p==='/healthz'){res.writeHead(200,{'content-type':'text/plain'});res.end('ok');return;}
  if(CODE){
    if(p==='/enter'&&req.method==='POST'){let body='';req.on('data',d=>{if(body.length<2000)body+=d;});req.on('end',()=>{
      const c=new URLSearchParams(body).get('code');if(sameCode((c||'').trim())){res.writeHead(303,{'set-cookie':passCookie,location:'/'});res.end();}else gatePage(res,true);});return;}
    if(url.searchParams.has('code')){const ok=sameCode(url.searchParams.get('code').trim());url.searchParams.delete('code');
      if(ok){res.writeHead(303,{'set-cookie':passCookie,location:url.pathname+(url.search||'')});res.end();}else gatePage(res,true);return;}
    if(!hasPass(req)){gatePage(res,false);return;}
  }
  if(p==='/')p='/index.html';
  const file=path.join(DIST,path.normalize(p));
  if(!file.startsWith(DIST+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404,{'content-type':'text/plain'});res.end('Not found');return;}
    res.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream','cache-control':'no-cache'});res.end(data);
  });
});

/* ---- rooms ---- */
const rooms=new Map();let nextId=1;
const num=(v,lo,hi,d)=>(typeof v==='number'&&isFinite(v))?Math.max(lo,Math.min(hi,v)):d;
const cleanName=s=>(typeof s==='string'?s:'').replace(/[^\p{L}\p{N} _\-]/gu,'').trim().slice(0,12);
const cleanRoom=s=>((typeof s==='string'?s:'').toLowerCase().replace(/[^a-z0-9\-]/g,'').slice(0,16))||'main';
const cleanLook=a=>{a=a&&typeof a==='object'?a:{};return {species:num(a.species,0,3,0)|0,color:num(a.color,0,0xffffff,0xff7a1a)|0,hat:num(a.hat,0,5,0)|0,model:(typeof a.model==='string'&&/^[a-z0-9-]{0,40}$/.test(a.model))?a.model:''};};
const cleanStatus=s=>(typeof s==='string'&&/^[a-z:]{0,20}$/.test(s))?s:'';
const send=(ws,o)=>{if(ws.readyState===1)ws.send(JSON.stringify(o));};
const others=(c,o)=>{const r=rooms.get(c.room);if(r)for(const p of r)if(p!==c)send(p.ws,o);};
const pub=c=>({id:c.id,name:c.name,av:c.av,x:c.x,z:c.z,h:c.h,s:c.s});

const wss=new WebSocketServer({server,path:'/ws',maxPayload:2048,verifyClient:info=>hasPass(info.req)});
wss.on('connection',ws=>{
  const c={ws,id:0,room:null,name:'',av:cleanLook(),x:0,z:-2.6,h:Math.PI,m:0,s:'',n:0,alive:true};
  ws.on('pong',()=>{c.alive=true;});
  ws.on('message',raw=>{
    if(++c.n>MAX_MSGS_PER_SEC)return;
    let m;try{m=JSON.parse(raw);}catch(e){return;}
    if(!m||typeof m!=='object')return;
    if(m.t==='hello'){
      if(c.room)return;
      const code=cleanRoom(m.room);let r=rooms.get(code);
      if(!r){if(rooms.size>=MAX_ROOMS){send(ws,{t:'full'});ws.close();return;}r=new Set();rooms.set(code,r);}
      if(r.size>=MAX_ROOM){send(ws,{t:'full'});ws.close();return;}
      c.id=nextId++;c.room=code;c.name=cleanName(m.name);c.av=cleanLook(m.av);
      send(ws,{t:'welcome',id:c.id,room:code,peers:[...r].map(pub)});
      r.add(c);others(c,{t:'join',p:pub(c)});
      return;
    }
    if(!c.room)return;
    if(m.t==='p'){c.x=num(m.x,-40,20,c.x);c.z=num(m.z,-20,20,c.z);c.h=num(m.h,-1e4,1e4,c.h);c.m=num(m.m,0,1,0);c.s=cleanStatus(m.s);}
    else if(m.t==='av'){c.name=cleanName(m.name);c.av=cleanLook(m.av);others(c,{t:'av',id:c.id,name:c.name,av:c.av});}
    else if(m.t==='e'){others(c,{t:'e',id:c.id,k:num(m.k,0,3,0)|0});}
  });
  ws.on('close',()=>{
    const r=rooms.get(c.room);if(!r)return;
    r.delete(c);others(c,{t:'leave',id:c.id});if(!r.size)rooms.delete(c.room);
  });
  ws.on('error',()=>{});
});

/* positions go out ten times a second, one message per room */
const r2=v=>Math.round(v*100)/100;
setInterval(()=>{
  for(const r of rooms.values()){
    if(r.size<2)continue;
    const msg=JSON.stringify({t:'s',p:[...r].map(c=>[c.id,r2(c.x),r2(c.z),r2(c.h),r2(c.m),c.s])});
    for(const c of r)if(c.ws.readyState===1)c.ws.send(msg);
  }
},TICK_MS);
setInterval(()=>{for(const r of rooms.values())for(const c of r)c.n=0;},1000);
/* drop connections that have gone quiet */
setInterval(()=>{
  for(const r of rooms.values())for(const c of r){if(!c.alive){c.ws.terminate();continue;}c.alive=false;try{c.ws.ping();}catch(e){}}
},30000);

server.listen(PORT,()=>{
  console.log('The Basement is open.');
  console.log('  On this computer:      http://localhost:'+PORT);
  /* every network address this machine has: home Wi-Fi, and Tailscale (100.x.x.x) if it is running */
  Object.values(os.networkInterfaces()).flat().filter(a=>a&&a.family==='IPv4'&&!a.internal).forEach(a=>{
    console.log('  '+(a.address.startsWith('100.')?'Over Tailscale:':'On your Wi-Fi:  ')+'       http://'+a.address+':'+PORT);});
  console.log(CODE?'  Access code is on: visitors need the code (or a link ending in ?code=...).':'  No access code. Set BASEMENT_CODE before sharing a public link.');
});
