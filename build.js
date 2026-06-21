/* =========================================================================
   ESG - site builder  (zero dependencies — runs on plain Node.js)

   What it does, in plain terms:
     1. Reads your product list (catalog-data.js + equipment-data.js +
        towels-data.js) exactly the way the website reads it.
     2. Copies the whole website into a `dist/` folder.
     3. Creates one real page per product at  dist/products/<slug>/index.html
        with its own web address, title, description and social-share image
        (great for Google and for sharing links).
     4. Rebuilds sitemap.xml so Google can find every product page.

   You normally never run this by hand — the GitHub robot does it on every
   push (see .github/workflows/deploy.yml). To preview locally:  node build.js
   ========================================================================= */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const SITE = "https://esggeorgia.ge";
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

/* top-level files/folders that must NOT be copied into the published site */
const EXCLUDE_TOP = new Set([
  "dist", ".git", ".github", "node_modules",
  "build.js", "tweaks-app.js", "tweaks-panel.jsx",
  "README.md", "ADD-A-PRODUCT.md", ".gitignore",
]);

/* Georgian category label shown in the page <title> */
const CAT_LABEL_KA = {
  biskonto: "ბისკონტო ავტოშამპუნი",
  shampoo: "ავტოშამპუნი",
  cosmetics: "ავტოკოსმეტიკა",
  household: "საყოფაცხოვრებო",
  equipment: "აღჭურვილობა",
  cloths: "ტილოები",
};

/* ---------- helpers ---------- */
function escAttr(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function clip(s, n) {
  s = String(s || "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}
function abs(p) {
  return SITE + "/" + String(p || "").replace(/^\/+/, "");
}

/* ---------- 1. load the product data exactly like the browser does ---------- */
function loadData() {
  const sandbox = { window: {}, document: { addEventListener() {} }, console };
  vm.createContext(sandbox);
  for (const file of ["catalog-data.js", "equipment-data.js", "towels-data.js"]) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    vm.runInContext(fs.readFileSync(full, "utf8"), sandbox, { filename: file });
  }
  const products = sandbox.window.ESG_PRODUCTS || [];
  const categories = sandbox.window.ESG_CATEGORIES || [];
  return { products, categories };
}

/* ---------- 2. copy the whole site into dist/ ---------- */
function copySite() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  /* copy each top-level entry individually (cpSync refuses to copy a folder
     into its own subfolder, so we can't copy ROOT → ROOT/dist wholesale) */
  for (const name of fs.readdirSync(ROOT)) {
    if (EXCLUDE_TOP.has(name)) continue;
    fs.cpSync(path.join(ROOT, name), path.join(DIST, name), { recursive: true });
  }
}

/* ---------- 3. build one real page per product ---------- */
function buildProductPages(products) {
  const template = fs.readFileSync(path.join(ROOT, "product.html"), "utf8");
  let count = 0;

  for (const p of products) {
    if (!p || !p.slug) continue;
    const slug = p.slug;
    const nameKa = (p.name && p.name.ka) || slug;
    const catLabel = CAT_LABEL_KA[p.cat] || "პროდუქცია";
    const title = `${nameKa} — ${catLabel} | ESG`;
    const desc = clip(
      (p.blurb && p.blurb.ka) || (p.spec && p.spec.ka) || nameKa,
      155
    );
    const canonical = `${SITE}/products/${slug}/`;
    const ogImage = abs(p.hero || p.img || "assets/facility.png");

    let html = template;

    /* keep the homepage's baked theme so every page matches */
    html = html.replace(
      '<html lang="ka">',
      '<html lang="ka" data-mood="showroom" data-motion="lively">'
    );

    /* <base href="/"> makes every relative link/script/image resolve from the
       site root, so this page works even though it lives two folders deep.
       Also bake in the slug so product.js renders instantly. */
    html = html.replace(
      "<head>",
      `<head>\n<base href="/" />\n<script>window.__ESG_SLUG=${JSON.stringify(slug)};</script>`
    );

    html = html.replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escAttr(title)}</title>`
    );
    html = html.replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escAttr(desc)}" />`
    );
    html = html.replace(
      /<meta property="og:title" content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${escAttr(title)}" />`
    );
    html = html.replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${escAttr(desc)}" />`
    );
    /* replace og:image and add canonical + og:url right after it */
    html = html.replace(
      /<meta property="og:image" content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${escAttr(ogImage)}" />\n` +
        `<meta property="og:url" content="${canonical}" />\n` +
        `<link rel="canonical" href="${canonical}" />`
    );

    const dir = path.join(DIST, "products", slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
    count++;
  }
  return count;
}

/* ---------- 4. rebuild sitemap.xml ---------- */
function buildSitemap(products) {
  const base = [
    { loc: `${SITE}/`, freq: "weekly", pri: "1.0" },
    { loc: `${SITE}/products.html`, freq: "weekly", pri: "0.9" },
    { loc: `${SITE}/services.html`, freq: "monthly", pri: "0.9" },
    { loc: `${SITE}/about.html`, freq: "monthly", pri: "0.7" },
    { loc: `${SITE}/contact.html`, freq: "monthly", pri: "0.8" },
  ];
  const productUrls = products
    .filter((p) => p && p.slug)
    .map((p) => ({ loc: `${SITE}/products/${p.slug}/`, freq: "monthly", pri: "0.7" }));

  const urls = base.concat(productUrls)
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n` +
        `    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`
    )
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), xml, "utf8");
}

/* ---------- run ---------- */
function main() {
  const { products, categories } = loadData();
  copySite();
  const pages = buildProductPages(products);
  buildSitemap(products);
  console.log(
    `ESG build OK → dist/\n` +
      `  categories: ${categories.length}\n` +
      `  products:   ${products.length}\n` +
      `  product pages generated: ${pages}\n` +
      `  sitemap urls: ${products.length + 5}`
  );
}

main();
