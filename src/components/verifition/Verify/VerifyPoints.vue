<template>
  <div
    style="position: relative"
  >
    <div class="verify-img-out">
      <div
        class="verify-img-panel"
        :style="{'width': setSize.imgWidth,
                 'height': setSize.imgHeight,
                 'background-size' : setSize.imgWidth + ' '+ setSize.imgHeight,
                 'margin-bottom': vSpace + 'px'}"
      >
        <div v-show="showRefresh" class="verify-refresh" style="z-index:3" @click="refresh">
          <i class="iconfont icon-refresh" />
        </div>
        <img
          ref="canvas"
          :src="pointBackImgBase?('data:image/png;base64,'+pointBackImgBase):defaultImg"
          alt=""
          style="width:100%;height:100%;display:block"
          @click="bindingClick?canvasClick($event):undefined"
        >

        <div
          v-for="(tempPoint, index) in tempPoints"
          :key="index"
          class="point-area"
          :style="{
            'background-color':'#1abd6c',
            color:'#fff',
            'z-index':9999,
            width:'20px',
            height:'20px',
            'text-align':'center',
            'line-height':'20px',
            'border-radius': '50%',
            position:'absolute',
            top:parseInt(tempPoint.y-10) + 'px',
            left:parseInt(tempPoint.x-10) + 'px'
          }"
        >
          {{ index + 1 }}
        </div>
      </div>
    </div>
    <!-- 'height': this.barSize.height, -->
    <div
      class="verify-bar-area"
      :style="{'width': setSize.imgWidth,
               'color': barAreaColor,
               'border-color': barAreaBorderColor,
               'line-height':barSize.height}"
    >
      <span class="verify-msg">{{ text }}</span>
    </div>
  </div>
</template>
<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
/**
     * VerifyPoints
     * @description 点选
     * */
// eslint-disable-next-line no-unused-vars
import { resetSize as calcResetSize, _code_chars, _code_color1, _code_color2 } from './../utils/util'
import { aesEncrypt } from './../utils/ase'
import { reqGet, reqCheck } from './../api/index'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  name: 'VerifyPoints'
})
const props = defineProps({
  // 弹出式pop，固定fixed
  mode: {
    type: String,
    default: 'fixed'
  },
  captchaType: {
    type: String,
    default: ''
  },
  // 间隔
  vSpace: {
    type: Number,
    default: 5
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
const templateRefs = useTemplateRefs(instance)
const secretKey = ref('')
const checkNum = ref(3)
const fontPos = ref([])
const checkPosArr = ref([])
const num = ref(1)
const pointBackImgBase = ref('')
const poinTextList = ref([])
const backToken = ref('')
const setSize = ref({
  imgHeight: 0,
  imgWidth: 0,
  barHeight: 0,
  barWidth: 0
})
const tempPoints = ref([])
const text = ref('')
const barAreaColor = ref(undefined)
const barAreaBorderColor = ref(undefined)
const showRefresh = ref(true)
const bindingClick = ref(true)
const resetSize = computed(() => calcResetSize)
function init() {
  // 加载页面
  fontPos.value.splice(0, fontPos.value.length)
  checkPosArr.value.splice(0, checkPosArr.value.length)
  num.value = 1
  getPictrue()
  nextTick(() => {
    setSize.value = resetSize.value(this) // 重新设置宽度高度
    instance.proxy.$parent.$emit('ready', this)
  })
}
function canvasClick(e) {
  checkPosArr.value.push(getMousePos(templateRefs.canvas, e))
  if (num.value === checkNum.value) {
    num.value = createPoint(getMousePos(templateRefs.canvas, e))
    // 按比例转换坐标值
    checkPosArr.value = pointTransfrom(checkPosArr.value, setSize.value)
    // 等创建坐标执行完
    setTimeout(() => {
      // var flag = this.comparePos(this.fontPos, this.checkPosArr)
      // 发送后端请求
      var captchaVerification = secretKey.value ? aesEncrypt(backToken.value + '---' + JSON.stringify(checkPosArr.value), secretKey.value) : backToken.value + '---' + JSON.stringify(checkPosArr.value)
      const data = {
        captchaType: props.captchaType,
        'pointJson': secretKey.value ? aesEncrypt(JSON.stringify(checkPosArr.value), secretKey.value) : JSON.stringify(checkPosArr.value),
        'token': backToken.value
      }
      reqCheck(data).then(res => {
        if (res.repCode === '0000') {
          barAreaColor.value = '#4cae4c'
          barAreaBorderColor.value = '#5cb85c'
          text.value = '验证成功'
          bindingClick.value = false
          if (props.mode === 'pop') {
            setTimeout(() => {
              instance.proxy.$parent.clickShow = false
              refresh()
            }, 1500)
          }
          instance.proxy.$parent.$emit('success', {
            captchaVerification
          })
        } else {
          instance.proxy.$parent.$emit('error', this)
          barAreaColor.value = '#d9534f'
          barAreaBorderColor.value = '#d9534f'
          text.value = '验证失败'
          setTimeout(() => {
            refresh()
          }, 700)
        }
      })
    }, 400)
  }
  if (num.value < checkNum.value) {
    num.value = createPoint(getMousePos(templateRefs.canvas, e))
  }
}
function getMousePos(obj, e) {
  var x = e.offsetX
  var y = e.offsetY
  return {
    x,
    y
  }
}
function createPoint(pos) {
  tempPoints.value.push(Object.assign({}, pos))
  return ++num.value
}
function refresh() {
  tempPoints.value.splice(0, tempPoints.value.length)
  barAreaColor.value = '#000'
  barAreaBorderColor.value = '#ddd'
  bindingClick.value = true
  fontPos.value.splice(0, fontPos.value.length)
  checkPosArr.value.splice(0, checkPosArr.value.length)
  num.value = 1
  getPictrue()
  text.value = '验证失败'
  showRefresh.value = true
}
function getPictrue() {
  const data = {
    captchaType: props.captchaType,
    clientUid: localStorage.getItem('point'),
    ts: Date.now() // 现在的时间戳
  }
  reqGet(data).then(res => {
    if (res.repCode === '0000') {
      pointBackImgBase.value = res.repData.originalImageBase64
      backToken.value = res.repData.token
      secretKey.value = res.repData.secretKey
      poinTextList.value = res.repData.wordList
      text.value = '请依次点击【' + poinTextList.value.join(',') + '】'
    } else {
      text.value = res.repMsg
    }

    // 判断接口请求次数是否失效
    if (res.repCode === '6201') {
      pointBackImgBase.value = null
    }
  })
}
function pointTransfrom(pointArr, imgSize) {
  var newPointArr = pointArr.map(p => {
    const x = Math.round(310 * p.x / parseInt(imgSize.imgWidth))
    const y = Math.round(155 * p.y / parseInt(imgSize.imgHeight))
    return {
      x,
      y
    }
  })
  // console.log(newPointArr,"newPointArr")
  return newPointArr
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
})
defineExpose({
  backToken,
  barAreaBorderColor,
  barAreaColor,
  bindingClick,
  canvasClick,
  checkNum,
  checkPosArr,
  createPoint,
  fontPos,
  getMousePos,
  getPictrue,
  init,
  num,
  poinTextList,
  pointBackImgBase,
  pointTransfrom,
  refresh,
  resetSize,
  secretKey,
  setSize,
  showRefresh,
  tempPoints,
  text
})
</script>
