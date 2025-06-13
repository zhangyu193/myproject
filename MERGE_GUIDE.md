# 数据整合指南：将 DataEase 2.10 嵌入 RuoYi-Vue3-TS

本文档说明如何在不改变 DataEase 后端服务的前提下，将 `dataease-2.10` 前端项目整合到 `RuoYi-Vue3-ts-main` 中，并利用若依的菜单权限控制 DataEase 页面。

## 一、准备工作
1. 分别在两个项目根目录执行 `npm install`，确保它们可以独立运行。
2. 以后只保留 `RuoYi-Vue3-ts-main` 的 `package.json` 及构建脚本。

## 二、拷贝 DataEase 源码
1. 在 `RuoYi-Vue3-ts-main/src` 下新建子目录：
   ```bash
   mkdir -p RuoYi-Vue3-ts-main/src/modules/dataease
   ```
2. 将 `dataease-2.10/src` 下的文件复制到新目录：
   ```bash
cp -r dataease-2.10/src/* RuoYi-Vue3-ts-main/src/modules/dataease/
   ```
   复制后 `src/modules/dataease` 目录应包含 `api`、`components`、`assets`、`hooks`、
   `directive`、`views` 等完整子目录，便于后续直接引用。
3. 将 `dataease-2.10/public` 中的静态资源复制到 `RuoYi-Vue3-ts-main/public`。
4. 继续拷贝 DataEase 根目录下的辅助文件：
   ```bash
   cp -r dataease-2.10/config        RuoYi-Vue3-ts-main/src/modules/dataease/
   cp -r dataease-2.10/types         RuoYi-Vue3-ts-main/types
   cp -r dataease-2.10/src/style     RuoYi-Vue3-ts-main/src/modules/dataease/style
   cp dataease-2.10/.prettierignore  RuoYi-Vue3-ts-main/.prettierignore
   cp dataease-2.10/stylelint.config.js RuoYi-Vue3-ts-main/stylelint.config.js
   cp dataease-2.10/pom.xml          RuoYi-Vue3-ts-main/pom.xml
   cp dataease-2.10/index.html       RuoYi-Vue3-ts-main/src/modules/dataease/index.html
   # 若依项目已包含 tsconfig.json 和 vite.config.ts，可对照 dataease-2.10 的配置
   # 将其中的插件与编译选项合并到 RuoYi 的文件中，无需整份拷贝。
   # `components.d.ts` 等由 unplugin 自动生成的文件不需要复制，运行构建或启动
   # 服务时会自动产生
  ```

## 三、合并依赖
1. 打开 `RuoYi-Vue3-ts-main/package.json`，把 DataEase 需要的依赖添加进去，例如：
   ```diff
   {
     "dependencies": {
       "@antv/s2": "^1.11.4",
       "normalize.css": "^8.0.1",
       // 其余依赖按需添加
     },
     "devDependencies": {
       "unplugin-vue-components-secondary": "^0.24.6",
       "vite-plugin-style-import-secondary": "^2.0.0"
     }
   }
   ```
2. 在 `RuoYi-Vue3-ts-main` 根目录重新执行 `npm install`。

## 四、配置别名
编辑 `RuoYi-Vue3-ts-main/vite.config.ts`：
```diff
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@dataease': path.resolve(__dirname, 'src/modules/dataease'),
    '@de': path.resolve(__dirname, 'src/modules/dataease'),
  }
 }
```
这样 DataEase 中原来以 `@/` 开头的引用可以调整为 `@dataease/`。
同时为兼容旧代码中 `@de/router` 的写法，可在 `src/modules/dataease/router/index.ts` 新建文件：

```ts
export { default } from '@/router'
```

这样无论是 `@de/router` 还是 `@dataease/router`，最终都会指向若依的路由实例。

并在 `vite.config.ts` 的 `css.preprocessorOptions.less` 中引入全局变量：

```diff
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${path.resolve('src/modules/dataease/style/variable.less')}";`
        },
        javascriptEnabled: true
      }
    }
  }
```

这样所有 DataEase 组件都能使用 `variable.less` 中的变量，避免编译时出现未定义的样式变量错误。

接着修改 `RuoYi-Vue3-ts-main/tsconfig.json` 的 `paths` 字段，使 TypeScript 能识别新别名：

```diff
"paths": {
    "@/*": ["src/*"],
    "~/*": ["/*"],
    "@dataease/*": ["src/modules/dataease/*"],
    "@de/*": ["src/modules/dataease/*"]
}
```
并在 `include` 中加入 DataEase 自定义类型：

```diff
"include": [
  "src/**/*.ts",
  "src/**/*.d.ts",
  "src/**/*.tsx",
  "src/**/*.vue",
  "types/**/*.d.ts",
  "test.ts"
]
```
同时在 `compilerOptions` 中补充 `types` 数组以加载 DataEase 提供的全局声明：

```diff
"types": [
  "vite/client",
  "vite-plugin-svg-icons/client",
  "element-plus-secondary/global"
]
```
合并完成后可删除 `dataease-2.10/tsconfig.json`，统一使用若依项目的 `tsconfig.json`。

## 五、配置组件自动导入
1. 修改 `vite/plugins/auto-import.ts` 与 `vite/plugins/components.ts`，同时注册 `element-plus-secondary`：
   ```diff
   // auto-import.ts
   -import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
   +import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
   +import { ElementPlusResolver as ElementPlusSecondaryResolver } from 'unplugin-vue-components-secondary/resolvers'
   export default function createAutoImport() {
     return AutoImport({
   -    resolvers: [ElementPlusResolver()],
   +    resolvers: [ElementPlusResolver(), ElementPlusSecondaryResolver()],
     })
   }

   // components.ts
   -import Components from 'unplugin-vue-components/vite'
   -import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
   +import Components from 'unplugin-vue-components/vite'
   +import ComponentsSecondary from 'unplugin-vue-components-secondary/vite'
   +import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
   +import { ElementPlusResolver as ElementPlusSecondaryResolver } from 'unplugin-vue-components-secondary/resolvers'
   export default function createComponents() {
   -  return Components({ dts: 'src/components.d.ts', resolvers: [ElementPlusResolver()] })
   +  const primary = Components({ dts: 'src/components.d.ts', resolvers: [ElementPlusResolver()] })
   +  const secondary = ComponentsSecondary({ dts: 'src/components.d.ts', resolvers: [ElementPlusSecondaryResolver()] })
   +  return [primary, secondary]
   }
   ```
2. 在 `vite/plugins/index.ts` 中按数组形式添加返回的插件，并引入 `vite/plugins/style-import-secondary.ts`：
   ```diff
   import createStyleImportSecondary from './style-import-secondary'
   const comps = createComponents()
   Array.isArray(comps) ? vitePlugins.push(...comps) : vitePlugins.push(comps)
   vitePlugins.push(createStyleImportSecondary())
   ```
   新增的 `style-import-secondary.ts` 文件内容：
   ```ts
   import { createStyleImportPlugin, ElementPlusSecondaryResolve } from 'vite-plugin-style-import-secondary'
   export default function createStyleImportSecondary() {
     return createStyleImportPlugin({
       resolves: [ElementPlusSecondaryResolve()],
       libs: [{
         libraryName: 'element-plus-secondary',
         esModule: true,
         resolveStyle: name => `element-plus-secondary/es/components/${name.substring(3)}/style/css`,
       }],
     })
   }
   ```

## 六、整合入口文件
1. 在 `src/modules/dataease` 下新建 `setup.ts`，用于注册 DataEase 相关插件：
   ```ts
   import { installDirective } from './directive'
   import { setupCustomComponent } from './custom-component'
   import { setupI18n } from './plugins/vue-i18n'

   export default async function setupDataEase(app: any) {
     installDirective(app)
     await setupI18n(app)
     setupCustomComponent(app)
   }
   ```
2. 修改 `RuoYi-Vue3-ts-main/src/main.ts`：
   ```diff
   import { createApp } from 'vue'
   import App from './App.vue'
   import store from './store'
   import router from './router'
+  import setupDataEase from '@/modules/dataease/setup'

   const app = createApp(App)
   app.use(router)
   app.use(store)
+  await setupDataEase(app)
   app.mount('#app')
   ```
3. 修改 `src/modules/dataease/store/index.ts`，直接复用若依的 Pinia 实例：
   ```ts
   import store from '@/store'
   export { store }
   export const setupStore = () => {}
   ```

## 七、整合状态管理
1. 保留 DataEase 的 `store/modules` 目录，将其整体复制到
   `RuoYi-Vue3-ts-main/src/modules/dataease/store/modules`。
2. 各模块中引用 `../index` 的代码无需改动，因为新的 `index.ts` 已经返回
   若依项目的 Pinia 实例。
3. 若希望按需引入，可在 `src/store/modules` 下创建包装模块，例如：
   ```ts
   // src/store/modules/dataease-app.ts
   export * from '@/modules/dataease/store/modules/app'
   ```
4. 在业务页面直接使用 `useAppStore`、`useAppStoreWithOut` 等方法即可与
   若依的其它 store 模块共存。
5. 为避免与若依自带的 `user` 模块冲突，需修改 `modules/dataease/store/modules/user.ts`
   中的 store 标识：
   ```diff
   -export const userStore = defineStore('user', {
   +export const userStore = defineStore('de-user', {
   ```
   保留 `useUserStoreWithOut` 的导出名不变，DataEase 代码无需其他改动。

## 八、整合路由
DataEase 页面不再在前端固定声明路由，而是完全依赖若依后台菜单管理来
动态生成。只需保证菜单项的 `component` 字段指向 DataEase 对应的页面
路径即可，例如：

| 菜单 | 路径 | component |
| ---- | ---- | --------- |
| 工作台 | `/dataease/workbench` | `modules/dataease/views/workbranch/index` |
| 仪表板 | `/dataease/dashboard` | `modules/dataease/views/visualized/view/panel/index` |
| 数据大屏 | `/dataease/screen` | `modules/dataease/views/visualized/view/screen/index` |
| 数据准备-数据集 | `/dataease/prepare/dataset` | `modules/dataease/views/visualized/data/dataset/index` |
| 数据准备-数据源 | `/dataease/prepare/datasource` | `modules/dataease/views/visualized/data/datasource/index` |

同时需要修改 `src/store/modules/permission.ts` 中的 `modules` 与 `loadView`
实现，使其能够解析 `modules/dataease` 下的组件：

```ts
const modules = {
  ...import.meta.glob('./../../views/**/*.vue'),
  ...import.meta.glob('./../../modules/dataease/**/*.vue'),
};

export const loadView = (view: any) => {
  let res;
  for (const path in modules) {
    let dir;
    if (path.includes('/modules/dataease/')) {
      dir = 'modules/dataease/' + path.split('/modules/dataease/')[1].split('.vue')[0];
    } else {
      dir = path.split('views/')[1].split('.vue')[0];
    }
    if (dir === view) {
      res = () => modules[path]();
    }
  }
  return res;
};
```

`component` 字段的值需要与 `permission.ts` 中 `loadView` 方法解析的路径保持
一致，以上表格中的路径已按新逻辑整理。

在后台创建完菜单并分配权限后，登录的用户即可根据菜单生成的路由访问
DataEase 页面。

若依后台的菜单只需要填写最终页面的 `component` 路径。为了在不修改后
端的情况下实现 `Layout → DataEaseLayout → 页面` 的层级，需要在
`permission.ts` 的 `filterAsyncRouter` 函数中加入以下判断：

```ts
// 若组件路径位于 modules/dataease/views 下，则自动套入 DataEaseLayout
if (
  typeof route.component === 'string' &&
  route.component.startsWith('modules/dataease/') &&
  !route.component.includes('layout/index')
) {
  const page = route.component
 route.component = loadView('modules/dataease/layout/index')
  route.children = [
    { path: '', component: loadView(page), name: route.name, meta: route.meta }
  ]
} else {
  route.component = loadView(route.component)
}
```

这样在后台菜单中只配置页面路径即可，前端会自动使用 DataEaseLayout 进行包裹。

### 常见问题
如果从 DataEase 页面切换回普通页面时出现空白，多半是路由组件没有成功加载。
请确认 `loadView` 解析路径的逻辑与上文一致，并在 `src/router/index.ts` 中：
```ts
import dataeaseRoutes from './modules/dataease'
export const dynamicRoutes: RouteRecordRaw[] = [
  ...dataeaseRoutes,
  // 其它动态路由
]
```

## 九、接口调用处理
1. 保持 DataEase 自带的 `src/config/axios` 目录及其拦截器，不再替换为若依的 `request.ts`。
2. 打开 `src/config/axios/refresh.ts`，在 `configHandler` 中通过 `getToken()` 读取若依登录后保存的 token，并写入请求头 `X-DE-TOKEN`，其它刷新逻辑可删除：
   ```ts
   import { getToken } from '@/utils/auth'

   export const configHandler = config => {
     const token = getToken()
     if (token) config.headers['X-DE-TOKEN'] = token
     return config
   }
   ```
3. 这样 DataEase 调用接口时仍沿用自身的拦截器，但无需再次登录，直接复用若依的 token 即可。

## 十、统一权限验证
1. 删除 DataEase 项目中的 `src/permission.ts` 以及 `src/store/modules/permission.ts`。
2. 在新位置创建同名文件并重导出若依的权限模块：
   ```ts
   export { default } from '@/store/modules/permission'
   export * from '@/store/modules/permission'
   ```
   这样页面使用 `usePermissionStoreWithOut` 等方法即可直接获取若依的权限数据。

## 十一、移除 DataEase 自身的登录
1. 删除 DataEase 项目中与登录相关的页面和 store 模块，具体包括:
   - `src/views/login`
   - `src/views/mobile/login`
   - `src/api/login.ts`
   - `src/store/modules/permission.ts`
   - `src/permission.ts`
   这些逻辑交由若依框架处理。
2. 依赖若依登录后的 token，由 `request.ts` 自动在请求头携带。
## 十二、菜单权限设置
在若依后台的菜单管理中新增三个菜单：
- 菜单 A：路径 `/dataease/workbench`，权限标识 `A`。
- 菜单 B：路径 `/dataease/dashboard`，权限标识 `B`。
- 菜单 C：路径 `/dataease/dataset`，权限标识 `C`。
根据需要给角色分配相应权限，用户登录后即可从若依菜单进入 DataEase 页面。

## 十三、构建与运行
1. DataEase 后端服务保持原有启动方式。
2. 前端统一在 `RuoYi-Vue3-ts-main` 目录执行：
   ```bash
   npm run dev
   ```
   或打包：
   ```bash
   npm run build:prod
   ```
打包结果将自动包含 `modules/dataease` 模块。

以上步骤便完成了将 DataEase 嵌入 RuoYi 的过程，可根据实际需求对样式和组件名称进行进一步调整。

## 十四、校验合并结果

请在完成合并后逐项检查：

1. `src/modules/dataease` 目录下包含 `api`、`components`、`assets`、`directive`、`hooks`、`views` 等所有源码文件；
2. `public/` 中存在 `dataease.svg`、`svg/*` 以及 `tinymce-dataease-private/*` 等静态资源；
3. `src/modules/dataease/store/modules` 已拷贝全部 DataEase store 模块，而不仅仅是 `link.ts`；
4. `src/main.ts` 中调用了 `setupDataEase(app)`，并确保相关依赖在 `package.json` 中安装；
5. 若页面渲染或路由出现问题，可对照本指南重新核对文件是否遗漏。
