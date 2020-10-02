<template>
  <div>
    <el-form
      ref="form"
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
        <el-button icon="el-icon-plus" @click="addDomain" />
        <el-button
          style="margin-left: 0"
          icon="el-icon-minus"
          @click.prevent="removeDomain(domain)"
        />
      </el-form-item>
      <el-form-item label="发送内容">
        <editor v-model="form.content" :init="editorInit" />
      </el-form-item>
      <el-button
        :loading="loading"
        style="margin-left: 1.6%"
        size="medium"
        type="primary"
        @click="doSubmit"
      >发送邮件</el-button>
    </el-form>
  </div>
</template>

<script>
import { send } from '@/api/tool/email'
import Editor from '@tinymce/tinymce-vue'
import { validEmail } from '@/utils/validate'
import { fileUpload } from '@/api/upload'
export default {
  name: 'Index',
  components: { Editor },
  data() {
    return {
      loading: false,
      form: { subject: '', tos: [], content: '' },
      // 初始化富文本编辑器
      editorInit: {
        language: 'zh_CN',
        height: 500,
        convert_urls: false,
        plugins: [
          'advlist anchor autolink autosave code codesample  directionality emoticons fullscreen hr image imagetools importcss insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textpattern visualblocks visualchars wordcount'
        ],
        toolbar: [
          'searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample',
          'hr bullist numlist link image charmap preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen'
        ],
        images_upload_handler: function(blobInfo, success, failure) {
          const formData = new FormData()
          formData.append('file', blobInfo.blob())
          fileUpload(formData)
            .then((res) => {
              success(res.map.url)
            })
            .catch(() => {
              failure('上传失败，请重新上传')
            })
        }
      },
      tos: [
        {
          value: ''
        }
      ],
      rules: {
        subject: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
      }
    }
  },
  mounted() {
  },
  methods: {
    removeDomain(item) {
      var index = this.tos.indexOf(item)
      if (index !== -1 && this.tos.length !== 1) {
        this.tos.splice(index, 1)
      } else {
        this.$message({
          message: '请至少保留一位联系人',
          type: 'warning'
        })
      }
    },
    addDomain() {
      this.tos.push({
        value: '',
        key: Date.now()
      })
    },
    doSubmit() {
      const _this = this
      this.$refs['form'].validate((valid) => {
        this.form.tos = []
        if (valid) {
          let sub = false
          this.tos.forEach(function(data, index) {
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
          this.loading = true
          send(this.form)
            .then((res) => {
              this.$notify({
                title: '发送成功',
                type: 'success',
                duration: 2500
              })
              this.loading = false
            })
            .catch((err) => {
              this.loading = false
              console.log(err.response.data.message)
            })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.editor {
  text-align: left;
  margin: 20px;
  width: 730px;
}
::v-deep .w-e-text-container {
  height: 360px !important;
}
</style>
