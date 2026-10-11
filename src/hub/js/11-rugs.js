/* ---------- rugs ---------- */
function rugGen(bg,border,acc,light,style){return mk(512,512,(g,w,h)=>{
  g.fillStyle=border;g.fillRect(0,0,w,h);g.fillStyle=light;g.fillRect(16,16,w-32,h-32);g.fillStyle=bg;g.fillRect(28,28,w-56,h-56);
  g.strokeStyle=light;g.lineWidth=4;g.strokeRect(46,46,w-92,h-92);
  if(style==='med'){g.save();g.translate(w/2,h/2);g.rotate(Math.PI/4);[150,122,94,62,30].forEach((s,i)=>{g.fillStyle=[acc,light,bg,acc,light][i];g.fillRect(-s,-s,2*s,2*s);});g.restore();
    [[90,90],[w-90,90],[90,h-90],[w-90,h-90]].forEach(p=>{g.save();g.translate(p[0],p[1]);g.rotate(Math.PI/4);g.fillStyle=acc;g.fillRect(-22,-22,44,44);g.fillStyle=light;g.fillRect(-9,-9,18,18);g.restore();});}
  else{for(let y=84,k=0;y<h-70;y+=46,k++){g.strokeStyle=k%2?acc:light;g.lineWidth=11;g.beginPath();for(let x=60;x<=w-60;x+=28)g[x===60?'moveTo':'lineTo'](x,y+((x-60)/28%2?16:-16));g.stroke();}}
  noise(g,w,h,26);},true);}
function rug(tex,w,d,x,z){const m=sh(new THREE.Mesh(new THREE.PlaneGeometry(w,d),S(0xffffff,0.98,0,{map:tex})),true);m.rotation.x=-Math.PI/2;m.position.set(x,0.012,z);scene.add(m);}
rug(rugGen('#7a1f24','#2a1512','#d9a441','#ead9b5','med'),3.4,3.4,-2.4,5.4);
rug(rugGen('#22324f','#141b2b','#c9773f','#e6dcc6','zig'),4.4,3.2,5.4,5);

