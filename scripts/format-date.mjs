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
