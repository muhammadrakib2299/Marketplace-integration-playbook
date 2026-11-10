<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { ExternalLink } from 'lucide-vue-next'
import { formatIsoDate } from '../../../scripts/format-date.mjs'
import { marketplaceForPath, officialReference } from '../../../scripts/page-context.mjs'
import { marketplaces } from '../generated/catalog.mjs'

const { frontmatter, page } = useData()

// API dossiers declare `api` and keep their title in frontmatter instead of an H1.
const visible = computed(() => Boolean(frontmatter.value.api && frontmatter.value.title))

const marketplace = computed(() => marketplaceForPath(page.value.relativePath, marketplaces))

// Only APIs whose catalog entry records a docs_url get the link; nothing is guessed.
const reference = computed(() => officialReference(marketplace.value, frontmatter.value.api))

// Date-like versions (version: 2026-01-01) arrive as serialized timestamps, like `checked`.
const version = computed(() => {
  const raw = frontmatter.value.version
  return formatIsoDate(raw) || (raw ? String(raw) : '')
})

const checkedOn = computed(() => {
  const iso = formatIsoDate(frontmatter.value.checked)
  if (!iso) return ''
  const format = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return format.format(new Date(`${iso}T00:00:00Z`))
})
</script>

<template>
  <header v-if="visible" class="mip-doc-header">
    <p class="mip-doc-trail">
      <template v-if="marketplace">
        <a :href="withBase(marketplace.guide)">{{ marketplace.name }}</a>
        <span aria-hidden="true">/</span>
      </template>
      <span>API reference</span>
    </p>
    <div class="mip-doc-title-row">
      <h1>{{ frontmatter.title }}</h1>
      <a v-if="reference" class="mip-btn mip-btn--sm" :href="reference" target="_blank" rel="noreferrer">
        Official reference
        <ExternalLink :size="14" :stroke-width="2" aria-hidden="true" />
        <span class="visually-hidden">(opens in a new tab)</span>
      </a>
    </div>
    <div class="mip-doc-meta">
      <span class="mip-meta-chip">{{ frontmatter.api }}</span>
      <span v-if="version" class="mip-meta-chip">Version <code>{{ version }}</code></span>
      <span v-if="checkedOn" class="mip-meta-chip">Checked {{ checkedOn }}</span>
    </div>
  </header>
</template>
