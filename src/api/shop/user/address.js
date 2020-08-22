import request from '@/utils/request'

// 查询地址列表
export function listAddress(query) {
  return request({
    url: '/shop/address/list',
    method: 'get',
    params: query
  })
}
