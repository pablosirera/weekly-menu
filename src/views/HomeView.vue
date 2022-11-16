<script setup>
import { ref } from 'vue'
import MenuSchedule from '@/components/MenuSchedule.vue'
import RadioGroups from '@/components/RadioGroups.vue'
import { menu } from '@/utils/menu'

const defaultDay = ref(new Date().getDate())
const localMenu = ref(menu[defaultDay.value.toString()])
let days = []

const changeDay = day => {
  console.log(day)
  localMenu.value = menu[day]
}
const loadDays = () => {
  const today = new Date().getDate()
  days = [today, today + 1, today + 2].map(day => ({
    value: day.toString(),
    text: day.toString(),
  }))
}

loadDays()

console.log(localMenu.value)
</script>

<template>
  <main>
    <h2 class="font-bold text-3xl mb-4 dark:text-white">Days</h2>
    <RadioGroups
      :options="days"
      :defaultOption="defaultDay.toString()"
      name="days"
      @change="changeDay"
    />
    <MenuSchedule v-bind="localMenu" />
  </main>
</template>
