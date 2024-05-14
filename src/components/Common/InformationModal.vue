<script setup lang="ts">

import Modal from '@/components/Common/Modal.vue'

defineProps({
  title: { type: String, default: '' },
  variant: { type: String, default: '', validation: (param: string) => ['narrow', 'full'].includes(param) },
  closeable: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])

</script>

<template>
  <Modal 
    :title="title" 
    :variant="variant" 
    :closeable="closeable" 
    class="xl:pointer-events-none xl:bg-transparent"
    @close="emit('close')">
    <slot />
    
    <template 
      v-if="$slots.footer" 
      v-slot:footer>
      <slot name="footer" />
    </template>
    
  </Modal>
</template>