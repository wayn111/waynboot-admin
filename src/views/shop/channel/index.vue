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
      <el-form-item label="栏目编码" prop="code">
        <el-input
          v-model="queryForm.code"
          size="small"
          placeholder="请输入栏目编码"
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

    <el-table
      v-loading="loading"
      border
      :data="channelList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="120" />
      <el-table-column label="栏目名称" prop="name" width="200" />
      <el-table-column label="栏目编码" prop="code" width="200" />
      <el-table-column label="备注" prop="remark" />
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

    <!-- 添加或修改栏目对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="channelDialogHandleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="栏目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入栏目名称" />
        </el-form-item>
        <el-form-item label="栏目编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入栏目编码" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
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
  listChannel,
  getChannel,
  addChannel,
  updateChannel,
  delChannel
} from '@/api/shop/channel'

export default {
  data() {
    const checkCode = (rule, value, callback) => {
      const reg = new RegExp(/^[a-zA-Z0-9]+$/)

      if (!value) {
        return callback(new Error('栏目编码不能为空'))
      }
      setTimeout(() => {
        if (!reg.test(value)) {
          callback(new Error('请输入字母或者数字值'))
        } else {
          callback()
        }
      }, 500)
    }

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
      // 日期范围
      dateRange: [],
      // 查询参数
      queryForm: {
        deptName: undefined,
        deptStatus: undefined
      },
      // 角色列表
      channelList: [],
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {
        name: undefined,
        code: undefined,
        remark: undefined
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: '栏目名称不能为空', trigger: 'blur' }
        ],
        code: [{ required: true, validator: checkCode, trigger: 'blur' }]
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
        map: { channelList }
      } = await listChannel(this.addDateRange(this.queryForm, this.dateRange))
      this.channelList = channelList
      this.loading = false
    },
    /**
     * 当选择项发生变化时会触发该事件
     */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.roleId)
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
      const {
        map: { data }
      } = await getChannel(row.id)
      this.form = data
      this.title = '修改栏目'
      this.open = true
    }, /**
     * 删除按钮
     */
    async handleDelete(row) {
      const channelIds = row.id || this.ids
      this.$confirm(
        '是否确认删除栏目编号为 [' + channelIds + '] 的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delChannel(channelIds)
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
        name: undefined,
        code: undefined,
        remark: undefined
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
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateChannel(this.form).then(response => {
              this.updateHandle(response, this)
            })
          } else {
            addChannel(this.form).then(response => {
              this.saveHandle(response, this)
            })
          }
        }
      })
    }
  }
}
</script>
