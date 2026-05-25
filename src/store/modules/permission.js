import { constantRoutes } from '@/router'
import { getRouters } from '@/api/system/menu'
import Layout from '@/layout/index'
import { filterAsyncRouter } from './permission-route'

const permission = {
  state: {
    routes: [],
    addRoutes: []
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    }
  },
  actions: {
    // 生成路由
    generateRoutes({ commit }) {
      return new Promise(resolve => {
        // 向后端请求路由数据
        getRouters().then(res => {
          const accessedRoutes = filterAsyncRouter(res.data, { layout: Layout })
          accessedRoutes.push({ path: '/:pathMatch(.*)*', redirect: '/404', hidden: true })
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        })
      })
    }
  }
}

export default permission
