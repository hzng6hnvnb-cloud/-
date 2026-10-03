/* =====================================================
   سَكينة — app.js
   ===================================================== */

const CONFIG = {
  prayerAPI: "https://api.aladhan.com/v1",
  quranAPI: "https://api.alquran.cloud/v1",

  /*
    صور آيات القرآن من CDN الرسمي
    مثال:
    https://cdn.islamic.network/quran/images/high-resolution/1_1.png
  */
  quranImage:
    "https://cdn.islamic.network/quran/images/high-resolution",

  /*
    صوت السورة من CDN الرسمي
  */
  quranAudio:
    "https://cdn.islamic.network/quran/audio-surah/128",

  /*
    المدن
  */
  cities: {
    "جدة": {
      en: "Jeddah",
      lat: 21.5433,
      lng: 39.1728
    },

    "مكة المكرمة": {
      en: "Makkah",
      lat: 21.3891,
      lng: 39.8579
    },

    "المدينة المنورة": {
      en: "Medina",
      lat: 24.5247,
      lng: 39.5692
    },

    "الرياض": {
      en: "Riyadh",
      lat: 24.7136,
      lng: 46.6753
    },

    "الدمام": {
      en: "Dammam",
      lat: 26.4207,
      lng: 50.0888
    },

    "الخبر": {
      en: "Khobar",
      lat: 26.2172,
      lng: 50.1971
    },

    "الطائف": {
      en: "Taif",
      lat: 21.2703,
      lng: 40.4158
    },

    "أبها": {
      en: "Abha",
      lat: 18.2164,
      lng: 42.5053
    },

    "تبوك": {
      en: "Tabuk",
      lat: 28.3838,
      lng: 36.555
    },

    "حائل": {
      en: "Hail",
      lat: 27.5114,
      lng: 41.7208
    },

    "جازان": {
      en: "Jizan",
      lat: 16.8892,
      lng: 42.5706
    },

    "نجران": {
      en: "Najran",
      lat: 17.565,
      lng: 44.2289
    },

    "بريدة": {
      en: "Buraidah",
      lat: 26.3592,
      lng: 43.9818
    },

    "الجبيل": {
      en: "Jubail",
      lat: 27.0046,
      lng: 49.646
    },

    "ينبع": {
      en: "Yanbu",
      lat: 24.0895,
      lng: 38.0618
    }
  },

  prayers: [
    {
      key: "Fajr",
      name: "الفجر"
    },
    {
      key: "Dhuhr",
      name: "الظهر"
    },
    {
      key: "Asr",
      name: "العصر"
    },
    {
      key: "Maghrib",
      name: "المغرب"
    },
    {
      key: "Isha",
      name: "العشاء"
    }
  ]
};


/* =====================================================
   الحالة
   ===================================================== */

const state = {
  city: localStorage.getItem("sakinaCity") || "جدة",

  prayerData: null,

  surahs: [],

  currentSurah: null,

  currentAyah: 1,

  tasbeeh:
    Number(localStorage.getItem("sakinaTasbeeh")) || 0,

  alertedPrayer: null,

  checkedPrayer: null
};


/* =====================================================
   عند تشغيل الموقع
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  setupNavigation();

  setupCities();

  setupTasbeeh();

  setupSearch();

  setupPrayerButtons();

  setupAdhkar();

  setupQuranReader();

  updateCityUI();

  updateDates();

  renderTasbeeh();

  loadEverything();

  setInterval(updateClockAndPrayer, 1000);

  setInterval(checkPrayerAlerts, 10000);

});


/* =====================================================
   تحميل البيانات
   ===================================================== */

async function loadEverything() {

  try {

    showLoading(true);

    await Promise.all([
      loadPrayerTimes(),
      loadHijriDate(),
      loadSurahs()
    ]);

    renderQibla();

    showLoading(false);

  } catch (error) {

    console.error(error);

    showLoading(false);

    showToast(
      "تعذر تحميل بعض البيانات. تأكد من اتصال الإنترنت."
    );
  }
}


/* =====================================================
   التنقل بين الصفحات
   ===================================================== */

function setupNavigation() {

  document
    .querySelectorAll("[data-page]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const page =
          button.getAttribute("data-page");

        showPage(page);

      });

    });
}


function showPage(pageName) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });


  const page =
    document.getElementById(pageName);

  if (page) {
    page.classList.add("active");
  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page === pageName
      );

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (pageName === "qibla") {
    renderQibla();
  }

}


/* =====================================================
   المدن
   ===================================================== */

function setupCities() {

  const cityList =
    document.getElementById("cityList");

  if (!cityList) return;


  cityList.innerHTML = "";


  Object.keys(CONFIG.cities)
    .forEach(city => {

      const button =
        document.createElement("button");

      button.className = "city-button";

      button.textContent = city;

      if (city === state.city) {
        button.classList.add("active");
      }


      button.addEventListener("click", async () => {

        state.city = city;

        localStorage.setItem(
          "sakinaCity",
          city
        );

        updateCityUI();

        closeCityModal();

        showToast(
          `تم اختيار ${city}`
        );

        await loadEverything();

      });


      cityList.appendChild(button);

    });


  const changeButton =
    document.getElementById("changeCityBtn");

  const settingsButton =
    document.getElementById(
      "settingsCityButton"
    );

  const closeButton =
    document.getElementById(
      "closeCityModal"
    );


  changeButton?.addEventListener(
    "click",
    openCityModal
  );


  settingsButton?.addEventListener(
    "click",
    openCityModal
  );


  closeButton?.addEventListener(
    "click",
    closeCityModal
  );


  document
    .getElementById("cityModal")
    ?.addEventListener("click", event => {

      if (
        event.target.id === "cityModal"
      ) {
        closeCityModal();
      }

    });

}


function openCityModal() {

  const modal =
    document.getElementById("cityModal");

  modal?.classList.remove("hidden");

}


function closeCityModal() {

  const modal =
    document.getElementById("cityModal");

  modal?.classList.add("hidden");

}


function updateCityUI() {

  const current =
    document.getElementById("currentCity");

  const settings =
    document.getElementById("settingsCity");

  if (current) {
    current.textContent = state.city;
  }

  if (settings) {
    settings.textContent = state.city;
  }

}


/* =====================================================
   التاريخ
   ===================================================== */

function updateDates() {

  const now = new Date();


  const gregorian =
    new Intl.DateTimeFormat(
      "ar-SA",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    ).format(now);


  const gregorianElement =
    document.getElementById(
      "gregorianDate"
    );


  if (gregorianElement) {
    gregorianElement.textContent =
      gregorian;
  }

}


/* =====================================================
   التاريخ الهجري
   ===================================================== */

async function loadHijriDate() {

  const now = new Date();

  const day =
    String(now.getDate())
      .padStart(2, "0");

  const month =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const year =
    now.getFullYear();


  const url =
    `${CONFIG.prayerAPI}/gToH/${day}-${month}-${year}?calendarMethod=UAQ`;


  const response =
    await fetch(url);


  if (!response.ok) {
    throw new Error(
      "فشل تحميل التاريخ الهجري"
    );
  }


  const result =
    await response.json();


  const hijri =
    result?.data?.hijri;


  if (!hijri) return;


  const element =
    document.getElementById(
      "hijriDate"
    );


  if (element) {

    element.textContent =
      `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;

  }

}


/* =====================================================
   مواقيت الصلاة
   ===================================================== */

async function loadPrayerTimes() {

  const city =
    CONFIG.cities[state.city];


  if (!city) return;


  /*
    4 = أم القرى في واجهة AlAdhan
  */

  const url =
    `${CONFIG.prayerAPI}/timingsByCity?city=${encodeURIComponent(city.en)}&country=Saudi%20Arabia&method=4`;


  const response =
    await fetch(url);


  if (!response.ok) {

    throw new Error(
      "فشل تحميل مواقيت الصلاة"
    );

  }


  const result =
    await response.json();


  if (
    result.code !== 200 ||
    !result.data
  ) {

    throw new Error(
      "بيانات الصلاة غير متوفرة"
    );

  }


  state.prayerData =
    result.data;


  renderPrayerTimes();

  updateClockAndPrayer();

}


/* =====================================================
   عرض مواقيت الصلاة
   ===================================================== */

function renderPrayerTimes() {

  const grid =
    document.getElementById(
      "prayerGrid"
    );


  if (!grid || !state.prayerData) {
    return;
  }


  const timings =
    state.prayerData.timings;


  grid.innerHTML = "";


  CONFIG.prayers.forEach(prayer => {

    const card =
      document.createElement("div");


    card.className =
      "prayer-card";


    card.dataset.prayer =
      prayer.key;


    const name =
      document.createElement("span");

    name.className =
      "prayer-name";

    name.textContent =
      prayer.name;


    const time =
      document.createElement("span");

    time.className =
      "prayer-time";

    time.textContent =
      cleanTime(
        timings[prayer.key]
      );


    card.appendChild(name);

    card.appendChild(time);

    grid.appendChild(card);

  });

}


/* =====================================================
   الوقت
   ===================================================== */

function cleanTime(time) {

  if (!time) {
    return "--:--";
  }


  return time
    .split(" ")[0]
    .trim();

}


/* =====================================================
   الصلاة القادمة والعد التنازلي
   ===================================================== */

function updateClockAndPrayer() {

  if (!state.prayerData) return;


  const now =
    new Date();


  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();


  let next = null;


  for (const prayer of CONFIG.prayers) {

    const time =
      cleanTime(
        state.prayerData.timings[
          prayer.key
        ]
      );


    const parts =
      time.split(":");


    const hours =
      Number(parts[0]);

    const minutes =
      Number(parts[1]);


    const total =
      hours * 60 + minutes;


    if (
      total >
      currentMinutes
    ) {

      next = {
        ...prayer,
        time,
        total
      };

      break;

    }

  }


  /*
    إذا انتهت صلوات اليوم،
    الصلاة القادمة = الفجر غدًا
  */

  if (!next) {

    const fajr =
      cleanTime(
        state.prayerData.timings.Fajr
      );


    const parts =
      fajr.split(":");


    const hours =
      Number(parts[0]);

    const minutes =
      Number(parts[1]);


    next = {
      key: "Fajr",
      name: "الفجر",
      time: fajr,
      total:
        (hours * 60 + minutes) +
        24 * 60
    };

  }


  const nameElement =
    document.getElementById(
      "nextPrayerName"
    );

  const timeElement =
    document.getElementById(
      "nextPrayerTime"
    );

  const countdownElement =
    document.getElementById(
      "countdown"
    );


  if (nameElement) {
    nameElement.textContent =
      next.name;
  }


  if (timeElement) {
    timeElement.textContent =
      next.time;
  }


  if (countdownElement) {

    const nowSeconds =
      now.getHours() * 3600 +
      now.getMinutes() * 60 +
      now.getSeconds();


    let targetSeconds =
      next.total * 60;


    if (
      next.total >
      24 * 60
    ) {

      targetSeconds =
        (next.total - 24 * 60) *
        60;

      targetSeconds +=
        24 * 60 * 60;

    }


    let difference =
      targetSeconds -
      nowSeconds;


    if (difference < 0) {
      difference +=
        24 * 60 * 60;
    }


    const hours =
      Math.floor(
        difference / 3600
      );


    const minutes =
      Math.floor(
        (difference % 3600) / 60
      );


    const seconds =
      difference % 60;


    countdownElement.textContent =
      `بعد ${hours} س ${minutes} د ${seconds} ث`;

  }


  highlightNextPrayer(next.key);

}


function highlightNextPrayer(
  nextKey
) {

  document
    .querySelectorAll(".prayer-card")
    .forEach(card => {

      card.classList.toggle(
        "active",
        card.dataset.prayer === nextKey
      );

    });

}


/* =====================================================
   تنبيه وقت الصلاة
   ===================================================== */

function checkPrayerAlerts() {

  if (!state.prayerData) {
    return;
  }


  const now =
    new Date();


  const current =
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;


  for (const prayer of CONFIG.prayers) {

    const prayerTime =
      cleanTime(
        state.prayerData.timings[
          prayer.key
        ]
      );


    if (
      current === prayerTime &&
      state.alertedPrayer !==
        `${prayer.key}-${now.toDateString()}`
    ) {

      state.alertedPrayer =
        `${prayer.key}-${now.toDateString()}`;


      showPrayerAlert(
        prayer.name
      );

    }

  }

}


function showPrayerAlert(
  prayerName
) {

  const alert =
    document.getElementById(
      "prayerAlert"
    );


  const title =
    document.getElementById(
      "alertPrayerName"
    );


  if (title) {
    title.textContent =
      `حان وقت صلاة ${prayerName}`;
  }


  alert?.classList.remove("hidden");

}


function setupPrayerButtons() {

  document
    .getElementById(
      "closePrayerAlert"
    )
    ?.addEventListener(
      "click",
      () => {

        document
          .getElementById(
            "prayerAlert"
          )
          ?.classList.add(
            "hidden"
          );

        setTimeout(
          askAfterPrayer,
          60 * 60 * 1000
        );

      }
    );

}


/*
  ملاحظة:
  السؤال يظهر بعد ساعة من وقت الصلاة.
*/

function askAfterPrayer() {

  const modal =
    document.getElementById(
      "afterPrayerModal"
    );


  modal?.classList.remove(
    "hidden"
  );

}


/* =====================================================
   القرآن — قائمة السور
   ===================================================== */

async function loadSurahs() {

  const response =
    await fetch(
      `${CONFIG.quranAPI}/surah`
    );


  if (!response.ok) {

    throw new Error(
      "فشل تحميل السور"
    );

  }


  const result =
    await response.json();


  state.surahs =
    result.data || [];


  renderSurahs();

}


/* =====================================================
   عرض السور
   ===================================================== */

function renderSurahs(
  search = ""
) {

  const grid =
    document.getElementById(
      "surahGrid"
    );


  if (!grid) return;


  const query =
    search
      .trim()
      .toLowerCase();


  const filtered =
    state.surahs.filter(surah => {

      return (
        surah.name.includes(search) ||
        surah.englishName
          ?.toLowerCase()
          .includes(query)
      );

    });


  grid.innerHTML = "";


  filtered.forEach(surah => {

    const card =
      document.createElement(
        "button"
      );


    card.className =
      "surah-card";


    card.innerHTML = `
      <span class="surah-number">
        سورة ${surah.number}
      </span>

      <span class="surah-name">
        ${escapeHTML(surah.name)}
      </span>

      <span class="surah-meta">
        ${surah.numberOfAyahs} آية
        ·
        ${surah.revelationType === "Meccan"
          ? "مكية"
          : "مدنية"}
      </span>
    `;


    card.addEventListener(
      "click",
      () => openSurah(surah)
    );


    grid.appendChild(card);

  });

}


/* =====================================================
   البحث في القرآن
   ===================================================== */

function setupSearch() {

  const input =
    document.getElementById(
      "surahSearch"
    );


  input?.addEventListener(
    "input",
    event => {

      renderSurahs(
        event.target.value
      );

    }
  );

}


/* =====================================================
   فتح السورة
   ===================================================== */

function openSurah(surah) {

  state.currentSurah =
    surah;

  state.currentAyah = 1;


  const reader =
    document.getElementById(
      "mushafReader"
    );


  const name =
    document.getElementById(
      "readerSurahName"
    );


  if (name) {

    name.textContent =
      surah.name;

  }


  reader?.classList.remove(
    "hidden"
  );


  loadQuranAyah();

}


/* =====================================================
   قارئ المصحف
   ===================================================== */

function setupQuranReader() {

  document
    .getElementById(
      "closeMushaf"
    )
    ?.addEventListener(
      "click",
      closeMushaf
    );


  document
    .getElementById(
      "prevAyah"
    )
    ?.addEventListener(
      "click",
      previousAyah
    );


  document
    .getElementById(
      "nextAyah"
    )
    ?.addEventListener(
      "click",
      nextAyah
    );


  document
    .getElementById(
      "reciterSelect"
    )
    ?.addEventListener(
      "change",
      updateAudio
    );

}


function closeMushaf() {

  const reader =
    document.getElementById(
      "mushafReader"
    );


  reader?.classList.add(
    "hidden"
  );


  const audio =
    document.getElementById(
      "quranAudio"
    );


  if (audio) {

    audio.pause();

    audio.removeAttribute(
      "src"
    );

    audio.load();

  }

}


/* =====================================================
   صورة الآية
   ===================================================== */

function loadQuranAyah() {

  if (!state.currentSurah) {
    return;
  }


  const surah =
    state.currentSurah.number;


  const ayah =
    state.currentAyah;


  const image =
    document.getElementById(
      "mushafImage"
    );


  const position =
    document.getElementById(
      "mushafPosition"
    );


  /*
    الصورة عالية الدقة
  */

  const imageURL =
    `${CONFIG.quranImage}/${surah}_${ayah}.png`;


  if (image) {

    image.src =
      imageURL;


    image.alt =
      `الآية ${ayah} من سورة ${state.currentSurah.name}`;


    image.onerror = () => {

      /*
        إذا لم تتوفر الصورة العالية،
        نجرب الصورة العادية.
      */

      image.onerror = null;

      image.src =
        `https://cdn.islamic.network/quran/images/${surah}_${ayah}.png`;

    };

  }


  if (position) {

    position.textContent =
      `${ayah} / ${state.currentSurah.numberOfAyahs}`;

  }


  updateReaderButtons();

  updateAudio();

}


/* =====================================================
   الآية التالية
   ===================================================== */

function nextAyah() {

  if (!state.currentSurah) {
    return;
  }


  if (
    state.currentAyah <
    state.currentSurah.numberOfAyahs
  ) {

    state.currentAyah++;

    loadQuranAyah();

  } else {

    showToast(
      "وصلت إلى نهاية السورة"
    );

  }

}


/* =====================================================
   الآية السابقة
   ===================================================== */

function previousAyah() {

  if (
    state.currentAyah > 1
  ) {

    state.currentAyah--;

    loadQuranAyah();

  } else {

    showToast(
      "هذه أول آية في السورة"
    );

  }

}


/* =====================================================
   أزرار القارئ
   ===================================================== */

function updateReaderButtons() {

  const previous =
    document.getElementById(
      "prevAyah"
    );

  const next =
    document.getElementById(
      "nextAyah"
    );


  if (!state.currentSurah) {
    return;
  }


  if (previous) {

    previous.disabled =
      state.currentAyah <= 1;

  }


  if (next) {

    next.disabled =
      state.currentAyah >=
      state.currentSurah.numberOfAyahs;

  }

}


/* =====================================================
   صوت القرآن
   ===================================================== */

function updateAudio() {

  if (!state.currentSurah) {
    return;
  }


  const select =
    document.getElementById(
      "reciterSelect"
    );


  const audio =
    document.getElementById(
      "quranAudio"
    );


  if (!select || !audio) {
    return;
  }


  const reciter =
    select.value;


  const url =
    `${CONFIG.quranAudio}/${reciter}/${state.currentSurah.number}.mp3`;


  audio.src = url;

}


/* =====================================================
   التسبيح
   ===================================================== */

function setupTasbeeh() {

  const button =
    document.getElementById(
      "tasbeehButton"
    );


  const reset =
    document.getElementById(
      "resetTasbeeh"
    );


  button?.addEventListener(
    "click",
    () => {

      state.tasbeeh++;

      saveTasbeeh();

      renderTasbeeh();

    }
  );


  reset?.addEventListener(
    "click",
    () => {

      state.tasbeeh = 0;

      saveTasbeeh();

      renderTasbeeh();

    }
  );

}


function saveTasbeeh() {

  localStorage.setItem(
    "sakinaTasbeeh",
    String(state.tasbeeh)
  );

}


function renderTasbeeh() {

  const element =
    document.getElementById(
      "tasbeehCount"
    );


  if (element) {

    element.textContent =
      state.tasbeeh;

  }

}


/* =====================================================
   الأذكار
   ===================================================== */

const ADHKAR = {

  morning: [

    {
      text:
        "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
      count: 1
    },

    {
      text:
        "رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.",
      count: 3
    },

    {
      text:
        "اللهم بك أصبحنا وبك أمسينا، وبك نحيا وبك نموت وإليك النشور.",
      count: 1
    },

    {
      text:
        "سبحان الله وبحمده.",
      count: 100
    }

  ],


  evening: [

    {
      text:
        "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
      count: 1
    },

    {
      text:
        "رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.",
      count: 3
    },

    {
      text:
        "اللهم بك أمسينا وبك أصبحنا، وبك نحيا وبك نموت وإليك المصير.",
      count: 1
    },

    {
      text:
        "سبحان الله وبحمده.",
      count: 100
    }

  ],


  after: [

    {
      text:
        "أستغفر الله.",
      count: 3
    },

    {
      text:
        "اللهم أنت السلام ومنك السلام، تباركت يا ذا الجلال والإكرام.",
      count: 1
    },

    {
      text:
        "سبحان الله.",
      count: 33
    },

    {
      text:
        "الحمد لله.",
      count: 33
    },

    {
      text:
        "الله أكبر.",
      count: 33
    }

  ]

};


function setupAdhkar() {

  const tabs =
    document.querySelectorAll(
      ".adhkar-tab"
    );


  tabs.forEach(tab => {

    tab.addEventListener(
      "click",
      () => {

        tabs.forEach(t =>
          t.classList.remove(
            "active"
          )
        );


        tab.classList.add(
          "active"
        );


        const type =
          tab.dataset.adhkar;


        if (type === "random") {

          renderRandomDhikr();

        } else {

          renderAdhkar(type);

        }

      }
    );

  });


  renderAdhkar("morning");


  document
    .getElementById(
      "prayedYes"
    )
    ?.addEventListener(
      "click",
      () => {

        document
          .getElementById(
            "afterPrayerModal"
          )
          ?.classList.add(
            "hidden"
          );

        showAdhkarPage();

      }
    );


  document
    .getElementById(
      "prayedNo"
    )
    ?.addEventListener(
      "click",
      () => {

        document
          .getElementById(
            "afterPrayerModal"
          )
          ?.classList.add(
            "hidden"
          );

        showToast(
          "الله يعينك ويكتب لك الأجر"
        );

      }
    );

}


function renderAdhkar(type) {

  const container =
    document.getElementById(
      "adhkarContent"
    );


  if (!container) return;


  const list =
    ADHKAR[type] || [];


  container.innerHTML = "";


  list.forEach(dhikr => {

    const card =
      document.createElement("article");


    card.className =
      "dhikr-card";


    card.innerHTML = `
      <p>${escapeHTML(dhikr.text)}</p>
      <span class="dhikr-count">
        التكرار: ${dhikr.count}
      </span>
    `;


    container.appendChild(card);

  });

}


function renderRandomDhikr() {

  const all =
    Object.values(ADHKAR)
      .flat();


  const random =
    all[
      Math.floor(
        Math.random() * all.length
      )
    ];


  const container =
    document.getElementById(
      "adhkarContent"
    );


  if (!container) return;


  container.innerHTML = `
    <article class="dhikr-card">
      <p>${escapeHTML(random.text)}</p>

      <span class="dhikr-count">
        التكرار: ${random.count}
      </span>
    </article>
  `;

}


function showAdhkarPage() {

  showPage("adhkar");

  renderAdhkar("after");

  document
    .querySelectorAll(".adhkar-tab")
    .forEach(tab => {

      tab.classList.toggle(
        "active",
        tab.dataset.adhkar === "after"
      );

    });

}


/* =====================================================
   القبلة
   ===================================================== */

function renderQibla() {

  const city =
    CONFIG.cities[state.city];


  if (!city) return;


  /*
    إحداثيات الكعبة
  */

  const kaabaLat =
    21.4225;

  const kaabaLng =
    39.8262;


  const bearing =
    calculateBearing(
      city.lat,
      city.lng,
      kaabaLat,
      kaabaLng
    );


  const degree =
    document.getElementById(
      "qiblaDegree"
    );


  if (degree) {

    degree.textContent =
      `${Math.round(bearing)}°`;

  }


  const compass =
    document.getElementById(
      "qiblaCompass"
    );


  if (compass) {

    compass.style.transform =
      `rotate(${bearing}deg)`;

  }

}


function calculateBearing(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const toRadians =
    degrees =>
      degrees *
      Math.PI /
      180;


  const toDegrees =
    radians =>
      radians *
      180 /
      Math.PI;


  const φ1 =
    toRadians(lat1);

  const φ2 =
    toRadians(lat2);

  const Δλ =
    toRadians(
      lon2 - lon1
    );


  const y =
    Math.sin(Δλ) *
    Math.cos(φ2);


  const x =
    Math.cos(φ1) *
    Math.sin(φ2) -
    Math.sin(φ1) *
    Math.cos(φ2) *
    Math.cos(Δλ);


  let bearing =
    toDegrees(
      Math.atan2(y, x)
    );


  bearing =
    (bearing + 360) % 360;


  return bearing;

}


/* =====================================================
   أدوات مساعدة
   ===================================================== */

function showLoading(show) {

  const loading =
    document.getElementById(
      "loading"
    );


  if (!loading) return;


  if (show) {

    loading.classList.remove(
      "hidden"
    );

  } else {

    loading.classList.add(
      "hidden"
    );

  }

}


let toastTimer = null;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) return;


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2500);

}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =====================================================
   نهاية الملف
   ===================================================== */
