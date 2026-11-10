// The theme without VitePress's bundled Inter: the Harbor direction uses IBM Plex (self-hosted below).
import DefaultTheme from 'vitepress/theme-without-fonts'
import '@fontsource-variable/ibm-plex-sans'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import Layout from './Layout.vue'
import HomePage from './components/HomePage.vue'
import MarketplaceDirectory from './components/MarketplaceDirectory.vue'
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
    app.component('HomePage', HomePage)
    app.component('MarketplaceDirectory', MarketplaceDirectory)
  },
}
