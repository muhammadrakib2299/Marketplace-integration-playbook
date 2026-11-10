<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { Play, Square } from 'lucide-vue-next'
import { walkthroughLink } from '../../../scripts/site-links.mjs'

// Sample data only. It walks through the order-sync loop described in
// marketplaces/amazon/workflows/order-lifecycle.md; nothing here comes from a live account.
const steps = [
  { title: 'Poll for changes', detail: 'GET /orders/2026-01-01/orders', sample: 'lastUpdatedAfter=2026-11-09T08:00:00Z' },
  { title: 'Drain every page', detail: 'Follow pagination.nextToken until it is absent', sample: 'nextToken: "eyJwIjoyfQ"' },
  { title: 'Upsert by orderId', detail: 'Persist each page before requesting the next', sample: 'orderId: "113-2958471-0067254"' },
  { title: 'Advance the watermark', detail: 'Only after every page is stored', sample: 'lastUpdatedAfter=2026-11-09T08:02:44Z' },
]

const root = ref<HTMLElement | null>(null)
// The static view (every step and sample visible) is the default and the end state. The walkthrough
// moves only when the reader presses Play (spec 5.1c; WCAG 2.2.2), runs once, and Stop ends it.
const canPlay = ref(false)
const playing = ref(false)
const animated = ref(false)
const active = ref(-1)
const revealed = ref(steps.length)
let timeline: { revert: () => unknown } | null = null

onMounted(() => {
  // Under reduced motion the static view already tells the whole story, so no play control is shown.
  canPlay.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

function finish() {
  const current = timeline
  timeline = null
  current?.revert()
  playing.value = false
  animated.value = false
  active.value = -1
  revealed.value = steps.length
}

async function toggle() {
  if (playing.value) return finish()
  playing.value = true
  const { createTimeline } = await import('animejs')
  // The reader may have pressed Stop, or left the page, while the module loaded.
  if (!playing.value || !root.value) return finish()
  const packet = root.value.querySelector<HTMLElement>('.mip-flow-packet')
  const rows = [...root.value.querySelectorAll<HTMLElement>('.mip-flow-step')]
  if (!packet || rows.length !== steps.length) return finish()

  // Measured at play time, so a reflow since the page loaded cannot misplace the packet.
  const stops = rows.map((row) => row.offsetTop + 14)

  // Anime.js moves the packet along the rail; step and sample reveals are class changes that
  // CSS transitions animate.
  animated.value = true
  active.value = -1
  revealed.value = 0
  const tl = createTimeline({ defaults: { ease: 'inOutQuad' }, onComplete: () => finish() })
  tl.set(packet, { translateY: stops[0], opacity: 1 }, 0)
  stops.forEach((stop, index) => {
    tl.add(packet, { translateY: stop, duration: index === 0 ? 1 : 650 })
    tl.call(() => {
      active.value = index
      revealed.value = index + 1
    })
    tl.add({ duration: index === stops.length - 1 ? 1600 : 1100 })
  })
  timeline = tl
}

onUnmounted(() => {
  const current = timeline
  timeline = null
  current?.revert()
})
</script>

<template>
  <figure ref="root" class="mip-flow" :class="{ 'is-animated': animated }" aria-label="Order synchronization walkthrough with sample data">
    <figcaption class="mip-flow-head">
      <span class="mip-flow-title">Order sync, step by step</span>
      <span class="mip-flow-tools">
        <span class="mip-flow-tag">Sample data</span>
        <button v-if="canPlay" type="button" class="mip-flow-play" @click="toggle">
          <Square v-if="playing" :size="12" :stroke-width="2.5" aria-hidden="true" />
          <Play v-else :size="12" :stroke-width="2.5" aria-hidden="true" />
          {{ playing ? 'Stop' : 'Play' }}<span class="visually-hidden"> walkthrough</span>
        </button>
      </span>
    </figcaption>
    <div class="mip-flow-track">
      <span class="mip-flow-rail" aria-hidden="true"></span>
      <span class="mip-flow-packet" aria-hidden="true"></span>
      <ol class="mip-flow-steps">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="mip-flow-step"
          :class="{ 'is-active': active === index, 'is-revealed': index < revealed }"
        >
          <span class="mip-flow-num">{{ index + 1 }}</span>
          <span class="mip-flow-body">
            <span class="mip-flow-step-title">{{ step.title }}</span>
            <span class="mip-flow-detail">{{ step.detail }}</span>
            <code class="mip-flow-sample">{{ step.sample }}</code>
          </span>
        </li>
      </ol>
    </div>
    <a class="mip-flow-link" :href="withBase(walkthroughLink)">Read the order synchronization workflow</a>
  </figure>
</template>
