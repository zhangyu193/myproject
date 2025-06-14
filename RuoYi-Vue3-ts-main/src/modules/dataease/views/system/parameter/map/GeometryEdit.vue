<script lang="ts" setup>
import dvInfo from '@de/assets/svg/dv-info.svg'
import icon_upload_outlined from '@de/assets/svg/icon_upload_outlined.svg'
import deJson from '@de/assets/svg/de-json.svg'
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElLoading } from 'element-plus-secondary'
import { useI18n } from '@de/hooks/web/useI18n'
import type {
  FormInstance,
  FormRules,
  UploadRequestOptions,
  UploadProps
} from 'element-plus-secondary'
import request from '@de/config/axios'
import { GeometryFrom } from './interface'
import { useCache } from '@de/hooks/web/useCache'
const { wsCache } = useCache()
const { t } = useI18n()
const dialogVisible = ref(false)
const loadingInstance = ref(null)
const geoForm = ref<FormInstance>()
const geoFile = ref()
const state = reactive({
  form: reactive<GeometryFrom>({
    pid: null,
    code: null,
    name: null,
    fileName: null
  }),
  treeData: []
})
const treeProps = {
  value: 'id',
  label: 'name',
  disabled: 'readOnly'
}
const formatPid = computed(() => {
  if (!state.form.pid) return ''
  const pid = state.form.pid
  return pid.replace(/(0+)$/g, '').replace(/\D/g, '')
})
const codeTips = ref(t('system.at_the_end'))
const pidChange = () => {
  state.form.code = null
}
const validateCode = (_: any, value: any, callback: any) => {
  const isCountry = !formatPid.value
  if (isCountry) {
    const reg = /^[0-9]\d{2}$/
    if (!reg.test(value) || value === '000') {
      const msg = t('system.non_zero_three_digit_number')
      callback(new Error(msg))
    } else {
      callback()
    }
  } else {
    const fullValue = formatPid.value + value
    const reg = /^[1-9](\d{8}|\d{10})$/
    if (!reg.test(fullValue)) {
      const msg = t('system.or_11_digits')
      callback(new Error(msg))
    } else {
      callback()
    }
  }
}
const rule = reactive<FormRules>({
  pid: [
    {
      required: true,
      message: t('common.require'),
      trigger: 'change'
    }
  ],
  code: [
    {
      required: true,
      message: t('common.require'),
      trigger: 'blur'
    },
    { validator: validateCode, trigger: 'blur' }
  ],
  name: [
    {
      required: true,
      message: t('common.require'),
      trigger: 'blur'
    }
  ],
  fileName: [
    {
      required: true,
      message: t('common.require'),
      trigger: 'blur'
    }
  ]
})

const edit = (pid?: string) => {
  const key = 'de-area-tree'
  state.treeData = wsCache.get(key)
  state.form.pid = pid
  state.form.code = null
  state.form.name = null
  geoFile.value = null
  state.form.fileName = null
  dialogVisible.value = true
}

const emits = defineEmits(['saved'])

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(valid => {
    if (valid) {
      const param = { ...state.form }
      param['code'] = formatPid.value ? formatPid.value + param['code'] : param['code']
      const formData = buildFormData(geoFile.value, param)
      showLoading()
      request
        .post({ url: '/geometry/save', data: formData, headersType: 'multipart/form-data;' })
        .then(res => {
          if (!res.msg) {
            ElMessage.success(t('common.save_success'))
            emits('saved')
            reset()
          }
          closeLoading()
        })
        .catch(() => {
          closeLoading()
        })
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  geoFile.value = null
  formEl.resetFields()
  dialogVisible.value = false
}

const reset = () => {
  resetForm(geoForm.value)
}

const showLoading = () => {
  loadingInstance.value = ElLoading.service({ target: '.geometry-info-drawer' })
}
const closeLoading = () => {
  loadingInstance.value?.close()
}
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(t('userimport.exceedMsg'))
}
const handleError = () => {
  ElMessage.warning(t('system.contact_the_administrator'))
}
const setFile = (options: UploadRequestOptions) => {
  geoFile.value = options.file
  state.form.fileName = options.file.name
}
const uploadValidate = file => {
  const suffix = file.name.substring(file.name.lastIndexOf('.') + 1)
  if (suffix !== 'json') {
    ElMessage.warning(t('system.upload_json_files'))
    return false
  }

  if (file.size / 1024 / 1024 > 200) {
    ElMessage.warning(t('system.maximum_upload_200m'))
    return false
  }
  return true
}
const buildFormData = (file, param) => {
  const formData = new FormData()
  if (file) {
    formData.append('file', file)
  }
  formData.append('request', new Blob([JSON.stringify(param)], { type: 'application/json' }))
  return formData
}
defineExpose({
  edit
})
</script>

<template>
  <el-drawer
    :title="t('system.geographic_information')"
    v-model="dialogVisible"
    modal-class="geometry-info-drawer"
    size="600px"
    direction="rtl"
  >
    <el-form
      ref="geoForm"
      require-asterisk-position="right"
      :model="state.form"
      :rules="rule"
      label-width="80px"
      label-position="top"
    >
      <el-form-item :label="t('system.superior_region')" prop="pid">
        <el-tree-select
          class="map-tree-selector"
          node-key="id"
          v-model="state.form.pid"
          :props="treeProps"
          :data="state.treeData"
          check-strictly
          :render-after-expand="false"
          :placeholder="t('common.please_select')"
          @current-change="pidChange"
        />
      </el-form-item>

      <el-form-item :label="t('system.region_code')" prop="code">
        <template v-slot:label>
          <span class="area-code-label">
            <span>{{ t('system.region_code') }}</span>
            <el-tooltip effect="dark" :content="codeTips" placement="top">
              <el-icon class="info-tips"
                ><Icon name="dv-info"><dvInfo class="svg-icon" /></Icon
              ></el-icon>
            </el-tooltip>
          </span>
        </template>

        <el-input v-if="state.form.pid" v-model="state.form.code">
          <template #prefix>
            {{ formatPid }}
          </template>
        </el-input>
        <el-tooltip
          v-else
          class="box-item"
          effect="dark"
          :content="t('system.superior_region_first')"
          placement="top"
        >
          <el-input v-model="state.form.code" disabled />
        </el-tooltip>
      </el-form-item>

      <el-form-item :label="t('system.region_name')" prop="name">
        <el-input v-model="state.form.name" />
      </el-form-item>

      <div class="geo-label-mask" />
      <el-form-item :label="t('system.coordinate_file')" prop="fileName">
        <el-upload
          class="upload-geo"
          action=""
          accept=".json"
          :on-exceed="handleExceed"
          :before-upload="uploadValidate"
          :on-error="handleError"
          :show-file-list="false"
          :http-request="setFile"
        >
          <el-input
            :placeholder="t('userimport.placeholder')"
            readonly
            v-model="state.form.fileName"
          >
            <template #suffix>
              <el-icon>
                <Icon name="icon_upload_outlined"><icon_upload_outlined class="svg-icon" /></Icon>
              </el-icon>
            </template>
            <template #prefix>
              <el-icon v-if="!!state.form.fileName">
                <Icon name="de-json"><deJson class="svg-icon" /></Icon>
              </el-icon>
            </template>
          </el-input>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm(geoForm)">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm(geoForm)">
          {{ t('commons.save') }}
        </el-button>
      </span>
    </template>
  </el-drawer>
</template>
<style lang="less">
.geometry-info-drawer {
  .ed-drawer__footer {
    height: 64px !important;
    padding: 16px 24px !important;
    .dialog-footer {
      height: 32px;
      line-height: 32px;
    }
  }
  .ed-form-item__label {
    line-height: 22px !important;
    height: 22px !important;
  }
  .ed-form-item {
    margin-bottom: 16px;
  }
  .is-error {
    margin-bottom: 40px !important;
  }
}
</style>
<style scoped lang="less">
.map-tree-selector {
  width: 100%;
}
.geo-btn-container {
  position: absolute;
  bottom: 33px;
  right: 0px;
}
.upload-geo {
  width: 100%;
  height: 32px;
  :deep(.ed-upload) {
    width: 100% !important;
  }
}
.geo-label-mask {
  position: absolute;
  width: calc(100% - 48px);
  height: 30px;
}
.area-code-label {
  display: inline-flex;
  align-items: center;
  i {
    margin-left: 4px;
  }
}
</style>
