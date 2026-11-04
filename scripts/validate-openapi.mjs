import { readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const ignoredDirectories = new Set(['.git', '.vitepress', 'node_modules', 'dist', 'coverage'])
const apiDefinitionName = /(^|[._-])(openapi|swagger)([._-]|$)/i
const supportedExtension = /\.(json|ya?ml)$/i

async function findApiDefinitions(directory) {
  const definitions = []
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        definitions.push(...(await findApiDefinitions(path)))
      }
    } else if (entry.isFile() && supportedExtension.test(entry.name) && apiDefinitionName.test(entry.name)) {
      definitions.push(path)
    }
  }

  return definitions
}

const definitions = (await findApiDefinitions(root)).sort()
if (definitions.length === 0) {
  console.log('No OpenAPI/Swagger JSON or YAML files found; schema validation skipped.')
  process.exit(0)
}

console.log(`Validating ${definitions.length} OpenAPI/Swagger definition(s):`)
for (const definition of definitions) {
  console.log(`- ${relative(root, definition)}`)
}

const cliPath = join(root, 'node_modules', '@redocly', 'cli', 'bin', 'cli.js')
const result = spawnSync(
  process.execPath,
  [cliPath, 'lint', '--extends=minimal', ...definitions],
  { cwd: root, stdio: 'inherit' },
)

if (result.error) {
  console.error(`Could not run the OpenAPI validator: ${result.error.message}`)
  process.exit(1)
}
process.exit(result.status ?? 1)
