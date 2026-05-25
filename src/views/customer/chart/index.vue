<template>
  <div>index</div>
</template>

<script setup>
import { ref } from 'vue'
const rooms = ref([])
const messages = ref([])
const currentUserId = ref(1234)
defineExpose({
  currentUserId,
  messages,
  rooms
})
</script>
