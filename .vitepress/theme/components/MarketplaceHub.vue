<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { ArrowRight, BookOpenText, Check, ExternalLink, FlaskConical, KeyRound, Minus } from 'lucide-vue-next'
import { formatIsoDate } from '../../../scripts/format-date.mjs'
import { hubModel, isMarketplaceOverview, marketplaceForPath } from '../../../scripts/page-context.mjs'
import { capabilities, coverage, marketplaces } from '../generated/catalog.mjs'
import MarketplaceLogo from './MarketplaceLogo.vue'

// The header of a marketplace overview page (marketplaces/<slug>/README.md). Every value comes
// from catalog/*.yaml or the published pages; gaps say "Not recorded" instead of guessing.
const { page } = useData()

const marketplace = computed(() =>
  isMarketplaceOverview(page.value.relativePath) ? marketplaceForPath(page.value.relativePath, marketplaces) : null,
)
const hub = computed(() => (marketplace.value ? hubModel(marketplace.value, { capabilities, coverage }) : null))

const verified = computed(() => {
  const iso = formatIsoDate(marketplace.value?.lastVerified)
  if (!iso) return { iso: '', text: 'Not recorded' }
  const format = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return { iso, text: format.format(new Date(`${iso}T00:00:00Z`)) }
})

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`
</script>

<template>
  <section v-if="marketplace && hub" class="mip-hub" aria-labelledby="mip-hub-title">
    <header class="mip-hub-head">
      <MarketplaceLogo :logo="marketplace.logo" :mark="marketplace.mark" size="lg" />
      <div class="mip-hub-heading">
        <p class="mip-hub-eyebrow">{{ marketplace.categoryLabel }} · Integration guide</p>
        <h1 id="mip-hub-title">{{ marketplace.fullName }}</h1>
        <p class="mip-hub-summary">{{ marketplace.summary }}</p>
        <div class="mip-hub-actions">
          <a v-if="hub.start" class="mip-btn mip-btn--primary" :href="withBase(hub.start.href)">
            Start building
            <ArrowRight :size="16" :stroke-width="2" aria-hidden="true" />
          </a>
          <a v-if="marketplace.docsHome" class="mip-btn" :href="marketplace.docsHome" target="_blank" rel="noreferrer">
            Official docs
            <ExternalLink :size="15" :stroke-width="2" aria-hidden="true" />
            <span class="visually-hidden">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </header>

    <dl class="mip-hub-facts">
      <div>
        <dt>Status</dt>
        <dd><span class="mip-badge" :class="`mip-badge--${marketplace.status}`">{{ marketplace.statusLabel }}</span></dd>
      </div>
      <div>
        <dt>Access model</dt>
        <dd>{{ marketplace.access }}</dd>
      </div>
      <div>
        <dt>Regions</dt>
        <dd>{{ marketplace.regions.join(', ') }}</dd>
      </div>
      <div>
        <dt>Catalog verified</dt>
        <dd>
          <time v-if="verified.iso" :datetime="verified.iso">{{ verified.text }}</time>
          <span v-else class="mip-hub-gap">{{ verified.text }}</span>
        </dd>
      </div>
      <div>
        <dt>API surfaces</dt>
        <dd class="mip-hub-num">{{ hub.counts.apiSurfaces }}</dd>
      </div>
      <div>
        <dt>Reference pages</dt>
        <dd class="mip-hub-num">{{ hub.counts.apiReferencePages }}</dd>
      </div>
      <div>
        <dt>Workflow guides</dt>
        <dd class="mip-hub-num">{{ hub.counts.workflowGuides }}</dd>
      </div>
      <div>
        <dt>Sandbox or production tests</dt>
        <dd :class="{ 'mip-hub-gap': !hub.testsRecorded }">{{ hub.testsRecorded ? 'Recorded in the guides' : 'Not recorded' }}</dd>
      </div>
    </dl>

    <h2 id="find-your-starting-point" class="mip-hub-h2">Find your starting point</h2>
    <div class="mip-hub-cards">
      <article class="mip-hub-card">
        <span class="mip-hub-card-icon"><KeyRound :size="18" :stroke-width="1.75" aria-hidden="true" /></span>
        <h3>What access do I need?</h3>
        <p>Access model: {{ marketplace.access }}. Connect a seller before any data moves.</p>
        <ul v-if="hub.accessGuides.length" class="mip-hub-links">
          <li v-for="guide in hub.accessGuides" :key="guide.href">
            <a :href="withBase(guide.href)">{{ guide.title }}</a>
          </li>
        </ul>
        <p v-else class="mip-hub-gap">No access guide yet.</p>
      </article>
      <article class="mip-hub-card">
        <span class="mip-hub-card-icon"><BookOpenText :size="18" :stroke-width="1.75" aria-hidden="true" /></span>
        <h3>Which API do I call?</h3>
        <p>{{ plural(hub.counts.apiSurfaces, 'API surface is', 'API surfaces are') }} recorded, with {{ plural(hub.counts.apiReferencePages, 'reference page', 'reference pages') }} here.</p>
        <ul v-if="hub.apiDirectory" class="mip-hub-links">
          <li><a :href="withBase(hub.apiDirectory.href)">{{ hub.apiDirectory.label }}</a></li>
        </ul>
        <p v-else class="mip-hub-gap">No API directory yet.</p>
      </article>
      <article class="mip-hub-card">
        <span class="mip-hub-card-icon"><FlaskConical :size="18" :stroke-width="1.75" aria-hidden="true" /></span>
        <h3>Can I test without production?</h3>
        <p>
          {{ hub.testsRecorded ? 'Tests are recorded in the guides.' : 'No sandbox or production tests are recorded for this marketplace.' }}
          Plan test boundaries with:
        </p>
        <ul v-if="hub.operationsGuides.length" class="mip-hub-links">
          <li v-for="guide in hub.operationsGuides" :key="guide.href">
            <a :href="withBase(guide.href)">{{ guide.title }}</a>
          </li>
        </ul>
        <p v-else class="mip-hub-gap">No development guide yet.</p>
      </article>
    </div>

    <h2 id="coverage-in-this-playbook" class="mip-hub-h2">Coverage in this playbook</h2>
    <p class="mip-hub-note">
      {{ hub.counts.documentedTopics }} of {{ hub.counts.topics }} integration topics have a guide. A guide means the
      official documentation was reviewed for that topic, not that the integration was tested.
    </p>
    <ul class="mip-hub-topics">
      <li v-for="topic in hub.coverage" :key="topic.id" :class="{ 'is-documented': topic.guides.length }">
        <span class="mip-hub-topic-mark">
          <Check v-if="topic.guides.length" :size="14" :stroke-width="2.25" aria-hidden="true" />
          <Minus v-else :size="14" :stroke-width="2.25" aria-hidden="true" />
        </span>
        <span class="mip-hub-topic-body">
          <span class="mip-hub-topic-label">{{ topic.label }}</span>
          <a v-for="guide in topic.guides" :key="guide.href" :href="withBase(guide.href)">{{ guide.title }}</a>
          <span v-if="!topic.guides.length" class="mip-hub-gap">Not yet documented</span>
        </span>
      </li>
    </ul>
  </section>
</template>
