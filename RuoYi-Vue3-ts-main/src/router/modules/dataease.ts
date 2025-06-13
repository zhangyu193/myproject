import Layout from '@/layout/index.vue'

const dataeaseRoutes = [
  {
    path: '/dataease/workbench',
    component: 'modules/dataease/views/workbranch/index',
    name: 'DataEaseWorkbench',
    meta: { title: '工作台', icon: 'dashboard' }
  },
  {
    path: '/dataease/dashboard',
    component: 'modules/dataease/views/visualized/view/panel/index',
    name: 'DataEaseDashboard',
    meta: { title: '仪表板', icon: 'dashboard' }
  },
  {
    path: '/dataease/screen',
    component: 'modules/dataease/views/visualized/view/screen/index',
    name: 'DataEaseScreen',
    meta: { title: '数据大屏', icon: 'dashboard' }
  },
  {
    path: '/dataease/prepare',
    component: Layout,
    name: 'DataEasePrepare',
    meta: { title: '数据准备', icon: 'dashboard' },
    children: [
      {
        path: 'dataset',
        component: 'modules/dataease/views/visualized/data/dataset/index',
        name: 'DataEaseDataset',
        meta: { title: '数据集' }
      },
      {
        path: 'datasource',
        component: 'modules/dataease/views/visualized/data/datasource/index',
        name: 'DataEaseDatasource',
        meta: { title: '数据源' }
      }
    ]
  }
]

export default dataeaseRoutes
