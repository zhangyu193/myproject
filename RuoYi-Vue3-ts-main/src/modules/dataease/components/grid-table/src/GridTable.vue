<script lang="ts" setup>
import { reactive, ref, computed, watch, nextTick, onBeforeMount, useAttrs } from 'vue'
import { ElTable, ElPagination } from 'element-plus-secondary'
import EmptyBackground from '@de/components/empty-background/src/EmptyBackground.vue'
import TableBody from './TableBody.vue'
import { propTypes } from '@de/utils/propTypes'
import { useI18n } from '@de/hooks/web/useI18n'
const { t } = useI18n()
const props = defineProps({
  columns: propTypes.arrayOf(propTypes.string),
  isSearch: propTypes.bool.def(false),
  showPagination: propTypes.bool.def(true),
  multipleSelection: propTypes.array.def(() => []),
  pagination: propTypes.object,
  isRememberSelected: propTypes.bool.def(false),
  selectedFlags: propTypes.string.def('id'),
  tableData: propTypes.array,
  emptyDesc: propTypes.string,
  emptyImg: propTypes.string,
  border: propTypes.bool.def(false),
  showEmptyImg: propTypes.bool.def(true),
  dataLoading: propTypes.bool.def(false)
})

const attrs = useAttrs()

const handleListeners = () => {
  Object.keys(attrs).forEach(key => {
    if (key.startsWith('on')) {
      if (['onSizeChange', 'onCurrentChange'].includes(key)) {
        state.paginationEvent[key.slice(2)] = attrs[key]
      } else {
        state.tableEvent[key.slice(2)] = attrs[key]
      }
    } else {
      state.tableAttrs[key] = attrs[key]
    }
  })
}
const toggleRowSelection = row => {
  table.value.toggleRowSelection(row, true)
}
const toggleAllSelection = () => {
  table.value.toggleAllSelection()
}
const clearSelection = () => {
  table.value.clearSelection()
}
const handlerSelected = multipleSelection => {
  state.multipleSelectionCache = [...state.multipleSelectionCache, ...multipleSelection]
  const flags = state.multipleSelectionCache.map(ele => ele[props.selectedFlags])
  // 当前页的选中项索引
  const notCurrentArr = []
  props.tableData.forEach(ele => {
    const resultIndex = flags.indexOf(ele[props.selectedFlags])
    if (resultIndex !== -1) {
      table.value.toggleRowSelection(ele, true)
      notCurrentArr.push(resultIndex)
    }
  })
  notCurrentArr.sort().reduceRight((_, next) => {
    state.multipleSelectionCache.splice(next, 1)
  }, 0)
}

onBeforeMount(() => {
  handleListeners()
})

const state = reactive({
  paginationEvent: {},
  paginationDefault: {
    currentPage: 1,
    pageSizes: [10, 20, 50, 100],
    pageSize: 10,
    layout: 'total, prev, pager, next, sizes, jumper',
    total: 0
  },
  multipleSelectionCache: [],
  tableEvent: {},
  tableAttrs: {}
})

const imgType = computed(() => {
  return props.emptyImg ? props.emptyImg : props.isSearch ? 'tree' : 'noneWhite'
})
const table = ref(null)

const multipleSelectionAll = computed(() => [
  ...state.multipleSelectionCache,
  ...props.multipleSelection
])
watch(
  props.pagination,
  () => {
    state.paginationDefault = {
      ...state.paginationDefault,
      ...props.pagination
    }
  },
  { deep: true, immediate: true }
)

watch(
  props.tableData,
  () => {
    nextTick(() => {
      table.value.doLayout()
    })
    if (!props.isRememberSelected) return
    // 先拷贝 重新加载数据会触发SelectionChange 导致this.multipleSelection为空
    const multipleSelection = [...props.multipleSelection]
    nextTick(() => {
      handlerSelected(multipleSelection)
    })
  },
  { deep: true }
)
defineExpose({
  toggleRowSelection,
  clearSelection,
  toggleAllSelection,
  multipleSelectionAll
})
</script>

<template>
  <div class="flex-table" :class="!tableData.length && 'no-data'">
    <el-table
      ref="table"
      :border="border"
      v-bind="state.tableAttrs"
      :data="tableData"
      :style="{ width: '100%', height: '100%' }"
      v-on="state.tableEvent"
      v-loading="props.dataLoading"
    >
      <table-body :columns="columns">
        <slot />
      </table-body>
      <template #empty>
        <empty-background
          v-if="props.showEmptyImg"
          :description="props.emptyDesc ? props.emptyDesc : t('data_set.no_data')"
          :img-type="imgType || 'noneWhite'"
        />
        <div v-else :style="{ width: '100%' }" />
      </template>
    </el-table>
    <div v-if="showPagination && !!tableData.length" class="pagination-cont">
      <el-pagination
        v-model:current-page="state.paginationDefault.currentPage"
        v-model:page-size="state.paginationDefault.pageSize"
        background
        v-bind="state.paginationDefault"
        v-on="state.paginationEvent"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.flex-table {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  .pagination-cont {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  &.no-data {
    :deep(.ed-table__inner-wrapper::before) {
      display: none;
    }
  }
}
</style>
