// Browser-safe: used by theme components as well as tests.
// VitePress parses unquoted frontmatter dates (YAML 1.1) into Date objects, so
// evidence dates are normalised to YYYY-MM-DD before they are shown.
export function formatIsoDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10)
  }
  return typeof value === 'string' ? value : ''
}
