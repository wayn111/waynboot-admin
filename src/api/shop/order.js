import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/shop/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单详细
export function getOrder(orderId) {
  return request({
    url: '/shop/order/' + orderId,
    method: 'get'
  })
}

// 删除订单
export function delOrder(orderId) {
  return request({
    url: '/shop/order/' + orderId,
    method: 'delete'
  })
}

// 订单退款
export function refundOrder(data) {
  return request({
    url: '/shop/order/refund',
    method: 'post',
    data
  })
}

// 发货渠道
export function listChannel() {
  return request({
    url: '/shop/order/listChannel',
    method: 'post'
  })
}

// 点击发货
export function clickShip(data) {
  return request({
    url: '/shop/order/ship',
    method: 'post',
    data
  })
}

export function exportOrder(query, progress) {
  return request({
    url: '/shop/order/export',
    method: 'get',
    params: query,
    responseType: 'blob',
    // `onDownloadProgress` 允许为下载处理进度事件
    // 浏览器专属
    onDownloadProgress: progress
  })
}
