<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { ExternalLink } from 'lucide-vue-next'
import { formatDisplayDate, formatIsoDate } from '../../../scripts/format-date.mjs'

const { frontmatter } = useData()

// API dossiers declare `api` and keep their title in frontmatter instead of an H1.
const visible = computed(() => Boolean(frontmatter.value.api && frontmatter.value.title))

// Computed per page by pageContext() in the config's transformPageData. Only APIs whose catalog
// entry records a docs_url get an official-reference link; nothing is guessed.
const marketplace = computed(() => frontmatter.value.mip?.marketplace ?? null)
const reference = computed(() => frontmatter.value.mip?.reference ?? null)

// Date-like versions (version: 2026-01-01) arrive as serialized timestamps, like `checked`.
const version = computed(() => {
  const raw = frontmatter.value.version
  return formatIsoDate(raw) || (raw ? String(raw) : '')
})

const checkedOn = computed(() => formatDisplayDate(frontmatter.value.checked))
</script>

<template>
  <header v-if="visible" class="mip-doc-header">
    <nav class="mip-doc-trail" aria-label="Breadcrumb">
      <ol>
        <li v-if="marketplace"><a :href="withBase(marketplace.guide)">{{ marketplace.name }}</a></li>
        <li>API reference</li>
      </ol>
    </nav>
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
