/* =========================================================================
   ESG - shared behavior (bilingual i18n, sticky header, mobile menu, reveal)
   Pages carry their own inline header/footer + real content.
   Catalog rendering lives in catalog.js (products page only).
   ========================================================================= */
(function () {
  "use strict";

  var LANG_KEY = "esg-lang";

  /* ---------------- i18n (KA primary / EN opt-in) ---------------- */
  function getLang() {
    try { return localStorage.getItem(LANG_KEY) || "ka"; } catch (e) { return "ka"; }
  }
  function applyLang(l) {
    document.documentElement.lang = l;
    document.querySelectorAll(".i18n").forEach(function (el) {
      var v = el.getAttribute("data-" + l);
      if (v !== null) el.textContent = v;
    });
    document.querySelectorAll(".i18n-attr").forEach(function (el) {
      var attr = el.getAttribute("data-attr");
      var v = el.getAttribute("data-" + l);
      if (attr && v !== null) el.setAttribute(attr, v);
    });
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === l));
    });
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    // notify the catalog (if present) to re-render localized cards
    document.dispatchEvent(new CustomEvent("esg:lang", { detail: { lang: l } }));
  }
  // public API used by catalog.js - both names provided to avoid contract drift
  window.ESG = window.ESG || {};
  window.ESG.lang = getLang;
  window.ESG.getLang = getLang;
  window.ESG.setLang = applyLang;

  /* ---------------- header: solidify + scroll progress ---------------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    var bar = document.querySelector(".site-header .scrollbar");
    if (!header) return;
    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle("scrolled", y > 8);
      if (bar) {
        var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- mobile menu ---------------- */
  function initMenu() {
    var btn = document.querySelector("[data-menu-btn]");
    var menu = document.querySelector(".mobile-menu");
    if (!btn || !menu) return;
    var open = false;
    function set(v) {
      open = v;
      menu.classList.toggle("open", v);
      btn.setAttribute("aria-expanded", String(v));
      document.body.style.overflow = v ? "hidden" : "";
      var im = btn.querySelector("[data-i-menu]"), ic = btn.querySelector("[data-i-close]");
      if (im) im.style.display = v ? "none" : "";
      if (ic) ic.style.display = v ? "" : "none";
    }
    btn.addEventListener("click", function () { set(!open); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { set(false); });
    });
  }

  /* ---------------- reveal on scroll (robust: never leaves content hidden) ---------------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!els.length) return;
    function show(el) {
      var d = parseFloat(el.getAttribute("data-delay") || "0");
      el.style.transitionDelay = d + "s";
      el.classList.add("in");
    }
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(show);
      return;
    }
    // reveal anything already in / near the viewport immediately
    var vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) show(el);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { if (!el.classList.contains("in")) io.observe(el); });
    // safety net: never leave content invisible (offscreen/throttled frames)
    setTimeout(function () {
      els.forEach(function (el) { if (!el.classList.contains("in")) show(el); });
    }, 2500);
  }

  /* ---------------- language toggle buttons ---------------- */
  function initLangButtons() {
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.dataset.lang); });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLangButtons();
    initHeader();
    initMenu();
    initReveal();
    applyLang(getLang());
  });
})();
