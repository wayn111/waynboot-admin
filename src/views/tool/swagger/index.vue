<template>
  <div v-loading="loading" :style="'height:'+ height">
    <iframe :src="src" frameborder="no" style="width: 100%;height: 100%" scrolling="auto" />
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
defineOptions({
  name: 'Swagger'
})
const src = ref(`${import.meta.env.VITE_APP_BASE_API}/doc.html`)
const height = ref(document.documentElement.clientHeight - 94.5 + 'px;')
const loading = ref(true)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 230)
  const that = this
  window.onresize = function temp() {
    that.height = document.documentElement.clientHeight - 94.5 + 'px;'
  }
})
defineExpose({
  height,
  loading,
  src
})
</script>
