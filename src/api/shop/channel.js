import request from '@/utils/request'

// 查询栏目列表
export function listChannel(query) {
  return request({
    url: '/shop/channel/list',
    method: 'get',
    params: query
  })
}
