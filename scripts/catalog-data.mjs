import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

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

const guideTypeLabels = {
  integration: 'Integration guide',
  workflow: 'Workflow guide',
  api: 'API guide',
}

// Evidence describes the marketplace's sources, so guides inherit it instead
// of claiming "source-linked" across the board.
function evidenceLabel(evidence = 'unverified') {
  return evidence === 'official' ? 'Source-linked' : `${evidence.charAt(0).toUpperCase()}${evidence.slice(1)}`
}

export function buildGuides(guideCatalog, marketplaces) {
  if (!guideCatalog || !Array.isArray(guideCatalog.topics) || !Array.isArray(guideCatalog.guides)) {
    throw new Error('catalog/guides.yaml must contain topics and guides arrays')
  }

  const topics = guideCatalog.topics.map(({ id, label }) => ({ id, label }))
  const topicLabels = new Map(topics.map((topic) => [topic.id, topic.label]))
  const marketplacesById = new Map(marketplaces.map((marketplace) => [marketplace.id, marketplace]))
  const positions = new Map()

  const guides = guideCatalog.guides.map((guide) => {
    const marketplace = marketplacesById.get(guide.marketplace)
    if (!marketplace) {
      throw new Error(`${guide.id}: unknown marketplace "${guide.marketplace}" (add it to catalog/marketplaces.yaml first)`)
    }
    if (!topicLabels.has(guide.topic)) {
      throw new Error(`${guide.id}: unknown topic "${guide.topic}" (declare it under topics)`)
    }
    const kindLabel = guideTypeLabels[guide.type]
    if (!kindLabel) {
      throw new Error(`${guide.id}: unknown type "${guide.type}" (use ${Object.keys(guideTypeLabels).join(', ')})`)
    }

    const position = (positions.get(marketplace.id) ?? 0) + 1
    positions.set(marketplace.id, position)

    return {
      id: guide.id,
      kind: 'guide',
      kindLabel,
      topic: guide.topic,
      topicLabel: topicLabels.get(guide.topic),
      marketplace: marketplace.id,
      marketplaceName: marketplace.name,
      title: guide.title,
      summary: guide.summary,
      status: evidenceLabel(marketplace.evidence),
      scope: guide.scope,
      tags: guide.tags,
      href: guide.href,
      mark: String(position).padStart(2, '0'),
      markClass: 'platform-mark-guide',
    }
  })

  return { topics, guides }
}

// A route maps to `<route>.md`, or to the folder's index.md / README.md when it
// ends with a slash (VitePress rewrites marketplace README.md files to index.md).
export function findMissingRoutes(root, routes) {
  return routes.filter((route) => {
    const path = route.replace(/^\//, '')
    const candidates = route.endsWith('/') ? [`${path}index.md`, `${path}README.md`] : [`${path}.md`]
    return !candidates.some((candidate) => existsSync(join(root, candidate)))
  })
}

export function loadCatalogData(root = repositoryRoot) {
  const readCatalog = (file) => parse(readFileSync(join(root, 'catalog', file), 'utf8'))
  const marketplaces = buildMarketplaces(readCatalog('marketplaces.yaml'))
  const { topics, guides } = buildGuides(readCatalog('guides.yaml'), marketplaces)

  const missing = findMissingRoutes(root, [
    ...marketplaces.map((marketplace) => marketplace.guide),
    ...guides.map((guide) => guide.href),
  ])
  if (missing.length > 0) {
    throw new Error(`Catalog links point to pages that do not exist: ${missing.join(', ')}`)
  }

  return { marketplaces, topics, guides }
}
