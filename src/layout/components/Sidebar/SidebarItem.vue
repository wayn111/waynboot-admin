<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
      <template #title>
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'
function resolveRoutePath(basePath, routePath) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(basePath)) {
    return basePath
  }
  if (routePath && routePath.startsWith('/')) {
    return normalizeRoutePath(routePath)
  }
  if (!basePath) {
    return normalizeRoutePath(routePath)
  }
  if (!routePath) {
    return normalizeRoutePath(basePath)
  }
  return normalizeRoutePath(`${basePath}/${routePath}`)
}
function normalizeRoutePath(routePath = '') {
  const normalizedPath = routePath.replace(/\/+/g, '/')
  return normalizedPath === '/' ? normalizedPath : normalizedPath.replace(/\/$/, '')
}
const onlyOneChild = ref({})
defineOptions({
  name: 'SidebarItem',
  components: {
    Item,
    AppLink
  },
  mixins: [FixiOSBug]
})
const props = defineProps({
  // route object
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  }
})
function hasOneShowingChild(children = [], parent) {
  const showingChildren = children.filter(item => {
    if (item.hidden) {
      return false
    } else {
      // Temp set(will be used if only has one showing child)
      onlyOneChild.value = item
      return true
    }
  })

  // When there is only one child router, the child router is displayed by default
  if (showingChildren.length === 1) {
    return true
  }

  // Show parent if there are no child router to display
  if (showingChildren.length === 0) {
    onlyOneChild.value = {
      ...parent,
      path: '',
      noShowingChildren: true
    }
    return true
  }
  return false
}
function resolvePath(routePath) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  return resolveRoutePath(props.basePath, routePath)
}
defineExpose({
  hasOneShowingChild,
  onlyOneChild,
  resolvePath
})
</script>
