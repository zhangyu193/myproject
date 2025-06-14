<!-- IconSlider.vue -->
<template>
  <el-tooltip offset="22" effect="dark" placement="left" :content="t('visualization.query')">
    <div
      class="canvas-filter"
      :class="{ 'filter-btn-fix': isFixed }"
      @mousedown.stop
      @mousedup.stop
    >
      <div class="icon-slider" @mouseenter="slideOut" @mouseleave="slideBack">
        <div
          class="icon-container"
          :class="{ 'icon-container-active': filterActive }"
          :style="{ transform: `translateX(${offset}px)` }"
          @click="popAreaActiveChange"
        >
          <el-icon><Filter /></el-icon>
        </div>
      </div>
    </div>
  </el-tooltip>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ElTooltip } from 'element-plus-secondary'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { storeToRefs } from 'pinia'
import { useI18n } from '@de/hooks/web/useI18n'
const dvMainStore = dvMainStoreWithOut()
const offset = ref(0)
const slideDistance = ref(14) // 滑动距离
const { canvasState } = storeToRefs(dvMainStore)
const { t } = useI18n()

defineProps({
  isFixed: {
    type: Boolean,
    default: false
  }
})
const filterActive = computed(() => canvasState.value.curPointArea === 'hidden')
const slideOut = () => {
  offset.value = -slideDistance.value
}

const popAreaActiveChange = () => {
  dvMainStore.popAreaActiveSwitch()
}
const slideBack = () => {
  offset.value = 0
}
</script>

<style lang="less" scoped>
.canvas-filter {
  position: absolute;
  right: -14px;
  bottom: 50px;
  width: 28px;
  height: 32px;
}
.icon-slider {
  position: relative;
  z-index: 100;
  width: 28px;
  height: 32px;
}

.icon-container {
  transition: transform 0.3s ease; /* 过渡动画 */
  background: rgba(26, 26, 26, 1);
  font-size: 14px;
  border-bottom: 1px solid rgba(67, 67, 67, 1);
  border-left: 1px solid rgba(67, 67, 67, 1);
  border-top: 1px solid rgba(67, 67, 67, 1);
  border-radius: 16px 0 0 16px;
  padding: 6px 0 0 6px;
  cursor: pointer;
  &:hover {
    background: rgba(235, 235, 235, 0.1);
  }

  &:active {
    background: rgba(235, 235, 235, 0.2);
  }
}
.icon-container-active {
  transform: translateX(-14px) !important;
}

img {
  max-width: 100%;
  max-height: 100%;
}

.filter-btn-fix {
  position: fixed !important;
}
</style>
