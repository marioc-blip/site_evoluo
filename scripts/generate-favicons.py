#!/usr/bin/env python3
"""Generate the Evoluo favicon and platform icon set from the supplied mark."""

from __future__ import annotations

from collections import Counter
from pathlib import Path
import sys

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = (
    Path(sys.argv[1]).resolve()
    if len(sys.argv) > 1
    else PUBLIC / "brand" / "evoluo-favicon-source.png"
)
CREAM = (245, 244, 239, 255)


def normalized_mark() -> tuple[Image.Image, tuple[int, int, int]]:
    image = Image.open(SOURCE).convert("RGBA")
    alpha = image.getchannel("A")
    bounding_box = alpha.getbbox()
    if bounding_box is None:
        raise ValueError(f"{SOURCE} does not contain any visible pixels")

    pixels = list(image.getdata())
    dominant_color = Counter(
        (red, green, blue)
        for red, green, blue, opacity in pixels
        if opacity >= 192
    ).most_common(1)[0][0]

    # The source contains a few white RGB values in semi-transparent edge pixels.
    # Retaining the original alpha while normalizing RGB removes light halos on
    # dark browser chrome without changing the mark's silhouette.
    solid_color_pixels = [
        (*dominant_color, opacity) for _, _, _, opacity in pixels
    ]
    image.putdata(solid_color_pixels)
    return image.crop(bounding_box), dominant_color


def render_square(
    mark: Image.Image,
    size: int,
    occupancy: float,
    background: tuple[int, int, int, int] | None = None,
) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    max_dimension = max(mark.size)
    scale = (size * occupancy) / max_dimension
    resized_size = (
        max(1, round(mark.width * scale)),
        max(1, round(mark.height * scale)),
    )
    resized = mark.resize(resized_size, Image.Resampling.LANCZOS)
    position = (
        (size - resized.width) // 2,
        (size - resized.height) // 2,
    )
    canvas.alpha_composite(resized, position)
    return canvas


def save_png(image: Image.Image, filename: str) -> None:
    image.save(PUBLIC / filename, format="PNG", optimize=True)


def main() -> None:
    mark, dominant_color = normalized_mark()

    for size in (16, 32, 48, 96):
        save_png(
            render_square(mark, size=size, occupancy=0.86),
            f"favicon-{size}x{size}.png",
        )

    favicon_master = render_square(mark, size=256, occupancy=0.86)
    save_png(render_square(mark, 512, 0.86), "favicon.png")
    favicon_master.save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=((16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)),
    )

    save_png(render_square(mark, 180, 0.72, CREAM), "apple-touch-icon.png")
    save_png(render_square(mark, 192, 0.70, CREAM), "android-chrome-192x192.png")
    save_png(render_square(mark, 512, 0.70, CREAM), "android-chrome-512x512.png")
    save_png(render_square(mark, 512, 0.58, CREAM), "maskable-icon-512x512.png")
    save_png(render_square(mark, 150, 0.70, CREAM), "mstile-150x150.png")

    social_preview = Image.new("RGBA", (1200, 630), CREAM)
    social_mark = render_square(mark, 360, 0.78)
    social_preview.alpha_composite(
        social_mark,
        ((social_preview.width - social_mark.width) // 2, 135),
    )
    save_png(social_preview, "social-preview.png")

    print(
        f"Generated favicon set from {SOURCE.name}; "
        f"mark color rgb{dominant_color}; source crop {mark.size[0]}x{mark.size[1]}."
    )


if __name__ == "__main__":
    main()
