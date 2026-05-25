import { shallowMount } from '@vue/test-utils'
import SidebarItem from '@/layout/components/Sidebar/SidebarItem.vue'

function mountSidebarItem(basePath = '/shopUser') {
  return shallowMount(SidebarItem, {
    props: {
      basePath,
      item: {
        path: basePath,
        meta: { title: '用户管理', icon: 'color' },
        children: []
      }
    },
    global: {
      mocks: {
        $store: {
          state: {
            app: {
              device: 'desktop'
            }
          }
        }
      },
      stubs: {
        'app-link': true,
        'el-menu-item': true,
        'el-sub-menu': true,
        item: true,
        'sidebar-item': true
      }
    }
  })
}

describe('SidebarItem.vue', () => {
  it('resolves backend child route paths without duplicated leading slash', () => {
    const wrapper = mountSidebarItem('/shopUser')

    expect(wrapper.vm.resolvePath('member')).toBe('/shopUser/member')
  })

  it('keeps absolute backend parent route paths unchanged', () => {
    const wrapper = mountSidebarItem('/shopUser')

    expect(wrapper.vm.resolvePath('/shopUser')).toBe('/shopUser')
  })

  it('preserves nested backend menu directory segments', () => {
    const wrapper = mountSidebarItem('/customer')

    expect(wrapper.vm.resolvePath('customer/chart')).toBe('/customer/customer/chart')
  })

  it('keeps backend parent directories visible when alwaysShow is enabled', () => {
    const wrapper = shallowMount(SidebarItem, {
      props: {
        basePath: '/shopUser',
        item: {
          path: '/shopUser',
          alwaysShow: true,
          meta: { title: '用户管理', icon: 'color' },
          children: [
            {
              path: 'member',
              hidden: false,
              meta: { title: '会员管理', icon: 'dict' }
            }
          ]
        }
      },
      global: {
        mocks: {
          $store: {
            state: {
              app: {
                device: 'desktop'
              }
            }
          }
        },
        stubs: {
          'app-link': true,
          'el-menu-item': true,
          'el-sub-menu': {
            props: ['index'],
            template: '<section class="submenu-stub" :data-index="index"><slot name="title" /><slot /></section>'
          },
          item: {
            props: ['title'],
            template: '<span class="menu-title">{{ title }}</span>'
          },
          'sidebar-item': true
        }
      }
    })

    expect(wrapper.find('.submenu-stub').attributes('data-index')).toBe('/shopUser')
    expect(wrapper.find('.menu-title').text()).toBe('用户管理')
  })
})
