<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="deptName"
            placeholder="请输入部门名称"
            clearable
            size="small"
            prefix-icon="Search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            ref="tree"
            :data="deptOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form ref="queryFormRef" :model="queryForm" :inline="true" label-width="68px">
          <el-form-item label="用户名称" prop="userName">
            <el-input
              v-model="queryForm.userName"
              placeholder="请输入用户名称"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phone">
            <el-input
              v-model="queryForm.phone"
              placeholder="请输入手机号码"
              clearable
              size="small"
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="userStatus">
            <el-select
              v-model="queryForm.userStatus"
              placeholder="用户状态"
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

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:add']"
              type="primary"
              icon="Plus"
              size="small"
              @click="handleAdd"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:update']"
              type="success"
              icon="Edit"
              size="small"
              :disabled="single"
              @click="handleUpdate"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:delete']"
              type="danger"
              icon="Delete"
              size="small"
              :disabled="multiple"
              @click="handleDelete"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:import']"
              type="info"
              icon="Upload"
              size="small"
              @click="handleImport"
            >导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:export']"
              type="warning"
              icon="Download"
              size="small"
              @click="handleExport"
            >导出</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" border :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="45" align="center" />
          <el-table-column label="用户编号" align="center" prop="userId" />
          <el-table-column
            label="用户名称"
            align="center"
            prop="userName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="用户昵称"
            align="center"
            prop="nickName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="部门"
            align="center"
            prop="sysDept.deptName"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="手机号码" align="center" prop="phone" width="120" />
          <el-table-column label="状态" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.userStatus"
                :active-value="0"
                :inactive-value="1"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="handleSwitchChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="160">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="180"
            class-name="small-padding fixed-width"
          >
            <template #default="scope">
              <el-button
                v-hasPermi="['system:user:update']"
                size="small"
                type="text"
                icon="Edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                v-if="scope.row.userId !== 1"
                v-hasPermi="['system:user:delete']"
                size="small"
                type="text"
                icon="Delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
              <el-button
                v-hasPermi="['system:user:resetPwd']"
                size="small"
                type="text"
                icon="Key"
                @click="handleResetPwd(scope.row)"
              >重置</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryForm.pageNum"
          v-model:limit="queryForm.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="userDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <Treeselect v-model="form.deptId" :options="deptOptions" placeholder="请选择归属部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option label="男" :value="0" />
                <el-option label="女" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.userStatus">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.value"
                  :label="parseInt(dict.value)"
                >{{ dict.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.roleStatus == 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="userDialogHandleClose">取 消</el-button>
      </div></template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px">
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon><Upload /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
          </div>
          <div class="el-upload__tip" style="color:red">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
        </template>
      </el-upload>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div></template>
    </el-dialog>
    <Progess :percentage="percentage" v-model:progress-dialog-visible="progressDialogVisible" />
  </div>
</template>
<script setup>
import { getCurrentInstance, ref, watch } from 'vue'
import { listUser, getUser, delUser, addUser, updateUser, exportUser, resetUserPwd, changeUserStatus } from '@/api/system/user'
import { getToken } from '@/utils/auth'
import { streamDownload } from '@/utils/index'
import { treeselect as deptTreeselect } from '@/api/system/dept'
import Treeselect from '@zanmato/vue3-treeselect'
import Progess from '@/components/Progress'
// import the styles
import '@zanmato/vue3-treeselect/dist/vue3-treeselect.min.css'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  components: {
    Treeselect,
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
const title = ref('')
const open = ref(false)
const statusOptions = ref([])
const deptName = ref('')
const initPassword = ref('123456')
const dateRange = ref([])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  userName: undefined,
  phone: undefined,
  userStatus: undefined,
  deptId: undefined
})
const userList = ref([])
const total = ref(0)
const deptOptions = ref([])
const roleOptions = ref([])
const form = ref({
  userId: undefined,
  deptId: undefined,
  userName: undefined,
  nickName: undefined,
  password: undefined,
  phone: undefined,
  email: undefined,
  sex: undefined,
  userStatus: 0,
  remark: undefined,
  postIds: [],
  roleIds: []
})
const rules = ref({
  userName: [{
    required: true,
    message: '用户名称不能为空',
    trigger: 'blur'
  }],
  nickName: [{
    required: true,
    message: '用户昵称不能为空',
    trigger: 'blur'
  }],
  deptId: [{
    required: true,
    message: '归属部门不能为空',
    trigger: 'blur'
  }],
  password: [{
    required: true,
    message: '用户密码不能为空',
    trigger: 'blur'
  }],
  email: [{
    required: true,
    message: '邮箱地址不能为空',
    trigger: 'blur'
  }, {
    type: 'email',
    message: "'请输入正确的邮箱地址",
    trigger: ['blur', 'change']
  }],
  phone: [{
    required: true,
    message: '手机号码不能为空',
    trigger: 'blur'
  }, {
    pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
    message: '请输入正确的手机号码',
    trigger: 'blur'
  }]
})
const defaultProps = ref({
  children: 'children',
  label: 'label'
})
const upload = ref({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  // 设置上传的请求头部
  headers: {
    Authorization: getToken()
  },
  // 上传的地址
  url: `${import.meta.env.VITE_APP_BASE_API}/system/user/importData`
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
  loading.value = true
  const {
    data: {
      records: data,
      total: pageTotal
    }
  } = await listUser(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  userList.value = data
  loading.value = false
}
async function getTreeselect() {
  const {
    data
  } = await deptTreeselect()
  deptOptions.value = data
}
function filterNode(value, data) {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
function handleNodeClick(data) {
  queryForm.value.deptId = data.id
  getList()
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleSwitchChange(row) {
  const text = row.userStatus === 0 ? '启用' : '停用'
  instance.proxy.$confirm('确认要 "' + text + '" "' + row.userName + '用户吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return changeUserStatus(row.userId, row.userStatus)
  }).then(() => {
    instance.proxy.$message.success(text + '成功')
  }).catch(function() {
    row.userStatus = row.userStatus === 0 ? 1 : 0
  })
}
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phone: undefined,
    email: undefined,
    sex: undefined,
    userStatus: 0,
    remark: undefined,
    postIds: [],
    roleIds: []
  }
  templateRefs.formRef?.resetFields?.()
}
function userDialogHandleClose() {
  reset()
  open.value = false
}
async function handleAdd() {
  reset()
  await getTreeselect()
  const {
    data: {
      roles
    }
  } = await getUser()
  roleOptions.value = roles || []
  title.value = '添加用户'
  form.value.password = initPassword.value
  open.value = true
}
function normalizeUserForm(user) {
  return {
    ...user,
    deptId: user?.deptId ?? user?.sysDept?.deptId ?? user?.dept?.deptId,
    postIds: user?.postIds || [],
    roleIds: user?.roleIds || []
  }
}
async function handleUpdate(row) {
  await getTreeselect()
  const userId = row.userId || ids.value
  const {
    data: {
      user,
      roles,
      roleIds
    }
  } = await getUser(userId)
  form.value = normalizeUserForm(user)
  roleOptions.value = roles || []
  form.value.roleIds = roleIds || []
  title.value = '修改用户'
  form.value.password = undefined
  open.value = true
}
function handleDelete(row) {
  const userIds = row.userId || ids.value
  instance.proxy.$confirm('是否确认删除用户编号为"' + userIds + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delUser(userIds)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function() {})
}
function handleResetPwd(row) {
  instance.proxy.$prompt('请输入"' + row.userName + '"的新密码', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\w{6,}/,
    inputErrorMessage: '密码格式不正确'
  }).then(({
    value
  }) => {
    resetUserPwd(row.userId, value).then(response => {
      if (response.code === 200) {
        instance.proxy.$message.success('修改成功，新密码是：' + value)
      } else {
        instance.proxy.$message.error(response.msg)
      }
    })
  }).catch(() => {})
}
function handleExport() {
  const that = this
  const queryForm = instance.proxy.addDateRange(queryForm.value, dateRange.value)
  instance.proxy.$confirm('是否确认导出所有用户数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    that.progressDialogVisible = true
    return exportUser(queryForm, progressEvent => {
      const process = progressEvent.loaded / progressEvent.total * 100 | 0
      const progressText = `下载进度：${process}%`
      console.log(progressText)
      that.percentage = process
    })
  }).then(res => {
    streamDownload(res)
  }).catch(function(e) {
    console.log(e)
  }).finally(() => {
    setTimeout(() => {
      that.progressDialogVisible = false
    }, 1500)
  })
}
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      if (form.value.userId !== undefined) {
        updateUser(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        addUser(form.value).then(response => {
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
function handleImport() {
  upload.value.title = '用户导入'
  upload.value.open = true
}
function importTemplate() {
  instance.proxy.downloadTemplate('用户列表.xls')
}
function handleFileUploadProgress(event, file, fileList) {
  upload.value.isUploading = true
}
function handleFileSuccess(response, file, fileList) {
  upload.value.open = false
  upload.value.isUploading = false
  templateRefs.uploadRef.clearFiles()
  instance.proxy.$alert('导入用户数据成功', '导入结果', {
    dangerouslyUseHTMLString: true
  })
  getList()
}
function submitFileForm() {
  templateRefs.uploadRef.submit()
}
watch(deptName, val => {
  templateRefs.tree.filter(val)
})
;(() => {
  getTreeselect()
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
  defaultProps,
  deptName,
  deptOptions,
  filterNode,
  form,
  getList,
  getTreeselect,
  handleAdd,
  handleDelete,
  handleExport,
  handleFileSuccess,
  handleFileUploadProgress,
  handleImport,
  handleNodeClick,
  handleQuery,
  handleResetPwd,
  handleSelectionChange,
  handleSwitchChange,
  handleUpdate,
  ids,
  importTemplate,
  initPassword,
  loading,
  multiple,
  open,
  percentage,
  progressDialogVisible,
  queryForm,
  reset,
  resetQuery,
  roleOptions,
  rules,
  single,
  statusOptions,
  submitFileForm,
  submitForm,
  title,
  total,
  upload,
  userDialogHandleClose,
  userList
})
</script>

