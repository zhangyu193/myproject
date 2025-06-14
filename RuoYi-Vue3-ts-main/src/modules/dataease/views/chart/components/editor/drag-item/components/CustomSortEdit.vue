<script lang="ts" setup>
import icon_drag_outlined from '@de/assets/svg/icon_drag_outlined.svg'
import draggable from 'vuedraggable'
import { getFieldData, getDrillFieldData } from '@de/api/chart'
import { reactive, watch, ref } from 'vue'
import { useCache } from '@de/hooks/web/useCache'

const { wsCache } = useCache()
const loading = ref(false)

const state = reactive({
  sortList: []
})

const props = defineProps({
  chart: {
    type: Object,
    required: true
  },
  field: {
    type: Object,
    required: true
  },
  fieldType: {
    type: String,
    required: true
  },
  originSortList: {
    type: Array,
    default: () => [],
    required: false
  }
})

const emit = defineEmits(['onSortChange'])

watch(
  () => props.chart,
  () => {
    init()
  },
  { deep: true }
)

const init = () => {
  loading.value = true
  const chart = props.chart
  if (!chart.chartExtRequest) {
    chart.chartExtRequest = {
      user: wsCache.get('user.uid')
    }
  }
  const param = {
    fieldId: props.field.id,
    fieldType: props.fieldType,
    data: chart
  }
  let reqMethod = props.fieldType === 'drillFields' ? getDrillFieldData : getFieldData
  reqMethod(param)
    .then(response => {
      const strArr = response.data
      if (props.originSortList?.length) {
        const tmp = []
        props.originSortList.forEach(ele => {
          const index = strArr.findIndex(item => item === ele)
          if (index !== -1) {
            tmp.push(strArr[index])
            strArr.splice(index, 1)
          }
        })
        strArr.unshift(...tmp)
      }
      state.sortList = strArr.map(ele => {
        return transStr2Obj(ele)
      })
      onUpdate()
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
const onUpdate = () => {
  const strArr = state.sortList.map(ele => {
    return transObj2Str(ele)
  })
  emit('onSortChange', strArr)
}

const transStr2Obj = str => {
  return { name: 'name', value: str }
}

const transObj2Str = obj => {
  return obj.value
}

init()
</script>

<template>
  <el-scrollbar height="100%" max-height="599px">
    <draggable
      v-loading="loading"
      :list="state.sortList"
      animation="300"
      class="drag-list"
      item-key="name"
      @update="onUpdate"
    >
      <template #item="{ element }">
        <span :key="element.value" class="item-dimension" :title="element.value">
          <el-icon class="item-icon">
            <Icon name="icon_drag_outlined"><icon_drag_outlined class="svg-icon" /></Icon>
          </el-icon>
          <span class="item-span">
            {{ element.value }}
          </span>
        </span>
      </template>
    </draggable>
  </el-scrollbar>
</template>

<style lang="less" scoped>
.drag-list {
  height: 50vh;
}

.item-dimension {
  padding: 2px;
  margin: 2px;
  border: 1px solid #dee0e3;
  border-radius: 4px;
  text-align: left;
  color: #606266;
  background-color: white;
  display: flex;
  align-items: center;
  cursor: move;
}

.item-icon {
  font-size: 16px;
  margin: 0 4px;
  color: #646a73;
}

.item-span {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: #1f2329;

  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
}

.blackTheme .item-dimension {
  border: solid 1px;
  border-color: var(--TableBorderColor);
  color: var(--TextPrimary);
  background-color: var(--MainBG);
}

.item-dimension + .item-dimension {
  margin-top: 6px;
}

.item-dimension:hover {
  box-shadow: 0px 4px 8px 0px rgba(31, 35, 41, 0.1);
}

.blackTheme .item-dimension:hover {
  color: var(--Main);
  background: var(--ContentBG);
}
</style>
