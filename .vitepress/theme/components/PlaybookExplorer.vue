<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { fuzzySearch } from '../../../scripts/fuzzy-search.mjs'
import { readFilterState, writeFilterState } from '../../../scripts/filter-state.mjs'
import { guides as catalogGuides, topics as guideTopics } from '../generated/catalog.mjs'

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
  marketplaceName: string
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

// Guides and their topics are maintained in catalog/guides.yaml.
const guides = catalogGuides as Resource[]
const topics: { id: string; label: string }[] = [{ id: 'marketplace', label: 'Marketplace overview' }, ...guideTopics]

const query = ref('')
const selectedKind = ref('all')
const selectedTopic = ref('all')
const searchInput = ref<HTMLInputElement | null>(null)
const hydrated = ref(false)
const defaults = { q: '', type: 'all', topic: 'all' }

const resources = computed<Resource[]>(() => [
  ...props.platforms.map((platform) => ({
    id: `marketplace-${platform.href}`,
    kind: 'marketplace' as const,
    kindLabel: 'Marketplace',
    topic: 'marketplace',
    topicLabel: 'Marketplace overview',
    marketplaceName: platform.name,
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
  const filtered = resources.value.filter((resource) =>
    (selectedKind.value === 'all' || resource.kind === selectedKind.value) &&
    (selectedTopic.value === 'all' || resource.topic === selectedTopic.value),
  )

  return fuzzySearch(filtered, query.value, (resource) => [
      resource.title,
      resource.marketplaceName,
      resource.kindLabel,
      resource.topicLabel,
      resource.summary,
      resource.status,
      resource.scope,
      resource.tags.join(' '),
  ])
})

const hasActiveFilters = computed(
  () => query.value.trim() !== '' || selectedKind.value !== 'all' || selectedTopic.value !== 'all',
)

function clearFilters() {
  query.value = ''
  selectedKind.value = 'all'
  selectedTopic.value = 'all'
}

function syncUrl() {
  if (!hydrated.value) return
  const nextUrl = writeFilterState(window.location.pathname, {
    q: query.value.trim(),
    type: selectedKind.value,
    topic: selectedTopic.value,
  }, defaults, window.location.hash)
  window.history.replaceState({}, '', nextUrl)
}

function focusSearch(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
  }
}

onMounted(() => {
  const state = readFilterState(window.location.search, defaults, {
    type: ['all', 'marketplace', 'guide'],
    topic: topics.map((topic) => topic.id),
  })
  query.value = state.q
  selectedKind.value = state.type
  selectedTopic.value = state.topic
  hydrated.value = true
  window.addEventListener('keydown', focusSearch)
})
onUnmounted(() => window.removeEventListener('keydown', focusSearch))
watch([query, selectedKind, selectedTopic], syncUrl)
</script>

<template>
  <div class="playbook-explorer">
    <div class="explorer-controls" role="search" aria-label="Search marketplace cards and integration guides">
      <label class="explorer-search">
        <span class="sr-only">Search marketplaces and integration guides</span>
        <UiIcon name="search" :size="17" />
        <input ref="searchInput" v-model="query" type="search" placeholder="Search APIs, guides, regions, or topics" autocomplete="off" />
        <kbd aria-label="Keyboard shortcut Command or Control K">⌘/Ctrl K</kbd>
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
          <option v-for="topic in topics" :key="topic.id" :value="topic.id">{{ topic.label }}</option>
        </select>
      </label>
    </div>

    <div class="explorer-results-bar">
      <span class="explorer-result-count" role="status" aria-live="polite">
        {{ filteredResources.length }} of {{ resources.length }} resources
      </span>
      <button v-if="hasActiveFilters" class="explorer-clear" type="button" @click="clearFilters"><UiIcon name="x" :size="14" /> Clear search and filters</button>
    </div>

    <div v-if="hasActiveFilters" class="explorer-active-filters" aria-label="Active search filters">
      <span class="active-filter-label"><UiIcon name="filter" :size="13" /> Active filters</span>
      <button v-if="query.trim()" type="button" class="filter-chip" @click="query = ''">“{{ query }}” <UiIcon name="x" :size="12" /></button>
      <button v-if="selectedKind !== 'all'" type="button" class="filter-chip" @click="selectedKind = 'all'">{{ selectedKind === 'guide' ? 'Integration guides' : 'Marketplace cards' }} <UiIcon name="x" :size="12" /></button>
      <button v-if="selectedTopic !== 'all'" type="button" class="filter-chip" @click="selectedTopic = 'all'">{{ topics.find((topic) => topic.id === selectedTopic)?.label }} <UiIcon name="x" :size="12" /></button>
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
          <a :href="resource.href">Open {{ resource.kind === 'marketplace' ? 'overview' : 'guide' }} <UiIcon name="arrow-right" :size="14" /></a>
        </div>
      </article>
    </div>

    <div v-else class="explorer-empty" role="status">
      <strong>No matching marketplaces or guides</strong>
      <p>Try another search term or broaden your filters.</p>
      <button class="explorer-clear" type="button" @click="clearFilters"><UiIcon name="refresh" :size="14" /> Clear search and filters</button>
    </div>
  </div>
</template>
