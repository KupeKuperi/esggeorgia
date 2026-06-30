/* =========================================================================
   ESG - product detail page
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
      equipment: "აღჭურვილობა", cloths: "ტილოები", household: "საყოფაცხოვრებო", spec: "მახასიათებელი",
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
      equipment: "Equipment", cloths: "Cloths", household: "Household", spec: "Specification",
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
    cog: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
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
    /* pretty pages at /products/<slug>/ bake the slug in; fall back to ?slug= */
    if (window.__ESG_SLUG) return window.__ESG_SLUG;
    var p = new URLSearchParams(window.location.search);
    return p.get("slug") || "";
  }
  /* point search engines at the canonical pretty URL (dedupes ?slug= + /products/) */
  function setCanonical(slug) {
    var href = "https://esggeorgia.ge/products/" + slug + "/";
    var link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.setAttribute("rel", "canonical"); document.head.appendChild(link); }
    link.setAttribute("href", href);
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
        for (var j = 0; j < cats[i].subs.length; j++) {
          if (cats[i].subs[j].id === p.sub) return cats[i].subs[j].name[lang];
        }
      }
    }
    return "";
  }
  function currentSize(p) {
    var sizes = sortedSizes(p);
    var want = SEL[p.slug];
    var hit = sizes.filter(function (s) { return s.l === want; })[0];
    return hit || sizes[0];
  }

  function priceText(code, l) {
    var v = window.ESG_PRICE_OF ? window.ESG_PRICE_OF(code) : null;
    return (v != null) ? window.ESG_FMT_PRICE(v) : (l === "en" ? "on request" : "მოთხოვნით");
  }

  /* add-to-cart block (quantity stepper + button) injected into the detail */
  function acBlock(l) {
    var q = (l === "en" ? "Quantity" : "რაოდენობა");
    return '<div class="addcart" id="addcart">' +
      '<div class="addcart-row">' +
        '<div class="qty" role="group" aria-label="' + q + '">' +
          '<button class="qty-btn" type="button" id="ac-dec" aria-label="−"><svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button>' +
          '<input class="qty-input" id="ac-qty" type="text" inputmode="numeric" value="1" aria-label="' + q + '" />' +
          '<button class="qty-btn" type="button" id="ac-inc" aria-label="+"><svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>' +
        '</div>' +
        '<button class="btn btn-lg btn-primary addcart-btn" id="add-to-cart">' +
          (l === "en" ? "Add to cart" : "კალათაში დამატება") + '</button>' +
      '</div>' +
    '</div>';
  }
  /* getSel() returns the current {l, code, img} to add */
  function wireAdd(p, l, getSel) {
    var host = document.getElementById("product-detail");
    var dec = host.querySelector("#ac-dec"), inc = host.querySelector("#ac-inc"),
        qty = host.querySelector("#ac-qty"), add = host.querySelector("#add-to-cart");
    if (!add) return;
    function q() { var n = parseInt(qty.value, 10); return (isNaN(n) || n < 1) ? 1 : n; }
    if (dec) dec.addEventListener("click", function () { qty.value = Math.max(1, q() - 1); });
    if (inc) inc.addEventListener("click", function () { qty.value = q() + 1; });
    if (qty) qty.addEventListener("change", function () { qty.value = q(); });
    add.addEventListener("click", function () {
      if (!window.ESG_CART) return;
      var s = getSel();
      window.ESG_CART.add({
        slug: p.slug, name: p.name, l: s.l, code: s.code,
        price: (window.ESG_PRICE_OF ? window.ESG_PRICE_OF(s.code) : null),
        img: s.img || p.img, qty: q()
      });
    });
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

    /* packaging list - highlight the active row */
    var rows = sizes.map(function (s) {
      var on = s.l === sel.l;
      return '<li class="spec-row' + (on ? " on" : "") + '" data-l="' + s.l + '">' +
        '<span class="sz">' + fmtL(s.l, l) + " " + t.liter + '</span><span class="cd">' + (s.code ? "#" + s.code : "-") + "</span></li>";
    }).join("");

    var factDefs = [
      { i: "tag", k: t.category, v: catLabel },
      { i: "beaker", k: t.format, v: format },
      { i: "drop", k: t.dilution, v: p.dilution[l] }
    ];
    if (!p.noEco) factDefs.push({ i: "leaf", k: t.eco, v: t.biod });
    var facts = factDefs.map(function (f) {
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
        '<span class="eyebrow">' + catLabel + "</span>" +
        "<h1>" + p.name[l] + "</h1>" +
        '<p class="lede">' + p.blurb[l] + "</p>" +
        '<span class="chip">' + svg("drop", 15) + p.dilution[l] + "</span>" +
        '<div class="pd-block"><p class="lbl">' + t.size + '</p>' +
          '<div class="pd-sizes" role="group" aria-label="' + t.size + '">' + sizeBtns + "</div>" +
          '<p class="pd-codeline">' + t.code + ' · <span class="cd" id="sel-code">' + (sel.code ? "#" + sel.code : "-") + "</span></p>" +
          '<p class="pd-priceline">' + (l === "en" ? "Price" : "ფასი") + ' · <span class="pv" id="sel-price">' + priceText(sel.code, l) + "</span></p>" +
          acBlock(l) +
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

    document.title = "ESG - " + p.name[l];
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
        if (codeEl) codeEl.textContent = b.dataset.code ? "#" + b.dataset.code : "-";
        var priceEl = host.querySelector("#sel-price");
        if (priceEl) priceEl.textContent = priceText(b.dataset.code, l);
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
    wireAdd(p, l, function () { return currentSize(p); });
  }

  function renderSimilar(p, l) {
    var section = document.getElementById("similar-section");
    var grid = document.getElementById("similar-grid");
    if (!section || !grid || !window.ESG_CARD) return;
    /* same-category neighbours, walking forward from the current product and
       wrapping - so every product surfaces a different, related set instead of
       always the first three in the catalog. */
    var sameCat = (window.ESG_PRODUCTS || []).filter(function (q) {
      if (q.cat !== p.cat) return false;
      if (p.cat === "equipment") return q.sub === p.sub; // prefer same subcategory
      return true;
    });
    if (p.cat === "equipment" && sameCat.length < 2) {
      sameCat = (window.ESG_PRODUCTS || []).filter(function (q) { return q.cat === p.cat; });
    }
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

  /* ---- equipment detail (hardware: no dilution / sizes / eco) ---- */
  function renderEquipmentDetail(p, l) {
    var t = T[l];
    var host = document.getElementById("product-detail");
    var subLabel = subNameFor(p, l) || catLabelFor(p.cat, t);

    var facts = [
      { i: "tag", k: t.category, v: subLabel },
      { i: "cog", k: t.spec, v: (p.spec ? p.spec[l] : "-") },
      { i: "hash", k: t.code, v: (p.code ? "#" + p.code : "-") },
      { i: "tag", k: (l === "en" ? "Price" : "ფასი"), v: priceText(p.code, l) }
    ].map(function (f) {
      return '<li><span class="fi">' + svg(f.i) + '</span><span class="ft"><span class="k">' +
        f.k + '</span><span class="v">' + f.v + "</span></span></li>";
    }).join("");

    host.innerHTML =
      '<div class="pd-info">' +
        '<span class="eyebrow">' + subLabel + "</span>" +
        "<h1>" + p.name[l] + "</h1>" +
        (p.blurb ? '<p class="lede">' + p.blurb[l] + "</p>" : "") +
        (p.spec ? '<span class="chip">' + svg("cog", 15) + p.spec[l] + "</span>" : "") +
        '<div class="pd-block"><p class="lbl">' + t.facts + '</p><ul class="pd-facts">' + facts + "</ul></div>" +
        acBlock(l) +
        '<div class="pd-actions">' +
          '<a class="btn btn-lg btn-primary" href="contact.html">' + t.quote + svg("arrow", 17) + "</a>" +
          '<a class="btn btn-lg btn-outline" href="products.html">' + svg("back", 17) + t.back + "</a>" +
        "</div>" +
      "</div>" +
      '<div class="pd-media">' +
        '<div class="pd-stage ' + p.cat + '">' +
          '<span class="topbar"></span>' +
          '<span class="cat"><span class="d"></span>' + subLabel + "</span>" +
          '<img id="pd-photo" src="' + p.img + '" alt="' + p.name[l] + '" />' +
        "</div>" +
      "</div>";

    document.title = "ESG - " + p.name[l];
    wireAdd(p, l, function () { return { l: null, code: p.code, img: p.img }; });
  }

  function renderAll() {
    var l = lang();
    var slug = getSlug();
    if (!slug) { window.location.replace("products.html"); return; }
    var p = find(slug);
    if (!p) { renderNotFound(l); return; }
    setCanonical(slug);
    renderCrumbs(p, l);
    if (p.cat === "equipment" || p.cat === "cloths") { renderEquipmentDetail(p, l); }
    else { renderDetail(p, l); }
    renderSimilar(p, l);
  }

  document.addEventListener("DOMContentLoaded", renderAll);
  document.addEventListener("esg:lang", renderAll);
})();
