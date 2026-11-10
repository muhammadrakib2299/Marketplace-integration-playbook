import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { loadCatalogData, repositoryRoot } from './catalog-data.mjs'

const outputDir = join(repositoryRoot, '.vitepress', 'theme', 'generated')
const { marketplaces, topics, guides, coverage } = loadCatalogData(repositoryRoot)

const exports = Object.entries({ marketplaces, topics, guides, coverage })
  .map(([name, value]) => `export const ${name} = ${JSON.stringify(value, null, 2)}\n`)
  .join('\n')

await mkdir(outputDir, { recursive: true })
await writeFile(
  join(outputDir, 'catalog.mjs'),
  `// Generated from catalog/*.yaml by scripts/generate-marketplace-data.mjs. Do not edit directly.\n${exports}`,
)
console.log(`Generated ${marketplaces.length} marketplaces and ${guides.length} guides from catalog/`)
