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
export function getComment(commentId) {
  return request({
    url: '/shop/comment/' + commentId,
    method: 'get'
  })
}

// 删除评论
export function delComment(commentId) {
  return request({
    url: '/shop/comment/' + commentId,
    method: 'delete'
  })
}
