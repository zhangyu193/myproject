<template>
  <el-row>
    <el-form ref="form">
      <el-form-item v-show="formatInfo.showDate" :label="t('visualization.show_date')">
        <el-select
          v-model="formatInfo.dateFormat"
          :effect="themes"
          style="width: 100%"
          @change="onFormatChange"
        >
          <el-option
            v-for="item in state.dateOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('visualization.show_time')">
        <el-select
          v-model="formatInfo.timeFormat"
          :effect="themes"
          filterable
          allow-create
          default-first-option
          style="width: 100%"
          @change="onFormatChange"
        >
          <el-option
            v-for="item in state.timeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-checkbox
          :effect="themes"
          v-model="formatInfo.showWeek"
          :label="t('visualization.show_week')"
          @change="onFormatChange"
        />
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'
import { useI18n } from '@de/hooks/web/useI18n'
const { t } = useI18n()
const state = reactive({
  timeOptions: [
    { value: 'hh:mm:ss', label: 'hh:mm:ss' },
    { value: 'hh时mm分ss秒', label: 'hh时mm分ss秒' },
    { value: '', label: '无' }
  ],
  dateOptions: [
    { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' },
    { value: 'yyyy/MM/dd', label: 'yyyy/MM/dd' },
    { value: 'yyyy年MM月dd日', label: 'yyyy年MM月dd日' }
  ]
})

const props = defineProps({
  canvasId: {
    type: String,
    require: true
  },
  formatInfo: {
    type: Object,
    required: true
  },
  themes: {
    type: String,
    required: true,
    default: 'dark'
  }
})

const { formatInfo } = toRefs(props)

const onFormatChange = () => {
  // doFormatChange
}
</script>

<style lang="less" scoped></style>
