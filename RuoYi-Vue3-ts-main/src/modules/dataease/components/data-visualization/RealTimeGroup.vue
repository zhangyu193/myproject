<script lang="ts" setup>
import group from '@de/assets/svg/group.svg'
import bar from '@de/assets/svg/bar.svg'
import dbMoreWeb from '@de/assets/svg/db-more-web.svg'
import dvMoreTimeClock from '@de/assets/svg/dv-more-time-clock.svg'
import dvPictureReal from '@de/assets/svg/dv-picture-real.svg'
import dvTab from '@de/assets/svg/dv-tab.svg'
import iconStream from '@de/assets/svg/icon-stream.svg'
import iconVideo from '@de/assets/svg/icon-video.svg'
import icon_graphical from '@de/assets/svg/icon_graphical.svg'
import icon_search from '@de/assets/svg/icon_search.svg'
import other_material_board from '@de/assets/svg/other_material_board.svg'
import other_material_icon from '@de/assets/svg/other_material_icon.svg'
import scrollText from '@de/assets/svg/scroll-text.svg'
import areaOrigin from '@de/assets/svg/area-origin.svg'
import areaStackOrigin from '@de/assets/svg/area-stack-origin.svg'
import barGroupOrigin from '@de/assets/svg/bar-group-origin.svg'
import barGroupStackOrigin from '@de/assets/svg/bar-group-stack-origin.svg'
import barHorizontalOrigin from '@de/assets/svg/bar-horizontal-origin.svg'
import barOrigin from '@de/assets/svg/bar-origin.svg'
import barRangeOrigin from '@de/assets/svg/bar-range-origin.svg'
import barStackHorizontalOrigin from '@de/assets/svg/bar-stack-horizontal-origin.svg'
import barStackOrigin from '@de/assets/svg/bar-stack-origin.svg'
import bidirectionalBarOrigin from '@de/assets/svg/bidirectional-bar-origin.svg'
import bubbleMapOrigin from '@de/assets/svg/bubble-map-origin.svg'
import chartMixGroupOrigin from '@de/assets/svg/chart-mix-group-origin.svg'
import chartMixOrigin from '@de/assets/svg/chart-mix-origin.svg'
import chartMixStackOrigin from '@de/assets/svg/chart-mix-stack-origin.svg'
import chartMixDualLineOrigin from '@de/assets/svg/chart-mix-dual-line-origin.svg'
import flowMapOrigin from '@de/assets/svg/flow-map-origin.svg'
import funnelOrigin from '@de/assets/svg/funnel-origin.svg'
import gaugeOrigin from '@de/assets/svg/gauge-origin.svg'
import heatMapOrigin from '@de/assets/svg/heat-map-origin.svg'
import indicatorOrigin from '@de/assets/svg/indicator-origin.svg'
import lineOrigin from '@de/assets/svg/line-origin.svg'
import liquidOrigin from '@de/assets/svg/liquid-origin.svg'
import mapOrigin from '@de/assets/svg/map-origin.svg'
import percentageBarStackHorizontalOrigin from '@de/assets/svg/percentage-bar-stack-horizontal-origin.svg'
import percentageBarStackOrigin from '@de/assets/svg/percentage-bar-stack-origin.svg'
import pieDonutOrigin from '@de/assets/svg/pie-donut-origin.svg'
import pieDonutRoseOrigin from '@de/assets/svg/pie-donut-rose-origin.svg'
import pieOrigin from '@de/assets/svg/pie-origin.svg'
import pieRoseOrigin from '@de/assets/svg/pie-rose-origin.svg'
import progressBarOrigin from '@de/assets/svg/progress-bar-origin.svg'
import quadrantOrigin from '@de/assets/svg/quadrant-origin.svg'
import radarOrigin from '@de/assets/svg/radar-origin.svg'
import richTextOrigin from '@de/assets/svg/rich-text-origin.svg'
import sankeyOrigin from '@de/assets/svg/sankey-origin.svg'
import scatterOrigin from '@de/assets/svg/scatter-origin.svg'
import stockLineOrigin from '@de/assets/svg/stock-line-origin.svg'
import symbolicMapOrigin from '@de/assets/svg/symbolic-map-origin.svg'
import tableInfoOrigin from '@de/assets/svg/table-info-origin.svg'
import tableNormalOrigin from '@de/assets/svg/table-normal-origin.svg'
import tablePivotOrigin from '@de/assets/svg/table-pivot-origin.svg'
import treemapOrigin from '@de/assets/svg/treemap-origin.svg'
import waterfallOrigin from '@de/assets/svg/waterfall-origin.svg'
import wordCloudOrigin from '@de/assets/svg/word-cloud-origin.svg'
import tHeatmapOrigin from '@de/assets/svg/t-heatmap-origin.svg'
import dvEyeClose from '@de/assets/svg/dv-eye-close.svg'
import dvShow from '@de/assets/svg/dv-show.svg'
import dvUnlock from '@de/assets/svg/dv-unlock.svg'
import dvLock from '@de/assets/svg/dv-lock.svg'
import dvMore from '@de/assets/svg/dv-more.svg'
import dvExpandDown from '@de/assets/svg/dv-expand-down.svg'
import dvExpandRight from '@de/assets/svg/dv-expand-right.svg'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { snapshotStoreWithOut } from '@de/store/modules/data-visualization/snapshot'
import { layerStoreWithOut } from '@de/store/modules/data-visualization/layer'
import { storeToRefs } from 'pinia'
import { ElIcon, ElRow } from 'element-plus-secondary'
import Icon from '../icon-custom/src/Icon.vue'
import { nextTick, ref, toRefs } from 'vue'
import draggable from 'vuedraggable'
import { lockStoreWithOut } from '@de/store/modules/data-visualization/lock'
import ContextMenuAsideDetails from '@de/components/data-visualization/canvas/ContextMenuAsideDetails.vue'
import ComposeShow from '@de/components/data-visualization/canvas/ComposeShow.vue'
import { composeStoreWithOut } from '@de/store/modules/data-visualization/compose'
import circlePackingOrigin from '@de/assets/svg/circle-packing-origin.svg'
import RealTimeTab from '@de/components/data-visualization/RealTimeTab.vue'
import bulletGraphOrigin from '@de/assets/svg/bullet-graph-origin.svg'
import { syncViewTitle } from '@de/utils/canvasUtils'
const dropdownMore = ref(null)
const lockStore = lockStoreWithOut()

const dvMainStore = dvMainStoreWithOut()
const snapshotStore = snapshotStoreWithOut()
const layerStore = layerStoreWithOut()
const composeStore = composeStoreWithOut()

const { areaData } = storeToRefs(composeStore)

const { curComponent, canvasViewInfo } = storeToRefs(dvMainStore)

const props = defineProps({
  tabPosition: {
    type: String,
    required: false,
    default: 'main'
  },
  componentData: []
})

const { componentData } = toRefs(props)

const getComponent = index => {
  return componentData.value[componentData.value.length - 1 - index]
}
const transformIndex = index => {
  return componentData.value.length - 1 - index
}

const onClick = index => {
  setCurComponent(index)
  //其他情况点击清理选择区域
  areaData.value.components.splice(0, areaData.value.components.length)
}

const setCurComponent = index => {
  dvMainStore.setCurComponent({ component: componentData.value[index], index })
}

let nameEdit = ref(false)
let editComponentId = ref('')
let inputName = ref('')
let nameInput = ref(null)
let curEditComponent = null
const editComponentName = item => {
  curEditComponent = curComponent.value
  editComponentId.value = `#component-label-${item.id}`
  nameEdit.value = true
  inputName.value = item.name
  nextTick(() => {
    nameInput.value.focus()
  })
}
const closeEditComponentName = () => {
  nameEdit.value = false
  if (!inputName.value || !inputName.value.trim()) {
    return
  }
  if (inputName.value.trim() === curEditComponent.name) {
    return
  }
  curEditComponent.name = inputName.value
  syncViewTitle(curEditComponent)
  inputName.value = ''
  curEditComponent = null
}

const lock = () => {
  setTimeout(() => {
    lockStore.lock()
    snapshotStore.recordSnapshotCache('realTime-lock')
  })
}

const unlock = () => {
  setTimeout(() => {
    lockStore.unlock()
    snapshotStore.recordSnapshotCache('realTime-unlock')
  })
}

const hideComponent = () => {
  setTimeout(() => {
    layerStore.hideComponent()
    snapshotStore.recordSnapshotCache('realTime-hideComponent')
  })
}

const showComponent = () => {
  setTimeout(() => {
    layerStore.showComponent()
    snapshotStore.recordSnapshotCache('showComponent')
  })
}

const dragOnEnd = ({ oldIndex, newIndex }) => {
  const source = componentData.value[newIndex]
  const comLength = componentData.value.length
  // 还原数组
  componentData.value.splice(newIndex, 1)
  componentData.value.splice(oldIndex, 0, source)
  const target = componentData.value[comLength - 1 - oldIndex]
  // 反向移动数组
  componentData.value.splice(comLength - 1 - oldIndex, 1)
  componentData.value.splice(comLength - 1 - newIndex, 0, target)
  dvMainStore.setCurComponent({ component: target, index: transformIndex(comLength - oldIndex) })
}

const iconMap = {
  bar: bar,
  'db-more-web': dbMoreWeb,
  'dv-more-time-clock': dvMoreTimeClock,
  'dv-picture-real': dvPictureReal,
  'dv-tab': dvTab,
  'icon-stream': iconStream,
  'icon-video': iconVideo,
  icon_graphical: icon_graphical,
  icon_search: icon_search,
  other_material_board: other_material_board,
  other_material_icon: other_material_icon,
  'scroll-text': scrollText,
  'area-origin': areaOrigin,
  'area-stack-origin': areaStackOrigin,
  'bar-group-origin': barGroupOrigin,
  'bar-group-stack-origin': barGroupStackOrigin,
  'bar-horizontal-origin': barHorizontalOrigin,
  'bar-origin': barOrigin,
  'bar-range-origin': barRangeOrigin,
  'bar-stack-horizontal-origin': barStackHorizontalOrigin,
  'bar-stack-origin': barStackOrigin,
  'bidirectional-bar-origin': bidirectionalBarOrigin,
  'bubble-map-origin': bubbleMapOrigin,
  'chart-mix-group-origin': chartMixGroupOrigin,
  'chart-mix-origin': chartMixOrigin,
  'chart-mix-stack-origin': chartMixStackOrigin,
  'chart-mix-dual-line': chartMixDualLineOrigin,
  'flow-map-origin': flowMapOrigin,
  'funnel-origin': funnelOrigin,
  'gauge-origin': gaugeOrigin,
  'heat-map-origin': heatMapOrigin,
  'indicator-origin': indicatorOrigin,
  'line-origin': lineOrigin,
  'liquid-origin': liquidOrigin,
  'map-origin': mapOrigin,
  'percentage-bar-stack-horizontal-origin': percentageBarStackHorizontalOrigin,
  'percentage-bar-stack-origin': percentageBarStackOrigin,
  'pie-donut-origin': pieDonutOrigin,
  'pie-donut-rose-origin': pieDonutRoseOrigin,
  'pie-origin': pieOrigin,
  'pie-rose-origin': pieRoseOrigin,
  'progress-bar-origin': progressBarOrigin,
  'quadrant-origin': quadrantOrigin,
  'radar-origin': radarOrigin,
  'rich-text-origin': richTextOrigin,
  'sankey-origin': sankeyOrigin,
  'scatter-origin': scatterOrigin,
  'stock-line-origin': stockLineOrigin,
  'symbolic-map-origin': symbolicMapOrigin,
  'table-info-origin': tableInfoOrigin,
  'table-normal-origin': tableNormalOrigin,
  'table-pivot-origin': tablePivotOrigin,
  'treemap-origin': treemapOrigin,
  'waterfall-origin': waterfallOrigin,
  'word-cloud-origin': wordCloudOrigin,
  't-heatmap-origin': tHeatmapOrigin,
  group: group,
  'circle-packing-origin': circlePackingOrigin,
  'bullet-graph-origin': bulletGraphOrigin
}
const getIconName = item => {
  if (item.component === 'UserView') {
    const viewInfo = canvasViewInfo.value[item.id]
    return iconMap[`${viewInfo.type}-origin`]
  } else {
    return iconMap[item.icon]
  }
}

const menuAsideClose = (param, index) => {
  const iconDom = document.getElementById('close-button')
  if (iconDom) {
    iconDom.click()
  }
  if (param?.opt === 'rename') {
    setTimeout(() => {
      editComponentName(getComponent(index))
    }, 200)
  }
}

const handleContextMenu = e => {
  e.preventDefault()
  // 获取鼠标点击位置
  const x = e.clientX
  const y = e.clientY
  const customContextMenu = document.createElement('div')
  customContextMenu.style.position = 'fixed'
  customContextMenu.style.left = x + 'px'
  customContextMenu.style.top = y + 'px'

  // 将自定义菜单添加到页面
  document.body.appendChild(customContextMenu)

  // 为自定义菜单添加事件监听器，例如，点击菜单项后执行的操作
  customContextMenu.addEventListener('click', () => {
    // 在这里执行菜单项点击后的操作
    // 例如，关闭菜单
    document.body.removeChild(customContextMenu)
  })
}
const expandClick = component => {
  component['expand'] = !component['expand']
}
</script>

<template>
  <!--为了保持图层视觉上的一致性 这里进行数组的倒序排列 相应的展示和移动按照倒序处理-->
  <div class="real-time-component-list">
    <button hidden="true" id="close-button"></button>
    <el-row class="list-wrap">
      <div class="list-container" @contextmenu="handleContextMenu">
        <draggable
          @end="dragOnEnd"
          :list="componentData"
          animation="100"
          class="drag-list"
          item-key="id"
        >
          <template #item="{ index }">
            <div>
              <div
                :title="getComponent(index)?.name"
                class="component-item"
                :class="{
                  'container-item-not-show': !getComponent(index)?.isShow,
                  'component-item-group-tab': tabPosition === 'groupTab',
                  'component-item-tab-group': tabPosition === 'tabGroup',
                  activated:
                    (curComponent && curComponent?.id === getComponent(index)?.id) ||
                    areaData.components.includes(getComponent(index))
                }"
                @click="onClick(transformIndex(index))"
              >
                <div
                  v-if="['DeTabs', 'Group'].includes(getComponent(index)?.component)"
                  style="width: 12px; margin-right: 10px"
                >
                  <el-icon class="component-expand" @click="expandClick(getComponent(index))">
                    <Icon
                      v-if="getComponent(index)?.expand"
                      name="dv-expand-down"
                      class="expand-icon"
                      ><dvExpandDown class="svg-icon expand-icon"
                    /></Icon>
                    <Icon
                      v-if="!getComponent(index)?.expand"
                      name="dv-expand-right"
                      class="expand-icon"
                      ><dvExpandRight class="svg-icon expand-icon"
                    /></Icon>
                  </el-icon>
                </div>
                <el-icon class="component-icon">
                  <Icon><component :is="getIconName(getComponent(index))"></component></Icon>
                </el-icon>
                <span
                  :id="`component-label-${getComponent(index)?.id}`"
                  class="component-label"
                  @dblclick="editComponentName(getComponent(index))"
                >
                  {{ getComponent(index)?.name }}
                </span>
                <div
                  v-show="!nameEdit || (nameEdit && curComponent?.id !== getComponent(index)?.id)"
                  class="icon-container"
                  :class="{
                    'icon-container-lock':
                      getComponent(index)?.isLock && getComponent(index)?.isShow,
                    'icon-container-show': !getComponent(index)?.isShow
                  }"
                >
                  <el-icon
                    class="component-base component-icon-display"
                    v-show="!getComponent(index).isShow"
                    @click="showComponent"
                  >
                    <Icon name="dv-eye-close"><dvEyeClose class="svg-icon opt-icon" /></Icon>
                  </el-icon>
                  <el-icon
                    class="component-base"
                    v-show="getComponent(index)?.isShow"
                    @click="hideComponent"
                  >
                    <Icon name="dv-show"><dvShow class="svg-icon opt-icon" /></Icon>
                  </el-icon>
                  <el-icon
                    v-show="!getComponent(index)?.isLock"
                    class="component-base"
                    @click="lock"
                  >
                    <Icon name="dv-unlock"><dvUnlock class="svg-icon opt-icon" /></Icon>
                  </el-icon>
                  <el-icon
                    class="component-base component-icon-display"
                    v-show="getComponent(index)?.isLock"
                    @click="unlock"
                  >
                    <Icon name="dv-lock"><dvLock class="svg-icon opt-icon" /></Icon>
                  </el-icon>
                  <el-dropdown
                    ref="dropdownMore"
                    trigger="click"
                    placement="bottom-start"
                    effect="dark"
                    :hide-timeout="0"
                  >
                    <span :class="'dropdownMore-' + index" @click="onClick(transformIndex(index))">
                      <el-icon class="component-base">
                        <Icon name="dv-more"><dvMore class="svg-icon opt-icon" /></Icon>
                      </el-icon>
                    </span>
                    <template #dropdown>
                      <context-menu-aside-details
                        :element="getComponent(index)"
                        @close="menuAsideClose($event, index)"
                      ></context-menu-aside-details>
                    </template>
                  </el-dropdown>
                </div>
                <el-dropdown
                  class="compose-dropdown"
                  trigger="contextmenu"
                  placement="bottom-start"
                  effect="dark"
                  :hide-timeout="0"
                >
                  <compose-show
                    :show-border="false"
                    :element-index="transformIndex(index)"
                    :element="getComponent(index)"
                  ></compose-show>
                  <template #dropdown>
                    <context-menu-aside-details
                      :element="getComponent(index)"
                      @close="menuAsideClose($event, index)"
                    ></context-menu-aside-details>
                  </template>
                </el-dropdown>
              </div>
              <div
                v-if="getComponent(index)?.component === 'DeTabs' && getComponent(index)?.expand"
              >
                <real-time-tab
                  :tab-element="getComponent(index)"
                  tab-position="groupTab"
                  :component-data="getComponent(index).propValue"
                ></real-time-tab>
              </div>
              <div v-if="getComponent(index)?.component === 'Group' && getComponent(index)?.expand">
                <real-time-group
                  tab-position="tabGroup"
                  :component-data="getComponent(index).propValue"
                ></real-time-group>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </el-row>
    <Teleport v-if="editComponentId && nameEdit" :to="editComponentId">
      <input
        class="custom-teleport"
        @keydown.stop
        @keyup.stop
        ref="nameInput"
        v-model="inputName"
        @blur="closeEditComponentName"
      />
    </Teleport>
  </div>
</template>

<style lang="less" scoped>
.real-time-component-list {
  white-space: nowrap;
  .list-wrap {
    max-height: calc(100% - @component-toolbar-height);
    overflow-y: auto;
    width: 100%;
    .list-container {
      width: 100%;
      .component-item {
        position: relative;
        height: 30px;
        width: 100%;
        cursor: grab;
        color: @dv-canvas-main-font-color;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 12px;
        padding: 0 2px 0 28px;
        user-select: none;

        .component-icon {
          color: #a6a6a6;
          font-size: 14px;
        }
        .component-label {
          color: #ebebeb;
        }

        > span.component-label {
          font-size: 12px;
          margin-left: 10px;
          position: relative;
          min-width: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          input {
            position: absolute;
            left: 0;
            width: 100%;
            background-color: white;
            outline: none;
            border: none;
            border-radius: 2px;
            padding: 0 4px;
            height: 100%;
          }
        }

        &:active {
          cursor: grabbing;
        }

        &:hover {
          background-color: rgba(235, 235, 235, 0.1);

          .icon-container {
            .component-base {
              opacity: 1;
            }
            width: 55px !important;
          }
        }

        .icon-container {
          .component-base {
            opacity: 0;
          }
          width: 0;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          flex-grow: 1;
          cursor: none;
          i {
            font-size: 16px;
            cursor: pointer;
          }
        }
      }
      .activated {
        background-color: var(--ed-color-primary-1a, rgba(51, 112, 255, 0.1)) !important;
        :deep(.component-icon) {
          color: var(--ed-color-primary);
        }
        :deep(.component-label) {
          color: var(--ed-color-primary);
        }
      }
    }
  }
}

.real-time-component-list :deep(.ed-popper) {
  background: #303133 !important;
}

.component-base {
  cursor: pointer;
  height: 22px !important;
  width: 22px !important;
  border-radius: 4px;
  padding: 0 4px;

  .opt-icon {
    font-size: 14px;
  }

  &:hover {
    background: rgba(235, 235, 235, 0.1);
  }

  &:active {
    background: rgba(235, 235, 235, 0.1);
  }
}

.component-icon-display {
  opacity: 1 !important;
}

.icon-container-show {
  width: 55px !important;
}

.icon-container-lock {
  width: 45px !important;
}

.container-item-not-show {
  color: #5f5f5f !important;
  :deep(.component-icon) {
    color: #5f5f5f !important;
  }
  :deep(.component-label) {
    color: #5f5f5f !important;
  }
}
.custom-teleport {
  background: #1a1a1a !important;
}
.component-item-group-tab {
  padding-left: 70px !important;
}

.component-item-tab-group {
  padding-left: 38px !important;
}

.component-expand {
  cursor: pointer;
  height: 16px !important;
  width: 16px !important;
  border-radius: 2px;
  padding: 0 2px;

  .expand-icon {
    font-size: 10px;
  }

  &:hover {
    background: rgba(235, 235, 235, 0.1);
  }

  &:active {
    background: rgba(235, 235, 235, 0.1);
  }
}
</style>

<style lang="less">
.compose-dropdown {
  position: initial !important;
}
</style>
