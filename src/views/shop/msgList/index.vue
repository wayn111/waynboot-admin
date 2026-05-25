<template>
  <div class="app-container">
    <el-form ref="queryFormRef" :inline="true" :model="queryForm">
      <el-form-item label="商品名称" prop="shopName">
        <el-input
          v-model="queryForm.shopName"
          size="small"
          placeholder="请输入商品名称"
          @keyup.enter="handleQuery"
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
          v-hasPermi="['system:dict:remove']"
          type="danger"
          size="small"
          :disabled="multiple"
          @click="handleMad"
        >一键处理</el-button>
      </el-col>
    </el-row>

    <el-table
      border
      :data="msgData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品名称" prop="shopName" width="80" />
      <el-table-column label="商品ID" prop="shopId" width="80" />
      <el-table-column label="商品规格" prop="shopProductId" width="100" />
      <el-table-column label="提醒内容" prop="msgContext" width="280" />
      <el-table-column label="提醒类型" prop="msgType" width="280">
        <template #default="scope">
          {{ scope.row.msgType == '1' ?'预警库存消息':'下单发货提醒' }}
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
            link
            @click="handleReply(scope.row)"
          >处理</el-button>
          <el-button
            size="small"
            link
            @click="look(scope.row)"
          >查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="total"
      v-model:page="queryForm.pageNum"
      v-model:limit="queryForm.pageSize"
      @pagination="getList"
    />
  </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplateRefs } from '@/utils/templateRefs'
import { createMessageNotifications } from './messageNotifications'
const instance = getCurrentInstance()
const router = useRouter()
const templateRefs = useTemplateRefs(instance)
const localMessages = ref(createMessageNotifications())
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const total = ref(0)
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  shopName: undefined,
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
const msgData = ref([])
const commentTypeOptions = ref([])
const starLevelOptions = ref([])
function handleQuery() {
  queryForm.value.pageNum = 1
  getList()
}
function resetQuery() {
  templateRefs.queryFormRef?.resetFields?.()
  queryForm.value.shopName = undefined
  handleQuery()
}
function getFilteredMessages() {
  const keyword = (queryForm.value.shopName || '').trim()
  if (!keyword) {
    return localMessages.value
  }
  return localMessages.value.filter(item => item.shopName.includes(keyword))
}
function getList() {
  const filteredMessages = getFilteredMessages()
  const pageNum = Number(queryForm.value.pageNum) || 1
  const pageSize = Number(queryForm.value.pageSize) || 10
  const start = (pageNum - 1) * pageSize
  total.value = filteredMessages.length
  msgData.value = filteredMessages.slice(start, start + pageSize)
}
function look(row) {
  if (String(row.msgType) === '1') {
    router.push('/shop/alarm')
  } else {
    router.push('/shop/order')
  }
}
function removeMessages(messageIds) {
  const remainingMessages = localMessages.value.filter(item => !messageIds.includes(item.id))
  localMessages.value = remainingMessages
  ids.value = []
  single.value = true
  multiple.value = true
  getList()
}
function handleMad() {
  if (ids.value.length) {
    removeMessages(ids.value)
    instance.proxy.$message.success('操作成功')
  }
}
function reset() {
  replyForm.value = {}
  templateRefs.replyForm?.resetFields?.()
}
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
function handleReply(row) {
  removeMessages([row.id])
  instance.proxy.$message.success('操作成功')
}
(() => {
  getList()
})()
defineExpose({
  commentList,
  commentTypeOptions,
  getList,
  getFilteredMessages,
  handleMad,
  handleQuery,
  handleReply,
  handleSelectionChange,
  ids,
  localMessages,
  look,
  msgData,
  multiple,
  open,
  queryForm,
  replyForm,
  reset,
  resetQuery,
  single,
  starLevelOptions,
  title,
  total
})
</script>
<style lang="scss" scoped>
</style>
