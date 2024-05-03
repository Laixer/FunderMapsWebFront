<script setup lang="ts">
import LoadingIndicator from '@/components/Branding/LoadingIndicator.vue';
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue';
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const classList = computed<string[]>(() => {
  let list: string[] = []

  if (props.disabled) {
    list.push('disabled')
    list.push('text-gray-700')
  }
  if (props.loading) {
    list.push('loading')
  }
  return list
})

</script>

<template>
  <a 
    href="#" 
    class="flex link link--outline | group px-4 py-3 "
    :class="classList">
    <slot />
    <span>{{ label }}</span>
    <AnimatedArrowIcon v-if="! loading && ! disabled" />
  
    <LoadingIndicator 
      v-if="loading"
      class="grow flex items-end"
      :hideLabel="true"
      :small="true" />
  </a>
</template>

<style>

.link--outline.disabled {
  cursor: not-allowed;
  background: rgb(232 234 241 / var(--tw-border-opacity));
}
.link--outline.disabled:hover {
  border-color: rgb(232 234 241 / var(--tw-border-opacity));
  box-shadow: none;
}
.grow {
  flex-grow: 1;
}
.items-end {
  align-items: flex-end;
}
.link--outline.loading {
  cursor: wait;
}

</style>