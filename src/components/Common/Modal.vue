<script setup lang="ts">

import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'

const { closeable } = defineProps({
  title: { type: String, default: '' },
  variant: { type: String, default: '', validation: (param: string) => ['narrow', 'full', 'popover'].includes(param) },
  closeable: { type: Boolean, default: true },
  placing: { type: String, default: 'center', validation: (param: string) => ['start', 'end', 'center'].includes(param)},
  wrapper: { type: String, default: 'full', validation: (param: string) => ['full', 'main'].includes(param)}
})

const emit = defineEmits(['close'])

const handleClose = function handleClose() {
  if (closeable) {
    emit('close')
  }
}
</script>

<template>
  <div
    class="app-modal modal | z-20 grid overflow-y-auto p-4"
    :class="`place-items-${placing}`"
    :data-variant="wrapper"
  >
    <div
      class="panel pointer-events-auto"
      aria-role="dialog"
      aria-describedby="dialog-label"
      aria-modal="true"
      :data-variant="variant"
    >
      <header class="panel__header">
        
        <slot name="footer">
          <h4 v-if="title" id="dialog-label" class="heading-4">{{ title }}</h4>
        </slot>
        
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