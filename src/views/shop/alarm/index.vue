<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="商品名称" prop="depotName">
        <el-input
          v-model="queryForm.name"
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
    <el-table
      v-loading="loading"
      border
      :data="dataList"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品名称" prop="name" />
      <el-table-column label="商品规格" prop="specifications" />
      <el-table-column label="当前库存" prop="num" />
      <el-table-column label="商品价格(元)" prop="price" />
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
import { getWarmingShop } from '@/api/shop/warehouse'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const templateRefs = useTemplateRefs(instance)
const dateArr = ref([])
const total = ref(0)
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const dateRange = ref([])
const queryForm = ref({
  name: '',
  pageSize: 10,
  pageNum: 1
})
const dataList = ref([])
const open = ref(false)
const form = ref({
  name: undefined
})
const rules = ref({
  mame: [{
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
  queryForm.value.name = ''
  dateArr.value = []
  handleQuery()
}
async function getList() {
  const {
    map: {
      data
    }
  } = await getWarmingShop(queryForm.value)
  dataList.value = data
  console.log(dataList.value)
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
  dateArr,
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
