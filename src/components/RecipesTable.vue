<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  type: {
    type: Object,
    default: () => ({}),
  },
})
defineEmits(['update-recipe'])

const { t } = useI18n()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y-2 divide-gray-200 text-sm">
      <thead class="text-left">
        <tr>
          <th
            v-for="header in headers"
            :key="header"
            class="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white"
          >
            {{ t(`table.${header}`) }}
          </th>
          <th class="px-4 py-2"></th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200">
        <tr v-for="{ id, description } in items" :key="id">
          <td
            class="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white"
          >
            {{ id }}
          </td>
          <td class="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-white">
            {{ description }}
          </td>
          <td class="whitespace-nowrap px-4 py-2 text-end">
            <button
              class="inline-block rounded bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
              @click="$emit('update-recipe', { id, description, type })"
            >
              Editar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
