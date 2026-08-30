# Pamjet e ekranit për App Store

`render.mjs` i ndërton pamjet nga vetë aplikacioni: importon tokenat e dizajnit
(`lib/theme.ts`), përmbajtjen reale të këngëve (`lib/book-data.ts`) dhe fontin
Ionicons, i vendos ekranet brenda një kornize pajisjeje mbi një sfond me titull
dhe i fotografon në rezolucionin e saktë që kërkon App Store Connect.

Kështu nuk ju duhet fare simulator, dhe kur ndryshon aplikacioni mjafton ta
ri-ekzekutoni komandën.

## Ekzekutimi

```
node render.mjs            # përmasat që kërkon App Store (vetëm iPhone)
node render.mjs iphone     # vetëm iPhone
node render.mjs ipad       # iPad, nëse `supportsTablet` rikthehet ndonjëherë
```

Rezultati:

| Dosja | Përmasat | Pse duhet |
|-------|----------|-----------|
| `out/iphone-6.9/` | 1320 × 2868 | i detyrueshëm për çdo aplikacion |
| `out/ipad-13/` | 2064 × 2752 | nuk kërkohet — `supportsTablet` është `false` |

Shtatë pamje për pajisje, të renditura `01`…`07`. Ngarkojini me të njëjtin rend —
pamja e parë është ajo që shfaqet te rezultatet e kërkimit.

## Ndryshimet

- **Titujt dhe ngjyrat e sfondit** — te lista `SCREENS` në fund të `render.mjs`.
- **Cila këngë shfaqet** — konstantja `SONG` (tani `id: 2`, “Detari në det”).
- **Sa larg është rrëshqitur ekrani** — `songScroll` te `DEVICES`, që panelin ta
  kapni të plotë brenda kornizës.
- **Një pajisje e re** — shtoni një hyrje te `DEVICES`; gjithçka është shkruar në
  pikë iOS dhe shkallëzohet vetë.

Miniaturat e YouTube-it shkarkohen një herë te `.cache/` (fillimisht
`maxresdefault`, pastaj `hqdefault`, njësoj si `RemoteThumb`), kështu që
ekzekutimet e mëpasme punojnë edhe pa internet.

## `compose.py` (rruga e vjetër)

Mbetet për rastin kur doni të nisni nga fotografi të vërteta të simulatorit:
vendosini te `raw/` me emrat e `captions.json` dhe ekzekutoni

```
python3 -m venv .venv && .venv/bin/pip install Pillow
.venv/bin/python compose.py
```

Për lansimin nuk ju duhet — `render.mjs` e mbulon të gjithë punën.
