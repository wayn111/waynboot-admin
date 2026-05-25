import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import MsgList from '@/views/shop/msgList/index.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

vi.mock('@/utils/auth', () => ({
  getToken: vi.fn(() => 'token')
}))

vi.mock('@/api/upload', () => ({
  uploadPath: '/upload'
}))

const flushPromises = async() => {
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

function mountMsgList() {
  return mount({
    ...MsgList,
    render: () => null
  }, {
    global: {
      directives: {
        hasPermi: {}
      },
      mocks: {
        $message: {
          success: vi.fn()
        }
      }
    }
  })
}

describe('MsgList.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads hardcoded frontend messages without the missing backend list API', async() => {
    const wrapper = mountMsgList()
    await flushPromises()

    expect(wrapper.vm.localMessages).toHaveLength(4)
    expect(wrapper.vm.msgData.length).toBeGreaterThan(0)
    expect(wrapper.vm.total).toBe(wrapper.vm.msgData.length)
  })
})
