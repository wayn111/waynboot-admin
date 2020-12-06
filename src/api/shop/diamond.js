import request from '@/utils/request'

// 查询金刚位列表
export function listDiamond(query) {
  return request({
    url: '/shop/diamond/list',
    method: 'get',
    params: query
  })
}

// 查询金刚位详细
export function getDiamond(diamondId) {
  return request({
    url: '/shop/diamond/' + diamondId,
    method: 'get'
  })
}

// 新增金刚位
export function addDiamond(data) {
  return request({
    url: '/shop/diamond',
    method: 'post',
    data: data
  })
}

// 修改金刚位
export function updateDiamond(data) {
  return request({
    url: '/shop/diamond',
    method: 'put',
    data: data
  })
}

// 删除金刚位
export function delDiamond(diamondId) {
  return request({
    url: '/shop/diamond/' + diamondId,
    method: 'delete'
  })
}
