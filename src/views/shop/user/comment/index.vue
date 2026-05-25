<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryForm.userId"
          size="small"
          placeholder="请输入用户ID"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评论类型" prop="type">
        <el-select
          v-model="queryForm.type"
          placeholder="评论类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in commentTypeOptions"
            :key="dict.value"
            :label="dict.name"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="评分等级" prop="star">
        <el-select
          v-model="queryForm.star"
          placeholder="评分等级"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in starLevelOptions"
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
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="Search"
          size="small"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="Refresh"
          size="small"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:dict:remove']"
          type="danger"
          icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      border
      :data="commentList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="60" />
      <el-table-column label="用户ID" prop="userId" width="80" />
      <el-table-column label="评论类型" prop="type" width="100">
        <template #default="scope">
          <span>{{ scope.row.type == 0 ? '商品评论' : '专题评论' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评论内容" prop="content" width="280">
        <template #default="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="scope.row.content"
            placement="top-start"
          >
            <el-link :underline="false">{{
              toolTip(scope.row.content)
            }}</el-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" label="评论图片" prop="picUrls">
        <template #default="scope">
          <el-image
            v-for="(item, index) in scope.row.picUrls"
            :key="index"
            :src="item"
            :preview-src-list="scope.row.picUrls"
            :lazy="true"
            style="width: 40px; height: 40px; margin-right: 5px"
          />
        </template>
      </el-table-column>
      <el-table-column label="坪分" prop="star" width="190">
        <template #default="scope">
          <el-rate v-model="scope.row.star" disabled show-text />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['system:common:reply']"
            size="small"
            type="text"
            icon="Edit"
            @click="handleReply(scope.row)"
          >回复</el-button>
          <el-button
            v-hasPermi="['system:common:delete']"
            size="small"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total"
      :total="total"
      v-model:page="queryForm.pageNum"
      v-model:limit="queryForm.pageSize"
      @pagination="getList"
    />

    <!-- 管理员回复对话框 -->
    <el-dialog
      v-model="open"
      title="回复"
      width="600px"
      :close-on-click-modal="false"
      :before-close="replyDialogHandleClose"
    >
      <el-form
        ref="replyFormRef"
        :model="replyForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="回复内容" prop="adminContent">
          <el-input
            v-model="replyForm.adminContent"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="replyDialogHandleClose">取消</el-button>
      </div></template>
    </el-dialog>
    <el-dialog
      v-model="addCommentOpen"
      title="回复"
      width="600px"
      :close-on-click-modal="false"
      :before-close="addCommentClose"
    >
      <el-form
        ref="commentFromRef"
        :model="commentFrom"
        :rules="rulesCommentFrom"
        label-width="80px"
      >
        <el-form-item label="商品ID" prop="valueId">
          <el-input v-model="commentFromId" placeholder="请输入商品ID" />
        </el-form-item>
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="commentFrom.username" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户头像" prop="avatar">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadPicUrl"
            :before-upload="checkFileSize"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png, .gif"
          >
            <img v-if="commentFrom.avatar" :src="commentFrom.avatar" class="avatar">
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <template #tip><div class="el-upload__tip">只能上传jpg、jpeg、png、gif文件</div></template>
          </el-upload>
        </el-form-item>
        <el-form-item label="评论内容" prop="content">
          <el-input
            v-model="commentFrom.content"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>

        <el-form-item label="评论图片">
          <el-upload
            :action="uploadPath"
            :limit="5"
            :headers="headers"
            :on-exceed="uploadOverrun"
            :on-success="handleGalleryUrl"
            :on-remove="handleRemove"
            multiple
            accept=".jpg, .jpeg, .png, .gif"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip><div class="el-upload__tip">只能上传jpg、jpeg、png、gif文件，800 x 800</div></template>
          </el-upload>
        </el-form-item>
        <el-form-item label="评论评分" prop="star">
          <el-rate v-model="commentFrom.star" show-text style="margin-top: 10px;" />
        </el-form-item>

      </el-form>
      <template #footer><div class="dialog-footer">
        <el-button type="primary" @click="addCommentForm">确定</el-button>
        <el-button @click="addCommentClose">取消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { listComment, getComment, addComment, updateComment, delComment } from '@/api/shop/user/comment'
import { getToken } from '@/utils/auth'
import { uploadPath as uploadApiPath } from '@/api/upload'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const templateRefs = useTemplateRefs(instance)
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const total = ref(0)
const dateRange = ref([])
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  type: undefined,
  star: undefined
})
const commentList = ref([])
const open = ref(false)
const replyForm = ref({
  id: undefined,
  adminContent: undefined
})
const rules = ref({
  adminContent: [{
    required: true,
    message: '回复内容不能为空',
    trigger: 'blur'
  }]
})
const rulesCommentFrom = ref({
  content: [{
    required: true,
    message: '回复内容不能为空',
    trigger: 'blur'
  }],
  username: [{
    required: true,
    message: '用户名称不能为空',
    trigger: 'blur'
  }]
})
const commentTypeOptions = ref([])
const starLevelOptions = ref([])
const uploadPath = ref(uploadApiPath)
const headers = ref({
  Authorization: 'Bearer ' + getToken()
})
const addCommentOpen = ref(false)
const commentFrom = ref({
  content: '',
  type: 1,
  avatar: '',
  username: '',
  star: 4,
  hasPicture: false,
  picUrls: []
})
function handleQuery() {
  getList()
}
function resetQuery() {
  templateRefs.queryFormRef.resetFields()
  dateRange.value = []
  handleQuery()
}
async function getList() {
  const {
    data: {
      records: data,
      total: pageTotal
    }
  } = await listComment(instance.proxy.addDateRange(queryForm.value, dateRange.value))
  total.value = pageTotal
  commentList.value = data
  loading.value = false
}
function statusFormat(row, column) {
  return instance.proxy.echoDictName(instance.proxy.statusOptions, row.status)
}
function replyDialogHandleClose() {
  reset()
  open.value = false
}
function reset() {
  replyForm.value = {}
  templateRefs.replyFormRef.resetFields()
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleDelete(row) {
  const commentIds = row.id || ids.value
  instance.proxy.$confirm('是否确认删除评论编号为"' + commentIds + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delComment(commentIds)
  }).then(() => {
    getList()
    instance.proxy.$message.success('删除成功')
  }).catch(function() {})
}
async function handleReply(row) {
  const {
    data
  } = await getComment(row.id)
  replyForm.value['id'] = data.id
  replyForm.value['adminContent'] = data.adminContent
  open.value = true
}
function submitForm() {
  templateRefs.replyFormRef.validate(valid => {
    if (valid) {
      if (replyForm.value.id !== undefined) {
        updateComment(replyForm.value).then(response => {
          handleSubmitResponse(response, '修改成功')
        })
      }
    }
  })
}
function uploadPicUrl(response) {
  commentFrom.value.avatar = response.data
}
function checkFileSize(file) {
  if (file.size > 1048576) {
    instance.proxy.$message.error(`${file.name}文件大于1024KB，请选择小于1024KB大小的图片`)
    return false
  }
  return true
}
function uploadOverrun() {
  instance.proxy.$message({
    type: 'error',
    message: '上传文件个数超出限制!最多上传5张图片!'
  })
}
function handleGalleryUrl(response, file, fileList) {
  if (response.code === 200) {
    commentFrom.value.picUrls.push(response.data)
  }
}
function handleRemove(file, fileList) {
  for (let i = 0; i < commentFrom.value.picUrls.length; i++) {
    // 这里存在两种情况
    // 1. 如果所删除图片是刚刚上传的图片，那么图片地址是file.response.data.url
    //    此时的file.url虽然存在，但是是本机地址，而不是远程地址。
    // 2. 如果所删除图片是后台返回的已有图片，那么图片地址是file.url
    let url
    if (file.response === undefined) {
      url = file.url
    } else {
      url = file.response.data
    }
    if (commentFrom.value.picUrls[i] === url) {
      commentFrom.value.picUrls.splice(i, 1)
    }
  }
}
function handleAdd() {
  addCommentOpen.value = true
}
function addCommentClose() {
  addCommentOpen.value = false
  commentFrom.value = {}
  templateRefs.commentFromRef.resetFields()
}
function addCommentForm() {
  if (commentFrom.value.picUrls.length > 0) commentFrom.value.hasPicture = true
  console.log(commentFrom.value)
  templateRefs.commentFromRef.validate(valid => {
    if (valid) {
      addComment(commentFrom.value).then(response => {
        instance.proxy.$message.success('添加成功')
        addCommentOpen.value = false
        commentFrom.value = {}
        templateRefs.commentFromRef.resetFields()
        getList()
      })
    }
  })
}
function handleSubmitResponse(response, successMessage) {
  if (response.code === 200) {
    instance.proxy.$message.success(successMessage)
    open.value = false
    getList()
    reset()
  } else {
    instance.proxy.$message.error(response.msg || '操作失败')
  }
}
(() => {
  getList()
  instance.proxy.getDicts('commentType').then(response => {
    const {
      data
    } = response
    commentTypeOptions.value = data
  })
  instance.proxy.getDicts('starLevel').then(response => {
    const {
      data
    } = response
    starLevelOptions.value = data
  })
})()
defineExpose({
  addCommentClose,
  addCommentForm,
  addCommentOpen,
  checkFileSize,
  commentFrom,
  commentList,
  commentTypeOptions,
  dateRange,
  getList,
  handleAdd,
  handleDelete,
  handleGalleryUrl,
  handleQuery,
  handleRemove,
  handleReply,
  handleSelectionChange,
  headers,
  ids,
  loading,
  multiple,
  open,
  queryForm,
  replyDialogHandleClose,
  replyForm,
  reset,
  resetQuery,
  rules,
  rulesCommentFrom,
  single,
  starLevelOptions,
  statusFormat,
  submitForm,
  title,
  total,
  uploadOverrun,
  uploadPath,
  uploadPicUrl
})
</script>
<style lang="scss" scoped>
</style>
