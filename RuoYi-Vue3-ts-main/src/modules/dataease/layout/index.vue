<template>
  <div class="dataease-layout">
    <ConfigGlobal>
      <router-view />
    </ConfigGlobal>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import ConfigGlobal from '../components/config-global/src/ConfigGlobal.vue'
// 仅在进入 DataEase 页面时挂载其全局样式，离开后移除，避免影响若依页面
// 通过 `?inline` 方式将 less 编译为字符串，在运行时动态插入
import deStyle from '../style/index.less?inline'
import normalizeCss from 'normalize.css/normalize.css?inline'
import s2Css from '@antv/s2/dist/style.min.css?inline'
import elRadioCss from 'element-plus-secondary/theme-chalk/el-radio-button.css?inline'

let styleEl: HTMLStyleElement | null = null

const mountStyle = () => {
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.textContent = normalizeCss + s2Css + elRadioCss + deStyle
    document.head.appendChild(styleEl)
  }
}

const unmountStyle = () => {
  if (styleEl) {
    document.head.removeChild(styleEl)
    styleEl = null
  }
}

onMounted(mountStyle)
onActivated(mountStyle)
onDeactivated(unmountStyle)
onUnmounted(unmountStyle)
</script>
<style scoped>
.dataease-layout {
  padding: 16px;
}
</style>
