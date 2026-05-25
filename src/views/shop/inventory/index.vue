<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入商品名称"
          @keyup.enter="handleQuerc"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      border
      :data="dataList"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品ID" prop="goodsId" width="200" />
      <el-table-column label="商品名称" prop="name" width="200" />
      <el-table-column label="商品规格" prop="specifications" width="200" />
      <el-table-column label="商品成本" prop="costPrice" />
      <el-table-column label="商品售价" prop="price" />
      <el-table-column label="商品库存" prop="num" />
      <el-table-column label="仓库总库存" prop="depotNum" />
    </el-table>
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
import { goodsProduct } from '@/api/shop/inventory'
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
const queryForm = ref({
  name: undefined,
  pageNum: 1,
  pageSize: 10
})
const dataList = ref([])
const open = ref(false)
const form = ref({
  name: undefined,
  pageNum: 1,
  pageSize: 10
})
const rules = ref({
  name: [{
    required: true,
    message: '商品名称不能为空',
    trigger: 'blur'
  }]
})
function handleQuery() {
  getList()
}
function resetQuery() {
  templateRefs.queryFormRef.resetFields()
  handleQuery()
}
async function getList() {
  const {
    map: {
      page: {
        records,
        total: pageTotal
      }
    }
  } = await goodsProduct(queryForm.value)
  dataList.value = records
  total.value = pageTotal
  loading.value = false
}
function reset() {
  form.value = {
    name: undefined
  }
  templateRefs['form'].resetFields()
}
(() => {
  getList()
})()
defineExpose({
  dataList,
  dateRange,
  form,
  getList,
  handleQuery,
  ids,
  loading,
  multiple,
  open,
  queryForm,
  reset,
  resetQuery,
  rules,
  single,
  title,
  total
})
</script>
