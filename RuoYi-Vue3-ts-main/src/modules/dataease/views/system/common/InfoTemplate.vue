<template>
  <div class="info-template-container">
    <div v-if="!props.hideHead" class="info-template-header">
      <div class="info-template-title">
        <span>{{ curTitle }}</span>
      </div>
      <div>
        <el-button v-if="testConnectText" secondary @click="check">{{ testConnectText }}</el-button>
        <el-button v-if="showValidate" secondary @click="check">{{
          t('datasource.validate')
        }}</el-button>
        <el-button type="primary" @click="edit">{{ t('commons.edit') }}</el-button>
      </div>
    </div>
    <div class="info-template-content clearfix">
      <div class="info-content-item" v-for="item in settingList" :key="item.pkey">
        <div class="info-item-label">
          <span>{{ t(item.pkey) }}</span>
          <el-tooltip
            v-if="tooltipItem[item.pkey]"
            effect="dark"
            :content="tooltipItem[item.pkey]"
            placement="top"
          >
            <el-icon class="info-tips"
              ><Icon name="dv-info"><dvInfo class="svg-icon" /></Icon
            ></el-icon>
          </el-tooltip>
        </div>
        <div class="info-item-content">
          <div class="info-item-pwd" v-if="item.type === 'pwd'">
            <span class="info-item-pwd-span">{{
              pwdItem[item.pkey]['hidden'] ? '********' : item.pval
            }}</span>

            <el-tooltip
              v-if="props.copyList.includes(item.pkey)"
              effect="dark"
              :content="t('common.copy')"
              placement="top"
            >
              <el-button text @click="copyVal(item.pval)" class="setting-tip-btn">
                <template #icon>
                  <Icon name="de-copy"><deCopy class="svg-icon" /></Icon>
                </template>
              </el-button>
            </el-tooltip>

            <el-tooltip
              effect="dark"
              :content="
                pwdItem[item.pkey]['hidden'] ? t('system.click_to_show') : t('system.click_to_hide')
              "
              placement="top"
            >
              <el-button text @click="switchPwd(item.pkey)" class="setting-tip-btn">
                <template #icon>
                  <Icon
                    ><component
                      class="svg-icon"
                      :is="pwdItem[item.pkey]['hidden'] ? eye : eyeOpen"
                    ></component
                  ></Icon>
                </template>
              </el-button>
            </el-tooltip>
          </div>
          <span v-else-if="item.pkey.includes('basic.dsIntervalTime')">
            <span>{{ item.pval + ' ' + executeTime + t('common.every_exec') }}</span>
          </span>
          <span v-else>
            <span>{{ item.pval }}</span>
            <el-tooltip
              v-if="props.copyList.includes(item.pkey)"
              effect="dark"
              :content="t('common.copy')"
              placement="top"
            >
              <el-button text @click="copyVal(item.pval)" class="setting-tip-btn">
                <template #icon>
                  <Icon name="de-copy"><deCopy class="svg-icon" /></Icon>
                </template>
              </el-button>
            </el-tooltip>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import eye from '@de/assets/svg/eye.svg'
import eyeOpen from '@de/assets/svg/eye-open.svg'
import dvInfo from '@de/assets/svg/dv-info.svg'
import deCopy from '@de/assets/svg/de-copy.svg'
import { ref, defineProps, PropType, computed } from 'vue'
import { useI18n } from '@de/hooks/web/useI18n'
import { SettingRecord, ToolTipRecord } from './SettingTemplate'
import useClipboard from 'vue-clipboard3'
import { ElMessage } from 'element-plus-secondary'
const { toClipboard } = useClipboard()
const { t } = useI18n()
const props = defineProps({
  settingKey: {
    type: String,
    default: 'basic'
  },
  labelTooltips: {
    type: Array as PropType<ToolTipRecord[]>,
    default: () => []
  },
  settingData: {
    type: Array as PropType<SettingRecord[]>,
    default: () => []
  },
  settingTitle: {
    type: String,
    default: ''
  },
  hideHead: {
    type: Boolean,
    default: false
  },
  showValidate: {
    type: Boolean,
    default: false
  },
  testConnectText: {
    type: String,
    default: null
  },
  copyList: {
    type: Array as PropType<string[]>,
    default: () => []
  }
})
const executeTime = ref(t('system.and_0_seconds'))
const curTitle = computed(() => {
  return props.settingTitle || t('system.basic_settings')
})
const copyVal = async val => {
  try {
    await toClipboard(val)
    ElMessage.success(t('common.copy_success'))
  } catch (e) {
    ElMessage.warning(t('common.copy_unsupported'), e)
  }
}
const loadList = () => {
  settingList.value = []
  if (props.settingData?.length) {
    props.settingData.forEach(item => {
      if (item.pkey.includes('basic.dsExecuteTime')) {
        executeTime.value = getExecuteTime(item.pval)
      } else {
        settingList.value.push(item)
      }
    })
  }
}

const getExecuteTime = val => {
  const options = [
    { value: 'minute', label: t('system.time_0_seconds') },
    { value: 'hour', label: t('system.and_0_seconds_de') }
  ]
  return options.filter(item => item.value === val)[0].label
}

const settingList = ref([] as SettingRecord[])

const init = () => {
  if (props.settingData?.length) {
    loadList()
  }
}
const pwdItem = ref({})

const formatPwd = () => {
  settingList.value.forEach(setting => {
    if (setting.type === 'pwd') {
      pwdItem.value[setting.pkey] = { hidden: true }
    }
  })
}

const tooltipItem = ref({})
const formatLabel = () => {
  props.labelTooltips?.length &&
    props.labelTooltips.forEach(tooltip => {
      tooltipItem.value[tooltip.key] = tooltip.val
    })
}

const switchPwd = (pkey: string) => {
  pwdItem.value[pkey]['hidden'] = !pwdItem.value[pkey]['hidden']
}

const emits = defineEmits(['edit', 'check'])
const edit = () => {
  emits('edit')
}

const check = () => {
  emits('check')
}
defineExpose({
  init
})
init()
formatPwd()
formatLabel()
</script>

<style lang="less" scope>
.setting-tip-btn {
  height: 24px !important;
  width: 24px !important;
  margin-left: 4px !important;
  .ed-icon {
    font-size: 16px;
  }
}
.info-template-container {
  padding: 24px 24px 8px 24px;
  background: var(--ContentBG, #ffffff);
  border-radius: 4px;
  .info-template-header {
    display: flex;
    margin-top: -4px;
    align-items: center;
    justify-content: space-between;
    .info-template-title {
      height: 24px;
      line-height: 23px;
      font-size: 16px;
      font-weight: 500;
      color: #1f2329;
    }
  }
  .info-template-content {
    width: 100%;
    margin-top: 12px;
    .info-content-item {
      width: 50%;
      float: left;
      margin-bottom: 16px;
      min-height: 46px;
      .info-item-label {
        height: 22px;
        line-height: 22px;
        display: flex;
        align-items: center;
        span {
          font-size: 14px;
          color: #646a73;
          font-weight: 400;
        }
        i {
          margin-left: 2px;
        }
      }
      .info-item-content {
        line-height: 22px;
        span {
          font-size: 14px;
          color: #1f2329;
          font-weight: 400;
        }

        .info-item-pwd {
          height: 22px;
          line-height: 22px;
          width: 100%;
          display: flex;
          align-items: center;
          i {
            margin-left: 2px;
          }
          .info-item-pwd-span {
            max-width: calc(100% - 84px);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
  .clearfix::after {
    content: '';
    display: table;
    clear: both;
  }
}
</style>
