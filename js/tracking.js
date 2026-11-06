// Filigrana Studio - click tracking for GA4 (booking, phone, email)
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest("a[href]");
  if (!a || typeof gtag !== "function") return;
  var href = a.getAttribute("href") || "";
  if (href.indexOf("timma.no") !== -1) {
    gtag("event", "book_click", {
      link_text: a.textContent.trim().slice(0, 80),
      link_url: href,
      page_path: location.pathname,
    });
  } else if (href.indexOf("tel:") === 0) {
    gtag("event", "phone_click", { link_url: href, page_path: location.pathname });
  } else if (href.indexOf("mailto:") === 0) {
    gtag("event", "email_click", { link_url: href, page_path: location.pathname });
  }
});
