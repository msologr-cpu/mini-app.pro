"""Generate inline favicon assets without persisting binary files.

This utility builds minimal logo-based icons for the site and writes:
- favicon.svg (vector, text)
- site.webmanifest (PNG icons embedded as data URIs)
- favicons-snippet.html (HTML <link> tags with inline icons)

Running the script keeps the repository free of committed binary files
while still giving browsers and crawlers the icon formats they expect.
"""

from __future__ import annotations

import base64
import binascii
import struct
import zlib
from pathlib import Path

ACCENT = (58, 122, 254, 255)  # #3a7afe
FOREGROUND = (255, 255, 255, 255)
SCALE = 3


def _empty_canvas(size: int) -> list[list[tuple[int, int, int, int]]]:
    return [[ACCENT for _ in range(size)] for _ in range(size)]


def _fill_rect(
    canvas: list[list[tuple[int, int, int, int]]],
    x0: int,
    y0: int,
    x1: int,
    y1: int,
) -> None:
    x0, y0 = max(x0, 0), max(y0, 0)
    x1, y1 = min(x1, len(canvas[0])), min(y1, len(canvas))
    for y in range(y0, y1):
        row = canvas[y]
        for x in range(x0, x1):
            row[x] = FOREGROUND


def _downsample(canvas: list[list[tuple[int, int, int, int]]], scale: int) -> list[list[tuple[int, int, int, int]]]:
    size = len(canvas) // scale
    result: list[list[tuple[int, int, int, int]]] = []
    for y in range(size):
        row: list[tuple[int, int, int, int]] = []
        for x in range(size):
            r = g = b = a = 0
            for sy in range(scale):
                for sx in range(scale):
                    pr, pg, pb, pa = canvas[y * scale + sy][x * scale + sx]
                    r += pr
                    g += pg
                    b += pb
                    a += pa
            count = scale * scale
            row.append((r // count, g // count, b // count, a // count))
        result.append(row)
    return result


def _build_mu(canvas: list[list[tuple[int, int, int, int]]]) -> None:
    size = len(canvas)
    stroke = max(SCALE * 2, size // 8)
    top = int(size * 0.26)
    arch = int(size * 0.46)
    baseline = int(size * 0.66)
    descender = int(size * 0.80)
    left = int(size * 0.26)
    right = int(size * 0.74) - stroke
    _fill_rect(canvas, left, top, left + stroke, descender)
    _fill_rect(canvas, left, arch, right + stroke, arch + stroke)
    _fill_rect(canvas, right, top, right + stroke, descender + stroke)
    _fill_rect(canvas, right, baseline, right + stroke * 2, descender + stroke)


def _png_bytes_from_pixels(pixels: list[list[tuple[int, int, int, int]]]) -> bytes:
    height = len(pixels)
    width = len(pixels[0])
    raw = bytearray()
    for row in pixels:
        raw.append(0)
        for r, g, b, a in row:
            raw.extend([r, g, b, a])

    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + chunk_type
            + data
            + struct.pack(">I", binascii.crc32(chunk_type + data) & 0xFFFFFFFF)
        )

    header = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    dat = chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    end = chunk(b"IEND", b"")
    return b"\x89PNG\r\n\x1a\n" + header + dat + end


def _png_bytes(size: int) -> bytes:
    canvas_size = size * SCALE
    canvas = _empty_canvas(canvas_size)
    _build_mu(canvas)
    pixels = _downsample(canvas, SCALE)
    return _png_bytes_from_pixels(pixels)


def _ico_bytes(entries: dict[str, bytes]) -> bytes:
    ordered = [(name, data) for name, data in entries.items()]
    header = struct.pack("<HHH", 0, 1, len(ordered))
    offset = 6 + 16 * len(ordered)
    dir_entries = bytearray()
    payload = bytearray()
    for name, data in ordered:
        size_segment = name.split("-")[-1].split("x")[0]
        width = int(size_segment)
        height = width
        dir_entries.extend(
            struct.pack(
                "<BBBBHHII",
                width if width < 256 else 0,
                height if height < 256 else 0,
                0,
                0,
                1,
                32,
                len(data),
                offset,
            )
        )
        payload.extend(data)
        offset += len(data)
    return bytes(header + dir_entries + payload)


def _data_uri(payload: bytes, mime: str) -> str:
    return f"data:{mime};base64,{base64.b64encode(payload).decode()}"


def _write_svg(path: Path) -> None:
    path.write_text(
        """
<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" role=\"img\" aria-label=\"mini-app.pro logo\">
  <rect width=\"512\" height=\"512\" rx=\"96\" fill=\"#3a7afe\"/>
  <path fill=\"#fff\" d=\"M166 152h72v176c0 28 16 44 38 44s38-16 38-44V152h72v244h-72v-60c-16 30-44 50-80 50-54 0-80-40-80-96z\"/>
</svg>
"""
    )


def _write_manifest(path: Path, icons: dict[str, str]) -> None:
    manifest = {
        "name": "mini-app.pro",
        "short_name": "mini-app.pro",
        "icons": [
            {"src": icons["android-chrome-192x192.png"], "sizes": "192x192", "type": "image/png"},
            {"src": icons["android-chrome-512x512.png"], "sizes": "512x512", "type": "image/png"},
        ],
        "theme_color": "#3a7afe",
        "background_color": "#3a7afe",
        "display": "standalone",
    }
    path.write_text(__import__("json").dumps(manifest, indent=2) + "\n")


def _write_html_snippet(path: Path, icons: dict[str, str]) -> None:
    snippet = f"""    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/favicon.svg\" />
    <link rel=\"icon\" type=\"image/png\" sizes=\"48x48\" href=\"{icons['favicon-48x48.png']}\" />
    <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"{icons['favicon-32x32.png']}\" />
    <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"{icons['favicon-16x16.png']}\" />
    <link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"{icons['apple-touch-icon.png']}\" />
    <link rel=\"manifest\" href=\"/site.webmanifest\" />
    <meta name=\"theme-color\" content=\"#3a7afe\" />
"""
    path.write_text(snippet)


def generate_assets(output_dir: Path | str = ".") -> None:
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    icon_sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "favicon-48x48.png": 48,
        "apple-touch-icon.png": 180,
        "android-chrome-192x192.png": 192,
        "android-chrome-512x512.png": 512,
    }

    png_payloads = {name: _png_bytes(size) for name, size in icon_sizes.items()}
    ico_payload = _ico_bytes({k: v for k, v in png_payloads.items() if k.startswith("favicon-")})

    data_uris = {name: _data_uri(payload, "image/png") for name, payload in png_payloads.items()}
    data_uris["favicon.ico"] = _data_uri(ico_payload, "image/x-icon")

    _write_svg(output_dir / "favicon.svg")
    _write_manifest(output_dir / "site.webmanifest", data_uris)
    _write_html_snippet(output_dir / "favicons-snippet.html", data_uris)


if __name__ == "__main__":
    generate_assets()
