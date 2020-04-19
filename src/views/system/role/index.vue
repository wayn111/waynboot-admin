<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
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
          <el-option label="启用" value="0" />
          <el-option label="禁用" value="1" />
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini">导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="roleList" style="width: 100%">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色编号" prop="roleId" width="120" />
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="显示顺序" prop="roleSort" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="状态" width="100">
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.roleStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="0"
            inactive-value="1"
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
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-circle-check"
            @click="handleDataScope(scope.row)"
          >数据权限</el-button>
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

    <el-dialog
      :title="title"
      :visible.sync="roleDialogVisible"
      width="30%"
      :before-close="roleDialogHandleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
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
        <el-form-item label="状态">
          <el-radio-group v-model="form.roleStatus">
            <el-radio :label="0">启用</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
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
import { listRole, addRole, updateRole } from '@/api/system/role'
import { treeselect as menuTreeselect } from '@/api/system/menu'

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
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
      // 添加/修改参数
      form: {
        roleName: '',
        roleKey: '',
        roleStatus: 0,
        roleSort: 0,
        remark: ''
      },
      // 角色列表
      roleList: [],
      // 列表总数
      total: 0,
      // 添加/修改对话框 title
      title: '',
      // 添加/修改对话框 是否可见
      roleDialogVisible: false,
      // 表单校验
      rules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleKey: [
          { required: true, message: '权限字符不能为空', trigger: 'blur' }
        ],
        roleSort: [
          { required: true, message: '角色顺序不能为空', trigger: 'blur' }
        ]
      },
      // 菜单权限
      menuOptions: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  created() {
    this.getList()
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
      this.$refs.queryFormRef.resetFields()
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
     * 添加按钮
     */
    handleAdd() {
      this.title = '添加角色'
      this.getMenuTreeselect()
      this.roleDialogVisible = true
    },
    /**
     * 更新按钮
     */
    handleUpdate() {},
    /**
     * 删除按钮
     */
    handleDelete() {},
    /**
     * 角色对话框关闭
     */
    roleDialogHandleClose() {
      this.$refs.formRef.resetFields()
      this.roleDialogVisible = false
    },
    /**
     * 查询菜单树结构
     */
    getMenuTreeselect() {
      menuTreeselect().then(response => {
        this.menuOptions = response.map.menuTree
      })
    },
    /**
     * 提交角色表单
     */
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          if (this.form.roleId !== undefined) {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            updateRole(this.form).then(response => {
              if (response.code === 200) {
                this.$message.success('修改成功')
                this.roleDialogVisible = false
                this.getList()
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            addRole(this.form).then(response => {
              if (response.code === 200) {
                this.$message.success('新增成功')
                this.roleDialogVisible = false
                this.getList()
              } else {
                this.$message.error(response.msg)
              }
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
.el-table {
  margin-top: 10px;
}
</style>
