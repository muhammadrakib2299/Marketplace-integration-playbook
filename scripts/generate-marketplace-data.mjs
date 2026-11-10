import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse } from 'yaml'
import { buildMarketplaces, repositoryRoot as root } from './catalog-data.mjs'

const catalogPath = resolve(root, 'catalog/marketplaces.yaml')
const outputDir = resolve(root, '.vitepress/theme/generated')
const outputPath = resolve(outputDir, 'marketplaces.mjs')

const marketplaces = buildMarketplaces(parse(await readFile(catalogPath, 'utf8')))

await mkdir(outputDir, { recursive: true })
await writeFile(
  outputPath,
  `// Generated from catalog/marketplaces.yaml. Do not edit directly.\nexport const marketplaces = ${JSON.stringify(marketplaces, null, 2)}\n`,
)
console.log(`Generated ${marketplaces.length} marketplace records from catalog/marketplaces.yaml`)
