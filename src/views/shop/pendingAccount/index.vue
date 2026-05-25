<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item>
        <el-form-item label="订单编号" prop="orderSn">
          <el-input
            v-model="queryForm.orderSn"
            size="small"
            placeholder="请输入订单编号"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="用户编号" prop="userId">
          <el-input
            v-model="queryForm.userId"
            size="small"
            placeholder="请输入用户编号"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="queryForm.goodsName"
            size="small"
            placeholder="请输入商品名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="结清状态" prop="type">
          <el-select
            v-model="queryForm.type"
            placeholder="结清状态"
            clearable
            size="small"
            style="width: 120px"
          >
            <el-option
              v-for="dict in commentTypeOptions"
              :key="dict.value"
              :label="dict.name"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账单类型" prop="type">
          <el-select
            v-model="queryForm.amountType"
            placeholder="账单状态"
            clearable
            size="small"
            style="width: 120px"
          >
            <el-option
              v-for="dict in amountTypes"
              :key="dict.value"
              :label="dict.name"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
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
      <el-table-column label="编号" prop="id" width="50" />
      <el-table-column label="商品名称" prop="goodsName" width="180" />
      <el-table-column label="订单编号" prop="orderSn" width="150" />
      <el-table-column label="用户编号" align="center" prop="userId" width="80" />
      <el-table-column label="账单类型" align="center" prop="amountType" width="100">
        <template #default="scope">
          {{ scope.row.amountType === 1 ? '挂账' : '清账' }}
        </template>
      </el-table-column>
      <el-table-column label="挂账/清账金额" align="center" prop="amount" width="120" />
      <el-table-column label="是否结清" align="center" prop="isSettlement" width="120">
        <template #default="scope">
          {{ scope.row.isSettlement === 1 ? '已结清' : '未结清' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" />
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
        <el-form-item label="订单编号" prop="orderSn" :required="true" style="text-align:left">
          <el-input v-model="form.orderSn" placeholder="请输入订单编号" @blur="getProduct(form.orderSn)" />
        </el-form-item>
        <el-form-item label="用户编号" prop="userId" :required="true" style="text-align:left">
          <el-input v-model="form.userId" placeholder="请输入用户编号" />
        </el-form-item>
        <el-form-item label="账单类型" prop="amountType" :required="true" style="text-align:left">
          <el-radio-group v-model="form.amountType">
            <el-radio :label="1">挂账</el-radio>
            <el-radio :label="2">清账</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="账单金额" prop="amount" :required="true" style="text-align:left">
          <el-input v-model="form.amount" placeholder="请输入账单金额" />
        </el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="channelDialogHandleClose">取 消</el-button>
      </div></template>
    </el-dialog>
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
import { getCurrentInstance, ref } from 'vue'
import { listDepot, addOrUpdateShopDepot, delByIdShopDepot, getUserIdByOrderId } from '@/api/shop/pendingAccount'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const templateRefs = useTemplateRefs(instance)
const userId = ref(null)
const total = ref(0)
const commentTypeOptions = ref([])
const amountTypes = ref([])
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const dateRange = ref([])
const queryForm = ref({
  orderSn: '',
  userId: '',
  goodsName: '',
  pageSize: 10,
  pageNum: 1
})
const dataList = ref([])
const open = ref(false)
const form = ref({
  name: undefined,
  code: undefined,
  remark: undefined,
  amountType: 1,
  userId: ''
})
function checkCode(rule, value, callback) {
  if (!value) {
    callback(new Error('用户id不能为空'))
  } else {
    callback()
  }
}
const rules = ref({
  orderSn: [{
    required: true,
    message: '订单编号不能为空',
    trigger: 'blur'
  }],
  userId: [{
    required: true,
    message: '用户id不能为空',
    validator: checkCode,
    trigger: 'blur'
  }],
  amountType: [{
    required: true,
    message: '账单类型不能为空',
    trigger: 'blur'
  }],
  amount: [{
    required: true,
    message: '账单金额不能为空',
    trigger: 'blur'
  }]
})
async function getProduct(orderSn) {
  if (!orderSn) {
    return
  }
  const {
    map: {
      data
    }
  } = await getUserIdByOrderId(orderSn)
  form.value.userId = data
  console.log(form.value.userId)
}
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
        records: data,
        total: pageTotal
      }
    }
  } = await listDepot(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
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
  title.value = '添加账单'
  open.value = true
}
async function handleUpdate(row) {
  form.value = row
  title.value = '修改账单'
  open.value = true
}
async function handleDelete(row) {
  const channelIds = row.id
  instance.proxy.$confirm('是否确认删除该账单?', '警告', {
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
  instance.proxy.getDicts('isSettlement').then(response => {
    const {
      map: {
        data
      }
    } = response
    commentTypeOptions.value = data
  })
  instance.proxy.getDicts('amountType').then(response => {
    const {
      map: {
        data
      }
    } = response
    amountTypes.value = data
  })
})()
defineExpose({
  amountTypes,
  channelDialogHandleClose,
  commentTypeOptions,
  dataList,
  dateRange,
  form,
  getList,
  getProduct,
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
  title,
  total,
  userId
})
</script>
