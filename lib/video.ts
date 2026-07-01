// Helpers for turning a YouTube watch/short URL into an embeddable player URL.

/** Extract the 11-char YouTube video id from the common URL shapes. */
export function youTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=ID
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/ID
    /\/embed\/([A-Za-z0-9_-]{11})/, // /embed/ID
    /\/shorts\/([A-Za-z0-9_-]{11})/, // /shorts/ID
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

/** Build an autoplaying, inline embed URL for the given YouTube link, or null. */
export function youTubeEmbedUrl(url: string): string | null {
  const id = youTubeId(url)
  if (!id) return null
  return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`
}

/** Thumbnail image URL for a YouTube link. `hqdefault` exists for every video. */
export function youTubeThumb(url: string | undefined): string | null {
  if (!url) return null
  const id = youTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

/** High-res (1280×720) thumbnail. Not guaranteed — 404s when absent, so pair with a fallback. */
export function youTubeThumbMax(url: string | undefined): string | null {
  if (!url) return null
  const id = youTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null
}
