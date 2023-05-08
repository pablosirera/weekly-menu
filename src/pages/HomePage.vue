<script setup>
import { ref } from 'vue'
import MenuSchedule from '@/components/MenuSchedule.vue'
import RadioGroups from '@/components/RadioGroups.vue'

import { useI18n } from 'vue-i18n'
import { useMenu } from '@/composables/useMenu'
import { useRecipes } from '@/composables/useRecipes'
import BaseLayout from '../components/BaseLayout.vue'

const { t } = useI18n()
const { createMenu, readMenu } = useMenu()
const { readRecipe } = useRecipes()

const todayMenu = ref({})
const allRecipes = ref([])

const today = new Date().getDate()
let days = []

const loadDays = () => {
  // TODO refactor this array
  days = [today, today + 1, today + 2, today + 3, today + 4].map(day => ({
    value: day.toString(),
    text: day,
  }))
}

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

const generateMenu = async () => {
  // mostrar modal y seleccionar los días que quieres para el menú
  allRecipes.value = await createMenu()

  todayMenu.value = allRecipes.value[today]
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
        @click="generateMenu()"
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
    <MenuSchedule v-if="Object.keys(todayMenu).length" :menu="todayMenu" />
    <p v-else class="text-center mt-16">No tienes un menú creado todavía.</p>
  </BaseLayout>
</template>
