<script lang="ts" setup>
import { propTypes } from '@de/utils/propTypes'
defineProps({
  label: propTypes.string.def('')
})
</script>

<template>
  <div class="base-info-item">
    <p class="label">{{ label }}</p>
    <p class="value ellipsis">
      <slot></slot>
    </p>
  </div>
</template>

<style lang="less">
.base-info-item {
  margin-top: 16px;
  font-family: var(--de-custom_font, 'PingFang');
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  width: 100%;
  .label {
    color: #646a73;
  }
  .value {
    margin-top: 4px;
    color: #1f2329;
    white-space: pre-wrap;
  }
}
</style>
