import request from '@/utils/request'

// 查询商品列表
export function listGoods(query) {
  return request({
    url: '/shop/goods/list',
    method: 'get',
    params: query
  })
}

// 查询商品详细
export function getGoods(goodsId) {
  return request({
    url: '/shop/goods/' + goodsId,
    method: 'get'
  })
}

// 新增商品
export function addGoods(data) {
  return request({
    url: '/shop/goods',
    method: 'post',
    data: data
  })
}

// 修改商品
export function updateGoods(data) {
  return request({
    url: '/shop/goods',
    method: 'put',
    data: data
  })
}

// 删除商品
export function delGoods(goodsId) {
  return request({
    url: '/shop/goods/' + goodsId,
    method: 'delete'
  })
}

// 同步商品到es中
export function syncEs(data) {
  return request({
    url: '/shop/goods/syncEs',
    method: 'post',
    data: data
  })
}
