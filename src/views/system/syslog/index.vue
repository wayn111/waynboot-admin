<template>
  <div class="app-container">
    <el-form
      ref="queryFormRef"
      :model="queryForm"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="用户名称" prop="name">
        <el-input
          v-model="queryForm.userName"
          placeholder="请输入用户名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="菜单名称" prop="value">
        <el-input
          v-model="queryForm.moduleName"
          placeholder="请输入菜单名称"
          clearable
          size="small"
          style="width: 240px"
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

    <el-table
      v-loading="loading"
      border
      :data="typeList"
    >
      <el-table-column
        label="编号"
        width="120"
        align="center"
        prop="id"
      />
      <el-table-column
        label="用户名称"
        align="center"
        prop="userName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="菜单名称"
        align="center"
        prop="moduleName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="请求方法"
        align="center"
        :show-overflow-tooltip="true"
        prop="method"
      />
      <el-table-column
        label="请求路径"
        :show-overflow-tooltip="true"
        align="center"
        prop="url"
      />
      <el-table-column
        label="请求参数"
        align="center"
        :show-overflow-tooltip="true"
        prop="requestParams"
      />
      <el-table-column
        label="请求ip"
        align="center"
        prop="ip"
      />
      <el-table-column
        label="执行时间/毫秒"
        align="center"
        prop="executeTime"
      />
      <el-table-column
        label="错误信息"
        align="center"
        prop="errorMsg"
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
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryForm.pageNum"
      v-model:limit="queryForm.pageSize"
      @pagination="getList"
    />
    <Progess :percentage="percentage" v-model:progress-dialog-visible="progressDialogVisible" />
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listLog } from '@/api/system/syslog'
import Progess from '@/components/Progress'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  name: 'SysLog',
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
const dateRange = ref([])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  userName: undefined,
  moduleName: undefined
})
function getList() {
  loading.value = true
  listLog(instance.proxy.addDateRange(queryForm.value, dateRange.value)).then(response => {
    const {
      map: {
        page: {
          records: data,
          total: pageTotal
        }
      }
    } = response
    typeList.value = data
    total.value = pageTotal
    loading.value = false
  })
}
function handleQuery() {
  queryForm.value.pageNum = 1
  getList()
}
function resetQuery() {
  dateRange.value = []
  templateRefs.queryFormRef.resetFields()
  queryForm.value.userName = ''
  queryForm.value.moduleName = ''
  handleQuery()
}
(() => {
  getList()
})()
defineExpose({
  dateRange,
  getList,
  handleQuery,
  ids,
  loading,
  multiple,
  percentage,
  progressDialogVisible,
  queryForm,
  resetQuery,
  single,
  total,
  typeList
})
</script>

