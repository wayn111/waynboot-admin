import request from '@/utils/request'

export function listLog(data) {
  return request({
    url: '/system/log/list',
    method: 'get',
    params: data
  })
}
