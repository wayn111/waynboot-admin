<template>
  <div class="login login-shell">
    <header class="login-global-nav">
      <div class="login-nav-brand">
        <img :src="logoImage" alt="">
        <span>电商管理后台</span>
      </div>
      <a class="login-help" href="javascript:void(0)" aria-label="帮助中心">
        <span class="login-help-icon">?</span>
        <span>帮助中心</span>
      </a>
    </header>

    <main class="login-stage">
      <section class="login-brand-panel" aria-label="电商管理后台">
        <div class="login-product-preview" aria-hidden="true">
          <div class="preview-ring" />
          <div class="preview-tile">
            <div class="preview-bag">
              <div class="preview-bag-handle" />
            </div>
            <div class="preview-bars">
              <span />
              <span />
              <span />
            </div>
            <div class="preview-card">
              <span class="preview-line preview-line-short" />
              <span class="preview-line" />
              <div class="preview-chart">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="login-card">
        <div class="login-card-header">
          <h1>电商管理后台</h1>
          <p>欢迎登录</p>
        </div>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" type="text" autocomplete="off" placeholder="请输入账号">
              <template #prefix>
                <svg-icon
                  icon-class="user"
                  class="el-input__icon input-icon"
                />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              autocomplete="off"
              placeholder="请输入密码"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <svg-icon icon-class="password" class="el-input__icon input-icon" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code" class="code-form-item">
            <div class="captcha-row">
              <el-input
                v-model="loginForm.code"
                autocomplete="off"
                placeholder="请输入验证码"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <svg-icon icon-class="validCode" class="el-input__icon input-icon" />
                </template>
              </el-input>
              <button class="login-code" type="button" aria-label="刷新验证码" @click="getCode">
                <img :src="codeUrl" alt="验证码">
              </button>
            </div>
          </el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
            <a href="javascript:void(0)">忘记密码</a>
          </div>
          <el-form-item class="login-action">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getCodeImg } from '@/api/login'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import logoImage from '@/assets/image/mall-logo.png'
const store = useStore()
const router = useRouter()
const route = useRoute()
defineOptions({
  name: 'Login'
})
const loginFormRef = ref()
const codeUrl = ref('')
const cookiePassword = ref('')
const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
  code: '',
  key: ''
})
const loginRules = ref({
  username: [{
    required: true,
    trigger: 'blur',
    message: '用户名不能为空'
  }],
  password: [{
    required: true,
    trigger: 'blur',
    message: '密码不能为空'
  }],
  code: [{
    required: true,
    trigger: 'change',
    message: '验证码不能为空'
  }]
})
const loading = ref(false)
const redirect = ref(undefined)
function getCode() {
  getCodeImg().then(res => {
    const {
      data: {
        key,
        image
      }
    } = res
    codeUrl.value = image
    loginForm.value.key = key
  })
}
function getCookie() {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  loginForm.value = {
    ...loginForm.value,
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : rememberMe === 'true'
  }
}
function handleLogin() {
  loginFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      if (loginForm.value.rememberMe) {
        Cookies.set('username', loginForm.value.username, {
          expires: 30
        })
        Cookies.set('password', encrypt(loginForm.value.password), {
          expires: 30
        })
        Cookies.set('rememberMe', loginForm.value.rememberMe, {
          expires: 30
        })
      } else {
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }
      store.dispatch('user/login', loginForm.value).then(() => {
        router.push({
          path: redirect.value || '/'
        })
      }).catch(e => {
        loading.value = false
        getCode()
      })
    }
  })
}
watch(route, route => {
  redirect.value = route.query && route.query.redirect
}, {
  immediate: true
})
;(() => {
  getCode()
  getCookie()
})()
defineExpose({
  codeUrl,
  cookiePassword,
  getCode,
  getCookie,
  handleLogin,
  loading,
  loginForm,
  loginFormRef,
  loginRules,
  redirect
})
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  --login-primary: #1677ff;
  --login-primary-focus: #0066cc;
  --login-ink: #111318;
  --login-muted: #8a93a3;
  --login-border: rgba(136, 150, 170, .28);
  --login-surface: rgba(255, 255, 255, .76);
  min-height: 100%;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(145deg, rgba(246, 250, 255, .98) 0%, rgba(238, 245, 255, .92) 44%, rgba(255, 255, 255, .96) 100%),
    #f5f8ff;
  color: var(--login-ink);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", sans-serif;

  &::before,
  &::after {
    content: "";
    position: absolute;
    pointer-events: none;
    border: 2px solid rgba(255, 255, 255, .72);
    border-radius: 50%;
    filter: blur(.2px);
  }

  &::before {
    width: 880px;
    height: 330px;
    left: -120px;
    top: 220px;
    transform: rotate(13deg);
  }

  &::after {
    width: 940px;
    height: 360px;
    right: -220px;
    bottom: 36px;
    transform: rotate(-16deg);
  }
}

.login-global-nav {
  position: relative;
  z-index: 2;
  height: 76px;
  margin: 22px 24px 0;
  padding: 0 42px;
  border: 1px solid rgba(255, 255, 255, .84);
  border-radius: 22px;
  background: rgba(255, 255, 255, .78);
  color: var(--login-ink);
  backdrop-filter: blur(22px);
  box-shadow: 0 20px 60px rgba(60, 93, 142, .12);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-nav-brand {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  font-size: 24px;
  line-height: 1;
  font-weight: 600;
  letter-spacing: 0;

  img {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    filter: brightness(0);
  }
}

.login-help {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--login-primary);
  font-size: 17px;
  text-decoration: none;
}

.login-help-icon {
  width: 22px;
  height: 22px;
  border: 2px solid currentColor;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.login-stage {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 98px);
  width: min(1360px, 100%);
  margin: 0 auto;
  padding: 48px 64px 52px;
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(460px, 520px);
  gap: clamp(48px, 7vw, 112px);
  align-items: center;
}

.login-brand-panel {
  position: relative;
  min-height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-product-preview {
  position: relative;
  width: min(540px, 88vw);
  height: min(460px, 64vw);
}

.preview-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255, 255, 255, .76);
  border-radius: 48% 52% 44% 56%;
  transform: rotate(-18deg);
  box-shadow: inset 0 0 18px rgba(255, 255, 255, .4);
}

.preview-tile {
  position: absolute;
  left: 44px;
  top: 54px;
  width: 410px;
  height: 340px;
  border: 1px solid rgba(255, 255, 255, .94);
  border-radius: 78px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, .86), rgba(130, 174, 255, .42)),
    rgba(214, 229, 255, .7);
  box-shadow:
    0 50px 90px rgba(20, 102, 232, .22),
    inset 0 0 36px rgba(255, 255, 255, .72);
}

.preview-bag {
  position: absolute;
  left: 110px;
  top: 132px;
  width: 178px;
  height: 188px;
  border-radius: 18px 18px 30px 30px;
  background:
    linear-gradient(145deg, rgba(24, 112, 255, .94), rgba(255, 255, 255, .9) 76%),
    #ffffff;
  box-shadow: 0 42px 58px rgba(0, 91, 230, .28);
}

.preview-bag-handle {
  position: absolute;
  left: 50px;
  top: -64px;
  width: 76px;
  height: 92px;
  border: 12px solid rgba(255, 255, 255, .9);
  border-bottom: 0;
  border-radius: 54px 54px 0 0;
  box-shadow: 0 8px 24px rgba(28, 95, 220, .16);
}

.preview-bars {
  position: absolute;
  right: 48px;
  bottom: 66px;
  display: flex;
  align-items: flex-end;
  gap: 18px;

  span {
    width: 21px;
    border-radius: 9999px 9999px 8px 8px;
    background: rgba(52, 124, 255, .22);

    &:nth-child(1) {
      height: 72px;
    }

    &:nth-child(2) {
      height: 104px;
    }

    &:nth-child(3) {
      height: 138px;
    }
  }
}

.preview-card {
  position: absolute;
  right: -12px;
  bottom: -22px;
  width: 218px;
  height: 142px;
  padding: 28px 30px 22px;
  border: 1px solid rgba(255, 255, 255, .96);
  border-radius: 36px;
  background: rgba(255, 255, 255, .82);
  backdrop-filter: blur(18px);
  box-shadow: 0 34px 60px rgba(31, 102, 217, .2);
}

.preview-line {
  display: block;
  width: 96px;
  height: 13px;
  margin-bottom: 12px;
  border-radius: 9999px;
  background: rgba(101, 153, 240, .16);
}

.preview-line-short {
  width: 64px;
}

.preview-chart {
  width: 148px;
  height: 58px;
  margin-top: 6px;
  position: relative;
  display: flex;
  align-items: flex-end;

  span {
    position: absolute;
    display: block;
    height: 3px;
    border-radius: 9999px;
    background: rgba(22, 119, 255, .34);
    transform-origin: left center;

    &:nth-child(1) {
      width: 64px;
      left: 4px;
      bottom: 18px;
      transform: rotate(-14deg);
    }

    &:nth-child(2) {
      width: 72px;
      left: 58px;
      bottom: 30px;
      transform: rotate(19deg);
    }

    &:nth-child(3) {
      width: 66px;
      left: 116px;
      bottom: 44px;
      background: rgba(22, 119, 255, .62);
      transform: rotate(-43deg);
    }
  }
}

.login-card {
  width: min(520px, 100%);
  min-height: 540px;
  padding: 48px 44px 36px;
  border: 1px solid rgba(255, 255, 255, .9);
  border-radius: 32px;
  background: var(--login-surface);
  backdrop-filter: blur(28px);
  box-shadow: 0 34px 100px rgba(48, 80, 130, .16);
  justify-self: center;
}

.login-card-header {
  margin-bottom: 30px;
  text-align: center;

  h1 {
    margin: 0;
    color: var(--login-ink);
    font-size: 34px;
    line-height: 1.1;
    letter-spacing: 0;
    font-weight: 600;
  }

  p {
    margin: 12px 0 0;
    color: var(--login-muted);
    font-size: 18px;
    line-height: 1.2;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 18px;
  }

  .el-input {
    height: 56px;

    .el-input__wrapper {
      min-height: 56px;
      padding: 0 18px;
      border-radius: 12px;
      background: rgba(255, 255, 255, .64);
      box-shadow: inset 0 0 0 1px var(--login-border);
      transition: box-shadow .2s ease, background .2s ease;

      &:hover,
      &.is-focus {
        background: #fff;
        box-shadow: inset 0 0 0 2px var(--login-primary-focus);
      }
    }

    input {
      height: 56px;
      color: var(--login-ink);
      font-size: 16px;

      &::placeholder {
        color: #9098a7;
      }
    }
  }

  .input-icon {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    color: #111318;
  }
}

.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 152px;
  gap: 16px;
}

.login-code {
  height: 56px;
  padding: 0;
  border: 1px solid var(--login-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, .64);
  overflow: hidden;
  cursor: pointer;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -2px 0 26px;
  color: var(--login-muted);
  font-size: 15px;

  a {
    color: var(--login-primary);
    text-decoration: none;
    font-weight: 600;
  }

  :deep(.el-checkbox__label) {
    color: var(--login-muted);
    font-size: 15px;
  }

  :deep(.el-checkbox__inner) {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    border-color: var(--login-border);

    &::after {
      left: 6px;
      top: 2px;
      width: 4px;
      height: 9px;
    }
  }
}

.login-action {
  margin-bottom: 0 !important;

  .el-button {
    width: 100%;
    height: 56px;
    border: 0;
    border-radius: 12px;
    background: var(--login-primary);
    box-shadow: none;
    font-size: 17px;
    font-weight: 600;

    &:hover,
    &:focus {
      background: var(--login-primary-focus);
    }

    &:active {
      transform: scale(.95);
    }
  }
}

@media (max-width: 1068px) {
  .login-global-nav {
    margin: 16px 16px 0;
    padding: 0 28px;
  }

  .login-stage {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 36px 24px 56px;
  }

  .login-brand-panel {
    min-height: 460px;
  }

  .login-card {
    width: min(520px, 100%);
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .login::before {
    width: 520px;
    height: 200px;
    left: -240px;
    top: 150px;
  }

  .login::after {
    width: 520px;
    height: 220px;
    right: -250px;
    bottom: 70px;
  }

  .login-global-nav {
    height: 60px;
    padding: 0 18px;
    border-radius: 18px;
  }

  .login-nav-brand {
    gap: 12px;
    font-size: 18px;

    img {
      width: 34px;
      height: 34px;
    }
  }

  .login-help {
    font-size: 0;
    gap: 0;
  }

  .login-help-icon {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }

  .login-stage {
    min-height: auto;
    padding: 20px 16px 16px;
    gap: 16px;
  }

  .login-brand-panel {
    min-height: 226px;
  }

  .login-product-preview {
    width: 280px;
    height: 226px;
  }

  .preview-tile {
    left: 20px;
    top: 24px;
    width: 224px;
    height: 184px;
    border-radius: 42px;
  }

  .preview-bag {
    left: 52px;
    top: 76px;
    width: 100px;
    height: 104px;
    border-radius: 12px 12px 18px 18px;
  }

  .preview-bag-handle {
    left: 27px;
    top: -38px;
    width: 42px;
    height: 54px;
    border-width: 8px;
  }

  .preview-bars {
    right: 24px;
    bottom: 38px;
    gap: 9px;

    span {
      width: 12px;

      &:nth-child(1) {
        height: 44px;
      }

      &:nth-child(2) {
        height: 62px;
      }

      &:nth-child(3) {
        height: 84px;
      }
    }
  }

  .preview-card {
    right: -10px;
    bottom: -14px;
    width: 128px;
    height: 86px;
    padding: 16px 16px 12px;
    border-radius: 20px;
  }

  .preview-line {
    width: 60px;
    height: 8px;
    margin-bottom: 8px;
  }

  .preview-line-short {
    width: 42px;
  }

  .preview-chart {
    width: 88px;
    height: 34px;
  }

  .login-card {
    width: 100%;
    padding: 32px 22px 28px;
    border-radius: 26px;
    min-height: auto;
  }

  .login-card-header {
    margin-bottom: 28px;

    h1 {
      font-size: 30px;
    }

    p {
      margin-top: 12px;
      font-size: 18px;
    }
  }

  .login-form {
    .el-form-item {
      margin-bottom: 18px;
    }

    .el-input {
      height: 56px;

      .el-input__wrapper {
        min-height: 56px;
        padding: 0 16px;
      }

      input {
        height: 56px;
        font-size: 16px;
      }
    }

    .input-icon {
      width: 20px;
      height: 20px;
    }
  }

  .captcha-row {
    grid-template-columns: minmax(0, 1fr) 118px;
    gap: 12px;
  }

  .login-code,
  .login-action .el-button {
    height: 56px;
  }

  .login-action .el-button {
    font-size: 17px;
  }

  .login-options {
    margin: -2px 0 24px;
    font-size: 15px;

    :deep(.el-checkbox__label) {
      font-size: 15px;
    }
  }
}
</style>
