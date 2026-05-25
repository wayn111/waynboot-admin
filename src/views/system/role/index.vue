<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="queryForm.roleName"
          size="small"
          placeholder="请输入角色名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="queryForm.roleKey"
          size="small"
          placeholder="请输入权限字符"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="roleStatus">
        <el-select
          v-model="queryForm.roleStatus"
          placeholder="角色状态"
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
          v-hasPermi="['system:role:add']"
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:role:update']"
          type="success"
          icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:role:delete']"
          type="danger"
          icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:role:export']"
          type="warning"
          icon="Download"
          size="small"
          @click="handleExport"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="roleList"
      style="width: 100%"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色编号" prop="roleId" width="120" />
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
      <el-table-column
        label="权限字符"
        prop="roleKey"
        sortable="custom"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="显示顺序"
        sortable="custom"
        prop="sort"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.roleStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="0"
            :inactive-value="1"
            @change="handleSwitchChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:role:update']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:role:delete']"
            size="small"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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

    <el-dialog
      :title="title"
      v-model="open"
      width="30%"
      :close-on-click-modal="false"
      :before-close="roleDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuRef"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            empty-text="加载中，请稍后"
            :props="defaultProps"
          />
        </el-form-item>
        <el-form-item label="状态" prop="roleStatus">
          <el-radio-group v-model="form.roleStatus">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{ dict.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer><span class="dialog-footer">
        <el-button @click="roleDialogHandleClose">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span></template>
    </el-dialog>
    <Progess :percentage="percentage" v-model:progress-dialog-visible="progressDialogVisible" />
  </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, ref } from 'vue'
import { listRole, addRole, updateRole, delRole, getRole, exportRole, changeRoleStatus } from '@/api/system/role'
import { treeselect as menuTreeselect, roleMenuTreeselect } from '@/api/system/menu'
import { streamDownload } from '@/utils/index'
import Progess from '@/components/Progress'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
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
const title = ref('')
const dateRange = ref([])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  roleKey: '',
  roleStatus: undefined
})
const total = ref(0)
const form = ref({
  roleName: '',
  roleKey: '',
  roleStatus: 0,
  sort: 0,
  remark: ''
})
const roleList = ref([])
const open = ref(false)
const statusOptions = ref([])
const rules = ref({
  roleName: [{
    required: true,
    message: '角色名称不能为空',
    trigger: 'blur'
  }],
  roleKey: [{
    required: true,
    message: '权限字符不能为空',
    trigger: 'blur'
  }],
  sort: [{
    required: true,
    message: '角色顺序不能为空',
    trigger: 'blur'
  }]
})
const menuOptions = ref([])
const defaultProps = ref({
  children: 'children',
  label: 'label'
})
function handleQuery() {
  queryForm.value.pageNum = 1
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
  } = await listRole(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  roleList.value = data
  loading.value = false
}
function handleSortChange(sort) {
  queryForm.value.sortName = sort.prop
  queryForm.value.sortOrder = sort.order
  getList()
}
function handleSwitchChange(row) {
  const text = row.roleStatus === 0 ? '启用' : '停用'
  instance.proxy.$confirm('确认要 "' + text + '" "' + row.roleName + '"角色吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return changeRoleStatus(row.roleId, row.roleStatus)
  }).then(() => {
    instance.proxy.$message.success(text + '成功')
  }).catch(function() {
    row.roleStatus = row.roleStatus === 0 ? 1 : 0
  })
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.roleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd() {
  getMenuTreeselect()
  title.value = '添加角色'
  open.value = true
}
async function handleUpdate(row) {
  const roleId = row.roleId || ids.value
  nextTick(() => {
    getRoleMenuTreeselect(roleId)
  })
  const {
    data
  } = await getRole(roleId)
  form.value = data
  title.value = '修改角色'
  open.value = true
}
function handleDelete(row) {
  const roleIds = row.roleId || ids.value
  instance.proxy.$confirm('是否确认删除角色编号为 [' + roleIds + '] 的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delRole(roleIds)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function(e) {})
}
function handleExport() {
  const that = this
  const queryForm = instance.proxy.addDateRange(queryForm.value, dateRange.value)
  instance.proxy.$confirm('是否确认导出所有角色数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    that.progressDialogVisible = true
    return exportRole(queryForm, progressEvent => {
      const process = progressEvent.loaded / progressEvent.total * 100 | 0
      const progressText = `下载进度：${process}%`
      console.log(progressText)
      that.percentage = process
    })
  }).then(res => {
    streamDownload(res)
  }).catch(function() {}).finally(() => {
    setTimeout(() => {
      that.progressDialogVisible = false
    }, 1500)
  })
}
function roleDialogHandleClose() {
  if (templateRefs.menuRef !== undefined) {
    templateRefs.menuRef.setCheckedKeys([])
  }
  menuOptions.value = []
  reset()
  open.value = false
}
function reset() {
  form.value = {
    roleName: '',
    roleKey: '',
    roleStatus: 0,
    sort: 0,
    remark: ''
  }
  templateRefs.formRef.resetFields()
}
async function getMenuTreeselect() {
  const {
    data
  } = await menuTreeselect()
  menuOptions.value = data
}
async function getRoleMenuTreeselect(roleId) {
  const {
    data
  } = await roleMenuTreeselect(roleId)
  menuOptions.value = data.menuTree
  templateRefs.menuRef.setCheckedKeys(data.checkedKeys)
}
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      if (form.value.roleId !== undefined) {
        form.value.menuIds = getMenuAllCheckedKeys()
        updateRole(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        form.value.menuIds = getMenuAllCheckedKeys()
        addRole(form.value).then(response => {
          handleSubmitResponse(response, '新增成功')
        })
      }
    }
  })
}
function getMenuAllCheckedKeys() {
  // 半选中的菜单节点
  const halfCheckedKeys = templateRefs.menuRef.getHalfCheckedKeys()
  // 目前被选中的菜单节点
  const checkedKeys = templateRefs.menuRef.getCheckedKeys()
  return checkedKeys.concat(halfCheckedKeys)
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
  defaultProps,
  form,
  getList,
  getMenuAllCheckedKeys,
  getMenuTreeselect,
  getRoleMenuTreeselect,
  handleAdd,
  handleDelete,
  handleExport,
  handleQuery,
  handleSelectionChange,
  handleSortChange,
  handleSwitchChange,
  handleUpdate,
  ids,
  loading,
  menuOptions,
  multiple,
  open,
  percentage,
  progressDialogVisible,
  queryForm,
  reset,
  resetQuery,
  roleDialogHandleClose,
  roleList,
  rules,
  single,
  statusOptions,
  submitForm,
  title,
  total
})
</script>
<style lang="scss" scoped>
</style>

