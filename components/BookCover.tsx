import { View, Text, Image, Pressable, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors, radius, spacing, fontSize, shadow } from "@/lib/theme"

interface BookCoverProps {
  onStart: () => void
}

// The cover shows the same artwork as the native splash, at the same size and on
// the same blue, so the launch screen appears to stay put while the app takes over.
// Everything the child needs to act on sits below it.
export function BookCover({ onStart }: BookCoverProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      {/* The artwork is contained in the space left over above the controls, so the
          Fillo button can never land on top of it however tall the screen is. */}
      <View style={styles.artWrap}>
        <Image
          source={require("@/assets/images/splash.png")}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          accessibilityLabel="Mëso shqip përmes këngëve — këngë për fëmijë 2–6 vjeç"
        />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.agePill}>
          <Ionicons name="happy" size={15} color="#FFFFFF" />
          <Text style={styles.ageText}>Mosha 2–6 vjeç</Text>
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cover },
  artWrap: { flex: 1 },
  footer: {
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  agePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  ageText: { fontSize: fontSize.sm, fontWeight: "700", color: "#FFFFFF" },
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
