import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as simpleIcons from 'simple-icons'
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
      slug,
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
      apiSurfaces: record.api_surfaces.map((surface) => ({
        name: surface.name,
        version: surface.version ?? null,
        docsUrl: surface.docs_url ?? null,
      })),
      guide: `/marketplaces/${slug}/`,
      source: record.source_urls[0],
      sourceUrls: record.source_urls,
      lastVerified: record.last_verified,
      mark: name.charAt(0).toLowerCase(),
      markClass: `platform-mark-${slug}`,
      logo: resolveLogo(record),
      buildSequence: navigationList(record, 'build_sequence'),
      pages: navigationList(record, 'pages'),
    }
  })
}

// Logo colours near black or white disappear on one of the two themes; the shell
// swaps those to the ink colour (see the .mip-logo rules in shell.css).
export function logoTone(hex) {
  const [red, green, blue] = [0, 2, 4].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue
  if (luminance < 0.1) return 'dark'
  if (luminance > 0.8) return 'bright'
  return 'mid'
}

// Logos are opt-in: the catalog names a Simple Icons slug, or the monogram is used.
function resolveLogo(record) {
  if (!record.logo) return null
  const icon = Object.values(simpleIcons).find((candidate) => candidate.slug === record.logo)
  if (!icon) {
    throw new Error(`${record.id}: logo "${record.logo}" is not a Simple Icons slug in the installed simple-icons version`)
  }
  return { title: icon.title, hex: icon.hex, path: icon.path, tone: logoTone(icon.hex) }
}

function navigationList(record, field) {
  const items = record[field] ?? []
  if (!Array.isArray(items)) {
    throw new Error(`${record.id}: ${field} must be a list of { label, href } entries`)
  }
  return items.map((item, index) => {
    const label = typeof item?.label === 'string' ? item.label.trim() : ''
    if (!label || typeof item?.href !== 'string' || !item.href.startsWith('/')) {
      throw new Error(`${record.id}: ${field}[${index}] needs a non-empty label and an href starting with /`)
    }
    return { label, href: item.href }
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
function pageFile(root, route) {
  const path = route.replace(/^\//, '')
  const candidates = route.endsWith('/') ? [`${path}index.md`, `${path}README.md`] : [`${path}.md`]
  return candidates.map((candidate) => join(root, candidate)).find((candidate) => existsSync(candidate))
}

export function findMissingRoutes(root, routes) {
  return routes.filter((route) => !pageFile(root, route))
}

// The YAML frontmatter of the page a route points to, or {} when it has none.
// `yaml` follows YAML 1.2, so dates such as 2026-01-01 stay strings here.
export function readFrontmatter(root, route) {
  const file = pageFile(root, route)
  if (!file) throw new Error(`No page for route ${route}`)
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(readFileSync(file, 'utf8'))
  return match ? (parse(match[1]) ?? {}) : {}
}

// Per marketplace, which guide topics this playbook documents. A capability is "documented"
// only when a guide on that topic exists; nothing is inferred from the API alone.
export function buildCapabilities(marketplaces, guides, topics) {
  return Object.fromEntries(
    marketplaces.map((marketplace) => [
      marketplace.id,
      topics.map((topic) => ({
        id: topic.id,
        label: topic.label,
        guides: guides
          .filter((guide) => guide.marketplace === marketplace.id && guide.topic === topic.id)
          .map((guide) => ({ title: guide.title, href: guide.href })),
      })),
    ]),
  )
}

// Counts the published pages behind the homepage coverage figures. Folders
// starting with "_" (the template) and section index pages are not counted.
export function countCoverage(root = repositoryRoot) {
  const marketplacesDir = join(root, 'marketplaces')
  const pagesIn = (dir) =>
    existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.md') && file !== 'index.md').length : 0

  const byMarketplace = Object.fromEntries(
    readdirSync(marketplacesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
      .map((folder) => [
        folder.name,
        {
          apiReferencePages: pagesIn(join(marketplacesDir, folder.name, 'apis')),
          workflowGuides: pagesIn(join(marketplacesDir, folder.name, 'workflows')),
        },
      ]),
  )
  const counts = Object.values(byMarketplace)
  return {
    apiReferencePages: counts.reduce((total, count) => total + count.apiReferencePages, 0),
    workflowGuides: counts.reduce((total, count) => total + count.workflowGuides, 0),
    byMarketplace,
  }
}

export function loadCatalogData(root = repositoryRoot) {
  const readCatalog = (file) => parse(readFileSync(join(root, 'catalog', file), 'utf8'))
  const marketplaces = buildMarketplaces(readCatalog('marketplaces.yaml'))
  const { topics, guides } = buildGuides(readCatalog('guides.yaml'), marketplaces)

  const missing = findMissingRoutes(root, [
    ...marketplaces.flatMap((marketplace) => [
      marketplace.guide,
      ...marketplace.buildSequence.map((step) => step.href),
      ...marketplace.pages.map((page) => page.href),
    ]),
    ...guides.map((guide) => guide.href),
  ])
  if (missing.length > 0) {
    throw new Error(`Catalog links point to pages that do not exist: ${missing.join(', ')}`)
  }

  return {
    marketplaces,
    topics,
    guides,
    capabilities: buildCapabilities(marketplaces, guides, topics),
    coverage: countCoverage(root),
  }
}
