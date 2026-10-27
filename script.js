// دیتا استور V7 — ضدخرابی، سازگار با data.js + names.json + حافظه
var ADMIN_PASSWORD = "s@dr@-18-19=40000";
var STORAGE_KEY = "minab_names_v3";
var VOTED_KEY = "minab_voted_v1";
var NAMES_URL = "./names.json";
var namesData = [];
var SITE_CACHE = null;
var DATA_VERSION = 0;
var isAdmin = false;
var editId = null;
var tempImage = "";
var voted = [];
try { voted = JSON.parse(localStorage.getItem(VOTED_KEY) || "[]"); } catch(e){ voted = []; }
try {
  if (window.SITE_DATA && window.SITE_DATA.adminPassword) ADMIN_PASSWORD = window.SITE_DATA.adminPassword;
  else if (window.MEMORIAL_META && window.MEMORIAL_META.adminPassword) ADMIN_PASSWORD = window.MEMORIAL_META.adminPassword;
} catch(e){}

var DEFAULT_DATA = [
{ id: "1793028370234", name: "سپهر ابراهیمی", age: "۱۹", date: "18 دی", place: "شهرک اندیشه، تهران", desc: "", image: "", candles: 1, createdAt: 1 },
{ id: "1793028370235", name: "آرنیکا دباغ", age: "۱۵", date: "19 دی", place: "گرگان", desc: "", image: "", candles: 1, createdAt: 2 },
{ id: "1793028370236", name: "مهرداد (متین) مشتاقی", age: "۲۷", date: "19 دی", place: "اراک", desc: "", image: "", candles: 1, createdAt: 3 },
{ id: "1793028370237", name: "مانی صفرپور", age: "۱۸", date: "18 دی", place: "سلسبیل تهران", desc: "", image: "", candles: 1, createdAt: 4 },
{ id: "1793028370238", name: "دیانا بهادر", age: "۱۹", date: "19 دی", place: "گنبد کاووس", desc: "", image: "", candles: 1, createdAt: 5 }
];

function normalizeDate(d){
  var s = String(d || "");
  if(s.indexOf("19") !== -1 || s.indexOf("۱۹") !== -1) return "19 دی";
  return "18 دی";
}
function normalizeItem(x, i){
  if(!x || !x.name) return null;
  return {
    id: (x.id != null && String(x.id).length) ? String(x.id) : String(Date.now() + (i||0)),
    name: String(x.name).slice(0,80),
    age: String(x.age || "").slice(0,10),
    date: normalizeDate(x.date),
    place: String(x.place || "میناب").slice(0,60),
    desc: String(x.desc || "").slice(0,600),
    image: x.image || "",
    candles: Number(x.candles || 0),
    createdAt: x.createdAt || Date.now()
  };
}
function cleanList(a){
  if(!Array.isArray(a)) return null;
  var out = [];
  for(var i=0;i<a.length;i++){ var n = normalizeItem(a[i], i); if(n) out.push(n); }
  if(!out.length) return null;
  return out;
}
function escapeHtml(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}
function getLocal(){
  try{
    var v = localStorage.getItem(STORAGE_KEY);
    if(v === null) return null;
    var a = JSON.parse(v);
    return cleanList(a);
  }catch(e){ return null; }
}
function setP(a){ localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); }
function saveLocal(){ try{ setP(namesData); }catch(e){ alert("حافظه مرورگر پر شد. عکس کوچک‌تری انتخاب کن."); } }
function saveVoted(){ try{ localStorage.setItem(VOTED_KEY, JSON.stringify(voted)); }catch(e){} }
function hasVoted(id){ for(var i=0;i<voted.length;i++){ if(String(voted[i])===String(id)) return true; } return false; }
function faNum(n){ return Number(n || 0).toLocaleString("fa-IR"); }
function githubMsg(t, ok){
  var m = document.getElementById("githubMsg");
  if(!m) return;
  m.style.color = ok ? "#1e8449" : "#c0392b";
  m.textContent = t;
}
function dl(name, text){
  var b = new Blob([text], {type:"text/plain;charset=utf-8"});
  var a = document.createElement("a");
  a.href = URL.createObjectURL(b); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function(){ try{URL.revokeObjectURL(a.href)}catch(e){} a.remove(); },600);
}
function getPublishedFromDataJs(){
  try{
    if(window.SITE_DATA && Array.isArray(window.SITE_DATA.items)){
      var c = cleanList(window.SITE_DATA.items);
      if(c){
        DATA_VERSION = Number(window.SITE_DATA.version || 7);
        if(window.SITE_DATA.adminPassword) ADMIN_PASSWORD = window.SITE_DATA.adminPassword;
        return c;
      }
    }
    if(Array.isArray(window.MARTYRS)){
      var c2 = cleanList(window.MARTYRS);
      if(c2) return c2;
    }
  }catch(e){}
  return null;
}
function buildDataJs(arr){
  var v = Number(DATA_VERSION || 7) + 1;
  var lines = [];
  lines.push("// ============================================");
  lines.push("// یادبود ۱۸ و ۱۹ دی — دیتا استور V" + v);
  lines.push("// آپدیت: بلوک را کپی کن، مشخصات را عوض کن، version را زیاد کن");
  lines.push("// همین فایل را در گیت‌هاب جایگزین data.js کن و Commit بزن");
  lines.push("// ============================================");
  lines.push("");
  lines.push("window.SITE_DATA = {");
  lines.push('  version: ' + v + ',');
  lines.push('  updatedAt: "' + new Date().toLocaleDateString("fa-IR") + '",');
  lines.push('  adminPassword: "' + ADMIN_PASSWORD + '",');
  lines.push("");
  lines.push("  items: " + JSON.stringify(arr.map(function(m){ return {id:String(m.id),name:m.name,age:m.age||"",date:m.date,place:m.place||"",desc:m.desc||"",image:(m.image&&m.image.indexOf("data:")===0)?"":(m.image||""),candles:Number(m.candles||0)}; }), null, 2).replace(/\n/g, "\n  "));
  lines.push("};");
  lines.push("");
  lines.push("// سازگاری با نسخه قبلی — دست نزن");
  lines.push("window.MARTYRS = window.SITE_DATA.items;");
  lines.push("window.MEMORIAL_META = { version: window.SITE_DATA.version, adminPassword: window.SITE_DATA.adminPassword };");
  lines.push("");
  return lines.join("\n");
}
function updateBadges(isDraft){
  var b = document.getElementById("dataSourceBadge");
  if(b){
    var src = isDraft ? "پیش‌نویس این مرورگر (هنوز در گیت‌هاب منتشر نشده)" : ("متصل به data.js نسخه " + faNum(DATA_VERSION || 7));
    b.textContent = "● " + src + " • " + faNum(namesData.length) + " اسم";
  }
  var p = document.getElementById("publishStatus");
  if(p){
    if(isDraft) p.textContent = "⚠️ تغییرات فقط در این مرورگر است. برای انتشار «دانلود data.js جدید» را بزن.";
    else p.textContent = "✅ همگام با نسخه منتشرشده.";
  }
}
async function loadData(){
  var fromDataJs = getPublishedFromDataJs();
  var remote = null;
  try{
    var r = await fetch(NAMES_URL + "?v=" + Date.now(), {cache:"no-store"});
    if(r.ok){
      var d = await r.json();
      var c = cleanList(d);
      if(c) remote = c;
    }
  }catch(e){}
  var published = fromDataJs || remote || DEFAULT_DATA.map(function(x,i){ return normalizeItem(x,i); });
  if(fromDataJs) DATA_VERSION = Number((window.SITE_DATA && window.SITE_DATA.version) || 7);
  SITE_CACHE = published;
  var local = getLocal();
  if(local && local.length){
    namesData = local;
    var sameLen = local.length === published.length;
    updateBadges(!sameLen || JSON.stringify(local) !== JSON.stringify(published));
    if(!sameLen){ /* draft */ }
  } else {
    namesData = published;
    try{ setP(namesData); }catch(e){}
    updateBadges(false);
  }
  // اگر data.js لود نشده بود به کاربر بگو ولی صفحه خالی نماند
  if(!fromDataJs && !remote){
    setTimeout(function(){ githubMsg("توجه: data.js پیدا نشد، نسخه پیش‌فرض نمایش داده شد. مطمئن شو data.js کنار index.html است.", false); }, 500);
  }
  render();
}
function render(){
  var qEl = document.getElementById("searchInput");
  var fEl = document.getElementById("filterDate");
  var grid = document.getElementById("cardsGrid");
  if(!grid) return;
  var q = (qEl && qEl.value || "").trim();
  var f = (fEl && fEl.value || "");
  grid.innerHTML = "";
  var filtered = namesData.filter(function(x){
    var okQ = !q || (x.name||"").indexOf(q) !== -1 || (x.desc||"").indexOf(q) !== -1 || (x.place||"").indexOf(q) !== -1;
    var okF = !f || x.date===f;
    return okQ && okF;
  });
  document.getElementById("emptyMsg").style.display = filtered.length ? "none" : "block";
  filtered.forEach(function(x,i){
    var div = document.createElement("div");
    div.className="card"; div.style.animationDelay=(i*0.05)+"s";
    var safeName = escapeHtml(x.name);
    var firstChar = escapeHtml((x.name||"").trim()[0]||"•");
    var imgHtml = x.image ? '<img src="'+x.image+'" alt="'+safeName+'" loading="lazy" onerror="this.outerHTML=\'<div class=avatar>'+firstChar+'</div>\'">' : '<div class="avatar">'+firstChar+'</div>';
    var v = hasVoted(x.id);
    var btnText = v ? '🕯️ روشن کردی ✓ '+faNum(x.candles||0) : '🕯️ '+faNum(x.candles||0)+' شمع';
    var btnClass = v ? "candle-btn voted" : "candle-btn";
    div.innerHTML = '<div class="card-img">'+imgHtml+'</div><div class="card-body"><h3>'+safeName+'</h3><div class="card-meta">'+escapeHtml(x.date||"")+' ۱۴۰۴ • '+escapeHtml(x.place||"میناب")+(x.age ? " • "+escapeHtml(x.age)+" ساله" : "")+'</div><div class="card-desc">'+escapeHtml(x.desc||"")+'</div><div class="card-foot"><button class="'+btnClass+'">'+btnText+'</button><span style="font-size:12px;color:#6f7a90">جزئیات ←</span></div></div>';
    div.querySelector("button").addEventListener("click", function(ev){ ev.stopPropagation(); lightCandle(x.id); });
    div.onclick = (function(id){ return function(){ openDetail(id); }; })(x.id);
    grid.appendChild(div);
  });
  document.getElementById("statCount").textContent = faNum(namesData.length);
  var total = namesData.reduce(function(s,x){ return s+(Number(x.candles)||0); },0);
  document.getElementById("statCandles").textContent = faNum(total);
  renderAdminList();
}
function openDetail(id){
  var x = null;
  for(var i=0;i<namesData.length;i++){ if(String(namesData[i].id)===String(id)) x=namesData[i]; }
  if(!x) return;
  var safeName = escapeHtml(x.name);
  var imgHtml = x.image ? '<img src="'+x.image+'" class="detail-img" alt="'+safeName+'">' : '<div style="font-size:80px;text-align:center">🕯️</div>';
  var v = hasVoted(x.id);
  var btnLabel = v ? '🕯️ تو برایش شمع روشن کردی ✓ ('+faNum(x.candles||0)+')' : '🕯️ روشن کردن شمع به یادش ('+faNum(x.candles||0)+')';
  document.getElementById("detailContent").innerHTML = '<div class="detail-box">'+imgHtml+'<h2>'+safeName+'</h2><p style="color:#e8b64c">'+(x.age ? escapeHtml(x.age)+" ساله • " : "")+escapeHtml(x.date||"")+' ۱۴۰۴ • '+escapeHtml(x.place||"میناب")+'</p><p style="color:#c2cadb;margin:12px 0;line-height:2.2">'+escapeHtml(x.desc||"")+'</p><button class="btn-gold" id="detailCandleBtn">'+btnLabel+'</button>'+(v ? '<p class="muted" style="margin-top:8px">هر نفر فقط یک شمع می‌تواند روشن کند.</p>' : '')+'</div>';
  document.getElementById("detailCandleBtn").onclick = function(){ lightCandle(x.id, true); };
  openModal("detailModal");
}
function lightCandle(id, fromDetail){
  if(hasVoted(id)) { if(fromDetail) openDetail(id); return; }
  for(var i=0;i<namesData.length;i++){
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
  var v = document.getElementById("adminPass").value || "";
  if(v === ADMIN_PASSWORD){
    isAdmin = true;
    closeModal("loginModal"); openModal("adminModal"); renderAdminList();
    document.getElementById("adminPass").value = "";
  } else alert("رمز اشتباه است");
}
function doLogout(){ isAdmin = false; closeModal("adminModal"); }
function showAddForm(){
  editId = null; tempImage = "";
  document.getElementById("formTitle").textContent = "افزودن جاویدنام جدید";
  ["f_name","f_age","f_place","f_desc"].forEach(function(id){ document.getElementById(id).value=""; });
  document.getElementById("f_date").value = "18 دی";
  document.getElementById("f_preview").style.display="none";
  document.getElementById("addForm").style.display="block";
}
function hideAddForm(){ document.getElementById("addForm").style.display="none"; }
function compress(f){
  return new Promise(function(res){
    try{
      var r=new FileReader();
      r.onload=function(){
        var im=new Image();
        im.onload=function(){
          try{
            var c=document.createElement("canvas");
            var m=1000; var w=im.width,h=im.height;
            if(w>m||h>m){ var k=Math.min(m/w,m/h); w=Math.round(w*k); h=Math.round(h*k); }
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
  var f = input.files && input.files[0];
  if(!f) return;
  compress(f).then(function(url){
    if(url){ tempImage = url; var p=document.getElementById("f_preview"); p.src=url; p.style.display="block"; }
  });
}
function saveForm(){
  var name = document.getElementById("f_name").value.trim();
  if(!name){ alert("نام الزامی است"); return; }
  var obj = {
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
  updateBadges(true);
  githubMsg("ذخیره موقت انجام شد. حالا «دانلود data.js جدید» را بزن و در گیت‌هاب جایگزین کن.", true);
}
function renderAdminList(){
  var w = document.getElementById("approvedList");
  var c = document.getElementById("approvedCount");
  if(!w) return;
  w.innerHTML = "";
  if(c) c.textContent = faNum(namesData.length);
  if(!namesData.length) w.innerHTML = '<p class="muted" style="text-align:center;padding:1rem">هنوز اسمی ثبت نشده.</p>';
  namesData.forEach(function(x){
    var d = document.createElement("div");
    d.className = "admin-item";
    d.style.cssText = "display:flex;gap:10px;align-items:center;justify-content:space-between;border:1px solid #eee;border-radius:10px;padding:8px 10px;margin:6px 0;background:#fff";
    var first = escapeHtml((x.name||"")[0]||"ن");
    var img = x.image ? '<img src="'+x.image+'" style="width:44px;height:44px;object-fit:cover;border-radius:8px">' : '<div style="width:44px;height:44px;border-radius:8px;background:#222;color:#e8b64c;display:flex;align-items:center;justify-content:center;font-weight:700">'+first+'</div>';
    d.innerHTML = '<div style="display:flex;gap:10px;align-items:center">'+img+'<div><b>'+escapeHtml(x.name)+'</b><br><small style="color:#777">'+escapeHtml(x.date)+' • '+escapeHtml(x.place)+' • 🕯️ '+faNum(x.candles)+'</small></div></div>';
    var btns = document.createElement("div");
    btns.style.cssText = "display:flex;gap:6px";
    var be = document.createElement("button"); be.className="btn-small"; be.textContent="ویرایش";
    var bd = document.createElement("button"); bd.className="btn-small danger"; bd.textContent="حذف";
    be.onclick = function(){
      editId = x.id;
      document.getElementById("f_name").value = x.name;
      document.getElementById("f_age").value = x.age||"";
      document.getElementById("f_date").value = x.date;
      document.getElementById("f_place").value = x.place||"";
      document.getElementById("f_desc").value = x.desc||"";
      tempImage = x.image||"";
      var p = document.getElementById("f_preview");
      if(tempImage){ p.src=tempImage; p.style.display="block"; } else p.style.display="none";
      document.getElementById("formTitle").textContent="ویرایش";
      document.getElementById("addForm").style.display="block";
      window.scrollTo({top:0,behavior:"smooth"});
    };
    bd.onclick = function(){
      if(confirm("حذف شود؟")){ namesData = namesData.filter(function(y){ return String(y.id)!==String(x.id); }); saveLocal(); render(); updateBadges(true); }
    };
    btns.appendChild(be); btns.appendChild(bd);
    d.appendChild(btns); w.appendChild(d);
  });
}
function exportJSON(){
  dl("names.json", JSON.stringify(namesData,null,2));
  githubMsg("دانلود شد. همین فایل را در گیت‌هاب جای names.json بگذار و Commit بزن.", true);
}
function exportDataJs(){
  dl("data.js", buildDataJs(namesData));
  githubMsg("دانلود شد. همین فایل را در گیت‌هاب جای data.js بگذار و Commit بزن.", true);
}
function copyDataJs(){
  var t = buildDataJs(namesData);
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(function(){ githubMsg("کپی شد. در گیت‌هاب Paste کن و Commit بزن.", true); }, function(){ githubMsg("کپی نشد، دانلود را بزن.", false); });
  } else {
    var ta = document.createElement("textarea");
    ta.value = t; document.body.appendChild(ta); ta.select();
    try{ document.execCommand("copy"); githubMsg("کپی شد.", true); }catch(e){ githubMsg("کپی نشد.", false); }
    ta.remove();
  }
}
function importJSON(input){
  var f = input.files && input.files[0];
  if(!f) return;
  var r = new FileReader();
  r.onload = function(){
    try{
      var j = JSON.parse(r.result);
      var arr = Array.isArray(j) ? j : (j.items || j.data);
      var clean = cleanList(arr);
      if(!clean) throw 0;
      namesData = clean; saveLocal(); render(); updateBadges(true);
      githubMsg("فایل وارد شد ("+clean.length+" اسم). حالا دانلود کن و در گیت‌هاب بگذار.", true);
    }catch(e){ githubMsg("فایل معتبر نیست.", false); }
    input.value="";
  };
  r.readAsText(f);
}
function resetData(){
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  if(SITE_CACHE && SITE_CACHE.length){
    namesData = SITE_CACHE.map(function(x){ return Object.assign({}, x); });
    try{ setP(namesData); }catch(e){}
    render(); updateBadges(false);
    githubMsg("از نسخه منتشرشده بارگذاری شد ("+namesData.length+" اسم).", true);
  } else {
    loadData();
  }
}
document.addEventListener("DOMContentLoaded", loadData);