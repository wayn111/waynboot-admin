<template>
  <div class="app-container">
    <el-form
      ref="queryFormRef"
      :model="queryForm"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="字典名称" prop="name">
        <el-input
          v-model="queryForm.name"
          placeholder="请输入字典名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="字典类型" prop="value">
        <el-input
          v-model="queryForm"
          placeholder="请输入字典类型"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="dictStatus">
        <el-select
          v-model="queryForm.dictStatus"
          placeholder="字典状态"
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
          v-hasPermi="['system:dict:add']"
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dict:edit']"
          type="success"
          icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dict:remove']"
          type="danger"
          icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dict:export']"
          type="warning"
          icon="Download"
          size="small"
          @click="handleExport"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="typeList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="字典编号"
        width="120"
        align="center"
        prop="dictId"
      />
      <el-table-column
        label="字典名称"
        align="center"
        prop="name"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="字典类型"
        align="center"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <router-link
            :to="'/dict/type/data/' + scope.row.value"
            class="link-type"
          >
            <span>{{ scope.row.value }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
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
            v-hasPermi="['system:dict:edit']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:dict:remove']"
            size="small"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryForm.pageNum"
      v-model:limit="queryForm.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改字典对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="dictDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="value">
          <el-input v-model="form" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="类型顺序" prop="sort">
          <el-input-number
            v-model="form.sort"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="状态" prop="dictStatus">
          <el-radio-group v-model="form.dictStatus">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{ dict.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dictDialogHandleClose">取 消</el-button>
      </div></template>
    </el-dialog>
    <Progess :percentage="percentage" v-model:progress-dialog-visible="progressDialogVisible" />
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listType, getType, delType, addType, updateType, exportType } from '@/api/system/dict/type'
import { streamDownload } from '@/utils/index'
import Progess from '@/components/Progress'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  name: 'Dict',
  components: {
    Progess
  }
})
const templateRefs = useTemplateRefs(instance)
const percentage = ref(0)
const progressDialogVisible = ref(false)
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const typeList = ref([])
const title = ref('')
const open = ref(false)
const statusOptions = ref([])
const dateRange = ref([])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  value: undefined,
  dictStatus: undefined
})
const form = ref({
  name: undefined,
  value: undefined,
  type: 1,
  dictStatus: 0,
  remark: undefined
})
const rules = ref({
  name: [{
    required: true,
    message: '字典名称不能为空',
    trigger: 'blur'
  }],
  value: [{
    required: true,
    message: '字典类型不能为空',
    trigger: 'blur'
  }],
  sort: [{
    required: true,
    message: '字典顺序不能为空',
    trigger: 'blur'
  }]
})
function getList() {
  loading.value = true
  listType(instance.proxy.addDateRange(queryForm.value, dateRange.value)).then(response => {
    const {
      data: {
        records: data,
        total: pageTotal
      }
    } = response
    typeList.value = data
    total.value = pageTotal
    loading.value = false
  })
}
function statusFormat(row, column) {
  return instance.proxy.echoDictName(statusOptions.value, row.dictStatus)
}
function dictDialogHandleClose() {
  reset()
  open.value = false
}
function reset() {
  form.value = {
    dictId: undefined,
    name: undefined,
    value: undefined,
    type: 1,
    dictStatus: 0,
    remark: undefined
  }
  templateRefs.formRef.resetFields()
}
function handleQuery() {
  queryForm.value.pageNum = 1
  getList()
}
function resetQuery() {
  dateRange.value = []
  templateRefs.queryFormRef.resetFields()
  handleQuery()
}
function handleAdd() {
  title.value = '添加字典类型'
  open.value = true
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.dictId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleUpdate(row) {
  const dictId = row.dictId || ids.value
  getType(dictId).then(response => {
    const {
      data
    } = response
    form.value = data
    open.value = true
    title.value = '修改字典类型'
  })
}
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      if (form.value.dictId !== undefined) {
        updateType(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        addType(form.value).then(response => {
          handleSubmitResponse(response, '新增成功')
        })
      }
    }
  })
}
function handleExport() {
  const that = this
  const exportQueryForm = queryForm.value
  instance.proxy.$confirm('是否确认导出所有类型数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    that.progressDialogVisible = true
    return exportType(exportQueryForm, progressEvent => {
      const process = progressEvent.loaded / progressEvent.total * 100 | 0
      const progressText = `下载进度：${process}%`
      console.log(progressText)
      that.percentage = process
    })
  }).then(res => {
    streamDownload(res)
  }).catch(function() {}).finally(() => {
    setTimeout(() => {
      that.progressDialogVisible = false
    }, 1500)
  })
}
function handleDelete(row) {
  const dictIds = row.dictId || ids.value
  instance.proxy.$confirm('是否确认删除字典编号为"' + dictIds + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delType(dictIds)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function() {})
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
  dateRange,
  dictDialogHandleClose,
  form,
  getList,
  handleAdd,
  handleDelete,
  handleExport,
  handleQuery,
  handleSelectionChange,
  handleUpdate,
  ids,
  loading,
  multiple,
  open,
  percentage,
  progressDialogVisible,
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
  typeList
})
</script>

