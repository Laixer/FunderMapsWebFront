import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

// Multi line clamp directive
import v3lc from './directives/VueLineClamp'

const pinia = createPinia()

createApp(App)
  .use(v3lc)
  .use(pinia)
  .use(router)
  .mount('#app')


  