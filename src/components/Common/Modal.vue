<script setup lang="ts">

import { ref, toRef } from 'vue'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'
import { useFocusTrap } from '@/composables/useFocusTrap'

const props = withDefaults(defineProps<{
  title?: string
  variant?: string
  closeable?: boolean
  placing?: string
  wrapper?: string
  active?: boolean
}>(), {
  closeable: true,
  placing: 'center',
  wrapper: 'full',
})

const emit = defineEmits<{ close: [] }>()

const dialogRef = ref<HTMLElement | null>(null)
useFocusTrap(dialogRef, props.active !== undefined ? toRef(props, 'active') : undefined)

const handleClose = function handleClose() {
  if (props.closeable) {
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
      ref="dialogRef"
      class="panel pointer-events-auto"
      role="dialog"
      aria-describedby="dialog-label"
      aria-modal="true"
      :data-variant="variant"
    >
      <header class="panel__header">
        <slot name="header">
          <h4 v-if="title" id="dialog-label" class="heading-4">{{ title }}</h4>
        </slot>

        <CloseBtn
          v-if="closeable"
          :small="false"
          class="absolute right-4 top-4"
          @close="handleClose" />
      </header>
      <div class="panel__content space-y-4">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="panel__footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>