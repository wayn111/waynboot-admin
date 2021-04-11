<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="会员ID" prop="memberId">
        <el-input
          v-model="queryForm.memberId"
          size="small"
          placeholder="请输入会员ID"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入会员名称"
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

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd()">新增</el-button>
      </el-col>
    </el-row> -->

    <el-table
      v-loading="loading"
      border
      :data="addressList"
      style="width: 100%"
    >
      <el-table-column label="编号" prop="id" width="120" />
      <el-table-column label="用户ID" prop="memberId" />
      <el-table-column label="用户名称" prop="name" />
      <el-table-column label="手机号" prop="tel" />
      <el-table-column label="省份" prop="province" />
      <el-table-column label="城市" prop="city" />
      <el-table-column label="区县" prop="county" />
      <el-table-column label="地址详情" prop="addressDetail" />
      <el-table-column label="城市ID" prop="areaCode" />
      <el-table-column label="邮编" prop="postalCode" />
      <el-table-column label="区县" prop="county" />
      <el-table-column label="是否默认">
        <template slot-scope="scope">
          <span>{{ scope.row.isDefault? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
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
import { listAddress } from '@/api/shop/user/address'

export default {
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
        id: undefined,
        name: undefined
      },
      // 角色列表
      addressList: []
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
      } = await listAddress(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.addressList = data
      this.loading = false
    }
  }
}
</script>
