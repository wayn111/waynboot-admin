<template>
  <div class="card">
    <div class="card-title">库存预警</div>
    <div class="stock-list">
      <div class="stock-row header">
        <span class="img-col" />
        <span class="name-col">商品</span>
        <span class="sku-col">SKU</span>
        <span class="qty-col">库存</span>
      </div>
      <div class="stock-row" v-for="item in list" :key="item.goodsId">
        <el-image :src="item.picUrl" style="width:36px;height:36px;border-radius:9999px;flex-shrink:0;box-shadow:rgba(0,0,0,0.22) 3px 5px 30px" fit="cover" />
        <span class="name-col goods-name">{{ item.name }}</span>
        <span class="sku-col sku-text">{{ item.sku }}</span>
        <span class="qty-col" :class="stockClass(item.stock)">{{ item.stock }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboardLowStockGoods } from '@/api/shop/dashboard'
import { normalizeGoodsList } from './dashboardData.js'

const list = ref([])
onMounted(async() => {
  const res = await getDashboardLowStockGoods()
  if (res.code === 200) {
    list.value = normalizeGoodsList(res.data)
  }
})

function stockClass(n) {
  if (n < 10) return 'qty-danger'
  if (n < 20) return 'qty-warn'
  return 'qty-ok'
}
</script>

<style lang="scss" scoped>
.card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.374px;
  margin-bottom: 16px;
}
.stock-list { display: flex; flex-direction: column; }
.stock-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  font-size: 13px;
  &:last-child { border-bottom: none; }
  &.header { color: #6e6e73; font-size: 12px; }
}
.img-col { width: 36px; flex-shrink: 0; }
.name-col { flex: 1; min-width: 0; }
.sku-col { width: 72px; flex-shrink: 0; }
.qty-col { width: 40px; text-align: right; font-weight: 600; flex-shrink: 0; }
.goods-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #1d1d1f; }
.sku-text { color: #6e6e73; }
.qty-ok { color: #34c759; }
.qty-warn { color: #ff9500; }
.qty-danger { color: #ff3b30; }
</style>
