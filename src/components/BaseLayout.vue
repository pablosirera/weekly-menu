<script setup>
import BaseHeader from '@/components/BaseHeader.vue'
</script>

<template>
  <BaseHeader />
  <main class="mx-auto max-w-screen-xl px-4 py-4 lg:px-8">
    <slot />
  </main>
</template>
