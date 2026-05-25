import { defineComponent, h, nextTick, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import Login from '@/views/login/index.vue'
import { getCodeImg } from '@/api/login'

const routerPush = vi.fn()
const dispatch = vi.fn()
const route = reactive({
  query: {}
})
let validateSpy

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({
    push: routerPush
  })
}))

vi.mock('vuex', () => ({
  useStore: () => ({
    dispatch
  })
}))

vi.mock('@/api/login', () => ({
  getCodeImg: vi.fn()
}))

vi.mock('@/utils/jsencrypt', () => ({
  encrypt: value => `encrypted:${value}`,
  decrypt: value => value
}))

const flushPromises = async() => {
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

function mountLogin() {
  return mount(Login, {
    global: {
      stubs: {
        'svg-icon': true,
        'el-form': defineComponent({
          props: ['model', 'rules'],
          setup(props, { expose, slots }) {
            expose({
              validate: validateSpy
            })

            return () => h('form', slots.default?.())
          }
        }),
        'el-form-item': {
          template: '<div><slot /></div>'
        },
        'el-input': {
          props: ['modelValue'],
          template: '<input />'
        },
        'el-checkbox': {
          props: ['modelValue'],
          template: '<label><slot /></label>'
        },
        'el-button': {
          emits: ['click'],
          template: '<button @click="$emit(\'click\', $event)"><slot /></button>'
        }
      }
    }
  })
}

describe('Login.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    route.query = {}
    validateSpy = vi.fn(callback => callback(true))
    getCodeImg.mockResolvedValue({
      data: {
        key: 'captcha-key',
        image: 'captcha-image'
      }
    })
    dispatch.mockResolvedValue()
  })

  it('uses the mounted Element Plus form ref when submitting login', async () => {
    const wrapper = mountLogin()

    await flushPromises()
    wrapper.vm.loginForm.username = 'admin'
    wrapper.vm.loginForm.password = 'password'
    wrapper.vm.loginForm.code = '1234'

    wrapper.vm.handleLogin()
    await flushPromises()

    expect(validateSpy).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith('user/login', expect.objectContaining({
      username: 'admin',
      password: 'password',
      code: '1234'
    }))
    expect(routerPush).toHaveBeenCalledWith({
      path: '/'
    })
  })
})
