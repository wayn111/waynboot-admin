/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
const baseURL = process.env.VUE_APP_BASE_API

export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

// 添加日期范围
export function addDateRange(params, dateRange) {
  const search = params
  search.startTime = ''
  search.endTime = ''
  if (dateRange != null && dateRange !== '') {
    search.startTime = this.dateRange[0]
    search.endTime = this.dateRange[1]
  }
  return search
}

// 通用下载方法
export function download(fileName) {
  window.location.href = baseURL + '/common/download?fileName=' + encodeURI(fileName) + '&delete=' + true
}

// 通用下载模板方法
export function downloadTemplate(fileName) {
  window.location.href = baseURL + '/common/downloadTemplate?fileName=' + encodeURI(fileName)
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function buildTree(data, id, parentId, rootId) {
  id = id || 'id'
  parentId = parentId || 'parentId'
  rootId = rootId || 0
  const treeData = data.filter(item => {
    const children = data.filter(item1 => {
      return item[id] === item1[parentId]
    })
    if (children.length > 0) {
      item.children = children
    }
    return item[parentId] === rootId
  })
  return treeData.length > 0 ? treeData : data
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

// 回显数据字典
export function echoDictName(datas, value) {
  let name = ''
  datas.forEach(item => {
    if (parseInt(item.value) === value) {
      name = item.name
    }
  })
  return name
}

// 表单保存后处理
export function saveHandle(response, vm) {
  if (response.code === 200) {
    vm.$message.success('新增成功')
    vm.open = false
    vm.getList()
    vm.reset()
  } else {
    vm.$message.error(response.msg)
  }
}
import { isNumber } from 'lodash'

// 表单更新后处理
export function updateHandle(response, vm) {
  if (response.code === 200) {
    vm.$message.success('修改成功')
    vm.open = false
    vm.getList()
    vm.reset()
  } else {
    vm.$message.error(response.msg)
  }
}

/**
 * element ui表单校验失败，元素获取焦点
 */
export function showErrorfocus() {
  setTimeout(() => {
    var isError = document.getElementsByClassName('is-error')
    isError[0].querySelector('input').focus()
  }, 100)
}

export const yuan = value => {
  return isNumber(value) ? `${(value).toFixed(2)}` : value
}

/**
 * 使用tooltip优化长文本显示，配合<br>
 * $("[data-toggle='tooltip']").tooltip();<br>
 * 使用
 * @param value
 * @param row
 * @param index
 * @returns {string}
 */
export function toolTip(value, row, index) {
  var nameString
  if (value.length > 30) {
    nameString = value.substring(0, 30) + '...'
  } else {
    nameString = value
  }
  return nameString
  // return '<a href="#" data-toggle="tooltip" data-placement="top" title=' + value + '>' + nameString + '</a>'
}
