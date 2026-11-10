import { fileURLToPath } from 'node:url'

// Absolute path of the repository checkout (the directory above scripts/).
// fileURLToPath keeps Windows drive letters intact; URL.pathname would turn
// D:\repo into /D:/repo, which path.resolve then mangles into D:\D:\repo.
export const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))

const categoryLabels = {
  marketplace: 'Marketplace',
  'social-commerce': 'Social commerce',
}
const statusLabels = {
  documented: 'Documented',
  tested: 'Tested',
  research: 'Research',
  blocked: 'Blocked',
  deprecated: 'Deprecated',
}

// The marketplace folder name is the stable slug (see CONTRIBUTING.md), so it
// drives the site route and the badge style instead of per-provider checks.
const guidePathPattern = /^\.\.\/marketplaces\/([a-z0-9]+(?:-[a-z0-9]+)*)\/README\.md$/

function marketplaceSlug(record) {
  const match = guidePathPattern.exec(record.guide ?? '')
  if (!match) {
    throw new Error(`${record.id}: guide must point to ../marketplaces/<slug>/README.md (got ${record.guide})`)
  }
  return match[1]
}

export function buildMarketplaces(catalog) {
  if (!catalog || !Array.isArray(catalog.marketplaces)) {
    throw new Error('catalog/marketplaces.yaml must contain a marketplaces array')
  }

  return catalog.marketplaces.map((record) => {
    const slug = marketplaceSlug(record)
    const name = record.name.replace(/ \(SP-API\)$/, '')
    const apis = record.api_surfaces.map((surface) => `${surface.name}${surface.version ? ` · ${surface.version}` : ''}`)
    const categoryLabel = categoryLabels[record.category] ?? record.category.replace(/-/g, ' ')
    const statusLabel = `${statusLabels[record.status] ?? record.status} · ${record.evidence === 'official' ? 'source-linked' : record.evidence}`

    return {
      id: record.id,
      name,
      fullName: record.name,
      category: record.category,
      categoryLabel,
      regions: record.regions,
      access: record.access_model.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
      status: record.status,
      statusLabel,
      evidence: record.evidence,
      summary: record.summary,
      tags: record.tags,
      scope: record.scope,
      apis,
      guide: `/marketplaces/${slug}/`,
      source: record.source_urls[0],
      lastVerified: record.last_verified,
      mark: name.charAt(0).toLowerCase(),
      markClass: `platform-mark-${slug}`,
    }
  })
}
