import request from '@/utils/request'

// 查询分类列表
export function listOrder(query) {
  return request({
    url: '/shop/order/list',
    method: 'get',
    params: query
  })
}

// 查询分类详细
export function getOrder(orderId) {
  return request({
    url: '/shop/order/' + orderId,
    method: 'get'
  })
}

// 删除分类
export function delOrder(orderId) {
  return request({
    url: '/shop/order/' + orderId,
    method: 'delete'
  })
}
