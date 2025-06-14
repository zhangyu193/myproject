import type { App } from 'vue'

const components = ['circle-shape']

export const setupCustomComponent = (app: App<Element>) => {
  components.forEach(key => {
    app.component(key, () => import(`@de/custom-component/${key}/Component.vue`))
    app.component(key + '-attr', () => import(`@de/custom-component/${key}/Attr.vue`))
  })
}
