<script lang="ts" setup>
import icon_searchOutline_outlined from '@de/assets/svg/icon_search-outline_outlined.svg'
import { ref, PropType, watch } from 'vue'
import { useI18n } from '@de/hooks/web/useI18n'
import { propTypes } from '@de/utils/propTypes'
import { ElTable } from 'element-plus-secondary'
import { fieldType } from '@de/utils/attr'
import { type Field } from './util'
import { iconFieldMap } from '@de/components/icon-group/field-list'

const { t } = useI18n()
const props = defineProps({
  fieldList: {
    type: Array as PropType<Field[]>,
    default: () => []
  },
  node: propTypes.object.def({})
})
const emit = defineEmits(['checkedFields'])
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const search = ref('')
const checkAll = ref(false)
const isIndeterminate = ref(true)
const handleCheckAllChange = (val: boolean) => {
  fieldSearchList.value.forEach(ele => {
    ele.checked = val
  })
  const org = fieldSearchList.value.map(ele => ele.originName)
  if (val) {
    multipleSelection.value = [
      ...multipleSelection.value.filter(ele => !org.includes(ele.originName)),
      ...fieldSearchList.value
    ]
  } else {
    multipleSelection.value = multipleSelection.value.filter(ele => !org.includes(ele.originName))
  }
  isIndeterminate.value = false
  emit('checkedFields', multipleSelection.value)
}

const fieldSearchList = ref([])

const multipleSelection = ref<Field[]>([])
const checkChange = () => {
  handleSelectionChange(fieldSearchList.value.filter(ele => ele.checked))
}
const handleSelectionChange = val => {
  const checkedCount = val.length
  checkAll.value = checkedCount === fieldSearchList.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < fieldSearchList.value.length
  multipleSelection.value = props.fieldList.filter(ele => ele.checked)
  emit('checkedFields', multipleSelection.value)
}
watch(
  search,
  val => {
    if (val.trim() !== '') {
      fieldSearchList.value = props.fieldList.filter(ele =>
        ele.originName.toLocaleLowerCase().includes(val.trim().toLocaleLowerCase())
      )
    } else {
      fieldSearchList.value = props.fieldList
    }
    handleSelectionChange(fieldSearchList.value.filter(ele => ele.checked))
  },
  {
    immediate: true
  }
)

watch(
  () => props.fieldList,
  () => {
    fieldSearchList.value = props.fieldList
    handleSelectionChange(fieldSearchList.value.filter(ele => ele.checked))
  }
)
</script>

<template>
  <div class="field-block-style">
    <div class="field-block-option">
      <span class="option-field"
        >{{ $t('dataset.field_select') }}({{ multipleSelection.length }}/{{
          fieldList.length
        }})</span
      >
      <el-input
        v-model="search"
        :placeholder="$t('auth.search_by_field')"
        clearable
        class="option-input"
      >
        <template #prefix>
          <el-icon>
            <Icon name="icon_search-outline_outlined"
              ><icon_searchOutline_outlined class="svg-icon"
            /></Icon>
          </el-icon>
        </template>
      </el-input>
    </div>
    <div class="field-block-body">
      <el-table
        header-cell-class-name="header-cell"
        ref="multipleTableRef"
        :data="fieldSearchList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" width="55">
          <template #header>
            <el-checkbox
              v-model="checkAll"
              :indeterminate="isIndeterminate"
              @change="handleCheckAllChange"
            />
          </template>
          <template #default="scope">
            <el-checkbox @change="checkChange" v-model="scope.row.checked" />
          </template>
        </el-table-column>
        <el-table-column :label="t('dataset.origin_name')">
          <template #default="scope">
            <el-icon>
              <Icon
                ><component
                  class="svg-icon"
                  :class="`field-icon-${fieldType[scope.row.deType]}`"
                  :is="iconFieldMap[fieldType[scope.row.deType]]"
                ></component
              ></Icon>
            </el-icon>
            {{ scope.row.originName }}
          </template>
        </el-table-column>
        <el-table-column property="description" :label="t('deDataset.description')" />
      </el-table>
    </div>
  </div>
</template>

<style lang="less" scoped>
.field-block-style {
  height: 100%;
  width: 100%;
  font-family: var(--de-custom_font, 'PingFang');
  .field-block-body {
    height: 327px;
    overflow-y: auto;
  }
  .field-origin-style {
    display: flex;
    margin-left: 12px;
    width: 140px;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: var(--deTextSecondary, #646a73);
  }
  .field-style {
    width: 140px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre;
    font-size: 14px;
    font-weight: 500;
    color: var(--deTextSecondary, #646a73);
  }
  .field-block-option {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .option-field {
    font-size: 14px;
    font-weight: 400;
    color: var(--deTextSecondary, #646a73);
  }
  .option-input {
    width: 200px;
  }
}
</style>

<style lang="less">
.field-block-body {
  .cell {
    display: flex;
    align-items: center;
    .ed-icon {
      font-size: 14px;
      margin-right: 5.25px;
    }
  }
}
</style>
