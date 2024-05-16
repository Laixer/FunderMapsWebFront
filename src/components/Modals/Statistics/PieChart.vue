<script setup lang="ts">

import { onMounted, ref } from 'vue';

// import StatisticsModal from '@/components/Modals/StatisticsModal.vue'
import { CHART_TRANSPARENT_COLORS } from '@/config';
import Chart from 'chart.js/auto';

const { 
  title, labels, data, backgroundColors 
} = withDefaults(defineProps<{
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


onMounted(() => {
  console.log(title)
  console.log(data)
  console.log(backgroundColors)
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
})

</script>

<template>
  <!-- <StatisticsModal
    :title="title"
    @close="emit('close')"> -->
    <canvas ref="canvas" class="chart"></canvas>
  <!-- </StatisticsModal> -->
</template>