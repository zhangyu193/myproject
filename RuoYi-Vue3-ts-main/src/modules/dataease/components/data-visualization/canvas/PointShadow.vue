<template>
  <div class="point-shadow" id="point-shadow-main" :style="styleInfo">
    <div class="point-shadow-content">
      <div id="point-shadow-component" class="point-shadow-component" />
      <div class="point-shadow-tips" :style="tipsStyleInfo">
        <div style="width: 100%; text-align: center">组件将被移出Tab</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const dvMainStore = dvMainStoreWithOut()
const { mousePointShadowMap, canvasStyleData } = storeToRefs(dvMainStore)
defineProps({
  canvasId: {
    type: String,
    required: true
  }
})

const tipsStyleInfo = computed(() => {
  return {
    fontSize: (16 * canvasStyleData.value.scale) / 100 + 'px',
    width: mousePointShadowMap.value.width + 'px',
    height: mousePointShadowMap.value.height + 'px'
  }
})

const styleInfo = computed(() => {
  return {
    left: mousePointShadowMap.value.mouseX - mousePointShadowMap.value.width / 2 + 'px',
    top: mousePointShadowMap.value.mouseY - mousePointShadowMap.value.height / 2 - 60 + 'px',
    width: mousePointShadowMap.value.width + 'px',
    height: mousePointShadowMap.value.height + 'px'
  }
})
</script>
<style lang="less" scoped>
.point-shadow {
  z-index: 1000;
  position: absolute;
  cursor: move;
}

.point-shadow-content {
  position: relative;
}

.point-shadow-component {
  opacity: 0.6;
  background-color: rgba(179, 212, 252);
}

.point-shadow-tips {
  left: 0px;
  top: 0px;
  overflow: hidden;
  box-sizing: border-box;
  z-index: 10001;
  display: flex;
  align-items: center;
  position: absolute;
  color: rgba(2, 52, 96, 1);
  font-weight: bold;
  background-color: rgba(179, 212, 252);
}
</style>
