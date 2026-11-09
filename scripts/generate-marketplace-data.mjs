import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse } from 'yaml'

const root = resolve(new URL('..', import.meta.url).pathname)
const catalogPath = resolve(root, 'catalog/marketplaces.yaml')
const outputDir = resolve(root, '.vitepress/theme/generated')
const outputPath = resolve(outputDir, 'marketplaces.mjs')

const catalog = parse(await (await import('node:fs/promises')).readFile(catalogPath, 'utf8'))
if (!catalog || !Array.isArray(catalog.marketplaces)) {
  throw new Error('catalog/marketplaces.yaml must contain a marketplaces array')
}

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

const marketplaces = catalog.marketplaces.map((record) => {
  const slug = record.id.replace(/-api$|-/g, '-')
  const name = record.name.replace(/ \(SP-API\)$/, '')
  const apis = record.api_surfaces.map((surface) => `${surface.name}${surface.version ? ` · ${surface.version}` : ''}`)
  const categoryLabel = categoryLabels[record.category] ?? record.category.replace(/-/g, ' ')
  const statusLabel = `${statusLabels[record.status] ?? record.status} · ${record.evidence === 'official' ? 'source-linked' : record.evidence}`
  const isAmazon = record.id.startsWith('amazon')

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
    guide: record.guide.replace(/^\.\./, ''),
    source: record.source_urls[0],
    lastVerified: record.last_verified,
    mark: isAmazon ? 'a' : 't',
    markClass: isAmazon ? 'platform-mark-amazon' : 'platform-mark-tiktok',
  }
})

await mkdir(outputDir, { recursive: true })
await writeFile(
  outputPath,
  `// Generated from catalog/marketplaces.yaml. Do not edit directly.\nexport const marketplaces = ${JSON.stringify(marketplaces, null, 2)}\n`,
)
console.log(`Generated ${marketplaces.length} marketplace records from catalog/marketplaces.yaml`)
