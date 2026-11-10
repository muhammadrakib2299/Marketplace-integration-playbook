import test from 'node:test'
import assert from 'node:assert/strict'
import { formatIsoDate } from '../scripts/format-date.mjs'

// VitePress parses unquoted frontmatter dates (YAML 1.1) into Date objects.
test('formatIsoDate prints YYYY-MM-DD for Date objects', () => {
  assert.equal(formatIsoDate(new Date('2026-11-06T00:00:00Z')), '2026-11-06')
})

test('formatIsoDate passes date strings through and blanks missing values', () => {
  assert.equal(formatIsoDate('2026-11-06'), '2026-11-06')
  assert.equal(formatIsoDate(undefined), '')
  assert.equal(formatIsoDate(''), '')
})
