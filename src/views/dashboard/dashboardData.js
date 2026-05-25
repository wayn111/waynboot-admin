export const emptyDashboardStats = {
  memberCount: 0,
  todayMemberCount: 0,
  totalSales: 0,
  todaySales: 0,
  totalOrderCount: 0,
  todayOrderCount: 0,
  onSaleGoodsCount: 0,
  lowStockCount: 0,
  pendingPayCount: 0,
  pendingShipCount: 0,
  pendingReceiveCount: 0,
  completedOrderCount: 0,
  closedOrderCount: 0,
  refundCount: 0,
  conversionRate: 0
}

export const emptyDashboardPeriod = {
  today: { orderCount: 0, sales: 0, orderGrowth: 0, salesGrowth: 0 },
  week: { orderCount: 0, sales: 0, orderGrowth: 0, salesGrowth: 0 },
  month: { orderCount: 0, sales: 0, orderGrowth: 0, salesGrowth: 0 }
}

export const emptyDashboardTrend = {
  dates: [],
  orderCounts: [],
  sales: []
}

export function normalizeStats(data = {}) {
  return {
    ...emptyDashboardStats,
    ...data,
    memberCount: toNumber(data.memberCount),
    todayMemberCount: toNumber(data.todayMemberCount),
    totalSales: toNumber(data.totalSales),
    todaySales: toNumber(data.todaySales),
    totalOrderCount: toNumber(data.totalOrderCount),
    todayOrderCount: toNumber(data.todayOrderCount),
    onSaleGoodsCount: toNumber(data.onSaleGoodsCount),
    lowStockCount: toNumber(data.lowStockCount),
    pendingPayCount: toNumber(data.pendingPayCount),
    pendingShipCount: toNumber(data.pendingShipCount),
    pendingReceiveCount: toNumber(data.pendingReceiveCount),
    completedOrderCount: toNumber(data.completedOrderCount),
    closedOrderCount: toNumber(data.closedOrderCount),
    refundCount: toNumber(data.refundCount),
    conversionRate: toNumber(data.conversionRate ?? data.payConversionRate)
  }
}

export function normalizePeriod(data = {}) {
  return {
    today: normalizePeriodItem(data.today),
    week: normalizePeriodItem(data.week),
    month: normalizePeriodItem(data.month)
  }
}

export function normalizeTrend(data = {}) {
  return {
    dates: Array.isArray(data.dates) ? data.dates : [],
    orderCounts: Array.isArray(data.orderCounts) ? data.orderCounts.map(item => toNumber(item)) : [],
    sales: Array.isArray(data.sales) ? data.sales.map(item => toNumber(item)) : []
  }
}

export function normalizePaymentChannels(list = []) {
  if (!Array.isArray(list)) {
    return []
  }
  return list.map((item, index) => ({
    name: item.channelName || item.name || `渠道 ${index + 1}`,
    value: toNumber(item.orderCount ?? item.value),
    sales: toNumber(item.sales)
  }))
}

export function normalizeGoodsList(list = []) {
  if (!Array.isArray(list)) {
    return []
  }
  const tones = ['blue', 'black', 'gray', 'orange', 'red']
  return list.map((item, index) => {
    const id = item.goodsId ?? item.id ?? `goods-${index}`
    const name = item.name || item.goodsName || `商品 ${index + 1}`
    return {
      id,
      goodsId: item.goodsId ?? item.id ?? id,
      name,
      shortName: name.slice(0, 1),
      sales: toNumber(item.actualSales ?? item.sales ?? item.saleCount),
      actualSales: toNumber(item.actualSales ?? item.sales ?? item.saleCount),
      price: toNumber(item.retailPrice ?? item.price ?? item.salesPrice),
      retailPrice: toNumber(item.retailPrice ?? item.price ?? item.salesPrice),
      stock: toNumber(item.stock ?? item.goodsStock ?? item.inventory ?? item.stockNum),
      sku: item.sku || item.skuCode || item.goodsSn || `SKU-${id}`,
      picUrl: item.picUrl || item.pic || item.imageUrl || '',
      tone: tones[index % tones.length]
    }
  })
}

export function normalizeRecent(data = {}) {
  if (Array.isArray(data)) {
    return {
      orders: data,
      members: []
    }
  }
  return {
    orders: Array.isArray(data.orders) ? data.orders : [],
    members: Array.isArray(data.members) ? data.members : []
  }
}

export function extractTodayMemberCount(memberTrend = {}, fallback = 0) {
  if (!Array.isArray(memberTrend.counts) || memberTrend.counts.length === 0) {
    return toNumber(fallback)
  }
  return toNumber(memberTrend.counts[memberTrend.counts.length - 1], fallback)
}

export function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizePeriodItem(item = {}) {
  return {
    orderCount: toNumber(item.orderCount),
    sales: toNumber(item.sales),
    orderGrowth: toNumber(item.orderGrowth),
    salesGrowth: toNumber(item.salesGrowth)
  }
}
