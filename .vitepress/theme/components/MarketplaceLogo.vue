<script setup lang="ts">
import { withBase } from 'vitepress'

// A marketplace's Simple Icons mark (catalog `logo`, served from /logos/ and drawn as a CSS mask in
// its brand colour), or its monogram when the catalog has none. Decorative: the name is always beside it.
defineProps<{
  logo: { hex: string; tone: string; src: string } | null
  mark: string
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <span
    class="mip-logo"
    :class="[!logo && 'mip-logo--mono', size && size !== 'sm' && `mip-logo--${size}`]"
    :data-tone="logo?.tone"
    :style="logo ? { '--mip-logo-color': `#${logo.hex}`, '--mip-logo-src': `url(${withBase(logo.src)})` } : undefined"
    aria-hidden="true"
  >
    <span v-if="logo" class="mip-logo-glyph"></span>
    <template v-else>{{ mark }}</template>
  </span>
</template>
