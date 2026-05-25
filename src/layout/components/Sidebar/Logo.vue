<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <h1 class="sidebar-title">{{ title }} </h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <span class="sidebar-brand-copy">
          <h1 class="sidebar-title">{{ title }} </h1>
          <em>Commerce Admin</em>
        </span>
      </router-link>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineOptions({
  name: 'SidebarLogo'
})
defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
})
const title = ref('waynboot-mall')
defineExpose({
  title
})
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 86px;
  padding: 18px 14px 14px;
  line-height: 1;
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, .06);
  overflow: hidden;

  & > .sidebar-logo-link.sidebar-logo-link {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 100%;
    width: 100%;
    padding: 0 4px;
    border-radius: 18px;
    color: #1d1d1f;

    .sidebar-brand-copy {
      min-width: 0;
    }

    & .sidebar-title {
      margin: 0;
      color: #1d1d1f;
      font-weight: 600;
      line-height: 1.2;
      font-size: 14px;
      letter-spacing: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    em {
      display: block;
      margin-top: 5px;
      color: #7a7a7a;
      font-size: 11px;
      font-style: normal;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: .2px;
      white-space: nowrap;
    }
  }

  &.collapse {
    height: 0;
    padding: 0;
    border-bottom: 0;

    .sidebar-logo-link {
      display: none;
    }
  }
}
</style>
