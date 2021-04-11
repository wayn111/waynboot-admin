<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="金刚位名称" prop="name">
        <el-input
          v-model="queryForm.name"
          size="small"
          placeholder="请输入金刚位名称"
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
      :data="diamondList"
      style="width: 100%"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="100" />
      <el-table-column label="金刚位名称" prop="name" />
      <el-table-column label="图标" prop="iconUrl">
        <template slot-scope="scope">
          <img v-if="scope.row.iconUrl" :src="scope.row.iconUrl" width="50">
        </template>
      </el-table-column>
      <el-table-column label="图片" prop="picUrl">
        <template slot-scope="scope">
          <img v-if="scope.row.picUrl" :src="scope.row.picUrl" width="50">
        </template>
      </el-table-column>
      <el-table-column label="跳转类型" prop="jumpType">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.jumpType == 0">栏目</el-tag>
          <el-tag
            v-else-if="scope.row.jumpType == 1"
            type="success"
          >类目</el-tag>
          <el-tag v-else type="warning">链接</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" sortable="custom" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        sortable="custom"
      >
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

    <!-- 金刚位添加/修改单窗 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="34%"
      :close-on-click-modal="false"
      :before-close="columnDialogHandleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入金刚位名称" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="跳转类型" prop="jumpType">
              <el-select
                v-model="form.jumpType"
                placeholder="请选择跳转类型"
                @change="selectChange"
              >
                <el-option
                  v-for="item in jumpTypeOptions"
                  :key="item.value"
                  :label="item.name"
                  :value="parseInt(item.value)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="jumpColumn" label="选择栏目" prop="valueId">
              <el-select
                v-model="form.valueId"
                placeholder="请选择栏目"
                :loading="loading"
              >
                <el-option
                  v-for="item in columnList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              v-else-if="jumpCategory"
              label="选择分类"
              prop="valueId"
            >
              <el-cascader
                v-model="form.valueId"
                :options="categoryList"
                :props="props"
                clearable
                @change="handleCategoryChange"
              />
            </el-form-item>
            <el-form-item v-if="jumpUrl" label="链接地址" prop="valueUrl">
              <el-input v-model="form.valueUrl" placeholder="请输入链接地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="图标" prop="iconUrl">
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
        <el-form-item label="图片" prop="picUrl">
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
        <el-form-item label="顺序" prop="sort">
          <el-input-number
            v-model="form.sort"
            controls-position="right"
            :min="0"
          />
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
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="columnDialogHandleClose">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 商品配置弹窗 -->
    <el-dialog
      title="商品配置"
      :close-on-click-modal="false"
      :visible.sync="goodsOpen"
      top="1vh"
      width="70%"
    >
      <span slot="footer" class="dialog-footer">
        <el-button @click="goodsOpen = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  listDiamond,
  getDiamond,
  addDiamond,
  updateDiamond,
  delDiamond
} from '@/api/shop/diamond'
import { listAllColumn } from '@/api/shop/column'
import { listCategory } from '@/api/shop/category'
import { getToken } from '@/utils/auth'
import { uploadPath } from '@/api/upload'

export default {
  data: function() {
    return {
      // 遮罩层
      loading: true,
      selectLoading: true,
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
      // 金刚位列表
      diamondList: [],
      // 商品分类
      categoryList: [],
      // el-cascader’s props
      props: { label: 'name', value: 'id', expandTrigger: 'hover' },
      // 是否显示弹出层
      open: false,
      // 商品配置弹出层
      goodsOpen: false,
      // 状态数据字典
      jumpTypeOptions: [],
      statusOptions: [],
      columnList: [],
      // 表单参数
      form: {
        name: undefined,
        iconUrl: '',
        jumpType: undefined,
        valueId: undefined,
        valueUrl: undefined,
        picUrl: '',
        status: 0,
        sort: 0
      },
      jumpColumn: false,
      jumpCategory: false,
      jumpUrl: false,
      // 表单校验
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        jumpType: [
          { required: true, message: '跳转类型不能为空', trigger: 'blur' }
        ],
        iconUrl: [{ required: true, message: '图标不能为空', trigger: 'blur' }],
        picUrl: [{ required: true, message: '图片不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
      },
      // 上传文件路径
      uploadPath,
      // 上传路径header设置
      headers: { Authorization: 'Bearer ' + getToken() }
    }
  },
  created() {
    this.getList()
    this.getDicts('diamondJumpType').then((response) => {
      const {
        map: { data }
      } = response
      this.jumpTypeOptions = data
    })
    this.getDicts('status').then((response) => {
      const {
        map: { data }
      } = response
      this.statusOptions = data
    })
    listAllColumn()
      .then((res) => {
        this.columnList = res.map.data
      })
      .catch((e) => {})
    this.getCategoryList()
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
    selectChange(val) {
      this.jumpColumn = false
      this.jumpCategory = false
      this.jumpUrl = false
      if (val === 0) {
        this.jumpColumn = true
      } else if (val === 1) {
        this.jumpCategory = true
      } else {
        this.jumpUrl = true
      }
    },
    async getList() {
      const {
        map: {
          page: { records: data, total }
        }
      } = await listDiamond(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.diamondList = data
      this.loading = false
    },
    // 获取商品分类
    async getCategoryList() {
      const {
        map: { data }
      } = await listCategory()
      this.categoryList = this.buildTree(data, 'id', 'pid')
      console.log(this.categoryList)
    },
    // 更改商品所属分类
    handleCategoryChange(value) {
      this.form.valueId = value[value.length - 1]
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
     * 后端排序
     */
    handleSortChange(sort) {
      this.queryForm.sortName = sort.prop
      this.queryForm.sortOrder = sort.order
      this.getList()
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
      this.title = '添加金刚位'
      this.open = true
    },
    /**
     * 修改按钮
     */
    async handleUpdate(row) {
      const columnId = row.id || this.ids
      const {
        map: { data }
      } = await getDiamond(columnId)
      this.form = data
      this.selectChange(data.jumpType)
      this.title = '修改金刚位'
      this.open = true
    },
    /**
     * 删除按钮
     */
    async handleDelete(row) {
      const columnIds = row.id || this.ids
      this.$confirm(
        '是否确认删除金刚位编号为 [' + columnIds + '] 的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delDiamond(columnIds)
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
        sort: undefined,
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
            updateDiamond(this.form).then((response) => {
              this.updateHandle(response, this)
            })
          } else {
            addDiamond(this.form).then((response) => {
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
