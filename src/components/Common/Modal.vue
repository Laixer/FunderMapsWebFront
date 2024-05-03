<script setup lang="ts">

import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'

const { closeable } = defineProps({
  title: { type: String, default: '' },
  variant: { type: String, default: '', validation: (param: string) => ['narrow', 'full'].includes(param) },
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
  <div
    class="app-modal modal | z-20 grid place-items-center overflow-y-auto bg-blue-900/90 p-4"
    data-variant="full"
  >
    <div
      class="panel pointer-events-auto"
      aria-role="dialog"
      aria-describedby="dialog-label"
      aria-modal="true"
      :data-variant="variant"
    >
      <header class="panel__header">
        <h4 v-if="title" id="dialog-label" class="heading-4">{{ title }}</h4>
        
        <CloseBtn 
          v-if="closeable" 
          :small="false"
          class="absolute right-8 top-3"
          @close="handleClose" />
      </header>
      <div class="panel__content content | -mx-6 space-y-4 px-6">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="panel__footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>