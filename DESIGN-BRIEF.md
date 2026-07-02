# ESG / esggeorgia.ge — Design Brief (v2, 2026-07-02)

Hand this file + the source zip to any designer or Claude session working on the site.
Live site: https://esggeorgia.ge (GitHub Pages, deploys automatically on push to main).

## What this site is
ESG / Ekokemika Service Group — biodegradable car-wash chemistry (Biskonto line),
auto-cosmetics, household chemistry, car-wash equipment & parts, microfiber, and
turnkey car-wash construction. Made in Georgia. ~147 products with per-size GEL
prices, a cart, and WhatsApp/email checkout (no card payments, COD or bank transfer).

## Current design system (applied 2026-07-02 — do not regress)
- **Type pairing:** Noto Serif Georgian (weights 500–700) for h1/h2 display,
  Noto Sans Georgian for everything else. Georgian gets relaxed letter-spacing
  via `:lang(ka)` rules (mkhedruli collides when tracked tight).
- **Color:** ESG blue ramp `--brand-50…950` (official #008CCF = 500), teal accent
  `--accent` reserved for eco claims + final conversion actions. Surfaces are
  warm-neutral (`--surface-2:#f6f7f5`), not blue-gray.
- **Motion budget:** ONE signature — the water-ripple on primary buttons — plus
  scroll reveals and the slow-rotating roundel. No bobbing, pinging, or sheen
  sweeps; they were deliberately removed. Respect `prefers-reduced-motion`.
- **Signature elements:** water-drop eyebrow marker before section labels;
  the rotating "ქართული წარმოება · MADE IN GEORGIA" roundel stamp (hero +
  chemistry product pages).
- All tokens live at the top of `styles.css` (`:root`). No hard-coded hex in
  components — everything reads tokens.

## Hard constraints (breaking these breaks the site)
1. Static GitHub Pages: plain HTML + CSS + vanilla JS. No frameworks, no build
   tooling beyond the zero-dependency `build.js`. No external CDNs/scripts/fonts
   except Google Fonts (the CSP allows exactly: self, fonts.googleapis/gstatic,
   Google Maps iframe, formsubmit.co on checkout/contact).
2. Bilingual: every user-facing string uses `class="i18n" data-ka="…" data-en="…"`
   (Georgian default, usually LONGER than English). Attributes use `i18n-attr`.
3. Do not break: the catalog/cart/checkout contract (`window.ESG_PRODUCTS`,
   `ESG_CART.add({slug,name,l,code,price,img})`, `ESG_PRICE_OF`), per-size prices,
   the `<head>` blocks (CSP/SEO/JSON-LD/favicon), the footer, or i18n.
4. `build.js` vm-loads `product.js` and calls `window.ESG_DETAIL_HTML(p, lang,
   refBase)` to bake product pages — keep those renderers pure (no DOM access),
   and remember generated pages carry `<base href="/">` (SVG fragment refs must
   be prefixed with `refBase`).
5. Product images are optimized .webp cut-outs; About-page photos are sized webp
   (originals kept as .jpg for og:image — WhatsApp previews dislike webp).

## Where things live
- `styles.css` — single stylesheet, sectioned; tokens at top.
- `app.js` — i18n, header, mobile menu, reveals. `catalog.js` — grid, filters
  (URL-synced: `?cat=&sub=&q=`), search. `product.js` — detail page + the pure
  renderers build.js reuses. `cart.js` — cart drawer + checkout logic.
- `catalog-data.js` / `equipment-data.js` / `towels-data.js` — product data
  (single source of truth). `prices-data.js` — code→GEL map.
- `build.js` + `.github/workflows/deploy.yml` — build & deploy.

## Open design opportunities (what to work on next)
1. **Services page storytelling** — the turnkey car-wash construction offer is
   the highest-value service but reads as a text list. Wants: project gallery
   (before/after builds), process visualization, one strong testimonial.
2. **Social proof** — ESG supplies supermarket chains; a client-logo strip and
   1–2 quotes would materially raise trust. (Needs content from the owner.)
3. **Branded OG/social card** — og:image is currently a facility photo; design
   a proper 1200×630 branded card (logo, tagline, product shot).
4. **Contact page branches** — 4 branches listed as cards; could carry photos
   and per-branch Google-Maps deep links (already present) + opening hours.
5. **Hero photography** — the bottle cut-outs work, but a single professionally
   lit hero shot (bottles + water) would beat compositing.
6. **Iconography** — icons are consistent hand-rolled 24px strokes; a custom
   set with the droplet motif would deepen the brand.
7. **FAQ section** (+ FAQPage JSON-LD) on services/products — dilution, delivery,
   warranty questions. Needs owner's real answers.

## Engineering backlog (lower priority, non-design)
- Header/footer are duplicated in all 8 HTML files — extend build.js with
  partials to prevent drift (two drift bugs were already found and fixed).
- View Transitions API for catalog→product navigation (progressive enhancement).
- Speculation-rules prefetch of product pages on hover.
- "Load more" after ~36 catalog cards (DOM size on cheap phones).
- Bump GitHub Actions versions in deploy.yml (Node 20 deprecation warning).
- Analytics: none installed; adding Plausible/GoatCounter requires a CSP change.
- Delivery-terms + privacy pages (checkout collects name/phone/address).
