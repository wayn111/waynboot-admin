<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="栏目名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入栏目名称"
          @keyup.enter="handleQuery"
        />
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
      :data="columnList"
      style="width: 100%"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="120" />
      <el-table-column label="栏目名称" prop="name" />
      <el-table-column label="关联商品数" prop="goodsNum" />
      <el-table-column label="排序" prop="sort" sortable="custom" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        sortable="custom"
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
            size="small"
            type="text"
            icon="Expand"
            @click="handleGoodsConfig(scope.row)"
          >配置</el-button>
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

    <!-- 栏目添加/修改单窗 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="40%"
      :close-on-click-modal="false"
      :before-close="columnDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="栏目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入栏目名称" />
        </el-form-item>
        <el-form-item label="栏目顺序" prop="sort">
          <el-input-number
            v-model="form.sort"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
      </el-form>
      <template #footer><span class="dialog-footer">
        <el-button @click="columnDialogHandleClose">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span></template>
    </el-dialog>

    <!-- 商品配置弹窗 -->
    <el-dialog
      title="商品配置"
      :close-on-click-modal="false"
      v-model="goodsOpen"
      top="1vh"
      width="70%"
    >
      <goods-config :column-id="columnId" />
      <template #footer><span class="dialog-footer">
        <el-button @click="goodsOpen = false">关 闭</el-button>
      </span></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listColumn, getColumn, addColumn, updateColumn, delColumn } from '@/api/shop/column'
import GoodsConfig from './goodsConfig.vue'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  components: {
    GoodsConfig
  }
})
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const ids = ref([])
const columnId = ref(undefined)
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
const columnList = ref([])
const open = ref(false)
const goodsOpen = ref(false)
const statusOptions = ref([])
const form = ref({
  name: undefined,
  sort: 0
})
const rules = ref({
  name: [{
    required: true,
    message: '名称不能为空',
    trigger: 'blur'
  }],
  sort: [{
    required: true,
    message: '排序不能为空',
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
  } = await listColumn(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  columnList.value = data
  loading.value = false
}
function handleSortChange(sort) {
  queryForm.value.sortName = sort.prop
  queryForm.value.sortOrder = sort.order
  getList()
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
function handleGoodsConfig(row) {
  columnId.value = row.id
  goodsOpen.value = true
}
async function handleUpdate(row) {
  const columnId = row.id || ids.value
  const {
    data
  } = await getColumn(columnId)
  form.value = data
  title.value = '修改栏目'
  open.value = true
}
async function handleDelete(row) {
  const columnIds = row.id || ids.value
  instance.proxy.$confirm('是否确认删除栏目编号为 [' + columnIds + '] 的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delColumn(columnIds)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function(e) {})
}
function columnDialogHandleClose() {
  reset()
  open.value = false
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
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateColumn(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        addColumn(form.value).then(response => {
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
      data: {
        data
      }
    } = response
    statusOptions.value = data
  })
})()
defineExpose({
  columnDialogHandleClose,
  columnId,
  columnList,
  dateRange,
  form,
  getList,
  goodsOpen,
  handleAdd,
  handleDelete,
  handleGoodsConfig,
  handleQuery,
  handleSelectionChange,
  handleSortChange,
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
  statusOptions,
  submitForm,
  title,
  total
})
</script>
<style lang="scss" scoped>
</style>
