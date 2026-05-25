<template>
  <div class="card">
    <div class="card-title">热销商品</div>
    <div class="goods-list">
      <div class="goods-row header">
        <span class="rank-col">排名</span>
        <span class="name-col">商品</span>
        <span class="num-col">销量</span>
        <span class="num-col">单价</span>
      </div>
      <div class="goods-row" v-for="(item, i) in list" :key="item.goodsId">
        <span class="rank-col">
          <span class="rank-badge" :class="i < 3 ? 'top' : ''">{{ i + 1 }}</span>
        </span>
        <span class="name-col">
          <el-image :src="item.picUrl" style="width:36px;height:36px;border-radius:8px;flex-shrink:0;box-shadow:rgba(0,0,0,0.22) 3px 5px 30px" fit="cover" />
          <span class="goods-name">{{ item.name }}</span>
        </span>
        <span class="num-col">{{ item.actualSales }}</span>
        <span class="num-col">¥{{ item.retailPrice }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboardTopGoods } from '@/api/shop/dashboard'
import { normalizeGoodsList } from './dashboardData.js'

const list = ref([])
onMounted(async() => {
  const res = await getDashboardTopGoods()
  if (res.code === 200) list.value = normalizeGoodsList(res.data)
})
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
.goods-list { display: flex; flex-direction: column; }
.goods-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  font-size: 13px;
  color: #1d1d1f;
  &:last-child { border-bottom: none; }
  &.header { color: #6e6e73; font-size: 12px; padding-bottom: 8px; }
}
.rank-col { width: 36px; flex-shrink: 0; }
.name-col { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
.num-col { width: 56px; text-align: right; flex-shrink: 0; }
.goods-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background: #f5f5f7;
  color: #6e6e73;
  &.top { background: #0066cc; color: #fff; }
}
</style>
