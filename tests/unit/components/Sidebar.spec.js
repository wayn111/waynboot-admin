import { shallowMount } from '@vue/test-utils'
import Sidebar from '@/layout/components/Sidebar/index.vue'

const permissionRoutes = [
  {
    path: '/shopUser',
    meta: { title: '用户管理', icon: 'color' },
    children: [
      {
        path: 'member',
        meta: { title: '会员管理', icon: 'dict' }
      }
    ]
  },
  {
    path: '/operation',
    meta: { title: '运营管理', icon: 'drag' },
    children: []
  }
]

vi.mock('vuex', () => ({
  useStore: () => ({
    state: {
      app: {
        sidebar: {
          opened: true
        }
      },
      settings: {
        sidebarLogo: true
      }
    },
    getters: {
      permission_routes: permissionRoutes,
      sidebar: {
        opened: true
      }
    }
  })
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/shopUser/member',
    meta: {}
  })
}))

describe('Sidebar.vue', () => {
  it('renders menu items from generated permission routes', () => {
    const wrapper = shallowMount(Sidebar, {
      global: {
        stubs: {
          Logo: true,
          'el-scrollbar': {
            template: '<div><slot /></div>'
          },
          'el-menu': {
            props: ['defaultActive', 'collapse'],
            template: '<nav><slot /></nav>'
          },
          SidebarItem: {
            name: 'SidebarItem',
            props: ['item', 'basePath'],
            template: '<div class="sidebar-item-stub" :data-path="item.path" />'
          }
        }
      }
    })

    expect(wrapper.findAll('.sidebar-item-stub')).toHaveLength(2)
    expect(wrapper.findAll('.sidebar-item-stub').map(item => item.attributes('data-path'))).toEqual([
      '/shopUser',
      '/operation'
    ])
    expect(wrapper.vm.isCollapse).toBe(false)
  })
})
