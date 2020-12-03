import request from '@/utils/request'

// 查询栏目列表
export function listColumn(query) {
  return request({
    url: '/shop/column/list',
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
