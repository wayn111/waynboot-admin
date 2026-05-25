<template>
  <div>
    <img :src="options.img" title="点击上传头像" class="img-circle img-lg" @click="editCropper()">
    <el-dialog :title="title" v-model="open" width="800px">
      <el-row>
        <el-col :xs="24" :md="12" :style="{height: '350px'}">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :auto-crop="options.autoCrop"
            :auto-crop-width="options.autoCropWidth"
            :auto-crop-height="options.autoCropHeight"
            :fixed-box="options.fixedBox"
            @realTime="realTime"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{height: '350px'}">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img">
          </div>
        </el-col>
      </el-row>
      <br>
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
            <el-button size="small">
              上传
              <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{span: 1, offset: 2}" :md="2">
          <el-button icon="Plus" size="small" @click="changeScale(1)" />
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2">
          <el-button icon="Minus" size="small" @click="changeScale(-1)" />
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2">
          <el-button icon="RefreshLeft" size="small" @click="rotateLeft()" />
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2">
          <el-button icon="RefreshRight" size="small" @click="rotateRight()" />
        </el-col>
        <el-col :lg="{span: 2, offset: 6}" :md="2">
          <el-button type="primary" size="small" @click="uploadImg()">提 交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import store from '@/store'
import { VueCropper } from 'vue-cropper'
import { uploadAvatar } from '@/api/system/user'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  components: {
    VueCropper
  }
})
defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['updated'])
const templateRefs = useTemplateRefs(instance)
const open = ref(false)
const title = ref('修改头像')
const options = ref({
  img: store.getters.avatar,
  // 裁剪图片的地址
  autoCrop: true,
  // 是否默认生成截图框
  autoCropWidth: 200,
  // 默认生成截图框宽度
  autoCropHeight: 200,
  // 默认生成截图框高度
  fixedBox: true // 固定截图框大小 不允许改变
})
const previews = ref({})
function editCropper() {
  open.value = true
}
function requestUpload() {}
function rotateLeft() {
  templateRefs.cropper.rotateLeft()
}
function rotateRight() {
  templateRefs.cropper.rotateRight()
}
function changeScale(num) {
  num = num || 1
  templateRefs.cropper.changeScale(num)
}
function beforeUpload(file) {
  if (file.type.indexOf('image/') === -1) {
    instance.proxy.msgError('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。')
  } else {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      options.value.img = reader.result
    }
  }
}
function uploadImg() {
  templateRefs.cropper.getCropBlob(data => {
    const formData = new FormData()
    formData.append('avatarfile', data)
    uploadAvatar(formData).then(response => {
      if (response.code === 200) {
        open.value = false
        options.value.img = response.data
        emit('updated', { avatar: response.data })
        instance.proxy.$message.success('修改成功')
      } else {
        instance.proxy.$message.error(response.msg)
      }
      templateRefs.cropper.clearCrop()
    })
  })
}
function realTime(data) {
  previews.value = data
}
defineExpose({
  beforeUpload,
  changeScale,
  editCropper,
  open,
  options,
  previews,
  realTime,
  requestUpload,
  rotateLeft,
  rotateRight,
  title,
  uploadImg
})
</script>
