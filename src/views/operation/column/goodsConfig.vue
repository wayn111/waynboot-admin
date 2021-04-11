<template>
  <div>
    <el-form ref="goodsQueryForm" :inline="true" :model="goodsQueryForm">
      <el-form-item label="商品编号" prop="goodsSn">
        <el-input
          v-model="goodsQueryForm.goodsSn"
          size="small"
          placeholder="请输入商品编号"
          @keyup.enter.native="goodsHandleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="goodsQueryForm.name"
          size="small"
          placeholder="请输入商品名称"
          @keyup.enter.native="goodsHandleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="goodsHandleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="goodsResetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>
    <el-tabs v-model="activeTab" tab-position="left" @tab-click="tabClick">
      <el-tab-pane label="已添加" name="bind">
        <el-table
          v-loading="goodsLoading"
          border
          :data="bindGoodsList"
          style="width: 100%"
          max-height="580px"
        >
          <el-table-column align="center" label="商品编号" prop="goodsSn" />
          <el-table-column
            align="center"
            min-width="150"
            label="名称"
            prop="name"
            show-overflow-tooltip
          />
          <el-table-column align="center" property="iconUrl" label="图片">
            <template slot-scope="scope">
              <img :src="scope.row.picUrl" width="30">
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="市场售价"
            prop="counterPrice"
          />
          <el-table-column align="center" label="当前价格" prop="retailPrice" />
          <el-table-column align="center" label="是否新品" prop="isNew">
            <template slot-scope="scope">
              <el-tag :type="scope.row.isNew ? 'success' : 'error'">{{
                scope.row.isNew ? '新品' : '非新品'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="是否热品" prop="isHot">
            <template slot-scope="scope">
              <el-tag :type="scope.row.isHot ? 'success' : 'error'">{{
                scope.row.isHot ? '热品' : '非热品'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="是否在售" prop="isOnSale">
            <template slot-scope="scope">
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
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="danger"
                @click="columGodosRemove(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="goodsTotal"
          :total="goodsTotal"
          :page.sync="goodsQueryForm.pageNum"
          :limit.sync="goodsQueryForm.pageSize"
          @pagination="getBindGoodsList"
        />
      </el-tab-pane>
      <el-tab-pane label="未添加" name="unBind">
        <el-table
          v-loading="goodsLoading"
          border
          :data="unBindGoodsList"
          style="width: 100%"
          max-height="580px"
        >
          <el-table-column align="center" label="商品编号" prop="goodsSn" />
          <el-table-column
            align="center"
            min-width="150"
            label="名称"
            prop="name"
            show-overflow-tooltip
          />
          <el-table-column align="center" property="iconUrl" label="图片">
            <template slot-scope="scope">
              <img :src="scope.row.picUrl" width="30">
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="市场售价"
            prop="counterPrice"
          />
          <el-table-column align="center" label="当前价格" prop="retailPrice" />
          <el-table-column align="center" label="是否新品" prop="isNew">
            <template slot-scope="scope">
              <el-tag :type="scope.row.isNew ? 'success' : 'error'">{{
                scope.row.isNew ? '新品' : '非新品'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="是否热品" prop="isHot">
            <template slot-scope="scope">
              <el-tag :type="scope.row.isHot ? 'success' : 'error'">{{
                scope.row.isHot ? '热品' : '非热品'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="是否在售" prop="isOnSale">
            <template slot-scope="scope">
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
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="columGodosAdd(scope.row)"
              >添加</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="goodsTotal"
          :total="goodsTotal"
          :page.sync="goodsQueryForm.pageNum"
          :limit.sync="goodsQueryForm.pageSize"
          @pagination="getUnBindGoodsList"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import {
  addColumnGooods,
  removeColumnGooods,
  bindGoodsList,
  unBindGoodsList
} from '@/api/shop/column'
export default {
  props: {
    columnId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      // 商品配置弹窗遮罩层
      goodsLoading: true,
      // 商品总数
      goodsTotal: 0,
      // 商品配置选中tab
      activeTab: 'bind',
      // 商品配置查询参数
      goodsQueryForm: {
        pageNum: 1,
        pageSize: 10,
        goodsSn: undefined,
        name: undefined
      },
      // 绑定商品列表
      bindGoodsList: [],
      // 未绑定商品列表
      unBindGoodsList: []
    }
  },
  watch: {
    columnId() {
      this.activeTab = 'bind'
      this.goodsResetQuery()
    }
  },
  created() {
    this.activeTab = 'bind'
    this.goodsResetQuery()
  },
  methods: {
    goodsHandleQuery() {
      if (this.activeTab === 'bind') {
        this.getBindGoodsList()
      } else {
        this.getUnBindGoodsList()
      }
    },
    /**
     * 商品配置表单重置
     */
    goodsResetQuery() {
      this.goodsLoading = true
      this.goodsQueryForm = {
        pageNum: 1,
        pageSize: 10,
        goodsSn: undefined,
        name: undefined
      }
      this.goodsHandleQuery()
    },
    /**
     * 获取已添加商品
     */
    async getBindGoodsList() {
      this.goodsQueryForm.columnId = this.columnId
      const {
        map: {
          page: { records: data, total }
        }
      } = await bindGoodsList(
        this.addDateRange(this.goodsQueryForm, this.dateRange)
      )
      this.goodsTotal = total
      this.bindGoodsList = data
      this.goodsLoading = false
    },
    /**
     * 获取未添加商品
     */
    async getUnBindGoodsList() {
      this.goodsQueryForm.columnId = this.columnId
      const {
        map: {
          page: { records: data, total }
        }
      } = await unBindGoodsList(
        this.addDateRange(this.goodsQueryForm, this.dateRange)
      )
      this.goodsTotal = total
      this.unBindGoodsList = data
      this.goodsLoading = false
    },
    /**
     * 已添加/未添加tab切换
     */
    tabClick(val) {
      this.goodsLoading = true
      this.goodsTotal = 0
      this.$refs.goodsQueryForm.resetFields()
      if (val.index === '0') {
        this.getBindGoodsList()
      } else {
        this.getUnBindGoodsList()
      }
    },
    /**
     * 栏目商品添加
     */
    columGodosAdd(row) {
      this.goodsLoading = true
      const goodsId = row.id
      const columnId = this.columnId
      addColumnGooods({ goodsId, columnId })
        .then((res) => {
          this.$message.success('添加成功')
          this.getUnBindGoodsList()
        })
        .finally(() => {
          this.goodsLoading = false
        })
    },
    /**
     * 栏目商品删除
     */
    columGodosRemove(row) {
      this.goodsLoading = true
      const goodsId = row.id
      const columnId = this.columnId
      removeColumnGooods({ goodsId, columnId })
        .then((res) => {
          this.$message.success('删除成功')
          this.getBindGoodsList()
        })
        .finally(() => {
          this.goodsLoading = false
        })
    }
  }
}
</script>
