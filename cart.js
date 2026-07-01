/* =========================================================================
   ESG - cart & checkout (one self-contained module, loaded on every page)

   Owns: localStorage cart state, the header cart icon + count badge, the
   slide-out drawer (injected once into <body>), and the checkout page wiring
   (order summary + WhatsApp / email submit). No framework, no external libs.

   Public API (used by product.js to add items):
     window.ESG_CART.add({ slug, name:{ka,en}, l, code, price, img })
     window.ESG_CART.open()  window.ESG_CART.count()

   Notes:
   - Item names are rendered with textContent (never innerHTML) — XSS-safe.
   - WhatsApp uses wa.me (navigation, no CSP impact); email uses FormSubmit
     (needs `connect-src https://formsubmit.co` on checkout.html).
   ========================================================================= */
(function () {
  "use strict";

  var KEY = "esg_cart_v1";
  var WA_NUMBER = "995551519165";                                   // WhatsApp (no +)
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/ekokemikaservicegroup@gmail.com";

  /* ---------------- state ---------------- */
  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function write() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  var items = read();

  /* ---------------- helpers ---------------- */
  function lang() { return (window.ESG && window.ESG.lang && window.ESG.lang()) || "ka"; }
  function t(ka, en) { return lang() === "en" ? en : ka; }
  function money(v) { return (v % 1 === 0 ? String(v) : v.toFixed(2)) + " ₾"; }
  function priced(it) { return typeof it.price === "number"; }
  function nameOf(it) { return (it.name && (it.name[lang()] || it.name.ka || it.name.en)) || ""; }
  function sizeOf(it) {
    if (it.l == null) return it.code ? "#" + it.code : "";
    var n = lang() === "ka" ? String(it.l).replace(".", ",") : String(it.l);
    return n + " " + t("ლ", "L") + (it.code ? " · #" + it.code : "");
  }
  function count() { return items.reduce(function (n, i) { return n + i.qty; }, 0); }
  function subtotal() { return items.reduce(function (s, i) { return s + (priced(i) ? i.price * i.qty : 0); }, 0); }
  function quoteCount() { return items.filter(function (i) { return !priced(i); }).length; }

  /* ---------------- mutations ---------------- */
  function add(p) {
    if (!p || !p.slug) return;
    var id = p.slug + "::" + (p.l == null ? "u" : p.l);
    var ex = items.filter(function (i) { return i.id === id; })[0];
    var qty = Math.max(1, parseInt(p.qty, 10) || 1);
    if (ex) ex.qty += qty;
    else items.push({ id: id, slug: p.slug, name: p.name, l: (p.l == null ? null : p.l),
                      code: p.code || "", price: (typeof p.price === "number" ? p.price : null),
                      img: p.img || "", qty: qty });
    write(); renderAll(); open();
  }
  function remove(id) { items = items.filter(function (i) { return i.id !== id; }); write(); renderAll(); }
  function setQty(id, q) {
    var it = items.filter(function (i) { return i.id === id; })[0];
    if (!it) return;
    q = parseInt(q, 10); if (isNaN(q) || q < 1) q = 1;
    it.qty = q; write(); renderAll();
  }

  /* ===================================================================
     DOM: header icon + drawer (injected once)
     =================================================================== */
  var elDrawer, elOverlay, elItems, elEmpty, elBody, elFoot, lastFocus;

  function cartIconSVG() {
    return '<svg class="icon" viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.6"/>' +
      '<circle cx="18" cy="20" r="1.6"/><path d="M2.5 3h2.2l2.2 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6.2"/></svg>';
  }
  function makeIcon(idAttr) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "cart-btn i18n-attr";
    b.setAttribute("data-attr", "aria-label");
    b.setAttribute("data-ka", "კალათა"); b.setAttribute("data-en", "Cart");
    b.setAttribute("aria-label", "კალათა");
    if (idAttr) b.id = idAttr;
    b.innerHTML = cartIconSVG() + '<span class="cart-badge" data-count="0">0</span>';
    b.addEventListener("click", open);
    return b;
  }

  function injectIcons() {
    var desk = document.querySelector(".header-actions");
    if (desk && !desk.querySelector(".cart-btn")) {
      var quote = desk.querySelector(".btn");
      var icon = makeIcon("cart-toggle");
      desk.insertBefore(icon, quote || null);
    }
    var mob = document.querySelector(".header-mobile");
    if (mob && !mob.querySelector(".cart-btn")) {
      var menuBtn = mob.querySelector("[data-menu-btn]");
      mob.insertBefore(makeIcon("cart-toggle-m"), menuBtn || null);
    }
  }

  function injectDrawer() {
    if (document.getElementById("cart-drawer")) return;
    elOverlay = document.createElement("div");
    elOverlay.className = "cart-overlay";
    elOverlay.addEventListener("click", close);

    elDrawer = document.createElement("aside");
    elDrawer.id = "cart-drawer";
    elDrawer.className = "cart-drawer";
    elDrawer.setAttribute("role", "dialog");
    elDrawer.setAttribute("aria-modal", "true");
    elDrawer.setAttribute("aria-label", "კალათა");
    elDrawer.setAttribute("aria-hidden", "true");
    elDrawer.innerHTML =
      '<div class="cart-head">' +
        '<h2><span class="i18n" data-ka="კალათა" data-en="Your cart">კალათა</span> ' +
          '<span class="cart-head-count"></span></h2>' +
        '<button type="button" class="cart-close i18n-attr" data-attr="aria-label" data-ka="დახურვა" data-en="Close" aria-label="დახურვა">' +
          '<svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '</div>' +
      '<div class="cart-body"><ul class="cart-items"></ul></div>' +
      '<div class="cart-empty" hidden>' +
        '<span class="ce-ico"><svg class="icon" viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2.5 3h2.2l2.2 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6.2"/></svg></span>' +
        '<h3 class="i18n" data-ka="კალათა ცარიელია" data-en="Your cart is empty">კალათა ცარიელია</h3>' +
        '<p class="i18n" data-ka="დაამატეთ პროდუქცია კატალოგიდან." data-en="Add products from the catalog.">დაამატეთ პროდუქცია კატალოგიდან.</p>' +
        '<a class="btn btn-md btn-primary i18n" href="products.html" data-ka="პროდუქციის ნახვა" data-en="Browse products">პროდუქციის ნახვა</a>' +
      '</div>' +
      '<div class="cart-foot">' +
        '<p class="cart-quote-note" hidden><svg class="icon" viewBox="0 0 24 24" style="width:15px;height:15px"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg> <span></span></p>' +
        '<div class="cart-subtotal-row"><span class="lbl i18n" data-ka="ჯამი" data-en="Subtotal">ჯამი</span><span class="val" id="cart-subtotal">0 ₾</span></div>' +
        '<p class="cart-note i18n" data-ka="გადახდა — საბანკო გადარიცხვა ან კურიერთან." data-en="Payment — bank transfer or cash on delivery.">გადახდა — საბანკო გადარიცხვა ან კურიერთან.</p>' +
        '<a class="btn btn-lg btn-primary btn-block i18n" id="cart-checkout" href="checkout.html" data-ka="შეკვეთის გაფორმება" data-en="Checkout">შეკვეთის გაფორმება</a>' +
      '</div>';
    document.body.appendChild(elOverlay);
    document.body.appendChild(elDrawer);

    elBody = elDrawer.querySelector(".cart-body");
    elItems = elDrawer.querySelector(".cart-items");
    elEmpty = elDrawer.querySelector(".cart-empty");
    elFoot = elDrawer.querySelector(".cart-foot");
    elDrawer.querySelector(".cart-close").addEventListener("click", close);

    /* event delegation for per-item qty / remove */
    elItems.addEventListener("click", function (e) {
      var li = e.target.closest(".cart-item"); if (!li) return;
      var id = li.getAttribute("data-id");
      if (e.target.closest("[data-remove]")) return remove(id);
      if (e.target.closest("[data-qty-dec]")) return setQty(id, qtyOf(id) - 1);
      if (e.target.closest("[data-qty-inc]")) return setQty(id, qtyOf(id) + 1);
    });
    elItems.addEventListener("change", function (e) {
      var inp = e.target.closest("[data-qty-input]"); if (!inp) return;
      var li = e.target.closest(".cart-item");
      setQty(li.getAttribute("data-id"), inp.value);
    });
  }
  function qtyOf(id) { var it = items.filter(function (i) { return i.id === id; })[0]; return it ? it.qty : 1; }

  /* ---------------- open / close + focus trap ---------------- */
  function open() {
    if (!elDrawer) return;
    lastFocus = document.activeElement;
    elOverlay.classList.add("is-shown");
    elDrawer.classList.add("is-open");
    elDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    var f = elDrawer.querySelector(".cart-close"); if (f) f.focus();
  }
  function close() {
    if (!elDrawer) return;
    elOverlay.classList.remove("is-shown");
    elDrawer.classList.remove("is-open");
    elDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") return close();
    if (e.key !== "Tab") return;
    var f = elDrawer.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])');
    f = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------------- render: badge + drawer ---------------- */
  function renderBadges() {
    var n = count();
    document.querySelectorAll(".cart-badge").forEach(function (b) {
      b.setAttribute("data-count", String(n));
      b.textContent = String(n);
    });
    /* announce the count through the button label (badge itself is visual) */
    document.querySelectorAll(".cart-btn").forEach(function (btn) {
      var base = lang() === "en" ? "Cart" : "კალათა";
      btn.setAttribute("aria-label", n > 0 ? base + " (" + n + ")" : base);
    });
  }
  function drawerRow(it) {
    var li = document.createElement("li");
    li.className = "cart-item"; li.setAttribute("data-id", it.id);
    li.innerHTML =
      '<img class="ci-thumb" alt="" loading="lazy" />' +
      '<div class="ci-main"><div class="ci-name"></div><div class="ci-size"></div>' +
        '<div class="ci-qty qty" role="group" aria-label="' + t("რაოდენობა", "Quantity") + '">' +
          '<button class="qty-btn" type="button" data-qty-dec aria-label="' + t("რაოდენობის შემცირება", "Decrease quantity") + '"><svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button>' +
          '<input class="qty-input" data-qty-input type="text" inputmode="numeric" aria-label="' + t("რაოდენობა", "Quantity") + '" />' +
          '<button class="qty-btn" type="button" data-qty-inc aria-label="' + t("რაოდენობის გაზრდა", "Increase quantity") + '"><svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>' +
        '</div></div>' +
      '<div class="ci-right">' +
        '<button class="ci-remove" type="button" data-remove aria-label="' + t("წაშლა", "Remove") + '"><svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<div class="ci-line"></div><div class="ci-unit"></div>' +
      '</div>';
    li.querySelector(".ci-thumb").src = it.img || "";
    li.querySelector(".ci-name").textContent = nameOf(it);
    li.querySelector(".ci-size").textContent = sizeOf(it);
    li.querySelector("[data-qty-input]").value = it.qty;
    var line = li.querySelector(".ci-line"), unit = li.querySelector(".ci-unit");
    if (priced(it)) { line.textContent = money(it.price * it.qty); unit.textContent = money(it.price) + " × " + it.qty; }
    else { line.className = "ci-line req"; line.textContent = t("ფასი მოთხოვნით", "Price on request"); unit.textContent = ""; }
    return li;
  }
  function renderDrawer() {
    if (!elDrawer) return;
    var has = items.length > 0;
    elBody.hidden = !has; elFoot.hidden = !has; elEmpty.hidden = has;
    elDrawer.querySelector(".cart-head-count").textContent = has ? "(" + count() + ")" : "";
    if (!has) return;
    elItems.innerHTML = "";
    items.forEach(function (it) { elItems.appendChild(drawerRow(it)); });
    elDrawer.querySelector("#cart-subtotal").textContent = money(subtotal());
    var qn = elDrawer.querySelector(".cart-quote-note"), qc = quoteCount();
    qn.hidden = qc === 0;
    if (qc) qn.querySelector("span").textContent = t(qc + " პოზიცია — ფასი მოთხოვნით", qc + " item(s) priced on request");
  }

  /* ===================================================================
     Checkout page (only runs if #order-form is present)
     =================================================================== */
  function renderCheckout() {
    var form = document.getElementById("order-form"); if (!form) return;
    /* empty cart → show the empty state instead of a blank summary */
    var emptyEl = document.getElementById("checkout-empty");
    var grid = document.querySelector(".checkout-grid");
    var success = document.getElementById("order-success");
    var isEmpty = items.length === 0 && !(success && success.classList.contains("is-shown"));
    if (emptyEl) emptyEl.classList.toggle("is-shown", isEmpty);
    if (grid) grid.style.display = isEmpty || (success && success.classList.contains("is-shown")) ? "none" : "";
    if (isEmpty) return;
    var list = document.getElementById("order-items");
    if (list) {
      list.innerHTML = "";
      items.forEach(function (it) {
        var li = document.createElement("li"); li.className = "co-item";
        li.innerHTML = '<img class="co-thumb" alt="" loading="lazy" />' +
          '<div><div class="co-iname"></div><div class="co-imeta"></div></div>' +
          '<div class="co-iline"></div>';
        li.querySelector(".co-thumb").src = it.img || "";
        li.querySelector(".co-iname").textContent = nameOf(it);
        li.querySelector(".co-imeta").textContent = sizeOf(it) + " · × " + it.qty;
        var ln = li.querySelector(".co-iline");
        if (priced(it)) ln.textContent = money(it.price * it.qty);
        else { ln.className = "co-iline req"; ln.textContent = t("მოთხოვნით", "On request"); }
        list.appendChild(li);
      });
    }
    var st = document.getElementById("order-subtotal"); if (st) st.textContent = money(subtotal());
    var tot = document.getElementById("order-total"); if (tot) tot.textContent = money(subtotal());
    var qrow = form.closest(".container").querySelector(".co-row.quote");
    if (qrow) { var qc = quoteCount(); qrow.hidden = qc === 0;
      var qs = qrow.querySelector(".v"); if (qs) qs.textContent = t(qc + " პოზიცია", qc + " item(s)"); }
  }

  /* order reference: date + random suffix, shared between the message and the
     success screen so the customer and the team talk about the same number */
  var orderRef = null;
  function makeRef() {
    var d = new Date(), pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return "ESG-" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
           "-" + String(Math.floor(1000 + Math.random() * 9000));
  }

  function orderText() {
    var lines = [];
    lines.push(t("ESG — ახალი შეკვეთა", "ESG — new order") + " · #" + orderRef);
    lines.push("—————");
    items.forEach(function (it, i) {
      var row = (i + 1) + ") " + nameOf(it) + " — " + sizeOf(it) + " × " + it.qty;
      row += priced(it) ? " = " + money(it.price * it.qty) : " — " + t("ფასი მოთხოვნით", "price on request");
      lines.push(row);
    });
    lines.push("—————");
    lines.push(t("ჯამი", "Total") + ": " + money(subtotal()));
    if (quoteCount()) lines.push("+ " + quoteCount() + " " + t("პოზიცია ფასი მოთხოვნით", "item(s) priced on request"));
    return lines.join("\n");
  }
  function customerText(f) {
    var L = [];
    L.push(t("სახელი", "Name") + ": " + f.name);
    L.push(t("ტელეფონი", "Phone") + ": " + f.phone);
    if (f.email) L.push(t("ელფოსტა", "Email") + ": " + f.email);
    L.push(t("მისამართი", "Address") + ": " + f.address);
    if (f.notes) L.push(t("შენიშვნა", "Notes") + ": " + f.notes);
    return L.join("\n");
  }
  function readForm() {
    function v(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }
    return { name: v("of-name"), phone: v("of-phone"), email: v("of-email"),
             address: v("of-address"), notes: v("of-notes") };
  }
  /* inline validation — marks the missing fields and shows one message
     (replaces the old alert() dialogs) */
  function fieldError(msgText) {
    var form = document.getElementById("order-form");
    var note = document.getElementById("order-errors");
    if (!note) {
      note = document.createElement("p");
      note.id = "order-errors"; note.className = "sent-note err";
      note.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg><span class="msg"></span>';
      form.insertBefore(note, form.querySelector(".co-actions"));
    }
    note.hidden = false;
    note.querySelector(".msg").textContent = msgText;
  }
  function validate(f) {
    var form = document.getElementById("order-form");
    Array.prototype.forEach.call(form.querySelectorAll(".field.err"), function (el) {
      el.classList.remove("err"); el.removeAttribute("aria-invalid");
    });
    var note = document.getElementById("order-errors"); if (note) note.hidden = true;
    if (!items.length) return false;               // the empty state already covers this
    var missing = [];
    [["of-name", f.name], ["of-phone", f.phone], ["of-address", f.address]].forEach(function (d) {
      if (!d[1]) {
        var el = document.getElementById(d[0]);
        if (el) { el.classList.add("err"); el.setAttribute("aria-invalid", "true"); missing.push(el); }
      }
    });
    if (!missing.length) return true;
    fieldError(t("გთხოვთ შეავსოთ სახელი, ტელეფონი და მისამართი.", "Please fill in your name, phone and address."));
    missing[0].focus();
    return false;
  }
  /* set a bilingual string so it survives later language switches */
  function setBiText(el, ka, en) {
    if (!el) return;
    el.setAttribute("data-ka", ka); el.setAttribute("data-en", en);
    el.textContent = lang() === "en" ? en : ka;
  }
  function showSuccess(mode) {
    var s = document.getElementById("order-success"), g = document.querySelector(".checkout-grid");
    var e = document.getElementById("checkout-empty");
    if (s) {
      var ref = s.querySelector(".order-ref");
      if (ref && orderRef) { ref.textContent = "#" + orderRef; ref.hidden = false; }
      if (mode === "wa") {
        /* WhatsApp opens in a new tab — we can't know the message was actually
           sent, so the cart stays saved and the copy says so honestly */
        setBiText(document.getElementById("os-title"),
          "შეკვეთა მზადაა — დააჭირეთ გაგზავნას WhatsApp-ში",
          "Order ready — press Send in WhatsApp");
        setBiText(document.getElementById("os-text"),
          "WhatsApp გაიხსნა თქვენი შეკვეთით. კალათა შენახული რჩება, სანამ შეტყობინებას გააგზავნით — დადასტურების შემდეგ მალე დაგიკავშირდებით.",
          "WhatsApp opened with your order. Your cart stays saved until you press Send — after that our team will contact you shortly.");
      }
      s.classList.add("is-shown");
    }
    if (g) g.style.display = "none";
    if (e) e.classList.remove("is-shown");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function wireCheckout() {
    var form = document.getElementById("order-form"); if (!form) return;
    var wa = document.getElementById("order-whatsapp");
    var em = document.getElementById("order-email");
    /* typing into a flagged field clears its error immediately */
    form.addEventListener("input", function (e) {
      var el = e.target.closest(".field.err");
      if (el) { el.classList.remove("err"); el.removeAttribute("aria-invalid"); }
    });
    if (wa) wa.addEventListener("click", function () {
      var f = readForm(); if (!validate(f)) return;
      orderRef = orderRef || makeRef();
      var msg = orderText() + "\n—————\n" + customerText(f);
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
      showSuccess("wa");   // cart intentionally NOT cleared — see showSuccess()
    });
    if (em) em.addEventListener("click", function () {
      var f = readForm(); if (!validate(f)) return;
      orderRef = orderRef || makeRef();
      em.disabled = true; var label = em.textContent; em.textContent = t("იგზავნება…", "Sending…");
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: t("ახალი შეკვეთა — ვებსაიტი", "New order — website") + " · #" + orderRef,
          _captcha: "false", _template: "table",
          name: f.name, phone: f.phone, email: f.email, address: f.address,
          notes: f.notes, order: orderText()
        })
      }).then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (d) {
          if (d && (d.success === true || d.success === "true")) { clear(); showSuccess("email"); }
          else { fieldError(t("ვერ გაიგზავნა. სცადეთ WhatsApp ან დაგვირეკეთ: 551 51 91 65",
                              "Couldn't send. Try WhatsApp or call us: 551 51 91 65")); }
        })
        .catch(function () { fieldError(t("ვერ გაიგზავნა. სცადეთ WhatsApp ან დაგვირეკეთ: 551 51 91 65",
                                          "Couldn't send. Try WhatsApp or call us: 551 51 91 65")); })
        .then(function () { em.disabled = false; em.textContent = label; });
    });
  }
  function clear() { items = []; write(); renderAll(); }

  /* ---------------- render orchestration + i18n ---------------- */
  function renderAll() {
    renderBadges(); renderDrawer(); renderCheckout();
  }

  /* translate the labels we inject (apply data-ka/-en directly — no event dispatch,
     so this never loops with app.js's esg:lang) */
  function applyI18n(root) {
    var l = lang();
    root.querySelectorAll(".i18n").forEach(function (el) {
      var v = el.getAttribute("data-" + l); if (v !== null) el.textContent = v;
    });
    root.querySelectorAll(".i18n-attr").forEach(function (el) {
      var a = el.getAttribute("data-attr"), v = el.getAttribute("data-" + l);
      if (a && v !== null) el.setAttribute(a, v);
    });
  }

  function init() {
    injectIcons();
    injectDrawer();
    applyI18n(document);   // localize the just-injected cart labels
    wireCheckout();
    renderAll();
    // on language switch app.js re-translates static labels; we just re-render dynamic parts
    document.addEventListener("esg:lang", function () { applyI18n(document); renderAll(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.ESG_CART = { add: add, open: open, close: close, count: count };
})();
