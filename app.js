const SRC='<!DOCTYPE html>\n'+document.documentElement.outerHTML;
const $=id=>document.getElementById(id);
const fa=n=>Number(n).toLocaleString('fa-IR');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function h53(str,seed=0){let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677);}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36);}
const seed=JSON.parse($('seed').textContent);
let db=seed;
try{const l=JSON.parse(localStorage.getItem('dey_db')||'null');if(l&&l.rev>seed.rev)db=l;}catch(e){}
let likes={};try{likes=JSON.parse(localStorage.getItem('dey_likes')||'{}')}catch(e){}
const save=()=>{db.rev=Date.now();try{localStorage.setItem('dey_db',JSON.stringify(db))}catch(e){alert('حافظه مرورگر پر است؛ عکس کوچک‌تر بگذار.')}};

function render(){
  $('cnt').textContent=fa(db.count);
  $('notes').innerHTML=db.notes.map(t=>'<p>'+esc(t)+'</p>').join('');
  const q=$('q').value.trim(),d=$('day').value;
  const list=db.people.filter(p=>(!d||String(p.d)===d)&&(!q||p.n.includes(q)));
  $('grid').innerHTML=list.length?list.map(p=>{
    const on=likes[p.id],meta=[p.a?fa(p.a)+' ساله':'',p.c,fa(p.d)+' دی'].filter(Boolean).join(' · ');
    return '<article class="card'+(p.p?'':' noimg')+'">'+(p.p?'<div class="ph"><img src="'+p.p+'" alt="'+esc(p.n)+'"><div class="ov"><div class="nm">'+esc(p.n)+'</div></div></div>':'')+
      '<div class="in">'+(p.p?'':'<div class="nm">'+esc(p.n)+'</div>')+'<div class="mt">'+esc(meta)+'</div></div>'+
      '</article>';
  }).join(''):'<div class="empty">نام‌ها یکی‌یکی اینجا ثبت می‌شود.<br>تا آن روز، شمعی برای همه‌شان روشن است.</div>';
}
$('grid').onclick=e=>{const b=e.target.closest('.hb');if(!b||likes[b.dataset.id])return;burst(e.clientX,e.clientY);likes[b.dataset.id]=1;try{localStorage.setItem('dey_likes',JSON.stringify(likes))}catch(x){}render();};
$('q').oninput=render;$('day').onchange=render;

/* admin */
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
let photo='';
function route(){
  const adm=location.hash==='#admin';
  $('admin').style.display=adm?'block':'none';$('site').style.display=adm?'none':'block';
  if(adm){const ok=sessionStorage.getItem('dey_ok')==='1';$('login').style.display=ok?'none':'block';$('panel').style.display=ok?'block':'none';if(ok)fill();}
}
addEventListener('hashchange',route);
$('go').onclick=()=>{if(h53('dey1404|'+$('pw').value)===seed.pw){sessionStorage.setItem('dey_ok','1');$('pw').value='';route();}else alert('رمز درست نیست.');};
$('pw').onkeydown=e=>{if(e.key==='Enter')$('go').click()};
$('out').onclick=()=>{sessionStorage.removeItem('dey_ok');location.hash='';route();render();};
function fill(){
  $('s_c').value=db.count;$('s_n').value=db.notes.join('\n');
  $('pl').innerHTML=db.people.length?db.people.map(p=>'<div><span>'+esc(p.n)+' ('+fa(p.d)+' دی)</span><button data-id="'+p.id+'">حذف</button></div>').join(''):'<span style="color:var(--ash)">لیست خالی است.</span>';
}
$('pl').onclick=e=>{const b=e.target.closest('button');if(!b||!confirm('حذف شود؟'))return;db.people=db.people.filter(p=>p.id!==b.dataset.id);save();fill();};
$('a_p').onclick=()=>$('a_f').click();
$('a_f').onchange=e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,480/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);photo=c.toDataURL('image/jpeg',.8);$('a_m').textContent='عکس انتخاب شد.';};im.src=r.result;};
  r.readAsDataURL(f);
};
$('a_s').onclick=()=>{
  const n=$('a_n').value.trim();if(!n){$('a_m').textContent='اسم را وارد کن.';return;}
  db.people.push({id:uid(),n,a:+$('a_a').value||0,c:$('a_c').value.trim(),d:+$('a_d').value,p:photo,h:0});
  save();photo='';['a_n','a_a','a_c'].forEach(i=>$(i).value='');$('a_f').value='';$('a_m').textContent='ثبت شد.';fill();
};
$('l_s').onclick=()=>{
  const items=$('l_t').value.split(/[\n,،]+/).map(s=>s.trim()).filter(Boolean);
  items.forEach(s=>{const [n,a,c]=s.split('|').map(x=>x.trim());db.people.push({id:uid(),n,a:+a||0,c:c||'',d:+$('l_d').value,p:'',h:0});});
  save();$('l_t').value='';fill();alert(items.length+' نام ثبت شد.');
};
$('s_s').onclick=()=>{
  db.count=+$('s_c').value||db.count;
  const n=$('s_n').value.split('\n').map(s=>s.trim()).filter(Boolean);if(n.length)db.notes=n;
  save();alert('ذخیره شد.');
};
$('dl').onclick=()=>{
  const json=JSON.stringify(db).replace(/</g,'\\u003c');
  const out=SRC.replace(/(<script id="seed" type="application\/json">)[\s\S]*?(<\/script>)/,(m,a,b)=>a+json+b);
  const u=URL.createObjectURL(new Blob([out],{type:'text/html'})),a=document.createElement('a');
  a.href=u;a.download='index.html';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);
};
let tp=0,tt;$('logo').onclick=()=>{tp++;clearTimeout(tt);tt=setTimeout(()=>tp=0,1500);if(tp>=5){tp=0;location.hash='#admin';}};
let lit=localStorage.getItem('dey_c')==='1';
function candles(){$('candles').innerHTML='<i class="c"></i>'.repeat(9)+(lit?'<i class="c mine"></i>':'');
$('light').disabled=lit;$('light').style.opacity=lit?.6:1;$('light').textContent=lit?'🕯️ شمع تو روشن است':'🕯️ شمعی روشن کن';$('cc').textContent=lit?'هر نفر یک شمع؛ شمع تو برای یادشان می‌سوزد.':'هر نفر می‌تواند یک شمع روشن کند.';}
$('light').onclick=()=>{if(lit)return;lit=true;try{localStorage.setItem('dey_c','1')}catch(e){}candles();const g=$('glow');g.classList.remove('on');void g.offsetWidth;g.classList.add('on');};
candles();
/* intro + count-up + tilt */
const intro=$('intro'),rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
function countUp(){if(rm)return;const el=$('cnt'),to=db.count,t0=performance.now();
(function s(n){const k=Math.min(1,(n-t0)/2400),e=1-Math.pow(1-k,3);el.textContent=fa(Math.round(to*e));if(k<1)requestAnimationFrame(s)})(t0);}
let started=false;const go=()=>{if(started)return;started=true;countUp();};
if(rm||sessionStorage.getItem('dey_i')||location.hash==='#admin'){intro.remove();go();}
else{intro.querySelector('img').src=$('logo').src;sessionStorage.setItem('dey_i','1');
const end=()=>{intro.classList.add('out');setTimeout(()=>intro.remove(),1000);go();};intro.onclick=end;setTimeout(end,2800);}
const ph=document.querySelector('.story img');
ph.addEventListener('pointermove',e=>{const r=ph.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;ph.style.transform='perspective(700px) rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg)'});
ph.addEventListener('pointerleave',()=>ph.style.transform='');
(function(){const c=$('fx'),x=c.getContext('2d');if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
let W,H,P=[];const R=()=>{W=c.width=innerWidth;H=c.height=innerHeight};R();addEventListener('resize',R);
const mk=(i)=>({x:Math.random()*W,y:i?Math.random()*H:H+10,r:Math.random()*2+.6,v:Math.random()*.5+.2,s:Math.random()*Math.PI*2,g:Math.random()<.35});
for(let i=0;i<46;i++)P.push(mk(1));
(function f(){x.clearRect(0,0,W,H);for(const p of P){p.y-=p.v;p.s+=.01;p.x+=Math.sin(p.s)*.4;if(p.y<-10)Object.assign(p,mk(0));
x.beginPath();x.fillStyle=p.g?'rgba(210,169,79,.55)':'rgba(200,16,46,.55)';x.shadowColor=p.g?'#d2a94f':'#c8102e';x.shadowBlur=8;x.arc(p.x,p.y,p.r,0,7);x.fill();}
requestAnimationFrame(f)})();})();
addEventListener('pointermove',e=>{const s=$('spot').style;s.setProperty('--x',e.clientX+'px');s.setProperty('--y',e.clientY+'px')});
addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;$('bar').style.width=(h>0?scrollY/h*100:0)+'%';if(!matchMedia('(prefers-reduced-motion:reduce)').matches)document.querySelector('.lg').style.transform='translateY('+Math.min(scrollY*.18,90)+'px)'},{passive:true});
render();route();