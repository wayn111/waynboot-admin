import request from '@/utils/request'

// 查询栏目列表
export function listChannel(query) {
  return request({
    url: '/shop/shopDepot/list',
    method: 'get',
    params: query
  })
}

// 查询栏目详细
export function getChannel(channelId) {
  return request({
    url: '/shop/channel/' + channelId,
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

// 修改栏目
export function updateChannel(data) {
  return request({
    url: '/shop/channel',
    method: 'put',
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
// 获取
export function salesManagement(data) {
  return request({
    url: '/shop/goods/salesManagement',
    data: data,
    method: 'post'
  })
}
// 获取
export function financialStatements(data) {
  return request({
    url: '/shop/statements/financialStatements',
    data: data,
    method: 'post'
  })
}

