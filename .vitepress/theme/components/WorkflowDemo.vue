<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'

// Sample data only. It walks through the order-sync loop described in
// marketplaces/amazon/workflows/order-lifecycle.md; nothing here comes from a live account.
const steps = [
  { title: 'Poll for changes', detail: 'GET /orders/2026-01-01/orders', sample: 'lastUpdatedAfter=2026-11-09T08:00:00Z' },
  { title: 'Drain every page', detail: 'Follow pagination.nextToken until it is absent', sample: 'nextToken: "eyJwIjoyfQ"' },
  { title: 'Upsert by orderId', detail: 'Persist each page before requesting the next', sample: 'orderId: "113-2958471-0067254"' },
  { title: 'Advance the watermark', detail: 'Only after every page is stored', sample: 'lastUpdatedAfter=2026-11-09T08:02:44Z' },
]

const root = ref<HTMLElement | null>(null)
// Static view by default (and under reduced motion): every step and sample visible.
const animated = ref(false)
const active = ref(-1)
const revealed = ref(steps.length)
let timeline: { revert: () => unknown } | null = null

onMounted(async () => {
  if (!root.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const { createTimeline } = await import('animejs')
  const packet = root.value.querySelector<HTMLElement>('.mip-flow-packet')
  const rows = [...root.value.querySelectorAll<HTMLElement>('.mip-flow-step')]
  if (!packet || rows.length !== steps.length) return

  // Centre of each step's number badge, relative to the list.
  const stops = rows.map((row) => row.offsetTop + 14)

  // Anime.js moves the packet along the rail; step and sample reveals are class changes that
  // CSS transitions animate, so they reverse cleanly when the loop restarts.
  animated.value = true
  revealed.value = 0
  const tl = createTimeline({ loop: true, defaults: { ease: 'inOutQuad' } })
  tl.set(packet, { translateY: stops[0], opacity: 1 }, 0)
  stops.forEach((stop, index) => {
    tl.add(packet, { translateY: stop, duration: index === 0 ? 1 : 650 })
    tl.call(() => {
      active.value = index
      revealed.value = index + 1
    })
    tl.add({ duration: index === stops.length - 1 ? 2400 : 1400 })
  })
  timeline = tl
})

onUnmounted(() => {
  timeline?.revert()
})
</script>

<template>
  <figure ref="root" class="mip-flow" :class="{ 'is-animated': animated }" aria-label="Order synchronization walkthrough with sample data">
    <figcaption class="mip-flow-head">
      <span class="mip-flow-title">Order sync, step by step</span>
      <span class="mip-flow-tag">Sample data</span>
    </figcaption>
    <ol class="mip-flow-steps">
      <span class="mip-flow-rail" aria-hidden="true"></span>
      <span class="mip-flow-packet" aria-hidden="true"></span>
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
    <a class="mip-flow-link" :href="withBase('/marketplaces/amazon/workflows/order-lifecycle')">Read the order synchronization workflow</a>
  </figure>
</template>
