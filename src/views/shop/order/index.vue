<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="订单编号" prop="orderSn">
        <el-input
          v-model="queryForm.orderSn"
          size="small"
          placeholder="请输入订单编号"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员ID" prop="userId">
        <el-input
          v-model="queryForm.userId"
          size="small"
          placeholder="请输入会员ID"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select
          v-model="queryForm.orderStatus"
          placeholder="订单状态"
          clearable
          size="small"
          style="width: 180px"
        >
          <el-option
            v-for="dict in orderStatusOptions"
            :key="dict.value"
            :label="dict.name"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="支付方式" prop="orderStatus">
        <el-select
          v-model="queryForm.payType"
          placeholder="支付方式"
          clearable
          size="small"
          style="width: 180px"
        >
          <el-option
            v-for="dict in payTypeOptions"
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
          v-hasPermi="['system:order:list']"
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
      :data="orderList"
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column
        align="center"
        min-width="100"
        label="ID"
        prop="id"
        width="50"
      />
      <el-table-column
        align="center"
        min-width="100"
        label="订单编号"
        prop="orderSn"
        sortable="custom"
      />
      <el-table-column align="center" label="商品名称" prop="goodsName" width="200" />
      <el-table-column align="center" label="用户ID" prop="userId" width="100" />
      <el-table-column align="center" label="手机号" prop="mobile" width="100" />
      <el-table-column align="center" label="订单状态">
        <template #default="scope">
          <el-tag>{{ scope.row.orderStatusMsg }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="支付类型">
        <template #default="scope">
          <el-tag>{{ scope.row.payTypeMsg }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单金额/元" prop="orderPrice" sortable="custom">
        <template #default="scope">{{
          yuan(scope.row.orderPrice)
        }}</template>
      </el-table-column>
      <el-table-column align="center" label="实际金额/元" prop="actualPrice" sortable="custom">
        <template #default="scope">{{
          yuan(scope.row.actualPrice)
        }}</template>
      </el-table-column>
      <el-table-column align="center" label="退款状态" prop="actualPrice" sortable="custom">
        <template #default="scope">{{
          scope.row.refundStatusMsg
        }}</template>
      </el-table-column>
      <el-table-column align="center" label="退款金额/元" prop="actualPrice" sortable="custom">
        <template #default="scope">{{
          yuan(scope.row.refundAmount)
        }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="支付时间"
        prop="payTime"
        sortable="custom"
      />
      <el-table-column align="center" label="物流单号" prop="shipSn" />
      <el-table-column align="center" label="物流渠道" prop="shipChannel" />
      <el-table-column
        label="发货时间"
        align="center"
        prop="createTime"
        sortable="custom"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.shipTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="250">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:order:info']"
            size="small"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-popover
            placement="top"
            trigger="click"
          >
            <el-button
              v-hasPermi="['system:order:delete']"
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >删除</el-button>
            <el-button
              v-if="scope.row.orderStatus == 201"
              v-hasPermi="['system:order:ship']"
              size="small"
              type="primary"
              @click="handleShip(scope.row)"
            >发货</el-button>
            <el-button
              v-if="scope.row.orderStatus == 202 || scope.row.orderStatus == 204"
              v-hasPermi="['system:order:refund']"
              size="small"
              type="warning"
              @click="handleRefund(scope.row)"
            >退款</el-button>
            <template #reference><el-button class="more_btn" size="small">更多</el-button></template>
          </el-popover>
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
    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="orderDialogVisible"
      title="订单详情"
      :close-on-click-modal="false"
      width="800"
    >
      <section ref="print">
        <el-form :data="orderDetail" label-position="left">
          <el-form-item label="订单编号">
            <span>{{ orderDetail.order.orderSn }}</span>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-tag>{{
              orderDetail.order.orderStatusMsg
            }}</el-tag>
          </el-form-item>
          <el-form-item label="订单用户">
            <span>{{ orderDetail.user.nickname }}</span>
          </el-form-item>
          <el-form-item label="用户留言">
            <span>{{ orderDetail.order.message }}</span>
          </el-form-item>
          <el-form-item label="收货信息">
            <span>（收货人）{{ orderDetail.order.consignee }}</span>
            <span>（手机号）{{ orderDetail.order.mobile }}</span>
            <span>（地址）{{ orderDetail.order.address }}</span>
          </el-form-item>
          <el-form-item label="商品信息">
            <el-table
              border
              :data="orderDetail.orderGoods"
              fit
              highlight-current-row
            >
              <el-table-column
                align="center"
                label="商品名称"
                prop="goodsName"
              />
              <el-table-column align="center" label="商品编号" prop="goodsSn" />
              <el-table-column
                align="center"
                label="货品规格"
                prop="specifications"
              />
              <el-table-column align="center" label="货品价格" prop="price" />
              <el-table-column align="center" label="货品数量" prop="number" />
              <el-table-column align="center" label="货品图片" prop="picUrl">
                <template #default="scope">
                  <img :src="scope.row.picUrl" width="40">
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="费用信息">
            <span>
              (实际费用){{ orderDetail.order.actualPrice }}元 = (商品总价){{
                orderDetail.order.goodsPrice
              }}元 + (快递费用){{ orderDetail.order.freightPrice }}元
            </span>
          </el-form-item>
          <el-form-item label="支付信息">
            <span>（支付渠道）<el-tag>{{ orderDetail.order.payTypeMsg }}</el-tag></span>
            <span>（支付时间）{{ orderDetail.order.payTime }}</span>
          </el-form-item>
          <el-form-item label="快递信息">
            <span>（快递公司）{{ orderDetail.order.shipChannel }}</span>
            <span>（快递单号）{{ orderDetail.order.shipSn }}</span>
            <span>（发货时间）{{ orderDetail.order.shipTime }}</span>
          </el-form-item>
          <el-form-item label="收货信息">
            <span>（确认收货时间）{{ orderDetail.order.confirmTime }}</span>
          </el-form-item>
          <el-form-item label="退款信息">
            <span>（退款状态）<el-tag>{{ orderDetail.order.refundStatusMsg }}</el-tag></span>
            <span>（退款金额）{{ orderDetail.order.refundAmount }}元</span>
            <span>（退款类型）{{ orderDetail.order.refundTypeMsg }}</span>
            <span>（退款时间）{{ orderDetail.order.refundTime }}</span>
          </el-form-item>
          <el-form-item label="退款原因">
            <span>{{ orderDetail.order.refundContent }}</span>
          </el-form-item>
        </el-form>
      </section>
      <template #footer><span class="dialog-footer">
        <el-button @click="orderDialogVisible = false">取 消</el-button>
        <el-button type="primary">打 印</el-button>
      </span></template>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog v-model="refundDialogVisible" title="退款">
      <el-form
        ref="refundFormRef"
        :model="refundForm"
        status-icon
        label-position="left"
        label-width="100px"
        :rules="refundFormRules"
      >
        <el-form-item label="订单编号" prop="orderSn">
          <el-input v-model="refundForm.orderSn" disabled />
        </el-form-item>
        <el-form-item label="退款金额" prop="refundMoney">
          <el-input v-model="refundForm.refundMoney" />
        </el-form-item>
        <el-form-item label="退款原因" prop="refundReason">
          <el-input v-model="refundForm.refundReason" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="clickRefund">确定</el-button>
      </div></template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="发货">
      <el-form
        ref="shipFormRef"
        :model="shipForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left: 50px"
        :rules="shipFormRules"
      >
        <el-form-item label="快递公司" prop="shipChannel">
          <el-select v-model="shipForm.shipChannel" placeholder="请选择">
            <el-option
              v-for="item in channels"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="快递编号" prop="shipSn">
          <el-input v-model="shipForm.shipSn" />
        </el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="clickShip">确定</el-button>
      </div></template>
    </el-dialog>
    <Progess :percentage="percentage" v-model:progress-dialog-visible="progressDialogVisible" />
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { streamDownload } from '@/utils/index'
import { listOrder, delOrder, getOrder, refundOrder, listChannel, clickShip as shipOrder, exportOrder } from '@/api/shop/order'
import { yuan as formatYuan } from '@/utils'
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
const total = ref(0)
const dateRange = ref([])
const orderStatusOptions = ref([])
const payTypeOptions = ref([{
  name: '微信',
  value: '1'
}, {
  name: '支付宝',
  value: '2'
}, {
  name: '测试',
  value: '3'
}])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  orderSn: undefined,
  userId: undefined,
  name: undefined
})
const orderList = ref([])
const orderDialogVisible = ref(false)
const orderDetail = ref({
  order: {},
  user: {},
  orderGoods: []
})
const channels = ref([])
const shipForm = ref({
  orderId: undefined,
  shipChannel: undefined,
  shipSn: undefined
})
const shipFormRules = ref({
  shipChannel: [{
    required: true,
    message: '发货渠道不能为空',
    trigger: 'blur'
  }],
  shipSn: [{
    required: true,
    message: '发货编号不能为空',
    trigger: 'blur'
  }]
})
const shipDialogVisible = ref(false)
const refundDialogVisible = ref(false)
const refundForm = ref({
  orderSn: undefined,
  refundMoney: undefined,
  refundReason: undefined
})
const refundFormRules = ref({
  refundMoney: [{
    required: true,
    message: '退款金额不能为空',
    trigger: 'blur'
  }],
  refundReason: [{
    required: true,
    message: '退款原因不能为空',
    trigger: 'blur'
  }]
})
function yuan(value) {
  return formatYuan(value)
}
function getChannel() {
  listChannel().then(response => {
    channels.value = response.data
  })
}
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
  } = await listOrder(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  orderList.value = data
  loading.value = false
}
function handleSortChange(sort) {
  queryForm.value.sortName = sort.prop
  queryForm.value.sortOrder = sort.order
  getList()
}
async function handleDetail(row) {
  const {
    data
  } = await getOrder(row.id)
  orderDetail.value = data
  orderDialogVisible.value = true
}
function handleShip(row) {
  shipForm.value = {
    orderId: row.id,
    shipChannel: undefined,
    shipSn: undefined
  }
  shipDialogVisible.value = true
}
function clickShip(row) {
  templateRefs.shipFormRef.validate(async valid => {
    if (valid) {
      const {
        code,
        msg
      } = await shipOrder(shipForm.value)
      if (code === 200) {
        instance.proxy.$message.success('发货成功')
        shipDialogVisible.value = false
        getList()
      } else {
        instance.proxy.$message.error(msg)
      }
    }
  })
}
function handleRefund(row) {
  refundForm.value.orderSn = row.orderSn
  refundForm.value.refundMoney = undefined
  refundForm.value.refundReason = undefined
  refundDialogVisible.value = true
}
function clickRefund(row) {
  templateRefs.refundFormRef.validate(async valid => {
    if (valid) {
      const {
        code,
        msg
      } = await refundOrder(refundForm.value)
      if (code === 200) {
        instance.proxy.$message.success('退款成功')
        refundDialogVisible.value = false
        getList()
      } else {
        instance.proxy.$message.error(msg)
      }
    }
  })
}
async function handleDelete(row) {
  const orderId = row.id
  instance.proxy.$confirm('是否确认删除订单编号为 [' + row.orderSn + '] 的订单吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delOrder(orderId)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function(e) {})
}
function handleExport() {
  const that = this
  queryForm.value.pageNum = 1
  queryForm.value.pageSize = 100000
  const queryForm = instance.proxy.addDateRange(queryForm.value, dateRange.value)
  instance.proxy.$confirm('是否确认导出所有用户数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    that.progressDialogVisible = true
    return exportOrder(queryForm, progressEvent => {
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
(() => {
  getList()
  getChannel()
  instance.proxy.getDicts('orderStatus').then(response => {
    const {
      data
    } = response
    orderStatusOptions.value = data
  })
})()
defineExpose({
  channels,
  clickRefund,
  clickShip,
  dateRange,
  getChannel,
  getList,
  handleDelete,
  handleDetail,
  handleExport,
  handleQuery,
  handleRefund,
  handleShip,
  handleSortChange,
  loading,
  orderDetail,
  orderDialogVisible,
  orderList,
  orderStatusOptions,
  payTypeOptions,
  percentage,
  progressDialogVisible,
  queryForm,
  refundDialogVisible,
  refundForm,
  refundFormRules,
  resetQuery,
  shipDialogVisible,
  shipForm,
  shipFormRules,
  total,
  yuan
})
</script>
<style lang="scss" scoped>
.more_btn{
  margin-left: 10px;
}
</style>

