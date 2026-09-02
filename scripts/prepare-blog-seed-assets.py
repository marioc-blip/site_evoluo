from pathlib import Path

from PIL import Image


ASSET_DIR = Path("scripts/blog-seed-assets")
NAMES = [
    "influenza-cover",
    "equilibrio-cover",
    "quadril-cover",
    "influenza-inline",
    "equilibrio-inline",
    "quadril-inline",
]


for name in NAMES:
    source = ASSET_DIR / f"{name}.png"
    target = ASSET_DIR / f"{name}.webp"
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail((1280, 720), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (1280, 720), "#f5f4ef")
        x = (1280 - image.width) // 2
        y = (720 - image.height) // 2
        canvas.paste(image, (x, y))
        canvas.save(target, "WEBP", quality=86, method=6)
        print(target)
