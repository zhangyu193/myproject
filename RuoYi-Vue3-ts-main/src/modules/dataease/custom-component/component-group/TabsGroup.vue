<script setup lang="ts">
import dvTabShow from '@de/assets/svg/dv-tab-show.svg'
import { toRefs } from 'vue'
import eventBus from '@de/utils/eventBus'
import DragComponent from '@de/custom-component/component-group/DragComponent.vue'
import { commonHandleDragEnd, commonHandleDragStart } from '@de/utils/canvasUtils'

const props = defineProps({
  propValue: {
    type: Array,
    default: () => []
  },
  dvModel: {
    type: String,
    default: 'dv'
  },
  element: {
    type: Object,
    default() {
      return {
        propValue: null
      }
    }
  },
  themes: {
    type: String,
    default: 'dark'
  }
})

const { dvModel } = toRefs(props)
const newComponent = () => {
  eventBus.emit('handleNew', { componentName: 'DeTabs', innerType: 'DeTabs' })
}

const handleDragStart = e => {
  commonHandleDragStart(e, dvModel.value)
}

const handleDragEnd = e => {
  commonHandleDragEnd(e, dvModel.value)
}
</script>

<template>
  <div
    class="group"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    v-on:click="newComponent"
  >
    <drag-component
      :themes="themes"
      :icon="dvTabShow"
      label="Tab"
      drag-info="DeTabs&DeTabs"
    ></drag-component>
  </div>
</template>

<style lang="less" scoped>
.group {
  padding: 12px 8px;
}
</style>
