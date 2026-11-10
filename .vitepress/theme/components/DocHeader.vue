<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { formatIsoDate } from '../../../scripts/format-date.mjs'
import { marketplaces } from '../generated/catalog.mjs'

const { frontmatter, page } = useData()

// API dossiers declare `api` and keep their title in frontmatter instead of an H1.
const visible = computed(() => Boolean(frontmatter.value.api && frontmatter.value.title))

const marketplaceName = computed(() => {
  const slug = page.value.relativePath.split('/')[1]
  return marketplaces.find((marketplace: { guide: string }) => marketplace.guide === `/marketplaces/${slug}/`)?.name ?? ''
})

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
      <span v-if="marketplaceName">{{ marketplaceName }}</span>
      <span v-if="marketplaceName" aria-hidden="true">/</span>
      <span>API reference</span>
    </p>
    <h1>{{ frontmatter.title }}</h1>
    <div class="mip-doc-meta">
      <span class="mip-meta-chip">{{ frontmatter.api }}</span>
      <span v-if="version" class="mip-meta-chip">Version <code>{{ version }}</code></span>
      <span v-if="checkedOn" class="mip-meta-chip">Checked {{ checkedOn }}</span>
    </div>
  </header>
</template>
