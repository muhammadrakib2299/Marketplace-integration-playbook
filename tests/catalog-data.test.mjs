import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { stringify } from 'yaml'
import {
  buildGuides,
  buildMarketplaces,
  countCoverage,
  findMissingRoutes,
  loadCatalogData,
  repositoryRoot,
} from '../scripts/catalog-data.mjs'

// A complete catalog record shaped like the entries in catalog/marketplaces.yaml.
const marketplaceRecord = (overrides = {}) => ({
  id: 'ebay-sell-api',
  name: 'eBay Sell APIs',
  category: 'marketplace',
  regions: ['United States'],
  api_surfaces: [{ name: 'Inventory API', version: 'v1', docs_url: 'https://developer.ebay.com/develop/api/sell' }],
  access_model: 'seller-account',
  status: 'research',
  evidence: 'unverified',
  source_urls: ['https://developer.ebay.com/'],
  last_verified: null,
  guide: '../marketplaces/ebay/README.md',
  summary: 'Synthetic record used only by tests.',
  tags: ['Listings'],
  scope: 'Test scope',
  notes: 'Synthetic fixture.',
  ...overrides,
})

test('repository root resolves to the checkout that holds the catalog', () => {
  assert.ok(
    existsSync(join(repositoryRoot, 'catalog', 'marketplaces.yaml')),
    `expected catalog/marketplaces.yaml under ${repositoryRoot}`,
  )
})

test('a marketplace badge is derived from its own catalog entry, not an Amazon/TikTok switch', () => {
  const [ebay] = buildMarketplaces({ marketplaces: [marketplaceRecord()] })
  assert.equal(ebay.mark, 'e')
  assert.equal(ebay.markClass, 'platform-mark-ebay')
})

test('a catalog guide path becomes the marketplace site route', () => {
  const [ebay] = buildMarketplaces({ marketplaces: [marketplaceRecord()] })
  assert.equal(ebay.guide, '/marketplaces/ebay/')
})

test('a catalog guide path outside marketplaces/<slug>/README.md is rejected', () => {
  assert.throws(
    () => buildMarketplaces({ marketplaces: [marketplaceRecord({ guide: '../marketplaces/ebay/overview.md' })] }),
    /ebay-sell-api.*marketplaces\/<slug>\/README\.md/,
  )
})

// A complete guide record shaped like the entries in catalog/guides.yaml.
const guideRecord = (overrides = {}) => ({
  id: 'ebay-seller-access',
  marketplace: 'ebay-sell-api',
  type: 'integration',
  topic: 'access',
  title: 'Connect an eBay seller account',
  summary: 'Synthetic guide used only by tests.',
  scope: 'OAuth · consent',
  tags: ['OAuth'],
  href: '/marketplaces/ebay/guides/seller-access',
  ...overrides,
})
const guideCatalog = (guides) => ({
  topics: [
    { id: 'access', label: 'Seller access' },
    { id: 'orders', label: 'Order synchronization' },
  ],
  guides,
})
const ottoRecord = (overrides = {}) =>
  marketplaceRecord({ id: 'otto-api', name: 'OTTO Market API', guide: '../marketplaces/otto/README.md', ...overrides })

function withTempRoot(files, run) {
  const root = mkdtempSync(join(tmpdir(), 'playbook-catalog-'))
  try {
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(dirname(join(root, path)), { recursive: true })
      writeFileSync(join(root, path), content)
    }
    return run(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('guides are numbered within each marketplace, restarting for the next marketplace', () => {
  const marketplaces = buildMarketplaces({ marketplaces: [marketplaceRecord(), ottoRecord()] })
  const { guides } = buildGuides(
    guideCatalog([
      guideRecord({ id: 'ebay-a' }),
      guideRecord({ id: 'ebay-b', topic: 'orders' }),
      guideRecord({ id: 'otto-a', marketplace: 'otto-api', href: '/marketplaces/otto/guides/a' }),
    ]),
    marketplaces,
  )
  assert.deepEqual(guides.map((guide) => [guide.id, guide.mark]), [['ebay-a', '01'], ['ebay-b', '02'], ['otto-a', '01']])
})

test("a guide carries its marketplace's evidence label rather than a blanket source-linked claim", () => {
  const marketplaces = buildMarketplaces({
    marketplaces: [marketplaceRecord({ evidence: 'unverified' }), ottoRecord({ evidence: 'official' })],
  })
  const { guides } = buildGuides(
    guideCatalog([guideRecord(), guideRecord({ id: 'otto-a', marketplace: 'otto-api', href: '/marketplaces/otto/guides/a' })]),
    marketplaces,
  )
  assert.deepEqual(guides.map((guide) => guide.status), ['Unverified', 'Source-linked'])
})

test('a guide with an undeclared topic is rejected', () => {
  const marketplaces = buildMarketplaces({ marketplaces: [marketplaceRecord()] })
  assert.throws(() => buildGuides(guideCatalog([guideRecord({ topic: 'shipping' })]), marketplaces), /ebay-seller-access.*topic "shipping"/)
})

test('a guide for a marketplace missing from the catalog is rejected', () => {
  const marketplaces = buildMarketplaces({ marketplaces: [marketplaceRecord()] })
  assert.throws(
    () => buildGuides(guideCatalog([guideRecord({ marketplace: 'walmart-api' })]), marketplaces),
    /ebay-seller-access.*marketplace "walmart-api"/,
  )
})

test('a guide with an unknown type is rejected', () => {
  const marketplaces = buildMarketplaces({ marketplaces: [marketplaceRecord()] })
  assert.throws(() => buildGuides(guideCatalog([guideRecord({ type: 'tutorial' })]), marketplaces), /ebay-seller-access.*type "tutorial"/)
})

test('route check reports only links that have no markdown page', () => {
  const missing = withTempRoot(
    {
      'marketplaces/ebay/README.md': '# eBay\n',
      'marketplaces/ebay/guides/seller-access.md': '# Access\n',
    },
    (root) =>
      findMissingRoutes(root, ['/marketplaces/ebay/', '/marketplaces/ebay/guides/seller-access', '/marketplaces/ebay/guides/orders']),
  )
  assert.deepEqual(missing, ['/marketplaces/ebay/guides/orders'])
})

test('loading the catalog fails when an explorer guide links to a missing page', () => {
  assert.throws(
    () =>
      withTempRoot(
        {
          'marketplaces/ebay/README.md': '# eBay\n',
          'catalog/marketplaces.yaml': stringify({ marketplaces: [marketplaceRecord()] }),
          'catalog/guides.yaml': stringify(guideCatalog([guideRecord()])),
        },
        (root) => loadCatalogData(root),
      ),
    /\/marketplaces\/ebay\/guides\/seller-access/,
  )
})

test('coverage counts API pages and workflows across marketplaces, skipping index pages and the template', () => {
  const coverage = withTempRoot(
    {
      'marketplaces/ebay/apis/index.md': '# APIs\n',
      'marketplaces/ebay/apis/orders.md': '# Orders\n',
      'marketplaces/ebay/apis/listings.md': '# Listings\n',
      'marketplaces/ebay/workflows/order-sync.md': '# Order sync\n',
      'marketplaces/otto/apis/products.md': '# Products\n',
      'marketplaces/otto/guides/development-guide.md': '# Development guide\n',
      'marketplaces/_template/apis/api-template.md': '# Template\n',
      'marketplaces/_template/workflows/order-lifecycle.md': '# Template\n',
    },
    (root) => countCoverage(root),
  )
  assert.deepEqual(coverage, { apiReferencePages: 3, workflowGuides: 1 })
})

test('every documented marketplace in the catalog has at least one explorer guide', () => {
  const { marketplaces, guides } = loadCatalogData(repositoryRoot)
  const uncovered = marketplaces
    .filter((marketplace) => ['documented', 'tested'].includes(marketplace.status))
    .filter((marketplace) => !guides.some((guide) => guide.marketplace === marketplace.id))
    .map((marketplace) => marketplace.id)
  assert.deepEqual(uncovered, [])
})
