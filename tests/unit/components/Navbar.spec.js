import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import Navbar from '@/layout/components/Navbar.vue'

const dispatch = vi.fn()
const routerPush = vi.fn()

vi.mock('vuex', () => ({
  useStore: () => ({
    getters: {
      avatar: '/avatar.png',
      name: 'admin',
      sidebar: {
        opened: true
      }
    },
    dispatch
  })
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    fullPath: '/dashboard'
  }),
  useRouter: () => ({
    push: routerPush
  })
}))

describe('Navbar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes sidebar opened state to hamburger', () => {
    const wrapper = shallowMount(Navbar, {
      global: {
        stubs: {
          Breadcrumb: true,
          Hamburger: {
            name: 'Hamburger',
            props: ['isActive'],
            template: '<button class="hamburger-stub" :data-active="String(isActive)" />'
          },
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-icon': true,
          'router-link': true
        },
        mocks: {
          $confirm: vi.fn()
        }
      }
    })

    expect(wrapper.find('.hamburger-stub').attributes('data-active')).toBe('true')
  })

  it('renders navbar action links for messages and github', async() => {
    const wrapper = shallowMount(Navbar, {
      global: {
        stubs: {
          Breadcrumb: true,
          Hamburger: true,
          SvgIcon: {
            props: ['iconClass'],
            template: '<i class="svg-icon-stub" :data-icon="iconClass" />'
          },
          'el-badge': {
            props: ['value'],
            template: '<span class="badge-stub" :data-value="value"><slot /></span>'
          },
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-icon': true,
          'router-link': true
        },
        mocks: {
          $confirm: vi.fn()
        }
      }
    })

    expect(wrapper.find('.navbar-message-btn').exists()).toBe(true)
    expect(wrapper.find('.badge-stub').attributes('data-value')).toBe('4')
    expect(wrapper.find('.navbar-message-btn .svg-icon-stub').attributes('data-icon')).toBe('message')
    expect(wrapper.find('.navbar-github-link').attributes('href')).toBe('https://github.com/wayn111/waynboot-admin')
    expect(wrapper.find('.navbar-github-link .svg-icon-stub').attributes('data-icon')).toBe('github')

    await wrapper.find('.navbar-message-btn').trigger('click')
    expect(routerPush).toHaveBeenCalledWith('/shop/msgList')
  })
})
