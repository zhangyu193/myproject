import type { App } from 'vue'
import { Icon } from './components/icon-custom'

export default async function setupDataEase(app: App) {
  // 注册 DataEase 自定义的全局组件
  app.component('Icon', Icon)
}
