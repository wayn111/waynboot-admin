<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="queryForm.keyword"
          size="small"
          placeholder="请输入关键字"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否默认" prop="isDefault">
        <el-select
          v-model="queryForm.isDefault"
          placeholder="是否默认"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否热门" prop="isHot">
        <el-select
          v-model="queryForm.isHot"
          placeholder="是否热门"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="keywordList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" width="50" />
      <el-table-column label="关键字" prop="keyword" width="200" />
      <el-table-column label="默认关键字" prop="isDefault">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isDefault" type="success">是</el-tag>
          <el-tag v-else type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="热门关键字" prop="isHot">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isHot" type="success">是</el-tag>
          <el-tag v-else type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
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

    <!-- 添加或修改栏目对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="channelDialogHandleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="关键字" prop="keyword">
              <el-input v-model="form.keyword" placeholder="请输入关键字" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认搜索" prop="isDefault">
              <el-select
                v-model="form.isDefault"
                placeholder="默认搜索"
                clearable
                size="small"
              >
                <el-option label="是" :value="true" />
                <el-option label="否" :value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="热门推荐" prop="isHot">
              <el-select
                v-model="form.isHot"
                placeholder="热门推荐"
                clearable
                size="small"
              >
                <el-option label="是" :value="true" />
                <el-option label="否" :value="false" />
              </el-select>
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
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="channelDialogHandleClose">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  listKeyword,
  getKeyword,
  addKeyword,
  updateKeyword,
  delKeyword
} from '@/api/shop/keyword'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
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
        keyword: undefined,
        isDefault: undefined,
        isHot: undefined
      },
      // 角色列表
      keywordList: [],
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {
        keyword: undefined,
        isHot: undefined,
        isDefault: undefined,
        sort: 0
      },
      // 表单校验
      rules: {
        keyword: [
          { required: true, message: '栏目名称不能为空', trigger: 'blur' }
        ],
        isHot: [
          { required: true, message: '请选择是否热门', trigger: 'blur' }
        ],
        isDefault: [
          { required: true, message: '请选择是否默认', trigger: 'blur' }
        ]
      }
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
      } = await listKeyword(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.keywordList = data
      this.loading = false
    },
    /**
     * 当选择项发生变化时会触发该事件
     */
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /**
     * 添加按钮
     */
    handleAdd(row) {
      this.title = '添加栏目'
      this.open = true
    },
    /**
     * 修改按钮
     */
    async handleUpdate(row) {
      const keywordId = row.id || this.ids
      const {
        map: { data }
      } = await getKeyword(keywordId)
      this.form = data
      this.title = '修改栏目'
      this.open = true
    }, /**
     * 删除按钮
     */
    async handleDelete(row) {
      const keywordId = row.id || this.ids
      this.$confirm(
        '是否确认删除ID为 [' + keywordId + '] 的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delKeyword(keywordId)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function(e) {})
    },
    /**
     * 表单重置
     */
    reset() {
      this.form = {
        keyword: undefined,
        isHot: undefined,
        isDefault: undefined,
        sort: 0
      }
      this.$refs['form'].resetFields()
    },
    /**
     * 栏目对话框关闭
     */
    channelDialogHandleClose() {
      this.reset()
      this.open = false
    },
    /**
     * 提交栏目表单
     */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateKeyword(this.form).then((response) => {
              this.updateHandle(response, this)
            })
          } else {
            addKeyword(this.form).then((response) => {
              this.saveHandle(response, this)
            })
          }
        }
      })
    }
  }
}
</script>
