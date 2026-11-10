import test from 'node:test'
import assert from 'node:assert/strict'
import { facetOptions, filterMarketplaces, paginate, sortMarketplaces } from '../scripts/directory.mjs'

const entry = (overrides) => ({
  id: 'x',
  name: 'X',
  fullName: 'X',
  category: 'marketplace',
  categoryLabel: 'Marketplace',
  access: 'Mixed',
  status: 'documented',
  statusLabel: 'Documented · source-linked',
  regions: [],
  summary: '',
  tags: [],
  apis: [],
  lastVerified: null,
  ...overrides,
})

const zalando = entry({ id: 'zalando', name: 'Zalando', regions: ['Europe'], lastVerified: '2026-10-01' })
const amazon = entry({ id: 'amazon', name: 'Amazon', regions: ['Europe', 'North America'], lastVerified: '2026-11-05' })
const tiktok = entry({
  id: 'tiktok',
  name: 'TikTok Shop',
  category: 'social-commerce',
  categoryLabel: 'Social commerce',
  access: 'Partner Only',
  status: 'research',
  statusLabel: 'Research · unverified',
  lastVerified: '2026-11-10',
})
const ebay = entry({ id: 'ebay', name: 'eBay', lastVerified: null })

test('facet options list each value once with its count, ordered by label', () => {
  assert.deepEqual(facetOptions([zalando, tiktok, amazon], 'category', 'categoryLabel'), [
    { value: 'marketplace', label: 'Marketplace', count: 2 },
    { value: 'social-commerce', label: 'Social commerce', count: 1 },
  ])
})

test('filters combine search text with the selected facets', () => {
  const all = [zalando, amazon, tiktok]
  assert.deepEqual(filterMarketplaces(all, { q: 'europe', category: 'all', status: 'all' }).map((m) => m.id).sort(), ['amazon', 'zalando'])
  assert.deepEqual(filterMarketplaces(all, { q: '', category: 'social-commerce', status: 'all' }).map((m) => m.id), ['tiktok'])
  assert.deepEqual(filterMarketplaces(all, { q: 'europe', category: 'all', status: 'research' }), [])
})

test('A–Z sorting ignores case; recent sorting puts the latest verification first and unverified last', () => {
  assert.deepEqual(sortMarketplaces([zalando, ebay, tiktok, amazon], 'name').map((m) => m.id), ['amazon', 'ebay', 'tiktok', 'zalando'])
  assert.deepEqual(sortMarketplaces([zalando, ebay, tiktok, amazon], 'recent').map((m) => m.id), ['tiktok', 'amazon', 'zalando', 'ebay'])
})

test('sorting returns a new list and leaves the catalog order alone', () => {
  const list = [zalando, amazon]
  sortMarketplaces(list, 'name')
  assert.deepEqual(list.map((m) => m.id), ['zalando', 'amazon'])
})

test('pagination clamps the page number and reports the visible range', () => {
  const items = Array.from({ length: 50 }, (_, index) => index)
  assert.deepEqual(paginate(items, 2, 24), { items: items.slice(24, 48), page: 2, pages: 3, start: 25, end: 48, total: 50 })
  assert.equal(paginate(items, 9, 24).page, 3)
  assert.equal(paginate(items, 0, 24).page, 1)
  assert.deepEqual(paginate([], 1, 24), { items: [], page: 1, pages: 1, start: 0, end: 0, total: 0 })
})

test('a list field such as regions gives one option per value, counted once per marketplace', () => {
  assert.deepEqual(facetOptions([zalando, amazon, tiktok], 'regions'), [
    { value: 'Europe', label: 'Europe', count: 2 },
    { value: 'North America', label: 'North America', count: 1 },
  ])
})

test('access and region facets narrow the results, and an unset facet means all', () => {
  const all = [zalando, amazon, tiktok]
  const state = { q: '', category: 'all', status: 'all', access: 'all', region: 'all' }
  assert.deepEqual(filterMarketplaces(all, { ...state, region: 'North America' }).map((m) => m.id), ['amazon'])
  assert.deepEqual(filterMarketplaces(all, { ...state, access: 'Partner Only' }).map((m) => m.id), ['tiktok'])
  assert.equal(filterMarketplaces(all, { q: '', category: 'all', status: 'all' }).length, 3)
})
