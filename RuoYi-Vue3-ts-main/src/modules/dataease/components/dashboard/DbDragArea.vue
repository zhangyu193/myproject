<template>
  <div class="dragHandle shadow-t" @mouseup="dragUp"></div>
  <div class="dragHandle shadow-r" @mouseup="dragUp"></div>
  <div class="dragHandle shadow-b" @mouseup="dragUp"></div>
  <div class="dragHandle shadow-l" @mouseup="dragUp"></div>
</template>

<script setup lang="ts">
import { nextTick, toRefs } from 'vue'
import eventBus from '@de/utils/eventBus'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
const dvMainStore = dvMainStoreWithOut()

const props = defineProps({
  item: {
    required: true,
    type: Object,
    default() {
      return {
        component: null,
        propValue: null,
        request: null,
        linkage: null,
        type: null,
        events: null,
        style: null,
        id: null
      }
    }
  },
  index: {
    required: true,
    type: [Number, String],
    default: 0
  }
})

const { item, index } = toRefs(props)

const dragUp = () => {
  // 将当前点击组件的事件传播出去
  nextTick(() => eventBus.emit('componentClick'))
  dvMainStore.setInEditorStatus(true)
  dvMainStore.setClickComponentStatus(true)
  dvMainStore.setCurComponent({ component: item.value, index: index.value })
}
</script>

<style lang="less" scoped>
.dragHandle {
  position: absolute;
  z-index: 20;
  cursor: move;
}
.shadow-t {
  width: 100%;
  height: 10px;
  left: 0;
  top: 0;
}
.shadow-r {
  width: 10px;
  height: calc(100% - 15px);
  right: 0;
  top: 0;
}
.shadow-b {
  width: calc(100% - 15px);
  height: 10px;
  left: 0;
  bottom: 0;
}
.shadow-l {
  width: 10px;
  height: 100%;
  left: 0;
  top: 0;
}
</style>
