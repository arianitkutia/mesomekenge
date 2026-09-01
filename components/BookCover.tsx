import { View, Text, Image, Pressable, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors, radius, spacing, fontSize, shadow } from "@/lib/theme"

interface BookCoverProps {
  onStart: () => void
}

// The cover is the native splash artwork, full screen, with the one control a child
// needs sitting on top of it. `contain` keeps the wordmark from being cropped on tall
// screens; the letterbox bands are invisible because they are the artwork's own blue.
export function BookCover({ onStart }: BookCoverProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/splash.png")}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        accessibilityLabel="Mëso shqip përmes këngëve — këngë për fëmijë 2–6 vjeç"
      />

      {/* Fades the foot of the artwork into the brand blue so the button always has a
          clean field to sit on, whatever the screen aspect crops to. */}
      <LinearGradient
        colors={["rgba(0,1,188,0)", "rgba(0,1,188,0.92)", colors.cover]}
        locations={[0, 0.55, 1]}
        style={styles.scrim}
        pointerEvents="none"
      />

      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel="Fillo"
        style={({ pressed }) => [
          styles.buttonWrap,
          { bottom: insets.bottom + spacing.xxl },
          pressed && styles.buttonPressed,
        ]}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cover },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "32%" },
  buttonWrap: { position: "absolute", alignSelf: "center", borderRadius: radius.full, ...shadow.lg },
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
