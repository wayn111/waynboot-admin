import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import permission from './directive/permission' // 自定义权限控制指令
import '@/permission' // permission control
import { getDicts } from '@/api/system/dict/data'
import { parseTime, addDateRange, download, downloadTemplate, buildTree, saveHandle, updateHandle, echoDictName, showErrorfocus, toolTip } from '@/utils'
import Pagination from '@/components/Pagination'

// 全局组件挂载
Vue.component('Pagination', Pagination)
Vue.prototype.addDateRange = addDateRange
Vue.prototype.getDicts = getDicts
Vue.prototype.parseTime = parseTime
Vue.prototype.download = download
Vue.prototype.downloadTemplate = downloadTemplate
Vue.prototype.buildTree = buildTree
Vue.prototype.saveHandle = saveHandle
Vue.prototype.updateHandle = updateHandle
Vue.prototype.echoDictName = echoDictName
Vue.prototype.showErrorfocus = showErrorfocus
Vue.prototype.toolTip = toolTip

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)
Vue.use(permission)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
