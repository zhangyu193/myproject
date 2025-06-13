<template>
     <ElConfigProvider :locale="currentLocale.elLocale" namespace="el">
        <router-view />
        <ExportExcel ref="exportExcelRef"></ExportExcel>
     </ElConfigProvider>
</template>

<script setup lang="ts">
import {nextTick, onMounted, computed,ref} from 'vue';
import { ElConfigProvider } from 'element-plus-secondary';
import { useLocaleStore } from '@de/store/modules/locale';
import { useEmitt } from '@de/hooks/web/useEmitt';
import useSettingsStore from '@/store/modules/settings';
import { handleThemeStyle } from '@/utils/theme';
import ExportExcel from '@de/views/visualized/data/dataset/ExportExcel.vue';
const exportExcelRef = ref();
const exportExcelCenter = params => {
    exportExcelRef.value.init(params);
}
useEmitt({
    name: 'data-export-center',
    callback: exportExcelCenter
})

// 多语言相关
const localeStore = useLocaleStore()

const currentLocale = computed(() => localeStore.currentLocale)

onMounted(() => {
    nextTick(() => {
        // 初始化主题样式
        handleThemeStyle(useSettingsStore().theme);
    });
});
</script>
