import { useRef, useState } from "react"
import { View, Text, Pressable, PanResponder, StyleSheet } from "react-native"
import Svg, { Path } from "react-native-svg"
import { Ionicons } from "@expo/vector-icons"
import { colors, radius, spacing, fontSize } from "@/lib/theme"

interface Stroke {
  d: string
  color: string
}

// Crayon colours a child can draw with.
const CRAYONS = ["#37291D", "#EF5A54", "#3B86C9", "#4CAE52", "#E8A020", "#8B5CC7"]

export function DrawingCanvas({ accent }: { accent: string }) {
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [current, setCurrent] = useState<string>("")
  const [color, setColor] = useState<string>(accent)

  // Keep the latest path string in a ref so the PanResponder (created once) sees it.
  const currentRef = useRef("")
  const colorRef = useRef(color)
  colorRef.current = color

  const pan = useRef(
    PanResponder.create({
      // Capture touches so drawing on the canvas never scrolls the page.
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent
        currentRef.current = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`
        setCurrent(currentRef.current)
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent
        currentRef.current += ` L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`
        setCurrent(currentRef.current)
      },
      onPanResponderRelease: () => {
        const d = currentRef.current
        if (d.includes("L")) setStrokes((prev) => [...prev, { d, color: colorRef.current }])
        currentRef.current = ""
        setCurrent("")
      },
    })
  ).current

  const clear = () => {
    setStrokes([])
    setCurrent("")
    currentRef.current = ""
  }

  const empty = strokes.length === 0 && current === ""

  return (
    <View style={{ gap: spacing.md }}>
      <View style={[styles.canvas, { borderColor: accent }]} {...pan.panHandlers}>
        <Svg width="100%" height="100%">
          {strokes.map((s, i) => (
            <Path key={i} d={s.d} stroke={s.color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
          {current ? (
            <Path d={current} stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ) : null}
        </Svg>
        {empty ? (
          <View style={styles.hint} pointerEvents="none">
            <Ionicons name="brush" size={26} color={accent} />
            <Text style={[styles.hintText, { color: accent }]}>Vizato këtu!</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.toolbar}>
        <View style={styles.crayons}>
          {CRAYONS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityRole="button"
              accessibilityLabel={`Ngjyra ${c}`}
              style={[styles.crayon, { backgroundColor: c }, color === c && styles.crayonActive]}
            />
          ))}
        </View>
        <Pressable
          onPress={clear}
          accessibilityRole="button"
          accessibilityLabel="Fshij vizatimin"
          style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="trash" size={16} color={colors.mutedForeground} />
          <Text style={styles.clearText}>Fshij</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    height: 220,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  hint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  hintText: { fontSize: fontSize.base, fontWeight: "700" },
  toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  crayons: { flexDirection: "row", gap: spacing.sm },
  crayon: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  crayonActive: {
    borderColor: colors.foreground,
    transform: [{ scale: 1.18 }],
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  clearText: { fontSize: fontSize.sm, fontWeight: "700", color: colors.mutedForeground },
})
