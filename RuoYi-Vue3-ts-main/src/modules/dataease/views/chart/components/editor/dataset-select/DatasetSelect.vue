<script setup lang="ts">
import dvFolder from '@de/assets/svg/dv-folder.svg'
import icon_dataset from '@de/assets/svg/icon_dataset.svg'
import icon_done_outlined from '@de/assets/svg/icon_done_outlined.svg'
import { Tree } from '../../../../visualized/data/dataset/form/CreatDsGroup.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { useI18n } from '@de/hooks/web/useI18n'
import { useAppStoreWithOut } from '@de/store/modules/app'
import _ from 'lodash'
import { getDatasetTree, getDatasourceList } from '@de/api/dataset'
import { ElFormItem, FormInstance } from 'element-plus-secondary'
import { useEmitt } from '@de/hooks/web/useEmitt'
import { useCache } from '@de/hooks/web/useCache'
import { useUserStoreWithOut } from '@de/store/modules/user'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import treeSort from '@de/utils/treeSortUtils'

const dvMainStore = dvMainStoreWithOut()
const { wsCache } = useCache('localStorage')
const userStore = useUserStoreWithOut()
const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    themes?: EditorTheme
    modelValue?: string | number
    stateObj: any
    disabled: boolean
    viewId: string
    sourceType: string
  }>(),
  {
    datasetTree: () => [],
    themes: 'dark',
    sourceType: 'dataset',
    disabled: false
  }
)

const datasetSelector = ref(null)

const loadingDatasetTree = ref(false)

const orgCheck = ref(true)

const datasetTree = ref<Tree[]>([])

const selectSource =
  props.sourceType === 'datasource'
    ? t('visualization.select_datasource')
    : t('visualization.select_dataset')

const newSource =
  props.sourceType === 'datasource'
    ? t('visualization.new_datasource')
    : t('visualization.new_dataset')

const sourceName = computed(() =>
  props.sourceType === 'datasource' ? t('datasource.datasource') : t('visualization.dataset')
)

const sortTypeChange = arr => {
  const sortType = wsCache.get('TreeSort-dataset') || 'time_desc'
  datasetTree.value = treeSort(arr, sortType)
}

const initDataset = () => {
  loadingDatasetTree.value = true
  const method = props.sourceType === 'datasource' ? getDatasourceList : getDatasetTree
  const params = props.sourceType === 'datasource' ? null : {}
  method(params)
    .then(res => {
      sortTypeChange((res as unknown as Tree[]) || [])
    })
    .finally(() => {
      loadingDatasetTree.value = false
      formRef.value?.validate()
    })
}

const emits = defineEmits([
  'update:modelValue',
  'update:stateObj',
  'onDatasetChange',
  'addDsWindow'
])

const _modelValue = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emits('update:modelValue', v)
  }
})

const dsSelectProps = {
  label: 'name',
  children: 'children',
  value: 'id',
  isLeaf: node => !node.children?.length
}

const formRef = ref<FormInstance>()
const searchStr = ref<string>()

watch(searchStr, val => {
  datasetSelector.value.filter(val)
})

const showTree = computed(() => {
  return (
    datasetTree.value && datasetTree.value.length > 0 && !loadingDatasetTree.value && orgCheck.value
  )
})

const emptyMsg = computed(() => {
  return orgCheck.value ? '暂无' + sourceName.value : '已切换至新组织，无权访问其他组织的资源'
})

const showEmptyInfo = computed(() => {
  return !showTree.value && !loadingDatasetTree.value && !orgCheck.value
})

const computedTree = computed(() => {
  if (showTree.value) {
    if (datasetTree.value[0].id === '0') {
      return datasetTree.value[0].children
    }
  }
  return datasetTree.value
})

const flattedTree = computed(() => {
  return _.filter(flatTree(computedTree.value), node => node.leaf)
})

const selectedNode = computed(() => {
  return _.find(flattedTree.value, node => node.id === _modelValue.value)
})

const exist = computed(() => {
  if (_modelValue.value) {
    if (selectedNode.value === undefined) {
      return false
    }
  }
  return true
})

const selectedNodeName = computed(() => {
  if (!exist.value) {
    return sourceName.value + '不存在'
  }
  return selectedNode.value?.name
})

const form = computed(() => {
  return { name: selectedNodeName.value }
})

const rules = ref([
  {
    validator: (...params) => {
      if (!exist.value) {
        params[2](new Error())
      } else {
        params[2]()
      }
    },
    trigger: ['change', 'blur']
  }
])

function flatTree(tree: Tree[]) {
  let result = _.cloneDeep(tree)
  _.forEach(tree, node => {
    if (node.children && node.children.length > 0) {
      result = _.union(result, flatTree(node.children))
    }
  })
  return result
}
const onDatasetChange = val => {
  emits('onDatasetChange', val)
}
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.name?.includes(value)
}

const refresh = () => {
  initDataset()
}
const addDataset = () => {
  emits('addDsWindow')
}

const datasetSelectorPopover = ref()

const dsClick = (data: Tree) => {
  if (data.leaf) {
    if (_modelValue.value !== data.id) {
      onDatasetChange(data.id)
    }
    //选中赋值
    _modelValue.value = data.id
    //关闭弹窗
    datasetSelectorPopover.value?.hide()
  }
}
const _popoverShow = ref(false)
function onPopoverShow() {
  _popoverShow.value = true
}
function onPopoverHide() {
  _popoverShow.value = false
}

function getNode(nodeId: number) {
  return datasetSelector?.value?.getNode(nodeId)
}

const clearShow = computed(
  () =>
    props.sourceType === 'dataset' &&
    dvMainStore.curComponent &&
    ['rich-text', 'picture-group'].includes(dvMainStore.curComponent.innerType)
)

const handleClear = e => {
  e.preventDefault()
  e.stopPropagation()
  dsClick({ leaf: true, id: null } as Tree)
  useEmitt().emitter.emit('clear-remove', ['xAxis', 'yAxis', 'drillFields'])
}

const handleFocus = () => {
  if (
    props.sourceType === 'dataset' &&
    userStore.getOid &&
    wsCache.get('user.oid') &&
    userStore.getOid !== wsCache.get('user.oid')
  ) {
    orgCheck.value = false
  } else {
    orgCheck.value = true
  }
}

defineExpose({ getNode })
const appStore = useAppStoreWithOut()
const isDataEaseBi = computed(() => appStore.getIsDataEaseBi || appStore.getIsIframe)
onMounted(() => {
  initDataset()
  useEmitt({
    name: 'refresh-dataset-selector',
    callback: () => refresh()
  })
})
</script>

<template>
  <div>
    <el-popover
      ref="datasetSelectorPopover"
      trigger="click"
      placement="bottom-start"
      :width="320"
      popper-class="customDatasetSelect"
      :show-arrow="false"
      @show="onPopoverShow"
      @hide="onPopoverHide"
      :disabled="disabled"
      :effect="themes"
      :offset="4"
    >
      <template #reference>
        <el-form ref="formRef" :model="form">
          <el-form-item prop="name" :rules="rules">
            <el-input
              size="middle"
              :effect="themes"
              v-model="selectedNodeName"
              class="data-set-dark"
              @focus="handleFocus"
              :disabled="disabled"
              :placeholder="selectSource"
            >
              <template #suffix>
                <el-icon
                  v-show="!disabled"
                  class="input-arrow-icon"
                  :class="{ reverse: _popoverShow }"
                >
                  <ArrowDown />
                </el-icon>
                <el-icon
                  v-show="!disabled"
                  v-if="clearShow"
                  class="input-custom-clear-icon"
                  @click="handleClear"
                >
                  <CircleClose />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </template>
      <template #default>
        <el-container :class="themes">
          <el-header>
            <div class="m-title" :class="{ dark: themes === 'dark' }">
              <div>{{ sourceName }}</div>
              <el-button type="primary" link class="refresh-btn" @click="refresh">
                {{ t('commons.refresh') }}
              </el-button>
            </div>
            <el-input
              size="middle"
              :effect="themes"
              v-model="searchStr"
              :placeholder="t('dataset.search')"
              :prefix-icon="Search"
              clearable
            />
          </el-header>
          <el-main :class="{ dark: themes === 'dark' }">
            <el-scrollbar max-height="252px" always>
              <div class="m-loading" v-if="loadingDatasetTree" v-loading="loadingDatasetTree"></div>
              <div class="empty-info" v-if="showEmptyInfo">{{ emptyMsg }}</div>
              <!--          <div class="empty-info" v-if="showEmptySearchInfo">暂无相关数据</div>-->
              <el-tree
                :class="{ dark: themes === 'dark' }"
                v-if="showTree"
                ref="datasetSelector"
                node-key="id"
                :data="computedTree"
                :teleported="false"
                :props="dsSelectProps"
                :render-after-expand="false"
                filterable
                @node-click="dsClick"
                :filter-node-method="filterNode"
                empty-text="暂无相关数据"
              >
                <template #default="{ node, data }">
                  <div
                    class="tree-row-item"
                    :title="node.label"
                    :class="{ dark: themes === 'dark', active: _modelValue === data.id }"
                  >
                    <div class="m-icon">
                      <el-icon v-if="!data.leaf">
                        <Icon name="dv-folder"><dvFolder class="svg-icon" /></Icon>
                      </el-icon>
                      <el-icon v-if="data.leaf">
                        <Icon name="icon_dataset"><icon_dataset class="svg-icon" /></Icon>
                      </el-icon>
                    </div>
                    {{ node.label }}

                    <el-icon class="checked-item" v-if="_modelValue === data.id">
                      <Icon name="icon_done_outlined"><icon_done_outlined class="svg-icon" /></Icon>
                    </el-icon>
                  </div>
                </template>
              </el-tree>
            </el-scrollbar>
          </el-main>
          <el-footer v-if="!isDataEaseBi">
            <div class="footer-container">
              <el-button type="primary" :icon="Plus" link class="add-btn" @click="addDataset">
                {{ newSource }}
              </el-button>
            </div>
          </el-footer>
        </el-container>
      </template>
    </el-popover>
  </div>
</template>

<style scoped lang="less">
.ed-input--dark.data-set-dark {
  :deep(.ed-input__wrapper) {
    background-color: #1a1a1a;
  }
}
:deep(.ed-input__wrapper) {
  cursor: pointer;
  padding: 1px 11px;

  .ed-input__inner {
    cursor: pointer;
    font-size: 12px;
  }
}
:deep(.ed-form-item) {
  margin-bottom: 0;
}
:deep(.ed-form-item.is-error .ed-input__wrapper) {
  input {
    color: var(--ed-color-danger);
  }
}
</style>

<style lang="less">
.input-custom-clear-icon {
  font-size: 14px;
}
.input-arrow-icon {
  font-size: 16px;
  transform: rotateZ(0);
  transition: transform var(--ed-transition-duration);

  &.reverse {
    transform: rotateZ(-180deg);
  }
}
.customDatasetSelect {
  --ed-popover-padding: 0 !important;
  max-height: 356px;

  .ed-container {
    max-height: 356px;
    &.dark {
      background: #292929;
    }

    .ed-header {
      --ed-header-height: 68px;
      --ed-header-padding: 0 11px;

      .m-title {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 28px;
        padding-top: 8px;

        color: #1f2329;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: 20px;

        .refresh-btn {
          font-size: 12px;
          font-weight: 400;
          cursor: pointer;
          min-width: 30px;
          min-width: 30px;
        }

        &.dark {
          color: #ebebeb;
        }
      }

      .ed-input {
        padding: 4px 0;
        font-size: 12px;
      }
    }

    .ed-footer {
      --ed-footer-height: 36px;
      --ed-footer-padding: 0 11px;
      border-top: rgba(31, 35, 41, 0.15) 1px solid;

      .footer-container {
        height: calc(100% - 3px);
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .add-btn {
        font-size: 12px;
        font-weight: 400;
      }
    }

    .ed-main {
      --ed-main-padding: 0;
      overflow-x: hidden;

      .empty-info {
        color: #646a73;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 20px;
        text-align: center;
      }

      .m-loading {
        width: 100%;
        height: 80px;
        .ed-loading-mask {
          background-color: transparent;
        }
      }

      &.dark {
        background-color: #292929;
        color: #ebebeb;

        .empty-info {
          color: #a6a6a6;
        }
      }

      .ed-tree__empty-block {
        position: unset;
        color: #646a73;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 20px;
        min-height: 20px;
        text-align: start;
        .ed-tree__empty-text {
          position: inherit;
          transform: inherit;
          color: inherit;
          font-size: inherit;
          padding: 0 11px;
        }
      }

      .ed-tree {
        &.dark {
          color: #ebebeb;
          background-color: #292929;

          .ed-tree__empty-block {
            color: #a6a6a6;
          }

          .ed-tree-node__expand-icon {
            color: #a6a6a6;
            &.is-leaf {
              color: transparent;
            }
          }

          .ed-tree-node__content:hover {
            background: rgba(235, 235, 235, 0.1);
          }
          .ed-tree-node:not(.is-effect):focus > .ed-tree-node__content {
            background: rgba(235, 235, 235, 0.1);
          }
        }
      }

      .tree-row-item {
        display: block;
        overflow-x: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
        white-space: nowrap;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 20px;

        padding-right: 11px;

        &::-webkit-scrollbar {
          display: none;
        }

        .m-icon {
          margin-right: 4px;
          font-size: 16px;
          height: 20px;
          display: inline-block;
          vertical-align: bottom;
        }

        &.active {
          color: var(--ed-color-primary);
          padding-right: 30px;
        }
        .checked-item {
          position: absolute;
          right: 10px;
          padding-top: 2px;
          color: var(--ed-color-primary);
          font-size: 16px;
        }
      }
    }
  }

  .ed-button.is-link {
    font-size: 12px;
    font-weight: 400;
    padding: 4px;

    &:not(.is-disabled):focus,
    &:not(.is-disabled):hover {
      color: var(--ed-color-primary);
      border-color: transparent;
      background-color: var(--ed-color-primary-1a, rgba(51, 112, 255, 0.1));
    }
    &:not(.is-disabled):active {
      color: var(--ed-color-primary);
      border-color: transparent;
      background-color: var(--ed-color-primary-33, rgba(51, 112, 255, 0.2));
    }
  }
}
</style>
