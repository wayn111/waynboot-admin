import fs from 'node:fs'

const sourcePath = 'src/views/shop/seckill/index.vue'

describe('Seckill activity editor', () => {
  it('uses goods and product dropdowns for activity SKU selection', () => {
    const source = fs.readFileSync(sourcePath, 'utf8')

    expect(source).toContain("from '@/api/shop/goods'")
    expect(source).toContain('remoteSearchGoods')
    expect(source).toContain('handleSkuGoodsChange')
    expect(source).toContain('getSkuProductOptions')
    expect(source).toContain('isProductSelectedByOtherSku')
    expect(source).toContain('hasDuplicateProductSku')
    expect(source).toContain('placeholder="搜索并选择商品"')
    expect(source).toContain('placeholder="选择货品规格"')
    expect(source).toContain(':disabled="isProductSelectedByOtherSku(scope.row, product.id)"')
    expect(source).toContain('同一活动不能重复选择同一货品')
    expect(source).not.toContain('v-model="scope.row.goodsId" :min="1"')
    expect(source).not.toContain('v-model="scope.row.productId" :min="1"')
  })
})
