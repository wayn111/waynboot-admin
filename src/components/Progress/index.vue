<template>
  <div>
    <el-dialog title="下载进度提示" :visible.sync="progressDialogVisible" width="15%">
      <el-progress type="circle" :percentage="percentage" />
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    percentage: {
      required: true,
      type: Number
    },
    progressDialogVisible: {
      required: true,
      type: Boolean,
      default: false
    }
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
 ::v-deep .el-dialog__body {
  text-align: center;
}
</style>
