<script setup lang="ts">

import { onMounted, ref, watch } from 'vue';

import { CHART_TRANSPARENT_COLORS, CHART_COLORS } from '@/config';
import Chart from 'chart.js/auto';

const props = withDefaults(defineProps<{
  title?: string,
  labels?: string[],
  data?: number[],
  horizontal?: boolean,
  borderColors?: string[],
  backgroundColors?: string[]
}>(), {
  title: 'Statistiek',
  labels: () => ['red', 'blue', 'green'],
  data: () => [100, 200, 600],
  horizontal: false,
  borderColors: () => Object.values(CHART_COLORS),
  backgroundColors: () => Object.values(CHART_TRANSPARENT_COLORS)
})

let chart: Chart | null = null

// Reference to Chart canvas element
const canvas = ref<HTMLCanvasElement>();

const createChart = function createChart(
  title: string, labels: string[], data: number[], backgroundColors: string[], borderColors: string[], horizontal: boolean
) {
  if (! canvas.value || ! canvas.value.getContext("2d")) {
    console.warn("No canvas available", title)
    return
  } 

   
  chart = new Chart(
    canvas.value.getContext("2d") as CanvasRenderingContext2D, 
    {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: title,
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1
          },
        ]
      },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            beginAtZero: true
          }
        }
      },
    }
  );

  // Disable animation in the popup, it is too much
  chart!.options.animation = false;
}

onMounted(() => {
  createChart(
    props.title,
    props.labels,
    props.data,
    props.backgroundColors,
    props.borderColors,
    props.horizontal
  )
})

watch(
  () => props,
  (props) => {
    if (! chart) return 

    chart.destroy()
    createChart(
      props.title,
      props.labels,
      props.data,
      props.backgroundColors,
      props.borderColors,
      props.horizontal
    )
  },
  {
    deep: true
  }
)

</script>

<template>
  <!-- <StatisticsModal
    :title="title"
    @close="emit('close')"> -->
    <canvas ref="canvas" class="chart"></canvas>
  <!-- </StatisticsModal> -->
</template>