/* =========================================================================
   ESG — product detail page
   Reads ?slug=… from the URL, renders the detail view + similar products.
   Size switcher: clicking a volume swaps the photo + article code live.
   Reuses window.ESG_CARD (from catalog.js) for the similar-product cards.
   ========================================================================= */
(function () {
  "use strict";

  var T = {
    ka: {
      home: "მთავარი", products: "პროდუქცია",
      shampoo: "უკონტაქტო ავტოშამპუნი", biskonto: "ბისკონტო ავტოშამპუნი", cosmetics: "ავტოკოსმეტიკა",
      pack: "დაფასოება და კოდები", liter: "ლ",
      facts: "მახასიათებლები", size: "მოცულობა", code: "კოდი",
      usage: "მოხმარების წესი",
      category: "კატეგორია", dilution: "გაზავება", format: "ფორმა", eco: "ეკოლოგია",
      concentrate: "კონცენტრატი", ready: "მზა გამოსაყენებლად", biod: "ბიოდეგრადირებადი",
      quote: "ფასის მოთხოვნა", back: "კატალოგში დაბრუნება",
      notfound: "პროდუქტი ვერ მოიძებნა.", browse: "კატალოგის ნახვა"
    },
    en: {
      home: "Home", products: "Products",
      shampoo: "Touch-free shampoo", biskonto: "Biskonto Shampoo", cosmetics: "Auto-cosmetics",
      pack: "Packaging & codes", liter: "L",
      facts: "Key facts", size: "Size", code: "Code",
      usage: "How to use",
      category: "Category", dilution: "Dilution", format: "Format", eco: "Ecology",
      concentrate: "Concentrate", ready: "Ready to use", biod: "Biodegradable",
      quote: "Request a quote", back: "Back to catalog",
      notfound: "Product not found.", browse: "Browse the catalog"
    }
  };

  var ICON = {
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 1.4.6l6.4 6.4a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    drop: '<path d="M12 2s7 6.7 7 12a7 7 0 0 1-14 0c0-5.3 7-12 7-12z"/>',
    beaker: '<path d="M9 3h6M10 3v6.5L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.5V3"/><path d="M7 15h10"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 9-3 16-9 16z"/><path d="M4 20c3-4 6-6 10-7"/>',
    spray: '<path d="M9 3h4M9 5h4l1 3H8zM8 8h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4zM12 15v6M16 5h3M16 7h4M16 9h3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>'
  };
  function svg(name, w) {
    var s = w || 17;
    return '<svg class="icon" style="width:' + s + 'px;height:' + s + 'px" viewBox="0 0 24 24">' + ICON[name] + "</svg>";
  }

  /* litre formatting: Georgian comma decimal (0,5), English dot (0.5) */
  function fmtL(l, lang) { var s = String(l); return lang === "ka" ? s.replace(".", ",") : s; }

  /* remembered selection per slug (litres) so it survives language re-render */
  var SEL = {};

  function getSlug() {
    var p = new URLSearchParams(window.location.search);
    return p.get("slug") || "";
  }
  function lang() {
    return (window.ESG && window.ESG.lang && window.ESG.lang()) || "ka";
  }
  function find(slug) {
    return (window.ESG_PRODUCTS || []).filter(function (p) { return p.slug === slug; })[0] || null;
  }

  /* sizes sorted largest → smallest (5 · 1 · 0.5); keepOrder preserves the
     authored order (Biskonto lists 1 → 5 → 20 L). */
  function sortedSizes(p) {
    var s = (p.sizes || []).slice();
    if (!p.keepOrder) s.sort(function (a, b) { return b.l - a.l; });
    return s;
  }
  /* badge label shown on the detail stage, keyed by category id */
  function catLabelFor(cat, t) {
    if (cat === "shampoo") return t.shampoo;
    if (cat === "biskonto") return t.biskonto;
    return t.cosmetics;
  }
  function currentSize(p) {
    var sizes = sortedSizes(p);
    var want = SEL[p.slug];
    var hit = sizes.filter(function (s) { return s.l === want; })[0];
    return hit || sizes[0];
  }

  function renderCrumbs(p, l) {
    var t = T[l], host = document.getElementById("crumbs");
    if (!host) return;
    host.innerHTML =
      '<a href="index.html">' + t.home + "</a>" +
      svg("arrow", 14).replace("icon", "icon sep") +
      '<a href="products.html">' + t.products + "</a>" +
      (p ? svg("arrow", 14).replace("icon", "icon sep") + '<span class="here">' + p.name[l] + "</span>" : "");
  }

  function renderDetail(p, l) {
    var t = T[l];
    var host = document.getElementById("product-detail");
    var catLabel = catLabelFor(p.cat, t);
    var isReady = /მზა|ready/i.test(p.dilution.ka + " " + p.dilution.en);
    var format = isReady ? t.ready : t.concentrate;
    var sizes = sortedSizes(p);
    var sel = currentSize(p);

    /* size switcher buttons */
    var sizeBtns = sizes.map(function (s) {
      var on = s.l === sel.l;
      return '<button type="button" class="szbtn' + (on ? " on" : "") + '" data-l="' + s.l +
        '" data-img="' + s.img + '" data-code="' + s.code + '" aria-pressed="' + on + '">' +
        fmtL(s.l, l) + " " + t.liter + "</button>";
    }).join("");

    /* packaging list — highlight the active row */
    var rows = sizes.map(function (s) {
      var on = s.l === sel.l;
      return '<li class="spec-row' + (on ? " on" : "") + '" data-l="' + s.l + '">' +
        '<span class="sz">' + fmtL(s.l, l) + " " + t.liter + '</span><span class="cd">' + (s.code ? "#" + s.code : "—") + "</span></li>";
    }).join("");

    var facts = [
      { i: "tag", k: t.category, v: catLabel },
      { i: "beaker", k: t.format, v: format },
      { i: "drop", k: t.dilution, v: p.dilution[l] },
      { i: "leaf", k: t.eco, v: t.biod }
    ].map(function (f) {
      return '<li><span class="fi">' + svg(f.i) + '</span><span class="ft"><span class="k">' +
        f.k + '</span><span class="v">' + f.v + "</span></span></li>";
    }).join("");

    var usageBlock = p.usage ? (
      '<div class="pd-block"><p class="lbl">' + t.usage + '</p>' +
      '<p class="pd-usage">' + svg("spray", 18) + "<span>" + p.usage[l] + "</span></p></div>"
    ) : "";

    /* main photo: show the group/hero shot until the visitor picks a size */
    var heroShown = (SEL[p.slug] == null && p.hero);
    var mainImg = heroShown ? p.hero : sel.img;
    var mainAlt = heroShown ? p.name[l] : (p.name[l] + " · " + fmtL(sel.l, l) + " " + t.liter);

    host.innerHTML =
      '<div class="pd-info">' +
        '<span class="eyebrow"><span class="idx">01</span>' + catLabel + "</span>" +
        "<h1>" + p.name[l] + "</h1>" +
        '<p class="lede">' + p.blurb[l] + "</p>" +
        '<span class="chip">' + svg("drop", 15) + p.dilution[l] + "</span>" +
        '<div class="pd-block"><p class="lbl">' + t.size + '</p>' +
          '<div class="pd-sizes" role="group" aria-label="' + t.size + '">' + sizeBtns + "</div>" +
          '<p class="pd-codeline">' + t.code + ' · <span class="cd" id="sel-code">' + (sel.code ? "#" + sel.code : "—") + "</span></p>" +
        "</div>" +
        '<div class="pd-block"><p class="lbl">' + t.facts + '</p><ul class="pd-facts">' + facts + "</ul></div>" +
        usageBlock +
        '<div class="pd-block"><p class="lbl">' + t.pack + '</p><ul class="pd-specs">' + rows + "</ul></div>" +
        '<div class="pd-actions">' +
          '<a class="btn btn-lg btn-primary" href="contact.html">' + t.quote + svg("arrow", 17) + "</a>" +
          '<a class="btn btn-lg btn-outline" href="products.html">' + svg("back", 17) + t.back + "</a>" +
        "</div>" +
      "</div>" +
      '<div class="pd-media">' +
        '<div class="pd-stage ' + p.cat + '">' +
          '<span class="topbar"></span>' +
          '<span class="cat"><span class="d"></span>' + catLabel + "</span>" +
          '<img id="pd-photo" src="' + mainImg + '" alt="' + mainAlt + '" />' +
        "</div>" +
      "</div>";

    document.title = "ESG — " + p.name[l];
    bindSizes(p, l);
  }

  /* wire up the size buttons: swap photo + code without a full re-render */
  function bindSizes(p, l) {
    var host = document.getElementById("product-detail");
    var btns = Array.prototype.slice.call(host.querySelectorAll(".szbtn"));
    var photo = host.querySelector("#pd-photo");
    var codeEl = host.querySelector("#sel-code");
    var rows = Array.prototype.slice.call(host.querySelectorAll(".spec-row"));
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var litre = parseFloat(b.dataset.l);
        SEL[p.slug] = litre;
        btns.forEach(function (o) {
          var on = o === b;
          o.classList.toggle("on", on);
          o.setAttribute("aria-pressed", String(on));
        });
        rows.forEach(function (r) { r.classList.toggle("on", parseFloat(r.dataset.l) === litre); });
        if (codeEl) codeEl.textContent = b.dataset.code ? "#" + b.dataset.code : "—";
        if (photo) {
          photo.classList.add("swap");
          var next = b.dataset.img;
          var pre = new Image();
          pre.onload = function () {
            photo.src = next;
            photo.alt = p.name[l] + " · " + fmtL(litre, l) + " " + T[l].liter;
            requestAnimationFrame(function () { photo.classList.remove("swap"); });
          };
          pre.src = next;
        }
      });
    });
  }

  function renderSimilar(p, l) {
    var section = document.getElementById("similar-section");
    var grid = document.getElementById("similar-grid");
    if (!section || !grid || !window.ESG_CARD) return;
    /* same-category neighbours, walking forward from the current product and
       wrapping — so every product surfaces a different, related set instead of
       always the first three in the catalog. */
    var sameCat = (window.ESG_PRODUCTS || []).filter(function (q) { return q.cat === p.cat; });
    var start = sameCat.findIndex(function (q) { return q.slug === p.slug; });
    if (start < 0) start = 0;
    var pool = [];
    for (var i = 1; i < sameCat.length && pool.length < 3; i++) {
      pool.push(sameCat[(start + i) % sameCat.length]);
    }
    /* top up from other categories if this one is too small */
    if (pool.length < 3) {
      (window.ESG_PRODUCTS || []).forEach(function (q) {
        if (q.slug !== p.slug && pool.indexOf(q) === -1 && pool.length < 3) pool.push(q);
      });
    }
    if (!pool.length) { section.hidden = true; return; }
    section.hidden = false;
    grid.innerHTML = pool.map(function (q) { return window.ESG_CARD(q, l); }).join("");
    if (window.ESG_BIND_CYCLES) window.ESG_BIND_CYCLES(grid);
  }

  function renderNotFound(l) {
    var t = T[l];
    var host = document.getElementById("product-detail");
    document.getElementById("crumbs").innerHTML =
      '<a href="index.html">' + t.home + "</a>" +
      svg("arrow", 14).replace("icon", "icon sep") +
      '<a href="products.html">' + t.products + "</a>";
    host.style.display = "block";
    host.innerHTML =
      '<div class="empty-state" style="margin:40px 0">' + t.notfound +
      '<div style="margin-top:20px"><a class="btn btn-lg btn-primary" href="products.html">' +
      t.browse + svg("arrow", 17) + "</a></div></div>";
    var s = document.getElementById("similar-section");
    if (s) s.hidden = true;
  }

  function renderAll() {
    var l = lang();
    var slug = getSlug();
    if (!slug) { window.location.replace("products.html"); return; }
    var p = find(slug);
    if (!p) { renderNotFound(l); return; }
    renderCrumbs(p, l);
    renderDetail(p, l);
    renderSimilar(p, l);
  }

  document.addEventListener("DOMContentLoaded", renderAll);
  document.addEventListener("esg:lang", renderAll);
})();
