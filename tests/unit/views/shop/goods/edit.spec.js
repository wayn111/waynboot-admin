import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineComponent, h, reactive, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import GoodsEdit from '@/views/shop/goods/edit.vue'
import { getGoods } from '@/api/shop/goods'

const routerPush = vi.fn()
const mockedRoute = reactive({
  query: {
    id: '1',
    pageNum: '1'
  }
})

vi.mock('vue-router', () => ({
  useRoute: () => mockedRoute,
  useRouter: () => ({
    push: routerPush
  })
}))

vi.mock('@/api/shop/goods', () => ({
  getGoods: vi.fn(),
  updateGoods: vi.fn()
}))

vi.mock('@/api/shop/category', () => ({
  listCategory: vi.fn(() => Promise.resolve({ data: [] }))
}))

vi.mock('@/api/upload', () => ({
  uploadPath: '/upload',
  fileUpload: vi.fn()
}))

vi.mock('@/utils/auth', () => ({
  getToken: vi.fn(() => 'token')
}))

vi.mock('@/utils/tinymce-editor', () => ({
  default: defineComponent({
    name: 'Editor',
    props: ['modelValue', 'init', 'licenseKey'],
    setup(props) {
      return () => h('div', {
        class: 'editor-stub',
        'data-model-value': props.modelValue,
        'data-license-key': props.licenseKey
      })
    }
  })
}))

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')
const flushPromises = async() => {
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}
let wrapper

function mountGoodsEditScript() {
  return mount({
    ...GoodsEdit,
    render: () => null
  }, {
    global: {
      mocks: {
        $message: {
          success: vi.fn()
        },
        buildTree: vi.fn(() => []),
        showErrorfocus: vi.fn()
      }
    }
  })
}

function mountGoodsEdit() {
  return mount(GoodsEdit, {
    global: {
      stubs: {
        'el-card': { template: '<section><slot /></section>' },
        'el-form': {
          props: ['model', 'rules'],
          template: '<form><slot /></form>'
        },
        'el-form-item': { template: '<div><slot /></div>' },
        'el-input': {
          props: ['modelValue'],
          template: '<input />'
        },
        'el-radio': { template: '<label><slot /></label>' },
        'el-radio-group': { template: '<div><slot /></div>' },
        'el-upload': { template: '<div><slot /><slot name="tip" /></div>' },
        'el-icon': { template: '<i><slot /></i>' },
        'el-tag': { template: '<span><slot /></span>' },
        'el-button': { template: '<button><slot /></button>' },
        'el-cascader': {
          props: ['modelValue', 'options', 'props'],
          template: '<div />'
        },
        'el-table': {
          props: ['data'],
          template: '<table><slot /></table>'
        },
        'el-table-column': { template: '<td><slot name="default" :row="{}" /></td>' },
        'el-dialog': {
          props: ['modelValue'],
          template: '<div v-if="modelValue"><slot /><slot name="footer" /></div>'
        },
        'el-switch': {
          props: ['modelValue'],
          template: '<button />'
        },
        Plus: { template: '<i />' }
      },
      mocks: {
        $message: {
          success: vi.fn()
        },
        buildTree: vi.fn(() => []),
        showErrorfocus: vi.fn()
      }
    }
  })
}

function mockGoodsDetail(id, detail) {
  return {
    data: {
      goods: {
        id,
        name: `测试商品${id}`,
        detail,
        gallery: [],
        keywords: null
      },
      specifications: [],
      products: [],
      attributes: [],
      categoryIds: []
    }
  }
}

describe('GoodsEdit.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedRoute.query = {
      id: '1',
      pageNum: '1'
    }
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  it('keeps TinyMCE unmounted until async product detail is loaded', async () => {
    getGoods.mockResolvedValue(mockGoodsDetail(1, '<p>已有详情</p>'))

    wrapper = mountGoodsEditScript()

    expect(wrapper.vm.goodsLoaded).toBe(false)

    await flushPromises()

    expect(wrapper.vm.goods.detail).toBe('<p>已有详情</p>')
    expect(wrapper.vm.goodsLoaded).toBe(true)
  })

  it('passes loaded product detail into the TinyMCE editor', async () => {
    getGoods.mockResolvedValue(mockGoodsDetail(1, '<p>已有详情</p>'))

    wrapper = mountGoodsEdit()

    expect(wrapper.find('.editor-stub').exists()).toBe(false)

    await flushPromises()

    const editor = wrapper.find('.editor-stub')
    expect(editor.attributes('data-model-value')).toBe('<p>已有详情</p>')
    expect(editor.attributes('data-license-key')).toBe('gpl')
  })

  it('reloads TinyMCE content when editing another product on the same route', async () => {
    getGoods
      .mockResolvedValueOnce(mockGoodsDetail(1, '<p>第一个商品详情</p>'))
      .mockResolvedValueOnce(mockGoodsDetail(2, '<p>第二个商品详情</p>'))

    wrapper = mountGoodsEdit()
    await flushPromises()

    expect(wrapper.find('.editor-stub').attributes('data-model-value')).toBe('<p>第一个商品详情</p>')

    mockedRoute.query = {
      id: '2',
      pageNum: '1'
    }
    await nextTick()
    await flushPromises()

    expect(getGoods).toHaveBeenLastCalledWith('2')
    expect(wrapper.find('.editor-stub').attributes('data-model-value')).toBe('<p>第二个商品详情</p>')
  })

  it('renders the TinyMCE editor only after product detail is ready', () => {
    const source = fs.readFileSync(path.join(projectRoot, 'src/views/shop/goods/edit.vue'), 'utf8')

    expect(source).toContain('<editor')
    expect(source).toContain('v-if="goodsLoaded"')
    expect(source).toContain('v-model="goods.detail"')
  })
})
