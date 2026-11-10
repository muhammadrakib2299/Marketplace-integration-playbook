<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts'
import DocHeader from './components/DocHeader.vue'
import EvidenceCard from './components/EvidenceCard.vue'
import SiteFooter from './components/SiteFooter.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-before>
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
