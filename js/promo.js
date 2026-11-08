/* ==========================================================================
   Filigrana Studio – акційне повідомлення (promo)
   --------------------------------------------------------------------------
   ЯК КЕРУВАТИ АКЦІЄЮ (редагується тільки цей блок CONFIG нижче):

   • Увімкнути / вимкнути:   enabled: true   або   enabled: false
   • Автоматичний початок і кінець:  start / end  у форматі "РРРР-ММ-ДД"
     (залиште "" щоб не обмежувати). Після кінцевої дати вікно саме зникне.
   • Нова акція = змініть id (наприклад "jul-2026" -> "nyttar-2027"), тоді
     всі, хто закривав попереднє вікно, побачать нове.
   • Тексти: кожен рядок має версію "no" (норвезька) та "en" (англійська).
   • Картинка: шлях до файлу в assets, або "" щоб без картинки.
   • На яких сторінках показувати: pages: ["all"]  або  ["", "permanent-make-up"]
     (порожній рядок "" = головна сторінка).
   ========================================================================== */
(function () {
  "use strict";

  var CONFIG = {
    enabled: true,
    id: "pmu-jul-2026",
    start: "",            // напр. "2026-11-08"
    end: "",              // напр. "2026-12-15"  (після цієї дати вікно зникає)
    delayMs: 5000,        // через скільки мс після завантаження показати
    rememberDays: 3,      // скільки днів не показувати після закриття
    pages: ["all"],       // "all" або список сторінок: "", "permanent-make-up", "vipper-bryn", ...
    image: "assets/icons/img/PERMANENT MAKE UP/photo_2026-07-18 12.04.11.webp",
    imagePosition: "50% 30%",
    kicker: { no: "Julekampanje", en: "Christmas offer" },
    badge: "−15 %",
    title: { no: "Fine bryn til jul og nyttår? Start nå.", en: "Beautiful brows for Christmas and New Year? Start now." },
    subtitle: { no: "på permanent makeup", en: "on permanent makeup" },
    lines: [
      { no: "Bestill innen 7 dager.", en: "Book within 7 days." },
      { no: "Sett av tid til tilheling og eventuell korrigering før høytiden.", en: "Allow time for healing and any correction before the holidays." }
    ],
    cta: {
      text: { no: "Bestill time nå", en: "Book now" },
      href: "https://timma.no/salong/olha-bratash"
    },
    dismiss: { no: "Ikke nå", en: "Not now" },
    close: { no: "Lukk", en: "Close" }
  };

  /* ------------------------------ kode nedenfor ------------------------------ */
  if (!CONFIG.enabled) return;

  var STORE = "filigrana_promo_" + CONFIG.id;
  var doc = document;

  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  if (CONFIG.start && today() < CONFIG.start) return;
  if (CONFIG.end && today() > CONFIG.end) return;

  // page filter: first path segment ("" = home); the repo sub-path on GitHub Pages is ignored by matching the last known page slugs
  var slugs = ["manikyr", "pedikyr", "elektrolyse", "vipper-bryn", "permanent-make-up", "gavekort", "tjenester", "om-oss", "kontakt", "blogg", "personvern.html"];
  var current = "";
  var parts = location.pathname.split("/").filter(Boolean);
  for (var i = 0; i < parts.length; i++) { if (slugs.indexOf(parts[i]) > -1) { current = parts[i]; break; } }
  if (current === "personvern.html") return;               // never on the privacy page
  if (CONFIG.pages.indexOf("all") === -1 && CONFIG.pages.indexOf(current) === -1) return;

  try {
    var until = parseInt(localStorage.getItem(STORE) || "0", 10);
    if (until && Date.now() < until) return;
  } catch (e) {}

  function lang() { return doc.documentElement.getAttribute("lang") === "en" ? "en" : "no"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function t(o) { return o[lang()] || o.no; }

  // path prefix so the image works from any folder depth
  var depth = (function () {
    var scriptSrc = (doc.currentScript && doc.currentScript.getAttribute("src")) || "";
    var m = scriptSrc.match(/^((?:\.\.\/)*)js\/promo\.js/);
    return m ? m[1] : "";
  })();

  var root, built = false;

  function build() {
    root = doc.createElement("aside");
    root.className = "promo";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-labelledby", "promoTitle");
    var img = CONFIG.image
      ? '<div class="promo__media"><img src="' + esc(depth + encodeURI(CONFIG.image)) + '" alt="" loading="lazy" style="object-position:' + esc(CONFIG.imagePosition) + '" /></div>'
      : "";
    root.innerHTML =
      '<button type="button" class="promo__x" data-promo-close aria-label=""><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      img +
      '<div class="promo__body">' +
        '<div class="promo__top"><span class="promo__kicker"></span><span class="promo__badge"></span></div>' +
        '<h2 class="promo__title" id="promoTitle"></h2>' +
        '<p class="promo__sub"></p>' +
        '<ul class="promo__list"></ul>' +
        '<div class="promo__actions"><a class="btn btn--primary promo__cta" target="_blank" rel="noopener noreferrer"></a><button type="button" class="promo__later" data-promo-close></button></div>' +
      '</div>';
    doc.body.appendChild(root);
    root.addEventListener("click", function (e) { if (e.target.closest("[data-promo-close]")) hide(true); });
    built = true;
  }

  function fill() {
    root.querySelector(".promo__kicker").textContent = t(CONFIG.kicker);
    root.querySelector(".promo__badge").textContent = CONFIG.badge;
    root.querySelector(".promo__title").textContent = t(CONFIG.title);
    root.querySelector(".promo__sub").textContent = t(CONFIG.subtitle);
    root.querySelector(".promo__list").innerHTML = CONFIG.lines.map(function (l) { return "<li>" + esc(t(l)) + "</li>"; }).join("");
    var cta = root.querySelector(".promo__cta");
    cta.textContent = t(CONFIG.cta.text); cta.setAttribute("href", CONFIG.cta.href);
    root.querySelector(".promo__later").textContent = t(CONFIG.dismiss);
    root.querySelector(".promo__x").setAttribute("aria-label", t(CONFIG.close));
  }

  function show() {
    if (!built) build();
    fill();
        root.getBoundingClientRect();                                  // force layout so the transition runs
    setTimeout(function () { root.classList.add("is-open"); }, 40);
    if (typeof window.gtag === "function") window.gtag("event", "promo_view", { promo_id: CONFIG.id });
  }

  function hide(remember) {
    if (!root) return;
    root.classList.remove("is-open");
    if (remember) { try { localStorage.setItem(STORE, String(Date.now() + CONFIG.rememberDays * 86400000)); } catch (e) {} }
  }

  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && root && root.classList.contains("is-open")) hide(true); });
  doc.addEventListener("lang-switch", function () { if (built) fill(); });

  // wait until the cookie banner is answered, then wait the configured delay
  function ready() {
    var tries = 0;
    (function waitBanner() {
      if (doc.querySelector(".fcb") && tries < 120) { tries++; return setTimeout(waitBanner, 500); }
      setTimeout(show, CONFIG.delayMs);
    })();
  }
  if (doc.readyState === "complete") ready(); else window.addEventListener("load", ready);
})();
