import { createI18n } from 'vue-i18n'
import messages from '@intlify/vite-plugin-vue-i18n/messages'

export const i18n = createI18n({
  locale: import.meta.env.VUE_APP_I18N_LOCALE,
  fallbackLocale: import.meta.env.VUE_APP_I18N_FALLBACK_LOCALE,
  messages,
})
