import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMarketplaces } from '../scripts/catalog-data.mjs'
import { buildSidebar } from '../scripts/sidebar.mjs'
import { marketplaceRecord, ottoRecord } from './catalog-fixtures.mjs'

const docs = [
  { label: 'Integration principles', href: '/docs/integration-principles' },
  { label: 'Glossary', href: '/docs/glossary' },
]

const ebay = (overrides = {}) =>
  marketplaceRecord({
    status: 'documented',
    build_sequence: [
      { label: 'Connect a seller account', href: '/marketplaces/ebay/guides/seller-access' },
      { label: 'Sync orders', href: '/marketplaces/ebay/workflows/order-sync' },
    ],
    pages: [
      { label: 'Orders API', href: '/marketplaces/ebay/apis/orders' },
      { label: 'Feeds API', href: '/marketplaces/ebay/apis/feeds' },
    ],
    ...overrides,
  })

const sidebarFor = (records, versions = {}) =>
  buildSidebar({
    marketplaces: buildMarketplaces({ marketplaces: records }),
    versionOf: (href) => versions[href],
    docs,
  })

test('a build sequence becomes numbered steps in catalog order', () => {
  const [, marketplaceGroup] = sidebarFor([ebay()])['/marketplaces/ebay/']
  assert.deepEqual(
    marketplaceGroup.items.map((item) => [item.text, item.link]),
    [
      ['Overview', '/marketplaces/ebay/'],
      ['<span class="mip-step">1</span>Connect a seller account', '/marketplaces/ebay/guides/seller-access'],
      ['<span class="mip-step">2</span>Sync orders', '/marketplaces/ebay/workflows/order-sync'],
    ],
  )
})

test('a version chip appears only when the page declares a version', () => {
  const [, , pagesGroup] = sidebarFor([ebay()], { '/marketplaces/ebay/apis/orders': '2026-01-01' })['/marketplaces/ebay/']
  assert.deepEqual(
    pagesGroup.items.map((item) => item.text),
    ['Orders API<span class="mip-chip">2026-01-01</span>', 'Feeds API'],
  )
})

test('the marketplace group title carries the logo, name, and status badge', () => {
  const [, marketplaceGroup] = sidebarFor([ebay({ logo: 'tiktok' })])['/marketplaces/ebay/']
  assert.match(
    marketplaceGroup.text,
    /<span class="mip-logo" data-tone="dark" style="--mip-logo-color:#000000;--mip-logo-src:url\(\/logos\/tiktok\.svg\)"[^>]*><span class="mip-logo-glyph"><\/span><\/span>/,
  )
  assert.doesNotMatch(marketplaceGroup.text, /<path/)
  assert.match(marketplaceGroup.text, /eBay Sell APIs/)
  assert.match(marketplaceGroup.text, /<span class="mip-badge mip-badge--documented">Documented<\/span>/)
})

test('a marketplace without a logo shows its monogram', () => {
  const [, marketplaceGroup] = sidebarFor([ebay()])['/marketplaces/ebay/']
  assert.match(marketplaceGroup.text, /<span class="mip-logo mip-logo--mono"[^>]*>e<\/span>/)
})

test('labels are HTML-escaped', () => {
  const sidebar = sidebarFor([ebay({ pages: [{ label: 'Rate limits & <quotas>', href: '/marketplaces/ebay/apis/limits' }] })])
  const [, , pagesGroup] = sidebar['/marketplaces/ebay/']
  assert.equal(pagesGroup.items[0].text, 'Rate limits &amp; &lt;quotas&gt;')
})

test('the directory count matches the catalog', () => {
  const [overview] = sidebarFor([ebay(), ottoRecord()])['/marketplaces/']
  assert.equal(overview.items[1].text, 'Marketplace directory<span class="mip-count">2</span>')
  assert.equal(overview.items[1].link, '/marketplaces/')
})

// The directory page itself lists every marketplace; its sidebar names only the latest few.
test('the directory sidebar lists at most eight marketplaces, most recently verified first', () => {
  const records = Array.from({ length: 10 }, (_, index) =>
    ottoRecord({
      id: `market-${index}`,
      name: `Market ${index}`,
      guide: `../marketplaces/market-${index}/README.md`,
      last_verified: `2026-10-${String(10 + index).padStart(2, '0')}`,
    }),
  )
  const [, recent] = sidebarFor(records)['/marketplaces/']
  assert.equal(recent.text, 'Recently verified')
  assert.equal(recent.items.length, 8)
  assert.equal(recent.items[0].link, '/marketplaces/market-9/')
})

test('each marketplace gets a sidebar keyed by its route', () => {
  const sidebar = sidebarFor([ebay(), ottoRecord()])
  assert.deepEqual(Object.keys(sidebar).sort(), ['/docs/', '/marketplaces/', '/marketplaces/ebay/', '/marketplaces/otto/'])
})
