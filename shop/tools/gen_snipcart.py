#!/usr/bin/env python3
"""Generate snipcart-products.html from data/products.json.
Snipcart's crawler validates prices against static HTML — it can't see
the JS-rendered store, so this plain page is the source of truth it reads.
Rerun after every price/catalog edit:  python3 tools/gen_snipcart.py
"""
import json, html, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((root / "data/products.json").read_text())
brand = json.loads((root / "tokens/brand.json").read_text())
url = brand["checkout"]["snipcart"]["validation_url"]

rows = []
for p in data["products"]:
    if p.get("price") is None or p.get("age21") or p.get("inStoreOnly"):
        continue
    rows.append(
        '<button class="snipcart-add-item" '
        f'data-item-id="{p["id"]}" '
        f'data-item-price="{p["price"]}" '
        f'data-item-name="{html.escape(p["name"])}" '
        f'data-item-url="{url}" '
        f'data-item-image="{p["img"]}">'
        f'{html.escape(p["name"])}</button>'
    )

out = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="robots" content="noindex">
<title>Snipcart product validation — Super Discount El Sereno</title>
</head><body>
<h1>Product validation page (Snipcart crawler only)</h1>
{chr(10).join(rows)}
</body></html>
"""
(root / "snipcart-products.html").write_text(out)
print(f"wrote snipcart-products.html ({len(rows)} products)")
