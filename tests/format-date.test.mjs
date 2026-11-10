import test from 'node:test'
import assert from 'node:assert/strict'
import { formatDisplayDate, formatIsoDate } from '../scripts/format-date.mjs'

// VitePress parses unquoted frontmatter dates (YAML 1.1) into Date objects.
test('formatIsoDate prints YYYY-MM-DD for Date objects', () => {
  assert.equal(formatIsoDate(new Date('2026-11-06T00:00:00Z')), '2026-11-06')
})

// VitePress JSON-serialises page data, so the client receives that Date as an ISO timestamp string.
test('formatIsoDate trims serialized ISO timestamps to the date', () => {
  assert.equal(formatIsoDate('2026-11-06T00:00:00.000Z'), '2026-11-06')
})

test('formatIsoDate passes date strings through and blanks missing values', () => {
  assert.equal(formatIsoDate('2026-11-06'), '2026-11-06')
  assert.equal(formatIsoDate(undefined), '')
  assert.equal(formatIsoDate(''), '')
})

test('formatDisplayDate prints a UTC day-month-year date from any accepted input', () => {
  assert.equal(formatDisplayDate('2026-11-05'), '5 Nov 2026')
  assert.equal(formatDisplayDate(new Date('2026-11-06T00:00:00Z')), '6 Nov 2026')
  assert.equal(formatDisplayDate('2026-11-06T00:00:00.000Z'), '6 Nov 2026')
})

// A malformed date must render as nothing rather than throw a RangeError during the build.
test('formatDisplayDate blanks missing and malformed dates', () => {
  for (const value of [null, undefined, '', '2026-11-5', '2026-13-01', 'soon']) {
    assert.equal(formatDisplayDate(value), '', `expected ${value} to be blank`)
  }
})
