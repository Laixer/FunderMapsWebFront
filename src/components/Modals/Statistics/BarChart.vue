<script setup lang="ts">

// import StatisticsModal from '@/components/Modals/StatisticsModal.vue'
import { CHART_TRANSPARENT_COLORS, CHART_COLORS } from '@/config';
import Chart from 'chart.js/auto';
import { onMounted, ref } from 'vue';

const { 
  title, labels, data, horizontal, borderColors, backgroundColors 
} = withDefaults(defineProps<{
  title?: string,
  labels?: string[],
  data?: string[]|number[],
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


// const emit = defineEmits(['close'])

// Reference to Chart canvas element
const canvas = ref<HTMLCanvasElement>();

onMounted(() => {
  if (! canvas.value || ! canvas.value.getContext("2d")) {
    console.log("No canvas available...", title)
    return
  } 

  // eslint-disable-next-line no-unused-vars
  const chart = new Chart(
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
  chart.options.animation = false; 
})

</script>

<template>
  <!-- <StatisticsModal
    :title="title"
    @close="emit('close')"> -->
    <canvas ref="canvas" class="chart"></canvas>
  <!-- </StatisticsModal> -->
</template>