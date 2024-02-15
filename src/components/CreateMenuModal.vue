<script setup>
import BaseModal from '@/components/BaseModal.vue'
import RadioGroups from './RadioGroups.vue'
import { loadDays } from '@/utils/days'
import { useMenu } from '../composables/useMenu'
import { ref } from 'vue'

const emit = defineEmits(['close'])

const { createMenu } = useMenu()

const selectedDays = ref([])
const days = loadDays()

function closeModal() {
  emit('close')
}

function saveDays(days) {
  selectedDays.value = days
}

async function saveMenu() {
  await createMenu(selectedDays.value)

  closeModal()
}
</script>

<template>
  <BaseModal :is-active="true" @close="closeModal">
    <template #header>Elige días para tu menú</template>
    <form @submit.prevent="saveMenu">
      <RadioGroups
        type="checkbox"
        :options="days"
        :defaultOption="new Date().getDate().toString()"
        name="create-days"
        @change="saveDays"
      />
      <div class="flex justify-end w-full mt-6">
        <button
          class="rounded-md bg-green-600 px-12 py-3 text-sm font-medium text-white dark:hover:bg-green-800 dark:hover:text-white"
        >
          Crear
        </button>
      </div>
    </form>
  </BaseModal>
</template>
