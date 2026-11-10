import { defineConfigWithTheme, type DefaultTheme } from 'vitepress'
import { findMissingRoutes, loadCatalogData, readFrontmatter, repositoryRoot } from '../scripts/catalog-data.mjs'
import { renderMethodCode } from '../scripts/markdown-methods.mjs'
import { pageContext } from '../scripts/page-context.mjs'
import { footerMarketplaces, themeRoutes } from '../scripts/site-links.mjs'
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

// Engineering docs and the routes theme components link to (scripts/site-links.mjs): neither
// VitePress's dead-link check nor lychee sees links that live outside Markdown.
const missingRoutes = findMissingRoutes(repositoryRoot, [...docs.map((doc) => doc.href), ...themeRoutes()])
if (missingRoutes.length > 0) {
  throw new Error(`Theme links point to pages that do not exist: ${missingRoutes.join(', ')}`)
}

// Marketplace navigation comes from catalog/marketplaces.yaml (build_sequence, pages, logo).
const { marketplaces, capabilities, coverage } = loadCatalogData(repositoryRoot)

type FooterLink = { text: string; link: string }

export default defineConfigWithTheme<
  DefaultTheme.Config & { buildDate: string; siteFooter: { marketplaces: FooterLink[]; engineering: FooterLink[] } }
>({
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
  // Site data, including the sidebar, ships as one cached chunk instead of inside every HTML page.
  metaChunk: true,
  // Marketplace context for the layout components (hub, sequence bar, dossier header), computed per page
  // here so the shared theme bundle does not grow with the catalog (scripts/page-context.mjs).
  transformPageData(pageData) {
    const context = pageContext(pageData.relativePath, pageData.frontmatter, { marketplaces, capabilities, coverage })
    if (context) pageData.frontmatter.mip = context
  },
  rewrites: {
    'marketplaces/:marketplace/README.md': 'marketplaces/:marketplace/index.md',
  },
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/brand-mark.svg' }]],
  markdown: {
    // Code blocks use dark panels in both themes, as in the mockup.
    theme: { light: 'github-dark', dark: 'github-dark' },
    config: (md) => {
      // Wrap tables so wide ones scroll inside a rounded frame instead of widening the page.
      md.renderer.rules.table_open = () => '<div class="mip-table"><table>\n'
      md.renderer.rules.table_close = () => '</table></div>\n'
      // `GET /path` inline code becomes a method badge followed by the path.
      const defaultCodeInline = md.renderer.rules.code_inline!
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) =>
        renderMethodCode(tokens[idx].content) ?? defaultCodeInline(tokens, idx, options, env, self)
    },
  },
  themeConfig: {
    // One-word brand in the top bar; the full name stays in page titles and metadata.
    siteTitle: 'Playbook',
    logo: '/brand-mark.svg',
    buildDate: new Date().toISOString().slice(0, 10),
    // A bounded footer: a few recently verified marketplaces, never the whole catalog.
    siteFooter: {
      marketplaces: footerMarketplaces(marketplaces),
      engineering: docs.slice(0, 4).map((doc) => ({ text: doc.label, link: doc.href })),
    },
    lightModeSwitchTitle: 'Switch to light mode',
    darkModeSwitchTitle: 'Switch to dark mode',
    // Test reports, Limits & quotas, and Guidelines join the nav in phase 5, when their pages exist.
    // Marketplaces are never listed by name here: the catalog will grow to 100+ entries, so the
    // directory and the per-marketplace sidebar carry them.
    nav: [
      { text: 'Marketplaces', link: '/marketplaces/', activeMatch: '^/marketplaces/' },
      { text: 'Engineering', activeMatch: '^/docs/', items: docs.map((doc) => ({ text: doc.label, link: doc.href })) },
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
    // No themeConfig.footer: SiteFooter (Layout.vue) renders the footer on every page, including the trademark notice.
  },
})
