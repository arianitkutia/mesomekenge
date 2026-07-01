import { useState } from "react"
import { Image, StyleSheet } from "react-native"
import type { StyleProp, ImageStyle } from "react-native"
import { youTubeThumb, youTubeThumbMax } from "@/lib/video"

// A YouTube thumbnail that loads the crisp maxres image, then quietly falls
// back to hqdefault (which exists for every video) if maxres is missing.
export function RemoteThumb({
  videoUrl,
  style,
  accessibilityLabel,
}: {
  videoUrl: string
  style?: StyleProp<ImageStyle>
  accessibilityLabel?: string
}) {
  const max = youTubeThumbMax(videoUrl)
  const hq = youTubeThumb(videoUrl)
  const [uri, setUri] = useState<string | null>(max ?? hq)

  if (!uri) return null

  return (
    <Image
      source={{ uri }}
      style={[StyleSheet.absoluteFill, style]}
      resizeMode="cover"
      accessibilityLabel={accessibilityLabel}
      onError={() => {
        if (hq && uri !== hq) setUri(hq)
      }}
    />
  )
}
