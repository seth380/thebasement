/* ---------- foosball ---------- */
const foos={rods:[],spin:0,ball:null,x:5.4,z:5};
{
  const fx=foos.x,fz=foos.z,L=1.4,Wd=0.76,top=0.9,wal=S(0x5c3d28,0.45,0,{map:woodTex}),blk=S(0x0d0d10,0.4,0.2),steel=S(0xd0d4da,0.25,0.9);
  [-1,1].forEach(s=>{box(L+0.08,0.3,0.04,wal,fx,top-0.15,fz+s*(Wd/2+0.02));box(0.04,0.3,Wd,wal,fx+s*(L/2+0.02),top-0.15,fz);
    box(0.012,0.1,0.22,blk,fx+s*(L/2-0.003),top-0.2,fz,null,true);
    [-1,1].forEach(q=>{box(0.08,top-0.32,0.08,wal,fx+s*(L/2-0.06),(top-0.32)/2,fz+q*(Wd/2-0.06));cyl(0.035,0.035,0.02,blk,fx+s*(L/2-0.06),0.01,fz+q*(Wd/2-0.06),null,10);});});
  box(L+0.08,0.05,Wd+0.08,wal,fx,top-0.325,fz);
  const ft=mk(512,256,(g,w,h)=>{g.fillStyle='#1f8a4c';g.fillRect(0,0,w,h);for(let i=0;i<8;i++){g.fillStyle=i%2?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)';g.fillRect(i*64,0,64,h);}
    g.strokeStyle='#f3f3f3';g.lineWidth=5;g.strokeRect(8,8,w-16,h-16);g.beginPath();g.moveTo(w/2,8);g.lineTo(w/2,h-8);g.stroke();g.beginPath();g.arc(w/2,h/2,44,0,7);g.stroke();g.strokeRect(8,h/2-60,70,120);g.strokeRect(w-78,h/2-60,70,120);},true);
  const pf=sh(new THREE.Mesh(new THREE.PlaneGeometry(L,Wd),S(0xffffff,0.6,0,{map:ft})),true);pf.rotation.x=-Math.PI/2;pf.position.set(fx,top-0.25,fz);scene.add(pf);
  const red=S(0xd8362b,0.5),blue=S(0x2f6fd8,0.5);
  [[1,0],[2,0],[3,1],[5,0],[5,1],[3,0],[2,1],[1,1]].forEach((r,i)=>{
    const g=new THREE.Group();g.position.set(fx-L/2+0.1+i*(L-0.2)/7,top-0.07,fz);scene.add(g);
    const rod=sh(new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,Wd+0.46,8),steel));rod.rotation.x=Math.PI/2;g.add(rod);
    const side=r[1]?-1:1,hd=sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.022,0.12,10),blk));hd.rotation.x=Math.PI/2;hd.position.z=side*(Wd/2+0.2);g.add(hd);
    const n=r[0],spc=Math.min(0.2,0.54/n);
    for(let k=0;k<n;k++){const z=(k-(n-1)/2)*spc,m=r[1]?blue:red;box(0.028,0.11,0.04,m,0,-0.035,z,g);sph(0.022,m,0,0.03,z,g);}
    foos.rods.push({g:g,a:0,dir:i%2?1:-1});
  });
  foos.ball=sph(0.017,S(0xf4f4f4,0.4),fx+0.08,top-0.233,fz+0.06);
  solid(fx-L/2-0.06,fx+L/2+0.06,fz-Wd/2-0.3,fz+Wd/2+0.3);
  things.push({x:fx,z:fz,r:1.6,text:'Play foosball',fn:()=>openFoos()});
}

