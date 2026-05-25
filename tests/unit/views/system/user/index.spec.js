import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import UserIndex from '@/views/system/user/index.vue'
import { listUser, updateUser } from '@/api/system/user'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')
let validateSpy

vi.mock('@/api/system/user', () => ({
  listUser: vi.fn(),
  getUser: vi.fn(),
  delUser: vi.fn(),
  addUser: vi.fn(),
  updateUser: vi.fn(),
  exportUser: vi.fn(),
  resetUserPwd: vi.fn(),
  changeUserStatus: vi.fn()
}))

vi.mock('@/api/system/dept', () => ({
  treeselect: vi.fn(() => Promise.resolve({
    data: [{
      id: 100,
      label: '研发部门'
    }]
  }))
}))

vi.mock('@/utils/auth', () => ({
  getToken: vi.fn(() => 'token')
}))

const flushPromises = async() => {
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

function mountUserIndex() {
  return mount(UserIndex, {
    global: {
      directives: {
        hasPermi: {},
        loading: {}
      },
      config: {
        globalProperties: {
          addDateRange: query => query,
          parseTime: value => value,
          getDicts: vi.fn(() => Promise.resolve({ data: [] }))
        }
      },
      stubs: {
        Treeselect: {
          props: ['modelValue', 'options'],
          template: '<div class="treeselect-stub">{{ options?.[0]?.label }}</div>'
        },
        Progess: true,
        Pagination: true,
        'el-row': { template: '<div><slot /></div>' },
        'el-col': { template: '<div><slot /></div>' },
        'el-form': defineComponent({
          props: ['model', 'rules'],
          setup(props, { expose, slots }) {
            expose({
              validate: validateSpy,
              resetFields: vi.fn()
            })

            return () => h('form', slots.default?.())
          }
        }),
        'el-form-item': { template: '<div><slot /></div>' },
        'el-input': { template: '<input />' },
        'el-select': { template: '<div><slot /></div>' },
        'el-option': true,
        'el-date-picker': true,
        'el-button': { template: '<button><slot /></button>' },
        'el-table': { template: '<table><slot /></table>' },
        'el-table-column': true,
        'el-tree': true,
        'el-dialog': { template: '<section><slot /><slot name="footer" /></section>' },
        'el-radio-group': { template: '<div><slot /></div>' },
        'el-radio': { template: '<label><slot /></label>' },
        'el-switch': true,
        'el-upload': { template: '<div><slot /><slot name="tip" /></div>' },
        'el-icon': { template: '<i><slot /></i>' },
        'el-link': { template: '<a><slot /></a>' },
        Upload: true
      },
      mocks: {
        $message: {
          success: vi.fn(),
          error: vi.fn()
        },
        $confirm: vi.fn(),
        $prompt: vi.fn(),
        $alert: vi.fn()
      }
    }
  })
}

describe('System user management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    validateSpy = vi.fn(callback => callback(true))
    listUser.mockResolvedValue({
      data: {
        records: [],
        total: 0
      }
    })
    updateUser.mockResolvedValue({ code: 200, msg: '操作成功' })
  })

  it('uses the Treeselect component instead of the dept API function in the template', () => {
    const source = fs.readFileSync(path.join(projectRoot, 'src/views/system/user/index.vue'), 'utf8')

    expect(source).toContain('<Treeselect')
    expect(source).toContain('treeselect as deptTreeselect')
    expect(source).not.toContain('<treeselect')
  })

  it('shows feedback and refreshes the list after updating a user', async() => {
    const wrapper = mountUserIndex()
    await flushPromises()

    wrapper.vm.open = true
    wrapper.vm.form = {
      userId: 1,
      userName: 'admin',
      nickName: 'admin',
      deptId: 100,
      email: 'admin@example.com',
      phone: '13800138000',
      roleIds: []
    }

    wrapper.vm.submitForm()
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({
      userId: 1,
      deptId: 100
    }))
    expect(wrapper.vm.$message.success).toHaveBeenCalledWith('修改成功')
    expect(wrapper.vm.open).toBe(false)
    expect(listUser).toHaveBeenCalledTimes(2)
  })
})
