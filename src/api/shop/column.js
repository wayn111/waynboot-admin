import request from '@/utils/request'

// 查询栏目分页列表
export function listColumn(query) {
  return request({
    url: '/shop/column/list',
    method: 'get',
    params: query
  })
}

// 查询栏目列表
export function listAllColumn(query) {
  return request({
    url: '/shop/column/listAll',
    method: 'get',
    params: query
  })
}

// 查询栏目详细
export function getColumn(columnId) {
  return request({
    url: '/shop/column/' + columnId,
    method: 'get'
  })
}

// 新增栏目
export function addColumn(data) {
  return request({
    url: '/shop/column',
    method: 'post',
    data: data
  })
}

// 修改栏目
export function updateColumn(data) {
  return request({
    url: '/shop/column',
    method: 'put',
    data: data
  })
}

// 删除column
export function delColumn(columnId) {
  return request({
    url: '/shop/column/' + columnId,
    method: 'delete'
  })
}

// 新增栏目商品
export function addColumnGooods(data) {
  return request({
    url: '/shop/column/goods',
    method: 'post',
    data: data
  })
}

// 删除蓝米商品
export function removeColumnGooods(data) {
  return request({
    url: '/shop/column/goods',
    method: 'delete',
    data: data
  })
}

// 查询已添加商品列表
export function bindGoodsList(query) {
  return request({
    url: '/shop/column/bindGoodsList',
    method: 'get',
    params: query
  })
}

// 查询未添加商品列表
export function unBindGoodsList(query) {
  return request({
    url: '/shop/column/unBindGoodsList',
    method: 'get',
    params: query
  })
}
