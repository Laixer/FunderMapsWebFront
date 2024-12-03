<script setup lang="ts">

import VueMarkdown from 'vue-markdown-render'
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

    <VueMarkdown :source="text" :options="{ breaks: true, linkify: true }" class="markdown text-grey-700" />

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