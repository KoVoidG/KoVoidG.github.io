# Font Files

These are placeholder stubs. Replace them with real latin-subset variable woff2 files before deploying.

## How to obtain the real fonts

1. **Fraunces** (variable, latin subset):
   Download from https://fonts.google.com/specimen/Fraunces
   Select the variable woff2 file, subset to latin. Target: ~40-50KB.

2. **Inter** (variable, latin subset):
   Download from https://fonts.google.com/specimen/Inter
   Select the variable woff2 file, subset to latin. Target: ~40-50KB.

3. **JetBrains Mono** (weight 400, latin subset):
   Download from https://fonts.google.com/specimen/JetBrains+Mono
   Select the regular (400) woff2 file, subset to latin. Target: ~20-30KB.

## Budget

- At most 4 font files total
- Total size must not exceed 150KB
- woff2 format only — no woff, ttf, or eot

## Preloading

Only the two above-the-fold fonts are preloaded in `index.html`:
- `fraunces-var.woff2` (display headings)
- `inter-var.woff2` (body text)

JetBrains Mono is NOT preloaded (used for labels/code, not above the fold).
