<template>
    <div>
        <el-dropdown trigger="click" @command="handleSetSize">
            <div class="size-icon--style">
                <svg-icon class-name="size-icon" icon-class="size" />
            </div>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item
                        v-for="item of sizeOptions"
                        :key="item.value"
                        :disabled="size === item.value"
                        :command="item.value"
                    >
                        {{ item.label }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup lang="ts">
import useAppStore from '@/store/modules/app';
import { computed, getCurrentInstance, ComponentInternalInstance, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const appStore = useAppStore();
const size = computed(() => appStore.sizelayout);
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const sizeOptions = ref([
    { label: '较大', value: 'large' },
    { label: '默认', value: 'default' },
    { label: '稍小', value: 'small' },
]);

function handleSetSize(size: any) {
    proxy!.$modal.loading('正在设置布局大小，请稍候...');
    appStore.setSizelayout(size);
    setTimeout('window.location.reload()', 1000);
}
</script>

<style lang="scss" scoped>
.size-icon--style {
    font-size: 18px;
    line-height: 50px;
    padding-right: 7px;
}
</style>
