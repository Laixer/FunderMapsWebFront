<script setup lang="ts">
import BarChart from './BarChart.vue'
import { CHART_PALETTE, CHART_PALETTE_SOFT } from './chartDefaults'

withDefaults(defineProps<{
  title?: string
  labels?: string[]
  data?: number[]
  borderColors?: string[]
  backgroundColors?: string[]
}>(), {
  title: 'Statistiek',
  labels: () => [],
  data: () => [],
  borderColors: () => Object.values(CHART_PALETTE),
  backgroundColors: () => Object.values(CHART_PALETTE_SOFT),
})
</script>

<template>
  <BarChart
    :title="title"
    :labels="labels"
    :data="data"
    :horizontal="true"
    :border-colors="borderColors"
    :background-colors="backgroundColors"
  />
</template>
