import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Breadcrumb from '@/components/Breadcrumb/index.vue'

let mockedRoute
const mockedRouter = {
  push: vi.fn()
}

vi.mock('vue-router', () => ({
  useRoute: () => mockedRoute,
  useRouter: () => mockedRouter
}))

function routeFrom(matched, params = {}) {
  return {
    matched,
    params
  }
}

const routes = {
  dashboard: routeFrom([
    { path: '/dashboard', name: '首页', meta: { title: '首页' }}
  ]),
  normal: routeFrom([
    { path: '/menu/menu1', name: 'menu1', meta: { title: 'menu1' }}
  ]),
  nested: routeFrom([
    { path: '/menu/menu1', name: 'menu1', meta: { title: 'menu1' }},
    { path: '/menu/menu1/menu1-2', name: 'menu1-2', redirect: 'noRedirect', meta: { title: 'menu1-2' }},
    { path: '/menu/menu1/menu1-2/menu1-2-1', name: 'menu1-2-1', meta: { title: 'menu1-2-1' }}
  ]),
  noTitle: routeFrom([
    { path: '/menu/menu1', name: 'menu1', meta: { title: 'menu1' }},
    { path: '/menu/menu1/menu1-2', name: 'menu1-2', redirect: 'noRedirect', meta: { title: 'menu1-2' }},
    { path: '/menu/menu1/menu1-2/menu1-2-2', name: 'menu1-2-2' }
  ])
}

describe('Breadcrumb.vue', () => {
  let wrapper

  function mountBreadcrumb(route) {
    mockedRoute = route
    return mount(Breadcrumb, {
      global: {
        stubs: {
          'el-breadcrumb': {
            template: '<div class="el-breadcrumb"><slot /></div>'
          },
          'el-breadcrumb-item': {
            template: '<span class="el-breadcrumb__inner"><slot /></span>'
          }
        },
        mocks: {}
      }
    })
  }

  it('dashboard', async() => {
    wrapper = mountBreadcrumb(routes.dashboard)
    await nextTick()
    expect(wrapper.vm.levelList).toHaveLength(1)
  })
  it('normal route', async() => {
    wrapper = mountBreadcrumb(routes.normal)
    await nextTick()
    expect(wrapper.vm.levelList).toHaveLength(2)
  })
  it('nested route', async() => {
    wrapper = mountBreadcrumb(routes.nested)
    await nextTick()
    expect(wrapper.vm.levelList).toHaveLength(4)
  })
  it('no meta.title', async() => {
    wrapper = mountBreadcrumb(routes.noTitle)
    await nextTick()
    expect(wrapper.vm.levelList).toHaveLength(3)
  })
  // it('click link', () => {
  //   router.push('/menu/menu1/menu1-2/menu1-2-2')
  //   const breadcrumbArray = wrapper.findAll('.el-breadcrumb__inner')
  //   const second = breadcrumbArray.at(1)
  //   console.log(breadcrumbArray)
  //   const href = second.find('a').attributes().href
  //   expect(href).toBe('#/menu/menu1')
  // })
  // it('noRedirect', () => {
  //   router.push('/menu/menu1/menu1-2/menu1-2-1')
  //   const breadcrumbArray = wrapper.findAll('.el-breadcrumb__inner')
  //   const redirectBreadcrumb = breadcrumbArray.at(2)
  //   expect(redirectBreadcrumb.contains('a')).toBe(false)
  // })
  it('last breadcrumb', async() => {
    wrapper = mountBreadcrumb(routes.nested)
    await nextTick()
    expect(wrapper.vm.levelList.at(-1).meta.title).toBe('menu1-2-1')
  })
})
