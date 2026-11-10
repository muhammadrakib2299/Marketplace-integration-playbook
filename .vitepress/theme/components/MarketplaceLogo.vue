<script setup lang="ts">
// A marketplace's Simple Icons mark (catalog `logo`), or its monogram when the catalog has none.
// Decorative: the marketplace name always appears next to it.
defineProps<{
  logo: { hex: string; path: string; tone: string } | null
  mark: string
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <span
    class="mip-logo"
    :class="[!logo && 'mip-logo--mono', size && size !== 'sm' && `mip-logo--${size}`]"
    :data-tone="logo?.tone"
    :style="logo ? { '--mip-logo-color': `#${logo.hex}` } : undefined"
    aria-hidden="true"
  >
    <svg v-if="logo" viewBox="0 0 24 24"><path :d="logo.path" /></svg>
    <template v-else>{{ mark }}</template>
  </span>
</template>
