<script setup>
import { useUser } from '@/composables/useUser'

const { isAuthenticated } = useUser()
</script>

<template>
  <header aria-label="Page Header">
    <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between gap-4">
        <h1
          class="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl"
        >
          Weekly Menu
        </h1>
        <router-link
          v-if="!isAuthenticated()"
          to="/login"
          class="block shrink-0"
        >
          Login
        </router-link>
      </div>
    </div>
  </header>
</template>
