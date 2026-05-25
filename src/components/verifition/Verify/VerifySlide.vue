<template>
  <div style="position: relative;">
    <div
      v-if="type === '2'"
      class="verify-img-out"
      :style="{height: (parseInt(setSize.imgHeight) + vSpace) + 'px'}"
    >
      <div
        class="verify-img-panel"
        :style="{width: setSize.imgWidth,
                 height: setSize.imgHeight,}"
      >
        <img :src="backImgBase?('data:image/png;base64,'+backImgBase):defaultImg" alt="" style="width:100%;height:100%;display:block">
        <div v-show="showRefresh" class="verify-refresh" @click="refresh"><i class="iconfont icon-refresh" />
        </div>
        <transition name="tips">
          <span v-if="tipWords" class="verify-tips" :class="passFlag ?'suc-bg':'err-bg'">{{ tipWords }}</span>
        </transition>
      </div>
    </div>
    <!-- 公共部分 -->
    <div
      class="verify-bar-area"
      :style="{width: setSize.imgWidth,
               height: barSize.height,
               'line-height':barSize.height}"
    >
      <span class="verify-msg" v-text="text" />
      <div
        class="verify-left-bar"
        :style="{width: (leftBarWidth!==undefined)?leftBarWidth: barSize.height, height: barSize.height, 'border-color': leftBarBorderColor, transaction: transitionWidth}"
      >
        <span class="verify-msg" v-text="finishText" />
        <div
          class="verify-move-block"
          :style="{width: barSize.height, height: barSize.height, 'background-color': moveBlockBackgroundColor, left: moveBlockLeft, transition: transitionLeft}"
          @touchstart="start"
          @mousedown="start"
        >
          <i
            :class="['verify-icon iconfont', iconClass]"
            :style="{color: iconColor}"
          />
          <div
            v-if="type === '2'"
            class="verify-sub-block"
            :style="{'width':Math.floor(parseInt(setSize.imgWidth)*47/310)+ 'px',
                     'height': setSize.imgHeight,
                     'top':'-' + (parseInt(setSize.imgHeight) + vSpace) + 'px',
                     'background-size': setSize.imgWidth + ' ' + setSize.imgHeight,
            }"
          >
            <img :src="'data:image/png;base64,'+blockBackImgBase" alt="" style="width:100%;height:100%;display:block">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
/**
     * VerifySlide
     * @description 滑块
     * */
import { aesEncrypt } from './../utils/ase'
import { resetSize as calcResetSize } from './../utils/util'
import { reqGet, reqCheck } from './../api/index'

//  "captchaType":"blockPuzzle",
const instance = getCurrentInstance()
defineOptions({
  name: 'VerifySlide'
})
const props = defineProps({
  captchaType: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: '1'
  },
  // 弹出式pop，固定fixed
  mode: {
    type: String,
    default: 'fixed'
  },
  vSpace: {
    type: Number,
    default: 5
  },
  explain: {
    type: String,
    default: '向右滑动完成验证'
  },
  imgSize: {
    type: Object,
    default() {
      return {
        width: '310px',
        height: '155px'
      }
    }
  },
  blockSize: {
    type: Object,
    default() {
      return {
        width: '50px',
        height: '50px'
      }
    }
  },
  barSize: {
    type: Object,
    default() {
      return {
        width: '310px',
        height: '40px'
      }
    }
  },
  defaultImg: {
    type: String,
    default: ''
  }
})
const secretKey = ref('')
const passFlag = ref('')
const backImgBase = ref('')
const blockBackImgBase = ref('')
const backToken = ref('')
const startMoveTime = ref('')
const endMovetime = ref('')
const tipsBackColor = ref('')
const tipWords = ref('')
const text = ref('')
const finishText = ref('')
const setSize = ref({
  imgHeight: 0,
  imgWidth: 0,
  barHeight: 0,
  barWidth: 0
})
const top = ref(0)
const left = ref(0)
const moveBlockLeft = ref(undefined)
const leftBarWidth = ref(undefined)
const moveBlockBackgroundColor = ref(undefined)
const leftBarBorderColor = ref('#ddd')
const iconColor = ref(undefined)
const iconClass = ref('icon-right')
const status = ref(false)
const isEnd = ref(false)
const showRefresh = ref(true)
const transitionLeft = ref('')
const transitionWidth = ref('')
const barArea = computed(() => {
  return instance.proxy.$el.querySelector('.verify-bar-area')
})
const resetSize = computed(() => calcResetSize)
function init() {
  text.value = props.explain
  getPictrue()
  nextTick(() => {
    const setSize = resetSize.value(this) // 重新设置宽度高度
    for (const key in setSize) {
      setSize.value[key] = setSize[key]
    }
    instance.proxy.$parent.$emit('ready', this)
  })
  var _this = this
  window.removeEventListener('touchmove', function(e) {
    _this.move(e)
  })
  window.removeEventListener('mousemove', function(e) {
    _this.move(e)
  })

  // 鼠标松开
  window.removeEventListener('touchend', function() {
    _this.end()
  })
  window.removeEventListener('mouseup', function() {
    _this.end()
  })
  window.addEventListener('touchmove', function(e) {
    _this.move(e)
  })
  window.addEventListener('mousemove', function(e) {
    _this.move(e)
  })

  // 鼠标松开
  window.addEventListener('touchend', function() {
    _this.end()
  })
  window.addEventListener('mouseup', function() {
    _this.end()
  })
}
function start(e) {
  e = e || window.event
  let x
  if (!e.touches) {
    // 兼容PC端
    x = e.clientX
  } else {
    // 兼容移动端
    x = e.touches[0].pageX
  }
  instance.proxy.startLeft = Math.floor(x - barArea.value.getBoundingClientRect().left)
  startMoveTime.value = +new Date() // 开始滑动的时间
  if (isEnd.value === false) {
    text.value = ''
    moveBlockBackgroundColor.value = '#0066cc'
    leftBarBorderColor.value = '#0066cc'
    iconColor.value = '#fff'
    e.stopPropagation()
    status.value = true
  }
}
function move(e) {
  e = e || window.event
  if (status.value && isEnd.value === false) {
    let x
    if (!e.touches) {
      // 兼容PC端
      x = e.clientX
    } else {
      // 兼容移动端
      x = e.touches[0].pageX
    }
    var bar_area_left = barArea.value.getBoundingClientRect().left
    var move_block_left = x - bar_area_left // 小方块相对于父元素的left值
    if (move_block_left >= barArea.value.offsetWidth - parseInt(parseInt(props.blockSize.width) / 2) - 2) {
      move_block_left = barArea.value.offsetWidth - parseInt(parseInt(props.blockSize.width) / 2) - 2
    }
    if (move_block_left <= 0) {
      move_block_left = parseInt(parseInt(props.blockSize.width) / 2)
    }
    // 拖动后小方块的left值
    moveBlockLeft.value = move_block_left - instance.proxy.startLeft + 'px'
    leftBarWidth.value = move_block_left - instance.proxy.startLeft + 'px'
  }
}
function end() {
  endMovetime.value = +new Date()
  var _this = this
  // 判断是否重合
  if (status.value && isEnd.value === false) {
    var moveLeftDistance = parseInt((moveBlockLeft.value || '').replace('px', ''))
    moveLeftDistance = moveLeftDistance * 310 / parseInt(setSize.value.imgWidth)
    const data = {
      captchaType: props.captchaType,
      'pointJson': secretKey.value ? aesEncrypt(JSON.stringify({
        x: moveLeftDistance,
        y: 5.0
      }), secretKey.value) : JSON.stringify({
        x: moveLeftDistance,
        y: 5.0
      }),
      'token': backToken.value
    }
    reqCheck(data).then(res => {
      if (res.repCode === '0000') {
        moveBlockBackgroundColor.value = '#5cb85c'
        leftBarBorderColor.value = '#5cb85c'
        iconColor.value = '#fff'
        iconClass.value = 'icon-check'
        showRefresh.value = false
        isEnd.value = true
        if (props.mode === 'pop') {
          setTimeout(() => {
            instance.proxy.$parent.clickShow = false
            refresh()
          }, 1500)
        }
        passFlag.value = true
        tipWords.value = `${((endMovetime.value - startMoveTime.value) / 1000).toFixed(2)}s验证成功`
        var captchaVerification = secretKey.value ? aesEncrypt(backToken.value + '---' + JSON.stringify({
          x: moveLeftDistance,
          y: 5.0
        }), secretKey.value) : backToken.value + '---' + JSON.stringify({
          x: moveLeftDistance,
          y: 5.0
        })
        setTimeout(() => {
          tipWords.value = ''
          instance.proxy.$parent.closeBox()
          instance.proxy.$parent.$emit('success', {
            captchaVerification
          })
        }, 1000)
      } else {
        moveBlockBackgroundColor.value = '#d9534f'
        leftBarBorderColor.value = '#d9534f'
        iconColor.value = '#fff'
        iconClass.value = 'icon-close'
        passFlag.value = false
        setTimeout(function() {
          _this.refresh()
        }, 1000)
        instance.proxy.$parent.$emit('error', this)
        tipWords.value = '验证失败'
        setTimeout(() => {
          tipWords.value = ''
        }, 1000)
      }
    })
    status.value = false
  }
}
function refresh() {
  showRefresh.value = true
  finishText.value = ''
  transitionLeft.value = 'left .3s'
  moveBlockLeft.value = 0
  leftBarWidth.value = undefined
  transitionWidth.value = 'width .3s'
  leftBarBorderColor.value = '#ddd'
  moveBlockBackgroundColor.value = '#fff'
  iconColor.value = '#000'
  iconClass.value = 'icon-right'
  isEnd.value = false
  getPictrue()
  setTimeout(() => {
    transitionWidth.value = ''
    transitionLeft.value = ''
    text.value = props.explain
  }, 300)
}
function getPictrue() {
  const data = {
    captchaType: props.captchaType,
    clientUid: localStorage.getItem('slider'),
    ts: Date.now() // 现在的时间戳
  }
  reqGet(data).then(res => {
    if (res.repCode === '0000') {
      backImgBase.value = res.repData.originalImageBase64
      blockBackImgBase.value = res.repData.jigsawImageBase64
      backToken.value = res.repData.token
      secretKey.value = res.repData.secretKey
    } else {
      tipWords.value = res.repMsg
    }

    // 判断接口请求次数是否失效
    if (res.repCode === '6201') {
      backImgBase.value = null
      blockBackImgBase.value = null
    }
  })
}
watch(() => props.type, () => {
  init()
}, {
  immediate: true
})
onMounted(() => {
  // 禁止拖拽
  instance.proxy.$el.onselectstart = function() {
    return false
  }
  console.log(props.defaultImg)
})
defineExpose({
  backImgBase,
  backToken,
  barArea,
  blockBackImgBase,
  end,
  endMovetime,
  finishText,
  getPictrue,
  iconClass,
  iconColor,
  init,
  isEnd,
  left,
  leftBarBorderColor,
  leftBarWidth,
  move,
  moveBlockBackgroundColor,
  moveBlockLeft,
  passFlag,
  refresh,
  resetSize,
  secretKey,
  setSize,
  showRefresh,
  start,
  startMoveTime,
  status,
  text,
  tipWords,
  tipsBackColor,
  top,
  transitionLeft,
  transitionWidth
})
</script>

