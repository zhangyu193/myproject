<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { storeToRefs } from 'pinia'
const dvMainStore = dvMainStoreWithOut()
const wRuleRef = ref(null)
const props = defineProps({
  tickLabelFormatter: {
    type: Function,
    default: value => value.toString() // 刻度标签格式化函数，默认直接转为字符串
  },
  size: {
    type: Number,
    default: 300 // 尺子方向
  },
  direction: {
    type: String,
    default: 'horizontal' // 尺子方向
  }
})

const labelInterval = 5
const emits = defineEmits(['update:tickSize'])

const { canvasStyleData, curComponent, componentData } = storeToRefs(dvMainStore)

const rulerSize = computed(() =>
  props.direction === 'horizontal' ? canvasStyleData.value.width : canvasStyleData.value.height
)

// 计算复合画布内部组件偏移量
const parentStyle = computed(() => {
  const style = { left: 0, top: 0 }
  if (curComponent.value && curComponent.value.canvasId !== 'canvas-main') {
    componentData.value.forEach(item => {
      if (curComponent.value.canvasId.indexOf(item.id) > -1) {
        style.left = item.style.left
        style.top = item.style.top
      }
    })
    // tab页头部偏移量
    if (curComponent.value.canvasId.indexOf('Group') === -1) {
      style.top = style.top + 56
    }
  }
  return style
})

const curComponentShadow = computed(() => {
  if (curComponent.value) {
    return {
      left:
        (props.direction === 'horizontal'
          ? curComponent.value.style.left + parentStyle.value.left
          : curComponent.value.style.top + parentStyle.value.top) + 'px',
      width:
        (props.direction === 'horizontal'
          ? curComponent.value.style.width
          : curComponent.value.style.height) + 'px'
    }
  } else {
    return {}
  }
})

const ticks = computed(() => {
  const result = []
  let currentValue = 0
  while (currentValue <= rulerSize.value) {
    const isLong = currentValue % (labelInterval * tickSize.value) === 0
    const label = isLong ? props.tickLabelFormatter(currentValue) : ''
    result.push({ position: (currentValue * canvasStyleData.value.scale) / 100, label, isLong })
    currentValue += tickSize.value
  }
  return result
})

const wStyle = computed(() => {
  return {
    width: rulerSize.value * 1.5 + 'px'
  }
})

const radio = computed(() => rulerSize.value / canvasStyleData.value.width)
const tickSize = computed(
  () =>
    10 *
    Math.max(
      Math.floor((200000 * radio.value) / (rulerSize.value * canvasStyleData.value.scale)),
      1
    )
)

const scaleWidth = computed(() => (rulerSize.value * canvasStyleData.value.scale) / 100)

const rulerScroll = e => {
  const left = props.direction === 'vertical' ? e.scrollTop : e.scrollLeft
  wRuleRef.value.scrollTo(left, 0)
}

const outerStyle = computed(() => {
  return {
    width: props.direction === 'vertical' ? props.size - 30 + 'px' : '100%'
  }
})

const curShadowShow = computed(() => curComponent.value && curComponent.value.category !== 'hidden')

const tickSizeScale = computed(() => (tickSize.value * canvasStyleData.value.scale) / 100)

watch(
  () => tickSizeScale.value,
  () => {
    emits('update:tickSize', tickSizeScale.value)
  },
  { immediate: true }
)

defineExpose({
  rulerScroll
})
</script>

<template>
  <div
    class="ruler-outer"
    :style="outerStyle"
    :class="{ 'ruler-vertical': direction === 'vertical' }"
    ref="wRuleRef"
  >
    <!--覆盖着尺子上方防止鼠标移到尺子位置滑动-->
    <div class="ruler-shadow" :style="outerStyle"></div>
    <div :style="wStyle" class="ruler-outer-scroll">
      <div class="ruler" :style="{ width: `${scaleWidth}px` }">
        <div v-if="curShadowShow" :style="curComponentShadow" class="cur-shadow"></div>
        <div class="ruler-line" :style="{ width: `${scaleWidth}px` }"></div>
        <div
          v-for="(tick, index) in ticks"
          :key="index"
          class="ruler-tick"
          :class="{ 'long-tick': tick.isLong }"
          :style="{ left: `${tick.position}px` }"
        >
          <span v-if="tick.isLong" class="tick-label">{{ tick.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.ruler-vertical {
  position: absolute;
  left: 30px;
  top: 30px;
  transform-origin: top left;
  transform: rotate(90deg);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 2;
  .ruler {
    .ruler-line {
      top: 0;
    }
    .ruler-tick {
      top: 0;
      .tick-label {
        transform: rotate(180deg);
      }
    }
  }
}

.ruler-shadow {
  position: absolute;
  height: 30px;
  z-index: 10;
  overflow: hidden;
}

.ruler-outer {
  overflow-x: auto;
  background-color: #2c2c2c;
  &::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
  }
}

.ruler-outer-scroll {
  min-width: 1600px;
  display: flex;
  justify-content: center;
}
.ruler {
  position: relative;
  height: 30px;
  display: flex;
  align-items: center;
  background-color: #2c2c2c;
}

.ruler-line {
  position: absolute;
  bottom: 0;
  height: 1px;
  background-color: #ac2a2a;
}

.ruler-tick {
  position: absolute;
  bottom: 1px;
  height: 3px;
  width: 1px;
  background-color: #e38a8a;
}

.long-tick {
  width: 1px;
  height: 15px;
}

.tick-label {
  position: absolute;
  bottom: 2px;
  font-size: 8px;
  left: 50%;
  transform: translateX(2%);
  white-space: nowrap;
}

.cur-shadow {
  background: rgba(10, 123, 224, 0.3);
  height: 30px;
  position: absolute;
}
</style>
