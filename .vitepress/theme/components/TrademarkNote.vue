<script setup lang="ts">
import { useData } from 'vitepress'

// Same wording as the site footer (themeConfig.footer.message), which VitePress
// only shows on pages without a sidebar.
const { theme } = useData()
</script>

<template>
  <p v-if="theme.footer?.message" class="mip-trademark-note">{{ theme.footer.message }}</p>
</template>
