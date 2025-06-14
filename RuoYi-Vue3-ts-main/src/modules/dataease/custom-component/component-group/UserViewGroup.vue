<script setup lang="tsx">
import { iconChartMap } from '@de/components/icon-group/chart-list'
import { computed, reactive, ref, toRefs } from 'vue'
import eventBus from '@de/utils/eventBus'
import { CHART_TYPE_CONFIGS } from '@de/views/chart/components/editor/util/chart'
import Icon from '@de/components/icon-custom/src/Icon.vue'
import { commonHandleDragEnd, commonHandleDragStart } from '@de/utils/canvasUtils'
import { ElScrollbar } from 'element-plus-secondary'
import { XpackComponent } from '@de/components/plugin'
import { iconChartDarkMap } from '@de/components/icon-group/chart-dark-list'

const props = defineProps({
  propValue: {
    type: Array,
    default: () => []
  },
  dvModel: {
    type: String,
    default: 'dv'
  },
  element: {
    type: Object,
    default() {
      return {
        propValue: null
      }
    }
  },
  themes: {
    type: String,
    default: 'dark'
  }
})

const { dvModel } = toRefs(props)

const userViewGroup = ref<InstanceType<typeof ElScrollbar>>()

const state = reactive({
  curCategory: 'quota',
  chartGroupList: CHART_TYPE_CONFIGS
})

const scrollTo = offsetTop => {
  userViewGroup?.value.setScrollTop(offsetTop)
}

const anchorPosition = anchor => {
  const element = document.querySelector(anchor)
  scrollTo(element.offsetTop)
}

const newComponent = (innerType, staticMap) => {
  eventBus.emit('handleNew', { componentName: 'UserView', innerType: innerType, staticMap })
}

const handleDragStart = e => {
  commonHandleDragStart(e, dvModel.value)
}

const handleDragEnd = e => {
  commonHandleDragEnd(e, dvModel.value)
}

const chartGroupListScroll = computed(() => {
  return state.chartGroupList.reduce(
    (pre, next) => {
      if (next.display !== 'hidden') {
        const height = (Math.floor((next.details.length - 1) / 3) + 1) * 88 + 20
        if (pre.top === 0) {
          pre.top += height
          pre[0] = next.category
        } else {
          pre[pre.top] = next.category
          pre.top += height
        }
        return pre
      }
      return pre
    },
    { top: 0 }
  )
})

const handleScroll = val => {
  let scrollTop: string | number = 0
  for (const key in chartGroupListScroll.value) {
    if (val.scrollTop > key) {
      scrollTop = key
    }
  }
  state.curCategory = chartGroupListScroll.value[scrollTop]
}

const groupActiveChange = category => {
  state.curCategory = category
  anchorPosition('#' + category)
}
const loadPluginCategory = data => {
  data.forEach(item => {
    const { category, title, render, chartValue, chartTitle, icon, staticMap } = item
    const node = {
      render,
      category,
      icon,
      value: chartValue,
      title: chartTitle,
      isPlugin: true,
      staticMap
    }
    const stack = [...state.chartGroupList]
    let findParent = false
    while (stack?.length) {
      const parent = stack.pop()
      if (parent.category === category) {
        const chart = parent.details.find(chart => chart.value === node.value)
        if (!chart) {
          parent.details.push(node)
        }
        findParent = true
      }
    }
    if (!findParent) {
      state.chartGroupList.push({
        category,
        title,
        display: 'show',
        details: [node]
      })
    }
  })
}
</script>

<template>
  <el-row class="group" :class="themes" @dragstart="handleDragStart" @dragend="handleDragEnd">
    <div class="group-left">
      <ul class="ul-custom">
        <li
          class="li-custom"
          :class="{ 'li-custom-active': state.curCategory === chartGroupInfo.category }"
          v-for="chartGroupInfo in state.chartGroupList"
          v-show="chartGroupInfo.display !== 'hidden'"
          :key="chartGroupInfo.category"
          @click="groupActiveChange(chartGroupInfo.category)"
        >
          {{ chartGroupInfo.title }}
        </li>
      </ul>
    </div>
    <el-scrollbar ref="userViewGroup" @scroll="handleScroll" class="group-right" height="392px">
      <el-row
        :id="chartGroupInfo.category"
        v-for="chartGroupInfo in state.chartGroupList"
        v-show="chartGroupInfo.display !== 'hidden'"
        :key="chartGroupInfo.title"
      >
        <el-row class="group-title">{{ chartGroupInfo.title }}</el-row>
        <el-row style="width: 100%">
          <el-col
            class="item"
            :span="8"
            v-for="chartInfo in chartGroupInfo.details"
            :key="chartInfo.title"
          >
            <div
              v-on:click="newComponent(chartInfo.value, chartInfo['staticMap'])"
              class="item-top"
              draggable="true"
              :data-id="'UserView&' + chartInfo.value"
              :title="chartInfo.title"
            >
              <Icon
                class-name="item-top-icon"
                v-if="chartInfo['isPlugin']"
                :static-content="chartInfo.icon"
              />
              <Icon v-else class-name="item-top-icon"
                ><component
                  class="svg-icon item-top-icon"
                  :is="
                    props.themes === 'dark'
                      ? iconChartDarkMap[`${chartInfo.icon}-dark`]
                      : iconChartMap[chartInfo.icon]
                  "
                ></component
              ></Icon>
            </div>
            <div :title="chartInfo.title" class="item-bottom">
              <span>{{ chartInfo.title }}</span>
            </div>
          </el-col>
        </el-row>
      </el-row>
    </el-scrollbar>
  </el-row>
  <XpackComponent
    jsname="L2NvbXBvbmVudC9wbHVnaW5zLWhhbmRsZXIvVmlld0NhdGVnb3J5SGFuZGxlcg=="
    @load-plugin-category="loadPluginCategory"
  />
</template>

<style lang="less" scoped>
.light {
  color: #646a73 !important;
  :deep(.group-right) {
    border-left: 1px solid @side-outline-border-color-light!important;
  }
  :deep(.item-top) {
    background-color: #f5f6f7 !important;
  }
  :deep(.ul-custom) {
    color: @chart-change-font-color-light!important;
  }
  :deep(.li-custom) {
    color: #646a73 !important;
    &.li-custom-active {
      color: var(--ed-color-primary) !important;
    }
    &:hover {
      background: rgba(31, 35, 41, 0.1) !important;
    }
  }
  :deep(.item-bottom) {
    color: @chart-change-font-color-light!important;
  }
  :deep(.item-top-icon) {
    color: @chart-change-font-color-light!important;
  }
  :deep(.group-title) {
    color: #1f2329;
  }
}
.group {
  display: flex;
  max-height: 400px;
  height: 100%;
  .group-left {
    width: 100px;
    height: 100%;
    .ul-custom {
      padding-top: 8px;
      padding-inline-start: 0px;
      color: @canvas-main-font-color;
      .li-custom {
        margin-top: 1px;
        font-weight: 400;
        font-size: 12px;
        line-height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        list-style-type: none;
        list-style-position: inside;
        border-radius: 4px;
        color: #a6a6a6;
        padding-left: 8px;
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }
      }

      .li-custom a:hover {
        //background: none;
      }

      .li-a {
        color: #1f2329;
      }
    }
  }
  .group-right {
    border-left: 1px solid @side-outline-border-color;
    flex: 1;
    padding: 4px 0 4px 12px;
  }
}
.custom_img {
  width: 100px;
  height: 70px;
  cursor: pointer;
}

.li-custom-active {
  background: var(--ed-color-primary-1a, rgba(51, 112, 255, 0.1));
  color: var(--ed-color-primary) !important;
  .li-a {
    color: var(--ed-color-primary) !important;
  }
}

.item {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .item-top {
    width: 88px;
    height: 64px;
    background: #1a1a1a;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      border: 1px solid var(--ed-color-primary);
    }
    .item-top-icon {
      width: 80px;
      height: 56px;
      color: @canvas-main-font-color;
    }
  }
  .item-bottom {
    height: 20px;
    line-height: 20px;
    color: #a6a6a6;
    font-size: 12px;
    text-align: center;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 88px;
  }
}

.group-title {
  width: 100%;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: #ebebeb;
  margin-bottom: 4px;
}
</style>
