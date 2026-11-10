<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import BuildPill from './components/BuildPill.vue'
import EvidenceCard from './components/EvidenceCard.vue'
import TrademarkNote from './components/TrademarkNote.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-title-after>
      <span class="mip-brand-subtitle">Developer handbook</span>
    </template>
    <template #nav-bar-content-after>
      <BuildPill />
    </template>
    <template #aside-outline-after>
      <EvidenceCard />
    </template>
    <template #doc-footer-before>
      <TrademarkNote />
    </template>
  </Layout>
</template>
