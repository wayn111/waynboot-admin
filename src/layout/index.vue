<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebarState.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
      </div>
      <app-main />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { Navbar, Sidebar, AppMain } from './components'
import ResizeMixin from './mixin/ResizeHandler'
const store = useStore()
defineOptions({
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  mixins: [ResizeMixin]
})
const sidebarState = computed(() => {
  return store.state.app.sidebar
})
const device = computed(() => {
  return store.state.app.device
})
const fixedHeader = computed(() => {
  return store.state.settings.fixedHeader
})
const classObj = computed(() => {
  return {
    hideSidebar: !sidebarState.value.opened,
    openSidebar: sidebarState.value.opened,
    withoutAnimation: sidebarState.value.withoutAnimation,
    mobile: device.value === 'mobile'
  }
})
function handleClickOutside() {
  store.dispatch('app/closeSideBar', {
    withoutAnimation: false
  })
}
defineExpose({
  classObj,
  device,
  fixedHeader,
  handleClickOutside,
  sidebarState
})
</script>

<style lang="scss" scoped>
  @use "@/styles/mixin.scss" as *;
  @use "@/styles/variables.scss" as *;

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    &.mobile.openSidebar{
      position: fixed;
      top: 0;
    }
  }
  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 64px)
  }

  .mobile .fixed-header {
    width: 100%;
  }
</style>
