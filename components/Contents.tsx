import { useEffect, useRef } from "react"
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Animated, Easing } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { songs } from "@/lib/book-data"
import { RemoteThumb } from "@/components/RemoteThumb"
import { colors, radius, spacing, fontSize, shadow, songThemes } from "@/lib/theme"

interface ContentsProps {
  onOpenSong: (songIndex: number) => void
  onOpenParentGuide: () => void
}

export function Contents({ onOpenSong, onOpenParentGuide }: ContentsProps) {
  // Gentle looping bob + pulse for the mascot.
  const bob = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 950, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 950, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [bob])
  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] })
  const bobScale = bob.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] })

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Welcome banner */}
      <LinearGradient
        colors={["#FF8E5E", "#EC6A8C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.banner, shadow.md]}
      >
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
        <View style={styles.bannerRow}>
          <Animated.View style={[styles.avatar, { transform: [{ translateY: bobY }, { scale: bobScale }] }]}>
            <Image source={require("@/assets/images/cover.jpg")} style={styles.avatarImg} />
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Përshëndetje!</Text>
            <Text style={styles.bannerSub}>Zgjidh një këngë dhe këndo 🎵</Text>
          </View>
        </View>
        <View style={styles.countPill}>
          <Ionicons name="musical-notes" size={13} color="#FFFFFF" />
          <Text style={styles.countText}>{songs.length} këngë</Text>
        </View>
      </LinearGradient>

      <Text style={styles.sectionLabel}>Të gjitha këngët</Text>

      {/* Song grid */}
      <View style={styles.grid}>
        {songs.map((song, index) => {
          const t = songThemes[song.palette]
          const hasPoster = !!song.image || !!song.videoUrl
          return (
            <Pressable
              key={song.id}
              onPress={() => onOpenSong(index)}
              accessibilityRole="button"
              accessibilityLabel={song.title}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.cardArt}>
                {/* Fallback shown until the thumbnail loads (or offline) */}
                <LinearGradient colors={t.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <Ionicons name={song.icon} size={94} color="rgba(255,255,255,0.22)" style={styles.watermark} />
                <Ionicons name={song.icon} size={38} color="#FFFFFF" style={styles.cardIcon} />

                {hasPoster ? (
                  <>
                    {song.image ? (
                      <Image source={song.image} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
                    ) : (
                      <RemoteThumb videoUrl={song.videoUrl!} />
                    )}
                    <LinearGradient colors={["transparent", "rgba(0,0,0,0.38)"]} style={StyleSheet.absoluteFill} />
                    <View style={[styles.iconChip, { backgroundColor: t.accent }]}>
                      <Ionicons name={song.icon} size={14} color="#FFFFFF" />
                    </View>
                  </>
                ) : null}

                <View style={styles.numberBadge}>
                  <Text style={styles.numberBadgeText}>{song.id}</Text>
                </View>
                {song.videoUrl ? (
                  <View style={styles.videoDot}>
                    <Ionicons name="play" size={11} color={t.accent} />
                  </View>
                ) : null}
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>{song.title}</Text>
                {song.englishTitle ? (
                  <Text style={styles.cardSub} numberOfLines={1}>{song.englishTitle}</Text>
                ) : null}
              </View>
            </Pressable>
          )
        })}
      </View>

      {/* Parent guide */}
      <Pressable
        onPress={onOpenParentGuide}
        accessibilityRole="button"
        accessibilityLabel="Udhëzuesi për Prindërit"
        style={({ pressed }) => [styles.guideCard, pressed && styles.cardPressed]}
      >
        <View style={styles.guideIcon}>
          <Ionicons name="people" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.guideTitle}>Udhëzuesi për Prindërit</Text>
          <Text style={styles.guideSub}>Këshilla si ta përdorni librin</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl, paddingTop: spacing.xs },
  banner: {
    borderRadius: radius.xxl,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  blob: { position: "absolute", borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.14)" },
  blob1: { width: 140, height: 140, top: -50, right: -30 },
  blob2: { width: 90, height: 90, bottom: -40, left: 40 },
  bannerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    padding: 3,
    backgroundColor: "rgba(255,255,255,0.9)",
    ...shadow.sm,
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: radius.full, resizeMode: "cover" },
  bannerTitle: { fontSize: fontSize.xxl, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.3 },
  bannerSub: { fontSize: fontSize.sm, color: "rgba(255,255,255,0.92)", marginTop: 1 },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  countText: { fontSize: fontSize.sm, fontWeight: "800", color: "#FFFFFF" },
  sectionLabel: { fontSize: fontSize.lg, fontWeight: "800", color: colors.foreground, marginBottom: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    width: "48%",
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    overflow: "hidden",
    ...shadow.md,
  },
  cardPressed: { opacity: 0.94, transform: [{ scale: 0.97 }] },
  cardArt: { height: 118, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  watermark: { position: "absolute", right: -18, bottom: -22, transform: [{ rotate: "-12deg" }] },
  cardIcon: {
    textShadowColor: "rgba(0,0,0,0.14)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  iconChip: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.sm,
  },
  numberBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  numberBadgeText: { fontWeight: "800", fontSize: fontSize.sm, color: "#FFFFFF" },
  videoDot: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.sm,
  },
  cardBody: { padding: spacing.md, gap: 2, minHeight: 62 },
  cardTitle: { fontSize: fontSize.base, fontWeight: "800", color: colors.foreground, lineHeight: 20 },
  cardSub: { fontSize: fontSize.xs, color: colors.mutedForeground },
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    ...shadow.sm,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: songThemes.nature.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  guideTitle: { fontSize: fontSize.base, fontWeight: "800", color: colors.foreground },
  guideSub: { fontSize: fontSize.sm, color: colors.mutedForeground },
})
