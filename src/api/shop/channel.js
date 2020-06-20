import request from '@/utils/request'

// 查询栏目列表
export function listChannel(query) {
  return request({
    url: '/shop/channel/list',
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
export function addChannel(data) {
  return request({
    url: '/shop/channel',
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

// 删除栏目
export function delChannel(channelId) {
  return request({
    url: '/shop/channel/' + channelId,
    method: 'delete'
  })
}
