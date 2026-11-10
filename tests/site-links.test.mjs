import test from 'node:test'
import assert from 'node:assert/strict'
import { findMissingRoutes, repositoryRoot } from '../scripts/catalog-data.mjs'
import { footerMarketplaces, themeRoutes } from '../scripts/site-links.mjs'

const entry = (name, lastVerified) => ({ name, guide: `/marketplaces/${name.toLowerCase()}/`, lastVerified })

test('the footer lists at most four marketplaces, most recently verified first', () => {
  const catalog = [
    entry('Etsy', '2026-09-01'),
    entry('Amazon', '2026-11-05'),
    entry('Otto', null),
    entry('TikTok', '2026-11-10'),
    entry('Zalando', '2026-10-01'),
    entry('eBay', '2026-08-01'),
  ]
  assert.deepEqual(footerMarketplaces(catalog), [
    { text: 'TikTok', link: '/marketplaces/tiktok/' },
    { text: 'Amazon', link: '/marketplaces/amazon/' },
    { text: 'Zalando', link: '/marketplaces/zalando/' },
    { text: 'Etsy', link: '/marketplaces/etsy/' },
  ])
})

// These links live in Vue components, where neither VitePress's dead-link check nor lychee looks.
test('every route the theme components link to has a page', () => {
  assert.deepEqual(findMissingRoutes(repositoryRoot, themeRoutes()), [])
})
