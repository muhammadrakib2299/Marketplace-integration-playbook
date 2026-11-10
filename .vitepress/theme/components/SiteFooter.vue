<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { marketplaces } from '../generated/catalog.mjs'

const repositoryUrl = 'https://github.com/muhammadrakib2299/Marketplace-integration-playbook'
const { theme } = useData()

// "Built 10 Nov 2026" in UTC, so the server render and the browser agree.
const builtOn = computed(() => {
  const date = theme.value.buildDate
  if (!date) return ''
  const format = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return format.format(new Date(`${date}T00:00:00Z`))
})

type FooterLink = { text: string; link: string; external?: boolean }

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Marketplaces',
    links: [
      ...marketplaces.map((marketplace: { name: string; guide: string }) => ({ text: marketplace.name, link: marketplace.guide })),
      { text: 'Marketplace directory', link: '/marketplaces/' },
    ],
  },
  {
    title: 'Build',
    links: [
      { text: 'Seller onboarding', link: '/marketplaces/amazon/guides/seller-onboarding' },
      { text: 'Order synchronization', link: '/marketplaces/amazon/workflows/order-lifecycle' },
      { text: 'Development guide', link: '/marketplaces/amazon/guides/development-guide' },
    ],
  },
  {
    title: 'Project',
    links: [
      { text: 'Integration principles', link: '/docs/integration-principles' },
      { text: 'Contributing', link: `${repositoryUrl}/blob/main/CONTRIBUTING.md`, external: true },
      { text: 'GitHub repository', link: repositoryUrl, external: true },
    ],
  },
]

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
