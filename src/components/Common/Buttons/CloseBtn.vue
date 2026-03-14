<script setup lang="ts">
import CloseIcon from '@assets/svg/icons/close.svg'

withDefaults(defineProps<{
  small?: boolean
  disabled?: boolean
}>(), {
  small: true,
})

defineEmits<{ close: [] }>()

// -translate-y-3 translate-x-3 p-0

</script>

<template>
  <button
    class="button button--link | group ml-auto text-blue-900 hover:text-red-500"
    :class="small ? 'text-sm' : ''"
    :disabled="disabled"
    @click="() => disabled ? undefined : $emit('close')"
  >
    <span class="sr-only">Sluit</span>
    <CloseIcon
      class="aspect-square text-red-500 transition-transform duration-150 group-hover:scale-110"
      :class="small ? 'h-3' : 'h-3.5'"
      aria-hidden="true"
    />
  </button>
</template>