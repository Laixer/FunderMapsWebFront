<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Chart from 'chart.js/auto'
import chartTrendline from 'chartjs-plugin-trendline'

import { CHART_PALETTE } from './chartDefaults'

Chart.register(chartTrendline)

declare module 'chart.js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ChartDatasetProperties<TType, TData> {
    trendlineLinear?: {
      colorMin?: string
      colorMax?: string
      lineStyle?: string
      width?: number
      accessibility?: { description?: string }
    }
  }
}

interface Point { x: number; y: number }

const props = withDefaults(defineProps<{
  title?: string
  labels?: string[]
  data?: Point[]
  horizontal?: boolean
  borderColors?: string[]
  backgroundColors?: string[]
}>(), {
  title: 'Statistiek',
  labels: () => [],
  data: () => [],
  horizontal: false,
  borderColors: () => [CHART_PALETTE.blue],
  backgroundColors: () => [CHART_PALETTE.blue],
})

const canvas = ref<HTMLCanvasElement>()
let chart: Chart | null = null

const createChart = (): void => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: 'bubble',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        backgroundColor: props.backgroundColors,
        borderColor: props.borderColors,
        borderWidth: 1,
        trendlineLinear: {
          colorMin: CHART_PALETTE.blue,
          colorMax: CHART_PALETTE.blue,
          lineStyle: 'solid',
          width: 2,
          // The plugin adds a sentence about the trendline to the name of the
          // canvas; without this one it is English ("Linear trendline for Dataset.")
          accessibility: { description: 'Met trendlijn.' },
        },
      }],
    },
    options: {
      indexAxis: props.horizontal ? 'y' : 'x',
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
          title: { display: true, text: 'mm' },
        },
        x: {
          ticks: {
            callback: (value: string | number) =>
              new Date(value).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'short',
              }).split(' '),
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: { raw: unknown }) => {
              const raw = context.raw as Point
              return `${new Date(raw.x).toLocaleDateString('nl-NL')}: ${raw.y} mm`
            },
          },
        },
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
  <!-- A canvas has no name of its own; the title says what the chart shows -->
  <canvas ref="canvas" class="chart" role="img" :aria-label="title"></canvas>
</template>
