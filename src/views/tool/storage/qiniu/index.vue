<template>
  <div
    v-loading="syncLoading"
    class="app-container"
    element-loading-text="正在同步"
    element-loading-spinner="el-icon-loading"
  >
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="文件名" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入文件名"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上传时间">
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
          @click="open = true"
        >上传</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          class="filter-item"
          size="mini"
          type="success"
          icon="el-icon-s-tools"
          @click="doConfig"
        >配置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          class="filter-item"
          size="mini"
          type="warning"
          icon="el-icon-s-promotion"
          @click="handleSync"
        >同步</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          class="filter-item"
          size="mini"
          type="danger"
          icon="el-icon-delete"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <!-- 文件上传 -->
    <el-dialog
      :visible.sync="open"
      :close-on-click-modal="false"
      append-to-body
      width="500px"
      @close="doSubmit"
    >
      <el-upload
        :before-remove="handleBeforeRemove"
        :on-success="handleSuccess"
        :on-error="handleError"
        :headers="headers"
        :action="uploadPath"
        class="avatar-uploader"
        multiple
      >
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" style="display: block" class="el-upload__tip">
          请勿上传违法文件，且文件不超过15M
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="doSubmit">确认</el-button>
      </div>
    </el-dialog>
    <!--表单组件-->
    <eForm ref="form" />
    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="loading"
      border
      :data="fileList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        prop="name"
        :show-overflow-tooltip="true"
        align="center"
        label="文件名"
        width="330"
      >
        <template slot-scope="scope">
          <a
            href="JavaScript:"
            class="el-link el-link--primary"
            target="_blank"
            type="primary"
            @click="download(scope.row.contentId)"
          >{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        prop="suffix"
        align="center"
        label="文件类型"
      />
      <el-table-column prop="bucket" align="center" label="空间名称" />
      <el-table-column prop="size" align="center" label="文件大小" />
      <el-table-column prop="type" align="center" label="空间类型" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
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
import { list, del, download, syncQiniu } from '@/api/tool/qiniu'
import { getToken } from '@/utils/auth'
import eForm from './form'
import { uploadPath } from '@/api/tool/qiniu'

export default {
  components: {
    eForm
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 同步遮罩层
      syncLoading: false,
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
      // 文件列表
      fileList: [],
      files: [],
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {
        title: undefined,
        status: 0,
        sort: undefined,
        imgUrl: undefined,
        jumpUrl: undefined
      },
      // 上传文件路径
      uploadPath,
      // 上传路径header设置
      headers: { Authorization: 'Bearer ' + getToken() },
      // 下载链接
      url: ''
    }
  },
  watch: {
    url(newVal, oldVal) {
      if (newVal && this.newWin) {
        this.newWin.sessionStorage.clear()
        this.newWin.location.href = newVal
        // 重定向后把url和newWin重置
        this.url = ''
        this.newWin = null
      }
    }
  },
  created() {
    // 点击tab切换时，进行初始化
    // this.getList()
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
      } = await list(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.fileList = data
      this.loading = false
    },
    /**
     * 当选择项发生变化时会触发该事件
     */
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.contentId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    // 七牛云配置
    doConfig() {
      const _this = this.$refs['form']
      _this.dialog = true
      _this.init()
    },
    /**
     * 删除按钮
     */
    async handleDelete(row) {
      const contentIds = row.contentId || this.ids
      this.$confirm('是否确认删除编号为 [' + contentIds + '] 的文件?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return del(contentIds)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function(e) {})
    },
    handleSync() {
      this.syncLoading = true
      syncQiniu()
        .then((res) => {
          this.syncLoading = false
          this.$message.success('同步完成')
          this.getList()
        })
        .finally(() => {
          this.syncLoading = false
        })
    },
    handleSuccess(response, file, fileList) {
      const uid = file.uid
      const id = response.id
      this.files.push({ uid, id })
    },
    // 监听上传失败
    handleError(e, file, fileList) {
      const msg = JSON.parse(e.message)
      console.log(msg)
    },
    handleBeforeRemove(file, fileList) {
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].uid === file.uid) {
          del([this.files[i].id]).then((res) => {})
          return true
        }
      }
    },
    // 下载文件
    download(id) {
      // 先打开一个空的新窗口，再请求
      this.newWin = window.open()
      download(id)
        .then((res) => {
          this.url = res.map.url
        })
        .catch((err) => {
          console.log(err.response.data.message)
        })
    },
    doSubmit() {
      this.open = false
      this.getList()
    }
  }
}
</script>
