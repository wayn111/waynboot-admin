import { createApp } from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'

import '@/styles/index.scss' // global css

import App from './App.vue'
import store from './store'
import router from './router'

import icons from '@/icons' // icon
import permission from './directive/permission' // 自定义权限控制指令
import '@/permission' // permission control
import { getDicts } from '@/api/system/dict/data'
import { parseTime, addDateRange, download, downloadTemplate, buildTree, saveHandle, updateHandle, echoDictName, showErrorfocus, toolTip } from '@/utils'
import Pagination from '@/components/Pagination'
import { installElementPlus } from '@/plugins/element-plus'

const app = createApp(App)

// 全局组件挂载
app.component('Pagination', Pagination)
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.getDicts = getDicts
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.download = download
app.config.globalProperties.downloadTemplate = downloadTemplate
app.config.globalProperties.buildTree = buildTree
app.config.globalProperties.saveHandle = saveHandle
app.config.globalProperties.updateHandle = updateHandle
app.config.globalProperties.echoDictName = echoDictName
app.config.globalProperties.showErrorfocus = showErrorfocus
app.config.globalProperties.toolTip = toolTip

installElementPlus(app)
app.use(permission)
app.use(icons)
app.use(store)
app.use(router)

app.mount('#app')
