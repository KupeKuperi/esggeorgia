/* =========================================================================
   ESG - catalog data (single source of truth for products)

   Schema per product:
     slug   unique id used in product.html?slug=…
     cat    category id (must match an ESG_CATEGORIES id)
     name/blurb = { ka, en }              → bilingual
     dilution/usage = { ka, en }          → bilingual (usage optional)
     img    default catalog image (the largest available cut-out)
     sizes  [{ l, code, img }]            → liters + article code + per-size photo
            The detail page lets the visitor switch sizes; each swaps the photo.
            Catalog cards cross-fade through these on hover (largest → smallest).
     crop   { pos, zoom, org } (optional) → cover-crop for messy scans
            Omit for clean cut-out PNGs (they use object-fit:contain).
   ========================================================================= */
window.ESG_CATEGORIES = [
  { id: "biskonto",  name: { ka: "ბისკონტო - ავტოშამპუნები", en: "Biskonto - Car Shampoo" } },
  { id: "cosmetics", name: { ka: "ავტოკოსმეტიკა", en: "Auto-cosmetics" } },
  { id: "household", name: { ka: "საყოფაცხოვრებო", en: "Household" } }
];

/* shared usage note for the Biskonto touch-free shampoo line */
var BK_USAGE = {
  ka: "გაზავებული ქაფი დაიტანეთ ზედაპირზე ქვემოდან ზემოთ, გააჩერეთ 1–2 წუთი და კარგად ჩამორეცხეთ წყლის ჭავლით ახლო მანძილიდან (15–20 სმ).",
  en: "Apply the diluted foam bottom-to-top, leave for 1–2 minutes, then rinse thoroughly with a close water jet (15–20 cm)."
};

window.ESG_PRODUCTS = [
  /* =====================================================================
     BISKONTO - premium touch-free car shampoo line
     keepOrder:true → sizes show in their listed order (1 L first); the card
     hover-cycle and detail switcher step 1 → 5 → 20 L. Only sizes that have
     a photo are listed.
     ===================================================================== */
  {
    slug: "biskonto-classic", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო კლასიკი", en: "Biskonto Classic" },
    blurb: {
      ka: "დაბალანსებული ყოველდღიური უკონტაქტო შამპუნი სქელი ქაფითა და ანტიკოროზიული დანამატებით.",
      en: "A balanced everyday touch-free shampoo with rich foam and anti-corrosion additives."
    },
    dilution: { ka: "1 ლ : 3–4 ლ წყალში", en: "1 L : 3–4 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-classic-20l.webp",
    hero: "assets/catalog/bk-classic-all.webp",
    sizes: [
      { l: 20, code: "64722", img: "assets/catalog/bk-classic-20l.webp" },
      { l: 5,  code: "64721", img: "assets/catalog/bk-classic-5l.webp" },
      { l: 1,  code: "64720", img: "assets/catalog/bk-classic-1l.webp" }
    ]
  },
  {
    slug: "biskonto-soft", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო სოფტი", en: "Biskonto Soft" },
    blurb: {
      ka: "რბილი, უხვი ქაფი ხშირი რეცხვისთვის - ფაქიზია ზედაპირის მიმართ, ეფექტური ჭუჭყთან.",
      en: "Soft, abundant foam for frequent washing - gentle on the surface, tough on dirt."
    },
    dilution: { ka: "1 ლ : 2–3 ლ წყალში", en: "1 L : 2–3 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-soft-20l.webp",
    hero: "assets/catalog/bk-soft-all.webp",
    sizes: [
      { l: 20, code: "64719", img: "assets/catalog/bk-soft-20l.webp" },
      { l: 5,  code: "64718", img: "assets/catalog/bk-soft-5l.webp" },
      { l: 1,  code: "64717", img: "assets/catalog/bk-soft-1l.webp" }
    ]
  },
  {
    slug: "biskonto-light", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო ლაითი", en: "Biskonto Light" },
    blurb: {
      ka: "ეკონომიური საწყისი ფორმულა - მარტივი გაზავება და სტაბილური შედეგი ყოველდღიური დატვირთვისთვის.",
      en: "An economical entry formula - easy dilution and consistent results for daily volume."
    },
    dilution: { ka: "1 ლ : 4–5 ლ წყალში", en: "1 L : 4–5 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-light-20l.webp",
    hero: "assets/catalog/bk-light-all.webp",
    sizes: [
      { l: 20, code: "64725", img: "assets/catalog/bk-light-20l.webp" },
      { l: 5,  code: "64724", img: "assets/catalog/bk-light-5l.webp" },
      { l: 1,  code: "64723", img: "assets/catalog/bk-light-1l.webp" }
    ]
  },
  {
    slug: "biskonto-universal", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო უნივერსალი", en: "Biskonto Universal" },
    blurb: {
      ka: "უნივერსალური მაღალგამოსავლიანი ფორმულა ყველა ტიპის სამრეცხაოსთვის.",
      en: "A versatile high-yield formula for every type of wash."
    },
    dilution: { ka: "1 ლ : 8–9 ლ წყალში", en: "1 L : 8–9 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-universal-20l.webp",
    hero: "assets/catalog/bk-universal-all.webp",
    sizes: [
      { l: 20, code: "64728", img: "assets/catalog/bk-universal-20l.webp" },
      { l: 5,  code: "64727", img: "assets/catalog/bk-universal-5l.webp" },
      { l: 1,  code: "64726", img: "assets/catalog/bk-universal-1l.webp" }
    ]
  },
  {
    slug: "biskonto-chrome", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო ქრომი", en: "Biskonto Chrome" },
    blurb: {
      ka: "მაღალი გამოსავლიანობის კონცენტრატი ბრჭყვიალა შედეგით; უსაფრთხოა ქრომისა და პლასტიკისთვის.",
      en: "High-yield concentrate with a glossy finish; safe on chrome and plastic."
    },
    dilution: { ka: "1 ლ : 6–8 ლ წყალში", en: "1 L : 6–8 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-chrome-20l.webp",
    hero: "assets/catalog/bk-chrome-all.webp",
    sizes: [
      { l: 20, code: "64636", img: "assets/catalog/bk-chrome-20l.webp" },
      { l: 5,  code: "64635", img: "assets/catalog/bk-chrome-5l.webp" },
      { l: 1,  code: "64634", img: "assets/catalog/bk-chrome-1l.webp" }
    ]
  },
  {
    slug: "biskonto-chrome-pink", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო ქრომი ფინქი", en: "Biskonto Chrome Pink" },
    blurb: {
      ka: "ქრომის ბრჭყვიალა ფორმულა ვარდისფერი ფერითა და არომატით - უსაფრთხოა ქრომისა და პლასტიკისთვის.",
      en: "The glossy Chrome formula with a pink colour and fragrance - safe on chrome and plastic."
    },
    dilution: { ka: "1 ლ : 6–8 ლ წყალში", en: "1 L : 6–8 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-chrome-pink-20l.webp",
    hero: "assets/catalog/bk-chrome-pink-all.webp",
    sizes: [
      { l: 20, code: "64735", img: "assets/catalog/bk-chrome-pink-20l.webp" },
      { l: 5,  code: "64715", img: "assets/catalog/bk-chrome-pink-5l.webp" },
      { l: 1,  code: "64638", img: "assets/catalog/bk-chrome-pink-1l.webp" }
    ]
  },
  {
    slug: "biskonto-turbo", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო ტურბო", en: "Biskonto Turbo" },
    blurb: {
      ka: "სწრაფმოქმედი, აქტიური სქელი ქაფი - ეფექტურად ხსნის გამკვრივებულ ჭუჭყს.",
      en: "Fast-acting, thick active foam that cuts through caked-on grime."
    },
    dilution: { ka: "1 ლ : 7–8 ლ წყალში", en: "1 L : 7–8 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-turbo-20l.webp",
    hero: "assets/catalog/bk-turbo-all.webp",
    sizes: [
      { l: 20, code: "64628", img: "assets/catalog/bk-turbo-20l.webp" },
      { l: 5,  code: "64627", img: "assets/catalog/bk-turbo-5l.webp" },
      { l: 1,  code: "64626", img: "assets/catalog/bk-turbo-1l.webp" }
    ]
  },
  {
    slug: "biskonto-max", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო მაქსი", en: "Biskonto Max" },
    blurb: {
      ka: "მაქსიმალური გამოსავლიანობის კონცენტრატი - ერთი ლიტრიდან მეტი სამუშაო ხსნარი.",
      en: "Maximum-yield concentrate - more working solution from every litre."
    },
    dilution: { ka: "1 ლ : 8–10 ლ წყალში", en: "1 L : 8–10 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-max-20l.webp",
    hero: "assets/catalog/bk-max-all.webp",
    sizes: [
      { l: 20, code: "64639", img: "assets/catalog/bk-max-20l.webp" },
      { l: 5,  code: "64641", img: "assets/catalog/bk-max-5l.webp" },
      { l: 1,  code: "64640", img: "assets/catalog/bk-max-1l.webp" }
    ]
  },
  {
    slug: "biskonto-self", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო სელფი", en: "Biskonto Self" },
    blurb: {
      ka: "შექმნილია თვითმომსახურების ბოქსებისთვის - მაღალი გაზავება და სტაბილური ქაფი დოზატორებში.",
      en: "Built for self-service bays - high dilution and stable foam through dispensers."
    },
    dilution: { ka: "1 ლ : 9–10 ლ წყალში", en: "1 L : 9–10 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-self-20l.webp",
    hero: "assets/catalog/bk-self-all.webp",
    sizes: [
      { l: 20, code: "64731", img: "assets/catalog/bk-self-20l.webp" },
      { l: 5,  code: "64730", img: "assets/catalog/bk-self-5l.webp" },
      { l: 1,  code: "64729", img: "assets/catalog/bk-self-1l.webp" }
    ]
  },
  {
    slug: "biskonto-aroma", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო არომა", en: "Biskonto Aroma" },
    blurb: {
      ka: "მაღალი გამოსავლიანობა ხანგრძლივი სასიამოვნო არომატით - სისუფთავე და სურნელი ერთად.",
      en: "High yield with a lasting pleasant fragrance - cleanliness and scent together."
    },
    dilution: { ka: "1 ლ : 10–12 ლ წყალში", en: "1 L : 10–12 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-aroma-20l.webp",
    hero: "assets/catalog/bk-aroma-all.webp",
    sizes: [
      { l: 20, code: "64625", img: "assets/catalog/bk-aroma-20l.webp" },
      { l: 5,  code: "64624", img: "assets/catalog/bk-aroma-5l.webp" },
      { l: 1,  code: "64623", img: "assets/catalog/bk-aroma-1l.webp" }
    ]
  },
  {
    slug: "biskonto-carbon", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო კარბონი", en: "Biskonto Carbon" },
    blurb: {
      ka: "მაღალკონცენტრირებული ღრმა წმენდის ფორმულა მძიმე ჭუჭყისთვის.",
      en: "A high-concentration deep-clean formula for heavy soiling."
    },
    dilution: { ka: "1 ლ : 10–12 ლ წყალში", en: "1 L : 10–12 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-carbon-20l.webp",
    hero: "assets/catalog/bk-carbon-all.webp",
    sizes: [
      { l: 20, code: "64734", img: "assets/catalog/bk-carbon-20l.webp" },
      { l: 5,  code: "64733", img: "assets/catalog/bk-carbon-5l.webp" },
      { l: 1,  code: "64732", img: "assets/catalog/bk-carbon-1l.webp" }
    ]
  },
  {
    slug: "biskonto-carbon-pink", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო კარბონი ფინქი", en: "Biskonto Carbon Pink" },
    blurb: {
      ka: "კარბონის ღრმა წმენდის ფორმულა ვარდისფერი ფერითა და არომატით.",
      en: "The Carbon deep-clean formula with a pink colour and fragrance."
    },
    dilution: { ka: "1 ლ : 10–12 ლ წყალში", en: "1 L : 10–12 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-carbon-pink-20l.webp",
    hero: "assets/catalog/bk-carbon-pink-all.webp",
    sizes: [
      { l: 20, code: "64738", img: "assets/catalog/bk-carbon-pink-20l.webp" },
      { l: 5,  code: "64737", img: "assets/catalog/bk-carbon-pink-5l.webp" },
      { l: 1,  code: "64736", img: "assets/catalog/bk-carbon-pink-1l.webp" }
    ]
  },
  {
    slug: "biskonto", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო", en: "Biskonto" },
    blurb: {
      ka: "უკონტაქტო რეცხვის საბაზისო ფორმულა - ხსნის მტვერს, ჭუჭყს, ზეთსა და მწერების კვალს ძარის, ქრომისა და პლასტიკის დაზიანების გარეშე.",
      en: "The original touch-free formula - lifts dust, grime, oil and insect residue without harming paint, chrome or plastic."
    },
    dilution: { ka: "1 ლ : 8–10 ლ წყალში", en: "1 L : 8–10 L water" },
    usage: BK_USAGE,
    img: "assets/catalog/bk-base-20l.webp",
    hero: "assets/catalog/bk-base-all.webp",
    sizes: [
      { l: 20, code: "64632", img: "assets/catalog/bk-base-20l.webp" },
      { l: 5,  code: "64631", img: "assets/catalog/bk-base-5l.webp" },
      { l: 1,  code: "64630", img: "assets/catalog/bk-base-1l.webp" }
    ]
  },
  {
    slug: "biskonto-promax", cat: "biskonto", keepOrder: true,
    name: { ka: "ბისკონტო პრომაქსი", en: "Biskonto Promax" },
    blurb: {
      ka: "პროფესიონალური მაღალი კლასის ფორმულა - დეტალები და დაფასოება მალე დაემატება.",
      en: "A professional top-tier formula - sizes and details coming soon."
    },
    dilution: { ka: "ზუსტდება", en: "To be confirmed" },
    img: "assets/catalog/bk-promax-20l.webp",
    sizes: [
      { l: 20, code: "", img: "assets/catalog/bk-promax-20l.webp" }
    ]
  },
  {
    slug: "plastic-care",
    cat: "cosmetics",
    name: { ka: "პლასტიკის მოვლა", en: "Plastic Care" },
    blurb: {
      ka: "პლასტიკისა და ტორპედოს ზედაპირების უნივერსალური საწმენდი - ასუფთავებს, კვებავს და უბრუნებს ბუნებრივ იერსა და ბზინვარებას.",
      en: "Universal cleaner for plastic and dashboard surfaces - cleans, nourishes and restores a natural look and shine."
    },
    dilution: {
      ka: "1 ლ : 1 ლ წყალში · ბზინვარებისთვის - გაზავების გარეშე",
      en: "1 L : 1 L water · for extra shine - use undiluted"
    },
    usage: {
      ka: "გამაფრქვეველით დაიტანეთ პლასტიკის ან ტორპედოს ზედაპირზე, შემდეგ დაამუშავეთ ტილოთი ან ღრუბელით.",
      en: "Spray onto the plastic or dashboard surface, then work it in with a cloth or sponge."
    },
    img: "assets/catalog/plastic-care-5l.webp",
    sizes: [
      { l: 5,   code: "64453", img: "assets/catalog/plastic-care-5l.webp" },
      { l: 1,   code: "64452", img: "assets/catalog/plastic-care-1l.webp" },
      { l: 0.5, code: "63100", img: "assets/catalog/plastic-care-05l.webp" }
    ]
  },

  {
    slug: "super-glass",
    cat: "cosmetics",
    cats: ["household"],
    name: { ka: "სუპერ გლასი", en: "Super Glass" },
    blurb: {
      ka: "მინის საწმენდი კონცენტრატი - ასუფთავებს საქარე მინასა და სარკეებს ლაქებისა და ნალექის გარეშე.",
      en: "Glass-cleaner concentrate - washes the windscreen and mirrors streak-free, leaving no residue."
    },
    dilution: {
      ka: "1 ლ : 3 ლ წყალში",
      en: "1 L : 3 L water"
    },
    usage: {
      ka: "ჩაასხით გაზავებული ხსნარი მანქანის წყლის ავზში.",
      en: "Pour the diluted solution into the vehicle's washer-fluid tank."
    },
    img: "assets/catalog/super-glass-5l.webp",
    hero: "assets/catalog/super-glass-all.webp",
    sizes: [
      { l: 5,   code: "64744", img: "assets/catalog/super-glass-5l.webp" },
      { l: 3,   code: "64743", img: "assets/catalog/super-glass-3l.webp" },
      { l: 1,   code: "",      img: "assets/catalog/super-glass-1l.webp" },
      { l: 0.5, code: "63688", img: "assets/catalog/super-glass-05l.webp" }
    ]
  },

  {
    slug: "black-brill",
    cat: "cosmetics",
    name: { ka: "შავი ბრილიანტი", en: "Black Brill" },
    blurb: {
      ka: "საბურავების საწმენდი და გამაშავებელი - აბრუნებს ღრმა, ბრჭყვიალა შავ ფერსა და ცოცხალ იერს.",
      en: "Tyre cleaner and blackener - restores a deep, glossy black colour and a fresh look."
    },
    dilution: {
      ka: "1 ლ : 3 ლ წყალში",
      en: "1 L : 3 L water"
    },
    usage: {
      ka: "გამაფრქვეველით დაიტანეთ საბურავის ზედაპირზე და შემდეგ დაამუშავეთ ღრუბელით.",
      en: "Spray onto the tyre surface, then work it in with a sponge."
    },
    img: "assets/catalog/black-brill-5l.webp",
    hero: "assets/catalog/black-brill-all.webp",
    sizes: [
      { l: 5,   code: "64449", img: "assets/catalog/black-brill-5l.webp" },
      { l: 1,   code: "64455", img: "assets/catalog/black-brill-1l.webp" },
      { l: 0.5, code: "63102", img: "assets/catalog/black-brill-05l.webp" }
    ]
  },

  {
    slug: "black-lux",
    cat: "cosmetics",
    name: { ka: "შავი ლუქსი", en: "Black Lux" },
    blurb: {
      ka: "საბურავების მოვლის პრემიუმ ხსნარი - ანიჭებს ხანგრძლივ, ღრმა ბზინვარებას, მზა გამოყენებით.",
      en: "Premium tyre-care dressing - gives a long-lasting, deep shine, ready to use."
    },
    dilution: {
      ka: "მზა გამოსაყენებლად",
      en: "Ready to use"
    },
    usage: {
      ka: "დაიტანეთ ღრუბელზე და შემდეგ დაამუშავეთ საბურავი.",
      en: "Apply to a sponge, then work it over the tyre."
    },
    cats: ["household"],
    noEco: true,
    img: "assets/catalog/black-lux-prem.webp",
    hero: "assets/catalog/black-lux-all.webp",
    sizes: [
      { l: 5,    code: "65022", img: "assets/catalog/black-lux-prem.webp" },
      { l: 1,    code: "64988", img: "assets/catalog/black-lux-1l.webp" },
      { l: 0.25, code: "65007", img: "assets/catalog/black-lux-250ml.webp" }
    ]
  },

  {
    slug: "tenax",
    cat: "cosmetics",
    name: { ka: "ტენაქსი", en: "Tenax" },
    blurb: {
      ka: "ძრავის სარეცხი ხსნარი - შლის ზეთსა და ჭუჭყს ძრავის განყოფილებიდან.",
      en: "Engine-bay degreaser - cuts through oil and grime in the engine compartment."
    },
    dilution: {
      ka: "1 ლ : 3–4 ლ წყალში",
      en: "1 L : 3–4 L water"
    },
    usage: {
      ka: "გამაფრქვეველით დაიტანეთ ძრავის ზედაპირზე, გააჩერეთ რამდენიმე წუთი და ჩამორეცხეთ წყლით. ეცადეთ არ მოხვდეს ძარის ზედაპირზე.",
      en: "Spray onto the engine, leave for a few minutes, then rinse off with water. Avoid contact with the body paint."
    },
    img: "assets/catalog/tenax-5l.webp",
    hero: "assets/catalog/tenax-all.webp",
    sizes: [
      { l: 5,   code: "64666", img: "assets/catalog/tenax-5l.webp" },
      { l: 1,   code: "64665", img: "assets/catalog/tenax-1l.webp" },
      { l: 0.5, code: "63097", img: "assets/catalog/tenax-05l.webp" }
    ]
  },

  {
    slug: "texil",
    cat: "cosmetics",
    cats: ["household"],
    name: { ka: "ტექსილი", en: "Texil" },
    blurb: {
      ka: "სალონის უნივერსალური ქიმწმენდა - ასუფთავებს ნაჭრისა და ტყავის ზედაპირებს ერთნაირად.",
      en: "Universal interior cleaner - refreshes fabric and leather surfaces alike."
    },
    dilution: {
      ka: "ნაჭარი 1 ლ : 15 ლ · ტყავი 1 ლ : 20 ლ წყალში",
      en: "Fabric 1 L : 15 L · leather 1 L : 20 L water"
    },
    usage: {
      ka: "გამაფრქვეველით დაიტანეთ სალონის ნაჭრის ან ტყავის ზედაპირზე, გააჩერეთ რამდენიმე წუთი და დაამუშავეთ ტილოთი ან ღრუბელით.",
      en: "Spray onto the cabin's fabric or leather, leave for a few minutes, then work in with a cloth or sponge."
    },
    img: "assets/catalog/texil-5l.webp",
    hero: "assets/catalog/texil-all.webp",
    sizes: [
      { l: 5,   code: "64669", img: "assets/catalog/texil-5l.webp" },
      { l: 1,   code: "64668", img: "assets/catalog/texil-1l.webp" },
      { l: 0.5, code: "63690", img: "assets/catalog/texil-05l.webp" }
    ]
  },

  {
    slug: "floor-cleaner",
    cat: "household",
    name: { ka: "იატაკის წმენდა", en: "Floor Cleaner" },
    blurb: {
      ka: "იატაკის უნივერსალური საწმენდი - ეფექტურად ხსნის ჭუჭყსა და ცხიმს ყველა ტიპის მყარ ზედაპირზე, ტოვებს სასიამოვნო სიახლეს.",
      en: "Universal floor cleaner - lifts dirt and grease from every hard surface, leaving a fresh finish."
    },
    dilution: {
      ka: "1 ლ : 100 ლ წყალში",
      en: "1 L : 100 L water"
    },
    usage: {
      ka: "გაზავებული ხსნარით დაამუშავეთ იატაკი ან მყარი ზედაპირი; ჩამორეცხვა საჭირო არ არის.",
      en: "Mop the floor or hard surface with the diluted solution; no rinsing needed."
    },
    img: "assets/catalog/floor-cleaner-5l.webp",
    hero: "assets/catalog/floor-cleaner-all.webp",
    sizes: [
      { l: 5,   code: "", img: "assets/catalog/floor-cleaner-5l.webp" },
      { l: 1,   code: "", img: "assets/catalog/floor-cleaner-1l.webp" }
    ]
  },

  {
    slug: "furniture-care",
    cat: "household",
    name: { ka: "ავეჯის მოვლა", en: "Furniture Care" },
    blurb: {
      ka: "ავეჯის მოვლის სპრეი - ასუფთავებს და ანიჭებს სიახლეს ხის, ლამინატისა და სხვა ზედაპირებს, მზა გამოყენებით.",
      en: "Furniture-care spray - cleans and refreshes wood, laminate and other surfaces, ready to use."
    },
    dilution: {
      ka: "მზა გამოსაყენებლად",
      en: "Ready to use"
    },
    usage: {
      ka: "გამაფრქვეველით დაიტანეთ ზედაპირზე და გააპრიალეთ მშრალი ტილოთი.",
      en: "Spray onto the surface and buff with a dry cloth."
    },
    img: "assets/catalog/furniture-care-05l.webp",
    sizes: [
      { l: 0.5, code: "", img: "assets/catalog/furniture-care-05l.webp" }
    ]
  },

  {
    slug: "rolex-wax",
    cat: "cosmetics",
    name: { ka: "ცვილი - როლექს / ფასტ ვაქსი", en: "Rolex Wax / Fast Wax" },
    blurb: {
      ka: "ცვილოვანი გამშრალება - ქმნის წყალგამზიდ ფენას, აჩქარებს შრობას და მატებს ბზინვარებას.",
      en: "Wax drying-aid - leaves a water-repellent layer, speeds drying and boosts shine."
    },
    dilution: {
      ka: "ფიქსატორი 1 ლ : 15–20 ლ · გენერატორი 1 ლ : 150–200 ლ",
      en: "Foam gun 1 L : 15–20 L · compressor 1 L : 150–200 L"
    },
    usage: {
      ka: "გარეცხვის შემდეგ გამაფრქვეველით დაიტანეთ მანქანის ზედაპირზე და გაამშრალეთ ტილოთი, ან ჩამორეცხეთ წყლით და შემდეგ გაამშრალეთ.",
      en: "After washing, spray onto the car and dry with a cloth, or rinse off with water and then dry."
    },
    img: "assets/catalog/rolex-wax-5l.webp",
    hero: "assets/catalog/rolex-wax-all.webp",
    sizes: [
      { l: 5,   code: "64450", img: "assets/catalog/rolex-wax-5l.webp" },
      { l: 0.5, code: "63692", img: "assets/catalog/rolex-wax-05l.webp" }
    ]
  },

  {
    slug: "antifog",
    cat: "cosmetics",
    name: { ka: "ანტი-ორთქლი", en: "Antifog" },
    blurb: {
      ka: "ანტი-ორთქლის საშუალება - ებრძვის დაორთქვლას და ინარჩუნებს მინებსა და სარკეებს სუფთად და გამჭვირვალედ.",
      en: "Anti-fog treatment - fights condensation and keeps glass and mirrors clean and clear."
    },
    dilution: {
      ka: "მზა გამოსაყენებლად",
      en: "Ready to use"
    },
    usage: {
      ka: "დაიტანეთ მინის ან სარკის ზედაპირზე და გაასუფთავეთ მშრალი ტილოთი.",
      en: "Apply to the glass or mirror surface and buff with a dry cloth."
    },
    img: "assets/catalog/antifog-05l.webp",
    sizes: [
      { l: 0.5, code: "63974", img: "assets/catalog/antifog-05l.webp" }
    ]
  }
];
