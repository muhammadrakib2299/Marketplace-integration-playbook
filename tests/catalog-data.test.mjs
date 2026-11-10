import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { repositoryRoot } from '../scripts/catalog-data.mjs'

test('repository root resolves to the checkout that holds the catalog', () => {
  assert.ok(
    existsSync(join(repositoryRoot, 'catalog', 'marketplaces.yaml')),
    `expected catalog/marketplaces.yaml under ${repositoryRoot}`,
  )
})
