// Filigrana Studio - cookie consent banner (Google Consent Mode v2)
// Must be loaded BEFORE the Google tag (gtag.js) in <head>.
(function () {
  var STORAGE_KEY = "filigrana_consent_v1";

  // --- Consent Mode: default = denied until the visitor chooses ---
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  var DENIED = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };

  function readChoice() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveChoice(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
  }

  var saved = readChoice();
  var initial = Object.assign({}, DENIED);
  if (saved === "granted") initial.analytics_storage = "granted";
  gtag("consent", "default", initial);

  // --- Banner text ---
  var TEXT = {
    no: {
      msg: "Vi bruker informasjonskapsler (Google Analytics) for å forstå hvordan nettsiden brukes og forbedre den. Du kan godta eller avslå.",
      accept: "Godta",
      decline: "Avslå",
      label: "Informasjonskapsler",
    },
    en: {
      msg: "We use cookies (Google Analytics) to understand how the website is used and to improve it. You can accept or decline.",
      accept: "Accept",
      decline: "Decline",
      label: "Cookies",
    },
  };

  function lang() {
    return document.documentElement.getAttribute("lang") === "en" ? "en" : "no";
  }

  var banner = null;

  function applyText() {
    if (!banner) return;
    var t = TEXT[lang()];
    banner.setAttribute("aria-label", t.label);
    banner.querySelector(".fcb__msg").textContent = t.msg;
    banner.querySelector(".fcb__accept").textContent = t.accept;
    banner.querySelector(".fcb__decline").textContent = t.decline;
  }

  function closeBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function choose(granted) {
    saveChoice(granted ? "granted" : "denied");
    gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    closeBanner();
  }

  function injectStyles() {
    if (document.getElementById("fcb-styles")) return;
    var style = document.createElement("style");
    style.id = "fcb-styles";
    style.textContent =
      ".fcb{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:640px;margin:0 auto;" +
      "background:#fff;color:#222;border:1px solid rgba(0,0,0,.12);border-radius:12px;" +
      "box-shadow:0 8px 30px rgba(0,0,0,.18);padding:16px 18px;font:14px/1.5 'Kumbh Sans',system-ui,sans-serif;" +
      "display:flex;flex-wrap:wrap;gap:12px;align-items:center}" +
      ".fcb__msg{flex:1 1 280px;margin:0}" +
      ".fcb__btns{display:flex;gap:8px;flex:0 0 auto}" +
      ".fcb button{font:inherit;font-weight:600;border-radius:8px;padding:9px 18px;cursor:pointer;border:1px solid #222}" +
      ".fcb__accept{background:#222;color:#fff}" +
      ".fcb__decline{background:#fff;color:#222}" +
      ".fcb button:focus-visible{outline:2px solid #6b4eff;outline-offset:2px}";
    document.head.appendChild(style);
  }

  function showBanner() {
    if (banner) return;
    injectStyles();
    banner = document.createElement("div");
    banner.className = "fcb";
    banner.setAttribute("role", "dialog");
    banner.innerHTML =
      '<p class="fcb__msg"></p>' +
      '<div class="fcb__btns">' +
      '<button type="button" class="fcb__decline"></button>' +
      '<button type="button" class="fcb__accept"></button>' +
      "</div>";
    banner.querySelector(".fcb__accept").addEventListener("click", function () {
      choose(true);
    });
    banner.querySelector(".fcb__decline").addEventListener("click", function () {
      choose(false);
    });
    document.body.appendChild(banner);
    applyText();
  }

  function init() {
    // Any element with data-consent-open (e.g. a footer link) reopens the banner.
    document.addEventListener("click", function (e) {
      var el = e.target.closest && e.target.closest("[data-consent-open]");
      if (el) {
        e.preventDefault();
        showBanner();
      }
    });
    // Keep text in sync with the NO/EN switcher.
    document.addEventListener("lang-switch", applyText);

    if (!saved) showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
