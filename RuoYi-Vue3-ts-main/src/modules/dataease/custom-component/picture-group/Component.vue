<template>
  <div class="pic-main">
    <chart-error v-if="isError" :err-msg="errMsg" />
    <img
      draggable="false"
      v-else-if="state.showUrl"
      :style="imageAdapter"
      :src="imgUrlTrans(state.showUrl)"
    />
    <template v-else>
      <chart-empty-info :view-icon="view.type"></chart-empty-info>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  CSSProperties,
  computed,
  nextTick,
  toRefs,
  reactive,
  ref,
  PropType,
  watch,
  onBeforeMount
} from 'vue'
import { imgUrlTrans } from '@de/utils/imgUtils'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { getData } from '@de/api/chart'
import { parseJson } from '@de/views/chart/components/js/util'
import { mappingColor } from '@de/views/chart/components/js/panel/common/common_table'
import { storeToRefs } from 'pinia'
import ChartEmptyInfo from '@de/views/chart/components/views/components/ChartEmptyInfo.vue'
import ChartError from '@de/views/chart/components/views/components/ChartError.vue'
const dvMainStore = dvMainStoreWithOut()
const { canvasViewInfo, mobileInPc, fullscreenFlag } = storeToRefs(dvMainStore)
const state = reactive({
  emptyValue: '-',
  data: null,
  viewDataInfo: null,
  showUrl: null,
  firstRender: true,
  previewFirstRender: true,
  curImgList: []
})
const initReady = ref(true)
const props = defineProps({
  element: {
    type: Object,
    default() {
      return {
        propValue: { urlList: [] }
      }
    }
  },
  showPosition: {
    required: false,
    type: String,
    default: 'preview'
  },
  view: {
    type: Object as PropType<ChartObj>,
    default() {
      return {
        propValue: null
      }
    }
  }
})
const isError = ref(false)
const errMsg = ref('')
const dataRowSelect = ref({})
const dataRowNameSelect = ref({})
const dataRowFiledName = ref([])
let carouselTimer = null
const { element, view, showPosition } = toRefs(props)

const isEditMode = computed(
  () => showPosition.value.includes('canvas') && !mobileInPc.value && !fullscreenFlag.value
)

watch(
  () => isEditMode.value,
  () => {
    initCarousel()
  }
)

const initCarousel = () => {
  carouselTimer && clearInterval(carouselTimer)
  carouselTimer = null
  const picLength = element.value.propValue.urlList?.length || 0
  const { threshold } = parseJson(view.value.senior)
  // 非编辑状态 未启用条件样式 存在图片 启用轮播
  if (!isEditMode.value && !threshold.enable && picLength > 0 && element.value.carousel?.enable) {
    const switchTime = (element.value.carousel.time || 5) * 1000
    let switchCount = 1
    // 轮播定时器
    carouselTimer = setInterval(() => {
      const nowIndex = switchCount % element.value.propValue.urlList.length
      switchCount++
      nextTick(() => {
        state.showUrl = element.value.propValue.urlList[nowIndex].url
      })
    }, switchTime)
  }
}

const imageAdapter = computed(() => {
  const style = {
    position: 'relative',
    width: '100%',
    height: '100%'
  }
  if (element.value.style.adaptation === 'original') {
    style.width = 'auto'
    style.height = 'auto'
  } else if (element.value.style.adaptation === 'equiratio') {
    style.height = 'auto'
  }
  return style as CSSProperties
})

const initCurFields = chartDetails => {
  dataRowFiledName.value = []
  dataRowSelect.value = {}
  dataRowNameSelect.value = {}
  if (chartDetails.data && chartDetails.data.sourceFields) {
    const checkAllAxisStr =
      JSON.stringify(chartDetails.xAxis) +
      JSON.stringify(chartDetails.xAxisExt) +
      JSON.stringify(chartDetails.yAxis) +
      JSON.stringify(chartDetails.yAxisExt)
    chartDetails.data.sourceFields.forEach(field => {
      if (checkAllAxisStr.indexOf(field.id) > -1) {
        dataRowFiledName.value.push(`[${field.name}]`)
      }
    })
    if (checkAllAxisStr.indexOf('"记录数*"') > -1) {
      dataRowFiledName.value.push(`[记录数*]`)
    }
    const sourceFieldNameIdMap = chartDetails.data.fields.reduce((pre, next) => {
      pre[next['dataeaseName']] = next['name']
      return pre
    }, {})
    const rowData = chartDetails.data.tableRow[0]
    for (const key in rowData) {
      dataRowNameSelect.value[sourceFieldNameIdMap[key]] = rowData[key]
    }
  }
  conditionAdaptor(view.value)
}

const conditionAdaptor = (chart: Chart) => {
  state.showUrl = null
  if (!chart || !chart.senior) {
    return
  }
  const { threshold } = parseJson(chart.senior)
  if (!threshold.enable) {
    return
  }
  const conditions = threshold.tableThreshold ?? []
  if (conditions?.length > 0) {
    for (let i = 0; i < conditions.length; i++) {
      const field = conditions[i]
      let defaultValueColor = null
      const checkResult = mappingColor(
        dataRowNameSelect.value[field.field.name],
        defaultValueColor,
        field,
        'url'
      )
      if (checkResult) {
        state.showUrl = checkResult
      }
    }
  }
}

const withInit = () => {
  if (element.value.propValue['urlList'] && element.value.propValue['urlList'].length > 0) {
    state.showUrl = element.value.propValue['urlList'][0].url
  }
  initCarousel()
}

const calcData = (viewCalc: Chart, callback) => {
  isError.value = false
  const { threshold } = parseJson(viewCalc.senior)
  if (!threshold.enable) {
    withInit()
    callback?.()
    return
  }
  if (viewCalc.tableId || viewCalc['dataFrom'] === 'template') {
    const v = JSON.parse(JSON.stringify(viewCalc))
    v.type = 'table-info'
    v.render = 'antv'
    v.resultCount = 1
    getData(v)
      .then(res => {
        if (res.code && res.code !== 0) {
          isError.value = true
          errMsg.value = res.msg
        } else {
          res.type = 'picture-group'
          res.render = 'custom'
          state.data = res?.data
          state.viewDataInfo = res
          state.totalItems = res?.totalItems
          const curViewInfo = canvasViewInfo.value[element.value.id]
          curViewInfo['curFields'] = res.data.fields
          dvMainStore.setViewDataDetails(element.value.id, res)
          initReady.value = true
          initCurFields(res)
          initCarousel()
        }
        callback?.()
        nextTick(() => {
          initReady.value = true
        })
      })
      .catch(e => {
        console.error(e)
        nextTick(() => {
          initReady.value = true
        })
        callback?.()
      })
  } else if (!viewCalc.tableId) {
    initReady.value = true
    withInit()
    callback?.()
    nextTick(() => {
      initReady.value = true
    })
  } else {
    withInit()
    nextTick(() => {
      initReady.value = true
    })
    callback?.()
  }
}

// 初始化此处不必刷新
const renderChart = () => {
  //do renderView
}

onBeforeMount(() => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
})

defineExpose({
  calcData,
  renderChart
})
</script>

<style lang="less" scoped>
.pic-main {
  overflow: hidden;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.pic-upload {
  display: flex;
  width: 100%;
  height: 100%;
  color: #5370af;
  align-items: center;
  justify-content: center;
}
</style>
