import csv
import io
import json
import requests
import sys

SUPABASE_URL = "https://onvhmwjhiydhzirfcatp.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udmhtd2poaXlkaHppcmZjYXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDM1OTgsImV4cCI6MjA5MzYxOTU5OH0.kxgGBEbGCleAGsv5903iutUbEQt6G7kaf12qm_f0tFQ"

SECTION_ICONS = {
    "SKEWER": "🍢", "ROCKSTAR": "🤘", "COWBOY": "🤠",
    "MR KIM CHICKEN": "🍗", "CHICKENDAE": "🍗", "DRINK": "🥤",
}

CAT_ICONS = {
    "CHICKEN": "🍗", "PORK": "🥓", "BEEF": "🥩", "LAMB": "🐑",
    "SEAFOOD": "🦐", "DUCK": "🦆", "MUSHROOM": "🍄",
    "VEGETABLE": "🥬", "MEAT BALL": "🧆", "MEAT AND VEGETABLE": "🥩🥬",
    "SOUP": "🍲", "WOK FRIED": "🍳", "SIDE DISH": "🥗",
    "APPETIZER": "🥟", "SALAD": "🥗", "FRIED RICE": "🍚",
    "STIR-FRIED": "🍳", "GRILLED": "🔥",
    "FRIED CHECKEN": "🍗", "SNOW CHESS": "🧀", "SNACKS": "🍟",
    "KOREAN": "🇰🇷", "NOODLE": "🍜", "BEER": "🍺",
    "WINE": "🍷", "COCKTAIL": "🍸", "NON-ALCOHOL": "🧃",
    "OPEN MENU": "📋", "ADDITIONAL": "➕",
    "GLASS": "🥃", "JUG": "🍶", "TOWER": "🏗️",
}

HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

def api_get(table):
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}?select=id", headers=HEADERS)
    if r.status_code == 200:
        return [x["id"] for x in r.json()]
    return []

def api_delete(table, ids):
    for i in range(0, len(ids), 50):
        batch = ids[i:i+50]
        filters = ",".join(f"id=eq.{x}" for x in batch)
        url = f"{SUPABASE_URL}/rest/v1/{table}?or=({filters})"
        r = requests.delete(url, headers=HEADERS)
        if r.status_code not in [200, 204]:
            print(f"  Delete error ({r.status_code}): {r.text[:200]}")

def api_post(table, data):
    r = requests.post(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, json=data)
    if r.status_code not in [200, 201]:
        print(f"  Error ({r.status_code}): {r.text[:200]}")
        return None
    return r.json()

def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "asset/menu.csv"

    print("Clearing old data...")

    # Get all IDs
    oi_ids = api_get("order_items")
    osl_ids = api_get("order_status_logs")
    o_ids = api_get("orders")
    mi_ids = api_get("menu_items")
    mc_ids = api_get("menu_categories")

    # Delete in order (respecting FK)
    if oi_ids: api_delete("order_items", oi_ids)
    if osl_ids: api_delete("order_status_logs", osl_ids)
    if o_ids: api_delete("orders", o_ids)
    if mi_ids: api_delete("menu_items", mi_ids)
    if mc_ids: api_delete("menu_categories", mc_ids)

    print("Loading CSV...")

    content = None
    for enc in ["utf-8-sig", "latin-1", "cp1252", "utf-8"]:
        try:
            with open(csv_path, "r", encoding=enc) as f:
                content = f.read()
            break
        except:
            continue
    if not content:
        print("Failed to read CSV")
        return

    reader = csv.reader(io.StringIO(content))
    next(reader)  # Skip header

    current_section = None
    current_sub = None
    categories_created = {}
    order = 0
    item_count = 0

    for row in reader:
        if len(row) < 4:
            continue

        col1 = row[0].strip()
        col2 = row[1].strip()
        item_name = row[2].strip()
        price_str = row[3].strip()

        if item_name in ["OPEN DRINK", "OPEN FOOD", "Totals", ""]:
            continue
        if "OPEN MENU" in col2 or "OPEN MENU" in col1:
            continue
        if not item_name:
            continue

        try:
            price = float(price_str)
        except ValueError:
            continue
        if price <= 0:
            continue

        if col1 and "OPEN MENU" not in col1:
            for keyword in SECTION_ICONS:
                if keyword in col1.upper():
                    current_section = keyword
                    break
            else:
                current_section = col1.split(".", 1)[-1].strip() if "." in col1 else col1

        if col2 and "OPEN MENU" not in col2:
            current_sub = col2.split(".", 1)[-1].strip() if "." in col2 else col2

        clean_name = item_name
        for sep in [". ", "."]:
            parts = item_name.split(sep, 1)
            if len(parts) > 1 and len(parts[0]) <= 6:
                clean_name = parts[1].strip()
                break

        if not current_sub:
            continue

        cat_key = f"{current_section}|{current_sub}"

        if cat_key not in categories_created:
            order += 1
            icon = "🍽️"
            for keyword, ic in CAT_ICONS.items():
                if keyword in current_sub.upper():
                    icon = ic
                    break
            else:
                if current_section and current_section in SECTION_ICONS:
                    icon = SECTION_ICONS[current_section]

            result = api_post("menu_categories", {
                "name": current_sub,
                "icon": icon,
                "display_order": order,
            })
            if result:
                categories_created[cat_key] = result[0]["id"]
                print(f"  Category: {current_sub} ({icon})")
            else:
                continue

        cat_id = categories_created[cat_key]
        item_emoji = "🍽️"
        for keyword, ic in CAT_ICONS.items():
            if keyword in current_sub.upper():
                item_emoji = ic
                break

        item_count += 1
        api_post("menu_items", {
            "category_id": cat_id,
            "name": clean_name,
            "price": price,
            "image_emoji": item_emoji,
            "display_order": item_count,
        })

    print(f"\nDone! {len(categories_created)} categories, {item_count} items")

if __name__ == "__main__":
    main()
