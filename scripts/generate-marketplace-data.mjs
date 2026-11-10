import { readFileSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'yaml'
import { loadCatalogData, logoAssets, repositoryRoot } from './catalog-data.mjs'

const outputDir = join(repositoryRoot, '.vitepress', 'theme', 'generated')
const { marketplaces, topics, guides, capabilities, coverage } = loadCatalogData(repositoryRoot)

const exports = Object.entries({ marketplaces, topics, guides, capabilities, coverage })
  .map(([name, value]) => `export const ${name} = ${JSON.stringify(value, null, 2)}\n`)
  .join('\n')

await mkdir(outputDir, { recursive: true })
await writeFile(
  join(outputDir, 'catalog.mjs'),
  `// Generated from catalog/*.yaml by scripts/generate-marketplace-data.mjs. Do not edit directly.\n${exports}`,
)
// Marketplace logos as files (public/logos/, gitignored), referenced by URL from pages and the sidebar.
const logosDir = join(repositoryRoot, 'public', 'logos')
const logos = logoAssets(parse(readFileSync(join(repositoryRoot, 'catalog', 'marketplaces.yaml'), 'utf8')))
await rm(logosDir, { recursive: true, force: true })
await mkdir(logosDir, { recursive: true })
await Promise.all(logos.map((logo) => writeFile(join(logosDir, logo.file), logo.svg)))

console.log(`Generated ${marketplaces.length} marketplaces, ${guides.length} guides, and ${logos.length} logos from catalog/`)
