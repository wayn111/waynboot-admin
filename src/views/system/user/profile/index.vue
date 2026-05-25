<template>
  <div v-loading="loading" class="app-container profile-page">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <userAvatar :user="user" @updated="handleProfileUpdated" />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />用户名称
                <div class="pull-right">{{ user.userName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="user" />用户昵称
                <div class="pull-right">{{ user.nickName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />手机号码
                <div class="pull-right">{{ user.phone }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />用户邮箱
                <div class="pull-right">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />所属部门
                <div v-if="user.dept" class="pull-right">{{ user.dept.deptName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />所属角色
                <div class="pull-right">{{ roleGroup }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />创建日期
                <div class="pull-right">{{ user.createTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template #header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="user" @updated="handleProfileUpdated" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd :user="user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import userAvatar from './userAvatar'
import userInfo from './userInfo'
import resetPwd from './resetPwd'
import { getUserProfile } from '@/api/system/user'
defineOptions({
  name: 'Profile',
  components: {
    userAvatar,
    userInfo,
    resetPwd
  }
})
const user = ref({})
const roleGroup = ref('')
const activeTab = ref('userinfo')
const loading = ref(false)
async function getUser() {
  loading.value = true
  try {
    const response = await getUserProfile()
    const profile = response.data || {}
    user.value = profile.user || {}
    roleGroup.value = profile.roleGroup || ''
  } finally {
    loading.value = false
  }
}
function handleProfileUpdated(updatedUser) {
  user.value = {
    ...user.value,
    ...updatedUser
  }
}
(() => {
  getUser()
})()
defineExpose({
  activeTab,
  getUser,
  handleProfileUpdated,
  loading,
  roleGroup,
  user
})
</script>
