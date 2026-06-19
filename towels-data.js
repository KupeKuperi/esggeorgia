/* =========================================================================
   ESG - microfibre cloths catalog (ტილოები / Cloths)

   Appends a fourth top-level category ("cloths") with NO subcategories,
   then pushes every cloth into the shared ESG_PRODUCTS array.

   Cloth schema (same as equipment: no liters / dilution / eco):
     slug, cat:"cloths", name/blurb={ka,en},
     spec={ka,en} (weave + size line),
     code:"" (article code),
     img:"assets/catalog/cloth-*.webp"
   ========================================================================= */
(function () {
  "use strict";

  /* ---- register the category (no subs) ---- */
  window.ESG_CATEGORIES = (window.ESG_CATEGORIES || []).concat([{
    id: "cloths",
    name: { ka: "ტილოები", en: "Cloths" }
  }]);

  function cl(slug, ka, en, code, blurbKa, blurbEn, specKa, specEn, img) {
    return {
      slug: slug, cat: "cloths",
      name: { ka: ka, en: en }, code: code || "",
      blurb: { ka: blurbKa, en: blurbEn },
      spec: { ka: specKa, en: specEn },
      img: img
    };
  }

  var IMG = "assets/catalog/";

  var CLOTHS = [
    cl("cloth-waffle", "ვაფლის ტილო", "Waffle Cloth", "64345",
      "ვაფლისებრი ქსოვის მაიკროფაიბერი - დიდი შთანთქმის უნარით, შუშისა და ზედაპირების უნაკვალო გაწმენდისთვის.",
      "Waffle-weave microfibre with deep absorbency - leaves glass and surfaces streak-free.",
      "ვაფლის ქსოვა · 40×40 სმ", "Waffle weave · 40×40 cm", IMG + "cloth-1.webp"),

    cl("cloth-floor-blue", "იატაკის ტილო (ლურჯი)", "Floor Cloth (Blue)", "64549",
      "სქელი, რბილი მაიკროფაიბერი იატაკისა და დიდი ზედაპირების სველი წმენდისთვის.",
      "Thick, soft microfibre for wet-cleaning floors and large surfaces.",
      "სქელი მაიკროფაიბერი · 50×60 სმ", "Thick microfibre · 50×60 cm", IMG + "cloth-2.webp"),

    cl("cloth-floor-grey", "იატაკის ტილო (ნაცრისფერი)", "Floor Cloth (Grey)", "64550",
      "მკვრივი მაიკროფაიბერის ტილო იატაკისა და სამუშაო ზონების მოვლისთვის.",
      "Dense microfibre cloth for floors and workshop areas.",
      "მკვრივი მაიკროფაიბერი · 50×60 სმ", "Dense microfibre · 50×60 cm", IMG + "cloth-3.webp"),

    cl("cloth-glass", "მინის ტილო", "Glass Cloth", "64552",
      "თევზის ქერცლის ქსოვის ტილო - შუშის, სარკისა და ქრომის უნაკვალო პრიალისთვის.",
      "Fish-scale weave cloth for streak-free glass, mirror and chrome.",
      "თევზის ქერცლის ქსოვა · 40×40 სმ", "Fish-scale weave · 40×40 cm", IMG + "cloth-4.webp"),

    cl("cloth-suede", "ზამშის ტილო", "Suede Cloth", "64342",
      "რბილი ზამშის ტიპის ტილო საბოლოო შემშრობისა და პრიალისთვის.",
      "Soft suede-type cloth for final drying and polishing.",
      "რბილი ზამში · 40×40 სმ", "Soft suede · 40×40 cm", IMG + "cloth-5.webp"),

    cl("cloth-standard-blue", "სტანდარტული ტილო (ლურჯი)", "Standard Cloth (Blue)", "002061",
      "ნეკნებიანი მაიკროფაიბერის უნივერსალური ტილო ყოველდღიური წმენდისთვის.",
      "Ribbed all-purpose microfibre cloth for everyday cleaning.",
      "ნეკნებიანი მაიკროფაიბერი · 30×40 სმ", "Ribbed microfibre · 30×40 cm", IMG + "cloth-6.webp"),

    cl("cloth-glass-green", "მინის ტილო (მწვანე)", "Glass Cloth (Green)", "64338",
      "გლუვი ქსოვის ტილო შუშისა და მბზინავი ზედაპირების უნაკვალო გაწმენდისთვის.",
      "Smooth-weave cloth for streak-free glass and glossy surfaces.",
      "გლუვი ქსოვა · 40×40 სმ", "Smooth weave · 40×40 cm", IMG + "cloth-7.webp"),

    cl("cloth-polish-purple", "საპრიალებელი ტილო (იისფერი)", "Polishing Cloth (Purple)", "64339",
      "ნეკნებიანი ქსოვის ტილო ცვილისა და პოლიროლის თანაბრად განაწილებისთვის.",
      "Ribbed-weave cloth for even wax and polish application.",
      "ნეკნებიანი ქსოვა · 40×40 სმ", "Ribbed weave · 40×40 cm", IMG + "cloth-8.webp"),

    cl("cloth-premium-blue", "პრემიუმ ტილო (ლურჯი)", "Premium Cloth (Blue)", "002057",
      "უკიდურო პლუშ მაიკროფაიბერი - ნაზი ლაქისთვის, ნაკაწრების გარეშე.",
      "Edgeless plush microfibre - gentle on paint, scratch-free.",
      "უკიდურო პლუშ მაიკროფაიბერი · 40×40 სმ", "Edgeless plush microfibre · 40×40 cm", IMG + "cloth-9.webp"),

    cl("cloth-universal", "უნივერსალური ტილო", "Universal Cloth", "002060",
      "მსუბუქი მაიკროფაიბერი ყოველდღიური უნივერსალური გამოყენებისთვის.",
      "Lightweight microfibre for everyday universal use.",
      "მსუბუქი მაიკროფაიბერი · 30×40 სმ", "Lightweight microfibre · 30×40 cm", IMG + "cloth-10.webp"),

    cl("cloth-twosided", "ორმხრივი ტილო", "Two-Sided Cloth", "002062",
      "ორმხრივი ტილო - ერთი მხარე პლუშია წმენდისთვის, მეორე - შემშრობისთვის.",
      "Two-sided cloth - plush side to clean, the other to dry.",
      "ორმხრივი · 40×40 სმ", "Two-sided · 40×40 cm", IMG + "cloth-11.webp"),

    cl("cloth-twosided-large", "ორმხრივი ტილო (დიდი)", "Two-Sided Cloth (Large)", "64349",
      "დიდი ორმხრივი ტილო მთელი ავტომობილის სწრაფი შემშრობისთვის.",
      "Large two-sided cloth for fast drying of the whole car.",
      "ორმხრივი · 60×80 სმ", "Two-sided · 60×80 cm", IMG + "cloth-12.webp"),

    cl("cloth-premium-drying", "პრემიუმ საშრობი ტილო", "Premium Drying Cloth", "64340",
      "მაღალი აბსორბციის პლუშ ტილო რბილი არშიით - ლაქის უსაფრთხო შემშრობისთვის.",
      "High-absorbency plush cloth with soft trim - safe drying for paint.",
      "მაღალი აბსორბცია · 50×60 სმ", "High-absorbency · 50×60 cm", IMG + "cloth-13.webp"),

    cl("cloth-standard-darkblue", "სტანდარტული ტილო (მუქი ლურჯი)", "Standard Cloth (Dark Blue)", "64347",
      "ნეკნებიანი მაიკროფაიბერი ინტერიერისა და კორპუსის ყოველდღიური წმენდისთვის.",
      "Ribbed microfibre for everyday interior and bodywork cleaning.",
      "ნეკნებიანი მაიკროფაიბერი · 30×40 სმ", "Ribbed microfibre · 30×40 cm", IMG + "cloth-14.webp"),

    cl("cloth-mesh", "ბადისებრი ტილო", "Mesh Cloth", "64343",
      "ბადისებრი ქსოვის ტილო - შუშისა და მინანქრის უნაკვალო გაპრიალებისთვის.",
      "Mesh-weave cloth for streak-free polishing of glass and enamel.",
      "ბადისებრი ქსოვა · 40×40 სმ", "Mesh weave · 40×40 cm", IMG + "cloth-15.webp")
  ];

  window.ESG_PRODUCTS = (window.ESG_PRODUCTS || []).concat(CLOTHS);
})();
