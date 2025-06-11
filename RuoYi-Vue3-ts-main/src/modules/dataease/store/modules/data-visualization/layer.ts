import { defineStore, storeToRefs } from 'pinia'
import { store } from '../../index'
import { dvMainStoreWithOut } from './dvMain'
import { swap } from '@de/utils/utils'
import { useEmitt } from '@de/hooks/web/useEmitt'
import { getComponentById, getCurInfo } from '@de/store/modules/data-visualization/common'
import ChartCarouselTooltip from '@de/views/chart/components/js/g2plot_tooltip_carousel'

const dvMainStore = dvMainStoreWithOut()
const { curComponentIndex, curComponent } = storeToRefs(dvMainStore)

export const layerStore = defineStore('layer', {
  actions: {
    upComponent(componentId?) {
      const curInfo = getCurInfo(componentId)
      if (curInfo) {
        const { index, componentData } = curInfo
        // 上移图层 index，表示元素在数组中越往后
        if (index < componentData.length - 1) {
          swap(componentData, index, index + 1)
          curComponentIndex.value = index + 1
        }
      }
    },

    downComponent(componentId?) {
      const curInfo = getCurInfo(componentId)
      if (curInfo) {
        const { index, componentData } = curInfo
        // 下移图层 index，表示元素在数组中越往前
        if (index > 0) {
          swap(componentData, index, index - 1)
          curComponentIndex.value = index - 1
        }
      }
    },

    topComponent(componentId?) {
      // 置顶
      const curInfo = getCurInfo(componentId)
      if (curInfo) {
        const { index, componentData, targetComponent } = curInfo
        if (index < componentData.length - 1) {
          componentData.splice(index, 1)
          componentData.push(targetComponent)
          curComponentIndex.value = componentData.length - 1
        }
      }
    },

    bottomComponent(componentId?) {
      // 置底
      const curInfo = getCurInfo(componentId)
      if (curInfo) {
        const { index, componentData, targetComponent } = curInfo
        if (index > 0) {
          componentData.splice(index, 1)
          componentData.unshift(targetComponent)
          curComponentIndex.value = 0
        }
      }
    },

    hideComponentWithComponent(componentId?) {
      const targetComponent = getComponentById(componentId)
      // 隐藏
      if (targetComponent) {
        targetComponent.isShow = false
      }
    },
    hideComponent(componentId?) {
      const targetComponent = getComponentById(componentId)
      // 隐藏
      if (targetComponent) {
        targetComponent.isShow = false
      }
    },
    showComponent(componentId?) {
      // 显示
      const targetComponent = getComponentById(componentId)
      if (targetComponent) {
        targetComponent.isShow = true
        if (targetComponent.component == 'Group') {
          targetComponent.propValue.forEach(item => {
            if (item.innerType?.indexOf('table') !== -1) {
              setTimeout(() => {
                useEmitt().emitter.emit('renderChart-' + item.id)
              }, 400)
            }
          })
        } else if (targetComponent?.innerType?.indexOf('table') !== -1) {
          setTimeout(() => {
            useEmitt().emitter.emit('renderChart-' + curComponent.value.id)
          }, 400)
        }
      }
    },
    pausedTooltipCarousel(componentId?) {
      const targetComponent = getComponentById(componentId)
      // 暂停轮播
      if (targetComponent) {
        ChartCarouselTooltip.paused(componentId)
      }
    },
    resumeTooltipCarousel(componentId?) {
      const targetComponent = getComponentById(componentId)
      // 恢复轮播
      if (targetComponent) {
        ChartCarouselTooltip.resume(componentId)
      }
    }
  }
})

export const layerStoreWithOut = () => {
  return layerStore(store)
}
