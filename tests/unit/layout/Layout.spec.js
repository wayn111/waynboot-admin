import { mount } from '@vue/test-utils'
import Layout from '@/layout/index.vue'

vi.mock('vuex', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    useStore: () => ({
      state: {
        app: {
          sidebar: {
            opened: true,
            withoutAnimation: false
          },
          device: 'desktop'
        },
        settings: {
          fixedHeader: false,
          sidebarLogo: true
        }
      },
      getters: {
        permission_routes: [
          {
            path: '/shopUser',
            meta: { title: '用户管理', icon: 'color' },
            children: []
          }
        ],
        sidebar: {
          opened: true
        },
        avatar: '/avatar.png',
        name: 'admin'
      },
      dispatch: vi.fn()
    })
  }
})

vi.mock('vue-router', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRoute: () => ({
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: {}
    }),
    useRouter: () => ({
      push: vi.fn()
    })
  }
})

describe('Layout.vue', () => {
  it('renders the sidebar container in the app shell', () => {
    const wrapper = mount(Layout, {
      global: {
        stubs: {
          Navbar: true,
          AppMain: true,
          Logo: true,
          'el-scrollbar': {
            template: '<div><slot /></div>'
          },
          'el-menu': {
            template: '<nav><slot /></nav>'
          },
          SidebarItem: {
            props: ['item'],
            template: '<div class="sidebar-item-stub">{{ item.meta.title }}</div>'
          }
        },
        mocks: {
          $confirm: vi.fn()
        }
      }
    })

    expect(wrapper.find('.sidebar-container').exists()).toBe(true)
    expect(wrapper.find('.sidebar-item-stub').text()).toBe('用户管理')
  })
})
