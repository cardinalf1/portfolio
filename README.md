# Raghav Bahadur portfolio

A scroll-driven film made of live web parts and 3D scenes (not a video). Scroll down plays it, scroll up rewinds it. Cursors act as agents that build and move everything.

## Run it

    python3 build.py        # writes dist/index.html
    open dist/index.html    # or serve dist/ with any static host

`dist/index.html` is one self-contained file. Deploy `dist/llms.txt` (the plain text version for AI agents) and `dist/30s.html` (the 30 second version) next to it. Fonts load from Google Fonts, everything else is inlined. Deploy it as is (Netlify, Vercel, GitHub Pages, any host).

## Deploy

Pushing to `main` deploys to GitHub Pages: `.github/workflows/pages.yml` runs `python3 build.py` (with Node, for the plain text pages) and publishes `dist/`. `dist/` is not committed.

## Change the words

Open `CONTENT.md`. Every beat lists its text and the file to edit. Then rebuild. Before publishing, set your real email in `src/js/10-content.js` (`SITE.email`) and add links in `SITE.links` if you want them.

## Layout

- `src/head.html` tab title, meta
- `src/styles.css` all styling
- `src/body.html` fixed interface and the limit dialog
- `src/js/00-core.js` helpers
- `src/js/10-content.js` project data, timeline, email
- `src/js/20-3d.js` the 3D scenes
- `src/js/30-director.js` the beats (all on-screen words), element motion, cursor agents, camera, confetti, timing
- `src/js/50-fun.js` achievements, director's commentary (C) and synthesized sound (M)
- `src/js/40-extras.js` opening slate, chapter cards, player controls (`#t=` links, help panel) and the hidden extras
- `lib/` third party files, inlined by build: anime (timelines), three (3D), Lenis (smooth scroll), simplex-noise (handheld camera and cursor drift)
- `tools/capture.py` still frames for review
- `tools/plain.js` builds the plain text version (`src/plain.html`, `src/llms.txt`) from the content; `build.py` runs it when Node is installed
- `AGENTS.md` rules for AI agents working on this repo

## Test

`python3 tools/capture.py 0 30000 60000` saves screenshots. In the browser console, `__film.snap(ms)` jumps to a time. Software rendering is slow, so judge smoothness on a real GPU.

## Watch it

Short on time? Press `T` (or `30S` in the top bar) for the 30 second version. Otherwise scroll. Nothing moves until you do. `C` turns on the director's commentary, `M` the sound. `?` lists the keys and the achievements. Click the chapter name in the top bar for scene select. Printing gives a plain document version. Add `#t=60` to the address to start at 1:00.
