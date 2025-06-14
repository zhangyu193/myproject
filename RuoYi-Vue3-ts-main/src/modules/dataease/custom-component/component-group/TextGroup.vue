<script setup lang="ts">
import dvRichText from '@de/assets/svg/dv-richText.svg'
import dvScrollText from '@de/assets/svg/dv-scroll-text.svg'
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
    default: 'dataV'
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

const { dvModel, themes } = toRefs(props)

const handleDragStart = e => {
  commonHandleDragStart(e, dvModel.value)
}

const handleDragEnd = e => {
  commonHandleDragEnd(e, dvModel.value)
}

const newComponent = (componentName, innerType) => {
  eventBus.emit('handleNew', { componentName: componentName, innerType: innerType })
}
</script>

<template>
  <div class="group" @dragstart="handleDragStart" @dragend="handleDragEnd">
    <drag-component
      :themes="themes"
      :icon="dvRichText"
      :label="t('visualization.rich_text')"
      drag-info="UserView&rich-text"
      v-on:click="newComponent('UserView', 'rich-text')"
    ></drag-component>
    <drag-component
      v-if="dvModel === 'dataV'"
      :themes="themes"
      :icon="dvScrollText"
      :label="t('visualization.scroll_text')"
      drag-info="ScrollText&ScrollText"
      v-on:click="newComponent('ScrollText', 'ScrollText')"
    ></drag-component>
  </div>
</template>

<style lang="less" scoped>
.group {
  padding: 12px 8px;
  display: inline-flex;
}
</style>
