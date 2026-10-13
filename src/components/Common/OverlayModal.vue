<script setup lang="ts">

import Modal from '@/components/Common/Modal.vue'

// `active` is passed on as it came: left out stays left out (undefined, not
// false), so that Modal can tell "not open" from "did not say".
const { closeable = true, variant = 'full', placing = 'center', wrapper = 'full', active = undefined } = defineProps<{
  title?: string
  variant?: string
  closeable?: boolean
  placing?: string
  wrapper?: string
  active?: boolean
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
    :active="active"
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
