import request from '@/utils/request'

// 查询banner列表
export function listBanner(query) {
  return request({
    url: '/shop/banner/list',
    method: 'get',
    params: query
  })
}

// 查询banner详细
export function getBanner(bannerId) {
  return request({
    url: '/shop/banner/' + bannerId,
    method: 'get'
  })
}

// 新增banner
export function addBanner(data) {
  return request({
    url: '/shop/banner',
    method: 'post',
    data: data
  })
}

// 修改banner
export function updateBanner(data) {
  return request({
    url: '/shop/banner',
    method: 'put',
    data: data
  })
}

// 删除banner
export function delBanner(bannerId) {
  return request({
    url: '/shop/banner/' + bannerId,
    method: 'delete'
  })
}
