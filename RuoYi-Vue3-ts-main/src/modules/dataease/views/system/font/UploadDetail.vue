<script lang="ts" setup>
import icon_upload_outlined from '@de/assets/svg/icon_upload_outlined.svg'
import { ref, reactive } from 'vue'
import { uploadFontFile } from '@de/api/font'
import { useI18n } from '@de/hooks/web/useI18n'
import FontInfo from './FontInfo.vue'
import { ElMessage } from 'element-plus-secondary'
import { edit } from '@de/api/font'
import { cloneDeep } from 'lodash-es'

const state = reactive({
  fileList: null
})
const loading = ref(false)
const upload = ref()
const { t } = useI18n()
const uploadExcel = () => {
  const formData = new FormData()
  formData.append('file', state.fileList.raw)
  loading.value = true
  return uploadFontFile(formData)
    .then(res => {
      ruleForm.name = res.data.name
      ruleForm.size = res.data.size
      ruleForm.sizeType = res.data.sizeType
      ruleForm.fileTransName = res.data.fileTransName
      ruleForm.fileName = state.fileList.raw.name
      upload.value?.clearFiles()
    })
    .catch(error => {
      if (error.code === 'ECONNABORTED') {
        ElMessage({
          type: 'error',
          message: error.message,
          showClose: true
        })
      }
    })
    .finally(() => {
      loading.value = false
    })
}
const dialogTitle = ref('')
const dialogVisible = ref(false)
const action = ref('')
const defaultForm = {
  id: null,
  name: '',
  fileName: '',
  fileTransName: '',
  size: 0,
  sizeType: '',
  isDefault: 0,
  isBuiltin: 0,
  updateTime: 0
}
const ruleForm = reactive(cloneDeep(defaultForm))

const init = (val, type, item) => {
  dialogTitle.value = val || t('system.add_font')
  action.value = type
  dialogVisible.value = true
  Object.assign(ruleForm, cloneDeep(defaultForm))
  Object.assign(ruleForm, JSON.parse(JSON.stringify(item)))
}

const fontDel = () => {
  state.fileList = null
}

const ruleFormRef = ref()
const rules = {
  name: [
    { required: true, message: t('system.the_font_name'), trigger: 'blur' },
    { min: 1, max: 50, message: t('system.character_length_1_50'), trigger: 'blur' }
  ]
}
defineExpose({
  init
})

const beforeAvatarUpload = rawFile => {
  if (!rawFile.name.toLocaleLowerCase().endsWith('.ttf')) {
    ElMessage.error(t('system.in_ttf_format'))
    return false
  }
  return true
}
const onChange = file => {
  if (file.raw?.name?.toLocaleLowerCase().endsWith('.ttf')) {
    state.fileList = file
  }
}

const uploadFail = response => {
  let myError = response.toString()
  myError.replace('Error: ', '')
}

const emits = defineEmits(['finish'])
const cancel = () => {
  Object.assign(ruleForm, cloneDeep(defaultForm))
  ruleFormRef.value.clearValidate()
  state.fileList = null
  dialogVisible.value = false
}
const confirm = () => {
  ruleFormRef.value.validate(val => {
    if (val) {
      if (action.value === 'uploadFile') {
        if (ruleForm.fileTransName === '') {
          ElMessage.error(t('system.upload_font_file_de'))
          return
        }
      }
      edit(ruleForm).then(() => {
        ElMessage.success(dialogTitle.value + t('data_set.success'))
        cancel()
        emits('finish')
      })
    }
  })
}
</script>

<template>
  <el-dialog
    class="create-dialog add-form_font_dialog"
    v-model="dialogVisible"
    :before-close="cancel"
    :title="dialogTitle"
    width="420"
  >
    <el-form
      @submit.prevent
      ref="ruleFormRef"
      :model="ruleForm"
      label-position="top"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
    >
      <el-form-item v-if="action !== 'uploadFile'" :label="t('system.font_name')" prop="name">
        <el-input :placeholder="t('system.the_font_name')" v-model.trim="ruleForm.name" />
      </el-form-item>
      <el-form-item
        v-loading="loading"
        v-if="action !== 'rename'"
        :label="t('system.font_file_de')"
      >
        <el-upload
          action=""
          :multiple="false"
          ref="uploadAgain"
          :show-file-list="false"
          accept=".ttf"
          :on-change="onChange"
          :before-upload="beforeAvatarUpload"
          :http-request="uploadExcel"
          :on-error="uploadFail"
          name="file"
          v-show="!state.fileList"
        >
          <template #trigger>
            <el-button secondary>
              <template #icon>
                <Icon name="icon_upload_outlined"><icon_upload_outlined class="svg-icon" /></Icon>
              </template>
              {{ t('system.upload_font_file') }}
            </el-button>
          </template>
        </el-upload>
        <FontInfo
          @del="fontDel"
          v-show="state.fileList"
          :size="ruleForm.size + ' ' + ruleForm.sizeType"
          :name="ruleForm.fileName"
        ></FontInfo>
        <el-upload
          action=""
          :multiple="false"
          ref="uploadAgain"
          :before-upload="beforeAvatarUpload"
          :show-file-list="false"
          accept=".ttf"
          :on-change="onChange"
          :http-request="uploadExcel"
          :on-error="uploadFail"
          name="file"
          v-show="state.fileList"
        >
          <template #trigger>
            <el-button text> {{ t('data_source.reupload') }} </el-button>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">{{ t('userimport.cancel') }}</el-button>
        <el-button v-loading="loading" type="primary" @click="confirm">
          {{ t('userimport.sure') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less">
.add-form_font_dialog {
  .ed-dialog__footer {
    border: none;
    padding-top: 0;
    margin-top: -2px;
  }
}
</style>
