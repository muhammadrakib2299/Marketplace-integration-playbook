// Turns inline code such as `GET /orders/2026-01-01/orders` into a coloured method badge
// followed by the path, the way API references present endpoints. Other inline code is
// left to markdown-it's default renderer (this returns null for it).
const methodPattern = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)(?:\s+(\S[\s\S]*))?$/
const htmlEscapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const escapeHtml = (value) => value.replace(/[&<>"]/g, (character) => htmlEscapes[character])

export function renderMethodCode(content) {
  const match = methodPattern.exec(content)
  if (!match) return null
  const [, method, path] = match
  const badge = `<span class="mip-method mip-method--${method.toLowerCase()}">${method}</span>`
  // The literal space keeps "GET /path" intact in search indexes and copied text.
  return path ? `<span class="mip-endpoint">${badge} <code>${escapeHtml(path)}</code></span>` : badge
}
