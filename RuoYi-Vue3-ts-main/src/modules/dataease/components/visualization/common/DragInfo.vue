<template>
  <div class="drag-info-main">
    <template v-if="!mobileInPc">
      <el-row style="justify-content: center">
        <Icon name="dv-drag-tips"
          ><dvDragTips class="svg-icon" style="width: 125px; height: 125px"
        /></Icon>
      </el-row>
      <el-row class="tips-info"> {{ tips }} </el-row>
    </template>
    <div v-else class="mobile-in-pc-tips">请从右侧添加可视化组件</div>
  </div>
</template>

<script lang="ts" setup>
import dvDragTips from '@de/assets/svg/dv-drag-tips.svg'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { storeToRefs } from 'pinia'
import { useI18n } from '@de/hooks/web/useI18n'
const { t } = useI18n()

const dvMainStore = dvMainStoreWithOut()
const { dvInfo, mobileInPc } = storeToRefs(dvMainStore)

const tips =
  t('visualization.resource_create_tips') +
  (dvInfo.value.type === 'dashboard'
    ? t('work_branch.dashboard')
    : t('work_branch.big_data_screen'))
</script>

<style lang="less" scoped>
.drag-info-main {
  position: absolute;
  left: calc(50% - 125px);
  top: calc(40% - 90px);
  width: 250px;
  height: 180px;

  .mobile-in-pc-tips {
    color: #646a73;
    font-size: 16px;
    font-weight: 400;
    line-height: 28px;
    text-align: center;
    margin-top: 40%;
  }
}

.tips-info {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  text-align: center;
  color: rgba(100, 106, 115, 1);
}
</style>
