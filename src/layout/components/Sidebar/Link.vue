<template>
  <component :is="type" v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { isExternal as isExternalUrl } from '@/utils/validate'
const props = defineProps({
  to: {
    type: String,
    required: true
  }
})
const isExternal = computed(() => {
  return isExternalUrl(props.to)
})
const type = computed(() => {
  if (isExternal.value) {
    return 'a'
  }
  return 'router-link'
})
function linkProps(to) {
  if (isExternal.value) {
    return {
      href: to,
      target: '_blank',
      rel: 'noopener'
    }
  }
  return {
    to: to
  }
}
defineExpose({
  isExternal,
  linkProps,
  type
})
</script>
