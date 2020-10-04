<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryForm.userId"
          size="small"
          placeholder="请输入用户ID"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评论类型" prop="type">
        <el-select
          v-model="queryForm.type"
          placeholder="评论类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in commentTypeOptions"
            :key="dict.value"
            :label="dict.name"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="评分等级" prop="star">
        <el-select
          v-model="queryForm.star"
          placeholder="评分等级"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in starLevelOptions"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd()"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="commentList" style="width: 100%">
      <el-table-column label="编号" prop="id" width="60" />
      <el-table-column label="用户ID" prop="userId" width="80" />
      <el-table-column label="评论类型" prop="type" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.type == 0 ? '商品评论' : '专题评论' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评论内容" prop="content" width="480">
        <template slot-scope="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="scope.row.content"
            placement="top-start"
          >
            <el-link :underline="false">{{
              toolTip(scope.row.content)
            }}</el-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="是否有图" prop="hasPicture" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.hasPicture ? '有图' : '无图' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="坪分" prop="star" width="190">
        <template slot-scope="scope">
          <el-rate v-model="scope.row.star" disabled show-text />
        </template>
      </el-table-column>
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
            @click="replyComment(scope.row)"
          >回复</el-button>
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

    <!-- 管理员回复对话框 -->
    <el-dialog
      :visible.sync="open"
      title="回复"
      width="600px"
      :before-close="replyDialogHandleClose"
    >
      <el-form
        ref="replayRef"
        :model="replyForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="replyForm.username" :disabled="true" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="replyDialogHandleClose">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { listComment, getComment, updateComment } from '@/api/shop/user/comment'
import { getToken } from '@/utils/auth'
import { uploadPath } from '@/api/upload'

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
        userId: undefined,
        type: undefined,
        star: undefined
      },
      // 角色列表
      commentList: [],
      // 是否显示弹出层
      open: false,
      // 用户编辑表单
      replyForm: {},
      // 表单校验
      rules: {
        nickname: [
          { required: true, message: '昵称不能为空', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' }
        ]
      },
      // 状态数据字典
      commentTypeOptions: [],
      // 上传文件路径
      uploadPath,
      // 上传路径header设置
      headers: { Authorization: 'Bearer ' + getToken() }
    }
  },
  created() {
    this.getList()
    this.getDicts('commentType').then((response) => {
      const {
        map: { data }
      } = response
      this.commentTypeOptions = data
    })
    this.getDicts('starLevel').then((response) => {
      const {
        map: { data }
      } = response
      this.starLevelOptions = data
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
      } = await listComment(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.commentList = data
      this.loading = false
    },
    /**
     * switch 状态发生变化时的回调函数
     */
    handleSwitchChange(row) {
      const text = row.status === 0 ? '启用' : '停用'
      this.$confirm('确认要 "' + text + '"该会员吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return new Promise()
        })
        .then(() => {
          this.$message.success(text + '成功')
        })
        .catch(function() {
          row.status = row.status === 0 ? 1 : 0
        })
    },
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.echoDictName(this.statusOptions, row.status)
    },
    /**
     * 会员对话框关闭
     */
    replyDialogHandleClose() {
      this.reset()
      this.open = false
    },
    /**
     * 表单重置
     */
    reset() {
      this.replyForm = {}
      this.$refs['replyForm'].resetFields()
    },
    /**
     * 编辑操作
     */
    async replyComment(row) {
      const {
        map: { data }
      } = await getComment(row.id)
      this.replyForm = data
      this.open = true
    },
    /**
     * 提交会员表单
     */
    submitForm() {
      this.$refs['replyForm'].validate((valid) => {
        if (valid) {
          if (this.replyForm.id !== undefined) {
            // updateMember(this.replyForm).then(response => {
            //   this.updateHandle(response, this)
            // })
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
