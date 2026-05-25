<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import sidebarVariables from '@/styles/variables.module.scss'
const store = useStore()
const route = useRoute()
defineOptions({
  components: {
    SidebarItem,
    Logo
  }
})
const routes = computed(() => {
  return store.getters.permission_routes
})
const activeMenu = computed(() => {
  const currentRoute = route
  const {
    meta,
    path
  } = currentRoute
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  // 针对字典类型子数据，高亮左侧字典管理菜单
  if (path.indexOf('/dict/type/data') >= 0) {
    return '/system/dict/type'
  }
  return path
})
const showLogo = computed(() => {
  return store.state.settings.sidebarLogo
})
const variables = computed(() => sidebarVariables)
const isCollapse = computed(() => {
  return !store.state.app.sidebar.opened
})
defineExpose({
  activeMenu,
  isCollapse,
  routes,
  showLogo,
  variables
})
</script>
