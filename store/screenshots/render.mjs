// Renders App Store screenshots for "Mëso shqip përmes këngëve".
//
// Each screen is a faithful HTML rebuild of the real app screen: it imports the
// actual design tokens (lib/theme.ts), the actual song content (lib/book-data.ts)
// and the actual Ionicons font, laid out at true iOS point sizes. The screen is
// then scaled into a device frame on a captioned gradient and captured at the
// exact resolutions App Store Connect requires.
//
//   iPhone 6.9"  →  1320 × 2868   (out/iphone-6.9/)
//   iPad 13"     →  2064 × 2752   (out/ipad-13/)
//
// Run:  node render.mjs            all devices
//       node render.mjs iphone     one device
import { chromium } from "playwright-core"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, "../..")
const OUT = path.join(HERE, "out")
const CACHE = path.join(HERE, ".cache")
const GEN = path.join(HERE, ".gen")
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

// ---------------------------------------------------------------- app sources

// book-data.ts uses `require("@/assets/...")` for the few bundled illustrations,
// which Node cannot resolve. Rewrite those to plain filenames, then let Node's
// type stripping import the rest of the file verbatim.
fs.mkdirSync(GEN, { recursive: true })
const bookSrc = fs
  .readFileSync(path.join(ROOT, "lib/book-data.ts"), "utf8")
  .replace(/require\("@\/assets\/images\/([^"]+)"\)/g, (_, f) => JSON.stringify(f))
fs.writeFileSync(path.join(GEN, "book-data.ts"), bookSrc)

const { songs } = await import(path.join(GEN, "book-data.ts"))
const { colors, songThemes } = await import(path.join(ROOT, "lib/theme.ts"))

const dataUri = (file, mime) =>
  `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`

const coverImg = dataUri(path.join(ROOT, "assets/images/cover.jpg"), "image/jpeg")
const localImg = (name) => dataUri(path.join(ROOT, "assets/images", name), "image/jpeg")

// Real Ionicons, so every glyph matches the shipped app exactly.
const ICON_DIR = path.join(ROOT, "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons")
const ionFont = dataUri(path.join(ICON_DIR, "Fonts/Ionicons.ttf"), "font/ttf")
const glyphs = JSON.parse(fs.readFileSync(path.join(ICON_DIR, "glyphmaps/Ionicons.json"), "utf8"))
const icon = (name, size, color, extra = "") => {
  const code = glyphs[name]
  if (code == null) throw new Error(`unknown Ionicons glyph: ${name}`)
  return `<span class="ion" style="font-size:${size}px;color:${color};${extra}">&#${code};</span>`
}

// ------------------------------------------------------------- YouTube thumbs

const ytId = (url) => url?.match(/[?&]v=([A-Za-z0-9_-]{11})/)?.[1] ?? null

// RemoteThumb loads maxresdefault and falls back to hqdefault. Do the same here,
// and cache on disk so re-runs work offline.
async function thumbFor(song) {
  if (song.image) return localImg(song.image)
  const id = ytId(song.videoUrl)
  if (!id) return null
  fs.mkdirSync(CACHE, { recursive: true })
  const file = path.join(CACHE, `${id}.jpg`)
  if (!fs.existsSync(file)) {
    for (const kind of ["maxresdefault", "hqdefault"]) {
      const res = await fetch(`https://img.youtube.com/vi/${id}/${kind}.jpg`)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length > 2000) { fs.writeFileSync(file, buf); break }
      }
    }
  }
  if (!fs.existsSync(file)) return null
  return dataUri(file, "image/jpeg")
}

const thumbs = new Map()
for (const song of songs) thumbs.set(song.id, await thumbFor(song))

// -------------------------------------------------------------------- devices

// Everything below is authored in iOS points; Playwright's deviceScaleFactor
// does the upscaling, so 1pt of markup is 1pt on the device.
const DEVICES = {
  "iphone-6.9": {
    stage: [440, 956], dpr: 3, screen: [430, 932], screenW: 322,
    frameRadius: 54, screenRadius: 48, bezel: 6, island: true,
    inset: { top: 62, bottom: 34 },
    capTop: 54, capSize: 30, capLead: 1.16, capWidth: 372, gap: 26,
    cardsShown: 12, songScroll: { words: 96, learn: 96, activity: 214 }, tabScroll: true,
  },
  "ipad-13": {
    stage: [1032, 1376], dpr: 2, screen: [1024, 1366], screenW: 730,
    frameRadius: 30, screenRadius: 18, bezel: 14, island: false,
    inset: { top: 26, bottom: 22 },
    capTop: 92, capSize: 54, capLead: 1.16, capWidth: 860, gap: 48,
    cardsShown: 20, songScroll: { words: 0, learn: 0, activity: 0 }, tabScroll: false,
  },
}

// ------------------------------------------------------------- shared pieces

const shadow = {
  sm: "0 3px 8px rgba(90,70,50,.08)",
  md: "0 6px 14px rgba(90,70,50,.12)",
  lg: "0 10px 22px rgba(90,70,50,.18)",
}
const grad = (from, to) => `linear-gradient(135deg,${from},${to})`

/** App.tsx header: home button, centred title, optional grid button. */
const header = (title, right) => `
  <div class="hdr">
    <div class="iconBtn">${icon("home", 20, colors.foreground)}</div>
    <div class="hdrTitle">${title}</div>
    ${right
      ? `<div class="iconBtn">${icon("grid", 19, colors.foreground)}</div>`
      : `<div class="iconBtn" style="box-shadow:none;background:transparent"></div>`}
  </div>`

/** App.tsx footer: Prapa / counter / Para. */
const footer = (counter, next = "Para") => `
  <div class="ftr">
    <div class="navBtn navSec">${icon("chevron-back", 20, colors.secondaryForeground)}<span>Prapa</span></div>
    ${counter ? `<div class="counter">${counter}</div>` : "<div></div>"}
    <div class="navBtn navPri"><span>${next}</span>${icon("chevron-forward", 20, "#fff")}</div>
  </div>`

/** SongPage tabs — the real tab set, with one marked active. */
const tabBar = (song, active, t, shift = 0) => {
  const tabs = [
    ["lyrics", "Kënga", "musical-notes", true],
    ["words", "Fjalë", "book", (song.newWords?.length ?? 0) > 0],
    ["learn", "Mësojmë", "bulb", (song.whatWeLearn?.length ?? 0) > 0],
    ["activity", "Aktivitet", "color-palette", !!song.activity],
  ].filter(([, , , on]) => on)
  return `<div class="tabWrap"><div class="tabBar" style="margin-left:${-shift}px">${tabs
    .map(([id, label, ic]) => {
      const on = id === active
      return `<div class="tab ${on ? "tabOn" : "tabOff"}" ${on ? `style="background:${t.accent}"` : ""}>
        ${icon(ic, 17, on ? t.onAccent : colors.mutedForeground)}
        <span style="${on ? `color:${t.onAccent}` : ""}">${label}</span>
      </div>`
    })
    .join("")}</div></div>`
}

const panelHeader = (ic, color, label) => `
  <div class="panelHdr">
    <div class="panelHdrIcon" style="background:${color}">${icon(ic, 16, "#fff")}</div>
    <div class="panelTitle">${label}</div>
  </div>`

/** SongPage hero: poster, number badge, play button. */
const hero = (song, t) => {
  const src = thumbs.get(song.id)
  return `<div class="hero">
    <div class="fill" style="background:${grad(...t.gradient)}"></div>
    ${src ? `<img class="fill" src="${src}"/>` : ""}
    <div class="fill" style="background:linear-gradient(180deg,transparent,rgba(0,0,0,.32))"></div>
    <div class="heroBadge" style="color:${t.accent}">${song.id}</div>
    ${song.videoUrl ? `<div class="heroPlay">${icon("play", 30, t.accent, "margin-left:3px")}</div>` : ""}
  </div>`
}

/** Contents.tsx song card. */
const songCard = (song) => {
  const t = songThemes[song.palette]
  const src = thumbs.get(song.id)
  return `<div class="card">
    <div class="cardArt">
      <div class="fill" style="background:${grad(...t.gradient)}"></div>
      ${src
        ? `<img class="fill" src="${src}"/>
           <div class="fill" style="background:linear-gradient(180deg,transparent,rgba(0,0,0,.38))"></div>
           <div class="iconChip" style="background:${t.accent}">${icon(song.icon, 14, "#fff")}</div>`
        : `${icon(song.icon, 38, "#fff", "z-index:1")}`}
      <div class="numBadge">${song.id}</div>
      ${song.videoUrl ? `<div class="videoDot">${icon("play", 11, t.accent)}</div>` : ""}
    </div>
    <div class="cardBody">
      <div class="cardTitle">${song.title}</div>
      ${song.englishTitle ? `<div class="cardSub">${song.englishTitle}</div>` : ""}
    </div>
  </div>`
}

// ------------------------------------------------------------------- screens

const SONG = songs.find((s) => s.id === 2)          // Detari në det — blue palette
const T = songThemes[SONG.palette]

const coverScreen = () => `
  <div class="scr cover">
    <div class="coverHero">
      ${icon("musical-note", 30, songThemes.instrument.accent, "position:absolute;opacity:.55;top:8%;left:14%")}
      ${icon("star", 26, songThemes.movement.accent, "position:absolute;opacity:.55;top:14%;right:16%")}
      ${icon("heart", 22, songThemes.coral.accent, "position:absolute;opacity:.55;top:40%;left:8%")}
      ${icon("musical-notes", 28, songThemes.grape.accent, "position:absolute;opacity:.55;top:44%;right:9%")}
      ${icon("sparkles", 22, songThemes.movement.accent, "position:absolute;opacity:.55;top:2%;right:38%")}
      <div class="haloWrap">
        <div class="halo" style="background:${grad(...songThemes.movement.gradient)}"></div>
        <div class="ring"><img src="${coverImg}"/></div>
      </div>
    </div>
    <div class="coverTitleBlock">
      <div class="coverTitle">Mëso shqip përmes këngëve</div>
      <div class="agePill">${icon("happy", 15, colors.accent)}<span>Mosha 2–6 vjeç</span></div>
    </div>
    <div class="startBtn">${icon("play", 22, "#fff")}<span>Fillo</span></div>
  </div>`

const contentsScreen = (d) => `
  <div class="scr">
    ${header("Këngët", false)}
    <div class="body">
      <div class="banner">
        <div class="blob" style="width:140px;height:140px;top:-50px;right:-30px"></div>
        <div class="blob" style="width:90px;height:90px;bottom:-40px;left:40px"></div>
        <div class="bannerRow">
          <div class="avatar"><img src="${coverImg}"/></div>
          <div>
            <div class="bannerTitle">Përshëndetje!</div>
            <div class="bannerSub">Zgjidh një këngë dhe këndo 🎵</div>
          </div>
        </div>
        <div class="countPill">${icon("musical-notes", 13, "#fff")}<span>${songs.length} këngë</span></div>
      </div>
      <div class="sectionLabel">Të gjitha këngët</div>
      <div class="grid">${songs.slice(0, d.cardsShown).map(songCard).join("")}</div>
    </div>
  </div>`

const songScreenBase = (tab, panel, { scroll = 0, tabShift = 0 } = {}) => `
  <div class="scr">
    ${header(SONG.title, true)}
    <div class="body">
     <div style="margin-top:${-scroll}px">
      ${hero(SONG, T)}
      <div class="titleBlock"><div class="songTitle">${SONG.title}</div></div>
      <div class="videoBtn" style="background:${T.accent}">
        ${icon("play-circle", 24, T.onAccent)}<span style="color:${T.onAccent}">Shiko videon</span>
      </div>
      ${tabBar(SONG, tab, T, tabShift)}
      <div class="panel">${panel}</div>
     </div>
    </div>
    ${footer(`${SONG.id} / ${songs.length}`)}
  </div>`

const lyricsPanel = () => `
  ${panelHeader("musical-notes", T.accent, "Kënga")}
  <div class="lyrics">${SONG.lyrics
    .map((line) => {
      if (line === "") return `<div style="height:12px"></div>`
      const hl = (SONG.highlights ?? []).some((h) => line.includes(h))
      return hl
        ? `<div class="lyricLine"><span class="lyricHl" style="color:${T.accent};background:${T.tint}">${line}</span></div>`
        : `<div class="lyricLine">${line}</div>`
    })
    .join("")}</div>`

const wordsPanel = () => `
  ${panelHeader("book", T.accent, "Fjalë të Reja")}
  <div class="stack16">${SONG.newWords
    .map(
      (w) => `<div class="wordCard" style="background:${T.tint}">
        <div class="wordAccent" style="background:${T.accent}"></div>
        <div style="flex:1">
          <div class="wordTitle" style="color:${T.accent}">${w.word}</div>
          <div class="wordMeaning">${w.meaning}</div>
        </div>
      </div>`
    )
    .join("")}</div>`

const learnPanel = () => `
  ${panelHeader("bulb", T.accent, "Çfarë mësojmë")}
  <div class="stack16">${SONG.whatWeLearn
    .map(
      (item, i) => `<div class="learnRow" style="background:${T.tint}">
        <div class="learnBadge" style="background:${T.accent};color:${T.onAccent}">${i + 1}</div>
        <div class="learnText">${item}</div>
      </div>`
    )
    .join("")}</div>`

const activityPanel = () => `
  ${panelHeader("color-palette", T.accent, "Aktivitet")}
  <div class="activityCard" style="background:${T.tint}">${SONG.activity}</div>
  <div class="canvas" style="border-color:${T.accent}">
    <svg viewBox="0 0 350 220" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
      <path d="M52 160 q28 -60 62 -18 q30 38 62 -6 q26 -36 56 8" stroke="#EF5A54" stroke-width="5"
            fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M74 186 q56 -30 116 -6 q42 17 88 -14" stroke="#3B86C9" stroke-width="5"
            fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="128" cy="74" r="19" stroke="#4CAE52" stroke-width="5" fill="none"/>
      <circle cx="226" cy="86" r="24" stroke="#E8A020" stroke-width="5" fill="none"/>
    </svg>
  </div>
  <div class="toolbar">
    <div class="crayons">${["#37291D", "#EF5A54", "#3B86C9", "#4CAE52", "#E8A020", "#8B5CC7"]
      .map((c) => `<div class="crayon${c === "#3B86C9" ? " crayonOn" : ""}" style="background:${c}"></div>`)
      .join("")}</div>
    <div class="clearBtn">${icon("trash", 16, colors.mutedForeground)}<span>Fshij</span></div>
  </div>`

const parentsScreen = () => {
  const benefits = [
    ["happy", "Forcon kujtesën", "movement"],
    ["volume-high", "Përmirëson shqiptimin", "instrument"],
    ["heart", "Rrit vetëbesimin", "coral"],
  ]
  const steps = ["Lexoni tekstin", "Këndoni bashkë", "Bëni aktivitetin"]
  const weekly = [
    ["E Hënë", "Këngë lëvizjeje"], ["E Martë", "Këngë zanore"], ["E Mërkurë", "Këngë natyre"],
    ["E Enjte", "Aktivitet"], ["E Premte", "Këndim familjar"],
  ]
  const section = (title, inner) =>
    `<div class="stack8"><div class="sectionTitle">${title}</div><div class="stack8">${inner}</div></div>`
  return `
  <div class="scr">
    ${header("Prindërit", false)}
    <div class="body stack24">
      <div class="pgHero" style="background:${grad(...songThemes.nature.gradient)}">
        <div class="pgHeroIcon">${icon("people", 28, "#fff")}</div>
        <div class="pgHeroTitle">Udhëzuesi për Prindërit</div>
        <div class="pgHeroIntro">Mirë se vini në Botën e GaGa! Ky libër ndihmon fëmijët shqiptarë
          në diasporë të ruajnë gjuhën shqipe me gëzim.</div>
      </div>
      ${section("Pse këndimi ndihmon", benefits
        .map(([ic, text, pal]) => {
          const t = songThemes[pal]
          return `<div class="pgCard">
            <div class="pgIconCircle" style="background:${t.tint}">${icon(ic, 22, t.accent)}</div>
            <div class="pgCardText">${text}</div>
          </div>`
        }).join(""))}
      ${section("Si ta përdorni librin", steps
        .map((s, i) => `<div class="pgCard">
            <div class="stepBadge">${i + 1}</div>
            <div class="pgCardText">${s}</div>
          </div>`).join(""))}
      ${section("Rutina Javore e Sugjeruar", `<div class="weekCard">${weekly
        .map(([day, act], i) => `<div class="weekRow${i < weekly.length - 1 ? " weekDivider" : ""}">
            <div class="weekDay">${day}</div><div class="weekAct">${act}</div>
          </div>`).join("")}</div>`)}
    </div>
    ${footer(null, "Fillimi")}
  </div>`
}

const SCREENS = [
  { file: "01-cover", caption: "34 këngë shqip për fëmijë 2–6 vjeç", bg: ["#3B3BE8", "#0001BD"], render: () => coverScreen() },
  { file: "02-kenget", caption: "Zgjidh një këngë dhe këndo", bg: ["#FF8E5E", "#EC6A8C"], render: (d) => contentsScreen(d) },
  { file: "03-kenga", caption: "Shiko videon dhe këndo bashkë", bg: ["#69ABDC", "#3B86C9"], render: () => songScreenBase("lyrics", lyricsPanel()) },
  { file: "04-fjale", caption: "Fjalë të reja në çdo këngë", bg: ["#7BC97F", "#4CAE52"], render: (d) => songScreenBase("words", wordsPanel(), { scroll: d.songScroll.words, tabShift: d.tabScroll ? 24 : 0 }) },
  { file: "05-mesojme", caption: "Çfarë mëson fëmija me secilën këngë", bg: ["#AE85DC", "#8B5CC7"], render: (d) => songScreenBase("learn", learnPanel(), { scroll: d.songScroll.learn, tabShift: d.tabScroll ? 52 : 0 }) },
  { file: "06-aktivitet", caption: "Luaj dhe vizato me gisht", bg: ["#F4C24E", "#E8A020"], render: (d) => songScreenBase("activity", activityPanel(), { scroll: d.songScroll.activity, tabShift: d.tabScroll ? 92 : 0 }) },
  { file: "07-prinderit", caption: "Udhëzues i plotë për prindërit", bg: ["#5FC7BE", "#2FA8A0"], render: () => parentsScreen() },
]

// ----------------------------------------------------------------- page shell

const css = (d) => {
  const [sw, sh] = d.screen
  const scale = d.screenW / sw
  const screenH = Math.round(sh * scale)
  return `
  @font-face { font-family: "Ionicons"; src: url(${ionFont}) format("truetype"); }
  * { margin:0; padding:0; box-sizing:border-box;
      font-family:-apple-system,"SF Pro Text","SF Pro Display",system-ui,"Helvetica Neue",sans-serif;
      -webkit-font-smoothing:antialiased; }
  .ion { font-family:"Ionicons"; font-weight:400; line-height:1; display:inline-block; }
  body { width:${d.stage[0]}px; height:${d.stage[1]}px; overflow:hidden; }

  .stage { width:${d.stage[0]}px; height:${d.stage[1]}px; display:flex; flex-direction:column;
           align-items:center; padding-top:${d.capTop}px; }
  .caption { font-size:${d.capSize}px; line-height:${d.capLead}; font-weight:800; color:#fff;
             text-align:center; max-width:${d.capWidth}px; letter-spacing:-0.4px;
             text-shadow:0 2px 10px rgba(0,0,0,.12); }

  .frame { margin-top:${d.gap}px; width:${d.screenW + d.bezel * 2}px; height:${screenH + d.bezel * 2}px;
           background:#0D0D0F; border-radius:${d.frameRadius}px; padding:${d.bezel}px;
           box-shadow:0 24px 60px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.10) inset; position:relative; }
  .viewport { width:100%; height:100%; border-radius:${d.screenRadius}px; overflow:hidden; position:relative; }
  .island { position:absolute; top:${Math.round(11 * scale)}px; left:50%; transform:translateX(-50%);
            width:${Math.round(125 * scale)}px; height:${Math.round(36 * scale)}px;
            background:#0D0D0F; border-radius:999px; z-index:50; }
  .camera { position:absolute; top:${Math.round(7 * scale)}px; left:50%; transform:translateX(-50%);
            width:7px; height:7px; background:#2A2A2E; border-radius:999px; z-index:50; }
  .scaler { width:${sw}px; height:${sh}px; transform:scale(${scale}); transform-origin:top left; }

  /* ---- App.tsx shell (authored in iOS points) ---- */
  .scr { width:${sw}px; height:${sh}px; display:flex; flex-direction:column;
         background:linear-gradient(180deg,#FFFDF8,#FBF1E2); color:${colors.foreground};
         padding-top:${d.inset.top}px; padding-bottom:${d.inset.bottom}px; }
  .fill { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }

  .hdr { display:flex; align-items:center; justify-content:space-between; gap:12px;
         padding:4px 16px 12px; }
  .iconBtn { width:44px; height:44px; border-radius:999px; background:${colors.card};
             display:flex; align-items:center; justify-content:center; box-shadow:${shadow.sm}; flex:none; }
  .hdrTitle { flex:1; text-align:center; font-size:18px; font-weight:800; color:${colors.foreground}; }

  .body { flex:1; padding:4px 16px 0; overflow:hidden; }
  .stack24 > * + * { margin-top:24px; }
  .stack16 > * + * { margin-top:12px; }
  .stack8  > * + * { margin-top:8px; }

  .ftr { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px 0; }
  .navBtn { display:flex; align-items:center; gap:4px; padding:12px 24px; border-radius:999px;
            box-shadow:${shadow.sm}; font-size:16px; font-weight:800; }
  .navSec { background:${colors.card}; color:${colors.secondaryForeground}; }
  .navPri { background:${colors.primary}; color:#fff; }
  .counter { padding:4px 12px; border-radius:999px; background:${colors.secondary};
             font-size:14px; font-weight:800; color:${colors.mutedForeground}; }

  /* ---- BookCover ---- */
  .cover { align-items:center; justify-content:center; gap:24px; padding-left:24px; padding-right:24px; }
  .coverHero { width:100%; height:340px; display:flex; align-items:center; justify-content:center; position:relative; }
  .haloWrap { width:260px; height:260px; display:flex; align-items:center; justify-content:center; position:relative; }
  .halo { position:absolute; width:260px; height:260px; border-radius:999px; opacity:.28; transform:scale(1.12); }
  .ring { width:260px; height:260px; border-radius:999px; padding:8px; background:${colors.card}; box-shadow:${shadow.lg}; }
  .ring img { width:100%; height:100%; border-radius:999px; object-fit:cover; }
  .coverTitleBlock { display:flex; flex-direction:column; align-items:center; gap:8px; }
  .coverTitle { font-size:33px; line-height:39px; font-weight:800; text-align:center; letter-spacing:-0.5px; }
  .agePill { display:flex; align-items:center; gap:4px; margin-top:4px; padding:4px 12px; border-radius:999px;
             background:${colors.card}; box-shadow:${shadow.sm}; font-size:14px; font-weight:700; }
  .startBtn { display:flex; align-items:center; gap:8px; padding:16px 32px; border-radius:999px;
              background:${grad(colors.primary, "#3E9A44")}; color:#fff; font-size:20px; font-weight:800;
              box-shadow:${shadow.md}; }

  /* ---- Contents ---- */
  .banner { border-radius:28px; padding:16px; overflow:hidden; position:relative; margin-bottom:16px;
            background:${grad("#FF8E5E", "#EC6A8C")}; box-shadow:${shadow.md}; }
  .blob { position:absolute; border-radius:999px; background:rgba(255,255,255,.14); }
  .bannerRow { display:flex; align-items:center; gap:12px; position:relative; }
  .avatar { width:56px; height:56px; border-radius:999px; padding:3px; background:rgba(255,255,255,.9);
            box-shadow:${shadow.sm}; flex:none; }
  .avatar img { width:100%; height:100%; border-radius:999px; object-fit:cover; }
  .bannerTitle { font-size:24px; font-weight:800; color:#fff; letter-spacing:-0.3px; }
  .bannerSub { font-size:14px; color:rgba(255,255,255,.92); margin-top:1px; }
  .countPill { display:inline-flex; align-items:center; gap:5px; margin-top:12px; padding:4px 12px;
               border-radius:999px; background:rgba(255,255,255,.22); font-size:14px; font-weight:800;
               color:#fff; position:relative; }
  .sectionLabel { font-size:18px; font-weight:800; margin-bottom:12px; }
  .grid { display:flex; flex-wrap:wrap; gap:12px; }
  .card { width:48%; border-radius:20px; background:${colors.card}; overflow:hidden; box-shadow:${shadow.md}; }
  .cardArt { height:118px; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .iconChip { position:absolute; bottom:8px; left:8px; width:26px; height:26px; border-radius:999px;
              display:flex; align-items:center; justify-content:center; box-shadow:${shadow.sm}; }
  .numBadge { position:absolute; top:8px; left:8px; min-width:26px; height:26px; padding:0 7px;
              border-radius:999px; background:rgba(255,255,255,.30); color:#fff; font-size:14px; font-weight:800;
              display:flex; align-items:center; justify-content:center; }
  .videoDot { position:absolute; top:8px; right:8px; width:24px; height:24px; border-radius:999px;
              background:${colors.card}; display:flex; align-items:center; justify-content:center; box-shadow:${shadow.sm}; }
  .cardBody { padding:12px; min-height:62px; }
  .cardTitle { font-size:16px; line-height:20px; font-weight:800; }
  .cardSub { font-size:12px; color:${colors.mutedForeground}; margin-top:2px; }

  /* ---- SongPage ---- */
  .hero { width:100%; aspect-ratio:16/9; border-radius:28px; overflow:hidden; position:relative;
          background:${colors.secondary}; box-shadow:${shadow.md}; }
  .heroBadge { position:absolute; top:12px; left:12px; min-width:34px; height:34px; padding:0 8px;
               border-radius:999px; background:${colors.card}; font-size:18px; font-weight:800;
               display:flex; align-items:center; justify-content:center; box-shadow:${shadow.sm}; }
  .heroPlay { position:absolute; top:50%; left:50%; margin:-32px 0 0 -32px; width:64px; height:64px;
              border-radius:999px; background:rgba(255,255,255,.92); display:flex; align-items:center;
              justify-content:center; box-shadow:${shadow.md}; }
  .titleBlock { margin-top:16px; }
  .songTitle { font-size:24px; font-weight:800; letter-spacing:-0.3px; }
  .videoBtn { margin-top:16px; display:flex; align-items:center; justify-content:center; gap:8px;
              padding:12px; border-radius:999px; font-size:18px; font-weight:800; box-shadow:${shadow.sm}; }
  .tabWrap { overflow:hidden; margin-top:16px; }
  .tabBar { display:flex; gap:8px; padding:4px 0; }
  .tab { display:flex; align-items:center; gap:4px; padding:8px 16px; border-radius:999px;
         font-size:14px; font-weight:800; color:${colors.mutedForeground}; white-space:nowrap; }
  .tabOff { background:${colors.card}; box-shadow:${shadow.sm}; }
  .panel { margin-top:16px; background:${colors.card}; border-radius:28px; padding:24px;
           min-height:200px; box-shadow:${shadow.sm}; }
  .panelHdr { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
  .panelHdrIcon { width:30px; height:30px; border-radius:999px; display:flex; align-items:center; justify-content:center; }
  .panelTitle { font-size:18px; font-weight:800; }
  .lyrics > * + * { margin-top:4px; }
  .lyricLine { font-size:18px; line-height:30px; }
  .lyricHl { font-weight:800; border-radius:8px; padding:2px 8px; display:inline-block; }
  .wordCard { display:flex; align-items:center; gap:12px; border-radius:16px; padding:16px; }
  .wordAccent { width:5px; align-self:stretch; border-radius:999px; }
  .wordTitle { font-size:20px; font-weight:800; }
  .wordMeaning { font-size:16px; color:${colors.mutedForeground}; margin-top:2px; }
  .learnRow { display:flex; align-items:center; gap:12px; border-radius:16px; padding:16px; }
  .learnBadge { width:32px; height:32px; border-radius:999px; display:flex; align-items:center;
                justify-content:center; font-size:14px; font-weight:800; flex:none; }
  .learnText { flex:1; font-size:16px; line-height:22px; }
  .activityCard { border-radius:16px; padding:16px; font-size:18px; line-height:26px; margin-top:12px; }
  .canvas { margin-top:12px; width:100%; height:220px; border-radius:20px; border:2px dashed;
            background:#fff; overflow:hidden; }
  .toolbar { margin-top:12px; display:flex; align-items:center; justify-content:space-between; }
  .crayons { display:flex; gap:8px; }
  .crayon { width:28px; height:28px; border-radius:999px; border:2px solid #fff; }
  .crayonOn { border-color:${colors.foreground}; transform:scale(1.18); }
  .clearBtn { display:flex; align-items:center; gap:4px; padding:8px 12px; border-radius:999px;
              background:${colors.secondary}; font-size:14px; font-weight:700; color:${colors.mutedForeground}; }

  /* ---- ParentGuide ---- */
  .pgHero { border-radius:28px; padding:24px; display:flex; flex-direction:column; align-items:center;
            gap:8px; box-shadow:${shadow.md}; }
  .pgHeroIcon { width:56px; height:56px; border-radius:999px; background:rgba(255,255,255,.25);
                display:flex; align-items:center; justify-content:center; }
  .pgHeroTitle { font-size:24px; font-weight:800; color:#fff; text-align:center; }
  .pgHeroIntro { font-size:16px; line-height:22px; color:rgba(255,255,255,.92); text-align:center; }
  .sectionTitle { font-size:18px; font-weight:800; }
  .pgCard { display:flex; align-items:center; gap:16px; background:${colors.card}; border-radius:16px;
            padding:16px; box-shadow:${shadow.sm}; }
  .pgIconCircle { width:48px; height:48px; border-radius:999px; display:flex; align-items:center;
                  justify-content:center; flex:none; }
  .pgCardText { flex:1; font-size:16px; font-weight:700; }
  .stepBadge { width:44px; height:44px; border-radius:999px; background:${colors.accent}; color:#fff;
               font-size:18px; font-weight:800; display:flex; align-items:center; justify-content:center; flex:none; }
  .weekCard { background:${colors.card}; border-radius:16px; padding:0 16px; box-shadow:${shadow.sm}; }
  .weekRow { display:flex; align-items:center; justify-content:space-between; padding:12px 0; }
  .weekDivider { border-bottom:1px solid ${colors.border}; }
  .weekDay { font-size:16px; font-weight:800; color:${colors.primary}; }
  .weekAct { font-size:16px; }
`
}

const page = (d, s) => `<!doctype html><html lang="sq"><head><meta charset="utf-8">
<style>${css(d)}
  .stage { background:linear-gradient(160deg,${s.bg[0]},${s.bg[1]}); }
</style></head><body>
  <div class="stage">
    <div class="caption">${s.caption}</div>
    <div class="frame">
      <div class="viewport">
        ${d.island ? `<div class="island"></div>` : `<div class="camera"></div>`}
        <div class="scaler">${s.render(d)}</div>
      </div>
    </div>
  </div>
</body></html>`

// ----------------------------------------------------------------------- run

const only = process.argv[2]
const targets = Object.entries(DEVICES).filter(([k]) => !only || k.includes(only))
if (!targets.length) { console.error(`no device matches "${only}"`); process.exit(1) }

const browser = await chromium.launch({ executablePath: CHROME })
try {
  for (const [key, d] of targets) {
    const dir = path.join(OUT, key)
    fs.rmSync(dir, { recursive: true, force: true })
    fs.mkdirSync(dir, { recursive: true })
    const ctx = await browser.newContext({
      viewport: { width: d.stage[0], height: d.stage[1] },
      deviceScaleFactor: d.dpr,
    })
    const pg = await ctx.newPage()
    for (const s of SCREENS) {
      await pg.setContent(page(d, s), { waitUntil: "load" })
      await pg.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map(
        (i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r }))
      )]))
      await pg.screenshot({ path: path.join(dir, `${s.file}.png`) })
    }
    await ctx.close()
    console.log(`  ${key}: ${SCREENS.length} × ${d.stage[0] * d.dpr}×${d.stage[1] * d.dpr}  → out/${key}/`)
  }
} finally {
  await browser.close()
  fs.rmSync(GEN, { recursive: true, force: true })
}
