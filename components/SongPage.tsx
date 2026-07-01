import { useState, useCallback } from "react"
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import YoutubePlayer from "react-native-youtube-iframe"
import { Ionicons } from "@expo/vector-icons"
import type { Song } from "@/lib/book-data"
import { DrawingCanvas } from "@/components/DrawingCanvas"
import { RemoteThumb } from "@/components/RemoteThumb"
import { youTubeId } from "@/lib/video"
import { colors, radius, spacing, fontSize, shadow, songThemes } from "@/lib/theme"

type Tab = "lyrics" | "words" | "learn" | "activity"

const TABS: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "lyrics", label: "Kënga", icon: "musical-notes" },
  { id: "words", label: "Fjalë", icon: "book" },
  { id: "learn", label: "Mësojmë", icon: "bulb" },
  { id: "activity", label: "Aktivitet", icon: "color-palette" },
]

// Hero spans the screen width minus the app's horizontal padding (spacing.lg each side).
const HERO_W = Math.round(Dimensions.get("window").width - spacing.lg * 2)
const HERO_H = Math.round((HERO_W * 9) / 16)

export function SongPage({ song }: { song: Song }) {
  const t = songThemes[song.palette]

  const tabs = TABS.filter((tab) => {
    if (tab.id === "lyrics") return true
    if (tab.id === "words") return (song.newWords?.length ?? 0) > 0
    if (tab.id === "learn") return (song.whatWeLearn?.length ?? 0) > 0
    if (tab.id === "activity") return !!song.activity
    return false
  })

  const [activeTab, setActiveTab] = useState<Tab>("lyrics")
  const [playing, setPlaying] = useState(false)

  const videoId = song.videoUrl ? youTubeId(song.videoUrl) : null

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") setPlaying(false)
  }, [])

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero — shows the inline video player once the child taps Play */}
      <View style={[styles.hero, shadow.md]}>
        {playing && videoId ? (
          <>
            <YoutubePlayer
              height={HERO_H}
              width={HERO_W}
              play={playing}
              videoId={videoId}
              onChangeState={onStateChange}
              initialPlayerParams={{ modestbranding: true, rel: false, controls: true }}
              webViewProps={{ allowsInlineMediaPlayback: true, mediaPlaybackRequiresUserAction: false }}
              webViewStyle={styles.player}
            />
            <Pressable
              onPress={() => setPlaying(false)}
              accessibilityRole="button"
              accessibilityLabel="Mbyll videon"
              style={styles.closeBtn}
              hitSlop={8}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </>
        ) : (
          <>
            {/* Fallback shown until the thumbnail loads (or offline) */}
            <LinearGradient colors={t.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Ionicons name={song.icon} size={200} color="#FFFFFF" style={styles.heroWatermark} />
            {song.image ? (
              <Image source={song.image} style={StyleSheet.absoluteFill as any} resizeMode="cover" accessibilityLabel={song.title} />
            ) : song.videoUrl ? (
              <RemoteThumb videoUrl={song.videoUrl} accessibilityLabel={song.title} />
            ) : null}
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.32)"]} style={StyleSheet.absoluteFill} />
            <View style={styles.heroBadge}>
              <Text style={[styles.heroBadgeText, { color: t.accent }]}>{song.id}</Text>
            </View>
            {videoId ? (
              <Pressable
                onPress={() => setPlaying(true)}
                accessibilityRole="button"
                accessibilityLabel={`Luaj videon: ${song.title}`}
                style={styles.heroPlay}
                hitSlop={8}
              >
                <Ionicons name="play" size={30} color={t.accent} style={{ marginLeft: 3 }} />
              </Pressable>
            ) : (
              <View style={styles.heroChip}>
                <Ionicons name={song.icon} size={16} color="#FFFFFF" />
              </View>
            )}
          </>
        )}
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{song.title}</Text>
        {song.englishTitle ? <Text style={styles.subtitle}>{song.englishTitle}</Text> : null}
      </View>

      {/* Watch / close video */}
      {videoId ? (
        <Pressable
          onPress={() => setPlaying((p) => !p)}
          accessibilityRole="button"
          accessibilityLabel={playing ? "Mbyll videon" : `Shiko videon: ${song.title}`}
          style={({ pressed }) => [styles.videoBtn, { backgroundColor: t.accent }, pressed && styles.pressed]}
        >
          <Ionicons name={playing ? "close-circle" : "play-circle"} size={24} color={t.onAccent} />
          <Text style={[styles.videoBtnText, { color: t.onAccent }]}>{playing ? "Mbyll videon" : "Shiko videon"}</Text>
        </Pressable>
      ) : null}

      {/* Tabs */}
      {tabs.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.tab, active ? { backgroundColor: t.accent } : styles.tabInactive]}
              >
                <Ionicons name={tab.icon} size={17} color={active ? t.onAccent : colors.mutedForeground} />
                <Text style={[styles.tabText, active && { color: t.onAccent }]}>{tab.label}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
      )}

      {/* Panel */}
      <View style={[styles.panel, shadow.sm]}>
        {activeTab === "lyrics" && (
          <LyricsView lyrics={song.lyrics} highlights={song.highlights ?? []} accent={t.accent} tint={t.tint} />
        )}
        {activeTab === "words" && song.newWords && <WordsView words={song.newWords} accent={t.accent} tint={t.tint} />}
        {activeTab === "learn" && song.whatWeLearn && (
          <LearnView items={song.whatWeLearn} accent={t.accent} onAccent={t.onAccent} tint={t.tint} />
        )}
        {activeTab === "activity" && song.activity && (
          <ActivityView activity={song.activity} accent={t.accent} tint={t.tint} />
        )}
      </View>
    </ScrollView>
  )
}

function PanelHeader({ icon, color, label }: { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }) {
  return (
    <View style={styles.panelHeader}>
      <View style={[styles.panelHeaderIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.panelTitle}>{label}</Text>
    </View>
  )
}

function LyricsView({ lyrics, highlights, accent, tint }: { lyrics: string[]; highlights: string[]; accent: string; tint: string }) {
  return (
    <View>
      <PanelHeader icon="musical-notes" color={accent} label="Kënga" />
      <View style={{ gap: 4 }}>
        {lyrics.map((line, i) => {
          if (line === "") return <View key={i} style={{ height: spacing.md }} />
          const highlight = highlights.some((h) => line.includes(h))
          return (
            <Text
              key={i}
              style={[styles.lyricLine, highlight && [styles.lyricHighlight, { color: accent, backgroundColor: tint }]]}
            >
              {line}
            </Text>
          )
        })}
      </View>
    </View>
  )
}

function WordsView({ words, accent, tint }: { words: { word: string; meaning: string }[]; accent: string; tint: string }) {
  return (
    <View>
      <PanelHeader icon="book" color={accent} label="Fjalë të Reja" />
      <View style={{ gap: spacing.md }}>
        {words.map((w, i) => (
          <View key={i} style={[styles.wordCard, { backgroundColor: tint }]}>
            <View style={[styles.wordAccent, { backgroundColor: accent }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.wordTitle, { color: accent }]}>{w.word}</Text>
              <Text style={styles.wordMeaning}>{w.meaning}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

function LearnView({ items, accent, onAccent, tint }: { items: string[]; accent: string; onAccent: string; tint: string }) {
  return (
    <View>
      <PanelHeader icon="bulb" color={accent} label="Çfarë mësojmë" />
      <View style={{ gap: spacing.md }}>
        {items.map((item, i) => (
          <View key={i} style={[styles.learnRow, { backgroundColor: tint }]}>
            <View style={[styles.learnBadge, { backgroundColor: accent }]}>
              <Text style={[styles.learnBadgeText, { color: onAccent }]}>{i + 1}</Text>
            </View>
            <Text style={styles.learnText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function ActivityView({ activity, accent, tint }: { activity: string; accent: string; tint: string }) {
  return (
    <View style={{ gap: spacing.md }}>
      <PanelHeader icon="color-palette" color={accent} label="Aktivitet" />
      <View style={[styles.activityCard, { backgroundColor: tint }]}>
        <Text style={styles.activityText}>{activity}</Text>
      </View>
      <DrawingCanvas accent={accent} />
    </View>
  )
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.xs },
  hero: {
    width: "100%",
    height: HERO_H,
    borderRadius: radius.xxl,
    overflow: "hidden",
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  player: { backgroundColor: "#000000", opacity: 0.99 },
  closeBtn: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -32,
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.md,
  },
  heroWatermark: { position: "absolute", right: -30, bottom: -40, opacity: 0.35 },
  heroBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    minWidth: 34,
    height: 34,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.sm,
  },
  heroBadgeText: { fontWeight: "800", fontSize: fontSize.lg },
  heroChip: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { gap: 2 },
  title: { fontSize: fontSize.xxl, fontWeight: "800", color: colors.foreground, letterSpacing: -0.3 },
  subtitle: { fontSize: fontSize.base, color: colors.mutedForeground },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  videoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    ...shadow.sm,
  },
  videoBtnText: { fontSize: fontSize.lg, fontWeight: "800" },
  tabBar: { flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.xs },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  tabInactive: { backgroundColor: colors.card, ...shadow.sm },
  tabText: { fontSize: fontSize.sm, fontWeight: "800", color: colors.mutedForeground },
  panel: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    minHeight: 200,
  },
  panelHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  panelHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  panelTitle: { fontSize: fontSize.lg, fontWeight: "800", color: colors.foreground },
  lyricLine: { fontSize: fontSize.lg, lineHeight: 30, color: colors.foreground },
  lyricHighlight: {
    fontWeight: "800",
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: "hidden",
  },
  wordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  wordAccent: { width: 5, alignSelf: "stretch", borderRadius: radius.full },
  wordTitle: { fontSize: fontSize.xl, fontWeight: "800" },
  wordMeaning: { fontSize: fontSize.base, color: colors.mutedForeground, marginTop: 2 },
  learnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  learnBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  learnBadgeText: { fontWeight: "800", fontSize: fontSize.sm },
  learnText: { flex: 1, fontSize: fontSize.base, color: colors.foreground, lineHeight: 22 },
  activityCard: { borderRadius: radius.lg, padding: spacing.lg },
  activityText: { fontSize: fontSize.lg, color: colors.foreground, lineHeight: 26 },
})
