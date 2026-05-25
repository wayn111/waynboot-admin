<template>
  <div class="card" style="margin-bottom:20px">
    <div class="card-title">运营提醒</div>
    <el-row :gutter="16">
      <el-col :span="6" v-for="item in notices" :key="item.title">
        <div class="notice-card">
          <div class="notice-icon" :style="{ background: item.bg }">{{ item.icon }}</div>
          <div class="notice-body">
            <div class="notice-title">{{ item.title }}</div>
            <div class="notice-desc">{{ item.desc }}</div>
          </div>
          <span class="notice-arrow">›</span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
const notices = [
  { icon: '🎉', bg: '#fff3e0', title: '大促活动进行中', desc: '618活动还剩 24 天，点击查看详情' },
  { icon: '🎟️', bg: '#fce4ec', title: '优惠券即将过期', desc: '3 张优惠券将在 48 小时内过期' },
  { icon: '🚚', bg: '#e8f4ff', title: '物流异常预警', desc: '5 个包裹超过 72 小时未更新状态' },
  { icon: '💬', bg: '#e8f5e9', title: '用户评价待处理', desc: '12 条新评价等待商家回复' }
]
</script>

<style lang="scss" scoped>
.card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  padding: 24px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.374px;
  margin-bottom: 16px;
}
.notice-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f5f7;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #ebebed; }
}
.notice-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.notice-body { flex: 1; min-width: 0; }
.notice-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notice-desc {
  font-size: 12px;
  color: #6e6e73;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notice-arrow { color: #c7c7cc; font-size: 18px; flex-shrink: 0; }
</style>
