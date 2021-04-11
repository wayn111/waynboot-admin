<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryForm" :inline="true" label-width="68px">
      <el-form-item label="标签名" prop="name">
        <el-input
          v-model="queryForm.name"
          placeholder="请输入标签名"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="标签值" prop="value">
        <el-input
          v-model="queryForm.value"
          placeholder="请输入标签值"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="字典名称" prop="dictType">
        <el-select v-model="queryForm.parentType" style="width: 120px" size="small">
          <el-option
            v-for="item in typeOptions"
            :key="item.dictId"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="dictStatus">
        <el-select
          v-model="queryForm.dictStatus"
          placeholder="标签状态"
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
          v-hasPermi="['system:dict:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dict:edit']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
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

    <el-table v-loading="loading" border :data="typeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="标签编号" width="120" align="center" prop="dictId" />
      <el-table-column label="标签名" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="标签值" align="center" prop="value" />
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:dict:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:dict:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryForm.pageNum"
      :limit.sync="queryForm.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改字典对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="600px"
      :close-on-click-modal="false"
      :before-close="dictDialogHandleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标签名" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名" />
        </el-form-item>
        <el-form-item label="标签值" prop="value">
          <el-input v-model="form.value" placeholder="请输入标签值" />
        </el-form-item>
        <el-form-item label="标签顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="dictStatus">
          <el-radio-group v-model="form.dictStatus">
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
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dictDialogHandleClose">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listData,
  getData,
  addData,
  updateData,
  selectTypeList,
  delData
} from '@/api/system/dict/data'

export default {
  name: 'Data',
  props: {
    parentType: {
      type: String,
      required: true
    }
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
      // 总条数
      total: 0,
      // 字典表格数据
      typeList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 字典类型数据
      typeOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        value: undefined,
        parentType: undefined,
        dictStatus: undefined
      },
      // 表单参数
      form: {
        name: undefined,
        value: undefined,
        type: 2,
        dictStatus: 0,
        remark: undefined
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: '字典名称不能为空', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '字典类型不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '字典顺序不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.queryForm.parentType = this.parentType
    selectTypeList().then(response => {
      const {
        map: { typeList }
      } = response
      this.typeOptions = typeList
    })
    this.getList()
    this.getDicts('status').then(response => {
      const {
        map: { data }
      } = response
      this.statusOptions = data
    })
  },
  methods: {
    /** 查询字典类型列表 */
    getList() {
      this.loading = true
      listData(this.addDateRange(this.queryForm, this.dateRange)).then(
        response => {
          const {
            map: {
              page: { records: data, total }
            }
          } = response
          this.typeList = data
          this.total = total
          this.loading = false
        }
      )
    },
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.echoDictName(this.statusOptions, row.dictStatus)
    },
    /**
     * 字典对话框关闭
     */
    dictDialogHandleClose() {
      this.reset()
      this.open = false
    },
    // 表单重置
    reset() {
      this.form = {
        dictId: undefined,
        name: undefined,
        value: undefined,
        type: 2,
        dictStatus: 0,
        remark: undefined
      }
      this.$refs['form'].resetFields()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryForm.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.$refs.queryForm.resetFields()
      this.queryForm.parentType = this.parentType
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.title = '添加字典数据'
      this.form.parentType = this.queryForm.parentType
      this.open = true
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.dictId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const dictId = row.dictId || this.ids
      getData(dictId).then(response => {
        const {
          map: { data }
        } = response
        this.form = data
        this.open = true
        this.title = '修改字典数据'
      })
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const dictIds = row.dictId || this.ids
      this.$confirm(
        '是否确认删除标签编号为"' + dictIds + '"的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delData(dictIds)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
        .catch(function() {})
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.dictId !== undefined) {
            updateData(this.form).then(response => {
              this.updateHandle(response, this)
            })
          } else {
            addData(this.form).then(response => {
              this.saveHandle(response, this)
            })
          }
        }
      })
    }
  }
}
</script>
