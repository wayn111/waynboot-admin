<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true" :model="queryForm">
      <el-form-item label="优惠券标题" prop="title">
        <el-input v-model="queryForm.title" size="small" placeholder="请输入优惠券标题" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryForm.status" placeholder="优惠券状态" clearable size="small" style="width: 120px">
          <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.name" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:coupon:add']" type="primary" icon="el-icon-plus" size="mini"
          @click="handleAdd()">新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" border :data="couponList" style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="80" />
      <el-table-column label="名称" prop="title" width="200" />
      <el-table-column label="优惠券数量" prop="num" width="100" />
      <el-table-column label="优惠金额" prop="discount" />
      <el-table-column label="最少消费金额" prop="min" width="120" />
      <el-table-column label="优惠券类型" width="120" :formatter="typeFormat" />
      <el-table-column label="状态" width="100" :formatter="statusFormat" />
      <el-table-column label="到期时间" align="center" prop="expireTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.expireTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleGive(scope.row)">赠送</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total" :total="total" :page.sync="queryForm.pageNum" :limit.sync="queryForm.pageSize"
      @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" :close-on-click-modal="false"
      :before-close="channelDialogHandleClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="优惠券名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入优惠券名称" />
        </el-form-item>

        <el-form-item label="优惠券数量" prop="num">
          <el-input-number v-model="form.num" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="优惠金额" prop="discount">
          <el-input-number v-model="form.discount" controls-position="right" :min="0" :precision="2" :step="1" />
        </el-form-item>
        <el-form-item label="最少消费金额" prop="min">
          <el-input-number v-model="form.min" controls-position="right" :min="0" :precision="2" :step="1" />
        </el-form-item>
        <el-form-item label="优惠券类型 " prop="type">
          <el-radio-group v-model="form.type">
            <el-radio v-for="dict in typeOption" :key="dict.value" :label="parseInt(dict.value)">{{ dict.name
              }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.value" :label="parseInt(dict.value)">{{ dict.name
              }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="到期时间" prop="expireTime">
          <el-date-picker v-model="form.expireTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="channelDialogHandleClose">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="赠送优惠券" :visible.sync="openGive" width="600px" :close-on-click-modal="false"
      :before-close="giveDialogHandleClose">
      <el-form ref="formGive" :model="formGive" :rules="rulesGive" label-width="120px">
        <el-form-item label="用户id" prop="userId">
          <el-input v-model="formGive.userId" placeholder="请输入用户id" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormGive">确 定</el-button>
        <el-button @click="giveDialogHandleClose">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  listCoupon,
  getCoupon,
  addCoupon,
  updateCoupon,
  delCoupon,
  giveCoupon
} from '@/api/shop/coupon'
import { getToken } from '@/utils/auth'

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
      couponList: [],
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [
        { name: '下架', value: 0 },
        { name: '上架', value: 1 },
      ],

      // 表单参数
      form: {
        title: undefined,
        status: 1,
        type: 1,
        num: undefined,
        discount: null,
        min: null,
      },
      // 表单校验
      rules: {
        title: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        num: [
          { required: true, message: '数量不能为空', trigger: 'blur' }
        ],
        discount: [
          { required: true, message: '优惠金额不能为空', trigger: 'blur' }
        ],
        min: [
          { required: true, message: '消费金额不能为空', trigger: 'blur' }
        ],
        expireTime: [
          { required: true, message: '过期时间不能为空', trigger: 'blur' }
        ],
      },
      formGive: {
        userId: [{ required: true, message: '用户id不能为空', trigger: 'blur' }],
      },
      // 上传路径header设置
      headers: { Authorization: 'Bearer ' + getToken() },
      typeOption: [
        { name: '注册赠送', value: 1 },
        { name: '普通使用', value: 2 },
      ],
      openGive: false,
      formGive: {
        userId: ''
      }
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
        data: { records: data, total }
      } = await listCoupon(this.addDateRange(this.queryForm, this.dateRange))
      this.total = total
      this.couponList = data
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
     * 添加按钮
     */
    handleAdd(row) {
      this.title = '添加优惠券'
      this.open = true
    },
    /**
     * 修改按钮
     */
    async handleUpdate(row) {
      const {
        data
      } = await getCoupon(row.id)
      this.form = data
      this.title = '修改优惠券'
      this.open = true
    },
    /**
     * 赠送按钮
     */
    async handleGive(row) {
      this.formGive.couponId = row.id
      this.openGive = true
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
        .then(function () {
          return delCoupon(channelIds)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function (e) { })
    },
    /**
     * 表单重置
     */
    reset() {
      this.form = {
        title: undefined,
        status: 1,
        num: undefined,
        discount: null,
        min: null,
        type: 1,
      }
      this.$refs['form'].resetFields()
    },
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.echoDictName(this.statusOptions, row.status)
    },
    // 字典状态字典翻译
    typeFormat(row, column) {
      return this.echoDictName(this.typeOption, row.type)
    },
    /**
     * 对话框关闭
     */
    channelDialogHandleClose() {
      this.reset()
      this.open = false
    },
    giveDialogHandleClose() {
      this.formGive.userId = ''
      this.openGive = false
    },
    /**
     * 
     */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateCoupon(this.form).then((response) => {
              this.updateHandle(response, this)
            })
          } else {
            addCoupon(this.form).then((response) => {
              this.saveHandle(response, this)
            })
          }
        }
      })
    },
    submitFormGive() {
      this.$refs['formGive'].validate((valid) => {
        if (valid) {
          giveCoupon(this.formGive).then((response) => {
            this.giveDialogHandleClose()
          })
        }
      })
    }
  }
}
</script>