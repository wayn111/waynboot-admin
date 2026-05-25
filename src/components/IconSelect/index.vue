<!-- @author zhengjie -->
<template>
  <div class="icon-body">
    <el-input v-model="name" style="position: relative;" clearable placeholder="请输入图标名称" @clear="filterIcons" @input="filterIcons">
      <template #suffix><el-icon class="el-input__icon"><Search /></el-icon></template>
    </el-input>
    <div class="icon-list">
      <div v-for="(item, index) in iconList" :key="index" @click="selectedIcon(item)">
        <svg-icon :icon-class="item" style="height: 30px;width: 16px;" />
        <span>{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import icons from './requireIcons'
defineOptions({
  name: 'IconSelect'
})
const emit = defineEmits(['selected'])
const name = ref('')
const iconList = ref(icons)
function filterIcons() {
  if (name.value) {
    iconList.value = iconList.value.filter(item => item.includes(name.value))
  } else {
    iconList.value = icons
  }
}
function selectedIcon(name) {
  emit('selected', name)
  document.body.click()
}
function reset() {
  name.value = ''
  iconList.value = icons
}
defineExpose({
  filterIcons,
  iconList,
  name,
  reset,
  selectedIcon
})
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .icon-body {
    width: 100%;
    padding: 10px;
    .icon-list {
      height: 200px;
      overflow-y: scroll;
      div {
        height: 30px;
        line-height: 30px;
        margin-bottom: -5px;
        cursor: pointer;
        width: 33%;
        float: left;
      }
      span {
        display: inline-block;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
      }
    }
  }
</style>
