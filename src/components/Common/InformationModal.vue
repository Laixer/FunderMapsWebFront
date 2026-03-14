<script setup lang="ts">

import Modal from '@/components/Common/Modal.vue'

const { closeable = true } = defineProps<{
  title?: string
  variant?: string
  closeable?: boolean
}>()

const emit = defineEmits<{ close: [] }>()

const handleClose = function handleClose() {
  if (closeable) {
    emit('close')
  }
}
</script>

<template>
  <Modal
    :title="title"
    :variant="variant"
    :closeable="closeable"
    class="bg-blue-900/90"
    @click.self="handleClose"
    @close="emit('close')">
    <slot />
    
    <template 
      v-if="$slots.footer" 
      v-slot:footer>
      <slot name="footer" />
    </template>
    
  </Modal>
</template>