// Turns ```mermaid fences into <MermaidDiagram>, which draws the diagram in the browser.
// Other fences are left to VitePress's Shiki renderer (this returns null for them).
//
// The source is base64-encoded rather than HTML-escaped because VitePress compiles rendered
// Markdown as a Vue template: legal mermaid contains `"`, `-->`, and `{{ }}`, which an attribute
// value and Vue's interpolation would each mangle. Encoding keeps every byte intact.
const htmlEscapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const escapeHtml = (value) => value.replace(/[&<>"]/g, (character) => htmlEscapes[character])

export function encodeDiagram(source) {
  return Buffer.from(source, 'utf8').toString('base64')
}

export function decodeDiagram(encoded) {
  return Buffer.from(encoded, 'base64').toString('utf8')
}

export function renderMermaidFence(info, content) {
  // ```mermaid, optionally followed by an accessible title: ```mermaid How the APIs connect
  const match = /^mermaid(?:\s+(\S[\s\S]*))?$/.exec(info.trim())
  if (!match) return null
  const title = match[1]?.trim()
  const attributes = [`code="${encodeDiagram(content)}"`]
  if (title) attributes.push(`title="${escapeHtml(title)}"`)
  return `<MermaidDiagram ${attributes.join(' ')} />\n`
}
