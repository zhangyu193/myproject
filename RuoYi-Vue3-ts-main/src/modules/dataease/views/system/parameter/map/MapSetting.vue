<template>
  <el-container class="map-setting-container">
    <el-aside class="map-setting-left">
      <div class="left-container">
        <div
          v-for="(item, index) in leftOptions"
          :key="item.id"
          class="left-menu-item"
          :class="{ active: activeIndex === item.id }"
          @click="selectHandler(index)"
        >
          <span :title="t(item.name)">{{ t(item.name) }}</span>
        </div>
      </div>
    </el-aside>
    <el-main class="map-setting-right">
      <div class="right-container">
        <OnlineMap v-if="activeIndex" />
        <geometry v-else />
      </div>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from '@de/hooks/web/useI18n'
import Geometry from './Geometry.vue'
import OnlineMap from './OnlineMap.vue'

const { t } = useI18n()

const activeIndex = ref(0)
const leftOptions = [
  { id: 0, name: 'online_map.geometry' },
  { id: 1, name: 'online_map.onlinemap' }
]

const selectHandler = (index: number) => {
  activeIndex.value = index
}
</script>

<style lang="less" scoped>
.map-setting-container {
  width: 100%;
  height: 100%;
  .map-setting-left {
    width: 200px !important;
    height: 100%;
    border-right: 1px solid #1f232926;
    .left-container {
      padding: 16px 16px 16px 16px;
      width: 100%;
      height: 100%;
      .left-menu-item {
        width: 168px;
        height: 40px;
        padding: 9px 8px;
        line-height: 22px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 400;
        cursor: pointer;
        &:hover {
          background: #1f232926;
        }
        span {
          display: block;
          width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .active {
        background: var(--ed-color-primary-1a, #3370ff1a);
        color: var(--ed-color-primary);
        font-weight: 500;
      }
    }
  }
  .map-setting-right {
    padding: 0 !important;
    .right-container {
      height: 100%;
    }
  }
}
</style>
