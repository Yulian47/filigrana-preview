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



  // ---- Price calculator ----
  var calc = document.querySelector(".kcalc");
  if (calc) {
    var items = [].slice.call(calc.querySelectorAll(".kitem"));
    var sumLines = calc.querySelector(".kcalc__lines"), sumTot = calc.querySelector(".kcalc__tot"), sumEmpty = calc.querySelector(".kcalc__empty");
    var bar = document.querySelector(".kcalc__bar"), resetBtn = calc.querySelector(".kcalc__reset");
    var gos = [].slice.call(document.querySelectorAll(".kcalc__go"));
    var isEn = function () { return doc.getAttribute("lang") === "en"; };
    var nf = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };
    var fmtTime = function (m) { var h = Math.floor(m / 60), r = m % 60; if (!h) return r + " min"; return h + (isEn() ? " h" : " t") + (r ? " " + r + " min" : ""); };
    var state = function () {
      var sel = items.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; });
      var p = 0, t = 0, from = false, unk = false;
      sel.forEach(function (b) { p += +b.dataset.p; t += +b.dataset.t; if (b.dataset.from === "1") from = true; if (!+b.dataset.t) unk = true; });
      return { sel: sel, p: p, t: t, from: from, unk: unk };
    };
    var priceTxt = function (s) { return (s.from ? (isEn() ? "from " : "fra ") : "") + nf(s.p) + (isEn() ? " NOK" : " kr"); };
    var timeTxt = function (s) { return (s.unk || s.from ? (isEn() ? "at least " : "minst ") : "ca. ") + fmtTime(s.t); };
    var message = function (s) {
      var en = isEn();
      var lines = s.sel.map(function (b) { return "• " + (en ? b.dataset.en : b.dataset.no) + " (" + (b.dataset.from === "1" ? (en ? "from " : "fra ") : "") + nf(b.dataset.p) + (en ? " NOK" : " kr") + ")"; });
      return (en ? "Hello! I would like to book:\n" : "Hei! Jeg ønsker å bestille:\n") + lines.join("\n") + "\n\n" + (en ? "Total: " : "Totalt: ") + priceTxt(s) + (en ? ", approx. time: " : ", omtrentlig tid: ") + timeTxt(s) + "\n" + (en ? "Preferred days/times: " : "Ønskede dager/tider: ");
    };
    var render = function () {
      var s = state(), has = s.sel.length > 0;
      sumLines.innerHTML = "";
      s.sel.forEach(function (b) {
        var li = document.createElement("li");
        var a = document.createElement("span"); a.textContent = isEn() ? b.dataset.en : b.dataset.no;
        var c = document.createElement("span"); c.textContent = (b.dataset.from === "1" ? (isEn() ? "from " : "fra ") : "") + nf(b.dataset.p) + (isEn() ? " NOK" : " kr");
        li.appendChild(a); li.appendChild(c); sumLines.appendChild(li);
      });
      sumEmpty.hidden = has; sumTot.hidden = !has; resetBtn.hidden = !has;
      calc.querySelector(".js-price").textContent = priceTxt(s);
      calc.querySelector(".js-time").textContent = timeTxt(s);
      if (bar) {
        bar.hidden = !has;
        bar.querySelector(".js-bprice").textContent = priceTxt(s);
        bar.querySelector(".js-btime").textContent = timeTxt(s);
      }
      gos.forEach(function (g) { g.setAttribute("aria-disabled", has ? "false" : "true"); });
    };
    items.forEach(function (b) {
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") === "true";
        if (b.dataset.mode === "one" && !on) items.forEach(function (o) { if (o.dataset.group === b.dataset.group) o.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", on ? "false" : "true");
        render();
      });
    });
    resetBtn.addEventListener("click", function () { items.forEach(function (o) { o.setAttribute("aria-pressed", "false"); }); render(); });
    gos.forEach(function (g) {
      g.addEventListener("click", function (e) {
        var s = state();
        if (!s.sel.length) { e.preventDefault(); return; }
        e.preventDefault();
        if (typeof window.gtag === "function") window.gtag("event", "calculator_request", { items: s.sel.length, value: s.p });
        location.href = "../kontakt/?msg=" + encodeURIComponent(message(s)) + "#kontakt";
      });
    });
    document.addEventListener("lang-switch", render);
    render();
  }

  // ---- Prefill contact form from calculator (?msg=) ----
  (function () {
    var f = document.getElementById("contactForm");
    if (!f) return;
    var m = /[?&]msg=([^&#]*)/.exec(location.search);
    if (!m) return;
    var text = ""; try { text = decodeURIComponent(m[1].replace(/\+/g, " ")); } catch (e) {}
    if (!text) return;
    f.message.value = text.slice(0, 1500);
    try { history.replaceState(null, "", location.pathname + "#kontakt"); } catch (e) {}
    setTimeout(function () { f.scrollIntoView({ block: "center", behavior: "smooth" }); f.name.focus({ preventScroll: true }); }, 400);
  })();

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
