import { useState, useCallback, useEffect, useRef } from "react"
import { View, Text, Pressable, StyleSheet, Animated } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { BookCover } from "@/components/BookCover"
import { Contents } from "@/components/Contents"
import { SongPage } from "@/components/SongPage"
import { ParentGuide } from "@/components/ParentGuide"
import { songs } from "@/lib/book-data"
import { colors, radius, spacing, fontSize, shadow } from "@/lib/theme"

type Page = "cover" | "contents" | "song" | "parent-guide"

export default function App() {
  const [page, setPage] = useState<Page>("cover")
  const [songIndex, setSongIndex] = useState(0)

  const start = useCallback(() => setPage("contents"), [])
  const goHome = useCallback(() => setPage("cover"), [])
  const goContents = useCallback(() => setPage("contents"), [])

  const openSong = useCallback((i: number) => {
    setSongIndex(i)
    setPage("song")
  }, [])

  const openParentGuide = useCallback(() => setPage("parent-guide"), [])

  const goNext = useCallback(() => {
    if (page === "song" && songIndex < songs.length - 1) {
      setSongIndex((i) => i + 1)
    } else if (page === "song") {
      setPage("parent-guide")
    }
  }, [page, songIndex])

  const goPrev = useCallback(() => {
    if (page === "parent-guide") {
      setPage("song")
      setSongIndex(songs.length - 1)
    } else if (page === "song" && songIndex > 0) {
      setSongIndex((i) => i - 1)
    } else if (page === "song") {
      setPage("contents")
    }
  }, [page, songIndex])

  const headerTitle =
    page === "contents" ? "Këngët" : page === "song" ? songs[songIndex].title : "Prindërit"

  // Cross-fade + gentle rise whenever the visible screen changes.
  const anim = useRef(new Animated.Value(1)).current
  useEffect(() => {
    anim.setValue(0)
    Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }).start()
  }, [page, songIndex, anim])
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] })

  return (
    <SafeAreaProvider>
      <StatusBar style={page === "cover" ? "light" : "dark"} />
      <View style={styles.root}>
        <LinearGradient colors={colors.backgroundGradient} style={StyleSheet.absoluteFill} />
        {/* The cover runs edge to edge on the splash blue; every other page keeps
            the cream gradient and its safe-area insets. */}
        {page === "cover" && <View style={[StyleSheet.absoluteFill, styles.coverFill]} />}
        <SafeAreaView style={styles.safe} edges={page === "cover" ? [] : ["top", "bottom"]}>
          {/* Header */}
          {page !== "cover" && (
            <View style={styles.header}>
              <Pressable
                onPress={goHome}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                accessibilityLabel="Kthehu në fillim"
                hitSlop={8}
              >
                <Ionicons name="home" size={20} color={colors.foreground} />
              </Pressable>

              <Text style={styles.headerTitle} numberOfLines={1}>
                {headerTitle}
              </Text>

              {page === "song" ? (
                <Pressable
                  onPress={goContents}
                  style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                  accessibilityLabel="Lista e këngëve"
                  hitSlop={8}
                >
                  <Ionicons name="grid" size={19} color={colors.foreground} />
                </Pressable>
              ) : (
                <View style={styles.iconBtn} />
              )}
            </View>
          )}

          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              page === "cover" && styles.contentCover,
              { opacity: anim, transform: [{ translateY }] },
            ]}
          >
            {page === "cover" && <BookCover onStart={start} />}
            {page === "contents" && <Contents onOpenSong={openSong} onOpenParentGuide={openParentGuide} />}
            {page === "song" && <SongPage key={songs[songIndex].id} song={songs[songIndex]} />}
            {page === "parent-guide" && <ParentGuide />}
          </Animated.View>

          {/* Footer (song + parent guide only) */}
          {(page === "song" || page === "parent-guide") && (
            <View style={styles.footer}>
              <Pressable
                onPress={goPrev}
                style={({ pressed }) => [styles.navBtn, styles.navBtnSecondary, pressed && styles.pressed]}
                accessibilityLabel="Faqja e mëparshme"
              >
                <Ionicons name="chevron-back" size={20} color={colors.secondaryForeground} />
                <Text style={styles.navBtnSecondaryText}>Prapa</Text>
              </Pressable>

              {page === "song" && (
                <View style={styles.counterPill}>
                  <Text style={styles.counterText}>{songIndex + 1} / {songs.length}</Text>
                </View>
              )}

              {page === "parent-guide" ? (
                <Pressable
                  onPress={goHome}
                  style={({ pressed }) => [styles.navBtn, styles.navBtnPrimary, pressed && styles.pressed]}
                  accessibilityLabel="Kthehu në fillim"
                >
                  <Ionicons name="home" size={20} color={colors.primaryForeground} />
                  <Text style={styles.navBtnPrimaryText}>Fillimi</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={goNext}
                  style={({ pressed }) => [styles.navBtn, styles.navBtnPrimary, pressed && styles.pressed]}
                  accessibilityLabel="Faqja tjetër"
                >
                  <Text style={styles.navBtnPrimaryText}>Para</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.primaryForeground} />
                </Pressable>
              )}
            </View>
          )}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  coverFill: { backgroundColor: colors.cover },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.sm,
  },
  headerTitle: { flex: 1, textAlign: "center", fontSize: fontSize.lg, fontWeight: "800", color: colors.foreground },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  contentCover: { paddingHorizontal: 0 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    ...shadow.sm,
  },
  navBtnSecondary: { backgroundColor: colors.card },
  navBtnSecondaryText: { fontSize: fontSize.base, fontWeight: "800", color: colors.secondaryForeground },
  navBtnPrimary: { backgroundColor: colors.primary },
  navBtnPrimaryText: { fontSize: fontSize.base, fontWeight: "800", color: colors.primaryForeground },
  counterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  counterText: { fontSize: fontSize.sm, fontWeight: "800", color: colors.mutedForeground },
})
