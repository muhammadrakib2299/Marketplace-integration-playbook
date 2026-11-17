<script setup lang="ts">
// Draws a ```mermaid fence as a diagram. The markdown rule in scripts/markdown-mermaid.mjs
// base64-encodes the source into `code`, because legal mermaid contains characters an HTML
// attribute and Vue's interpolation would each mangle.
//
// Mermaid is imported on mount, not at module scope, so the library downloads only for readers
// who reach a page that has a diagram, and never during the static build. The source is always
// in the page, in a disclosure that works without JavaScript, and it opens by itself if the
// diagram fails to draw.
import { computed, nextTick, onMounted, ref, shallowRef, useId, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{ code: string; title?: string }>()
const { isDark } = useData()

const decode = (value: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(value), (character) => character.charCodeAt(0)))

const source = computed(() => decode(props.code))
const svg = shallowRef('')
const failure = ref('')

let mermaid: typeof import('mermaid').default | undefined
let sequence = 0
// Mermaid names the SVG, and scopes its CSS, by the render id, so two diagrams on one page
// need different ones. useId is unique per instance; the id lands in CSS selectors, so only
// selector-safe characters are kept.
const instance = useId().replace(/[^A-Za-z0-9_-]/g, '-')

// Mermaid inlines colours into the SVG, so they are read from the live design tokens rather
// than duplicated here; re-reading them after a theme switch keeps the diagram in step.
const themeVariables = () => {
  const styles = getComputedStyle(document.documentElement)
  const token = (name: string) => styles.getPropertyValue(name).trim()
  return {
    background: token('--mip-surface'),
    primaryColor: token('--mip-primary-soft'),
    primaryBorderColor: token('--mip-primary-border'),
    primaryTextColor: token('--mip-ink'),
    secondaryColor: token('--mip-surface-2'),
    secondaryBorderColor: token('--mip-border-strong'),
    secondaryTextColor: token('--mip-text'),
    tertiaryColor: token('--mip-surface-3'),
    tertiaryBorderColor: token('--mip-border'),
    tertiaryTextColor: token('--mip-text'),
    lineColor: token('--mip-border-strong'),
    textColor: token('--mip-text'),
    mainBkg: token('--mip-primary-soft'),
    nodeBorder: token('--mip-primary-border'),
    nodeTextColor: token('--mip-ink'),
    clusterBkg: token('--mip-surface-2'),
    clusterBorder: token('--mip-border'),
    edgeLabelBackground: token('--mip-surface'),
    fontFamily: token('--vp-font-family-base') || 'inherit',
    fontSize: '13px',
  }
}

async function draw() {
  // Theme switches can start a second draw before the first finishes; only the latest one may
  // land, or a fast double toggle could leave the diagram in the wrong colours.
  const run = ++sequence
  const id = `mip-mermaid-${instance}-${run}`
  try {
    // Mermaid sizes each node from the text it measures. Measured before IBM Plex has loaded, the
    // fallback font's metrics win and the last line of a wrapped label is clipped by its box.
    await document.fonts.ready
    if (!mermaid) mermaid = (await import('mermaid')).default
    mermaid.initialize({
      startOnLoad: false,
      // securityLevel 'strict' keeps any HTML inside node labels inert; these diagrams are
      // repository content, but the renderer should not be the thing that trusts it.
      securityLevel: 'strict',
      // Every diagram here is a default-layout flowchart; naming it keeps mermaid off the
      // alternate layout engines it would otherwise resolve.
      layout: 'dagre',
      theme: 'base',
      themeVariables: themeVariables(),
      // SVG text labels, set at the top level where mermaid 12 reads it (flowchart.htmlLabels is
      // ignored). HTML labels sit inside .vp-doc, so the article's `p { line-height: 1.7 }` reached
      // them after mermaid had sized each box at its own line height, and clipped the last line.
      htmlLabels: false,
      // useMaxWidth would shrink a wide flowchart to the column and make its labels
      // unreadable. The diagram keeps its natural size and the panel scrolls instead, the
      // same treatment wide tables get (.mip-table), so no page scrolls sideways.
      flowchart: { useMaxWidth: false, htmlLabels: false, curve: 'basis', nodeSpacing: 34, rankSpacing: 44 },
      sequence: { useMaxWidth: false },
    })
    const { svg: rendered } = await mermaid.render(id, source.value)
    if (run !== sequence) return
    svg.value = rendered
    failure.value = ''
  } catch (error) {
    // On a parse error mermaid leaves its own error graphic appended to <body>, which would
    // show at the foot of the page; the message below replaces it.
    document.getElementById(`d${id}`)?.remove()
    document.getElementById(id)?.remove()
    if (run !== sequence) return
    // Say why there is no diagram rather than failing silently; the source disclosure opens.
    svg.value = ''
    failure.value = error instanceof Error ? error.message : String(error)
  }
}

onMounted(draw)
// A theme switch changes the tokens the colours were read from, so the diagram is drawn again.
watch(isDark, () => {
  if (svg.value) nextTick(draw)
})
</script>

<template>
  <figure class="mip-diagram">
    <div
      v-if="svg"
      class="mip-diagram__figure"
      role="img"
      :aria-label="title || 'Diagram of the described flow; its source follows below.'"
      tabindex="0"
      v-html="svg"
    />
    <!-- Always rendered and closed at first: <details> needs no JavaScript, so a reader who has
         none is one click from the text these pages showed before, and nobody watches an
         expanded block collapse as the diagram arrives. It opens by itself only on failure. -->
    <details class="mip-diagram__source" :open="Boolean(failure)">
      <summary>Diagram source</summary>
      <pre><code>{{ source }}</code></pre>
    </details>

    <p v-if="failure" class="mip-diagram__failure">
      This diagram could not be drawn, so its source is shown instead: {{ failure }}
    </p>
  </figure>
</template>
