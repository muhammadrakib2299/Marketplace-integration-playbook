<script setup lang="ts">
import { computed, ref } from 'vue'

type Marketplace = {
  name: string
  category: string
  categoryLabel: string
  regions: string[]
  access: string
  status: string
  statusLabel: string
  summary: string
  apis: string[]
  guide: string
  source: string
}

// Keep this display index aligned with catalog/marketplaces.yaml when adding entries.
const marketplaces: Marketplace[] = [
  {
    name: 'Amazon Selling Partner API (SP-API)',
    category: 'marketplace',
    categoryLabel: 'Marketplace',
    regions: ['North America', 'Europe', 'Far East'],
    access: 'Mixed',
    status: 'documented',
    statusLabel: 'Documented · partial API coverage',
    summary:
      'Seller authorization, listing migration, catalog enrichment, orders, and selected operational APIs. No sandbox or production tests are claimed.',
    apis: [
      'Orders API',
      'Listings Items API',
      'Catalog Items API',
      'Product Type Definitions API',
      'Feeds API',
      'Reports API',
      'Notifications API',
      'FBA Inventory API',
    ],
    guide: '/marketplaces/amazon/',
    source: 'https://developer-docs.amazon.com/sp-api/docs/welcome',
  },
  {
    name: 'TikTok Shop Partner API',
    category: 'social-commerce',
    categoryLabel: 'Social commerce',
    regions: ['Target-market dependent'],
    access: 'Partner-only',
    status: 'documented',
    statusLabel: 'Documented · one API reference',
    summary:
      'Focused on the 202405 Get Authorized Category Assets endpoint and partner-authorized business categories. This is not a full Seller API integration guide.',
    apis: ['Get Authorized Category Assets · 202405'],
    guide: '/marketplaces/tiktok-shop/',
    source:
      'https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405',
  },
]

const query = ref('')
const selectedCategory = ref('all')
const selectedAccess = ref('all')
const selectedCoverage = ref('all')
const selectedRegion = ref('all')

const options = {
  categories: [...new Set(marketplaces.map((item) => item.category))],
  access: [...new Set(marketplaces.map((item) => item.access))],
  regions: [...new Set(marketplaces.flatMap((item) => item.regions))],
}

const filteredMarketplaces = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  return marketplaces.filter((item) => {
    const searchable = [
      item.name,
      item.categoryLabel,
      item.regions.join(' '),
      item.access,
      item.statusLabel,
      item.summary,
      item.apis.join(' '),
    ]
      .join(' ')
      .toLocaleLowerCase()

    return (
      (!term || searchable.includes(term)) &&
      (selectedCategory.value === 'all' || item.category === selectedCategory.value) &&
      (selectedAccess.value === 'all' || item.access === selectedAccess.value) &&
      (selectedCoverage.value === 'all' || item.status === selectedCoverage.value) &&
      (selectedRegion.value === 'all' || item.regions.includes(selectedRegion.value))
    )
  })
})

const hasFilters = computed(
  () =>
    query.value.trim() !== '' ||
    selectedCategory.value !== 'all' ||
    selectedAccess.value !== 'all' ||
    selectedCoverage.value !== 'all' ||
    selectedRegion.value !== 'all',
)

function resetFilters() {
  query.value = ''
  selectedCategory.value = 'all'
  selectedAccess.value = 'all'
  selectedCoverage.value = 'all'
  selectedRegion.value = 'all'
}
</script>

<template>
  <section class="marketplace-explorer" aria-labelledby="marketplace-explorer-title">
    <div class="marketplace-explorer-heading">
      <div>
        <h2 id="marketplace-explorer-title">Find an integration guide</h2>
        <p>Search platforms, regions, API names, access models, or coverage status.</p>
      </div>
      <span class="explorer-count" aria-live="polite">
        {{ filteredMarketplaces.length }} of {{ marketplaces.length }} platforms
      </span>
    </div>

    <div class="marketplace-filters" role="search">
      <label class="marketplace-search">
        <span class="sr-only">Search marketplaces and API guides</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input v-model="query" type="search" placeholder="Search marketplaces, APIs, or regions" autocomplete="off" />
      </label>

      <label class="marketplace-filter">
        <span>Category</span>
        <select v-model="selectedCategory" aria-label="Filter by category">
          <option value="all">All categories</option>
          <option v-for="category in options.categories" :key="category" :value="category">
            {{ marketplaces.find((item) => item.category === category)?.categoryLabel }}
          </option>
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
          <option value="documented">Documented</option>
        </select>
      </label>

      <label class="marketplace-filter">
        <span>Region</span>
        <select v-model="selectedRegion" aria-label="Filter by region">
          <option value="all">All regions</option>
          <option v-for="region in options.regions" :key="region" :value="region">{{ region }}</option>
        </select>
      </label>

      <button v-if="hasFilters" class="marketplace-reset" type="button" @click="resetFilters">
        Clear filters
      </button>
    </div>

    <div v-if="filteredMarketplaces.length" class="marketplace-results">
      <article v-for="marketplace in filteredMarketplaces" :key="marketplace.name" class="marketplace-result">
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
        <div class="marketplace-api-list" aria-label="Covered APIs">
          <span v-for="api in marketplace.apis" :key="api">{{ api }}</span>
        </div>
        <div class="marketplace-result-links">
          <a class="marketplace-guide-link" :href="marketplace.guide">Open guide <span aria-hidden="true">→</span></a>
          <a class="marketplace-source-link" :href="marketplace.source" target="_blank" rel="noreferrer">Official docs <span aria-hidden="true">↗</span></a>
        </div>
      </article>
    </div>

    <div v-else class="marketplace-empty" role="status">
      <strong>No matching guides</strong>
      <p>Try a broader search or clear one or more filters.</p>
      <button type="button" class="marketplace-reset" @click="resetFilters">Clear filters</button>
    </div>
  </section>
</template>
