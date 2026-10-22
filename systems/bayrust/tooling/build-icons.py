# Draws the six most-used command icons as vector art: a continuous-corner squircle (superellipse, exponent tuned
# so its top edge turns opaque at x=22 as the originals do), the gradient read off each original, and a glyph built
# from curves rather than traced from pixels. Colours come from sampling the originals, not from the eye.
import math, os, sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
S, N = 108.0, 4.8

def squircle():
    pts = []
    for i in range(0, 192, 8):
        t = 2 * math.pi * i / 192
        c, s = math.cos(t), math.sin(t)
        pts.append((S/2 + math.copysign(abs(c)**(2/N), c)*S/2, S/2 + math.copysign(abs(s)**(2/N), s)*S/2))
    n = len(pts)
    d = f'M{pts[0][0]:.2f} {pts[0][1]:.2f}'
    for i in range(n):
        p0, p1, p2, p3 = pts[(i-1) % n], pts[i], pts[(i+1) % n], pts[(i+2) % n]
        c1 = (p1[0] + (p2[0]-p0[0])/6, p1[1] + (p2[1]-p0[1])/6)
        c2 = (p2[0] - (p3[0]-p1[0])/6, p2[1] - (p3[1]-p1[1])/6)
        d += f' C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}'
    return d + 'Z'

SQ = squircle()

def icon(name, top, bot, body, extra_defs=''):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108" role="img" aria-label="{name}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bot}"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>{extra_defs}
  </defs>
  <path d="{SQ}" fill="url(#bg)"/>
  <path d="{SQ}" fill="url(#sheen)"/>
{body}
  <path d="{SQ}" fill="none" stroke="#000" stroke-opacity=".10" stroke-width="1"/>
</svg>
'''
    open(os.path.join(OUT, name + '.svg'), 'w').write(svg)
    return len(svg)

sizes = {}

# ---- clipboard history: a card, its clip, and three rows of dot + bar
rows = '\n'.join(
    f'    <circle cx="35" cy="{y}" r="4.2" fill="#c0c0c0"/>'
    f'<rect x="45" y="{y-3.6:.1f}" width="{w}" height="7.2" rx="3.6" fill="#c0c0c0"/>'
    for y, w in ((45, 29), (59, 24), (73, 29)))
sizes['extension-clipboard-history'] = icon('extension-clipboard-history', '#ff8d23', '#ff7a00', f'''  <g>
    <rect x="19" y="21" width="70" height="68" rx="13" fill="#fff"/>
    <rect x="40" y="14" width="28" height="15" rx="7.5" fill="#c9c9c9"/>
    <rect x="44" y="18" width="20" height="7" rx="3.5" fill="#ededed"/>
{rows}
  </g>''')

# ---- snippets: a card with lines, two of them accented
sizes['extension-snippets'] = icon('extension-snippets', '#00beff', '#00abff', '''  <g>
    <rect x="19" y="19" width="70" height="70" rx="14" fill="#f7f7f7"/>
    <rect x="30" y="32" width="24" height="7" rx="3.5" fill="#8a8a8a"/>
    <rect x="30" y="46" width="44" height="7" rx="3.5" fill="#1990f4"/>
    <rect x="30" y="59" width="34" height="6.5" rx="3.25" fill="#cfcfcf"/>
    <rect x="30" y="70" width="18" height="7" rx="3.5" fill="#1990f4"/>
  </g>''')

# ---- file search: folder, a tag on its back panel, and a magnifier
sizes['extension-file-search'] = icon('extension-file-search', '#4d85ff', '#437bfa', '''  <g>
    <path d="M18 34a7 7 0 0 1 7-7h17l7 8h36a7 7 0 0 1 7 7v24H18Z" fill="#c9d8f6"/>
    <rect x="57" y="28" width="26" height="9" rx="4.5" fill="#19c343"/>
    <path d="M18 44h72v38a7 7 0 0 1-7 7H25a7 7 0 0 1-7-7Z" fill="#f4f8fe"/>
    <circle cx="48" cy="62" r="13.5" fill="#eaf1fd" stroke="#4d85ff" stroke-width="6"/>
    <path d="M58.5 72.5 69 83" stroke="#4d85ff" stroke-width="7" stroke-linecap="round"/>
  </g>''')

# ---- emoji picker: the four marks, on the light body
sizes['extension-emoji-picker'] = icon('extension-emoji-picker', '#fcfcfc', '#f0f1f3', '''  <g>
    <rect x="20" y="20" width="32" height="32" rx="10" fill="#ff221f"/>
    <path d="M36 45c-6-4.4-9.5-7.6-9.5-11.6a5.2 5.2 0 0 1 9.5-3 5.2 5.2 0 0 1 9.5 3c0 4-3.5 7.2-9.5 11.6Z" fill="#fff"/>
    <circle cx="72" cy="36" r="16" fill="#f89d00"/>
    <path d="m36 56 4.1 8.6 9.4 1.3-6.8 6.7 1.6 9.4-8.3-4.5-8.3 4.5 1.6-9.4-6.8-6.7 9.4-1.3Z" fill="#fab640"/>
    <ellipse cx="65" cy="71" rx="5.2" ry="8.4" fill="#131313"/>
    <ellipse cx="81" cy="71" rx="5.2" ry="8.4" fill="#131313"/>
  </g>''')

# ---- browser: the address pill and a globe
sizes['extension-browser'] = icon('extension-browser', '#0087de', '#0070d6', '''  <g>
    <rect x="31" y="19" width="46" height="12" rx="6" fill="#86c9ef"/>
    <g fill="none" stroke="#fbfbfb" stroke-width="5.5">
      <circle cx="54" cy="63" r="22"/>
      <ellipse cx="54" cy="63" rx="9.5" ry="22"/>
      <path d="M33 56h42M33 70h42" stroke-linecap="round"/>
    </g>
  </g>''')

# ---- calculator: four keys, the last one accented
keys = []
for (cx, cy, dark, glyph) in ((34, 38, True, 'plus'), (74, 38, False, 'minus'), (34, 74, False, 'times'), (74, 74, None, 'equals')):
    fill = '#443930' if dark else ('#f89d00' if dark is None else '#f3f2f1')
    ink = '#f3f2f1' if dark else '#443930'
    keys.append(f'    <circle cx="{cx}" cy="{cy}" r="17.5" fill="{fill}"/>')
    if glyph == 'plus':
        keys.append(f'    <path d="M{cx-8} {cy}h16M{cx} {cy-8}v16" stroke="{ink}" stroke-width="4.6" stroke-linecap="round"/>')
    elif glyph == 'minus':
        keys.append(f'    <path d="M{cx-8} {cy}h16" stroke="{ink}" stroke-width="4.6" stroke-linecap="round"/>')
    elif glyph == 'times':
        keys.append(f'    <path d="M{cx-6} {cy-6} {cx+6} {cy+6}M{cx+6} {cy-6} {cx-6} {cy+6}" stroke="{ink}" stroke-width="4.6" stroke-linecap="round"/>')
    else:
        keys.append(f'    <path d="M{cx-8} {cy-3.6}h16M{cx-8} {cy+3.6}h16" stroke="{ink}" stroke-width="4.2" stroke-linecap="round"/>')
sizes['extension-calculator'] = icon('extension-calculator', '#7a6e5a', '#786a53', '  <g>\n' + '\n'.join(keys) + '\n  </g>')

for n, b in sizes.items():
    png = next((f for f in os.listdir('reference/frontend') if f.startswith(n + '_large-')), None)
    pb = os.path.getsize(os.path.join('reference/frontend', png)) if png else 0
    print(f'  {n:30} svg={b/1024:5.1f}KB   png={pb/1024:5.1f}KB')
print(f'\n{len(sizes)} icons written to {OUT}')
