import { defineConfig } from 'vitepress'

const repositoryUrl = 'https://github.com/muhammadrakib2299/Marketplace-integration-playbook'

export default defineConfig({
  lang: 'en-US',
  title: 'Marketplace Integration Playbook',
  description:
    'A source-linked developer handbook for marketplace APIs, integration workflows, and implementation guidance.',
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
    nav: [
      { text: 'Marketplaces', link: '/marketplaces/' },
      { text: 'Guides', link: '/docs/integration-principles' },
      { text: 'GitHub', link: repositoryUrl },
    ],
    sidebar: {
      '/marketplaces/': [
        {
          text: 'Directory',
          items: [
            { text: 'All marketplaces', link: '/marketplaces/' },
            { text: 'Amazon SP-API', link: '/marketplaces/amazon/' },
          ],
        },
        {
          text: 'Amazon SP-API',
          items: [
            { text: 'Overview', link: '/marketplaces/amazon/' },
            { text: 'API catalog', link: '/marketplaces/amazon/apis/' },
            {
              text: 'Development guide',
              link: '/marketplaces/amazon/guides/development-guide',
            },
            {
              text: 'Order synchronization',
              link: '/marketplaces/amazon/workflows/order-lifecycle',
            },
            {
              text: 'Listings and inventory',
              link: '/marketplaces/amazon/workflows/inventory-and-listings',
            },
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
