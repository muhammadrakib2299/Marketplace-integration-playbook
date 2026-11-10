// Page-level context for the theme: which marketplace a page belongs to, and the view
// model for a marketplace overview ("hub") page. Pure functions over generated catalog data.

const overviewPattern = /^marketplaces\/[^/]+\/index\.md$/

// VitePress rewrites marketplaces/<slug>/README.md to index.md, so relativePath ends in index.md.
export function isMarketplaceOverview(relativePath) {
  return overviewPattern.test(relativePath)
}

export function marketplaceForPath(relativePath, marketplaces) {
  const [section, slug, ...rest] = relativePath.split('/')
  if (section !== 'marketplaces' || rest.length === 0) return null
  return marketplaces.find((marketplace) => marketplace.guide === `/marketplaces/${slug}/`) ?? null
}

// The catalog's docs link for the API surface a page documents; null when none is recorded.
export function officialReference(marketplace, apiName) {
  return marketplace?.apiSurfaces.find((surface) => surface.name === apiName)?.docsUrl ?? null
}

// 'marketplaces/x/apis/index.md' → '/marketplaces/x/apis/'; 'marketplaces/x/guides/a.md' → '/marketplaces/x/guides/a'.
export function routeForPath(relativePath) {
  return `/${relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')}`
}

// Where a page sits in its marketplace's numbered build sequence (catalog build_sequence), or null.
export function sequencePosition(marketplace, route) {
  const steps = marketplace?.buildSequence ?? []
  const index = steps.findIndex((step) => step.href === route)
  if (index === -1) return null
  return { step: index + 1, total: steps.length, steps, next: steps[index + 1] ?? null }
}

const guidesOn = (topics, id) => topics.find((topic) => topic.id === id)?.guides ?? []

export function hubModel(marketplace, { capabilities, coverage }) {
  const topics = capabilities[marketplace.id] ?? []
  const pages = coverage.byMarketplace[marketplace.slug] ?? { apiReferencePages: 0, workflowGuides: 0 }
  const links = [...marketplace.buildSequence, ...marketplace.pages]

  return {
    start: links[0] ?? null,
    apiDirectory: links.find((link) => link.href === `${marketplace.guide}apis/`) ?? null,
    counts: {
      apiSurfaces: marketplace.apiSurfaces.length,
      apiReferencePages: pages.apiReferencePages,
      workflowGuides: pages.workflowGuides,
      documentedTopics: topics.filter((topic) => topic.guides.length > 0).length,
      topics: topics.length,
    },
    accessGuides: guidesOn(topics, 'access'),
    operationsGuides: guidesOn(topics, 'operations'),
    coverage: topics,
    // "Tested" is reserved for behaviour observed in an authorised environment (docs/lifecycle-and-status.md).
    testsRecorded: marketplace.status === 'tested' || marketplace.evidence === 'tested',
  }
}
