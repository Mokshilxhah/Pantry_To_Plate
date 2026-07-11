MASTER_ITEMS = [
    {
        "name": "Basmati Rice",
        "aliases": ["Basmati", "Long Grain Rice"],
        "category": "GRAINS_CEREALS",
        "sub_category": "Rice",
        "default_unit": "kg",
        "avg_shelf_life_days": 365,
        "storage_tip": "Store in airtight container in cool, dry place. Avoid moisture.",
        "nutrition_per_100g": {
            "calories": 356, "protein": 7.5, "carbs": 78.2,
            "fat": 0.4, "fiber": 1.0,
            "vitamins": ["B1", "B3", "B6"]
        },
        "diet_tags": ["veg", "jain", "vegan"],
        "allergen_tags": [],
        "is_perishable": False,
        "hindi_name": "बासमती चावल",
        "gujarati_name": "બાસમતી ચોખા"
    }
]

def seed_master_items():
    from apps.pantry.models import MasterItem
    for item_data in MASTER_ITEMS:
        MasterItem(**item_data).save()
    print(f"Seeded master items.")
