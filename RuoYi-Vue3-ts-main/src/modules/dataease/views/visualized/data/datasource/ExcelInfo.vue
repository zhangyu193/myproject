<script lang="ts" setup>
import icon_excel from '@de/assets/svg/icon_excel.svg'
import icon_deleteTrash_outlined from '@de/assets/svg/icon_delete-trash_outlined.svg'
withDefaults(
  defineProps<{
    name?: string
    size?: number
    showDel?: boolean
  }>(),
  {
    name: '',
    size: 0,
    showDel: false
  }
)

const emits = defineEmits(['del'])
const del = () => {
  emits('del')
}
</script>

<template>
  <div class="excel-info">
    <el-icon class="excel">
      <Icon name="icon_excel"><icon_excel class="svg-icon" /></Icon>
    </el-icon>
    <div class="info">
      <p class="name ellipsis">{{ name || '-' }}</p>
      <p class="size ellipsis">{{ size || '-' }}</p>
    </div>
    <el-icon v-if="showDel" @click="del" class="delete">
      <Icon name="icon_delete-trash_outlined"><icon_deleteTrash_outlined class="svg-icon" /></Icon>
    </el-icon>
  </div>
</template>

<style lang="less" scoped>
.excel-info {
  display: flex;
  align-items: center;
  width: 100%;
  height: 58px;
  padding: 0 0 0 0;
  border-radius: 4px;
  .excel {
    font-size: 32px;
    margin-right: 14.67px;
  }

  .info {
    font-family: var(--de-custom_font, 'PingFang');
    font-style: normal;
    font-weight: 400;
    width: 80%;

    .name {
      color: #1f2329;
      font-size: 14px;
      line-height: 22px;
      width: 100%;
    }

    .size {
      color: #8f959e;
      font-size: 12px;
      line-height: 20px;
    }
  }

  .delete {
    cursor: pointer;
    font-size: 16px;
    margin-left: auto;
  }
}
</style>
