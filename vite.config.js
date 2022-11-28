import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: 'VUE_APP',
  plugins: [
    vue(),
    vueI18n({
      include: resolve(__dirname, './src/locales/**'),
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
