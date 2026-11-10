import test from 'node:test'
import assert from 'node:assert/strict'
import { noun, plural, statusName } from '../scripts/labels.mjs'

test('plural keeps the singular for one and adds s otherwise', () => {
  assert.equal(plural(1, 'API surface'), '1 API surface')
  assert.equal(plural(8, 'API surface'), '8 API surfaces')
  assert.equal(plural(0, 'reference page'), '0 reference pages')
})

test('plural takes an explicit plural form', () => {
  assert.equal(plural(2, 'API surface is', 'API surfaces are'), '2 API surfaces are')
  assert.equal(plural(1, 'API surface is', 'API surfaces are'), '1 API surface is')
})

test('statusName capitalises a catalog status', () => {
  assert.equal(statusName('documented'), 'Documented')
})

test('noun gives only the word form, for counts styled separately', () => {
  assert.equal(noun(1, 'reference page'), 'reference page')
  assert.equal(noun(9, 'reference page'), 'reference pages')
})
