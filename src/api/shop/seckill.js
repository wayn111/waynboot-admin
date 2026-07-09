import request from '@/utils/request'

// 查询秒杀活动列表
export function listSeckill(query) {
  return request({
    url: '/shop/seckill/list',
    method: 'get',
    params: query
  })
}

// 查询秒杀活动详情
export function getSeckill(activityId) {
  return request({
    url: '/shop/seckill/' + activityId,
    method: 'get'
  })
}

// 新增秒杀活动
export function addSeckill(data) {
  return request({
    url: '/shop/seckill',
    method: 'post',
    data
  })
}

// 修改秒杀活动
export function updateSeckill(data) {
  return request({
    url: '/shop/seckill',
    method: 'put',
    data
  })
}

// 删除秒杀活动
export function delSeckill(activityId) {
  return request({
    url: '/shop/seckill/' + activityId,
    method: 'delete'
  })
}

// 发布秒杀活动
export function publishSeckill(activityId) {
  return request({
    url: `/shop/seckill/${activityId}/publish`,
    method: 'post'
  })
}

// 下架秒杀活动
export function offlineSeckill(activityId) {
  return request({
    url: `/shop/seckill/${activityId}/offline`,
    method: 'post'
  })
}

// 预热秒杀库存
export function preheatSeckill(activityId) {
  return request({
    url: `/shop/seckill/${activityId}/preheat`,
    method: 'post'
  })
}
