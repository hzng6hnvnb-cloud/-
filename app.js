// ===============================
// سَكينة
// التطبيق الإسلامي
// ===============================


// المدن

let currentCity = "جدة";


// مواقيت تجريبية للواجهة
// سيتم ربطها بمواقيت الصلاة الحقيقية في المرحلة التالية

const prayerTimes = {
  جدة: {
    الفجر: "04:51",
    الظهر: "12:21",
    العصر: "15:25",
    المغرب: "18:12",
    العشاء: "19:42"
  },

  الرياض: {
    الفجر: "04:32",
    الظهر: "11:59",
    العصر: "15:27",
    المغرب: "18:01",
    العشاء: "19:31"
  },

  "مكة المكرمة": {
    الفجر: "04:54",
    الظهر: "12:20",
    العصر: "15:23",
    المغرب: "18:18",
    العشاء: "19:48"
  },

  "المدينة المنورة": {
    الفجر: "04:59",
    الظهر: "12:19",
    العصر: "15:27",
    المغرب: "18:22",
    العشاء: "19:52"
  },

  الدمام: {
    الفجر: "04:17",
    الظهر: "11:46",
    العصر: "15:13",
    المغرب: "17:52",
    العشاء: "19:22"
  },

  أبها: {
    الفجر: "04:58",
    الظهر: "12:09",
    العصر: "15:20",
    المغرب: "18:03",
    العشاء: "19:33"
  },

  الطائف: {
    الفجر: "04:54",
    الظهر: "12:18",
    العصر: "15:20",
    المغرب: "18:16",
    العشاء: "19:46"
  },

  تبوك: {
    الفجر: "05:05",
    الظهر: "12:29",
    العصر: "15:39",
    المغرب: "18:35",
    العشاء: "20:05"
  }
};


// تغيير الصفحات

function showPage(pageId) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// اختيار المدينة

function openCityPicker() {
  document.getElementById("cityModal").classList.add("show");
}

function closeCityPicker() {
  document.getElementById("cityModal").classList.remove("show");
}


function selectCity(city) {

  currentCity = city;

  document.getElementById("currentCity").textContent = city;

  closeCityPicker();

  loadPrayerTimes();

}


// تحميل المواقيت

function loadPrayerTimes() {

  const times = prayerTimes[currentCity];

  if (!times) return;

  const cards = document.querySelectorAll(".prayer-card");

  const names = [
    "الفجر",
    "الظهر",
    "العصر",
    "المغرب",
    "العشاء"
  ];

  cards.forEach((card, index) => {

    const name = names[index];

    card.querySelector("strong").textContent =
      convertArabicTime(times[name]);

  });

}


// تحويل الوقت إلى صيغة عربية

function convertArabicTime(time) {

  let [hour, minute] = time.split(":");

  hour = Number(hour);

  const suffix = hour >= 12 ? "م" : "ص";

  if (hour > 12) {
    hour -= 12;
  }

  if (hour === 0) {
    hour = 12;
  }

  return `${toArabic(hour)}:${minute} ${suffix}`;
}


// أرقام عربية

function toArabic(number) {

  return String(number)
    .replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);

}


// ===============================
// العد التنازلي
// ===============================

function updateCountdown() {

  const now = new Date();

  const times = prayerTimes[currentCity];

  const prayers = [
    ["الفجر", times.الفجر],
    ["الظهر", times.الظهر],
    ["العصر", times.العصر],
    ["المغرب", times.المغرب],
    ["العشاء", times.العشاء]
  ];

  let next = null;

  for (const prayer of prayers) {

    const [hour, minute] =
      prayer[1].split(":").map(Number);

    const target = new Date();

    target.setHours(hour);
    target.setMinutes(minute);
    target.setSeconds(0);

    if (target > now) {

      next = {
        name: prayer[0],
        time: prayer[1],
        target
      };

      break;
    }
  }


  // إذا انتهت صلوات اليوم
  if (!next) {

    const [hour, minute] =
      prayers[0][1].split(":").map(Number);

    const target = new Date();

    target.setDate(target.getDate() + 1);

    target.setHours(hour);
    target.setMinutes(minute);
    target.setSeconds(0);

    next = {
      name: "الفجر",
      time: prayers[0][1],
      target
    };
  }


  const difference =
    next.target.getTime() - now.getTime();


  const totalSeconds =
    Math.floor(difference / 1000);

  const hours =
    Math.floor(totalSeconds / 3600);

  const minutes =
    Math.floor((totalSeconds % 3600) / 60);

  const seconds =
    totalSeconds % 60;


  document.getElementById("nextPrayerName")
    .textContent = next.name;

  document.getElementById("nextPrayerTime")
    .textContent = convertArabicTime(next.time);


  document.getElementById("countdown")
    .textContent =
      `${toArabic(String(hours).padStart(2, "0"))}:` +
      `${toArabic(String(minutes).padStart(2, "0"))}:` +
      `${toArabic(String(seconds).padStart(2, "0"))}`;
}


setInterval(updateCountdown, 1000);

updateCountdown();


// ===============================
// القرآن
// ===============================

const surahs = [
  "الفاتحة",
  "البقرة",
  "آل عمران",
  "النساء",
  "المائدة",
  "الأنعام",
  "الأعراف",
  "الأنفال",
  "التوبة",
  "يونس",
  "هود",
  "يوسف",
  "الرعد",
  "إبراهيم",
  "الحجر",
  "النحل",
  "الإسراء",
  "الكهف",
  "مريم",
  "طه",
  "الأنبياء",
  "الحج",
  "المؤمنون",
  "النور",
  "الفرقان",
  "الشعراء",
  "النمل",
  "القصص",
  "العنكبوت",
  "الروم",
  "لقمان",
  "السجدة",
  "الأحزاب",
  "سبأ",
  "فاطر",
  "يس",
  "الصافات",
  "ص",
  "الزمر",
  "غافر",
  "فصلت",
  "الشورى",
  "الزخرف",
  "الدخان",
  "الجاثية",
  "الأحقاف",
  "محمد",
  "الفتح",
  "الحجرات",
  "ق",
  "الذاريات",
  "الطور",
  "النجم",
  "القمر",
  "الرحمن",
  "الواقعة",
  "الحديد",
  "المجادلة",
  "الحشر",
  "الممتحنة",
  "الصف",
  "الجمعة",
  "المنافقون",
  "التغابن",
  "الطلاق",
  "التحريم",
  "الملك",
  "القلم",
  "الحاقة",
  "المعارج",
  "نوح",
  "الجن",
  "المزمل",
  "المدثر",
  "القيامة",
  "الإنسان",
  "المرسلات",
  "النبأ",
  "النازعات",
  "عبس",
  "التكوير",
  "الانفطار",
  "المطففين",
  "الانشقاق",
  "البروج",
  "الطارق",
  "الأعلى",
  "الغاشية",
  "الفجر",
  "البلد",
  "الشمس",
  "الليل",
  "الضحى",
  "الشرح",
  "التين",
  "العلق",
  "القدر",
  "البينة",
  "الزلزلة",
  "العاديات",
  "القارعة",
  "التكاثر",
  "العصر",
  "الهمزة",
  "الفيل",
  "قريش",
  "الماعون",
  "الكوثر",
  "الكافرون",
  "النصر",
  "المسد",
  "الإخلاص",
  "الفلق",
  "الناس"
];


function renderSurahs(list = surahs) {

  const container =
    document.getElementById("surahList");

  container.innerHTML = "";

  list.forEach((name, index) => {

    const item =
      document.createElement("div");

    item.className = "surah";

    item.innerHTML = `
      <div class="surah-number">
        ${toArabic(index + 1)}
      </div>

      <div class="surah-info">
        <b>${name}</b>
        <small>سورة رقم ${toArabic(index + 1)}</small>
      </div>
    `;

    container.appendChild(item);
  });
}


function searchSurahs() {

  const value =
    document.getElementById("surahSearch")
      .value
      .trim();

  const filtered =
    surahs.filter(name =>
      name.includes(value)
    );

  renderSurahs(filtered);
}


renderSurahs();


// ===============================
// الأذكار
// ===============================

const adhkar = [

  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",

  "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ",

  "لَا إِلَهَ إِلَّا اللَّهُ",

  "اللَّهُ أَكْبَرُ",

  "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",

  "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ"

];


function newDhikr() {

  const random =
    Math.floor(Math.random() * adhkar.length);

  document.getElementById("dhikrText")
    .textContent = adhkar[random];

}


// ===============================
// التسبيح
// ===============================

let tasbeehCount = 0;


function increaseTasbeeh() {

  tasbeehCount++;

  document.getElementById("tasbeehNumber")
    .textContent = toArabic(tasbeehCount);

}


function resetTasbeeh() {

  tasbeehCount = 0;

  document.getElementById("tasbeehNumber")
    .textContent = "٠";

}


// ===============================
// بعد الصلاة
// ===============================

function prayedYes() {

  document
    .getElementById("adhkarAfterPrayer")
    .classList.add("show");

}


function prayedNo() {

  document
    .getElementById("afterPrayerBox")
    .style.opacity = ".5";

}


function closeAfterPrayer() {

  document
    .getElementById("adhkarAfterPrayer")
    .classList.remove("show");

  showPage("adhkarPage");

}


// ===============================
// الإعدادات
// ===============================

function openSettings() {

  alert(
    "الإعدادات الكاملة سيتم إضافتها مع النسخة القادمة."
  );

}


// البداية

loadPrayerTimes();
updateCountdown();
