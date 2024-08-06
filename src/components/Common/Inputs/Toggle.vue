<script setup lang="ts">

import { computed } from 'vue';

const props = withDefaults(defineProps<{
  id?: string,
  label?: string
  disabled?: boolean,
  checked?: boolean,
  fieldValue?: any
}>(), {
  checked: false,
  fieldValue: true // The field value if checked
})

const model = defineModel()

/** 
 * Specifying an identifier is recommended, but if no identifier is provided, we can generate one.
 */ 
const identifier = computed<string>(() => {
  return props.id ?? `input-${(window?.crypto?.randomUUID())}`
})

// Make the disabled prop reactive
const isDisabled = computed<boolean>(() => !! props.disabled)

</script>

<template>
  <div class="input-group">
    <div class="input--toggle">
      <input 
        type="checkbox" 
        :id="identifier" 
        class="sr-only"
        v-model="model"
        :true-value="fieldValue"
        :checked="checked"
        :disabled="isDisabled" />
      <label 
        :for="identifier" 
        class="input__label">{{ label || "&#8203;" }}</label>
    </div>
  </div>
</template>