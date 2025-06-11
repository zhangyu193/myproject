import { createApp } from 'vue'
import '@de/style/index.less'
import 'normalize.css/normalize.css'
import '@antv/s2/dist/style.min.css'
import App from './App.vue'
import { setupI18n } from '@de/plugins/vue-i18n'
import { setupStore } from '@de/store'
import { setupRouter } from '@de/router/mobile'
import { setupElementPlus, setupElementPlusIcons } from '@de/plugins/element-plus'
// 注册数据大屏组件
import { setupCustomComponent } from '@de/custom-component'
import { installDirective } from '@de/directive'
import '@de/utils/DateUtil'
import '@de/permissionMobile'
const setupAll = async () => {
  const app = createApp(App)
  installDirective(app)
  await setupI18n(app)
  setupStore(app)
  setupRouter(app)
  setupElementPlus(app)
  setupCustomComponent(app)
  setupElementPlusIcons(app)
  app.mount('#app')
}

setupAll()
