<script setup lang="ts">
type IconName =
  | 'arrow-right'
  | 'clock'
  | 'code'
  | 'database'
  | 'external'
  | 'filter'
  | 'globe'
  | 'info'
  | 'layers'
  | 'lock'
  | 'refresh'
  | 'search'
  | 'shield-check'
  | 'sparkles'
  | 'user-check'
  | 'x'

withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 18 })
</script>

<template>
  <svg
    class="ui-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-if="name === 'arrow-right'" d="M4 12h15m-6-6 6 6-6 6" />
    <template v-else-if="name === 'clock'"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></template>
    <path v-else-if="name === 'code'" d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
    <template v-else-if="name === 'database'"><ellipse cx="12" cy="5.5" rx="7.5" ry="3" /><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" /></template>
    <template v-else-if="name === 'external'"><path d="M14 5h5v5M19 5l-8 8" /><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></template>
    <template v-else-if="name === 'filter'"><path d="M4 6h16M7 12h10M10 18h4" /></template>
    <template v-else-if="name === 'globe'"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></template>
    <template v-else-if="name === 'info'"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></template>
    <template v-else-if="name === 'layers'"><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></template>
    <template v-else-if="name === 'lock'"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></template>
    <template v-else-if="name === 'refresh'"><path d="M20 11a8 8 0 0 0-14.7-3L3 11" /><path d="M3 5v6h6M4 13a8 8 0 0 0 14.7 3L21 13" /><path d="M21 19v-6h-6" /></template>
    <template v-else-if="name === 'search'"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></template>
    <template v-else-if="name === 'shield-check'"><path d="M12 3 20 7v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4Z" /><path d="m9 12 2 2 4-4" /></template>
    <path v-else-if="name === 'sparkles'" d="m12 3 1.1 4.9L18 9l-4.9 1.1L12 15l-1.1-4.9L6 9l4.9-1.1L12 3ZM19 15l.6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15ZM5 14l.5 2L7 16.5 5.5 17 5 19l-.5-2-1.5-.5 1.5-.5L5 14Z" />
    <template v-else-if="name === 'user-check'"><circle cx="9" cy="8" r="4" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 11l2 2 4-5" /></template>
    <path v-else-if="name === 'x'" d="m6 6 12 12M18 6 6 18" />
  </svg>
</template>
