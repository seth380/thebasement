/* ---------- glow and colour for every scene ----------
   GFX.post(renderer, opts) draws a scene into a high-range, multisampled buffer, blurs the brightest parts into a soft glow
   at five sizes (bloom), then one last pass adds the glow, grades the colour (saturation, contrast, warmth), darkens the corners
   and converts to the screen's colour space. Neon, screens, lamps, the sun and fire end up glowing like they should.

     const post=GFX.post(renderer,{strength:0.6,threshold:0.8});
     post.render(scene,camera);                 // instead of renderer.render(scene,camera)
     post.begin(); ...renders...; post.end();   // when a frame takes more than one render (a gun drawn over the world)
     post.set({strength:0.9});                  // change the look on the fly (a different base)

   Quality is shared by everything and saved in this browser: 'high' (4x smoothing), 'medium' (2x, the default on phones)
   or 'low' (straight to the screen, no glow). Without high-range buffers (old devices) it quietly falls back to 'low'.
   srgb:false is for scenes whose colours were picked for a plain (linear) canvas: the last pass then leaves the colours as they are. */
(function(){
  const KEY='basement-gfx',coarse=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  let cur=(()=>{let q=null;try{q=localStorage.getItem(KEY);}catch(e){}return q==='high'||q==='medium'||q==='low'?q:(coarse?'medium':'high');})(),ver=0;
  const listeners=[];
  /* set or read the quality. A choice made by hand (not auto) is remembered as the player's own, so auto never overrides it */
  function quality(set,auto){if(set&&set!==cur){cur=set;ver++;try{localStorage.setItem(KEY,set);if(!auto)localStorage.setItem(KEY+'-manual','1');}catch(e){}listeners.forEach(f=>{try{f(cur,!!auto);}catch(e){}});}return cur;}
  const manual=()=>{try{return !!localStorage.getItem(KEY+'-manual');}catch(e){return true;}};
  /* if frames keep taking longer than about 1/25 s, step the quality down once a while (never below what the player picked) */
  let wLast=0,wN=0,wSum=0,wSkip=0;
  function watch(){const n=performance.now(),d=wLast?n-wLast:0;wLast=n;if(!d||d>1000)return;if(wSkip<90){wSkip++;return;}
    wSum+=d;wN++;if(wN<120)return;const avg=wSum/wN;wSum=wN=0;
    if(avg>40&&cur!=='low'&&!manual()){quality(cur==='high'?'medium':'low',true);wSkip=0;}}

  const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const sm=(fs,u)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false});
  const BRIGHT='uniform sampler2D t;uniform float th;uniform float knee;varying vec2 vUv;'+
    'void main(){vec3 c=texture2D(t,vUv).rgb;float m=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th,th+knee,m),1.);}';
  const COPY='uniform sampler2D t;varying vec2 vUv;void main(){gl_FragColor=vec4(texture2D(t,vUv).rgb,1.);}';
  /* nine-tap gaussian done in five samples by leaning on linear filtering */
  const BLUR='uniform sampler2D t;uniform vec2 dir;varying vec2 vUv;void main(){vec3 s=texture2D(t,vUv).rgb*0.2270270;'+
    's+=(texture2D(t,vUv+dir*1.3846154).rgb+texture2D(t,vUv-dir*1.3846154).rgb)*0.3162162;'+
    's+=(texture2D(t,vUv+dir*3.2307692).rgb+texture2D(t,vUv-dir*3.2307692).rgb)*0.0702703;gl_FragColor=vec4(s,1.);}';
  const COMP='uniform sampler2D tS;uniform sampler2D b0;uniform sampler2D b1;uniform sampler2D b2;uniform sampler2D b3;uniform sampler2D b4;'+
    'uniform float strength;uniform float vig;uniform float sat;uniform float con;uniform float warm;uniform float aspect;uniform float lift;uniform float enc;varying vec2 vUv;'+
    'vec3 toS(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-0.055,step(vec3(0.0031308),c));}'+
    'float h12(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}'+
    'void main(){vec4 s=texture2D(tS,vUv);'+
    'vec3 b=texture2D(b0,vUv).rgb*0.30+texture2D(b1,vUv).rgb*0.26+texture2D(b2,vUv).rgb*0.2+texture2D(b3,vUv).rgb*0.14+texture2D(b4,vUv).rgb*0.1;'+
    'vec3 c=s.rgb+b*strength;float l=dot(c,vec3(0.2126,0.7152,0.0722));c=max(mix(vec3(l),c,sat),0.);'+
    'c*=vec3(1.+warm,1.+warm*0.25,1.-warm);'+
    'vec2 q=(vUv-0.5)*vec2(aspect,1.);c*=1.-vig*smoothstep(0.3,1.0,length(q)*1.25);'+
    'vec3 o=enc>0.5?toS(c):c;o=(o-0.5)*con+0.5+lift;o+=(h12(gl_FragCoord.xy)-0.5)/255.;'+
    'float a=clamp(max(s.a,dot(b*strength,vec3(0.4))),0.,1.);gl_FragColor=vec4(clamp(o,0.,1.),a);}';

  function post(renderer,opts){
    const opt=Object.assign({strength:0.6,threshold:0.8,knee:0.3,spread:1.0,vignette:0.2,sat:1.06,contrast:1.04,warm:0,lift:0,srgb:true},opts||{});
    const ex=renderer.extensions,hdr=renderer.capabilities.isWebGL2&&!!(ex.has('EXT_color_buffer_float')||ex.has('EXT_color_buffer_half_float'));
    let w=0,h=0,rt=null,A=[],B=[],myVer=-1,mode='low';
    const qs=new THREE.Scene(),qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));quad.frustumCulled=false;qs.add(quad);
    const M={bright:sm(BRIGHT,{t:{value:null},th:{value:0},knee:{value:0}}),copy:sm(COPY,{t:{value:null}}),blur:sm(BLUR,{t:{value:null},dir:{value:new THREE.Vector2()}}),
      comp:sm(COMP,{tS:{value:null},b0:{value:null},b1:{value:null},b2:{value:null},b3:{value:null},b4:{value:null},strength:{value:0},vig:{value:0},sat:{value:1},con:{value:1},warm:{value:0},aspect:{value:1},lift:{value:0},enc:{value:1}})};
    const size=new THREE.Vector2();
    const mk=(x,y,ms)=>{const o={type:THREE.HalfFloatType,format:THREE.RGBAFormat,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:!!ms,stencilBuffer:false};
      const t=ms&&THREE.WebGLMultisampleRenderTarget?new THREE.WebGLMultisampleRenderTarget(x,y,o):new THREE.WebGLRenderTarget(x,y,Object.assign(o,{depthBuffer:true}));if(ms&&t.samples!==undefined)t.samples=ms;t.texture.generateMipmaps=false;return t;};
    function free(){if(rt)rt.dispose();A.concat(B).forEach(t=>t.dispose());rt=null;A=[];B=[];w=h=0;}
    /* (re)build the buffers when the quality or the canvas size changes */
    function fit(){
      if(myVer!==ver){myVer=ver;free();mode=hdr?quality():'low';api.on=mode!=='low';}
      if(mode==='low')return false;
      renderer.getDrawingBufferSize(size);if(rt&&size.x===w&&size.y===h)return true;
      free();w=size.x;h=size.y;rt=mk(w,h,mode==='high'?4:2);const L=mode==='high'?5:4;let x=Math.max(1,w>>1),y=Math.max(1,h>>1);
      for(let i=0;i<L;i++){A.push(mk(x,y,0));B.push(mk(x,y,0));x=Math.max(1,x>>1);y=Math.max(1,y>>1);}
      M.comp.uniforms.aspect.value=w/h;return true;}
    const pass=(m,target)=>{quad.material=m;renderer.setRenderTarget(target);renderer.render(qs,qc);};
    const api={on:false,opt:opt,
      set(o){Object.assign(opt,o);return api;},
      begin(){watch();renderer.setRenderTarget(fit()?rt:null);},
      end(){
        if(mode==='low'||!rt){return;}
        const ac=renderer.autoClear;renderer.autoClear=true;
        const u=M.bright.uniforms;u.t.value=rt.texture;u.th.value=opt.threshold;u.knee.value=opt.knee;pass(M.bright,A[0]);
        for(let i=0;i<A.length;i++){
          if(i){M.copy.uniforms.t.value=A[i-1].texture;pass(M.copy,A[i]);}
          const bu=M.blur.uniforms,s=opt.spread*(1+i*0.25);
          bu.t.value=A[i].texture;bu.dir.value.set(s/A[i].width,0);pass(M.blur,B[i]);
          bu.t.value=B[i].texture;bu.dir.value.set(0,s/A[i].height);pass(M.blur,A[i]);}
        const c=M.comp.uniforms;c.tS.value=rt.texture;['b0','b1','b2','b3','b4'].forEach((k,i)=>c[k].value=A[Math.min(i,A.length-1)].texture);
        c.strength.value=opt.strength;c.vig.value=opt.vignette;c.sat.value=opt.sat;c.con.value=opt.contrast;c.warm.value=opt.warm;c.lift.value=opt.lift;c.enc.value=opt.srgb===false?0:1;
        pass(M.comp,null);renderer.autoClear=ac;},
      render(scene,camera){api.begin();renderer.render(scene,camera);api.end();},
      /* let go of the buffers (a cabinet is open); they come back on the next frame drawn */
      free(){free();},
      dispose(){free();Object.values(M).forEach(m=>m.dispose());}};
    fit();
    return api;
  }
  /* a normal map made from a texture's own picture: darker reads as lower, so plank gaps, grout, mortar and rock cracks
     catch the light. Cached per picture; it repeats like the texture it came from */
  function normalMap(img){
    if(!img||!img.getContext)return null;if(img.__nm)return img.__nm;
    /* read the picture through a small software canvas: reading a big picture straight back off the graphics card can stall for seconds */
    const sc=Math.min(1,512/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*sc)),h=Math.max(1,Math.round(img.height*sc));
    const rc=document.createElement('canvas');rc.width=w;rc.height=h;const rg=rc.getContext('2d',{willReadFrequently:true});rg.drawImage(img,0,0,w,h);
    return img.__nm=fromHeight(rc);}
  /* a normal map from a height picture drawn on the spot (cheap: nothing is read back off the graphics card) */
  function heightNormal(w,h,draw){const rc=document.createElement('canvas');rc.width=w;rc.height=h;draw(rc.getContext('2d',{willReadFrequently:true}),w,h);return fromHeight(rc);}
  function fromHeight(rc){
    const w=rc.width,h=rc.height,src=rc.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data,H=new Float32Array(w*h);
    for(let i=0;i<w*h;i++)H[i]=(src[i*4]*0.3+src[i*4+1]*0.59+src[i*4+2]*0.11)/255;
    const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),out=g.createImageData(w,h),o=out.data,k=2.2;
    for(let y=0;y<h;y++){const yu=((y-1+h)%h)*w,yd=((y+1)%h)*w,yr=y*w;
      for(let x=0;x<w;x++){const xl=(x-1+w)%w,xr=(x+1)%w;
        const dx=(H[yu+xr]+2*H[yr+xr]+H[yd+xr])-(H[yu+xl]+2*H[yr+xl]+H[yd+xl]),dy=(H[yd+xl]+2*H[yd+x]+H[yd+xr])-(H[yu+xl]+2*H[yu+x]+H[yu+xr]);
        let nx=-dx*k,ny=dy*k,nz=1;const l=Math.sqrt(nx*nx+ny*ny+1);nx/=l;ny/=l;nz/=l;const j=(yr+x)*4;
        o[j]=(nx*0.5+0.5)*255;o[j+1]=(ny*0.5+0.5)*255;o[j+2]=(nz*0.5+0.5)*255;o[j+3]=255;}}
    g.putImageData(out,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
  /* gives every standard material in a scene whose texture is one of the listed pictures a matching normal map.
     It works through the list a picture at a time once the game is up, so it never holds up the first frame */
  const bumpQ=[];let bumpBusy=false;
  function bumpAll(root,list){list.forEach(q=>{if(q[0]&&q[0].image)bumpQ.push([root,q[0].image,q[1],q[2]]);});if(!bumpBusy){bumpBusy=true;setTimeout(bumpNext,1200);}}
  function bumpNext(){const q=bumpQ.shift();if(!q){bumpBusy=false;return;}const [root,img,k,given]=q;let n=given||null;if(!n)try{n=normalMap(img);}catch(e){}
    if(n)root.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(mt=>{
      if(!mt||!mt.isMeshStandardMaterial||!mt.map||mt.normalMap||mt.map.image!==img)return;mt.normalMap=n;mt.normalScale.set(k,k);mt.needsUpdate=true;});});
    setTimeout(bumpNext,120);}
  window.GFX.post=post;window.GFX.quality=quality;window.GFX.onQuality=f=>listeners.push(f);/* bump every textured surface under root (skips see-through and glowing ones), a little at a time */
  function bumpEverything(root,k){const seen=new Set(),list=[];root.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(mt=>{
      if(!mt||!mt.isMeshStandardMaterial||!mt.map||mt.normalMap||mt.transparent||!mt.map.image||!mt.map.image.getContext||seen.has(mt.map.image))return;seen.add(mt.map.image);list.push([mt.map,k||0.6]);});});
    bumpAll(root,list);}
  window.GFX.bumpEverything=bumpEverything;window.GFX.normalMap=normalMap;window.GFX.heightNormal=heightNormal;window.GFX.bumpAll=bumpAll;
})();
