<template>
  <el-row :gutter="16" style="margin-bottom:20px">
    <el-col :span="4" v-for="card in cards" :key="card.label">
      <div class="kpi-card">
        <div class="kpi-icon" :style="{ background: card.bg }">
          <span class="kpi-emoji">{{ card.icon }}</span>
        </div>
        <div class="kpi-body">
          <div class="kpi-label">{{ card.label }}</div>
          <div class="kpi-value">{{ card.prefix }}{{ card.value }}</div>
          <div class="kpi-badge" :class="card.growth >= 0 ? 'up' : 'down'">
            {{ card.growth >= 0 ? '↑' : '↓' }} {{ Math.abs(card.growth).toFixed(1) }}%
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDashboardStats, getDashboardPeriod } from '@/api/shop/dashboard'
import { emptyDashboardPeriod, emptyDashboardStats, normalizePeriod, normalizeStats } from './dashboardData.js'

const stats = ref({ ...emptyDashboardStats })
const period = ref({ ...emptyDashboardPeriod })

onMounted(async() => {
  const [s, p] = await Promise.all([getDashboardStats(), getDashboardPeriod()])
  if (s.code === 200) stats.value = normalizeStats(s.data)
  if (p.code === 200) period.value = normalizePeriod(p.data)
})

const convRate = computed(() => {
  return Number(stats.value.conversionRate || 0).toFixed(1)
})

const cards = computed(() => [
  { label: '今日销售额', value: Number(stats.value.todaySales || 0).toLocaleString(), prefix: '¥', growth: period.value.today?.salesGrowth ?? 0, icon: '💰', bg: '#e8f4ff' },
  { label: '今日订单', value: stats.value.todayOrderCount, prefix: '', growth: period.value.today?.orderGrowth ?? 0, icon: '📦', bg: '#fff3e0' },
  { label: '支付转化率', value: convRate.value + '%', prefix: '', growth: 0, icon: '📈', bg: '#e8f5e9' },
  { label: '新增用户', value: stats.value.todayMemberCount, prefix: '', growth: 0, icon: '👤', bg: '#f3e5f5' },
  { label: '待发货', value: stats.value.pendingShipCount, prefix: '', growth: 0, icon: '🚚', bg: '#fff8e1' },
  { label: '低库存', value: stats.value.lowStockCount, prefix: '', growth: 0, icon: '⚠️', bg: '#fce4ec' }
])
</script>

<style lang="scss" scoped>
.kpi-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-emoji { font-size: 22px; }
.kpi-body { min-width: 0; }
.kpi-label {
  font-size: 13px;
  color: #6e6e73;
  letter-spacing: -0.224px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kpi-value {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.374px;
  line-height: 1.2;
  margin: 2px 0;
}
.kpi-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 9999px;
  &.up { background: #e8f5e9; color: #2e7d32; }
  &.down { background: #fce4ec; color: #c62828; }
}
</style>
