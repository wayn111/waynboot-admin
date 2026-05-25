<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input
          v-model="queryForm.menuName"
          size="small"
          placeholder="请输入菜单名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="menuStatus">
        <el-select
          v-model="queryForm.menuStatus"
          placeholder="菜单状态"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:menu:add']"
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
      :data="menuList"
      row-key="menuId"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column
        prop="menuName"
        label="菜单名称"
        :show-overflow-tooltip="true"
        width="160"
      />
      <el-table-column prop="icon" label="图标" align="center" width="100">
        <template #default="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="60" />
      <el-table-column
        prop="perms"
        label="权限标识"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="component"
        label="组件路径"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="path"
        label="路由地址"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="menuStatus"
        label="状态"
        :formatter="statusFormat"
        width="80"
      />
      <el-table-column
        prop="visible"
        label="显示状态"
        :formatter="visibleFormat"
        width="80"
      />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['system:menu:update']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:menu:add']"
            size="small"
            type="text"
            icon="Plus"
            @click="handleAdd(scope.row)"
          >新增</el-button>
          <el-button
            v-hasPermi="['system:menu:delete']"
            size="small"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="menuDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <treeselect
                v-model="form.parentId"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="选择上级菜单"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              v-if="form.menuType != 'F'"
              label="菜单图标"
              prop="icon"
            >
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="$refs['iconSelect'].reset()"
              >
                <IconSelect ref="iconSelect" @selected="selected" />
                <template #reference>
                  <el-input
                    v-model="form.icon"
                    placeholder="点击选择图标"
                    readonly
                  >
                    <template #prefix>
                      <svg-icon
                        v-if="form.icon"
                        :icon-class="form.icon"
                        class="el-input__icon"
                        style="height: 32px; width: 16px"
                      />
                      <i
                        v-else
                        class="Search el-input__icon"
                      />
                    </template>
                  </el-input>
                </template>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort">
              <el-input-number
                v-model="form.sort"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.menuType != 'F'"
              prop="isFrame"
              label="是否外链"
            >
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">是</el-radio>
                <el-radio label="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.menuType != 'F'"
              prop="path"
              label="路由地址"
            >
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType == 'C'" :span="12">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.menuType != 'M'"
              prop="perms"
              label="权限标识"
            >
              <el-input
                v-model="form.perms"
                placeholder="请权限标识"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.menuType != 'F'"
              prop="visible"
              label="显示状态"
            >
              <el-radio-group v-model="form.visible">
                <el-radio :label="0">显示</el-radio>
                <el-radio :label="1">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.menuType != 'F'"
              prop="menuStatus"
              label="菜单状态"
            >
              <el-radio-group v-model="form.menuStatus">
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
      <template #footer><span class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="menuDialogHandleClose">取 消</el-button>
      </span></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listMenu, getMenu, delMenu, addMenu, updateMenu } from '@/api/system/menu'
import Treeselect from '@zanmato/vue3-treeselect'
// import the styles
import '@zanmato/vue3-treeselect/dist/vue3-treeselect.min.css'
import IconSelect from '@/components/IconSelect'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
defineOptions({
  components: {
    Treeselect,
    IconSelect
  }
})
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const queryForm = ref({
  menuName: '',
  menuStatus: undefined
})
const menuList = ref([])
const menuOptions = ref([])
const open = ref(false)
const statusOptions = ref([])
const visibleOptions = ref([])
const form = ref({
  menuId: undefined,
  parentId: 0,
  menuName: undefined,
  icon: undefined,
  menuType: 'M',
  sort: undefined,
  isFrame: '1',
  path: '',
  visible: 0,
  menuStatus: 0
})
const rules = ref({
  menuName: [{
    required: true,
    message: '菜单名称不能为空',
    trigger: 'blur'
  }],
  sort: [{
    required: true,
    message: '菜单顺序不能为空',
    trigger: 'blur'
  }],
  path: [{
    required: true,
    message: '路由地址不能为空',
    trigger: 'blur'
  }]
})
function selected(name) {
  form.value.icon = name
}
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
  } = await listMenu(queryForm.value)
  menuList.value = instance.proxy.buildTree(data, 'menuId')
  loading.value = false
}
function handleAdd(row) {
  getTreeselect()
  if (row != null) {
    form.value.parentId = row.menuId
  } else {
    form.value.parentId = 0
  }
  title.value = '添加菜单'
  open.value = true
}
async function handleUpdate(row) {
  getTreeselect()
  const {
    data
  } = await getMenu(row.menuId)
  form.value = data
  title.value = '修改菜单'
  open.value = true
}
function handleDelete(row) {
  instance.proxy.$confirm('是否确认删除名称为"' + row.menuName + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delMenu(row.menuId)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function() {})
}
function statusFormat(row, column) {
  return instance.proxy.echoDictName(statusOptions.value, row.menuStatus)
}
function visibleFormat(row, column) {
  return instance.proxy.echoDictName(visibleOptions.value, row.visible)
}
async function getTreeselect() {
  const {
    data
  } = await listMenu()
  menuOptions.value = []
  const menu = {
    menuId: 0,
    menuName: '主类目',
    children: []
  }
  menu.children = instance.proxy.buildTree(data, 'menuId')
  menuOptions.value.push(menu)
}
function normalizer(node) {
  if (node.children && !node.children.length) {
    delete node.children
  }
  return {
    id: node.menuId,
    label: node.menuName,
    children: node.children
  }
}
function menuDialogHandleClose() {
  reset()
  open.value = false
}
function reset() {
  form.value = {
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: 'M',
    sort: undefined,
    isFrame: '1',
    path: '',
    visible: 0,
    menuStatus: 0
  }
  templateRefs.formRef.resetFields()
}
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      if (form.value.menuId !== undefined) {
        updateMenu(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        addMenu(form.value).then(response => {
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
  instance.proxy.getDicts('visible').then(response => {
    const {
      data
    } = response
    visibleOptions.value = data
  })
})()
defineExpose({
  form,
  getList,
  getTreeselect,
  handleAdd,
  handleDelete,
  handleQuery,
  handleUpdate,
  ids,
  loading,
  menuDialogHandleClose,
  menuList,
  menuOptions,
  multiple,
  normalizer,
  open,
  queryForm,
  reset,
  resetQuery,
  rules,
  selected,
  single,
  statusFormat,
  statusOptions,
  submitForm,
  title,
  visibleFormat,
  visibleOptions
})
</script>
<style lang="scss" scoped>
:deep(.vue-treeselect__control),
:deep(.vue-treeselect__placeholder),
:deep(.vue-treeselect__single-value) {
  height: 40px;
  line-height: 40px;
}
</style>
