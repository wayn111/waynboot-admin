<template>
  <div class="card">
    <div class="card-title">近7天销售趋势</div>
    <div ref="chartRef" style="width:100%;height:280px;" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getDashboardTrend } from '@/api/shop/dashboard'
import { normalizeTrend } from './dashboardData.js'

const chartRef = ref(null)
let chart = null
const onResize = () => chart?.resize()

onMounted(async() => {
  chart = echarts.init(chartRef.value)
  const res = await getDashboardTrend()
  if (res.code !== 200) return
  const { dates, sales } = normalizeTrend(res.data)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 12,
      textStyle: { color: '#1d1d1f', fontSize: 13 },
      formatter: (p) => `${p[0].axisValue}<br/>销售额：¥${Number(p[0].value || 0).toLocaleString()}`
    },
    grid: { top: 16, right: 16, bottom: 32, left: 60 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#6e6e73', fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' }},
      axisLabel: { color: '#6e6e73', fontSize: 13, formatter: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v }
    },
    series: [{
      type: 'line',
      smooth: true,
      data: sales,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#0066cc', width: 2 },
      itemStyle: { color: '#0066cc' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0,102,204,0.15)' },
          { offset: 1, color: 'rgba(0,102,204,0.01)' }
        ])
      }
    }]
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
  margin-bottom: 16px;
}
</style>
