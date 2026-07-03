# App Store screenshots

Turn raw simulator captures into polished, captioned App Store images.

## Workflow
1. Capture raw screenshots in the iOS Simulator (⌘S, or
   `xcrun simctl io booted screenshot ~/Desktop/01-cover.png`).
2. Drop them into **`raw/`**, named to match `captions.json`:
   - `01-cover.png` · `02-home.png` · `03-song.png` · `04-words.png` · `05-activity.png` · `06-parents.png`
3. Run the compositor:
   ```
   python3 -m venv .venv && .venv/bin/pip install Pillow    # first time only
   .venv/bin/python compose.py
   ```
4. Framed, captioned images appear in **`out/`** at the same resolution as the input
   (iPhone shots stay iPhone-sized, iPad shots stay iPad-sized — both App Store ready).

Preview the style without real screenshots: `python compose.py --demo` → `out/_demo.png`.

## Notes
- Captions and per-screen background gradients live in `captions.json` — edit freely.
- Capture once on a **6.9" iPhone** (e.g. iPhone 16 Pro Max → 1320×2868) and once on a
  **13" iPad** (e.g. iPad Pro 13" → 2064×2752). Reuse the same `raw/` filenames per device
  and run `compose.py` for each set.
- Minimum 3 screenshots per device; up to 10.
