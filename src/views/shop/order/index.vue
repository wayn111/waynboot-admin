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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd()">新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="orderList" style="width: 100%">
      <el-table-column align="center" min-width="100" label="订单ID" prop="id" />
      <el-table-column align="center" min-width="100" label="订单编号" prop="orderSn" />
      <el-table-column align="center" label="用户ID" prop="userId" />
      <el-table-column align="center" label="订单状态">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单金额/元">
        <template slot-scope="scope">{{ scope.row.orderPrice | yuan }}</template>
      </el-table-column>
      <el-table-column align="center" label="支付金额/元">
        <template slot-scope="scope">{{ scope.row.actualPrice | yuan }}</template>
      </el-table-column>
      <el-table-column align="center" label="支付时间" prop="payTime" />
      <el-table-column align="center" label="物流单号" prop="shipSn" />
      <el-table-column align="center" label="物流渠道" prop="shipChannel" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <el-button size="mini" type="text" icon="el-icon-edit" @click="handleView(scope.row)">查看</el-button>
        <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
      </el-table-column>
    </el-table>
  </div>
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
  </div>
</template>
<script>
import { listOrder, delOrder, getOrder } from '@/api/shop/order'
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
      // 查询参数
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        orderSn: undefined,
        userId: undefined,
        name: undefined
      },
      // 角色列表
      orderList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
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
    handleView(row) {},
    /**
     * 删除按钮
     */
    async handleDelete(row) {
      const orderId = row.id
      this.$confirm(
        '是否确认删除订单编号为 [' + orderId + '] 的数据项?',
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
