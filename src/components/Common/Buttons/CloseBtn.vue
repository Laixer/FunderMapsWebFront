<script setup lang="ts">
import CloseIcon from '@assets/svg/icons/close.svg'

defineProps({
  small: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
})

defineEmits(['close'])

// -translate-y-3 translate-x-3 p-0

</script>

<template>
  <button
    class="button button--link | group ml-auto text-blue-900 hover:text-red-500"
    :class="small ? 'text-sm' : ''"
    :disabled="disabled"
    @click="() => disabled ? undefined : $emit('close')"
  >
    <div class="button__label">Sluit</div>
    <CloseIcon
      class="aspect-square text-red-500"
      :class="small ? 'h-3' : 'h-3.5'"
      aria-hidden="true"
    />
  </button>
</template>