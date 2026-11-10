<script setup lang="ts">
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <span v-if="theme.buildDate" class="mip-build-pill" :title="`This site was built on ${theme.buildDate} (UTC)`">
    <span class="mip-build-dot" aria-hidden="true"></span>
    Docs build ·
    <time class="mip-tabular" :datetime="theme.buildDate">{{ theme.buildDate }}</time>
  </span>
</template>

<style scoped>
.mip-build-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
  padding: 4px 10px 4px 7px;
  border: 1px solid var(--mip-border);
  border-radius: 999px;
  background: var(--mip-surface-2);
  color: var(--mip-muted);
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  font-weight: 500;
  white-space: nowrap;
}

.mip-build-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mip-success);
}

@media (max-width: 1179px) {
  .mip-build-pill {
    display: none;
  }
}
</style>
