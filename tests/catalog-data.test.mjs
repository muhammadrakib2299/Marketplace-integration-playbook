import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { buildMarketplaces, repositoryRoot } from '../scripts/catalog-data.mjs'

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
