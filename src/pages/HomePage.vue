<script setup>
import { ref } from 'vue'
import MenuSchedule from '@/components/MenuSchedule.vue'
import RadioGroups from '@/components/RadioGroups.vue'

import { useI18n } from 'vue-i18n'
import { useMenu } from '@/composables/useMenu'
import { useRecipes } from '@/composables/useRecipes'
import BaseLayout from '@/components/BaseLayout.vue'
import UpdateMenuModal from '@/components/UpdateMenuModal.vue'
import CreateMenuModal from '@/components/CreateMenuModal.vue'
import { loadDays } from '@/utils/days'

const { t } = useI18n()
const { readMenu } = useMenu()
const { readRecipe } = useRecipes()

const todayMenu = ref({})
const showUpdateMenuModal = ref(false)
const menuTypeToUpdate = ref('')
const showCreateMenuModal = ref(false)

const today = new Date().getDate()
let days = loadDays(4)

const loadMenu = async day => {
  const data = await readMenu(day)
  const menu = data[0]

  if (data.length) {
    const breakfast = await readRecipe({ id: menu['breakfast'] })
    const snack = await readRecipe({ id: menu['snack'] })
    const lunch = await readRecipe({ id: menu['lunch'] })
    const snack2 = await readRecipe({ id: menu['snack2'] })
    const dinner = await readRecipe({ id: menu['dinner'] })

    todayMenu.value = {
      ...menu,
      breakfast: breakfast[0],
      snack: snack[0],
      lunch: lunch[0],
      snack2: snack2[0],
      dinner: dinner[0],
    }
  } else {
    todayMenu.value = {}
  }
}

const openUpdateMenuModal = type => {
  menuTypeToUpdate.value = type
  showUpdateMenuModal.value = true
}

const closeUpdateMenuModal = () => {
  showUpdateMenuModal.value = false
  loadMenu(today)
}

const closeCreateMenuModal = () => {
  loadMenu(today)
  showCreateMenuModal.value = false
}

loadDays()
loadMenu(today)
</script>

<template>
  <BaseLayout>
    <div class="flex justify-between items-center mb-2">
      <h2 class="font-bold text-3xl mb-4 dark:text-white">
        {{ t('home.days') }}
      </h2>
      <button
        class="rounded-md bg-green-600 px-12 py-3 text-sm font-medium text-white dark:hover:bg-green-800 dark:hover:text-white"
        @click="showCreateMenuModal = true"
      >
        Crear Menú
      </button>
    </div>
    <RadioGroups
      :options="days"
      :defaultOption="new Date().getDate().toString()"
      name="days"
      @change="day => loadMenu(day)"
    />
    <MenuSchedule
      v-if="Object.keys(todayMenu).length"
      :menu="todayMenu"
      @updateMenu="openUpdateMenuModal"
    />
    <p v-else class="text-center mt-16">No tienes un menú creado todavía.</p>
  </BaseLayout>
  <UpdateMenuModal
    v-if="showUpdateMenuModal"
    :menu-type="menuTypeToUpdate"
    :menu-today="todayMenu"
    @close="closeUpdateMenuModal"
  />
  <CreateMenuModal v-if="showCreateMenuModal" @close="closeCreateMenuModal" />
</template>
