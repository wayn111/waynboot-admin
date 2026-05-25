<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="金刚位名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入金刚位名称"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="diamondList"
      style="width: 100%"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="100" />
      <el-table-column label="金刚位名称" prop="name" />
      <el-table-column label="图标" prop="iconUrl">
        <template #default="scope">
          <img v-if="scope.row.iconUrl" :src="scope.row.iconUrl" width="50">
        </template>
      </el-table-column>
      <el-table-column label="图片" prop="picUrl">
        <template #default="scope">
          <img v-if="scope.row.picUrl" :src="scope.row.picUrl" width="50">
        </template>
      </el-table-column>
      <el-table-column label="跳转类型" prop="jumpType">
        <template #default="scope">
          <el-tag v-if="scope.row.jumpType == 0">栏目</el-tag>
          <el-tag
            v-else-if="scope.row.jumpType == 1"
            type="success"
          >分类</el-tag>
          <el-tag
            v-else-if="scope.row.jumpType == 3"
            type="success"
          >领券中心</el-tag>
          <el-tag
            v-else-if="scope.row.jumpType == 4"
            type="success"
          >全部分类</el-tag>
          <el-tag v-else type="warning">链接</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" sortable="custom" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        sortable="custom"
      >
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
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
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

    <!-- 金刚位添加/修改单窗 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="34%"
      :close-on-click-modal="false"
      :before-close="columnDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入金刚位名称" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="跳转类型" prop="jumpType">
              <el-select
                v-model="form.jumpType"
                placeholder="请选择跳转类型"
                @change="selectChange"
              >
                <el-option
                  v-for="item in jumpTypeOptions"
                  :key="item.value"
                  :label="item.name"
                  :value="parseInt(item.value)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="jumpColumn" label="选择栏目" prop="valueId">
              <el-select
                v-model="formId"
                placeholder="请选择栏目"
                :loading="loading"
              >
                <el-option
                  v-for="item in columnList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              v-else-if="jumpCategory"
              label="选择分类"
              prop="valueId"
            >
              <el-cascader
                v-model="formId"
                :options="categoryList"
                :props="props"
                clearable
                @change="handleCategoryChange"
              />
            </el-form-item>
            <el-form-item v-if="jumpUrl" label="链接地址" prop="valueUrl">
              <el-input v-model="formUrl" placeholder="请输入链接地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="图标" prop="iconUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadIconUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png"
          >
            <img v-if="form.iconUrl" :src="form.iconUrl" class="avatar">
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <template #tip><div class="el-upload__tip">只能上传jpg、jpeg、png文件，120 x 120</div></template>
          </el-upload>
        </el-form-item>
        <el-form-item label="图片" prop="picUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadPicUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png, .gif"
          >
            <img v-if="form.picUrl" :src="form.picUrl" class="avatar">
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <template #tip><div class="el-upload__tip">只能上传jpg、jpeg、png、gif文件，800 x 340</div></template>
          </el-upload>
        </el-form-item>
        <el-form-item label="顺序" prop="sort">
          <el-input-number
            v-model="form.sort"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{ dict.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer><span class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="columnDialogHandleClose">取 消</el-button>
      </span></template>
    </el-dialog>

    <!-- 商品配置弹窗 -->
    <el-dialog
      title="商品配置"
      :close-on-click-modal="false"
      v-model="goodsOpen"
      top="1vh"
      width="70%"
    >
      <template #footer><span class="dialog-footer">
        <el-button @click="goodsOpen = false">关 闭</el-button>
      </span></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listDiamond, getDiamond, addDiamond, updateDiamond, delDiamond } from '@/api/shop/diamond'
import { listAllColumn } from '@/api/shop/column'
import { listCategory } from '@/api/shop/category'
import { getToken } from '@/utils/auth'
import { uploadPath as uploadApiPath } from '@/api/upload'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const selectLoading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const total = ref(0)
const dateRange = ref([])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  name: undefined
})
const diamondList = ref([])
const categoryList = ref([])
const props = ref({
  label: 'name',
  value: 'id',
  expandTrigger: 'hover',
  checkStrictly: true
})
const open = ref(false)
const goodsOpen = ref(false)
const jumpTypeOptions = ref([])
const statusOptions = ref([])
const columnList = ref([])
const form = ref({
  name: undefined,
  iconUrl: '',
  jumpType: undefined,
  valueId: undefined,
  valueUrl: undefined,
  picUrl: '',
  status: 0,
  sort: 0
})
const jumpColumn = ref(false)
const jumpCategory = ref(false)
const jumpUrl = ref(false)
const rules = ref({
  name: [{
    required: true,
    message: '名称不能为空',
    trigger: 'blur'
  }],
  jumpType: [{
    required: true,
    message: '跳转类型不能为空',
    trigger: 'blur'
  }],
  iconUrl: [{
    required: true,
    message: '图标不能为空',
    trigger: 'blur'
  }],
  picUrl: [{
    required: true,
    message: '图片不能为空',
    trigger: 'blur'
  }],
  sort: [{
    required: true,
    message: '排序不能为空',
    trigger: 'blur'
  }]
})
const uploadPath = ref(uploadApiPath)
const headers = ref({
  Authorization: 'Bearer ' + getToken()
})
function handleQuery() {
  getList()
}
function resetQuery() {
  templateRefs.queryFormRef.resetFields()
  dateRange.value = []
  handleQuery()
}
function selectChange(val) {
  jumpColumn.value = false
  jumpCategory.value = false
  jumpUrl.value = false
  if (val === 0) {
    jumpColumn.value = true
  } else if (val === 1) {
    jumpCategory.value = true
  } else if (val === 3) {
    //
  } else if (val === 4) {
    //
  } else {
    jumpUrl.value = true
  }
}
async function getList() {
  const {
    data: {
      records: data,
      total: pageTotal
    }
  } = await listDiamond(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  diamondList.value = data
  loading.value = false
}
async function getCategoryList() {
  const {
    data
  } = await listCategory()
  categoryList.value = instance.proxy.buildTree(data, 'id', 'pid')
  console.log(categoryList.value)
}
function handleCategoryChange(value) {
  form.value.valueId = value[value.length - 1]
}
function uploadIconUrl(response) {
  form.value.iconUrl = response.data
}
function uploadPicUrl(response) {
  form.value.picUrl = response.data
}
function checkFileSize(file) {
  if (file.size > 1048576) {
    instance.proxy.$message.error(`${file.name}文件大于1024KB，请选择小于1024KB大小的图片`)
    return false
  }
  return true
}
function handleSortChange(sort) {
  queryForm.value.sortName = sort.prop
  queryForm.value.sortOrder = sort.order
  getList()
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleAdd(row) {
  title.value = '添加金刚位'
  open.value = true
}
async function handleUpdate(row) {
  const columnId = row.id || ids.value
  const {
    data
  } = await getDiamond(columnId)
  form.value = data
  selectChange(data.jumpType)
  title.value = '修改金刚位'
  open.value = true
}
async function handleDelete(row) {
  const columnIds = row.id || ids.value
  instance.proxy.$confirm('是否确认删除金刚位编号为 [' + columnIds + '] 的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delDiamond(columnIds)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function(e) {})
}
function columnDialogHandleClose() {
  reset()
  open.value = false
}
function reset() {
  form.value = {
    name: undefined,
    sort: undefined,
    code: undefined,
    remark: undefined,
    status: 0
  }
  templateRefs.formRef.resetFields()
}
function submitForm() {
  templateRefs.formRef.validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateDiamond(form.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      } else {
        addDiamond(form.value).then(response => {
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
  instance.proxy.getDicts('diamondJumpType').then(response => {
    const {
      data
    } = response
    jumpTypeOptions.value = data
  })
  instance.proxy.getDicts('status').then(response => {
    const {
      data
    } = response
    statusOptions.value = data
  })
  listAllColumn().then(res => {
    columnList.value = res.data
  }).catch(e => {})
  getCategoryList()
})()
defineExpose({
  categoryList,
  checkFileSize,
  columnDialogHandleClose,
  columnList,
  dateRange,
  diamondList,
  form,
  getCategoryList,
  getList,
  goodsOpen,
  handleAdd,
  handleCategoryChange,
  handleDelete,
  handleQuery,
  handleSelectionChange,
  handleSortChange,
  handleUpdate,
  headers,
  ids,
  jumpCategory,
  jumpColumn,
  jumpTypeOptions,
  jumpUrl,
  loading,
  multiple,
  open,
  props,
  queryForm,
  reset,
  resetQuery,
  rules,
  selectChange,
  selectLoading,
  single,
  statusOptions,
  submitForm,
  title,
  total,
  uploadIconUrl,
  uploadPath,
  uploadPicUrl
})
</script>
<style lang="scss" scoped>
.avatar-uploader {
  .avatar-uploader-icon {
    font-size: 18px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
  }
}
</style>
