<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="banner标题" prop="title">
        <el-input
          v-model="queryForm.title"
          size="small"
          placeholder="请输入banner标题"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryForm.status"
          placeholder="banner状态"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.name"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryForm.type"
          placeholder="请选择类型"
          @change="selectChange"
        >
          <el-option
            label="首页轮播"
            :value="1"
          />
          <el-option
            label="静态图片"
            :value="2"
          />
          <el-option
            label="活动专区"
            :value="3"
          />
          <el-option
            label="品牌推荐"
            :value="4"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
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
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:banner:add']"
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd()"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="bannerList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="120" />
      <el-table-column label="标题" prop="title" width="200" />
      <el-table-column label="类型" prop="type">
        <template #default="scope">
          <el-tag v-if="scope.row.type == 1">首页轮播</el-tag>
          <el-tag v-if="scope.row.type == 2">静态图片</el-tag>
          <el-tag v-if="scope.row.type == 3">活动专区</el-tag>
          <el-tag v-if="scope.row.type == 4">品牌推荐</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图片" prop="imgUrl" width="200">
        <template #default="scope">
          <img v-if="scope.row.imgUrl" :src="scope.row.imgUrl" width="80">
        </template>
      </el-table-column>
      <el-table-column label="跳转链接" prop="jumpUrl" width="200" />
      <el-table-column label="排序" prop="sort" />
      <el-table-column label="状态" width="100" :formatter="statusFormat" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:banner:edit']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:banner:delete']"
            size="small"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total"
      :total="total"
      v-model:page="queryForm.pageNum"
      v-model:limit="queryForm.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改banner对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="channelDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select
            v-model="form.type"
            placeholder="请选择类型"
            @change="selectChange"
          >
            <el-option
              label="首页轮播"
              :value="1"
            />
            <el-option
              label="静态图片"
              :value="2"
            />
            <el-option
              label="活动专区"
              :value="3"
            />
            <el-option
              label="品牌推荐"
              :value="4"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图片" prop="imgUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png, .gif"
          >
            <img v-if="form.imgUrl" :src="form.imgUrl" class="avatar">
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <template #tip><div class="el-upload__tip">只能上传jpg、jpeg、png、gif文件，1043 x 430</div></template>
          </el-upload>
        </el-form-item>
        <el-form-item label="顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="跳转链接" prop="jumpUrl">
          <el-input v-model="form.jumpUrl" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{ dict.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="channelDialogHandleClose">取 消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listBanner, getBanner, addBanner, updateBanner, delBanner } from '@/api/shop/banner'
import { getToken } from '@/utils/auth'
import { uploadPath as uploadApiPath } from '@/api/upload'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const total = ref(0)
const dateRange = ref([])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  type: undefined,
  title: undefined,
  status: undefined
})
const bannerList = ref([])
const open = ref(false)
const statusOptions = ref([])
const form = ref({
  title: undefined,
  status: 0,
  type: 1,
  sort: undefined,
  imgUrl: undefined,
  jumpUrl: undefined
})
const rules = ref({
  title: [{
    required: true,
    message: '标题不能为空',
    trigger: 'blur'
  }],
  imgUrl: [{
    required: true,
    message: '图片不能为空',
    trigger: 'blur'
  }],
  sort: [{
    required: true,
    message: '排序不能为空',
    trigger: 'blur'
  }]
})
const uploadPath = ref(uploadApiPath)
const headers = ref({
  Authorization: 'Bearer ' + getToken()
})
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
  } = await listBanner(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  bannerList.value = data
  loading.value = false
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.roleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleSwitchChange(row) {
  const text = row.status === 0 ? '启用' : '停用'
  instance.proxy.$confirm('确认要 "' + text + '"该banner吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return new Promise()
  }).then(() => {
    instance.proxy.$message.success(text + '成功')
  }).catch(function() {
    row.status = row.status === 0 ? 1 : 0
  })
}
function handleAdd(row) {
  title.value = '添加banner'
  open.value = true
}
async function handleUpdate(row) {
  const {
    data
  } = await getBanner(row.id)
  form.value = data
  title.value = '修改banner'
  open.value = true
}
async function handleDelete(row) {
  const channelIds = row.id || ids.value
  instance.proxy.$confirm('是否确认删除编号为 [' + channelIds + '] 的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delBanner(channelIds)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function(e) {})
}
function reset() {
  form.value = {
    name: undefined,
    sort: undefined,
    code: undefined,
    remark: undefined,
    status: 0
  }
  templateRefs.formRef.resetFields()
}
function statusFormat(row, column) {
  return instance.proxy.echoDictName(statusOptions.value, row.status)
}
function channelDialogHandleClose() {
  reset()
  open.value = false
}
function uploadUrl(response) {
  form.value.imgUrl = response.data
}
function checkFileSize(file) {
  if (file.size > 1048576) {
    instance.proxy.$message.error(`${file.name}文件大于1024KB，请选择小于1024KB大小的图片`)
    return false
  }
  return true
}
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateBanner(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        addBanner(form.value).then(response => {
          handleSubmitResponse(response, '新增成功')
        })
      }
    }
  })
}
function handleSubmitResponse(response, successMessage) {
  if (response.code === 200) {
    instance.proxy.$message.success(successMessage)
    open.value = false
    getList()
    reset()
  } else {
    instance.proxy.$message.error(response.msg || '操作失败')
  }
}
(() => {
  getList()
  instance.proxy.getDicts('status').then(response => {
    const {
      data
    } = response
    statusOptions.value = data
  })
})()
defineExpose({
  bannerList,
  channelDialogHandleClose,
  checkFileSize,
  dateRange,
  form,
  getList,
  handleAdd,
  handleDelete,
  handleQuery,
  handleSelectionChange,
  handleSwitchChange,
  handleUpdate,
  headers,
  ids,
  loading,
  multiple,
  open,
  queryForm,
  reset,
  resetQuery,
  rules,
  single,
  statusFormat,
  statusOptions,
  submitForm,
  title,
  total,
  uploadPath,
  uploadUrl
})
</script>
