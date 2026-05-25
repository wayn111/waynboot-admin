<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="会员ID" prop="memberId">
        <el-input
          v-model="queryForm.memberId"
          size="small"
          placeholder="请输入会员ID"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入会员名称"
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
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="Plus" size="small" @click="handleAdd()">新增</el-button>
      </el-col>
    </el-row> -->

    <el-table
      v-loading="loading"
      border
      :data="addressList"
      style="width: 100%"
    >
      <el-table-column label="编号" prop="id" width="120" />
      <el-table-column label="用户ID" prop="memberId" />
      <el-table-column label="用户名称" prop="name" />
      <el-table-column label="手机号" prop="tel" />
      <el-table-column label="省份" prop="province" />
      <el-table-column label="城市" prop="city" />
      <el-table-column label="区县" prop="county" />
      <el-table-column label="地址详情" prop="addressDetail" />
      <el-table-column label="城市ID" prop="areaCode" />
      <el-table-column label="邮编" prop="postalCode" />
      <el-table-column label="区县" prop="county" />
      <el-table-column label="是否默认">
        <template #default="scope">
          <span>{{ scope.row.isDefault? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
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
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listAddress } from '@/api/shop/user/address'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const total = ref(0)
const dateRange = ref([])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  id: undefined,
  name: undefined
})
const addressList = ref([])
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
  } = await listAddress(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  addressList.value = data
  loading.value = false
}
(() => {
  getList()
})()
defineExpose({
  addressList,
  dateRange,
  getList,
  handleQuery,
  loading,
  queryForm,
  resetQuery,
  total
})
</script>
