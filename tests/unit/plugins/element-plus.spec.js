import { elementPlusOptions } from '@/plugins/element-plus'
import { elementPlusIconAliases } from '@/plugins/element-plus-icons'

describe('Element Plus plugin options', () => {
  it('uses Simplified Chinese as the default locale', () => {
    expect(elementPlusOptions.locale.name).toBe('zh-cn')
  })

  it('keeps legacy Element UI icon names resolvable through Element Plus icons', () => {
    expect(elementPlusIconAliases['el-icon-search']).toBe(elementPlusIconAliases.Search)
    expect(elementPlusIconAliases['el-icon-plus']).toBe(elementPlusIconAliases.Plus)
    expect(elementPlusIconAliases['el-icon-delete']).toBe(elementPlusIconAliases.Delete)
  })
})
