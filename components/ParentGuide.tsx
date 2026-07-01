import { View, Text, ScrollView, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { colors, radius, spacing, fontSize, shadow, songThemes } from "@/lib/theme"

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; text: string; palette: keyof typeof songThemes }[] = [
  { icon: "happy", text: "Forcon kujtesën", palette: "movement" },
  { icon: "volume-high", text: "Përmirëson shqiptimin", palette: "instrument" },
  { icon: "heart", text: "Rrit vetëbesimin", palette: "coral" },
]

const STEPS = ["Lexoni tekstin", "Këndoni bashkë", "Bëni aktivitetin"]

const WEEKLY = [
  { day: "E Hënë", activity: "Këngë lëvizjeje" },
  { day: "E Martë", activity: "Këngë zanore" },
  { day: "E Mërkurë", activity: "Këngë natyre" },
  { day: "E Enjte", activity: "Aktivitet" },
  { day: "E Premte", activity: "Këndim familjar" },
]

export function ParentGuide() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={songThemes.nature.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, shadow.md]}
      >
        <View style={styles.heroIcon}>
          <Ionicons name="people" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.heroTitle}>Udhëzuesi për Prindërit</Text>
        <Text style={styles.heroIntro}>
          Mirë se vini në Botën e GaGa! Ky libër ndihmon fëmijët shqiptarë në diasporë
          të ruajnë gjuhën shqipe me gëzim.
        </Text>
      </LinearGradient>

      <Section title="Pse këndimi ndihmon">
        {BENEFITS.map((b, i) => {
          const t = songThemes[b.palette]
          return (
            <View key={i} style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: t.tint }]}>
                <Ionicons name={b.icon} size={22} color={t.accent} />
              </View>
              <Text style={styles.cardText}>{b.text}</Text>
            </View>
          )
        })}
      </Section>

      <Section title="Si ta përdorni librin">
        {STEPS.map((step, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{i + 1}</Text>
            </View>
            <Text style={styles.cardText}>{step}</Text>
          </View>
        ))}
      </Section>

      <Section title="Rutina Javore e Sugjeruar">
        <View style={styles.weekCard}>
          {WEEKLY.map((item, i) => (
            <View key={i} style={[styles.weekRow, i < WEEKLY.length - 1 && styles.weekDivider]}>
              <Text style={styles.weekDay}>{item.day}</Text>
              <Text style={styles.weekActivity}>{item.activity}</Text>
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.xs },
  hero: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: fontSize.xxl, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  heroIntro: { fontSize: fontSize.base, color: "rgba(255,255,255,0.92)", textAlign: "center", lineHeight: 22 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "800", color: colors.foreground },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1, fontSize: fontSize.base, fontWeight: "700", color: colors.foreground },
  stepBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: { color: "#FFFFFF", fontWeight: "800", fontSize: fontSize.lg },
  weekCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    ...shadow.sm,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  weekDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  weekDay: { fontSize: fontSize.base, fontWeight: "800", color: colors.primary },
  weekActivity: { fontSize: fontSize.base, color: colors.foreground },
})
