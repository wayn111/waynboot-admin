import request from '@/utils/request'

// 查询会员列表
export function listMember(query) {
  return request({
    url: '/shop/member/list',
    method: 'get',
    params: query
  })
}

// 查询会员详细
export function getMember(memberId) {
  return request({
    url: '/shop/member/' + memberId,
    method: 'get'
  })
}
