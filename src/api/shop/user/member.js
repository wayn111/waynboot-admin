import request from '@/utils/request'

// 查询会员列表
export function listMember(query) {
  return request({
    url: '/shop/member/list',
    method: 'get',
    params: query
  })
}

// 更新会员信息
export function updateMember(data) {
  return request({
    url: '/shop/member',
    method: 'put',
    data: data
  })
}

// 查询会员详细
export function getMember(memberId) {
  return request({
    url: '/shop/member/' + memberId,
    method: 'get'
  })
}
