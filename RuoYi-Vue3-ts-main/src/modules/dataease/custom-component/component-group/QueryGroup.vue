<script setup lang="ts">
import dvFilterShow from '@de/assets/svg/dv-filter-show.svg'
import { toRefs } from 'vue'
import eventBus from '@de/utils/eventBus'
import DragComponent from '@de/custom-component/component-group/DragComponent.vue'
import { commonHandleDragEnd, commonHandleDragStart } from '@de/utils/canvasUtils'
import { useI18n } from '@de/hooks/web/useI18n'
const { t } = useI18n()
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

const handleDragStart = e => {
  commonHandleDragStart(e, dvModel.value)
}

const handleDragEnd = e => {
  commonHandleDragEnd(e, dvModel.value)
}

const newComponent = componentName => {
  eventBus.emit('handleNew', { componentName: componentName, innerType: componentName })
}
</script>

<template>
  <div
    class="group"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    v-on:click="newComponent('VQuery')"
  >
    <drag-component
      :themes="themes"
      :icon="dvFilterShow"
      :label="t('visualization.query_component')"
      drag-info="VQuery&VQuery"
    ></drag-component>
  </div>
</template>

<style lang="less" scoped>
.group {
  padding: 12px 8px;
}
.custom_img {
  width: 100px;
  height: 70px;
  cursor: pointer;
}
</style>
