import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import useSupabase from './composables/useSupabase'
import { useUser } from './composables/useUser'

import './assets/styles/main.css'

const applySystemTheme = isDark => {
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

const colorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)')
applySystemTheme(colorSchemeMedia.matches)

const onColorSchemeChange = event => {
  applySystemTheme(event.matches)
}

if (typeof colorSchemeMedia.addEventListener === 'function') {
  colorSchemeMedia.addEventListener('change', onColorSchemeChange)
} else {
  colorSchemeMedia.addListener(onColorSchemeChange)
}

const { supabase } = useSupabase()
const { setUser } = useUser()
const { data } = await supabase.auth.getSession()
setUser(data?.session?.user)

createApp(App).use(router).mount('#app')
