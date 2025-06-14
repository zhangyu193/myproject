<script setup lang="tsx">
import icon_info_outlined from '@de/assets/svg/icon_info_outlined.svg'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { snapshotStoreWithOut } from '@de/store/modules/data-visualization/snapshot'
import { storeToRefs } from 'pinia'
import { nextTick, onMounted, ref } from 'vue'
import { ElFormItem, ElIcon } from 'element-plus-secondary'

import { merge, cloneDeep } from 'lodash-es'
import { useEmitt } from '@de/hooks/web/useEmitt'
import ComponentColorSelector from '@de/components/dashboard/subject-setting/dashboard-style/ComponentColorSelector.vue'
import OverallSetting from '@de/components/dashboard/subject-setting/dashboard-style/OverallSetting.vue'
import CanvasBackground from '@de/components/visualization/component-background/CanvasBackground.vue'
import SeniorStyleSetting from '@de/components/dashboard/subject-setting/dashboard-style/SeniorStyleSetting.vue'
import Icon from '../icon-custom/src/Icon.vue'
import CanvasBaseSetting from '@de/components/visualization/CanvasBaseSetting.vue'
import { useI18n } from '@de/hooks/web/useI18n'
const dvMainStore = dvMainStoreWithOut()
const snapshotStore = snapshotStoreWithOut()
const { canvasStyleData, canvasViewInfo } = storeToRefs(dvMainStore)
let canvasAttrInit = false

const canvasAttrActiveNames = ref(['size', 'baseSetting', 'background', 'color'])
const { t } = useI18n()
const screenAdaptorList = [
  { label: t('visualization.screen_adaptor_width_first'), value: 'widthFirst' },
  { label: t('visualization.screen_adaptor_height_first'), value: 'heightFirst' },
  { label: t('visualization.screen_adaptor_full'), value: 'full' },
  { label: t('visualization.screen_adaptor_keep'), value: 'keep' }
]
const init = () => {
  nextTick(() => {
    canvasAttrInit = true
  })
}

const onColorChange = val => {
  themeAttrChange('customAttr', 'color', val)
}

const onStyleChange = () => {
  snapshotStore.recordSnapshotCache('renderChart')
}

const onBaseChange = () => {
  snapshotStore.recordSnapshotCache('renderChart')
  useEmitt().emitter.emit('initScroll')
}

const themeAttrChange = (custom, property, value) => {
  if (canvasAttrInit) {
    Object.keys(canvasViewInfo.value).forEach(function (viewId) {
      try {
        const viewInfo = canvasViewInfo.value[viewId]
        if (custom === 'customAttr') {
          if (viewInfo.type === 'flow-map') {
            const { customAttr } = viewInfo
            const tmpValue = cloneDeep(value)
            const miscObj = cloneDeep(customAttr.misc)
            for (const key in miscObj) {
              if (miscObj.hasOwnProperty(key) && tmpValue.misc?.[key] !== undefined) {
                tmpValue.misc[key] = miscObj[key]
              }
            }
            merge(viewInfo['customAttr'], tmpValue)
          } else {
            merge(viewInfo['customAttr'], value)
          }
        } else {
          Object.keys(value).forEach(function (key) {
            if (viewInfo[custom][property][key] !== undefined) {
              viewInfo[custom][property][key] = value[key]
            }
          })
        }
        useEmitt().emitter.emit('renderChart-' + viewId, viewInfo)
      } catch (e) {
        console.warn('themeAttrChange-error')
      }
    })
    snapshotStore.recordSnapshotCache('renderChart')
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="attr-container de-collapse-style">
    <el-collapse v-model="canvasAttrActiveNames">
      <el-collapse-item effect="dark" :title="t('visualization.size')" name="size">
        <el-form label-position="left" :label-width="14">
          <el-row :gutter="8" class="m-size">
            <el-col :span="12">
              <el-form-item class="form-item form-item-dark" label="W">
                <el-input-number
                  effect="dark"
                  size="small"
                  :min="600"
                  :max="50000"
                  v-model="canvasStyleData.width"
                  @change="onBaseChange"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item class="form-item form-item-dark" label="H">
                <el-input-number
                  effect="dark"
                  size="small"
                  :min="600"
                  :max="50000"
                  v-model="canvasStyleData.height"
                  @change="onBaseChange"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="canvasStyleData.screenAdaptor">
            <el-form-item style="margin: 8px 0 16px">
              <span class="form-item-scroll"> {{ t('visualization.screen_adaptor') }} </span>
              <el-tooltip class="item" effect="dark" placement="top">
                <template #content>
                  <div>{{ t('visualization.effective_during_preview') }}</div>
                </template>
                <el-icon class="hint-icon--dark">
                  <Icon name="icon_info_outlined"><icon_info_outlined class="svg-icon" /></Icon>
                </el-icon>
              </el-tooltip>
              <el-select
                style="width: 139px; margin: 0 0 0 8px; flex: 1"
                effect="dark"
                v-model="canvasStyleData.screenAdaptor"
                @change="onStyleChange"
                size="small"
              >
                <el-option
                  v-for="option in screenAdaptorList"
                  size="small"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-row>
        </el-form>
      </el-collapse-item>
      <el-collapse-item effect="dark" :title="t('visualization.base_config')" name="baseSetting">
        <canvas-base-setting themes="dark"></canvas-base-setting>
      </el-collapse-item>
      <el-collapse-item effect="dark" :title="t('visualization.background')" name="background">
        <canvas-background themes="dark"></canvas-background>
      </el-collapse-item>
      <el-collapse-item
        effect="dark"
        :title="t('visualization.color_config')"
        name="color"
        class="no-padding no-border-bottom"
      >
        <component-color-selector themes="dark" @onColorChange="onColorChange" />
      </el-collapse-item>
      <el-collapse-item
        effect="dark"
        :title="t('visualization.refresh_config')"
        name="overallSetting"
      >
        <overall-setting style="padding-bottom: 8px" themes="dark" />
      </el-collapse-item>
      <el-collapse-item
        effect="dark"
        :title="t('visualization.advanced_style_settings')"
        name="seniorStyleSetting"
        class="no-padding no-border-bottom"
      >
        <senior-style-setting themes="dark"></senior-style-setting>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style lang="less" scoped>
.form-item-scroll {
  font-size: 12px;
  color: @canvas-main-font-color-dark;
}
:deep(.ed-collapse-item) {
  &:first-child {
    .ed-collapse-item__header {
      border-top: none;
    }
  }
}

.de-collapse-style {
  :deep(.ed-collapse-item__header) {
    height: 36px !important;
    line-height: 36px !important;
    font-size: 12px !important;
    padding: 0 !important;
    font-weight: 500 !important;

    .ed-collapse-item__arrow {
      margin: 0 6px 0 8px;
    }
  }
  :deep(.ed-collapse-item__content) {
    padding: 16px 8px 0;
    border: none;
  }
  :deep(.ed-form-item) {
    display: block;
    margin-bottom: 8px;
  }
  :deep(.ed-form-item__label) {
    justify-content: flex-start;
  }
}

.item-show {
  display: flex;
  text-align: center;
  padding-top: 18px;
  min-width: 220px;
}

.attr-container {
  background-color: rgba(37, 45, 54, 1);
  color: #fff;
  z-index: 20;
  height: 100%;
  width: 100%;
  min-width: 220px;
}

:deep(.ed-collapse-item__wrap) {
  border-bottom: none;
}
:deep(.ed-collapse) {
  width: 100%;
}

.disabled :deep(.el-upload--picture-card) {
  display: none;
}

.avatar-uploader :deep(.ed-upload) {
  width: 80px;
  height: 80px;
  line-height: 90px;
}

.avatar-uploader :deep(.ed-upload-list li) {
  width: 80px !important;
  height: 80px !important;
}
.avatar-uploader :deep(.ed-upload--picture-card) {
  background: rgba(0, 0, 0, 0);
}
.img-area {
  width: 80px;
  height: 80px;
  margin-top: 0px;
  margin-bottom: 20px;
  overflow: hidden;
}

.color-picker-style {
  cursor: pointer;
  z-index: 1003;
}

.color-label {
  display: inline-block;
  width: 60px;
}

.color-type :deep(.ed-radio__input) {
  display: none;
}

.ed-radio {
  color: #757575;
}

.custom-color-style :deep(.ed-radio) {
  margin: 0 2px 0 0 !important;
  border: 1px solid transparent;
}

.custom-color-style :deep(.ed-radio__label) {
  padding-left: 0;
}

.custom-color-style :deep(.ed-radio.is-checked) {
  border: 1px solid #0a7be0;
}

.image-hint {
  color: #8f959e;
  size: 14px;
  line-height: 22px;
  font-weight: 400;
  margin-top: 2px;
}

.re-update-span {
  cursor: pointer;
  color: var(--ed-color-primary);
  size: 14px;
  line-height: 22px;
  font-weight: 400;
}

.m-size {
  :deep(.ed-form-item) {
    display: flex !important;
  }
}

:deep(.ed-form-item) {
  .ed-radio.ed-radio--small .ed-radio__inner {
    width: 14px;
    height: 14px;
  }
  .ed-input__inner {
    font-size: 12px;
    font-weight: 400;
  }
  .ed-input {
    --ed-input-height: 28px;

    .ed-input__suffix {
      height: 26px;
    }
  }
  .ed-input-number {
    width: 100%;

    .ed-input-number__decrease {
      --ed-input-number-controls-height: 13px;
    }
    .ed-input-number__increase {
      --ed-input-number-controls-height: 13px;
    }

    .ed-input__inner {
      text-align: start;
    }
  }
  .ed-select {
    width: 100%;
    .ed-input__inner {
      height: 26px !important;
    }
  }
  .ed-checkbox {
    .ed-checkbox__label {
      font-size: 12px;
    }
  }
  .ed-color-picker {
    .ed-color-picker__mask {
      height: 26px;
      width: calc(100% - 2px) !important;
    }
  }
  .ed-radio {
    height: 20px;
    .ed-radio__label {
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
    }
  }

  &.margin-bottom-8 {
    margin-bottom: 8px;
  }
}
:deep(.ed-checkbox__label) {
  color: #1f2329;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
}
:deep(.ed-checkbox--dark) {
  .ed-checkbox__label {
    color: @dv-canvas-main-font-color;
  }
}

:deep(.ed-form-item__label) {
  color: @canvas-main-font-color;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
}
:deep(.form-item-dark) {
  .ed-form-item__label {
    color: @canvas-main-font-color-dark;
  }
}
.no-padding {
  :deep(.ed-collapse-item__content) {
    padding: 0 !important;
  }
}
.no-border-bottom {
  :deep(.ed-collapse-item__wrap) {
    border-bottom: none;
  }
}

.hint-icon--dark {
  color: #a6a6a6;
}
</style>
