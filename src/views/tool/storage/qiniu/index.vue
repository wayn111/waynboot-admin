<template>
  <div
    v-loading="syncLoading"
    class="app-container"
    element-loading-text="正在同步"
  >
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="文件名" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入文件名"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上传时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="Search"
          size="small"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="Refresh"
          size="small"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          size="small"
          @click="open = true"
        >上传</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          class="filter-item"
          size="small"
          type="success"
          icon="Tools"
          @click="doConfig"
        >配置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          class="filter-item"
          size="small"
          type="warning"
          icon="Promotion"
          @click="handleSync"
        >同步</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          class="filter-item"
          size="small"
          type="danger"
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <!-- 文件上传 -->
    <el-dialog
      v-model="open"
      :close-on-click-modal="false"
      append-to-body
      width="500px"
      @close="doSubmit"
    >
      <el-upload
        :http-request="uploadSectionFile"
        :before-remove="handleBeforeRemove"
        :on-success="handleSuccess"
        :on-error="handleError"
        :headers="headers"
        :action="uploadPath"
        class="avatar-uploader"
        multiple
      >
        <el-button size="small" type="primary">点击上传</el-button>
        <template #tip><div style="display: block" class="el-upload__tip">
          请勿上传违法文件，且文件不超过15M
        </div></template>
      </el-upload>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="doSubmit">确认</el-button>
      </div></template>
    </el-dialog>
    <!--表单组件-->
    <eForm ref="formRef" />
    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="loading"
      border
      :data="fileList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        prop="name"
        :show-overflow-tooltip="true"
        align="center"
        label="文件名"
        width="330"
      >
        <template #default="scope">
          <a
            href="JavaScript:"
            class="el-link el-link--primary"
            target="_blank"
            type="primary"
            @click="download(scope.row.contentId)"
          >{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        prop="suffix"
        align="center"
        label="文件类型"
      />
      <el-table-column prop="bucket" align="center" label="空间名称" />
      <el-table-column prop="size" align="center" label="文件大小" />
      <el-table-column prop="type" align="center" label="空间类型" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination
      v-show="total"
      :total="total"
      v-model:page="queryForm.pageNum"
      v-model:limit="queryForm.pageSize"
      @pagination="getList"
    />
  </div>
</template>
<script setup>
import { getCurrentInstance, ref, watch } from 'vue'
import { list, del, download as downloadFile, syncQiniu, upload } from '@/api/tool/qiniu'
import { getToken } from '@/utils/auth'
import eForm from './form'
import { uploadPath as uploadApiPath } from '@/api/tool/qiniu'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  components: {
    eForm
  }
})
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const syncLoading = ref(false)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const total = ref(0)
const dateRange = ref([])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  name: undefined
})
const fileList = ref([])
const files = ref([])
const open = ref(false)
const form = ref({
  title: undefined,
  status: 0,
  sort: undefined,
  imgUrl: undefined,
  jumpUrl: undefined
})
const uploadPath = ref(uploadApiPath)
const headers = ref({
  Authorization: 'Bearer ' + getToken()
})
const url = ref('')
function handleQuery() {
  getList()
}
function resetQuery() {
  templateRefs.queryFormRef.resetFields()
  dateRange.value = []
  handleQuery()
}
async function getList() {
  const {
    data: {
      records: data,
      total: pageTotal
    }
  } = await list(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  fileList.value = data
  loading.value = false
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.contentId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function doConfig() {
  const _this = templateRefs.formRef
  _this.dialog = true
  _this.init()
}
async function handleDelete(row) {
  const contentIds = row.contentId || ids.value
  instance.proxy.$confirm('是否确认删除编号为 [' + contentIds + '] 的文件?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return del(contentIds)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function(e) {})
}
function handleSync() {
  syncLoading.value = true
  syncQiniu().then(res => {
    syncLoading.value = false
    instance.proxy.$message.success('同步完成')
    getList()
  }).finally(() => {
    syncLoading.value = false
  })
}
function uploadSectionFile(param) {
  const fileObj = param.file
  const form = new FormData()
  // 文件对象
  form.append('file', fileObj)
  upload(form).then(res => {
    param.onSuccess(res)
  }).catch(({
    err
  }) => {
    param.onError(err)
  })
}
function handleSuccess(response, file, fileList) {
  const id = response.id
  const uid = file.uid
  files.value.push({
    uid,
    id
  })
}
function handleError(e, file, fileList) {}
function handleBeforeRemove(file, fileList) {
  for (let i = 0; i < files.value.length; i++) {
    if (files.value[i].uid === file.uid) {
      del([files.value[i].id]).then(res => {})
      return true
    }
  }
}
function download(id) {
  // 先打开一个空的新窗口，再请求
  instance.proxy.newWin = window.open()
  downloadFile(id).then(res => {
    url.value = res.url
  }).catch(err => {
    console.log(err.response.data.message)
  })
}
function doSubmit() {
  open.value = false
  getList()
}
watch(url, (newVal, oldVal) => {
  if (newVal && instance.proxy.newWin) {
    instance.proxy.newWin.sessionStorage.clear()
    instance.proxy.newWin.location.href = newVal
    // 重定向后把url和newWin重置
    url.value = ''
    instance.proxy.newWin = null
  }
})
;(() => {
  // 点击tab切换时，进行初始化
  // this.getList()
})()
defineExpose({
  dateRange,
  doConfig,
  doSubmit,
  download,
  fileList,
  files,
  form,
  getList,
  handleBeforeRemove,
  handleDelete,
  handleError,
  handleQuery,
  handleSelectionChange,
  handleSuccess,
  handleSync,
  headers,
  ids,
  loading,
  multiple,
  open,
  queryForm,
  resetQuery,
  single,
  syncLoading,
  title,
  total,
  uploadPath,
  uploadSectionFile,
  url
})
</script>
