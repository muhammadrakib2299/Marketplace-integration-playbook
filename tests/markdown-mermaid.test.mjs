import test from 'node:test'
import assert from 'node:assert/strict'
import { decodeDiagram, renderMermaidFence } from '../scripts/markdown-mermaid.mjs'

const sourceOf = (html) => {
  const match = /code="([^"]*)"/.exec(html)
  assert.ok(match, `expected a code attribute in ${html}`)
  return decodeDiagram(match[1])
}

test('a mermaid fence renders the diagram component', () => {
  const html = renderMermaidFence('mermaid', 'flowchart LR\n  A --> B\n')
  assert.match(html, /^<MermaidDiagram code="[A-Za-z0-9+/=]+" \/>\n$/)
})

test('the diagram source round-trips exactly', () => {
  const source = 'flowchart LR\n  A[Seller grants access] --> B[Resolve marketplaces]\n'
  assert.equal(sourceOf(renderMermaidFence('mermaid', source)), source)
})

test('syntax that would break an HTML attribute or a Vue template survives', () => {
  // Quotes and --> are not safe raw in an attribute; {{ }} is Vue interpolation; both are
  // legal mermaid, so the source is encoded rather than escaped.
  const source = 'flowchart LR\n  A{{Hexagon}} -->|"quoted label"| B\n'
  assert.equal(sourceOf(renderMermaidFence('mermaid', source)), source)
})

test('non-ASCII diagram text survives the round trip', () => {
  const source = 'flowchart LR\n  A[Lieferung · 配送] --> B[Fertig]\n'
  assert.equal(sourceOf(renderMermaidFence('mermaid', source)), source)
})

test('an accessible title may follow the language in the info string', () => {
  const html = renderMermaidFence('mermaid How the APIs connect', 'flowchart LR\n  A --> B\n')
  assert.match(html, /title="How the APIs connect"/)
  assert.equal(sourceOf(html), 'flowchart LR\n  A --> B\n')
})

test('a title containing quotes or angle brackets is escaped', () => {
  const html = renderMermaidFence('mermaid The "A" <-> B map', 'flowchart LR\n  A --> B\n')
  assert.match(html, /title="The &quot;A&quot; &lt;-&gt; B map"/)
})

test('an untitled fence carries no title attribute', () => {
  assert.doesNotMatch(renderMermaidFence('mermaid', 'flowchart LR\n  A --> B\n'), /title=/)
})

test('other fences are left to the default renderer', () => {
  assert.equal(renderMermaidFence('json', '{"a": 1}'), null)
  assert.equal(renderMermaidFence('', 'plain text'), null)
  assert.equal(renderMermaidFence('mermaidish', 'flowchart LR'), null)
})
