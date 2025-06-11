<script setup lang="ts">
import { ref } from 'vue'
import { useEmitt } from '@de/hooks/web/useEmitt'
import configGlobal from '@de/components/config-global/src/ConfigGlobal.vue'
import { useRoute } from 'vue-router'
import ExportExcel from '@de/views/visualized/data/dataset/ExportExcel.vue'
const route = useRoute()
const exportExcelRef = ref()
const exportExcelCenter = params => {
  exportExcelRef.value.init(params)
}
useEmitt({
  name: 'data-export-center',
  callback: exportExcelCenter
})
</script>
<template>
  <config-global>
    <router-view :key="route.path" />
    <ExportExcel ref="exportExcelRef"></ExportExcel>
  </config-global>
</template>
