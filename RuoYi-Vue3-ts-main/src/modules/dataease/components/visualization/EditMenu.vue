<script lang="ts" setup>
import language from '@de/assets/svg/language.svg'
import { ref, onMounted } from 'vue'
import { Icon } from '@de/components/icon-custom'
import { useUserStoreWithOut } from '@de/store/modules/user'
const userStore = useUserStoreWithOut()
const language = ref(null)
const handleSetLanguage = lang => lang
onMounted(() => {
  language.value = userStore.getLanguage
})
</script>
<template>
  <el-dropdown
    style="display: flex; align-items: center"
    trigger="click"
    class="international"
    @command="handleSetLanguage"
  >
    <el-icon>
      <Icon name="language"><language class="svg-icon" /></Icon>
    </el-icon>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :disabled="language === 'zh-CN'" command="zh-CN"
          >简体中文</el-dropdown-item
        >
        <el-dropdown-item :disabled="language === 'tw'" command="tw"> 繁體中文 </el-dropdown-item>
        <el-dropdown-item :disabled="language === 'en'" command="en"> English </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="less">
.right-menu-item {
  display: inline-block;
  padding: 10px 8px;
  height: 100%;

  vertical-align: text-bottom;

  &.hover-effect {
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.025);
    }
  }
}
</style>
