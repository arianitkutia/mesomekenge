// Central design tokens for the "Mëso shqip përmes këngëve" app.
// Warm, playful, high-contrast palette tuned for kids ages 2-6.

export const colors = {
  background: "#FBF6ED",
  backgroundGradient: ["#FFFDF8", "#FBF1E2"] as const,
  card: "#FFFFFF",
  foreground: "#37291D",
  mutedForeground: "#8A7A6B",
  border: "#ECE2D2",
  primary: "#4CAE52",
  primaryForeground: "#FFFFFF",
  secondary: "#F1E8D8",
  secondaryForeground: "#37291D",
  accent: "#F2A33C",
  accentForeground: "#37291D",
  /** Cover screen and native splash share this blue, so launch flows into the app. */
  cover: "#0001BD",
} as const

// Each song adopts one colour identity so the pages feel distinct.
//   tint     — softest shade, page/section backgrounds
//   soft     — illustration / art backdrop
//   accent   — saturated colour for badges, active tabs, highlights
//   onAccent — text/icon colour that sits on top of `accent`
//   gradient — [from, to] pair for art bands and hero areas
export const songThemes = {
  apple: { tint: "#FDEBEA", soft: "#FAD6D3", accent: "#EF5A54", onAccent: "#FFFFFF", gradient: ["#F98A7E", "#EF5A54"] as const },
  instrument: { tint: "#E7F1FA", soft: "#CCE0F2", accent: "#3B86C9", onAccent: "#FFFFFF", gradient: ["#69ABDC", "#3B86C9"] as const },
  movement: { tint: "#FCF3DD", soft: "#F6E4B6", accent: "#E8A020", onAccent: "#FFFFFF", gradient: ["#F4C24E", "#E8A020"] as const },
  nature: { tint: "#E9F6EA", soft: "#CCE9CE", accent: "#4CAE52", onAccent: "#FFFFFF", gradient: ["#7BC97F", "#4CAE52"] as const },
  grape: { tint: "#F1EAFA", soft: "#DFD0F0", accent: "#8B5CC7", onAccent: "#FFFFFF", gradient: ["#AE85DC", "#8B5CC7"] as const },
  sky: { tint: "#E3F5F2", soft: "#C4E8E4", accent: "#2FA8A0", onAccent: "#FFFFFF", gradient: ["#5FC7BE", "#2FA8A0"] as const },
  coral: { tint: "#FCE8ED", soft: "#F7D3DE", accent: "#EC6A8C", onAccent: "#FFFFFF", gradient: ["#F493AC", "#EC6A8C"] as const },
  tangerine: { tint: "#FDEBDE", soft: "#F9D8C1", accent: "#EE7B3C", onAccent: "#FFFFFF", gradient: ["#F5A06B", "#EE7B3C"] as const },
} as const

export type SongTheme = keyof typeof songThemes

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  title: 30,
  hero: 44,
} as const

// Reusable elevation presets so shadows stay consistent across screens.
export const shadow = {
  sm: {
    shadowColor: "#5A4632",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  md: {
    shadowColor: "#5A4632",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  lg: {
    shadowColor: "#5A4632",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
  },
} as const
