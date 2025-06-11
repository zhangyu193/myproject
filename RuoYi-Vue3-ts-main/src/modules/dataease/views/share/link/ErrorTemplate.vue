<script lang="ts" setup>
import EmptyBackground from '@de/components/empty-background/src/EmptyBackground.vue'
import { propTypes } from '@de/utils/propTypes'
const props = defineProps({
  msg: propTypes.string.def('')
})
</script>
<template>
  <EmptyBackground img-type="noneWhite" :description="props.msg" />
</template>
