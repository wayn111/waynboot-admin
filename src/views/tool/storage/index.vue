<template>
  <el-tabs v-model="activeName" style="padding-left: 8px;" @tab-click="tabClick">
    <el-tab-pane label="本地存储" name="first">
      <Local ref="local" />
    </el-tab-pane>
    <el-tab-pane label="七牛云存储" name="second">
      <QiNiu ref="qiNiu" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import QiNiu from './qiniu/index'
import Local from './local/index'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  name: 'Storage',
  components: {
    QiNiu,
    Local
  }
})
const templateRefs = useTemplateRefs(instance)
const activeName = ref('first')
function tabClick(name) {
  if (activeName.value === 'first') {
    // this.$refs.local.list
  } else {
    templateRefs.qiNiu.getList()
  }
}
defineExpose({
  activeName,
  tabClick
})
</script>

<style scoped>
</style>
