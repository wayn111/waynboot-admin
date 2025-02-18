import request from '@/utils/request'

// 查询列表
export function listCoupon(query) {
  return request({
    url: '/shop/coupon/list',
    method: 'get',
    params: query
  })
}

// 查询
export function getCoupon(id) {
  return request({
    url: '/shop/coupon/' + id,
    method: 'get'
  })
}

// 新增
export function addCoupon(data) {
  return request({
    url: '/shop/coupon',
    method: 'post',
    data: data
  })
}

// 修改
export function updateCoupon(data) {
  return request({
    url: '/shop/coupon',
    method: 'put',
    data: data
  })
}

// 删除
export function delCoupon(id) {
  return request({
    url: '/shop/coupon/' + id,
    method: 'delete'
  })
}

// 赠送
export function giveCoupon(data) {
    return request({
      url: '/shop/coupon/giveUser',
      method: 'post',
      data: data
    })
  }