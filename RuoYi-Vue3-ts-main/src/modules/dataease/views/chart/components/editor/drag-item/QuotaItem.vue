<script lang="tsx" setup>
import icon_sortAToZ_outlined from '@de/assets/svg/icon_sort-a-to-z_outlined.svg'
import icon_sortZToA_outlined from '@de/assets/svg/icon_sort-z-to-a_outlined.svg'
import icon_sort_outlined from '@de/assets/svg/icon_sort_outlined.svg'
import icon_deleteTrash_outlined from '@de/assets/svg/icon_delete-trash_outlined.svg'
import icon_down_outlined1 from '@de/assets/svg/icon_down_outlined-1.svg'
import icon_right_outlined from '@de/assets/svg/icon_right_outlined.svg'
import icon_done_outlined from '@de/assets/svg/icon_done_outlined.svg'
import icon_functions_outlined from '@de/assets/svg/icon_functions_outlined.svg'
import icon_visible_outlined from '@de/assets/svg/icon_visible_outlined.svg'
import icon_invisible_outlined from '@de/assets/svg/icon_invisible_outlined.svg'
import icon_edit_outlined from '@de/assets/svg/icon_edit_outlined.svg'
import iconFilter from '@de/assets/svg/icon-filter.svg'
import { useI18n } from '@de/hooks/web/useI18n'
import { computed, onMounted, reactive, ref, toRefs, watch } from 'vue'
import { formatterItem } from '@de/views/chart/components/js/formatter'
import { getItemType, resetValueFormatter } from '@de/views/chart/components/editor/drag-item/utils'
import { quotaViews, notSupportAccumulateViews } from '@de/views/chart/components/js/util'
import { SUPPORT_Y_M } from '@de/views/chart/components/editor/util/chart'
import { fieldType } from '@de/utils/attr'
import { iconFieldMap } from '@de/components/icon-group/field-list'

const { t } = useI18n()

const tagType = ref('success')

const state = reactive({
  formatterItem: formatterItem,
  disableEditCompare: false,
  quotaViews: quotaViews,
  notSupportAccumulateViews: notSupportAccumulateViews
})

const props = defineProps({
  param: {
    type: Object,
    required: false
  },
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  chart: {
    type: Object,
    required: true
  },
  dimensionData: {
    type: Array,
    required: true
  },
  quotaData: {
    type: Array,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  themes: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits([
  'onQuotaItemRemove',
  'onCustomSort',
  'onQuotaItemChange',
  'onNameEdit',
  'editItemFilter',
  'editItemCompare',
  'valueFormatter',
  'onToggleHide',
  'editSortPriority'
])

const { item, chart } = toRefs(props)
const toolTip = computed(() => {
  return props.themes || 'dark'
})
watch(
  [() => props.quotaData, () => props.item, () => props.chart.type],
  () => {
    getItemTagType()
  },
  { deep: true }
)

watch(
  () => props.chart,
  () => {
    isEnableCompare()
    // 不支持累加计算的图表，自动设置快速计算为无
    if (
      state.notSupportAccumulateViews.indexOf(chart.value.type) > -1 &&
      item.value.compareCalc.type === 'accumulate'
    ) {
      quickCalc({ type: 'none' })
    }
  },
  { deep: true }
)
const AXIS_FORMAT_VIEW = ['table-normal', 'table-info', 'table-pivot', 'indicator', 'rich-text']
const showValueFormatter = computed<boolean>(() => {
  return (
    AXIS_FORMAT_VIEW.includes(props.chart.type) &&
    (props.item.deType === 2 || props.item.deType === 3)
  )
})

const isEnableCompare = () => {
  // 指标卡开放同环比配置
  if (chart.value.type === 'indicator') {
    state.disableEditCompare = false
    return
  }
  let xAxis = null
  if (Object.prototype.toString.call(chart.value.xAxis) === '[object Array]') {
    xAxis = JSON.parse(JSON.stringify(chart.value.xAxis))
  } else {
    xAxis = JSON.parse(chart.value.xAxis)
  }
  const t1 = xAxis.filter(ele => {
    return ele.deType === 1 && SUPPORT_Y_M.includes(ele.dateStyle)
  })

  if (chart.value.type === 'table-pivot') {
    let xAxisExt = null
    if (Object.prototype.toString.call(chart.value.xAxisExt) === '[object Array]') {
      xAxisExt = JSON.parse(JSON.stringify(chart.value.xAxisExt))
    } else {
      xAxisExt = JSON.parse(chart.value.xAxisExt)
    }
    const t2 = xAxisExt.filter(ele => {
      return ele.deType === 1 && SUPPORT_Y_M.includes(ele.dateStyle)
    })

    t1.push(...t2)
  }

  // 暂时只支持类别轴/维度的时间类型字段
  if (
    t1.length > 0 &&
    chart.value.type !== 'label' &&
    chart.value.type !== 'gauge' &&
    chart.value.type !== 'liquid'
  ) {
    state.disableEditCompare = false
  } else {
    state.disableEditCompare = true
  }
}

const clickItem = param => {
  if (!param) {
    return
  }
  switch (param.type) {
    case 'rename':
      showRename()
      break
    case 'remove':
      removeItem()
      break
    case 'filter':
      editFilter()
      break
    case 'formatter':
      valueFormatter()
      break
    case 'toggleHide':
      toggleHide()
      break
    case 'sortPriority':
      emit('editSortPriority')
      break
    default:
      break
  }
}

const beforeClickItem = type => {
  return {
    type
  }
}

const sort = param => {
  if (param.type === 'custom_sort') {
    const item = {
      index: props.index,
      sort: param.type
    }
    emit('onCustomSort', item)
  } else {
    item.value.index = props.index
    item.value.sort = param.type
    item.value.customSort = []
    emit('onQuotaItemChange', item.value)
  }
}

const beforeSort = type => {
  return {
    type: type
  }
}

const summary = param => {
  item.value.summary = param.type
  emit('onQuotaItemChange', item.value)
}

const beforeSummary = type => {
  return {
    type: type
  }
}

const showRename = () => {
  item.value.index = props.index
  item.value.renameType = props.type
  // item.value.dsFieldName = getOriginFieldName(props.dimensionData, props.quotaData, item.value)
  emit('onNameEdit', item.value)
}

const removeItem = () => {
  item.value.index = props.index
  item.value.removeType = props.type
  emit('onQuotaItemRemove', item.value)
}

const getItemTagType = () => {
  tagType.value = getItemType(props.dimensionData, props.quotaData, props.item)
}

const editFilter = () => {
  item.value.index = props.index
  item.value.filterType = props.type
  emit('editItemFilter', item.value)
}

const quickCalc = param => {
  switch (param.type) {
    case 'none':
      // 选择占比外，设置自动
      resetValueFormatter(item.value)
      item.value.compareCalc.type = 'none'
      emit('onQuotaItemChange', item.value)
      break
    case 'setting':
      // 选择占比外，设置自动
      // 指标卡不需要重置数值格式
      if (chart.value.type !== 'indicator') {
        resetValueFormatter(item.value)
      }
      editCompare()
      break
    case 'percent':
      // 选择占比，自动将数值格式设置为百分比并保留2位小数
      item.value.formatterCfg.type = 'percent'
      item.value.formatterCfg.decimalCount = 2

      item.value.compareCalc.type = 'percent'
      emit('onQuotaItemChange', item.value)
      break
    case 'accumulate':
      item.value.compareCalc.type = 'accumulate'
      emit('onQuotaItemChange', item.value)
      break
    default:
      break
  }
}

const beforeQuickCalc = type => {
  return {
    type: type
  }
}

const editCompare = () => {
  item.value.index = props.index
  item.value.calcType = props.type
  emit('editItemCompare', item.value)
}

const valueFormatter = () => {
  item.value.index = props.index
  item.value.formatterType = props.type
  emit('valueFormatter', item.value)
}
const toggleHide = () => {
  item.value.index = props.index
  item.value.hide = !item.value.hide
  item.value.axisType = props.type
  emit('onToggleHide', item.value)
}
const showHideIcon = computed(() => {
  return ['tale-info', 'table-normal'].includes(props.chart.type) && item.value.hide
})

const NOT_SUPPORT_SORT = [
  'circle-packing',
  'indicator',
  'liquid',
  'gauge',
  'word-cloud',
  'stock-line',
  'treemap'
]

const showSort = computed(() => {
  return (
    props.type !== 'extLabel' &&
    props.type !== 'extTooltip' &&
    props.type !== 'extBubble' &&
    !NOT_SUPPORT_SORT.includes(chart.value.type) &&
    !chart.value.type.includes('chart-mix')
  )
})

// 同环比计算类型
const yoyLabel = ['day_mom', 'month_yoy', 'year_yoy', 'month_mom', 'year_mom']

onMounted(() => {
  isEnableCompare()
  getItemTagType()
})
</script>

<template>
  <span class="item-style">
    <el-dropdown :effect="themes" trigger="click" @command="clickItem">
      <el-tag
        class="item-axis father"
        :class="['editor-' + props.themes, `${themes}_icon-right`]"
        :style="{ backgroundColor: tagType + '0a', border: '1px solid ' + tagType }"
      >
        <span style="display: flex; color: #646a73">
          <el-icon v-if="'asc' === item.sort && showSort">
            <Icon name="icon_sort-a-to-z_outlined"
              ><icon_sortAToZ_outlined class="svg-icon"
            /></Icon>
          </el-icon>
          <el-icon v-if="'desc' === item.sort && showSort">
            <Icon name="icon_sort-z-to-a_outlined"
              ><icon_sortZToA_outlined class="svg-icon"
            /></Icon>
          </el-icon>
          <el-icon v-if="'custom_sort' === item.sort && showSort">
            <Icon name="icon_sort_outlined"><icon_sort_outlined class="svg-icon" /></Icon>
          </el-icon>
          <el-icon>
            <Icon :className="`field-icon-${fieldType[[2, 3].includes(item.deType) ? 2 : 0]}`"
              ><component
                :class="`field-icon-${fieldType[[2, 3].includes(item.deType) ? 2 : 0]}`"
                class="svg-icon"
                :is="iconFieldMap[fieldType[item.deType]]"
              ></component
            ></Icon>
          </el-icon>
        </span>
        <el-tooltip :effect="toolTip" placement="top">
          <template #content>
            <table>
              <tbody>
                <tr>
                  <td>{{ t('dataset.field_origin_name') }}</td>
                  <td>:</td>
                  <td>{{ item.name }}</td>
                </tr>
                <tr>
                  <td>{{ t('chart.show_name') }}</td>
                  <td>:</td>
                  <td>{{ item.chartShowName ? item.chartShowName : item.name }}</td>
                </tr>
              </tbody>
            </table>
          </template>
          <span
            class="item-span-style"
            :class="{
              'hidden-status': showHideIcon,
              'sort-status': showSort && item.sort !== 'none'
            }"
          >
            <span class="item-name">{{ item.chartShowName ? item.chartShowName : item.name }}</span>
            <span v-if="item.summary !== ''" class="item-right-summary">
              ({{ t('chart.' + item.summary) }})
            </span>
          </span>
        </el-tooltip>
        <span
          v-if="false && chart.type !== 'table-info' && item.summary && !item.chartId"
          class="summary-span"
        >
          {{ t('chart.' + item.summary) }}
          <span
            v-if="
              item.compareCalc &&
              item.compareCalc.type &&
              item.compareCalc.type !== '' &&
              item.compareCalc.type !== 'none'
            "
          >
            -{{ t('chart.' + item.compareCalc.type) }}
          </span>
        </span>
        <el-icon v-if="showHideIcon" style="margin-left: 4px">
          <Icon>
            <icon_invisible_outlined
              :class="`field-icon-${fieldType[[2, 3].includes(item.deType) ? 2 : 0]}`"
              class="svg-icon inner-class"
            />
          </Icon>
        </el-icon>
        <el-tooltip :effect="toolTip" placement="top">
          <template #content>
            <span>{{ t('chart.delete') }}</span>
          </template>
          <el-icon class="child remove-icon">
            <Icon class-name="inner-class" name="icon_delete-trash_outlined"
              ><icon_deleteTrash_outlined @click="removeItem" class="svg-icon inner-class"
            /></Icon>
          </el-icon>
        </el-tooltip>

        <el-icon class="child" style="position: absolute; top: 7px; right: 10px; cursor: pointer">
          <Icon name="icon_down_outlined-1"><icon_down_outlined1 class="svg-icon" /></Icon>
        </el-icon>
      </el-tag>
      <template #dropdown>
        <el-dropdown-menu
          :effect="themes"
          class="drop-style"
          :class="themes === 'dark' ? 'dark-dimension-quota' : ''"
        >
          <el-dropdown-item
            @click.prevent
            v-if="chart.type !== 'table-info' && item.summary !== ''"
          >
            <el-dropdown
              :effect="themes"
              placement="right-start"
              popper-class="data-dropdown_popper_mr9"
              style="width: 100%; height: 100%"
              @command="summary"
            >
              <span class="el-dropdown-link inner-dropdown-menu menu-item-padding">
                <span class="menu-item-content">
                  <el-icon>
                    <Icon name="icon_functions_outlined"
                      ><icon_functions_outlined class="svg-icon"
                    /></Icon>
                  </el-icon>
                  <span>{{ t('chart.summary') }}</span>
                  <span class="summary-span-item">({{ t('chart.' + item.summary) }})</span>
                </span>
                <el-icon>
                  <Icon name="icon_right_outlined"><icon_right_outlined class="svg-icon" /></Icon>
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu
                  :effect="themes"
                  class="drop-style sub"
                  :class="themes === 'dark' ? 'dark-dimension-quota' : ''"
                >
                  <el-dropdown-item
                    class="menu-item-padding"
                    v-if="item.id !== '-1' && ![0, 1, 5, 7].includes(item.deType)"
                    :command="beforeSummary('sum')"
                  >
                    <span
                      class="sub-menu-content"
                      :class="'sum' === item.summary ? 'content-active' : ''"
                    >
                      {{ t('chart.sum') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'sum' === item.summary"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="menu-item-padding"
                    v-if="item.id !== '-1' && ![0, 1, 5, 7].includes(item.deType)"
                    :command="beforeSummary('avg')"
                  >
                    <span
                      class="sub-menu-content"
                      :class="'avg' === item.summary ? 'content-active' : ''"
                    >
                      {{ t('chart.avg') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'avg' === item.summary"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="menu-item-padding"
                    v-if="item.id !== '-1' && ![0, 1, 5, 7].includes(item.deType)"
                    :command="beforeSummary('max')"
                  >
                    <span
                      class="sub-menu-content"
                      :class="'max' === item.summary ? 'content-active' : ''"
                    >
                      {{ t('chart.max') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'max' === item.summary"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="menu-item-padding"
                    v-if="item.id !== '-1' && ![0, 1, 5, 7].includes(item.deType)"
                    :command="beforeSummary('min')"
                  >
                    <span
                      class="sub-menu-content"
                      :class="'min' === item.summary ? 'content-active' : ''"
                    >
                      {{ t('chart.min') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'min' === item.summary"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="menu-item-padding"
                    v-if="item.id !== '-1' && ![0, 1, 5, 7].includes(item.deType)"
                    :command="beforeSummary('stddev_pop')"
                  >
                    <span
                      class="sub-menu-content"
                      :class="'stddev_pop' === item.summary ? 'content-active' : ''"
                    >
                      {{ t('chart.stddev_pop') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'stddev_pop' === item.summary"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="menu-item-padding"
                    v-if="item.id !== '-1' && ![0, 1, 5, 7].includes(item.deType)"
                    :command="beforeSummary('var_pop')"
                  >
                    <span
                      class="sub-menu-content"
                      :class="'var_pop' === item.summary ? 'content-active' : ''"
                    >
                      {{ t('chart.var_pop') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'var_pop' === item.summary"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item class="menu-item-padding" :command="beforeSummary('count')">
                    <span
                      class="sub-menu-content"
                      :class="'count' === item.summary ? 'content-active' : ''"
                    >
                      {{ t('chart.count') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'count' === item.summary"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="menu-item-padding"
                    v-if="item.id !== '-1'"
                    :command="beforeSummary('count_distinct')"
                  >
                    <span
                      class="sub-menu-content"
                      :class="'count_distinct' === item.summary ? 'content-active' : ''"
                    >
                      {{ t('chart.count_distinct') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'count_distinct' === item.summary"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-dropdown-item>

          <!--同比/环比等快速计算-->
          <el-dropdown-item
            @click.prevent
            v-if="
              !['table-info', 'bullet-graph'].includes(chart.type) && props.type !== 'extBubble'
            "
          >
            <el-dropdown
              placement="right-start"
              :effect="themes"
              popper-class="data-dropdown_popper_mr9"
              style="width: 100%; height: 100%"
              @command="quickCalc"
            >
              <span class="el-dropdown-link inner-dropdown-menu menu-item-padding">
                <span class="menu-item-content">
                  <el-icon>
                    <!--                    <Icon name="icon_describe_outlined" ><icon_describe_outlined class="svg-icon" /></Icon>-->
                  </el-icon>
                  <span>{{ t('chart.quick_calc') }}</span>
                  <span class="summary-span-item">
                    ({{
                      !item.compareCalc ? t('chart.none') : t('chart.' + item.compareCalc.type)
                    }})
                  </span>
                </span>
                <el-icon>
                  <Icon name="icon_right_outlined"><icon_right_outlined class="svg-icon" /></Icon>
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu
                  :effect="themes"
                  class="drop-style sub"
                  :class="themes === 'dark' ? 'dark-dimension-quota' : ''"
                >
                  <el-dropdown-item class="menu-item-padding" :command="beforeQuickCalc('none')">
                    <span
                      class="sub-menu-content"
                      :class="'none' === item.compareCalc.type ? 'content-active' : ''"
                    >
                      {{ t('chart.none') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'none' === item.compareCalc.type"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="menu-item-padding"
                    :disabled="state.disableEditCompare"
                    :command="beforeQuickCalc('setting')"
                    v-if="!(chart.type.includes('chart-mix') && type === 'quotaExt')"
                  >
                    <div
                      class="sub-menu-content"
                      :class="yoyLabel.includes(item.compareCalc.type) ? 'content-active' : ''"
                      :disabled="state.disableEditCompare"
                    >
                      {{ t('chart.yoy_label') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon
                          name="icon_done_outlined"
                          v-if="yoyLabel.includes(item.compareCalc.type)"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="menu-item-padding"
                    :disabled="state.quotaViews.indexOf(chart.type) > -1"
                    :command="beforeQuickCalc('percent')"
                  >
                    <div
                      class="sub-menu-content"
                      :class="'percent' === item.compareCalc.type ? 'content-active' : ''"
                      :disabled="state.quotaViews.indexOf(chart.type) > -1"
                    >
                      {{ t('chart.percent') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'percent' === item.compareCalc.type"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="menu-item-padding"
                    :disabled="state.notSupportAccumulateViews.indexOf(chart.type) > -1"
                    :command="beforeQuickCalc('accumulate')"
                  >
                    <div
                      class="sub-menu-content"
                      :class="'accumulate' === item.compareCalc.type ? 'content-active' : ''"
                      :disabled="state.notSupportAccumulateViews.indexOf(chart.type) > -1"
                    >
                      {{ t('chart.accumulate') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon
                          name="icon_done_outlined"
                          v-if="'accumulate' === item.compareCalc.type"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-dropdown-item>

          <el-dropdown-item @click.prevent v-if="showSort" :divided="chart.type !== 'table-info'">
            <el-dropdown
              :effect="themes"
              placement="right-start"
              popper-class="data-dropdown_popper_mr9"
              style="width: 100%; height: 100%"
              @command="sort"
            >
              <span class="el-dropdown-link inner-dropdown-menu menu-item-padding">
                <span class="menu-item-content">
                  <el-icon>
                    <Icon name="icon_sort_outlined"><icon_sort_outlined class="svg-icon" /></Icon>
                  </el-icon>
                  <span>{{ t('chart.sort') }}</span>
                  <span class="summary-span-item">({{ t('chart.' + item.sort) }})</span>
                </span>
                <el-icon>
                  <Icon name="icon_right_outlined"><icon_right_outlined class="svg-icon" /></Icon>
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu
                  :effect="themes"
                  class="drop-style sub"
                  :class="themes === 'dark' ? 'dark-dimension-quota' : ''"
                >
                  <el-dropdown-item class="menu-item-padding" :command="beforeSort('none')">
                    <span
                      class="sub-menu-content"
                      :class="'none' === item.sort ? 'content-active' : ''"
                    >
                      {{ t('chart.none') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'none' === item.sort"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item class="menu-item-padding" :command="beforeSort('asc')">
                    <span
                      class="sub-menu-content"
                      :class="'asc' === item.sort ? 'content-active' : ''"
                    >
                      {{ t('chart.asc') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'asc' === item.sort"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item class="menu-item-padding" :command="beforeSort('desc')">
                    <span
                      class="sub-menu-content"
                      :class="'desc' === item.sort ? 'content-active' : ''"
                    >
                      {{ t('chart.desc') }}
                      <el-icon class="sub-menu-content--icon">
                        <Icon name="icon_done_outlined" v-if="'desc' === item.sort"
                          ><icon_done_outlined class="svg-icon"
                        /></Icon>
                      </el-icon>
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-dropdown-item>

          <el-dropdown-item
            v-if="showSort"
            class="menu-item-padding"
            :command="beforeClickItem('sortPriority')"
          >
            <el-icon />
            <span>{{ t('chart.sort_priority') }}</span>
          </el-dropdown-item>

          <el-dropdown-item
            class="menu-item-padding"
            v-if="
              props.type !== 'extLabel' && props.type !== 'extTooltip' && props.type !== 'extBubble'
            "
            :icon="iconFilter"
            :command="beforeClickItem('filter')"
            :divided="chart.type.includes('chart-mix')"
          >
            <span>{{ t('chart.filter') }}</span>
          </el-dropdown-item>

          <el-dropdown-item
            class="menu-item-padding"
            v-if="item.groupType === 'q' && props.type !== 'extBubble' && showValueFormatter"
            :divided="chart.type !== 'table-info'"
            :command="beforeClickItem('formatter')"
          >
            <el-icon />
            <span>{{ t('chart.value_formatter') }}</span>
          </el-dropdown-item>

          <el-dropdown-item class="menu-item-padding" :command="beforeClickItem('rename')">
            <el-icon>
              <icon name="icon_edit_outlined"><icon_edit_outlined class="svg-icon" /></icon>
            </el-icon>
            <span>{{ t('chart.show_name_set') }}</span>
          </el-dropdown-item>
          <el-dropdown-item
            class="menu-item-padding"
            v-if="['table-normal', 'table-info'].includes(chart.type)"
            :command="beforeClickItem('toggleHide')"
          >
            <el-icon>
              <icon
                ><icon_visible_outlined v-if="item.hide === true" class="svg-icon" />
                <icon_invisible_outlined v-else class="svg-icon"
              /></icon>
            </el-icon>
            <span>{{ item.hide === true ? t('chart.show') : t('chart.hide') }}</span>
          </el-dropdown-item>
          <el-dropdown-item class="menu-item-padding" :command="beforeClickItem('remove')">
            <el-icon>
              <icon name="icon_delete-trash_outlined"
                ><icon_deleteTrash_outlined class="svg-icon"
              /></icon>
            </el-icon>
            <span>{{ t('chart.delete') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </span>
</template>

<style lang="less" scoped>
:deep(.ed-dropdown-menu__item) {
  padding: 0;
}

:deep(.ed-dropdown-menu__item.menu-item-padding) {
  padding: 5px 16px;
}

.menu-item-padding {
  padding: 5px 16px;
}

.item-style {
  position: relative;
  width: 100%;
  display: block;
  overflow: hidden;
  .ed-dropdown {
    display: flex;
  }

  :deep(.ed-tag__content) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.item-axis {
  padding: 1px 8px;
  margin-bottom: 3px;
  height: 28px;
  line-height: 28px;
  display: flex;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  background-color: #04b49c0a;
  border: 1px solid #04b49c;
}

.item-axis:hover {
  cursor: pointer;
}

span {
  font-size: 12px;
}

.summary-span {
  margin-left: 4px;
  color: #878d9f;
  position: absolute;
  right: 25px;
}

.inner-dropdown-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .menu-item-content {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}

.sub-menu-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  &.content-active {
    color: var(--ed-color-primary);
  }

  .sub-menu-content--icon {
    margin-left: 8px;
  }
}

.item-span-drop {
  color: #a6a6a6;
  display: flex;
}

.item-span-style {
  display: flex;
  max-width: 170px;
  color: #1f2329;
  margin-left: 4px;

  .item-name {
    flex: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .item-right-summary {
    flex-shrink: 0;
    margin-left: 4px;
  }
  &.hidden-status,
  &.sort-status {
    max-width: 150px;
  }
  &.hidden-status[class*='sort-status'] {
    max-width: 135px !important;
  }
}

.editor-dark {
  .item-span-style {
    color: #ffffff !important;
  }
}

.summary-span-item {
  margin-left: 4px;
}

.drop-style {
  :deep(.ed-dropdown-menu__item) {
    height: 32px;
    min-width: 218px;
  }
  &.sub {
    :deep(.ed-dropdown-menu__item) {
      min-width: 118px;
    }
  }
  :deep(.ed-dropdown-menu__item:not(.is_disabled):focus) {
    color: inherit;
    background-color: rgba(31, 35, 41, 0.1);
  }
  &.dark-dimension-quota {
    background-color: #292929;
    border: 1px solid #434343;
    :deep(.ed-dropdown-menu__item--divided) {
      border-color: #ebebeb26;
    }
    :deep(.ed-dropdown-menu__item:not(.is-disabled):hover) {
      background-color: #ebebeb1a;
    }
    .inner-dropdown-menu {
      color: rgba(235, 235, 235, 1);
    }
    :deep(.ed-dropdown-menu__item) {
      color: rgba(235, 235, 235, 1);
    }
    :deep(.ed-dropdown-menu__item.is-disabled) {
      color: #a6a6a6;
    }
    :deep(.ed-dropdown-menu__item:not(.is_disabled):focus) {
      background-color: rgba(235, 235, 235, 0.1);
    }
  }
}

.remove-icon {
  position: absolute;
  top: 7px;
  right: 24px;
  cursor: pointer;

  .inner-class {
    font-size: 14px;
  }
}

.father {
  &.dark_icon-right {
    .child {
      color: #a6a6a6;
    }
  }

  &.light_icon-right {
    .child {
      color: #646a73;
    }
  }
  .child {
    font-size: 14px;
    visibility: hidden;
  }
}

.father:hover .child {
  visibility: visible;
}

.father:hover .item-span-style {
  max-width: 130px;
  &.hidden-status,
  &.sort-status {
    max-width: 120px;
  }
  &.hidden-status[class*='sort-status'] {
    max-width: 100px !important;
  }
}
</style>
<style lang="less">
.data-dropdown_popper_mr9 {
  margin-left: -9px !important;
}
.menu-item-padding {
  span {
    font-size: 14px;
    color: #1f2329;
  }
  .ed-icon {
    color: #646a73;
    font-size: 16px !important;
  }

  .sub-menu-content--icon {
    color: var(--ed-color-primary);
    margin-right: -7px;
  }
  :nth-child(1).ed-icon {
    margin-right: 8px;
  }
  .menu-item-content {
    :nth-child(1).ed-icon {
      margin-right: 8px;
    }
  }
}
.dark-dimension-quota {
  span {
    color: #ebebeb;
  }
  .ed-icon {
    color: #a6a6a6;
  }

  .sub-menu-content--icon {
    color: var(--ed-color-primary);
    margin-right: -7px !important;
  }
}
</style>
