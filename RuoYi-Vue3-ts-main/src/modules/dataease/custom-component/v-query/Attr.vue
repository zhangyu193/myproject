<script setup lang="ts">
import CommonAttr from '@de/custom-component/common/CommonAttr.vue'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { storeToRefs } from 'pinia'

const dvMainStore = dvMainStoreWithOut()
const { curComponent } = storeToRefs(dvMainStore)
</script>

<template>
  <div class="attr-list">
    <CommonAttr :element="curComponent"></CommonAttr>
    <div class="content">
      <span>{{ $t('visualization.content') }}</span>
      <el-input v-model="curComponent['propValue']" type="textarea" :rows="3" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.content {
  width: 100%;
  font-size: 12px;
  padding: 10px;
}
:deep(.ed-textarea__inner) {
  color: #ffffff;
  background-color: #000000;
}
</style>
