<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

import { CHART_PALETTE_SOFT } from './chartDefaults'

const props = withDefaults(defineProps<{
  title?: string
  labels?: string[]
  data?: number[]
  backgroundColors?: string[]
}>(), {
  title: 'Statistiek',
  labels: () => [],
  data: () => [],
  backgroundColors: () => Object.values(CHART_PALETTE_SOFT),
})

const canvas = ref<HTMLCanvasElement>()
let chart: Chart | null = null

const createChart = (): void => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: props.labels,
      datasets: [{
        label: props.title,
        data: props.data,
        backgroundColor: props.backgroundColors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  })
}

onMounted(createChart)
onBeforeUnmount(() => { chart?.destroy() })

watch(() => props, () => {
  chart?.destroy()
  createChart()
}, { deep: true })
</script>

<template>
  <canvas ref="canvas" class="chart"></canvas>
</template>
