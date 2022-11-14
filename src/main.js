import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createMenu } from '@/utils'

import './assets/styles/main.css'

createMenu()

createApp(App).use(router).mount('#app')
