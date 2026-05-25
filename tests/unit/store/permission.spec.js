import { filterAsyncRouter } from '@/store/modules/permission-route'

describe('permission dynamic routes', () => {
  it('preserves backend menu path hierarchy for nested dynamic routes', () => {
    const backendRoutes = [
      {
        name: 'Customer',
        path: '/customer',
        component: 'Layout',
        meta: { title: '客服管理' },
        children: [
          {
            name: 'Customer/chart',
            path: 'customer/chart',
            component: 'customer/chart/index',
            meta: { title: '在线聊天' }
          }
        ]
      },
      {
        name: 'Shop',
        path: '/shop',
        component: 'Layout',
        meta: { title: '商城管理' },
        children: [
          {
            name: 'Goods/edit',
            path: 'goods/edit',
            component: 'shop/goods/edit',
            meta: { title: '修改商品' }
          }
        ]
      }
    ]

    const routes = filterAsyncRouter(backendRoutes)

    expect(routes[0].path).toBe('/customer')
    expect(routes[0].children[0].path).toBe('customer/chart')
    expect(routes[1].children[0].path).toBe('goods/edit')
  })

  it('does not mutate raw backend route data while building dynamic routes', () => {
    const backendRoutes = [
      {
        name: 'ShopUser',
        path: '/shopUser',
        component: 'Layout',
        children: [
          {
            name: 'Member',
            path: 'member',
            component: 'shop/user/member/index'
          }
        ]
      }
    ]

    filterAsyncRouter(backendRoutes)

    expect(backendRoutes[0].component).toBe('Layout')
    expect(backendRoutes[0].children[0].component).toBe('shop/user/member/index')
  })

  it('keeps backend directory menus visible even when they only have one child', () => {
    const backendRoutes = [
      {
        name: 'Customer',
        path: '/customer',
        component: 'Layout',
        meta: { title: '客服管理' },
        children: [
          {
            name: 'Customer/chart',
            path: 'customer/chart',
            component: 'customer/chart/index',
            meta: { title: '在线聊天' }
          }
        ]
      }
    ]

    const routes = filterAsyncRouter(backendRoutes)

    expect(routes[0].alwaysShow).toBe(true)
  })
})
