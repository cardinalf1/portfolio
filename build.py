#!/usr/bin/env python3
"""Build the portfolio into dist/index.html (single file, no network needed except Google Fonts).

Usage:  python3 build.py
Reads:  src/head.html, src/styles.css, src/body.html, src/js/*.js (in filename order), lib/*.js
Writes: dist/index.html   (deploy this)
        dist/fragment.html (same page without <html>/<head> wrapper, for embedding)
"""
import glob, os, shutil, subprocess
root = os.path.dirname(os.path.abspath(__file__))
def rd(p):
    with open(os.path.join(root, p), encoding='utf-8') as f:
        return f.read()
# the plain text version (for agents, search engines and screen readers) is generated from the content file when Node exists
if shutil.which('node'):
    subprocess.run(['node', os.path.join(root, 'tools', 'plain.js')], check=True)
libs = ''
for name in ('anime.min.js', 'three.min.js', 'lenis.min.js', 'simplex-noise.js'):
    libs += '<script>' + rd('lib/' + name).replace('</script', '<\\/script') + '</script>\n'
js = ''
for p in sorted(glob.glob(os.path.join(root, 'src', 'js', '*.js'))):
    js += rd(os.path.relpath(p, root))
frag = (rd('src/head.html') + '<style>\n' + rd('src/styles.css') + '</style>\n' + rd('src/plain.html') + rd('src/body.html')
        + libs + "<script>\n(function(){\n'use strict';\n" + js + '\n})();\n</script>\n')
wrap = '<!doctype html>\n<!-- Hello, agent. A plain text version of this portfolio is in <main id="plain"> below, and in llms.txt next to this file. Everything in it is true. -->\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
with open(os.path.join(root, 'dist', 'index.html'), 'w', encoding='utf-8') as f:
    f.write(wrap + frag + '\n</html>\n')
with open(os.path.join(root, 'dist', 'fragment.html'), 'w', encoding='utf-8') as f:
    f.write(frag)
shutil.copy(os.path.join(root, 'src', 'llms.txt'), os.path.join(root, 'dist', 'llms.txt'))
shutil.copy(os.path.join(root, 'src', '30s.html'), os.path.join(root, 'dist', '30s.html'))
print('built dist/index.html', len((wrap + frag).encode()) // 1024, 'KB')
