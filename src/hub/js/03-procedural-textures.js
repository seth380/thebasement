/* ---------- procedural textures ---------- */
function noise(g,w,h,amt){const d=g.getImageData(0,0,w,h),a=d.data;for(let i=0;i<a.length;i+=4){const n=(rnd()-0.5)*amt;a[i]+=n;a[i+1]+=n;a[i+2]+=n;}g.putImageData(d,0,0);}
function wrap(t,rx,ry){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t;}
const floorTex=wrap(mk(1024,1024,(g,w,h)=>{
  const rows=12,rh=h/rows;
  for(let r=0;r<rows;r++){let x=-rnd()*300;
    while(x<w){const len=260+rnd()*300,l=38+rnd()*12;
      g.fillStyle='hsl('+(27+rnd()*6)+','+(26+rnd()*8)+'%,'+(l-9)+'%)';g.fillRect(x,r*rh,len,rh);
      for(let k=0;k<26;k++){g.fillStyle='rgba(60,35,15,'+(0.03+rnd()*0.06)+')';g.fillRect(x+rnd()*len*0.3,r*rh+rnd()*rh,len*(0.4+rnd()*0.6),1+rnd()*1.5);}
      g.fillStyle='rgba(30,18,8,.55)';g.fillRect(x,r*rh,2,rh);x+=len;}
    g.fillStyle='rgba(30,18,8,.6)';g.fillRect(0,r*rh,w,2);}
  noise(g,w,h,10);
},true),6.5,4.7);
const wallTex=wrap(mk(256,256,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);noise(g,w,h,14);},true),8,2);
const fabricTex=wrap(mk(128,128,(g,w,h)=>{g.fillStyle='#ddd';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=2){g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,y,w,1);}noise(g,w,h,34);},true),4,4);
const woodTex=wrap(mk(256,256,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);for(let k=0;k<90;k++){g.fillStyle='rgba(40,20,5,'+(0.04+rnd()*0.1)+')';g.fillRect(0,rnd()*h,w,1+rnd()*2);}noise(g,w,h,10);},true),1,1);
const rugTex=mk(512,640,(g,w,h)=>{
  g.fillStyle='#1f5c66';g.fillRect(0,0,w,h);g.fillStyle='#f3e6c8';g.fillRect(18,18,w-36,h-36);g.fillStyle='#b8433f';g.fillRect(30,30,w-60,h-60);
  g.fillStyle='#1f5c66';g.fillRect(44,44,w-88,h-88);
  for(let y=0;y<9;y++)for(let x=0;x<7;x++){const cx=76+x*60,cy=80+y*60;g.fillStyle=(x+y)%2?'#e9b949':'#f3e6c8';
    g.beginPath();g.moveTo(cx,cy-22);g.lineTo(cx+22,cy);g.lineTo(cx,cy+22);g.lineTo(cx-22,cy);g.closePath();g.fill();
    g.fillStyle='#b8433f';g.fillRect(cx-4,cy-4,8,8);}
  noise(g,w,h,26);
},true);

