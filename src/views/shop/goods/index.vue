<template>
  <div
    v-loading="syncLoading"
    element-loading-text="正在同步"
    element-loading-spinner="el-icon-loading"
    class="app-container"
  >
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="商品ID" prop="id">
        <el-input
          v-model="queryForm.id"
          size="small"
          placeholder="请输入商品ID"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品编号" prop="goodsSn">
        <el-input
          v-model="queryForm.goodsSn"
          size="small"
          placeholder="请输入商品编号"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入商品名称"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd()"
        >新增</el-button>
        <el-button
          type="success"
          icon="el-icon-position"
          size="mini"
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
        <template slot-scope="props">
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
            <el-form-item label="品牌商ID">
              <span>{{ props.row.brandId }}</span>
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
        <template slot-scope="scope">
          <img :src="scope.row.picUrl" width="40">
        </template>
      </el-table-column>
      <el-table-column align="center" property="iconUrl" label="分享图">
        <template slot-scope="scope">
          <img :src="scope.row.shareUrl" width="40">
        </template>
      </el-table-column>
      <el-table-column align="center" label="市场售价" prop="counterPrice" />
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
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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
import { listGoods, delGoods, syncEs } from '@/api/shop/goods'
import { getToken } from '@/utils/auth'
import { uploadPath } from '@/api/upload'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 同步遮罩层
      syncLoading: false,
      // 添加/修改对话框 title
      title: '',
      // 列表总数
      total: 0,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        id: undefined,
        goodsSn: undefined,
        name: undefined
      },
      // 角色列表
      goodsList: [],
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 表单参数
      form: {
        title: undefined,
        status: 0,
        imgUrl: undefined,
        jumpUrl: undefined
      },
      // 表单校验
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        imgUrl: [{ required: true, message: '图片不能为空', trigger: 'blur' }],
        jumpUrl: [
          { required: true, message: '跳转链接不能为空', trigger: 'blur' }
        ]
      },
      // 上传文件路径
      uploadPath,
      // 上传路径header设置
      headers: { Authorization: 'Bearer ' + getToken() }
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
      } = await listGoods(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.goodsList = data
      this.loading = false
    },
    handleAdd() {
      this.$router.push({ path: '/shop/goods/add' })
    },
    handleUpdate(row) {
      this.$router.push({ path: '/shop/goods/edit', query: { id: row.id }})
    },
    handleSyncEs() {
      this.syncLoading = true
      syncEs()
        .then((res) => {
          this.syncLoading = false
          this.$message.success('同步完成')
        })
        .finally(() => {
          this.syncLoading = false
        })
    },
    handleDelete(row) {
      const goodsId = row.id
      const goodsSn = row.goodsSn
      this.$confirm(
        '是否确认删除商品编号为"' + goodsSn + '"的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delGoods(goodsId)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function() {})
    }
  }
}
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
