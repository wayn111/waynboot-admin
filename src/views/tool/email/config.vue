<template>
  <el-form ref="formRef" :model="form" :rules="rules" style="margin-top: 6px;" size="small" label-width="100px">
    <el-form-item label="发件人邮箱" prop="fromUser">
      <el-input v-model="form.fromUser" style="width: 40%" />
      <span style="color: #C0C0C0;margin-left: 10px;">Sender mailbox</span>
    </el-form-item>
    <el-form-item label="发件用户名" prop="user">
      <el-input v-model="form.user" style="width: 40%;" />
      <span style="color: #C0C0C0;margin-left: 10px;">Sender usernamex</span>
    </el-form-item>
    <el-form-item label="邮箱密码" prop="pass">
      <el-input v-model="form.pass" type="password" style="width: 40%;" />
      <span style="color: #C0C0C0;margin-left: 10px;">email Password</span>
    </el-form-item>
    <el-form-item label="SMTP地址" prop="host">
      <el-input v-model="form.host" style="width: 40%;" />
      <span style="color: #C0C0C0;margin-left: 10px;">SMTP address</span>
    </el-form-item>
    <el-form-item label="SMTP端口" prop="port">
      <el-input v-model="form.port" style="width: 40%;" />
      <span style="color: #C0C0C0;margin-left: 10px;">SMTP port</span>
    </el-form-item>
    <el-form-item label="SMTP SSL端口" prop="port">
      <el-input v-model="form.sslPort" style="width: 40%;" />
      <span style="color: #C0C0C0;margin-left: 10px;">SMTP ssl port</span>
    </el-form-item>
    <el-form-item label="是否启用SSL" prop="sslEnable">
      <el-radio-group v-model="form.sslEnable">
        <el-radio :label="0">不启用</el-radio>
        <el-radio :label="1">启用</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="">
      <el-button :loading="loading" size="default" type="primary" @click="doSubmit">保存配置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { get, update } from '@/api/tool/email'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  name: 'Config'
})
const templateRefs = useTemplateRefs(instance)
const loading = ref(false)
const form = ref({
  id: 1,
  fromUser: '',
  user: '',
  pass: '',
  host: '',
  port: '25',
  sslPort: '465',
  sslEnable: 1
})
const rules = ref({
  fromUser: [{
    required: true,
    message: '请输入发件人邮箱',
    trigger: 'blur'
  }, {
    type: 'email',
    message: '请输入正确的邮箱地址',
    trigger: 'blur'
  }],
  user: [{
    required: true,
    message: '请输入发件用户名',
    trigger: 'blur'
  }],
  pass: [{
    required: true,
    message: '密码不能为空',
    trigger: 'blur'
  }],
  host: [{
    required: true,
    message: 'SMTP地址不能为空',
    trigger: 'blur'
  }],
  port: [{
    required: true,
    message: 'SMTP端口不能为空',
    trigger: 'blur'
  }],
  sslPort: [{
    required: true,
    message: 'SMTP SSL端口不能为空',
    trigger: 'blur'
  }]
})
function init() {
  get().then(res => {
    form.value = res.data || {}
  })
}
function doSubmit() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      loading.value = true
      update(form.value).then(res => {
        instance.proxy.$notify({
          title: '修改成功',
          type: 'success',
          duration: 2500
        })
        loading.value = false
      }).catch(err => {
        loading.value = false
        console.log(err.response.data.message)
      })
    } else {
      return false
    }
  })
}
(() => {
  init()
})()
defineExpose({
  doSubmit,
  form,
  init,
  loading,
  rules
})
</script>

<style scoped>

</style>
