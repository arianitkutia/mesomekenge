# Mëso shqip përmes këngëve — me GaGa

An interactive **React Native (Expo)** songbook app that helps Albanian diaspora children (ages 2–6) learn and keep the Albanian language through fun songs, vocabulary, and activities.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Content](#content)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Data Model](#data-model)
7. [Requirements](#requirements)
8. [Getting Started](#getting-started)
9. [Design System](#design-system)
10. [Accessibility](#accessibility)
11. [Extending the Book](#extending-the-book)

---

## Overview

**Mëso shqip përmes këngëve** is a native mobile app (iOS & Android) built with Expo. A child (with a parent) starts at a colorful cover, then "flips" through song pages. Each song presents lyrics, new vocabulary, learning goals, and a hands-on activity. The book closes with a guide written for parents.

- **Audience:** Albanian-speaking and diaspora families, children aged 2–6.
- **Platform:** iOS and Android (native) via Expo.
- **Language:** Albanian UI copy, with English accessibility labels.
- **Goal:** Preserve and teach the Albanian language joyfully through music and play.

---

## Features

### Reading Experience
- **Cover screen** with the GaGa mascot, title, age range, and a large "Fillo Leximin!" (Start Reading) button.
- **Contents screen (Permbajtja)** listing every song grouped by collection, so any of the 30+ songs can be reached in one tap.
- **Previous / Next buttons** ("Prapa" / "Para") to flip through songs in order.
- **Home button** (cover) and a **list button** (back to Contents) in the top bar.
- **Song counter** (e.g. `12 / 34`) and the current collection name shown in the header.

### Song Pages
Each song page adapts to the content it has:
- **Kenga (Lyrics):** Full song lyrics with key/rhythmic lines highlighted.
- **Shiko videon (Watch video):** Button that opens the song's video (when a link exists).
- **Fjale / Mesojme / Aktivitet:** Vocabulary, learning goals, and an activity — shown **only for songs that have them**; lyrics-only songs skip the tab bar entirely.
- A large illustration, or a per-song **coloured placeholder** when no artwork exists yet.
- Original (English) title shown as a subtitle for adapted songs.

### Parent Guide (Udhezuesi per Prinderit)
- **Why singing helps** child development (memory, pronunciation, confidence).
- **How to use the book** in three simple steps.
- **Suggested weekly routine** (Monday–Friday) of song and activity themes.

### UX Details
- Native scrolling and touch interactions via React Native.
- Safe-area aware layout (notches, home indicators) via `react-native-safe-area-context`.
- Big, rounded, touch-friendly controls suited to small children.

---

## Content

The book contains **34 songs** organized into **4 collections**:

| Collection | Songs |
|------------|-------|
| Shtatë Këngë | 6 |
| Dhjetë Këngë | 8 |
| Pesëmbëdhjetë Këngë | 15 |
| Këngë Viti i Ri | 5 |

Most songs are Albanian adaptations of well-known children's songs (their original titles are kept as subtitles) and link to a video. The lyrics were imported from the source Word documents in [`songs/`](./songs). Four songs carry hand-made illustrations (fruits, instruments, dance, bear); the rest use coloured placeholders until artwork is added.

---

## Tech Stack

- **Framework:** React Native via **Expo** (SDK 54)
- **Language:** TypeScript / React
- **Entry point:** `App.tsx` (registered through `expo`'s `AppEntry`)
- **Navigation:** Local component state (cover → contents → songs → parent guide)
- **Icons:** `@expo/vector-icons` (Ionicons)
- **Safe areas:** `react-native-safe-area-context`
- **Status bar:** `expo-status-bar`
- **Gradients:** `expo-linear-gradient`
- **Styling:** React Native `StyleSheet` with a shared theme (`lib/theme.ts`) — tokens, 8 song palettes, and elevation presets

---

## Project Structure

```
App.tsx                 # Root: state, header/footer navigation, page routing
app.json                # Expo app config (name, icon, splash, platforms)
babel.config.js         # Babel preset for Expo
tsconfig.json           # TypeScript config with "@/*" path alias
components/
  BookCover.tsx         # Cover screen with title + start button
  Contents.tsx          # Table of contents — songs grouped by collection
  SongPage.tsx          # Song view (lyrics + optional words/learn/activity + video)
  ParentGuide.tsx       # Closing guide for parents
lib/
  theme.ts              # Colors, spacing, radius, font sizes + per-song palettes
  book-data.ts          # Song type, all song content, collection grouping
assets/images/
  cover.jpg             # Cover illustration
  icon.png              # App icon / splash / adaptive icon (PNG, required by Expo)
  song-fruits.jpg       # Illustration → Mollët dhe bananet
  song-instruments.jpg  # Illustration → Dyqani muzikor
  song-dance.jpg        # Illustration → Çu-Çu-Ua
  song-bear.jpg         # Illustration → Arushi në mal
songs/                  # Source Word documents the lyrics were imported from
```

---

## Data Model

Songs are defined in `lib/book-data.ts` using the `Song` interface:

```ts
interface Song {
  id: number                                      // Song number (also its order)
  title: string                                   // Song title (Albanian)
  englishTitle?: string                           // Original title, shown as a subtitle
  collection: string                              // Which collection it belongs to
  palette: SongTheme                              // Colour identity key (see songThemes)
  image?: ImageSourcePropType                     // Optional illustration (else placeholder)
  videoUrl?: string                               // Optional "Watch video" link
  lyrics: string[]                                // Lines of the song ("" = blank line)
  highlights?: string[]                           // Lyric fragments to emphasise (chorus/hooks)
  newWords?: { word: string; meaning: string }[]  // Vocabulary cards (optional)
  whatWeLearn?: string[]                          // Learning objectives (optional)
  activity?: string                               // Activity prompt (optional)
}
```

Only `lyrics` and the identity fields are required — a song page shows the Words / Learn / Activity tabs **only when that data exists**, and falls back to a coloured placeholder when there's no `image`. `book-data.ts` also derives a `collections` array (name + song ids) that the Contents screen renders.

> Images use React Native's `require("@/assets/images/...")` so they are bundled with the app.

### Per-song color identity

Rather than carrying raw hex values, each song names a **palette** (`apple`, `instrument`, `movement`, `nature`) defined once in `lib/theme.ts` as `songThemes` and cycled across the songs. Each palette is a `{ tint, soft, accent, onAccent }` set that flows through the whole song page — the number badge, active tabs, lyric highlights, word cards, learn badges, activity box, and the video button all adopt that song's accent, so consecutive songs read as distinct, colorful chapters.

```ts
const songThemes = {
  apple:      { tint, soft, accent, onAccent },  // warm red
  instrument: { tint, soft, accent, onAccent },  // blue
  movement:   { tint, soft, accent, onAccent },  // gold
  nature:     { tint, soft, accent, onAccent },  // green
}
```

---

## Requirements

### Functional
- Display a cover that launches the book.
- Navigate forward/back through all songs and the parent guide.
- Jump directly to any page via dot indicators.
- Show lyrics, vocabulary, learning goals, and an activity for each song.
- Provide a parent-facing guide at the end.
- Return to the cover ("home") from anywhere.

### Non-Functional
- **Native:** Runs as a real iOS/Android app through Expo (Expo Go or a dev/standalone build).
- **Responsive:** Adapts to phone and tablet screen sizes; safe-area aware.
- **Accessible:** Accessible labels on all interactive controls.
- **Offline:** All content and images are bundled — no network, backend, or auth required.
- **Localized:** Albanian UI copy throughout.

### Environment
- **Node.js 20+**
- **Expo CLI** (used via `npx expo`, no global install needed)
- **Expo Go app** on a physical device, or an iOS Simulator / Android Emulator
- No environment variables or third-party integrations required.

---

## Getting Started

> Note: This is a native app. It does **not** run in a web browser preview — use Expo Go or a simulator.

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start the Expo dev server
npx expo start
```

Then:
- **On a phone:** install **Expo Go** (iOS App Store / Google Play) and scan the QR code.
- **iOS Simulator:** press `i` in the terminal (macOS + Xcode required).
- **Android Emulator:** press `a` in the terminal (Android Studio required).

To verify a production bundle compiles:

```bash
npx expo export --platform ios
```

---

## Design System

- **Colors:** Warm cream base with a soft gradient background. **8 curated song palettes** (`songThemes` in `lib/theme.ts`) — each a `{ tint, soft, accent, onAccent, gradient }` set — are cycled across the songs so pages feel distinct. Accent, gradient art bands, badges, tabs, and lyric highlights all derive from the song's palette.
- **Iconography:** Every song carries a **content-matched icon** (fish for the sailor song, paw for animal songs, star, gift, heart …) assigned from its lyrics; icons appear on the home cards and the song hero.
- **Depth:** Shared elevation presets (`shadow.sm / md / lg`) and `expo-linear-gradient` for hero areas, cards, and buttons.
- **Typography:** System fonts, heavy rounded weights, tightened tracking on large titles — friendly and legible for small children and readable copy for parents.
- **Shape & motion:** Generous rounded corners (pill buttons, `radius.xxl` cards) and consistent press feedback (scale + fade) on every tappable surface.
- **Layout:** Gradient-backed safe-area layout with a floating pill header (home / grid) and footer (Prapa · counter · Para).

---

## Accessibility

- `accessibilityLabel`s on every interactive control (start, navigation, home, contents list, song rows, tabs, video).
- High-contrast text on colored backgrounds.
- Large touch targets suited to small children.
- Clear active/selected states on tabs and pressed rows.

---

## Extending the Book

To **add a new song**:
1. Append a new `Song` object to the `songs` array in `lib/book-data.ts` — only `id`, `title`, `collection`, `palette`, and `lyrics` are required.
2. Give it a `collection` name (reuse an existing one to add to that group, or a new name to create a new group in the Contents screen).
3. Optionally add an illustration to `assets/images/` and reference it with `require("@/assets/images/your-image.jpg")` as `image`; otherwise a coloured placeholder is used.
4. The Contents list, navigation, song counter, and per-song coloring update automatically.

To **edit content**: update the relevant fields (`lyrics`, `videoUrl`, `newWords`, `whatWeLearn`, `activity`) in `lib/book-data.ts`.

To **change parent guidance**: edit the content arrays in `components/ParentGuide.tsx`.

To **adjust the look**: tweak colors, spacing, radius, and font sizes in `lib/theme.ts`.
