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

  // Unique per build: hashed filenames are content-based, so consecutive
  // deploys reuse URLs for unchanged chunks. During a deploy transition the
  // static host's SPA catch-all can answer a not-yet/no-longer-existing
  // chunk URL with index.html, and the CDN edge then caches that HTML under
  // the .js URL (s-maxage=86400) - poisoning the URL for a day. A build id
  // in every filename makes each deploy's URLs fresh, so a poisoned entry
  // is never requested again.
  const buildId = Date.now().toString(36)

  return {
    plugins: [tailwindcss(), vue(), svgLoader()],
    worker: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash]-${buildId}.js`,
          chunkFileNames: `assets/[name]-[hash]-${buildId}.js`,
          assetFileNames: `assets/[name]-[hash]-${buildId}[extname]`,
        },
      },
    },
    resolve: {
      alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: '@assets', replacement: fileURLToPath(new URL('./src/assets', import.meta.url)) },
      ],
    },
    build: {
      // maplibre-gl is the floor of the bundle (~1.5MB minified) and
      // lives in its own chunk via manualChunks below. Raise the warning
      // so the build output isn't noisy; other chunks all sit comfortably
      // below.
      chunkSizeWarningLimit: 1800,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash]-${buildId}.js`,
          chunkFileNames: `assets/[name]-[hash]-${buildId}.js`,
          assetFileNames: `assets/[name]-[hash]-${buildId}[extname]`,
          // Vite 8 (rolldown) requires manualChunks as a function, not an
          // object. Group third-party deps into named chunks to keep the
          // initial bundle small.
          manualChunks(id: string) {
            if (id.includes('maplibre-gl')) return 'maplibre-gl'
            if (id.includes('chart.js') || id.includes('chartjs-plugin-trendline')) return 'chart'
            if (id.includes('vue-markdown-render')) return 'markdown'
          },
        }
      }
    },
  }
})
