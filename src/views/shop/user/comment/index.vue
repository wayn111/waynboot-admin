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
          v-hasPermi="['system:dict:remove']"
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
      :data="commentList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="60" />
      <el-table-column label="用户ID" prop="userId" width="80" />
      <el-table-column label="评论类型" prop="type" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.type == 0 ? '商品评论' : '专题评论' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评论内容" prop="content" width="280">
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
      <el-table-column align="center" label="评论图片" prop="picUrls">
        <template slot-scope="scope">
          <el-image
            v-for="(item, index) in scope.row.picUrls"
            :key="index"
            :src="item"
            :preview-src-list="scope.row.picUrls"
            :lazy="true"
            style="width: 40px; height: 40px; margin-right: 5px"
          />
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
            @click="handleReply(scope.row)"
          >回复</el-button>
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

    <!-- 管理员回复对话框 -->
    <el-dialog
      :visible.sync="open"
      title="回复"
      width="600px"
      :close-on-click-modal="false"
      :before-close="replyDialogHandleClose"
    >
      <el-form
        ref="replyForm"
        :model="replyForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="回复内容" prop="adminContent">
          <el-input
            v-model="replyForm.adminContent"
            type="textarea"
            placeholder="请输入内容"
          />
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
import {
  listComment,
  getComment,
  updateComment,
  delComment
} from '@/api/shop/user/comment'
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
      // 管理员回复表单
      replyForm: {
        id: undefined,
        adminContent: undefined
      },
      // 表单校验
      rules: {
        adminContent: [
          { required: true, message: '回复内容不能为空', trigger: 'blur' }
        ]
      },
      // 状态数据字典
      commentTypeOptions: [],
      starLevelOptions: [],
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const commentIds = row.id || this.ids
      this.$confirm(
        '是否确认删除评论编号为"' + commentIds + '"的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delComment(commentIds)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function() {})
    },
    /**
     * 编辑操作
     */
    async handleReply(row) {
      const {
        map: { data }
      } = await getComment(row.id)
      this.replyForm['id'] = data.id
      this.replyForm['adminContent'] = data.adminContent
      this.open = true
    },
    /**
     * 提交会员表单
     */
    submitForm() {
      this.$refs['replyForm'].validate((valid) => {
        if (valid) {
          if (this.replyForm.id !== undefined) {
            updateComment(this.replyForm).then((response) => {
              this.updateHandle(response, this)
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
