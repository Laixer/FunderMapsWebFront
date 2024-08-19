<script setup lang="ts">
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue'
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';

const { closeable } = defineProps({
  title: { type: String, default: null },
  icon: { type: String, default: null },
  subtitle: { type: String, default: null },
  closeable: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])

const handleClose = function handleClose() {
  if(closeable) {
    emit('close')
  }
}
</script>

<template>
  <div class="panel">
    <div class="panel__header items-center gap-2">
      <FundermapsIcon
        v-if="icon"
        :name="icon"
        class="accent-color-blue aspect-square w-4"
        aria-hidden="true"
      />
      <h6 v-if="title" class="heading-6">{{ title }}</h6>
      <CloseBtn 
        v-if="closeable"
        :small="false"
        @close="handleClose" />
    </div>
    <div class="panel__content" :style="$slots.footer ? 'padding-bottom: 1rem;' : ''">
      <div v-if="subtitle || $slots.subtitle" class="panel__subtitle flex items-center gap-3">
        <slot name="subtitle">
          <h4 class="heading-4">{{ subtitle }}</h4>
        </slot>
      </div>
      <slot />
    </div>
    <div 
      v-if="$slots.footer" 
      class="panel__footer | flex gap-2">
      <slot name="footer" />
    </div>
  </div>
</template>

<style>

.panel .panel__subtitle h4 {
  font-size: clamp(1rem, 1rem + 1.0458vw, 1.5rem);
}

</style>