<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { ArrowDownAZ, ArrowRight, CalendarClock, Check, ChevronLeft, ChevronRight, ExternalLink, Minus, Search, X } from 'lucide-vue-next'
import { facetOptions, filterMarketplaces, paginate, sortMarketplaces } from '../../../scripts/directory.mjs'
import { readFilterState, writeFilterState } from '../../../scripts/filter-state.mjs'
import { formatIsoDate } from '../../../scripts/format-date.mjs'
import { capabilities, coverage, marketplaces as catalog, topics } from '../generated/catalog.mjs'
import MarketplaceLogo from './MarketplaceLogo.vue'

type Marketplace = {
  id: string
  slug: string
  name: string
  categoryLabel: string
  access: string
  status: string
  regions: string[]
  summary: string
  tags: string[]
  guide: string
  docsHome: string | null
  apiSurfaces: unknown[]
  lastVerified: string | null
  mark: string
  logo: { hex: string; path: string; tone: string } | null
}
type Capability = { id: string; label: string; guides: { title: string; href: string }[] }

const PAGE_SIZE = 24
const marketplaces = catalog as Marketplace[]
const capabilityMap = capabilities as Record<string, Capability[]>
const pagesBySlug = coverage.byMarketplace as Record<string, { apiReferencePages: number; workflowGuides: number }>

const statusName = (status: string) => `${status.charAt(0).toUpperCase()}${status.slice(1)}`
const categoryOptions = facetOptions(marketplaces, 'category', 'categoryLabel')
const statusOptions = facetOptions(marketplaces, 'status').map((option) => ({ ...option, label: statusName(option.value) }))

const defaults = { q: '', category: 'all', status: 'all', sort: 'name', page: '1' }
const query = ref(defaults.q)
const category = ref(defaults.category)
const status = ref(defaults.status)
const sort = ref(defaults.sort)
const page = ref(1)
const hydrated = ref(false)

const results = computed(() =>
  sortMarketplaces(filterMarketplaces(marketplaces, { q: query.value, category: category.value, status: status.value }), sort.value),
)
const current = computed(() => paginate(results.value, page.value, PAGE_SIZE))
const hasFilters = computed(() => query.value.trim() !== '' || category.value !== 'all' || status.value !== 'all')

const summary = computed(() => {
  const { total, start, end, pages } = current.value
  const noun = marketplaces.length === 1 ? 'marketplace' : 'marketplaces'
  const base = hasFilters.value ? `${total} of ${marketplaces.length} ${noun} match` : `${total} ${noun}`
  return pages > 1 ? `${base} · showing ${start}–${end}` : base
})

// Keeps "&" on the line of the word before it, so wrapped column headers never start with it.
const headerLabel = (label: string) => label.replace(/ & /g, ' & ')
const documentedTopics = (id: string) => (capabilityMap[id] ?? []).filter((topic) => topic.guides.length > 0).length
const verifiedOn = (value: string | null) => {
  const iso = formatIsoDate(value)
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  )
}

function resetFilters() {
  query.value = ''
  category.value = 'all'
  status.value = 'all'
}

function goTo(target: number) {
  page.value = target
  document.getElementById('marketplace-results')?.scrollIntoView({ block: 'start' })
}

onMounted(async () => {
  const state = readFilterState(window.location.search, defaults, {
    category: ['all', ...categoryOptions.map((option) => option.value)],
    status: ['all', ...statusOptions.map((option) => option.value)],
    sort: ['name', 'recent'],
  })
  query.value = state.q
  category.value = state.category
  status.value = state.status
  sort.value = state.sort
  // Let the filter watchers run before restoring the page, or they would reset it to 1.
  await nextTick()
  page.value = Number.parseInt(state.page, 10) || 1
  hydrated.value = true
})

// A new search, filter, or sort starts again from the first page.
watch([query, category, status, sort], () => {
  if (hydrated.value) page.value = 1
})

watch([query, category, status, sort, page], () => {
  if (!hydrated.value) return
  const state = { q: query.value.trim(), category: category.value, status: status.value, sort: sort.value, page: String(current.value.page) }
  window.history.replaceState(window.history.state, '', writeFilterState(window.location.pathname, state, defaults, window.location.hash))
})
</script>

<template>
  <section class="mip-directory" aria-label="Marketplace directory">
    <div class="mip-dir-toolbar" role="search">
      <label class="mip-dir-search">
        <Search :size="17" :stroke-width="2" aria-hidden="true" />
        <span class="visually-hidden">Search marketplaces</span>
        <input v-model="query" type="search" placeholder="Search by name, API, region, or tag" autocomplete="off" spellcheck="false" />
      </label>
      <label class="mip-dir-select">
        <span class="visually-hidden">Category</span>
        <select v-model="category">
          <option value="all">All categories</option>
          <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
            {{ option.label }} ({{ option.count }})
          </option>
        </select>
      </label>
      <label class="mip-dir-select">
        <span class="visually-hidden">Status</span>
        <select v-model="status">
          <option value="all">Any status</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }} ({{ option.count }})
          </option>
        </select>
      </label>
    </div>

    <div id="marketplace-results" class="mip-dir-status">
      <div class="mip-dir-count">
        <p aria-live="polite">{{ summary }}</p>
        <button v-if="hasFilters" type="button" class="mip-dir-reset" @click="resetFilters">
          <X :size="14" :stroke-width="2" aria-hidden="true" /> Clear filters
        </button>
      </div>
      <div class="mip-dir-sort" role="group" aria-label="Sort marketplaces">
        <button type="button" :aria-pressed="sort === 'name'" @click="sort = 'name'">
          <ArrowDownAZ :size="15" :stroke-width="2" aria-hidden="true" /> A–Z
        </button>
        <button type="button" :aria-pressed="sort === 'recent'" @click="sort = 'recent'">
          <CalendarClock :size="15" :stroke-width="2" aria-hidden="true" /> Recently verified
        </button>
      </div>
    </div>

    <ul v-if="current.total" class="mip-dir-list">
      <li v-for="marketplace in current.items" :key="marketplace.id" class="mip-dir-row">
        <MarketplaceLogo :logo="marketplace.logo" :mark="marketplace.mark" size="md" />
        <div class="mip-dir-main">
          <div class="mip-dir-title">
            <h3><a :href="withBase(marketplace.guide)">{{ marketplace.name }}</a></h3>
            <span class="mip-badge" :class="`mip-badge--${marketplace.status}`">{{ statusName(marketplace.status) }}</span>
          </div>
          <p class="mip-dir-meta">
            {{ [marketplace.categoryLabel, `${marketplace.access} access`, marketplace.regions.join(', ')].join(' · ') }}
          </p>
          <p class="mip-dir-text">{{ marketplace.summary }}</p>
          <p class="mip-dir-facts">
            <span><strong>{{ marketplace.apiSurfaces.length }}</strong> API surfaces</span>
            <span><strong>{{ pagesBySlug[marketplace.slug]?.apiReferencePages ?? 0 }}</strong> reference pages</span>
            <span><strong>{{ documentedTopics(marketplace.id) }}</strong> of {{ topics.length }} topics</span>
            <span v-if="verifiedOn(marketplace.lastVerified)">Verified {{ verifiedOn(marketplace.lastVerified) }}</span>
            <span v-else>Not yet verified</span>
          </p>
        </div>
        <div class="mip-dir-actions">
          <a class="mip-btn mip-btn--sm" :href="withBase(marketplace.guide)">
            Open guide <ArrowRight :size="14" :stroke-width="2" aria-hidden="true" />
            <span class="visually-hidden">: {{ marketplace.name }}</span>
          </a>
          <a
            v-if="marketplace.docsHome"
            class="mip-icon-button"
            :href="marketplace.docsHome"
            target="_blank"
            rel="noreferrer"
            :aria-label="`${marketplace.name} official docs (opens in a new tab)`"
            title="Official docs"
          >
            <ExternalLink :size="16" :stroke-width="2" aria-hidden="true" />
          </a>
        </div>
      </li>
    </ul>

    <div v-else class="mip-dir-empty" role="status">
      <strong>No marketplaces match</strong>
      <p>Try a broader search, or clear the filters.</p>
      <button type="button" class="mip-btn mip-btn--sm" @click="resetFilters">Clear filters</button>
    </div>

    <nav v-if="current.pages > 1" class="mip-dir-pager" aria-label="Directory pages">
      <button type="button" class="mip-btn mip-btn--sm" :disabled="current.page <= 1" @click="goTo(current.page - 1)">
        <ChevronLeft :size="15" :stroke-width="2" aria-hidden="true" /> Previous
      </button>
      <span>Page {{ current.page }} of {{ current.pages }}</span>
      <button type="button" class="mip-btn mip-btn--sm" :disabled="current.page >= current.pages" @click="goTo(current.page + 1)">
        Next <ChevronRight :size="15" :stroke-width="2" aria-hidden="true" />
      </button>
    </nav>

    <template v-if="current.total">
      <h2 id="coverage-by-topic">Coverage by topic</h2>
      <p class="mip-dir-note">
        Which integration topics have a guide, for the marketplaces listed above. A tick links to the guide; it means the
        official documentation was reviewed, not that the integration was tested.
      </p>
      <div class="mip-table mip-matrix">
        <table>
          <thead>
            <tr>
              <th scope="col">Marketplace</th>
              <th v-for="topic in topics" :key="topic.id" scope="col">{{ headerLabel(topic.label) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="marketplace in current.items" :key="marketplace.id">
              <th scope="row"><a :href="withBase(marketplace.guide)">{{ marketplace.name }}</a></th>
              <td v-for="capability in capabilityMap[marketplace.id] ?? []" :key="capability.id">
                <a
                  v-if="capability.guides.length"
                  class="mip-matrix-yes"
                  :href="withBase(capability.guides[0].href)"
                  :title="capability.guides.map((guide) => guide.title).join('\n')"
                >
                  <Check :size="15" :stroke-width="2.25" aria-hidden="true" />
                  <span class="visually-hidden">{{ capability.label }}: {{ capability.guides[0].title }}</span>
                </a>
                <span v-else class="mip-matrix-no">
                  <Minus :size="15" :stroke-width="2" aria-hidden="true" />
                  <span class="visually-hidden">{{ capability.label }}: not yet documented</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>
