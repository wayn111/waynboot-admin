<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script setup>
import { getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import 'echarts/theme/macarons' // echarts theme
import resize from './mixins/resize'
const instance = getCurrentInstance()
defineOptions({
  mixins: [resize]
})
defineProps({
  className: {
    type: String,
    default: 'chart'
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '300px'
  }
})
const chart = ref(null)
function initChart() {
  chart.value = echarts.init(instance.proxy.$el, 'macarons')
  chart.value.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      left: 'center',
      bottom: '10',
      data: ['Industries', 'Technology', 'Forex', 'Gold', 'Forecasts']
    },
    series: [{
      name: 'WEEKLY WRITE ARTICLES',
      type: 'pie',
      roseType: 'radius',
      radius: [15, 95],
      center: ['50%', '38%'],
      data: [{
        value: 320,
        name: 'Industries'
      }, {
        value: 240,
        name: 'Technology'
      }, {
        value: 149,
        name: 'Forex'
      }, {
        value: 100,
        name: 'Gold'
      }, {
        value: 59,
        name: 'Forecasts'
      }],
      animationEasing: 'cubicInOut',
      animationDuration: 2600
    }]
  })
}
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})
onBeforeUnmount(() => {
  if (!chart.value) {
    return
  }
  chart.value.dispose()
  chart.value = null
})
defineExpose({
  chart,
  initChart
})
</script>
