import request from '@/utils/request'
export function getKefupop() {
  return request({
    url: '/shop/kefupop',
    method: 'get'
  })
}

export function updateKefupop(data) {
  return request({
    url: '/shop/kefupop',
    method: 'put',
    data: data
  })
}
