import request from '@/utils/request'

// 查询评论列表
export function listComment(query) {
  return request({
    url: '/shop/comment/list',
    method: 'get',
    params: query
  })
}

// 更新评论信息
export function updateComment(data) {
  return request({
    url: '/shop/comment',
    method: 'put',
    data: data
  })
}

// 查询评论详细
export function getComment(memberId) {
  return request({
    url: '/shop/comment/' + memberId,
    method: 'get'
  })
}
