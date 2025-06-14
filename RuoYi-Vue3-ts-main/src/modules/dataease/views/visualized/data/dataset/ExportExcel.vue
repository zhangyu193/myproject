<script lang="ts" setup>
import dvPreviewDownload from '@de/assets/svg/icon_download_outlined.svg'
import deDelete from '@de/assets/svg/de-delete.svg'
import icon_fileExcel_colorful from '@de/assets/svg/icon_file-excel_colorful.svg'
import icon_refresh_outlined from '@de/assets/svg/icon_refresh_outlined.svg'
import { ref, h, onUnmounted, computed, reactive } from 'vue'
import { EmptyBackground } from '@de/components/empty-background'
import { ElButton, ElMessage, ElMessageBox, ElTabPane, ElTabs } from 'element-plus-secondary'
import { RefreshLeft } from '@element-plus/icons-vue'
import {
  exportTasks,
  exportRetry,
  exportDelete,
  exportDeleteAll,
  exportDeletePost,
  exportTasksRecords,
  generateDownloadUri
} from '@de/api/dataset'
import { useI18n } from '@de/hooks/web/useI18n'
import { useEmitt } from '@de/hooks/web/useEmitt'
import Icon from '@de/components/icon-custom/src/Icon.vue'
import { useCache } from '@de/hooks/web/useCache'
import { useLinkStoreWithOut } from '@de/store/modules/link'
import { useAppStoreWithOut } from '@de/store/modules/app'

const { t } = useI18n()
const state = reactive({
  paginationConfig: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  }
})
const tableData = ref([])
const drawerLoading = ref(false)
const drawer = ref(false)
const msgDialogVisible = ref(false)
const msg = ref('')
const activeName = ref('ALL')
const multipleSelection = ref([])
const description = ref(t('data_set.no_tasks_yet'))
const tabList = ref([
  {
    label: t('data_set.exporting') + '(0)',
    name: 'IN_PROGRESS'
  },
  {
    label: t('data_set.success') + '(0)',
    name: 'SUCCESS'
  },
  {
    label: t('data_set.fail') + '(0)',
    name: 'FAILED'
  },
  {
    label: t('data_set.waiting') + '(0)',
    name: 'PENDING'
  },
  {
    label: t('data_set.all') + '(0)',
    name: 'ALL'
  }
])
let timer
const handleClose = () => {
  drawer.value = false
  clearInterval(timer)
}
const { wsCache } = useCache()
const openType = wsCache.get('open-backend') === '1' ? '_self' : '_blank'
const desktop = wsCache.get('app.desktop')

onUnmounted(() => {
  clearInterval(timer)
})
const handleClick = tab => {
  if (tab) {
    activeName.value = tab.paneName
  }
  if (activeName.value === 'ALL') {
    description.value = t('data_export.no_file')
  } else if (activeName.value === 'FAILED') {
    description.value = t('data_export.no_failed_file')
  } else {
    description.value = t('data_export.no_task')
  }
  drawerLoading.value = true
  exportTasksRecords().then(res => {
    tabList.value.forEach(item => {
      if (item.name === 'ALL') {
        item.label = t('data_set.all') + '(' + res.data.ALL + ')'
      }
      if (item.name === 'IN_PROGRESS') {
        item.label = t('data_set.exporting') + '(' + res.data.IN_PROGRESS + ')'
      }
      if (item.name === 'SUCCESS') {
        item.label = t('data_set.success') + '(' + res.data.SUCCESS + ')'
      }
      if (item.name === 'FAILED') {
        item.label = t('data_set.fail') + '(' + res.data.FAILED + ')'
      }
      if (item.name === 'PENDING') {
        item.label = t('data_set.waiting') + '(' + res.data.PENDING + ')'
      }
    })
  })
  exportTasks(state.paginationConfig.currentPage, state.paginationConfig.pageSize, activeName.value)
    .then(res => {
      state.paginationConfig.total = res.data.total
      tableData.value = res.data.records
    })
    .finally(() => {
      drawerLoading.value = false
    })
}

const init = params => {
  drawer.value = true
  if (params && params.activeName !== undefined) {
    activeName.value = params.activeName
  }
  handleClick()
  timer = setInterval(() => {
    if (activeName.value === 'IN_PROGRESS') {
      exportTasksRecords().then(res => {
        tabList.value.forEach(item => {
          if (item.name === 'ALL') {
            item.label = t('data_set.all') + '(' + res.data.ALL + ')'
          }
          if (item.name === 'IN_PROGRESS') {
            item.label = t('data_set.exporting') + '(' + res.data.IN_PROGRESS + ')'
          }
          if (item.name === 'SUCCESS') {
            item.label = t('data_set.success') + '(' + res.data.SUCCESS + ')'
          }
          if (item.name === 'FAILED') {
            item.label = t('data_set.fail') + '(' + res.data.FAILED + ')'
          }
          if (item.name === 'PENDING') {
            item.label = t('data_set.waiting') + '(' + res.data.PENDING + ')'
          }
        })
      })
      exportTasks(
        state.paginationConfig.currentPage,
        state.paginationConfig.pageSize,
        activeName.value
      ).then(res => {
        state.paginationConfig.total = res.data.total
        tableData.value = res.data.records
      })
    }
  }, 5000)
}
const linkStore = useLinkStoreWithOut()
const appStore = useAppStoreWithOut()
const isDataEaseBi = computed(() => appStore.getIsDataEaseBi)

const taskExportTopicCall = task => {
  if (!linkStore.getLinkToken && !isDataEaseBi.value && !appStore.getIsIframe) {
    if (JSON.parse(task).exportStatus === 'SUCCESS') {
      openMessageLoading(
        JSON.parse(task).exportFromName + ` ${t('data_set.successful_go_to')}`,
        'success',
        callbackExportSuc
      )
      return
    }
    if (JSON.parse(task).exportStatus === 'FAILED') {
      openMessageLoading(
        JSON.parse(task).exportFromName + ` ${t('data_set.failed_go_to')}`,
        'error',
        callbackExportError
      )
    }
  }
}

const openMessageLoading = (text, type = 'success', cb) => {
  // success error loading
  const customClass = `de-message-${type || 'success'} de-message-export`
  ElMessage({
    message: h('p', null, [
      h(
        'span',
        {
          title: t(text),
          class: 'ellipsis m50-export'
        },
        t(text)
      ),
      h(
        ElButton,
        {
          text: true,
          size: 'small',
          class: 'btn-text',
          onClick: () => {
            cb()
          }
        },
        t('data_export.export_center')
      )
    ]),
    icon: type === 'loading' ? h(RefreshLeft) : '',
    type,
    showClose: true,
    customClass
  })
}

const callbackExportError = () => {
  useEmitt().emitter.emit('data-export-center', { activeName: 'FAILED' })
}

const callbackExportSuc = () => {
  useEmitt().emitter.emit('data-export-center', { activeName: 'SUCCESS' })
}

const downLoadAll = () => {
  if (multipleSelection.value.length === 0) {
    tableData.value.forEach(item => {
      generateDownloadUri(item.id).then(() => {
        window.open(PATH_URL + '/exportCenter/download/' + item.id)
      })
    })
    return
  }
  multipleSelection.value.map(ele => {
    generateDownloadUri(ele.id).then(() => {
      window.open(PATH_URL + '/exportCenter/download/' + ele.id)
    })
  })
}
const showMsg = item => {
  msg.value = ''
  msg.value = item.msg
  msgDialogVisible.value = true
}
const timestampFormatDate = value => {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString()
}
import { PATH_URL } from '@de/config/axios/service'
import GridTable from '../../../../components/grid-table/src/GridTable.vue'
const downloadClick = item => {
  generateDownloadUri(item.id).then(() => {
    window.open(PATH_URL + '/exportCenter/download/' + item.id, openType)
  })
}

const retry = item => {
  exportRetry(item.id).then(() => {
    handleClick()
  })
}

const deleteField = item => {
  ElMessageBox.confirm(t('data_export.sure_del'), {
    confirmButtonType: 'danger',
    type: 'warning',
    autofocus: false,
    showClose: false
  })
    .then(() => {
      exportDelete(item.id).then(() => {
        ElMessage.success(t('commons.delete_success'))
        handleClick()
      })
    })
    .catch(() => {
      //   info(t('commons.delete_cancel'))
    })
}

const handleSelectionChange = val => {
  multipleSelection.value = val
}

const pageChange = index => {
  if (typeof index !== 'number') {
    return
  }
  state.paginationConfig.currentPage = index
  handleClick()
}
const sizeChange = size => {
  state.paginationConfig.currentPage = 1
  state.paginationConfig.pageSize = size
  handleClick()
}

const delAll = () => {
  if (multipleSelection.value.length === 0) {
    ElMessageBox.confirm(t('data_export.sure_del_all'), {
      confirmButtonType: 'danger',
      type: 'warning',
      autofocus: false,
      showClose: false
    })
      .then(() => {
        exportDeleteAll(
          activeName.value,
          multipleSelection.value.map(ele => ele.id)
        ).then(() => {
          ElMessage.success(t('commons.delete_success'))
          handleClick()
        })
      })
      .catch(() => {
        // info(t('commons.delete_cancel'))
      })
    return
  }

  ElMessageBox.confirm(t('data_export.sure_del'), {
    confirmButtonType: 'danger',
    type: 'warning',
    autofocus: false,
    showClose: false
  })
    .then(() => {
      exportDeletePost(multipleSelection.value.map(ele => ele.id)).then(() => {
        ElMessage.success(t('commons.delete_success'))
        handleClick()
      })
    })
    .catch(() => {
      //   info(t('commons.delete_cancel'))
    })
}

useEmitt({ name: 'task-export-topic-call', callback: taskExportTopicCall })

defineExpose({
  init
})
</script>

<template>
  <el-drawer
    v-loading="drawerLoading"
    modal-class="de-export-excel"
    :title="$t('data_export.export_center')"
    v-model="drawer"
    direction="rtl"
    size="1000px"
    append-to-body
    :before-close="handleClose"
  >
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="tab in tabList" :key="tab.name" :label="tab.label" :name="tab.name" />
    </el-tabs>
    <el-button
      v-if="activeName === 'SUCCESS' && multipleSelection.length === 0"
      secondary
      @click="downLoadAll"
    >
      <template #icon>
        <Icon name="dv-preview-download"><dvPreviewDownload class="svg-icon" /></Icon>
      </template>
      {{ $t('data_export.download_all') }}
    </el-button>
    <el-button
      v-if="activeName === 'SUCCESS' && multipleSelection.length !== 0"
      secondary
      @click="downLoadAll"
    >
      <template #icon>
        <Icon name="dv-preview-download"><dvPreviewDownload class="svg-icon" /></Icon>
      </template>
      {{ $t('data_export.download') }}
    </el-button>
    <el-button v-if="multipleSelection.length === 0" secondary @click="delAll"
      ><template #icon>
        <Icon name="de-delete"><deDelete class="svg-icon" /></Icon> </template
      >{{ $t('data_export.del_all') }}
    </el-button>
    <el-button v-if="multipleSelection.length !== 0" secondary @click="delAll"
      ><template #icon>
        <Icon name="de-delete"><deDelete class="svg-icon" /></Icon> </template
      >{{ $t('commons.delete') }}
    </el-button>
    <div class="table-container" :class="!tableData.length && 'hidden-bottom'">
      <GridTable
        ref="multipleTable"
        :pagination="state.paginationConfig"
        :table-data="tableData"
        class="popper-max-width"
        @current-change="pageChange"
        @size-change="sizeChange"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="fileName" :label="$t('driver.file_name')" width="332">
          <template #default="scope">
            <div class="name-excel">
              <el-icon style="font-size: 24px">
                <Icon name="icon_file-excel_colorful"
                  ><icon_fileExcel_colorful class="svg-icon"
                /></Icon>
              </el-icon>
              <div class="name-content">
                <div class="fileName">{{ scope.row.fileName }}</div>
                <div
                  v-if="scope.row.exportStatus === 'FAILED'"
                  class="failed"
                  @click="showMsg(scope.row)"
                >
                  {{ $t('data_export.export_failed') }}
                </div>
                <div v-if="scope.row.exportStatus === 'SUCCESS'" class="success">
                  {{ scope.row.fileSize }}{{ scope.row.fileSizeUnit }}
                </div>
              </div>
            </div>
            <div v-if="scope.row.exportStatus === 'FAILED'" class="red-line" />
            <el-progress
              v-if="scope.row.exportStatus === 'IN_PROGRESS'"
              :percentage="+scope.row.exportProgress"
            />
          </template>
        </el-table-column>
        <el-table-column prop="exportFromName" :label="$t('data_export.export_obj')" width="200" />
        <el-table-column prop="exportTime" width="180" :label="$t('data_export.export_time')">
          <template #default="scope">
            <span>{{ timestampFormatDate(scope.row.exportTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="exportFromType" width="120" :label="$t('data_export.export_from')">
          <template #default="scope">
            <span v-if="scope.row.exportFromType === 'dataset'">{{ t('data_set.data_set') }}</span>
            <span v-if="scope.row.exportFromType === 'chart'">{{ t('data_set.view') }}</span>
            <span v-if="scope.row.exportFromType === 'data_filling'">{{
              t('data_fill.data_fill')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!desktop"
          prop="orgName"
          :label="t('data_set.organization')"
          width="200"
        />
        <el-table-column fixed="right" prop="operate" width="90" :label="$t('commons.operating')">
          <template #default="scope">
            <el-tooltip effect="dark" :content="t('data_set.download')" placement="top">
              <el-button
                v-if="scope.row.exportStatus === 'SUCCESS'"
                text
                @click="downloadClick(scope.row)"
              >
                <template #icon>
                  <el-icon>
                    <Icon name="dv-preview-download"><dvPreviewDownload class="svg-icon" /></Icon>
                  </el-icon>
                </template>
              </el-button>
            </el-tooltip>

            <el-tooltip effect="dark" :content="t('data_set.re_export')" placement="top">
              <el-button v-if="scope.row.exportStatus === 'FAILED'" text @click="retry(scope.row)">
                <template #icon>
                  <Icon name="icon_refresh_outlined"
                    ><icon_refresh_outlined class="svg-icon"
                  /></Icon>
                </template>
              </el-button>
            </el-tooltip>

            <el-tooltip effect="dark" :content="t('data_set.delete')" placement="top">
              <el-button text @click="deleteField(scope.row)">
                <template #icon>
                  <Icon name="de-delete"><deDelete class="svg-icon" /></Icon>
                </template>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <template #empty>
          <empty-background :description="description" img-type="noneWhite" />
        </template>
      </GridTable>
    </div>
  </el-drawer>

  <el-dialog :title="t('data_set.reason_for_failure')" v-model="msgDialogVisible" width="30%">
    <span>{{ msg }}</span>
    <template v-slot:footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="msgDialogVisible = false">{{
          t('data_set.closure')
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="less">
.de-export-excel {
  .ed-drawer__body {
    padding-bottom: 24px;
  }
  .ed-drawer__header {
    border-bottom: none;
  }
  .ed-tabs {
    margin-top: -25px;
    .ed-tabs__header {
      margin-bottom: 24px;
    }
  }

  .table-container {
    margin-top: 16px;
    height: calc(100vh - 190px);

    .ed-table .cell {
      padding-left: 12px;
      padding-right: 12px;
    }

    &.hidden-bottom {
      .ed-table::before {
        display: none;
      }
    }

    .name-excel {
      display: flex;
      align-items: center;
      .name-content {
        max-width: 280px;
        margin-left: 4px;
        .fileName {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          width: 100%;
          font-size: 14px;
          font-weight: 400;
          line-height: 22px;
        }

        .failed {
          font-size: 12px;
          font-weight: 400;
          line-height: 20px;
          color: #f54a45;
          cursor: pointer;
        }

        .success {
          font-size: 12px;
          font-weight: 400;
          line-height: 20px;
          color: #8f959e;
        }
      }
    }

    .ed-table__header {
      border-top: 1px solid #1f232926;
    }

    th.ed-table__cell.is-leaf {
      border-color: #1f232926;
    }

    .red-line {
      width: 100%;
      height: 4px;
      background: #f54a45;
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }
}
</style>
