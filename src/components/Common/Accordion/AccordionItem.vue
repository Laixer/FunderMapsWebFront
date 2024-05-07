<script setup lang="ts">
import { ref, toRef, watch } from 'vue';

import PlusIcon from '@assets/svg/icons/plus.svg'
import MinusIcon from '@assets/svg/icons/minus.svg'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  cache: { type: Boolean, required: false },
  sessionKey: { type: String, required: false }
})

const { title, cache, open, sessionKey } = props

const emits = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
  (e: 'toggle', value: boolean): void
}>()

// (['open', 'close', 'toggle'])

// TODO: Not quite perfect...
const isOpenProp = toRef(() => props.open)
const isOpen = ref(open)

if (cache) {
  const internalSessionKey = sessionKey || `accordion-${title}`

  // Get from session storage, if state is not passed through prop
  if (open === null) {
    const cachedValue = sessionStorage.getItem(internalSessionKey)
    if (cachedValue) {
      isOpen.value = cachedValue === 'true'
    }
  }

  watch(
    () => isOpen.value, 
    (value) => {
      if (value) {
        sessionStorage.setItem(internalSessionKey, 'true')  
      } else {
        sessionStorage.removeItem(internalSessionKey)
      }
    }
  )
}

watch(
  () => isOpenProp.value,
  (value) => {
    isOpen.value = value
  },
  { immediate: true }
)

const handleToggle = function handleToggle() {
  isOpen.value = ! isOpen.value

  if (isOpen.value) {
    emits("open")
  } else {
    emits('close')
  }

  emits('toggle', !! isOpen.value )
}

</script>

<template>
  <details :open="isOpen">
    <summary @click.prevent="handleToggle" class="list-none">
      <div class="flex justify-between py-4">
        <h4 class="font-bold leading-none">{{ title }}</h4>
        <span v-show="! isOpen">
          <PlusIcon class="w-4" />
        </span>
        <span v-show="isOpen">
          <MinusIcon class="w-4" />
        </span>
      </div>
    </summary>
    <div class="content">
      <slot />
    </div>
  </details>
</template>