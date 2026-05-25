<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="queryForm.keyword"
          size="small"
          placeholder="请输入关键字"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否默认" prop="isDefault">
        <el-select
          v-model="queryForm.isDefault"
          placeholder="是否默认"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否热门" prop="isHot">
        <el-select
          v-model="queryForm.isHot"
          placeholder="是否热门"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
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
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="keywordList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" width="50" />
      <el-table-column label="关键字" prop="keyword" width="200" />
      <el-table-column label="默认关键字" prop="isDefault">
        <template #default="scope">
          <el-tag v-if="scope.row.isDefault" type="success">是</el-tag>
          <el-tag v-else type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="热门关键字" prop="isHot">
        <template #default="scope">
          <el-tag v-if="scope.row.isHot" type="success">是</el-tag>
          <el-tag v-else type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
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

    <!-- 添加或修改栏目对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="channelDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="关键字" prop="keyword">
              <el-input v-model="form.keyword" placeholder="请输入关键字" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认搜索" prop="isDefault">
              <el-select
                v-model="form.isDefault"
                placeholder="默认搜索"
                clearable
                size="small"
              >
                <el-option label="是" :value="true" />
                <el-option label="否" :value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="热门推荐" prop="isHot">
              <el-select
                v-model="form.isHot"
                placeholder="热门推荐"
                clearable
                size="small"
              >
                <el-option label="是" :value="true" />
                <el-option label="否" :value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort">
              <el-input-number
                v-model="form.sort"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
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
import { listKeyword, getKeyword, addKeyword, updateKeyword, delKeyword } from '@/api/shop/keyword'
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
  keyword: undefined,
  isDefault: undefined,
  isHot: undefined
})
const keywordList = ref([])
const open = ref(false)
const form = ref({
  keyword: undefined,
  isHot: undefined,
  isDefault: undefined,
  sort: 0
})
const rules = ref({
  keyword: [{
    required: true,
    message: '栏目名称不能为空',
    trigger: 'blur'
  }],
  isHot: [{
    required: true,
    message: '请选择是否热门',
    trigger: 'blur'
  }],
  isDefault: [{
    required: true,
    message: '请选择是否默认',
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
    data: {
      records: data,
      total: pageTotal
    }
  } = await listKeyword(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  keywordList.value = data
  loading.value = false
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd(row) {
  title.value = '添加栏目'
  open.value = true
}
async function handleUpdate(row) {
  const keywordId = row.id || ids.value
  const {
    data
  } = await getKeyword(keywordId)
  form.value = data
  title.value = '修改栏目'
  open.value = true
}
async function handleDelete(row) {
  const keywordId = row.id || ids.value
  instance.proxy.$confirm('是否确认删除ID为 [' + keywordId + '] 的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delKeyword(keywordId)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function(e) {})
}
function reset() {
  form.value = {
    keyword: undefined,
    isHot: undefined,
    isDefault: undefined,
    sort: 0
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
        updateKeyword(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        addKeyword(form.value).then(response => {
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
  dateRange,
  form,
  getList,
  handleAdd,
  handleDelete,
  handleQuery,
  handleSelectionChange,
  handleUpdate,
  ids,
  keywordList,
  loading,
  multiple,
  open,
  queryForm,
  reset,
  resetQuery,
  rules,
  single,
  submitForm,
  title,
  total
})
</script>
