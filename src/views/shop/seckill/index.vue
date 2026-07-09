<template>
  <div class="app-container seckill-console">
    <div class="seckill-hero">
      <div>
        <p class="eyebrow">Flash Sale Control</p>
        <h2>秒杀活动治理台</h2>
        <p class="hero-copy">配置活动、预热 Redis 库存，并通过独立队列承接高峰下单流量。</p>
      </div>
      <el-button
        v-hasPermi="['shop:seckill:add']"
        type="primary"
        icon="Plus"
        @click="handleAdd"
      >新增活动</el-button>
    </div>

    <el-form ref="queryFormRef" :inline="true" :model="queryForm" class="query-card">
      <el-form-item label="活动名称" prop="name">
        <el-input v-model="queryForm.name" size="small" placeholder="请输入活动名称" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryForm.status" clearable size="small" placeholder="全部状态">
          <el-option label="草稿" :value="0" />
          <el-option label="已发布" :value="1" />
          <el-option label="已下架" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="activityList" class="activity-table">
      <el-table-column align="center" prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="活动名称" min-width="180" />
      <el-table-column prop="brief" label="简介" min-width="220" show-overflow-tooltip />
      <el-table-column align="center" prop="startTime" label="开始时间" min-width="170" />
      <el-table-column align="center" prop="endTime" label="结束时间" min-width="170" />
      <el-table-column align="center" prop="status" label="状态" width="110">
        <template #default="scope">
          <el-tag :type="statusMap[scope.row.status]?.type || 'info'">
            {{ statusMap[scope.row.status]?.label || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" fixed="right">
        <template #default="scope">
          <el-button v-hasPermi="['shop:seckill:info']" size="small" type="text" @click="handleDetail(scope.row)">详情</el-button>
          <el-button v-hasPermi="['shop:seckill:update']" size="small" type="text" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button v-hasPermi="['shop:seckill:update']" size="small" type="text" @click="handlePublish(scope.row)">发布</el-button>
          <el-button v-hasPermi="['shop:seckill:update']" size="small" type="text" @click="handlePreheat(scope.row)">预热</el-button>
          <el-button v-hasPermi="['shop:seckill:update']" size="small" type="text" @click="handleOffline(scope.row)">下架</el-button>
          <el-button v-hasPermi="['shop:seckill:delete']" size="small" type="text" class="danger-link" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total"
      v-model:page="queryForm.pageNum"
      v-model:limit="queryForm.pageSize"
      :total="total"
      @pagination="getList"
    />

    <el-dialog v-model="open" :title="title" width="960px" :close-on-click-modal="false" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="活动名称" prop="activity.name">
              <el-input v-model="form.activity.name" placeholder="例如：618整点秒杀" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="activity.sortOrder">
              <el-input-number v-model="form.activity.sortOrder" :min="0" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="活动时间" required>
          <el-date-picker
            v-model="activityRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="syncActivityRange"
          />
        </el-form-item>
        <el-form-item label="活动简介" prop="activity.brief">
          <el-input v-model="form.activity.brief" type="textarea" :rows="2" placeholder="说明活动场景、库存策略或运营备注" />
        </el-form-item>

        <div class="sku-toolbar">
          <span>活动 SKU</span>
          <el-button type="primary" plain icon="Plus" size="small" @click="addSkuRow">添加 SKU</el-button>
        </div>
        <el-table border :data="form.skuList">
          <el-table-column label="活动商品" min-width="240">
            <template #default="scope">
              <el-select
                v-model="scope.row.goodsId"
                filterable
                remote
                reserve-keyword
                clearable
                :remote-method="remoteSearchGoods"
                :loading="goodsSelectLoading"
                placeholder="搜索并选择商品"
                @visible-change="handleGoodsSelectVisible"
                @change="handleSkuGoodsChange(scope.row)"
              >
                <el-option
                  v-for="goods in goodsOptions"
                  :key="goods.id"
                  :label="formatGoodsOption(goods)"
                  :value="goods.id"
                >
                  <div class="goods-option">
                    <span>{{ goods.name }}</span>
                    <small>ID {{ goods.id }} / {{ goods.goodsSn || '无编号' }}</small>
                  </div>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="货品规格" min-width="260">
            <template #default="scope">
              <el-select
                v-model="scope.row.productId"
                filterable
                clearable
                :disabled="!scope.row.goodsId"
                placeholder="选择货品规格"
                @change="handleSkuProductChange(scope.row)"
              >
                <el-option
                  v-for="product in getSkuProductOptions(scope.row)"
                  :key="product.id"
                  :label="formatProductOption(product)"
                  :value="product.id"
                  :disabled="isProductSelectedByOtherSku(scope.row, product.id)"
                >
                  <div class="product-option">
                    <span>{{ formatProductSpec(product) }}</span>
                    <small>ID {{ product.id }} / 库存 {{ product.number || 0 }} / ¥{{ product.price || 0 }}</small>
                  </div>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="秒杀价" min-width="130">
            <template #default="scope">
              <el-input-number v-model="scope.row.seckillPrice" :min="0.01" :precision="2" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column label="活动库存" min-width="130">
            <template #default="scope">
              <el-input-number v-model="scope.row.availableStock" :min="1" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column label="限购" min-width="110">
            <template #default="scope">
              <el-input-number v-model="scope.row.limitCount" :min="1" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="scope">
              <el-select v-model="scope.row.status">
                <el-option label="草稿" :value="0" />
                <el-option label="发布" :value="1" />
                <el-option label="下架" :value="2" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope">
              <el-button type="text" class="danger-link" @click="removeSkuRow(scope.$index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import {
  addSeckill,
  delSeckill,
  getSeckill,
  listSeckill,
  offlineSeckill,
  preheatSeckill,
  publishSeckill,
  updateSeckill
} from '@/api/shop/seckill'
import { getGoods, listGoods } from '@/api/shop/goods'
import { useTemplateRefs } from '@/utils/templateRefs'

const instance = getCurrentInstance()
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const submitLoading = ref(false)
const total = ref(0)
const open = ref(false)
const title = ref('')
const activityList = ref([])
const activityRange = ref([])
const goodsOptions = ref([])
const goodsSelectLoading = ref(false)
const skuProductOptions = ref({})
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  status: undefined
})
const statusMap = {
  0: { label: '草稿', type: 'info' },
  1: { label: '已发布', type: 'success' },
  2: { label: '已下架', type: 'warning' }
}

let skuRowSeed = 0

const form = ref(buildEmptyForm())
const rules = ref({
  'activity.name': [{ required: true, message: '活动名称不能为空', trigger: 'blur' }],
  'activity.brief': [{ required: true, message: '活动简介不能为空', trigger: 'blur' }]
})

function nextSkuRowKey() {
  skuRowSeed += 1
  return `sku-row-${Date.now()}-${skuRowSeed}`
}

function buildEmptyForm() {
  return {
    activity: {
      id: undefined,
      name: undefined,
      brief: undefined,
      startTime: undefined,
      endTime: undefined,
      status: 0,
      sortOrder: 0
    },
    skuList: [buildSkuRow()]
  }
}

function buildSkuRow() {
  return {
    _rowKey: nextSkuRowKey(),
    goodsId: undefined,
    productId: undefined,
    seckillPrice: 0.01,
    availableStock: 1,
    lockedStock: 0,
    soldStock: 0,
    limitCount: 1,
    status: 0
  }
}

function normalizeSkuRow(row = {}) {
  return {
    ...buildSkuRow(),
    ...row,
    _rowKey: row._rowKey || nextSkuRowKey()
  }
}

function syncActivityRange() {
  form.value.activity.startTime = activityRange.value?.[0]
  form.value.activity.endTime = activityRange.value?.[1]
}

async function getList() {
  loading.value = true
  const { data } = await listSeckill(queryForm.value)
  activityList.value = data.records || []
  total.value = data.total || 0
  loading.value = false
}

async function remoteSearchGoods(keyword = '') {
  goodsSelectLoading.value = true
  try {
    const { data } = await listGoods({
      pageNum: 1,
      pageSize: 20,
      name: keyword || undefined
    })
    goodsOptions.value = data?.records || []
  } finally {
    goodsSelectLoading.value = false
  }
}

function handleGoodsSelectVisible(visible) {
  if (visible && goodsOptions.value.length === 0) {
    remoteSearchGoods()
  }
}

function appendGoodsOption(goods) {
  if (!goods?.id || goodsOptions.value.some(item => item.id === goods.id)) {
    return
  }
  goodsOptions.value = [goods, ...goodsOptions.value]
}

async function loadSkuProducts(row) {
  if (!row.goodsId) {
    skuProductOptions.value = {
      ...skuProductOptions.value,
      [row._rowKey]: []
    }
    return
  }
  const { data } = await getGoods(row.goodsId)
  appendGoodsOption(data?.goods)
  skuProductOptions.value = {
    ...skuProductOptions.value,
    [row._rowKey]: data?.products || []
  }
}

function getSkuProductOptions(row) {
  return skuProductOptions.value[row._rowKey] || []
}

function isProductSelectedByOtherSku(row, productId) {
  return form.value.skuList.some(item => item._rowKey !== row._rowKey && item.productId === productId)
}

function handleSkuGoodsChange(row) {
  row.productId = undefined
  loadSkuProducts(row)
}

function handleSkuProductChange(row) {
  const product = getSkuProductOptions(row).find(item => item.id === row.productId)
  if (!product) {
    return
  }
  if (Number(row.seckillPrice) <= 0.01 && product.price) {
    row.seckillPrice = Number(product.price)
  }
  if (Number(row.availableStock) === 1 && product.number > 0) {
    row.availableStock = product.number
  }
}

function formatGoodsOption(goods) {
  if (!goods) {
    return ''
  }
  return `${goods.name || '未命名商品'}（ID ${goods.id}）`
}

function formatProductSpec(product) {
  const specifications = product?.specifications
  if (Array.isArray(specifications)) {
    return specifications.join(' / ')
  }
  return specifications || '默认规格'
}

function formatProductOption(product) {
  return `${formatProductSpec(product)}（ID ${product.id}）`
}

function buildSubmitPayload() {
  return {
    activity: form.value.activity,
    skuList: form.value.skuList.map(({ _rowKey, ...sku }) => sku)
  }
}

function handleQuery() {
  queryForm.value.pageNum = 1
  getList()
}

function resetQuery() {
  templateRefs.queryFormRef.resetFields()
  handleQuery()
}

function handleAdd() {
  title.value = '新增秒杀活动'
  form.value = buildEmptyForm()
  activityRange.value = []
  skuProductOptions.value = {}
  remoteSearchGoods()
  open.value = true
}

async function handleUpdate(row) {
  title.value = '修改秒杀活动'
  const { data } = await getSeckill(row.id)
  form.value = {
    activity: data.activity,
    skuList: (data.skuList?.length ? data.skuList : [buildSkuRow()]).map(normalizeSkuRow)
  }
  activityRange.value = [data.activity.startTime, data.activity.endTime]
  skuProductOptions.value = {}
  await Promise.all(form.value.skuList.map(item => loadSkuProducts(item)))
  open.value = true
}

async function handleDetail(row) {
  const { data } = await getSeckill(row.id)
  const skuText = (data.skuList || []).map(item => `SKU#${item.id || '-'} 商品${item.goodsId}/货品${item.productId} 库存${item.availableStock}`).join('\n')
  instance.proxy.$alert(skuText || '暂无 SKU', data.activity.name, {
    confirmButtonText: '知道了'
  })
}

function handlePublish(row) {
  publishSeckill(row.id).then(() => {
    instance.proxy.$message.success('发布成功')
    getList()
  })
}

function handleOffline(row) {
  offlineSeckill(row.id).then(() => {
    instance.proxy.$message.success('下架成功')
    getList()
  })
}

function handlePreheat(row) {
  preheatSeckill(row.id).then(() => {
    instance.proxy.$message.success('库存预热完成')
  })
}

function handleDelete(row) {
  instance.proxy.$confirm(`是否删除秒杀活动「${row.name}」?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => delSeckill(row.id)).then(() => {
    instance.proxy.$message.success('删除成功')
    getList()
  }).catch(() => {})
}

function addSkuRow() {
  const row = buildSkuRow()
  form.value.skuList.push(row)
  remoteSearchGoods()
}

function removeSkuRow(index) {
  if (form.value.skuList.length === 1) {
    instance.proxy.$message.warning('至少保留一个活动 SKU')
    return
  }
  const row = form.value.skuList[index]
  if (row?._rowKey) {
    const nextOptions = { ...skuProductOptions.value }
    delete nextOptions[row._rowKey]
    skuProductOptions.value = nextOptions
  }
  form.value.skuList.splice(index, 1)
}

function validateSkuList() {
  return form.value.skuList.every(item => item.goodsId && item.productId && item.seckillPrice > 0 && item.availableStock > 0 && item.limitCount > 0)
}

function hasDuplicateProductSku() {
  const selectedProductIds = form.value.skuList
    .map(item => item.productId)
    .filter(Boolean)
  return new Set(selectedProductIds).size !== selectedProductIds.length
}

function submitForm() {
  syncActivityRange()
  templateRefs.formRef.validate(valid => {
    if (!valid) return
    if (!form.value.activity.startTime || !form.value.activity.endTime) {
      instance.proxy.$message.error('请选择活动时间')
      return
    }
    if (!validateSkuList()) {
      instance.proxy.$message.error('请完整填写活动 SKU')
      return
    }
    // 前端先拦截重复货品，后端唯一校验仍作为最终兜底，避免批量保存触发数据库唯一键异常。
    if (hasDuplicateProductSku()) {
      instance.proxy.$message.error('同一活动不能重复选择同一货品')
      return
    }
    submitLoading.value = true
    const request = form.value.activity.id ? updateSeckill : addSeckill
    request(buildSubmitPayload()).then(() => {
      instance.proxy.$message.success('保存成功')
      open.value = false
      getList()
    }).finally(() => {
      submitLoading.value = false
    })
  })
}

function resetForm() {
  form.value = buildEmptyForm()
  activityRange.value = []
  skuProductOptions.value = {}
}

(() => {
  getList()
})()

defineExpose({
  activityList,
  activityRange,
  addSkuRow,
  form,
  getSkuProductOptions,
  getList,
  goodsOptions,
  goodsSelectLoading,
  hasDuplicateProductSku,
  handleSkuGoodsChange,
  handleSkuProductChange,
  handleAdd,
  handleDelete,
  handleDetail,
  handleOffline,
  handlePreheat,
  handlePublish,
  handleQuery,
  handleUpdate,
  loading,
  open,
  queryForm,
  removeSkuRow,
  resetQuery,
  rules,
  isProductSelectedByOtherSku,
  skuProductOptions,
  statusMap,
  submitForm,
  submitLoading,
  title,
  total
})
</script>

<style scoped lang="scss">
.seckill-console {
  --seckill-ink: #17202a;
  --seckill-fire: #ff5a1f;
  --seckill-warm: #fff3df;
}

.seckill-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding: 24px;
  color: var(--seckill-ink);
  background:
    radial-gradient(circle at 88% 20%, rgba(255, 90, 31, 0.24), transparent 28%),
    linear-gradient(135deg, #fff9ef 0%, #fff 48%, #eef7ff 100%);
  border: 1px solid #f0e2c8;
  border-radius: 18px;
  box-shadow: 0 14px 40px rgba(23, 32, 42, 0.08);
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--seckill-fire);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.seckill-hero h2 {
  margin: 0;
  font-size: 26px;
}

.hero-copy {
  margin: 8px 0 0;
  color: #687382;
}

.query-card {
  padding: 18px 18px 0;
  margin-bottom: 14px;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 14px;
}

.activity-table {
  border-radius: 14px;
  overflow: hidden;
}

.sku-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 12px;
  font-weight: 700;
}

:deep(.el-table .el-select) {
  width: 100%;
}

.goods-option,
.product-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.25;
}

.goods-option span,
.product-option span {
  color: #1f2937;
  font-weight: 600;
}

.goods-option small,
.product-option small {
  color: #7a8494;
  font-size: 12px;
}

.danger-link {
  color: #f56c6c;
}
</style>
