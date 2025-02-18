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
          @click="handleAdd"
        >新增</el-button>
      </el-col>
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
            v-hasPermi="['system:common:reply']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleReply(scope.row)"
          >回复</el-button>
          <el-button
            v-hasPermi="['system:common:delete']"
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
    <el-dialog
      :visible.sync="addCommentOpen"
      title="回复"
      width="600px"
      :close-on-click-modal="false"
      :before-close="addCommentClose"
    >
      <el-form
        ref="commentFrom"
        :model="commentFrom"
        :rules="rulesCommentFrom"
        label-width="80px"
      >
        <el-form-item label="商品ID" prop="valueId">
          <el-input v-model="commentFrom.valueId" placeholder="请输入商品ID" />
        </el-form-item>
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="commentFrom.username" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户头像" prop="avatar">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadPicUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png, .gif"
          >
            <img v-if="commentFrom.avatar" :src="commentFrom.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
            <div slot="tip" class="el-upload__tip">只能上传jpg、jpeg、png、gif文件</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="评论内容" prop="content">
          <el-input
            v-model="commentFrom.content"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>

        <el-form-item label="评论图片">
          <el-upload
            :action="uploadPath"
            :limit="5"
            :headers="headers"
            :on-exceed="uploadOverrun"
            :on-success="handleGalleryUrl"
            :on-remove="handleRemove"
            multiple
            accept=".jpg, .jpeg, .png, .gif"
            list-type="picture-card"
          >
            <i class="el-icon-plus" />
            <div slot="tip" class="el-upload__tip">只能上传jpg、jpeg、png、gif文件，800 x 800</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="评论评分" prop="star">
          <el-rate v-model="commentFrom.star" show-text style="margin-top: 10px;" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addCommentForm">确定</el-button>
        <el-button @click="addCommentClose">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  listComment,
  getComment,
  addComment,
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
      rulesCommentFrom: {
        content: [
          { required: true, message: '回复内容不能为空', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' }
        ]
      },
      // 状态数据字典
      commentTypeOptions: [],
      starLevelOptions: [],
      // 上传文件路径
      uploadPath,
      // 上传路径header设置
      headers: { Authorization: 'Bearer ' + getToken() },
      addCommentOpen: false,
      commentFrom: {
        content: '',
        type: 1,
        avatar: '',
        username: '',
        star: 4,
        hasPicture: false,
        picUrls: []
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('commentType').then((response) => {
      const {
        data
      } = response
      this.commentTypeOptions = data
    })
    this.getDicts('starLevel').then((response) => {
      const {
        data
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
        data: { records: data, total }
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
        data
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
    },
    uploadPicUrl: function(response) {
      this.commentFrom.avatar = response.data
    },
    checkFileSize: function(file) {
      if (file.size > 1048576) {
        this.$message.error(
          `${file.name}文件大于1024KB，请选择小于1024KB大小的图片`
        )
        return false
      }
      return true
    },
    uploadOverrun: function() {
      this.$message({
        type: 'error',
        message: '上传文件个数超出限制!最多上传5张图片!'
      })
    },
    // 上传商品画廊
    handleGalleryUrl(response, file, fileList) {
      if (response.code === 200) {
        this.commentFrom.picUrls.push(response.data)
      }
    },
    // 移除商品画廊
    handleRemove: function(file, fileList) {
      for (let i = 0; i < this.commentFrom.picUrls.length; i++) {
        // 这里存在两种情况
        // 1. 如果所删除图片是刚刚上传的图片，那么图片地址是file.response.data.url
        //    此时的file.url虽然存在，但是是本机地址，而不是远程地址。
        // 2. 如果所删除图片是后台返回的已有图片，那么图片地址是file.url
        let url
        if (file.response === undefined) {
          url = file.url
        } else {
          url = file.response.data
        }

        if (this.commentFrom.picUrls[i] === url) {
          this.commentFrom.picUrls.splice(i, 1)
        }
      }
    },
    handleAdd() {
      this.addCommentOpen = true
    },
    addCommentClose() {
      this.addCommentOpen = false
      this.commentFrom = {}
      this.$refs['commentFrom'].resetFields()
    },
    addCommentForm() {
      if (this.commentFrom.picUrls.length > 0) this.commentFrom.hasPicture = true
      console.log(this.commentFrom)
      this.$refs['commentFrom'].validate((valid) => {
        if (valid) {
          addComment(this.commentFrom).then(response => {
            this.$message.success('添加成功')
            this.addCommentOpen = false
            this.commentFrom = {}
            this.$refs['commentFrom'].resetFields()
            this.getList()
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
