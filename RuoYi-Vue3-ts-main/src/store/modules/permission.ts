import auth from '@/plugins/auth';
import router, { constantRoutes, dynamicRoutes } from '@/router';
import { getRouters } from '@/api/menu';
import Layout from '@/layout/index.vue';
import ParentView from '@/components/ParentView/index.vue';
import InnerLink from '@/layout/components/InnerLink/index.vue';
import DataEaseLayout from '@/modules/dataease/layout/index.vue';
import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';

// 匹配views里面所有的.vue文件
//const modules = import.meta.glob('./../../views/**/*.vue');
const modules = {
    ...import.meta.glob('./../../views/**/*.vue'),
    ...import.meta.glob('./../../modules/dataease/**/*.vue'),
};
// 判断是否来自 DataEase 模块
function isDataEaseComponent(component: string) {
    return (
        component.startsWith('modules/dataease/')
    );
}

function normalizeDataEasePath(component: string) {
    if (component.startsWith('modules/dataease/')) return component;
    // 默认 DataEase 页面位于 modules/dataease/views 下
    return 'modules/dataease/views/' + component;
}





const usePermissionStore = defineStore('permission', {
    state: (): {
        routes: RouteRecordRaw[];
        addRoutes: RouteRecordRaw[];
        defaultRoutes: RouteRecordRaw[];
        topbarRouters: RouteRecordRaw[];
        sidebarRouters: RouteRecordRaw[];
    } => ({
        routes: [],
        addRoutes: [],
        defaultRoutes: [],
        topbarRouters: [],
        sidebarRouters: [],
    }),
    actions: {
        setRoutes(routes: RouteRecordRaw[]) {
            this.addRoutes = routes;
            this.routes = constantRoutes.concat(routes);
        },
        setDefaultRoutes(routes: RouteRecordRaw[]) {
            this.defaultRoutes = constantRoutes.concat(routes);
        },
        setTopbarRoutes(routes: RouteRecordRaw[]) {
            this.topbarRouters = routes;
        },
        setSidebarRouters(routes: RouteRecordRaw[]) {
            this.sidebarRouters = routes;
        },
        generateRoutes(routes?: RouteRecordRaw[]) {
            return new Promise<any[]>(resolve => {
                // 向后端请求路由数据
                getRouters().then(res => {
                    const sdata = JSON.parse(JSON.stringify(res.data));
                    const rdata = JSON.parse(JSON.stringify(res.data));
                    const defaultData = JSON.parse(JSON.stringify(res.data));
                    const sidebarRoutes = filterAsyncRouter(sdata);
                    const rewriteRoutes = filterAsyncRouter(rdata, false, true);
                    const defaultRoutes = filterAsyncRouter(defaultData);
                    const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
                    asyncRoutes.forEach(route => {
                        router.addRoute(route);
                    });
                    this.setRoutes(rewriteRoutes);
                    this.setSidebarRouters(constantRoutes.concat(sidebarRoutes));
                    this.setDefaultRoutes(sidebarRoutes);
                    this.setTopbarRoutes(defaultRoutes);
                    console.log('rewriteRoutes', rewriteRoutes);
                    resolve(rewriteRoutes);
                });
            });
        },
    },
});

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap: any[], lastRouter = false, type = false) {
    return asyncRouterMap.filter(route => {
        if (type && route.children) {
            route.children = filterChildren(route.children);
        }
        if (route.component) {
            // Layout ParentView 组件特殊处理
            if (route.component === 'Layout') {
                route.component = Layout;
                if (route.children != null && route.children && route.children.length) {
                    route.children = filterAsyncRouter(route.children, route, type);
                } else {
                    delete route['children'];
                    delete route['redirect'];
                }
            } else if (route.component === 'ParentView') {
                route.component = ParentView;
                if (route.children != null && route.children && route.children.length) {
                    route.children = filterAsyncRouter(route.children, route, type);
                } else {
                    delete route['children'];
                    delete route['redirect'];
                }
            } else if (route.component === 'InnerLink') {
                route.component = InnerLink;
                if (route.children != null && route.children && route.children.length) {
                    route.children = filterAsyncRouter(route.children, route, type);
                } else {
                    delete route['children'];
                    delete route['redirect'];
                }
            } else {
                //route.component = loadView(route.component);
                if (
                    typeof route.component === 'string' &&
                    isDataEaseComponent(route.component) &&
                    !route.component.includes('layout/index')
                ) {
                    // DataEase 页面统一使用 DataEaseLayout 包裹
                    const pagePath = normalizeDataEasePath(route.component);
                    route.component = DataEaseLayout;
                    console.log('DataEase page path:', pagePath);
                    console.log('DataEase page path:', loadView(pagePath));
                    const pageName = route.name as string | undefined;
                    // 父级路由使用不同名称，避免与子页面冲突
                    if (pageName) {
                        route.name = `${pageName}-layout`;
                    }
                    route.children = [
                        {
                            path: '',
                            component: loadView(pagePath),
                            name: pageName,
                            meta: route.meta,
                        },
                    ];
                    console.log('DataEase route:', route);
                } else if (typeof route.component === 'string')  {
                    route.component = loadView(route.component);
                    if (route.children != null && route.children && route.children.length) {
                        route.children = filterAsyncRouter(route.children, route, type);
                    } else {
                        delete route['children'];
                        delete route['redirect'];
                    }
                }
            }
        }
       
        return true;
    });
}

function filterChildren(childrenMap: any[], lastRouter: any = false) {
    let children: any[] = [];
    childrenMap.forEach((el, index) => {
        if (el.children && el.children.length) {
            if (el.component === 'ParentView' && !lastRouter) {
                el.children.forEach((c: any) => {
                    c.path = el.path + '/' + c.path;
                    if (c.children && c.children.length) {
                        children = children.concat(filterChildren(c.children, c));
                        return;
                    }
                    children.push(c);
                });
                return;
            }
        }
        if (lastRouter) {
            el.path = lastRouter.path + '/' + el.path;
        }
        children = children.concat(el);
    });
    return children;
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes: any[]) {
    const res: any[] = [];
    routes.forEach(route => {
        if (route.permissions) {
            if (auth.hasPermiOr(route.permissions)) {
                res.push(route);
            }
        } else if (route.roles) {
            if (auth.hasRoleOr(route.roles)) {
                res.push(route);
            }
        }
    });
    return res;
}

export const loadView = (view: any) => {
  console.log('loadView', modules);

    let res;
    for (const path in modules) {

        let dir;
        if (path.includes('/modules/dataease/')) {
            dir ='modules/dataease/' + path.split('/modules/dataease/')[1].split('.vue')[0];
        } else {
            dir = path.split('views/')[1].split('.vue')[0];
        }

        // const dir = path.split('views/')[1].split('.vue')[0];
        if (dir === view) {
            res = () => modules[path]();
        }
    }
    return res;
};

export default usePermissionStore;
