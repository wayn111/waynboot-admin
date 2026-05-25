<template>
  <section class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" :key="key" />
      </transition>
    </router-view>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
defineOptions({
  name: 'AppMain'
})
const key = computed(() => {
  return route.path
})
defineExpose({
  key
})
</script>

<style scoped>
.app-main {
  /*58 = navbar  */
  min-height: calc(100vh - 58px);
  width: 100%;
  position: relative;
  overflow: auto;
  background: var(--admin-bg);
  padding: 1px 0 24px;
}
.fixed-header+.app-main {
  padding-top: 58px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
