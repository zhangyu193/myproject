<template>
  <InfoTemplate
    ref="infoTemplate"
    setting-key="basic"
    showValidate
    style="padding-bottom: 0"
    :setting-title="t('system.engine_settings')"
    :setting-data="templateList"
    @edit="edit"
    @check="validateById"
  />
  <div class="de-expand_content" :style="{ marginBottom: showPriority ? '4px' : '24px' }">
    <div class="de-expand-engine" @click="showPriority = !showPriority">
      {{ t('datasource.priority') }}
      <el-icon>
        <Icon
          ><component
            class="svg-icon"
            :is="showPriority ? icon_down_outlined : icon_down_outlined1"
          ></component
        ></Icon>
      </el-icon>
    </div>
  </div>
  <InfoTemplate
    v-if="showPriority"
    ref="infoTemplateTime"
    style="padding-top: 0"
    hide-head
    :setting-data="templateListTime"
  />
</template>

<script lang="ts" setup>
import icon_down_outlined1 from '@de/assets/svg/icon_down_outlined-1.svg'
import icon_down_outlined from '@de/assets/svg/icon_down_outlined.svg'
import { ref, nextTick } from 'vue'
import { SettingRecord } from '@de/views/system/common/SettingTemplate'
import { ElMessage } from 'element-plus-secondary'
import { useI18n } from '@de/hooks/web/useI18n'
import InfoTemplate from '@de/views/system/common/InfoTemplate.vue'
import { dsTypes } from '@de/views/visualized/data/datasource/form/option'
import { getDeEngine } from '@de/api/datasource'
import request from '@de/config/axios'
import { querySymmetricKey } from '@de/api/login'
import { symmetricDecrypt } from '@de/utils/encryption'
const { t } = useI18n()
const typeMap = dsTypes.reduce((pre, next) => {
  pre[next.type] = next.name
  return pre
}, {})
const showPriority = ref(true)
let nodeInfoId
const infoTemplate = ref()
const infoTemplateTime = ref()
const templateList = ref<SettingRecord[]>([])
const templateListTime = ref<SettingRecord[]>([])
const getEngine = () => {
  querySymmetricKey().then(response => {
    getDeEngine().then(res => {
      let { id, type, configuration } = res.data
      if (configuration) {
        configuration = JSON.parse(symmetricDecrypt(configuration, response.data))
      }
      nodeInfoId = id
      templateListTime.value = [
        {
          pkey: 'datasource.initial_pool_size',
          pval: configuration?.initialPoolSize || 5,
          type: '',
          sort: 0
        },
        {
          pkey: 'datasource.min_pool_size',
          pval: configuration?.minPoolSize || 5,
          type: '',
          sort: 0
        },
        {
          pkey: 'datasource.max_pool_size',
          pval: configuration?.maxPoolSize || 5,
          type: '',
          sort: 0
        },
        {
          pkey: 'datasource.query_timeout',
          pval: `${configuration?.queryTimeout || 30}${t('common.second')}`,
          type: '',
          sort: 0
        }
      ]

      templateList.value = [
        {
          pkey: t('system.engine_type'),
          pval: typeMap[type],
          type: '',
          sort: 0
        },
        {
          pkey: 'datasource.host',
          pval: configuration?.host,
          type: '',
          sort: 0
        },
        {
          pkey: 'datasource.port',
          pval: configuration?.port,
          type: '',
          sort: 0
        },
        {
          pkey: 'datasource.data_base',
          pval: configuration?.dataBase,
          type: '',
          sort: 0
        },
        {
          pkey: 'datasource.user_name',
          pval: configuration?.username,
          type: '',
          sort: 0
        },
        {
          pkey: 'datasource.extra_params',
          pval: configuration?.extraParams,
          type: '',
          sort: 0
        }
      ]
      nextTick(() => {
        infoTemplate.value.init()
        infoTemplateTime.value.init()
      })
    })
  })
}
getEngine()

defineExpose({
  getEngine
})
const emits = defineEmits(['edit'])
const edit = () => {
  emits('edit')
}

const validateById = async () => {
  request.post({ url: '/engine/validate/' + nodeInfoId }).then(res => {
    if (res !== undefined) {
      ElMessage.success(t('datasource.validate_success'))
    }
  })
}
</script>
<style lang="less" scoped>
.de-expand_content {
  height: 22px;
  display: inline-flex;
  align-items: center;
  .de-expand-engine {
    font-family: var(--de-custom_font, 'PingFang');
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: var(--ed-color-primary);
    cursor: pointer;
    margin-left: 24px;
    height: 22px;
    display: inline-flex;
    align-items: center;

    .ed-icon {
      margin-left: 4px;
    }
  }
}
</style>
