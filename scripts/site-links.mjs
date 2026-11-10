// Routes the theme components link to outside Markdown. VitePress's dead-link check and lychee
// only see Markdown, so .vitepress/config.ts and tests/site-links.test.mjs check these instead.
// Client-safe: the homepage imports it.
import { sortMarketplaces } from './directory.mjs'

// The homepage's integration path, with Amazon SP-API as the worked example.
export const integrationPath = [
  {
    title: 'Connect a seller account',
    text: 'Register the app, request seller consent, and verify regional access before any data moves.',
    link: '/marketplaces/amazon/guides/seller-onboarding',
  },
  {
    title: 'Migrate existing listings',
    text: 'Capture a baseline, validate product types, and stage writes you can reconcile.',
    link: '/marketplaces/amazon/workflows/active-listing-migration',
  },
  {
    title: 'Sync orders incrementally',
    text: 'Poll by update time, drain pagination, and persist each page before advancing.',
    link: '/marketplaces/amazon/workflows/order-lifecycle',
  },
  {
    title: 'Operate reliably',
    text: 'Plan for rate limits, retries, notifications, and safe reauthorization.',
    link: '/marketplaces/amazon/guides/development-guide',
  },
]

// The page the homepage walkthrough (WorkflowDemo.vue) summarises.
export const walkthroughLink = '/marketplaces/amazon/workflows/order-lifecycle'

// The footer names a bounded set of marketplaces, so it stays short as the catalog passes 100 entries.
export function footerMarketplaces(marketplaces, limit = 4) {
  return sortMarketplaces(marketplaces, 'recent')
    .slice(0, limit)
    .map((marketplace) => ({ text: marketplace.name, link: marketplace.guide }))
}

export const themeRoutes = () => [...integrationPath.map((step) => step.link), walkthroughLink]
