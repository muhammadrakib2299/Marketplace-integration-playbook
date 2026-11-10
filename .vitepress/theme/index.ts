import DefaultTheme from 'vitepress/theme'
import '@fontsource-variable/jetbrains-mono'
import Layout from './Layout.vue'
import MarketplaceDirectory from './components/MarketplaceDirectory.vue'
import PlaybookExplorer from './components/PlaybookExplorer.vue'
import PlaybookHome from './components/PlaybookHome.vue'
import UiIcon from './components/UiIcon.vue'
// Order matters: legacy component styles first, then the design system layers override them.
import './custom.css'
import './styles/tokens.css'
import './styles/base.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('MarketplaceDirectory', MarketplaceDirectory)
    app.component('PlaybookExplorer', PlaybookExplorer)
    app.component('PlaybookHome', PlaybookHome)
    app.component('UiIcon', UiIcon)
  },
}
