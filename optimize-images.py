#!/usr/bin/env python3
"""
ESG - image optimizer (developer helper, not part of the published site)

What it does:
  * Converts the big product PNGs in assets/catalog/ to WebP (keeps transparency),
    then deletes the original PNGs.
  * Converts the large homepage photos (facility.png, hero-carwash.jpg) to WebP.
  * Re-saves the big facility JPEGs (fac-*.jpg) a touch smaller, in place.
  * Updates every reference in the code (catalog-data.js, index.html, product.html,
    build.js) from the old file name to the new .webp name.

Run it after adding new large product photos:   python optimize-images.py
Requires Pillow:  pip install pillow
"""
import os
import re
import glob
from PIL import Image, ImageFile

# Some source exports are slightly truncated; recover them instead of crashing.
ImageFile.LOAD_TRUNCATED_IMAGES = True

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(ROOT, "assets")
CATALOG = os.path.join(ASSETS, "catalog")

WEBP_Q = 82  # quality for converted images (visually lossless for these)


def kb(n):
    return f"{n/1024:.0f} KB"


def to_webp(src, quality=WEBP_Q, keep_alpha=True):
    """Save a .webp next to src; return (out_path, before, after)."""
    before = os.path.getsize(src)
    im = Image.open(src)
    if keep_alpha and im.mode in ("P", "LA"):
        im = im.convert("RGBA")
    elif not keep_alpha:
        im = im.convert("RGB")
    out = os.path.splitext(src)[0] + ".webp"
    im.save(out, "WEBP", quality=quality, method=6)
    return out, before, os.path.getsize(out)


def reencode_jpeg(src, quality=80):
    before = os.path.getsize(src)
    im = Image.open(src).convert("RGB")
    im.save(src, "JPEG", quality=quality, optimize=True, progressive=True)
    return before, os.path.getsize(src)


def update_refs(replacements):
    """replacements: list of (old, new). Applies to known code files."""
    files = ["catalog-data.js", "index.html", "product.html", "build.js"]
    total = 0
    for f in files:
        p = os.path.join(ROOT, f)
        if not os.path.exists(p):
            continue
        txt = open(p, encoding="utf-8").read()
        n = 0
        for old, new in replacements:
            cnt = txt.count(old)
            if cnt:
                txt = txt.replace(old, new)
                n += cnt
        if n:
            open(p, "w", encoding="utf-8").write(txt)
            total += n
            print(f"  updated {n:3d} reference(s) in {f}")
    return total


def main():
    saved_before = saved_after = 0
    refs = []

    # 1) catalog PNGs -> webp
    pngs = sorted(glob.glob(os.path.join(CATALOG, "*.png")))
    print(f"Catalog PNGs to convert: {len(pngs)}")
    for src in pngs:
        out, b, a = to_webp(src, keep_alpha=True)
        saved_before += b
        saved_after += a
        os.remove(src)
        refs.append((f"assets/catalog/{os.path.basename(src)}",
                     f"assets/catalog/{os.path.basename(out)}"))

    # 2) big homepage photos -> webp
    for name, alpha in [("facility.png", False), ("hero-carwash.jpg", False)]:
        src = os.path.join(ASSETS, name)
        if os.path.exists(src):
            out, b, a = to_webp(src, keep_alpha=alpha)
            saved_before += b
            saved_after += a
            os.remove(src)
            refs.append((f"assets/{name}", f"assets/{os.path.basename(out)}"))
            print(f"  {name} -> {os.path.basename(out)}  {kb(b)} -> {kb(a)}")

    # 3) re-encode large facility JPEGs in place (no rename, no ref change)
    for src in sorted(glob.glob(os.path.join(ASSETS, "fac-*.jpg"))):
        if os.path.getsize(src) > 300 * 1024:
            b, a = reencode_jpeg(src)
            if a < b:
                saved_before += b
                saved_after += a
                print(f"  re-encoded {os.path.basename(src)}  {kb(b)} -> {kb(a)}")

    # 4) update references in code
    print("Updating references:")
    update_refs(refs)

    print("\nDONE.")
    print(f"  images optimized: {len(refs)} converted to WebP")
    print(f"  size before: {saved_before/1048576:.1f} MB")
    print(f"  size after:  {saved_after/1048576:.1f} MB")
    if saved_before:
        print(f"  saved:       {(saved_before-saved_after)/1048576:.1f} MB "
              f"({100*(saved_before-saved_after)/saved_before:.0f}% smaller)")


if __name__ == "__main__":
    main()
