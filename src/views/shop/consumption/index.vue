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
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="queryForm.goodsName"
            size="small"
            placeholder="请输入商品名称"
            @keyup.enter="handleQuery"
          />
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
      <el-table-column label="损耗数量" align="center" prop="goodsLossNum" width="80" />
      <el-table-column label="备注" align="center" prop="remark" width="180" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <!--          <el-button
            v-hasPermi="['system:channel:update']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>-->
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
        <el-form-item label="商品名称" prop="shopProductId" :required="true" style="text-align:left">
          <el-select v-model="form.shopProductId" filterable placeholder="请选择">
            <el-option
              v-for="item in productList"
              :key="parseInt(item.shopProductId)"
              :label="item.shopProductName"
              :value="parseInt(item.shopProductId)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="损耗数" prop="goodsLossNum" :required="true" style="text-align:left">
          <el-input v-model="form.goodsLossNum" placeholder="请输入损耗数" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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
import { listDepot, addOrUpdateShopDepot, delByIdShopDepot, getProductByOrderSn } from '@/api/shop/consumption'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const templateRefs = useTemplateRefs(instance)
const total = ref(0)
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const dateRange = ref([])
const productList = ref([])
const props = ref({
  label: 'shopProductName',
  value: 'shopProductId',
  expandTrigger: 'hover'
})
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
  orderSn: undefined,
  goodsLossNum: undefined,
  remark: undefined,
  shopProductId: undefined,
  shopProductName: undefined
})
function checkCode(rule, value, callback) {
  if (value === undefined || value === null || value === '') {
    callback(new Error('减少的库存数不能为空'))
  } else if (Number(value) <= 0) {
    callback(new Error('减少的库存数必须大于0'))
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
  shopProductName: [{
    required: true,
    message: '订单编号不能为空',
    trigger: 'blur'
  }],
  goodsLossNum: [{
    required: true,
    message: '减少的库存数',
    validator: checkCode,
    trigger: 'blur'
  }]
})
async function getCategoryList() {
  const {
    map: {
      data
    }
  } = await getProductByOrderSn()
  instance.proxy.categoryList = instance.proxy.buildTree(data, 'id', 'pid')
}
function handleCategoryChange(value) {
  instance.proxy.goods.categoryId = value[value.length - 1]
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
async function getProduct(orderSn) {
  const {
    map: {
      data
    }
  } = await getProductByOrderSn(orderSn)
  productList.value = data
  console.log(productList.value)
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.roleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd(row) {
  title.value = '添加损耗'
  open.value = true
}
async function handleUpdate(row) {
  form.value = row
  title.value = '修改损耗'
  open.value = true
  productList.value = getProduct(row.orderSn)
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
})()
defineExpose({
  channelDialogHandleClose,
  dataList,
  dateRange,
  form,
  getCategoryList,
  getList,
  getProduct,
  handleAdd,
  handleCategoryChange,
  handleDelete,
  handleQuery,
  handleSelectionChange,
  handleUpdate,
  ids,
  loading,
  multiple,
  open,
  productList,
  props,
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
