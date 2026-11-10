<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts'
import DocHeader from './components/DocHeader.vue'
import EvidenceCard from './components/EvidenceCard.vue'
import MarketplaceHub from './components/MarketplaceHub.vue'
import SequenceBar from './components/SequenceBar.vue'
import SiteFooter from './components/SiteFooter.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <!-- Each renders only on its own kind of page: overview, build-sequence step, API dossier. -->
    <template #doc-before>
      <MarketplaceHub />
      <SequenceBar />
      <DocHeader />
    </template>
    <template #aside-outline-after>
      <EvidenceCard />
    </template>
    <template #layout-bottom>
      <SiteFooter />
    </template>
  </Layout>
</template>
