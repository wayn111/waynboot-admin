<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="分类ID" prop="id">
        <el-input
          v-model="queryForm.id"
          size="small"
          placeholder="请输入分类ID"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入分类名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="categoryList"
      row-key="id"
      :default-expand-all="false"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column align="center" label="类目ID" prop="id" />
      <el-table-column align="center" label="类目名" prop="name" />
      <el-table-column align="center" property="iconUrl" label="类目图标">
        <template slot-scope="scope">
          <img v-if="scope.row.iconUrl" :src="scope.row.iconUrl" width="40">
        </template>
      </el-table-column>
      <el-table-column align="center" property="picUrl" label="类目图片">
        <template slot-scope="scope">
          <img v-if="scope.row.picUrl" :src="scope.row.picUrl" width="80">
        </template>
      </el-table-column>
      <el-table-column align="center" label="关键字" prop="keywords" />
      <el-table-column align="center" label="排序" prop="sort" />
      <el-table-column align="center" min-width="100" label="简介" prop="desc" />
      <el-table-column align="center" label="级别" prop="level">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.level === 'L1' ? 'primary' : 'info' "
          >{{ scope.row.level === 'L1' ? '一级类目' : '二级类目' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.level == 'L1'"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
          >添加</el-button>
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

    <!-- 添加或修改分类对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="categoryDialogHandleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" size="mini">
        <el-form-item label="标题" prop="name">
          <el-input v-model="form.name" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="上级分类">
          <treeselect
            v-model="form.pid"
            :options="categoryOptions"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="选择上级分类"
          />
        </el-form-item>
        <el-form-item label="关键字" prop="keywords">
          <el-input v-model="form.keywords" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="简介" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="图标图片" prop="iconUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadIconUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png"
          >
            <img v-if="form.iconUrl" :src="form.iconUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="分类图片" prop="picUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadPicUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png, .gif"
          >
            <img v-if="form.picUrl" :src="form.picUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="categoryDialogHandleClose">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  listCategory,
  getCategory,
  addCategory,
  updateCategory,
  delCategory
} from '@/api/shop/category'
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getToken } from '@/utils/auth'
import { uploadPath } from '@/api/upload'

export default {
  components: {
    Treeselect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 添加/修改对话框 title
      title: '',
      // 查询参数
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        id: undefined,
        name: undefined
      },
      // 分类列表
      categoryList: [],
      // 分类树
      categoryOptions: [],
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {
        id: undefined,
        sort: undefined,
        name: '',
        keywords: '',
        level: 'L2',
        pid: 0,
        desc: '',
        iconUrl: '',
        picUrl: ''
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        iconUrl: [{ required: true, message: '图标不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
        picUrl: [{ required: true, message: '图片不能为空', trigger: 'blur' }]
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
        map: { data }
      } = await listCategory(this.queryForm)
      this.categoryList = this.buildTree(data, 'id', 'pid')
      this.loading = false
    },
    /**
     * 添加按钮
     */
    handleAdd(row) {
      this.getTreeselect()
      if (!row) {
        row.id = 0
      }
      this.form.pid = row.id
      this.title = '添加分类'
      this.open = true
    },
    /**
     * 修改按钮
     */
    async handleUpdate(row) {
      this.getTreeselect()
      const {
        map: { data }
      } = await getCategory(row.id)
      this.form = data
      this.title = '修改分类'
      this.open = true
    }, /**
     * 删除按钮
     */
    async handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除编号为 [' + ids + '] 的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return delCategory(ids)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function(e) {})
    },
    /**
     * 查询菜单下拉树结构
     */
    async getTreeselect() {
      const {
        map: { data }
      } = await listCategory()
      this.categoryOptions = []
      const category = { id: 0, name: '主类目', children: [] }
      const l1Data = data.filter(item => {
        return item.level === 'L1'
      })
      category.children = this.buildTree(l1Data, 'id', 'pid')
      this.categoryOptions.push(category)
    },
    /**
     * 转换菜单数据结构
     */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    },
    /**
     * 表单重置
     */
    reset() {
      this.form = {
        id: undefined,
        sort: undefined,
        name: '',
        keywords: '',
        level: 'L2',
        pid: 0,
        desc: '',
        iconUrl: '',
        picUrl: ''
      }
      this.$refs['form'].resetFields()
    },
    /**
     * 分类对话框关闭
     */
    categoryDialogHandleClose() {
      this.reset()
      this.open = false
    },
    uploadIconUrl: function(response) {
      this.form.iconUrl = response.map.url
    },
    uploadPicUrl: function(response) {
      this.form.picUrl = response.map.url
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
     * 提交分类表单
     */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateCategory(this.form).then(response => {
              this.updateHandle(response, this)
            })
          } else {
            // 分类pid为0时，为一级分类，默认二级
            if (this.form.pid === 0) {
              this.form.level = 'L1'
            }
            addCategory(this.form).then(response => {
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
.avatar-uploader {
  .avatar-uploader-icon {
    font-size: 18px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
  }
}
</style>
