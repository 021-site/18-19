const ADMIN_PASSWORD = "s@dr@-18-19=40000";
const STORAGE_KEY = "minab_names_v1";
const VOTED_KEY = "minab_voted_v1";
let namesData = [];
let isAdmin = false;
let editId = null;
let tempImage = "";
let voted = [];
try { voted = JSON.parse(localStorage.getItem(VOTED_KEY) || "[]"); } catch(e){ voted = []; }
const DEFAULT_DATA = [
{ id: 1, name: "نمونه: امیر مینابی", age: "۱۷", date: "18 دی", place: "میناب", desc: "این یک اسم نمونه است. از پنل ادمین حذفش کن و اسم واقعی را با عکس از گالری اضافه کن.", image: "", candles: 12 },
{ id: 2, name: "نمونه: سارا مینابی", age: "۱۶", date: "19 دی", place: "میناب", desc: "این هم نمونه دوم است برای تست ظاهر سایت. متن یادبود را اینجا بنویس.", image: "", candles: 8 }
];
function escapeHtml(s){
return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
});
}
async function loadData(){
let saved = null;
try { saved = localStorage.getItem(STORAGE_KEY); } catch(e){}
if(saved){
try{ namesData = JSON.parse(saved); if(Array.isArray(namesData)){ render(); return; } }catch(e){}
}
try{
let r = await fetch("names.json");
if(r.ok){ let d = await r.json(); if(Array.isArray(d)){ namesData = d; saveLocal(); render(); return; } }
}catch(e){}
namesData = [...DEFAULT_DATA];
saveLocal();
render();
}
function saveLocal(){
try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(namesData)); }
catch(e){ alert("حافظه مرورگر پر شد. عکس‌ها را کوچک‌تر انتخاب کن."); }
}
function saveVoted(){ try{ localStorage.setItem(VOTED_KEY, JSON.stringify(voted)); }catch(e){} }
function hasVoted(id){ return voted.includes(id); }
function faNum(n){ return Number(n || 0).toLocaleString("fa-IR"); }
function render(){
let qEl = document.getElementById("searchInput");
let fEl = document.getElementById("filterDate");
let grid = document.getElementById("cardsGrid");
if(!grid) return;
let q = (qEl && qEl.value || "").trim();
let f = (fEl && fEl.value || "");
grid.innerHTML = "";
let filtered = namesData.filter(x=>{
let okQ = !q || (x.name||"").includes(q) || (x.desc||"").includes(q) || (x.place||"").includes(q);
let okF = !f || x.date===f;
return okQ && okF;
});
document.getElementById("emptyMsg").style.display = filtered.length ? "none" : "block";
filtered.forEach((x,i)=>{
let div = document.createElement("div");
div.className="card"; div.style.animationDelay=(i*0.05)+"s";
let safeName = escapeHtml(x.name);
let firstChar = escapeHtml((x.name||"").trim()[0]||"•");
let imgHtml = x.image ? `<img src="${x.image}" alt="${safeName}" loading="lazy">` : `<div class="avatar">${firstChar}</div>`;
let v = hasVoted(x.id);
let btnText = v ? `🕯️ روشن کردی ✓ ${faNum(x.candles||0)}` : `🕯️ ${faNum(x.candles||0)} شمع`;
let btnClass = v ? "candle-btn voted" : "candle-btn";
div.innerHTML = `<div class="card-img">${imgHtml}</div>
<div class="card-body"><h3>${safeName}</h3>
<div class="card-meta">${escapeHtml(x.date||"")} ۱۴۰۴ • ${escapeHtml(x.place||"میناب")} ${x.age ? "• "+escapeHtml(x.age)+" ساله" : ""}</div>
<div class="card-desc">${escapeHtml(x.desc||"")}</div>
<div class="card-foot"><button class="${btnClass}">${btnText}</button><span style="font-size:12px;color:#6f7a90">جزئیات ←</span></div></div>`;
div.querySelector("button").addEventListener("click", function(ev){ ev.stopPropagation(); lightCandle(x.id); });
div.onclick = ()=> openDetail(x.id);
grid.appendChild(div);
});
document.getElementById("statCount").textContent = faNum(namesData.length);
let total = namesData.reduce((s,x)=>s+(Number(x.candles)||0),0);
document.getElementById("statCandles").textContent = faNum(total);
renderAdminList();
}
function openDetail(id){
let x = namesData.find(a=>a.id===id); if(!x) return;
let safeName = escapeHtml(x.name);
let imgHtml = x.image ? `<img src="${x.image}" class="detail-img" alt="${safeName}">` : `<div style="font-size:80px;text-align:center">🕯️</div>`;
let v = hasVoted(x.id);
let btnLabel = v ? `🕯️ تو برایش شمع روشن کردی ✓ (${faNum(x.candles||0)})` : `🕯️ روشن کردن شمع به یادش (${faNum(x.candles||0)})`;
document.getElementById("detailContent").innerHTML = `<div class="detail-box">${imgHtml}<h2>${safeName}</h2>
<p style="color:#e8b64c">${x.age ? escapeHtml(x.age)+" ساله • " : ""}${escapeHtml(x.date||"")} ۱۴۰۴ • ${escapeHtml(x.place||"میناب")}</p>
<p style="color:#c2cadb;margin:12px 0;line-height:2.2">${escapeHtml(x.desc||"")}</p>
<button class="btn-gold" id="detailCandleBtn">${btnLabel}</button>
${v ? `<p class="muted" style="margin-top:8px">هر نفر فقط یک شمع می‌تواند روشن کند.</p>` : ``}</div>`;
document.getElementById("detailCandleBtn").onclick = ()=> lightCandle(x.id, true);
openModal("detailModal");
}
function lightCandle(id, fromDetail){
let x = namesData.find(a=>a.id===id); if(!x) return;
if(hasVoted(id)){
alert("تو قبلاً برای این عزیز شمع روشن کردی 🕯️");
if(fromDetail) openDetail(id);
return;
}
x.candles=(Number(x.candles)||0)+1;
voted.push(id);
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
function showAddForm(){ editId=null; tempImage=""; document.getElementById("formTitle").textContent="افزودن جاویدنام جدید"; ["f_name","f_age","f_place","f_desc"].forEach(id=>document.getElementById(id).value=""); document.getElementById("f_date").value="18 دی"; document.getElementById("f_preview").style.display="none"; try{document.getElementById("f_image").value="";}catch(e){} document.getElementById("addForm").style.display="block"; }
function hideAddForm(){ document.getElementById("addForm").style.display="none"; }
function editItem(id){
let x = namesData.find(a=>a.id===id); if(!x) return;
editId=id; tempImage=x.image||"";
document.getElementById("formTitle").textContent="ویرایش: "+x.name;
document.getElementById("f_name").value=x.name||"";
document.getElementById("f_age").value=x.age||"";
document.getElementById("f_date").value=x.date||"18 دی";
document.getElementById("f_place").value=x.place||"";
document.getElementById("f_desc").value=x.desc||"";
let p=document.getElementById("f_preview");
if(tempImage){ p.src=tempImage; p.style.display="block"; } else { p.removeAttribute("src"); p.style.display="none"; }
document.getElementById("addForm").style.display="block";
}
function deleteItem(id){ if(!confirm("حذف شود؟")) return; namesData=namesData.filter(a=>a.id!==id); saveLocal(); render(); }
function previewImage(input){
let f=input.files && input.files[0]; if(!f) return;
let r=new FileReader();
r.onload=e=>{
let img=new Image();
img.onload=()=>{
let max=800;
let w=img.width, h=img.height;
let scale=Math.min(1, max/Math.max(w,h));
let cw=Math.round(w*scale), ch=Math.round(h*scale);
let c=document.createElement("canvas"); c.width=cw; c.height=ch;
c.getContext("2d").drawImage(img,0,0,cw,ch);
try{ tempImage=c.toDataURL("image/jpeg",0.82); }
catch(err){ tempImage=e.target.result; }
let p=document.getElementById("f_preview"); p.src=tempImage; p.style.display="block";
};
img.onerror=()=>{
tempImage=e.target.result;
let p=document.getElementById("f_preview"); p.src=tempImage; p.style.display="block";
};
img.src=e.target.result;
};
r.readAsDataURL(f);
}
function saveForm(){
let name=document.getElementById("f_name").value.trim();
if(!name){ alert("اسم را بنویس"); return; }
let obj={ name, age:document.getElementById("f_age").value.trim(), date:document.getElementById("f_date").value, place:document.getElementById("f_place").value.trim()||"میناب", desc:document.getElementById("f_desc").value.trim(), image:tempImage };
if(editId){ let x=namesData.find(a=>a.id===editId); if(x) Object.assign(x,obj); }
else{ obj.id=Date.now(); obj.candles=0; namesData.unshift(obj); }
saveLocal(); render(); hideAddForm(); alert("ذخیره شد ✅");
}
function renderAdminList(){
let box=document.getElementById("adminList"); if(!box) return;
if(!namesData.length){ box.innerHTML="<p class='muted'>هنوز اسمی ثبت نشده.</p>"; return; }
box.innerHTML = namesData.map(x=>{
let safeName = escapeHtml(x.name);
let firstChar = escapeHtml((x.name||"").trim()[0]||"•");
let thumb = x.image ? `<img src="${x.image}" alt="">` : `<div class="avatar">${firstChar}</div>`;
return `<div class="admin-item">${thumb}<div class="a-info"><b>${safeName}</b><br><small>${escapeHtml(x.date||"")} • ${escapeHtml(x.place||"")} • 🕯️ ${faNum(x.candles||0)}</small></div><button class="btn-small" data-act="edit" data-id="${x.id}">ویرایش</button><button class="btn-small danger" data-act="del" data-id="${x.id}">حذف</button></div>`;
}).join("");
box.querySelectorAll("button").forEach(b=>{
let id=Number(b.getAttribute("data-id"));
if(b.getAttribute("data-act")==="edit") b.onclick=()=>editItem(id);
else b.onclick=()=>deleteItem(id);
});
}
function exportJSON(){
let blob=new Blob([JSON.stringify(namesData,null,2)],{type:"application/json"});
let a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="names.json"; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},500);
}
function importJSON(input){
let f=input.files && input.files[0]; if(!f) return;
let r=new FileReader();
r.onload=e=>{ try{ let d=JSON.parse(e.target.result); if(Array.isArray(d)){ namesData=d; saveLocal(); render(); alert("JSON وارد شد ✅"); } else alert("فایل معتبر نیست"); }catch(err){ alert("خطا در فایل"); } input.value=""; };
r.readAsText(f);
}
function resetData(){ if(!confirm("همه به حالت اول برگردد؟")) return; try{localStorage.removeItem(STORAGE_KEY);}catch(e){} namesData=[...DEFAULT_DATA]; saveLocal(); render(); }
document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ ["detailModal","loginModal","adminModal"].forEach(id=>{ let m=document.getElementById(id); if(m) m.classList.remove("show"); }); } });
loadData();