<script setup lang="ts">
import dbMoreWeb from '@de/assets/svg/db-more-web.svg'
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
const newComponent = params => {
  eventBus.emit('handleNew', { componentName: params, innerType: params })
}

const handleDragStart = e => {
  commonHandleDragStart(e, dvModel.value)
}

const handleDragEnd = e => {
  commonHandleDragEnd(e, dvModel.value)
}
</script>

<template>
  <div class="group" @dragstart="handleDragStart" @dragend="handleDragEnd">
    <drag-component
      :themes="themes"
      name="YYYY-MM-DD 08:00:00"
      :label="t('visualization.date_time')"
      drag-info="DeTimeClock&DeTimeClock"
      v-on:click="newComponent('DeTimeClock')"
    ></drag-component>
    <drag-component
      :themes="themes"
      :icon="dbMoreWeb"
      :label="t('visualization.web')"
      drag-info="DeFrame&DeFrame"
      v-on:click="newComponent('DeFrame')"
    ></drag-component>
  </div>
</template>

<style lang="less" scoped>
.group {
  padding: 12px 8px;
  display: inline-flex;
}
</style>
