<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="queryForm.deptName"
          size="small"
          placeholder="请输入部门名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="deptStatus">
        <el-select
          v-model="queryForm.deptStatus"
          placeholder="部门状态"
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dept:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd()"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="deptList"
      row-key="deptId"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="deptName" label="部门名称" width="260" />
      <el-table-column prop="sort" label="排序" width="200" />
      <el-table-column prop="deptStatus" label="状态" :formatter="statusFormat" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:dept:update']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:dept:add']"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
          >新增</el-button>
          <el-button
            v-if="scope.row.parentId != 0"
            v-hasPermi="['system:dept:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="600px"
      :before-close="deptDialogHandleClose"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="form.parentId !== 0" :span="24">
            <el-form-item label="上级部门" prop="parentId">
              <treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer" placeholder="选择上级部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.deptStatus">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.value"
                  :label="parseInt(dict.value)"
                >{{ dict.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="deptDialogHandleClose">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listDept,
  getDept,
  delDept,
  addDept,
  updateDept
} from '@/api/system/dept'
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  components: {
    Treeselect
  },
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
      // 查询参数
      queryForm: {
        deptName: undefined,
        deptStatus: undefined
      },
      // 部门表格树数据
      deptList: [],
      // 部门树
      deptOptions: [],
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 表单参数
      form: {
        deptId: undefined,
        parentId: undefined,
        deptName: undefined,
        sort: undefined,
        leader: undefined,
        phone: undefined,
        email: undefined,
        deptStatus: 0
      },
      // 表单校验
      rules: {
        parentId: [
          { required: true, message: '上级部门不能为空', trigger: 'blur' }
        ],
        deptName: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '菜单顺序不能为空', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('status').then(response => {
      const { map: { data }} = response
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
      this.handleQuery()
    },
    /**
     * 获取部门列表
     */
    async getList() {
      this.loading = true
      const {
        map: { data }
      } = await listDept(this.queryForm)
      this.deptList = this.buildTree(data, 'deptId')
      this.loading = false
    },
    /**
     * 添加按钮
     */
    handleAdd(row) {
      this.getTreeselect()
      if (row != null) {
        this.form.parentId = row.deptId
      }
      this.title = '添加部门'
      this.open = true
    },
    /**
     * 修改按钮
     */
    async handleUpdate(row) {
      this.getTreeselect()
      const { map: { data }} = await getDept(row.deptId)
      this.form = data
      this.title = '修改部门'
      this.open = true
    },
    /**
     * 删除按钮
     */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除名称为"' + row.deptName + '"的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delDept(row.deptId)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function() {})
    },
    /**
     * 部门状态翻译
     */
    statusFormat(row, column) {
      return this.echoDictName(this.statusOptions, row.deptStatus)
    },
    /**
     * 查询菜单下拉树结构
     */
    async getTreeselect() {
      const { map: { data }} = await listDept()
      this.deptOptions = this.buildTree(data, 'deptId')
    },
    /**
     * 转换菜单数据结构
     */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      }
    },
    /**
     * 部门对话框关闭
     */
    deptDialogHandleClose() {
      this.reset()
      this.open = false
    },
    /**
     * 表单重置
     */
    reset() {
      this.form = {
        deptId: undefined,
        parentId: undefined,
        deptName: undefined,
        sort: undefined,
        leader: undefined,
        phone: undefined,
        email: undefined,
        deptStatus: 0
      }
      this.$refs['form'].resetFields()
    },
    /**
     * 提交角色表单
     */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.deptId !== undefined) {
            updateDept(this.form).then(response => {
              this.updateHandle(response, this)
            })
          } else {
            addDept(this.form).then(response => {
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
