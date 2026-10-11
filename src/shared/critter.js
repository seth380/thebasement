/* Shared character model used by the basement and the games. One unit is about a metre; the origin is at the feet. */
window.makeCritter=function(spec,o){
  o=o||{};const g=new THREE.Group();
  const col=h=>new THREE.Color(h),dk=(h,k)=>col(h).multiplyScalar(k);
  const M=(c,r,e)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:r===undefined?0.78:r},e||{}));
  const fur=M(spec.head,0.9),furD=M(dk(spec.head,0.7),0.9),lite=M(col(spec.head).lerp(col(0xfff4e0),0.62),0.9),
    shirt=M(spec.color,0.82,o.map?{map:o.map}:null),shirtD=M(dk(spec.color,0.68),0.82),pants=M(0x2f3a5c,0.9),pantsD=M(0x232c47,0.9),
    white=M(0xf6f2ea,0.6),sole=M(0x2a2540,0.7),black=M(0x15131c,0.25),pink=M(0xff9fb5,0.8);
  const add=(geo,mat,x,y,z,par)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=!!o.shadow;m.receiveShadow=!!o.shadow;(par||g).add(m);return m;};
  const sp=(r,ws,hs)=>new THREE.SphereGeometry(r,ws||16,hs||12),cy=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||14),bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  const kind=spec.kind;
  const legs=[-0.11,0.11].map(x=>{const p=new THREE.Group();p.position.set(x,0.42,0);g.add(p);
    add(cy(0.08,0.068,0.3),pants,0,-0.15,0,p);add(cy(0.074,0.074,0.05),pantsD,0,-0.3,0,p);
    add(sp(0.085),white,0,-0.37,0.035,p).scale.set(0.9,0.6,1.35);add(bx(0.15,0.025,0.23),sole,0,-0.41,0.035,p);
    add(bx(0.1,0.012,0.05),shirt,0,-0.335,0.09,p);return p;});
  const prof=[[0.001,0.38],[0.17,0.39],[0.215,0.46],[0.228,0.6],[0.205,0.76],[0.16,0.87],[0.1,0.93],[0.001,0.94]].map(p=>new THREE.Vector2(p[0],p[1]));
  add(new THREE.LatheGeometry(prof,22),shirt,0,0,0);
  add(new THREE.TorusGeometry(0.212,0.018,8,24),shirtD,0,0.445,0).rotation.x=Math.PI/2;
  add(new THREE.TorusGeometry(0.222,0.02,8,24),white,0,0.62,0).rotation.x=Math.PI/2;
  add(new THREE.TorusGeometry(0.1,0.026,8,20),white,0,0.925,0).rotation.x=Math.PI/2;
  const arms=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*0.235,0.85,0);p.rotation.z=s*0.14;g.add(p);
    add(sp(0.07),shirt,0,0,0,p);add(cy(0.066,0.056,0.2),shirt,0,-0.1,0,p);add(new THREE.TorusGeometry(0.056,0.014,6,14),shirtD,0,-0.2,0,p).rotation.x=Math.PI/2;
    add(cy(0.047,0.044,0.14),fur,0,-0.27,0,p);add(sp(0.064),fur,0,-0.37,0,p);return p;});
  const head=new THREE.Group();head.position.y=1.15;g.add(head);
  add(sp(0.27,22,16),fur,0,0,0,head).scale.set(1,0.95,0.96);
  const eye=(x,y,z,r)=>{add(sp(r),white,x,y,z,head).scale.z=0.55;add(sp(r*0.62),black,x*0.97,y,z+r*0.33,head).scale.z=0.6;add(sp(r*0.2),white,x*0.97+r*0.2,y+r*0.25,z+r*0.62,head);};
  if(kind==='frog'){
    [-0.13,0.13].forEach(x=>{add(sp(0.105),fur,x,0.21,0.05,head);eye(x,0.225,0.105,0.075);});
    add(sp(0.17),lite,0,-0.12,0.15,head).scale.set(1.15,0.5,0.72);
    add(sp(0.1),black,0,-0.055,0.222,head).scale.set(1.35,0.1,0.5);
    [-0.03,0.03].forEach(x=>add(sp(0.01),black,x,0.07,0.262,head));
    [-0.19,0.19].forEach(x=>{add(sp(0.045),pink,x,-0.02,0.17,head).scale.z=0.4;});
  }else{
    add(sp(0.115),lite,0,-0.075,0.19,head).scale.set(1.1,0.74,0.85);
    add(sp(0.036),black,0,-0.035,0.285,head).scale.set(1.2,0.8,0.8);
    add(bx(0.008,0.04,0.008),black,0,-0.075,0.283,head);
    [-0.1,0.1].forEach(x=>{eye(x,0.07,0.215,0.052);add(sp(0.045),pink,x*1.85,-0.045,0.165,head).scale.z=0.4;
      add(bx(0.07,0.014,0.014),furD,x,0.15,0.235,head).rotation.z=x>0?-0.25:0.25;});
    if(kind==='bear')[-0.2,0.2].forEach(x=>{add(sp(0.098),fur,x,0.215,0,head);add(sp(0.058),lite,x,0.215,0.055,head).scale.z=0.5;});
    if(kind==='cat'){
      [-0.165,0.165].forEach(x=>{add(new THREE.ConeGeometry(0.095,0.19,4),fur,x,0.265,0,head).rotation.y=Math.PI/4;add(new THREE.ConeGeometry(0.055,0.12,4),pink,x,0.25,0.035,head).rotation.y=Math.PI/4;});
      [-1,1].forEach(s=>[-0.02,0.02].forEach((y,i)=>{const w=add(cy(0.004,0.004,0.16,5),white,s*0.2,-0.07+y,0.2,head);w.rotation.z=Math.PI/2+s*(i?0.2:-0.12);w.rotation.y=-s*0.3;}));
      [-0.06,0,0.06].forEach(x=>{add(bx(0.02,0.012,0.09),furD,x,0.255-Math.abs(x)*0.25,0.07,head).rotation.x=0.5;});
    }
    if(kind==='bunny'){
      [-0.1,0.1].forEach(x=>{const e=add(sp(1),fur,x,0.44,-0.02,head);e.scale.set(0.06,0.22,0.045);e.rotation.z=-x*1.2;const e2=add(sp(1),pink,x,0.44,0.012,head);e2.scale.set(0.032,0.17,0.025);e2.rotation.z=-x*1.2;});
      add(bx(0.04,0.035,0.012),white,0,-0.115,0.262,head);
    }
  }
  if(kind==='bear')add(sp(0.065),fur,0,0.47,-0.2);
  if(kind==='bunny')add(sp(0.085),white,0,0.48,-0.21);
  if(kind==='cat'){const c=new THREE.CatmullRomCurve3([[0,0.46,-0.18],[0,0.5,-0.34],[0.03,0.66,-0.4],[0.06,0.8,-0.34]].map(p=>new THREE.Vector3(p[0],p[1],p[2])));
    add(new THREE.TubeGeometry(c,12,0.032,8),fur,0,0,0);add(sp(0.036),furD,0.06,0.8,-0.34);}
  return {g:g,legs:legs,arms:arms,head:head};
};

/* ---------- shared graphics helpers ---------- */
window.GFX=(function(){
  let gt=null;
  function glowTex(){if(gt)return gt;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(0.35,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);gt=new THREE.CanvasTexture(c);return gt;}
  function glow(color,scale,opacity){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:color,transparent:true,opacity:opacity===undefined?0.8:opacity,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));s.scale.set(scale,scale,1);return s;}
  function particles(scene,n,add){
    const pos=new Float32Array(n*3),col=new Float32Array(n*3),sz=new Float32Array(n),al=new Float32Array(n),P=[];
    for(let i=0;i<n;i++)P.push({t:0,l:1,vx:0,vy:0,vz:0,g:0,s:1,gr:0,a:1});
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('pcol',new THREE.BufferAttribute(col,3));geo.setAttribute('psize',new THREE.BufferAttribute(sz,1));geo.setAttribute('palpha',new THREE.BufferAttribute(al,1));
    const mat=new THREE.ShaderMaterial({uniforms:{map:{value:glowTex()},sc:{value:400}},transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,
      vertexShader:'attribute vec3 pcol;attribute float psize;attribute float palpha;varying vec4 vc;uniform float sc;void main(){vc=vec4(pcol,palpha);vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=min(256.0,psize*sc/max(0.1,-mv.z));gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform sampler2D map;varying vec4 vc;void main(){float a=texture2D(map,gl_PointCoord).a*vc.a;if(a<0.01)discard;gl_FragColor=vec4(vc.rgb,a);}'});
    const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.renderOrder=5;scene.add(pts);
    let next=0;const c=new THREE.Color();
    return {pts:pts,
      emit(x,y,z,vx,vy,vz,life,size,color,grav,grow,alpha){const i=next;next=(next+1)%n;const p=P[i];p.t=p.l=life;p.vx=vx;p.vy=vy;p.vz=vz;p.g=grav||0;p.s=size;p.gr=grow||0;p.a=alpha===undefined?1:alpha;pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;c.set(color);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;},
      tick(dt,camera,hpx){mat.uniforms.sc.value=hpx/(2*Math.tan(camera.fov*Math.PI/360));
        for(let i=0;i<n;i++){const p=P[i];if(p.t<=0){if(al[i]!==0){al[i]=0;sz[i]=0;}continue;}p.t-=dt;p.vy-=p.g*dt;pos[i*3]+=p.vx*dt;pos[i*3+1]+=p.vy*dt;pos[i*3+2]+=p.vz*dt;const k=Math.max(0,p.t/p.l);al[i]=p.a*k;sz[i]=p.s*(1+p.gr*(1-k));}
        geo.attributes.position.needsUpdate=geo.attributes.psize.needsUpdate=geo.attributes.palpha.needsUpdate=geo.attributes.pcol.needsUpdate=true;},
      clear(){P.forEach(p=>p.t=0);}};
  }
  function vignette(canvas,strength,tint){const d=document.createElement('div');d.style.cssText='position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 52%,'+(tint||'rgba(8,6,20,'+(strength||0.45)+')')+' 100%)';canvas.parentNode.insertBefore(d,canvas.nextSibling);return d;}
  function env(renderer,scene,top,mid,bot){const s=new THREE.Scene(),g=new THREE.SphereGeometry(10,24,12),cs=[],a=new THREE.Color(top),b=new THREE.Color(mid),c=new THREE.Color(bot),t=new THREE.Color(),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const y=p.getY(i)/10;if(y>0)t.copy(b).lerp(a,Math.min(1,y*1.6));else t.copy(b).lerp(c,Math.min(1,-y*3));cs.push(t.r,t.g,t.b);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));s.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
    const pm=new THREE.PMREMGenerator(renderer),rt=pm.fromScene(s,0.04);scene.environment=rt.texture;pm.dispose();g.dispose();return rt;}
  function sunShadow(renderer,light,half,size){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;light.castShadow=true;light.shadow.mapSize.set(size||2048,size||2048);const c=light.shadow.camera;c.left=-half;c.right=half;c.top=half;c.bottom=-half;c.near=1;c.far=half*6;light.shadow.bias=-0.0006;light.shadow.normalBias=0.04;c.updateProjectionMatrix();}
  /* loads a .glb from assets/models once and hands every caller its own copy; does nothing when the page has no assets */
  const mcache={};
  function model(file,cb){
    const base=window.BASEMENT_ASSETS;if(!base||!THREE.GLTFLoader)return;
    const hit=mcache[file];if(hit){if(hit.scene)cb(hit.scene.clone());else hit.q.push(cb);return;}
    const e=mcache[file]={scene:null,q:[cb]};
    new THREE.GLTFLoader().load(base+'models/'+file,g=>{g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});e.scene=g.scene;e.q.forEach(f=>{try{f(g.scene.clone());}catch(err){}});e.q=[];},undefined,()=>{});
  }
  /* Scatters many copies of a few models cheaply (one instanced mesh per model part).
     files: ['nature/Pine_1.gltf', ...]; items: [{v: index into files, x, y (ground), z, ry, h (height in metres)}].
     Waits until every file has loaded, then adds the meshes to parent and calls o.done(meshes); if any file fails
     nothing is added, so the caller's own stand-in stays. o.mat(material, v) can swap materials to suit the scene. */
  /* a copy of a leaf material that keeps the outward normals on both sides of each leaf card
     (three.js normally flips them for the back face, which would put half the canopy in shade) */
  function foliage(mat,mc){
    const k='fol:'+mat.uuid;if(mc.has(k))return mc.get(k);
    const c=mat.clone();
    c.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('normal = normal * faceDirection;','');};
    c.customProgramCacheKey=()=>'foliage';mc.set(k,c);return c;
  }
  function scatter(files,items,parent,o){
    o=o||{};if(!window.BASEMENT_ASSETS||!THREE.GLTFLoader||!items.length)return;
    const roots=[];let left=files.length;
    files.forEach((f,v)=>model(f,r=>{roots[v]=r;if(--left===0)build();}));
    function build(){
      const d=new THREE.Object3D(),out=[],mc=new Map();
      roots.forEach((root,v)=>{
        const mine=items.filter(t=>t.v===v);if(!mine.length)return;
        root.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(root),hgt=Math.max(0.001,box.max.y-box.min.y);
        root.traverse(m=>{
          if(!m.isMesh)return;
          const geo=m.geometry.clone();geo.applyMatrix4(m.matrixWorld);geo.translate(0,-box.min.y,0);
          let mat=m.material;
          /* foliage: point each leaf's normal out from the middle of the canopy and a little up, so trees shade as soft
             rounded shapes from every side instead of a dark jumble of leaf cards */
          if(mat.alphaTest>0&&!/bark|trunk|wood/i.test(mat.name)&&geo.attributes.normal){
            geo.computeBoundingBox();const c=geo.boundingBox.getCenter(new THREE.Vector3()),p=geo.attributes.position,n=geo.attributes.normal,t=new THREE.Vector3();
            for(let i=0;i<p.count;i++){t.set(p.getX(i)-c.x,(p.getY(i)-c.y)*0.8,p.getZ(i)-c.z).normalize();t.y+=0.45;t.normalize();n.setXYZ(i,t.x,t.y,t.z);}
            n.needsUpdate=true;mat=foliage(mat,mc);}
          if(o.mat){const k=mat.uuid+':'+v;if(!mc.has(k))mc.set(k,o.mat(mat,v));mat=mc.get(k);}
          const im=new THREE.InstancedMesh(geo,mat,mine.length);
          mine.forEach((t,i)=>{d.position.set(t.x,t.y,t.z);d.rotation.set(0,t.ry||0,0);d.scale.setScalar(t.h/hgt);d.updateMatrix();im.setMatrixAt(i,d.matrix);});
          /* cut-out foliage casts leaf-shaped shadows, and does not receive any (it would shade itself solid) */
          const cut=mat.alphaTest>0;im.castShadow=!!o.shadow;im.receiveShadow=!!o.shadow&&!cut;
          if(o.shadow&&cut)im.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:mat.map,alphaTest:mat.alphaTest});
          parent.add(im);out.push(im);
        });
      });
      if(o.done)o.done(out);
    }
  }
  /* scales and centres a loaded model so its longest side is `size` */
  function fit(obj,size){const b=new THREE.Box3().setFromObject(obj),s=b.getSize(new THREE.Vector3()),c=b.getCenter(new THREE.Vector3()),k=size/Math.max(s.x,s.y,s.z);obj.scale.multiplyScalar(k);obj.position.sub(c.multiplyScalar(k));const g=new THREE.Group();g.add(obj);return g;}
  /* ---- animated characters ----
     GFX.preload(file, ok) loads a rigged .glb/.gltf once; GFX.actor(file, opts) then returns a fresh, independently
     animated copy (or null if it has not loaded). Animations are found by name, so packs with different naming work:
     actor.state('idle'|'walk'|'run'|'sit'|'wave'|'play'), actor.update(dt), actor.has('sit'). */
  const rigs={};
  const KINDS={idle:[/^idle$/i,/^idle[^a-z]/i,/idle/i],walk:[/^walk(ing)?$/i,/^walk[^a-z]/i,/walk/i],run:[/^run(ning)?$/i,/sprint/i,/^run[^a-z]/i,/run/i],
    sit:[/^sit(ting)?$/i,/sitting/i,/sit[_ -]?idle/i,/^sit/i],wave:[/wave/i,/hello/i,/emote[-_ ]?yes/i,/victory/i,/cheer/i,/^yes$/i],yes:[/^yes$/i,/emote[-_ ]?yes/i,/wave/i,/hello/i],
    play:[/interact/i,/^use/i,/pick[-_ ]?up/i],dance:[/dance/i,/victory/i]};
  const FALL={run:'walk',play:'idle',wave:'idle',dance:'wave',yes:'wave',sit:'idle'};
  function preload(file,ok){
    const base=window.BASEMENT_ASSETS;if(!base||!THREE.GLTFLoader||!THREE.SkeletonUtils){return;}
    let r=rigs[file];if(r){if(r.gltf)ok&&ok();else if(ok)r.q.push(ok);return;}
    r=rigs[file]={gltf:null,q:ok?[ok]:[],failed:false};
    new THREE.GLTFLoader().load(base+'models/'+file,g=>{
      g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;if(o.material&&o.material.map)o.material.map.anisotropy=4;}});
      r.gltf=g;r.q.forEach(f=>{try{f();}catch(e){}});r.q=[];
    },undefined,()=>{r.failed=true;r.q=[];});
  }
  function pickClip(clips,kind){
    for(const re of (KINDS[kind]||[new RegExp(kind,'i')])){const c=clips.find(c=>re.test(c.name)&&!/carry|gun|sword|pistol|rifle|wheelchair|holding/i.test(c.name));if(c)return c;}
    for(const re of (KINDS[kind]||[]) ){const c=clips.find(c=>re.test(c.name));if(c)return c;}
    return null;
  }
  function actor(file,opts){
    const r=rigs[file];if(!r||!r.gltf)return null;opts=opts||{};
    const body=THREE.SkeletonUtils.clone(r.gltf.scene);
    /* stand it on the floor, centred, opts.height tall, facing +z like the rest of the game */
    body.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(body),sz=box.getSize(new THREE.Vector3());
    const k=(opts.height||1.5)/Math.max(0.01,sz.y);body.scale.multiplyScalar(k);
    body.position.set(-(box.min.x+box.max.x)/2*k,-box.min.y*k,-(box.min.z+box.max.z)/2*k);
    const g=new THREE.Group(),turn=new THREE.Group();turn.rotation.y=opts.yaw||0;turn.add(body);g.add(turn);
    const mixer=new THREE.AnimationMixer(body),clips=r.gltf.animations||[],acts={};
    function act(kind){
      if(kind in acts)return acts[kind];
      const c=pickClip(clips,kind);acts[kind]=c?mixer.clipAction(c):null;
      if(acts[kind]&&/down|up$|start|end/i.test(c.name)&&kind==='sit'){acts[kind].setLoop(THREE.LoopOnce,1);acts[kind].clampWhenFinished=true;}
      return acts[kind];
    }
    let cur=null,curKind='',one=null;
    /* rigs with no sitting animation get one by bending the hip and knee bones */
    const findB=re=>{let b=null;body.traverse(o=>{if(!b&&(o.isBone||o.type==='Object3D')&&re.test(o.name))b=o;});return b;};
    const legs0=[[findB(/^UpperLeg\.?L|thigh[._]?l|upperleg[._]?l/i),-1.45],[findB(/^UpperLeg\.?R|thigh[._]?r|upperleg[._]?r/i),-1.45],[findB(/^LowerLeg\.?L|shin[._]?l|calf[._]?l|lowerleg[._]?l/i),1.5],[findB(/^LowerLeg\.?R|shin[._]?r|calf[._]?r|lowerleg[._]?r/i),1.5]].filter(q=>q[0]),legs=legs0;
    const hipBone=findB(/^hips?$|pelvis/i);
    /* fake sitting only for two-jointed (human) legs with a hip bone; a mech's extra joint would fold wrong */
    if(!hipBone||findB(/midleg/i))legs.length=0;
    const realSit=!!pickClip(clips,'sit'),qb=new THREE.Quaternion(),ax=new THREE.Vector3(1,0,0);
    let hipY=(opts.height||1.5)*0.5;if(hipBone){g.updateMatrixWorld(true);hipY=hipBone.getWorldPosition(new THREE.Vector3()).y;}
    mixer.addEventListener('finished',e=>{if(e.action===one){one=null;if(cur){cur.reset();cur.play();e.action.crossFadeTo(cur,0.3,false);}}});
    const a={g:g,body:body,mixer:mixer,height:opts.height||1.5,
      has:kind=>kind==='sit'?(realSit||legs.length===4):!!act(kind),
      /* how far to raise or lower the body so it sits on a seat of the given height */
      sitOffset:seat=>realSit?0.05:seat-hipY+0.06,
      state(kind,fade){
        if(kind===curKind)return;let n=act(kind),k2=kind;
        while(!n&&FALL[k2]){k2=FALL[k2];n=act(k2);}
        curKind=kind;if(one){one.stop();one=null;}if(!n||n===cur)return;
        n.reset();n.enabled=true;n.setEffectiveWeight(1);n.play();
        if(cur)cur.crossFadeTo(n,fade===undefined?0.25:fade,false);cur=n;
      },
      /* plays an animation once (a wave, a dance) and then goes back to what it was doing */
      once(kind){
        let n=null,k2=kind;while(!n&&k2){n=pickClip(clips,k2)?act(k2):null;if(!n)k2=FALL[k2]&&FALL[k2]!=='idle'?FALL[k2]:null;}
        if(!n||n===cur)return false;n.setLoop(THREE.LoopOnce,1);n.clampWhenFinished=false;n.reset();n.enabled=true;n.setEffectiveWeight(1);n.timeScale=1;n.play();
        if(cur)cur.crossFadeTo(n,0.2,false);one=n;return true;
      },
      speed(x){if(cur)cur.timeScale=x;},
      update(dt){mixer.update(dt);
        if(curKind==='sit'&&!realSit)legs.forEach(q=>{qb.setFromAxisAngle(ax,q[1]);q[0].quaternion.multiply(qb);});},
      bone(re){let b=null;body.traverse(o=>{if(!b&&o.isBone&&re.test(o.name))b=o;});if(!b)body.traverse(o=>{if(!b&&re.test(o.name)&&!o.isMesh)b=o;});return b;},
      dispose(){mixer.stopAllAction();}};
    a.state(opts.start||'idle',0);
    return a;
  }
  /* the models found in assets/models when the game was built: {characters:[{id,name,file}], npcs:[...]} */
  const roster=window.BASEMENT_MODELS||{characters:[],npcs:[]};
  return {glowTex:glowTex,glow:glow,particles:particles,vignette:vignette,env:env,sunShadow:sunShadow,model:model,fit:fit,scatter:scatter,preload:preload,actor:actor,roster:roster};
})();
