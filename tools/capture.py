#!/usr/bin/env python3
"""Take still frames of the film at given times (ms). Needs: pip install playwright && playwright install chromium
Usage: python3 tools/capture.py 0 5000 30000 60000   -> tools/shots/t<ms>.png
Software rendering is slow, so only stills are reliable. Check smoothness in a real browser."""
import sys, os
from playwright.sync_api import sync_playwright
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'tools', 'shots'); os.makedirs(out, exist_ok=True)
times = [int(a) for a in sys.argv[1:]] or [0, 6000, 20000, 45000, 90000, 104000]
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 1440, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.join(root, 'dist', 'index.html'))
    pg.wait_for_timeout(1500)
    for t in times:
        pg.evaluate(f'window.__film.snap({t})')
        pg.wait_for_timeout(600)
        pg.screenshot(path=os.path.join(out, f't{t}.png'))
        print('saved', t)
    print('page errors:', errs)
    b.close()
