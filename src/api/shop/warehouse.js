import request from '@/utils/request'

// 查询栏目列表
export function listDepot(query) {
  return request({
    url: '/shop/shopDepot/list',
    method: 'get',
    params: query
  })
}

export function queryDepotList(product) {
  return request({
    url: `/shop/shopDepot/queryDepotList/${product}`,
    method: 'get'
  })
}

// 新增栏目
export function addOrUpdateShopDepot(data) {
  return request({
    url: '/shop/shopDepot/addOrUpdateShopDepot',
    method: 'post',
    data: data
  })
}

// 删除仓库
export function delByIdShopDepot(params) {
  return request({
    url: '/shop/shopDepot/delByIdShopDepot',
    params,
    method: 'get'
  })
}
// 获取预警信息
export function getWarmingShop(data) {
  return request({
    url: '/shop/goodsProduct/getWarmingShop',
    data: data,
    method: 'post'
  })
}

