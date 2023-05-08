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
})

const { t } = useI18n()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
      <thead class="text-left">
        <tr>
          <th
            v-for="header in headers"
            :key="header"
            class="whitespace-nowrap px-4 py-2 font-medium text-gray-900"
          >
            {{ t(`table.${header}`) }}
          </th>
          <th class="px-4 py-2"></th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200">
        <tr v-for="{ id, description } in items" :key="id">
          <td class="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
            {{ id }}
          </td>
          <td class="whitespace-nowrap px-4 py-2 text-gray-700">
            {{ description }}
          </td>
          <td class="whitespace-nowrap px-4 py-2 text-end">
            <button
              class="inline-block rounded bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
            >
              Editar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
