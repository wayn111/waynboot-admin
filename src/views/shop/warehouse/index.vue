<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="仓库名称" prop="depotName">
        <el-input
          v-model="queryForm.depotName"
          size="small"
          placeholder="请输入仓库名称"
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
          v-hasPermi="['system:channel:add']"
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
      :data="dataList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="120" />
      <el-table-column label="仓库名称" prop="depotName" width="200" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:channel:update']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:channel:delete']"
            size="small"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改栏目对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="channelDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="仓库名称" prop="depotName">
          <el-input v-model="form.depotName" placeholder="请输入仓库名称" />
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
import { listDepot, addOrUpdateShopDepot, delByIdShopDepot } from '@/api/shop/warehouse'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const dateRange = ref([])
const queryForm = ref({
  depotName: ''
})
const dataList = ref([])
const open = ref(false)
const form = ref({
  name: undefined,
  code: undefined,
  remark: undefined
})
function checkCode(rule, value, callback) {
  if (!value) {
    callback(new Error('编码不能为空'))
  } else {
    callback()
  }
}
const rules = ref({
  depotName: [{
    required: true,
    message: '仓库名称不能为空',
    trigger: 'blur'
  }],
  code: [{
    required: true,
    validator: checkCode,
    trigger: 'blur'
  }]
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
    map: {
      page: {
        records: data
      }
    }
  } = await listDepot(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  dataList.value = data
  console.log(dataList.value)
  loading.value = false
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.roleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd(row) {
  title.value = '添加栏目'
  open.value = true
}
async function handleUpdate(row) {
  form.value = row
  title.value = '修改栏目'
  open.value = true
}
async function handleDelete(row) {
  const channelIds = row.id
  instance.proxy.$confirm('是否确认删除该仓库?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delByIdShopDepot({
      id: channelIds
    })
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function(e) {})
}
function reset() {
  form.value = {
    name: undefined,
    code: undefined,
    remark: undefined
  }
  templateRefs.formRef.resetFields()
}
function channelDialogHandleClose() {
  reset()
  open.value = false
}
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        addOrUpdateShopDepot(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        addOrUpdateShopDepot(form.value).then(response => {
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
  channelDialogHandleClose,
  dataList,
  dateRange,
  form,
  getList,
  handleAdd,
  handleDelete,
  handleQuery,
  handleSelectionChange,
  handleUpdate,
  ids,
  loading,
  multiple,
  open,
  queryForm,
  reset,
  resetQuery,
  rules,
  single,
  submitForm,
  title
})
</script>
