<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="优惠券标题" prop="title">
        <el-input v-model="queryForm.title" size="small" placeholder="请输入优惠券标题" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryForm.status" placeholder="优惠券状态" clearable size="small" style="width: 120px">
          <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.name" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:coupon:add']" type="primary" icon="Plus" size="small"
          @click="handleAdd()">新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" border :data="couponList" style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="80" />
      <el-table-column label="名称" prop="title" width="200" />
      <el-table-column label="优惠券数量" prop="num" width="100" />
      <el-table-column label="优惠金额" prop="discount" />
      <el-table-column label="最少消费金额" prop="min" width="120" />
      <el-table-column label="优惠券类型" width="120" :formatter="typeFormat" />
      <el-table-column label="状态" width="100" :formatter="statusFormat" />
      <el-table-column label="到期时间" align="center" prop="expireTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expireTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button size="small" type="text" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="small" type="text" icon="Edit" @click="handleGive(scope.row)">赠送</el-button>
          <el-button size="small" type="text" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total" :total="total" v-model:page="queryForm.pageNum" v-model:limit="queryForm.pageSize"
      @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" :close-on-click-modal="false"
      :before-close="channelDialogHandleClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="优惠券名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入优惠券名称" />
        </el-form-item>

        <el-form-item label="优惠券数量" prop="num">
          <el-input-number v-model="form.num" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="优惠金额" prop="discount">
          <el-input-number v-model="form.discount" controls-position="right" :min="0" :precision="2" :step="1" />
        </el-form-item>
        <el-form-item label="最少消费金额" prop="min">
          <el-input-number v-model="form.min" controls-position="right" :min="0" :precision="2" :step="1" />
        </el-form-item>
        <el-form-item label="优惠券类型 " prop="type">
          <el-radio-group v-model="form.type">
            <el-radio v-for="dict in typeOption" :key="dict.value" :label="parseInt(dict.value)">{{ dict.name
              }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.value" :label="parseInt(dict.value)">{{ dict.name
              }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="到期时间" prop="expireTime">
          <el-date-picker v-model="form.expireTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>

      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="channelDialogHandleClose">取 消</el-button>
      </div></template>
    </el-dialog>

    <el-dialog title="赠送优惠券" v-model="openGive" width="600px" :close-on-click-modal="false"
      :before-close="giveDialogHandleClose">
      <el-form ref="formGiveRef" :model="formGive" :rules="rulesGive" label-width="120px">
        <el-form-item label="用户id" prop="userId">
          <el-input v-model="formGive.userId" placeholder="请输入用户id" />
        </el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitFormGive">确 定</el-button>
        <el-button @click="giveDialogHandleClose">取 消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listCoupon, getCoupon, addCoupon, updateCoupon, delCoupon, giveCoupon } from '@/api/shop/coupon'
import { getToken } from '@/utils/auth'
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
  title: undefined,
  status: undefined
})
const couponList = ref([])
const open = ref(false)
const statusOptions = ref([{
  name: '下架',
  value: 0
}, {
  name: '上架',
  value: 1
}])
const form = ref({
  title: undefined,
  status: 1,
  type: 1,
  num: undefined,
  discount: null,
  min: null
})
const rules = ref({
  title: [{
    required: true,
    message: '名称不能为空',
    trigger: 'blur'
  }],
  num: [{
    required: true,
    message: '数量不能为空',
    trigger: 'blur'
  }],
  discount: [{
    required: true,
    message: '优惠金额不能为空',
    trigger: 'blur'
  }],
  min: [{
    required: true,
    message: '消费金额不能为空',
    trigger: 'blur'
  }],
  expireTime: [{
    required: true,
    message: '过期时间不能为空',
    trigger: 'blur'
  }]
})
const rulesGive = ref({
  userId: [{
    required: true,
    message: '用户id不能为空',
    trigger: 'blur'
  }]
})
const headers = ref({
  Authorization: 'Bearer ' + getToken()
})
const typeOption = ref([{
  name: '注册赠送',
  value: 1
}, {
  name: '普通使用',
  value: 2
}])
const openGive = ref(false)
const formGive = ref({
  userId: ''
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
  } = await listCoupon(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  couponList.value = data
  loading.value = false
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.roleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd(row) {
  title.value = '添加优惠券'
  open.value = true
}
async function handleUpdate(row) {
  const {
    data
  } = await getCoupon(row.id)
  form.value = data
  title.value = '修改优惠券'
  open.value = true
}
async function handleGive(row) {
  formGive.value.couponId = row.id
  openGive.value = true
}
async function handleDelete(row) {
  const channelIds = row.id || ids.value
  instance.proxy.$confirm('是否确认删除编号为 [' + channelIds + '] 的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delCoupon(channelIds)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function(e) {})
}
function reset() {
  form.value = {
    title: undefined,
    status: 1,
    num: undefined,
    discount: null,
    min: null,
    type: 1
  }
  templateRefs.formRef.resetFields()
}
function statusFormat(row, column) {
  return instance.proxy.echoDictName(statusOptions.value, row.status)
}
function typeFormat(row, column) {
  return instance.proxy.echoDictName(typeOption.value, row.type)
}
function channelDialogHandleClose() {
  reset()
  open.value = false
}
function giveDialogHandleClose() {
  formGive.value.userId = ''
  openGive.value = false
}
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateCoupon(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        addCoupon(form.value).then(response => {
          handleSubmitResponse(response, '新增成功')
        })
      }
    }
  })
}
function submitFormGive() {
  templateRefs.formGiveRef.validate(valid => {
    if (valid) {
      giveCoupon(formGive.value).then(response => {
        handleGiveResponse(response)
      })
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
function handleGiveResponse(response) {
  if (response.code === 200) {
    instance.proxy.$message.success('发放成功')
    giveDialogHandleClose()
    getList()
  } else {
    instance.proxy.$message.error(response.msg || '操作失败')
  }
}
(() => {
  getList()
})()
defineExpose({
  channelDialogHandleClose,
  couponList,
  dateRange,
  form,
  formGive,
  getList,
  giveDialogHandleClose,
  handleAdd,
  handleDelete,
  handleGive,
  handleQuery,
  handleSelectionChange,
  handleUpdate,
  headers,
  ids,
  loading,
  multiple,
  open,
  openGive,
  queryForm,
  reset,
  resetQuery,
  rules,
  rulesGive,
  single,
  statusFormat,
  statusOptions,
  submitForm,
  submitFormGive,
  title,
  total,
  typeFormat,
  typeOption
})
</script>
