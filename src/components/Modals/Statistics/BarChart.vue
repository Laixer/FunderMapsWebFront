<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

import { CHART_PALETTE, CHART_PALETTE_SOFT } from './chartDefaults'

const props = withDefaults(defineProps<{
  title?: string
  labels?: string[]
  data?: number[]
  horizontal?: boolean
  borderColors?: string[]
  backgroundColors?: string[]
}>(), {
  title: 'Statistiek',
  labels: () => [],
  data: () => [],
  horizontal: false,
  borderColors: () => Object.values(CHART_PALETTE),
  backgroundColors: () => Object.values(CHART_PALETTE_SOFT),
})

const canvas = ref<HTMLCanvasElement>()
let chart: Chart | null = null

const createChart = (): void => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [{
        label: props.title,
        data: props.data,
        backgroundColor: props.backgroundColors,
        borderColor: props.borderColors,
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      indexAxis: props.horizontal ? 'y' : 'x',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { beginAtZero: true, grid: { display: !props.horizontal } },
        y: { beginAtZero: true, grid: { display: props.horizontal } },
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
