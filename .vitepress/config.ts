import { defineConfigWithTheme, type DefaultTheme } from 'vitepress'
import { findMissingRoutes, loadCatalogData, readFrontmatter, repositoryRoot } from '../scripts/catalog-data.mjs'
import { buildSidebar } from '../scripts/sidebar.mjs'

const repositoryUrl = 'https://github.com/muhammadrakib2299/Marketplace-integration-playbook'

// Engineering docs, shared by the top nav and the /docs/ sidebar.
const docs = [
  { label: 'Integration principles', href: '/docs/integration-principles' },
  { label: 'Lifecycle and evidence status', href: '/docs/lifecycle-and-status' },
  { label: 'Glossary', href: '/docs/glossary' },
  { label: 'Documentation checks', href: '/docs/github-actions' },
  { label: 'API schema validation', href: '/docs/api-schema-validation' },
  { label: 'Vercel deployment', href: '/docs/site-deployment' },
]

const missingDocs = findMissingRoutes(repositoryRoot, docs.map((doc) => doc.href))
if (missingDocs.length > 0) {
  throw new Error(`Engineering links point to pages that do not exist: ${missingDocs.join(', ')}`)
}

// Marketplace navigation comes from catalog/marketplaces.yaml (build_sequence, pages, logo).
const { marketplaces } = loadCatalogData(repositoryRoot)

export default defineConfigWithTheme<DefaultTheme.Config & { buildDate: string }>({
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
    // Internal design specs and plans for the site itself; not published.
    'docs/superpowers/**',
  ],
  rewrites: {
    'marketplaces/:marketplace/README.md': 'marketplaces/:marketplace/index.md',
  },
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/brand-mark.svg' }]],
  markdown: {
    // Code blocks use dark panels in both themes, as in the mockup.
    theme: { light: 'github-dark', dark: 'github-dark' },
  },
  themeConfig: {
    logo: '/brand-mark.svg',
    buildDate: new Date().toISOString().slice(0, 10),
    lightModeSwitchTitle: 'Switch to light mode',
    darkModeSwitchTitle: 'Switch to dark mode',
    // Test reports, Limits & quotas, and Guidelines join the nav in phase 5, when their pages exist.
    nav: [
      { text: 'Directory', link: '/marketplaces/' },
      { text: 'Engineering', items: docs.map((doc) => ({ text: doc.label, link: doc.href })) },
    ],
    sidebar: buildSidebar({
      marketplaces,
      versionOf: (href: string) => readFrontmatter(repositoryRoot, href).version,
      docs,
    }),
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Search marketplaces, APIs, workflows…',
            buttonAriaLabel: 'Search the playbook',
          },
        },
      },
    },
    socialLinks: [{ icon: 'github', link: repositoryUrl }],
    editLink: {
      pattern: `${repositoryUrl}/edit/main/:path`,
      text: 'Edit this page on GitHub',
    },
    footer: {
      message:
        'Marketplace names and logos are trademarks of their respective owners. This is an independent resource; no endorsement is implied.',
    },
  },
})
