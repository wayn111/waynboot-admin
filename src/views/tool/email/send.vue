<template>
  <div>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      style="margin-top: 6px"
      size="small"
      label-width="100px"
    >
      <el-form-item label="邮件标题" prop="subject">
        <el-input v-model="form.subject" style="width: 646px" />
      </el-form-item>
      <el-form-item
        v-for="(domain, index) in tos"
        :key="domain.key"
        :label="'收件邮箱' + (index === 0 ? '' : index)"
      >
        <el-input v-model="domain.value" style="width: 550px" />
        <el-button icon="Plus" @click="addDomain" />
        <el-button
          style="margin-left: 0"
          icon="Minus"
          @click.prevent="removeDomain(domain)"
        />
      </el-form-item>
      <el-form-item label="发送内容">
        <editor v-model="form.content" :init="editorInit" :license-key="tinymceLicenseKey" />
      </el-form-item>
      <el-button
        :loading="loading"
        style="margin-left: 1.6%"
        size="default"
        type="primary"
        @click="doSubmit"
      >发送邮件</el-button>
    </el-form>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue'
import { send } from '@/api/tool/email'
import Editor from '@/utils/tinymce-editor'
import { validEmail } from '@/utils/validate'
import { fileUpload } from '@/api/upload'
import { createTinymceImageUploadHandler, createTinymceInit, tinymceLicenseKey as tinyMceGplLicenseKey } from '@/utils/tinymce'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  name: 'Index',
  components: {
    Editor
  }
})
const templateRefs = useTemplateRefs(instance)
const loading = ref(false)
const tinymceLicenseKey = ref(tinyMceGplLicenseKey)
const form = ref({
  subject: '',
  tos: [],
  content: ''
})
const editorInit = ref(createTinymceInit({
  images_upload_handler: createTinymceImageUploadHandler(fileUpload, res => res.url)
}))
const tos = ref([{
  value: ''
}])
const rules = ref({
  subject: [{
    required: true,
    message: '标题不能为空',
    trigger: 'blur'
  }]
})
function removeDomain(item) {
  var index = tos.value.indexOf(item)
  if (index !== -1 && tos.value.length !== 1) {
    tos.value.splice(index, 1)
  } else {
    instance.proxy.$message({
      message: '请至少保留一位联系人',
      type: 'warning'
    })
  }
}
function addDomain() {
  tos.value.push({
    value: '',
    key: Date.now()
  })
}
function doSubmit() {
  const _this = this
  templateRefs.formRef.validate(valid => {
    form.value.tos = []
    if (valid) {
      let sub = false
      tos.value.forEach(function(data, index) {
        if (data.value === '') {
          _this.$message({
            message: '收件邮箱不能为空',
            type: 'warning'
          })
          sub = true
        } else if (validEmail(data.value)) {
          _this.form.tos.push(data.value)
        } else {
          _this.$message({
            message: '收件邮箱格式错误',
            type: 'warning'
          })
          sub = true
        }
      })
      if (sub) {
        return false
      }
      loading.value = true
      send(form.value).then(res => {
        instance.proxy.$notify({
          title: '发送成功',
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
onMounted(() => {})
defineExpose({
  addDomain,
  doSubmit,
  editorInit,
  form,
  loading,
  removeDomain,
  rules,
  tinymceLicenseKey,
  tos
})
</script>

<style scoped>
.editor {
  text-align: left;
  margin: 20px;
  width: 730px;
}
:deep(.w-e-text-container) {
  height: 360px !important;
}
</style>
