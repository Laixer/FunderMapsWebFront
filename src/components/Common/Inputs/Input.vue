<script setup lang="ts">

import { computed, useAttrs } from 'vue';
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

defineOptions({ inheritAttrs: false })

const model = defineModel()
const emit = defineEmits(['focus'])

const attrs = useAttrs()

/**
 * Specifying an identifier is recommended, but if no identifier is provided, we can generate one.
 */
const identifier = computed<string>(() => {
  return props.id ?? `input-${(window?.crypto?.randomUUID())}`
})

// Make the disabled prop reactive
const isDisabled = computed<boolean>(() => !! props.disabled)

const hasValidationError = computed(() => props.validationStatus === 'error' && props.validationMessage)
const validationMessageId = computed(() => `${identifier.value}-error`)

/**
 * Split fallthrough attrs: class/style stay on root wrapper, everything else
 * (ARIA attributes, role, event listeners) passes through to <input>.
 */
const rootAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  if ('class' in attrs) result.class = attrs.class
  if ('style' in attrs) result.style = attrs.style
  return result
})

const inputAttrs = computed(() => {
  const { class: _cls, style: _style, ...rest } = attrs
  void _cls; void _style
  return rest
})

</script>

<template>
  <div class="input--text" v-bind="rootAttrs">
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
        v-bind="inputAttrs"
        :type="type"
        :id="identifier"
        :name="identifier"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        :disabled="isDisabled"
        :tabindex="tabindex"
        :aria-invalid="hasValidationError ? true : undefined"
        :aria-describedby="hasValidationError ? validationMessageId : undefined"
        v-model="model"
        @focus="emit('focus')" />

      <div v-if="$slots.after" class="input-field__after">
        <slot name="after" />
      </div>
    </div>
    <div
      v-if="validationMessage && validationStatus !== 'none'"
      :id="validationMessageId"
      class="input__message | validation__message"
      :data-variant="validationStatus"
      role="alert">
      {{ validationMessage }}
    </div>
  </div>
</template>
