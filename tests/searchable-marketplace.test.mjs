import test from 'node:test'
import assert from 'node:assert/strict'
import { fuzzySearch } from '../scripts/fuzzy-search.mjs'
import { readFilterState, writeFilterState } from '../scripts/filter-state.mjs'

const records = [
  { id: 'amazon', name: 'Amazon Selling Partner API', tags: ['Orders API', 'Listings'] },
  { id: 'tiktok', name: 'TikTok Shop Partner API', tags: ['Category Assets'] },
  { id: 'stripe', name: 'Stripe Payments', tags: ['Checkout'] },
]

test('fuzzy search finds non-contiguous matches and ranks the closest title first', () => {
  const result = fuzzySearch(records, 'amzn sell', (item) => [item.name, ...item.tags])
  assert.equal(result[0].id, 'amazon')
})

test('fuzzy search matches API tags, not only titles', () => {
  const result = fuzzySearch(records, 'category ast', (item) => [item.name, ...item.tags])
  assert.deepEqual(result.map((item) => item.id), ['tiktok'])
})

test('fuzzy search preserves catalog order when the query is empty', () => {
  assert.deepEqual(fuzzySearch(records, '', (item) => [item.name]).map((item) => item.id), ['amazon', 'tiktok', 'stripe'])
})

test('URL state serializes only non-default filters', () => {
  const defaults = { q: '', type: 'all', topic: 'all' }
  assert.equal(writeFilterState('/marketplaces/', { q: 'orders', type: 'guide', topic: 'all' }, defaults), '/marketplaces/?q=orders&type=guide')
})

test('URL state restores valid filters and rejects unknown values', () => {
  const defaults = { q: '', type: 'all', topic: 'all' }
  const state = readFilterState('?q=orders&type=unknown&topic=orders', defaults, {
    type: ['all', 'marketplace', 'guide'],
    topic: ['all', 'orders'],
  })
  assert.deepEqual(state, { q: 'orders', type: 'all', topic: 'orders' })
})
