<script setup lang="ts">
import { toRefs } from 'vue'
import { propTypes } from '@de/utils/propTypes'
import ComponentButton from '@de/components/visualization/ComponentButton.vue'
import ComponentButtonLabel from '@de/components/visualization/ComponentButtonLabel.vue'

const props = defineProps({
  title: propTypes.string,
  iconName: propTypes.string,
  showSplitLine: propTypes.bool,
  baseWidth: {
    required: false,
    type: Number,
    default: 200
  },
  isLabel: propTypes.bool.def(false),
  themes: {
    type: String,
    default: 'dark'
  },
  placement: {
    type: String,
    default: 'bottom-start'
  }
})

const { title, iconName, baseWidth, themes } = toRefs(props)
</script>

<template>
  <el-popover
    :placement="placement"
    :width="baseWidth"
    trigger="click"
    :show-arrow="false"
    :popper-class="'custom-popover-' + themes"
  >
    <template #reference>
      <component
        :is="isLabel ? ComponentButtonLabel : ComponentButton"
        :title="title"
        :icon-name="iconName"
        :show-split-line="showSplitLine"
      ></component>
    </template>
    <slot></slot>
  </el-popover>
</template>
<style lang="less" scoped></style>
