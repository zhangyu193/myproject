<script lang="ts" setup>
import icon_letterSpacing_outlined from '@de/assets/svg/icon_letter-spacing_outlined.svg'
import icon_bold_outlined from '@de/assets/svg/icon_bold_outlined.svg'
import icon_italic_outlined from '@de/assets/svg/icon_italic_outlined.svg'
import icon_leftAlignment_outlined from '@de/assets/svg/icon_left-alignment_outlined.svg'
import icon_centerAlignment_outlined from '@de/assets/svg/icon_center-alignment_outlined.svg'
import icon_rightAlignment_outlined from '@de/assets/svg/icon_right-alignment_outlined.svg'
import icon_topAlign_outlined from '@de/assets/svg/icon_top-align_outlined.svg'
import icon_verticalAlign_outlined from '@de/assets/svg/icon_vertical-align_outlined.svg'
import icon_bottomAlign_outlined from '@de/assets/svg/icon_bottom-align_outlined.svg'
import { PropType, computed, onMounted, reactive, watch, nextTick } from 'vue'
import { useI18n } from '@de/hooks/web/useI18n'
import {
  COLOR_PANEL,
  CHART_FONT_LETTER_SPACE,
  DEFAULT_INDICATOR_STYLE,
  DEFAULT_BASIC_STYLE,
  CHART_FONT_FAMILY_ORIGIN
} from '@de/views/chart/components/editor/util/chart'
import { cloneDeep, defaultsDeep } from 'lodash-es'
import { ElIcon, ElInput } from 'element-plus-secondary'
import Icon from '@de/components/icon-custom/src/Icon.vue'
import { useAppearanceStoreWithOut } from '@de/store/modules/appearance'
const appearanceStore = useAppearanceStoreWithOut()

const { t } = useI18n()

const props = defineProps({
  chart: {
    type: Object,
    required: true
  },
  themes: {
    type: String as PropType<EditorTheme>,
    default: 'dark'
  },
  propertyInner: {
    type: Array<string>
  }
})

const emit = defineEmits(['onIndicatorChange', 'onBasicStyleChange'])
const toolTip = computed(() => {
  return props.themes === 'dark' ? 'light' : 'dark'
})
const predefineColors = COLOR_PANEL
const fontFamily = CHART_FONT_FAMILY_ORIGIN.concat(
  appearanceStore.fontList.map(ele => ({
    name: ele.name,
    value: ele.name
  }))
)
const fontLetterSpace = CHART_FONT_LETTER_SPACE

const state = reactive({
  indicatorValueForm: JSON.parse(JSON.stringify(DEFAULT_INDICATOR_STYLE)),
  basicStyleForm: {} as ChartBasicStyle
})
const fontSizeList = computed(() => {
  const arr = []
  for (let i = 10; i <= 60; i = i + 2) {
    arr.push({
      name: i + '',
      value: i
    })
  }
  for (let i = 70; i <= 210; i += 10) {
    arr.push({
      name: i + '',
      value: i
    })
  }
  return arr
})

const changeLabelTitleStyleStyle = prop => {
  emit('onIndicatorChange', state.indicatorValueForm, prop)
}

const init = () => {
  const TEMP_DEFAULT_BASIC_STYLE = cloneDeep(DEFAULT_BASIC_STYLE)
  delete TEMP_DEFAULT_BASIC_STYLE.alpha

  state.basicStyleForm = defaultsDeep(
    cloneDeep(props.chart?.customAttr?.basicStyle),
    cloneDeep(TEMP_DEFAULT_BASIC_STYLE)
  )

  const customText = defaultsDeep(
    cloneDeep(props.chart?.customAttr?.indicator),
    cloneDeep(DEFAULT_INDICATOR_STYLE)
  )

  state.indicatorValueForm = cloneDeep(customText)

  //第一次颜色可能赋值失败，单独赋值一次
  nextTick(() => {
    state.indicatorValueForm.color = customText.color
    state.indicatorValueForm.suffixColor = customText.suffixColor
  })
}

onMounted(() => {
  init()
})

watch(
  () => props.chart?.customAttr?.indicator,
  () => {
    init()
  },
  { deep: true }
)

function getFormData() {
  return state.indicatorValueForm
}

defineExpose({ getFormData })
</script>

<template>
  <div>
    <el-form
      ref="indicatorValueForm"
      :disabled="!state.indicatorValueForm.show"
      :model="state.indicatorValueForm"
      label-position="top"
      size="small"
    >
      <el-form-item
        class="form-item"
        :class="'form-item-' + themes"
        :effect="themes"
        :label="t('chart.text')"
      >
        <el-select
          :effect="themes"
          v-model="state.indicatorValueForm.fontFamily"
          :placeholder="t('chart.font_family')"
          @change="changeLabelTitleStyleStyle('fontFamily')"
        >
          <el-option
            v-for="option in fontFamily"
            :key="option.value"
            :label="option.name"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <div style="display: flex">
        <el-form-item class="form-item" :class="'form-item-' + themes" style="padding-right: 4px">
          <el-color-picker
            :effect="themes"
            v-model="state.indicatorValueForm.color"
            class="color-picker-style"
            :predefine="predefineColors"
            @change="changeLabelTitleStyleStyle('color')"
            show-alpha
            is-custom
          />
        </el-form-item>
        <el-form-item class="form-item" :class="'form-item-' + themes" style="padding: 0 4px">
          <el-tooltip :content="t('chart.font_size')" :effect="toolTip" placement="top">
            <el-select
              style="width: 56px"
              :effect="themes"
              v-model="state.indicatorValueForm.fontSize"
              :placeholder="t('chart.text_fontsize')"
              size="small"
              @change="changeLabelTitleStyleStyle('fontSize')"
            >
              <el-option
                v-for="option in fontSizeList"
                :key="option.value"
                :label="option.name"
                :value="option.value"
              />
            </el-select>
          </el-tooltip>
        </el-form-item>

        <el-form-item class="form-item" :class="'form-item-' + themes" style="padding-left: 4px">
          <el-select
            :effect="themes"
            v-model="state.indicatorValueForm.letterSpace"
            :placeholder="t('chart.quota_letter_space')"
            @change="changeLabelTitleStyleStyle('letterSpace')"
          >
            <template #prefix>
              <el-icon>
                <Icon name="icon_letter-spacing_outlined"
                  ><icon_letterSpacing_outlined class="svg-icon"
                /></Icon>
              </el-icon>
            </template>
            <el-option
              v-for="option in fontLetterSpace"
              :key="option.value"
              :label="option.name"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <el-space>
        <el-form-item class="form-item" :class="'form-item-' + themes">
          <el-checkbox
            :effect="themes"
            class="icon-checkbox"
            v-model="state.indicatorValueForm.isBolder"
            @change="changeLabelTitleStyleStyle('isBolder')"
          >
            <el-tooltip :effect="toolTip" placement="top">
              <template #content>
                {{ t('chart.bolder') }}
              </template>
              <div
                class="icon-btn"
                :class="{ dark: themes === 'dark', active: state.indicatorValueForm.isBolder }"
              >
                <el-icon>
                  <Icon name="icon_bold_outlined"><icon_bold_outlined class="svg-icon" /></Icon>
                </el-icon>
              </div>
            </el-tooltip>
          </el-checkbox>
        </el-form-item>

        <el-form-item class="form-item" :class="'form-item-' + themes">
          <el-checkbox
            :effect="themes"
            class="icon-checkbox"
            v-model="state.indicatorValueForm.isItalic"
            @change="changeLabelTitleStyleStyle('isItalic')"
          >
            <el-tooltip :effect="toolTip" placement="top">
              <template #content>
                {{ t('chart.italic') }}
              </template>
              <div
                class="icon-btn"
                :class="{ dark: themes === 'dark', active: state.indicatorValueForm.isItalic }"
              >
                <el-icon>
                  <Icon name="icon_italic_outlined"><icon_italic_outlined class="svg-icon" /></Icon>
                </el-icon>
              </div>
            </el-tooltip>
          </el-checkbox>
        </el-form-item>

        <div class="position-divider" :class="'position-divider--' + themes"></div>

        <el-form-item class="form-item" :class="'form-item-' + themes">
          <el-radio-group
            :effect="themes"
            class="icon-radio-group"
            v-model="state.indicatorValueForm.hPosition"
            @change="changeLabelTitleStyleStyle('hPosition')"
          >
            <el-radio :effect="themes" label="left">
              <el-tooltip :effect="toolTip" placement="top">
                <template #content>
                  {{ t('chart.text_pos_left') }}
                </template>
                <div
                  class="icon-btn"
                  :class="{
                    dark: themes === 'dark',
                    active: state.indicatorValueForm.hPosition === 'left'
                  }"
                >
                  <el-icon>
                    <Icon name="icon_left-alignment_outlined"
                      ><icon_leftAlignment_outlined class="svg-icon"
                    /></Icon>
                  </el-icon>
                </div>
              </el-tooltip>
            </el-radio>
            <el-radio :effect="themes" label="center">
              <el-tooltip :effect="toolTip" placement="top">
                <template #content>
                  {{ t('chart.text_pos_center') }}
                </template>
                <div
                  class="icon-btn"
                  :class="{
                    dark: themes === 'dark',
                    active: state.indicatorValueForm.hPosition === 'center'
                  }"
                >
                  <el-icon>
                    <Icon name="icon_center-alignment_outlined"
                      ><icon_centerAlignment_outlined class="svg-icon"
                    /></Icon>
                  </el-icon>
                </div>
              </el-tooltip>
            </el-radio>
            <el-radio :effect="themes" label="right">
              <el-tooltip :effect="toolTip" placement="top">
                <template #content>
                  {{ t('chart.text_pos_right') }}
                </template>
                <div
                  class="icon-btn"
                  :class="{
                    dark: themes === 'dark',
                    active: state.indicatorValueForm.hPosition === 'right'
                  }"
                >
                  <el-icon>
                    <Icon name="icon_right-alignment_outlined"
                      ><icon_rightAlignment_outlined class="svg-icon"
                    /></Icon>
                  </el-icon>
                </div>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-space>

      <el-form-item class="form-item" :class="'form-item-' + themes">
        <el-radio-group
          :effect="themes"
          class="icon-radio-group"
          v-model="state.indicatorValueForm.vPosition"
          @change="changeLabelTitleStyleStyle('vPosition')"
        >
          <el-radio label="top">
            <el-tooltip :effect="toolTip" placement="top">
              <template #content>
                {{ t('chart.text_pos_top') }}
              </template>
              <div
                class="icon-btn"
                :class="{
                  dark: themes === 'dark',
                  active: state.indicatorValueForm.vPosition === 'top'
                }"
              >
                <el-icon>
                  <Icon name="icon_top-align_outlined"
                    ><icon_topAlign_outlined class="svg-icon"
                  /></Icon>
                </el-icon>
              </div>
            </el-tooltip>
          </el-radio>
          <el-radio label="center">
            <el-tooltip :effect="toolTip" placement="top">
              <template #content>
                {{ t('chart.text_pos_center') }}
              </template>
              <div
                class="icon-btn"
                :class="{
                  dark: themes === 'dark',
                  active: state.indicatorValueForm.vPosition === 'center'
                }"
              >
                <el-icon>
                  <Icon name="icon_vertical-align_outlined"
                    ><icon_verticalAlign_outlined class="svg-icon"
                  /></Icon>
                </el-icon>
              </div>
            </el-tooltip>
          </el-radio>
          <el-radio label="bottom">
            <el-tooltip :effect="toolTip" placement="top">
              <template #content>
                {{ t('chart.text_pos_bottom') }}
              </template>
              <div
                class="icon-btn"
                :class="{
                  dark: themes === 'dark',
                  active: state.indicatorValueForm.vPosition === 'bottom'
                }"
              >
                <el-icon>
                  <Icon name="icon_bottom-align_outlined"
                    ><icon_bottomAlign_outlined class="svg-icon"
                  /></Icon>
                </el-icon>
              </div>
            </el-tooltip>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item class="form-item" :class="'form-item-' + themes">
        <el-checkbox
          size="small"
          :effect="themes"
          v-model="state.indicatorValueForm.fontShadow"
          @change="changeLabelTitleStyleStyle('fontShadow')"
        >
          {{ t('chart.font_shadow') }}
        </el-checkbox>
      </el-form-item>

      <el-divider class="m-divider" :class="{ 'divider-dark': themes === 'dark' }" />

      <el-form-item class="form-item" :class="'form-item-' + themes">
        <el-checkbox
          size="small"
          :effect="themes"
          v-model="state.indicatorValueForm.suffixEnable"
          @change="changeLabelTitleStyleStyle('suffixEnable')"
        >
          {{ t('chart.indicator_suffix') }}
        </el-checkbox>
      </el-form-item>

      <div style="padding-left: 22px">
        <el-form-item class="form-item" :class="'form-item-' + themes">
          <el-input
            v-model="state.indicatorValueForm.suffix"
            maxlength="10"
            :effect="themes"
            :disabled="!state.indicatorValueForm.suffixEnable"
            :placeholder="t('chart.indicator_suffix_placeholder')"
            @change="changeLabelTitleStyleStyle('suffix')"
          />
        </el-form-item>

        <el-form-item class="form-item" :class="'form-item-' + themes" :effect="themes">
          <el-select
            :disabled="!state.indicatorValueForm.suffixEnable"
            :effect="themes"
            v-model="state.indicatorValueForm.suffixFontFamily"
            :placeholder="t('chart.font_family')"
            @change="changeLabelTitleStyleStyle('suffixFontFamily')"
          >
            <el-option
              v-for="option in fontFamily"
              :key="option.value"
              :label="option.name"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <div style="display: flex">
          <el-form-item class="form-item" :class="'form-item-' + themes" style="padding-right: 4px">
            <el-color-picker
              :disabled="!state.indicatorValueForm.suffixEnable"
              :effect="themes"
              v-model="state.indicatorValueForm.suffixColor"
              class="color-picker-style"
              :predefine="predefineColors"
              @change="changeLabelTitleStyleStyle('suffixColor')"
              is-custom
              show-alpha
            />
          </el-form-item>
          <el-form-item class="form-item" :class="'form-item-' + themes" style="padding: 0 4px">
            <el-tooltip :content="t('chart.font_size')" :effect="toolTip" placement="top">
              <el-select
                :disabled="!state.indicatorValueForm.suffixEnable"
                style="width: 56px"
                :effect="themes"
                v-model="state.indicatorValueForm.suffixFontSize"
                :placeholder="t('chart.text_fontsize')"
                size="small"
                @change="changeLabelTitleStyleStyle('suffixFontSize')"
              >
                <el-option
                  v-for="option in fontSizeList"
                  :key="option.value"
                  :label="option.name"
                  :value="option.value"
                />
              </el-select>
            </el-tooltip>
          </el-form-item>

          <el-form-item class="form-item" :class="'form-item-' + themes" style="padding-left: 4px">
            <el-select
              size="small"
              :disabled="!state.indicatorValueForm.suffixEnable"
              :effect="themes"
              v-model="state.indicatorValueForm.suffixLetterSpace"
              :placeholder="t('chart.quota_letter_space')"
              @change="changeLabelTitleStyleStyle('suffixLetterSpace')"
            >
              <template #prefix>
                <el-icon>
                  <Icon name="icon_letter-spacing_outlined"
                    ><icon_letterSpacing_outlined class="svg-icon"
                  /></Icon>
                </el-icon>
              </template>
              <el-option
                v-for="option in fontLetterSpace"
                :key="option.value"
                :label="option.name"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-space>
          <el-form-item class="form-item" :class="'form-item-' + themes">
            <el-checkbox
              :disabled="!state.indicatorValueForm.suffixEnable"
              :effect="themes"
              class="icon-checkbox"
              v-model="state.indicatorValueForm.suffixIsBolder"
              @change="changeLabelTitleStyleStyle('suffixIsBolder')"
            >
              <el-tooltip :effect="toolTip" placement="top">
                <template #content>
                  {{ t('chart.bolder') }}
                </template>
                <div
                  class="icon-btn"
                  :class="{
                    dark: themes === 'dark',
                    active: state.indicatorValueForm.suffixIsBolder
                  }"
                >
                  <el-icon>
                    <Icon name="icon_bold_outlined"><icon_bold_outlined class="svg-icon" /></Icon>
                  </el-icon>
                </div>
              </el-tooltip>
            </el-checkbox>
          </el-form-item>

          <el-form-item class="form-item" :class="'form-item-' + themes">
            <el-checkbox
              :disabled="!state.indicatorValueForm.suffixEnable"
              :effect="themes"
              class="icon-checkbox"
              v-model="state.indicatorValueForm.suffixIsItalic"
              @change="changeLabelTitleStyleStyle('suffixIsItalic')"
            >
              <el-tooltip :effect="toolTip" placement="top">
                <template #content>
                  {{ t('chart.italic') }}
                </template>
                <div
                  class="icon-btn"
                  :class="{
                    dark: themes === 'dark',
                    active: state.indicatorValueForm.suffixIsItalic
                  }"
                >
                  <el-icon>
                    <Icon name="icon_italic_outlined"
                      ><icon_italic_outlined class="svg-icon"
                    /></Icon>
                  </el-icon>
                </div>
              </el-tooltip>
            </el-checkbox>
          </el-form-item>
        </el-space>

        <el-form-item class="form-item" :class="'form-item-' + themes">
          <el-checkbox
            :disabled="!state.indicatorValueForm.suffixEnable"
            size="small"
            :effect="themes"
            v-model="state.indicatorValueForm.suffixFontShadow"
            @change="changeLabelTitleStyleStyle('suffixFontShadow')"
          >
            {{ t('chart.font_shadow') }}
          </el-checkbox>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<style lang="less" scoped>
:deep(.ed-input .ed-select__prefix--light) {
  padding-right: 6px;
}
.icon-btn {
  font-size: 16px;
  line-height: 16px;
  width: 24px;
  height: 24px;
  text-align: center;
  border-radius: 4px;
  padding-top: 4px;

  color: #1f2329;

  cursor: pointer;

  &.dark {
    color: #a6a6a6;
    &.active {
      color: var(--ed-color-primary);
      background-color: var(--ed-color-primary-1a, rgba(51, 112, 255, 0.1));
    }
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  &.active {
    color: var(--ed-color-primary);
    background-color: var(--ed-color-primary-1a, rgba(51, 112, 255, 0.1));
  }

  &:hover {
    background-color: rgba(31, 35, 41, 0.1);
  }
}

.is-disabled {
  .icon-btn {
    color: #8f959e;
    cursor: not-allowed;

    &:hover {
      background-color: inherit;
    }

    &.active {
      background-color: #f5f7fa;
      &:hover {
        background-color: #f5f7fa;
      }
    }
    &.dark {
      color: #5f5f5f;
      &.active {
        background-color: #373737;
        &:hover {
          background-color: #373737;
        }
      }
    }
  }
}

.icon-checkbox {
  :deep(.ed-checkbox__input) {
    display: none;
  }
  :deep(.ed-checkbox__label) {
    padding: 0;
  }
}

.icon-radio-group {
  :deep(.ed-radio) {
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }
  :deep(.ed-radio__input) {
    display: none;
  }
  :deep(.ed-radio__label) {
    padding: 0;
  }
}
.position-divider {
  width: 1px;
  height: 18px;
  margin-bottom: 16px;
  background: rgba(31, 35, 41, 0.15);

  &.position-divider--dark {
    background: rgba(235, 235, 235, 0.15);
  }
}
.remark-label {
  color: var(--N600, #646a73);
  font-family: var(--de-custom_font, 'PingFang');
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;

  &.remark-label--dark {
    color: var(--N600-Dark, #a6a6a6);
  }
}
.m-divider {
  margin: 0 0 16px;
  border-color: rgba(31, 35, 41, 0.15);

  &.divider-dark {
    border-color: rgba(255, 255, 255, 0.15);
  }
}
</style>
