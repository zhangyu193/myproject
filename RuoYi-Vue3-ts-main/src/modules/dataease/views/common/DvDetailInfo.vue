<template>
  <div class="info-card">
    <div class="info-title">
      {{
        `${
          dvInfo.type === 'dashboard'
            ? t('work_branch.dashboard')
            : t('work_branch.big_data_screen')
        }ID`
      }}
    </div>
    <div class="info-content">{{ dvInfo.id }}</div>
    <div v-if="dvInfo.creatorName" class="info-title">{{ t('visualization.create_by') }}</div>
    <div v-if="dvInfo.creatorName" class="info-content">{{ dvInfo.creatorName }}</div>
    <div class="info-title">{{ t('visualization.create_time') }}</div>
    <div class="info-content">{{ timestampFormatDate(dvInfo.createTime) }}</div>
    <div v-if="dvInfo.updateName" class="info-title">{{ t('visualization.update_by') }}</div>
    <div v-if="dvInfo.updateName" class="info-content">{{ dvInfo.updateName }}</div>
    <div class="info-title">{{ t('visualization.update_time') }}</div>
    <div v-if="dvInfo.updateTime" class="info-content">
      {{ timestampFormatDate(dvInfo.updateTime) }}
    </div>
    <div v-if="!dvInfo.updateTime" class="info-content">N/A</div>
  </div>
</template>

<script lang="ts" setup>
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { storeToRefs } from 'pinia'
import { useI18n } from '@de/hooks/web/useI18n'
const { t } = useI18n()

const dvMainStore = dvMainStoreWithOut()
const { dvInfo } = storeToRefs(dvMainStore)

const timestampFormatDate = value => {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString()
}
</script>

<style lang="less" scoped>
.info-card {
  font-family: var(--de-custom_font, 'PingFang');
  font-style: normal;
  padding-left: 4px;
  font-weight: 400;
  line-height: 22px;

  .info-title {
    color: #646a73;
    font-size: 14px;
    margin-bottom: 4px;
  }
  .info-content {
    color: #1f2329;
    font-size: 14px;
    margin-bottom: 12px;
  }

  :last-child {
    margin-bottom: 0;
  }
}
</style>
