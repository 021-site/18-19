const ADMIN_PASSWORD = "s@dr@-18-19=40000";
const STORAGE_KEY = "minab_names_v2";
const VOTED_KEY = "minab_voted_v1";
const NAMES_URL = "./names.json";
let namesData = [];
let SITE_CACHE = null;
let isAdmin = false;
let editId = null;
let tempImage = "";
let voted = [];
try { voted = JSON.parse(localStorage.getItem(VOTED_KEY) || "[]"); } catch(e){ voted = []; }

const DEFAULT_DATA = [
  { id: 1, name: "نمونه: امیر مینابی", age: "۱۷", date: "18 دی", place: "میناب", desc: "این یک اسم نمونه است. از پنل ادمین حذفش کن و اسم واقعی را با عکس اضافه کن.", image: "", candles: 12, createdAt: 1 },
  { id: 2, name: "نمونه: سارا مینابی", age: "۱۶", date: "19 دی", place: "میناب", desc: "این هم نمونه دوم است برای تست ظاهر سایت. متن یادبود را اینجا بنویس.", image: "", candles: 8, createdAt: 2 }
];

function normalizeDate(d){
  let s = String(d || "");
  if(s.indexOf("19") !== -1 || s.indexOf("۱۹") !== -1) return "19 دی";
  return "18 دی";
}
function normalizeItem(x, i){
  return {
    id: (x && x.id != null) ? x.id : (Date.now() + (i||0)),
    name: String((x && x.name) || "").slice(0,80),
    age: String((x && x.age) || "").slice(0,10),
    date: normalizeDate(x && x.date),
    place: String((x && x.place) || "میناب").slice(0,60),
    desc: String((x && x.desc) || "").slice(0,600),
    image: (x && x.image) || "",
    candles: Number((x && x.candles) || 0),
    createdAt: (x && x.createdAt) || Date.now()
  };
}
function escapeHtml(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}
function getLocal(){
  try{
    const v = localStorage.getItem(STORAGE_KEY);
    if(v === null) return null;
    const a = JSON.parse(v);
    if(Array.isArray(a)) return a.map(function(x,i){ return normalizeItem(x,i); });
    return null;
  }catch(e){ return null; }
}
function setP(a){ localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); }
function saveLocal(){
  try{ setP(namesData); }
  catch(e){ alert("حافظه مرورگر پر شد. عکس کوچک‌تری انتخاب کن."); }
}
function saveVoted(){ try{ localStorage.setItem(VOTED_KEY, JSON.stringify(voted)); }catch(e){} }
function hasVoted(id){
  for(let i=0;i<voted.length;i++){ if(String(voted[i])===String(id)) return true; }
  return false;
}
function faNum(n){ return Number(n || 0).toLocaleString("fa-IR"); }
function githubMsg(t, ok){
  const m = document.getElementById("githubMsg");
  if(!m) return;
  m.style.color = ok ? "#1e8449" : "#c0392b";
  m.textContent = t;
}

async function loadData(){
  let remote = null;
  try{
    const r = await fetch(NAMES_URL + "?v=" + Date.now(), {cache:"no-store"});
    if(r.ok){
      const d = await r.json();
      if(Array.isArray(d)) remote = d.map(function(x,i){ return normalizeItem(x,i); });
    }
  }catch(e){}
  if(remote) SITE_CACHE = remote;
  const local = getLocal();
  if(local !== null) namesData = local;
  else if(SITE_CACHE !== null) namesData = SITE_CACHE;
  else namesData = DEFAULT_DATA.map(function(x,i){ return normalizeItem(x,i); });
  render();
}

function render(){
  const qEl = document.getElementById("searchInput");
  const fEl = document.getElementById("filterDate");
  const grid = document.getElementById("cardsGrid");
  if(!grid) return;
  const q = (qEl && qEl.value || "").trim();
  const f = (fEl && fEl.value || "");
  grid.innerHTML = "";
  const filtered = namesData.filter(function(x){
    const okQ = !q || (x.name||"").indexOf(q) !== -1 || (x.desc||"").indexOf(q) !== -1 || (x.place||"").indexOf(q) !== -1;
    const okF = !f || x.date===f;
    return okQ && okF;
  });
  document.getElementById("emptyMsg").style.display = filtered.length ? "none" : "block";
  filtered.forEach(function(x,i){
    const div = document.createElement("div");
    div.className="card"; div.style.animationDelay=(i*0.05)+"s";
    const safeName = escapeHtml(x.name);
    const firstChar = escapeHtml((x.name||"").trim()[0]||"•");
    const imgHtml = x.image ? '<img src="'+x.image+'" alt="'+safeName+'" loading="lazy">' : '<div class="avatar">'+firstChar+'</div>';
    const v = hasVoted(x.id);
    const btnText = v ? '🕯️ روشن کردی ✓ '+faNum(x.candles||0) : '🕯️ '+faNum(x.candles||0)+' شمع';
    const btnClass = v ? "candle-btn voted" : "candle-btn";
    div.innerHTML = '<div class="card-img">'+imgHtml+'</div><div class="card-body"><h3>'+safeName+'</h3><div class="card-meta">'+escapeHtml(x.date||"")+' ۱۴۰۴ • '+escapeHtml(x.place||"میناب")+(x.age ? " • "+escapeHtml(x.age)+" ساله" : "")+'</div><div class="card-desc">'+escapeHtml(x.desc||"")+'</div><div class="card-foot"><button class="'+btnClass+'">'+btnText+'</button><span style="font-size:12px;color:#6f7a90">جزئیات ←</span></div></div>';
    div.querySelector("button").addEventListener("click", function(ev){ ev.stopPropagation(); lightCandle(x.id); });
    div.onclick = (function(id){ return function(){ openDetail(id); }; })(x.id);
    grid.appendChild(div);
  });
  document.getElementById("statCount").textContent = faNum(namesData.length);
  const total = namesData.reduce(function(s,x){ return s+(Number(x.candles)||0); },0);
  document.getElementById("statCandles").textContent = faNum(total);
  renderAdminList();
}

function openDetail(id){
  let x = null;
  for(let i=0;i<namesData.length;i++){ if(String(namesData[i].id)===String(id)) x=namesData[i]; }
  if(!x) return;
  const safeName = escapeHtml(x.name);
  const imgHtml = x.image ? '<img src="'+x.image+'" class="detail-img" alt="'+safeName+'">' : '<div style="font-size:80px;text-align:center">🕯️</div>';
  const v = hasVoted(x.id);
  const btnLabel = v ? '🕯️ تو برایش شمع روشن کردی ✓ ('+faNum(x.candles||0)+')' : '🕯️ روشن کردن شمع به یادش ('+faNum(x.candles||0)+')';
  document.getElementById("detailContent").innerHTML = '<div class="detail-box">'+imgHtml+'<h2>'+safeName+'</h2><p style="color:#e8b64c">'+(x.age ? escapeHtml(x.age)+" ساله • " : "")+escapeHtml(x.date||"")+' ۱۴۰۴ • '+escapeHtml(x.place||"میناب")+'</p><p style="color:#c2cadb;margin:12px 0;line-height:2.2">'+escapeHtml(x.desc||"")+'</p><button class="btn-gold" id="detailCandleBtn">'+btnLabel+'</button>'+(v ? '<p class="muted" style="margin-top:8px">هر نفر فقط یک شمع می‌تواند روشن کند.</p>' : '')+'</div>';
  document.getElementById("detailCandleBtn").onclick = function(){ lightCandle(x.id, true); };
  openModal("detailModal");
}
function lightCandle(id, fromDetail){
  if(hasVoted(id)) { if(fromDetail) openDetail(id); return; }
  for(let i=0;i<namesData.length;i++){
    if(String(namesData[i].id)===String(id)){
      namesData[i].candles = Number(namesData[i].candles||0)+1;
      voted.push(id); saveVoted(); saveLocal(); render();
      if(fromDetail) openDetail(id);
      break;
    }
  }
}

function openModal(id){ document.getElementById(id).classList.add("open"); }
function closeModal(id){ document.getElementById(id).classList.remove("open"); }
function openAdminLogin(){
  if(isAdmin){ openModal("adminModal"); renderAdminList(); }
  else openModal("loginModal");
}
function doLogin(){
  const v = document.getElementById("adminPass").value || "";
  if(v === ADMIN_PASSWORD){
    isAdmin = true;
    closeModal("loginModal"); openModal("adminModal"); renderAdminList();
    document.getElementById("adminPass").value = "";
  } else alert("رمز اشتباه است");
}
function doLogout(){
  isAdmin = false; closeModal("adminModal");
}
function showAddForm(){
  editId = null; tempImage = "";
  document.getElementById("formTitle").textContent = "افزودن جاویدنام جدید";
  ["f_name","f_age","f_place","f_desc"].forEach(function(id){ document.getElementById(id).value=""; });
  document.getElementById("f_date").value = "18 دی";
  document.getElementById("f_preview").style.display="none";
  document.getElementById("addForm").style.display="block";
  window.scrollTo({top:0,behavior:"smooth"});
}
function hideAddForm(){ document.getElementById("addForm").style.display="none"; }
function compress(f){
  return new Promise(function(res){
    try{
      const r=new FileReader();
      r.onload=function(){
        const im=new Image();
        im.onload=function(){
          try{
            const c=document.createElement("canvas");
            const m=1000; let w=im.width,h=im.height;
            if(w>m||h>m){ const k=Math.min(m/w,m/h); w=Math.round(w*k); h=Math.round(h*k); }
            c.width=w; c.height=h; c.getContext("2d").drawImage(im,0,0,w,h);
            res(c.toDataURL("image/jpeg",.82));
          }catch(e){ res(r.result); }
        };
        im.onerror=function(){ res(r.result); };
        im.src=r.result;
      };
      r.onerror=function(){ res(null); };
      r.readAsDataURL(f);
    }catch(e){ res(null); }
  });
}
function previewImage(input){
  const f = input.files && input.files[0];
  if(!f) return;
  compress(f).then(function(url){
    if(url){ tempImage = url; const p=document.getElementById("f_preview"); p.src=url; p.style.display="block"; }
  });
}
function saveForm(){
  const name = document.getElementById("f_name").value.trim();
  if(!name){ alert("نام الزامی است"); return; }
  const obj = {
    id: editId || (Date.now()+""),
    name: name.slice(0,80),
    age: document.getElementById("f_age").value.trim().slice(0,10),
    date: normalizeDate(document.getElementById("f_date").value),
    place: (document.getElementById("f_place").value.trim()||"میناب").slice(0,60),
    desc: document.getElementById("f_desc").value.trim().slice(0,600),
    image: tempImage,
    candles: 0,
    createdAt: Date.now()
  };
  if(editId){
    namesData = namesData.map(function(x){
      if(String(x.id)===String(editId)){ obj.candles = x.candles; obj.createdAt = x.createdAt; if(!obj.image) obj.image = x.image; return obj; }
      return x;
    });
  } else {
    namesData.unshift(obj);
  }
  saveLocal(); render(); hideAddForm();
  editId=null; tempImage="";
  githubMsg("ذخیره موقت انجام شد. یادت نرود «دانلود names.json» را بزنی.", true);
  alert("ذخیره شد. برای ماندگار شدن در گیت‌هاب، «دانلود names.json» را بزن و در ریپو جایگزین کن.");
}
function renderAdminList(){
  const w = document.getElementById("approvedList");
  const c = document.getElementById("approvedCount");
  if(!w) return;
  w.innerHTML = "";
  if(c) c.textContent = faNum(namesData.length);
  if(!namesData.length) w.innerHTML = '<p class="muted" style="text-align:center;padding:1rem">هنوز اسمی ثبت نشده — اولین اسم را بالا اضافه کن.</p>';
  namesData.forEach(function(x){
    const d = document.createElement("div");
    d.className = "admin-item";
    d.style.cssText = "display:flex;gap:10px;align-items:center;justify-content:space-between;border:1px solid #eee;border-radius:10px;padding:8px 10px;margin:6px 0;background:#fff";
    const first = escapeHtml((x.name||"")[0]||"ن");
    const img = x.image ? '<img src="'+x.image+'" style="width:44px;height:44px;object-fit:cover;border-radius:8px">' : '<div style="width:44px;height:44px;border-radius:8px;background:#222;color:#e8b64c;display:flex;align-items:center;justify-content:center;font-weight:700">'+first+'</div>';
    d.innerHTML = '<div style="display:flex;gap:10px;align-items:center">'+img+'<div><b>'+escapeHtml(x.name)+'</b><br><small style="color:#777">'+escapeHtml(x.date)+' • '+escapeHtml(x.place)+' • 🕯️ '+faNum(x.candles)+'</small></div></div>';
    const btns = document.createElement("div");
    btns.style.cssText = "display:flex;gap:6px";
    const be = document.createElement("button"); be.className="btn-small"; be.textContent="ویرایش";
    const bd = document.createElement("button"); bd.className="btn-small danger"; bd.textContent="حذف";
    be.onclick = function(){
      editId = x.id;
      document.getElementById("f_name").value = x.name;
      document.getElementById("f_age").value = x.age||"";
      document.getElementById("f_date").value = x.date;
      document.getElementById("f_place").value = x.place||"";
      document.getElementById("f_desc").value = x.desc||"";
      tempImage = x.image||"";
      const p = document.getElementById("f_preview");
      if(tempImage){ p.src=tempImage; p.style.display="block"; } else p.style.display="none";
      document.getElementById("formTitle").textContent="ویرایش";
      document.getElementById("addForm").style.display="block";
      window.scrollTo({top:0,behavior:"smooth"});
    };
    bd.onclick = function(){
      if(confirm("حذف شود؟")){ namesData = namesData.filter(function(y){ return String(y.id)!==String(x.id); }); saveLocal(); render(); }
    };
    btns.appendChild(be); btns.appendChild(bd);
    d.appendChild(btns); w.appendChild(d);
  });
}
function exportJSON(){
  const blob = new Blob([JSON.stringify(namesData,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "names.json";
  document.body.appendChild(a); a.click();
  setTimeout(function(){ try{URL.revokeObjectURL(a.href)}catch(e){} a.remove(); },600);
  githubMsg("دانلود شد. حالا همین فایل را در گیت‌هاب جای names.json بگذار و Commit بزن.", true);
}
function importJSON(input){
  const f = input.files && input.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = function(){
    try{
      const j = JSON.parse(r.result);
      if(!Array.isArray(j)) throw 0;
      const clean = j.map(function(x,i){ return normalizeItem(x,i); }).filter(function(x){ return x.name; }).slice(0,500);
      namesData = clean; saveLocal(); render();
      githubMsg("فایل وارد و جایگزین شد ("+clean.length+" اسم). حالا دانلود کن و در گیت‌هاب بگذار.", true);
    }catch(e){ githubMsg("فایل معتبر نیست.", false); }
    input.value="";
  };
  r.readAsText(f);
}
function resetData(){
  fetch(NAMES_URL+"?v="+Date.now(), {cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(j){
    if(!Array.isArray(j)) throw 0;
    const clean = j.map(function(x,i){ return normalizeItem(x,i); });
    SITE_CACHE = clean;
    if(getLocal()!==null){ if(!confirm("نسخه سایت جایگزین حافظه این مرورگر شود؟")){ render(); return; } }
    namesData = clean; saveLocal(); render();
    githubMsg("از سایت بارگذاری شد ("+clean.length+" اسم).", true);
  }).catch(function(){ githubMsg("دریافت نشد. مطمئن شو names.json کنار فایل‌هاست.", false); });
}
document.addEventListener("DOMContentLoaded", loadData);