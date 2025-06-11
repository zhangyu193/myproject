import { App } from 'vue'
import '@de/style/index.less'
import 'normalize.css/normalize.css'
import '@antv/s2/dist/style.min.css'
import '@de/utils/DateUtil'
import { setupCustomComponent } from '@de/custom-component'
import { installDirective } from '@de/directive'
import { setupI18n } from '@de/plugins/vue-i18n'
import WebSocketPlugin from '@de/websocket'
import { setupElementPlus, setupElementPlusIcons } from '@de/plugins/element-plus'
export default async function setupDataEase(app: App) {
    installDirective(app)
    await setupI18n(app)
    setupElementPlus(app)
    setupCustomComponent(app)
    setupElementPlusIcons(app)
    app.use(WebSocketPlugin)
}

