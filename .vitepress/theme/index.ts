// The theme without VitePress's bundled Inter: the Harbor direction uses IBM Plex (self-hosted below).
import { defineAsyncComponent } from 'vue'
import DefaultTheme from 'vitepress/theme-without-fonts'
import '@fontsource-variable/ibm-plex-sans'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import Layout from './Layout.vue'
// Design-system layers, in cascade order: tokens, base, shell, article, then page components.
import './styles/tokens.css'
import './styles/base.css'
import './styles/shell.css'
import './styles/content.css'
import './styles/home.css'
import './styles/marketplace.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // Page components load with the page that uses them; they import the whole catalog, which must
    // not ride in the shared theme bundle every page downloads.
    app.component('HomePage', defineAsyncComponent(() => import('./components/HomePage.vue')))
    app.component('MarketplaceDirectory', defineAsyncComponent(() => import('./components/MarketplaceDirectory.vue')))
  },
}
