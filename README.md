# ESG website (esggeorgia.ge)

This is the website for **ESG — Ekokemika Service Group**. It shows the company,
its services, and the full product catalog (Biskonto car shampoos, auto-cosmetics,
household products, equipment and microfibre cloths). The site is in Georgian with
an English toggle.

- **Live site:** https://esggeorgia.ge
- **Code lives on GitHub:** `KupeKuperi/esggeorgia`
- **Hosting:** GitHub Pages (free), with the custom domain `esggeorgia.ge`

---

## The one idea to understand

**You do not build product pages by hand.** All products live in a few simple
**list files**. When you add a product to a list, the website automatically
creates its page and adds it to the catalog grid. No copy-pasting HTML.

The product lists are:

| File | What's in it |
| --- | --- |
| `catalog-data.js` | Chemistry products — shampoos, auto-cosmetics, household (the list you'll edit most) |
| `equipment-data.js` | Car-wash equipment & spare parts |
| `towels-data.js` | Microfibre cloths |

Everything else is the "shell" of the site and rarely changes:

| File | Role |
| --- | --- |
| `index.html` | Home page |
| `products.html` | Catalog page (grid + search + filters) |
| `product.html` | The **template** used for every single product page |
| `services.html`, `about.html`, `contact.html` | The other pages |
| `styles.css` | All the styling (colors, layout, fonts) |
| `app.js` | Georgian/English toggle, menu, header |
| `catalog.js` | Draws the catalog grid + search |
| `product.js` | Fills in a product page from the list |
| `assets/` | Images (product photos live in `assets/catalog/`) |
| `build.js` | The small script that turns the lists into real product pages |

---

## How updates go live (the whole workflow)

1. A change is made to a list file (usually **Claude does this for you**).
2. The change is **pushed** to the `main` branch on GitHub.
3. A GitHub "robot" (in `.github/workflows/deploy.yml`) automatically runs
   `build.js`, which creates a real page for every product, then publishes the
   site.
4. About **1–2 minutes later** the change is live at https://esggeorgia.ge.

That's it: **edit the list → push → live.** You don't run any programs yourself.

> **Adding a new product?** See **[ADD-A-PRODUCT.md](ADD-A-PRODUCT.md)** for the
> exact, step-by-step recipe (with a copy-paste template).

---

## What each product page gets, automatically

For every product in the lists, `build.js` creates a real page with its own web
address, for example:

```
https://esggeorgia.ge/products/biskonto-classic/
```

Each page automatically gets the correct Georgian title, description and
social-share image (good for Google and for sharing links). The older-style links
like `product.html?slug=biskonto-classic` keep working too, so nothing that's
already shared breaks.

---

## One-time GitHub setting (already explained to you separately)

For the auto-publish robot to work, the repository must be set to publish from
GitHub Actions:

> On github.com → the `esggeorgia` repo → **Settings → Pages →
> Build and deployment → Source → "GitHub Actions"**.

This is a one-time switch. After that, every push publishes automatically.

---

## For a developer: previewing locally (optional)

You don't need this for normal updates, but if a developer wants to preview the
built site on their own computer:

```bash
# from inside the project folder
node build.js                 # creates the dist/ folder (the finished site)
python -m http.server 3401 --directory dist
# then open http://localhost:3401
```

`build.js` only uses Node's built-in features — there is **nothing to install**
(`npm install` is not needed). The `dist/` folder is generated output and is not
committed to GitHub (the robot rebuilds it on every push).
