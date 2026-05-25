import { createRouter, createWebHashHistory } from 'vue-router'

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/',
    name: 'layout',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: '首页',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },
  {
    path: '/profile',
    component: Layout,
    children: [{
      path: '',
      name: 'Profile',
      component: () => import('@/views/system/user/profile'),
      hidden: true,
      meta: { title: '个人中心', icon: 'user' }
    }]
  },
  {
    path: '/dict',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'type/data/:parentType(\\w+)',
        component: () => import('@/views/system/dict/data.vue'),
        props: true,
        name: 'Data',
        meta: { title: '字典数据', icon: '' }
      }
    ]
  },
  {
    path: '/shop/msgList',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        name: 'MsgList',
        component: () => import('@/views/shop/msgList/index.vue'),
        meta: { title: '消息通知', icon: 'message' }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  }
]

const router = createRouter({
  // history: createWebHistory('/admin/'), // require service support
  history: createWebHashHistory('/admin/'),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRoutes
})

const dynamicRouteNames = new Set()

export function addDynamicRoute(route) {
  if (route.name) {
    dynamicRouteNames.add(route.name)
  }
  router.addRoute(route)
}

export function resetRouter() {
  dynamicRouteNames.forEach(name => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })
  dynamicRouteNames.clear()
}

export default router
