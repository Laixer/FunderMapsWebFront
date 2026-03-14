<script setup lang="ts">
import LoadingIndicator from '@/components/Branding/LoadingIndicator.vue';
import { computed } from 'vue';

const props = defineProps<{
  label: string
  loading?: boolean
  disabled?: boolean
  active?: boolean
}>()

const classList = computed<string[]>(() => {
  let list: string[] = []

  if (props.disabled) {
    list.push('disabled')
    list.push('text-grey-700')
  }
  if (props.loading) {
    list.push('loading')
  }
  if (props.active) {
    list.push('active')
  }
  return list
})

</script>

<template>
  <a
    href="#"
    class="flex link link--outline | group px-4 py-3"
    :class="classList"
    :tabindex="disabled ? -1 : undefined"
    :aria-disabled="disabled || undefined">
    <slot />
    <span>{{ label }}</span>
    <LoadingIndicator 
      v-if="loading"
      class="grow flex items-end"
      :hideLabel="true"
      :small="true" />
  </a>
</template>

