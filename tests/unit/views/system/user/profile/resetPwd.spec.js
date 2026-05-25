import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import ResetPwd from '@/views/system/user/profile/resetPwd.vue'
import { updateUserPwd } from '@/api/system/user'

const routerPush = vi.fn()
let validateSpy
let resetFieldsSpy

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPush
  })
}))

vi.mock('@/api/system/user', () => ({
  updateUserPwd: vi.fn()
}))

const flushPromises = async() => {
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

function mountResetPwd() {
  return mount(ResetPwd, {
    global: {
      stubs: {
        'el-form': defineComponent({
          props: ['model', 'rules'],
          setup(props, { expose, slots }) {
            expose({
              validate: validateSpy,
              resetFields: resetFieldsSpy
            })

            return () => h('form', slots.default?.())
          }
        }),
        'el-form-item': { template: '<div><slot /></div>' },
        'el-input': {
          props: ['modelValue'],
          emits: ['update:modelValue'],
          template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        },
        'el-button': {
          emits: ['click'],
          template: '<button @click="$emit(\'click\', $event)"><slot /></button>'
        }
      },
      mocks: {
        $message: {
          success: vi.fn(),
          error: vi.fn()
        }
      }
    }
  })
}

describe('profile/resetPwd.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    validateSpy = vi.fn(callback => callback(true))
    resetFieldsSpy = vi.fn()
    updateUserPwd.mockResolvedValue({ code: 200, msg: '操作成功' })
  })

  it('updates the password and clears sensitive form fields after success', async() => {
    const wrapper = mountResetPwd()

    wrapper.vm.passwordForm.oldPassword = 'old-pass'
    wrapper.vm.passwordForm.newPassword = 'new-pass'
    wrapper.vm.passwordForm.confirmPassword = 'new-pass'
    wrapper.vm.submit()
    await flushPromises()

    expect(validateSpy).toHaveBeenCalledTimes(1)
    expect(updateUserPwd).toHaveBeenCalledWith('old-pass', 'new-pass')
    expect(resetFieldsSpy).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.passwordForm).toEqual({
      oldPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined
    })
  })
})
