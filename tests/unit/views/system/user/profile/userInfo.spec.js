import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import UserInfo from '@/views/system/user/profile/userInfo.vue'
import { updateUserProfile } from '@/api/system/user'

const routerPush = vi.fn()
let validateSpy

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPush
  })
}))

vi.mock('@/api/system/user', () => ({
  updateUserProfile: vi.fn()
}))

const flushPromises = async() => {
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

function mountUserInfo(user) {
  return mount(UserInfo, {
    props: {
      user
    },
    global: {
      stubs: {
        'el-form': defineComponent({
          props: ['model', 'rules'],
          setup(props, { expose, slots }) {
            expose({
              validate: validateSpy
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
        'el-radio-group': { template: '<div><slot /></div>' },
        'el-radio': { template: '<label><slot /></label>' },
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

describe('profile/userInfo.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    validateSpy = vi.fn(callback => callback(true))
    updateUserProfile.mockResolvedValue({ code: 200, msg: '操作成功' })
  })

  it('saves an editable profile copy and emits the updated user', async() => {
    const wrapper = mountUserInfo({
      userId: 1,
      userName: 'admin',
      nickName: '管理员',
      phone: '13800138000',
      email: 'admin@example.com',
      sex: 0
    })

    wrapper.vm.profileForm.nickName = '新昵称'
    wrapper.vm.profileForm.phone = '13900139000'
    wrapper.vm.submit()
    await flushPromises()

    expect(validateSpy).toHaveBeenCalledTimes(1)
    expect(updateUserProfile).toHaveBeenCalledWith(expect.objectContaining({
      userId: 1,
      userName: 'admin',
      nickName: '新昵称',
      phone: '13900139000',
      email: 'admin@example.com',
      sex: 0
    }))
    expect(wrapper.emitted('updated')[0][0]).toEqual(expect.objectContaining({
      nickName: '新昵称',
      phone: '13900139000'
    }))
  })
})
