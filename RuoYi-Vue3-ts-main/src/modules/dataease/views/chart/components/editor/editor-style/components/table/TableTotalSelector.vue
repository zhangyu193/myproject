<script lang="ts" setup>
import { onMounted, PropType, reactive, watch, ref, inject, nextTick, computed } from 'vue'
import { useI18n } from '@de/hooks/web/useI18n'
import {
  DEFAULT_BASIC_STYLE,
  DEFAULT_TABLE_TOTAL
} from '@de/views/chart/components/editor/util/chart'
import { cloneDeep, defaultsDeep, find, includes } from 'lodash-es'
import CustomAggrEdit from './CustomAggrEdit.vue'

const { t } = useI18n()

const props = defineProps({
  chart: {
    type: Object as PropType<ChartObj>,
    required: true
  },
  themes: {
    type: String as PropType<EditorTheme>,
    default: 'dark'
  },
  propertyInner: {
    type: Array<string>
  }
})
watch(
  [() => props.chart.customAttr.tableTotal, () => props.chart.xAxis, () => props.chart.yAxis],
  () => {
    init()
  },
  { deep: true }
)

const aggregations = [
  { name: t('chart.none'), value: 'NONE' },
  { name: t('chart.sum'), value: 'SUM' },
  { name: t('chart.avg'), value: 'AVG' },
  { name: t('chart.max'), value: 'MAX' },
  { name: t('chart.min'), value: 'MIN' },
  { name: t('commons.custom'), value: 'CUSTOM' }
]
const state = reactive({
  tableTotalForm: cloneDeep(DEFAULT_TABLE_TOTAL) as ChartTableTotalAttr,
  rowSubTotalItem: {} as DeepPartial<CalcTotalCfg>,
  rowTotalItem: {} as DeepPartial<CalcTotalCfg>,
  colSubTotalItem: {} as DeepPartial<CalcTotalCfg>,
  colTotalItem: {} as DeepPartial<CalcTotalCfg>,
  totalCfg: [] as CalcTotalCfg[],
  totalCfgAttr: '',
  totalItem: {} as DeepPartial<CalcTotalCfg>,
  selectedSubTotalDimensionName: '',
  selectedSubTotalDimension: undefined as { name: string; checked: boolean },
  subTotalDimensionList: [],
  basicStyleForm: JSON.parse(JSON.stringify(DEFAULT_BASIC_STYLE)) as ChartBasicStyle
})

const showColFieldTotalLabel = computed(() => {
  const chart = props.chart
  return (
    chart.customAttr.basicStyle.quotaPosition !== 'row' &&
    chart.xAxisExt.length &&
    chart.yAxis.length > 1
  )
})

const showRowFieldTotalLabel = computed(() => {
  const chart = props.chart
  return (
    chart.customAttr.basicStyle.quotaPosition === 'row' &&
    chart.customAttr.basicStyle.tableLayoutMode !== 'tree' &&
    chart.xAxis.length &&
    chart.xAxisExt.length &&
    chart.yAxis.length > 1
  )
})

function onSelectedSubTotalDimensionNameChange(name) {
  state.selectedSubTotalDimension = find(state.subTotalDimensionList, d => d.name === name)
}

function changeRowSubTableTotal() {
  const list = []
  for (let i = 0; i < state.subTotalDimensionList.length; i++) {
    if (state.subTotalDimensionList[i].checked) {
      list.push(state.subTotalDimensionList[i].name)
    }
  }
  state.tableTotalForm.row.subTotalsDimensions = list
  changeTableTotal('row')
}

const initSubTotalDimensionList = () => {
  const list = []
  if (props.chart.xAxis.length >= 2) {
    for (let i = 0; i < props.chart.xAxis.length - 1; i++) {
      //排除最后一个
      const old = includes(
        state.tableTotalForm.row.subTotalsDimensions,
        props.chart.xAxis[i].dataeaseName
      )
      list.push({
        displayName: props.chart.xAxis[i].name,
        name: props.chart.xAxis[i].dataeaseName,
        checked: !!state.tableTotalForm.row.subTotalsDimensionsNew ? old : true
      })
    }
  }
  state.subTotalDimensionList = list

  const existItem = find(
    state.subTotalDimensionList,
    s => s.name === state.selectedSubTotalDimensionName
  )
  if (existItem) {
    state.selectedSubTotalDimension = existItem
  } else {
    state.selectedSubTotalDimensionName = list[0]?.name
    state.selectedSubTotalDimension = list[0]
  }
  if (!state.tableTotalForm.row.subTotalsDimensionsNew) {
    state.tableTotalForm.row.subTotalsDimensionsNew = true
    changeRowSubTableTotal()
  }
}

const emit = defineEmits(['onTableTotalChange'])

const changeTableTotal = prop => {
  emit('onTableTotalChange', state.tableTotalForm, prop)
}

const init = () => {
  const tableTotal = props.chart?.customAttr?.tableTotal
  if (tableTotal) {
    if (tableTotal.row) {
      tableTotal.row.subTotalsDimensionsNew = !!tableTotal.row?.subTotalsDimensionsNew
    }
    state.tableTotalForm = defaultsDeep(cloneDeep(tableTotal), cloneDeep(DEFAULT_TABLE_TOTAL))
  }
  const yAxis = props.chart.yAxis
  if (yAxis?.length > 0) {
    const axisArr = yAxis.map(i => i.dataeaseName)
    if (axisArr.indexOf(state.tableTotalForm.row.totalSortField) === -1) {
      state.tableTotalForm.row.totalSortField = yAxis[0].dataeaseName
    }
    if (axisArr.indexOf(state.tableTotalForm.col.totalSortField) === -1) {
      state.tableTotalForm.col.totalSortField = yAxis[0].dataeaseName
    }
  } else {
    state.tableTotalForm.row.totalSortField = ''
    state.tableTotalForm.col.totalSortField = ''
  }
  const totals = [
    { ...state.tableTotalForm.row.calcTotals },
    { ...state.tableTotalForm.row.calcSubTotals },
    { ...state.tableTotalForm.col.calcTotals },
    { ...state.tableTotalForm.col.calcSubTotals }
  ]
  totals.forEach(total => {
    setupTotalCfg(total.cfg, yAxis)
  })
  const totalTupleArr: [DeepPartial<CalcTotalCfg>, CalcTotalCfg[]][] = [
    [state.rowTotalItem, state.tableTotalForm.row.calcTotals.cfg],
    [state.rowSubTotalItem, state.tableTotalForm.row.calcSubTotals.cfg],
    [state.colTotalItem, state.tableTotalForm.col.calcTotals.cfg],
    [state.colSubTotalItem, state.tableTotalForm.col.calcSubTotals.cfg]
  ]
  totalTupleArr.forEach(tuple => {
    const [total, totalCfg] = tuple
    if (!totalCfg.length) {
      total.dataeaseName = ''
      total.aggregation = ''
      total.originName = ''
      return
    }
    const totalIndex = totalCfg.findIndex(i => i.dataeaseName === total.dataeaseName)
    if (totalIndex !== -1) {
      total.aggregation = totalCfg[totalIndex].aggregation
    } else {
      total.dataeaseName = totalCfg[0].dataeaseName
      total.aggregation = totalCfg[0].aggregation
      total.originName = totalCfg[0].originName
      total.label = totalCfg[0].label
    }
  })

  const basicStyle = cloneDeep(props.chart.customAttr.basicStyle)
  state.basicStyleForm = defaultsDeep(basicStyle, cloneDeep(DEFAULT_BASIC_STYLE)) as ChartBasicStyle

  initSubTotalDimensionList()
}
const showProperty = prop => props.propertyInner?.includes(prop)
const changeTotal = (totalItem, totals) => {
  for (let i = 0; i < totals.length; i++) {
    const item = totals[i]
    if (item.dataeaseName === totalItem.dataeaseName) {
      totalItem.aggregation = item.aggregation
      totalItem.originName = item.originName
      totalItem.label = item.label
      return
    }
  }
}
const changeTotalAggr = (totalItem, totals, colOrNum) => {
  for (let i = 0; i < totals.length; i++) {
    const item = totals[i]
    if (item.dataeaseName === totalItem.dataeaseName) {
      item.aggregation = totalItem.aggregation
      item.label = totalItem.label
      break
    }
  }
  if (totalItem.aggregation == 'CUSTOM' && !totalItem.originName) {
    return
  }
  changeTableTotal(colOrNum)
}
const setupTotalCfg = (totalCfg, axis) => {
  if (!totalCfg.length) {
    axis.forEach(i => {
      totalCfg.push({
        dataeaseName: i.dataeaseName,
        aggregation: 'SUM',
        label: i.chartShowName ?? i.name
      })
    })
    return
  }
  if (!axis.length) {
    totalCfg.splice(0, totalCfg.length)
    return
  }
  const cfgMap = totalCfg.reduce((p, n) => {
    p[n.dataeaseName] = n
    return p
  }, {})
  totalCfg.splice(0, totalCfg.length)
  axis.forEach(i => {
    totalCfg.push({
      dataeaseName: i.dataeaseName,
      aggregation: cfgMap[i.dataeaseName] ? cfgMap[i.dataeaseName].aggregation : 'SUM',
      originName: cfgMap[i.dataeaseName] ? cfgMap[i.dataeaseName].originName : '',
      label: cfgMap[i.dataeaseName]?.label
        ? cfgMap[i.dataeaseName].label
        : i.chartShowName ?? i.name
    })
  })
}
const quota = inject('quota', () => [])
const dimension = inject('dimension', () => [])
const calcEdit = ref()
const editCalcField = ref(false)
const editField = (totalItem, totalCfg, attr) => {
  editCalcField.value = true
  state.totalCfg = totalCfg
  state.totalCfgAttr = attr
  state.totalItem = totalItem
  nextTick(() => {
    calcEdit.value.initEdit(
      totalItem,
      quota().filter(ele => ele.id !== '-1')
    )
  })
}
const closeEditCalc = () => {
  editCalcField.value = false
}
const confirmEditCalc = () => {
  calcEdit.value.setFieldForm()
  const obj = cloneDeep(calcEdit.value.fieldForm)
  state.totalCfg?.forEach(item => {
    if (item.dataeaseName === obj.dataeaseName) {
      item.originName = obj.originName
      setFieldDefaultValue(item)
      state.totalItem.originName = item.originName
    }
  })
  closeEditCalc()
  changeTableTotal(state.totalCfgAttr)
}
const setFieldDefaultValue = field => {
  field.extField = 2
  field.chartId = props.chart.id
  field.datasetGroupId = props.chart.tableId
  field.lastSyncTime = null
  field.columnIndex = dimension().length + quota().length
  field.deExtractType = field.deType
}
onMounted(() => {
  init()
})
</script>

<template>
  <el-form size="small" ref="tableTotalForm" :model="state.tableTotalForm" label-position="top">
    <el-divider
      v-if="showProperty('row')"
      content-position="center"
      :class="'divider-style-' + themes"
    >
      {{ t('chart.row_cfg') }}
    </el-divider>
    <el-form-item
      v-show="showProperty('row')"
      :label="t('chart.total_show')"
      class="form-item"
      :class="'form-item-' + themes"
    >
      <el-checkbox
        :effect="themes"
        v-model="state.tableTotalForm.row.showGrandTotals"
        @change="changeTableTotal('row.showGrandTotals')"
      >
        {{ t('chart.show') }}
      </el-checkbox>
    </el-form-item>
    <div v-show="showProperty('row') && state.tableTotalForm.row.showGrandTotals">
      <el-form-item
        :label="t('chart.total_position')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-radio-group
          :effect="themes"
          v-model="state.tableTotalForm.row.reverseLayout"
          @change="changeTableTotal('row.reverseLayout')"
        >
          <el-radio :effect="themes" :label="true">{{ t('chart.total_pos_top') }}</el-radio>
          <el-radio :effect="themes" :label="false">{{ t('chart.total_pos_bottom') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="t('chart.table_grand_total_label')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-input
          :effect="themes"
          :placeholder="t('chart.table_grand_total_label')"
          size="small"
          maxlength="20"
          v-model="state.tableTotalForm.row.label"
          clearable
          @change="changeTableTotal('row.label')"
        />
      </el-form-item>
      <el-form-item
        :label="t('chart.aggregation')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-col :span="11">
          <el-select
            :effect="themes"
            v-model="state.rowTotalItem.dataeaseName"
            :placeholder="t('chart.aggregation')"
            @change="changeTotal(state.rowTotalItem, state.tableTotalForm.row.calcTotals.cfg)"
          >
            <el-option
              v-for="option in chart.yAxis"
              :key="option.dataeaseName"
              :label="option.name"
              :value="option.dataeaseName"
            />
          </el-select>
        </el-col>
        <el-col :span="state.rowTotalItem.aggregation === 'CUSTOM' ? 8 : 11" :offset="2">
          <el-select
            :effect="themes"
            v-model="state.rowTotalItem.aggregation"
            :placeholder="t('chart.aggregation')"
            @change="
              changeTotalAggr(
                state.rowTotalItem,
                state.tableTotalForm.row.calcTotals.cfg,
                'row.calcTotals.cfg'
              )
            "
          >
            <el-option
              v-for="option in aggregations"
              :key="option.value"
              :label="option.name"
              :value="option.value"
            />
          </el-select>
        </el-col>
        <el-col v-if="state.rowTotalItem.aggregation === 'CUSTOM'" :span="2" :offset="1">
          <el-icon>
            <Setting
              @click="
                editField(
                  state.rowTotalItem,
                  state.tableTotalForm.row.calcTotals.cfg,
                  'row.calcTotals.cfg'
                )
              "
            />
          </el-icon>
        </el-col>
      </el-form-item>
      <el-form-item
        v-if="showRowFieldTotalLabel"
        class="form-item"
        :label="t('chart.table_field_total_label')"
        :class="'form-item-' + themes"
      >
        <el-input
          :effect="themes"
          :placeholder="t('chart.table_field_total_label')"
          size="small"
          maxlength="20"
          v-model="state.rowTotalItem.label"
          clearable
          @change="
            changeTotalAggr(
              state.rowTotalItem,
              state.tableTotalForm.row.calcTotals.cfg,
              'row.calcTotals.cfg'
            )
          "
        />
      </el-form-item>
      <el-form-item
        v-if="chart.type === 'table-pivot'"
        :label="t('chart.total_sort')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-radio-group
          :effect="themes"
          v-model="state.tableTotalForm.row.totalSort"
          @change="changeTableTotal('row.totalSort')"
        >
          <el-radio :effect="themes" label="none">{{ t('chart.total_sort_none') }}</el-radio>
          <el-radio :effect="themes" label="asc">{{ t('chart.total_sort_asc') }}</el-radio>
          <el-radio :effect="themes" label="desc">{{ t('chart.total_sort_desc') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="chart.type === 'table-pivot' && state.tableTotalForm.row.totalSort !== 'none'"
        :label="t('chart.total_sort_field')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-select
          :effect="themes"
          v-model="state.tableTotalForm.row.totalSortField"
          class="form-item-select"
          :placeholder="t('chart.total_sort_field')"
          @change="changeTableTotal('row.totalSortField')"
        >
          <el-option
            v-for="option in chart.yAxis"
            :key="option.dataeaseName"
            :label="option.name"
            :value="option.dataeaseName"
          />
        </el-select>
      </el-form-item>
    </div>

    <el-form-item
      v-show="showProperty('row')"
      :label="t('chart.sub_total_show')"
      class="form-item"
      :class="'form-item-' + themes"
    >
      <el-checkbox
        :effect="themes"
        v-model="state.tableTotalForm.row.showSubTotals"
        :disabled="chart.xAxis.length < 2"
        @change="changeTableTotal('row')"
      >
        {{ t('chart.show') }}
      </el-checkbox>
    </el-form-item>
    <div v-if="showProperty('row') && state.tableTotalForm.row.showSubTotals">
      <div style="display: flex">
        <div style="width: 22px; flex-direction: row"></div>
        <div style="flex: 1">
          <el-form-item class="form-item" :class="'form-item-' + themes">
            <el-select
              :effect="themes"
              v-model="state.selectedSubTotalDimensionName"
              :disabled="chart.xAxis.length < 2 || state.basicStyleForm.tableLayoutMode === 'tree'"
              @change="onSelectedSubTotalDimensionNameChange"
            >
              <el-option
                v-for="option in state.subTotalDimensionList"
                :key="option.name"
                :label="option.displayName"
                :value="option.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="state.selectedSubTotalDimension"
            class="form-item"
            :class="'form-item-' + themes"
          >
            <el-checkbox
              :effect="themes"
              v-model="state.selectedSubTotalDimension.checked"
              :disabled="chart.xAxis.length < 2 || state.basicStyleForm.tableLayoutMode === 'tree'"
              @change="changeRowSubTableTotal"
            >
              {{ t('chart.show') }}
            </el-checkbox>
          </el-form-item>
        </div>
      </div>

      <el-form-item
        :label="t('chart.total_position')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-radio-group
          :effect="themes"
          v-model="state.tableTotalForm.row.reverseSubLayout"
          :disabled="chart.xAxis.length < 2 || state.basicStyleForm.tableLayoutMode === 'tree'"
          @change="changeTableTotal('row')"
        >
          <el-radio :effect="themes" :label="true">{{ t('chart.total_pos_top') }}</el-radio>
          <el-radio :effect="themes" :label="false">{{ t('chart.total_pos_bottom') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="t('chart.total_label')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-input
          :effect="themes"
          :disabled="chart.xAxis.length < 2"
          :placeholder="t('chart.total_label')"
          v-model="state.tableTotalForm.row.subLabel"
          size="small"
          maxlength="20"
          clearable
          @change="changeTableTotal('row.subLabel')"
        />
      </el-form-item>
      <el-form-item
        :label="t('chart.aggregation')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-col :span="11">
          <el-select
            :effect="themes"
            v-model="state.rowSubTotalItem.dataeaseName"
            :disabled="chart.xAxis.length < 2"
            :placeholder="t('chart.aggregation')"
            @change="changeTotal(state.rowSubTotalItem, state.tableTotalForm.row.calcSubTotals.cfg)"
          >
            <el-option
              v-for="option in chart.yAxis"
              :key="option.dataeaseName"
              :label="option.name"
              :value="option.dataeaseName"
            />
          </el-select>
        </el-col>
        <el-col :span="state.rowSubTotalItem.aggregation === 'CUSTOM' ? 8 : 11" :offset="2">
          <el-select
            :effect="themes"
            v-model="state.rowSubTotalItem.aggregation"
            :disabled="chart.xAxis.length < 2"
            :placeholder="t('chart.aggregation')"
            @change="
              changeTotalAggr(
                state.rowSubTotalItem,
                state.tableTotalForm.row.calcSubTotals.cfg,
                'row'
              )
            "
          >
            <el-option
              v-for="option in aggregations"
              :key="option.value"
              :label="option.name"
              :value="option.value"
            />
          </el-select>
        </el-col>
        <el-col v-if="state.rowSubTotalItem.aggregation === 'CUSTOM'" :span="2" :offset="1">
          <el-icon>
            <Setting
              @click="
                editField(
                  state.rowSubTotalItem,
                  state.tableTotalForm.row.calcSubTotals.cfg,
                  'row.calcSubTotals.cfg'
                )
              "
            />
          </el-icon>
        </el-col>
      </el-form-item>
    </div>

    <el-divider
      v-if="showProperty('col')"
      content-position="center"
      :class="'divider-style-' + themes"
    >
      {{ t('chart.col_cfg') }}
    </el-divider>
    <el-form-item
      v-show="showProperty('col')"
      :label="t('chart.total_show')"
      class="form-item"
      :class="'form-item-' + themes"
    >
      <el-checkbox
        :effect="themes"
        v-model="state.tableTotalForm.col.showGrandTotals"
        @change="changeTableTotal('col')"
        >{{ t('chart.show') }}</el-checkbox
      >
    </el-form-item>
    <div v-show="showProperty('col') && state.tableTotalForm.col.showGrandTotals">
      <el-form-item
        :label="t('chart.total_position')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-radio-group
          :effect="themes"
          v-model="state.tableTotalForm.col.reverseLayout"
          @change="changeTableTotal('col')"
        >
          <el-radio :effect="themes" :label="true">{{ t('chart.total_pos_left') }}</el-radio>
          <el-radio :effect="themes" :label="false">{{ t('chart.total_pos_right') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="t('chart.table_grand_total_label')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-input
          :effect="themes"
          :placeholder="t('chart.table_grand_total_label')"
          size="small"
          maxlength="20"
          v-model="state.tableTotalForm.col.label"
          clearable
          @blur="changeTableTotal('col.label')"
        />
      </el-form-item>
      <el-form-item
        :label="t('chart.aggregation')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-col :span="11">
          <el-select
            :effect="themes"
            v-model="state.colTotalItem.dataeaseName"
            :placeholder="t('chart.aggregation')"
            @change="changeTotal(state.colTotalItem, state.tableTotalForm.col.calcTotals.cfg)"
          >
            <el-option
              v-for="option in chart.yAxis"
              :key="option.dataeaseName"
              :label="option.name"
              :value="option.dataeaseName"
            />
          </el-select>
        </el-col>
        <el-col :span="state.colTotalItem.aggregation === 'CUSTOM' ? 8 : 11" :offset="2">
          <el-select
            :effect="themes"
            v-model="state.colTotalItem.aggregation"
            :placeholder="t('chart.aggregation')"
            @change="
              changeTotalAggr(
                state.colTotalItem,
                state.tableTotalForm.col.calcTotals.cfg,
                'col.calcTotals.cfg'
              )
            "
          >
            <el-option
              v-for="option in aggregations"
              :key="option.value"
              :label="option.name"
              :value="option.value"
            />
          </el-select>
        </el-col>
        <el-col v-if="state.colTotalItem.aggregation === 'CUSTOM'" :span="2" :offset="1">
          <el-icon>
            <Setting
              @click="
                editField(
                  state.colTotalItem,
                  state.tableTotalForm.col.calcTotals.cfg,
                  'col.calcTotals.cfg'
                )
              "
            />
          </el-icon>
        </el-col>
      </el-form-item>
      <el-form-item
        v-if="showColFieldTotalLabel"
        class="form-item"
        :label="t('chart.table_field_total_label')"
        :class="'form-item-' + themes"
      >
        <el-input
          :effect="themes"
          :placeholder="t('chart.table_field_total_label')"
          size="small"
          maxlength="20"
          v-model="state.colTotalItem.label"
          clearable
          @change="
            changeTotalAggr(
              state.colTotalItem,
              state.tableTotalForm.col.calcTotals.cfg,
              'col.calcTotals.cfg'
            )
          "
        />
      </el-form-item>
      <el-form-item
        v-if="chart.type === 'table-pivot'"
        :label="t('chart.total_sort')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-radio-group
          :effect="themes"
          v-model="state.tableTotalForm.col.totalSort"
          @change="changeTableTotal('col')"
        >
          <el-radio :effect="themes" label="none">{{ t('chart.total_sort_none') }}</el-radio>
          <el-radio :effect="themes" label="asc">{{ t('chart.total_sort_asc') }}</el-radio>
          <el-radio :effect="themes" label="desc">{{ t('chart.total_sort_desc') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-show="chart.type === 'table-pivot' && state.tableTotalForm.col?.totalSort !== 'none'"
        :label="t('chart.total_sort_field')"
        class="form-item"
      >
        <el-select
          :effect="themes"
          v-model="state.tableTotalForm.col.totalSortField"
          class="form-item-select"
          :placeholder="t('chart.total_sort_field')"
          @change="changeTableTotal('col')"
        >
          <el-option
            v-for="option in chart.yAxis"
            :key="option.dataeaseName"
            :label="option.name"
            :value="option.dataeaseName"
          />
        </el-select>
      </el-form-item>
    </div>

    <el-form-item
      v-show="showProperty('col')"
      :label="t('chart.sub_total_show')"
      class="form-item"
      :class="'form-item-' + themes"
    >
      <el-checkbox
        :effect="themes"
        v-model="state.tableTotalForm.col.showSubTotals"
        :disabled="chart.xAxisExt.length < 2"
        @change="changeTableTotal('col')"
        >{{ t('chart.show') }}</el-checkbox
      >
    </el-form-item>
    <div v-show="showProperty('col') && state.tableTotalForm.col.showSubTotals">
      <el-form-item
        :label="t('chart.total_position')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-radio-group
          :effect="themes"
          v-model="state.tableTotalForm.col.reverseSubLayout"
          :disabled="chart.xAxisExt?.length < 2"
          @change="changeTableTotal('col')"
        >
          <el-radio :effect="themes" :label="true">{{ t('chart.total_pos_left') }}</el-radio>
          <el-radio :effect="themes" :label="false">{{ t('chart.total_pos_right') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="t('chart.total_label')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-input
          :effect="themes"
          :disabled="chart.xAxisExt?.length < 2"
          :placeholder="t('chart.total_label')"
          v-model="state.tableTotalForm.col.subLabel"
          size="small"
          maxlength="20"
          clearable
          @change="changeTableTotal('col.subLabel')"
        />
      </el-form-item>
      <el-form-item
        :label="t('chart.aggregation')"
        class="form-item"
        :class="'form-item-' + themes"
      >
        <el-col :span="11">
          <el-select
            :effect="themes"
            v-model="state.colSubTotalItem.dataeaseName"
            :disabled="chart.xAxisExt?.length < 2"
            :placeholder="t('chart.aggregation')"
            @change="changeTotal(state.colSubTotalItem, state.tableTotalForm.col.calcSubTotals.cfg)"
          >
            <el-option
              v-for="option in chart.yAxis"
              :key="option.dataeaseName"
              :label="option.name"
              :value="option.dataeaseName"
            />
          </el-select>
        </el-col>
        <el-col :span="state.colSubTotalItem.aggregation === 'CUSTOM' ? 8 : 11" :offset="2">
          <el-select
            :effect="themes"
            v-model="state.colSubTotalItem.aggregation"
            :disabled="chart.xAxisExt?.length < 2"
            :placeholder="t('chart.aggregation')"
            @change="
              changeTotalAggr(
                state.colSubTotalItem,
                state.tableTotalForm.col.calcSubTotals.cfg,
                'col.calcSubTotals.cfg'
              )
            "
          >
            <el-option
              v-for="option in aggregations"
              :key="option.value"
              :label="option.name"
              :value="option.value"
            />
          </el-select>
        </el-col>
        <el-col v-if="state.colSubTotalItem.aggregation === 'CUSTOM'" :span="2" :offset="1">
          <el-icon>
            <Setting
              @click="
                editField(
                  state.colSubTotalItem,
                  state.tableTotalForm.col.calcSubTotals.cfg,
                  'col.calcSubTotals.cfg'
                )
              "
            />
          </el-icon>
        </el-col>
      </el-form-item>
    </div>
  </el-form>
  <!--图表计算字段-->
  <el-dialog
    v-model="editCalcField"
    width="1000px"
    title="自定义聚合公式"
    :close-on-click-modal="false"
  >
    <custom-aggr-edit ref="calcEdit" />
    <template #footer>
      <el-button secondary @click="closeEditCalc()">{{ t('dataset.cancel') }} </el-button>
      <el-button type="primary" @click="confirmEditCalc()">{{ t('dataset.confirm') }} </el-button>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.divider-style-dark {
  ::v-deep(.ed-divider__text) {
    color: #fff;
    background: @side-content-background;
  }
}
</style>
