// Browser-safe: used by theme components as well as tests.
// VitePress parses unquoted frontmatter dates (YAML 1.1) into Date objects and then
// JSON-serialises page data, so the client sees either a Date or an ISO timestamp
// string. Both are normalised to YYYY-MM-DD before they are shown.
const isoTimestamp = /^\d{4}-\d{2}-\d{2}T/

export function formatIsoDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10)
  }
  if (typeof value !== 'string') return ''
  return isoTimestamp.test(value) ? value.slice(0, 10) : value
}

const displayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

// '2026-11-05' → '5 Nov 2026', in UTC so the server render and the browser agree.
// Missing or malformed dates give '' instead of throwing during the build.
export function formatDisplayDate(value) {
  const iso = formatIsoDate(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return ''
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime()) || !date.toISOString().startsWith(iso)) return ''
  return displayFormat.format(date)
}
