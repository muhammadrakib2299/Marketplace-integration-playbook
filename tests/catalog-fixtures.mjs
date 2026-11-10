// Shared test fixtures (not a test file: `npm test` only runs tests/*.test.mjs).

// A complete catalog record shaped like the entries in catalog/marketplaces.yaml.
export const marketplaceRecord = (overrides = {}) => ({
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

export const ottoRecord = (overrides = {}) =>
  marketplaceRecord({ id: 'otto-api', name: 'OTTO Market API', guide: '../marketplaces/otto/README.md', ...overrides })
