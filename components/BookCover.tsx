import { View, Text, Image, Pressable, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { colors, radius, spacing, fontSize, shadow, songThemes } from "@/lib/theme"

interface BookCoverProps {
  onStart: () => void
}

// Playful icons scattered behind the cover art.
const FLOATERS: { icon: keyof typeof Ionicons.glyphMap; color: string; size: number; style: object }[] = [
  { icon: "musical-note", color: songThemes.instrument.accent, size: 30, style: { top: "8%", left: "14%" } },
  { icon: "star", color: songThemes.movement.accent, size: 26, style: { top: "14%", right: "16%" } },
  { icon: "heart", color: songThemes.coral.accent, size: 22, style: { top: "40%", left: "8%" } },
  { icon: "musical-notes", color: songThemes.grape.accent, size: 28, style: { top: "44%", right: "9%" } },
  { icon: "sparkles", color: songThemes.movement.accent, size: 22, style: { top: "2%", right: "38%" } },
]

export function BookCover({ onStart }: BookCoverProps) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        {FLOATERS.map((f, i) => (
          <Ionicons key={i} name={f.icon} size={f.size} color={f.color} style={[styles.floater, f.style]} />
        ))}

        <View style={styles.haloWrap}>
          <LinearGradient
            colors={songThemes.movement.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.halo}
          />
          <View style={styles.imageRing}>
            <Image
              source={require("@/assets/images/cover.jpg")}
              style={styles.image}
              accessibilityLabel="Mëso shqip përmes këngëve — kopertina me zogun GaGa dhe notat muzikore"
            />
          </View>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Mëso shqip përmes këngëve</Text>
        <View style={styles.agePill}>
          <Ionicons name="happy" size={15} color={colors.accent} />
          <Text style={styles.ageText}>Mosha 2–6 vjeç</Text>
        </View>
      </View>

      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel="Fillo"
        style={({ pressed }) => [styles.buttonWrap, pressed && styles.buttonPressed]}
      >
        <LinearGradient
          colors={[colors.primary, "#3E9A44"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Ionicons name="play" size={22} color={colors.primaryForeground} />
          <Text style={styles.buttonText}>Fillo</Text>
        </LinearGradient>
      </Pressable>
    </View>
  )
}

const RING = 260

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  hero: {
    width: "100%",
    height: RING + 80,
    alignItems: "center",
    justifyContent: "center",
  },
  floater: { position: "absolute", opacity: 0.55 },
  haloWrap: { width: RING, height: RING, alignItems: "center", justifyContent: "center" },
  halo: {
    position: "absolute",
    width: RING,
    height: RING,
    borderRadius: radius.full,
    opacity: 0.28,
    transform: [{ scale: 1.12 }],
  },
  imageRing: {
    width: RING,
    height: RING,
    borderRadius: radius.full,
    padding: 8,
    backgroundColor: colors.card,
    ...shadow.lg,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radius.full,
    resizeMode: "cover",
  },
  titleBlock: { alignItems: "center", gap: spacing.sm },
  title: { fontSize: 33, lineHeight: 39, fontWeight: "800", color: colors.foreground, textAlign: "center", letterSpacing: -0.5 },
  agePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    ...shadow.sm,
  },
  ageText: { fontSize: fontSize.sm, fontWeight: "700", color: colors.foreground },
  buttonWrap: { borderRadius: radius.full, ...shadow.md },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.full,
  },
  buttonText: { color: colors.primaryForeground, fontSize: fontSize.xl, fontWeight: "800" },
})
