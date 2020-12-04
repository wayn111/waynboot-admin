<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="栏目名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入栏目名称"
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
      :data="columnList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="120" />
      <el-table-column label="栏目名称" prop="name" />
      <el-table-column label="排序" prop="sortOrder" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
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

    <el-dialog
      :title="title"
      :visible.sync="open"
      width="30%"
      :close-on-click-modal="false"
      :before-close="columnDialogHandleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="栏目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入栏目名称" />
        </el-form-item>
        <el-form-item label="栏目顺序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" controls-position="right" :min="0" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="columnDialogHandleClose">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  listColumn,
  getColumn,
  addColumn,
  updateColumn,
  delColumn
} from '@/api/shop/column'

export default {
  data: function() {
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
        name: undefined
      },
      // 角色列表
      columnList: [],
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 表单参数
      form: {
        name: undefined,
        sortOrder: 0
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        sortOrder: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('status').then((response) => {
      const {
        map: { data }
      } = response
      this.statusOptions = data
    })
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
      } = await listColumn(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.columnList = data
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
      const columnId = row.id || this.ids
      const {
        map: { data }
      } = await getColumn(columnId)
      this.form = data
      this.title = '修改栏目'
      this.open = true
    },
    /**
     * 删除按钮
     */
    async handleDelete(row) {
      const columnIds = row.id || this.ids
      this.$confirm(
        '是否确认删除栏目编号为 [' + columnIds + '] 的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delColumn(columnIds)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function(e) {})
    },
    /**
     * 角色对话框关闭
     */
    columnDialogHandleClose() {
      this.reset()
      this.open = false
    },
    /**
     * 表单重置
     */
    reset() {
      this.form = {
        name: undefined,
        sortOrder: undefined,
        code: undefined,
        remark: undefined,
        status: 0
      }
      this.$refs['form'].resetFields()
    },
    /**
     * 提交banner表单
     */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateColumn(this.form).then((response) => {
              this.updateHandle(response, this)
            })
          } else {
            addColumn(this.form).then((response) => {
              this.saveHandle(response, this)
            })
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
