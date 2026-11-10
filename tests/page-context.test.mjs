import test from 'node:test'
import assert from 'node:assert/strict'
import {
  hubModel,
  isMarketplaceOverview,
  marketplaceForPath,
  officialReference,
  routeForPath,
  sequencePosition,
} from '../scripts/page-context.mjs'

// Shaped like buildMarketplaces() output; only the fields these helpers read.
const ebay = {
  id: 'ebay-sell-api',
  slug: 'ebay',
  guide: '/marketplaces/ebay/',
  status: 'documented',
  evidence: 'official',
  apiSurfaces: [
    { name: 'Inventory API', version: 'v1', docsUrl: 'https://developer.ebay.com/develop/api/sell/inventory' },
    { name: 'Fulfillment API', version: 'v1', docsUrl: null },
  ],
  buildSequence: [
    { label: 'Connect a seller account', href: '/marketplaces/ebay/guides/seller-access' },
    { label: 'Sync orders', href: '/marketplaces/ebay/workflows/orders' },
  ],
  pages: [
    { label: 'API directory', href: '/marketplaces/ebay/apis/' },
    { label: 'Changelog', href: '/marketplaces/ebay/changelog' },
  ],
}
const otto = { ...ebay, id: 'otto-api', slug: 'otto', guide: '/marketplaces/otto/', buildSequence: [], pages: [] }

const capabilities = {
  'ebay-sell-api': [
    { id: 'access', label: 'Seller access', guides: [{ title: 'Connect an eBay seller', href: '/marketplaces/ebay/guides/seller-access' }] },
    { id: 'orders', label: 'Order synchronization', guides: [] },
    { id: 'operations', label: 'Operations & reliability', guides: [{ title: 'eBay development guide', href: '/marketplaces/ebay/guides/development-guide' }] },
  ],
}
const coverage = { byMarketplace: { ebay: { apiReferencePages: 4, workflowGuides: 2 } } }

test('only a marketplace folder index is its overview page', () => {
  assert.equal(isMarketplaceOverview('marketplaces/ebay/index.md'), true)
  assert.equal(isMarketplaceOverview('marketplaces/index.md'), false)
  assert.equal(isMarketplaceOverview('marketplaces/ebay/apis/index.md'), false)
  assert.equal(isMarketplaceOverview('docs/glossary.md'), false)
})

test('a page inside a marketplace folder resolves to that marketplace', () => {
  assert.equal(marketplaceForPath('marketplaces/ebay/apis/orders.md', [otto, ebay])?.id, 'ebay-sell-api')
  assert.equal(marketplaceForPath('marketplaces/index.md', [ebay]), null)
  assert.equal(marketplaceForPath('marketplaces/walmart/index.md', [ebay]), null)
  assert.equal(marketplaceForPath('docs/glossary.md', [ebay]), null)
})

test('an API page links an official reference only when the catalog records one for that API', () => {
  assert.equal(officialReference(ebay, 'Inventory API'), 'https://developer.ebay.com/develop/api/sell/inventory')
  assert.equal(officialReference(ebay, 'Fulfillment API'), null)
  assert.equal(officialReference(ebay, 'Finances API'), null)
  assert.equal(officialReference(null, 'Inventory API'), null)
})

test('the hub starts at the first build step, else the first page, else nowhere', () => {
  assert.deepEqual(hubModel(ebay, { capabilities, coverage }).start, ebay.buildSequence[0])
  assert.deepEqual(hubModel({ ...ebay, buildSequence: [] }, { capabilities, coverage }).start, ebay.pages[0])
  assert.equal(hubModel(otto, { capabilities, coverage }).start, null)
})

test('the hub links the API directory only when the marketplace lists one', () => {
  assert.deepEqual(hubModel(ebay, { capabilities, coverage }).apiDirectory, ebay.pages[0])
  assert.equal(hubModel(otto, { capabilities, coverage }).apiDirectory, null)
})

test('hub counts come from the catalog and published pages, defaulting to zero', () => {
  assert.deepEqual(hubModel(ebay, { capabilities, coverage }).counts, {
    apiSurfaces: 2,
    apiReferencePages: 4,
    workflowGuides: 2,
    documentedTopics: 2,
    topics: 3,
  })
  assert.deepEqual(hubModel(otto, { capabilities, coverage }).counts, {
    apiSurfaces: 2,
    apiReferencePages: 0,
    workflowGuides: 0,
    documentedTopics: 0,
    topics: 0,
  })
})

test('hub starting points use the guides filed under the access and operations topics', () => {
  const hub = hubModel(ebay, { capabilities, coverage })
  assert.deepEqual(hub.accessGuides.map((guide) => guide.title), ['Connect an eBay seller'])
  assert.deepEqual(hub.operationsGuides.map((guide) => guide.title), ['eBay development guide'])
  assert.deepEqual(hub.coverage.map((topic) => topic.id), ['access', 'orders', 'operations'])
})

test('the hub claims tests only when the catalog records them', () => {
  assert.equal(hubModel(ebay, { capabilities, coverage }).testsRecorded, false)
  assert.equal(hubModel({ ...ebay, status: 'tested' }, { capabilities, coverage }).testsRecorded, true)
  assert.equal(hubModel({ ...ebay, evidence: 'tested' }, { capabilities, coverage }).testsRecorded, true)
})

test('a page path maps to the route the catalog links use', () => {
  assert.equal(routeForPath('marketplaces/ebay/workflows/orders.md'), '/marketplaces/ebay/workflows/orders')
  assert.equal(routeForPath('marketplaces/ebay/apis/index.md'), '/marketplaces/ebay/apis/')
  assert.equal(routeForPath('index.md'), '/')
})

test("a page's place in its marketplace build sequence is found by route", () => {
  assert.deepEqual(sequencePosition(ebay, '/marketplaces/ebay/workflows/orders'), {
    step: 2,
    total: 2,
    steps: ebay.buildSequence,
    next: null,
  })
  assert.deepEqual(sequencePosition(ebay, '/marketplaces/ebay/guides/seller-access').next, ebay.buildSequence[1])
  assert.equal(sequencePosition(ebay, '/marketplaces/ebay/changelog'), null)
  assert.equal(sequencePosition(null, '/marketplaces/ebay/workflows/orders'), null)
})
