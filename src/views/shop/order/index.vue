<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="订单编号" prop="orderSn">
        <el-input
          v-model="queryForm.orderSn"
          size="small"
          placeholder="请输入订单编号"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员ID" prop="userId">
        <el-input
          v-model="queryForm.userId"
          size="small"
          placeholder="请输入会员ID"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="orderStatus">
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
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd()">新增</el-button>
      </el-col>
    </el-row> -->

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
      <el-table-column align="center" label="用户ID" prop="userId" width="100" />
      <el-table-column align="center" label="订单状态">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单金额/元" prop="orderPrice" sortable="custom">
        <template slot-scope="scope">{{
          scope.row.orderPrice | yuan
        }}</template>
      </el-table-column>
      <el-table-column align="center" label="支付金额/元" prop="actualPrice" sortable="custom">
        <template slot-scope="scope">{{
          scope.row.actualPrice | yuan
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
        label="创建时间"
        align="center"
        prop="createTime"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="250">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-popover
            placement="top"
            trigger="click"
          >
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)"
            >删除</el-button>
            <el-button
              v-if="scope.row.orderStatus == 201"
              size="mini"
              type="primary"
              @click="handleShip(scope.row)"
            >发货</el-button>
            <el-button
              v-if="scope.row.orderStatus == 202 || scope.row.orderStatus == 204"
              size="mini"
              type="warning"
              @click="handleRefund(scope.row)"
            >退款</el-button>
            <el-button slot="reference" class="more_btn" size="mini">更多</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total"
      :total="total"
      :page.sync="queryForm.pageNum"
      :limit.sync="queryForm.pageSize"
      @pagination="getList"
    />
    <!-- 订单详情对话框 -->
    <el-dialog
      :visible.sync="orderDialogVisible"
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
              orderDetail.order.orderStatus | orderStatusFilter
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
                <template slot-scope="scope">
                  <img :src="scope.row.picUrl" width="40">
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="费用信息">
            <span>
              (实际费用){{ orderDetail.order.actualPrice }}元 = (商品总价){{
                orderDetail.order.goodsPrice
              }}元 + (快递费用){{ orderDetail.order.freightPrice }}元 -
              (优惠减免){{ orderDetail.order.couponPrice }}元 - (积分减免){{
                orderDetail.order.integralPrice
              }}元
            </span>
          </el-form-item>
          <el-form-item label="支付信息">
            <span>（支付渠道）微信支付</span>
            <span>（支付时间）{{ orderDetail.order.payTime }}</span>
          </el-form-item>
          <el-form-item label="快递信息">
            <span>（快递公司）{{ orderDetail.order.shipChannel }}</span>
            <span>（快递单号）{{ orderDetail.order.shipSn }}</span>
            <span>（发货时间）{{ orderDetail.order.shipTime }}</span>
          </el-form-item>
          <el-form-item label="退款信息">
            <span>（退款金额）{{ orderDetail.order.refundAmount }}元</span>
            <span>（退款类型）{{ orderDetail.order.refundType }}</span>
            <span>（退款备注）{{ orderDetail.order.refundContent }}</span>
            <span>（退款时间）{{ orderDetail.order.refundTime }}</span>
          </el-form-item>
          <el-form-item label="收货信息">
            <span>（确认收货时间）{{ orderDetail.order.confirmTime }}</span>
          </el-form-item>
        </el-form>
      </section>
      <span slot="footer" class="dialog-footer">
        <el-button @click="orderDialogVisible = false">取 消</el-button>
        <el-button type="primary">打 印</el-button>
      </span>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog :visible.sync="shipDialogVisible" title="发货">
      <el-form
        ref="shipForm"
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="clickShip">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  listOrder,
  delOrder,
  getOrder,
  refundOrder,
  listChannel,
  clickShip
} from '@/api/shop/order'
import { yuan } from '@/utils'

const statusMap = {
  101: '未付款',
  102: '用户取消',
  103: '系统取消',
  201: '已付款',
  202: '申请退款',
  203: '已退款',
  301: '已发货',
  401: '用户收货',
  402: '系统收货'
}

export default {
  filters: {
    orderStatusFilter(status) {
      return statusMap[status]
    },
    yuan
  },
  data() {
    return {
      loading: true,
      // 列表总数
      total: 0,
      // 日期范围
      dateRange: [],
      // 订单状态数据字典
      orderStatusOptions: [],
      // 查询参数
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        sortName: 'createTime',
        sort: 'desc',
        orderSn: undefined,
        userId: undefined,
        name: undefined
      },
      // 角色列表
      orderList: [],
      orderDialogVisible: false,
      orderDetail: {
        order: {},
        user: {},
        orderGoods: []
      },
      channels: [],
      shipForm: {
        orderId: undefined,
        shipChannel: undefined,
        shipSn: undefined
      },
      shipFormRules: {
        shipChannel: [
          { required: true, message: '发货渠道不能为空', trigger: 'blur' }
        ],
        shipSn: [
          { required: true, message: '发货编号不能为空', trigger: 'blur' }
        ]
      },
      shipDialogVisible: false
    }
  },
  created() {
    this.getList()
    this.getChannel()
    this.getDicts('orderStatus').then((response) => {
      const {
        map: { data }
      } = response
      this.orderStatusOptions = data
    })
  },
  methods: {
    getChannel() {
      listChannel().then((response) => {
        this.channels = response.map.data
      })
    },
    handleQuery() {
      this.getList()
    },
    /**
     * 表单重置
     */
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.dateRange = []
      this.handleQuery()
    },
    async getList() {
      const {
        map: {
          page: { records: data, total }
        }
      } = await listOrder(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.orderList = data
      this.loading = false
    },
    /**
     * 后端排序
     */
    handleSortChange(sort) {
      this.queryForm.sortName = sort.prop
      this.queryForm.sortOrder = sort.order
      this.getList()
    },
    async handleDetail(row) {
      const {
        map: { data }
      } = await getOrder(row.id)
      this.orderDetail = data
      this.orderDialogVisible = true
    },
    handleShip(row) {
      this.shipForm = {
        orderId: row.id,
        shipChannel: undefined,
        shipSn: undefined
      }
      this.shipDialogVisible = true
    },
    clickShip(row) {
      this.$refs['shipForm'].validate(async(valid) => {
        if (valid) {
          const { code, msg } = await clickShip(this.shipForm)
          if (code === 200) {
            this.$message.success('发货成功')
            this.shipDialogVisible = false
            this.getList()
          } else {
            this.$message.error(msg)
          }
        }
      })
    },
    handleRefund(row) {
      this.$confirm(
        '是否确认为订单编号为 [' + row.orderSn + '] 的订单退款?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return refundOrder(row.id)
        })
        .then(() => {
          this.getList()
          this.$message.success('退款成功')
        })
        .catch(function(e) {})
    },
    /**
     * 删除按钮
     */
    async handleDelete(row) {
      const orderId = row.id
      this.$confirm(
        '是否确认删除订单编号为 [' + row.orderSn + '] 的订单吗?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delOrder(orderId)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function(e) {})
    }
  }
}
</script>
<style lang="scss" scoped>
.more_btn{
  margin-left: 10px;
}
</style>
