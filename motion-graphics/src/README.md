# Motion graphics recipe

Every scene is a pure function of time (`F(t)`, `t` in 0..1) inside one HTML
file, so frames are stepped deterministically and identical on every render.
Renders can be deleted for disk space and remade from here.

## Files

- `scene.html`  – batch 1 (looping, 8–15s)
- `scene2.html` – batch 2 (looping, 9–12s)
- `scene3.html` – batch 3 (short 4–5s, settles and holds the last frame; built from
  the site's own pieces: keyhole preloader, pills, DrawCard outline, WordReveal,
  project-card crop, estimator, cut-out parallax, mark sheets, frosted glass)
- `render.js` / `render2.js` – Playwright + ffmpeg frame stepper (25fps, H.264, crf 17)
- `assets/` – cut-outs (rembg u2net). Other assets copy from `public/` and `app/fonts/`.

## Setup (once)

```
mkdir -p assets
cp ../../public/*.svg ../../public/hero-main.jpg ../../public/services/*.jpg ../../public/team/*.jpg ../../app/fonts/*.woff2 assets/
# Space Mono 400/700 woff2 → assets/spacemono-0065.woff2, assets/spacemono-e84b.woff2 (Google Fonts)
```

## Render

```
# <scene file> <W> <H> <outdir> <scene names…>
SCENE=scene3.html node render2.js 1426 2000 out keyhole cover slogan
SCENE=scene3.html node render2.js 444 2000 out …
SCENE=scene3.html node render2.js 2000 774 out …
SCENE=scene3.html node render2.js 1500 4000 out …
# 1200×3300 is the 1500×4000 render scaled + padded:
ffmpeg -i x_1500x4000.mp4 -vf "scale=1200:3200,pad=1200:3300:0:50:color=f4f1ea" -c:v libx264 -crf 17 -pix_fmt yuv420p x_1200x3300.mp4
```

Type scale: `1rem = width/100` (portrait) or `height/80` (landscape); the
`.strip` class (aspect taller than 3.5:1) bumps type further. Content is inset by
`--pad` (7–8rem) on every side so clips survive being mapped onto 3D objects.
