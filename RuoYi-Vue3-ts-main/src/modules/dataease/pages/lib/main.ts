import '@de/style/index.less'
import '@de/plugins/svg-icon'
import 'normalize.css/normalize.css'
import '@antv/s2/dist/style.min.css'
import { setupI18n } from '@de/plugins/vue-i18n'
import { setupStore } from '@de/store'
import { setupElementPlus } from '@de/plugins/element-plus'
import { App } from 'vue'
export * from './dashboard'
export default {
  install: async (app: App) => {
    await setupI18n(app)
    setupStore(app)
    setupElementPlus(app)
  }
}
