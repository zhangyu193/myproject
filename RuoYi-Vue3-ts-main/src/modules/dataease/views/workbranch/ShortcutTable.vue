<script lang="ts" setup>
import icon_collection_outlined from '@de/assets/svg/icon_collection_outlined.svg'
import visualStar from '@de/assets/svg/visual-star.svg'
import icon_searchOutline_outlined from '@de/assets/svg/icon_search-outline_outlined.svg'
import icon_app_outlined from '@de/assets/svg/icon_app_outlined.svg'
import icon_dashboard_outlined from '@de/assets/svg/icon_dashboard_outlined.svg'
import icon_database_outlined from '@de/assets/svg/icon_database_outlined.svg'
import icon_operationAnalysis_outlined from '@de/assets/svg/icon_operation-analysis_outlined.svg'
import dvDashboardSpineMobile from '@de/assets/svg/dv-dashboard-spine-mobile.svg'
import icon_pc_outlined from '@de/assets/svg/icon_pc_outlined.svg'
import dvDashboardSpineMobileDisabled from '@de/assets/svg/dv-dashboard-spine-mobile-disabled.svg'
import { useI18n } from '@de/hooks/web/useI18n'
import { ref, reactive, onMounted, computed, watch } from 'vue'
import type { TabsPaneContext } from 'element-plus-secondary'
import GridTable from '@de/components/grid-table/src/GridTable.vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { shortcutOption } from './ShortcutOption'
import { interactiveStoreWithOut } from '@de/store/modules/interactive'
import { storeApi } from '@de/api/visualization/dataVisualization'
import { useCache } from '@de/hooks/web/useCache'
import { useUserStoreWithOut } from '@de/store/modules/user'
import ShareGrid from '@de/views/share/share/ShareGrid.vue'
import ShareHandler from '@de/views/share/share/ShareHandler.vue'
import { useAppStoreWithOut } from '@de/store/modules/app'
import { useEmbedded } from '@de/store/modules/embedded'
import { XpackComponent } from '@de/components/plugin'
const userStore = useUserStoreWithOut()
const { resolve } = useRouter()
const { t } = useI18n()
const interactiveStore = interactiveStoreWithOut()
const { wsCache } = useCache()
const appStore = useAppStoreWithOut()
const embeddedStore = useEmbedded()

import { useShareStoreWithOut } from '@de/store/modules/share'
import { cloneDeep } from 'lodash-es'
const shareStore = useShareStoreWithOut()
const { push } = useRouter()
defineProps({
  expand: {
    type: Boolean,
    default: false
  }
})
const desktop = wsCache.get('app.desktop')
const panelKeyword = ref()
const activeName = ref('recent')
const activeCommand = ref('all_types')
const state = reactive({
  tableData: [],
  curTypeList: [],
  tableColumn: []
})
const busiDataMap = computed(() => interactiveStore.getData)
const shareDisable = computed(() => {
  return shareStore.getShareDisable || desktop
})
const iconMap = {
  panel: icon_dashboard_outlined,
  panelMobile: dvDashboardSpineMobile,
  dashboard: icon_dashboard_outlined,
  dashboardMobile: dvDashboardSpineMobile,
  dashboardMobileDisabled: dvDashboardSpineMobileDisabled,
  screen: icon_operationAnalysis_outlined,
  dataV: icon_operationAnalysis_outlined,
  dataset: icon_app_outlined,
  datasource: icon_database_outlined
}

const jumpActiveCheck = row => {
  return row && ['dashboard', 'panel', 'dataV', 'screen'].includes(row.type)
}

const handleClick = (ele: TabsPaneContext) => {
  if (ele.paneName === 'recent' || ele.paneName === 'store') {
    loading.value = true
    shortcutOption.setBusiFlag(ele.paneName)
    state.curTypeList = shortcutOption
      .getBusiList()
      .filter(busi => busi === 'all_types' || busiAuthList.includes(busi))
    state.tableColumn = shortcutOption.getColmunList()
    loadTableData()
  }
}
const getBusiListWithPermission = () => {
  const baseFlagList = ['panel', 'screen', 'dataset', 'datasource']
  const busiFlagList = []
  for (const key in busiDataMap.value) {
    if (busiDataMap.value[key].menuAuth) {
      busiFlagList.push(baseFlagList[parseInt(key)])
    }
  }
  baseTablePaneList.value[0].disabled = !busiFlagList?.length
  baseTablePaneList.value[1].disabled =
    !busiFlagList.includes('panel') && !busiFlagList.includes('screen')
  return busiFlagList
}
const triggerFilterPanel = () => {
  loadTableData()
}
const openType = wsCache.get('open-backend') === '1' ? '_self' : '_blank'
const preview = (id, disabled = false) => {
  if (!disabled) {
    const routeUrl = resolve({
      path: '/preview',
      query: { dvId: id }
    })
    window.open(routeUrl.href, '_blank')
  }
}

const openDataset = id => {
  const routeUrl = resolve({
    path: '/dataset-form',
    query: { id: id }
  })
  window.open(routeUrl.href, openType)
}
const formatterTime = (_, _column, cellValue) => {
  return dayjs(new Date(cellValue)).format('YYYY-MM-DD HH:mm:ss')
}

const typeMap = {
  screen: t('work_branch.big_data_screen'),
  dataV: t('work_branch.big_data_screen'),
  dashboard: t('work_branch.dashboard'),
  panel: t('work_branch.dashboard'),
  dataset: t('work_branch.data_set'),
  datasource: t('work_branch.data_source')
}

const loadTableData = () => {
  loading.value = true
  const queryType = activeCommand.value === 'all_types' ? '' : activeCommand.value
  shortcutOption
    .loadData({ type: queryType, keyword: panelKeyword.value, asc: !orderDesc.value })
    .then(res => {
      state.tableData = res.data
    })
    .finally(() => {
      imgType.value = getEmptyImg()
      emptyDesc.value = getEmptyDesc()
      loading.value = false
    })
}

const baseTablePaneList = ref([
  { title: t('work_branch.recently_used'), name: 'recent', disabled: false },
  { title: t('work_branch.my_collection'), name: 'store', disabled: false },
  { title: t('visualization.share_out'), name: 'share', disabled: false }
])

const dfTablePaneList = ref([])

const loadedDataFilling = data => {
  dfTablePaneList.value.push(data)
}

const busiAuthList = getBusiListWithPermission()

const tablePaneList = computed(() => {
  const list = cloneDeep(!!busiAuthList.length ? baseTablePaneList.value : [])
  for (const valueElement of dfTablePaneList.value) {
    list.push(valueElement)
  }
  return list
})

const firstChangeActiveName = ref(false)

watch(
  () => tablePaneList.value.length,
  () => {
    if (tablePaneList.value.length > 0 && !firstChangeActiveName.value) {
      firstChangeActiveName.value = true
      activeName.value = tablePaneList.value[0].name
    }
  }
)

onMounted(() => {
  !!busiAuthList.length &&
    handleClick({
      paneName: 'recent',
      uid: 0,
      slots: undefined,
      props: undefined,
      active: false,
      index: '',
      isClosable: false
    })
})
const orderDesc = ref(true)
const loading = ref(false)
const sortChange = param => {
  orderDesc.value = true
  const type = param.order.substring(0, param.order.indexOf('ending'))
  orderDesc.value = type === 'desc'
  loadTableData()
}

const handleCellClick = row => {
  if (row && !checkDisabled(row)) {
    const sourceId = activeName.value === 'recent' ? row.id : row.resourceId
    if (['dashboard', 'panel'].includes(row.type)) {
      window.open('#/panel/index?dvId=' + sourceId, '_self')
    } else if (['dataV', 'screen'].includes(row.type)) {
      window.open('#/screen/index?dvId=' + sourceId, '_self')
    } else if (['dataset'].includes(row.type)) {
      const routeName =
        embeddedStore.getToken && appStore.getIsIframe ? 'dataset-embedded' : 'dataset'
      push({
        name: routeName,
        params: {
          id: sourceId
        }
      })
    } else if (['datasource'].includes(row.type)) {
      push({
        name: 'datasource',
        params: {
          id: sourceId
        }
      })
    }
  }
}

const setLoading = (val: boolean) => {
  loading.value = val
}

const executeStore = rowInfo => {
  const param = {
    id: rowInfo.id,
    type: rowInfo.type
  }
  storeApi(param).then(() => {
    rowInfo.favorite = !rowInfo.favorite
  })
}

const checkDisabled = row => {
  return activeName.value === 'store' && !row.extFlag1
}

const executeCancelStore = rowInfo => {
  if (!checkDisabled(rowInfo)) {
    const param = {
      id: rowInfo.resourceId,
      type: rowInfo.type === 'dataV' ? 'screen' : 'panel'
    }
    storeApi(param).then(() => {
      loadTableData()
    })
  }
}

const imgType = ref()
const emptyDesc = ref('')
const getEmptyImg = (): string => {
  if (panelKeyword.value) {
    return 'tree'
  }
  return 'noneWhite'
}

const getEmptyDesc = (): string => {
  if (panelKeyword.value) {
    return t('work_branch.relevant_content_found')
  }
  if (activeName.value === 'recent') {
    return t('work_branch.no_content_yet')
  }
  if (activeName.value === 'store') {
    return t('work_branch.no_favorites_yet')
  }
  return ''
}
</script>

<template>
  <div
    class="dashboard-type"
    :class="expand && 'expand'"
    v-if="tablePaneList.length"
    v-loading="loading"
  >
    <el-tabs v-model="activeName" class="dashboard-type-tabs" @tab-click="handleClick">
      <el-tab-pane
        v-for="item in tablePaneList.filter(panel => !shareDisable || panel.name !== 'share')"
        :key="item.name"
        :disabled="item.disabled"
        :label="item.title"
        :name="item.name"
      >
        <template #label>
          <span class="custom-tabs-label">
            <el-tooltip
              placement="top"
              v-if="item.disabled"
              :content="t('work_branch.permission_denied')"
            >
              <span>{{ item.title }}</span>
            </el-tooltip>
            <span v-else>{{ item.title }}</span>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
    <template v-if="busiAuthList.length">
      <share-grid v-if="!shareDisable" :active-name="activeName" @set-loading="setLoading" />
      <el-row v-if="activeName === 'recent' || activeName === 'store'">
        <el-col :span="12">
          <el-select
            popper-class="menu-panel-select_popper"
            class="select-type-list"
            v-model="activeCommand"
            @change="loadTableData"
          >
            <el-option
              v-for="item in state.curTypeList"
              :key="item"
              :label="t(`auth.${item}`)"
              :value="item"
            />
          </el-select>
        </el-col>
        <el-col class="search" :span="12">
          <el-input
            v-model="panelKeyword"
            clearable
            @change="triggerFilterPanel"
            :placeholder="t('work_branch.search_keyword')"
          >
            <template #prefix>
              <el-icon>
                <Icon name="icon_search-outline_outlined"
                  ><icon_searchOutline_outlined class="svg-icon"
                /></Icon>
              </el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
      <div v-if="activeName === 'recent' || activeName === 'store'" class="panel-table">
        <GridTable
          :show-pagination="false"
          :table-data="state.tableData"
          @sort-change="sortChange"
          @cell-click="handleCellClick"
          :empty-desc="emptyDesc"
          :empty-img="imgType"
          class="workbranch-grid"
        >
          <el-table-column key="name" width="280" prop="name" :label="t('common.name')">
            <template v-slot:default="scope">
              <div class="name-content" :class="{ 'jump-active': jumpActiveCheck(scope.row) }">
                <el-icon v-if="scope.row.extFlag" style="margin-right: 12px; font-size: 18px">
                  <Icon
                    ><component
                      class="svg-icon"
                      :is="
                        iconMap[
                          scope.row.type + 'Mobile' + (checkDisabled(scope.row) ? 'Disabled' : '')
                        ]
                      "
                    ></component
                  ></Icon>
                </el-icon>
                <el-icon
                  v-else
                  :class="`main-color color-${scope.row.type} custom-color${
                    checkDisabled(scope.row) ? '-disabled' : ''
                  }`"
                >
                  <Icon
                    ><component class="svg-icon" :is="iconMap[scope.row.type]"></component
                  ></Icon>
                </el-icon>
                <el-tooltip placement="top">
                  <template #content>{{ scope.row.name }}</template>
                  <span
                    class="ellipsis"
                    :class="{ 'color-disabled': checkDisabled(scope.row) }"
                    style="max-width: 250px"
                    >{{ scope.row.name }}</span
                  >
                </el-tooltip>
                <el-icon
                  v-if="activeName === 'recent' && ['screen', 'panel'].includes(scope.row.type)"
                  class="custom-icon"
                  @click.stop="executeStore(scope.row)"
                  :style="{ color: scope.row.favorite ? '#FFC60A' : '#646A73' }"
                >
                  <icon
                    ><component
                      :is="scope.row.favorite ? visualStar : icon_collection_outlined"
                    ></component
                  ></icon>
                </el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-for="item in state.tableColumn"
            :key="item.label"
            :prop="item.field"
            show-overflow-tooltip
            :sortable="item.type === 'time'"
            :label="item.label"
          >
            <template #default="scope">
              <span :class="{ 'jump-active': jumpActiveCheck(scope.row) }">
                <span v-if="item.type && item.type === 'time'">{{
                  formatterTime(null, null, scope.row[item.field])
                }}</span>
                <span v-else-if="item.field && item.field === 'type'">{{
                  typeMap[scope.row[item.field]]
                }}</span>
                <span v-else-if="desktop && item.field && item.field.endsWith('tor')">{{
                  userStore.getName
                }}</span>
                <span v-else>{{ scope.row[item.field] }}</span>
              </span>
            </template>
          </el-table-column>

          <el-table-column width="100" fixed="right" key="_operation" :label="$t('common.operate')">
            <template #default="scope">
              <div
                style="display: flex; flex-direction: row; align-items: center"
                :class="{ 'opt-disabled': checkDisabled(scope.row) }"
              >
                <template v-if="['dashboard', 'dataV', 'panel', 'screen'].includes(scope.row.type)">
                  <el-tooltip
                    effect="dark"
                    :content="t('work_branch.new_page_preview')"
                    :disabled="checkDisabled(scope.row)"
                    placement="top"
                  >
                    <el-icon
                      class="hover-icon hover-icon-in-table"
                      @click.stop="
                        preview(
                          activeName === 'recent' ? scope.row.id : scope.row.resourceId,
                          checkDisabled(scope.row)
                        )
                      "
                    >
                      <Icon name="icon_pc_outlined"><icon_pc_outlined class="svg-icon" /></Icon>
                    </el-icon>
                  </el-tooltip>
                  <ShareHandler
                    v-if="!shareDisable"
                    :in-grid="true"
                    :disabled="checkDisabled(scope.row)"
                    :weight="scope.row.weight"
                    :resource-id="activeName === 'recent' ? scope.row.id : scope.row.resourceId"
                    :resource-type="scope.row.type"
                  />
                  <el-tooltip
                    v-if="activeName === 'store'"
                    effect="dark"
                    :disabled="checkDisabled(scope.row)"
                    :content="t('work_branch.cancel_favorites')"
                    placement="top"
                  >
                    <el-icon
                      class="hover-icon hover-icon-in-table"
                      @click.stop="executeCancelStore(scope.row)"
                    >
                      <Icon name="icon_cancel_store"><visualStar class="svg-icon" /></Icon>
                    </el-icon>
                  </el-tooltip>
                </template>

                <template v-if="['dataset'].includes(scope.row.type)">
                  <el-tooltip
                    effect="dark"
                    :content="t('work_branch.open_dataset')"
                    placement="top"
                  >
                    <el-icon
                      class="hover-icon hover-icon-in-table"
                      @click.stop="
                        openDataset(activeName === 'recent' ? scope.row.id : scope.row.resourceId)
                      "
                    >
                      <Icon name="icon_pc_outlined"><icon_pc_outlined class="svg-icon" /></Icon>
                    </el-icon>
                  </el-tooltip>
                </template>
              </div>
            </template>
          </el-table-column>
        </GridTable>
      </div>
    </template>
    <XpackComponent
      jsname="L21lbnUvZGF0YS9kYXRhLWZpbGxpbmcvZmlsbC9UYWJQYW5lVGFibGU="
      v-if="activeName === 'data-filling'"
    />
  </div>
  <el-empty
    class="dashboard-type"
    v-else
    :description="t('work_branch.administrator_for_authorization')"
  />
  <XpackComponent
    jsname="L21lbnUvZGF0YS9kYXRhLWZpbGxpbmcvZmlsbC9UYWJQYW5l"
    @loaded="loadedDataFilling"
  />
</template>

<style lang="less" scoped>
.dashboard-type {
  padding: 8px 24px 0 24px;
  background: #fff;
  border-radius: 4px;
  height: calc(100% - 280px);
  margin-top: 16px;

  .select-type-list {
    width: 120px;
    :deep(.ed-input__wrapper) {
      padding-left: 11px;
      padding-right: 11px;
    }
  }

  &.expand {
    height: calc(100% - 89px);
  }

  .type-button {
    background-color: #fff;

    &:hover,
    &:active,
    &:focus {
      border-color: var(--ed-color-primary);
      background-color: #fff;
    }
  }

  .dashboard-type-tabs {
    margin-bottom: 16px;
  }

  .search {
    text-align: right;
    .ed-input {
      width: 240px;
    }
  }

  .panel-table {
    margin-top: 16px;
    height: calc(100% - 110px);

    :deep(.ed-table__row):hover {
      cursor: pointer;
    }

    .name-content {
      display: flex;
      align-items: center;
      .custom-icon {
        display: none;
      }
      &:hover .custom-icon {
        cursor: pointer;
        margin-left: 8px;
        display: inherit !important;
      }
    }
    .main-color {
      font-size: 18px;
      padding: 3px;
      margin-right: 12px;
      border-radius: 4px;
      color: #fff;
    }
    .name-star {
      font-size: 15px;
      padding-left: 5px;
    }
  }
}
.workbranch-grid :deep(.ed-empty) {
  padding: 80px 0 !important;
  .ed-empty__description {
    margin-top: 0px;
    line-height: 20px !important;
  }
}

.jump-active {
  cursor: pointer;
}

.color-disabled {
  color: #bbbfc4;
}

.opt-disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.custom-color-disabled {
  background: #bbbfc4 !important;
}
</style>
<style lang="less">
.menu-panel-select_popper {
  width: 140px;
  background: #fff;
}
</style>
