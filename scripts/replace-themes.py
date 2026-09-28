#!/usr/bin/env python3
"""
Replace the 8 old accent theme blocks (sunset, coral, lavender, mint, berry,
sage, ember, mono) in globals.css with 11 new theme blocks (emerald,
master-purple, ruby, gold, rose, midnight, sakura, forest-sovereign, slate,
coral, cosmic-diamond).

The violet, ocean, forest, sunrise blocks are kept.
"""

import re

CSS_PATH = "/home/z/my-project/src/app/globals.css"

with open(CSS_PATH, "r") as f:
    content = f.read()

# The 8 old themes start at [data-accent="sunset"] and end right before @layer base
# Find the start and end markers
start_marker = '[data-accent="sunset"] {'
end_marker = '  --accent-swatch: oklch(0.50 0 0);\n}\n'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx) + len(end_marker)

if start_idx == -1 or end_idx == -1:
    print("ERROR: Could not find the old theme block markers")
    exit(1)

print(f"Replacing bytes {start_idx}..{end_idx} ({end_idx - start_idx} chars)")

# Define the 11 new theme blocks
new_themes = """[data-accent="emerald"] {
  --color-violet-50:  oklch(0.97 0.03 160);
  --color-violet-100: oklch(0.93 0.07 160);
  --color-violet-200: oklch(0.88 0.11 160);
  --color-violet-300: oklch(0.82 0.14 160);
  --color-violet-400: oklch(0.76 0.16 160);
  --color-violet-500: oklch(0.69 0.17 160);
  --color-violet-600: oklch(0.58 0.18 160);
  --color-violet-700: oklch(0.48 0.16 160);
  --color-violet-800: oklch(0.38 0.13 160);
  --color-violet-900: oklch(0.28 0.10 160);
  --color-violet-950: oklch(0.20 0.07 160);
  --color-fuchsia-50:  oklch(0.97 0.03 175);
  --color-fuchsia-100: oklch(0.93 0.07 175);
  --color-fuchsia-200: oklch(0.88 0.11 175);
  --color-fuchsia-300: oklch(0.82 0.14 175);
  --color-fuchsia-400: oklch(0.76 0.16 175);
  --color-fuchsia-500: oklch(0.72 0.18 175);
  --color-fuchsia-600: oklch(0.62 0.20 175);
  --color-fuchsia-700: oklch(0.52 0.18 175);
  --color-fuchsia-800: oklch(0.42 0.15 175);
  --color-fuchsia-900: oklch(0.32 0.12 175);
  --gradient-text-1: oklch(0.95 0.06 160);
  --gradient-text-2: oklch(0.69 0.17 160);
  --gradient-text-3: oklch(0.72 0.18 175);
  --text-glow-1: oklch(0.69 0.17 160 / 0.45);
  --text-glow-2: oklch(0.72 0.18 175 / 0.25);
  --aurora-1: oklch(0.6 0.18 160 / 0.22);
  --aurora-2: oklch(0.6 0.18 175 / 0.16);
  --aurora-3: oklch(0.65 0.18 145 / 0.16);
  --accent-swatch: oklch(0.69 0.17 160);
}

[data-accent="master-purple"] {
  --color-violet-50:  oklch(0.97 0.02 290);
  --color-violet-100: oklch(0.93 0.06 290);
  --color-violet-200: oklch(0.88 0.10 290);
  --color-violet-300: oklch(0.82 0.13 290);
  --color-violet-400: oklch(0.76 0.16 290);
  --color-violet-500: oklch(0.70 0.19 290);
  --color-violet-600: oklch(0.60 0.22 290);
  --color-violet-700: oklch(0.50 0.20 290);
  --color-violet-800: oklch(0.40 0.17 290);
  --color-violet-900: oklch(0.30 0.14 290);
  --color-violet-950: oklch(0.22 0.10 290);
  --color-fuchsia-50:  oklch(0.96 0.02 320);
  --color-fuchsia-100: oklch(0.92 0.06 320);
  --color-fuchsia-200: oklch(0.86 0.10 320);
  --color-fuchsia-300: oklch(0.80 0.13 320);
  --color-fuchsia-400: oklch(0.74 0.16 320);
  --color-fuchsia-500: oklch(0.69 0.19 320);
  --color-fuchsia-600: oklch(0.59 0.21 320);
  --color-fuchsia-700: oklch(0.49 0.19 320);
  --color-fuchsia-800: oklch(0.39 0.16 320);
  --color-fuchsia-900: oklch(0.29 0.13 320);
  --gradient-text-1: oklch(0.95 0.05 290);
  --gradient-text-2: oklch(0.70 0.19 290);
  --gradient-text-3: oklch(0.69 0.19 320);
  --text-glow-1: oklch(0.70 0.19 290 / 0.45);
  --text-glow-2: oklch(0.69 0.19 320 / 0.25);
  --aurora-1: oklch(0.6 0.22 290 / 0.22);
  --aurora-2: oklch(0.6 0.20 320 / 0.16);
  --aurora-3: oklch(0.65 0.18 260 / 0.16);
  --accent-swatch: oklch(0.70 0.19 290);
}

[data-accent="ruby"] {
  --color-violet-50:  oklch(0.97 0.02 15);
  --color-violet-100: oklch(0.93 0.06 15);
  --color-violet-200: oklch(0.88 0.10 15);
  --color-violet-300: oklch(0.82 0.13 15);
  --color-violet-400: oklch(0.76 0.16 15);
  --color-violet-500: oklch(0.70 0.19 15);
  --color-violet-600: oklch(0.60 0.22 15);
  --color-violet-700: oklch(0.50 0.20 15);
  --color-violet-800: oklch(0.40 0.17 15);
  --color-violet-900: oklch(0.30 0.14 15);
  --color-violet-950: oklch(0.22 0.10 15);
  --color-fuchsia-50:  oklch(0.96 0.02 0);
  --color-fuchsia-100: oklch(0.92 0.06 0);
  --color-fuchsia-200: oklch(0.86 0.10 0);
  --color-fuchsia-300: oklch(0.80 0.13 0);
  --color-fuchsia-400: oklch(0.74 0.16 0);
  --color-fuchsia-500: oklch(0.69 0.19 0);
  --color-fuchsia-600: oklch(0.59 0.21 0);
  --color-fuchsia-700: oklch(0.49 0.19 0);
  --color-fuchsia-800: oklch(0.39 0.16 0);
  --color-fuchsia-900: oklch(0.29 0.13 0);
  --gradient-text-1: oklch(0.95 0.05 15);
  --gradient-text-2: oklch(0.70 0.19 15);
  --gradient-text-3: oklch(0.69 0.19 0);
  --text-glow-1: oklch(0.70 0.19 15 / 0.45);
  --text-glow-2: oklch(0.69 0.19 0 / 0.25);
  --aurora-1: oklch(0.6 0.22 15 / 0.22);
  --aurora-2: oklch(0.6 0.20 0 / 0.16);
  --aurora-3: oklch(0.65 0.22 350 / 0.16);
  --accent-swatch: oklch(0.70 0.19 15);
}

[data-accent="gold"] {
  --color-violet-50:  oklch(0.97 0.03 85);
  --color-violet-100: oklch(0.93 0.07 85);
  --color-violet-200: oklch(0.88 0.11 85);
  --color-violet-300: oklch(0.82 0.14 85);
  --color-violet-400: oklch(0.76 0.16 85);
  --color-violet-500: oklch(0.72 0.18 85);
  --color-violet-600: oklch(0.62 0.20 85);
  --color-violet-700: oklch(0.52 0.18 85);
  --color-violet-800: oklch(0.42 0.15 85);
  --color-violet-900: oklch(0.32 0.12 85);
  --color-violet-950: oklch(0.22 0.09 85);
  --color-fuchsia-50:  oklch(0.97 0.04 60);
  --color-fuchsia-100: oklch(0.93 0.08 60);
  --color-fuchsia-200: oklch(0.88 0.12 60);
  --color-fuchsia-300: oklch(0.82 0.15 60);
  --color-fuchsia-400: oklch(0.76 0.17 60);
  --color-fuchsia-500: oklch(0.70 0.19 60);
  --color-fuchsia-600: oklch(0.60 0.20 60);
  --color-fuchsia-700: oklch(0.50 0.18 60);
  --color-fuchsia-800: oklch(0.40 0.15 60);
  --color-fuchsia-900: oklch(0.30 0.12 60);
  --gradient-text-1: oklch(0.95 0.06 85);
  --gradient-text-2: oklch(0.72 0.18 85);
  --gradient-text-3: oklch(0.70 0.19 60);
  --text-glow-1: oklch(0.72 0.18 85 / 0.45);
  --text-glow-2: oklch(0.70 0.19 60 / 0.25);
  --aurora-1: oklch(0.6 0.20 85 / 0.22);
  --aurora-2: oklch(0.6 0.20 60 / 0.16);
  --aurora-3: oklch(0.65 0.20 105 / 0.16);
  --accent-swatch: oklch(0.72 0.18 85);
}

[data-accent="rose"] {
  --color-violet-50:  oklch(0.97 0.02 350);
  --color-violet-100: oklch(0.93 0.06 350);
  --color-violet-200: oklch(0.88 0.10 350);
  --color-violet-300: oklch(0.82 0.13 350);
  --color-violet-400: oklch(0.76 0.16 350);
  --color-violet-500: oklch(0.70 0.19 350);
  --color-violet-600: oklch(0.60 0.22 350);
  --color-violet-700: oklch(0.50 0.20 350);
  --color-violet-800: oklch(0.40 0.17 350);
  --color-violet-900: oklch(0.30 0.14 350);
  --color-violet-950: oklch(0.22 0.10 350);
  --color-fuchsia-50:  oklch(0.96 0.02 340);
  --color-fuchsia-100: oklch(0.92 0.06 340);
  --color-fuchsia-200: oklch(0.86 0.10 340);
  --color-fuchsia-300: oklch(0.80 0.13 340);
  --color-fuchsia-400: oklch(0.74 0.16 340);
  --color-fuchsia-500: oklch(0.69 0.19 340);
  --color-fuchsia-600: oklch(0.59 0.21 340);
  --color-fuchsia-700: oklch(0.49 0.19 340);
  --color-fuchsia-800: oklch(0.39 0.16 340);
  --color-fuchsia-900: oklch(0.29 0.13 340);
  --gradient-text-1: oklch(0.95 0.05 350);
  --gradient-text-2: oklch(0.70 0.19 350);
  --gradient-text-3: oklch(0.69 0.19 340);
  --text-glow-1: oklch(0.70 0.19 350 / 0.45);
  --text-glow-2: oklch(0.69 0.19 340 / 0.25);
  --aurora-1: oklch(0.6 0.22 350 / 0.22);
  --aurora-2: oklch(0.6 0.20 340 / 0.16);
  --aurora-3: oklch(0.65 0.22 10 / 0.16);
  --accent-swatch: oklch(0.70 0.19 350);
}

[data-accent="midnight"] {
  --color-violet-50:  oklch(0.97 0.01 260);
  --color-violet-100: oklch(0.93 0.02 260);
  --color-violet-200: oklch(0.88 0.04 260);
  --color-violet-300: oklch(0.82 0.06 260);
  --color-violet-400: oklch(0.74 0.08 260);
  --color-violet-500: oklch(0.65 0.10 260);
  --color-violet-600: oklch(0.55 0.12 260);
  --color-violet-700: oklch(0.45 0.10 260);
  --color-violet-800: oklch(0.35 0.08 260);
  --color-violet-900: oklch(0.25 0.06 260);
  --color-violet-950: oklch(0.18 0.04 260);
  --color-fuchsia-50:  oklch(0.96 0.01 240);
  --color-fuchsia-100: oklch(0.92 0.02 240);
  --color-fuchsia-200: oklch(0.86 0.04 240);
  --color-fuchsia-300: oklch(0.78 0.06 240);
  --color-fuchsia-400: oklch(0.70 0.08 240);
  --color-fuchsia-500: oklch(0.62 0.10 240);
  --color-fuchsia-600: oklch(0.52 0.12 240);
  --color-fuchsia-700: oklch(0.42 0.10 240);
  --color-fuchsia-800: oklch(0.32 0.08 240);
  --color-fuchsia-900: oklch(0.22 0.06 240);
  --gradient-text-1: oklch(0.95 0.02 260);
  --gradient-text-2: oklch(0.50 0.12 260);
  --gradient-text-3: oklch(0.30 0.10 240);
  --text-glow-1: oklch(0.50 0.12 260 / 0.40);
  --text-glow-2: oklch(0.30 0.10 240 / 0.20);
  --aurora-1: oklch(0.5 0.12 260 / 0.18);
  --aurora-2: oklch(0.4 0.10 240 / 0.12);
  --aurora-3: oklch(0.6 0.10 220 / 0.12);
  --accent-swatch: oklch(0.50 0.12 260);
}

[data-accent="sakura"] {
  --color-violet-50:  oklch(0.97 0.02 350);
  --color-violet-100: oklch(0.94 0.05 350);
  --color-violet-200: oklch(0.90 0.09 350);
  --color-violet-300: oklch(0.86 0.12 350);
  --color-violet-400: oklch(0.80 0.15 350);
  --color-violet-500: oklch(0.74 0.17 350);
  --color-violet-600: oklch(0.64 0.19 350);
  --color-violet-700: oklch(0.54 0.17 350);
  --color-violet-800: oklch(0.44 0.14 350);
  --color-violet-900: oklch(0.34 0.11 350);
  --color-violet-950: oklch(0.24 0.08 350);
  --color-fuchsia-50:  oklch(0.97 0.03 330);
  --color-fuchsia-100: oklch(0.94 0.07 330);
  --color-fuchsia-200: oklch(0.90 0.11 330);
  --color-fuchsia-300: oklch(0.86 0.14 330);
  --color-fuchsia-400: oklch(0.80 0.16 330);
  --color-fuchsia-500: oklch(0.76 0.18 330);
  --color-fuchsia-600: oklch(0.66 0.20 330);
  --color-fuchsia-700: oklch(0.56 0.18 330);
  --color-fuchsia-800: oklch(0.46 0.15 330);
  --color-fuchsia-900: oklch(0.36 0.12 330);
  --gradient-text-1: oklch(0.95 0.05 350);
  --gradient-text-2: oklch(0.74 0.17 350);
  --gradient-text-3: oklch(0.76 0.18 330);
  --text-glow-1: oklch(0.74 0.17 350 / 0.45);
  --text-glow-2: oklch(0.76 0.18 330 / 0.25);
  --aurora-1: oklch(0.6 0.20 350 / 0.22);
  --aurora-2: oklch(0.6 0.20 330 / 0.16);
  --aurora-3: oklch(0.65 0.18 0 / 0.16);
  --accent-swatch: oklch(0.74 0.17 350);
}

[data-accent="forest-sovereign"] {
  --color-violet-50:  oklch(0.97 0.02 150);
  --color-violet-100: oklch(0.93 0.05 150);
  --color-violet-200: oklch(0.88 0.09 150);
  --color-violet-300: oklch(0.82 0.12 150);
  --color-violet-400: oklch(0.75 0.15 150);
  --color-violet-500: oklch(0.69 0.17 150);
  --color-violet-600: oklch(0.58 0.18 150);
  --color-violet-700: oklch(0.48 0.16 150);
  --color-violet-800: oklch(0.38 0.13 150);
  --color-violet-900: oklch(0.28 0.10 150);
  --color-violet-950: oklch(0.20 0.07 150);
  --color-fuchsia-50:  oklch(0.97 0.03 165);
  --color-fuchsia-100: oklch(0.93 0.07 165);
  --color-fuchsia-200: oklch(0.88 0.11 165);
  --color-fuchsia-300: oklch(0.82 0.14 165);
  --color-fuchsia-400: oklch(0.75 0.16 165);
  --color-fuchsia-500: oklch(0.71 0.18 165);
  --color-fuchsia-600: oklch(0.61 0.19 165);
  --color-fuchsia-700: oklch(0.51 0.17 165);
  --color-fuchsia-800: oklch(0.41 0.14 165);
  --color-fuchsia-900: oklch(0.31 0.11 165);
  --gradient-text-1: oklch(0.95 0.05 150);
  --gradient-text-2: oklch(0.69 0.17 150);
  --gradient-text-3: oklch(0.71 0.18 165);
  --text-glow-1: oklch(0.69 0.17 150 / 0.45);
  --text-glow-2: oklch(0.71 0.18 165 / 0.25);
  --aurora-1: oklch(0.6 0.18 150 / 0.22);
  --aurora-2: oklch(0.6 0.18 165 / 0.16);
  --aurora-3: oklch(0.65 0.18 135 / 0.16);
  --accent-swatch: oklch(0.69 0.17 150);
}

[data-accent="slate"] {
  --color-violet-50:  oklch(0.97 0.005 255);
  --color-violet-100: oklch(0.93 0.01 255);
  --color-violet-200: oklch(0.88 0.02 255);
  --color-violet-300: oklch(0.82 0.03 255);
  --color-violet-400: oklch(0.74 0.04 255);
  --color-violet-500: oklch(0.65 0.05 255);
  --color-violet-600: oklch(0.55 0.06 255);
  --color-violet-700: oklch(0.45 0.05 255);
  --color-violet-800: oklch(0.35 0.04 255);
  --color-violet-900: oklch(0.25 0.03 255);
  --color-violet-950: oklch(0.18 0.02 255);
  --color-fuchsia-50:  oklch(0.96 0.005 220);
  --color-fuchsia-100: oklch(0.92 0.01 220);
  --color-fuchsia-200: oklch(0.86 0.02 220);
  --color-fuchsia-300: oklch(0.78 0.03 220);
  --color-fuchsia-400: oklch(0.70 0.04 220);
  --color-fuchsia-500: oklch(0.62 0.05 220);
  --color-fuchsia-600: oklch(0.52 0.06 220);
  --color-fuchsia-700: oklch(0.42 0.05 220);
  --color-fuchsia-800: oklch(0.32 0.04 220);
  --color-fuchsia-900: oklch(0.22 0.03 220);
  --gradient-text-1: oklch(0.95 0.01 255);
  --gradient-text-2: oklch(0.50 0.06 255);
  --gradient-text-3: oklch(0.30 0.05 220);
  --text-glow-1: oklch(0.50 0.06 255 / 0.40);
  --text-glow-2: oklch(0.30 0.05 220 / 0.20);
  --aurora-1: oklch(0.5 0.06 255 / 0.18);
  --aurora-2: oklch(0.4 0.05 220 / 0.12);
  --aurora-3: oklch(0.6 0.05 240 / 0.12);
  --accent-swatch: oklch(0.50 0.06 255);
}

[data-accent="coral"] {
  --color-violet-50:  oklch(0.97 0.02 35);
  --color-violet-100: oklch(0.93 0.06 35);
  --color-violet-200: oklch(0.88 0.10 35);
  --color-violet-300: oklch(0.82 0.13 35);
  --color-violet-400: oklch(0.76 0.16 35);
  --color-violet-500: oklch(0.71 0.18 35);
  --color-violet-600: oklch(0.61 0.20 35);
  --color-violet-700: oklch(0.51 0.18 35);
  --color-violet-800: oklch(0.41 0.15 35);
  --color-violet-900: oklch(0.31 0.12 35);
  --color-violet-950: oklch(0.22 0.09 35);
  --color-fuchsia-50:  oklch(0.96 0.02 15);
  --color-fuchsia-100: oklch(0.92 0.06 15);
  --color-fuchsia-200: oklch(0.86 0.10 15);
  --color-fuchsia-300: oklch(0.80 0.13 15);
  --color-fuchsia-400: oklch(0.74 0.16 15);
  --color-fuchsia-500: oklch(0.69 0.19 15);
  --color-fuchsia-600: oklch(0.59 0.21 15);
  --color-fuchsia-700: oklch(0.49 0.19 15);
  --color-fuchsia-800: oklch(0.39 0.16 15);
  --color-fuchsia-900: oklch(0.29 0.13 15);
  --gradient-text-1: oklch(0.95 0.05 35);
  --gradient-text-2: oklch(0.71 0.18 35);
  --gradient-text-3: oklch(0.69 0.19 15);
  --text-glow-1: oklch(0.71 0.18 35 / 0.45);
  --text-glow-2: oklch(0.69 0.19 15 / 0.25);
  --aurora-1: oklch(0.6 0.20 35 / 0.22);
  --aurora-2: oklch(0.6 0.20 15 / 0.16);
  --aurora-3: oklch(0.65 0.20 55 / 0.16);
  --accent-swatch: oklch(0.71 0.18 35);
}

[data-accent="cosmic-diamond"] {
  --color-violet-50:  oklch(0.97 0.02 270);
  --color-violet-100: oklch(0.93 0.04 270);
  --color-violet-200: oklch(0.88 0.07 270);
  --color-violet-300: oklch(0.82 0.10 270);
  --color-violet-400: oklch(0.76 0.13 270);
  --color-violet-500: oklch(0.70 0.16 270);
  --color-violet-600: oklch(0.60 0.18 270);
  --color-violet-700: oklch(0.50 0.16 270);
  --color-violet-800: oklch(0.40 0.13 270);
  --color-violet-900: oklch(0.30 0.10 270);
  --color-violet-950: oklch(0.22 0.07 270);
  --color-fuchsia-50:  oklch(0.97 0.02 240);
  --color-fuchsia-100: oklch(0.93 0.04 240);
  --color-fuchsia-200: oklch(0.88 0.07 240);
  --color-fuchsia-300: oklch(0.82 0.10 240);
  --color-fuchsia-400: oklch(0.76 0.13 240);
  --color-fuchsia-500: oklch(0.70 0.16 240);
  --color-fuchsia-600: oklch(0.60 0.18 240);
  --color-fuchsia-700: oklch(0.50 0.16 240);
  --color-fuchsia-800: oklch(0.40 0.13 240);
  --color-fuchsia-900: oklch(0.30 0.10 240);
  --gradient-text-1: oklch(0.95 0.04 270);
  --gradient-text-2: oklch(0.70 0.16 270);
  --gradient-text-3: oklch(0.70 0.16 240);
  --text-glow-1: oklch(0.70 0.16 270 / 0.45);
  --text-glow-2: oklch(0.70 0.16 240 / 0.25);
  --aurora-1: oklch(0.6 0.18 270 / 0.22);
  --aurora-2: oklch(0.6 0.18 240 / 0.16);
  --aurora-3: oklch(0.65 0.18 300 / 0.16);
  --accent-swatch: oklch(0.70 0.16 270);
}

"""

new_content = content[:start_idx] + new_themes + content[end_idx:]

with open(CSS_PATH, "w") as f:
    f.write(new_content)

print(f"Done. New file size: {len(new_content)} chars")
