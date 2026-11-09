import DefaultTheme from 'vitepress/theme'
import MarketplaceDirectory from './components/MarketplaceDirectory.vue'
import PlaybookExplorer from './components/PlaybookExplorer.vue'
import PlaybookHome from './components/PlaybookHome.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MarketplaceDirectory', MarketplaceDirectory)
    app.component('PlaybookExplorer', PlaybookExplorer)
    app.component('PlaybookHome', PlaybookHome)
  },
}
