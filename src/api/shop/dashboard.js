import request from '@/utils/request'

export function getDashboardStats() {
  return request({ url: '/shop/dashboard/stats', method: 'get', silentError: true })
}
export function getDashboardTrend() {
  return request({ url: '/shop/dashboard/trend', method: 'get', silentError: true })
}
export function getDashboardPeriod() {
  return request({ url: '/shop/dashboard/period', method: 'get', silentError: true })
}
export function getDashboardPaymentChannel() {
  return request({ url: '/shop/dashboard/payment-channel', method: 'get', silentError: true })
}
export function getDashboardTopGoods() {
  return request({ url: '/shop/dashboard/top-goods', method: 'get', silentError: true })
}
export function getDashboardLowStockGoods() {
  return request({ url: '/shop/dashboard/low-stock-goods', method: 'get', silentError: true })
}
export function getDashboardMemberTrend() {
  return request({ url: '/shop/dashboard/member-trend', method: 'get', silentError: true })
}
export function getDashboardRecent() {
  return request({ url: '/shop/dashboard/recent', method: 'get', silentError: true })
}
