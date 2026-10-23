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
async function loadData(){
let saved = localStorage.getItem(STORAGE_KEY);
if(saved){
try{ namesData = JSON.parse(saved); render(); return; }catch(e){}
}
try{
let r = await fetch("names.json");
if(r.ok){ namesData = await r.json(); }
else namesData = [...DEFAULT_DATA];
}catch(e){ namesData = [...DEFAULT_DATA]; }
render();
}
function saveLocal(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(namesData)); }
function saveVoted(){ localStorage.setItem(VOTED_KEY, JSON.stringify(voted)); }
function hasVoted(id){ return voted.includes(id); }
function faNum(n){ return Number(n).toLocaleString("fa-IR"); }
function render(){
let q = (document.getElementById("searchInput").value || "").trim();
let f = document.getElementById("filterDate").value;
let grid = document.getElementById("cardsGrid");
grid.innerHTML = "";
let filtered = namesData.filter(x=>{
let okQ = !q || x.name.includes(q) || (x.desc||"").includes(q);
let okF = !f || x.date===f;
return okQ && okF;
});
document.getElementById("emptyMsg").style.display = filtered.length? "none":"block";
filtered.forEach((x,i)=>{
let div = document.createElement("div");
div.className="card"; div.style.animationDelay=(i*0.05)+"s";
let imgHtml = x.image ? `<img src="${x.image}">` : `<div class="avatar">${x.name.trim()[0]||"•"}</div>`;
let v = hasVoted(x.id);
let btnText = v ? `🕯️ روشن کردی ✓ ${faNum(x.candles||0)}` : `🕯️ ${faNum(x.candles||0)} شمع`;
let btnClass = v ? "candle-btn voted" : "candle-btn";
div.innerHTML = `<div class="card-img">${imgHtml}</div>
<div class="card-body"><h3>${x.name}</h3>
<div class="card-meta">${x.date||""} ۱۴۰۴ • ${x.place||"میناب"} ${x.age? "• "+x.age+" ساله":""}</div>
<div class="card-desc">${x.desc||""}</div>
<div class="card-foot"><button class="${btnClass}" onclick="event.stopPropagation();lightCandle(${x.id})">${btnText}</button><span style="font-size:12px;color:#6f7a90">جزئیات ←</span></div></div>`;
div.onclick = ()=> openDetail(x.id);
grid.appendChild(div);
});
document.getElementById("statCount").textContent = faNum(namesData.length);
let total = namesData.reduce((s,x)=>s+(x.candles||0),0);
document.getElementById("statCandles").textContent = faNum(total);
renderAdminList();
}
function openDetail(id){
let x = namesData.find(a=>a.id===id); if(!x) return;
let imgHtml = x.image? `<img src="${x.image}" class="detail-img">` : `<div style="font-size:80px;text-align:center">🕯️</div>`;
let v = hasVoted(x.id);
let btnLabel = v ? `🕯️ تو برایش شمع روشن کردی ✓ (${faNum(x.candles||0)})` : `🕯️ روشن کردن شمع به یادش (${faNum(x.candles||0)})`;
document.getElementById("detailContent").innerHTML = `<div class="detail-box">${imgHtml}<h2>${x.name}</h2>
<p style="color:#e8b64c">${x.age? x.age+" ساله • ":""}${x.date||""} ۱۴۰۴ • ${x.place||"میناب"}</p>
<p style="color:#c2cadb;margin:12px 0;line-height:2.2">${x.desc||""}</p>
<button class="btn-gold" onclick="lightCandle(${x.id}, true)"> ${btnLabel} </button>
${v ? `<p class="muted" style="margin-top:8px">هر نفر فقط یک شمع می‌تواند روشن کند.</p>` : ``}</div>`;
openModal("detailModal");
}
function lightCandle(id, fromDetail){
let x = namesData.find(a=>a.id===id); if(!x) return;
if(hasVoted(id)){
alert("تو قبلاً برای این عزیز شمع روشن کردی 🕯️");
if(fromDetail) openDetail(id);
return;
}
x.candles=(x.candles||0)+1;
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
function showAddForm(){ editId=null; tempImage=""; document.getElementById("formTitle").textContent="افزودن جاویدنام جدید"; ["f_name","f_age","f_place","f_desc"].forEach(id=>document.getElementById(id).value=""); document.getElementById("f_preview").style.display="none"; document.getElementById("addForm").style.display="block"; }
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
if(tempImage){ p.src=tempImage; p.style.display="block"; } else p.style.display="none";
document.getElementById("addForm").style.display="block";
}
function deleteItem(id){ if(!confirm("حذف شود؟")) return; namesData=namesData.filter(a=>a.id!==id); saveLocal(); render(); }
function previewImage(input){
let f=input.files[0]; if(!f) return;
if(f.size>2500000 && !confirm("حجم عکس بالاست (بیشتر از ۲.۵ مگ). ادامه می‌دهی؟")) return;
let r=new FileReader();
r.onload=e=>{ tempImage=e.target.result; let p=document.getElementById("f_preview"); p.src=tempImage; p.style.display="block"; };
r.readAsDataURL(f);
}
function saveForm(){
let name=document.getElementById("f_name").value.trim();
if(!name){ alert("اسم را بنویس"); return; }
let obj={ name, age:document.getElementById("f_age").value.trim(), date:document.getElementById("f_date").value, place:document.getElementById("f_place").value.trim()||"میناب", desc:document.getElementById("f_desc").value.trim(), image:tempImage };
if(editId){ let x=namesData.find(a=>a.id===editId); Object.assign(x,obj); }
else{ obj.id=Date.now(); obj.candles=0; namesData.unshift(obj); }
saveLocal(); render(); hideAddForm(); alert("ذخیره شد ✅");
}
function renderAdminList(){
let box=document.getElementById("adminList"); if(!box) return;
box.innerHTML = namesData.map(x=>`<div class="admin-item">${x.image?`<img src="${x.image}">`:`<img src="" style="display:none"><div class="avatar" style="width:56px;height:56px;font-size:24px">${x.name[0]}</div>`}<div class="a-info"><b>${x.name}</b><br><small>${x.date} • ${x.place} • 🕯️ ${x.candles||0}</small></div><button class="btn-small" onclick="editItem(${x.id})">ویرایش</button><button class="btn-small danger" onclick="deleteItem(${x.id})">حذف</button></div>`).join("") || "<p class='muted'>هنوز اسمی ثبت نشده.</p>";
}
function exportJSON(){
let blob=new Blob([JSON.stringify(namesData,null,2)],{type:"application/json"});
let a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="names.json"; a.click();
}
function importJSON(input){
let f=input.files[0]; if(!f) return;
let r=new FileReader();
r.onload=e=>{ try{ let d=JSON.parse(e.target.result); if(Array.isArray(d)){ namesData=d; saveLocal(); render(); alert("JSON وارد شد ✅"); } else alert("فایل معتبر نیست"); }catch(err){ alert("خطا در فایل"); } };
r.readAsText(f);
}
function resetData(){ if(!confirm("همه به حالت اول برگردد؟")) return; localStorage.removeItem(STORAGE_KEY); namesData=[...DEFAULT_DATA]; saveLocal(); render(); }
loadData();