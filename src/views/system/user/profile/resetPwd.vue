<template>
  <el-form ref="form" :model="passwordForm" :rules="rules" label-width="90px" class="profile-form">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="passwordForm.oldPassword" placeholder="请输入旧密码" type="password" show-password />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="passwordForm.newPassword" placeholder="请输入新密码" type="password" show-password />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="passwordForm.confirmPassword" placeholder="请确认密码" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="small" @click="submit">保存</el-button>
      <el-button type="danger" size="small" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { useRouter } from 'vue-router'
import { updateUserPwd } from '@/api/system/user'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const router = useRouter()
const templateRefs = useTemplateRefs(instance)
const passwordForm = ref(createPasswordForm())
function createPasswordForm() {
  return {
    oldPassword: undefined,
    newPassword: undefined,
    confirmPassword: undefined
  }
}
function equalToPassword(rule, value, callback) {
  if (passwordForm.value.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}
const rules = ref({
  oldPassword: [{
    required: true,
    message: '旧密码不能为空',
    trigger: 'blur'
  }],
  newPassword: [{
    required: true,
    message: '新密码不能为空',
    trigger: 'blur'
  }, {
    min: 6,
    max: 20,
    message: '长度在 6 到 20 个字符',
    trigger: 'blur'
  }],
  confirmPassword: [{
    required: true,
    message: '确认密码不能为空',
    trigger: 'blur'
  }, {
    required: true,
    validator: equalToPassword,
    trigger: 'blur'
  }]
})
function submit() {
  templateRefs.form?.validate(valid => {
    if (valid) {
      updateUserPwd(passwordForm.value.oldPassword, passwordForm.value.newPassword).then(response => {
        if (response.code === 200) {
          instance.proxy.$message.success('修改成功')
          resetPasswordForm()
        } else {
          instance.proxy.$message.error(response.msg || '修改失败')
        }
      })
    }
  })
}
function resetPasswordForm() {
  passwordForm.value = createPasswordForm()
  templateRefs.form?.resetFields?.()
}
function close() {
  router.push({
    path: '/'
  })
}
defineExpose({
  close,
  passwordForm,
  resetPasswordForm,
  rules,
  submit,
  user: passwordForm
})
</script>

