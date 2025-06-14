<template>
  <div
    :class="[
      {
        ['background-selected']: themeSelected
      },
      'subject-template'
    ]"
  >
    <div>
      <div class="vertical-layout" @click.stop="subjectChange">
        <img
          v-if="subjectItem.coverUrl"
          :src="imgUrlTrans(subjectItem.coverUrl)"
          alt=""
          width="172"
          height="79"
        />
        <Icon v-else name="dv-no-img"
          ><dvNoImg class="svg-icon" style="width: 172px; height: 79px"
        /></Icon>
      </div>
      <div class="title-main">
        <div class="title-area">
          <span style="margin-top: 8px; margin-left: 8px" :title="t(subjectItem.name)">{{
            t(subjectItem.name)
          }}</span>
        </div>
        <div class="edit-area" v-if="subjectItem.type === 'self'">
          <el-tooltip effect="dark" placement="top" :content="$t('common.delete')">
            <el-button text class="m-custom-icon" @click="subjectDelete()">
              <el-icon size="14px">
                <Delete />
              </el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip effect="dark" placement="top" :content="$t('common.edit')">
            <el-button text class="m-custom-icon" style="margin-left: 2px" @click="subjectEdit()">
              <el-icon size="14px"> <EditPen /> </el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dvNoImg from '@de/assets/svg/dv-no-img.svg'
import { computed, onMounted, reactive, toRefs } from 'vue'
import { imgUrlTrans } from '@de/utils/imgUtils'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { snapshotStoreWithOut } from '@de/store/modules/data-visualization/snapshot'

import { storeToRefs } from 'pinia'
import { ElMessageBox, ElTooltip } from 'element-plus-secondary'
import Icon from '@de/components/icon-custom/src/Icon.vue'
import { adaptCurThemeCommonStyleAll } from '@de/utils/canvasStyle'
import { useEmitt } from '@de/hooks/web/useEmitt'
const dvMainStore = dvMainStoreWithOut()
const snapshotStore = snapshotStoreWithOut()
import { useI18n } from '@de/hooks/web/useI18n'

const { canvasStyleData } = storeToRefs(dvMainStore)

const state = reactive({
  defaultSubject: {},
  subjectItemDetails: null,
  canEdit: false
})
const { t } = useI18n()

const props = defineProps({
  subjectItem: {
    type: Object,
    required: true
  }
})
const { subjectItem } = toRefs(props)

const themeSelected = computed(() => {
  return (
    state.subjectItemDetails && state.subjectItemDetails.themeId === canvasStyleData.value.themeId
  )
})
const emit = defineEmits(['subjectDelete', 'onSubjectChange', 'subjectEdit'])
const subjectDelete = () => {
  ElMessageBox.confirm(t('components.to_delete_', [subjectItem.value.name]), {
    confirmButtonType: 'danger',
    type: 'warning',
    autofocus: false,
    showClose: false
  }).then(() => {
    emit('subjectDelete', subjectItem.value.id)
  })
}

const subjectEdit = () => {
  emit('subjectEdit')
}

const subjectChange = () => {
  if (!themeSelected.value) {
    dvMainStore.setCanvasStyle(JSON.parse(subjectItem.value.details))
    snapshotStore.recordSnapshotCache('renderChart')
    adaptCurThemeCommonStyleAll()
    useEmitt().emitter.emit('onSubjectChange')
  }
}

onMounted(() => {
  try {
    state.subjectItemDetails = JSON.parse(subjectItem.value.details)
  } catch (e) {
    // do error parse
  }
})
</script>

<style scoped lang="less">
.all-back {
  background-size: 100% 100% !important;
}

.subject-template {
  position: relative;
  z-index: 2;
  display: inline-block;
  float: left;
  width: 182px;
  height: 116px;
  margin: 4px;
  border: 1px solid #dee0e3;
  border-radius: 5px;
}

.subject-template:hover {
  color: deepskyblue;
  cursor: pointer;
  border-color: var(--ed-color-primary-99, rgba(51, 112, 255, 0.6));
}

.demonstration {
  display: block;
  width: 150px;
  margin: 10px auto;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vertical-layout {
  padding: 4px 4px 0 4px;
  width: 180px;
  height: 84px;
  margin: 0 auto;
  overflow: hidden;
  //inset: 0 0 30px;
  box-sizing: border-box;
  background-size: contain;
}

.vertical-layout > i {
  position: relative;
  float: right;
  margin: 2px;
  color: gray;
}

.vertical-layout > i:hover {
  color: red;
}

.theme-selected-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  font-size: 16px;
  color: #4b8fdf;
}

.title-area {
  height: 30px;
  margin-right: 1px;
  margin-left: 1px;
  overflow: hidden;
  font-size: 12px;
  line-height: 30px;
  color: #1f2329;
  text-align: left;
  text-overflow: ellipsis;
  white-space: pre;
  flex: 1;
}

.common-background {
  position: absolute;
  border-radius: 5px 5px 0 0;
}

.background-selected {
  border: solid 1px var(--ed-color-primary) !important;
  .title-main {
    background: var(--ed-color-primary-1a, rgba(51, 112, 255, 0.1));
  }
}

.delete-icon {
  position: absolute;
  right: 8px;
  bottom: 8px;
}

.delete-icon:hover {
  color: red;
}

.title-main {
  height: 31px;
  display: flex;
  border-top: 1px solid #dee0e3;
  width: 180px;
}

.subject-template:hover :deep(.m-custom-icon) {
  display: block;
}

.subject-template :deep(.ed-input__wrapper) {
  box-shadow: 0 0 0 0;
}

.chart-area {
  background-size: 100% 100% !important;
}

.edit-area {
  padding: 0 8px;
  display: flex;
  align-items: center;
  line-height: 35px;
}

.m-custom-icon {
  display: none;
  color: #646a73;

  &:hover {
    background: rgba(31, 35, 41, 0.1) !important;
  }
  &:focus {
    background: rgba(31, 35, 41, 0.1) !important;
  }
  &:active {
    background: rgba(31, 35, 41, 0.2) !important;
  }
}
</style>
