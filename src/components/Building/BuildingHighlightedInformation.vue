<script setup lang="ts">

defineProps({
  title: { type: String, default: null },
  data: { type: Array<{ label: string, value: string }>, default: null}
})

</script>

<template>
  <section class="space-y-2 rounded-lg border border-grey-400 p-4">
    <h6 v-if="title" class="heading-6">{{ title }}</h6>
    <ul class="space-y-1 text-grey-700">
      <li 
        v-for="item in data" 
        :key="item.label">{{ item.label }}: {{ item.value || 'Onbekend' }}</li>
    </ul>
  </section>
</template>