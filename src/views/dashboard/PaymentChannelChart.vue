<template>
  <div class="card">
    <div class="card-title">订单来源</div>
    <div ref="chartRef" style="width:100%;height:200px;" />
    <div class="legend">
      <div class="legend-item" v-for="(item, i) in legendItems" :key="item.name">
        <span class="legend-dot" :style="{ background: colors[i] }" />
        <span class="legend-name">{{ item.name }}</span>
        <span class="legend-pct">{{ item.pct }}%</span>
        <span class="legend-count">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getDashboardPaymentChannel } from '@/api/shop/dashboard'
import { normalizePaymentChannels } from './dashboardData.js'

const chartRef = ref(null)
const legendItems = ref([])
const colors = ['#0066cc', '#34aadc', '#ff9500', '#af52de', '#8e8e93']
let chart = null
const onResize = () => chart?.resize()

onMounted(async() => {
  chart = echarts.init(chartRef.value)
  const res = await getDashboardPaymentChannel()
  if (res.code !== 200) return
  const raw = normalizePaymentChannels(res.data)
  const total = raw.reduce((s, d) => s + d.value, 0)
  legendItems.value = raw.map(d => ({ ...d, pct: total ? ((d.value / total) * 100).toFixed(1) : '0.0' }))
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: '#fff', borderColor: '#e0e0e0', borderRadius: 12, textStyle: { color: '#1d1d1f', fontSize: 13 }},
    color: colors,
    graphic: [
      { type: 'text', left: 'center', top: '36%', style: { text: String(total), font: '600 22px system-ui', fill: '#1d1d1f' }},
      { type: 'text', left: 'center', top: '52%', style: { text: '总订单', font: '13px system-ui', fill: '#6e6e73' }}
    ],
    series: [{ type: 'pie', radius: ['45%', '70%'], center: ['50%', '50%'], data: raw, label: { show: false }, emphasis: { scale: false }}]
  })
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
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
  margin-bottom: 8px;
}
.legend { margin-top: 12px; }
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  font-size: 13px;
  &:last-child { border-bottom: none; }
}
.legend-dot { width: 8px; height: 8px; border-radius: 9999px; flex-shrink: 0; }
.legend-name { flex: 1; color: #1d1d1f; }
.legend-pct { color: #6e6e73; width: 44px; text-align: right; }
.legend-count { color: #1d1d1f; font-weight: 600; width: 36px; text-align: right; }
</style>
