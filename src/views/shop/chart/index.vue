<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="一级分类名称" prop="name">
        <el-input
          v-model="queryForm.categoryName"
          size="small"
          placeholder="请输入分类名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="dateArr"
          type="daterange"
          align="right"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          size="small"
          :default-value="defaultDateRange"
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
      row-key="id"
      :default-expand-all="false"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label=" 分类名称" prop="name" />
      <el-table-column label="销售数量" prop="num" />
      <el-table-column label="销售额(元)" prop="price" />
      <el-table-column label="销售成本(元)" prop="costPrice" />
      <el-table-column label="利润(元)" prop="profit" />
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
import { financialStatements } from '@/api/shop/chart'
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
  categoryName: '',
  startTime: '',
  endTime: '',
  pageSize: 10,
  pageNum: 1
})
const dataList = ref([])
const defaultDateRange = ref(['2024-04-01',
// 开始日期
  '2024-04-30'])
const open = ref(false)
const form = ref({
  categoryName: undefined
})
const rules = ref({
  mame: [{
    required: true,
    message: ' 分类名称不能为空',
    trigger: 'blur'
  }]
})
function getSummaries(param) {
  const {
    columns,
    data
  } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '总计'
      return
    } else if (index === 1) {
      sums[index] = ''
    }
    const values = data.map(item => Number(item[column.property]))
    if (!values.every(value => isNaN(value))) {
      sums[index] = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0)
      sums[index] += ''
    } else {
      sums[index] = ''
    }
  })
  return sums
}
function getDefaultDate() {
  const start = new Date()
  start.setDate(1) // 设置为本月第一天
  const end = new Date(start)
  end.setMonth(start.getMonth() + 1)
  end.setDate(0) // 设置为本月最后一天
  // 格式化日期为 yyyy-MM-dd
  const formattedStartDate = formatDate(start)
  const formattedEndDate = formatDate(end)
  dateArr.value = [formattedStartDate, formattedEndDate]
  defaultDateRange.value = [start, end]
  console.log(defaultDateRange.value, 'this.defaultDateRange')
}
function handleQuery() {
  getList()
}
function resetQuery() {
  // this.getDefaultDate()
  templateRefs.queryFormRef.resetFields()
  queryForm.value.categoryName = ''
  dateArr.value = []
  handleQuery()
}
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始，所以需要加1，然后补零
  const day = String(date.getDate()).padStart(2, '0') // 补零
  return `${year}-${month}-${day}`
}
async function getList() {
  queryForm.value.startTime = dateArr.value.length ? dateArr.value[0] : ''
  queryForm.value.endTime = dateArr.value.length ? dateArr.value[1] : ''
  const {
    map: {
      page: {
        total: pageTotal,
        records: data
      }
    }
  } = await financialStatements(queryForm.value)
  dataList.value = transformData(data)
  total.value = pageTotal
  loading.value = false
}
function transformData(data) {
  // 如果传入的数据为空或者不是对象，则直接返回
  if (!data || typeof data !== 'object') {
    return data
  }
  // 如果数据是数组，则对数组中的每个元素进行转换
  if (Array.isArray(data)) {
    return data.map(item => transformData(item))
  }
  // 如果数据是对象，则进行转换
  const {
    secondFinancialStatementsVOList,
    goodsFinancialStatementsVOS,
    ...rest
  } = data
  if (secondFinancialStatementsVOList && Array.isArray(secondFinancialStatementsVOList)) {
    const children = secondFinancialStatementsVOList.map(item => transformData({
      ...item
    }))
    return {
      children,
      ...rest
    }
  }
  if (goodsFinancialStatementsVOS && Array.isArray(goodsFinancialStatementsVOS)) {
    const children = goodsFinancialStatementsVOS.map(item => transformData({
      ...item
    }))
    return {
      children,
      ...rest
    }
  }
  return data
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.roleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function reset() {
  form.value = {
    categoryName: undefined,
    code: undefined,
    remark: undefined
  }
  templateRefs['form'].resetFields()
}
(() => {
  getDefaultDate()
  getList()
})()
defineExpose({
  dataList,
  dateArr,
  dateRange,
  defaultDateRange,
  form,
  formatDate,
  getDefaultDate,
  getList,
  getSummaries,
  handleQuery,
  handleSelectionChange,
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
  total,
  transformData
})
</script>
