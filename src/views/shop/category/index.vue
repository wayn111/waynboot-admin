<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="分类ID" prop="id">
        <el-input
          v-model="queryForm.id"
          size="small"
          placeholder="请输入分类ID"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入分类名称"
          @keyup.enter="handleQuery"
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
          v-hasPermi="['system:category:add']"
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="categoryList"
      row-key="id"
      :default-expand-all="false"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column align="center" label="类目ID" prop="id" />
      <el-table-column align="center" label="类目名" prop="name" />
      <el-table-column align="center" property="iconUrl" label="图标图片">
        <template #default="scope">
          <img v-if="scope.row.iconUrl" :src="scope.row.iconUrl" width="40">
        </template>
      </el-table-column>
      <el-table-column align="center" label="关键字" prop="keywords" />
      <el-table-column align="center" label="排序" prop="sort" />
      <el-table-column align="center" min-width="100" label="简介" prop="desc" />
      <el-table-column align="center" label="级别" prop="level">
        <template #default="scope">
          <el-tag
            :type="scope.row.level === 'L1' ? 'primary' : 'info' "
          >{{ scope.row.level === 'L1' ? '一级类目' : '二级类目' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-if="scope.row.level == 'L1'"
            v-hasPermi="['system:category:add']"
            size="small"
            type="text"
            icon="Plus"
            @click="handleAdd(scope.row)"
          >添加</el-button>
          <el-button
            v-hasPermi="['system:category:update']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:category:delete']"
            size="small"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改分类对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="categoryDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="small">
        <el-form-item label="标题" prop="name">
          <el-input v-model="form.name" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="上级分类">
          <treeselect
            v-model="form.pid"
            :options="categoryOptions"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="选择上级分类"
          />
        </el-form-item>
        <el-form-item label="关键字" prop="keywords">
          <el-input v-model="form.keywords" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="简介" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="图标图片" prop="iconUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadIconUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png"
          >
            <img v-if="form.iconUrl" :src="form.iconUrl" class="avatar">
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <template #tip><div class="el-upload__tip">只能上传jpg、jpeg、png文件，120 x 120</div></template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="categoryDialogHandleClose">取 消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listCategory, getCategory, addCategory, updateCategory, delCategory } from '@/api/shop/category'
import Treeselect from '@zanmato/vue3-treeselect'
// import the styles
import '@zanmato/vue3-treeselect/dist/vue3-treeselect.min.css'
import { getToken } from '@/utils/auth'
import { uploadPath as uploadApiPath } from '@/api/upload'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  components: {
    Treeselect
  }
})
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const title = ref('')
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  id: undefined,
  name: undefined
})
const categoryList = ref([])
const categoryOptions = ref([])
const open = ref(false)
const form = ref({
  id: undefined,
  sort: undefined,
  name: '',
  keywords: '',
  level: 'L2',
  pid: 0,
  desc: '',
  iconUrl: '',
  picUrl: ''
})
const rules = ref({
  name: [{
    required: true,
    message: '标题不能为空',
    trigger: 'blur'
  }],
  iconUrl: [{
    required: true,
    message: '图标不能为空',
    trigger: 'blur'
  }],
  sort: [{
    required: true,
    message: '排序不能为空',
    trigger: 'blur'
  }],
  picUrl: [{
    required: true,
    message: '图片不能为空',
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
  instance.proxy.dateRange = []
  handleQuery()
}
async function getList() {
  const {
    data
  } = await listCategory(queryForm.value)
  categoryList.value = instance.proxy.buildTree(data, 'id', 'pid')
  loading.value = false
}
function handleAdd(row) {
  getTreeselect()
  if (!row) {
    row.id = 0
  }
  title.value = '添加分类'
  open.value = true
  form.value.pid = row.id || 0
}
async function handleUpdate(row) {
  getTreeselect()
  const {
    data
  } = await getCategory(row.id)
  form.value = data
  title.value = '修改分类'
  open.value = true
}
async function handleDelete(row) {
  const ids = row.id || instance.proxy.ids
  instance.proxy.$confirm('是否确认删除编号为 [' + ids + '] 的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delCategory(ids)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function(e) {})
}
async function getTreeselect() {
  const {
    data
  } = await listCategory()
  categoryOptions.value = []
  const category = {
    id: 0,
    name: '主类目',
    children: []
  }
  const l1Data = data.filter(item => {
    return item.level === 'L1'
  })
  category.children = instance.proxy.buildTree(l1Data, 'id', 'pid')
  categoryOptions.value.push(category)
}
function normalizer(node) {
  if (node.children && !node.children.length) {
    delete node.children
  }
  return {
    id: node.id,
    label: node.name,
    children: node.children
  }
}
function reset() {
  form.value = {
    id: undefined,
    sort: undefined,
    name: '',
    keywords: '',
    level: 'L1',
    pid: 0,
    desc: '',
    iconUrl: '',
    picUrl: ''
  }
  templateRefs.formRef.resetFields()
}
function categoryDialogHandleClose() {
  reset()
  open.value = false
}
function uploadIconUrl(response) {
  form.value.iconUrl = response.data
}
function uploadPicUrl(response) {
  form.value.picUrl = response.data
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
        updateCategory(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        // 分类pid为0时，为一级分类
        if (form.value.pid === 0) {
          form.value.level = 'L1'
        } else {
          form.value.level = 'L2'
        }
        addCategory(form.value).then(response => {
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
})()
defineExpose({
  categoryDialogHandleClose,
  categoryList,
  categoryOptions,
  checkFileSize,
  form,
  getList,
  getTreeselect,
  handleAdd,
  handleDelete,
  handleQuery,
  handleUpdate,
  headers,
  loading,
  normalizer,
  open,
  queryForm,
  reset,
  resetQuery,
  rules,
  submitForm,
  title,
  uploadIconUrl,
  uploadPath,
  uploadPicUrl
})
</script>
<style lang="scss" scoped>
.avatar-uploader {
  .avatar-uploader-icon {
    font-size: 18px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
  }
}
</style>
