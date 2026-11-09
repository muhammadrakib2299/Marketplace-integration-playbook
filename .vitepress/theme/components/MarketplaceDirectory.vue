<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { fuzzySearch } from '../../../scripts/fuzzy-search.mjs'
import { readFilterState, writeFilterState } from '../../../scripts/filter-state.mjs'
import { marketplaces as catalogMarketplaces } from '../generated/marketplaces.mjs'

type Marketplace = {
  id: string
  name: string
  category: string
  categoryLabel: string
  regions: string[]
  access: string
  status: string
  statusLabel: string
  summary: string
  tags: string[]
  scope: string
  apis: string[]
  guide: string
  source: string
  lastVerified: string
}

const marketplaces = catalogMarketplaces as Marketplace[]
const query = ref('')
const selectedCategory = ref('all')
const selectedAccess = ref('all')
const selectedCoverage = ref('all')
const selectedRegion = ref('all')
const hydrated = ref(false)
const defaults = { q: '', category: 'all', access: 'all', coverage: 'all', region: 'all' }
const options = {
  categories: [...new Set(marketplaces.map((item) => item.category))],
  access: [...new Set(marketplaces.map((item) => item.access))],
  coverage: [...new Set(marketplaces.map((item) => item.status))],
  regions: [...new Set(marketplaces.flatMap((item) => item.regions))],
}

const filteredMarketplaces = computed(() => {
  const filtered = marketplaces.filter((item) =>
    (selectedCategory.value === 'all' || item.category === selectedCategory.value) &&
    (selectedAccess.value === 'all' || item.access === selectedAccess.value) &&
    (selectedCoverage.value === 'all' || item.status === selectedCoverage.value) &&
    (selectedRegion.value === 'all' || item.regions.includes(selectedRegion.value)),
  )
  return fuzzySearch(filtered, query.value, (item) => [
    item.name,
    item.fullName,
    item.categoryLabel,
    item.regions.join(' '),
    item.access,
    item.statusLabel,
    item.summary,
    item.tags.join(' '),
    item.apis.join(' '),
  ])
})

const hasFilters = computed(
  () => query.value.trim() !== '' || selectedCategory.value !== 'all' || selectedAccess.value !== 'all' || selectedCoverage.value !== 'all' || selectedRegion.value !== 'all',
)

function syncUrl() {
  if (!hydrated.value) return
  const nextUrl = writeFilterState(window.location.pathname, {
    q: query.value.trim(),
    category: selectedCategory.value,
    access: selectedAccess.value,
    coverage: selectedCoverage.value,
    region: selectedRegion.value,
  }, defaults, window.location.hash)
  window.history.replaceState({}, '', nextUrl)
}

function resetFilters() {
  query.value = ''
  selectedCategory.value = 'all'
  selectedAccess.value = 'all'
  selectedCoverage.value = 'all'
  selectedRegion.value = 'all'
}

onMounted(() => {
  const state = readFilterState(window.location.search, defaults, {
    category: ['all', ...options.categories],
    access: ['all', ...options.access],
    coverage: ['all', ...options.coverage],
    region: ['all', ...options.regions],
  })
  query.value = state.q
  selectedCategory.value = state.category
  selectedAccess.value = state.access
  selectedCoverage.value = state.coverage
  selectedRegion.value = state.region
  hydrated.value = true
})

watch([query, selectedCategory, selectedAccess, selectedCoverage, selectedRegion], syncUrl)
</script>

<template>
  <section class="marketplace-explorer" aria-labelledby="marketplace-explorer-title">
    <div class="marketplace-explorer-heading">
      <div>
        <h2 id="marketplace-explorer-title">Find an integration guide</h2>
        <p>Search platforms, regions, API names, access models, or coverage status.</p>
      </div>
      <span class="explorer-count" aria-live="polite">{{ filteredMarketplaces.length }} of {{ marketplaces.length }} platforms</span>
    </div>
    <div class="marketplace-filters" role="search">
      <label class="marketplace-search">
        <span class="sr-only">Search marketplaces and API guides</span>
        <UiIcon name="search" :size="17" />
        <input v-model="query" type="search" placeholder="Search marketplaces, APIs, or regions" autocomplete="off" />
      </label>
      <label class="marketplace-filter">
        <span>Category</span>
        <select v-model="selectedCategory" aria-label="Filter by category">
          <option value="all">All categories</option>
          <option v-for="category in options.categories" :key="category" :value="category">{{ marketplaces.find((item) => item.category === category)?.categoryLabel }}</option>
        </select>
      </label>
      <label class="marketplace-filter">
        <span>Access</span>
        <select v-model="selectedAccess" aria-label="Filter by access model">
          <option value="all">All access models</option>
          <option v-for="access in options.access" :key="access" :value="access">{{ access }}</option>
        </select>
      </label>
      <label class="marketplace-filter">
        <span>Coverage</span>
        <select v-model="selectedCoverage" aria-label="Filter by documentation status">
          <option value="all">All coverage</option>
          <option v-for="coverage in options.coverage" :key="coverage" :value="coverage">{{ coverage }}</option>
        </select>
      </label>
      <label class="marketplace-filter">
        <span>Region</span>
        <select v-model="selectedRegion" aria-label="Filter by region">
          <option value="all">All regions</option>
          <option v-for="region in options.regions" :key="region" :value="region">{{ region }}</option>
        </select>
      </label>
      <button v-if="hasFilters" class="marketplace-reset" type="button" @click="resetFilters"><UiIcon name="x" :size="14" /> Clear filters</button>
    </div>
    <div v-if="hasFilters" class="directory-active-filters" aria-label="Active directory filters">
      <span><UiIcon name="filter" :size="13" /> Active filters</span>
      <button v-if="query.trim()" type="button" @click="query = ''">“{{ query }}” <UiIcon name="x" :size="12" /></button>
      <button v-if="selectedCategory !== 'all'" type="button" @click="selectedCategory = 'all'">{{ marketplaces.find((item) => item.category === selectedCategory)?.categoryLabel }} <UiIcon name="x" :size="12" /></button>
      <button v-if="selectedAccess !== 'all'" type="button" @click="selectedAccess = 'all'">{{ selectedAccess }} <UiIcon name="x" :size="12" /></button>
      <button v-if="selectedCoverage !== 'all'" type="button" @click="selectedCoverage = 'all'">{{ selectedCoverage }} <UiIcon name="x" :size="12" /></button>
      <button v-if="selectedRegion !== 'all'" type="button" @click="selectedRegion = 'all'">{{ selectedRegion }} <UiIcon name="x" :size="12" /></button>
    </div>
    <div v-if="filteredMarketplaces.length" class="marketplace-results">
      <article v-for="marketplace in filteredMarketplaces" :key="marketplace.id" class="marketplace-result">
        <div class="marketplace-result-topline">
          <span class="marketplace-category">{{ marketplace.categoryLabel }}</span>
          <span class="marketplace-status">{{ marketplace.statusLabel }}</span>
        </div>
        <h3><a :href="marketplace.guide">{{ marketplace.name }}</a></h3>
        <p>{{ marketplace.summary }}</p>
        <dl class="marketplace-meta">
          <div><dt>Access</dt><dd>{{ marketplace.access }}</dd></div>
          <div><dt>Regions</dt><dd>{{ marketplace.regions.join(', ') }}</dd></div>
        </dl>
        <div class="marketplace-api-list" aria-label="Covered APIs"><span v-for="api in marketplace.apis" :key="api">{{ api }}</span></div>
        <div class="marketplace-result-links">
          <a class="marketplace-guide-link" :href="marketplace.guide">Open guide <UiIcon name="arrow-right" :size="14" /></a>
          <a class="marketplace-source-link" :href="marketplace.source" target="_blank" rel="noreferrer">Official docs <UiIcon name="external" :size="14" /></a>
        </div>
      </article>
    </div>
    <div v-else class="marketplace-empty" role="status">
      <strong>No matching guides</strong>
      <p>Try a broader search or clear one or more filters.</p>
      <button type="button" class="marketplace-reset" @click="resetFilters"><UiIcon name="refresh" :size="14" /> Clear filters</button>
    </div>
  </section>
</template>
