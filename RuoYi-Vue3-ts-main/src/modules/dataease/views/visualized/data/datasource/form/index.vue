<script lang="ts" setup>
import icon_close_outlined from '@de/assets/svg/icon_close_outlined.svg'
import icon_searchOutline_outlined from '@de/assets/svg/icon_search-outline_outlined.svg'
import { reactive, ref, computed, watch, nextTick } from 'vue'
import { ElIcon, ElMessage, ElMessageBox, ElMessageBoxOptions } from 'element-plus-secondary'
import CreatDsGroup from './CreatDsGroup.vue'
import type { DsType } from './DsTypeList.vue'
import DsTypeList from './DsTypeList.vue'
import { useI18n } from '@de/hooks/web/useI18n'
import EditorDetail from './EditorDetail.vue'
import ExcelDetail from './ExcelDetail.vue'
import {
  save,
  update,
  validate,
  latestUse,
  isShowFinishPage,
  checkRepeat,
  loadRemoteFile
} from '@de/api/datasource'
import { Base64 } from 'js-base64'
import type { Param } from './ExcelDetail.vue'
import type { Configuration, ApiConfiguration, SyncSetting } from './option'
import { dsTypes, typeList, nameMap } from './option'
import { useRouter } from 'vue-router'
import { uuid } from 'vue-uuid'
import { useEmitt } from '@de/hooks/web/useEmitt'
import FinishPage from '../FinishPage.vue'
import { cloneDeep } from 'lodash-es'
import { useCache } from '@de/hooks/web/useCache'
import Icon from '@de/components/icon-custom/src/Icon.vue'
import { XpackComponent, PluginComponent } from '@de/components/plugin'
import { iconDatasourceMap } from '@de/components/icon-group/datasource-list'
import ExcelRemoteDetail from '@de/views/visualized/data/datasource/form/ExcelRemoteDetail.vue'

interface Node {
  name: string
  id: string
  type: DsType
}

interface Tree {
  [key: string]: any
}
interface Form {
  name: string
  pid?: string
  id?: string
  description: string
  type: string
  copy: boolean
  configuration?: Configuration
  apiConfiguration?: ApiConfiguration[]
  paramsConfiguration?: ApiConfiguration[]
  syncSetting?: SyncSetting
  isPlugin?: boolean
  staticMap?: any
}

const { t } = useI18n()
const creatDsFolder = ref()
const router = useRouter()
const { wsCache } = useCache()
const dsLoading = ref(false)
let isFormUpdate = false
let isForm2Update = false
let isUpdate = false
const changeUpdate = val => {
  isUpdate = val
}
const state = reactive({
  datasourceTree: []
})
state.datasourceTree = typeList.map(ele => {
  return {
    name: nameMap[ele],
    type: ele
  }
})

const activeStep = ref(0)
const detail = ref()
const xpack = ref()
const excel = ref()
const excelRemote = ref()
const latestUseTypes = ref([])
const currentType = ref<DsType>('OLTP')
const filterText = ref('')
const currentDsType = ref('')
const emits = defineEmits(['refresh'])
const { emitter } = useEmitt()
const isPlugin = ref(false)
const isSupportSetKey = ref(false)
const selectDsType = (type: string) => {
  currentDsType.value = type
  activeStep.value = 1
  activeApiStep.value = 1
  nextTick(() => {
    detail?.value?.initForm(type, pluginDs.value, pluginIndex.value, isPlugin.value) ||
      xpack?.value?.invokeMethod({
        methodName: 'initForm',
        args: type
      })
    excelRemote?.value?.initForm(type)
    if (!dsTree.value) return
    currentTypeList.value
      .map(ele => ele.dbList)
      .flat()
      .some(ele => {
        if (ele.type === currentDsType.value) {
          dsTree.value.setCurrentNode(ele)
          isPlugin.value = ele['isPlugin']
          return true
        }
        return false
      })
  })
}

const handleDsNodeClick = data => {
  if (!data.type) return
  isPlugin.value = data['isPlugin']
  selectDsType(data.type)
}
const handleNodeClick = (data: Node) => {
  currentType.value = data.type
}

watch(filterText, val => {
  if (activeStep.value === 1) {
    dsTree.value.filter(val.toLocaleLowerCase())
  }
})

const dsTree = ref()
const defaultProps = {
  children: 'dbList',
  label: 'name'
}
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.name.toLowerCase().includes(value)
}
const databaseList = ref([])
const currentTypeList = computed(() => {
  return typeList.map((ele, index) => {
    return { name: nameMap[ele], dbList: databaseList.value[index] }
  })
})

const getDatasourceTypes = () => {
  const arr = [[], [], [], [], []]
  dsTypes.forEach(item => {
    const index = typeList.findIndex(ele => ele === item.catalog)
    if (index !== -1) {
      arr[index].push(item)
    }
  })
  databaseList.value = arr.map(ele => {
    return ele.sort((a, b) => {
      return a.name.toLowerCase().charCodeAt(0) - b.name.toLowerCase().charCodeAt(0)
    })
  })
}
getDatasourceTypes()

const pluginIndex = ref('')
const pluginDs = ref([])
const loadDsPlugin = data => {
  pluginDs.value = data
  data.forEach(item => {
    const { name, category, type, icon, extraParams, staticMap } = item
    const node = {
      name,
      catalog: category,
      type,
      icon,
      extraParams,
      isPlugin: true,
      staticMap
    }
    const index = typeList.findIndex(ele => ele === node.catalog)
    if (index !== -1) {
      databaseList.value[index].push(node)
    }
  })
}
const getPluginStatic = type => {
  const arr = pluginDs.value.filter(ele => {
    return ele.type === type
  })
  return pluginIndex.value
    ? pluginIndex.value
    : arr && arr.length > 0
    ? arr[0].staticMap?.index
    : null
}

const getLatestUseTypes = () => {
  latestUse({}).then(res => {
    latestUseTypes.value = res.data
  })
}
getLatestUseTypes()

const activeApiStep = ref(0)

const setNextStep = () => {
  activeApiStep.value = activeStep.value + 1
  if (
    (currentDsType.value.includes('API') || currentDsType.value === 'ExcelRemote') &&
    activeStep.value === 1
  )
    return
  activeStep.value = activeStep.value + 1
}

const next = () => {
  if (currentDsType.value === '') {
    ElMessage.error(t('datasource.select_type'))
    return
  }

  if (
    form.apiConfiguration?.length === 0 &&
    currentDsType.value.includes('API') &&
    activeStep.value !== 2
  ) {
    ElMessage.error(t('data_source.cannot_be_empty_table'))
    return
  }

  if (currentDsType.value.includes('ExcelRemote') && activeStep.value !== 2) {
    const validate = excelRemote.value.validateExcel()
    if (validate) {
      setNextStep()
    }
    return
  }

  if (currentDsType.value.includes('API') && activeStep.value !== 2) {
    const validateFrom = detail.value.submitForm()
    validateFrom(val => {
      if (val) {
        setNextStep()
      }
    })
    return
  }

  setNextStep()
}

const complete = (params, successCb, finallyCb) => {
  excel?.value?.saveExcelDs(
    params,
    () => {
      pid.value = params.pid
      successCb()
    },
    finallyCb
  )
  excelRemote?.value?.saveExcelDs(
    params,
    () => {
      pid.value = params.pid
      successCb()
    },
    finallyCb
  )
  return
}

const showFinishPage = ref(false)
const dsInfo = reactive({
  name: '',
  id: ''
})

const createDataset = () => {
  router.push({
    path: '/dataset-form',
    query: {
      datasourceId: dsInfo.id
    }
  })
}
const backToDatasourceList = () => {
  visible.value = false
  emits('refresh')
  showFinishPage.value = false
}
const continueCreating = () => {
  showFinishPage.value = false
  init(null, pid.value)
}

const handleShowFinishPage = ({ id, name, pid }) => {
  isShowFinishPage()
    .then(res => {
      if (editDs.value || !res.data) {
        emits('refresh')
        visible.value = false
        return
      } else {
        showFinishPage.value = true
        Object.assign(dsInfo, { id, name })
      }
    })
    .finally(() => {
      pid.value = pid
    })
}

emitter.on('showFinishPage', handleShowFinishPage)

const prev = () => {
  prevConfirm()
}

const prevConfirm = () => {
  if (
    (currentDsType.value.includes('API') || currentDsType.value === 'ExcelRemote') &&
    activeApiStep.value === 2
  ) {
    activeApiStep.value = 1
    activeStep.value = 1
    return
  }

  if (activeStep.value === 1) {
    currentDsType.value = ''
  }
  activeStep.value = activeStep.value - 1
}

const handleSubmit = param => {
  const validateFrom = param.validate
  if (param.eventName === 'saveDs') {
    validateFrom(val => {
      if (val) {
        doSaveDs(param.args)
      }
    })
  } else {
    validateFrom(val => {
      if (val) {
        doValidateDs(param.args)
      }
    })
  }
}

const validateDS = () => {
  const request = JSON.parse(JSON.stringify(form)) as unknown as Omit<
    Form,
    'configuration' | 'apiConfiguration'
  > & {
    configuration: string
    apiConfiguration: string
  }
  if (currentDsType.value.includes('API')) {
    if (form.apiConfiguration.length === 0) {
      ElMessage.error(t('data_source.add_data_table'))
      return
    }
    let apiItems = []
    apiItems = apiItems.concat(request.apiConfiguration)
    if (request.paramsConfiguration) {
      apiItems = apiItems.concat(request.paramsConfiguration)
    }
    request.configuration = Base64.encode(JSON.stringify(apiItems))
    request.syncSetting.startTime = new Date(request.syncSetting.startTime).getTime()
    request.syncSetting.endTime = new Date(request.syncSetting.endTime).getTime()
  } else {
    request.configuration = Base64.encode(JSON.stringify(request.configuration))
  }
  if (isPlugin.value && !currentDsType.value.includes('API')) {
    xpack?.value?.invokeMethod({
      methodName: 'submitForm',
      args: [{ eventName: 'validateDs', args: request }]
    })
  } else {
    let validateFrom = detail?.value?.submitForm()
    if (excelRemote?.value?.submitForm()) {
      validateFrom = excelRemote?.value?.submitForm()
    }
    validateFrom(val => {
      if (val) {
        doValidateDs(request)
      }
    })
  }
}

const doValidateDs = request => {
  dsLoading.value = true
  if (currentDsType.value === 'ExcelRemote') {
    let excelRequest = JSON.parse(JSON.stringify(form2.configuration))
    excelRequest.datasourceId = form2.id || 0
    excelRequest.editType = form2.editType
    excelRequest.userName = Base64.encode(excelRequest.userName)
    excelRequest.passwd = Base64.encode(excelRequest.passwd)
    return loadRemoteFile(excelRequest)
      .then(res => {
        dsLoading.value = false
        if (!res) {
          ElMessage.warning(res.msg)
          return
        }
        if (res?.code !== 0) {
          ElMessage.warning(res.msg)
          return
        }
        ElMessage.success(t('datasource.validate_success'))
        dsLoading.value = false
      })
      .catch(() => {
        ElMessage.error(t('data_source.verification_failed'))
        dsLoading.value = false
      })
  }
  validate(request)
    .then(res => {
      if (res.data.type.includes('API')) {
        let error = 0
        const status = JSON.parse(res.data.status) as Array<{ status: string; name: string }>
        for (let i = 0; i < status.length; i++) {
          if (status[i].status === 'Error') {
            error++
          }
          for (let j = 0; j < form.apiConfiguration.length; j++) {
            if (status[i].name === form.apiConfiguration[j].name) {
              form.apiConfiguration[j].status = status[i].status
            }
          }
        }
        if (error === 0) {
          ElMessage.success(t('datasource.validate_success'))
        } else {
          ElMessage.error(t('data_source.verification_failed'))
        }
      } else {
        ElMessage.success(t('datasource.validate_success'))
      }
    })
    .finally(() => {
      dsLoading.value = false
    })
}

const typeTitle = computed(() => {
  if (!currentDsType.value) {
    return ''
  }
  let str = ''
  databaseList.value.some(ele => {
    return ele.some(itx => {
      if (itx.type === currentDsType.value) {
        str = itx.name
        return true
      }
      return false
    })
  })
  return str
})

const saveDS = () => {
  isUpdate = false
  const request = JSON.parse(JSON.stringify(form)) as unknown as Omit<
    Form,
    'configuration' | 'apiConfiguration'
  > & {
    configuration: string
    apiConfiguration: string
  }

  if (currentDsType.value === 'Excel') {
    excel.value.uploadStatus(false)
    if (!excel.value.sheetFile?.name) {
      excel.value.uploadStatus(true)
      return
    }
    const validate = excel.value.submitForm()
    validate(val => {
      if (val) {
        if (editDs.value) {
          complete(null, null, null)
        } else {
          creatDsFolder.value.createInit('datasource', { id: pid.value }, '', form2.name)
        }
      }
    })
    return
  }

  if (currentDsType.value === 'ExcelRemote') {
    const validate = excelRemote.value.submitForm()
    validate(val => {
      if (val) {
        const validateApi = excelRemote?.value?.submitSyncSettingForm()
        validateApi(v => {
          if (v) {
            if (editDs.value && form2.id) {
              complete(null, null, null)
            } else {
              creatDsFolder.value.createInit('datasource', { id: pid.value }, '', form2.name)
            }
          }
        })
      }
    })
    return
  } else if (currentDsType.value.includes('API')) {
    for (let i = 0; i < request.apiConfiguration.length; i++) {
      if (
        request.apiConfiguration[i].deTableName === '' ||
        request.apiConfiguration[i].deTableName === undefined ||
        request.apiConfiguration[i].deTableName === null
      ) {
        request.apiConfiguration[i].deTableName =
          'api_' +
          request.apiConfiguration[i].name +
          '_' +
          uuid.v1().replaceAll('-', '').substring(0, 10)
      }
      request.apiConfiguration[i].jsonFields = []
      for (let j = 0; j < request.apiConfiguration[i].fields.length; j++) {
        request.apiConfiguration[i].fields[j].value = []
      }
    }
    let apiItems = []
    apiItems = apiItems.concat(request.apiConfiguration)
    if (request.paramsConfiguration) {
      apiItems = apiItems.concat(request.paramsConfiguration)
    }
    request.configuration = Base64.encode(JSON.stringify(apiItems))
    request.syncSetting.startTime = new Date(request.syncSetting.startTime).getTime()
    request.syncSetting.endTime = new Date(request.syncSetting.endTime).getTime()
  } else {
    request.configuration = Base64.encode(JSON.stringify(request.configuration))
  }
  if (isPlugin.value && !currentDsType.value.includes('API')) {
    xpack?.value?.invokeMethod({
      methodName: 'submitForm',
      args: [{ eventName: 'saveDs', args: request }]
    })
  } else {
    const validate = detail?.value?.submitForm()
    request.apiConfiguration = ''
    validate(val => {
      if (val) {
        if (currentDsType.value.includes('API')) {
          const validateApi = detail?.value?.submitApiForm()
          validateApi(v => {
            if (v) {
              doSaveDs(request)
            }
          })
        } else {
          doSaveDs(request)
        }
      }
    })
  }
}

const doSaveDs = request => {
  if (editDs.value && form.id) {
    let options = {
      confirmButtonType: 'danger',
      type: 'warning',
      autofocus: false,
      showClose: false,
      tip: ''
    }
    checkRepeat(request).then(res => {
      let method = request.id === '' ? save : update
      if (res) {
        ElMessageBox.confirm(t('datasource.has_same_ds'), options as ElMessageBoxOptions).then(
          () => {
            if (dsLoading.value === true) {
              return
            }
            dsLoading.value = true
            method(request)
              .then(res => {
                if (res !== undefined) {
                  handleShowFinishPage({ id: res.id, name: res.name })
                  ElMessage.success(t('data_source.source_saved_successfully'))
                }
              })
              .finally(() => {
                dsLoading.value = false
              })
          }
        )
      } else {
        if (dsLoading.value === true) {
          return
        }
        dsLoading.value = true
        method(request)
          .then(res => {
            if (res !== undefined) {
              handleShowFinishPage({ id: res.id, name: res.name })
              ElMessage.success(t('data_source.source_saved_successfully'))
            }
          })
          .finally(() => {
            dsLoading.value = false
          })
      }
    })
  } else {
    creatDsFolder.value.createInit('datasource', { id: pid.value, request }, '', form.name)
  }
}

const defaultForm = {
  id: '',
  name: '',
  description: '',
  type: 'API',
  apiConfiguration: [],
  paramsConfiguration: [],
  enableDataFill: false
}
const defaultForm2 = {
  type: '',
  id: '0',
  editType: 0,
  name: '',
  creator: '',
  configuration: {}
}
const origin = reactive<Form>(cloneDeep(defaultForm))
const form = reactive<Form>(cloneDeep(defaultForm))
const form2 = reactive<Param>(cloneDeep(defaultForm2))

const visible = ref(false)
const editDs = ref(false)
const pid = ref('0')

watch(
  () => form,
  () => {
    if (isFormUpdate) {
      changeUpdate(true)
    }
  },
  { deep: true }
)

watch(
  () => form2,
  () => {
    if (isForm2Update) {
      changeUpdate(true)
    }
  },
  { deep: true }
)

const init = (nodeInfo: Form | Param, id?: string, res?: object, supportSetKey: boolean) => {
  isPlugin.value = nodeInfo?.isPlugin
  pluginIndex.value = isPlugin.value ? nodeInfo?.staticMap?.index : null
  isSupportSetKey.value = supportSetKey
  editDs.value = !!nodeInfo
  showFinishPage.value = false

  if (!!nodeInfo) {
    if (nodeInfo.type.startsWith('Excel')) {
      Object.assign(form2, cloneDeep(nodeInfo))
    } else {
      Object.assign(form, cloneDeep(nodeInfo))
      Object.assign(origin, cloneDeep(nodeInfo))
      if (form.hasOwnProperty('configuration') && form.configuration.urlType == undefined) {
        form.configuration.urlType = 'hostName'
      }
      if (form.hasOwnProperty('configuration') && form.configuration.sshType == undefined) {
        form.configuration.sshType = 'password'
      }
    }
    pid.value = nodeInfo.pid || '0'
  } else {
    Object.assign(form2, cloneDeep(defaultForm2))
    Object.assign(form, cloneDeep(defaultForm))
    pid.value = id || '0'
  }
  activeStep.value = Number(editDs.value)
  activeApiStep.value = activeStep.value

  visible.value = true
  nextTick(() => {
    isForm2Update = true
    isFormUpdate = true
  })
  if (!!nodeInfo) {
    nextTick(() => {
      currentDsType.value = nodeInfo.type
      activeStep.value = 1
      activeApiStep.value = activeStep.value
      if (!!res) {
        nextTick(() => {
          excel.value.appendReplaceExcel(res)
        })
      }
      nextTick(() => {
        detail?.value?.clearForm()
        excelRemote?.value?.clearForm()
        xpack?.value?.invokeMethod({
          methodName: 'clearForm',
          args: []
        })
      })
    })
  }
}

const drawTitle = computed(() => {
  const { id, editType, creator } = form2
  if (creator && id && currentDsType.value == 'Excel') {
    return editType === 1 ? t('data_source.append_data') : t('data_source.replace_data')
  }
  if (currentDsType.value == 'ExcelRemote') {
    return editDs.value
      ? !form2.id
        ? t('data_source.copy_data_source')
        : t('datasource.modify')
      : t('data_source.create_data_source')
  }
  return editDs.value
    ? !form.id
      ? t('data_source.copy_data_source')
      : t('datasource.modify')
    : t('data_source.create_data_source')
})

const beforeClose = () => {
  if (wsCache.get('ds-new-success')) {
    emits('refresh')
    wsCache.set('ds-new-success', false)
  }
  if (
    !showFinishPage.value &&
    ((!editDs.value && activeStep.value !== 0) || isUpdate) &&
    !(JSON.stringify(form) === JSON.stringify(origin))
  ) {
    ElMessageBox.confirm(t('data_source.want_to_exit'), {
      confirmButtonText: t('dataset.confirm'),
      cancelButtonText: t('common.cancel'),
      showCancelButton: true,
      confirmButtonType: 'primary',
      type: 'warning',
      autofocus: false,
      showClose: false
    }).then(() => {
      visible.value = false
    })
  } else {
    visible.value = false
  }
}

defineExpose({
  init
})
</script>

<template>
  <el-drawer
    :close-on-click-modal="false"
    size="calc(100% - 100px)"
    modal-class="datasource-drawer-fullscreen"
    direction="btt"
    :before-close="beforeClose"
    :show-close="false"
    v-model="visible"
  >
    <template #header="{ close }">
      <span>{{ drawTitle }}</span>
      <div v-if="!editDs" class="flex-center" style="width: 100%">
        <el-steps custom style="max-width: 500px; flex: 1" :active="activeStep" align-center>
          <el-step>
            <template #title>
              {{ t('deDataset.select_data_source') }}
            </template>
          </el-step>
          <el-step>
            <template #title>
              {{ t('data_source.configuration_information') }}
            </template>
          </el-step>
        </el-steps>
      </div>
      <el-icon @click="close" class="datasource-close">
        <Icon name="icon_close_outlined"><icon_close_outlined class="svg-icon" /></Icon>
      </el-icon>
    </template>
    <div class="datasource" v-loading="dsLoading">
      <div class="ds-type-select" v-if="!editDs">
        <div class="title">
          <el-input
            :placeholder="t('chart.search')"
            class="m24 w100"
            v-model="filterText"
            clearable
          >
            <template #prefix>
              <el-icon>
                <Icon name="icon_search-outline_outlined"
                  ><icon_searchOutline_outlined class="svg-icon"
                /></Icon>
              </el-icon>
            </template>
          </el-input>
        </div>
        <template v-if="activeStep === 0">
          <p
            :class="currentType === 'latestUse' && 'active'"
            @click="handleNodeClick({ type: 'latestUse', name: 'latestUse', id: 'latestUse' })"
            class="list-item_primary"
          >
            {{ t('data_source.recently_created') }}
          </p>
          <el-divider />
          <p
            :class="currentType === 'all' && 'active'"
            @click="handleNodeClick({ type: 'all', name: 'all', id: 'all' })"
            class="list-item_primary"
          >
            {{ t('data_source.all') }}
          </p>
          <div
            :key="ele.name"
            @click="handleNodeClick(ele)"
            v-for="ele in state.datasourceTree"
            class="list-item_primary"
            :class="currentType === ele.type && 'active'"
          >
            <span :title="ele.name" class="label">{{ ele.name }}</span>
          </div>
        </template>
        <el-tree
          :expand-on-click-node="false"
          menu
          v-if="activeStep > 0"
          ref="dsTree"
          :data="currentTypeList"
          nodeKey="name"
          :props="defaultProps"
          :filter-node-method="filterNode"
          @node-click="handleDsNodeClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node flex-align-center">
              <el-icon v-if="!!data.catalog" class="icon-border" style="width: 18px; height: 18px">
                <Icon v-if="data['isPlugin']" :static-content="data.icon"></Icon>
                <Icon v-else
                  ><component class="svg-icon" :is="iconDatasourceMap[data.type]"></component
                ></Icon>
              </el-icon>
              <span :title="node.label" class="label-tooltip">{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>
      <div class="ds-editor" :class="editDs && 'edit-ds'">
        <div v-show="activeStep !== 0 && !editDs" class="ds-type-title">
          {{ typeTitle }}
        </div>
        <div class="editor-content" :class="(activeStep === 0 || editDs) && 'type-title'">
          <ds-type-list
            v-show="activeStep === 0"
            :filter-text="filterText.toLocaleLowerCase()"
            @select-ds-type="selectDsType"
            :current-type="currentType"
            :latest-use-types="latestUseTypes"
          ></ds-type-list>
          <editor-detail
            ref="detail"
            :form="form"
            :is-plugin="isPlugin"
            :plugin-ds="pluginDs"
            :plugin-index="pluginIndex"
            :editDs="editDs"
            :active-step="activeApiStep"
            :is-supportSetKey="isSupportSetKey"
            v-if="
              activeStep !== 0 &&
              currentDsType &&
              !currentDsType.startsWith('Excel') &&
              visible &&
              (!isPlugin || currentDsType.startsWith('API'))
            "
          ></editor-detail>
          <plugin-component
            :jsname="getPluginStatic(currentDsType)"
            ref="xpack"
            :form="form"
            :editDs="editDs"
            :active-step="activeApiStep"
            @submitForm="handleSubmit"
            v-if="
              activeStep !== 0 &&
              currentDsType &&
              currentDsType !== 'Excel' &&
              visible &&
              isPlugin &&
              !currentDsType.startsWith('API')
            "
          >
          </plugin-component>
          <template v-if="activeStep !== 0 && currentDsType == 'Excel'">
            <excel-detail
              :editDs="editDs"
              :is-supportSetKey="isSupportSetKey"
              ref="excel"
              :param="form2"
            ></excel-detail>
          </template>
          <template v-if="activeStep !== 0 && currentDsType == 'ExcelRemote'">
            <excel-remote-detail
              :editDs="editDs"
              :is-supportSetKey="isSupportSetKey"
              ref="excelRemote"
              :active-step="activeApiStep"
              :form="form2"
            ></excel-remote-detail>
          </template>
        </div>
      </div>
      <div class="editor-footer">
        <el-button secondary @click="beforeClose"> {{ t('common.cancel') }}</el-button>
        <el-button
          v-show="!(activeStep === 0 || (editDs && activeApiStep <= 1))"
          secondary
          @click="prev"
        >
          {{ t('common.prev') }}</el-button
        >
        <el-button
          v-show="activeStep === 1 && currentDsType !== 'Excel'"
          secondary
          @click="validateDS"
        >
          {{ t('datasource.validate') }}</el-button
        >
        <el-button
          v-show="
            (activeStep === 0 &&
              !currentDsType.startsWith('API') &&
              currentDsType !== 'ExcelRemote') ||
            (activeApiStep !== 2 &&
              (currentDsType.startsWith('API') || currentDsType === 'ExcelRemote'))
          "
          type="primary"
          @click="next"
        >
          {{ t('common.next') }}</el-button
        >
        <el-button
          v-show="
            (activeStep === 1 &&
              !currentDsType.startsWith('API') &&
              currentDsType !== 'ExcelRemote') ||
            (activeApiStep === 2 &&
              (currentDsType.startsWith('API') || currentDsType === 'ExcelRemote'))
          "
          type="primary"
          @click="saveDS"
        >
          {{ t('common.save') }}</el-button
        >
      </div>
      <FinishPage
        @continue-creating="continueCreating"
        @back-to-datasource-list="backToDatasourceList"
        @create-dataset="createDataset"
        :name="dsInfo.name"
        v-if="showFinishPage"
      ></FinishPage>

      <XpackComponent
        jsname="L2NvbXBvbmVudC9wbHVnaW5zLWhhbmRsZXIvRHNDYXRlZ29yeUhhbmRsZXI="
        @load-ds-plugin="loadDsPlugin"
      />
    </div>
  </el-drawer>
  <creat-ds-group
    @handle-show-finish-page="handleShowFinishPage"
    @finish="complete"
    ref="creatDsFolder"
  ></creat-ds-group>
</template>

<style lang="less">
.datasource-drawer-fullscreen {
  z-index: 1000 !important;

  .ed-drawer__body {
    padding: 0;
  }

  .ed-drawer__header > :first-child {
    flex: none;
    width: auto;
  }

  .ed-drawer__header {
    border-color: rgba(31, 35, 41, 0.15);
    justify-content: space-between;
  }

  .datasource-close {
    cursor: pointer;
  }
  .editor-step {
    position: relative;
    .ed-steps {
      width: 500px;
    }
    .ed-step.is-center .ed-step__line {
      width: 80px;
      right: 40px;
      z-index: 5;
      left: calc(100% - 40px);
    }

    .ed-step__icon.is-icon {
      width: auto;
      position: relative;
      z-index: 0;
    }

    .ed-step__head.is-finish::after {
      right: calc(100% - 66px);
      top: 44%;
    }

    .ed-step__head.is-process .ed-step__icon {
      background-color: transparent;
      .step-icon {
        .icon {
          background: var(--ed-color-primary);
        }
      }
    }

    .ed-step__head.is-finish .ed-step__icon {
      background-color: transparent;
      .step-icon {
        .icon {
          border: 1px solid var(--ed-color-primary);
        }
      }
    }

    .ed-step__head.is-wait .ed-step__icon {
      background-color: transparent;
      .step-icon {
        .icon {
          color: #8f959e;
          border: 1px solid #8f959e;
        }
      }
    }

    .step-icon {
      display: flex;
      padding: 0 48px;
      align-items: center;
      .icon {
        width: 28px;
        height: 28px;
        line-height: 27px;
        border-radius: 50%;
      }
      .title {
        margin-left: 8px;
        color: #1f2329;
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
      }
    }
  }
  .datasource {
    width: 100%;
    height: 100%;
    background: #fff;
    position: relative;

    .custom-tree-node {
      .ed-icon {
        margin-right: 8px;
      }
    }
    .ds-type-select {
      width: 279px;
      height: calc(100% - 64px);
      padding: 16px 7px;
      border-right: 1px solid rgba(31, 35, 41, 0.15);
      float: left;
      overflow-y: auto;

      .icon-border {
        font-size: 18px;
        margin-right: 8px;
      }
      .title {
        display: flex;
        justify-content: space-between;
        font-family: var(--de-custom_font, 'PingFang');
        font-size: 14px;
        font-weight: 500;
        color: var(--TextPrimary, #1f2329);
        box-sizing: border-box;
        flex-wrap: wrap;
        position: sticky;
        top: 0;
        left: 24px;
        z-index: 5;
        background: white;
        padding: 0 17px;
        &::before {
          content: '';
          width: 100%;
          height: 24px;
          top: -24px;
          position: absolute;
          z-index: 5;
          left: 0;
          background: white;
        }
      }
      .ed-divider--horizontal {
        margin: 4px 0 4px 16px;
        width: calc(100% - 34px);
        border-color: rgba(31, 35, 41, 0.15);
      }

      .m24 {
        margin-bottom: 8px;
      }
      .w100 {
        width: 100%;
      }
      .list-item_primary {
        position: relative;
        padding: 8px 17px;
        font-weight: 500;
        font-size: 14px;
      }
    }
    .ds-editor {
      float: left;
      width: calc(100% - 279px);
      height: calc(100% - 64px);

      &.edit-ds {
        width: 100%;
      }

      .ds-type-title {
        width: 100%;
        padding: 16px 24px;
        color: #1f2329;
        font-family: var(--de-custom_font, 'PingFang');
        font-size: 16px;
        font-style: normal;
        font-weight: 500;
        line-height: 24px;
        border-bottom: 1px solid rgba(31, 35, 41, 0.15);
      }

      .editor-content {
        padding: 16px 24px;
        height: calc(100vh - 278px);
        overflow-y: auto;

        &.type-title {
          height: calc(100vh - 221px);
        }
      }
    }
    .editor-footer {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
      padding-right: 24px;
      float: left;
      border-top: 1px solid rgba(31, 35, 41, 0.15);
      position: relative;
      z-index: 10;
      background: #fff;
    }
  }
}
</style>
