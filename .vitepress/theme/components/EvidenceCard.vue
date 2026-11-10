<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { ShieldCheck, SquarePen } from 'lucide-vue-next'
import { formatIsoDate } from '../../../scripts/format-date.mjs'

const repositoryUrl = 'https://github.com/muhammadrakib2299/Marketplace-integration-playbook'
const { frontmatter, page } = useData()

// Only pages that declare evidence in frontmatter get a card; nothing is inferred.
const evidence = computed(() => (typeof frontmatter.value.evidence_status === 'string' ? frontmatter.value.evidence_status : ''))
const checked = computed(() => formatIsoDate(frontmatter.value.checked))
const visible = computed(() => Boolean(evidence.value || checked.value))
// filePath is the source file, so rewritten pages (README.md → index.md) still edit the right file.
const editUrl = computed(() => `${repositoryUrl}/edit/main/${page.value.filePath}`)
</script>

<template>
  <section v-if="visible" class="mip-evidence">
    <div class="mip-evidence-head">
      <div class="mip-evidence-title" role="heading" aria-level="2">
        <ShieldCheck :size="15" :stroke-width="1.75" aria-hidden="true" />
        Evidence
      </div>
      <a
        class="mip-icon-button mip-icon-button--compact"
        :href="editUrl"
        target="_blank"
        rel="noreferrer"
        aria-label="Edit this page on GitHub"
        title="Edit this page on GitHub"
      >
        <SquarePen :size="15" :stroke-width="1.75" aria-hidden="true" />
      </a>
    </div>
    <p v-if="evidence" class="mip-evidence-text">{{ evidence }}</p>
    <p v-if="checked" class="mip-evidence-checked">
      Checked <time class="mip-mono" :datetime="checked">{{ checked }}</time>
    </p>
  </section>
</template>
