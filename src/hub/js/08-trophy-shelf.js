/* ---------- trophy shelf ---------- */
const trophyMeshes=[];
{
  const wood=S(0x6b4a32,0.6,0,{map:woodTex}),tiers=[0xb87333,0xd9dee4,0xffc928];
  META.forEach((m,j)=>{
    const y=[2.3,1.94,1.58,1.22,0.86][j];
    box(2.3,0.04,0.24,wood,8.4,y,-7.86);[-1,1].forEach(s=>box(0.03,0.14,0.2,S(0x23262b,0.5,0.7),8.4+s*0.95,y-0.08,-7.88));
    const lt=mk(256,80,(c,w,h)=>{c.fillStyle=m.c1;c.fillRect(0,0,w,h);c.strokeStyle='#1d1640';c.lineWidth=8;c.strokeRect(0,0,w,h);title(c,m.name.split(' ').slice(0,2).join(' ').toUpperCase(),w/2,h/2+2,30,'#fff8e7');});
    const lp=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.156),S(0xffffff,0.7,0,{map:lt}));lp.position.set(7.62,y+0.11,-7.8);lp.rotation.x=-0.12;scene.add(lp);
    trophyMeshes[j]=tiers.map((c,k)=>{
      const x=8.4+[-0.2,0.3,0.82][k],sc=[1,1.25,1.55][k];
      cyl(0.05,0.05,0.008,S(0x1a1714,0.8),x,y+0.024,-7.86,null,16);
      const g=new THREE.Group(),mt=S(c,0.22,1);g.position.set(x,y+0.02,-7.86);g.scale.setScalar(sc);
      box(0.09,0.03,0.09,S(0x2a1d14,0.5),0,0.015,0,g);cyl(0.012,0.022,0.06,mt,0,0.06,0,g,12);cyl(0.055,0.022,0.09,mt,0,0.135,0,g,20);
      [-1,1].forEach(s=>{const t=sh(new THREE.Mesh(new THREE.TorusGeometry(0.028,0.007,8,16,Math.PI),mt));t.position.set(s*0.05,0.14,0);t.rotation.z=-s*Math.PI/2;g.add(t);});
      g.visible=false;scene.add(g);return g;
    });
  });
  things.push({x:8.4,z:-6.9,r:1.4,text:'Look at the trophy shelf',fn:()=>openTrophies()});
}

