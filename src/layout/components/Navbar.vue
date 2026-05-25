<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb class="breadcrumb-container" />
    <div class="right-menu">
      <button
        class="navbar-tool-button navbar-message-btn"
        type="button"
        title="消息通知"
        aria-label="消息通知"
        @click="goMessageCenter"
      >
        <el-badge :value="noticeCount" :max="99" :hidden="noticeCount <= 0" class="navbar-tool-badge">
          <svg-icon icon-class="message" />
        </el-badge>
      </button>
      <a
        class="navbar-tool-button navbar-github-link"
        :href="githubUrl"
        target="_blank"
        rel="noopener noreferrer"
        title="GitHub"
        aria-label="GitHub"
      >
        <svg-icon icon-class="github" />
      </a>
      <img :src="logo" class="avatar" @click="avatarClick()">
      <el-dropdown class="avatar-container" trigger="hover">
        <span class="el-dropdown-link">
          {{ name }}
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <router-link to="/profile">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided @click="logout">
              <span style="display:block;">退出登陆</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { staticMessageNotifications } from '@/views/shop/msgList/messageNotifications'
const instance = getCurrentInstance()
const store = useStore()
const router = useRouter()
const route = useRoute()
defineOptions({
  components: {
    Breadcrumb,
    Hamburger
  }
})
const logo = ref(store.getters.avatar)
const name = ref(store.getters.name)
const sidebar = computed(() => store.getters.sidebar)
function toggleSideBar() {
  store.dispatch('app/toggleSideBar')
}
const githubUrl = 'https://github.com/wayn111/waynboot-admin'
const noticeCount = computed(() => staticMessageNotifications.length)
function goMessageCenter() {
  router.push('/shop/msgList')
}
function logout() {
  instance.proxy.$confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async() => {
    await store.dispatch('user/logout')
    router.push(`/login?redirect=${route.fullPath}`)
  }).catch(e => {})
}
function avatarClick() {
  router.push('/profile')
}
defineExpose({
  avatarClick,
  githubUrl,
  goMessageCenter,
  logo,
  logout,
  name,
  noticeCount,
  sidebar,
  toggleSideBar
})
</script>

<style lang="scss" scoped>
.navbar {
  height: 58px;
  overflow: visible;
  position: relative;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid #e0e0e0;
  box-shadow: none;
  backdrop-filter: saturate(180%) blur(20px);

  .hamburger-container {
    line-height: 54px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 102, 204, .08)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 58px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding-right: 18px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .navbar-tool-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: 1px solid #e0e0e0;
      border-radius: 50%;
      background: rgba(255, 255, 255, .92);
      color: #1d1d1f;
      cursor: pointer;
      line-height: 1;
      box-shadow: 0 1px 2px rgba(0, 0, 0, .04);
      transition: background .18s ease, border-color .18s ease, color .18s ease, transform .18s ease;

      &:hover {
        background: #f5f5f7;
        border-color: rgba(0, 102, 204, .24);
        color: #0066cc;
        transform: translateY(-1px);
      }

      &:active {
        transform: scale(.96);
      }

      .svg-icon {
        width: 17px;
        height: 17px;
      }
    }

    .navbar-tool-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      :deep(.el-badge__content) {
        border: 2px solid #ffffff;
        box-shadow: none;
      }
    }

    .avatar {
      width: 38px;
      height: 38px;
      vertical-align: middle;
      margin: 0 0 0 4px;
      border-radius: 50%;
      border: 1px solid #e0e0e0;
      box-shadow: none;
    }

    .avatar-container {
      margin-right: 0;
      .el-dropdown-link {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 0 10px;
        height: 34px;
        border-radius: 999px;
        background: #ffffff;
        box-shadow: 0 0 0 1px #e0e0e0 inset;
        font-size: 14px;
        font-weight: 400;
        cursor: pointer;
        color: #1d1d1f;
      }
      .el-icon--right {
        font-size: 12px;
      }
    }
  }
}
</style>
