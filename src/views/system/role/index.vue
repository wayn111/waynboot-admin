<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="queryForm.roleName"
          size="small"
          placeholder="请输入角色名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="queryForm.roleKey"
          size="small"
          placeholder="请输入权限字符"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="roleStatus">
        <el-select
          v-model="queryForm.roleStatus"
          placeholder="角色状态"
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
        <el-button
          v-hasPermi="['system:role:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:role:update']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:role:delete']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:role:export']"
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="roleList"
      style="width: 100%"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色编号" prop="roleId" width="120" />
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
      <el-table-column
        label="权限字符"
        prop="roleKey"
        sortable="custom"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="显示顺序"
        sortable="custom"
        prop="sort"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column label="状态" width="100">
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.roleStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="0"
            :inactive-value="1"
            @change="handleSwitchChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:role:update']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:role:delete']"
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
      :before-close="roleDialogHandleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuRef"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            empty-text="加载中，请稍后"
            :props="defaultProps"
          />
        </el-form-item>
        <el-form-item label="状态" prop="roleStatus">
          <el-radio-group v-model="form.roleStatus">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{ dict.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogHandleClose">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listRole,
  addRole,
  updateRole,
  delRole,
  getRole,
  exportRole,
  changeRoleStatus
} from '@/api/system/role'
import {
  treeselect as menuTreeselect,
  roleMenuTreeselect
} from '@/api/system/menu'

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
      // 日期范围
      dateRange: [],
      // 查询参数
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        roleName: '',
        roleKey: '',
        roleStatus: undefined
      },
      // 列表总数
      total: 0,
      // 添加/修改参数
      form: {
        roleName: '',
        roleKey: '',
        roleStatus: 0,
        sort: 0,
        remark: ''
      },
      // 角色列表
      roleList: [],
      // 添加/修改对话框 是否可见
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 表单校验
      rules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleKey: [
          { required: true, message: '权限字符不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '角色顺序不能为空', trigger: 'blur' }
        ]
      },
      // 菜单权限
      menuOptions: [],
      // 树组件属性
      defaultProps: {
        children: 'children',
        label: 'label'
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
    /**
     * 表单搜索
     */
    handleQuery() {
      this.queryForm.pageNum = 1
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
    /**
     * 获取角色列表
     */
    async getList() {
      this.loading = true
      const {
        map: {
          page: { records: data, total }
        }
      } = await listRole(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.roleList = data
      this.loading = false
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
     * switch 状态发生变化时的回调函数
     */
    handleSwitchChange(row) {
      const text = row.roleStatus === 0 ? '启用' : '停用'
      this.$confirm(
        '确认要 "' + text + '" "' + row.roleName + '"角色吗?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return changeRoleStatus(row.roleId, row.roleStatus)
        })
        .then(() => {
          this.$message.success(text + '成功')
        })
        .catch(function() {
          row.roleStatus = row.roleStatus === 0 ? 1 : 0
        })
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
    handleAdd() {
      this.getMenuTreeselect()
      this.title = '添加角色'
      this.open = true
    },
    /**
     * 更新按钮
     */
    async handleUpdate(row) {
      const roleId = row.roleId || this.ids
      this.$nextTick(() => {
        this.getRoleMenuTreeselect(roleId)
      })
      const {
        map: { data }
      } = await getRole(roleId)
      this.form = data
      this.title = '修改角色'
      this.open = true
    },
    /**
     * 删除按钮
     */
    handleDelete(row) {
      const roleIds = row.roleId || this.ids
      this.$confirm(
        '是否确认删除角色编号为 [' + roleIds + '] 的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delRole(roleIds)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function(e) {})
    },
    /**
     * 导出按钮操作
     */
    handleExport() {
      const queryForm = this.addDateRange(this.queryForm, this.dateRange)
      this.$confirm('是否确认导出所有角色数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return exportRole(queryForm)
        })
        .then(response => {
          this.download(response.map.filepath)
        })
        .catch(function() {})
    },
    /**
     * 角色对话框关闭
     */
    roleDialogHandleClose() {
      if (this.$refs.menuRef !== undefined) {
        this.$refs.menuRef.setCheckedKeys([])
      }
      this.menuOptions = []
      this.reset()
      this.open = false
    },
    /**
     * 表单重置
     */
    reset() {
      this.form = {
        roleName: '',
        roleKey: '',
        roleStatus: 0,
        sort: 0,
        remark: ''
      }
      this.$refs['form'].resetFields()
    },
    /**
     * 查询菜单树结构
     */
    async getMenuTreeselect() {
      const { map } = await menuTreeselect()
      this.menuOptions = map.menuTree
    },
    /** 根据角色ID查询菜单树结构 */
    async getRoleMenuTreeselect(roleId) {
      const { map } = await roleMenuTreeselect(roleId)
      this.menuOptions = map.menuTree
      this.$refs.menuRef.setCheckedKeys(map.checkedKeys)
    },
    /**
     * 提交角色表单
     */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.roleId !== undefined) {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            updateRole(this.form).then(response => {
              this.updateHandle(response, this)
            })
          } else {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            addRole(this.form).then(response => {
              this.saveHandle(response, this)
            })
          }
        }
      })
    },
    /**
     * 所有菜单节点数据
     */
    getMenuAllCheckedKeys() {
      // 半选中的菜单节点
      const halfCheckedKeys = this.$refs.menuRef.getHalfCheckedKeys()
      // 目前被选中的菜单节点
      const checkedKeys = this.$refs.menuRef.getCheckedKeys()
      return checkedKeys.concat(halfCheckedKeys)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
