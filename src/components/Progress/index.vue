<template>
  <div>
    <el-dialog
      title="下载进度提示"
      :model-value="progressDialogVisible"
      width="15%"
      @update:model-value="$emit('update:progressDialogVisible', $event)"
    >
      <el-progress type="circle" :percentage="percentage" />
    </el-dialog>
  </div>
</template>
<script setup>
defineProps({
  percentage: {
    required: true,
    type: Number
  },
  progressDialogVisible: {
    required: true,
    type: Boolean,
    default: false
  }
})
defineEmits(['update:progressDialogVisible'])
</script>
<style lang="scss" scoped>
:deep(.el-dialog__body) {
  text-align: center;
}
</style>
