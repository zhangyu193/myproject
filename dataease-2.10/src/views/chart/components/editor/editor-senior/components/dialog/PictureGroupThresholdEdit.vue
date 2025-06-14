<script lang="tsx" setup>
import icon_info_filled from '@/assets/svg/icon_info_filled.svg'
import icon_deleteTrash_outlined from '@/assets/svg/icon_delete-trash_outlined.svg'
import icon_add_outlined from '@/assets/svg/icon_add_outlined.svg'
import { PropType, reactive } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { fieldType } from '@/utils/attr'
import { iconFieldMap } from '@/components/icon-group/field-list'
import PictureItem from '@/custom-component/picture-group/PictureItem.vue'
import PictureOptionPrefix from '@/custom-component/picture-group/PictureOptionPrefix.vue'

const { t } = useI18n()

const props = defineProps({
  chart: {
    type: Object as PropType<ChartObj>,
    required: true
  },
  element: {
    type: Object,
    default() {
      return {
        propValue: { urlList: [] }
      }
    }
  },
  threshold: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['onTableThresholdChange'])

const thresholdCondition = {
  term: 'eq',
  field: '0',
  value: '0',
  color: '#ff0000ff',
  backgroundColor: '#ffffff00',
  min: '0',
  max: '1'
}
const textOptions = [
  {
    label: '',
    options: [
      {
        value: 'eq',
        label: t('chart.filter_eq')
      },
      {
        value: 'not_eq',
        label: t('chart.filter_not_eq')
      }
    ]
  },
  {
    label: '',
    options: [
      {
        value: 'like',
        label: t('chart.filter_like')
      },
      {
        value: 'not like',
        label: t('chart.filter_not_like')
      }
    ]
  },
  {
    label: '',
    options: [
      {
        value: 'null',
        label: t('chart.filter_null')
      },
      {
        value: 'not_null',
        label: t('chart.filter_not_null')
      }
    ]
  },
  {
    label: '',
    options: [
      {
        value: 'default',
        label: '默认'
      }
    ]
  }
]
const dateOptions = [
  {
    label: '',
    options: [
      {
        value: 'eq',
        label: t('chart.filter_eq')
      },
      {
        value: 'not_eq',
        label: t('chart.filter_not_eq')
      }
    ]
  },
  {
    label: '',
    options: [
      {
        value: 'lt',
        label: t('chart.filter_lt')
      },
      {
        value: 'gt',
        label: t('chart.filter_gt')
      }
    ]
  },
  {
    label: '',
    options: [
      {
        value: 'le',
        label: t('chart.filter_le')
      },
      {
        value: 'ge',
        label: t('chart.filter_ge')
      }
    ]
  },
  {
    label: '',
    options: [
      {
        value: 'default',
        label: '默认'
      }
    ]
  }
]
const valueOptions = [
  {
    label: '',
    options: [
      {
        value: 'eq',
        label: t('chart.filter_eq')
      },
      {
        value: 'not_eq',
        label: t('chart.filter_not_eq')
      }
    ]
  },
  {
    label: '',
    options: [
      {
        value: 'lt',
        label: t('chart.filter_lt')
      },
      {
        value: 'gt',
        label: t('chart.filter_gt')
      }
    ]
  },
  {
    label: '',
    options: [
      {
        value: 'le',
        label: t('chart.filter_le')
      },
      {
        value: 'ge',
        label: t('chart.filter_ge')
      }
    ]
  },
  {
    label: '',
    options: [
      {
        value: 'between',
        label: t('chart.filter_between')
      }
    ]
  },
  {
    label: '',
    options: [
      {
        value: 'default',
        label: '默认'
      }
    ]
  }
]

const state = reactive({
  thresholdArr: [] as TableThreshold[],
  fields: [],
  thresholdObj: {
    fieldId: '',
    field: {},
    conditions: []
  } as TableThreshold
})

const init = () => {
  state.thresholdArr = JSON.parse(JSON.stringify(props.threshold)) as TableThreshold[]
  initFields()
}
const initOptions = item => {
  if (item.field) {
    if ([0, 5, 7].includes(item.field.deType)) {
      item.options = JSON.parse(JSON.stringify(textOptions))
    } else if (item.field.deType === 1) {
      item.options = JSON.parse(JSON.stringify(dateOptions))
    } else {
      item.options = JSON.parse(JSON.stringify(valueOptions))
    }
    item.conditions &&
      item.conditions.forEach(ele => {
        ele.term = ''
      })
  }
}
const initFields = () => {
  let fields = []
  if (props.chart.type === 'table-info') {
    fields = JSON.parse(JSON.stringify(props.chart.xAxis))
  } else if (props.chart.type === 'table-pivot') {
    const xAxis = JSON.parse(JSON.stringify(props.chart.xAxis))
    const xAxisExt = JSON.parse(JSON.stringify(props.chart.xAxisExt))
    const yAxis = JSON.parse(JSON.stringify(props.chart.yAxis))
    fields = [...xAxis, ...xAxisExt, ...yAxis]
  } else {
    const xAxis = JSON.parse(JSON.stringify(props.chart.xAxis))
    const yAxis = JSON.parse(JSON.stringify(props.chart.yAxis))
    fields = [...xAxis, ...yAxis]
  }
  state.fields.splice(0, state.fields.length, ...fields)
}
const addThreshold = () => {
  state.thresholdArr.push(JSON.parse(JSON.stringify(state.thresholdObj)))
  changeThreshold()
}
const removeThreshold = index => {
  state.thresholdArr.splice(index, 1)
  changeThreshold()
}

const changeThreshold = () => {
  emit('onTableThresholdChange', state.thresholdArr)
}

const addConditions = item => {
  item.conditions.push(JSON.parse(JSON.stringify(thresholdCondition)))
  changeThreshold()
}
const removeCondition = (item, index) => {
  item.conditions.splice(index, 1)
  changeThreshold()
}

const addField = item => {
  // get field
  if (state.fields && state.fields.length > 0) {
    state.fields.forEach(ele => {
      if (item.fieldId === ele.id) {
        item.field = JSON.parse(JSON.stringify(ele))
        initOptions(item)
      }
    })
  }
  changeThreshold()
}

init()
</script>

<template>
  <el-col>
    <div class="tip">
      <Icon name="icon_info_filled" class="icon-style"
        ><icon_info_filled class="svg-icon icon-style"
      /></Icon>
      <span style="padding-left: 10px">{{ t('chart.table_threshold_tip') }}</span>
    </div>

    <div @keydown.stop @keyup.stop style="max-height: 50vh; overflow-y: auto">
      <div
        v-for="(fieldItem, fieldIndex) in state.thresholdArr"
        :key="fieldIndex"
        class="field-item"
      >
        <el-row style="margin-top: 6px; align-items: center; justify-content: space-between">
          <el-form-item class="form-item">
            <el-select
              style="width: 181px"
              v-model="fieldItem.fieldId"
              @change="addField(fieldItem)"
            >
              <el-option
                class="series-select-option"
                v-for="fieldOption in state.fields"
                :key="fieldOption.id"
                :label="fieldOption.name"
                :value="fieldOption.id"
                :disabled="chart.type === 'table-info' && fieldOption.deType === 7"
              >
                <el-icon style="margin-right: 8px">
                  <Icon
                    ><component
                      :class="`field-icon-${
                        fieldType[[2, 3].includes(fieldOption.deType) ? 2 : 0]
                      }`"
                      class="svg-icon"
                      :is="iconFieldMap[fieldType[fieldOption.deType]]"
                    ></component
                  ></Icon>
                </el-icon>
                {{ fieldOption.name }}
              </el-option>
            </el-select>
          </el-form-item>

          <el-button
            class="circle-button m-icon-btn"
            text
            :style="{ float: 'right' }"
            @click="removeThreshold(fieldIndex)"
          >
            <el-icon size="20px" style="color: #646a73">
              <Icon name="icon_delete-trash_outlined"
                ><icon_deleteTrash_outlined class="svg-icon"
              /></Icon>
            </el-icon>
          </el-button>
        </el-row>

        <el-row :style="{ marginTop: '16px', borderTop: '1px solid #d5d6d8' }">
          <el-row
            v-for="(item, index) in fieldItem.conditions"
            :key="index"
            class="line-item"
            :gutter="10"
          >
            <el-col :span="4">
              <el-form-item class="form-item">
                <el-select v-model="item.term" @change="changeThreshold">
                  <el-option-group
                    v-for="(group, idx) in fieldItem.options"
                    :key="idx"
                    :label="group.label"
                  >
                    <el-option
                      v-for="opt in group.options"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-option-group>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col
              v-if="
                !item.term.includes('null') &&
                !item.term.includes('empty') &&
                item.term !== 'between' &&
                !item.term.includes('default')
              "
              :span="10"
              style="text-align: center"
            >
              <el-form-item class="form-item">
                <el-input-number
                  v-model="item.value"
                  v-if="[2, 3].includes(fieldItem.field.deType)"
                  :placeholder="t('chart.drag_block_label_value')"
                  controls-position="right"
                  class="value-item"
                  clearable
                  @change="changeThreshold"
                />
                <el-input
                  v-model="item.value"
                  v-else
                  :placeholder="t('chart.drag_block_label_value')"
                  controls-position="right"
                  clearable
                  @change="changeThreshold"
                />
              </el-form-item>
            </el-col>

            <el-col v-if="item.term === 'between'" :span="4" style="text-align: center">
              <el-form-item class="form-item">
                <el-input-number
                  v-model="item.min"
                  controls-position="right"
                  class="between-item"
                  :placeholder="t('chart.axis_value_min')"
                  clearable
                  @change="changeThreshold"
                />
              </el-form-item>
            </el-col>

            <el-col v-if="item.term === 'between'" :span="2" style="text-align: center">
              <span style="margin: 0 4px">
                ≤&nbsp;&nbsp;{{ t('chart.drag_block_label_value') }}&nbsp;&nbsp;≤
              </span>
            </el-col>

            <el-col v-if="item.term === 'between'" :span="4" style="text-align: center">
              <el-form-item class="form-item">
                <el-input-number
                  v-model="item.max"
                  controls-position="right"
                  class="between-item"
                  :placeholder="t('chart.axis_value_max')"
                  clearable
                  @change="changeThreshold"
                />
              </el-form-item>
            </el-col>
            <div
              style="display: flex; align-items: center; justify-content: center; margin-left: 8px"
            >
              <div class="color-title">展示图片</div>
              <el-form-item class="form-item">
                <el-select
                  v-model="item.url"
                  @change="changeThreshold"
                  style="width: 181px"
                  popper-class="picture-group-select"
                >
                  <template v-if="item.url" #prefix>
                    <picture-option-prefix :url="item.url"></picture-option-prefix>
                  </template>
                  <el-option
                    v-for="urlInfo in element.propValue.urlList"
                    :key="urlInfo.url"
                    :label="urlInfo.name"
                    :value="urlInfo.url"
                  >
                    <picture-item
                      :active="item.url === urlInfo.url"
                      :url-info="urlInfo"
                    ></picture-item>
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            <div
              style="display: flex; align-items: center; justify-content: center; margin-left: 8px"
            >
              <el-button
                class="circle-button m-icon-btn"
                text
                @click="removeCondition(fieldItem, index)"
              >
                <el-icon size="20px" style="color: #646a73">
                  <Icon name="icon_delete-trash_outlined"
                    ><icon_deleteTrash_outlined class="svg-icon"
                  /></Icon>
                </el-icon>
              </el-button>
            </div>
          </el-row>
        </el-row>

        <el-button
          style="margin-top: 10px"
          class="circle-button"
          type="primary"
          text
          @click="addConditions(fieldItem)"
        >
          <template #icon>
            <Icon name="icon_add_outlined"><icon_add_outlined class="svg-icon" /></Icon>
          </template>
          {{ t('chart.add_style') }}
        </el-button>
      </div>
    </div>

    <el-button
      class="circle-button"
      text
      type="primary"
      style="margin-top: 10px"
      @click="addThreshold"
    >
      <template #icon>
        <Icon name="icon_add_outlined"><icon_add_outlined class="svg-icon" /></Icon>
      </template>
      {{ t('chart.add_condition') }}
    </el-button>
  </el-col>
</template>

<style lang="less" scoped>
.field-item {
  width: 100%;
  border-radius: 4px;
  padding: 10px 16px;
  margin-top: 10px;
  background: #f5f6f7;
}

.line-item {
  width: 100%;
  display: flex;
  justify-content: left;
  align-items: center;
  margin-top: 16px;
}

.form-item {
  height: 28px !important;
  :deep(.el-form-item__label) {
    font-size: 12px;
  }
}

span {
  font-size: 12px;
}

.value-item {
  position: relative;
  display: inline-block;
  width: 100% !important;
}

.between-item {
  position: relative;
  display: inline-block;
  width: 100% !important;
}

.select-item {
  position: relative;
  display: inline-block;
  width: 100% !important;
}

.el-select-dropdown__item {
  padding: 0 20px;
  font-size: 12px;
}

.color-picker-style {
  cursor: pointer;
  z-index: 1003;
  width: 28px;
  height: 28px;
}

.color-picker-style :deep(.el-color-picker__trigger) {
  width: 28px;
  height: 28px;
}

.color-title {
  color: #646a73;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  padding: 0 8px;
}

.tip {
  font-size: 12px;
  background: #d6e2ff;
  border-radius: 4px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
}

:deep(.ed-form-item) {
  margin-bottom: 0 !important;
}

.icon-style {
  width: 14px;
  height: 14px;
  color: var(--ed-color-primary);
}

.m-icon-btn {
  &:hover {
    background: rgba(31, 35, 41, 0.1) !important;
  }
  &:focus {
    background: rgba(31, 35, 41, 0.1) !important;
  }
  &:active {
    background: rgba(31, 35, 41, 0.2) !important;
  }
}

.series-select-option {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 11px;
}
</style>

<style lang="less">
.picture-group-select {
  min-width: 50px !important;
  width: 304px;
  .ed-scrollbar__view {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
  }
  .ed-select-dropdown__item {
    height: 100px !important;
    text-align: center;
    padding: 0px 5px;
  }

  .ed-select-dropdown__item.selected::after {
    display: none;
  }

  .ed-select-dropdown__item.hover {
    background-color: rgba(0, 0, 0, 0) !important;
  }
  .ed-select-dropdown__item.selected {
    background-color: rgba(0, 0, 0, 0) !important;
  }
}
</style>
