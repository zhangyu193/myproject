<script lang="ts" setup>
import icon_bold_outlined from '@de/assets/svg/icon_bold_outlined.svg'
import icon_italic_outlined from '@de/assets/svg/icon_italic_outlined.svg'
import icon_leftAlignment_outlined from '@de/assets/svg/icon_left-alignment_outlined.svg'
import icon_centerAlignment_outlined from '@de/assets/svg/icon_center-alignment_outlined.svg'
import icon_rightAlignment_outlined from '@de/assets/svg/icon_right-alignment_outlined.svg'
import icon_info_outlined from '@de/assets/svg/icon_info_outlined.svg'
import { computed, onMounted, PropType, reactive, watch } from 'vue'
import { useI18n } from '@de/hooks/web/useI18n'
import { COLOR_PANEL, DEFAULT_TABLE_CELL } from '@de/views/chart/components/editor/util/chart'
import { ElSpace } from 'element-plus-secondary'
import { cloneDeep, defaultsDeep } from 'lodash-es'
import { convertToAlphaColor, isAlphaColor } from '@de/views/chart/components/js/util'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { storeToRefs } from 'pinia'
const dvMainStore = dvMainStoreWithOut()
const { mobileInPc } = storeToRefs(dvMainStore)

const { t } = useI18n()

const props = defineProps({
  chart: {
    type: Object as PropType<ChartObj>,
    required: true
  },
  themes: {
    type: String,
    default: 'dark'
  },
  propertyInner: {
    type: Array<string>
  }
})

watch(
  () => props.chart.customAttr.tableCell,
  () => {
    init()
  },
  { deep: true }
)

const predefineColors = COLOR_PANEL

const fontSizeList = computed(() => {
  const arr = []
  for (let i = 10; i <= 40; i = i + 2) {
    arr.push({
      name: i + '',
      value: i
    })
  }
  for (let i = 50; i <= 200; i = i + 10) {
    arr.push({
      name: i + '',
      value: i
    })
  }
  return arr
})

const state = reactive({
  tableCellForm: {} as ChartTableCellAttr
})

const emit = defineEmits(['onTableCellChange'])

const changeTableCell = prop => {
  emit('onTableCellChange', state.tableCellForm, prop)
}

const init = () => {
  const tableCell = props.chart?.customAttr?.tableCell
  if (tableCell) {
    tableCell.mergeCells = tableCell.mergeCells === undefined ? false : tableCell.mergeCells
    state.tableCellForm = defaultsDeep(cloneDeep(tableCell), cloneDeep(DEFAULT_TABLE_CELL))
    const alpha = props.chart.customAttr.basicStyle.alpha

    if (!isAlphaColor(state.tableCellForm.tableItemBgColor)) {
      state.tableCellForm.tableItemBgColor = convertToAlphaColor(
        state.tableCellForm.tableItemBgColor,
        alpha
      )
    }

    if (!isAlphaColor(state.tableCellForm.tableItemSubBgColor)) {
      state.tableCellForm.tableItemSubBgColor = convertToAlphaColor(
        state.tableCellForm.tableItemSubBgColor,
        alpha
      )
    }
  }
}
const showProperty = prop => props.propertyInner?.includes(prop)

onMounted(() => {
  init()
})
</script>

<template>
  <el-form size="small" ref="tableCellForm" :model="state.tableCellForm" label-position="top">
    <el-form-item
      :label="t('chart.backgroundColor')"
      class="form-item"
      :class="'form-item-' + themes"
      v-if="showProperty('tableItemBgColor') && state.tableCellForm.tableItemBgColor"
    >
      <el-color-picker
        :effect="themes"
        is-custom
        :trigger-width="108"
        v-model="state.tableCellForm.tableItemBgColor"
        :predefine="predefineColors"
        show-alpha
        @change="changeTableCell('tableItemBgColor')"
      />
    </el-form-item>
    <el-form-item
      :class="'form-item-' + themes"
      class="form-item"
      v-if="showProperty('enableTableCrossBG')"
      label=""
    >
      <el-checkbox
        v-model="state.tableCellForm.enableTableCrossBG"
        :effect="themes"
        :disabled="showProperty('mergeCells') && state.tableCellForm.mergeCells"
        @change="changeTableCell('enableTableCrossBG')"
      >
        <span class="data-area-label">
          <span style="margin-right: 4px">{{ t('chart.stripe') }}</span>
          <el-tooltip
            class="item"
            effect="dark"
            placement="bottom"
            v-if="state.tableCellForm.mergeCells"
          >
            <template #content>
              <div>{{ t('chart.table_cross_bg_tip') }}</div>
            </template>
            <el-icon class="hint-icon" :class="{ 'hint-icon--dark': themes === 'dark' }">
              <Icon name="icon_info_outlined"><icon_info_outlined class="svg-icon" /></Icon>
            </el-icon>
          </el-tooltip>
        </span>
      </el-checkbox>
    </el-form-item>
    <el-form-item
      :class="'form-item-' + themes"
      class="form-item"
      label=""
      v-if="showProperty('tableItemSubBgColor') && state.tableCellForm.tableItemSubBgColor"
    >
      <el-color-picker
        v-model="state.tableCellForm.tableItemSubBgColor"
        :effect="themes"
        :predefine="predefineColors"
        :disabled="!state.tableCellForm.enableTableCrossBG"
        is-custom
        show-alpha
        @change="changeTableCell('tableItemSubBgColor')"
      />
    </el-form-item>
    <el-space>
      <el-form-item
        class="form-item"
        :class="'form-item-' + themes"
        v-if="showProperty('tableFontColor')"
        :label="t('chart.text')"
      >
        <el-color-picker
          :effect="themes"
          is-custom
          v-model="state.tableCellForm.tableFontColor"
          :predefine="predefineColors"
          @change="changeTableCell('tableFontColor')"
        />
      </el-form-item>
      <el-form-item
        class="form-item"
        :class="'form-item-' + themes"
        v-if="showProperty('tableItemFontSize')"
      >
        <template #label>&nbsp;</template>
        <el-select
          style="width: 58px"
          :effect="themes"
          v-model="state.tableCellForm.tableItemFontSize"
          @change="changeTableCell('tableItemFontSize')"
        >
          <el-option
            v-for="option in fontSizeList"
            :key="option.value"
            :label="option.name"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
    </el-space>
    <el-space :class="{ 'mobile-style': mobileInPc }">
      <el-form-item class="form-item" :class="'form-item-' + themes">
        <el-checkbox
          :effect="themes"
          class="icon-checkbox"
          v-model="state.tableCellForm.isBolder"
          @change="changeTableCell('isBolder')"
        >
          <el-tooltip effect="dark" placement="top">
            <template #content>
              {{ t('chart.bolder') }}
            </template>
            <div
              class="icon-btn"
              :class="{ dark: themes === 'dark', active: state.tableCellForm.isBolder }"
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
          v-model="state.tableCellForm.isItalic"
          @change="changeTableCell('isItalic')"
        >
          <el-tooltip effect="dark" placement="top">
            <template #content>
              {{ t('chart.italic') }}
            </template>
            <div
              class="icon-btn"
              :class="{ dark: themes === 'dark', active: state.tableCellForm.isItalic }"
            >
              <el-icon>
                <Icon name="icon_italic_outlined"><icon_italic_outlined class="svg-icon" /></Icon>
              </el-icon>
            </div>
          </el-tooltip>
        </el-checkbox>
      </el-form-item>

      <div class="position-divider" :class="'position-divider--' + themes"></div>
      <el-form-item
        class="form-item"
        :class="'form-item-' + themes"
        v-if="showProperty('tableItemAlign')"
      >
        <el-radio-group
          class="icon-radio-group"
          v-model="state.tableCellForm.tableItemAlign"
          @change="changeTableCell('tableItemAlign')"
        >
          <el-radio label="left">
            <el-tooltip effect="dark" placement="top">
              <template #content>
                {{ t('chart.text_pos_left') }}
              </template>
              <div
                class="icon-btn"
                :class="{
                  dark: themes === 'dark',
                  active: state.tableCellForm.tableItemAlign === 'left'
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
          <el-radio label="center">
            <el-tooltip effect="dark" placement="top">
              <template #content>
                {{ t('chart.text_pos_center') }}
              </template>
              <div
                class="icon-btn"
                :class="{
                  dark: themes === 'dark',
                  active: state.tableCellForm.tableItemAlign === 'center'
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
          <el-radio label="right">
            <el-tooltip effect="dark" placement="top">
              <template #content>
                {{ t('chart.text_pos_right') }}
              </template>
              <div
                class="icon-btn"
                :class="{
                  dark: themes === 'dark',
                  active: state.tableCellForm.tableItemAlign === 'right'
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

    <el-row :gutter="8">
      <el-col :span="12">
        <el-form-item
          :label="t('visualization.lineHeight')"
          class="form-item"
          :class="'form-item-' + themes"
          v-if="showProperty('tableItemHeight')"
        >
          <el-input-number
            :effect="themes"
            controls-position="right"
            v-model="state.tableCellForm.tableItemHeight"
            :min="20"
            :max="1000"
            @change="changeTableCell('tableItemHeight')"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item
      class="form-item"
      :class="'form-item-' + themes"
      v-if="showProperty('tableFreeze')"
    >
      <el-checkbox
        size="small"
        :effect="themes"
        :disabled="showProperty('mergeCells') && state.tableCellForm.mergeCells"
        v-model="state.tableCellForm.tableFreeze"
        @change="changeTableCell('tableFreeze')"
      >
        <span class="data-area-label">
          <span style="margin-right: 4px">{{ t('chart.table_freeze') }}</span>
          <el-tooltip
            class="item"
            effect="dark"
            placement="bottom"
            v-if="state.tableCellForm.mergeCells"
          >
            <template #content>
              <div>{{ t('chart.table_freeze_tip') }}</div>
            </template>
            <el-icon class="hint-icon" :class="{ 'hint-icon--dark': themes === 'dark' }">
              <Icon name="icon_info_outlined"><icon_info_outlined class="svg-icon" /></Icon>
            </el-icon>
          </el-tooltip>
        </span>
      </el-checkbox>
    </el-form-item>
    <el-row :gutter="8" v-if="showProperty('tableFreeze')">
      <el-col :span="12">
        <el-form-item
          :label="t('chart.table_col_freeze_tip')"
          class="form-item"
          :class="'form-item-' + themes"
          v-if="showProperty('tableColumnFreezeHead')"
        >
          <el-input-number
            :effect="themes"
            controls-position="right"
            v-model="state.tableCellForm.tableColumnFreezeHead"
            :disabled="
              (showProperty('mergeCells') && state.tableCellForm.mergeCells) ||
              !state.tableCellForm.tableFreeze
            "
            :min="0"
            :max="100"
            @change="changeTableCell('tableColumnFreezeHead')"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          :label="t('chart.table_row_freeze_tip')"
          class="form-item"
          :class="'form-item-' + themes"
          v-if="showProperty('tableRowFreezeHead')"
        >
          <el-input-number
            :effect="themes"
            controls-position="right"
            v-model="state.tableCellForm.tableRowFreezeHead"
            :disabled="
              (showProperty('mergeCells') && state.tableCellForm.mergeCells) ||
              !state.tableCellForm.tableFreeze
            "
            :min="0"
            :max="100"
            @change="changeTableCell('tableRowFreezeHead')"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item
      class="form-item"
      :class="'form-item-' + themes"
      v-if="showProperty('mergeCells')"
    >
      <el-checkbox
        size="small"
        :effect="themes"
        v-model="state.tableCellForm.mergeCells"
        @change="changeTableCell('mergeCells')"
      >
        <span class="data-area-label">
          <span style="margin-right: 4px">{{ t('chart.merge_cells') }}</span>
          <el-tooltip class="item" effect="dark" placement="bottom">
            <template #content>
              <div>{{ t('chart.merge_cells_tips') }}</div>
            </template>
            <el-icon class="hint-icon" :class="{ 'hint-icon--dark': themes === 'dark' }">
              <Icon name="icon_info_outlined"><icon_info_outlined class="svg-icon" /></Icon>
            </el-icon>
          </el-tooltip>
        </span>
      </el-checkbox>
    </el-form-item>
    <el-form-item
      class="form-item"
      :class="'form-item-' + themes"
      v-if="showProperty('showHorizonBorder')"
    >
      <el-checkbox
        size="small"
        :effect="themes"
        v-model="state.tableCellForm.showHorizonBorder"
        @change="changeTableCell('showHorizonBorder')"
      >
        {{ t('chart.table_cell_show_horizon_border') }}
      </el-checkbox>
    </el-form-item>
    <el-form-item
      class="form-item"
      :class="'form-item-' + themes"
      v-if="showProperty('showVerticalBorder')"
    >
      <el-checkbox
        size="small"
        :effect="themes"
        v-model="state.tableCellForm.showVerticalBorder"
        @change="changeTableCell('showVerticalBorder')"
      >
        {{ t('chart.table_cell_show_vertical_border') }}
      </el-checkbox>
    </el-form-item>
  </el-form>
</template>

<style lang="less" scoped>
.icon-btn {
  font-size: 16px;
  line-height: 16px;
  width: 24px;
  height: 24px;
  text-align: center;
  vertical-align: middle;
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
  margin-bottom: 8px;
  background: rgba(31, 35, 41, 0.15);

  &.position-divider--dark {
    background: rgba(235, 235, 235, 0.15);
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

.mobile-style {
  margin-top: 25px;
}
.data-area-label {
  text-align: left;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
