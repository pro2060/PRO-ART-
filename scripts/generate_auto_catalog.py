#!/usr/bin/env python3
"""Build a catalog from image files uploaded to the category folders."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTO = ROOT / "images" / "auto"
OUTPUT = ROOT / "images" / "auto-catalog.json"
CATEGORIES = {
    "parts": ("parts", "سيت ٣ قطع"),
    "abs": ("abs", "فن تجريدي"),
    "isl": ("isl", "فن إسلامي"),
    "hand": ("hand", "هاند ميد"),
    "print": ("print", "لوحات مطبوعة"),
    "wall": ("wall", "ورق حائط"),
    "big": ("big", "مقاسات كبيرة"),
    "our": ("our", "من أعمال PRO ART"),
}
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}

catalog = {}
for section, (prefix, label) in CATEGORIES.items():
    folder = AUTO / section
    items = []
    seen = set()
    pattern = re.compile(rf"^{re.escape(prefix)}-(\d{{3,}})$", re.IGNORECASE)
    if folder.exists():
        for path in folder.iterdir():
            if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
                continue
            match = pattern.fullmatch(path.stem)
            if not match:
                continue
            number = int(match.group(1))
            if number in seen:
                raise SystemExit(f"Duplicate sequence number in {folder}: {number:03d}")
            seen.add(number)
            image_path = path.relative_to(ROOT).as_posix()
            title = f"{label} {number:03d}"
            description = ""
            details_file = folder / f"{path.stem}.txt"
            if details_file.is_file():
                lines = [line.strip() for line in details_file.read_text(encoding="utf-8-sig").splitlines()]
                lines = [line for line in lines if line]
                if lines:
                    title = lines[0]
                    description = " ".join(lines[1:])
            item = {
                "id": f"auto-{section}-{number:03d}",
                "name": title,
                "img": image_path,
            }
            if description:
                item["description"] = description
            items.append(item)
    items.sort(key=lambda item: int(item["id"].rsplit("-", 1)[1]), reverse=True)
    if items:
        items[0]["isNew"] = True
    catalog[section] = items

OUTPUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
