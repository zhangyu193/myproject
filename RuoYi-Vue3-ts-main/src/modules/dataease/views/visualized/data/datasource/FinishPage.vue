<script lang="ts" setup>
import icon_succeed_colorful from '@de/assets/svg/icon_succeed_colorful.svg'
import icon_dataset from '@de/assets/svg/icon_dataset.svg'
import { ref } from 'vue'
import { propTypes } from '@de/utils/propTypes'
import { useCache } from '@de/hooks/web/useCache'
import { setShowFinishPage } from '@de/api/datasource'
import { useI18n } from '@de/hooks/web/useI18n'

defineProps({
  name: propTypes.string.def(''),
  disabled: propTypes.bool.def(false)
})

const { t } = useI18n()
const { wsCache } = useCache()
const emits = defineEmits(['createDataset', 'backToDatasourceList', 'continueCreating'])
const checked = ref(false)
const createDataset = () => {
  emits('createDataset')
}
const backToDatasourceList = () => {
  emits('backToDatasourceList')
}
const continueCreating = () => {
  emits('continueCreating')
}

checked.value = wsCache.get('ds-create-success') || false
const handleChange = (val: boolean) => {
  setShowFinishPage({})
  wsCache.set('ds-create-success', val)
  emits('backToDatasourceList')
}
</script>

<template>
  <div class="finish-page-content">
    <div class="finish-page">
      <el-icon class="succeed-icon">
        <Icon name="icon_succeed_colorful"><icon_succeed_colorful class="svg-icon" /></Icon>
      </el-icon>

      <div class="succeed-text">{{ t('data_source.successfully_created') }}</div>
      <div class="btn-list">
        <el-button @click="continueCreating" secondary>
          {{ t('data_source.continue_to_create') }}
        </el-button>
        <el-button @click="backToDatasourceList" type="primary">
          {{ t('data_source.data_source_list') }}
        </el-button>
      </div>
      <div class="nolonger-tips">
        <el-checkbox
          @change="handleChange"
          v-model="checked"
          :label="t('data_source.prompts_next_time')"
        />
      </div>

      <div class="maybe-want" v-permission="['dataset']">
        <div class="title">{{ t('data_source.also_want_to') }}</div>
        <div class="ds-info">
          <el-icon class="ds">
            <Icon name="icon_dataset"><icon_dataset class="svg-icon" /></Icon>
          </el-icon>
          <div class="info">
            <p class="name">{{ $t('auth.dataset') }}</p>
            <p class="size">{{ t('data_source.or_large_screen') }}</p>
          </div>
          <el-button class="create" secondary :disabled="disabled" @click="createDataset">
            {{ t('data_source.go_to_create') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.finish-page-content {
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;

  .ed-button,
  :deep(.ed-checkbox__label) {
    font-weight: 400;
  }
  .finish-page {
    width: 592px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 83px;
    font-family: var(--de-custom_font, 'PingFang');
    font-style: normal;
    font-weight: 400;

    .succeed-icon {
      font-size: 58px;
      color: #34c724;
    }

    .succeed-text {
      color: #1f2329;
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
      margin: 16px 0;
    }

    .btn-list {
      margin-bottom: 16px;
    }

    .nolonger-tips {
      margin-bottom: 42px;
    }

    .maybe-want {
      width: 100%;
      .title {
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        width: 100%;
        margin-bottom: 8px;
      }

      .ds-info {
        display: flex;
        align-items: center;
        width: 100%;
        height: 82px;
        padding: 0 16px 0 12px;
        border-radius: 4px;
        border: 1px solid #dee0e3;
        .ds {
          font-size: 32px;
          margin-right: 14.67px;
        }

        .info {
          font-family: var(--de-custom_font, 'PingFang');
          font-style: normal;
          font-weight: 400;
          .name {
            color: #1f2329;
            font-size: 14px;
            line-height: 22px;
          }

          .size {
            color: #8f959e;
            font-size: 12px;
            line-height: 20px;
          }
        }

        .create {
          cursor: pointer;
          margin-left: auto;
          line-height: 22px;
        }
      }
    }
  }
}
</style>
