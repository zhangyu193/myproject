<template>
  <Icon v-once v-if="element.innerType.includes('board')" class-name="de-svg-main"
    ><component class="svg-icon de-svg-main" :is="iconBoardMap[element.innerType]"></component
  ></Icon>
  <component v-else v-once :is="element.innerType"></component>
</template>

<script setup lang="ts">
import Icon from '@de/components/icon-custom/src/Icon.vue'
import { iconBoardMap } from '@de/components/icon-group/board-list'
import { toRefs } from 'vue'
const props = defineProps({
  propValue: {
    type: String,
    required: true,
    default: ''
  },
  element: {
    type: Object,
    default() {
      return {
        innerType: null
      }
    }
  }
})

const { element } = toRefs(props)
</script>

<style lang="less" scoped>
.de-svg-main {
  width: 100%;
  height: 100%;
}
</style>
