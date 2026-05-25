<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form ref="formRef" :model="form">
        <h3>客服弹框</h3>
        <el-form-item label="">
          <editor v-model="form.kefuContent" :init="editorInit" :license-key="tinymceLicenseKey" />
        </el-form-item>
      </el-form>
    </el-card>
    <div class="op-container">
      <el-button type="primary" @click="submitForm">确认</el-button>
    </div>
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { getKefupop, updateKefupop } from '@/api/shop/kefupop'
import Editor from '@/utils/tinymce-editor'
import { getToken } from '@/utils/auth'
import { uploadPath as uploadApiPath, fileUpload } from '@/api/upload'
import { createTinymceImageUploadHandler, createTinymceInit, tinymceLicenseKey as tinyMceGplLicenseKey } from '@/utils/tinymce'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  components: {
    Editor
  }
})
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const tinymceLicenseKey = ref(tinyMceGplLicenseKey)
const form = ref({
  kefuContent: ''
})
const editorInit = ref(createTinymceInit({
  images_upload_handler: createTinymceImageUploadHandler(fileUpload, res => res.map.url)
}))
const uploadPath = ref(uploadApiPath)
const headers = ref({
  Authorization: 'Bearer ' + getToken()
})
async function init() {
  const {
    map: {
      data
    }
  } = await getKefupop()
  form.value.kefuContent = data.kefupopContent
}
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      updateKefupop(form.value).then(response => {
        handleSubmitResponse(response)
      })
    }
  })
}
function handleSubmitResponse(response) {
  if (response.code === 200) {
    instance.proxy.$message.success('修改成功')
    init()
  } else {
    instance.proxy.$message.error(response.msg || '操作失败')
  }
}
(() => {
  init()
})()
defineExpose({
  editorInit,
  form,
  headers,
  init,
  loading,
  submitForm,
  tinymceLicenseKey,
  uploadPath
})
</script>
<style scoped>
.el-card {
  margin-bottom: 10px;
}

.op-container {
  display: flex;
  justify-content: center;
}
</style>
