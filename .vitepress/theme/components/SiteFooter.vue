<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { formatDisplayDate } from '../../../scripts/format-date.mjs'

const repositoryUrl = 'https://github.com/muhammadrakib2299/Marketplace-integration-playbook'
const { theme } = useData()

// "Built 10 Nov 2026" in UTC, so the server render and the browser agree.
const builtOn = computed(() => formatDisplayDate(theme.value.buildDate))

type FooterLink = { text: string; link: string; external?: boolean }

// Link lists come from the config (bounded and route-checked there), so the footer never grows
// with the catalog and never sends a generic label to one marketplace's page.
const columns = computed<{ title: string; links: FooterLink[] }[]>(() => [
  {
    title: 'Recently verified',
    links: [...(theme.value.siteFooter?.marketplaces ?? []), { text: 'All marketplaces', link: '/marketplaces/' }],
  },
  { title: 'Engineering', links: theme.value.siteFooter?.engineering ?? [] },
  {
    title: 'Project',
    links: [
      { text: 'Contributing', link: `${repositoryUrl}/blob/main/CONTRIBUTING.md`, external: true },
      { text: 'Security policy', link: `${repositoryUrl}/blob/main/SECURITY.md`, external: true },
      { text: 'GitHub repository', link: repositoryUrl, external: true },
    ],
  },
])

const href = (link: FooterLink) => (link.external ? link.link : withBase(link.link))
</script>

<template>
  <footer class="mip-footer">
    <div class="mip-footer-inner">
      <div class="mip-footer-grid">
        <div class="mip-footer-brand">
          <a class="mip-footer-logo" :href="withBase('/')">
            <img :src="withBase('/brand-mark.svg')" alt="" width="26" height="26" />
            Playbook
          </a>
          <p>Source-linked guides for building marketplace integrations, from seller consent to reliable sync.</p>
        </div>
        <nav v-for="column in columns" :key="column.title" class="mip-footer-col" :aria-label="column.title">
          <div class="mip-footer-heading">{{ column.title }}</div>
          <a
            v-for="link in column.links"
            :key="link.text"
            :href="href(link)"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noreferrer' : undefined"
          >{{ link.text }}</a>
        </nav>
      </div>
      <div class="mip-footer-bar">
        <span>Independent resource. Marketplace names and logos belong to their owners; no endorsement is implied.</span>
        <span v-if="builtOn">Built {{ builtOn }}</span>
      </div>
    </div>
  </footer>
</template>
