/* =========================================================
   سَكينة — التطبيق الرئيسي
   ========================================================= */

/* =========================
   إعدادات عامة
========================= */

const SAKINA = {
  apiPrayer: "https://api.aladhan.com/v1",
  apiQuran: "https://api.alquran.cloud/v1",

  /* مدن السعودية وإحداثياتها */
  cities: {
    "جدة": {
      city: "Jeddah",
      country: "Saudi Arabia",
      lat: 21.5433,
      lng: 39.1728
    },

    "مكة المكرمة": {
      city: "Mecca",
      country: "Saudi Arabia",
      lat: 21.3891,
      lng: 39.8579
    },

    "المدينة المنورة": {
      city: "Medina",
      country: "Saudi Arabia",
      lat: 24.5247,
      lng: 39.5692
    },

    "الرياض": {
      city: "Riyadh",
      country: "Saudi Arabia",
      lat: 24.7136,
      lng: 46.6753
    },

    "الدمام": {
      city: "Dammam",
      country: "Saudi Arabia",
      lat: 26.4207,
      lng: 50.0888
    },

    "الخبر": {
      city: "Khobar",
      country: "Saudi Arabia",
      lat: 26.2172,
      lng: 50.1971
    },

    "الطائف": {
      city: "Taif",
      country: "Saudi Arabia",
      lat: 21.2703,
      lng: 40.4158
    },

    "أبها": {
      city: "Abha",
      country: "Saudi Arabia",
      lat: 18.2164,
      lng: 42.5053
    },

    "تبوك": {
      city: "Tabuk",
      country: "Saudi Arabia",
      lat: 28.3838,
      lng: 36.5550
    },

    "حائل": {
      city: "Hail",
      country: "Saudi Arabia",
      lat: 27.5114,
      lng: 41.7208
    },

    "جازان": {
      city: "Jizan",
      country: "Saudi Arabia",
      lat: 16.8892,
      lng: 42.5511
    },

    "نجران": {
      city: "Najran",
      country: "Saudi Arabia",
      lat: 17.5650,
      lng: 44.2289
    },

    "بريدة": {
      city: "Buraidah",
      country: "Saudi Arabia",
      lat: 26.3592,
      lng: 43.9818
    },

    "الجبيل": {
      city: "Jubail",
      country: "Saudi Arabia",
      lat: 27.0174,
      lng: 49.6225
    },

    "ينبع": {
      city: "Yanbu",
      country: "Saudi Arabia",
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


/* =========================
   حالة التطبيق
========================= */

const state = {
  city:
    localStorage.getItem("sakinaCity") ||
    "جدة",

  prayerData: null,

  hijriData: null,

  qibla: null,

  tasbeeh:
    Number(
      localStorage.getItem("sakinaTasbeeh") || 0
    ),

  surahs: [],

  currentSurah: null,

  countdownTimer: null
};


/* =========================
   عناصر الصفحة
========================= */

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  document.querySelectorAll(selector);


/* =========================
   بداية التطبيق
========================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    setupNavigation();

    setupCities();

    setupTasbeeh();

    setupSearch();

    updateCityUI();

    updateGregorianDate();

    renderTasbeeh();

    await loadAllData();

    setInterval(
      updateClockAndCountdown,
      1000
    );

    setInterval(
      updateGregorianDate,
      60000
    );

  }
);


/* =========================================================
   التنقل بين الصفحات
========================================================= */

function setupNavigation() {

  $$("[data-page]").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.page;

        if (!page) return;

        showPage(page);

      }
    );

  });

}


function showPage(pageName) {

  $$(".page").forEach(page => {

    page.classList.remove("active");

  });


  const target =
    $(`#page-${pageName}`);

  if (target) {

    target.classList.add("active");

  }


  $$(".nav-item").forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.page === pageName
    );

  });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  /*
    عند فتح القرآن لأول مرة
  */

  if (
    pageName === "quran" &&
    state.surahs.length === 0
  ) {

    loadSurahs();

  }


  /*
    عند فتح القبلة
  */

  if (pageName === "qibla") {

    calculateQibla();

  }

}


/* =========================================================
   المدن
========================================================= */

function setupCities() {

  const cityList =
    $("#cityList");

  if (!cityList) return;


  cityList.innerHTML = "";


  Object.keys(
    SAKINA.cities
  ).forEach(cityName => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "city-option";


    button.textContent =
      cityName;


    button.addEventListener(
      "click",
      async () => {

        await changeCity(cityName);

      }
    );


    cityList.appendChild(button);

  });


  $("#locationButton")
    ?.addEventListener(
      "click",
      openCityModal
    );


  $("#settingsCityButton")
    ?.addEventListener(
      "click",
      openCityModal
    );


  $("#closeCityModal")
    ?.addEventListener(
      "click",
      closeCityModal
    );


  $("#cityModal")
    ?.addEventListener(
      "click",
      event => {

        if (
          event.target.id ===
          "cityModal"
        ) {

          closeCityModal();

        }

      }
    );

}


function openCityModal() {

  const modal =
    $("#cityModal");

  if (!modal) return;


  modal.classList.add("show");


  $$(".city-option").forEach(
    option => {

      option.classList.toggle(
        "selected",
        option.textContent ===
        state.city
      );

    }
  );

}


function closeCityModal() {

  $("#cityModal")
    ?.classList.remove("show");

}


async function changeCity(cityName) {

  if (
    !SAKINA.cities[cityName]
  ) return;


  state.city =
    cityName;


  localStorage.setItem(
    "sakinaCity",
    cityName
  );


  updateCityUI();

  closeCityModal();


  showToast(
    `جاري تحميل مواقيت ${cityName}`
  );


  await loadPrayerTimes();

  await calculateQibla();


  showToast(
    `تم تحديث ${cityName}`
  );

}


function updateCityUI() {

  if ($("#currentCity")) {

    $("#currentCity")
      .textContent =
      state.city;

  }


  if (
    $("#settingsCityButton")
  ) {

    $("#settingsCityButton")
      .textContent =
      state.city;

  }


  $$(".city-option")
    .forEach(option => {

      option.classList.toggle(
        "selected",
        option.textContent ===
        state.city
      );

    });

}


/* =========================================================
   تحميل كل البيانات
========================================================= */

async function loadAllData() {

  try {

    await Promise.all([
      loadPrayerTimes(),
      loadHijriDate(),
      loadSurahs()
    ]);

  } catch (error) {

    console.error(
      "خطأ أثناء تحميل البيانات:",
      error
    );

  } finally {

    hideLoadingScreen();

  }

}


/* =========================================================
   مواقيت الصلاة
========================================================= */

async function loadPrayerTimes() {

  const city =
    SAKINA.cities[state.city];

  if (!city) return;


  try {

    const now =
      new Date();


    const date =
      `${now.getDate()}-${
        now.getMonth() + 1
      }-${now.getFullYear()}`;


    /*
      4 = Umm Al-Qura
      في السعودية
    */

    const url =
      `${SAKINA.apiPrayer}/timingsByCity/${date}` +
      `?city=${encodeURIComponent(city.city)}` +
      `&country=${encodeURIComponent(city.country)}` +
      `&method=4`;


    const response =
      await fetch(url);


    if (!response.ok) {

      throw new Error(
        "تعذر الاتصال بخدمة مواقيت الصلاة"
      );

    }


    const result =
      await response.json();


    if (
      result.code !== 200 ||
      !result.data
    ) {

      throw new Error(
        "بيانات الصلاة غير صحيحة"
      );

    }


    state.prayerData =
      result.data;


    renderPrayerTimes();

    updateClockAndCountdown();


  } catch (error) {

    console.error(error);


    renderPrayerError();

  }

}


/* =========================================================
   عرض مواقيت الصلاة
========================================================= */

function renderPrayerTimes() {

  if (
    !state.prayerData ||
    !state.prayerData.timings
  ) return;


  const timings =
    state.prayerData.timings;


  const cards =
    $$(".prayer-card");


  SAKINA.prayers.forEach(
    (prayer, index) => {

      const card =
        cards[index];

      if (!card) return;


      const time =
        cleanPrayerTime(
          timings[prayer.key]
        );


      const name =
        card.querySelector(
          ".prayer-name"
        );


      const timeElement =
        card.querySelector(
          ".prayer-time"
        );


      if (name) {

        name.textContent =
          prayer.name;

      }


      if (timeElement) {

        timeElement.textContent =
          formatArabicTime(time);

      }

    }
  );


  if (
    $("#prayerDateLabel")
  ) {

    const readable =
      state.prayerData.date
        ?.readable || "";

    $("#prayerDateLabel")
      .textContent =
      readable;

  }

}


/* =========================================================
   الصلاة القادمة
========================================================= */

function updateClockAndCountdown() {

  if (
    !state.prayerData
  ) return;


  const now =
    new Date();


  const timings =
    state.prayerData.timings;


  const prayerTimes =
    SAKINA.prayers.map(
      prayer => {

        const clean =
          cleanPrayerTime(
            timings[prayer.key]
          );

        const parts =
          clean.split(":");


        const date =
          new Date();


        date.setHours(
          Number(parts[0]),
          Number(parts[1]),
          0,
          0
        );


        return {
          ...prayer,
          time: clean,
          date
        };

      }
    );


  let nextPrayer =
    prayerTimes.find(
      prayer =>
        prayer.date > now
    );


  /*
    إذا انتهت العشاء:
    الصلاة القادمة تكون فجر اليوم التالي
  */

  if (!nextPrayer) {

    nextPrayer =
      prayerTimes[0];

    nextPrayer =
      {
        ...nextPrayer,
        date:
          new Date(
            nextPrayer.date
          )
      };


    nextPrayer.date.setDate(
      nextPrayer.date.getDate() + 1
    );

  }


  /*
    إزالة تحديد الصلاة القديمة
  */

  $$(".prayer-card")
    .forEach(card => {

      card.classList.remove(
        "next"
      );

    });


  const nextIndex =
    SAKINA.prayers.findIndex(
      prayer =>
        prayer.key ===
        nextPrayer.key
    );


  if (
    nextIndex >= 0
  ) {

    const cards =
      $$(".prayer-card");

    cards[nextIndex]
      ?.classList.add("next");

  }


  /*
    عرض الصلاة القادمة
  */

  if (
    $("#nextPrayerName")
  ) {

    $("#nextPrayerName")
      .textContent =
      nextPrayer.name;

  }


  if (
    $("#nextPrayerTime")
  ) {

    $("#nextPrayerTime")
      .textContent =
      formatArabicTime(
        nextPrayer.time
      );

  }


  /*
    حساب الوقت المتبقي
  */

  const difference =
    nextPrayer.date.getTime() -
    now.getTime();


  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        difference / 1000
      )
    );


  const hours =
    Math.floor(
      totalSeconds / 3600
    );


  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
      60
    );


  const seconds =
    totalSeconds % 60;


  if (
    $("#countdown")
  ) {

    $("#countdown")
      .textContent =
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;

  }

}


/* =========================================================
   تنظيف وقت الصلاة
========================================================= */

function cleanPrayerTime(time) {

  if (!time) {

    return "00:00";

  }


  return String(time)
    .split(" ")[0]
    .trim();

}


/* =========================================================
   تحويل الوقت إلى 12 ساعة
========================================================= */

function formatArabicTime(time) {

  if (!time) return "—";


  const parts =
    time.split(":");


  let hour =
    Number(parts[0]);


  const minute =
    parts[1];


  const period =
    hour >= 12
      ? "م"
      : "ص";


  hour =
    hour % 12;


  if (hour === 0) {

    hour = 12;

  }


  return `${hour}:${minute} ${period}`;

}


/* =========================================================
   التاريخ الميلادي
========================================================= */

function updateGregorianDate() {

  const now =
    new Date();


  const formatter =
    new Intl.DateTimeFormat(
      "ar-SA",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );


  if (
    $("#gregorianDate")
  ) {

    $("#gregorianDate")
      .textContent =
      formatter.format(now);

  }

}


/* =========================================================
   التاريخ الهجري
========================================================= */

async function loadHijriDate() {

  try {

    const now =
      new Date();


    const day =
      now.getDate();


    const month =
      now.getMonth() + 1;


    const year =
      now.getFullYear();


    const url =
      `${SAKINA.apiPrayer}/gToH/${day}-${month}-${year}` +
      `?calendarMethod=UAQ`;


    const response =
      await fetch(url);


    if (!response.ok) {

      throw new Error(
        "تعذر تحميل التاريخ الهجري"
      );

    }


    const result =
      await response.json();


    if (
      result.code !== 200 ||
      !result.data
    ) {

      throw new Error(
        "بيانات التاريخ غير صحيحة"
      );

    }


    state.hijriData =
      result.data;


    renderHijriDate();


  } catch (error) {

    console.error(error);


    if (
      $("#hijriDate")
    ) {

      $("#hijriDate")
        .textContent =
        "تعذر تحميل التاريخ الهجري";

    }

  }

}


function renderHijriDate() {

  const hijri =
    state.hijriData?.hijri;


  if (
    !hijri ||
    !$("#hijriDate")
  ) return;


  const months = [
    "المحرّم",
    "صفر",
    "ربيع الأول",
    "ربيع الآخر",
    "جمادى الأولى",
    "جمادى الآخرة",
    "رجب",
    "شعبان",
    "رمضان",
    "شوّال",
    "ذو القعدة",
    "ذو الحجة"
  ];


  const monthNumber =
    Number(
      hijri.month?.number || 1
    );


  const monthName =
    months[
      monthNumber - 1
    ] || hijri.month?.en || "";


  $("#hijriDate")
    .textContent =
    `${hijri.day} ${monthName} ${hijri.year} هـ`;

}


/* =========================================================
   القرآن — السور
========================================================= */

async function loadSurahs() {

  const grid =
    $("#surahGrid");


  if (!grid) return;


  if (
    state.surahs.length > 0
  ) {

    renderSurahs();

    return;

  }


  grid.innerHTML =
    `
      <div class="loading-state">
        جاري تحميل سور القرآن...
      </div>
    `;


  try {

    const response =
      await fetch(
        `${SAKINA.apiQuran}/surah`
      );


    if (!response.ok) {

      throw new Error(
        "تعذر تحميل القرآن"
      );

    }


    const result =
      await response.json();


    if (
      result.code !== 200 ||
      !Array.isArray(
        result.data
      )
    ) {

      throw new Error(
        "بيانات السور غير صحيحة"
      );

    }


    state.surahs =
      result.data;


    renderSurahs();


  } catch (error) {

    console.error(error);


    grid.innerHTML =
      `
        <div class="error-state">
          تعذر تحميل سور القرآن.
          تأكد من اتصال الإنترنت ثم أعد المحاولة.
        </div>
      `;

  }

}


/* =========================================================
   عرض السور
========================================================= */

function renderSurahs(
  search = ""
) {

  const grid =
    $("#surahGrid");


  if (!grid) return;


  const query =
    search
      .trim()
      .toLowerCase();


  const filtered =
    state.surahs.filter(
      surah => {

        return (
          surah.name.includes(query) ||
          surah.englishName
            ?.toLowerCase()
            .includes(query) ||
          String(
            surah.number
          ) === query
        );

      }
    );


  if (
    filtered.length === 0
  ) {

    grid.innerHTML =
      `
        <div class="empty-state">
          ما لقينا سورة بهذا الاسم.
        </div>
      `;

    return;

  }


  grid.innerHTML =
    filtered
      .map(
        surah => `
          <button
            class="surah-card"
            type="button"
            data-surah="${surah.number}"
          >

            <div class="surah-number">
              ${surah.number}
            </div>

            <div class="surah-info">

              <div class="surah-name">
                ${surah.name}
              </div>

              <div class="surah-meta">
                ${surah.numberOfAyahs} آية
                ·
                ${
                  surah.revelationType ===
                  "Meccan"
                    ? "مكية"
                    : "مدنية"
                }
              </div>

            </div>

          </button>
        `
      )
      .join("");


  $$(".surah-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const number =
            Number(
              card.dataset.surah
            );

          openSurah(number);

        }
      );

    });

}


/* =========================================================
   البحث في السور
========================================================= */

function setupSearch() {

  const search =
    $("#surahSearch");


  if (!search) return;


  search.addEventListener(
    "input",
    event => {

      renderSurahs(
        event.target.value
      );

    }
  );

}


/* =========================================================
   فتح السورة
========================================================= */

async function openSurah(number) {

  showToast(
    "جاري فتح السورة..."
  );


  try {

    const response =
      await fetch(
        `${SAKINA.apiQuran}/surah/${number}/quran-uthmani-quran-academy`
      );


    if (!response.ok) {

      throw new Error(
        "تعذر فتح السورة"
      );

    }


    const result =
      await response.json();


    if (
      result.code !== 200 ||
      !result.data
    ) {

      throw new Error(
        "بيانات السورة غير صحيحة"
      );

    }


    state.currentSurah =
      result.data;


    renderSurahReader();


  } catch (error) {

    console.error(error);

    showToast(
      "تعذر فتح السورة"
    );

  }

}


/* =========================================================
   قارئ السورة
========================================================= */

function renderSurahReader() {

  const surah =
    state.currentSurah;


  if (!surah) return;


  const container =
    $("#surahGrid");


  if (!container) return;


  container.innerHTML =
    `
      <div
        style="
          grid-column:1/-1;
          padding:25px;
          border-radius:25px;
          background:var(--card);
          border:1px solid var(--border);
        "
      >

        <button
          id="backToSurahs"
          class="back-button"
          type="button"
        >
          ← كل السور
        </button>

        <div
          style="
            text-align:center;
            color:var(--gold-light);
            font-size:30px;
            margin-bottom:25px;
          "
        >
          ${surah.name}
        </div>

        <div
          style="
            display:grid;
            gap:18px;
          "
        >

          ${surah.ayahs
            .map(
              ayah => `
                <div
                  style="
                    padding:18px 5px;
                    border-bottom:1px solid var(--border);
                    line-height:2.3;
                    font-size:20px;
                  "
                >

                  <span
                    style="
                      color:var(--gold-light);
                      font-size:13px;
                      margin-left:7px;
                    "
                  >
                    ${ayah.numberInSurah}
                  </span>

                  ${ayah.text}

                </div>
              `
            )
            .join("")}

        </div>

      </div>
    `;


  $("#backToSurahs")
    ?.addEventListener(
      "click",
      () => {

        renderSurahs();

      }
    );

}


/* =========================================================
   التسبيح
========================================================= */

function setupTasbeeh() {

  $("#tasbeehButton")
    ?.addEventListener(
      "click",
      () => {

        state.tasbeeh++;

        saveTasbeeh();

        renderTasbeeh();

      }
    );


  $("#tasbeehReset")
    ?.addEventListener(
      "click",
      () => {

        state.tasbeeh = 0;

        saveTasbeeh();

        renderTasbeeh();

        showToast(
          "تم تصفير العداد"
        );

      }
    );

}


function saveTasbeeh() {

  localStorage.setItem(
    "sakinaTasbeeh",
    String(
      state.tasbeeh
    )
  );

}


function renderTasbeeh() {

  if (
    $("#tasbeehCount")
  ) {

    $("#tasbeehCount")
      .textContent =
      state.tasbeeh
        .toLocaleString("ar-SA");

  }

}


/* =========================================================
   القبلة
========================================================= */

async function calculateQibla() {

  const city =
    SAKINA.cities[state.city];


  if (!city) return;


  try {

    /*
      موقع الكعبة:
      21.4225 شمالًا
      39.8262 شرقًا
    */

    const kaabaLat =
      21.4225;


    const kaabaLng =
      39.8262;


    const direction =
      calculateBearing(
        city.lat,
        city.lng,
        kaabaLat,
        kaabaLng
      );


    state.qibla =
      direction;


    renderQibla();


  } catch (error) {

    console.error(
      "خطأ في حساب القبلة:",
      error
    );

  }

}


function calculateBearing(
  lat1,
  lng1,
  lat2,
  lng2
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
      lng2 - lng1
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


  return (
    toDegrees(
      Math.atan2(y, x)
    ) + 360
  ) % 360;

}


function renderQibla() {

  if (
    state.qibla === null
  ) return;


  if (
    $("#qiblaDegree")
  ) {

    $("#qiblaDegree")
      .textContent =
      `${Math.round(
        state.qibla
      )}°`;

  }


  if (
    $("#qiblaArrow")
  ) {

    $("#qiblaArrow")
      .style.transform =
      `rotate(${state.qibla}deg)`;

  }

}


/* =========================================================
   شاشة التحميل
========================================================= */

function hideLoadingScreen() {

  const screen =
    $("#loadingScreen");


  if (!screen) return;


  setTimeout(
    () => {

      screen.classList.add(
        "hidden"
      );

    },
    500
  );

}


/* =========================================================
   إشعار
========================================================= */

let toastTimer = null;


function showToast(message) {

  const toast =
    $("#toast");


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
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =========================================================
   حماية بسيطة من أخطاء API
========================================================= */

window.addEventListener(
  "unhandledrejection",
  event => {

    console.error(
      "خطأ غير متوقع:",
      event.reason
    );

  }
);
