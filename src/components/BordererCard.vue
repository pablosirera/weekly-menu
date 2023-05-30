<script setup>
import { PencilIcon } from '@heroicons/vue/24/outline'

defineProps({
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  hasEditIcon: {
    type: Boolean,
    default: false,
  },
})
defineEmits(['edit'])
</script>

<template>
  <article
    class="rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:shadow-sm"
  >
    <div class="rounded-[10px] card py-2 px-4 sm:p-6 dark:text-white">
      <div class="flex justify-between">
        <h3 class="block text-sm text-gray-500">
          {{ title }}
        </h3>
        <PencilIcon
          v-if="hasEditIcon"
          class="w-4 h-4 cursor-pointer"
          @click="$emit('edit')"
        />
      </div>

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
