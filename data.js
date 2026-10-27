// ============================================
// یادبود ۱۸ و ۱۹ دی — دیتا استور V9
// آپدیت: بلوک را کپی کن، مشخصات را عوض کن، version را زیاد کن
// همین فایل را در گیت‌هاب جایگزین data.js کن و Commit بزن
// ============================================

window.SITE_DATA = {
  version: 9,
  updatedAt: "۱۴۰۵/۸/۵",
  adminPassword: "s@dr@-18-19=40000",

  items: [
    {
      "id": "1793102422219",
      "name": "سلام",
      "age": "",
      "date": "18 دی",
      "place": "میناب",
      "desc": "",
      "image": "",
      "candles": 0
    },
    {
      "id": "1793028370237",
      "name": "مانی صفرپور",
      "age": "۱۸",
      "date": "18 دی",
      "place": "سلسبیل تهران",
      "desc": "",
      "image": "",
      "candles": 2
    },
    {
      "id": "1793028370238",
      "name": "دیانا بهادر",
      "age": "۱۹",
      "date": "19 دی",
      "place": "گنبد کاووس",
      "desc": "",
      "image": "",
      "candles": 2
    }
  ]
};

// سازگاری با نسخه قبلی — دست نزن
window.MARTYRS = window.SITE_DATA.items;
window.MEMORIAL_META = { version: window.SITE_DATA.version, adminPassword: window.SITE_DATA.adminPassword };
