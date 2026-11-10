<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { ArrowRight } from 'lucide-vue-next'

// "Step 3 of 6" for pages in a marketplace's build sequence (catalog build_sequence).
const { frontmatter } = useData()

// Computed per page by pageContext() in the config's transformPageData.
const marketplace = computed(() => frontmatter.value.mip?.marketplace ?? null)
const position = computed(() => frontmatter.value.mip?.sequence ?? null)
</script>

<template>
  <nav v-if="marketplace && position" class="mip-sequence" :aria-label="`${marketplace.name} build sequence`">
    <p class="mip-sequence-label">
      <a :href="withBase(marketplace.guide)">{{ marketplace.name }}</a>
      <span>Step {{ position.step }} of {{ position.total }}</span>
    </p>
    <ol class="mip-sequence-steps">
      <li
        v-for="(step, index) in position.steps"
        :key="step.href"
        :class="{ 'is-done': index + 1 < position.step, 'is-current': index + 1 === position.step }"
      >
        <a
          :href="withBase(step.href)"
          :title="step.label"
          :aria-current="index + 1 === position.step ? 'step' : undefined"
        >
          <span class="visually-hidden">Step {{ index + 1 }}: {{ step.label }}</span>
          <span aria-hidden="true">{{ index + 1 }}</span>
        </a>
      </li>
    </ol>
    <a v-if="position.next" class="mip-sequence-next" :href="withBase(position.next.href)">
      <span class="mip-sequence-next-label">Next</span>
      {{ position.next.label }}
      <ArrowRight :size="14" :stroke-width="2" aria-hidden="true" />
    </a>
  </nav>
</template>
