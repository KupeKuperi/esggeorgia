/* ESG — catalog rendering + filter tabs (CSS-only active animation) */
(function () {
  "use strict";

  var T = {
    ka: { all: "ყველა", quote: "ფასის მოთხოვნა", details: "დეტალურად", pack: "დაფასოება · კოდი",
          shampoo: "ავტოშამპუნი", biskonto: "ბისკონტო ავტოშამპუნი", cosmetics: "ავტოკოსმეტიკა", liter: "ლ", showing: "ნაჩვენებია", sizes: "მოცულობები" },
    en: { all: "All", quote: "Request a quote", details: "View details", pack: "Packaging · Code",
          shampoo: "Shampoo", biskonto: "Biskonto Shampoo", cosmetics: "Auto-cosmetics", liter: "L", showing: "Showing", sizes: "Sizes" }
  };

  /* badge label shown on each card / stage, keyed by category id */
  function catLabelFor(cat, t) {
    if (cat === "shampoo") return t.shampoo;
    if (cat === "biskonto") return t.biskonto;
    return t.cosmetics;
  }

  /* format a litre value: Georgian uses a comma decimal (0,5), English a dot (0.5) */
  function fmtL(l, lang) {
    var s = String(l);
    return lang === "ka" ? s.replace(".", ",") : s;
  }

  function svgDrop() {
    return '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2s7 6.7 7 12a7 7 0 0 1-14 0c0-5.3 7-12 7-12z"/></svg>';
  }
  function svgArrow() {
    return '<svg class="icon" style="width:15px;height:15px" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  }

  function cardHTML(p, lang) {
    var t = T[lang];
    var catLabel = catLabelFor(p.cat, t);
    var stageAttr = "", stageStyle = "";
    if (p.crop) {
      stageAttr = " data-crop";
      stageStyle = ' style="--crop:' + p.crop.pos + ';--zoom:' + p.crop.zoom + ';--corg:' + p.crop.org + '"';
    }
    var href = "product.html?slug=" + encodeURIComponent(p.slug);

    /* sizes largest → smallest (5 · 1 · 0.5) — drives the photos, dots and chips */
    var ordered = (p.sizes || []).slice();
    if (!p.keepOrder) ordered.sort(function (a, b) { return b.l - a.l; });
    var multi = ordered.length > 1;

    /* one layered photo per size; on hover the card cross-fades through them */
    var shots = ordered.map(function (s, i) {
      return '<img class="shot' + (i === 0 ? " on" : "") + '" data-l="' + s.l + '" src="' +
        s.img + '" alt="' + p.name[lang] + " · " + fmtL(s.l, lang) + " " + t.liter +
        '" loading="lazy" />';
    }).join("");

    var dots = multi
      ? '<div class="shot-dots" aria-hidden="true">' +
          ordered.map(function (s, i) { return '<i' + (i === 0 ? ' class="on"' : "") + "></i>"; }).join("") +
        "</div>"
      : "";

    /* size chips — show every available volume; the active one tracks the photo */
    var sizeChips = "";
    if (multi) {
      sizeChips =
        '<div class="pc-sizes" aria-label="' + t.sizes + '">' +
        ordered.map(function (s, i) {
          return '<span class="szc' + (i === 0 ? " on" : "") + '" data-l="' + s.l + '">' +
            fmtL(s.l, lang) + " " + t.liter + "</span>";
        }).join("") +
        "</div>";
    }

    return (
      '<article class="pc ' + p.cat + '" data-cat="' + p.cat + '">' +
        '<a class="pc-link" href="' + href + '" aria-label="' + p.name[lang] + '"></a>' +
        '<div class="bar"></div>' +
        '<div class="stage"' + stageAttr + stageStyle + (multi ? " data-cycle" : "") + '>' +
          '<span class="cat"><span class="d"></span>' + catLabel + "</span>" +
          '<div class="shots">' + shots + "</div>" +
          dots +
        "</div>" +
        '<div class="body">' +
          "<h3>" + p.name[lang] + "</h3>" +
          '<p class="blurb">' + p.blurb[lang] + "</p>" +
          '<span class="chip">' + svgDrop() + p.dilution[lang] + "</span>" +
          sizeChips +
          '<div class="quote"><a class="pc-cta" href="' + href + '">' + t.details + svgArrow() + "</a></div>" +
        "</div>" +
      "</article>"
    );
  }

  /* -------------------------------------------------------------------------
     Hover cross-fade: step through a product's size photos while the pointer
     (or keyboard focus) rests on the card. The active photo, dot and size
     chip stay in sync so the visitor can read which volume they're seeing.
     ------------------------------------------------------------------------- */
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CYCLE_MS = 1100;

  function bindCycle(card) {
    if (card.dataset.cycleBound) return;
    var stage = card.querySelector(".stage[data-cycle]");
    if (!stage) return;
    card.dataset.cycleBound = "1";
    var shots = Array.prototype.slice.call(stage.querySelectorAll(".shot"));
    if (shots.length < 2) return;
    var dots = Array.prototype.slice.call(stage.querySelectorAll(".shot-dots i"));
    var chips = Array.prototype.slice.call(card.querySelectorAll(".pc-sizes .szc"));
    var n = shots.length, idx = 0, timer = null;

    function show(i) {
      idx = i;
      shots.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      dots.forEach(function (d, k) { d.classList.toggle("on", k === i); });
      chips.forEach(function (c, k) { c.classList.toggle("on", k === i); });
    }
    function start() {
      if (timer || REDUCE) return;
      timer = setInterval(function () { show((idx + 1) % n); }, CYCLE_MS);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      show(0);
    }
    card.addEventListener("mouseenter", start);
    card.addEventListener("mouseleave", stop);
    card.addEventListener("focusin", start);
    card.addEventListener("focusout", stop);
  }

  function bindCycles(root) {
    (root || document).querySelectorAll(".pc").forEach(function (c) { bindCycle(c); });
  }
  window.ESG_BIND_CYCLES = bindCycles;

  /* expose the card builder so the detail page can render "similar products" */
  window.ESG_CARD = cardHTML;

  function init() {
    var grid = document.getElementById("product-grid");
    if (!grid || !window.ESG_PRODUCTS) return;
    var filterHost = document.getElementById("product-filters");
    var countEl = document.getElementById("product-count");
    var searchEl = document.getElementById("product-search");
    var clearEl = document.querySelector("[data-search-clear]");
    var emptyEl = document.getElementById("product-empty");
    var cats = window.ESG_CATEGORIES;
    var products = window.ESG_PRODUCTS;
    var current = "all";
    var query = "";

    function lang() { return (window.ESG && window.ESG.lang && window.ESG.lang()) || "ka"; }

    /* ---- build filter tabs ONCE; relabel in place on lang change ---- */
    /* with a single category the All/category split is redundant — hide the bar */
    if (cats.length <= 1) {
      filterHost.style.display = "none";
      current = cats.length ? "all" : "all";
    }
    var tabDefs = [{ id: "all" }].concat(cats.map(function (c) { return { id: c.id, cat: c }; }));
    filterHost.innerHTML =
      '<span class="pillslide" aria-hidden="true"></span>' +
      tabDefs.map(function (d, i) {
        return '<button class="tab" type="button" role="tab" data-id="' + d.id + '" aria-selected="' + (i === 0) + '"></button>';
      }).join("");
    var slide = filterHost.querySelector(".pillslide");
    var buttons = Array.prototype.slice.call(filterHost.querySelectorAll(".tab"));

    function relabel() {
      var t = T[lang()];
      buttons.forEach(function (b, i) {
        var d = tabDefs[i];
        b.textContent = d.id === "all" ? t.all : d.cat.name[lang()];
      });
    }
    function positionPill(instant) {
      var btn = filterHost.querySelector('.tab[aria-selected="true"]') || buttons[0];
      if (!btn) return;
      if (instant) {
        var prev = slide.style.transition;
        slide.style.transition = "none";
        slide.style.left = btn.offsetLeft + "px";
        slide.style.width = btn.offsetWidth + "px";
        void slide.offsetWidth; // force reflow so the jump isn't animated
        slide.style.transition = prev;
      } else {
        slide.style.left = btn.offsetLeft + "px";
        slide.style.width = btn.offsetWidth + "px";
      }
    }
    function select(btn) {
      buttons.forEach(function (b) { b.setAttribute("aria-selected", String(b === btn)); });
      positionPill();
      current = btn.dataset.id;
      render();
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { select(b); });
    });

    function matchesQuery(p) {
      if (!query) return true;
      var hay = (p.name.ka + " " + p.name.en + " " + p.slug + " " +
        p.sizes.map(function (s) { return s.code; }).join(" ")).toLowerCase();
      return hay.indexOf(query) !== -1;
    }

    function render() {
      var l = lang();
      var list = products.filter(function (p) {
        return (current === "all" || p.cat === current) && matchesQuery(p);
      });
      grid.innerHTML = list.map(function (p) { return cardHTML(p, l); }).join("");
      bindCycles(grid);
      if (countEl) countEl.textContent = T[l].showing + " · " + list.length;
      if (emptyEl) emptyEl.hidden = list.length !== 0;
    }

    /* ---- search ---- */
    if (searchEl) {
      searchEl.addEventListener("input", function () {
        query = searchEl.value.trim().toLowerCase();
        if (clearEl) clearEl.hidden = query === "";
        render();
      });
    }
    if (clearEl) {
      clearEl.addEventListener("click", function () {
        query = "";
        if (searchEl) { searchEl.value = ""; searchEl.focus(); }
        clearEl.hidden = true;
        render();
      });
    }

    /* initial paint */
    relabel();
    render();
    positionPill(true);
    // reposition once layout/fonts settle (Georgian metrics differ)
    requestAnimationFrame(function () { positionPill(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { positionPill(true); });
    window.addEventListener("load", function () { positionPill(true); });
    window.addEventListener("resize", function () { positionPill(true); });

    /* language change: relabel + re-render + reposition (no rebuild) */
    document.addEventListener("esg:lang", function () {
      relabel();
      render();
      positionPill(true);
      requestAnimationFrame(function () { positionPill(true); });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
