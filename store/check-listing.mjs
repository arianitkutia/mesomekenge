// Verifies every length-capped field in app-store-listing.md against Apple's limits.
//
// Fields are declared in the doc as:  **Label** — <claimed>/<limit>
// followed by a fenced block holding the exact text that gets pasted into
// App Store Connect. This re-counts both numbers so the doc can never drift.
//
// Run:  node store/check-listing.mjs
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "app-store-listing.md")
const md = fs.readFileSync(file, "utf8")

const nbsp = / | | /g          // thousands separators used in the doc
const num = (s) => Number(s.replace(nbsp, ""))
const len = (s) => [...s].length          // count code points, not UTF-16 units

const re = /\*\*(.+?)\*\*\s*—\s*([\d   ]+)\/([\d   ]+)\n(?:_[^\n]*_\n)?```\n([\s\S]*?)\n```/g

let fail = 0
let checked = 0
for (const [, label, claimed, limit, body] of md.matchAll(re)) {
  const actual = len(body.trim())
  const cap = num(limit)
  const said = num(claimed)
  const over = actual > cap
  const drift = actual !== said
  checked++
  if (over || drift) fail++
  const mark = over ? "OVER LIMIT" : drift ? `doc says ${said}` : "ok"
  console.log(`${over || drift ? "✗" : "✓"} ${label.padEnd(34)} ${String(actual).padStart(5)}/${cap}  ${mark}`)
}

if (!checked) { console.error("no length-capped fields found — did the doc format change?"); process.exit(1) }
console.log(fail ? `\n${fail} of ${checked} field(s) need attention.` : `\nAll ${checked} capped fields within limits.`)
process.exit(fail ? 1 : 0)
