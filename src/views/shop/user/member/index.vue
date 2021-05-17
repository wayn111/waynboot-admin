<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="会员ID" prop="id">
        <el-input
          v-model="queryForm.id"
          size="small"
          placeholder="请输入会员ID"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员昵称" prop="nickname">
        <el-input
          v-model="queryForm.nickname"
          size="small"
          placeholder="请输入会员昵称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryForm.status"
          placeholder="会员状态"
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

    <!-- <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd()">新增</el-button>
      </el-col>
    </el-row> -->

    <el-table
      v-loading="loading"
      border
      :data="memberList"
      style="width: 100%"
    >
      <el-table-column label="编号" prop="id" width="120" />
      <el-table-column label="性别" prop="gender">
        <template slot-scope="scope">
          {{ scope.row.gender == 1? '男':'女' }}
        </template>
      </el-table-column>
      <el-table-column label="昵称" prop="nickname" />
      <el-table-column label="手机号" prop="mobile" />
      <el-table-column label="头像" prop="avatar" width="200">
        <template slot-scope="scope">
          <img v-if="scope.row.avatar" :src="scope.row.avatar" width="80">
        </template>
      </el-table-column>
      <el-table-column label="最后登陆Ip" prop="lastLoginIp" />
      <el-table-column label="最后登陆时间" prop="lastLoginTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastLoginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" :formatter="statusFormat" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
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

    <!-- 用户编辑对话框 -->
    <el-dialog
      :visible.sync="open"
      title="用户编辑"
      width="600px"
      :close-on-click-modal="false"
      :before-close="memberDialogHandleClose"
    >
      <el-form ref="userDetail" :model="userDetail" :rules="rules" label-width="80px">
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="userDetail.nickname" />
        </el-form-item>
        <el-form-item label="用户手机" prop="mobile">
          <el-input v-model="userDetail.mobile" />
        </el-form-item>
        <el-form-item label="用户性别" prop="gender">
          <el-radio-group v-model="userDetail.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userDetail.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{ dict.name }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="memberDialogHandleClose">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { listMember, getMember, updateMember } from '@/api/shop/user/member'
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
        id: undefined,
        nickname: undefined,
        status: undefined
      },
      // 角色列表
      memberList: [],
      // 是否显示弹出层
      open: false,
      // 用户编辑表单
      userDetail: {},
      // 表单校验
      rules: {
        nickname: [{ required: true, message: '昵称不能为空', trigger: 'blur' }],
        mobile: [{ required: true, message: '手机号不能为空', trigger: 'blur' }]
      },
      // 状态数据字典
      statusOptions: [],
      // 上传文件路径
      uploadPath,
      // 上传路径header设置
      headers: { Authorization: 'Bearer ' + getToken() }
    }
  },
  created() {
    this.getList()
    this.getDicts('status').then(response => {
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
      } = await listMember(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.memberList = data
      this.loading = false
    },
    /**
     * switch 状态发生变化时的回调函数
     */
    handleSwitchChange(row) {
      const text = row.status === 0 ? '启用' : '停用'
      this.$confirm(
        '确认要 "' + text + '"该会员吗?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
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
    memberDialogHandleClose() {
      this.reset()
      this.open = false
    },
    /**
     * 表单重置
     */
    reset() {
      this.userDetail = {}
      this.$refs['userDetail'].resetFields()
    },
    /**
     * 编辑操作
     */
    async handleUpdate(row) {
      const { map: { data }} = await getMember(row.id)
      this.userDetail = data
      this.open = true
    },
    /**
     * 提交会员表单
     */
    submitForm() {
      this.$refs['userDetail'].validate(valid => {
        if (valid) {
          if (this.userDetail.id !== undefined) {
            updateMember(this.userDetail).then(response => {
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
