<template>
  <div class="card">
    <div class="card-title">订单状态</div>
    <div class="status-list">
      <div class="status-row" v-for="item in statuses" :key="item.label">
        <div class="status-icon" :style="{ background: item.bg }">{{ item.icon }}</div>
        <span class="status-label">{{ item.label }}</span>
        <span class="status-count" :style="{ color: item.color }">{{ item.count }}</span>
        <span class="status-arrow">›</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDashboardStats } from '@/api/shop/dashboard'
import { emptyDashboardStats, normalizeStats } from './dashboardData.js'

const stats = ref({ ...emptyDashboardStats })

onMounted(async() => {
  const res = await getDashboardStats()
  if (res.code === 200) stats.value = normalizeStats(res.data)
})

const statuses = computed(() => [
  { label: '待付款', count: stats.value.pendingPayCount, icon: '⏳', color: '#0066cc', bg: '#e8f4ff' },
  { label: '待发货', count: stats.value.pendingShipCount, icon: '📦', color: '#ff9500', bg: '#fff3e0' },
  { label: '待收货', count: stats.value.pendingReceiveCount, icon: '🚚', color: '#af52de', bg: '#f3e5f5' },
  { label: '已完成', count: stats.value.completedOrderCount, icon: '✅', color: '#34c759', bg: '#e8f5e9' },
  { label: '已关闭', count: stats.value.closedOrderCount, icon: '✕', color: '#8e8e93', bg: '#f5f5f7' }
])
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
.status-list { display: flex; flex-direction: column; }
.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  cursor: pointer;
  &:last-child { border-bottom: none; }
}
.status-icon {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.status-label { flex: 1; font-size: 15px; color: #1d1d1f; }
.status-count { font-size: 17px; font-weight: 600; }
.status-arrow { color: #c7c7cc; font-size: 18px; }
</style>
