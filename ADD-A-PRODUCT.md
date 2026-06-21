# How to add a new product

This is the recipe you follow each time you want a new product on the website.
It takes about 5 minutes. There are **3 steps**: photos → add to the list → publish.

> ### 🟢 The easiest way
> Just send Claude the product details and photos and say *"add this product to
> the ESG site."* Claude does steps 1–3 for you. The rest of this page explains
> what happens, and how to do it by hand if you ever want to.

---

## Step 1 — Prepare the photos

- Use photos with a **see-through (transparent) background** — like the existing
  product photos. `.webp` is best (smallest); `.png` also works.
- Put the photo files into the **`assets/catalog/`** folder.
- Give them tidy names so they're easy to find later. The pattern used today is:

  | Product type | Naming pattern | Example |
  | --- | --- | --- |
  | Biskonto shampoo | `bk-<name>-<size>.webp` | `bk-classic-20l.webp` |
  | Auto-cosmetics | `<name>-<size>.png` | `super-glass-1l.png` |
  | A "group" photo (all sizes together) | `<name>-all.webp` | `bk-classic-all.webp` |

- A chemistry product usually has **one photo per size** plus one **group photo**
  (the group photo is shown first on the product page).

> 💡 If your photos are big or have a background, the image tools in
> `Desktop\Claude\image-batch-tool` can resize them and the background can be
> removed first. Ask Claude to help.

---

## Step 2 — Add the product to the list

Open the right list file:

- Chemistry (shampoo / cosmetics / household) → **`catalog-data.js`**
- Equipment / spare parts → **`equipment-data.js`**
- Microfibre cloths → **`towels-data.js`**

### For a chemistry product (`catalog-data.js`)

Find a product that looks like yours, **copy its whole block**, paste it right
after, and change the values. Here is a clean template to copy:

```js
  {
    slug: "biskonto-newone",            // unique id, lowercase-with-dashes, no spaces
    cat: "biskonto",                    // biskonto | cosmetics | household
    keepOrder: true,                    // keep for Biskonto (lists 1 → 5 → 20 L); remove for others
    name: { ka: "ბისკონტო ახალი", en: "Biskonto New" },
    blurb: {
      ka: "მოკლე აღწერა ქართულად.",
      en: "Short description in English."
    },
    dilution: { ka: "1 ლ : 4–5 ლ წყალში", en: "1 L : 4–5 L water" },
    usage: BK_USAGE,                    // optional; BK_USAGE is the shared Biskonto how-to-use note
    img: "assets/catalog/bk-newone-20l.webp",   // the photo for catalog cards
    hero: "assets/catalog/bk-newone-all.webp",  // the big "group" photo on the product page
    sizes: [
      { l: 20, code: "00000", img: "assets/catalog/bk-newone-20l.webp" },
      { l: 5,  code: "00000", img: "assets/catalog/bk-newone-5l.webp" },
      { l: 1,  code: "00000", img: "assets/catalog/bk-newone-1l.webp" }
    ]
  },
```

What each field means:

| Field | Meaning |
| --- | --- |
| `slug` | The product's web address piece → `/products/<slug>/`. **Must be unique.** |
| `cat` | Which catalog group it belongs to. |
| `name` | Product name, Georgian + English. |
| `blurb` | One-line description, Georgian + English. |
| `dilution` | The dilution ratio shown on the card and page. |
| `usage` | Optional "how to use" note. For Biskonto use `BK_USAGE`; otherwise write your own `{ ka, en }`. |
| `img` | The photo shown on the catalog grid. |
| `hero` | The "all sizes" group photo shown first on the product page (optional). |
| `sizes` | One line per size: `l` = litres, `code` = the article/barcode number, `img` = that size's photo. |

### For equipment (`equipment-data.js`)

Equipment uses a short helper called `eq(...)`. Copy an existing line and edit it.
The order of values is:

```js
//  eq(sub,      slug,           name-KA,   name-EN,   code,   blurb-KA, blurb-EN, spec-KA, spec-EN, image)
    eq("panels", "eq-new-panel", "ახალი პანელი", "New Panel", "62999",
      "მოკლე აღწერა.", "Short description.",
      "მახასიათებელი", "Spec line", IMG + "eq-pan-99.webp"),
```

`sub` must be one of: `panels`, `motors`, `vacuums`, `kits`, `spare`.

### For cloths (`towels-data.js`)

Cloths use a helper called `cl(...)`:

```js
//  cl(slug,          name-KA,   name-EN,   code,   blurb-KA, blurb-EN, spec-KA, spec-EN, image)
    cl("cloth-new", "ახალი ტილო", "New Cloth", "64999",
      "მოკლე აღწერა.", "Short description.",
      "ქსოვა · 40×40 სმ", "Weave · 40×40 cm", IMG + "cloth-99.webp"),
```

---

## Step 3 — Save, commit, and publish

1. Save the file.
2. **Commit and push** the change to the `main` branch (Claude usually does this).
3. Wait ~1–2 minutes. The product is now live with its own page and shows up in
   the catalog automatically.

---

## ✅ Quick checklist

- [ ] Photos are in `assets/catalog/` with tidy names.
- [ ] The `img` / `hero` / `sizes[].img` paths **exactly match** the photo file names.
- [ ] `slug` is unique and uses only lowercase letters, numbers and dashes.
- [ ] Each product block ends with a **comma** `,` and the punctuation matches the
      blocks around it (every `{` has a matching `}`; every line inside ends with `,`).
- [ ] Both `ka` and `en` text are filled in.

## ⚠️ Common mistakes

- **A missing comma or a stray quote** can blank out the whole catalog. If the
  catalog ever looks empty after an edit, it's almost always a typo in the last
  block you changed — compare it carefully to a working block next to it.
- **A photo path that doesn't match the file name** shows a broken image. Check
  spelling and the file extension (`.webp` vs `.png`).
- **Re-using a `slug`** that another product already uses. Make it unique.

> When in doubt, ask Claude to add the product and double-check the file — it will
> catch typos before they go live.
