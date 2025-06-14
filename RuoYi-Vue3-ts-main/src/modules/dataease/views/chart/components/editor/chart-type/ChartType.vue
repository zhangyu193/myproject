<script lang="tsx" setup>
import { reactive, ref, toRefs } from 'vue'
import { CHART_TYPE_CONFIGS } from '@de/views/chart/components/editor/util/chart'
import Icon from '@de/components/icon-custom/src/Icon.vue'
import { ElScrollbar } from 'element-plus-secondary'
import { iconChartDarkMap } from '@de/components/icon-group/chart-dark-list'
import { iconChartMap } from '@de/components/icon-group/chart-list'

const props = defineProps({
  propValue: {
    type: Array,
    default: () => []
  },
  element: {
    type: Object,
    default() {
      return {
        propValue: null
      }
    }
  },
  type: {
    type: String,
    required: true
  },
  themes: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits(['onTypeChange'])

const { themes } = toRefs(props)

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

const newComponent = (render, innerType) => {
  emit('onTypeChange', render, innerType)
}

const groupActiveChange = category => {
  state.curCategory = category
  anchorPosition('#' + category + '-edit')
}
</script>

<template>
  <el-row class="group" :class="'chart-' + themes">
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
    <el-scrollbar ref="userViewGroup" class="group-right" height="392px">
      <el-row
        :id="chartGroupInfo.category + '-edit'"
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
              v-on:click="newComponent(chartInfo.render, chartInfo.value)"
              class="item-top"
              :class="props.type === chartInfo.value ? 'item-active' : ''"
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
            <div class="item-bottom">
              <span>{{ chartInfo.title }}</span>
            </div>
          </el-col>
        </el-row>
      </el-row>
    </el-scrollbar>
  </el-row>
</template>

<style lang="less" scoped>
.chart-light {
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
  :deep(.item-bottom) {
    color: @chart-change-font-color-light!important;
  }
  :deep(.item-top-icon) {
    color: @chart-change-font-color-light!important;
  }
}
.group {
  display: flex !important;
  max-height: 400px;
  height: 100%;
  width: 410px;
  .group-left {
    width: 100px;
    height: 100%;
    .ul-custom {
      padding-inline-start: 0px;
      color: @canvas-main-font-color;
      .li-custom {
        margin-top: 1px;
        font-weight: 400;
        font-size: 14px;
        line-height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        list-style-type: none;
        list-style-position: inside;
        border-radius: 4px;
        padding-left: 8px;
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }
      }

      .li-custom a:hover {
        background: none;
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
    background: transparent;
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
  .item-active {
    border: 1px solid var(--ed-color-primary);
  }
  .item-bottom {
    height: 20px;
    line-height: 20px;
    color: #a6a6a6;
    font-size: 12px;
    text-align: center;
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
  color: #1f2329;
  padding: 0 6px 2px;
}
</style>
