<template>
  <div class="attr-list de-collapse-style">
    <CommonAttr :element="curComponent"></CommonAttr>
  </div>
</template>

<script setup lang="ts">
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import CommonAttr from '@de/custom-component/common/CommonAttr.vue'
import { storeToRefs } from 'pinia'
const dvMainStore = dvMainStoreWithOut()
const { curComponent } = storeToRefs(dvMainStore)
</script>
