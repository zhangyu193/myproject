<script lang="tsx" setup>
import { useI18n } from '@de/hooks/web/useI18n'
import { reactive, toRefs } from 'vue'
import {
  isEnLocal,
  formatterType,
  getUnitTypeList,
  onChangeFormatCfgUnitLanguage,
  valueFormatter,
  initFormatCfgUnit
} from '@de/views/chart/components/js/formatter'

const { t } = useI18n()

const props = defineProps({
  formatterItem: {
    type: Object,
    required: true
  },
  chart: {
    type: Object,
    required: true
  }
})

const { formatterItem } = toRefs(props)

const state = reactive({
  typeList: formatterType,
  exampleResult: '20000000'
})

function changeUnitLanguage(cfg: BaseFormatter, lang) {
  onChangeFormatCfgUnitLanguage(cfg, lang)
  getExampleValue()
}

const init = () => {
  if (!formatterItem.value.formatterCfg) {
    formatterItem.value.formatterCfg = formatterItem

    initFormatCfgUnit(formatterItem.value.formatterCfg)
  }
}
const getExampleValue = () => {
  state.exampleResult = valueFormatter(20000000, formatterItem.value.formatterCfg)
}

init()
getExampleValue()
</script>

<template>
  <div>
    <el-form
      ref="form"
      :model="formatterItem.formatterCfg"
      class="formatter-form"
      label-position="top"
    >
      <el-form-item :label="t('chart.value_formatter_type')">
        <el-radio-group v-model="formatterItem.formatterCfg.type" @change="getExampleValue">
          <el-radio v-for="radio in state.typeList" :key="radio.value" :label="radio.value">{{
            t('chart.' + radio.name)
          }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="formatterItem.formatterCfg.type !== 'auto'"
        :label="t('chart.value_formatter_decimal_count')"
      >
        <el-input-number
          controls-position="right"
          v-model="formatterItem.formatterCfg.decimalCount"
          :min="0"
          :max="10"
          @change="getExampleValue"
        />
      </el-form-item>

      <template v-if="formatterItem.formatterCfg.type !== 'percent'">
        <el-row :gutter="8">
          <el-col :span="12" v-if="!isEnLocal">
            <el-form-item :label="t('chart.value_formatter_unit_language')">
              <el-select
                v-model="formatterItem.formatterCfg.unitLanguage"
                :placeholder="t('chart.pls_select_field')"
                @change="v => changeUnitLanguage(formatterItem.formatterCfg, v)"
              >
                <el-option :label="t('chart.value_formatter_unit_language_ch')" value="ch" />
                <el-option :label="t('chart.value_formatter_unit_language_en')" value="en" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="isEnLocal ? 24 : 12">
            <el-form-item :label="t('chart.value_formatter_unit')">
              <el-select
                v-model="formatterItem.formatterCfg.unit"
                :placeholder="t('chart.pls_select_field')"
                @change="getExampleValue"
                style="width: 100%"
              >
                <el-option
                  v-for="item in getUnitTypeList(formatterItem.formatterCfg.unitLanguage)"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <el-form-item :label="t('chart.value_formatter_suffix')">
        <el-input
          v-model="formatterItem.formatterCfg.suffix"
          clearable
          :placeholder="t('commons.input_content')"
          @change="getExampleValue"
        />
      </el-form-item>

      <el-form-item>
        <el-checkbox
          v-model="formatterItem.formatterCfg.thousandSeparator"
          @change="getExampleValue"
          :label="t('chart.value_formatter_thousand_separator')"
        />
      </el-form-item>

      <div style="line-height: 22px">
        <span style="color: #646a73">{{ t('chart.value_formatter_example') }}</span>
        <span style="margin-left: 12px">{{ state.exampleResult }}</span>
      </div>
    </el-form>
  </div>
</template>

<style lang="less" scoped>
.el-form-item {
  margin-bottom: 10px !important;
}
.formatter-form {
  :deep(.ed-form-item) {
    margin-bottom: 16px;
  }

  :deep(.ed-form-item__label) {
    color: #1f2329;
    margin-bottom: 8px !important;
    font-size: 14px !important;
    font-weight: 400 !important;
  }

  :deep(.ed-checkbox) {
    color: #1f2329;
  }
  :deep(.ed-checkbox__label) {
    font-size: 14px !important;
    font-weight: 400 !important;
  }

  :deep(.ed-radio__label) {
    font-size: 14px !important;
    font-weight: 400 !important;
  }
}

.el-select-dropdown__item :deep(span) {
  font-size: 14px !important;
}
.exp-style {
  color: #c0c4cc;
  font-size: 12px;
}
</style>
