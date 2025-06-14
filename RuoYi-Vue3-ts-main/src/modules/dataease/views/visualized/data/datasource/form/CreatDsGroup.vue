<script lang="ts" setup>
import dvFolder from '@de/assets/svg/dv-folder.svg'
import icon_searchOutline_outlined from '@de/assets/svg/icon_search-outline_outlined.svg'
import { ref, reactive, computed, watch, nextTick, shallowRef, unref } from 'vue'
import { useI18n } from '@de/hooks/web/useI18n'
import { checkRepeat, listDatasources, save, update } from '@de/api/datasource'
import { ElMessage, ElMessageBox, ElMessageBoxOptions } from 'element-plus-secondary'
import treeSort from '@de/utils/treeSortUtils'
import type { DatasetOrFolder } from '@de/api/dataset'
import { cloneDeep } from 'lodash-es'
import nothingTree from '@de/assets/img/nothing-tree.png'
import { useCache } from '@de/hooks/web/useCache'
import { filterFreeFolder } from '@de/utils/utils'
export interface Tree {
  name: string
  value?: string | number
  id: string | number
  nodeType: string
  createBy?: string
  level: number
  leaf?: boolean
  pid: string | number
  type?: string
  createTime: number
  children?: Tree[]
  request: any
}
const { t } = useI18n()
const { wsCache } = useCache()

const state = reactive({
  tData: []
})

const nodeType = ref()
const pid = ref()
const id = ref()
const oldName = ref()
const cmd = ref('')
const treeRef = ref()
const filterText = ref('')
const datasetForm = reactive({
  pid: '',
  name: ''
})
const searchEmpty = ref(false)

const filterNode = (value: string, data: Tree) => {
  nextTick(() => {
    searchEmpty.value = treeRef.value.isEmpty
  })
  if (!value) return true
  return data.name.includes(value)
}

watch(filterText, val => {
  showAll.value = !val
  treeRef.value.filter(val)
  nextTick(() => {
    document.querySelectorAll('.node-text').forEach(ele => {
      const content = ele.getAttribute('title')
      ele.innerHTML = content.replace(val, `<span class="highLight">${val}</span>`)
    })
  })
})

const showPid = computed(() => {
  if (nodeType.value === 'folder' && !!pid.value) {
    return false
  }
  return !['rename', 'move'].includes(cmd.value) && !!pid.value
})

const labelName = computed(() => {
  return nodeType.value === 'folder'
    ? t('deDataset.folder_name')
    : t('data_source.data_source_name')
})

const dialogTitle = computed(() => {
  let title = ''
  switch (nodeType.value) {
    case 'folder':
      title = t('deDataset.new_folder')
      break
    case 'datasource':
      title = t('deDataset.create') + t('auth.datasource')
      break
    default:
      break
  }
  switch (cmd.value) {
    case 'move':
      title = t('chart.move_to')
      break
    case 'rename':
      title = t('chart.rename')
      break
    default:
      break
  }
  return title
})

const showName = computed(() => {
  return cmd.value !== 'move'
})

const placeholder = ref('')
const datasetFormRules = ref()
const activeAll = ref(false)
const showAll = ref(true)
const datasource = ref()
const loading = ref(false)
const createDataset = ref(false)
const filterMethod = (value, data) => {
  if (!data) return false
  data.name.includes(value)
}
const resetForm = () => {
  createDataset.value = false
}
const originResourceTree = shallowRef([])

const sortTypeChange = sortType => {
  state.tData = treeSort(originResourceTree.value, sortType)
}
const dfs = (arr: Tree[]) => {
  arr.forEach(ele => {
    ele.value = ele.id
    if (ele.children?.length) {
      dfs(ele.children)
    }
  })
}
let request = null
let dsType = ''
const sortList = ['time_asc', 'time_desc', 'name_asc', 'name_desc']
const createInit = (type, data: Tree, exec, name: string) => {
  pid.value = ''
  id.value = ''
  cmd.value = ''
  datasetForm.pid = ''
  datasetForm.name = ''
  nodeType.value = type
  filterText.value = ''
  placeholder.value =
    type === 'folder' ? t('data_source.a_folder_name') : t('data_source.data_source_name_de')
  dsType = data.type
  if (type === 'datasource') {
    request = data.request
  }
  if (data.id) {
    if (exec !== 'rename') {
      listDatasources({ leaf: false, id: data.id, weight: 7 }).then(res => {
        filterFreeFolder(res, 'datasource')
        dfs(res as unknown as Tree[])
        state.tData = (res as unknown as Tree[]) || []
        if (state.tData.length && state.tData[0].name === 'root' && state.tData[0].id === '0') {
          state.tData[0].name = t('data_source.data_source')
        }
        originResourceTree.value = cloneDeep(unref(state.tData))
        let curSortType = sortList[Number(wsCache.get('TreeSort-backend')) ?? 1]
        curSortType = wsCache.get('TreeSort-datasource') ?? curSortType
        sortTypeChange(curSortType)
      })
    }
    if (exec) {
      pid.value = data.pid
      id.value = data.id
      datasetForm.pid = data.pid as string
      datasetForm.name = data.name
      oldName.value = data.name
    } else {
      datasetForm.pid = data.id as string
      pid.value = data.id
    }
  }
  cmd.value = data.id ? exec : ''
  name && (datasetForm.name = name)
  createDataset.value = true
  datasetFormRules.value = {
    name: [
      {
        required: true,
        message: placeholder.value,
        trigger: 'change'
      },
      {
        required: true,
        message: placeholder.value,
        trigger: 'blur'
      },
      {
        min: 1,
        max: 64,
        message: t('datasource.input_limit_1_64', [1, 64]),
        trigger: 'blur'
      }
    ],
    pid: [
      {
        required: true,
        message: t('common.please_select'),
        trigger: 'blur'
      }
    ]
  }
  setTimeout(() => {
    datasource.value.clearValidate()
  }, 50)
}

const editeInit = (param: Tree) => {
  pid.value = param.pid
  id.value = param.id
}

const props = {
  label: 'name',
  children: 'children',
  isLeaf: node => !node.children?.length
}

const nodeClick = (data: Tree) => {
  activeAll.value = false
  datasetForm.pid = data.id as string
}

const successCb = () => {
  wsCache.set('ds-new-success', true)
  datasource.value.resetFields()
  request = null
  datasetForm.pid = ''
  datasetForm.name = ''
  createDataset.value = false
}

const finallyCb = () => {
  loading.value = false
}
const checkPid = pid => {
  if (pid !== 0 && !pid) {
    ElMessage.error(t('data_source.the_destination_folder'))
    return false
  }
  return true
}
const saveDataset = () => {
  datasource.value.validate(result => {
    if (result) {
      const params: Omit<DatasetOrFolder, 'nodeType'> & { nodeType: 'folder' | 'datasource' } = {
        nodeType: nodeType.value as 'folder' | 'datasource',
        name: datasetForm.name.trim()
      }
      switch (cmd.value) {
        case 'move':
          params.pid = activeAll.value ? '0' : (datasetForm.pid as string)
          params.id = id.value
          params.action = 'move'
          break
        case 'rename':
          params.pid = pid.value as string
          params.id = id.value
          params.action = 'rename'
          break
        default:
          params.pid = datasetForm.pid || pid.value || '0'
          params.action = 'create'
          break
      }
      if (cmd.value === 'rename' && oldName.value === params.name) {
        successCb()
        return
      }
      if (cmd.value === 'move' && !checkPid(params.pid)) {
        return
      }
      if (loading.value) {
        return
      }
      loading.value = true
      if (request) {
        let options = {
          confirmButtonType: 'danger',
          type: 'warning',
          autofocus: false,
          showClose: false,
          tip: ''
        }
        request.apiConfiguration = ''
        checkRepeat(request).then(res => {
          let method = request.id === '' ? save : update
          if (!request.type.startsWith('API') && request.type !== 'ExcelRemote') {
            request.syncSetting = null
          }
          if (res) {
            ElMessageBox.confirm(t('datasource.has_same_ds'), options as ElMessageBoxOptions)
              .then(() => {
                method({ ...request, name: datasetForm.name, pid: params.pid })
                  .then(res => {
                    if (res !== undefined) {
                      wsCache.set('ds-new-success', true)
                      emits('handleShowFinishPage', { ...res, pid: params.pid })
                      ElMessage.success(t('data_source.source_saved_successfully'))
                      successCb()
                    }
                  })
                  .finally(() => {
                    loading.value = false
                  })
              })
              .catch(() => {
                loading.value = false
                createDataset.value = false
              })
          } else {
            method({ ...request, name: datasetForm.name, pid: params.pid })
              .then(res => {
                if (res !== undefined) {
                  wsCache.set('ds-new-success', true)
                  emits('handleShowFinishPage', { ...res, pid: params.pid })
                  ElMessage.success(t('data_source.source_saved_successfully'))
                  successCb()
                }
              })
              .finally(() => {
                loading.value = false
              })
          }
        })
        return
      }
      emits('finish', params, successCb, finallyCb, cmd.value, dsType)
    }
  })
}

defineExpose({
  createInit,
  editeInit
})

const emits = defineEmits(['finish', 'handleShowFinishPage'])
</script>

<template>
  <el-dialog
    v-loading="loading"
    :title="dialogTitle"
    v-model="createDataset"
    :width="cmd === 'move' ? '600px' : '420px'"
    class="create-dialog"
    :before-close="resetForm"
  >
    <el-form
      label-position="top"
      require-asterisk-position="right"
      ref="datasource"
      @keydown.stop.prevent.enter
      :model="datasetForm"
      :rules="datasetFormRules"
    >
      <el-form-item v-if="showName" :label="labelName" prop="name">
        <el-input :placeholder="placeholder" v-model="datasetForm.name" />
      </el-form-item>
      <el-form-item v-if="showPid" :label="t('deDataset.folder')" prop="pid">
        <el-tree-select
          v-model="datasetForm.pid"
          :data="state.tData"
          popper-class="dataset-tree-select"
          style="width: 100%"
          :render-after-expand="false"
          :props="props"
          @node-click="nodeClick"
          :filter-method="filterMethod"
          filterable
        >
          <template #default="{ data: { name } }">
            <el-icon>
              <Icon name="dv-folder"><dvFolder class="svg-icon" /></Icon>
            </el-icon>
            <span :title="name">{{ name }}</span>
          </template>
        </el-tree-select>
      </el-form-item>
      <div v-if="cmd === 'move'">
        <el-input style="margin-bottom: 12px" v-model="filterText" clearable>
          <template #prefix>
            <el-icon>
              <Icon name="icon_search-outline_outlined"
                ><icon_searchOutline_outlined class="svg-icon"
              /></Icon>
            </el-icon>
          </template>
        </el-input>
        <div class="tree-content">
          <el-tree
            ref="treeRef"
            :filter-node-method="filterNode"
            filterable
            v-model="datasetForm.pid"
            menu
            empty-text=""
            :data="state.tData"
            :props="props"
            @node-click="nodeClick"
          >
            <template #default="{ data }">
              <span class="custom-tree-node">
                <el-icon style="font-size: 18px">
                  <Icon name="dv-folder"><dvFolder class="svg-icon" /></Icon>
                </el-icon>
                <span class="node-text" :title="data.name">{{ data.name }}</span>
              </span>
            </template>
          </el-tree>
          <div v-if="searchEmpty" class="empty-search">
            <img :src="nothingTree" />
            <span>{{ t('data_source.relevant_content_found') }}</span>
          </div>
        </div>
      </div>
    </el-form>
    <template #footer>
      <el-button secondary @click="resetForm">{{ t('dataset.cancel') }} </el-button>
      <el-button type="primary" @click="saveDataset">{{ t('dataset.confirm') }} </el-button>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.tree-content {
  width: 552px;
  height: 380px;
  border: 1px solid #dee0e3;
  border-radius: 4px;
  padding: 8px;
  overflow-y: auto;
  .custom-tree-node {
    display: flex;
    align-items: center;
    .node-text {
      margin-left: 8.75px;
      width: 120px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      :deep(.highLight) {
        color: var(--el-color-primary, #3370ff);
      }
    }
  }

  .empty-search {
    width: 100%;
    margin-top: 57px;
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
      width: 100px;
      height: 100px;
      margin-bottom: 8px;
    }
    span {
      font-family: var(--de-custom_font, 'PingFang');
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: #646a73;
    }
  }
}
</style>
<style lang="less">
.dataset-tree-select {
  .ed-select-dropdown__item {
    display: flex;
    align-items: center;
    .ed-icon {
      margin-right: 5px;
    }
  }
}
</style>
