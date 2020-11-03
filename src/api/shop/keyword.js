import request from '@/utils/request'

// 查询关键字列表
export function listKeyword(query) {
  return request({
    url: '/shop/keyword/list',
    method: 'get',
    params: query
  })
}

// 查询关键字详细
export function getKeyword(keywordId) {
  return request({
    url: '/shop/keyword/' + keywordId,
    method: 'get'
  })
}

// 新增关键字
export function addKeyword(data) {
  return request({
    url: '/shop/keyword',
    method: 'post',
    data: data
  })
}

// 修改关键字
export function updateKeyword(data) {
  return request({
    url: '/shop/keyword',
    method: 'put',
    data: data
  })
}

// 删除关键字
export function delKeyword(keywordId) {
  return request({
    url: '/shop/keyword/' + keywordId,
    method: 'delete'
  })
}
