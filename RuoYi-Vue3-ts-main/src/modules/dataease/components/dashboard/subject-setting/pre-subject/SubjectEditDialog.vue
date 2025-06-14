<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from '@de/hooks/web/useI18n'
import { deepCopy } from '@de/utils/utils'
import DeUpload from '@de/components/visualization/common/DeUpload.vue'
const { t } = useI18n()
const loading = ref(false)

const rules = {
  name: [
    {
      required: true,
      message: t('commons.input_content'),
      trigger: 'change'
    },
    {
      max: 50,
      message: t('commons.char_can_not_more_50'),
      trigger: 'change'
    }
  ],
  coverUrl: [
    {
      required: true,
      message: t('components.upload_a_cover'),
      trigger: 'change'
    }
  ]
}
const subject = ref()
const subjectDialogShow = ref(false)
const optType = ref('new')

const resetForm = () => {
  subject.value.clearValidate()
  subjectDialogShow.value = false
}
const subjectForm = ref(null)
const title = computed(() =>
  optType.value === 'new' ? t('components.a_new_theme') : t('components.edit_theme')
)

const optInit = (subjectItem, opt) => {
  optType.value = opt
  subjectDialogShow.value = true
  subjectForm.value = deepCopy(subjectItem)
}

const saveSubject = () => {
  subject.value.validate(result => {
    if (result) {
      emits('finish', subjectForm.value)
    }
  })
}

defineExpose({
  optInit,
  resetForm
})

const emits = defineEmits(['finish'])
const onImgChange = imgUrl => {
  subjectForm.value.coverUrl = imgUrl
}
</script>

<template>
  <el-dialog
    v-loading="loading"
    :title="title"
    v-model="subjectDialogShow"
    width="400px"
    :before-close="resetForm"
  >
    <el-form
      label-position="top"
      require-asterisk-position="right"
      ref="subject"
      :model="subjectForm"
      :rules="rules"
    >
      <el-form-item class="form-item" prop="name">
        <template #label>
          <label class="m-label"> {{ t('common.name') }} </label>
        </template>
        <el-input v-model="subjectForm.name" />
      </el-form-item>
      <el-form-item class="form-item" prop="coverUrl">
        <template #label>
          <label class="m-label"> {{ t('components.cover') }} </label>
        </template>
        <de-upload themes="light" :img-url="subjectForm.coverUrl" @onImgChange="onImgChange" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button secondary @click="resetForm()">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="saveSubject()">{{ t('chart.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
:deep(.ed-dialog__header) {
  text-align: left;
}
.m-label {
  color: #1f2329;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 14px;
  display: inline-block;
}
.form-item {
  margin-bottom: 16px;
  :deep(.ed-form-item__label) {
    line-height: 14px !important;
  }

  :deep(.ed-input__inner) {
    font-size: 14px !important;
  }

  :deep(.ed-form-item__error) {
    top: 88%;
  }
  .ed-input {
    --ed-input-height: 32px !important;
  }

  &:last-child {
    margin-bottom: 0;
  }

  :deep(.avatar-uploader-container) {
    margin-bottom: 0px;
  }
}
</style>
