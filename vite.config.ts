
import { fileURLToPath, URL } from "url";
// import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import { execSync } from "child_process";


// https://vitejs.dev/config/
export default defineConfig(() => {

  // Pass latest commit has to process environment
  process.env.VITE_GIT_COMMIT_HASH = execSync('git rev-parse --short HEAD').toString().trimEnd()

  return {
    plugins: [vue(), svgLoader()],
    resolve: {
      alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: '@assets', replacement: fileURLToPath(new URL('./src/assets', import.meta.url)) },
      ],
    },
    // For separate build of auth pages
    // build: {
    //   rollupOptions: {
    //     input: {
    //       main: resolve(__dirname, 'index.html'),
    //       auth: resolve(__dirname, 'auth.html'),
    //     },
    //   },
    // },
  }
})
// vite.config.js
