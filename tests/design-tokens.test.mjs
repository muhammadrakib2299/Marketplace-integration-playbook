import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { repositoryRoot } from '../scripts/catalog-data.mjs'

// Text/background token pairs that must stay readable (WCAG AA, 4.5:1) in both themes.
const pairs = [
  ['ink', 'bg'], ['ink', 'surface'], ['text', 'bg'], ['text', 'surface'],
  ['muted', 'bg'], ['muted', 'surface'], ['muted', 'surface-2'],
  ['faint-text', 'bg'], ['faint-text', 'surface'],
  ['primary', 'bg'], ['primary', 'surface'], ['primary-ink', 'primary-soft'], ['on-primary', 'primary'],
  ['success', 'success-soft'], ['warning', 'warning-soft'], ['danger', 'danger-soft'],
  ['info', 'info-soft'], ['violet', 'violet-soft'],
  // Navy chrome (top bar and footer).
  ['chrome-text', 'chrome'], ['chrome-muted', 'chrome'], ['chrome-muted', 'chrome-2'], ['chrome-text', 'chrome-2'],
]

function readTokenBlock(css, selector) {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) return {}
  const block = css.slice(start, css.indexOf('}', start))
  return Object.fromEntries([...block.matchAll(/--mip-([a-z0-9-]+):\s*#([0-9a-fA-F]{6})\s*;/g)].map(([, name, hex]) => [name, hex]))
}

function luminance(hex) {
  const [r, g, b] = [0, 2, 4].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

function failingPairs(tokens) {
  return pairs
    .map(([foreground, background]) => {
      assert.ok(tokens[foreground] && tokens[background], `missing --mip-${foreground} or --mip-${background}`)
      return { pair: `${foreground} on ${background}`, ratio: contrast(tokens[foreground], tokens[background]) }
    })
    .filter(({ ratio }) => ratio < 4.5)
    .map(({ pair, ratio }) => `${pair} = ${ratio.toFixed(2)}:1`)
}

const css = () => readFileSync(join(repositoryRoot, '.vitepress', 'theme', 'styles', 'tokens.css'), 'utf8')

test('light theme text tokens meet WCAG AA', () => {
  assert.deepEqual(failingPairs(readTokenBlock(css(), ':root')), [])
})

test('dark theme text tokens meet WCAG AA', () => {
  const source = css()
  assert.deepEqual(failingPairs({ ...readTokenBlock(source, ':root'), ...readTokenBlock(source, '.dark') }), [])
})
