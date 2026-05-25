<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="queryForm.deptName"
          size="small"
          placeholder="请输入部门名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="deptStatus">
        <el-select
          v-model="queryForm.deptStatus"
          placeholder="部门状态"
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
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dept:add']"
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
      :data="deptList"
      row-key="deptId"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="deptName" label="部门名称" width="260" />
      <el-table-column prop="sort" label="排序" width="200" />
      <el-table-column prop="deptStatus" label="状态" :formatter="statusFormat" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:dept:update']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:dept:add']"
            size="small"
            type="text"
            icon="Plus"
            @click="handleAdd(scope.row)"
          >新增</el-button>
          <el-button
            v-if="scope.row.parentId != 0"
            v-hasPermi="['system:dept:delete']"
            size="small"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      :before-close="deptDialogHandleClose"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="form.parentId !== 0" :span="24">
            <el-form-item label="上级部门" prop="parentId">
              <treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer" placeholder="选择上级部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.deptStatus">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.value"
                  :label="parseInt(dict.value)"
                >{{ dict.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="deptDialogHandleClose">取 消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listDept, getDept, delDept, addDept, updateDept } from '@/api/system/dept'
import Treeselect from '@zanmato/vue3-treeselect'
// import the styles
import '@zanmato/vue3-treeselect/dist/vue3-treeselect.min.css'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  components: {
    Treeselect
  }
})
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const queryForm = ref({
  deptName: undefined,
  deptStatus: undefined
})
const deptList = ref([])
const deptOptions = ref([])
const open = ref(false)
const statusOptions = ref([])
const form = ref({
  deptId: undefined,
  parentId: undefined,
  deptName: undefined,
  sort: undefined,
  leader: undefined,
  phone: undefined,
  email: undefined,
  deptStatus: 0
})
const rules = ref({
  parentId: [{
    required: true,
    message: '上级部门不能为空',
    trigger: 'blur'
  }],
  deptName: [{
    required: true,
    message: '部门名称不能为空',
    trigger: 'blur'
  }],
  sort: [{
    required: true,
    message: '菜单顺序不能为空',
    trigger: 'blur'
  }],
  email: [{
    type: 'email',
    message: "'请输入正确的邮箱地址",
    trigger: ['blur', 'change']
  }],
  phone: [{
    pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
    message: '请输入正确的手机号码',
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
  loading.value = true
  const {
    data
  } = await listDept(queryForm.value)
  deptList.value = instance.proxy.buildTree(data, 'deptId')
  loading.value = false
}
function handleAdd(row) {
  getTreeselect()
  if (row != null) {
    form.value.parentId = row.deptId
  }
  title.value = '添加部门'
  open.value = true
}
async function handleUpdate(row) {
  getTreeselect()
  const {
    data
  } = await getDept(row.deptId)
  form.value = data
  title.value = '修改部门'
  open.value = true
}
function handleDelete(row) {
  instance.proxy.$confirm('是否确认删除名称为"' + row.deptName + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delDept(row.deptId)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function() {})
}
function statusFormat(row, column) {
  return instance.proxy.echoDictName(statusOptions.value, row.deptStatus)
}
async function getTreeselect() {
  const {
    data
  } = await listDept()
  deptOptions.value = instance.proxy.buildTree(data, 'deptId')
}
function normalizer(node) {
  if (node.children && !node.children.length) {
    delete node.children
  }
  return {
    id: node.deptId,
    label: node.deptName,
    children: node.children
  }
}
function deptDialogHandleClose() {
  reset()
  open.value = false
}
function reset() {
  form.value = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    sort: undefined,
    leader: undefined,
    phone: undefined,
    email: undefined,
    deptStatus: 0
  }
  templateRefs.formRef.resetFields()
}
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      if (form.value.deptId !== undefined) {
        updateDept(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        addDept(form.value).then(response => {
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
  instance.proxy.getDicts('status').then(response => {
    const {
      data
    } = response
    statusOptions.value = data
  })
})()
defineExpose({
  deptDialogHandleClose,
  deptList,
  deptOptions,
  form,
  getList,
  getTreeselect,
  handleAdd,
  handleDelete,
  handleQuery,
  handleUpdate,
  ids,
  loading,
  multiple,
  normalizer,
  open,
  queryForm,
  reset,
  resetQuery,
  rules,
  single,
  statusFormat,
  statusOptions,
  submitForm,
  title
})
</script>
<style lang="scss" scoped>
</style>
