#!/usr/bin/env bash
# =====================================================================
# SUPER DISCOUNT EL SERENO — ASSET PIPELINE (ImageMagick 7: `magick`)
# Hand this file + the source/ folder spec to the design department.
# Usage:  bash tools/assets.sh          (run from repo root)
# IM6 fallback: replace `magick` with `convert` (and `magick identify`
# with `identify`).
# =====================================================================
set -euo pipefail

# ---------------------------------------------------------------------
# FULL ASSET LIST
#
# INPUTS the department must supply in source/ :
#   source/brand/logo-full.png        transparent bg, >=2000px wide
#                                     (gold "Super" + red DISCOUNT + EL SERENO)
#   source/brand/logo-square.png      stacked square lockup, >=1024px
#   source/photos/products/<id>.png   one per product id in data/products.json
#                                     >=1200px, subject centered,
#                                     BOTTOM 20% KEPT CLEAN/DARK (logo zone)
#   source/photos/categories/<id>.jpg one per category id, >=1600px wide
#   source/photos/storefront.jpg      >=1920px wide
#   source/photos/hero.jpg            >=2400px wide (spray wall / counter)
#
# OUTPUTS this script generates:
#   img/favicon/favicon-16.png  favicon-32.png  favicon-48.png  favicon.ico
#   img/favicon/apple-touch-180.png  android-192.png  android-512.png
#   img/favicon/maskable-512.png     (safe-zone padded)
#   img/og/og-1200x630.png           (dark bg + logo composited south)
#   img/hero/hero-1920.webp  hero-1280.webp  hero-768.webp
#   img/categories/<id>-800x600.webp
#   img/products/<id>.webp           (800px)   -- store card size
#   img/products/<id>-400.webp                 -- grid/thumb
#   img/products/<id>-400.png                  -- png fallback
#   img/social/ig-<id>-1080.png      (1080x1080, logo south, 20% zone)
#   img/social/story-<id>-1080x1920.png
#
# RULES (non-negotiable, per brand playbook):
#   * NEVER let an AI tool render the logo text — composite the real
#     PNG only (this script does exactly that).
#   * Logo goes in the bottom ~20% clean dark zone, gravity south.
#   * Strip metadata, webp quality 82, keep NAP/brand untouched.
# ---------------------------------------------------------------------

SRC="source"
LOGO="$SRC/brand/logo-full.png"
LOGO_SQ="$SRC/brand/logo-square.png"
INK="#0A0A0A"
Q=82

need() { [ -e "$1" ] || { echo "MISSING: $1"; exit 1; }; }
need "$LOGO"; need "$LOGO_SQ"

mkdir -p img/{favicon,og,hero,categories,products,social}

# ---------- 1. FAVICONS / PWA ICONS ----------------------------------
for s in 16 32 48; do
  magick "$LOGO_SQ" -resize ${s}x${s} -background none -gravity center -extent ${s}x${s} -strip "img/favicon/favicon-$s.png"
done
magick img/favicon/favicon-16.png img/favicon/favicon-32.png img/favicon/favicon-48.png img/favicon/favicon.ico

magick "$LOGO_SQ" -resize 180x180 -background "$INK" -gravity center -extent 180x180 -strip img/favicon/apple-touch-180.png
magick "$LOGO_SQ" -resize 192x192 -background "$INK" -gravity center -extent 192x192 -strip img/favicon/android-192.png
magick "$LOGO_SQ" -resize 512x512 -background "$INK" -gravity center -extent 512x512 -strip img/favicon/android-512.png
# maskable: logo at 66% inside 512 canvas (Android adaptive-icon safe zone)
magick "$LOGO_SQ" -resize 340x340 -background "$INK" -gravity center -extent 512x512 -strip img/favicon/maskable-512.png

# ---------- 2. OG IMAGE (1200x630, logo south in clean zone) ----------
magick -size 1200x630 "xc:$INK" \
  \( "$LOGO" -resize 700x \) -gravity center -geometry +0-40 -composite \
  -strip img/og/og-1200x630.png

# ---------- 3. HERO (cover-crop from photo, 3 widths) -----------------
if [ -e "$SRC/photos/hero.jpg" ]; then
  for w in 1920 1280 768; do
    h=$(( w * 9 / 21 ))   # ~21:9 banner
    magick "$SRC/photos/hero.jpg" -resize ${w}x${h}^ -gravity center -extent ${w}x${h} \
      -strip -quality $Q "img/hero/hero-$w.webp"
  done
fi

# ---------- 4. CATEGORY TILES (800x600 cover) --------------------------
if [ -d "$SRC/photos/categories" ]; then
  for f in "$SRC"/photos/categories/*.jpg "$SRC"/photos/categories/*.png; do
    [ -e "$f" ] || continue
    id=$(basename "${f%.*}")
    magick "$f" -resize 800x600^ -gravity center -extent 800x600 \
      -strip -quality $Q "img/categories/$id-800x600.webp"
  done
fi

# ---------- 5. PRODUCT IMAGES (square, 800 + 400 webp, 400 png) --------
if [ -d "$SRC/photos/products" ]; then
  for f in "$SRC"/photos/products/*.png "$SRC"/photos/products/*.jpg; do
    [ -e "$f" ] || continue
    id=$(basename "${f%.*}")
    magick "$f" -resize 800x800^ -gravity center -extent 800x800 \
      -strip -quality $Q "img/products/$id.webp"
    magick "$f" -resize 400x400^ -gravity center -extent 400x400 \
      -strip -quality $Q "img/products/$id-400.webp"
    magick "$f" -resize 400x400^ -gravity center -extent 400x400 \
      -strip "img/products/$id-400.png"
  done
fi

# ---------- 6. SOCIAL: IG SQUARE + STORY (logo composited south) --------
# Logo width = 55% of canvas, sits inside the bottom 20% clean zone.
if [ -d "$SRC/photos/products" ]; then
  for f in "$SRC"/photos/products/*.png "$SRC"/photos/products/*.jpg; do
    [ -e "$f" ] || continue
    id=$(basename "${f%.*}")
    # 1080x1080 feed post
    magick "$f" -resize 1080x1080^ -gravity center -extent 1080x1080 \
      \( "$LOGO" -resize 594x \) -gravity south -geometry +0+54 -composite \
      -strip "img/social/ig-$id-1080.png"
    # 1080x1920 story
    magick "$f" -resize 1080x1920^ -gravity center -extent 1080x1920 \
      \( "$LOGO" -resize 594x \) -gravity south -geometry +0+120 -composite \
      -strip "img/social/story-$id-1080x1920.png"
  done
fi

echo "----------------------------------------"
echo "DONE. Generated into img/ :"
find img -type f | sort
