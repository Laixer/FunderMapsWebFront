<script setup lang="ts">

import { computed } from 'vue';
import { type ZodIssue } from 'zod';

const props = withDefaults(defineProps<{
  id?: string,
  label?: string,
  type?: string,
  placeholder?: string,
  autocomplete?: string,
  instruction?: string,
  required?: boolean,
  disabled?: boolean,
  validationStatus?: 'none' | 'success' | 'error',
  validationMessage?: ZodIssue[]|string,
  tabindex?: number
}>(), {
  type: 'text',
  required: false,
  disabled: false,
  validationStatus: 'none'
})

const model = defineModel()
const emit = defineEmits(['focus'])

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
  <div class="input--text">
    <label 
      v-if="label" 
      :for="identifier" 
      class="input__label">{{ label }}</label>
    <div 
      v-if="instruction"
      class="input__message">{{ instruction }}</div>
    <div 
      class="input-field" 
      :data-validation="validationStatus">

      <div v-if="$slots.before" class="input-field__before">
        <slot name="before" />
      </div>

      <input 
        :type="type" 
        :id="identifier" 
        :name="identifier" 
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        :disabled="isDisabled"
        :tabindex="tabindex"
        v-model="model"
        @focus="emit('focus')" />

      <div v-if="$slots.after" class="input-field__after">
        <slot name="after" />
      </div>
    </div>
    <div 
      v-if="validationMessage && validationStatus !== 'none'"
      class="input__message | validation__message" 
      :data-variant="validationStatus">
      {{ validationMessage }}
    </div>
  </div>
</template>