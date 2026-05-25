import request from '@/utils/request'
import { baseApi } from '@/utils/env'

const uploadPath = baseApi + '/common/upload'
export { uploadPath }

export function fileUpload(data) {
  return request({
    url: '/common/upload',
    method: 'post',
    data
  })
}
