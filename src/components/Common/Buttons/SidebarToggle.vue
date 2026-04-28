<script setup lang="ts">
import ChevronRightIcon from '@assets/svg/icons/chevron-right.svg'

const { direction = 'right', disabled = false } = defineProps<{
  direction?: 'left' | 'right'
  disabled?: boolean
}>()

defineEmits<{ close: [] }>()
</script>

<template>
  <button
    type="button"
    class="sidebar-toggle | group ml-auto inline-flex h-8 w-8 items-center justify-center rounded text-blue-900 transition-colors duration-150 hover:bg-grey-200 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 disabled:opacity-40"
    :disabled="disabled"
    :aria-label="direction === 'left' ? 'Verberg zijbalk' : 'Verberg zijbalk'"
    @click="() => disabled ? undefined : $emit('close')"
  >
    <ChevronRightIcon
      class="aspect-square h-3.5 transition-transform duration-150"
      :class="[
        direction === 'left' ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5',
      ]"
      aria-hidden="true"
    />
  </button>
</template>
