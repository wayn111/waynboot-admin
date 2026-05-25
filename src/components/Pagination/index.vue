<template>
  <div>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  total: {
    required: true,
    type: Number
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array,
    default() {
      return [10, 20, 30, 50]
    }
  }
})
const emit = defineEmits(['update:page', 'update:limit', 'pagination'])
const currentPage = computed({
  get() {
    return props.page
  },
  set(val) {
    emit('update:page', val)
  }
})
const pageSize = computed({
  get() {
    return props.limit
  },
  set(val) {
    emit('update:limit', val)
  }
})
function handleSizeChange(val) {
  emit('pagination', {
    pageNum: props.page,
    pageSize: val
  })
}
function handleCurrentChange(val) {
  emit('pagination', {
    pageNum: val,
    pageSize: props.limit
  })
}
defineExpose({
  currentPage,
  handleCurrentChange,
  handleSizeChange,
  pageSize
})
</script>
<style lang="scss" scoped>
.el-pagination {
  margin-top: 15px;
}
</style>
