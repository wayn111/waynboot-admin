<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script setup>
import { getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import 'echarts/theme/macarons' // echarts theme
import resize from './mixins/resize'
const instance = getCurrentInstance()
defineOptions({
  mixins: [resize]
})
const props = defineProps({
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
    default: '350px'
  },
  autoResize: {
    type: Boolean,
    default: true
  },
  chartData: {
    type: Object,
    required: true
  }
})
const chart = ref(null)
function initChart() {
  chart.value = echarts.init(instance.proxy.$el, 'macarons')
  setOptions(props.chartData)
}
function setOptions({
  expectedData,
  actualData
} = {}) {
  chart.value.setOption({
    xAxis: {
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      boundaryGap: false,
      axisTick: {
        show: false
      }
    },
    grid: {
      left: 10,
      right: 10,
      bottom: 20,
      top: 30,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      padding: [5, 10]
    },
    yAxis: {
      axisTick: {
        show: false
      }
    },
    legend: {
      data: ['expected', 'actual']
    },
    series: [{
      name: 'expected',
      itemStyle: {
        normal: {
          color: '#FF005A',
          lineStyle: {
            color: '#FF005A',
            width: 2
          }
        }
      },
      smooth: true,
      type: 'line',
      data: expectedData,
      animationDuration: 2800,
      animationEasing: 'cubicInOut'
    }, {
      name: 'actual',
      smooth: true,
      type: 'line',
      itemStyle: {
        normal: {
          color: '#3888fa',
          lineStyle: {
            color: '#3888fa',
            width: 2
          },
          areaStyle: {
            color: '#f3f8ff'
          }
        }
      },
      data: actualData,
      animationDuration: 2800,
      animationEasing: 'quadraticOut'
    }]
  })
}
watch(() => props.chartData, val => {
  setOptions(val)
}, {
  deep: true
})
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
  initChart,
  setOptions
})
</script>
