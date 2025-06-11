<template>
    <el-menu :default-active="activeMenu" mode="horizontal" menu-trigger="click" :ellipsis="false" @select="handleSelect">
        <template v-for="(item, index) in topMenus">
            <el-sub-menu  v-if="item.children && item.children.length > 0  && index < Number(visibleNumber)"  :key="item.path" :index="item.path" :style="{'--theme': theme}">
                <template #title>
                    <svg-icon
                        v-if="item.meta && item.meta.icon && item.meta.icon !== '#'"
                        :icon-class="item.meta.icon"/>
                    {{ item.meta?.title }}
                </template>
                <el-menu-item 
                    v-for="subItem in item.children" 
                    :key="subItem.path" 
                    :style="{'--theme': theme}"
                    :index="item.path+'/'+subItem.path"
                    
                >{{subItem.meta?.title }}</el-menu-item>
            </el-sub-menu>

            <el-menu-item v-else-if="index < Number(visibleNumber)"  :key="item.path || index" :style="{'--theme': theme}" :index="item.path"  >
                <svg-icon
                v-if="item.meta && item.meta.icon && item.meta.icon !== '#'"
                :icon-class="item.meta.icon"/>
                {{ item.meta?.title }}
            </el-menu-item>

        </template>

        <!-- 顶部菜单超出数量折叠 -->
        <el-sub-menu
            v-if="topMenus.length > Number(visibleNumber)"
            :style="{ '--theme': theme }"
            index="more"
        >
            <template #title>更多菜单</template>
            <template v-for="(item, index) in topMenus">
                <el-menu-item v-if="index >= Number(visibleNumber)" :key="index" :index="item.path"
                    ><svg-icon :icon-class="item.meta?.icon  ?? ''" /> {{ item.meta!.title }}</el-menu-item
                >
            </template>
        </el-sub-menu>
    </el-menu>
</template>

<script setup lang="ts">
import { constantRoutes } from '@/router';
import { isHttp } from '@/utils/validate';
import useAppStore from '@/store/modules/app';
import useSettingsStore from '@/store/modules/settings';
import usePermissionStore from '@/store/modules/permission';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { RouteRecordRaw, useRoute, useRouter } from 'vue-router';
import Layout from '@/layout/index.vue';

// 顶部栏初始数
const visibleNumber = ref<number | null>(null);
// 当前激活菜单的 index
const currentIndex = ref(null);
// 隐藏侧边栏路由
const hideList = ['/index', '/user/profile'];

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const route = useRoute();
const router = useRouter();
const activeMenu = ref<string>('/index');
const topFirstRoutes = ref<RouteRecordRaw[]>([
    {
        path: '/',
        component: Layout,
        redirect: '/index',
        children: [
            {
                path: '/index',
                hidden: false,
                component: () => import('@de/views/workbranch/index.vue'),
                name: 'Index',
                meta: { title: '工作台', icon: 'dashboard', affix: true }
            }
        ]
    }
]);

// 主题颜色
const theme = computed(() => settingsStore.theme);
// 所有的路由信息
const routers = computed(() => permissionStore.topbarRouters);

// 顶部显示菜单
const topMenus = computed(() => {
    console.log(routers.value);
    let topMenus: RouteRecordRaw[] = [];
    const newRouters = [...topFirstRoutes.value, ...routers.value];
    newRouters.map(menu => {
        if (menu.hidden !== true) {
            // 兼容顶部栏一级菜单内部跳转
            if (menu.path === '/') {
                menu.children?.[0] && topMenus.push(menu.children?.[0]);
            } else {
                topMenus.push(menu);
            }
        }
    });
    return topMenus;
});

// 设置子路由
const childrenMenus = computed(() => {
    let childrenMenus: RouteRecordRaw[] = [];
    routers.value.map(router => {
        for (let item in router.children) {
            if (router.children[item as any].parentPath === undefined) {
                if (router.path === '/') {
                    router.children[item as any].path = '/' + router.children[item as any].path;
                } else {
                    if (!isHttp(router.children[item as any].path)) {
                        router.children[item as any].path =
                            router.path + '/' + router.children[item as any].path;
                    }
                }
                router.children[item as any].parentPath = router.path;
            }
            childrenMenus.push(router.children[item as any]);
        }
    });
    return constantRoutes.concat(childrenMenus);
});

function setVisibleNumber() {
    const width = document.body.getBoundingClientRect().width / 3;
    visibleNumber.value = parseInt(String(width / 85));
}

function handleSelect(key: any, keyPath?: any) {
    currentIndex.value = key;
    const route = routers.value.find(item => item.path === key);
    if (isHttp(key)) {
        // http(s):// 路径新窗口打开
        window.open(key, '_blank');
    } else if (!route || !route.children) {
        // 没有子路由路径内部打开
        router.push({ path: key });
        appStore.toggleSideBarHide(false);
    } else {
        // 显示左侧联动菜单
        activeRoutes(key);
        appStore.toggleSideBarHide(false);
    }
}
function activeRoutes(key: any) {
    let routes: RouteRecordRaw[] = [];
    if (childrenMenus.value && childrenMenus.value.length > 0) {
        childrenMenus.value.map(item => {
            if (key === item.parentPath || (key === 'index' && '' === item.path)) {
                routes.push(item);
            }
        });
    }
    // if (routes.length > 0) {
    //     permissionStore.setSidebarRouters(routes);
    // } else {
    //     appStore.toggleSideBarHide(true);
    // }
    return routes;
}

onMounted(() => {
    handleSelect("/index");
    setVisibleNumber();
    window.addEventListener('resize', setVisibleNumber);
});
onBeforeUnmount(() => {
    window.removeEventListener('resize', setVisibleNumber);
});
</script>

<style lang="scss">
.topmenu-container.el-menu--horizontal > .el-menu-item {
    float: left;
    height: 56px !important;
    line-height: 56px !important;
    color: #fffc !important;
    padding: 0 10px !important;
    margin: 0 10px !important;
}


.topmenu-container.el-menu--horizontal > .el-menu-item.is-active, .el-menu--horizontal > .el-sub-menu.is-active .el-submenu__title {
  color: #fff!important;
  background-color: #3370FF!important;
  border-bottom-width:0px!important;
}
.topmenu-container.el-menu--horizontal > .el-submenu.is-active .el-submenu__title{
  color: #fff!important;
}



/* sub-menu item */
.topmenu-container.el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
    float: left;
    height: 56px !important;
    line-height: 56px !important;
    color:#fffc !important;
    padding: 0 10px !important;
    margin: 0 10px !important;
}


/* 背景色隐藏 */
.topmenu-container.el-menu--horizontal>.el-menu-item:not(.is-disabled):hover, .topmenu-container.el-menu--horizontal>.el-submenu .el-submenu__title:hover {
  background-color: #ffffff1a!important;
  color: #fffc!important;
}
/* 背景色隐藏 */
.topmenu-container.el-menu--horizontal>.el-menu-item.is-active:not(.is-disabled):hover, .topmenu-container.el-menu--horizontal>.el-submenu.is-active .el-submenu__title:hover {
  color: #fff!important;
  background-color: #3370FF!important;
}


/* 图标右间距 */
.topmenu-container .svg-icon {
  margin-right: 4px;
}

/* topmenu more arrow */
.topmenu-container .el-sub-menu .el-sub-menu__icon-arrow {
  position: static;
  vertical-align: middle;
  margin-left: 8px;
  margin-top: 0px;
}
.el-menu--horizontal>.el-sub-menu .el-sub-menu__title:hover {
  background-color: #ffffff1a!important;
  color: #fffc!important;
}
.el-menu--horizontal>.el-sub-menu.is-active .el-sub-menu__title {
  color: #fff!important;
  background-color: #3370FF!important;
  border-bottom-width:0px!important;
}
</style>
