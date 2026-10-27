// ============================================
// یادبود ۱۸ و ۱۹ دی — دیتا استور V7
// شبیه JSON ولی خیلی بهتر برای آپدیت
// ============================================
// روش آپدیت ۳۰ ثانیه‌ای:
// ۱) بلوک داخل items را کپی کن و اسم جدید را بنویس
// ۲) image را خالی "" بگذار (آواتار خودکار می‌سازد)
//    یا آدرس بده مثل "images/ali.jpg"
// ۳) version را یکی زیاد کن تا کش گیت‌هاب بشکند
// ۴) همین فایل را در گیت‌هاب جایگزین data.js کن و Commit بزن
// نکته: عکس base64 داخل این فایل نگذار، سنگین می‌شود.
// ============================================

window.SITE_DATA = {
  version: 7,
  updatedAt: "۱۴۰۴/۱۰/۲۰",
  adminPassword: "s@dr@-18-19=40000",

  items: [
    {
      id: "1793028370234",
      name: "سپهر ابراهیمی",
      age: "۱۹",
      date: "18 دی",
      place: "شهرک اندیشه، تهران",
      desc: "",
      image: "",
      candles: 1
    },
    {
      id: "1793028370235",
      name: "آرنیکا دباغ",
      age: "۱۵",
      date: "19 دی",
      place: "گرگان",
      desc: "",
      image: "",
      candles: 1
    },
    {
      id: "1793028370236",
      name: "مهرداد (متین) مشتاقی",
      age: "۲۷",
      date: "19 دی",
      place: "اراک",
      desc: "",
      image: "",
      candles: 1
    },
    {
      id: "1793028370237",
      name: "مانی صفرپور",
      age: "۱۸",
      date: "18 دی",
      place: "سلسبیل تهران",
      desc: "",
      image: "",
      candles: 1
    },
    {
      id: "1793028370238",
      name: "دیانا بهادر",
      age: "۱۹",
      date: "19 دی",
      place: "گنبد کاووس",
      desc: "",
      image: "",
      candles: 1
    }
  ]
};

// سازگاری با نسخه قبلی — دست نزن
window.MARTYRS = window.SITE_DATA.items;
window.MEMORIAL_META = { version: window.SITE_DATA.version, adminPassword: window.SITE_DATA.adminPassword };