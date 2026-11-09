import { defineConfig } from 'vitepress'

const repositoryUrl = 'https://github.com/muhammadrakib2299/Marketplace-integration-playbook'

export default defineConfig({
  lang: 'en-US',
  // VitePress persists the user's selection in localStorage (`vitepress-theme-appearance`).
  appearance: true,
  title: 'Marketplace Integration Playbook',
  description:
    'A source-linked developer handbook for seller authorization, marketplace APIs, data migration, and reliable operations.',
  srcExclude: [
    'README.md',
    'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md',
    'SECURITY.md',
    '.github/**',
    'marketplaces/_template/**',
  ],
  rewrites: {
    'marketplaces/:marketplace/README.md': 'marketplaces/:marketplace/index.md',
  },
  themeConfig: {
    lightModeSwitchTitle: 'Switch to light mode',
    darkModeSwitchTitle: 'Switch to dark mode',
    nav: [
      { text: 'Marketplaces', link: '/marketplaces/' },
      {
        text: 'Amazon SP-API',
        items: [
          { text: 'Overview', link: '/marketplaces/amazon/' },
          { text: 'API directory', link: '/marketplaces/amazon/apis/' },
          { text: 'Seller onboarding', link: '/marketplaces/amazon/guides/seller-onboarding' },
          { text: 'Active listing migration', link: '/marketplaces/amazon/workflows/active-listing-migration' },
          { text: 'Development guide', link: '/marketplaces/amazon/guides/development-guide' },
        ],
      },
      {
        text: 'Engineering',
        items: [
          { text: 'Integration principles', link: '/docs/integration-principles' },
          { text: 'Lifecycle and evidence status', link: '/docs/lifecycle-and-status' },
          { text: 'API schema validation', link: '/docs/api-schema-validation' },
          { text: 'Glossary', link: '/docs/glossary' },
        ],
      },
    ],
    sidebar: {
      '/marketplaces/': [
        {
          text: 'Marketplace directory',
          items: [
            { text: 'All marketplaces', link: '/marketplaces/' },
            { text: 'Amazon SP-API', link: '/marketplaces/amazon/' },
            { text: 'TikTok Shop Partner API', link: '/marketplaces/tiktok-shop/' },
          ],
        },
        {
          text: 'Amazon · Build sequence',
          items: [
            { text: 'Overview', link: '/marketplaces/amazon/' },
            { text: '1. API directory and map', link: '/marketplaces/amazon/apis/' },
            { text: '2. Connect a seller account', link: '/marketplaces/amazon/guides/seller-onboarding' },
            { text: '3. Migrate active listings', link: '/marketplaces/amazon/workflows/active-listing-migration' },
            { text: '4. Development guide', link: '/marketplaces/amazon/guides/development-guide' },
            { text: '5. Order synchronization', link: '/marketplaces/amazon/workflows/order-lifecycle' },
            { text: '6. Seller-fulfilled listings', link: '/marketplaces/amazon/workflows/inventory-and-listings' },
            { text: 'Catalog Items API', link: '/marketplaces/amazon/apis/catalog-items' },
            { text: 'Catalog Items operations', link: '/marketplaces/amazon/apis/catalog-items-reference' },
            { text: 'Seller vs. Vendor APIs', link: '/marketplaces/amazon/apis/seller-vendor-comparison' },
            { text: 'Listings Items API', link: '/marketplaces/amazon/apis/listings-items' },
            { text: 'Orders API', link: '/marketplaces/amazon/apis/orders' },
            { text: 'Reports API', link: '/marketplaces/amazon/apis/reports' },
            { text: 'Finances API', link: '/marketplaces/amazon/apis/finances' },
            { text: 'Feeds API', link: '/marketplaces/amazon/apis/feeds' },
            { text: 'FBA Inventory API', link: '/marketplaces/amazon/apis/fba-inventory' },
            { text: 'Notifications integration', link: '/marketplaces/amazon/guides/notifications-integration' },
          ],
        },
        {
          text: 'TikTok Shop · Partner API',
          items: [
            { text: 'Overview', link: '/marketplaces/tiktok-shop/' },
            { text: 'API directory and workflow map', link: '/marketplaces/tiktok-shop/apis/' },
            { text: 'Development guide', link: '/marketplaces/tiktok-shop/guides/development-guide' },
            { text: 'Authorization and tokens', link: '/marketplaces/tiktok-shop/apis/authorization' },
            { text: 'Products API', link: '/marketplaces/tiktok-shop/apis/products' },
            { text: 'Order API', link: '/marketplaces/tiktok-shop/apis/orders' },
            { text: 'Fulfillment, logistics, and finance', link: '/marketplaces/tiktok-shop/apis/fulfillment' },
            { text: 'Returns and refunds', link: '/marketplaces/tiktok-shop/apis/returns-refunds' },
            { text: 'Events and reliability', link: '/marketplaces/tiktok-shop/apis/events' },
            { text: 'Get Authorized Category Assets · 202405', link: '/marketplaces/tiktok-shop/apis/authorized-category-assets' },
          ],
        },
      ],
      '/docs/': [
        {
          text: 'Repository guides',
          items: [
            { text: 'Integration principles', link: '/docs/integration-principles' },
            { text: 'Lifecycle and status', link: '/docs/lifecycle-and-status' },
            { text: 'Glossary', link: '/docs/glossary' },
            { text: 'Documentation checks', link: '/docs/github-actions' },
            { text: 'API schema validation', link: '/docs/api-schema-validation' },
            { text: 'Vercel deployment', link: '/docs/site-deployment' },
          ],
        },
      ],
    },
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: repositoryUrl }],
    editLink: {
      pattern: `${repositoryUrl}/edit/main/:path`,
      text: 'Edit this page on GitHub',
    },
  },
})
