// Filigrana Studio v2 – small, dependency-free UI script
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");

  // ---- Language (NO / EN), remembered ----
  var LANG_KEY = "filigrana_lang";
  function setLang(l, silent) {
    l = l === "en" ? "en" : "no";
    doc.setAttribute("lang", l);
    document.querySelectorAll(".lang").forEach(function (b) {
      b.textContent = l === "no" ? "EN" : "NO";
      b.setAttribute("aria-label", l === "no" ? "Switch to English" : "Bytt til norsk");
    });
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    if (!silent) document.dispatchEvent(new Event("lang-switch"));
  }
  var stored = null;
  try { stored = localStorage.getItem(LANG_KEY); } catch (e) {}
  setLang(stored || "no", true);
  document.querySelectorAll(".lang").forEach(function (b) {
    b.addEventListener("click", function () { setLang(doc.getAttribute("lang") === "en" ? "no" : "en"); });
  });

  // ---- Mobile menu ----
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");
  function closeMenu() {
    if (!burger) return;
    burger.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") !== "true";
      burger.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  // ---- Header shadow + mobile action bar ----
  var header = document.querySelector(".header");
  var dock = document.querySelector(".dock");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (dock) dock.classList.toggle("is-visible", y > 420);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- Scroll reveal ----
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el, i) {
      el.style.setProperty("--d", (i % 4) * 70 + "ms");
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }


  // ---- Contact form (Formspree) ----
  var form = document.getElementById("contactForm");
  if (form) {
    var status = form.querySelector(".cform__status");
    var MSG = {
      no: { ok: "Takk for din melding! Vi tar kontakt snart.", err: "Noe gikk galt. Prøv igjen.", req: "Fyll ut navn, gyldig e-post og en melding (minst 10 tegn).", sending: "Sender…" },
      en: { ok: "Thank you! We will be in touch soon.", err: "Something went wrong. Please try again.", req: "Please fill in name, a valid email and a message (min. 10 characters).", sending: "Sending…" }
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var t = MSG[doc.getAttribute("lang") === "en" ? "en" : "no"];
      var n = form.name.value.trim(), m = form.email.value.trim(), msg = form.message.value.trim();
      status.className = "cform__status";
      if (n.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m) || msg.length < 10) { status.textContent = t.req; status.classList.add("err"); return; }
      var btn = form.querySelector("button[type=submit]"); btn.disabled = true; status.textContent = t.sending;
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw 0; status.textContent = t.ok; status.classList.add("ok"); form.reset(); })
        .catch(function () { status.textContent = t.err; status.classList.add("err"); })
        .finally(function () { btn.disabled = false; });
    });
  }


  // ---- Reviews: collapse long texts with a "read more" toggle ----
  document.querySelectorAll(".rcard blockquote").forEach(function (q) {
    q.classList.add("clamp");
    if (q.scrollHeight <= q.clientHeight + 2) { q.classList.remove("clamp"); return; }
    var card = q.closest(".rcard");
    var b = document.createElement("button");
    b.type = "button"; b.className = "rcard__more"; b.setAttribute("aria-expanded", "false");
    b.innerHTML = '<span class="m-more"><span data-lang="no">Les mer</span><span data-lang="en">Read more</span></span><span class="m-less"><span data-lang="no">Les mindre</span><span data-lang="en">Read less</span></span>';
    b.addEventListener("click", function () {
      var open = card.classList.toggle("is-open");
      b.setAttribute("aria-expanded", String(open));
    });
    q.insertAdjacentElement("afterend", b);
  });

  // ---- Footer year ----
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
