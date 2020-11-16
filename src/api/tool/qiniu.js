import request from '@/utils/request'
const uploadPath = process.env.VUE_APP_BASE_API + '/tool/qiniu/upload'
export { uploadPath }

export function list(query) {
  return request({
    url: 'tool/qiniu/list',
    method: 'get',
    params: query
  })
}

export function get() {
  return request({
    url: 'tool/qiniu',
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: 'tool/qiniu',
    data,
    method: 'put'
  })
}

export function del(data) {
  return request({
    url: 'tool/qiniu',
    data,
    method: 'delete'
  })
}

export function download(contentId) {
  return request({
    url: 'tool/qiniu/download/' + contentId,
    method: 'get'
  })
}
