<script setup lang="ts">

defineProps({
  label: { type: String, default: 'Loading...' },
  hideLabel: { type: Boolean, default: false },
  small: { type: Boolean, default: false }
})

</script>

<template>
  <div
    class="loading-indicator space-y-2 flex flex-col items-center"
    data-state="loading"
    role="status"
    aria-live="polite"
  >
    <svg
      class="logo-mark"
      :class="small ? 'w-4' : 'w-16'"
      viewBox="0 0 88 100"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      aria-hidden="true"
    >
      <g fill-rule="nonzero" fill="none">
        <path
          d="m27.76 14.94 6.258 11.97h30.36c10.234 0 15.222-10.102 15.222-10.102L88.396.085h-56.83C28.606 0 23.194 6.197 27.761 14.94Z"
          class="logo-mark__green"
          fill="#28CC8B"
        />
        <path
          d="M46.196 62.903 20.91 14.941C16.09 5.857 22.095 1.613 25.646 0h-3.551C16.428 0 10.678 2.801 8.393 7.216c-.17.34-6.426 12.054-6.426 12.054-3.975 7.555-1.353 14.6 2.791 22.41L35.625 100s9.557-18.166 10.91-20.713c2.705-5.178 2.875-10.272-.34-16.384Z"
          class="logo-mark__blue"
          fill="#17A4EA"
        />
        <path
          d="M71.06 32.937H37.23L50.34 57.64c5.073-.594 9.724-3.905 12.092-8.404 0 .085 8.626-16.299 8.626-16.299h.002Z"
          class="logo-mark__yellow"
          fill="#FFCC69"
        />
      </g>
    </svg>
    <div 
      v-if="! hideLabel" 
      class="text-grey-700">{{ label }}</div>
  </div>
</template>