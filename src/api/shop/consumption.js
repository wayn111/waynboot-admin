import request from '@/utils/request'

// 查询列表
export function listDepot(query) {
  return request({
    url: '/shop/goodsLoss/list',
    method: 'get',
    params: query
  })
}
// 新增
export function addOrUpdateShopDepot(data) {
  return request({
    url: '/shop/goodsLoss/addOrUpdateShopGoodsLoss',
    method: 'post',
    data: data
  })
}
// 删除
export function delByIdShopDepot(params) {
  return request({
    url: '/shop/goodsLoss/delById',
    params,
    method: 'get'
  })
}
// 删除
export function getProductByOrderSn(orderSn) {
  return request({
    url: '/shop/goodsLoss/getProductByOrderSn?orderSn=' + orderSn,
    method: 'get'
  })
}
