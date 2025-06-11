<script setup lang="ts">
import dbMoreWeb from '@de/assets/svg/db-more-web.svg'
import { toRefs } from 'vue'
import eventBus from '@de/utils/eventBus'
import DragComponent from '@de/custom-component/component-group/DragComponent.vue'
import { commonHandleDragEnd, commonHandleDragStart } from '@de/utils/canvasUtils'

const props = defineProps({
  dvModel: {
    type: String,
    default: 'dv'
  },
  themes: {
    type: String,
    default: 'dark'
  }
})

const { dvModel } = toRefs(props)
const newComponent = () => {
  eventBus.emit('handleNew', { componentName: 'DeFrame', innerType: 'DeFrame' })
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
      :icon="dbMoreWeb"
      :label="$t('visualization.web')"
      drag-info="DeFrame&DeFrame"
    ></drag-component>
  </div>
</template>

<style lang="less" scoped>
.group {
  padding: 12px 8px;
}
</style>
