// Marketplace directory logic (MarketplaceDirectory.vue): facets, search, sorting, and paging.
// Written for a catalog of 100+ entries; pure functions so they run under node:test.
import { fuzzySearch } from './fuzzy-search.mjs'

const byLabel = (a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' })

// [{ value, label, count }] for one catalog field, e.g. category with its display label. A list field
// (regions) gives one option per value, counted once per marketplace and labelled by the value itself.
export function facetOptions(marketplaces, key, labelKey = key) {
  const options = new Map()
  for (const marketplace of marketplaces) {
    const field = marketplace[key]
    const values = Array.isArray(field) ? [...new Set(field)] : [field]
    for (const value of values) {
      const label = Array.isArray(field) ? value : marketplace[labelKey]
      const option = options.get(value) ?? { value, label, count: 0 }
      option.count += 1
      options.set(value, option)
    }
  }
  return [...options.values()].sort(byLabel)
}

const searchFields = (marketplace) => [
  marketplace.name,
  marketplace.fullName,
  marketplace.categoryLabel,
  marketplace.regions.join(' '),
  marketplace.access,
  marketplace.statusLabel,
  marketplace.summary,
  marketplace.tags.join(' '),
  marketplace.apis.join(' '),
]

const unset = (value) => value === undefined || value === 'all'

// state: { q, category, status, access, region }; 'all' (or a missing key) disables a facet.
export function filterMarketplaces(marketplaces, state) {
  const faceted = marketplaces.filter(
    (marketplace) =>
      (unset(state.category) || marketplace.category === state.category) &&
      (unset(state.status) || marketplace.status === state.status) &&
      (unset(state.access) || marketplace.access === state.access) &&
      (unset(state.region) || marketplace.regions.includes(state.region)),
  )
  return fuzzySearch(faceted, state.q ?? '', searchFields)
}

const byName = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })

// 'name' = A–Z; 'recent' = latest verification first, never-verified entries last.
export function sortMarketplaces(marketplaces, sort) {
  const list = [...marketplaces]
  if (sort === 'recent') {
    return list.sort((a, b) => String(b.lastVerified ?? '').localeCompare(String(a.lastVerified ?? '')) || byName(a, b))
  }
  return list.sort(byName)
}

// One page of results; `start`/`end` are 1-based for "Showing 25–48 of 50".
export function paginate(items, page, size) {
  const pages = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), pages)
  const offset = (current - 1) * size
  const visible = items.slice(offset, offset + size)
  return {
    items: visible,
    page: current,
    pages,
    start: visible.length ? offset + 1 : 0,
    end: offset + visible.length,
    total: items.length,
  }
}
