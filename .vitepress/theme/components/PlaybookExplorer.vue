<script setup lang="ts">
import { computed, ref } from 'vue'

type Marketplace = {
  name: string
  mark: string
  markClass: string
  status: string
  summary: string
  tags: string[]
  scope: string
  href: string
}

type Resource = {
  id: string
  kind: 'marketplace' | 'guide'
  kindLabel: string
  topic: string
  topicLabel: string
  title: string
  summary: string
  status: string
  scope: string
  tags: string[]
  href: string
  mark: string
  markClass: string
}

const props = defineProps<{ platforms: Marketplace[] }>()

const guides: Resource[] = [
  {
    id: 'seller-onboarding',
    kind: 'guide',
    kindLabel: 'Integration guide',
    topic: 'access',
    topicLabel: 'Seller access',
    title: 'Connect an Amazon seller account',
    summary: 'Follow app setup, least-privilege roles, seller consent, secure OAuth, regional routing, and verified connection states.',
    status: 'Source-linked',
    scope: 'Seller consent · OAuth · account access',
    tags: ['Onboarding', 'OAuth', 'Roles', 'Regions'],
    href: '/marketplaces/amazon/guides/seller-onboarding',
    mark: '01',
    markClass: 'platform-mark-guide',
  },
  {
    id: 'active-listing-migration',
    kind: 'guide',
    kindLabel: 'Workflow guide',
    topic: 'migration',
    topicLabel: 'Catalog migration',
    title: 'Migrate an existing Amazon seller catalog',
    summary: 'Capture a seller listing baseline, keep catalog facts separate from offers, stage safe changes, and reconcile outcomes.',
    status: 'Source-linked',
    scope: 'Baseline · catalog · staged writes',
    tags: ['Reports API', 'Listings Items', 'Catalog Items', 'Product types'],
    href: '/marketplaces/amazon/workflows/active-listing-migration',
    mark: '02',
    markClass: 'platform-mark-guide',
  },
  {
    id: 'inventory-and-listings',
    kind: 'guide',
    kindLabel: 'Workflow guide',
    topic: 'inventory',
    topicLabel: 'Listings & inventory',
    title: 'Merchant-fulfilled listings and inventory',
    summary: 'Keep merchant-fulfilled stock in sync with listing state; distinguish warehouse quantities from Amazon-fulfilled inventory.',
    status: 'Source-linked',
    scope: 'MFN quantity · SKU · reconciliation',
    tags: ['Listings Items', 'Feeds', 'Inventory', 'FBA scope'],
    href: '/marketplaces/amazon/workflows/inventory-and-listings',
    mark: '03',
    markClass: 'platform-mark-guide',
  },
  {
    id: 'order-lifecycle',
    kind: 'guide',
    kindLabel: 'Workflow guide',
    topic: 'orders',
    topicLabel: 'Order synchronization',
    title: 'Amazon order synchronization workflow',
    summary: 'Find orders incrementally, drain pagination, upsert durably, select the correct fulfillment path, and reconcile changes.',
    status: 'Source-linked',
    scope: 'Orders API · ingestion · recovery',
    tags: ['Orders API', 'Pagination', 'Warehouse', 'Notifications'],
    href: '/marketplaces/amazon/workflows/order-lifecycle',
    mark: '04',
    markClass: 'platform-mark-guide',
  },
  {
    id: 'notifications-integration',
    kind: 'guide',
    kindLabel: 'Integration guide',
    topic: 'notifications',
    topicLabel: 'Events & notifications',
    title: 'Amazon SP-API Notifications integration',
    summary: 'Use supported SQS or EventBridge destinations, reconcile subscriptions, and build idempotent consumers with recovery paths.',
    status: 'Source-linked',
    scope: 'Destinations · subscriptions · events',
    tags: ['SQS', 'EventBridge', 'Idempotency', 'Reconciliation'],
    href: '/marketplaces/amazon/guides/notifications-integration',
    mark: '05',
    markClass: 'platform-mark-guide',
  },
  {
    id: 'development-guide',
    kind: 'guide',
    kindLabel: 'Integration guide',
    topic: 'operations',
    topicLabel: 'Operations & reliability',
    title: 'Amazon SP-API development guide',
    summary: 'Review current API versions, seller access, regional routing, order/listing surfaces, rate limits, retries, and safe data handling.',
    status: 'Source-linked',
    scope: 'API versions · operations · reliability',
    tags: ['Authorization', 'Rate limits', 'Retries', 'Observability'],
    href: '/marketplaces/amazon/guides/development-guide',
    mark: '06',
    markClass: 'platform-mark-guide',
  },
]

const topics = [
  { value: 'marketplace', label: 'Marketplace overview' },
  { value: 'access', label: 'Seller access' },
  { value: 'migration', label: 'Catalog migration' },
  { value: 'inventory', label: 'Listings & inventory' },
  { value: 'orders', label: 'Order synchronization' },
  { value: 'notifications', label: 'Events & notifications' },
  { value: 'operations', label: 'Operations & reliability' },
]

const query = ref('')
const selectedKind = ref('all')
const selectedTopic = ref('all')

const resources = computed<Resource[]>(() => [
  ...props.platforms.map((platform) => ({
    id: `marketplace-${platform.href}`,
    kind: 'marketplace' as const,
    kindLabel: 'Marketplace',
    topic: 'marketplace',
    topicLabel: 'Marketplace overview',
    title: platform.name,
    summary: platform.summary,
    status: platform.status,
    scope: platform.scope,
    tags: platform.tags,
    href: platform.href,
    mark: platform.mark,
    markClass: platform.markClass,
  })),
  ...guides,
])

const filteredResources = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()

  return resources.value.filter((resource) => {
    const searchable = [
      resource.title,
      resource.kindLabel,
      resource.topicLabel,
      resource.summary,
      resource.status,
      resource.scope,
      resource.tags.join(' '),
    ]
      .join(' ')
      .toLocaleLowerCase()

    return (
      (!term || searchable.includes(term)) &&
      (selectedKind.value === 'all' || resource.kind === selectedKind.value) &&
      (selectedTopic.value === 'all' || resource.topic === selectedTopic.value)
    )
  })
})

const hasActiveFilters = computed(
  () => query.value.trim() !== '' || selectedKind.value !== 'all' || selectedTopic.value !== 'all',
)

function clearFilters() {
  query.value = ''
  selectedKind.value = 'all'
  selectedTopic.value = 'all'
}
</script>

<template>
  <div class="playbook-explorer">
    <div class="explorer-controls" role="search" aria-label="Search marketplace cards and integration guides">
      <label class="explorer-search">
        <span class="sr-only">Search marketplaces and integration guides</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input v-model="query" type="search" placeholder="Search APIs, guides, regions, or topics" autocomplete="off" />
      </label>

      <label class="explorer-filter">
        <span>Content type</span>
        <select v-model="selectedKind" aria-label="Filter by content type">
          <option value="all">All resources</option>
          <option value="marketplace">Marketplace cards</option>
          <option value="guide">Integration guides</option>
        </select>
      </label>

      <label class="explorer-filter">
        <span>Topic</span>
        <select v-model="selectedTopic" aria-label="Filter by topic">
          <option value="all">All topics</option>
          <option v-for="topic in topics" :key="topic.value" :value="topic.value">{{ topic.label }}</option>
        </select>
      </label>
    </div>

    <div class="explorer-results-bar">
      <span class="explorer-result-count" role="status" aria-live="polite">
        {{ filteredResources.length }} of {{ resources.length }} resources
      </span>
      <button v-if="hasActiveFilters" class="explorer-clear" type="button" @click="clearFilters">Clear search and filters</button>
    </div>

    <div v-if="filteredResources.length" class="explorer-grid">
      <article v-for="resource in filteredResources" :key="resource.id" class="platform-card explorer-card">
        <div class="platform-card-top">
          <span class="platform-mark" :class="resource.markClass" aria-hidden="true">{{ resource.mark }}</span>
          <span class="status-pill"><span></span>{{ resource.status }}</span>
        </div>
        <div class="explorer-card-type" :class="`explorer-type-${resource.kind}`">{{ resource.kindLabel }} <span aria-hidden="true">·</span> {{ resource.topicLabel }}</div>
        <h3><a :href="resource.href">{{ resource.title }}</a></h3>
        <p>{{ resource.summary }}</p>
        <div class="platform-tags" :aria-label="`${resource.title} topics`">
          <span v-for="tag in resource.tags" :key="tag">{{ tag }}</span>
        </div>
        <div class="platform-footer">
          <span>{{ resource.scope }}</span>
          <a :href="resource.href">Open {{ resource.kind === 'marketplace' ? 'overview' : 'guide' }} <span aria-hidden="true">→</span></a>
        </div>
      </article>
    </div>

    <div v-else class="explorer-empty" role="status">
      <strong>No matching marketplaces or guides</strong>
      <p>Try another search term or broaden your filters.</p>
      <button class="explorer-clear" type="button" @click="clearFilters">Clear search and filters</button>
    </div>
  </div>
</template>
