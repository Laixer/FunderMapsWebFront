import { fileURLToPath, URL } from "url";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from "child_process";

export default defineConfig(() => {
  try {
    process.env.VITE_GIT_COMMIT_HASH = execSync('git rev-parse --short HEAD').toString().trimEnd()
  } catch {
    process.env.VITE_GIT_COMMIT_HASH = 'unknown'
  }

  return {
    plugins: [tailwindcss(), vue(), svgLoader()],
    resolve: {
      alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: '@assets', replacement: fileURLToPath(new URL('./src/assets', import.meta.url)) },
      ],
    },
    build: {
      rollupOptions: {
        output: {
          // Vite 8 (rolldown) requires manualChunks as a function, not an
          // object. Group third-party deps into named chunks to keep the
          // initial bundle small.
          manualChunks(id: string) {
            if (id.includes('mapbox-gl')) return 'mapbox-gl'
            if (id.includes('chart.js') || id.includes('chartjs-plugin-trendline')) return 'chart'
            if (id.includes('vue-markdown-render')) return 'markdown'
          },
        }
      }
    },
  }
})
