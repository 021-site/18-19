const ADMIN_PASSWORD = "s@dr@-18-19=40000";
const STORAGE_KEY = "minab_names_v2";
const OLD_KEY = "minab_names_v1";
const VOTED_KEY = "minab_voted_v1";
const LAST_SUBMIT_KEY = "minab_last_submit_v1";
let namesData = [];
let isAdmin = false;
let editId = null;
let tempImage = "";
let tempPublicImage = "";
let voted = [];
try { voted = JSON.parse(localStorage.getItem(VOTED_KEY) || "[]"); } catch(e){ voted = []; }
const DEFAULT_DATA = [
{ id: 1, name: "نمونه: امیر مینابی", age: "۱۷", date: "18 دی", place: "میناب", desc: "این یک اسم نمونه است. از پنل ادمین حذفش کن و اسم واقعی را با عکس از گالری اضافه کن.", image: "", candles: 12, status: "approved", createdAt: 1 },
{ id: 2, name: "نمونه: سارا مینابی", age: "۱۶", date: "19 دی", place: "میناب", desc: "این هم نمونه دوم است برای تست ظاهر سایت. متن یادبود را اینجا بنویس.", image: "", candles: 8, status: "approved", createdAt: 2 }
];
const BAD_WORDS = ["کیر","کون","کسکش","کصکش","جنده","قحبه","حرومزاده","حرمزاده","بیناموس","مادرجنده","مادرقحبه","کثافت","کسافت","پورن","سکسی","سکس","فاک","fuck","shit","bitch","whore","porn","sex","pussy","dick"];
function normalizeText(s){
let t = String(s || "").toLowerCase();
t = t.replace(/ي/g,"ی").replace(/ك/g,"ک").replace(/‌|‍|‎|‏/g,"").replace(/[ً-ٰٟ]/g,"");
t = t.replace(/(.)\1{2,}/g,"$1");
return t;
}
function hasShortWord(t, w){
let parts = w.split("").map(function(ch){ return ch.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); });
let inner = parts.join("[\\s_\\-\\.\\*]*");
try{
let re = new RegExp("(^|[^آ-یa-zA-Z0-9])" + inner + "([^آ-یa-zA-Z0-9]|$)");
return re.test(t);
}catch(e){ return t.indexOf(w) !== -1; }
}
function containsBadWord(s){
let t = normalizeText(s).replace(/عکس/g,"__AKS__");
let stripped = t.replace(/[\s_\-\.\*×+،,؛:!?؟()\[\]{}"'«»\/\\|0-9۰-۹]+/g,"");
for(let w of BAD_WORDS){
let nw = normalizeText(w);
if(!nw) continue;
if(nw.length <= 4){
if(hasShortWord(t, nw)) return w;
}else{
if(t.indexOf(nw) !== -1) return w;
let nws = nw.replace(/[\s]+/g,"");
if(nws && stripped.indexOf(nws) !== -1) return w;
}
}
return null;
}
function normalizeDate(d){
let s = String(d || "");
if(s.indexOf("19") !== -1 || s.indexOf("۱۹") !== -1) return "19 دی";
return "18 دی";
}
function normalizeItem(x, i){
let id = (x && x.id != null) ? x.id : (Date.now() + (i||0));
return {
id: id,
name: String((x && x.name) || "").slice(0,80),
age: String((x && x.age) || "").slice(0,10),
date: normalizeDate(x && x.date),
place: String((x && x.place) || "میناب").slice(0,60),
desc: String((x && x.desc) || "").slice(0,600),
image: (x && x.image) || "",
candles: Number((x && x.candles) || 0),
status: (x && x.status === "pending") ? "pending" : "approved",
createdAt: (x && x.createdAt) || Date.now()
};
}
function escapeHtml(s){
return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
});
}
async function loadData(){
let local = null;
try{ local = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }catch(e){}
if(!Array.isArray(local)){
try{
let old = localStorage.getItem(OLD_KEY);
if(old){ let a = JSON.parse(old); if(Array.isArray(a)) local = a; }
}catch(e){}
}
let remote = [];
try{
let r = await fetch("names.json?v=" + Date.now(), {cache:"no-store"});
if(r.ok){
let d = await r.json();
let arr = Array.isArray(d) ? d : (d && Array.isArray(d.approved) ? d.approved.concat(d.pending||[]) : []);
if(Array.isArray(arr)) remote = arr.map(function(x,i){ return normalizeItem(x,i); });
}
}catch(e){}
if(remote.length){
let ids = {};
remote.forEach(function(x){ ids[String(x.id)] = true; });
if(Array.isArray(local)){
let lcs = local.map(function(x,i){ return normalizeItem(x,i); });
lcs.forEach(function(x){
if(!ids[String(x.id)]){
if(x.status === "pending") remote.unshift(x);
}else{
let f = null;
for(let k=0;k<remote.length;k++){ if(String(remote[k].id)===String(x.id)){ f=remote[k]; break; } }
if(f && Number(x.candles) > Number(f.candles)) f.candles = x.candles;
}
});
}
namesData = remote;
saveLocal();
}else if(Array.isArray(local) && local.length){
namesData = local.map(function(x,i){ return normalizeItem(x,i); });
}else{
namesData = DEFAULT_DATA.map(function(x,i){ return normalizeItem(x,i); });
try{ saveLocal(); }catch(e){}
}
render();
}
function saveLocal(){
try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(namesData)); }
catch(e){ alert("حافظه مرورگر پر شد. عکس کوچک‌تری انتخاب کن."); }
}
function saveVoted(){ try{ localStorage.setItem(VOTED_KEY, JSON.stringify(voted)); }catch(e){} }
function hasVoted(id){
for(let i=0;i<voted.length;i++){ if(String(voted[i])===String(id)) return true; }
return false;
}
function faNum(n){ return Number(n || 0).toLocaleString("fa-IR"); }
function render(){
let qEl = document.getElementById("searchInput");
let fEl = document.getElementById("filterDate");
let grid = document.getElementById("cardsGrid");
if(!grid) return;
let q = (qEl && qEl.value || "").trim();
let f = (fEl && fEl.value || "");
grid.innerHTML = "";
let approvedAll = namesData.filter(function(x){ return x.status !== "pending"; });
let filtered = approvedAll.filter(function(x){
let okQ = !q || (x.name||"").indexOf(q) !== -1 || (x.desc||"").indexOf(q) !== -1 || (x.place||"").indexOf(q) !== -1;
let okF = !f || x.date===f;
return okQ && okF;
});
document.getElementById("emptyMsg").style.display = filtered.length ? "none" : "block";
filtered.forEach(function(x,i){
let div = document.createElement("div");
div.className="card"; div.style.animationDelay=(i*0.05)+"s";
let safeName = escapeHtml(x.name);
let firstChar = escapeHtml((x.name||"").trim()[0]||"•");
let imgHtml = x.image ? '<img src="'+x.image+'" alt="'+safeName+'" loading="lazy">' : '<div class="avatar">'+firstChar+'</div>';
let v = hasVoted(x.id);
let btnText = v ? '🕯️ روشن کردی ✓ '+faNum(x.candles||0) : '🕯️ '+faNum(x.candles||0)+' شمع';
let btnClass = v ? "candle-btn voted" : "candle-btn";
div.innerHTML = '<div class="card-img">'+imgHtml+'</div><div class="card-body"><h3>'+safeName+'</h3><div class="card-meta">'+escapeHtml(x.date||"")+' ۱۴۰۴ • '+escapeHtml(x.place||"میناب")+(x.age ? " • "+escapeHtml(x.age)+" ساله" : "")+'</div><div class="card-desc">'+escapeHtml(x.desc||"")+'</div><div class="card-foot"><button class="'+btnClass+'">'+btnText+'</button><span style="font-size:12px;color:#6f7a90">جزئیات ←</span></div></div>';
div.querySelector("button").addEventListener("click", function(ev){ ev.stopPropagation(); lightCandle(x.id); });
div.onclick = (function(id){ return function(){ openDetail(id); }; })(x.id);
grid.appendChild(div);
});
document.getElementById("statCount").textContent = faNum(approvedAll.length);
let total = approvedAll.reduce(function(s,x){ return s+(Number(x.candles)||0); },0);
document.getElementById("statCandles").textContent = faNum(total);
renderAdminList();
}
function openDetail(id){
let x = null;
for(let i=0;i<namesData.length;i++){ if(String(namesData[i].id)===String(id)) x=namesData[i]; }
if(!x || x.status==="pending") return;
let safeName = escapeHtml(x.name);
let imgHtml = x.image ? '<img src="'+x.image+'" class="detail-img" alt="'+safeName+'">' : '<div style="font-size:80px;text-align:center">🕯️</div>';
let v = hasVoted(x.id);
let btnLabel = v ? '🕯️ تو برایش شمع روشن کردی ✓ ('+faNum(x.candles||0)+')' : '🕯️ روشن کردن شمع به یادش ('+faNum(x.candles||0)+')';
document.getElementById("detailContent").innerHTML = '<div class="detail-box">'+imgHtml+'<h2>'+safeName+'</h2><p style="color:#e8b64c">'+(x.age ? escapeHtml(x.age)+" ساله • " : "")+escapeHtml(x.date||"")+' ۱۴۰۴ • '+escapeHtml(x.place||"میناب")+'</p><p style="color:#c2cadb;margin:12px 0;line-height:2.2">'+escapeHtml(x.desc||"")+'</p><button class="btn-gold" id="detailCandleBtn">'+btnLabel+'</button>'+(v ? '<p class="muted" style="margin-top:8px">هر نفر فقط یک شمع می‌تواند روشن کند.</p>' : '')+'</div>';
document.getElementById("detailCandleBtn").onclick = function(){ lightCandle(x.id, true); };
openModal("detailModal");
}
function lightCandle(id, fromDetail){
let x = null;
for(let i=0;i<namesData.length;i++){ if(String(namesData[i].id)===String(id)) x=namesData[i]; }
if(!x) return;
if(hasVoted(id)){
alert("تو قبلاً برای این عزیز شمع روشن کردی 🕯️");
if(fromDetail) openDetail(id);
return;
}
x.candles=(Number(x.candles)||0)+1;
voted.push(x.id);
saveLocal(); saveVoted(); render();
if(fromDetail) openDetail(id);
}
function openModal(id){ document.getElementById(id).classList.add("show"); }
function closeModal(id){ document.getElementById(id).classList.remove("show"); }
function openAdminLogin(){
if(isAdmin){ openModal("adminModal"); renderAdminList(); }
else openModal("loginModal");
}
function doLogin(){
let v = document.getElementById("adminPass").value;
if(v===ADMIN_PASSWORD){ isAdmin=true; closeModal("loginModal"); openModal("adminModal"); renderAdminList(); document.getElementById("adminPass").value=""; }
else alert("رمز اشتباه است");
}
function doLogout(){ isAdmin=false; closeModal("adminModal"); }
function showAddForm(){ editId=null; tempImage=""; document.getElementById("formTitle").textContent="افزودن جاویدنام جدید (مستقیم تاییدشده)"; ["f_name","f_age","f_place","f_desc"].forEach(function(id){document.getElementById(id).value="";}); document.getElementById("f_date").value="18 دی"; document.getElementById("f_preview").style.display="none"; try{document.getElementById("f_image").value="";}catch(e){} document.getElementById("addForm").style.display="block"; }
function hideAddForm(){ document.getElementById("addForm").style.display="none"; }
function editItem(id){
let x = null;
for(let i=0;i<namesData.length;i++){ if(String(namesData[i].id)===String(id)) x=namesData[i]; }
if(!x) return;
editId=x.id; tempImage=x.image||"";
document.getElementById("formTitle").textContent="ویرایش: "+x.name;
document.getElementById("f_name").value=x.name||"";
document.getElementById("f_age").value=x.age||"";
document.getElementById("f_date").value=x.date||"18 دی";
document.getElementById("f_place").value=x.place||"";
document.getElementById("f_desc").value=x.desc||"";
let p=document.getElementById("f_preview");
if(tempImage){ p.src=tempImage; p.style.display="block"; } else { p.removeAttribute("src"); p.style.display="none"; }
document.getElementById("addForm").style.display="block";
openModal("adminModal");
}
function deleteItem(id){ if(!confirm("حذف شود؟")) return; namesData=namesData.filter(function(a){ return String(a.id)!==String(id); }); saveLocal(); render(); }
function approveItem(id){
let x = null;
for(let i=0;i<namesData.length;i++){ if(String(namesData[i].id)===String(id)) x=namesData[i]; }
if(!x) return;
let bad = containsBadWord((x.name||"")+" "+(x.place||"")+" "+(x.desc||""));
if(bad){ if(!confirm("این مورد شامل واژه مشکوک ("+bad+") است. باز هم تایید شود؟")) return; }
x.status="approved"; saveLocal(); render();
}
function compressFile(file, cb){
let r=new FileReader();
r.onload=function(e){
let img=new Image();
img.onload=function(){
let max=800;
let w=img.width, h=img.height;
let scale=Math.min(1, max/Math.max(w,h));
let cw=Math.max(1,Math.round(w*scale)), ch=Math.max(1,Math.round(h*scale));
let c=document.createElement("canvas"); c.width=cw; c.height=ch;
c.getContext("2d").drawImage(img,0,0,cw,ch);
try{ cb(c.toDataURL("image/jpeg",0.82)); }
catch(err){ cb(e.target.result); }
};
img.onerror=function(){ cb(e.target.result); };
img.src=e.target.result;
};
r.readAsDataURL(file);
}
function previewImage(input){
let f=input.files && input.files[0]; if(!f) return;
compressFile(f, function(data){
tempImage=data;
let p=document.getElementById("f_preview"); p.src=tempImage; p.style.display="block";
});
}
function previewPublicImage(input){
let f=input.files && input.files[0]; if(!f) return;
compressFile(f, function(data){
tempPublicImage=data;
let p=document.getElementById("p_preview"); p.src=tempPublicImage; p.style.display="block";
});
}
function submitPublic(){
let msg = document.getElementById("publicMsg");
let name=document.getElementById("p_name").value.trim();
let age=document.getElementById("p_age").value.trim();
let date=document.getElementById("p_date").value;
let place=document.getElementById("p_place").value.trim()||"میناب";
let desc=document.getElementById("p_desc").value.trim();
msg.className="muted"; msg.textContent="";
if(name.length<2){ msg.className="muted error"; msg.textContent="اسم را کامل بنویس."; alert("اسم را بنویس"); return; }
let bad = containsBadWord(name+" "+place+" "+desc);
if(bad){ msg.className="muted error"; msg.textContent="متن شما شامل واژه نامناسب است و ثبت نشد."; alert("این متن قابل ثبت نیست. لطفاً با ادب بنویس 🙏"); return; }
let dup = false;
for(let i=0;i<namesData.length;i++){ if((namesData[i].name||"").trim()===name) dup=true; }
if(dup){ msg.className="muted error"; msg.textContent="این اسم قبلاً ثبت شده است."; alert("این اسم قبلاً ثبت شده."); return; }
try{
let last = Number(localStorage.getItem(LAST_SUBMIT_KEY)||0);
if(Date.now()-last < 120000){ alert("لطفاً دو دقیقه صبر کن بعد دوباره ثبت کن."); return; }
}catch(e){}
let obj={ id: Date.now(), name: name, age: age, date: date, place: place, desc: desc, image: tempPublicImage, candles: 0, status: "pending", createdAt: Date.now() };
namesData.unshift(obj);
saveLocal();
try{ localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now())); }catch(e){}
document.getElementById("p_name").value=""; document.getElementById("p_age").value=""; document.getElementById("p_place").value=""; document.getElementById("p_desc").value="";
tempPublicImage=""; let pp=document.getElementById("p_preview"); pp.removeAttribute("src"); pp.style.display="none"; try{document.getElementById("p_image").value="";}catch(e){}
render();
msg.className="muted success"; msg.textContent="✅ ثبت شد و به مدیریت رفت. حالا دکمه «دریافت فایل برای ارسال به مدیر» را بزن و برای مدیر بفرست تا در گیت‌هاب ثبت نهایی شود.";
alert("ثبت شد ✅ بعد از تایید مدیریت نمایش داده می‌شود.");
}
function exportMyPending(){
let mine = namesData.filter(function(x){ return x.status==="pending"; });
if(!mine.length){ alert("مورد در انتظاری در این گوشی نیست."); return; }
let blob=new Blob([JSON.stringify(mine,null,2)],{type:"application/json"});
let a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="my-submit.json"; document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href); a.remove();},500);
}
function saveForm(){
let name=document.getElementById("f_name").value.trim();
if(!name){ alert("اسم را بنویس"); return; }
let bad = containsBadWord(name+" "+document.getElementById("f_place").value+" "+document.getElementById("f_desc").value);
if(bad && !confirm("متن شامل واژه مشکوک ("+bad+") است. ذخیره شود؟")) return;
let obj={ name: name, age:document.getElementById("f_age").value.trim(), date:document.getElementById("f_date").value, place:document.getElementById("f_place").value.trim()||"میناب", desc:document.getElementById("f_desc").value.trim(), image:tempImage };
if(editId){
let x = null;
for(let i=0;i<namesData.length;i++){ if(String(namesData[i].id)===String(editId)) x=namesData[i]; }
if(x) { x.name=obj.name; x.age=obj.age; x.date=obj.date; x.place=obj.place; x.desc=obj.desc; x.image=obj.image; }
}
else{ obj.id=Date.now(); obj.candles=0; obj.status="approved"; obj.createdAt=Date.now(); namesData.unshift(obj); }
saveLocal(); render(); hideAddForm(); alert("ذخیره شد ✅ حالا خروجی JSON بگیر و در گیت‌هاب جایگزین کن.");
}
function renderAdminList(){
let pBox=document.getElementById("pendingBox"); if(!pBox) return;
let aBox=document.getElementById("adminList");
let pendings = namesData.filter(function(x){ return x.status==="pending"; });
let approved = namesData.filter(function(x){ return x.status!=="pending"; });
document.getElementById("pendingCount").textContent = faNum(pendings.length);
if(!pendings.length){ pBox.innerHTML="<p class='muted'>موردی در انتظار نیست.</p>"; }
else{
pBox.innerHTML = pendings.map(function(x){
let safeName = escapeHtml(x.name);
let firstChar = escapeHtml((x.name||"").trim()[0]||"•");
let thumb = x.image ? '<img src="'+x.image+'" alt="">' : '<div class="avatar">'+firstChar+'</div>';
return '<div class="admin-item pending-item">'+thumb+'<div class="a-info"><b>'+safeName+'</b> <span class="badge-pending">در انتظار</span><br><small>'+escapeHtml(x.date||"")+' • '+escapeHtml(x.place||"")+' • '+escapeHtml((x.desc||"").slice(0,60))+'</small></div><button class="btn-approve" data-act="approve" data-id="'+x.id+'">تایید</button><button class="btn-small" data-act="edit" data-id="'+x.id+'">ویرایش</button><button class="btn-small danger" data-act="del" data-id="'+x.id+'">حذف</button></div>';
}).join("");
}
if(!approved.length){ aBox.innerHTML="<p class='muted'>هنوز اسمی ثبت نشده.</p>"; }
else{
aBox.innerHTML = approved.map(function(x){
let safeName = escapeHtml(x.name);
let firstChar = escapeHtml((x.name||"").trim()[0]||"•");
let thumb = x.image ? '<img src="'+x.image+'" alt="">' : '<div class="avatar">'+firstChar+'</div>';
return '<div class="admin-item">'+thumb+'<div class="a-info"><b>'+safeName+'</b><br><small>'+escapeHtml(x.date||"")+' • '+escapeHtml(x.place||"")+' • 🕯️ '+faNum(x.candles||0)+'</small></div><button class="btn-small" data-act="edit" data-id="'+x.id+'">ویرایش</button><button class="btn-small danger" data-act="del" data-id="'+x.id+'">حذف</button></div>';
}).join("");
}
let btns = document.querySelectorAll("#pendingBox button, #adminList button");
btns.forEach(function(b){
let raw = b.getAttribute("data-id");
let id = isNaN(Number(raw)) ? raw : Number(raw);
let act = b.getAttribute("data-act");
if(act==="approve") b.onclick=function(){ approveItem(id); };
else if(act==="edit") b.onclick=function(){ editItem(id); };
else b.onclick=function(){ deleteItem(id); };
});
}
function exportJSON(){
let blob=new Blob([JSON.stringify(namesData,null,2)],{type:"application/json"});
let a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="names.json"; document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href); a.remove();},500);
}
function importJSON(input){
let f=input.files && input.files[0]; if(!f) return;
let r=new FileReader();
r.onload=function(e){
try{
let d=JSON.parse(e.target.result);
let arr = Array.isArray(d) ? d : (d && Array.isArray(d.approved) ? d.approved.concat(d.pending||[]) : null);
if(!arr){ alert("فایل معتبر نیست"); return; }
let map = {};
namesData.forEach(function(x){ map[String(x.id)] = x; });
arr.map(function(x,i){ return normalizeItem(x,i); }).forEach(function(n){
if(map[String(n.id)]){ Object.assign(map[String(n.id)], n); }
else { namesData.unshift(n); }
});
saveLocal(); render(); alert("JSON ادغام شد ✅ موارد جدید رفتند توی صف تایید.");
}catch(err){ alert("خطا در فایل"); }
input.value="";
};
r.readAsText(f);
}
function resetData(){ if(!confirm("از گیت‌هاب دوباره خوانده شود؟ تغییرهای ذخیره‌نشده این گوشی پاک می‌شود.")) return; try{localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(OLD_KEY);}catch(e){} location.reload(); }
document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ ["detailModal","loginModal","adminModal"].forEach(function(id){ let m=document.getElementById(id); if(m) m.classList.remove("show"); }); } });
loadData();