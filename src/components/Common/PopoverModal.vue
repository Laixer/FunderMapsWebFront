<script setup lang="ts">

import Modal from '@/components/Common/Modal.vue'

defineProps({
  title: { type: String,  required: true },
  text: { type: String, required: true },
  placing: { type: String, default: 'start', validation: (param: string) => ['start', 'end', 'center'].includes(param)},
})

const emit = defineEmits(['close'])
</script>

<template>
  <Modal 
    variant="popover" 
    :closeable="true" 
    :placing="placing"
    wrapper="main"
    class="pointer-events-none p-0 py-4 mt-8 px-0"
    @close="emit('close')">

    <p class="text-grey-700">
      {{ text }}
    </p>

    <template v-slot:header>
      <h5 id="dialog-label" class="heading-5">{{ title }}</h5>
    </template>
    
    <template 
      v-if="$slots.footer" 
      v-slot:footer>
      <slot name="footer" />
    </template>
    
  </Modal>
</template>