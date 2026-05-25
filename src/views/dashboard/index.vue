<template>
  <div class="commerce-dashboard">
    <section class="dashboard-toolbar">
      <div class="dashboard-title-block">
        <span class="dashboard-kicker">WAYNBOOT MALL</span>
        <h1>数据总览</h1>
        <p>{{ todayText }}</p>
      </div>
    </section>

    <section class="metric-grid" :class="{ 'is-loading': loading }">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card">
        <div class="metric-main">
          <span class="metric-label">{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </div>
        <div class="metric-footer">
          <span class="metric-change" :class="metric.trend">{{ metric.change }}</span>
          <span>{{ metric.hint }}</span>
        </div>
        <div class="metric-icon" :class="metric.tone">
          <el-icon><component :is="metric.icon" /></el-icon>
        </div>
      </article>
    </section>

    <section class="chart-grid">
      <article class="dashboard-card sales-card">
        <div class="card-header">
          <div>
            <h2>近7日销售趋势</h2>
            <p>销售额与订单转化走势</p>
          </div>
          <button class="card-icon-button" type="button" aria-label="查看销售趋势">
            <el-icon><DataLine /></el-icon>
          </button>
        </div>
        <div ref="salesChartRef" class="sales-chart" />
        <div class="sales-summary">
          <span>
            <em>{{ formatCurrency(stats.todaySales) }}</em>
            今日销售额
          </span>
          <span>
            <em>{{ formatNumber(stats.todayOrderCount) }}</em>
            今日订单
          </span>
          <span>
            <em>{{ conversionRate }}</em>
            支付转化率
          </span>
        </div>
      </article>

      <article class="dashboard-card source-card">
        <div class="card-header">
          <div>
            <h2>订单来源</h2>
            <p>渠道订单占比</p>
          </div>
          <button class="card-icon-button" type="button" aria-label="查看订单来源">
            <el-icon><PieChart /></el-icon>
          </button>
        </div>
        <div ref="sourceChartRef" class="source-chart" />
        <div class="source-list">
          <div v-for="channel in paymentLegend" :key="channel.name" class="source-item">
            <i :style="{ background: channel.color }" />
            <span>{{ channel.name }}</span>
            <strong>{{ channel.percent }}%</strong>
          </div>
        </div>
      </article>
    </section>

    <section class="info-grid">
      <article class="dashboard-card product-card">
        <div class="card-header">
          <div>
            <h2>热销商品</h2>
            <p>按销量排序</p>
          </div>
          <button class="card-icon-button" type="button" aria-label="进入商品管理" @click="goTo('/shop/goods')">
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
        <div class="product-list">
          <div v-for="(product, index) in topProducts" :key="product.id" class="product-row">
            <span class="rank-badge" :class="{ active: index < 3 }">{{ index + 1 }}</span>
            <span class="product-thumb" :class="product.tone">
              <img v-if="product.picUrl" :src="product.picUrl" alt="">
              <span v-else>{{ product.shortName }}</span>
            </span>
            <span class="product-info">
              <strong>{{ product.name }}</strong>
              <em>销量 {{ formatNumber(product.sales) }}</em>
            </span>
            <span class="product-price">{{ formatCurrency(product.price) }}</span>
          </div>
        </div>
      </article>

      <article class="dashboard-card status-card">
        <div class="card-header">
          <div>
            <h2>订单状态</h2>
            <p>待办订单处理</p>
          </div>
          <button class="card-icon-button" type="button" aria-label="进入订单管理" @click="goTo('/shop/order')">
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
        <div class="status-list">
          <button v-for="item in orderStatuses" :key="item.label" class="status-row" type="button" @click="goTo('/shop/order')">
            <span class="status-icon" :class="item.tone">
              <el-icon><component :is="item.icon" /></el-icon>
            </span>
            <span>{{ item.label }}</span>
            <strong>{{ formatNumber(item.count) }}</strong>
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
      </article>

      <article class="dashboard-card stock-card">
        <div class="card-header">
          <div>
            <h2>库存预警</h2>
            <p>低库存商品跟进</p>
          </div>
          <button class="card-icon-button" type="button" aria-label="进入库存管理" @click="goTo('/shop/goods')">
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
        <div class="stock-list">
          <div v-for="item in stockWarnings" :key="item.id" class="stock-row">
            <span class="stock-meta">
              <strong>{{ item.name }}</strong>
              <em>{{ item.sku }}</em>
            </span>
            <span class="stock-progress">
              <i :style="{ width: item.percent + '%' }" :class="item.level" />
            </span>
            <span class="stock-count" :class="item.level">{{ item.stock }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="reminder-strip">
      <article v-for="item in reminders" :key="item.title" class="reminder-item">
        <span class="reminder-icon" :class="item.tone">
          <el-icon><component :is="item.icon" /></el-icon>
        </span>
        <span>
          <strong>{{ item.title }}</strong>
          <em>{{ item.desc }}</em>
        </span>
        <button type="button" :aria-label="item.title" @click="goTo(item.path)">
          <el-icon><ArrowRight /></el-icon>
        </button>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  ArrowRight,
  Box,
  Calendar,
  ChatDotRound,
  CircleCheck,
  CircleClose,
  Clock,
  DataLine,
  DocumentChecked,
  Money,
  PieChart,
  ShoppingCart,
  TakeawayBox,
  Tickets,
  TrendCharts,
  UserFilled,
  Van,
  Warning
} from '@element-plus/icons-vue'
import {
  getDashboardLowStockGoods,
  getDashboardMemberTrend,
  getDashboardPaymentChannel,
  getDashboardPeriod,
  getDashboardRecent,
  getDashboardStats,
  getDashboardTopGoods,
  getDashboardTrend
} from '@/api/shop/dashboard'
import {
  emptyDashboardPeriod,
  emptyDashboardStats,
  emptyDashboardTrend,
  extractTodayMemberCount,
  normalizeGoodsList,
  normalizePaymentChannels,
  normalizePeriod,
  normalizeRecent,
  normalizeStats,
  normalizeTrend,
  toNumber
} from './dashboardData.js'

defineOptions({ name: 'Index' })

const router = useRouter()
const salesChartRef = ref(null)
const sourceChartRef = ref(null)
const loading = ref(false)

const now = new Date()
const todayText = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}).format(now)

const stats = ref({ ...emptyDashboardStats })
const period = ref({ ...emptyDashboardPeriod })
const trend = ref({ ...emptyDashboardTrend })
const paymentChannels = ref([])
const goodsList = ref([])
const lowStockGoodsList = ref([])
const recentData = ref({ orders: [], members: [] })

const chartColors = ['#0066cc', '#2997ff', '#1d1d1f', '#7a7a7a', '#cccccc']
let salesChart = null
let sourceChart = null

const conversionRate = computed(() => {
  const value = toNumber(stats.value.conversionRate ?? stats.value.payConversionRate)
  return `${value.toFixed(1)}%`
})

const metrics = computed(() => [
  {
    label: '今日销售额',
    value: formatCurrency(stats.value.todaySales),
    change: growthText(period.value.today?.salesGrowth),
    trend: getTrend(period.value.today?.salesGrowth),
    hint: '较昨日',
    icon: Money,
    tone: 'blue'
  },
  {
    label: '今日订单',
    value: formatNumber(stats.value.todayOrderCount),
    change: growthText(period.value.today?.orderGrowth),
    trend: getTrend(period.value.today?.orderGrowth),
    hint: '较昨日',
    icon: ShoppingCart,
    tone: 'black'
  },
  {
    label: '支付转化率',
    value: conversionRate.value,
    change: `${formatNumber(stats.value.totalOrderCount)} 单`,
    trend: 'flat',
    hint: '累计订单',
    icon: TrendCharts,
    tone: 'blue-soft'
  },
  {
    label: '新增用户',
    value: formatNumber(stats.value.todayMemberCount),
    change: `${formatNumber(stats.value.memberCount)} 人`,
    trend: 'flat',
    hint: '今日新增',
    icon: UserFilled,
    tone: 'gray'
  },
  {
    label: '待发货',
    value: formatNumber(stats.value.pendingShipCount),
    change: `${formatNumber(stats.value.pendingPayCount)} 待付款`,
    trend: getTrend(-stats.value.pendingShipCount),
    hint: '待处理',
    icon: Van,
    tone: 'orange'
  },
  {
    label: '退款申请',
    value: formatNumber(stats.value.refundCount),
    change: `${formatNumber(stats.value.closedOrderCount)} 已关闭`,
    trend: 'warning',
    hint: '需审核',
    icon: Tickets,
    tone: 'red'
  }
])

const paymentLegend = computed(() => {
  const total = paymentChannels.value.reduce((sum, item) => sum + item.value, 0)
  return paymentChannels.value.map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length],
    percent: total ? ((item.value / total) * 100).toFixed(1) : '0.0'
  }))
})

const topProducts = computed(() => goodsList.value.slice(0, 5))

const stockWarnings = computed(() => {
  return [...lowStockGoodsList.value]
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map(item => {
      const percent = Math.min(100, Math.max(8, item.stock * 3))
      return {
        ...item,
        percent,
        level: item.stock <= 10 ? 'danger' : item.stock <= 20 ? 'warn' : 'ok'
      }
    })
})

const orderStatuses = computed(() => [
  { label: '待付款', count: stats.value.pendingPayCount, icon: Clock, tone: 'blue' },
  { label: '待发货', count: stats.value.pendingShipCount, icon: TakeawayBox, tone: 'orange' },
  { label: '待收货', count: stats.value.pendingReceiveCount, icon: Van, tone: 'gray' },
  { label: '已完成', count: stats.value.completedOrderCount, icon: CircleCheck, tone: 'green' },
  { label: '已关闭', count: stats.value.closedOrderCount, icon: CircleClose, tone: 'muted' }
])

const reminders = computed(() => [
  {
    title: '运营活动进行中',
    desc: `今日销售额 ${formatCurrency(stats.value.todaySales)}，保持投放节奏`,
    icon: Calendar,
    tone: 'blue',
    path: '/operation/coupon'
  },
  {
    title: '库存预警',
    desc: `${formatNumber(stats.value.lowStockCount)} 个商品库存偏低，建议及时补货`,
    icon: Warning,
    tone: 'orange',
    path: '/shop/goods'
  },
  {
    title: '订单待发货',
    desc: `${formatNumber(stats.value.pendingShipCount)} 笔订单等待发货处理`,
    icon: Box,
    tone: 'black',
    path: '/shop/order'
  },
  {
    title: '用户评价待回复',
    desc: `${formatNumber(recentData.value.members.length)} 位新会员需要运营跟进`,
    icon: ChatDotRound,
    tone: 'gray',
    path: '/shop/user/member'
  },
  {
    title: '售后审核',
    desc: `${formatNumber(stats.value.refundCount)} 个退款申请等待审核`,
    icon: DocumentChecked,
    tone: 'red',
    path: '/shop/order'
  }
])

onMounted(() => {
  loadDashboard()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  salesChart?.dispose()
  sourceChart?.dispose()
})

async function loadDashboard() {
  loading.value = true
  const results = await Promise.allSettled([
    getDashboardStats(),
    getDashboardPeriod(),
    getDashboardTrend(),
    getDashboardPaymentChannel(),
    getDashboardTopGoods(),
    getDashboardLowStockGoods(),
    getDashboardMemberTrend(),
    getDashboardRecent()
  ])

  applyStats(results[0].value)
  applyPeriod(results[1].value)
  applyTrend(results[2].value)
  applyPaymentChannels(results[3].value)
  applyGoods(results[4].value)
  applyLowStockGoods(results[5].value)
  applyMemberTrend(results[6].value)
  applyRecent(results[7].value)

  loading.value = false
  await nextTick()
  renderCharts()
}

function applyStats(res) {
  if (res?.code === 200 && res.data) {
    stats.value = normalizeStats(res.data)
  }
}

function applyPeriod(res) {
  if (res?.code === 200 && res.data) {
    period.value = normalizePeriod(res.data)
  }
}

function applyTrend(res) {
  if (res?.code === 200 && res.data) {
    trend.value = normalizeTrend(res.data)
  }
}

function applyPaymentChannels(res) {
  if (res?.code === 200) {
    paymentChannels.value = normalizePaymentChannels(res.data)
  }
}

function applyGoods(res) {
  if (res?.code === 200) {
    goodsList.value = normalizeGoodsList(res.data)
  }
}

function applyLowStockGoods(res) {
  if (res?.code === 200) {
    lowStockGoodsList.value = normalizeGoodsList(res.data)
  }
}

function applyMemberTrend(res) {
  if (res?.code === 200 && res.data) {
    stats.value = {
      ...stats.value,
      todayMemberCount: extractTodayMemberCount(res.data, stats.value.todayMemberCount)
    }
  }
}

function applyRecent(res) {
  if (res?.code === 200) {
    recentData.value = normalizeRecent(res.data)
  }
}

function renderCharts() {
  renderSalesChart()
  renderSourceChart()
}

function renderSalesChart() {
  if (!salesChartRef.value) return
  if (!salesChart) {
    salesChart = echarts.init(salesChartRef.value)
  }
  salesChart.setOption({
    color: ['#0066cc'],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: { color: '#1d1d1f', fontSize: 13 },
      formatter: params => {
        const point = params[0]
        return `${point.axisValue}<br>销售额：${formatCurrency(point.value)}`
      }
    },
    grid: { top: 24, right: 22, bottom: 34, left: 58 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trend.value.dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#7a7a7a', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' }},
      axisLabel: { color: '#7a7a7a', fontSize: 12, formatter: shortNumber }
    },
    series: [{
      name: '销售额',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      data: trend.value.sales,
      lineStyle: { width: 3, color: '#0066cc' },
      itemStyle: { color: '#0066cc', borderWidth: 2, borderColor: '#ffffff' },
      areaStyle: { color: 'rgba(0, 102, 204, 0.08)' }
    }]
  }, true)
}

function renderSourceChart() {
  if (!sourceChartRef.value) return
  if (!sourceChart) {
    sourceChart = echarts.init(sourceChartRef.value)
  }
  const total = paymentChannels.value.reduce((sum, item) => sum + item.value, 0)
  sourceChart.setOption({
    color: chartColors,
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br>{c} 单 ({d}%)',
      backgroundColor: '#ffffff',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: { color: '#1d1d1f', fontSize: 13 }
    },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '41%',
        style: { text: formatNumber(total), fill: '#1d1d1f', font: '600 24px system-ui' }
      },
      {
        type: 'text',
        left: 'center',
        top: '55%',
        style: { text: '总订单', fill: '#7a7a7a', font: '12px system-ui' }
      }
    ],
    series: [{
      type: 'pie',
      radius: ['58%', '76%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      label: { show: false },
      emphasis: { scale: false },
      data: paymentChannels.value
    }]
  }, true)
}

function resizeCharts() {
  salesChart?.resize()
  sourceChart?.resize()
}

function goTo(path) {
  router.push(path)
}

function formatNumber(value) {
  return toNumber(value).toLocaleString('zh-CN')
}

function formatCurrency(value) {
  return `¥${toNumber(value).toLocaleString('zh-CN')}`
}

function shortNumber(value) {
  const number = toNumber(value)
  if (number >= 10000) return `${(number / 10000).toFixed(0)}万`
  if (number >= 1000) return `${(number / 1000).toFixed(0)}k`
  return number
}

function growthText(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0.0%'
  const prefix = number > 0 ? '+' : ''
  return `${prefix}${number.toFixed(1)}%`
}

function getTrend(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number === 0) return 'flat'
  return number > 0 ? 'up' : 'down'
}
</script>

<style lang="scss" scoped>
.commerce-dashboard {
  min-height: calc(100vh - 58px);
  padding: 24px;
  color: #1d1d1f;
  background: #f5f5f7;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.dashboard-toolbar,
.metric-grid,
.chart-grid,
.info-grid,
.reminder-strip {
  width: min(100%, 1660px);
  margin: 0 auto;
}

.dashboard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}

.dashboard-title-block {
  min-width: 220px;

  .dashboard-kicker {
    display: block;
    margin-bottom: 6px;
    color: #0066cc;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
  }

  h1 {
    margin: 0;
    font-size: 30px;
    font-weight: 600;
    line-height: 1.18;
    letter-spacing: 0;
  }

  p {
    margin: 7px 0 0;
    color: #7a7a7a;
    font-size: 14px;
    line-height: 1.4;
  }
}

.dashboard-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex: 1;

  :deep(.date-filter) {
    width: 300px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-range-editor.el-input__wrapper) {
    height: 44px;
    border-radius: 9999px;
    background: #ffffff;
    box-shadow: 0 0 0 1px #e0e0e0 inset;
  }
}

.dashboard-search {
  width: 290px;
}

.icon-action,
.card-icon-button,
.reminder-item button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  color: #1d1d1f;
  background: #ffffff;
  transition: transform .16s ease, background .16s ease, color .16s ease;

  &:active {
    transform: scale(.95);
  }
}

.icon-action {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  box-shadow: 0 0 0 1px #e0e0e0 inset;

  &:hover {
    color: #0066cc;
  }

  .el-icon {
    font-size: 18px;
  }
}

.notice-action span {
  position: absolute;
  top: 11px;
  right: 12px;
  width: 7px;
  height: 7px;
  border: 2px solid #ffffff;
  border-radius: 9999px;
  background: #ff3b30;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
  transition: opacity .18s ease;

  &.is-loading {
    opacity: .72;
  }
}

.metric-card,
.dashboard-card,
.reminder-item {
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  background: #ffffff;
}

.metric-card {
  position: relative;
  min-height: 142px;
  padding: 18px;
  overflow: hidden;
}

.metric-main {
  position: relative;
  z-index: 1;
  padding-right: 48px;

  span {
    display: block;
    color: #7a7a7a;
    font-size: 13px;
    line-height: 1.3;
  }

  strong {
    display: block;
    margin-top: 10px;
    color: #1d1d1f;
    font-size: 25px;
    font-weight: 600;
    line-height: 1.16;
    letter-spacing: 0;
    word-break: break-word;
  }
}

.metric-footer {
  position: absolute;
  right: 18px;
  bottom: 17px;
  left: 18px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7a7a7a;
  font-size: 12px;
  line-height: 1.3;
}

.metric-change {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 9999px;
  font-weight: 600;

  &.up {
    color: #0066cc;
    background: rgba(0, 102, 204, .09);
  }

  &.down {
    color: #7a7a7a;
    background: #f5f5f7;
  }

  &.warning {
    color: #b45309;
    background: #fff7ed;
  }
}

.metric-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 9999px;

  .el-icon {
    font-size: 20px;
  }

  &.blue,
  &.blue-soft {
    color: #0066cc;
    background: rgba(0, 102, 204, .1);
  }

  &.black {
    color: #ffffff;
    background: #1d1d1f;
  }

  &.gray {
    color: #1d1d1f;
    background: #f5f5f7;
  }

  &.orange {
    color: #b45309;
    background: #fff7ed;
  }

  &.red {
    color: #b42318;
    background: #fff1f2;
  }
}

.chart-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(340px, .75fr);
  gap: 16px;
  margin-bottom: 16px;
}

.dashboard-card {
  min-width: 0;
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    color: #1d1d1f;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.28;
    letter-spacing: 0;
  }

  p {
    margin: 5px 0 0;
    color: #7a7a7a;
    font-size: 13px;
    line-height: 1.35;
  }
}

.card-icon-button {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 9999px;
  background: #f5f5f7;

  &:hover {
    color: #0066cc;
  }
}

.sales-chart {
  width: 100%;
  height: 278px;
}

.source-chart {
  width: 100%;
  height: 204px;
}

.sales-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 6px;

  span {
    display: flex;
    min-height: 62px;
    flex-direction: column;
    justify-content: center;
    padding: 10px 12px;
    border-radius: 12px;
    color: #7a7a7a;
    background: #f5f5f7;
    font-size: 12px;
  }

  em {
    margin-bottom: 5px;
    color: #1d1d1f;
    font-style: normal;
    font-size: 18px;
    font-weight: 600;
  }
}

.source-list {
  display: grid;
  gap: 8px;
  margin-top: 6px;
}

.source-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  min-height: 30px;
  color: #7a7a7a;
  font-size: 13px;

  i {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
  }

  span {
    overflow: hidden;
    color: #1d1d1f;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-size: 13px;
    font-weight: 600;
    color: #1d1d1f;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: minmax(360px, 1.2fr) minmax(280px, .86fr) minmax(320px, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.product-list,
.status-list,
.stock-list {
  display: grid;
  gap: 8px;
}

.product-row {
  display: grid;
  grid-template-columns: 28px 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-height: 54px;
}

.rank-badge,
.product-thumb,
.status-icon,
.reminder-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  color: #7a7a7a;
  background: #f5f5f7;
  font-size: 12px;
  font-weight: 600;

  &.active {
    color: #ffffff;
    background: #0066cc;
  }
}

.product-thumb {
  width: 42px;
  height: 42px;
  overflow: hidden;
  border-radius: 10px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.blue {
    background: #0066cc;
  }

  &.black {
    background: #1d1d1f;
  }

  &.gray {
    color: #1d1d1f;
    background: #f5f5f7;
  }

  &.orange {
    background: #b45309;
  }

  &.red {
    background: #b42318;
  }
}

.product-info {
  min-width: 0;

  strong,
  em {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #1d1d1f;
    font-size: 14px;
    font-weight: 600;
  }

  em {
    margin-top: 4px;
    color: #7a7a7a;
    font-size: 12px;
    font-style: normal;
  }
}

.product-price {
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.status-row {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto 16px;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  padding: 6px 0;
  border: 0;
  color: #1d1d1f;
  background: transparent;
  cursor: pointer;
  text-align: left;

  > span:not(.status-icon) {
    font-size: 14px;
  }

  strong {
    font-size: 16px;
    font-weight: 600;
  }

  > .el-icon {
    color: #cccccc;
    font-size: 14px;
  }
}

.status-icon {
  width: 36px;
  height: 36px;
  border-radius: 9999px;

  &.blue {
    color: #0066cc;
    background: rgba(0, 102, 204, .1);
  }

  &.orange {
    color: #b45309;
    background: #fff7ed;
  }

  &.gray,
  &.muted {
    color: #1d1d1f;
    background: #f5f5f7;
  }

  &.green {
    color: #0f766e;
    background: #ecfdf5;
  }
}

.stock-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px 34px;
  align-items: center;
  gap: 10px;
  min-height: 50px;
}

.stock-meta {
  min-width: 0;

  strong,
  em {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #1d1d1f;
    font-size: 14px;
    font-weight: 600;
  }

  em {
    margin-top: 4px;
    color: #7a7a7a;
    font-size: 12px;
    font-style: normal;
  }
}

.stock-progress {
  position: relative;
  display: block;
  height: 8px;
  overflow: hidden;
  border-radius: 9999px;
  background: #f5f5f7;

  i {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border-radius: inherit;

    &.danger {
      background: #b42318;
    }

    &.warn {
      background: #b45309;
    }

    &.ok {
      background: #0066cc;
    }
  }
}

.stock-count {
  font-size: 14px;
  font-weight: 600;
  text-align: right;

  &.danger {
    color: #b42318;
  }

  &.warn {
    color: #b45309;
  }

  &.ok {
    color: #0066cc;
  }
}

.reminder-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.reminder-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 30px;
  align-items: center;
  gap: 12px;
  min-height: 82px;
  padding: 15px;

  strong,
  em {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #1d1d1f;
    font-size: 14px;
    font-weight: 600;
  }

  em {
    margin-top: 5px;
    color: #7a7a7a;
    font-size: 12px;
    font-style: normal;
  }

  button {
    width: 30px;
    height: 30px;
    border-radius: 9999px;
    background: #f5f5f7;

    &:hover {
      color: #0066cc;
    }
  }
}

.reminder-icon {
  width: 42px;
  height: 42px;
  border-radius: 9999px;

  &.blue {
    color: #0066cc;
    background: rgba(0, 102, 204, .1);
  }

  &.orange {
    color: #b45309;
    background: #fff7ed;
  }

  &.black {
    color: #ffffff;
    background: #1d1d1f;
  }

  &.gray {
    color: #1d1d1f;
    background: #f5f5f7;
  }

  &.red {
    color: #b42318;
    background: #fff1f2;
  }
}

@media (max-width: 1280px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .reminder-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1180px) {
  .dashboard-toolbar,
  .chart-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-toolbar {
    display: grid;
  }

  .dashboard-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 760px) {
  .commerce-dashboard {
    padding: 16px;
  }

  .metric-grid,
  .reminder-strip {
    grid-template-columns: 1fr;
  }

  .dashboard-actions {
    .dashboard-search,
    :deep(.date-filter) {
      width: 100%;
    }
  }

  .sales-summary,
  .product-row,
  .stock-row {
    grid-template-columns: 1fr;
  }

  .product-row {
    align-items: start;
  }

  .product-price {
    padding-left: 80px;
  }
}
</style>
