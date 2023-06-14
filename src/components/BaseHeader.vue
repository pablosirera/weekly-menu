<script setup>
import { useUser } from '@/composables/useUser'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'
import { BuildingStorefrontIcon } from '@heroicons/vue/24/outline'

const { isAuthenticated } = useUser()
const { logout } = useAuth()
const { t } = useI18n()
</script>

<template>
  <header aria-label="Page Header">
    <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between gap-4">
        <RouterLink
          class="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl"
          to="/"
        >
          {{ t('general.appTitle') }}
        </RouterLink>
        <div class="flex gap-4">
          <RouterLink to="/recipes" class="block shrink-0 px-2 hover:rounded">
            Recetas
          </RouterLink>
          <RouterLink
            v-if="!isAuthenticated()"
            to="/login"
            class="block shrink-0 px-2 hover:rounded"
          >
            Login
          </RouterLink>
          <button
            v-else
            @click="logout()"
            class="block shrink-0 px-2 hover:rounded text-green-400 hover:bg-green-900"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
