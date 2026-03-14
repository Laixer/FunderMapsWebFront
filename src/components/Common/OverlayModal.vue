<script setup lang="ts">

import Modal from '@/components/Common/Modal.vue'

const { closeable = true, variant = 'full', placing = 'center', wrapper = 'full' } = defineProps<{
  title?: string
  variant?: string
  closeable?: boolean
  placing?: string
  wrapper?: string
}>()

const emit = defineEmits<{ close: [] }>()

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
    :placing="placing"
    :wrapper="wrapper"
    class="bg-blue-900/90"
    @click.self="handleClose"
    @close="emit('close')">
    <slot />

    <template
      v-if="$slots.footer" >
      <slot name="footer" />
    </template>

  </Modal>
</template>
