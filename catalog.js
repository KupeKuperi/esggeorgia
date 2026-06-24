/* ESG - catalog rendering + filter tabs (CSS-only active animation) */
(function () {
  "use strict";

  var T = {
    ka: { all: "ყველა", quote: "ფასის მოთხოვნა", details: "დეტალურად", pack: "დაფასოება · კოდი",
          shampoo: "ავტოშამპუნი", biskonto: "ბისკონტო ავტოშამპუნი", cosmetics: "ავტოკოსმეტიკა",
          equipment: "აღჭურვილობა", cloths: "ტილოები", household: "საყოფაცხოვრებო", code: "კოდი", liter: "ლ", showing: "ნაჩვენებია", sizes: "მოცულობები" },
    en: { all: "All", quote: "Request a quote", details: "View details", pack: "Packaging · Code",
          shampoo: "Shampoo", biskonto: "Biskonto Shampoo", cosmetics: "Auto-cosmetics",
          equipment: "Equipment", cloths: "Cloths", household: "Household", code: "Code", liter: "L", showing: "Showing", sizes: "Sizes" }
  };

  /* badge label shown on each card / stage, keyed by category id */
  function catLabelFor(cat, t) {
    if (cat === "shampoo") return t.shampoo;
    if (cat === "biskonto") return t.biskonto;
    if (cat === "equipment") return t.equipment;
    if (cat === "cloths") return t.cloths;
    if (cat === "household") return t.household;
    return t.cosmetics;
  }

  /* resolve a product's subcategory display name (equipment) */
  function subNameFor(p, lang) {
    var cats = window.ESG_CATEGORIES || [];
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].id === p.cat && cats[i].subs) {
        var subs = cats[i].subs;
        for (var j = 0; j < subs.length; j++) {
          if (subs[j].id === p.sub) return subs[j].name[lang];
        }
      }
    }
    return "";
  }

  /* format a litre value: Georgian uses a comma decimal (0,5), English a dot (0.5) */
  function fmtL(l, lang) {
    var s = String(l);
    return lang === "ka" ? s.replace(".", ",") : s;
  }

  function svgDrop() {
    return '<svg class="icon" viewBox="0 0 24 24"><path d="M12 2s7 6.7 7 12a7 7 0 0 1-14 0c0-5.3 7-12 7-12z"/></svg>';
  }
  function svgSpec() {
    return '<svg class="icon" viewBox="0 0 24 24"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>';
  }
  function svgArrow() {
    return '<svg class="icon" style="width:15px;height:15px" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  }

  /* ---- equipment card (hardware: no dilution / no liters) ---- */
  function equipmentCardHTML(p, lang) {
    var t = T[lang];
    var subLabel = subNameFor(p, lang) || catLabelFor(p.cat, t);
    var href = "product.html?slug=" + encodeURIComponent(p.slug);
    var name = p.name[lang];
    return (
      '<article class="pc ' + p.cat + '" data-cat="' + p.cat + '" data-sub="' + (p.sub || "") + '">' +
        '<a class="pc-link" href="' + href + '" aria-label="' + name + '"></a>' +
        '<div class="bar"></div>' +
        '<div class="stage eq">' +
          '<span class="cat"><span class="d"></span>' + subLabel + "</span>" +
          '<div class="shots"><img class="shot on" src="' + p.img + '" alt="' + name + '" loading="lazy" /></div>' +
        "</div>" +
        '<div class="body">' +
          "<h3>" + name + "</h3>" +
          (p.blurb ? '<p class="blurb">' + p.blurb[lang] + "</p>" : "") +
          (p.spec ? '<span class="chip eq-spec">' + svgSpec() + p.spec[lang] + "</span>" : "") +
          (p.code ? '<div class="eq-code">' + t.code + ' · <span class="cd">#' + p.code + "</span></div>" : "") +
          '<div class="quote"><a class="pc-cta" href="' + href + '">' + t.details + svgArrow() + "</a></div>" +
        "</div>" +
      "</article>"
    );
  }

  function cardHTML(p, lang) {
    if (p.cat === "equipment" || p.cat === "cloths") return equipmentCardHTML(p, lang);
    var t = T[lang];
    var catLabel = catLabelFor(p.cat, t);
    var stageAttr = "", stageStyle = "";
    if (p.crop) {
      stageAttr = " data-crop";
      stageStyle = ' style="--crop:' + p.crop.pos + ';--zoom:' + p.crop.zoom + ';--corg:' + p.crop.org + '"';
    }
    var href = "product.html?slug=" + encodeURIComponent(p.slug);

    /* sizes largest → smallest (5 · 1 · 0.5) - drives the photos, dots and chips */
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

    /* size chips - show every available volume; the active one tracks the photo */
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
    var subHost = document.getElementById("product-subfilters");
    var countEl = document.getElementById("product-count");
    var searchEl = document.getElementById("product-search");
    var clearEl = document.querySelector("[data-search-clear]");
    var emptyEl = document.getElementById("product-empty");
    var cats = window.ESG_CATEGORIES;
    var products = window.ESG_PRODUCTS;
    var current = "all";
    var currentSub = "all";
    var query = "";

    function lang() { return (window.ESG && window.ESG.lang && window.ESG.lang()) || "ka"; }
    function activeCat() {
      for (var i = 0; i < cats.length; i++) if (cats[i].id === current) return cats[i];
      return null;
    }

    /* ---- build filter tabs ONCE; relabel in place on lang change ---- */
    if (cats.length <= 1) {
      filterHost.style.display = "none";
      current = cats.length ? "all" : "all";
    }
    var FILTER_ICONS = {
      all:'<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
      biskonto:'<path d="M12 2s7 6.7 7 12a7 7 0 0 1-14 0c0-5.3 7-12 7-12z"/>',
      cosmetics:'<path d="M9 11h6v9a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zM9 7h6M10 7V4h4M18 5l2-1M18 8h2M18 11l2 1"/>',
      household:'<path d="M3 11l9-7 9 7M5 10v10h14V10"/>',
      equipment:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
      cloths:'<path d="M12 2 2 7l10 5 10-5zM2 12l10 5 10-5M2 17l10 5 10-5"/>'
    };
    function catCount(id) {
      if (id === "all") return products.length;
      return products.filter(function (p) { return p.cat === id || (p.cats && p.cats.indexOf(id) !== -1); }).length;
    }
    var tabDefs = [{ id: "all" }].concat(cats.map(function (c) { return { id: c.id, cat: c }; }));
    filterHost.innerHTML =
      tabDefs.map(function (d, i) {
        var ic = FILTER_ICONS[d.id] || FILTER_ICONS.all;
        return '<button class="tab" type="button" role="tab" data-id="' + d.id + '" aria-selected="' + (i === 0) + '">' +
          '<span class="ci" aria-hidden="true"><svg viewBox="0 0 24 24">' + ic + '</svg></span>' +
          '<span class="cl"></span>' +
          '<span class="cn">' + catCount(d.id) + '</span>' +
        '</button>';
      }).join("");
    var slide = null;
    var buttons = Array.prototype.slice.call(filterHost.querySelectorAll(".tab"));

    function relabel() {
      var t = T[lang()];
      buttons.forEach(function (b, i) {
        var d = tabDefs[i];
        var cl = b.querySelector(".cl");
        if (cl) cl.textContent = d.id === "all" ? t.all : d.cat.name[lang()];
      });
      relabelSubs();
    }

    /* ---- subcategory chip row (only for categories that define subs) ---- */
    function buildSubs() {
      if (!subHost) return;
      var cat = activeCat();
      if (!cat || !cat.subs || !cat.subs.length) {
        subHost.innerHTML = "";
        subHost.hidden = true;
        return;
      }
      var subDefs = [{ id: "all" }].concat(cat.subs.map(function (s) { return { id: s.id, sub: s }; }));
      subHost.innerHTML = subDefs.map(function (d) {
        return '<button class="subtab" type="button" data-sub="' + d.id + '" aria-pressed="' + (d.id === currentSub) + '"></button>';
      }).join("");
      subHost.hidden = false;
      Array.prototype.slice.call(subHost.querySelectorAll(".subtab")).forEach(function (b) {
        b.addEventListener("click", function () {
          currentSub = b.dataset.sub;
          Array.prototype.slice.call(subHost.querySelectorAll(".subtab")).forEach(function (o) {
            o.setAttribute("aria-pressed", String(o === b));
          });
          render();
        });
      });
      relabelSubs();
    }
    function relabelSubs() {
      if (!subHost || subHost.hidden) return;
      var cat = activeCat();
      if (!cat || !cat.subs) return;
      var t = T[lang()];
      var subDefs = [{ id: "all" }].concat(cat.subs.map(function (s) { return { id: s.id, sub: s }; }));
      Array.prototype.slice.call(subHost.querySelectorAll(".subtab")).forEach(function (b, i) {
        var d = subDefs[i];
        b.textContent = d.id === "all" ? t.all : d.sub.name[lang()];
      });
    }

    function positionPill() { /* chip filter: active state is handled by [aria-selected]; no sliding pill */ }
    function select(btn) {
      buttons.forEach(function (b) { b.setAttribute("aria-selected", String(b === btn)); });
      positionPill();
      current = btn.dataset.id;
      currentSub = "all";
      buildSubs();
      render();
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { select(b); });
    });

    function matchesQuery(p) {
      if (!query) return true;
      var codes = (p.sizes || []).map(function (s) { return s.code; }).join(" ");
      var hay = (p.name.ka + " " + p.name.en + " " + p.slug + " " + codes + " " +
        (p.code || "") + " " + (p.spec ? p.spec.ka + " " + p.spec.en : "")).toLowerCase();
      return hay.indexOf(query) !== -1;
    }

    function render() {
      var l = lang();
      var list = products.filter(function (p) {
        if (current !== "all" && p.cat !== current && !(p.cats && p.cats.indexOf(current) !== -1)) return false;
        if (current !== "all" && currentSub !== "all" && p.sub !== currentSub) return false;
        return matchesQuery(p);
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
    buildSubs();
    render();
    positionPill(true);
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
