import request from '@/utils/request'

const uploadPath = process.env.VUE_APP_BASE_API + '/common/upload'
export { uploadPath }

export function fileUpload(data) {
  return request({
    url: '/common/upload',
    method: 'post',
    data
  })
}
