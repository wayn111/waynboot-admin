import axios from './../utils/axios' // 组件内部封装的axios
// import request from "@/api/axios.js"       //调用项目封装的axios
const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// request interceptor
request.interceptors.request.use(
  config => {
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(res => {
  return res.data
}, error => {
  console.log(error) // for debug
  return Promise.reject(error)
}
)

// 获取验证图片  以及token
export function reqGet(data) {
  return request({
    url: '/captcha/get',
    method: 'post',
    data
  })
}

// 滑动或者点选验证
export function reqCheck(data) {
  return request({
    url: '/captcha/check',
    method: 'post',
    data
  })
}

