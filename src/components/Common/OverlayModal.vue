<script setup lang="ts">

import Modal from '@/components/Common/Modal.vue'

const { closeable } = defineProps({
  title: { type: String, default: '' },
  variant: { type: String, default: 'full', validation: (param: string) => ['narrow', 'full'].includes(param) },
  closeable: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])

const handleClose = function handleClose() {
  if(closeable) {
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