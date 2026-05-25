<template>
  <template v-if="icon">
    <i v-if="icon.includes('el-icon')" :class="[icon, 'sub-el-icon']" />
    <svg-icon v-else :icon-class="icon" />
  </template>
  <span v-if="title">{{ title }}</span>
</template>

<script setup>
defineOptions({
  name: 'MenuItem'
})
defineProps({
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}
</style>
