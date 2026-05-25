<template>
  <el-form ref="form" :model="profileForm" :rules="rules" label-width="90px" class="profile-form">
    <el-form-item label="用户昵称" prop="nickName">
      <el-input v-model="profileForm.nickName" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phone">
      <el-input v-model="profileForm.phone" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="profileForm.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="profileForm.sex">
        <el-radio :label="0">男</el-radio>
        <el-radio :label="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="small" @click="submit">保存</el-button>
      <el-button type="danger" size="small" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { getCurrentInstance, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { updateUserProfile } from '@/api/system/user'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const router = useRouter()
const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['updated'])
const templateRefs = useTemplateRefs(instance)
const profileForm = ref(createProfileForm(props.user))
const rules = ref({
  nickName: [{
    required: true,
    message: '用户昵称不能为空',
    trigger: 'blur'
  }],
  email: [{
    required: true,
    message: '邮箱地址不能为空',
    trigger: 'blur'
  }, {
    type: 'email',
    message: "'请输入正确的邮箱地址",
    trigger: ['blur', 'change']
  }],
  phone: [{
    required: true,
    message: '手机号码不能为空',
    trigger: 'blur'
  }, {
    pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
    message: '请输入正确的手机号码',
    trigger: 'blur'
  }]
})
function createProfileForm(user) {
  return {
    ...user,
    nickName: user?.nickName ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    sex: user?.sex ?? 0
  }
}
watch(
  () => props.user,
  value => {
    profileForm.value = createProfileForm(value)
  },
  {
    deep: true,
    immediate: true
  }
)
function submit() {
  templateRefs.form?.validate(valid => {
    if (valid) {
      updateUserProfile(profileForm.value).then(response => {
        if (response.code === 200) {
          emit('updated', { ...profileForm.value })
          instance.proxy.$message.success('修改成功')
        } else {
          instance.proxy.$message.error(response.msg || '修改失败')
        }
      })
    }
  })
}
function close() {
  router.push({
    path: '/'
  })
}
defineExpose({
  close,
  profileForm,
  rules,
  submit
})
</script>

