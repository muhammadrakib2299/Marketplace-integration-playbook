import DefaultTheme from 'vitepress/theme'
import MarketplaceDirectory from './components/MarketplaceDirectory.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MarketplaceDirectory', MarketplaceDirectory)
  },
}
