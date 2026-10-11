/* ---------- trophies ---------- */
let earned=-1;
function refreshTrophies(announce){
  const st=trophyState();let n=0,fresh=null;
  st.forEach((s,j)=>s.t.forEach((t,k)=>{if(t[0]){n++;if(!trophyMeshes[j][k].visible&&announce)fresh=['Bronze','Silver','Gold'][k]+' trophy: '+META[j].name;}trophyMeshes[j][k].visible=!!t[0];}));
  $('h-count').textContent='Trophies '+n+'/15';
  if(fresh&&earned>=0&&n>earned){toast('New '+fresh+'!');SFX.play('win',{delay:0.4});}
  earned=n;tvTex.userData.go(tvT);
  $('h-t-list').innerHTML=st.map((s,j)=>'<div class="h-game"><h3>'+META[j].name+'</h3><small>'+s.rec+'</small><ul>'+s.t.map((t,k)=>'<li class="'+(t[0]?'got':'')+'"><i style="background:'+['#b87333','#d9dee4','#ffc928'][k]+'"></i>'+t[1]+(t[0]?'':' (not yet)')+'</li>').join('')+'</ul></div>').join('');
}
let toastT=0;function toast(s){$('h-toast').textContent=s;toastT=3.2;}

