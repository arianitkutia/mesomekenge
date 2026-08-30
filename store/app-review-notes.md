# App Review Information — reply to Guideline 2.1 (Information Needed)

Paste sections 1–7 below into **App Store Connect → App Review Information → Notes**,
and reply to the review message with the same text. Everything marked `‹…›` is
information only you can supply.

> **Before replying, do these three things:**
> 1. Record the screen capture described in §1 on a physical iPhone.
> 2. Fill in every `‹…›` placeholder.
> 3. Read “Open issues” at the bottom — §7 is the part that can get this rejected again.

---

## 1. Screen recording

`‹Attach the recording. Apple wants it captured on a physical device running the latest
iOS, starting from app launch.›`

**Shot list — record in this order, roughly 90 seconds total:**

| # | What to show | Notes |
|---|---|---|
| 1 | Tap the app icon on the Home Screen | The recording must start with the launch, not mid-app |
| 2 | Cover screen → tap **Fillo** | No login, no age gate, no permission prompt appears |
| 3 | Song list — scroll through the full grid | Shows all 34 songs |
| 4 | Tap a song (e.g. #2 “Detari në det”) | Song page opens |
| 5 | Tap **Shiko videon** — let the video play ~10 s, then close it | This is the only networked feature |
| 6 | Tab **Fjalë** → **Mësojmë** → **Aktivitet** | Vocabulary, learning goals, activity |
| 7 | Draw on the canvas with a finger, change crayon colour, tap **Fshij** | Purely local; nothing is uploaded or saved off-device |
| 8 | Tap **Prapa** / **Para** to move between songs | Navigation |
| 9 | Home button → **Udhëzuesi për Prindërit** | Parent guide |
| 10 | Turn on Airplane Mode and reopen a song | Proves lyrics, words, activities and drawing work offline |

**Flows Apple asked about that do not exist in this app** — please state this explicitly
in the reply:

- No account registration, login, or account deletion — the app has no accounts at all.
- No paid content, in-app purchases, or subscriptions — the app is entirely free.
- No user-generated content, and therefore no reporting or blocking mechanisms. The
  drawing canvas is local to the device, is never uploaded, and is cleared when the song
  page is left.
- No permission prompts. The app requests no location, contacts, camera, microphone,
  photo, notification, or App Tracking Transparency access. The `Info.plist` contains no
  usage-description strings because no protected capability is used.

---

## 2. Devices and operating systems tested

```
Physical device:
• iPhone 15 Pro Max — iOS 26.6

Minimum supported version: iOS 15.1 (Expo SDK 54 / React Native 0.81).
```

## 3. What the app does and who it is for

```
"Mëso shqip përmes këngëve" ("Learn Albanian Through Songs") is a free, offline-first
songbook that helps children aged 2–6 learn the Albanian language through singing.

Problem it solves: Albanian families living outside Albania and Kosovo — the diaspora in
Germany, Switzerland, Italy, the UK, the US and elsewhere — struggle to pass the language
on to children who grow up speaking the local language at school. Age-appropriate
Albanian learning material for preschoolers is scarce.

Target audience: parents, grandparents and preschool teachers of Albanian-speaking
children aged 2–6. The adult chooses the song; the child sings, learns words and draws.

What it provides: 34 Albanian children's songs. Each song has full lyrics with the chorus
highlighted, an accompanying video, a list of new words with simple explanations, a set of
learning goals ("Çfarë mësojmë"), a hands-on activity, and a finger-drawing canvas. A
Parent Guide explains why singing helps language development, how to use the book step by
step, and offers a suggested weekly routine.

The app is free, contains no advertising, no accounts, no in-app purchases, no analytics
and no tracking.
```

---

## 4. How to set up and reach every feature

```
No setup, no credentials and no sample files are required. The app opens straight into
its content.

1. Launch the app. The cover screen appears — tap "Fillo" (Start).
2. The song list appears with all 34 songs as cards. Tap any card to open that song.
3. On a song page:
   • "Shiko videon" (Watch the video) plays the song's video inside the app.
   • Tab "Kënga" — full lyrics.
   • Tab "Fjalë" — new vocabulary with explanations.
   • Tab "Mësojmë" — the learning goals for that song.
   • Tab "Aktivitet" — a suggested activity plus a drawing canvas. Draw with a finger,
     pick a colour from the six crayons, tap "Fshij" to clear.
   • "Prapa" / "Para" at the bottom move between songs.
4. The house icon in the top-left returns to the cover; the grid icon in the top-right
   returns to the song list.
5. From the song list, scroll to the bottom and tap "Udhëzuesi për Prindërit" to open the
   Parent Guide.

The interface is in Albanian because that is the language being taught. The navigation is
icon-based and only four labels are needed to review it: Fillo = Start, Kënga = Song,
Fjalë = Words, Mësojmë = We learn, Aktivitet = Activity.
```

---

## 5. External services, tools and platforms

```
The app uses exactly one external service:

• YouTube — song videos are streamed through the embedded YouTube IFrame player
  (react-native-youtube-iframe inside react-native-webview), and song artwork uses
  YouTube thumbnail images from img.youtube.com. This is the only network request the
  app makes.

The app does NOT use:
• any authentication or identity service — there are no accounts
• any payment processor — the app is free and has no in-app purchases
• any analytics, crash-reporting, attribution or advertising SDK
• any AI or machine-learning service
• any backend server, database or API of our own
• any data provider or third-party content feed other than YouTube

Everything else — lyrics, vocabulary, learning goals, activities, the Parent Guide and the
drawing canvas — is bundled in the app binary and works with no network connection.

Expo and EAS are used only as build tooling; they are not part of the running app.
```

---

## 6. Regional differences

```
The app functions identically in all regions. There is no geo-detection, no region gating,
no regional pricing (the app is free everywhere) and no region-specific content. All 34
songs and all text are the same for every user, in Albanian.

The one caveat outside our control: the song videos are streamed from YouTube, and YouTube
may restrict an individual video in a particular country at the rights holder's request.
If that happens, only the video is affected — the lyrics, vocabulary, learning goals,
activities and drawing canvas for that song continue to work normally, including offline.
```

---

## 7. Rights to the songs and video content

```
All 34 song videos in the app are embedded from the YouTube channel
"Ga Ga - Këngë për fëmijë" (https://www.youtube.com/@GaGa-Këngëpërfëmijë), which is owned
and operated by us, Alternative Education LLC. No video from any other channel is used.

The Albanian songs are our own adaptations of children's programs originally produced in
English, licensed to us by SC TRALALA STUDIO SRL (Romania) — the producer behind the
LooLoo Kids catalogue — under Program Distribution Agreement No. 118 of 26 October 2020.
The agreement and its amendments list the licensed programs in Exhibit B. Deed of
Amendment no. 4, dated 28 June 2023 and signed by both parties, is attached. The Albanian
lyrics were written by our team and the animation is produced by our studio.

Videos are played through YouTube's official embedded IFrame player, as permitted by the
YouTube Terms of Service. No video is downloaded, re-hosted, cached or redistributed by
the app, and no advertising is removed from it. Song artwork uses the standard YouTube
thumbnail images for the same videos.

The cover artwork and the GaGa character are our own property.

The app is not in a regulated industry. It collects no personal data, has no accounts and
is aimed at families; it is submitted under Education, not the Kids Category.
```

**Attach as documentation:**
1. `Amendment 4- Alternative Ed..pdf` — Deed of Amendment no. 4, signed by both parties.
2. **The base agreement, No. 118 / 26.10.2020, and amendments 1–3.** These are not in
   `documents/` and Amendment 4 alone does not contain the grant of rights — it only adds
   41 programs to Exhibit B and refers back to the base agreement for everything else.
   Apple asked you to *demonstrate you are authorized*; the base agreement is where that
   authorization actually lives.
3. Evidence that the Ga Ga channel is yours: a YouTube Studio screenshot showing the
   channel under your account, or https://gaga.al/rreth/ which names your team.

---

# Before you reply

### A. The licence documents are not attached yet — this is the blocker
The screen recordings are uploaded, but the agreement is not. Question 7 is the whole
reason this came back: Apple asked you to *demonstrate you are authorized* to use
protected third-party material, and right now the reply would assert a licence with
nothing behind it.

Attach, in this order:
1. **Program Distribution Agreement No. 118 / 26.10.2020** — the base agreement. This is
   the one that actually grants the rights. Without it the others prove nothing on their
   own.
2. Amendments 1–3.
3. `Amendment 4- Alternative Ed..pdf`, already in `documents/`.

If you cannot locate the base agreement, request a copy from SC TRALALA STUDIO SRL before
replying. Answering question 7 with only Amendment 4 invites the same rejection a second
time.

### B. Two third-party songs were removed
The previous build embedded two videos published directly by the LooLoo Kids channel —
#7 “Përgatitja e kekut” and #16 “Zigalu”. Your licence covers Ga Ga's own Albanian
productions; embedding LooLoo's original English uploads is a separate question you would
have had to defend. Both songs have been removed, so the app now ships 34 songs, all from
your own channel. The remaining songs were renumbered 1–34 so the badges have no gaps, and
every “36” in the store copy, the site and the screenshot captions became 34.

Verified with the YouTube oEmbed API: all 34 remaining videos report
`Ga Ga - Këngë për fëmijë` as the author.

### C. Physical-device testing
`eas.json` only defines simulator builds for the `development` and `preview` profiles.
Apple states plainly that they review on physical devices. Install the production build on
a real iPhone via TestFlight before you reply, and list it in §2 — otherwise you are answering a question about testing you have not actually done.

### D. Screenshot 1 is a risk under Guideline 2.3.3
Apple's own “common issues” note in the rejection says screenshots must show the app in
use and “not merely the title art, login page, or splash screen.” Screenshot `01-cover.png`
is the cover screen — real app UI, but it reads as title art. Reorder the uploads so
`02-kenget.png` (the song grid) is first, and either drop the cover shot or move it to the
end. Change the order in App Store Connect; no re-render is needed.

### E. New build required
Removing the two songs changes the binary, so this needs a fresh build and a new build
number. `eas.json` has `autoIncrement: true` on the production profile with
`appVersionSource: "local"`, so EAS bumps `buildNumber` in `app.json` for you — do not
edit it by hand.
