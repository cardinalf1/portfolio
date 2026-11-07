# Instructions for agents working on this repo

Read README.md and CONTENT.md first. Build with `python3 build.py`. Never edit `dist/` by hand.

## Content rules (non negotiable)
- No em dashes or en dashes anywhere. Check with grep for the characters U+2014 and U+2013 in src; the count must be 0.
- Never claim Raghav built the Team Cardinal race car. He built the website and the management portal.
- Scrub is designed, not built. Never present it as finished.
- Do not advertise libraries or tech stack on the page.
- Pure monochrome: black background, white text, grey borders, mono fonts. No colour.
- He works for free and is open to unpaid work and internships. Tone: funny and a little unhinged, short statements, one idea per beat. Every joke must still be true.
- Email is a placeholder until replaced. `SITE.links` is empty on purpose.

## Architecture
- No pages, no windows. The film is one stream of beats (`BEATS`, built with `bt({...})` in `30-director.js`). A beat is a few elements; each one enters, holds and leaves on its own. Beats never overlap: everything in a beat has left by its last frame, and the next beat's first element arrives `GAP`=180 ms later. A fit pass (`fitBeat`) scales any beat that would not fit the window; type is sized with `min(vw, vh)` so it scales to the window first.
- Elements declare their motion in markup: `data-fx` is the entrance (`chars` typed headline, `rise`, `fade`, `left`, `right`, `scale`, `drop`, `wipe`, `type`, `count`), `data-x` the exit (default `past`, flying toward the camera with blur), `data-ag` what a cursor does with it (`sel`, `carry`, `frame`), `data-d` a delay. Helpers: `hd` headline (typed by a cursor; `[[text]]` is a typo it types and deletes; `~` starts a grey line; `|` breaks lines), `kk` small label, `sy` line, `as` typed aside, `stk` sticker, `nm` big number, `tg` chips, `vz` 3D scene. A beat's `obj:'name'` adds one small 3D model (see `VZ`). Use them sparingly: only where the model says something, and leave negative space everywhere else.
- One timeline `T` in ms. It follows `intro + scrollY / PPS * 1000` through a critically damped spring (`TV` is its velocity; PPS=95, intro 3600 ms). Total about 3:46 including the credits.
- `itemFx` and `charsFx` compute every element's style from `T` and only write when it changes. Each visible beat also drifts toward the camera, the stage has handheld noise (`NZ`, simplex-noise) and the tunnel behind moves with the scroll.
- A beat can define `setup(b)`, `each(b,local)`, `upd()` (called every frame) and `ag(b)` for custom cursor work. `HOOKS` holds per-frame callbacks from `40-extras.js`.
- Agents (`AGS`, six) are spring driven cursors. Script them with `seg(agent, t0, t1, fn, {label, grab, clicks, frame, shape})`, or `pickAg(t0,t1)` for any free one. `FX` holds the cursor actions inside each project's 3D scene (`holdIn`, `projObj`).
- Everything must be reversible: state is a pure function of `T`. Wall clock state is allowed only for overlays that never change the film: confetti clicks, the clipboard, the limit dialog (its runaway button, the four cursors holding it via `a.ovr`, the 3 second break free, the countdown), autoplay (`PLAY`), toasts, the help panel, the hidden extras (`SWARM`, cursor quips), and `50-fun.js` (achievements, commentary, sound). Sound must stay off until the viewer turns it on.
- 3D scene timelines are seeked by `renderViews`.
- 3D is frameless: each model draws on a transparent layer (`.gll`) that covers the whole beat and a bit beyond, so nothing clips. The empty cell in the layout (`.vz`, `.ob`, `.ic`) only marks where the model sits; `v.aim` shifts the camera onto that cell and sizes the model to it times `k` in `VZ`.

- Between chapters `BEATS` gets a generated title card (`b.card`): `scram` decodes the title, `line` draws the rule, `ghost` is the hollow word behind. Commentary in `50-fun.js` skips cards.
- The stage leans (`skewY`) with playhead velocity `TV`.
- The plain text version for agents and screen readers is generated, never hand edited: change `10-content.js` or the lines in `tools/plain.js`, then build. `?plain` shows it. `#stage` is `aria-hidden`; `<main id="plain">` is the accessible page.

- A start screen (`#choose`) holds the film (`HOLD`, `CHOOSING`) until the viewer picks; `startFilm()` releases it. While it is up, only cursors with an override (`a.ovr`) are drawn. Tests should open the page with `#t=0` to skip it.
- `runaway(a, cfg)` in `50-fun.js` is the shared hard-to-get button (resume buttons). The free model button in the limit dialog has its own copy in `30-director.js`.

## Checks before finishing
1. `python3 build.py` succeeds.
2. `python3 tools/capture.py` shows no page errors.
3. The dash check returns 0.
4. Scrolling up must replay in reverse with no stuck elements.
5. Nothing may look like a page or slide change: elements come and go on their own.
