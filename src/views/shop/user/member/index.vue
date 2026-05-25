<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="会员ID" prop="id">
        <el-input
          v-model="queryForm.id"
          size="small"
          placeholder="请输入会员ID"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员昵称" prop="nickname">
        <el-input
          v-model="queryForm.nickname"
          size="small"
          placeholder="请输入会员昵称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryForm.status"
          placeholder="会员状态"
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
      :data="memberList"
      style="width: 100%"
    >
      <el-table-column label="编号" prop="id" width="120" />
      <el-table-column label="性别" prop="gender">
        <template #default="scope">
          {{ genderMap[scope.row.gender] }}
        </template>
      </el-table-column>
      <el-table-column label="昵称" prop="nickname" />
      <el-table-column label="手机号" prop="mobile" />
      <el-table-column label="头像" prop="avatar" width="200">
        <template #default="scope">
          <img v-if="scope.row.avatar" :src="scope.row.avatar" width="80">
        </template>
      </el-table-column>
      <el-table-column label="最后登陆Ip" prop="lastLoginIp" />
      <el-table-column label="最后登陆时间" prop="lastLoginTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastLoginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" :formatter="statusFormat" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:mebmer:update']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
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

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="open"
      title="用户编辑"
      width="600px"
      :close-on-click-modal="false"
      :before-close="memberDialogHandleClose"
    >
      <el-form ref="userDetailRef" :model="userDetail" :rules="rules" label-width="80px">
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="userDetail.nickname" />
        </el-form-item>
        <el-form-item label="用户手机" prop="mobile">
          <el-input v-model="userDetail.mobile" />
        </el-form-item>
        <el-form-item label="用户性别" prop="gender">
          <el-radio-group v-model="userDetail.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userDetail.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{ dict.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="memberDialogHandleClose">取消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listMember, getMember, updateMember } from '@/api/shop/user/member'
import { getToken } from '@/utils/auth'
import { uploadPath as uploadApiPath } from '@/api/upload'
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
  id: undefined,
  nickname: undefined,
  status: undefined
})
const memberList = ref([])
const open = ref(false)
const userDetail = ref({})
const rules = ref({
  nickname: [{
    required: true,
    message: '昵称不能为空',
    trigger: 'blur'
  }],
  mobile: [{
    required: true,
    message: '手机号不能为空',
    trigger: 'blur'
  }]
})
const statusOptions = ref([])
const uploadPath = ref(uploadApiPath)
const headers = ref({
  Authorization: 'Bearer ' + getToken()
})
const genderMap = ref({
  0: '未知',
  1: '男',
  2: '女'
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
  } = await listMember(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  memberList.value = data
  loading.value = false
}
function handleSwitchChange(row) {
  const text = row.status === 0 ? '启用' : '停用'
  instance.proxy.$confirm('确认要 "' + text + '"该会员吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return new Promise()
  }).then(() => {
    instance.proxy.$message.success(text + '成功')
  }).catch(function() {
    row.status = row.status === 0 ? 1 : 0
  })
}
function statusFormat(row, column) {
  return instance.proxy.echoDictName(statusOptions.value, row.status)
}
function memberDialogHandleClose() {
  reset()
  open.value = false
}
function reset() {
  userDetail.value = {}
  templateRefs.userDetailRef.resetFields()
}
async function handleUpdate(row) {
  const {
    data
  } = await getMember(row.id)
  userDetail.value = data
  open.value = true
}
function submitForm() {
  templateRefs.userDetailRef.validate(valid => {
    if (valid) {
      if (userDetail.value.id !== undefined) {
        updateMember(userDetail.value).then(response => {
          handleSubmitResponse(response, '修改成功')
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
      data
    } = response
    statusOptions.value = data
  })
})()
defineExpose({
  dateRange,
  genderMap,
  getList,
  handleQuery,
  handleSwitchChange,
  handleUpdate,
  headers,
  ids,
  loading,
  memberDialogHandleClose,
  memberList,
  multiple,
  open,
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
  uploadPath,
  userDetail
})
</script>
<style lang="scss" scoped>
</style>
