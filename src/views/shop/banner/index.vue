<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="banner标题" prop="title">
        <el-input
          v-model="queryForm.title"
          size="small"
          placeholder="请输入banner标题"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryForm.status"
          placeholder="banner状态"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in statusOptions"
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
      :data="bannerList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="120" />
      <el-table-column label="标题" prop="title" width="200" />
      <el-table-column label="图片" prop="imgUrl" width="200">
        <template slot-scope="scope">
          <img v-if="scope.row.imgUrl" :src="scope.row.imgUrl" width="80">
        </template>
      </el-table-column>
      <el-table-column label="跳转链接" prop="jumpUrl" width="200" />
      <el-table-column label="排序" prop="sort" />
      <el-table-column label="状态" width="100" :formatter="statusFormat" />
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

    <!-- 添加或修改banner对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="channelDialogHandleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="图片" prop="imgUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png, .gif"
          >
            <img v-if="form.imgUrl" :src="form.imgUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过1024kb</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="跳转链接" prop="jumpUrl">
          <el-input v-model="form.jumpUrl" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{ dict.name }}</el-radio>
          </el-radio-group>
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
  listBanner,
  getBanner,
  addBanner,
  updateBanner,
  delBanner
} from '@/api/shop/banner'
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
        title: undefined,
        status: undefined
      },
      // 角色列表
      bannerList: [],
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 表单参数
      form: {
        title: undefined,
        status: 0,
        sort: undefined,
        imgUrl: undefined,
        jumpUrl: undefined
      },
      // 表单校验
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        imgUrl: [{ required: true, message: '图片不能为空', trigger: 'blur' }],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ],
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
      } = await listBanner(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.bannerList = data
      this.loading = false
    },
    /**
     * 当选择项发生变化时会触发该事件
     */
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.roleId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /**
     * switch 状态发生变化时的回调函数
     */
    handleSwitchChange(row) {
      const text = row.status === 0 ? '启用' : '停用'
      this.$confirm('确认要 "' + text + '"该banner吗?', '警告', {
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
    /**
     * 添加按钮
     */
    handleAdd(row) {
      this.title = '添加banner'
      this.open = true
    },
    /**
     * 修改按钮
     */
    async handleUpdate(row) {
      const {
        map: { data }
      } = await getBanner(row.id)
      this.form = data
      this.title = '修改banner'
      this.open = true
    },
    /**
     * 删除按钮
     */
    async handleDelete(row) {
      const channelIds = row.id || this.ids
      this.$confirm(
        '是否确认删除编号为 [' + channelIds + '] 的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delBanner(channelIds)
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
        sort: undefined,
        code: undefined,
        remark: undefined,
        status: 0
      }
      this.$refs['form'].resetFields()
    },
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.echoDictName(this.statusOptions, row.status)
    },
    /**
     * banner对话框关闭
     */
    channelDialogHandleClose() {
      this.reset()
      this.open = false
    },
    uploadUrl: function(response) {
      this.form.imgUrl = response.map.url
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
    /**
     * 提交banner表单
     */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateBanner(this.form).then((response) => {
              this.updateHandle(response, this)
            })
          } else {
            addBanner(this.form).then((response) => {
              this.saveHandle(response, this)
            })
          }
        }
      })
    }
  }
}
</script>
