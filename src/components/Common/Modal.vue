<script setup lang="ts">

import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
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
  // Not false: a boolean prop that is left out would otherwise read as
  // "not active", and a dialog that is created when it opens (v-if) says
  // nothing about `active`. Its focus trap never switched on.
  active: undefined,
})

const emit = defineEmits<{ close: [] }>()

const dialogRef = ref<HTMLElement | null>(null)

// A dialog that stays in the page (v-show) says when it is open; one that is
// created when it opens is open for as long as it exists.
const isActive = computed(() => props.active !== false)
useFocusTrap(dialogRef, isActive)

// The heading that names the dialog gets an id of its own: several dialogs
// are in the page at once (three of them shared id="dialog-label").
const labelId = useId()

const handleClose = function handleClose() {
  if (props.closeable) {
    emit('close')
  }
}

// Escape closes the dialog, if it can be closed and is on screen (a dialog
// that stays in the page is only hidden, and then has no boxes). Listened for
// here and not in the focus trap: every dialog needs it, with or without a trap.
const handleEscape = function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && dialogRef.value?.getClientRects().length) {
    handleClose()
  }
}

onMounted(() => document.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => document.removeEventListener('keydown', handleEscape))
</script>

<template>
  <div
    class="app-modal modal | z-20 grid overflow-y-auto p-4"
    :class="`place-items-${placing}`"
    :data-variant="wrapper"
  >
    <div
      ref="dialogRef"
      class="panel pointer-events-auto focus:outline-none"
      role="dialog"
      tabindex="-1"
      :aria-labelledby="title || $slots.header ? labelId : undefined"
      aria-modal="true"
      :data-variant="variant"
    >
      <header class="panel__header">
        <slot name="header" :label-id="labelId">
          <h4 v-if="title" :id="labelId" class="heading-4">{{ title }}</h4>
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