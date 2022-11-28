import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createMenu } from '@/utils'
import { i18n } from '@/plugins/i18n'

import './assets/styles/main.css'

createMenu()

createApp(App).use(router).use(i18n).mount('#app')
