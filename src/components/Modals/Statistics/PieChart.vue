<script setup lang="ts">

import { onMounted, watch, ref } from 'vue';

// import StatisticsModal from '@/components/Modals/StatisticsModal.vue'
import { CHART_TRANSPARENT_COLORS } from '@/config';
import Chart from 'chart.js/auto';

const props = withDefaults(defineProps<{
  title?: string,
  labels?: string[],
  data?: string[]|number[],
  backgroundColors?: string[]
}>(), {
  title: 'Statistiek',
  labels: () => ['red', 'blue', 'green'],
  data: () => [100, 200, 600],
  backgroundColors: () => Object.values(CHART_TRANSPARENT_COLORS)
})

// @ts-ignore: No time to deep dive into all the TS particulars of Chart.js
let chart: any|null = null

// Reference to Chart canvas element
const canvas = ref<HTMLCanvasElement>();

const createChart = function createChart(
  title: string, labels: string[], data: string[]|number[], backgroundColors: string[]
) {
  if (! canvas.value || ! canvas.value.getContext("2d")) {
    console.log("No canvas available...", title)
    return
  } 

  // eslint-disable-next-line no-unused-vars
  chart = new Chart(
    canvas.value.getContext("2d") as CanvasRenderingContext2D, 
    {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            label: title,
            data,
            backgroundColor: backgroundColors,
            hoverOffset: 4
          },
        ]
      }
    }
  );

  // Disable animation in the popup, it is too much
  chart.options.animation = false; 
}

onMounted(() => {
  createChart(
    props.title,
    props.labels,
    props.data,
    props.backgroundColors
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
      props.backgroundColors
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