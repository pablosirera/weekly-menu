<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <article
    class="rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:shadow-sm"
  >
    <div class="rounded-[10px] card py-2 px-4 sm:p-6 dark:text-white">
      <h3 class="block text-sm text-gray-500">
        {{ title }}
      </h3>

      <p class="mt-0.5 text-base font-medium text-gray-900 dark:text-white">
        {{ text }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.card {
  background-color: var(--color-background);
}
</style>
