<template>
  <div
    v-loading="syncLoading"
    element-loading-text="正在同步"
    class="app-container"
  >
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="商品ID" prop="id">
        <el-input
          v-model="queryForm.id"
          size="small"
          placeholder="请输入商品ID"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品编号" prop="goodsSn">
        <el-input
          v-model="queryForm.goodsSn"
          size="small"
          placeholder="请输入商品编号"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入商品名称"
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
          v-hasPermi="['system:goods:add']"
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd()"
        >新增</el-button>
        <el-button
          v-hasPermi="['system:goods:syncEs']"
          type="success"
          icon="Position"
          size="small"
          @click="handleSyncEs()"
        >同步es</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="goodsList"
      style="width: 100%"
    >
      <el-table-column type="expand">
        <template #default="props">
          <el-form label-position="left" class="table-expand">
            <el-form-item label="商品编号">
              <span>{{ props.row.goodsSn }}</span>
            </el-form-item>
            <el-form-item label="宣传画廊">
              <img
                v-for="pic in props.row.gallery"
                :key="pic"
                :src="pic"
                class="gallery"
              >
            </el-form-item>
            <el-form-item label="商品介绍">
              <span>{{ props.row.brief }}</span>
            </el-form-item>
            <el-form-item label="商品单位">
              <span>{{ props.row.unit }}</span>
            </el-form-item>
            <el-form-item label="关键字">
              <span>{{ props.row.keywords }}</span>
            </el-form-item>
            <el-form-item label="类目ID">
              <span>{{ props.row.categoryId }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品ID" prop="id" />
      <el-table-column
        align="center"
        min-width="100"
        label="名称"
        prop="name"
      />
      <el-table-column align="center" property="iconUrl" label="图片">
        <template #default="scope">
          <img :src="scope.row.picUrl" width="40">
        </template>
      </el-table-column>
      <el-table-column align="center" label="当前价格" prop="retailPrice" />
      <el-table-column align="center" label="是否新品" prop="isNew">
        <template #default="scope">
          <el-tag :type="scope.row.isNew ? 'success' : 'error'">{{
            scope.row.isNew ? '新品' : '非新品'
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否热品" prop="isHot">
        <template #default="scope">
          <el-tag :type="scope.row.isHot ? 'success' : 'error'">{{
            scope.row.isHot ? '热品' : '非热品'
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否在售" prop="isOnSale">
        <template #default="scope">
          <el-tag :type="scope.row.isOnSale ? 'success' : 'error'">{{
            scope.row.isOnSale ? '在售' : '未售'
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['system:goods:update']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:goods:delete']"
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
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listGoods, delGoods, syncEs } from '@/api/shop/goods'
import { getToken } from '@/utils/auth'
import { uploadPath as uploadApiPath } from '@/api/upload'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const syncLoading = ref(false)
const title = ref('')
const total = ref(0)
const dateRange = ref([])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  id: undefined,
  goodsSn: undefined,
  name: undefined
})
const goodsList = ref([])
const open = ref(false)
const statusOptions = ref([])
const form = ref({
  title: undefined,
  status: 0,
  imgUrl: undefined,
  jumpUrl: undefined
})
const rules = ref({
  title: [{
    required: true,
    message: '标题不能为空',
    trigger: 'blur'
  }],
  imgUrl: [{
    required: true,
    message: '图片不能为空',
    trigger: 'blur'
  }],
  jumpUrl: [{
    required: true,
    message: '跳转链接不能为空',
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
async function getList() {
  const {
    data: {
      records: data,
      total: pageTotal
    }
  } = await listGoods(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  goodsList.value = data
  loading.value = false
}
function handleAdd() {
  router.push({
    path: '/shop/goods/add',
    query: {
      pageNum: queryForm.value.pageNum
    }
  })
}
function handleUpdate(row) {
  router.push({
    path: '/shop/goods/edit',
    query: {
      id: row.id,
      pageNum: queryForm.value.pageNum
    }
  })
}
function handleSyncEs() {
  syncLoading.value = true
  syncEs().then(res => {
    syncLoading.value = false
    instance.proxy.$message.success('同步完成')
  }).finally(() => {
    syncLoading.value = false
  })
}
function handleDelete(row) {
  const goodsId = row.id
  const goodsSn = row.goodsSn
  instance.proxy.$confirm('是否确认删除商品编号为"' + goodsSn + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delGoods(goodsId)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function() {})
}
(() => {
  if (route.query.pageNum) {
    queryForm.value.pageNum = parseInt(route.query.pageNum)
  }
  getList()
})()
defineExpose({
  dateRange,
  form,
  getList,
  goodsList,
  handleAdd,
  handleDelete,
  handleQuery,
  handleSyncEs,
  handleUpdate,
  headers,
  loading,
  open,
  queryForm,
  resetQuery,
  rules,
  statusOptions,
  syncLoading,
  title,
  total,
  uploadPath
})
</script>
<style lang="scss" scoped>
.table-expand {
  font-size: 0;
  label {
    width: 100px;
    color: #99a9bf;
  }
  .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
}

.gallery {
  width: 80px;
  margin-right: 10px;
}
.goods-detail-box img {
  width: 100%;
}
</style>
