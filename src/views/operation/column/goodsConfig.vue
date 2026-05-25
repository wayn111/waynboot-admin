<template>
  <div>
    <el-form ref="goodsQueryFormRef" :inline="true" :model="goodsQueryForm">
      <el-form-item label="商品编号" prop="goodsSn">
        <el-input
          v-model="goodsQueryForm.goodsSn"
          size="small"
          placeholder="请输入商品编号"
          @keyup.enter="goodsHandleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="goodsQueryForm.name"
          size="small"
          placeholder="请输入商品名称"
          @keyup.enter="goodsHandleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="Search"
          size="small"
          @click="goodsHandleQuery"
        >搜索</el-button>
        <el-button
          icon="Refresh"
          size="small"
          @click="goodsResetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>
    <el-tabs v-model="activeTab" tab-position="left" @tab-click="tabClick">
      <el-tab-pane label="已添加" name="bind">
        <el-table
          v-loading="goodsLoading"
          border
          :data="bindGoodsList"
          style="width: 100%"
          max-height="580px"
        >
          <el-table-column align="center" label="商品编号" prop="goodsSn" />
          <el-table-column
            align="center"
            min-width="150"
            label="名称"
            prop="name"
            show-overflow-tooltip
          />
          <el-table-column align="center" property="iconUrl" label="图片">
            <template #default="scope">
              <img :src="scope.row.picUrl" width="30">
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="市场售价"
            prop="counterPrice"
          />
          <el-table-column align="center" label="当前价格" prop="retailPrice" />
          <el-table-column align="center" label="是否新品" prop="isNew">
            <template #default="scope">
              <el-tag :type="scope.row.isNew ? 'success' : 'error'">{{
                scope.row.isNew ? '新品' : '非新品'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="是否热品" prop="isHot">
            <template #default="scope">
              <el-tag :type="scope.row.isHot ? 'success' : 'error'">{{
                scope.row.isHot ? '热品' : '非热品'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="是否在售" prop="isOnSale">
            <template #default="scope">
              <el-tag :type="scope.row.isOnSale ? 'success' : 'error'">{{
                scope.row.isOnSale ? '在售' : '未售'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template #default="scope">
              <el-button
                size="small"
                type="danger"
                @click="columGodosRemove(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="goodsTotal"
          :total="goodsTotal"
          v-model:page="goodsQueryForm.pageNum"
          v-model:limit="goodsQueryForm.pageSize"
          @pagination="getBindGoodsList"
        />
      </el-tab-pane>
      <el-tab-pane label="未添加" name="unBind">
        <el-table
          v-loading="goodsLoading"
          border
          :data="unBindGoodsList"
          style="width: 100%"
          max-height="580px"
        >
          <el-table-column align="center" label="商品编号" prop="goodsSn" />
          <el-table-column
            align="center"
            min-width="150"
            label="名称"
            prop="name"
            show-overflow-tooltip
          />
          <el-table-column align="center" property="iconUrl" label="图片">
            <template #default="scope">
              <img :src="scope.row.picUrl" width="30">
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="市场售价"
            prop="counterPrice"
          />
          <el-table-column align="center" label="当前价格" prop="retailPrice" />
          <el-table-column align="center" label="是否新品" prop="isNew">
            <template #default="scope">
              <el-tag :type="scope.row.isNew ? 'success' : 'error'">{{
                scope.row.isNew ? '新品' : '非新品'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="是否热品" prop="isHot">
            <template #default="scope">
              <el-tag :type="scope.row.isHot ? 'success' : 'error'">{{
                scope.row.isHot ? '热品' : '非热品'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="是否在售" prop="isOnSale">
            <template #default="scope">
              <el-tag :type="scope.row.isOnSale ? 'success' : 'error'">{{
                scope.row.isOnSale ? '在售' : '未售'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
          >
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="columGodosAdd(scope.row)"
              >添加</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="goodsTotal"
          :total="goodsTotal"
          v-model:page="goodsQueryForm.pageNum"
          v-model:limit="goodsQueryForm.pageSize"
          @pagination="getUnBindGoodsList"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import { getCurrentInstance, ref, watch } from 'vue'
import { addColumnGooods, removeColumnGooods, bindGoodsList as fetchBindGoodsList, unBindGoodsList as fetchUnBindGoodsList } from '@/api/shop/column'
import { useTemplateRefs } from '@/utils/templateRefs'
const instance = getCurrentInstance()
const props = defineProps({
  columnId: {
    type: Number,
    default: 0
  }
})
const templateRefs = useTemplateRefs(instance)
const goodsLoading = ref(true)
const goodsTotal = ref(0)
const activeTab = ref('bind')
const goodsQueryForm = ref({
  pageNum: 1,
  pageSize: 10,
  goodsSn: undefined,
  name: undefined
})
const bindGoodsList = ref([])
const unBindGoodsList = ref([])
function goodsHandleQuery() {
  if (activeTab.value === 'bind') {
    getBindGoodsList()
  } else {
    getUnBindGoodsList()
  }
}
function goodsResetQuery() {
  goodsLoading.value = true
  goodsQueryForm.value = {
    pageNum: 1,
    pageSize: 10,
    goodsSn: undefined,
    name: undefined
  }
  goodsHandleQuery()
}
async function getBindGoodsList() {
  goodsQueryForm.value.columnId = props.columnId
  const {
    data: {
      records: data,
      total
    }
  } = await fetchBindGoodsList(instance.proxy.addDateRange(goodsQueryForm.value, instance.proxy.dateRange))
  goodsTotal.value = total
  bindGoodsList.value = data
  goodsLoading.value = false
}
async function getUnBindGoodsList() {
  goodsQueryForm.value.columnId = props.columnId
  const {
    data: {
      records: data,
      total
    }
  } = await fetchUnBindGoodsList(instance.proxy.addDateRange(goodsQueryForm.value, instance.proxy.dateRange))
  goodsTotal.value = total
  unBindGoodsList.value = data
  goodsLoading.value = false
}
function tabClick(val) {
  goodsLoading.value = true
  goodsTotal.value = 0
  templateRefs.goodsQueryFormRef.resetFields()
  if (val.index === '0') {
    getBindGoodsList()
  } else {
    getUnBindGoodsList()
  }
}
function columGodosAdd(row) {
  goodsLoading.value = true
  const goodsId = row.id
  const columnId = props.columnId
  addColumnGooods({
    goodsId,
    columnId
  }).then(res => {
    instance.proxy.$message.success('添加成功')
    getUnBindGoodsList()
  }).finally(() => {
    goodsLoading.value = false
  })
}
function columGodosRemove(row) {
  goodsLoading.value = true
  const goodsId = row.id
  const columnId = props.columnId
  removeColumnGooods({
    goodsId,
    columnId
  }).then(res => {
    instance.proxy.$message.success('删除成功')
    getBindGoodsList()
  }).finally(() => {
    goodsLoading.value = false
  })
}
watch(() => props.columnId, () => {
  activeTab.value = 'bind'
  goodsResetQuery()
})
;(() => {
  activeTab.value = 'bind'
  goodsResetQuery()
})()
defineExpose({
  activeTab,
  bindGoodsList,
  columGodosAdd,
  columGodosRemove,
  getBindGoodsList,
  getUnBindGoodsList,
  goodsHandleQuery,
  goodsLoading,
  goodsQueryForm,
  goodsResetQuery,
  goodsTotal,
  tabClick,
  unBindGoodsList
})
</script>
