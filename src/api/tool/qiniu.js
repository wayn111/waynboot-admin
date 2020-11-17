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
    url: 'tool/qiniu/config',
    method: 'get'
  })
}

export function syncQiniu() {
  return request({
    url: 'tool/qiniu/syncQiniu',
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: 'tool/qiniu/config',
    data,
    method: 'put'
  })
}

export function del(contentId) {
  return request({
    url: 'tool/qiniu/' + contentId,
    method: 'delete'
  })
}

export function download(contentId) {
  return request({
    url: 'tool/qiniu/download/' + contentId,
    method: 'get'
  })
}
